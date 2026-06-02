import type { CodexSdkClient } from "../../clients/codex/CodexSdkClient.ts";
import type { CreateCodexConversationRequest } from "../../protocol/request/CreateCodexConversationRequest.ts";
import type { EnableYoloRequest } from "../../protocol/request/EnableYoloRequest.ts";
import type { CreateCodexConversationResponse } from "../../protocol/response/CreateCodexConversationResponse.ts";
import type { DiscordThreadService } from "../../transport/discord/DiscordThreadService.ts";
import type { Logger } from "../../telemetry/logging/Logger.ts";
import { isReasoningEffort, type ReasoningEffort } from "../model/ReasoningEffort.ts";
import type { CodexTurnRepository } from "../turn/CodexTurnRepository.ts";
import { createId } from "../../support/id/createId.ts";
import { SystemClock } from "../../support/time/SystemClock.ts";
import type { WorkspaceRegistry } from "../../runtime/workspace/WorkspaceRegistry.ts";
import type { WorkspaceValidator } from "../../runtime/workspace/WorkspaceValidator.ts";
import type { CodexConversation } from "./CodexConversation.ts";
import type { CodexConversationRepository } from "./CodexConversationRepository.ts";

export type EnableYoloResponse =
  | { ok: true }
  | { ok: false; message: string };

export type ModelConfigResponse =
  | { status: "found"; model: string | null; reasoningEffort: ReasoningEffort | null }
  | { status: "updated"; model: string | null; reasoningEffort: ReasoningEffort | null }
  | { status: "not_found" }
  | { status: "invalid_model" }
  | { status: "invalid_effort" };

export type ConversationStatusResponse =
  | { status: "found"; conversation: CodexConversation; runningTurnCount: number; debugUrl: string }
  | { status: "not_found" };

export class CodexConversationService {
  private readonly clock = new SystemClock();

  public constructor(private readonly deps: {
    conversationRepository: CodexConversationRepository;
    turnRepository?: CodexTurnRepository;
    debugBaseUrl?: string;
    workspaceRegistry: WorkspaceRegistry;
    workspaceValidator: WorkspaceValidator;
    discordThreadService: DiscordThreadService;
    codexSdkClient: CodexSdkClient;
    logger?: Logger;
  }) {}

  public async create(request: CreateCodexConversationRequest): Promise<CreateCodexConversationResponse> {
    const workspace = this.deps.workspaceRegistry.resolve(request.cwd);
    if (!workspace) {
      return { ok: false, reason: "workspace_not_found", availableWorkspaceKeys: this.deps.workspaceRegistry.listAvailableKeys() };
    }
    const validation = this.deps.workspaceValidator.validate(workspace.workspacePath);
    if (!validation.ok) {
      return { ok: false, reason: validation.reason, availableWorkspaceKeys: this.deps.workspaceRegistry.listAvailableKeys() };
    }

    const thread = await this.deps.discordThreadService.createPrivateThread({
      parentChannelId: request.parentChannelId,
      name: `codex-${workspace.workspaceKey}`,
      createdByUserId: request.createdBy
    });
    try {
      const codexThread = await this.deps.codexSdkClient.startThread({
        workspacePath: validation.workspacePath,
        permissionMode: "default"
      });
      const now = this.clock.now();
      const conversation = {
        codexConversationId: createId("conv"),
        discordGuildId: request.discordGuildId,
        parentChannelId: request.parentChannelId,
        conversationChannelId: thread.threadId,
        workspaceKey: workspace.workspaceKey,
        workspacePath: validation.workspacePath,
        workspaceSource: workspace.source,
        codexThreadId: codexThread.codexThreadId,
        status: "idle" as const,
        permissionMode: "default" as const,
        model: null,
        reasoningEffort: null,
        createdBy: request.createdBy,
        createdAt: now,
        updatedAt: now
      };
      await this.deps.conversationRepository.create(conversation);
      this.deps.logger?.info("conversation created", {
        eventType: "conversation_created",
        codexConversationId: conversation.codexConversationId,
        workspaceKey: conversation.workspaceKey,
        workspaceSource: conversation.workspaceSource
      });
      return { ok: true, conversation };
    } catch (error) {
      await this.deps.discordThreadService.deleteThread?.(thread.threadId).catch(() => undefined);
      throw error;
    }
  }

  public async enableYolo(request: EnableYoloRequest): Promise<EnableYoloResponse> {
    const now = this.clock.now();
    const conversation = await this.deps.conversationRepository.updatePermissionModeByChannel(request.discordGuildId, request.conversationChannelId, "yolo", now);
    if (!conversation) {
      return {
        ok: false,
        message: "이 channel에는 연결된 Codex 세션이 없습니다.\n\n먼저 다음 명령으로 세션을 생성하세요.\n/codex new <cwd>"
      };
    }
    this.deps.logger?.info("yolo enabled", {
      eventType: "yolo_enabled",
      codexConversationId: conversation.codexConversationId,
      workspaceKey: conversation.workspaceKey
    });
    return { ok: true };
  }

  public async findByChannel(discordGuildId: string, conversationChannelId: string) {
    return this.deps.conversationRepository.findByChannel(discordGuildId, conversationChannelId);
  }

  public async getModelConfig(discordGuildId: string, conversationChannelId: string): Promise<ModelConfigResponse> {
    const conversation = await this.deps.conversationRepository.findByChannel(discordGuildId, conversationChannelId);
    if (!conversation) return { status: "not_found" };
    return {
      status: "found",
      model: conversation.model,
      reasoningEffort: conversation.reasoningEffort
    };
  }

  public async updateModelConfig(input: {
    discordGuildId: string;
    conversationChannelId: string;
    model?: string | null;
    reasoningEffort?: string | null;
  }): Promise<ModelConfigResponse> {
    if (input.model !== undefined && input.model !== null && input.model.trim().length === 0) {
      return { status: "invalid_model" };
    }
    if (input.reasoningEffort !== undefined && input.reasoningEffort !== null && !isReasoningEffort(input.reasoningEffort)) {
      return { status: "invalid_effort" };
    }
    if (input.model === undefined && input.reasoningEffort === undefined) {
      return this.getModelConfig(input.discordGuildId, input.conversationChannelId);
    }

    const conversation = await this.deps.conversationRepository.updateModelConfigByChannel({
      discordGuildId: input.discordGuildId,
      conversationChannelId: input.conversationChannelId,
      model: input.model === null ? undefined : input.model,
      reasoningEffort: input.reasoningEffort === null ? undefined : input.reasoningEffort,
      updatedAt: this.clock.now()
    });
    if (!conversation) return { status: "not_found" };
    return {
      status: "updated",
      model: conversation.model,
      reasoningEffort: conversation.reasoningEffort
    };
  }

  public async getStatus(discordGuildId: string, conversationChannelId: string): Promise<ConversationStatusResponse> {
    const conversation = await this.deps.conversationRepository.findByChannel(discordGuildId, conversationChannelId);
    if (!conversation) return { status: "not_found" };
    const runningTurnCount = await this.deps.turnRepository?.countRunningByConversation(conversation.codexConversationId) ?? 0;
    return {
      status: "found",
      conversation,
      runningTurnCount,
      debugUrl: `${this.normalizedDebugBaseUrl()}/?conversation=${conversation.codexConversationId}`
    };
  }

  private normalizedDebugBaseUrl(): string {
    return (this.deps.debugBaseUrl ?? "http://localhost:3000").replace(/\/+$/, "");
  }
}
