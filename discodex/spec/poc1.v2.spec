# PoC1.v2 추가 Spec

## 1. v2 목표

PoC1.v2는 `/codex new <cwd>`의 `cwd` 입력을 더 유연하게 처리한다.

시스템은 사용자가 입력한 `cwd`를 다음 규칙으로 해석한다.

```text
1. cwd가 절대 경로이면 해당 값을 그대로 Codex working directory로 사용한다.
2. cwd가 절대 경로가 아니면 workspace alias로 해석한다.
3. workspace alias는 config/workspaces.json에서 실제 absolutePath로 변환한다.
4. 같은 conversation 또는 같은 workspace에서 여러 Codex 작업이 동시에 실행될 수 있다.
5. 파일 수정 경합이 발생하면 마지막으로 반영된 파일 상태를 최종 상태로 채택한다.
```

---

## 2. `/codex new <cwd>` cwd 해석 Behavior

사용자가 다음 명령을 입력한다.

```text
/codex new /workspace/jeongrae/blog
```

시스템은 다음 순서로 행동한다.

```text
1. cwd 입력값을 수신한다.
2. cwd가 절대 경로인지 판정한다.
3. cwd가 절대 경로이면 cwd 값을 workspacePath로 사용한다.
4. workspaceKey는 cwd 값을 path-safe 문자열로 변환해 생성한다.
5. displayName은 cwd의 마지막 path segment를 기준으로 생성한다.
6. Codex SDK thread를 workspacePath 기준으로 생성한다.
7. Discord thread를 생성한다.
8. CodexConversation을 저장한다.
9. 생성된 Discord thread에 workspacePath를 표시한다.
```

예시:

```text
입력:
  /codex new /workspace/jeongrae/blog

해석:
  workspacePath = /workspace/jeongrae/blog
  workspaceKey = path_workspace_jeongrae_blog
  displayName = blog
```

---

## 3. Alias 해석 Behavior

사용자가 다음 명령을 입력한다.

```text
/codex new blog
```

시스템은 다음 순서로 행동한다.

```text
1. cwd 입력값을 수신한다.
2. cwd가 절대 경로인지 판정한다.
3. cwd가 절대 경로가 아니면 workspace alias로 해석한다.
4. workspace registry에서 alias와 일치하는 workspace를 조회한다.
5. 조회된 workspace.absolutePath를 workspacePath로 사용한다.
6. Codex SDK thread를 workspacePath 기준으로 생성한다.
7. Discord thread를 생성한다.
8. CodexConversation을 저장한다.
```

예시:

```text
입력:
  /codex new blog

config:
  blog → /workspace/jeongrae/blog

해석:
  workspaceKey = blog
  workspacePath = /workspace/jeongrae/blog
  displayName = Blog
```

---

## 4. cwd 판정 규칙

시스템은 Node.js `path.isAbsolute(cwd)` 기준으로 절대 경로 여부를 판정한다.

Linux PoC 기준 예시는 다음과 같다.

```text
절대 경로:
  /workspace/jeongrae/blog
  /srv/repos/api
  /home/ubuntu/project

alias:
  blog
  api
  web
  jeongrae-blog
```

PoC 실행 환경은 Linux를 기준으로 한다.

---

## 5. Workspace Registry v2 Behavior

WorkspaceRegistry는 두 가지 입력 경로를 제공한다.

```ts
export type ResolveWorkspaceInput = {
  cwd: string;
};

export type ResolvedWorkspace = {
  workspaceKey: string;
  displayName: string;
  workspacePath: string;
  source: "absolute_path" | "alias";
};
```

Behavior:

```text
1. cwd가 절대 경로이면 absolute path workspace를 생성한다.
2. cwd가 절대 경로이면 workspace config 조회 결과와 관계없이 cwd를 workspacePath로 사용한다.
3. cwd가 절대 경로가 아니면 workspace config에서 alias를 조회한다.
4. alias 조회 결과가 있으면 해당 absolutePath를 workspacePath로 사용한다.
5. alias 조회 결과가 없으면 사용 가능한 alias 목록을 안내한다.
```

---

## 6. WorkspaceValidator v2 Behavior

절대 경로 workspace에 대해 시스템은 다음 검증을 수행한다.

```text
1. workspacePath가 local filesystem에 존재한다.
2. workspacePath가 directory다.
3. 검증된 workspacePath를 Codex SDK working directory로 전달한다.
```

alias workspace에 대해 시스템은 다음 검증을 수행한다.

```text
1. workspaceKey가 config에 존재한다.
2. workspace.enabled 값이 true다.
3. workspace.absolutePath가 local filesystem에 존재한다.
4. workspace.absolutePath가 directory다.
5. 검증된 workspace.absolutePath를 Codex SDK working directory로 전달한다.
```

---

## 7. Conversation Data Model v2 추가 필드

CodexConversation은 cwd 해석 출처를 저장한다.

```ts
export type WorkspaceSource =
  | "absolute_path"
  | "alias";
```

CodexConversation에 다음 필드를 추가한다.

```ts
export type CodexConversation = {
  codexConversationId: CodexConversationId;

  discordGuildId: DiscordGuildId;
  parentChannelId: DiscordChannelId;
  conversationChannelId: DiscordChannelId;

  workspaceKey: WorkspaceKey;
  workspacePath: WorkspacePath;
  workspaceSource: WorkspaceSource;

  codexThreadId: CodexThreadId;

  status: CodexConversationStatus;
  permissionMode: PermissionMode;

  createdBy: DiscordUserId;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 8. SQLite Schema v2 Migration

파일 위치:

```text
src/store/migration/002_workspace_source.sql
```

SQL:

```sql
ALTER TABLE codex_conversation
ADD COLUMN workspace_source TEXT NOT NULL DEFAULT 'alias';
```

신규 생성 환경에서는 `001_init.sql`에 `workspace_source`를 포함한다.

```sql
CREATE TABLE codex_conversation (
  codex_conversation_id TEXT PRIMARY KEY,

  discord_guild_id TEXT NOT NULL,
  parent_channel_id TEXT NOT NULL,
  conversation_channel_id TEXT NOT NULL,

  workspace_key TEXT NOT NULL,
  workspace_path TEXT NOT NULL,
  workspace_source TEXT NOT NULL,

  codex_thread_id TEXT NOT NULL,

  status TEXT NOT NULL,
  permission_mode TEXT NOT NULL,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(discord_guild_id, conversation_channel_id)
);
```

---

## 9. `/codex new <cwd>` Response v2

절대 경로 입력 시 시스템은 다음 메시지를 출력한다.

```text
Codex 세션이 생성되었습니다.

Workspace: /workspace/jeongrae/blog
Source: absolute_path
Mode: default

이 thread에서 @CodexBot 으로 요청하세요.

예:
@CodexBot 이 프로젝트 구조를 요약해줘
```

alias 입력 시 시스템은 다음 메시지를 출력한다.

```text
Codex 세션이 생성되었습니다.

Workspace: blog
Path: /workspace/jeongrae/blog
Source: alias
Mode: default

이 thread에서 @CodexBot 으로 요청하세요.

예:
@CodexBot 이 프로젝트 구조를 요약해줘
```

---

## 10. 동시 실행 Behavior v2

PoC1.v2는 Codex turn 요청을 즉시 실행 대상으로 처리한다.

동일 conversation에 이미 실행 중인 turn이 있어도 시스템은 새 turn을 생성한다.

Behavior:

```text
1. 사용자가 @CodexBot 메시지를 보낸다.
2. 시스템은 현재 Discord channelId로 CodexConversation을 조회한다.
3. 시스템은 새 CodexTurn을 running 상태로 생성한다.
4. 시스템은 기존 conversation.status 값과 관계없이 Codex SDK run을 시작한다.
5. 시스템은 각 CodexTurn의 실행 결과를 개별적으로 저장한다.
6. 시스템은 완료된 CodexTurn의 finalResponse를 Discord thread에 출력한다.
7. 여러 CodexTurn이 같은 파일을 수정하면 마지막으로 반영된 파일 상태를 최종 상태로 채택한다.
```

---

## 11. Conversation Status v2

PoC1.v2에서 conversation.status는 UI 표시용 상태로 사용한다.

상태 계산 Behavior:

```text
1. running turn이 1개 이상이면 conversation.status를 running으로 표시한다.
2. running turn이 0개이면 conversation.status를 idle로 표시한다.
3. 각 turn은 독립적인 status를 가진다.
4. Web Debug UI는 conversation의 running turn 개수를 표시한다.
```

추가 응답 필드:

```ts
export type CodexConversationResponse = {
  codexConversationId: string;
  workspaceKey: string;
  workspacePath: string;
  workspaceSource: "absolute_path" | "alias";
  conversationChannelId: string;
  codexThreadId: string;
  status: "idle" | "running" | "closed";
  permissionMode: "default" | "yolo";
  runningTurnCount: number;
  createdAt: string;
  updatedAt: string;
};
```

---

## 12. RunCodexTurnService v2 Behavior

RunCodexTurnService는 conversation 단위 실행 lock을 사용하지 않는다.

Behavior:

```text
1. conversationChannelId로 CodexConversation을 조회한다.
2. CodexTurn을 running 상태로 생성한다.
3. Codex SDK run을 시작한다.
4. Codex runtime event를 codexTurnId 기준으로 저장한다.
5. Codex final response를 CodexTurn에 저장한다.
6. CodexTurn을 succeeded 상태로 전환한다.
7. 오류 발생 시 CodexTurn을 failed 상태로 전환한다.
8. conversation의 표시 상태는 running turn 개수 기준으로 계산한다.
```

---

## 13. Codex Runtime Event v2 Behavior

동시 실행 중 이벤트가 섞이지 않도록 event는 반드시 `codexTurnId`를 포함한다.

Behavior:

```text
1. 시스템은 Codex SDK event를 수신한다.
2. 시스템은 event에 codexConversationId를 부여한다.
3. 시스템은 event에 codexTurnId를 부여한다.
4. 시스템은 event를 저장한다.
5. Web Debug UI는 codexTurnId 기준으로 event를 그룹화한다.
```

---

## 14. Web Debug UI v2 추가 표시 항목

Web Debug UI는 conversation 상세에 다음 항목을 추가로 표시한다.

```text
1. workspaceSource
2. workspacePath
3. runningTurnCount
4. turn별 event stream
5. turn별 finalResponse
```

Turn 목록 표시 예시:

```text
Turn List
- turn_001 | running   | @user | repository 구조 요약
- turn_002 | running   | @user | README 수정
- turn_003 | succeeded | @user | 테스트 실행 방법 확인
```

---

## 15. Acceptance Criteria v2 추가

PoC1.v2는 다음 조건을 만족한다.

```text
1. /codex new /workspace/jeongrae/blog 입력 시 해당 절대 경로로 Codex 세션이 생성된다.
2. 절대 경로 입력 시 workspaceSource가 absolute_path로 저장된다.
3. 절대 경로 입력 시 workspacePath가 입력값 그대로 저장된다.
4. /codex new blog 입력 시 blog를 workspace alias로 해석한다.
5. alias 입력 시 workspaceSource가 alias로 저장된다.
6. alias 입력 시 workspacePath가 config/workspaces.json의 absolutePath로 저장된다.
7. 같은 Discord thread에서 여러 @CodexBot 메시지를 연속으로 보내면 각각 CodexTurn으로 생성된다.
8. 기존 CodexTurn이 running 상태여도 새 CodexTurn이 실행된다.
9. Web Debug UI는 동시에 running 상태인 CodexTurn 목록을 표시한다.
10. Web Debug UI는 각 CodexTurn의 event를 codexTurnId 기준으로 표시한다.
11. 같은 파일에 대한 수정 경합이 발생하면 마지막으로 반영된 파일 상태가 workspace의 최종 상태가 된다.
```

---

## 16. 구현 변경 파일

PoC1.v2에서 수정 또는 추가되는 파일은 다음과 같다.

```text
src/runtime/workspace/WorkspaceRegistry.ts
src/runtime/workspace/WorkspaceValidator.ts
src/runtime/workspace/WorkspaceDefinition.ts

src/core/session/CodexConversation.ts
src/core/session/CodexConversationService.ts

src/core/turn/RunCodexTurnService.ts

src/protocol/request/CreateCodexConversationRequest.ts
src/protocol/response/CodexConversationResponse.ts

src/store/migration/002_workspace_source.sql
src/store/session/SqliteCodexConversationRepository.ts
src/store/thread/SqliteCodexTurnRepository.ts

src/transport/discord/DiscordMessageRenderer.ts
src/transport/http/CodexConversationController.ts
public/app.js
```

---

## 17. 요약

PoC1.v2의 핵심 변경은 다음과 같다.

```text
1. /codex new <cwd>는 절대 경로를 직접 workspacePath로 사용한다.
2. 절대 경로가 아닌 cwd는 workspace alias로 해석한다.
3. CodexTurn은 conversation 단위 lock 없이 독립 실행된다.
4. 파일 수정 경합은 last win 방식으로 수렴한다.
5. Web Debug UI는 turn 단위 실행 상태와 event를 표시한다.
```
