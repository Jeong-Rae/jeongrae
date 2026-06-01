import express from "express";
import type { Server } from "node:http";
import type { Logger } from "../../telemetry/logging/Logger.ts";
import { CodexConversationController } from "./CodexConversationController.ts";
import { StaticFileController } from "./StaticFileController.ts";
import { CodexRuntimeEventSseController } from "../sse/CodexRuntimeEventSseController.ts";

export class DebugHttpServer {
  public constructor(private readonly deps: {
    port: number;
    conversationController: CodexConversationController;
    sseController: CodexRuntimeEventSseController;
    staticFileController: StaticFileController;
    logger: Logger;
  }) {}

  public start(): Server {
    const app = express();
    app.use(express.json());
    this.deps.conversationController.register(app);
    this.deps.sseController.register(app);
    this.deps.staticFileController.register(app);
    const server = app.listen(this.deps.port, () => {
      this.deps.logger.info("server started", { eventType: "server_started", port: this.deps.port });
    });
    return server;
  }
}
