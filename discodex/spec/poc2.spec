# Codex Discord Agent 2차 PoC Spec

## 1. 문서 목적

이 문서는 Codex Discord Agent의 2차 PoC 구현 범위를 정의한다.

2차 PoC는 기존 PoC1 conversation 구조 위에 conversation 단위 모델 설정과 상태 조회 기능을 추가한다.

---

## 2. 2차 PoC 목표

2차 PoC는 다음 목표를 달성한다.

```text
1. 사용자는 Discord thread 안에서 현재 Codex conversation 상태를 조회할 수 있다.
2. 사용자는 Discord thread 안에서 현재 Codex conversation의 model과 reasoning effort를 조회할 수 있다.
3. 사용자는 Discord thread 안에서 현재 Codex conversation의 model과 reasoning effort를 변경할 수 있다.
4. 변경된 model과 reasoning effort는 이후 Codex turn 실행에 적용된다.
5. model과 reasoning effort 설정은 SQLite에 저장되어 서버 재시작 후에도 유지된다.
```

2차 PoC는 plan mode를 포함하지 않는다.

---

## 3. 2차 PoC Slash Command

2차 PoC는 기존 `/codex` command에 다음 subcommand를 추가한다.

```text
/codex model
/codex model model:<model> effort:<effort>
/codex status
```

`/codex model`의 `model`과 `effort` option은 optional이다.

`effort` 값은 다음 enum 중 하나다.

```text
minimal
low
medium
high
xhigh
```

`model` 값은 string으로 입력한다.
PoC2는 OpenAI model 목록을 실시간 조회하지 않는다.

---

## 4. `/codex model` 조회 Behavior

사용자가 Codex conversation이 연결된 Discord thread 안에서 다음 명령을 입력한다.

```text
/codex model
```

시스템은 다음 순서로 행동한다.

```text
1. Discord slash command interaction을 수신한다.
2. 현재 Discord guildId와 channelId로 CodexConversation을 조회한다.
3. conversation이 없으면 no conversation 안내 메시지를 반환한다.
4. conversation이 있으면 현재 model과 reasoning effort를 표시한다.
5. model이 null이면 Codex CLI 기본 model을 사용한다고 표시한다.
6. reasoning effort가 null이면 Codex CLI 기본 reasoning effort를 사용한다고 표시한다.
7. 사용 가능한 effort enum 값을 함께 표시한다.
```

응답 예시:

```text
현재 Codex model 설정

Model: Codex CLI default
Effort: Codex CLI default

변경 예:
/codex model model:gpt-5.5 effort:high

Effort values: minimal, low, medium, high, xhigh
```

---

## 5. `/codex model model:<model> effort:<effort>` 변경 Behavior

사용자가 Codex conversation이 연결된 Discord thread 안에서 다음 명령을 입력한다.

```text
/codex model model:gpt-5.5 effort:high
```

시스템은 다음 순서로 행동한다.

```text
1. Discord slash command interaction을 수신한다.
2. 현재 Discord guildId와 channelId로 CodexConversation을 조회한다.
3. conversation이 없으면 no conversation 안내 메시지를 반환한다.
4. model option이 있으면 conversation.model을 해당 값으로 저장한다.
5. effort option이 있으면 conversation.reasoningEffort를 해당 값으로 저장한다.
6. model과 effort가 모두 없으면 조회 Behavior를 수행한다.
7. 변경된 model과 reasoning effort를 Discord에 표시한다.
8. 이후 @CodexBot 메시지부터 변경된 설정을 Codex SDK ThreadOptions에 적용한다.
```

부분 변경도 허용한다.

```text
/codex model model:gpt-5.5
  -> model만 변경하고 reasoning effort는 기존 값을 유지한다.

/codex model effort:high
  -> reasoning effort만 변경하고 model은 기존 값을 유지한다.
```

응답 예시:

```text
Codex model 설정을 변경했습니다.

Model: gpt-5.5
Effort: high

다음 Codex turn부터 적용됩니다.
```

---

## 6. `/codex status` Behavior

사용자가 Codex conversation이 연결된 Discord thread 안에서 다음 명령을 입력한다.

```text
/codex status
```

시스템은 다음 순서로 행동한다.

```text
1. Discord slash command interaction을 수신한다.
2. 현재 Discord guildId와 channelId로 CodexConversation을 조회한다.
3. conversation이 없으면 no conversation 안내 메시지를 반환한다.
4. running turn count를 조회한다.
5. conversation의 workspace, permission mode, model, effort, status를 표시한다.
6. Web Debug UI conversation link를 표시한다.
```

응답 예시:

```text
Codex 세션 상태

Workspace: /workspaces/jeongrae/blog
Source: absolute_path
Permission: default
Status: idle
Running turns: 0
Model: Codex CLI default
Effort: Codex CLI default

Debug: http://localhost:3000/?conversation=conv_...
```

---

## 7. Data Model

2차 PoC는 `CodexConversation`에 다음 필드를 추가한다.

```ts
export type ReasoningEffort =
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh";

export type CodexConversation = {
  // existing fields
  model: string | null;
  reasoningEffort: ReasoningEffort | null;
};
```

`model = null`은 Codex CLI 기본 model을 사용한다는 뜻이다.

`reasoningEffort = null`은 Codex CLI 기본 reasoning effort를 사용한다는 뜻이다.

---

## 8. SQLite Migration

2차 PoC는 `codex_conversation` table에 다음 column을 추가한다.

```sql
ALTER TABLE codex_conversation
ADD COLUMN model TEXT;

ALTER TABLE codex_conversation
ADD COLUMN reasoning_effort TEXT;
```

기존 conversation의 `model`과 `reasoning_effort` 값은 null로 유지한다.

Repository는 `reasoning_effort` 값을 저장하기 전에 allowed enum인지 검증한다.

---

## 9. Repository Behavior

`CodexConversationRepository`는 다음 behavior를 제공한다.

```text
1. conversation 생성 시 model과 reasoningEffort를 null로 저장한다.
2. conversation 조회 시 model과 reasoningEffort를 반환한다.
3. updateModelConfigByChannel은 Discord guildId와 channelId로 conversation을 조회해 model과 reasoningEffort를 갱신한다.
4. updateModelConfigByChannel은 model input이 undefined이면 기존 model 값을 유지한다.
5. updateModelConfigByChannel은 effort input이 undefined이면 기존 reasoningEffort 값을 유지한다.
6. updateModelConfigByChannel은 conversation이 없으면 null을 반환한다.
```

interface 예시:

```ts
type UpdateModelConfigInput = {
  discordGuildId: string;
  conversationChannelId: string;
  model?: string;
  reasoningEffort?: ReasoningEffort;
  updatedAt: Date;
};
```

---

## 10. Service Behavior

`CodexConversationService`는 다음 behavior를 제공한다.

```text
1. getStatus는 Discord guildId와 channelId로 conversation을 조회한다.
2. getStatus는 conversation이 없으면 not_found 응답을 반환한다.
3. getStatus는 conversation, runningTurnCount, Web Debug UI link 렌더링에 필요한 값을 반환한다.
4. getModelConfig는 Discord guildId와 channelId로 현재 model 설정을 조회한다.
5. updateModelConfig는 Discord guildId와 channelId로 model 설정을 갱신한다.
6. updateModelConfig는 model과 effort가 모두 undefined이면 조회 응답을 반환한다.
```

---

## 11. Codex SDK 적용 Behavior

`RunCodexTurnService`는 Codex turn 실행 시 conversation에 저장된 model 설정을 사용한다.

```text
1. conversation.model이 null이 아니면 Codex SDK ThreadOptions.model로 전달한다.
2. conversation.reasoningEffort가 null이 아니면 Codex SDK ThreadOptions.modelReasoningEffort로 전달한다.
3. 둘 다 null이면 기존 PoC1과 동일하게 Codex CLI 기본 설정을 사용한다.
4. model 설정 변경은 이미 실행 중인 turn에는 적용하지 않는다.
5. model 설정 변경은 변경 이후 시작되는 Codex turn부터 적용한다.
```

`CodexSdkClient` input은 다음 필드를 추가한다.

```ts
type CodexModelConfig = {
  model?: string;
  reasoningEffort?: ReasoningEffort;
};
```

---

## 12. Discord Command Registration

`DiscordBot.registerCommands`는 `/codex` command에 다음 subcommand를 추가한다.

```text
Subcommand: model
Options:
  model: string, optional
  effort: string choice, optional

Subcommand: status
Options:
  none
```

`effort` option은 다음 choices를 사용한다.

```text
minimal
low
medium
high
xhigh
```

PoC2는 Discord autocomplete를 구현하지 않는다.

---

## 13. Discord Rendering

`DiscordMessageRenderer`는 다음 메시지를 렌더링한다.

```text
1. model config 조회 응답
2. model config 변경 응답
3. status 응답
4. no conversation 응답
5. invalid effort 응답
```

모든 slash command 응답은 ephemeral로 반환한다.

---

## 14. HTTP Debug UI/API

`GET /api/conversations`와 `GET /api/conversations/:codexConversationId` 응답은 다음 필드를 추가한다.

```json
{
  "model": "gpt-5.5",
  "reasoningEffort": "high"
}
```

값이 설정되지 않은 경우 JSON value는 null이다.

```json
{
  "model": null,
  "reasoningEffort": null
}
```

PoC2는 Web Debug UI의 시각적 개선을 필수 범위에 포함하지 않는다.
API 응답에 필드가 포함되면 acceptance를 만족한다.

---

## 15. Error Handling

```text
1. conversation이 없는 channel에서 /codex model 또는 /codex status를 실행하면 no conversation 메시지를 반환한다.
2. effort 값이 allowed enum이 아니면 invalid effort 메시지를 반환한다.
3. model 값이 빈 문자열이면 invalid model 메시지를 반환한다.
4. repository update 중 오류가 발생하면 slash command error handler가 기존 방식으로 처리한다.
```

Discord slash command choice를 사용하는 경우 일반 사용자는 invalid effort를 보낼 수 없다.
테스트와 내부 호출 방어를 위해 service layer 검증은 유지한다.

---

## 16. Acceptance Criteria

2차 PoC는 다음 조건을 만족할 때 완료 상태로 판정한다.

```text
1. /codex model 명령으로 현재 conversation의 model과 effort를 조회할 수 있다.
2. /codex model model:gpt-5.5 effort:high 명령으로 model과 effort를 저장할 수 있다.
3. /codex model model:gpt-5.5 명령은 model만 변경하고 기존 effort를 유지한다.
4. /codex model effort:high 명령은 effort만 변경하고 기존 model을 유지한다.
5. 저장된 model과 effort는 SQLite에 유지된다.
6. 저장된 model과 effort는 다음 Codex turn의 SDK ThreadOptions에 적용된다.
7. /codex status 명령은 workspace, source, permission, status, running turns, model, effort, debug link를 표시한다.
8. conversation이 없는 channel에서 /codex model 또는 /codex status를 실행하면 no conversation 메시지를 반환한다.
9. invalid effort와 empty model은 저장되지 않는다.
10. GET /api/conversations 응답에 model과 reasoningEffort가 포함된다.
11. 기존 PoC1 /codex new, /codex yolo, @CodexBot turn 실행 behavior가 유지된다.
```

---

## 17. 구현 대상 파일

예상 구현 대상 파일은 다음과 같다.

```text
src/core/session/CodexConversation.ts
src/core/session/CodexConversationRepository.ts
src/core/session/CodexConversationService.ts
src/core/model/ReasoningEffort.ts
src/store/migration/003_model_config.sql
src/store/session/SqliteCodexConversationRepository.ts
src/protocol/response/CodexConversationResponse.ts
src/clients/codex/CodexSdkClient.ts
src/clients/codex/CodexSdkClientFactory.ts
src/core/turn/RunCodexTurnService.ts
src/transport/discord/DiscordBot.ts
src/transport/discord/DiscordSlashCommandRouter.ts
src/transport/discord/DiscordMessageRenderer.ts
src/transport/http/CodexConversationController.ts
test/config-workspace.test.ts
test/store-service.test.ts
test/transport-http-logging.test.ts
```

---

## 18. 제외 범위

2차 PoC는 다음을 구현하지 않는다.

```text
1. /codex plan
2. plan mode prompt wrapping
3. OpenAI model 목록 실시간 조회
4. Discord autocomplete
5. 사용자별 기본 model 설정
6. workspace별 기본 model 설정
7. 이미 실행 중인 Codex turn의 model 변경
8. Web Debug UI 시각적 레이아웃 개선
```

---

## 19. 요약

2차 PoC의 한 줄 정의는 다음과 같다.

```text
Discord thread 단위 Codex conversation에서 model과 reasoning effort를 조회/변경하고,
현재 conversation 상태를 Discord slash command와 HTTP debug API로 확인한다.
```
