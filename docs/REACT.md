# React Hooks Reference

## Shared Hooks (@jeongrae/hook)

Import from `@jeongrae/hook`. These hooks are shared across apps.

- `useBooleanState(initial?: boolean)`
  - Tiny boolean state helper: `{ value, setTrue, setFalse, toggle }`.
- `useInputState(initial?: string)`
  - String input state with `onChange`, `setValue`, and `reset`.
- `useEvent(handler)`
  - Returns a stable callback that always calls the latest `handler`.
- `useGlobalEvent({ type, handler, options, target, enabled })`
  - Global event listener for `window`, `document`, elements, or refs.
- `useKeyboardShortcuts(shortcuts, options)`
  - Declarative key combo handling with modifiers and optional `target`.
- `useIndexNavigator({ items | length, initialIndex?, mode? })`
  - Index navigation (`range` or `circle`), includes `useRangeIndexNavigator` and
    `useCircleIndexNavigator`.
- `useScheduleEffect({ after?, every?, until?, do, immediate? })`
  - Timed actions using `TimeInput` (`number`, `"100ms"`, `"2s"`, `"1m"`). If
    both `after` and `every` are set, `every` takes precedence.
