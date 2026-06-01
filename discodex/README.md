# Codex Discord Agent PoC

Discord thread one-to-one mapping proof of concept for local Codex SDK conversations.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Configure `.env` and `config/workspaces.json` before connecting Discord.

## Verification

```bash
pnpm typecheck
pnpm test
```
