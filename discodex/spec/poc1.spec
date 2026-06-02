# Codex Discord Agent 1차 PoC Spec

## 1. 문서 목적

이 문서는 TypeScript 기반 Codex Discord Agent의 최종 목표와 1차 PoC 구현 범위를 정의한다.

개발팀은 이 문서를 기준으로 1차 PoC를 구현한다.
Spec 문장은 시스템의 목표와 행동을 중심으로 작성한다.

---

## 2. 최종 목표

Codex Discord Agent는 Discord를 Codex Agent의 외부 대화 UI로 제공한다.

사용자는 Discord에서 Codex 세션을 생성하고, 생성된 Discord thread 안에서 Codex와 지속적으로 대화한다. Codex는 headless cloud Linux 서버의 local workspace에서 실행되며, Codex SDK를 통해 local Codex CLI를 제어한다.

최종 시스템은 다음 사용자 경험을 제공한다.

```text
1. 사용자는 Discord에서 Codex 세션을 생성한다.
2. 시스템은 세션마다 Discord thread를 생성한다.
3. 시스템은 Discord thread와 Codex thread를 1:1로 연결한다.
4. 사용자는 해당 thread 안에서 @CodexBot 메시지로 Codex와 대화한다.
5. Codex는 같은 thread 안의 후속 메시지를 같은 Codex thread로 이어서 처리한다.
6. 시스템은 Codex 응답, 작업 상태, 실행 결과, diff, approval 상태를 Discord에 표시한다.
7. 사용자는 Discord에서 테스트 실행, diff 확인, 작업 취소, 세션 종료, PR 생성 같은 후속 액션을 수행한다.
```

최종 목표의 핵심 불변식은 다음과 같다.

```text
Discord thread 또는 Discord channel 1개
  =
Codex resume 가능한 conversation 1개
```

---

## 3. 1차 PoC 목표

1차 PoC는 최종 목표 중 가장 작은 end-to-end 동작 단위를 구현한다.

1차 PoC는 다음 목표를 달성한다.

```text
1. 사용자는 /codex new <cwd> 명령으로 Codex 세션을 시작한다.
2. 시스템은 <cwd> alias에 대응하는 local workspace를 선택한다.
3. 시스템은 Discord private thread를 생성하고 요청한 사용자를 thread member로 추가한다.
4. 시스템은 Codex SDK thread를 생성한다.
5. 시스템은 Discord thread id와 Codex thread id를 저장한다.
6. 사용자는 생성된 Discord thread 안에서 @CodexBot 메시지를 보낸다.
7. 시스템은 같은 Codex thread를 resume하여 사용자 메시지를 처리한다.
8. 시스템은 Codex 응답을 Discord thread에 출력한다.
9. 사용자는 /codex yolo 명령으로 현재 세션의 permission mode를 yolo로 전환한다.
10. 시스템은 간이 Web Debug UI에서 conversation, turn, event, permission mode를 표시한다.
```

---

## 4. 1차 PoC 검증 질문

1차 PoC는 다음 질문에 답한다.

```text
1. Discord thread와 Codex thread를 1:1로 안정적으로 매핑할 수 있는가?
2. Codex SDK를 사용해 headless Linux에서 local Codex agent를 실행할 수 있는가?
3. 같은 Codex thread에 여러 사용자 메시지를 순차적으로 전달할 수 있는가?
4. Discord @mention 기반 대화 UX가 자연스럽게 동작하는가?
5. conversation 단위 yolo mode를 적용할 수 있는가?
6. Web Debug UI가 Codex 실행 흐름을 관찰 가능한 수준으로 표시하는가?
```

---

## 5. 후속 구현 단계

1차 PoC 이후 다음 기능을 단계적으로 추가한다.

```text
2차 단계:
- /codex status
- /codex close
- /codex diff
- Discord button 기반 diff 확인
- Discord button 기반 cancel

3차 단계:
- approval workflow
- test 실행 버튼
- git diff patch 첨부
- 작업 branch 자동 생성
- role 기반 workspace 접근 제어

4차 단계:
- GitHub PR 생성
- commit 생성
- git push
- audit log
- Docker sandbox
- queue 기반 job 처리

5차 단계:
- Codex App Server 연동 검토
- fine-grained event streaming
- approval request를 Discord UI로 변환
```

---

## 6. 기술 스택

1차 PoC는 다음 기술 스택을 사용한다.

```text
Runtime:
- Node.js 20 LTS 이상
- TypeScript
- pnpm

Core dependency:
- @openai/codex-sdk
- discord.js
- express
- better-sqlite3
- zod
- dotenv
```

`package.json` 기준 dependency는 다음과 같다.

```json
{
  "dependencies": {
    "@openai/codex-sdk": "latest",
    "discord.js": "latest",
    "express": "latest",
    "better-sqlite3": "latest",
    "zod": "latest",
    "dotenv": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/express": "latest",
    "typescript": "latest",
    "tsx": "latest"
  }
}
```

---

## 7. 전체 아키텍처

```text
Discord
  ├─ /codex new <cwd>
  ├─ /codex yolo
  └─ @CodexBot <message>
        │
        ▼
transport/discord
        │
        ▼
core/session + core/turn
        │
        ├──────────────────────┐
        ▼                      ▼
clients/codex              transport/http
        │                      │
        ▼                      ▼
Codex SDK                Web Debug UI
        │                      ▲
        ▼                      │
Local Codex CLI          transport/sse
        │
        ▼
runtime/workspace
        │
        ▼
/srv/repos/<workspace>
```

---

## 8. 핵심 Behavior

### 8.1 Conversation 생성 Behavior

사용자가 다음 명령을 입력한다.

```text
/codex new api
```

시스템은 다음 순서로 행동한다.

```text
1. Discord slash command interaction을 수신한다.
2. cwd option 값을 workspaceKey로 해석한다.
3. workspace registry에서 workspaceKey에 대응하는 workspace를 조회한다.
4. workspace path의 존재 여부와 git repository 여부를 검증한다.
5. 현재 Discord channel 아래에 private thread를 생성한다.
6. slash command를 요청한 사용자를 private thread member로 추가한다.
7. Codex SDK로 새 Codex thread를 생성한다.
8. Discord thread id와 Codex thread id를 CodexConversation으로 저장한다.
9. slash command 응답에 생성된 Discord thread link를 표시한다.
10. 생성된 Discord thread에 안내 메시지를 전송한다.
11. Web Debug UI에서 새 conversation을 조회 가능하게 만든다.
```

---

### 8.2 Mention Message 처리 Behavior

사용자가 생성된 Discord thread 안에서 다음 메시지를 보낸다.

```text
@CodexBot 로그인 테스트 실패 원인 찾아줘
```

시스템은 다음 순서로 행동한다.

```text
1. Discord message create event를 수신한다.
2. 메시지가 bot mention을 포함하는지 확인한다.
3. bot mention을 제거해 userMessage를 만든다.
4. message.channelId로 CodexConversation을 조회한다.
5. conversation 상태를 idle에서 running으로 전환한다.
6. CodexTurn을 running 상태로 저장한다.
7. Codex SDK로 기존 codexThreadId를 resume한다.
8. userMessage를 Codex thread에 전달한다.
9. Codex runtime event를 저장한다.
10. runtime event를 Web Debug UI로 전파한다.
11. Codex final response를 CodexTurn에 저장한다.
12. Codex final response를 Discord thread에 출력한다.
13. conversation 상태를 idle로 전환한다.
```

---

### 8.3 연속 대화 Behavior

같은 Discord thread에서 사용자가 다음 메시지를 이어서 보낸다.

```text
@CodexBot 방금 분석한 원인 기준으로 수정까지 진행해줘
```

시스템은 다음 방식으로 행동한다.

```text
1. 같은 Discord thread id로 기존 CodexConversation을 조회한다.
2. 저장된 codexThreadId를 사용한다.
3. Codex SDK resumeThread를 호출한다.
4. 새 userMessage를 같은 Codex thread의 다음 turn으로 전달한다.
5. Codex는 이전 conversation context와 local workspace 상태를 기준으로 응답한다.
```

---

### 8.4 Running 상태 Behavior

conversation이 running 상태일 때 새로운 사용자 메시지가 들어오면, 시스템은 다음 행동을 수행한다.

```text
1. 현재 conversation이 작업 중임을 확인한다.
2. 새 CodexTurn을 시작하는 대신 안내 메시지를 전송한다.
3. 기존 running turn이 완료될 때까지 conversation 상태를 유지한다.
```

안내 메시지는 다음 형식을 사용한다.

```text
현재 이 Codex 세션에서 작업이 진행 중입니다.
완료 후 다시 요청해주세요.
```

---

### 8.5 Yolo Mode Behavior

사용자가 conversation이 연결된 Discord thread 안에서 다음 명령을 입력한다.

```text
/codex yolo
```

시스템은 다음 행동을 수행한다.

```text
1. 현재 Discord channelId로 CodexConversation을 조회한다.
2. conversation의 permissionMode를 yolo로 변경한다.
3. Discord thread에 yolo mode 활성화 메시지를 전송한다.
4. Web Debug UI에 permissionMode = yolo 상태를 표시한다.
5. 다음 Codex 실행부터 yolo execution policy를 적용한다.
```

Discord 메시지는 다음 형식을 사용한다.

```text
현재 Codex 세션이 yolo mode로 전환되었습니다.

이후 실행은 approval 없이 더 넓은 권한으로 동작할 수 있습니다.
신뢰할 수 있는 workspace에서만 사용하세요.
```

---

## 9. Discord Command Spec

### 9.1 `/codex new <cwd>`

목표:

```text
새 Codex conversation을 생성한다.
```

입력:

```text
/codex new api
```

Option:

```text
name: cwd
type: string
required: true
description: Workspace alias
```

Behavior:

```text
1. 시스템은 cwd 값을 workspace alias로 처리한다.
2. 시스템은 workspace registry에서 alias를 조회한다.
3. 시스템은 Discord private thread를 생성한다.
4. 시스템은 slash command 요청자를 private thread member로 추가한다.
5. 시스템은 Codex SDK thread를 생성한다.
6. 시스템은 conversation mapping을 저장한다.
7. 시스템은 slash command 응답에 생성된 Discord thread link를 표시한다.
8. 시스템은 생성된 thread에 사용 안내 메시지를 전송한다.
```

유효하지 않은 workspace alias 입력 시 Behavior:

```text
1. 시스템은 등록된 workspace 목록을 조회한다.
2. 시스템은 사용 가능한 workspace alias를 안내한다.
3. 시스템은 새 conversation 생성을 완료 상태로 전환하지 않는다.
```

응답 예시:

```text
api workspace에 대한 Codex 세션을 생성했습니다.

Thread: https://discord.com/channels/<guildId>/<threadId>
```

---

### 9.2 `/codex yolo`

목표:

```text
현재 conversation의 permission mode를 yolo로 전환한다.
```

입력:

```text
/codex yolo
```

Behavior:

```text
1. 시스템은 현재 Discord channelId로 CodexConversation을 조회한다.
2. 시스템은 permissionMode를 yolo로 저장한다.
3. 시스템은 yolo mode 활성화 메시지를 Discord에 출력한다.
4. 시스템은 Web Debug UI에 yolo 상태를 표시한다.
```

conversation이 연결된 channel이 아닐 때 Behavior:

```text
1. 시스템은 현재 channel에 연결된 CodexConversation을 찾는다.
2. 시스템은 세션 생성 안내 메시지를 출력한다.
```

응답 예시:

```text
이 channel에는 연결된 Codex 세션이 없습니다.

먼저 다음 명령으로 세션을 생성하세요.
/codex new <cwd>
```

---

### 9.3 `@CodexBot <message>`

목표:

```text
사용자 메시지를 현재 conversation의 다음 Codex turn으로 전달한다.
```

입력:

```text
@CodexBot 이 repository 구조를 요약해줘
```

Behavior:

```text
1. 시스템은 bot mention 메시지를 수신한다.
2. 시스템은 mention을 제거해 userMessage를 만든다.
3. 시스템은 현재 Discord channelId로 CodexConversation을 조회한다.
4. 시스템은 CodexTurn을 생성한다.
5. 시스템은 Codex SDK로 기존 thread를 resume한다.
6. 시스템은 userMessage를 Codex에 전달한다.
7. 시스템은 Codex 응답을 Discord에 출력한다.
8. 시스템은 Web Debug UI에 turn 결과를 표시한다.
```

---

## 10. Workspace Spec

### 10.1 Workspace Config

workspace 설정 파일은 다음 경로를 사용한다.

```text
config/workspaces.json
```

예시:

```json
{
  "workspaces": [
    {
      "workspaceKey": "api",
      "displayName": "API Server",
      "absolutePath": "/srv/repos/api",
      "enabled": true
    },
    {
      "workspaceKey": "web",
      "displayName": "Web Frontend",
      "absolutePath": "/srv/repos/web",
      "enabled": true
    }
  ]
}
```

---

### 10.2 Workspace Validation Behavior

`/codex new <cwd>` 실행 시 시스템은 다음을 검증한다.

```text
1. workspaceKey가 config에 존재한다.
2. workspace.enabled 값이 true다.
3. workspace.absolutePath가 local filesystem에 존재한다.
4. workspace.absolutePath가 directory다.
5. workspace.absolutePath 하위에 .git directory가 존재한다.
```

검증 조건을 만족하는 경우 시스템은 Discord thread 생성 단계로 진행한다.

검증 조건을 만족하는 workspace가 없는 경우 시스템은 사용 가능한 workspace 목록을 안내한다.

---

## 11. Data Model

### 11.1 Type Alias

```ts
export type DiscordGuildId = string;
export type DiscordChannelId = string;
export type DiscordUserId = string;

export type CodexConversationId = string;
export type CodexThreadId = string;
export type CodexTurnId = string;

export type WorkspaceKey = string;
export type WorkspacePath = string;
```

---

### 11.2 CodexConversationStatus

```ts
export type CodexConversationStatus =
  | "idle"
  | "running"
  | "closed";
```

---

### 11.3 PermissionMode

```ts
export type PermissionMode =
  | "default"
  | "yolo";
```

---

### 11.4 CodexConversation

```ts
export type CodexConversation = {
  codexConversationId: CodexConversationId;

  discordGuildId: DiscordGuildId;
  parentChannelId: DiscordChannelId;
  conversationChannelId: DiscordChannelId;

  workspaceKey: WorkspaceKey;
  workspacePath: WorkspacePath;

  codexThreadId: CodexThreadId;

  status: CodexConversationStatus;
  permissionMode: PermissionMode;

  createdBy: DiscordUserId;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### 11.5 CodexTurnStatus

```ts
export type CodexTurnStatus =
  | "running"
  | "succeeded"
  | "failed";
```

---

### 11.6 CodexTurn

```ts
export type CodexTurn = {
  codexTurnId: CodexTurnId;
  codexConversationId: CodexConversationId;

  requestedBy: DiscordUserId;
  userMessage: string;

  status: CodexTurnStatus;

  finalResponse: string | null;
  errorMessage: string | null;

  createdAt: Date;
  startedAt: Date;
  finishedAt: Date | null;
};
```

---

### 11.7 CodexRuntimeEvent

```ts
export type CodexRuntimeEvent = {
  codexRuntimeEventId: string;
  codexConversationId: CodexConversationId;
  codexTurnId: CodexTurnId | null;

  eventType: string;
  payloadJson: string;

  createdAt: Date;
};
```

---

## 12. SQLite Schema

파일 위치:

```text
src/store/migration/001_init.sql
```

SQL:

```sql
CREATE TABLE codex_conversation (
  codex_conversation_id TEXT PRIMARY KEY,

  discord_guild_id TEXT NOT NULL,
  parent_channel_id TEXT NOT NULL,
  conversation_channel_id TEXT NOT NULL,

  workspace_key TEXT NOT NULL,
  workspace_path TEXT NOT NULL,

  codex_thread_id TEXT NOT NULL,

  status TEXT NOT NULL,
  permission_mode TEXT NOT NULL,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(discord_guild_id, conversation_channel_id)
);

CREATE TABLE codex_turn (
  codex_turn_id TEXT PRIMARY KEY,
  codex_conversation_id TEXT NOT NULL,

  requested_by TEXT NOT NULL,
  user_message TEXT NOT NULL,

  status TEXT NOT NULL,

  final_response TEXT,
  error_message TEXT,

  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,

  FOREIGN KEY(codex_conversation_id)
    REFERENCES codex_conversation(codex_conversation_id)
);

CREATE TABLE codex_runtime_event (
  codex_runtime_event_id TEXT PRIMARY KEY,
  codex_conversation_id TEXT NOT NULL,
  codex_turn_id TEXT,

  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,

  created_at TEXT NOT NULL,

  FOREIGN KEY(codex_conversation_id)
    REFERENCES codex_conversation(codex_conversation_id),

  FOREIGN KEY(codex_turn_id)
    REFERENCES codex_turn(codex_turn_id)
);

CREATE INDEX idx_codex_conversation_channel
  ON codex_conversation(discord_guild_id, conversation_channel_id);

CREATE INDEX idx_codex_turn_conversation
  ON codex_turn(codex_conversation_id);

CREATE INDEX idx_codex_runtime_event_conversation
  ON codex_runtime_event(codex_conversation_id);
```

---

## 13. 디렉터리 구조

1차 PoC는 다음 디렉터리 구조를 사용한다.

```text
codex-discord-agent/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
│
├── config/
│   └── workspaces.json
│
├── data/
│   └── .gitkeep
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── style.css
│
└── src/
    ├── cmd/
    │   └── server/
    │       └── main.ts
    │
    ├── core/
    │   ├── session/
    │   │   ├── CodexConversation.ts
    │   │   ├── CodexConversationRepository.ts
    │   │   ├── CodexConversationService.ts
    │   │   └── CodexConversationStatus.ts
    │   │
    │   ├── turn/
    │   │   ├── CodexTurn.ts
    │   │   ├── CodexTurnRepository.ts
    │   │   ├── CodexTurnStatus.ts
    │   │   └── RunCodexTurnService.ts
    │   │
    │   ├── policy/
    │   │   ├── PermissionMode.ts
    │   │   └── CodexExecutionPolicy.ts
    │   │
    │   └── event/
    │       ├── CodexRuntimeEvent.ts
    │       ├── CodexRuntimeEventBus.ts
    │       └── CodexRuntimeEventRepository.ts
    │
    ├── protocol/
    │   ├── request/
    │   │   ├── CreateCodexConversationRequest.ts
    │   │   ├── RunCodexTurnRequest.ts
    │   │   └── EnableYoloRequest.ts
    │   │
    │   ├── response/
    │   │   ├── CreateCodexConversationResponse.ts
    │   │   ├── RunCodexTurnResponse.ts
    │   │   └── CodexConversationResponse.ts
    │   │
    │   └── event/
    │       └── CodexRuntimeEventResponse.ts
    │
    ├── transport/
    │   ├── discord/
    │   │   ├── DiscordBot.ts
    │   │   ├── DiscordSlashCommandRouter.ts
    │   │   ├── DiscordMentionMessageRouter.ts
    │   │   ├── DiscordThreadService.ts
    │   │   └── DiscordMessageRenderer.ts
    │   │
    │   ├── http/
    │   │   ├── DebugHttpServer.ts
    │   │   ├── CodexConversationController.ts
    │   │   └── StaticFileController.ts
    │   │
    │   └── sse/
    │       └── CodexRuntimeEventSseController.ts
    │
    ├── clients/
    │   └── codex/
    │       ├── CodexSdkClient.ts
    │       ├── CodexSdkClientFactory.ts
    │       └── CodexSdkRunResult.ts
    │
    ├── runtime/
    │   └── workspace/
    │       ├── WorkspaceDefinition.ts
    │       ├── WorkspaceRegistry.ts
    │       └── WorkspaceValidator.ts
    │
    ├── store/
    │   ├── connection/
    │   │   └── SqliteConnectionFactory.ts
    │   │
    │   ├── session/
    │   │   └── SqliteCodexConversationRepository.ts
    │   │
    │   ├── thread/
    │   │   └── SqliteCodexTurnRepository.ts
    │   │
    │   ├── event/
    │   │   └── SqliteCodexRuntimeEventRepository.ts
    │   │
    │   └── migration/
    │       ├── 001_init.sql
    │       └── MigrationRunner.ts
    │
    ├── telemetry/
    │   └── logging/
    │       ├── Logger.ts
    │       └── ConsoleLogger.ts
    │
    ├── config/
    │   ├── loader/
    │   │   ├── EnvironmentConfigLoader.ts
    │   │   └── WorkspaceConfigLoader.ts
    │   │
    │   └── validation/
    │       ├── EnvironmentConfigSchema.ts
    │       └── WorkspaceConfigSchema.ts
    │
    └── support/
        ├── id/
        │   └── createId.ts
        │
        ├── time/
        │   └── SystemClock.ts
        │
        └── text/
            └── DiscordMessageText.ts
```

---

## 14. 주요 컴포넌트 Spec

### 14.1 `src/cmd/server/main.ts`

목표:

```text
애플리케이션 실행 진입점을 제공한다.
```

Behavior:

```text
1. 환경변수를 로딩한다.
2. workspace config를 로딩한다.
3. SQLite connection을 생성한다.
4. migration을 실행한다.
5. repository 구현체를 생성한다.
6. core service를 조립한다.
7. DiscordBot을 시작한다.
8. DebugHttpServer를 시작한다.
9. server_started 로그를 출력한다.
```

---

### 14.2 `DiscordBot.ts`

목표:

```text
Discord Gateway 연결과 event routing을 담당한다.
```

Behavior:

```text
1. discord.js Client를 생성한다.
2. Discord Bot token으로 login한다.
3. interactionCreate event를 DiscordSlashCommandRouter로 전달한다.
4. messageCreate event를 DiscordMentionMessageRouter로 전달한다.
5. discord_bot_logged_in 로그를 출력한다.
```

---

### 14.3 `DiscordSlashCommandRouter.ts`

목표:

```text
/codex slash command를 application service 호출로 변환한다.
```

Behavior:

```text
1. /codex new command를 수신한다.
2. CreateCodexConversationRequest를 생성한다.
3. CodexConversationService.create를 호출한다.
4. 생성 결과를 Discord interaction response로 반환한다.
5. /codex yolo command를 수신한다.
6. EnableYoloRequest를 생성한다.
7. CodexConversationService.enableYolo를 호출한다.
8. yolo 전환 결과를 Discord interaction response로 반환한다.
```

---

### 14.4 `DiscordMentionMessageRouter.ts`

목표:

```text
@CodexBot 메시지를 Codex turn 실행으로 변환한다.
```

Behavior:

```text
1. messageCreate event를 수신한다.
2. bot 작성 메시지를 필터링한다.
3. bot mention 포함 여부를 확인한다.
4. DiscordMessageText를 사용해 mention을 제거한다.
5. RunCodexTurnRequest를 생성한다.
6. RunCodexTurnService.run을 호출한다.
7. RunStarted 메시지를 Discord에 출력한다.
8. RunSucceeded 또는 RunFailed 메시지를 Discord에 출력한다.
```

---

### 14.5 `CodexConversationService.ts`

목표:

```text
Codex conversation lifecycle을 관리한다.
```

Behavior:

```text
1. workspace alias를 workspace path로 변환한다.
2. workspace path를 검증한다.
3. DiscordThreadService로 private thread를 생성하고 요청자를 member로 추가한다.
4. CodexSdkClient로 Codex thread를 생성한다.
5. CodexConversation을 저장한다.
6. conversation status를 변경한다.
7. permissionMode를 변경한다.
8. channelId로 conversation을 조회한다.
```

---

### 14.6 `RunCodexTurnService.ts`

목표:

```text
사용자 메시지를 하나의 Codex turn으로 실행한다.
```

Behavior:

```text
1. conversationChannelId로 CodexConversation을 조회한다.
2. conversation 상태를 running으로 전환한다.
3. CodexTurn을 running 상태로 저장한다.
4. CodexSdkClient.run을 호출한다.
5. Codex runtime event를 저장한다.
6. Codex final response를 저장한다.
7. CodexTurn을 succeeded 상태로 전환한다.
8. conversation 상태를 idle로 전환한다.
9. 오류 발생 시 CodexTurn을 failed 상태로 전환한다.
10. 오류 발생 시 conversation 상태를 idle로 전환한다.
```

---

### 14.7 `CodexSdkClient.ts`

목표:

```text
@openai/codex-sdk를 application core에서 사용하는 port 형태로 감싼다.
```

Interface:

```ts
import type { CodexThreadId, WorkspacePath } from "../../core/session/CodexConversation";
import type { PermissionMode } from "../../core/policy/PermissionMode";

export type RunCodexInput = {
  codexThreadId: CodexThreadId;
  workspacePath: WorkspacePath;
  permissionMode: PermissionMode;
  message: string;
};

export type RunCodexOutput = {
  finalResponse: string;
};

export type StartCodexThreadInput = {
  workspacePath: WorkspacePath;
  permissionMode: PermissionMode;
};

export type StartCodexThreadOutput = {
  codexThreadId: CodexThreadId;
};

export type CodexSdkClient = {
  startThread(input: StartCodexThreadInput): Promise<StartCodexThreadOutput>;
  run(input: RunCodexInput): Promise<RunCodexOutput>;
};
```

Behavior:

```text
1. startThread는 workspacePath 기준 Codex thread를 생성한다.
2. run은 codexThreadId 기준 Codex thread를 resume한다.
3. run은 message를 Codex thread에 전달한다.
4. run은 final response를 반환한다.
5. permissionMode에 따라 Codex config를 선택한다.
```

---

### 14.8 `CodexSdkClientFactory.ts`

목표:

```text
permissionMode에 맞는 Codex SDK client configuration을 생성한다.
```

Behavior:

```text
1. permissionMode가 default이면 workspace-write 실행 정책을 적용한다.
2. permissionMode가 default이면 on-request approval 정책을 적용한다.
3. permissionMode가 yolo이면 danger-full-access 실행 정책을 적용한다.
4. permissionMode가 yolo이면 never approval 정책을 적용한다.
```

구현 예시:

```ts
import { Codex } from "@openai/codex-sdk";
import type { PermissionMode } from "../../core/policy/PermissionMode";

export class CodexSdkClientFactory {
  public create(permissionMode: PermissionMode): Codex {
    if (permissionMode === "yolo") {
      return new Codex({
        config: {
          approval_policy: "never",
          sandbox_mode: "danger-full-access",
        },
      });
    }

    return new Codex({
      config: {
        approval_policy: "on-request",
        sandbox_mode: "workspace-write",
      },
    });
  }
}
```

설치된 SDK 타입 정의가 다른 option key를 제공하는 경우, 구현자는 동일한 실행 정책 의미를 유지하며 SDK 타입에 맞게 option mapping을 조정한다.

---

## 15. Web Debug UI Spec

### 15.1 목표

Web Debug UI는 1차 PoC의 관찰 도구다.

Web Debug UI는 다음 정보를 표시한다.

```text
1. conversation 목록
2. conversation 상세
3. workspaceKey
4. codexThreadId
5. Discord conversationChannelId
6. status
7. permissionMode
8. turn 목록
9. runtime event 목록
10. final response
```

---

### 15.2 HTTP API

#### GET `/api/conversations`

Behavior:

```text
1. 시스템은 저장된 CodexConversation 목록을 조회한다.
2. 시스템은 최신 생성 순서로 conversation 목록을 반환한다.
```

Response:

```json
{
  "conversations": [
    {
      "codexConversationId": "conv_123",
      "workspaceKey": "api",
      "conversationChannelId": "1234567890",
      "codexThreadId": "thread_abc",
      "status": "idle",
      "permissionMode": "default",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET `/api/conversations/:codexConversationId`

Behavior:

```text
1. 시스템은 codexConversationId로 conversation을 조회한다.
2. 시스템은 conversation 상세를 반환한다.
```

---

#### GET `/api/conversations/:codexConversationId/turns`

Behavior:

```text
1. 시스템은 conversation에 속한 turn 목록을 조회한다.
2. 시스템은 생성 순서로 turn 목록을 반환한다.
```

---

#### GET `/api/conversations/:codexConversationId/events`

Behavior:

```text
1. 시스템은 conversation에 속한 runtime event 목록을 조회한다.
2. 시스템은 생성 순서로 event 목록을 반환한다.
```

---

#### GET `/api/conversations/:codexConversationId/events/stream`

Behavior:

```text
1. 시스템은 SSE connection을 생성한다.
2. 시스템은 해당 conversation의 신규 runtime event를 SSE로 전송한다.
3. Web Debug UI는 수신한 event를 event panel에 추가한다.
```

SSE event format:

```text
event: codex-runtime-event
data: {"eventType":"agent_message_delta","payload":{}}
```

---

## 16. Environment Config

`.env.example`은 다음 값을 제공한다.

```env
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_GUILD_ID=

# Optional. 기본 인증은 local Codex CLI의 기존 로그인 상태를 사용한다.
# API key 기반 Codex exec 실행이 필요할 때만 설정한다.
# OPENAI_API_KEY=

DATABASE_PATH=./data/codex-discord-agent.sqlite

HTTP_PORT=3000

WORKSPACE_CONFIG_PATH=./config/workspaces.json

# Optional. 생략하면 Codex CLI 기본 home, 보통 ~/.codex를 사용한다.
# 전용 Codex home을 쓰려면 이미 존재하는 절대 경로를 설정한다.
# CODEX_HOME=
```

EnvironmentConfigLoader Behavior:

```text
1. .env 파일을 로딩한다.
2. Discord required environment variable을 검증한다.
3. DATABASE_PATH 기본값을 적용한다.
4. HTTP_PORT 기본값을 적용한다.
5. WORKSPACE_CONFIG_PATH 기본값을 적용한다.
6. OPENAI_API_KEY가 없으면 undefined로 유지하여 local Codex CLI 인증 상태를 사용한다.
7. CODEX_HOME이 없으면 undefined로 유지하여 Codex CLI 기본 home을 사용한다.
8. CODEX_HOME이 있으면 Codex SDK 실행 env에만 주입한다.
```

---

## 17. Discord Message Rendering Spec

### 17.1 Conversation Created

```text
Codex 세션이 생성되었습니다.

Workspace: api
Mode: default

이 thread에서 @CodexBot 으로 요청하세요.

예:
@CodexBot 로그인 테스트 실패 원인 찾아줘
```

---

### 17.2 Run Started

```text
Codex 작업을 시작했습니다.
```

---

### 17.3 Run Succeeded

```text
Codex 응답

{finalResponse}
```

finalResponse 길이 처리 Behavior:

```text
1. 시스템은 Discord 메시지 본문을 1800자 기준으로 맞춘다.
2. 1800자를 초과하는 응답은 앞부분 요약과 Web Debug UI 확인 안내를 포함한다.
3. 전체 응답은 CodexTurn.finalResponse에 저장한다.
```

---

### 17.4 Run Failed

```text
Codex 실행 중 오류가 발생했습니다.

Error:
{errorMessage}
```

---

### 17.5 Yolo Enabled

```text
현재 Codex 세션이 yolo mode로 전환되었습니다.

이후 실행은 approval 없이 더 넓은 권한으로 동작할 수 있습니다.
신뢰할 수 있는 workspace에서만 사용하세요.
```

---

## 18. 동시성 Spec

시스템은 conversation 단위 단일 실행을 보장한다.

Behavior:

```text
1. Codex turn 실행 직전 conversation.status를 running으로 변경한다.
2. status 변경은 compare-and-set 방식으로 처리한다.
3. status가 idle인 conversation만 running으로 전환한다.
4. running 전환에 성공한 요청만 CodexTurn을 실행한다.
5. running 전환에 실패한 요청은 사용자에게 진행 중 안내 메시지를 보낸다.
6. CodexTurn 완료 후 conversation.status를 idle로 변경한다.
```

SQL:

```sql
UPDATE codex_conversation
SET status = 'running', updated_at = ?
WHERE codex_conversation_id = ?
  AND status = 'idle';
```

---

## 19. Logging Spec

시스템은 console structured logging을 제공한다.

필수 log event:

```text
- server_started
- discord_bot_logged_in
- conversation_created
- codex_turn_started
- codex_turn_succeeded
- codex_turn_failed
- yolo_enabled
```

Log format:

```json
{
  "level": "info",
  "message": "codex turn started",
  "eventType": "codex_turn_started",
  "codexConversationId": "conv_123",
  "codexTurnId": "turn_123",
  "workspaceKey": "api",
  "createdAt": "2026-06-01T00:00:00.000Z"
}
```

Secret handling Behavior:

```text
1. 시스템은 DISCORD_BOT_TOKEN 값을 로그 message에 포함할 때 redacted 값으로 표시한다.
2. OPENAI_API_KEY가 설정된 경우 시스템은 해당 값을 로그 message에 포함할 때 redacted 값으로 표시한다.
3. 시스템은 error object 출력 시 environment variable 값을 redacted 값으로 변환한다.
```

---

## 20. 구현 순서

### Step 1. 프로젝트 초기화

```bash
pnpm init
pnpm add @openai/codex-sdk discord.js express better-sqlite3 zod dotenv
pnpm add -D typescript tsx @types/node @types/express
```

완료 Behavior:

```text
1. pnpm install이 성공한다.
2. pnpm dev 명령으로 src/cmd/server/main.ts를 실행할 수 있다.
```

---

### Step 2. Config 구현

구현 파일:

```text
.env.example
config/workspaces.json
src/config/loader/EnvironmentConfigLoader.ts
src/config/loader/WorkspaceConfigLoader.ts
src/config/validation/EnvironmentConfigSchema.ts
src/config/validation/WorkspaceConfigSchema.ts
```

완료 Behavior:

```text
1. 시스템은 환경변수를 로딩한다.
2. 시스템은 workspace config를 로딩한다.
3. 시스템은 유효한 config object를 main.ts에 제공한다.
```

---

### Step 3. SQLite Store 구현

구현 파일:

```text
src/store/migration/001_init.sql
src/store/migration/MigrationRunner.ts
src/store/connection/SqliteConnectionFactory.ts
src/store/session/SqliteCodexConversationRepository.ts
src/store/thread/SqliteCodexTurnRepository.ts
src/store/event/SqliteCodexRuntimeEventRepository.ts
```

완료 Behavior:

```text
1. 시스템은 DATABASE_PATH에 SQLite database를 생성한다.
2. 시스템은 migration을 적용한다.
3. 시스템은 conversation, turn, runtime event를 저장하고 조회한다.
```

---

### Step 4. Workspace 구현

구현 파일:

```text
src/runtime/workspace/WorkspaceDefinition.ts
src/runtime/workspace/WorkspaceRegistry.ts
src/runtime/workspace/WorkspaceValidator.ts
```

완료 Behavior:

```text
1. 시스템은 workspaceKey로 workspace를 조회한다.
2. 시스템은 workspace path를 검증한다.
3. 시스템은 검증된 workspacePath를 conversation 생성 서비스에 제공한다.
```

---

### Step 5. Codex SDK Client 구현

구현 파일:

```text
src/clients/codex/CodexSdkClient.ts
src/clients/codex/CodexSdkClientFactory.ts
src/clients/codex/CodexSdkRunResult.ts
```

완료 Behavior:

```text
1. 시스템은 지정 workspacePath에서 Codex thread를 생성한다.
2. 시스템은 기존 codexThreadId로 Codex thread를 resume한다.
3. 시스템은 message를 Codex에 전달한다.
4. 시스템은 final response를 반환한다.
```

---

### Step 6. Core Service 구현

구현 파일:

```text
src/core/session/CodexConversationService.ts
src/core/turn/RunCodexTurnService.ts
src/core/event/CodexRuntimeEventBus.ts
```

완료 Behavior:

```text
1. 시스템은 conversation을 생성한다.
2. 시스템은 conversation을 channelId로 조회한다.
3. 시스템은 permissionMode를 yolo로 전환한다.
4. 시스템은 CodexTurn을 실행한다.
5. 시스템은 runtime event를 저장하고 event bus로 발행한다.
```

---

### Step 7. Discord Transport 구현

구현 파일:

```text
src/transport/discord/DiscordBot.ts
src/transport/discord/DiscordSlashCommandRouter.ts
src/transport/discord/DiscordMentionMessageRouter.ts
src/transport/discord/DiscordThreadService.ts
src/transport/discord/DiscordMessageRenderer.ts
```

완료 Behavior:

```text
1. 시스템은 Discord Bot으로 로그인한다.
2. 시스템은 /codex new <cwd> 명령을 처리한다.
3. 시스템은 Discord private thread를 생성한다.
4. 시스템은 @CodexBot 메시지를 처리한다.
5. 시스템은 /codex yolo 명령을 처리한다.
6. 시스템은 Codex 응답을 Discord thread에 출력한다.
```

---

### Step 8. Web Debug UI 구현

구현 파일:

```text
src/transport/http/DebugHttpServer.ts
src/transport/http/CodexConversationController.ts
src/transport/http/StaticFileController.ts
src/transport/sse/CodexRuntimeEventSseController.ts
public/index.html
public/app.js
public/style.css
```

완료 Behavior:

```text
1. 시스템은 http://localhost:3000 에 Web Debug UI를 제공한다.
2. Web Debug UI는 conversation 목록을 표시한다.
3. Web Debug UI는 conversation 상세를 표시한다.
4. Web Debug UI는 turn 목록을 표시한다.
5. Web Debug UI는 runtime event를 표시한다.
6. Web Debug UI는 permissionMode를 표시한다.
```

---

## 21. 실행 방법

### 21.1 환경변수 설정

```bash
cp .env.example .env
```

`.env`를 작성한다.

```env
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=...
DISCORD_GUILD_ID=...

DATABASE_PATH=./data/codex-discord-agent.sqlite
HTTP_PORT=3000
WORKSPACE_CONFIG_PATH=./config/workspaces.json

# Optional. API key 기반 실행이 필요한 경우에만 설정한다.
# OPENAI_API_KEY=...

# Optional. 생략하면 local Codex CLI 기본 home을 사용한다.
# CODEX_HOME=/absolute/path/to/codex-home
```

---

### 21.2 workspace 설정

```json
{
  "workspaces": [
    {
      "workspaceKey": "api",
      "displayName": "API Server",
      "absolutePath": "/srv/repos/api",
      "enabled": true
    }
  ]
}
```

---

### 21.3 서버 실행

```bash
pnpm dev
```

---

### 21.4 Discord 테스트

세션 생성:

```text
/codex new api
```

생성된 thread에서 대화:

```text
@CodexBot 이 repository 구조를 요약해줘
```

이어 대화:

```text
@CodexBot 테스트 실행 방법을 찾아줘
```

yolo 활성화:

```text
/codex yolo
```

Web Debug UI 확인:

```text
http://localhost:3000
```

---

## 22. Acceptance Criteria

1차 PoC는 다음 조건을 만족할 때 완료 상태로 판정한다.

```text
1. /codex new api 명령으로 Discord private thread가 생성된다.
2. slash command 요청자가 생성된 private thread member로 추가된다.
3. slash command 응답에 생성된 Discord thread link가 표시된다.
4. 생성된 Discord thread id가 conversationChannelId로 저장된다.
5. Codex SDK thread id가 codexThreadId로 저장된다.
6. Web Debug UI에서 conversation 목록을 확인할 수 있다.
7. 생성된 Discord thread에서 @CodexBot 메시지를 보내면 Codex 응답을 받을 수 있다.
8. 같은 Discord thread에서 두 번째 @CodexBot 메시지를 보내면 같은 codexThreadId를 사용한다.
9. conversation.status가 running일 때 추가 요청은 진행 중 안내 메시지를 반환한다.
10. /codex yolo 실행 시 현재 conversation의 permissionMode가 yolo로 변경된다.
11. Web Debug UI에서 permissionMode = yolo 상태를 확인할 수 있다.
12. Discord 응답 길이가 1800자를 초과할 때 축약 응답과 Web Debug UI 안내를 표시한다.
13. 등록된 workspace alias를 기준으로 workspace를 선택한다.
14. 등록된 workspace alias와 일치하는 값이 없을 때 사용 가능한 workspace 목록을 안내한다.
15. DISCORD_BOT_TOKEN과, 설정된 경우 OPENAI_API_KEY는 로그에 redacted 값으로 표시된다.
```

---

## 23. 요약

1차 PoC의 한 줄 정의는 다음과 같다.

```text
Discord thread 하나를 Codex SDK thread 하나와 1:1로 연결하고,
해당 thread 안에서 @CodexBot 멘션을 통해 Codex와 지속 대화하는 구조를 검증한다.
```

1차 PoC가 제공하는 핵심 behavior는 다음 세 가지다.

```text
1. /codex new <cwd> 로 conversation을 생성한다.
2. @CodexBot <message> 로 같은 Codex thread에 turn을 추가한다.
3. /codex yolo 로 현재 conversation의 execution policy를 yolo로 전환한다.
```
