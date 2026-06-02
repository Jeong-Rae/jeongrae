import type { Express, Request, Response } from "express";
import type { CodexConversation } from "../../core/session/CodexConversation.ts";
import type { CodexConversationRepository } from "../../core/session/CodexConversationRepository.ts";
import type { CodexTurnRepository } from "../../core/turn/CodexTurnRepository.ts";
import type { CodexRuntimeEventRepository } from "../../core/event/CodexRuntimeEventRepository.ts";
import type { CodexConversationResponse } from "../../protocol/response/CodexConversationResponse.ts";

export class CodexConversationController {
  public constructor(private readonly deps: {
    conversationRepository: CodexConversationRepository;
    turnRepository: CodexTurnRepository;
    runtimeEventRepository: CodexRuntimeEventRepository;
  }) {}

  public register(app: Express): void {
    app.get("/api/conversations", this.listConversations);
    app.get("/api/conversations/:codexConversationId", this.getConversation);
    app.get("/api/conversations/:codexConversationId/turns", this.listTurns);
    app.get("/api/conversations/:codexConversationId/events", this.listEvents);
  }

  private listConversations = async (_request: Request, response: Response) => {
    const conversations = await Promise.all((await this.deps.conversationRepository.list()).map((conversation) => this.toResponse(conversation)));
    response.json({ conversations });
  };

  private getConversation = async (request: Request, response: Response) => {
    const conversation = await this.deps.conversationRepository.findById(String(request.params.codexConversationId ?? ""));
    if (!conversation) {
      response.status(404).json({ error: "conversation_not_found" });
      return;
    }
    response.json({ conversation: await this.toResponse(conversation) });
  };

  private listTurns = async (request: Request, response: Response) => {
    response.json({ turns: await this.deps.turnRepository.listByConversation(String(request.params.codexConversationId ?? "")) });
  };

  private listEvents = async (request: Request, response: Response) => {
    response.json({ events: await this.deps.runtimeEventRepository.listByConversation(String(request.params.codexConversationId ?? "")) });
  };

  private async toResponse(conversation: CodexConversation): Promise<CodexConversationResponse> {
    const runningTurnCount = await this.deps.turnRepository.countRunningByConversation(conversation.codexConversationId);
    return {
      codexConversationId: conversation.codexConversationId,
      workspaceKey: conversation.workspaceKey,
      workspacePath: conversation.workspacePath,
      workspaceSource: conversation.workspaceSource,
      conversationChannelId: conversation.conversationChannelId,
      codexThreadId: conversation.codexThreadId,
      status: conversation.status === "closed" ? "closed" : runningTurnCount > 0 ? "running" : "idle",
      permissionMode: conversation.permissionMode,
      model: conversation.model,
      reasoningEffort: conversation.reasoningEffort,
      runningTurnCount,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString()
    };
  }
}
