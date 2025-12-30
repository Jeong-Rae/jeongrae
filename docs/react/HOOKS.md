# Shared Hooks (@jeongrae/hook)

`@jeongrae/hook`에서 가져옵니다.

## useBooleanState

Signature:
```ts
useBooleanState(initial?: boolean): {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}
```

기본 사용 상황:
- 토글/열림 상태 등 단순 boolean 상태를 다룰 때.

Parameters:
- `initial`: boolean, default `false`.

Return:
- `value`: 현재 boolean 값.
- `setTrue`: `true`로 설정.
- `setFalse`: `false`로 설정.
- `toggle`: 반전.

Example:
```tsx
const { value, setTrue, setFalse, toggle } = useBooleanState(false);
```

## useInputState

Signature:
```ts
useInputState(initial?: string): {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  reset: () => void;
}
```

기본 사용 상황:
- 입력값을 가진 input/textarea/select 상태 관리.

Parameters:
- `initial`: string, default `""`.

Return:
- `value`: 현재 문자열 값.
- `onChange`: 입력 변경 핸들러.
- `setValue`: 상태 setter.
- `reset`: `initial`로 리셋.

Example:
```tsx
const { value, onChange, reset } = useInputState("");
```

## useEvent

Signature:
```ts
useEvent<T extends (...args: any[]) => any>(handler: T): T
```

기본 사용 상황:
- 최신 handler를 안정적으로 참조해야 하는 이벤트 콜백.

Parameters:
- `handler`: 최신 함수로 유지할 콜백.

Return:
- 동일 시그니처의 안정적 함수.

Example:
```tsx
const onResize = useEvent(() => {
  // 최신 상태 접근
});
```

## useGlobalEvent

Signature:
```ts
useGlobalEvent<K extends keyof DocumentEventMap>({
  type,
  handler,
  options,
  target,
  enabled,
}: {
  type: K;
  handler: (event: DocumentEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
  target?: Window | Document | HTMLElement | React.RefObject<HTMLElement | Document | Window | null> | null;
  enabled?: boolean;
}): void
```

기본 사용 상황:
- 전역 이벤트를 등록해야 할 때 (window/document/특정 엘리먼트).

Parameters:
- `type`: 이벤트 타입 (`"click"`, `"keydown"` 등).
- `handler`: 이벤트 핸들러.
- `options`: `addEventListener` 옵션.
- `target`: window/document/element 또는 ref. 기본값은 브라우저 환경의 `window`.
- `enabled`: default `true`.

Return:
- `void`.

Example:
```tsx
useGlobalEvent({
  type: "keydown",
  handler: (event) => {
    if (event.key === "Escape") close();
  },
});
```

## useKeyboardShortcuts

Signature:
```ts
useKeyboardShortcuts(
  shortcuts: Array<{
    keys: string | string[];
    handler: (event: KeyboardEvent) => void;
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    enabled?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  }>,
  options?: { enabled?: boolean; target?: GlobalEventTarget }
): void
```

기본 사용 상황:
- 단축키 조합을 선언적으로 처리할 때.

Parameters:
- `shortcuts`: 단축키 목록.
- `options.enabled`: default `true`.
- `options.target`: 이벤트 타겟.

Return:
- `void`.

Example:
```tsx
useKeyboardShortcuts([
  {
    keys: ["k", "K"],
    ctrl: true,
    handler: () => openSearch(),
    preventDefault: true,
  },
]);
```

## useIndexNavigator

Signature:
```ts
useIndexNavigator<T>(params: {
  items: T[];
  initialIndex?: number;
  mode?: "range" | "circle";
} | {
  length: number;
  initialIndex?: number;
  mode?: "range" | "circle";
}): {
  index: number;
  item: T | null;
  length: number;
  goNext: () => void;
  goPrev: () => void;
  setIndex: (next: number | ((prev: number) => number)) => void;
  reset: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}
```

기본 사용 상황:
- 리스트/슬라이드 인덱스 이동 로직 공용화.

Parameters:
- `items` 또는 `length`: 길이 산출 소스.
- `initialIndex`: default `0`.
- `mode`: `"range"`(범위 클램프) 또는 `"circle"`(순환), default `"range"`.

Return:
- `index`, `item`, `length`.
- `goNext`, `goPrev`, `setIndex`, `reset`.
- `canGoNext`, `canGoPrev`.

Example:
```tsx
const { index, goNext, canGoNext } = useIndexNavigator({
  length: 5,
  mode: "circle",
});
```

Aliases:
- `useRangeIndexNavigator(params)` -> `mode: "range"`.
- `useCircleIndexNavigator(params)` -> `mode: "circle"`.

## useScheduleEffect

Signature:
```ts
useScheduleEffect({
  after,
  every,
  until,
  do: run,
  immediate,
}: {
  after?: number | `${number}ms` | `${number}s` | `${number}m`;
  every?: number | `${number}ms` | `${number}s` | `${number}m`;
  until?: () => boolean;
  do: () => void;
  immediate?: boolean;
}): void
```

기본 사용 상황:
- 일정 시간 후 실행, 반복 실행, 조건부 중단이 필요한 경우.

Parameters:
- `after`: 지연 후 1회 실행.
- `every`: 반복 간격 (둘 다 지정 시 `every` 우선).
- `until`: `true`일 때 중단.
- `do`: 실행 콜백.
- `immediate`: `every` 사용 시 즉시 1회 실행.

Return:
- `void`.

Example:
```tsx
useScheduleEffect({ every: "5s", do: () => tick() });
```
