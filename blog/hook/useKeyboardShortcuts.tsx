import { castArray } from "es-toolkit/compat";

import { type GlobalEventTarget, useGlobalEvent } from "./useGlobalEvent";

export type KeyboardShortcut = {
  keys: string | string[];
  handler: (event: KeyboardEvent) => void;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

type UseKeyboardShortcutsOptions = {
  enabled?: boolean;
  target?: GlobalEventTarget;
};

function matchesModifier(modifier: boolean | undefined, value: boolean) {
  return modifier === undefined || modifier === value;
}

function isShortcutMatch(event: KeyboardEvent, shortcut: KeyboardShortcut) {
  const keys = castArray(shortcut.keys);
  const isKeyMatched = keys.some((key) => event.key === key);

  if (!isKeyMatched) return false;

  return (
    matchesModifier(shortcut.meta, event.metaKey) &&
    matchesModifier(shortcut.ctrl, event.ctrlKey) &&
    matchesModifier(shortcut.shift, event.shiftKey) &&
    matchesModifier(shortcut.alt, event.altKey)
  );
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {},
) {
  const { enabled = true, target } = options;

  useGlobalEvent({
    type: "keydown",
    enabled,
    target,
    handler: (event) => {
      shortcuts.forEach((shortcut) => {
        if (shortcut.enabled === false) return;
        if (!isShortcutMatch(event, shortcut)) return;

        if (shortcut.preventDefault) event.preventDefault();
        if (shortcut.stopPropagation) event.stopPropagation();
        shortcut.handler(event);
      });
    },
  });
}
