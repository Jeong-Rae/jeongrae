import type { CodexRuntimeEvent } from "./CodexRuntimeEvent.ts";

type Listener = (event: CodexRuntimeEvent) => void;

export class CodexRuntimeEventBus {
  private readonly listeners = new Map<string, Set<Listener>>();

  public subscribe(codexConversationId: string, listener: Listener): () => void {
    const listeners = this.listeners.get(codexConversationId) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(codexConversationId, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.listeners.delete(codexConversationId);
    };
  }

  public publish(event: CodexRuntimeEvent): void {
    for (const listener of this.listeners.get(event.codexConversationId) ?? []) {
      listener(event);
    }
  }
}
