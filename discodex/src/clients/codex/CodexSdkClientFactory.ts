import { Codex, type ThreadEvent, type ThreadOptions } from "@openai/codex-sdk";
import type { PermissionMode } from "../../core/policy/PermissionMode.ts";
import { CodexSdkStreamError, type CodexSdkClient, type RunCodexInput, type RunCodexOutput, type StartCodexThreadInput, type StartCodexThreadOutput } from "./CodexSdkClient.ts";

export class CodexSdkClientFactory {
  public constructor(private readonly apiKey?: string, private readonly codexHome?: string) {}

  public create(): CodexSdkClient {
    return new OpenAiCodexSdkClient(this.apiKey, this.codexHome);
  }
}

class OpenAiCodexSdkClient implements CodexSdkClient {
  public constructor(private readonly apiKey?: string, private readonly codexHome?: string) {}

  public async startThread(input: StartCodexThreadInput): Promise<StartCodexThreadOutput> {
    const thread = this.createCodex(input.permissionMode).startThread(this.threadOptions(input.workspacePath, input.permissionMode));
    const result = await thread.run("Start this Codex conversation. Reply briefly that the session is ready.");
    const codexThreadId = thread.id;
    if (!codexThreadId) {
      throw new Error("Codex SDK did not provide a thread id after starting a thread.");
    }
    return { codexThreadId: result ? codexThreadId : codexThreadId };
  }

  public async run(input: RunCodexInput): Promise<RunCodexOutput> {
    const thread = this.createCodex(input.permissionMode).resumeThread(input.codexThreadId, this.threadOptions(input.workspacePath, input.permissionMode));
    const result = await thread.runStreamed(input.message);
    const runtimeEvents: Array<{ eventType: string; payloadJson: string }> = [];
    let finalResponse = "";

    for await (const event of result.events) {
      runtimeEvents.push({
        eventType: event.type,
        payloadJson: JSON.stringify(event)
      });
      if (event.type === "turn.failed" || event.type === "error") {
        throw new CodexSdkStreamError(extractStreamErrorMessage(event), runtimeEvents);
      }
      if ((event.type === "item.completed" || event.type === "item.updated") && event.item.type === "agent_message") {
        finalResponse = event.item.text;
      }
    }

    return { finalResponse, runtimeEvents };
  }

  private createCodex(permissionMode: PermissionMode): Codex {
    return new Codex({
      apiKey: this.apiKey,
      config: {
        approval_policy: permissionMode === "yolo" ? "never" : "on-request",
        sandbox_mode: permissionMode === "yolo" ? "danger-full-access" : "workspace-write"
      },
      env: this.codexHome ? { ...process.env, CODEX_HOME: this.codexHome } as Record<string, string> : undefined
    });
  }

  private threadOptions(workspacePath: string, permissionMode: PermissionMode): ThreadOptions {
    return {
      workingDirectory: workspacePath,
      approvalPolicy: permissionMode === "yolo" ? "never" : "on-request",
      sandboxMode: permissionMode === "yolo" ? "danger-full-access" : "workspace-write"
    };
  }
}

function extractStreamErrorMessage(event: ThreadEvent): string {
  if (event.type === "turn.failed") return event.error.message;
  if (event.type === "error") return event.message;
  return "Codex SDK stream failed.";
}
