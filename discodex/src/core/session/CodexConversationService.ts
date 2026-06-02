import type { CodexSdkClient } from "../../clients/codex/CodexSdkClient.ts";
import type { CreateCodexConversationRequest } from "../../protocol/request/CreateCodexConversationRequest.ts";
import type { EnableYoloRequest } from "../../protocol/request/EnableYoloRequest.ts";
import type { CreateCodexConversationResponse } from "../../protocol/response/CreateCodexConversationResponse.ts";
import type { DiscordThreadService } from "../../transport/discord/DiscordThreadService.ts";
import type { Logger } from "../../telemetry/logging/Logger.ts";
import { createId } from "../../support/id/createId.ts";
import { SystemClock } from "../../support/time/SystemClock.ts";
import type { WorkspaceRegistry } from "../../runtime/workspace/WorkspaceRegistry.ts";
import type { WorkspaceValidator } from "../../runtime/workspace/WorkspaceValidator.ts";
import type { CodexConversationRepository } from "./CodexConversationRepository.ts";

export type EnableYoloResponse =
  | { ok: true }
  | { ok: false; message: string };

export class CodexConversationService {
  private readonly clock = new SystemClock();

  public constructor(private readonly deps: {
    conversationRepository: CodexConversationRepository;
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
      name: `codex-${workspace.workspaceKey}`
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
}
