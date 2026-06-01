import type { Express, Request, Response } from "express";
import type { CodexRuntimeEventBus } from "../../core/event/CodexRuntimeEventBus.ts";

export class CodexRuntimeEventSseController {
  public constructor(private readonly eventBus: CodexRuntimeEventBus) {}

  public register(app: Express): void {
    app.get("/api/conversations/:codexConversationId/events/stream", this.streamEvents);
  }

  private streamEvents = (request: Request, response: Response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders?.();

    const unsubscribe = this.eventBus.subscribe(String(request.params.codexConversationId ?? ""), (event) => {
      response.write("event: codex-runtime-event\n");
      response.write(`data: ${JSON.stringify({ eventType: event.eventType, payload: JSON.parse(event.payloadJson) })}\n\n`);
    });

    request.on("close", unsubscribe);
  };
}
