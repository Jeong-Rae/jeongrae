# V0 Migration Plan (quilly/client)

## Current v0 Output (Next.js app structure)
- Directory layout observed in `quilly/client`: `app/`, `components/`, `components/ui/`, `lib/`, `public/`.
- Config files present: `components.json`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`.
- Tooling state: `lint` uses ESLint, no `biome.json`, no Tailwind config file, local `package-lock.json` and `node_modules`.
- Styling state: `app/globals.css` defines local theme tokens and does not import shared UI styles.
- Components: shadcn-style UI components live in `components/ui` with local `lib/utils.ts`.

## Target Alignment (blog/ and tools/ patterns)
- Use shared design system: `@jeongrae/ui` styles and components.
- Use shared lint config: `biome.json` extending `packages/config/biome.json`.
- Use shared TS config: `tsconfig.json` extends `packages/config/tsconfig/nextjs.json`.
- Use shared Tailwind base config: `tailwind.config.ts` extending `@jeongrae/ui/tailwind.config`.
- Standardize shadcn config: `components.json` uses `ui: "@jeongrae/ui"` and points to `tailwind.config.ts`.
- Next.js config includes `transpilePackages: ["@jeongrae/ui"]` (and any shared hooks package if needed).

## Gaps to Address
- `quilly/client` is not a workspace package (`pnpm-workspace.yaml` includes `quilly` only, not `quilly/*`).
- UI components in `components/ui` overlap with `@jeongrae/ui` (Button/Input exist; Select/Textarea do not).
- Local theme tokens need to be preserved while importing shared styles.
- ESLint config exists but Biome is the repo standard.

## Init Automation Script Scope
- Discovery
  - Accept app root path (default `quilly/client`) and validate it looks like a Next.js app.
  - Check if the app is included in `pnpm-workspace.yaml`; add `quilly/*` if missing.
- Config migration
  - Create `biome.json` extending `../../packages/config/biome.json`.
  - Update `tsconfig.json` to extend `../../packages/config/tsconfig/nextjs.json`.
  - Create `tailwind.config.ts` based on `blog/` and `tools/` pattern.
  - Update `components.json` to point at `tailwind.config.ts` and set `ui: "@jeongrae/ui"`.
  - Update `next.config.ts` to include `transpilePackages`.
- Styling migration
  - Insert shared imports in `app/globals.css`:
    - `@import "@jeongrae/ui/styles/shadcn.css";`
    - `@import "@jeongrae/ui/styles/foundation.css";`
  - Move existing theme tokens from `app/globals.css` into `app/theme.css`, then `@import "./theme.css";`
  - Add `@source "../../packages/ui/src/**/*.{ts,tsx}";` to match other apps.
- Dependency alignment
  - Update `package.json` scripts to `lint`/`format` using Biome.
  - Add `@jeongrae/ui` (and `@jeongrae/hook` if needed) to dependencies.
  - Add `@biomejs/biome` to devDependencies.
  - Remove duplicated UI deps (`@radix-ui/*`, `class-variance-authority`, `tailwind-merge`, etc.) if no longer used directly.
- Component migration
  - Update imports from `@/components/ui/*` to `@jeongrae/ui` where components exist.
  - For missing components (Select/Textarea), either:
    - Move them into `packages/ui` and export them, or
    - Keep local copies and exclude those imports from the rewrite.
  - Optionally replace local `lib/utils.ts` usage with `@jeongrae/ui` exports.
- Cleanup (optional flags)
  - Remove `eslint.config.mjs`, `package-lock.json`, and local `node_modules` in `quilly/client`.

## Tools and Approach
- Script implementation: Node.js (plain JS) using `fs/promises`, `path`, and JSON parsing.
- Safe edits: read/modify/write with backups and a `--dry-run` option.
- Code rewrites: simple import-path mapping first; fall back to manual review for mismatched exports.
- Templates: reuse patterns from `blog/` and `tools/` for Tailwind, Next.js config, and globals CSS.

## Follow-up Verification
- `pnpm -C quilly/client lint` (Biome) and `pnpm -C quilly/client dev`.
- Ensure shared UI styles apply and no missing component exports remain.
