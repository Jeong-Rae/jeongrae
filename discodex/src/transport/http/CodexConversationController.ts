import type { Express, Request, Response } from "express";
import type { CodexConversationRepository } from "../../core/session/CodexConversationRepository.ts";
import type { CodexTurnRepository } from "../../core/turn/CodexTurnRepository.ts";
import type { CodexRuntimeEventRepository } from "../../core/event/CodexRuntimeEventRepository.ts";

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
    response.json({ conversations: await this.deps.conversationRepository.list() });
  };

  private getConversation = async (request: Request, response: Response) => {
    const conversation = await this.deps.conversationRepository.findById(String(request.params.codexConversationId ?? ""));
    if (!conversation) {
      response.status(404).json({ error: "conversation_not_found" });
      return;
    }
    response.json({ conversation });
  };

  private listTurns = async (request: Request, response: Response) => {
    response.json({ turns: await this.deps.turnRepository.listByConversation(String(request.params.codexConversationId ?? "")) });
  };

  private listEvents = async (request: Request, response: Response) => {
    response.json({ events: await this.deps.runtimeEventRepository.listByConversation(String(request.params.codexConversationId ?? "")) });
  };
}
