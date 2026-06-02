import type { CodexSdkClient } from "../../clients/codex/CodexSdkClient.ts";
import type { CodexRuntimeEventBus } from "../event/CodexRuntimeEventBus.ts";
import type { CodexRuntimeEventRepository } from "../event/CodexRuntimeEventRepository.ts";
import type { CodexConversationRepository } from "../session/CodexConversationRepository.ts";
import type { RunCodexTurnRequest } from "../../protocol/request/RunCodexTurnRequest.ts";
import type { RunCodexTurnResponse } from "../../protocol/response/RunCodexTurnResponse.ts";
import { createId } from "../../support/id/createId.ts";
import { SystemClock } from "../../support/time/SystemClock.ts";
import type { Logger } from "../../telemetry/logging/Logger.ts";
import { CodexSdkStreamError } from "../../clients/codex/CodexSdkClient.ts";
import type { CodexTurnRepository } from "./CodexTurnRepository.ts";

export class RunCodexTurnService {
  private readonly clock = new SystemClock();

  public constructor(private readonly deps: {
    conversationRepository: CodexConversationRepository;
    turnRepository: CodexTurnRepository;
    runtimeEventRepository: CodexRuntimeEventRepository;
    eventBus: CodexRuntimeEventBus;
    codexSdkClient: CodexSdkClient;
    logger?: Logger;
  }) {}

  public async run(request: RunCodexTurnRequest): Promise<RunCodexTurnResponse> {
    const conversation = await this.deps.conversationRepository.findByChannel(request.discordGuildId, request.conversationChannelId);
    if (!conversation) {
      return { status: "not_found", message: "이 channel에는 연결된 Codex 세션이 없습니다.\n\n먼저 다음 명령으로 세션을 생성하세요.\n/codex new <cwd>" };
    }
    const now = this.clock.now();
    const turnId = createId("turn");
    let turnCreated = false;

    try {
      await this.deps.turnRepository.create({
        codexTurnId: turnId,
        codexConversationId: conversation.codexConversationId,
        requestedBy: request.requestedBy,
        userMessage: request.userMessage,
        status: "running",
        finalResponse: null,
        errorMessage: null,
        createdAt: now,
        startedAt: now,
        finishedAt: null
      });
      turnCreated = true;
      await this.deps.conversationRepository.updateStatus(conversation.codexConversationId, "running", now);
      this.deps.logger?.info("codex turn started", {
        eventType: "codex_turn_started",
        codexConversationId: conversation.codexConversationId,
        codexTurnId: turnId,
        workspaceKey: conversation.workspaceKey
      });
      await this.persistEvent(conversation.codexConversationId, turnId, "codex_turn_started", { userMessage: request.userMessage });
      const output = await this.deps.codexSdkClient.run({
        codexThreadId: conversation.codexThreadId,
        workspacePath: conversation.workspacePath,
        permissionMode: conversation.permissionMode,
        message: request.userMessage
      });
      for (const runtimeEvent of output.runtimeEvents ?? []) {
        await this.persistEventFromSdk(conversation.codexConversationId, turnId, runtimeEvent.eventType, runtimeEvent.payloadJson);
      }
      const finishedAt = this.clock.now();
      await this.deps.turnRepository.markSucceeded(turnId, output.finalResponse, finishedAt);
      await this.persistEvent(conversation.codexConversationId, turnId, "codex_turn_succeeded", { finalResponse: output.finalResponse });
      this.deps.logger?.info("codex turn succeeded", {
        eventType: "codex_turn_succeeded",
        codexConversationId: conversation.codexConversationId,
        codexTurnId: turnId,
        workspaceKey: conversation.workspaceKey
      });
      await this.updateConversationDisplayStatus(conversation.codexConversationId, finishedAt);
      return { status: "succeeded", codexConversationId: conversation.codexConversationId, codexTurnId: turnId, finalResponse: output.finalResponse };
    } catch (error) {
      const finishedAt = this.clock.now();
      const errorMessage = error instanceof Error ? error.message : String(error);
      try {
        if (turnCreated) {
          await this.deps.turnRepository.markFailed(turnId, errorMessage, finishedAt);
          try {
            if (error instanceof CodexSdkStreamError) {
              for (const runtimeEvent of error.runtimeEvents) {
                await this.persistEventFromSdk(conversation.codexConversationId, turnId, runtimeEvent.eventType, runtimeEvent.payloadJson);
              }
            }
            await this.persistEvent(conversation.codexConversationId, turnId, "codex_turn_failed", { errorMessage });
          } catch (eventError) {
            this.deps.logger?.error("codex turn failure event persistence failed", {
              eventType: "codex_turn_failed_event_persistence_failed",
              codexConversationId: conversation.codexConversationId,
              codexTurnId: turnId,
              errorMessage: eventError instanceof Error ? eventError.message : String(eventError)
            });
          }
        }
        this.deps.logger?.error("codex turn failed", {
          eventType: "codex_turn_failed",
          codexConversationId: conversation.codexConversationId,
          codexTurnId: turnId,
          workspaceKey: conversation.workspaceKey,
          errorMessage
        });
      } finally {
        await this.updateConversationDisplayStatus(conversation.codexConversationId, finishedAt);
      }
      return { status: "failed", codexConversationId: conversation.codexConversationId, codexTurnId: turnId, errorMessage };
    }
  }

  private async updateConversationDisplayStatus(codexConversationId: string, updatedAt: Date): Promise<void> {
    const runningTurnCount = await this.deps.turnRepository.countRunningByConversation(codexConversationId);
    await this.deps.conversationRepository.updateStatus(codexConversationId, runningTurnCount > 0 ? "running" : "idle", updatedAt);
  }

  private async persistEvent(codexConversationId: string, codexTurnId: string, eventType: string, payload: unknown): Promise<void> {
    const event = {
      codexRuntimeEventId: createId("event"),
      codexConversationId,
      codexTurnId,
      eventType,
      payloadJson: JSON.stringify(payload),
      createdAt: this.clock.now()
    };
    await this.deps.runtimeEventRepository.create(event);
    this.deps.eventBus.publish(event);
  }

  private async persistEventFromSdk(codexConversationId: string, codexTurnId: string, eventType: string, payloadJson: string): Promise<void> {
    const event = {
      codexRuntimeEventId: createId("event"),
      codexConversationId,
      codexTurnId,
      eventType,
      payloadJson,
      createdAt: this.clock.now()
    };
    await this.deps.runtimeEventRepository.create(event);
    this.deps.eventBus.publish(event);
  }
}
