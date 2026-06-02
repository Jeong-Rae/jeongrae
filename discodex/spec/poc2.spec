# Codex Discord Agent 2차 PoC Spec

## 1. 문서 목적

이 문서는 Codex Discord Agent의 2차 PoC 구현 범위를 정의한다.

2차 PoC는 기존 PoC1 conversation 구조 위에 conversation 단위 모델 설정과 Codex CLI runtime status 조회 기능을 추가한다.

---

## 2. 2차 PoC 목표

2차 PoC는 다음 목표를 달성한다.

```text
1. 사용자는 Discord thread 안에서 현재 Codex conversation의 실제 Codex CLI runtime status를 조회할 수 있다.
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
인자 없는 `/codex model`은 텍스트 조회만 수행하지 않고 Discord select menu 기반 interactive UI를 반환한다.
PoC2의 model select menu 목록은 OpenAI API에서 실시간 조회하지 않는다.
model select menu 목록은 코드 또는 설정 파일에 정의된 정적 selectable model list를 사용한다.
현재 effective model이 selectable model list에 없으면 UI에는 현재 값을 별도 텍스트로 표시하고 select menu에는 정적 목록만 표시한다.

---

## 4. `/codex model` Interactive UI Behavior

사용자가 Codex conversation이 연결된 Discord thread 안에서 다음 명령을 입력한다.

```text
/codex model
```

시스템은 다음 순서로 행동한다.

```text
1. Discord slash command interaction을 수신한다.
2. 현재 Discord guildId와 channelId로 CodexConversation을 조회한다.
3. conversation이 없으면 no conversation 안내 메시지를 반환한다.
4. conversation이 있으면 현재 effective model과 effective reasoning effort를 조회한다.
5. effective 값은 실제 Codex runtime/config에서 사용하는 현재 값을 의미한다.
6. 저장된 model 또는 reasoningEffort가 null이어도 `Default`, `Codex CLI default` 같은 대체 문구를 표시하지 않는다.
7. 저장된 override가 없으면 runtime/config에서 해석된 실제 model 값과 실제 reasoning effort 값을 표시한다.
8. Discord 응답은 ephemeral message로 반환한다.
9. 응답에는 현재 effective model/effort/summaries 값을 텍스트로 표시한다.
10. 응답에는 model 선택용 select menu와 effort 선택용 select menu를 포함한다.
11. model select menu는 정적 selectable model list를 표시한다.
12. effort select menu는 minimal, low, medium, high, xhigh 값을 표시한다.
13. 사용자가 model select menu를 선택하면 conversation.model을 선택 값으로 저장한다.
14. 사용자가 effort select menu를 선택하면 conversation.reasoningEffort를 선택 값으로 저장한다.
15. select menu 변경 후에는 변경된 effective model/effort 값을 다시 렌더링한다.
```

응답 예시:

```text
Codex model 설정

Current model: gpt-5.5
Current effort: high
Reasoning summaries: auto

Model override: not set
Effort override: not set

Select a model or effort below.
```

Discord components:

```text
Action row 1:
  String select menu
  custom_id: codex:model:model:<codexConversationId>
  placeholder: Select model
  options: selectable model list

Action row 2:
  String select menu
  custom_id: codex:model:effort:<codexConversationId>
  placeholder: Select reasoning effort
  options: minimal, low, medium, high, xhigh
```

`Current model`, `Current effort`, `Reasoning summaries`는 반드시 실제 effective 값을 표시한다.
해당 값을 조회할 수 없으면 `Unavailable: <reason>`으로 표시한다.
`Model override`와 `Effort override`는 SQLite에 저장된 override 여부를 표시하기 위한 부가 정보다.
override가 없다는 뜻으로 `not set`은 사용할 수 있지만, effective 값 자리에 `Default` 또는 `Codex CLI default`를 표시하면 안 된다.

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
6. model과 effort가 모두 없으면 Interactive UI Behavior를 수행한다.
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
4. conversation이 있으면 해당 Codex thread/session에 대한 Codex CLI runtime status를 조회한다.
5. status 조회는 DB에 저장된 model/reasoningEffort 값을 그대로 표시하지 않는다.
6. status 조회는 실제 Codex CLI가 해당 session에서 사용하는 effective runtime 값을 표시한다.
7. runtime status 조회에 실패하면 실패 사유와 함께 status unavailable 메시지를 반환한다.
```

응답 예시:

```text
Codex Status

Model:              gpt-5.5 (reasoning high, summaries auto)
Directory:          /workspaces/jeongrae/discodex
Permissions:        Full Access
Agents.md:          /home/codespace/.codex/AGENTS.md
Account:            kkwjdfo@gmail.com (Plus)
Collaboration mode: Default
Session:            019e889b-b710-7153-9051-ef57d4ed24af

Context window:     57% left (117K used / 258K)
5h limit:           49% left (resets 18:00)
Weekly limit:       73% left (resets 03:10 on 8 Jun)
```

`/codex status`는 위 예시처럼 Codex CLI status panel의 의미를 Discord text로 표현한다.
Discord에서는 box drawing character나 progress bar를 그대로 재현하지 않아도 된다.
하지만 각 항목의 값은 실제 Codex runtime/account/session 상태에서 가져와야 한다.

`/codex status`는 다음 값을 표시한다.

```text
1. Model: effective model, effective reasoning effort, reasoning summaries 설정
2. Directory: Codex thread가 실행되는 effective working directory
3. Permissions: Codex CLI가 표시하는 permission label
4. Agents.md: 현재 session에 적용되는 AGENTS.md 경로
5. Account: 로그인된 Codex 계정 email과 plan label
6. Collaboration mode: 현재 collaboration mode
7. Session: 현재 Codex session/thread id
8. Context window: 남은 context window 비율, 사용량, 전체량
9. 5h limit: 남은 5시간 limit 비율과 reset 시각
10. Weekly limit: 남은 weekly limit 비율과 reset 시각
```

각 항목을 조회할 수 없는 경우 해당 항목은 `Unavailable: <reason>`으로 표시한다.
전체 runtime status 조회 자체가 실패한 경우 no conversation 메시지가 아니라 status unavailable 메시지를 반환한다.

status unavailable 응답 예시:

```text
Codex status를 조회할 수 없습니다.

Reason: Codex CLI session metadata not found
Session: codex-thread-...
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
3. getStatus는 conversation이 있으면 Codex runtime status provider를 호출한다.
4. getStatus는 runtime status 조회 성공 시 Codex CLI status panel에 대응되는 값을 반환한다.
5. getStatus는 runtime status 조회 실패 시 status_unavailable 응답과 실패 사유를 반환한다.
6. getStatus는 DB에 저장된 model/reasoningEffort 값을 status 값으로 대체하지 않는다.
7. getStatus의 Model은 실제 effective model/reasoning/summaries 값을 사용한다.
8. getStatus의 Directory는 실제 effective Codex working directory 값을 사용한다.
9. getStatus의 Account, limit, context window 값은 실제 Codex CLI/account 상태 값을 사용한다.
10. getModelConfig는 Discord guildId와 channelId로 conversation을 조회한다.
11. getModelConfig는 conversation이 없으면 not_found 응답을 반환한다.
12. getModelConfig는 conversation이 있으면 effective model config provider를 호출한다.
13. getModelConfig는 현재 effective model, effective effort, reasoning summaries, 저장된 override 값, selectable model list를 반환한다.
14. getModelConfig는 저장된 model/reasoningEffort가 null이어도 `Default` 또는 `Codex CLI default`를 반환하지 않는다.
15. getModelConfig는 실제 effective 값을 조회할 수 없는 항목을 unavailable reason과 함께 반환한다.
16. updateModelConfig는 Discord guildId와 channelId로 model 설정을 갱신한다.
17. updateModelConfig는 model과 effort가 모두 undefined이면 Interactive UI 응답에 필요한 getModelConfig 응답을 반환한다.
```

runtime status provider output 예시:

```ts
type CodexRuntimeStatus = {
  model: string | null;
  reasoningEffort: string | null;
  reasoningSummaries: string | null;
  directory: string | null;
  permissions: string | null;
  agentsMd: string | null;
  accountEmail: string | null;
  accountPlan: string | null;
  collaborationMode: string | null;
  sessionId: string;
  contextWindow: {
    percentLeft: number | null;
    usedTokens: number | null;
    totalTokens: number | null;
  };
  fiveHourLimit: {
    percentLeft: number | null;
    resetsAtText: string | null;
  };
  weeklyLimit: {
    percentLeft: number | null;
    resetsAtText: string | null;
  };
};
```

effective model config provider output 예시:

```ts
type CodexEffectiveModelConfig = {
  currentModel: string | null;
  currentModelUnavailableReason: string | null;
  currentReasoningEffort: ReasoningEffort | null;
  currentReasoningEffortUnavailableReason: string | null;
  currentReasoningSummaries: string | null;
  currentReasoningSummariesUnavailableReason: string | null;
  modelOverride: string | null;
  reasoningEffortOverride: ReasoningEffort | null;
  selectableModels: string[];
  selectableEfforts: ReasoningEffort[];
};
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
PoC2는 인자 없는 `/codex model` 응답에 Discord string select menu component를 사용한다.
PoC2는 select menu interaction custom_id를 처리해야 한다.
custom_id는 선택 종류와 conversation id를 포함해야 한다.

---

## 13. Discord Rendering

`DiscordMessageRenderer`는 다음 메시지를 렌더링한다.

```text
1. model config interactive select menu 응답
2. model config 변경 응답
3. Codex CLI runtime status 응답
4. status unavailable 응답
5. no conversation 응답
6. invalid effort 응답
```

모든 slash command 응답은 ephemeral로 반환한다.
model config interactive select menu 응답은 Discord components를 포함한다.
select menu interaction 응답도 ephemeral로 반환한다.

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
4. /codex status에서 Codex runtime status provider가 조회 실패를 반환하면 status unavailable 메시지를 반환한다.
5. repository update 중 오류가 발생하면 slash command error handler가 기존 방식으로 처리한다.
```

Discord slash command choice를 사용하는 경우 일반 사용자는 invalid effort를 보낼 수 없다.
테스트와 내부 호출 방어를 위해 service layer 검증은 유지한다.

---

## 16. Acceptance Criteria

2차 PoC는 다음 조건을 만족할 때 완료 상태로 판정한다.

```text
1. 인자 없는 /codex model 명령은 현재 effective model/effort/summaries 값을 표시하고 Discord select menu components를 반환한다.
2. /codex model model:gpt-5.5 effort:high 명령으로 model과 effort를 저장할 수 있다.
3. /codex model model:gpt-5.5 명령은 model만 변경하고 기존 effort를 유지한다.
4. /codex model effort:high 명령은 effort만 변경하고 기존 model을 유지한다.
5. 저장된 model과 effort는 SQLite에 유지된다.
6. 저장된 model과 effort는 다음 Codex turn의 SDK ThreadOptions에 적용된다.
7. /codex status 명령은 실제 Codex CLI runtime status 값을 표시한다.
   - Model: effective model, reasoning effort, summaries
   - Directory
   - Permissions
   - Agents.md
   - Account
   - Collaboration mode
   - Session
   - Context window
   - 5h limit
   - Weekly limit
8. conversation이 없는 channel에서 /codex model 또는 /codex status를 실행하면 no conversation 메시지를 반환한다.
9. invalid effort와 empty model은 저장되지 않는다.
10. GET /api/conversations 응답에 model과 reasoningEffort가 포함된다.
11. 기존 PoC1 /codex new, /codex yolo, @CodexBot turn 실행 behavior가 유지된다.
12. /codex status는 DB에 저장된 model/reasoningEffort 값을 실제 runtime status의 대체값으로 표시하지 않는다.
13. Codex runtime status 조회 실패 시 status unavailable 메시지를 반환한다.
14. /codex model 응답의 current model/effort 자리에는 `Default` 또는 `Codex CLI default`를 표시하지 않는다.
15. model select menu 선택은 conversation.model을 저장하고, effort select menu 선택은 conversation.reasoningEffort를 저장한다.
```

---

## 17. 구현 대상 파일

예상 구현 대상 파일은 다음과 같다.

```text
src/core/session/CodexConversation.ts
src/core/session/CodexConversationRepository.ts
src/core/session/CodexConversationService.ts
src/core/status/CodexRuntimeStatus.ts
src/core/status/CodexRuntimeStatusProvider.ts
src/core/model/ReasoningEffort.ts
src/store/migration/003_model_config.sql
src/store/session/SqliteCodexConversationRepository.ts
src/protocol/response/CodexConversationResponse.ts
src/clients/codex/CodexSdkClient.ts
src/clients/codex/CodexSdkClientFactory.ts
src/clients/codex/CodexRuntimeStatusClient.ts
src/core/turn/RunCodexTurnService.ts
src/transport/discord/DiscordBot.ts
src/transport/discord/DiscordComponentInteractionRouter.ts
src/transport/discord/DiscordSlashCommandRouter.ts
src/transport/discord/DiscordMessageRenderer.ts
src/transport/http/CodexConversationController.ts
test/config-workspace.test.ts
test/store-service.test.ts
test/model-interaction.test.ts
test/status-runtime.test.ts
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
현재 Codex CLI runtime status를 Discord slash command로 확인한다.
```
