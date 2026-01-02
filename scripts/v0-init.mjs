#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_APP_PATH = "quilly/client";
const REQUIRED_IMPORTS = [
  '@import "@jeongrae/ui/styles/shadcn.css";',
  '@import "@jeongrae/ui/styles/foundation.css";',
];

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const appDir = path.resolve(process.cwd(), args.path || DEFAULT_APP_PATH);
const dryRun = args.dryRun;
const backup = !args.noBackup;
const withHooks = args.withHooks;
const cleanBackups = args.cleanBackups;

const changes = [];
const backupRemovals = [];

try {
  const workspaceRoot = await findWorkspaceRoot(appDir);
  await ensureWorkspaceIncludesApp(
    workspaceRoot,
    appDir,
    dryRun,
    backup,
    changes,
  );

  await ensureAppStructure(appDir);

  const configPaths = resolveConfigPaths(workspaceRoot, appDir);
  await ensureBiomeConfig(appDir, configPaths, dryRun, backup, changes);
  await ensureTsConfig(appDir, configPaths, dryRun, backup, changes);
  await ensureTailwindConfig(appDir, configPaths, dryRun, backup, changes);
  await ensureComponentsJson(appDir, dryRun, backup, changes);
  await ensureNextConfig(appDir, withHooks, dryRun, backup, changes);
  await ensureGlobalsCss(appDir, configPaths, dryRun, backup, changes);
  await updatePackageJson(appDir, withHooks, dryRun, backup, changes);
  await rewriteUiImports(appDir, dryRun, backup, changes);

  if (cleanBackups) {
    await cleanBackupFiles(
      appDir,
      workspaceRoot,
      dryRun,
      backupRemovals,
    );
  }

  printSummary(changes, backupRemovals, dryRun);
} catch (error) {
  console.error(`[v0-init] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = {
    path: DEFAULT_APP_PATH,
    dryRun: false,
    noBackup: false,
    withHooks: false,
    cleanBackups: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (arg === "--no-backup") {
      parsed.noBackup = true;
      continue;
    }
    if (arg === "--with-hooks") {
      parsed.withHooks = true;
      continue;
    }
    if (arg === "--clean-backups") {
      parsed.cleanBackups = true;
      continue;
    }
    if (arg === "--path" || arg === "-p") {
      parsed.path = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith("--path=")) {
      parsed.path = arg.split("=", 2)[1];
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`v0-init
Usage:
  node scripts/v0-init.mjs --path quilly/client

Options:
  -p, --path <path>   Next.js app directory (default: ${DEFAULT_APP_PATH})
  --with-hooks        Include @jeongrae/hook dependency + transpile package
  --dry-run           Print planned changes without writing files
  --no-backup         Skip creating .bak backups for modified files
  --clean-backups     Remove .bak backups from app and workspace root
  -h, --help          Show this help
`);
}

async function findWorkspaceRoot(startDir) {
  let current = startDir;
  const { root } = path.parse(startDir);
  while (true) {
    const workspacePath = path.join(current, "pnpm-workspace.yaml");
    if (await pathExists(workspacePath)) {
      return current;
    }
    if (current === root) {
      break;
    }
    current = path.dirname(current);
  }
  throw new Error("pnpm-workspace.yaml not found. Run from repo root.");
}

async function ensureAppStructure(appDir) {
  const packagePath = path.join(appDir, "package.json");
  if (!(await pathExists(packagePath))) {
    throw new Error(`package.json not found in ${appDir}`);
  }
  const appPath = path.join(appDir, "app");
  const srcAppPath = path.join(appDir, "src", "app");
  if (!(await pathExists(appPath)) && !(await pathExists(srcAppPath))) {
    throw new Error("app/ or src/app/ directory not found.");
  }
}

function resolveConfigPaths(workspaceRoot, appDir) {
  const biomePath = path.join(workspaceRoot, "packages/config/biome.json");
  const tsConfigPath = path.join(
    workspaceRoot,
    "packages/config/tsconfig/nextjs.json",
  );
  const uiSrcPath = path.join(workspaceRoot, "packages/ui/src");
  return {
    biomePath,
    tsConfigPath,
    uiSrcPath,
    workspaceRoot,
    appDir,
  };
}

async function ensureWorkspaceIncludesApp(
  workspaceRoot,
  appDir,
  dryRun,
  backup,
  changes,
) {
  const workspacePath = path.join(workspaceRoot, "pnpm-workspace.yaml");
  const content = await fs.readFile(workspacePath, "utf8");
  const appRelative = path.relative(workspaceRoot, appDir);
  const parentDir = appRelative.split(path.sep)[0];
  if (!parentDir || parentDir === ".") {
    return;
  }
  const workspaceEntry = `${parentDir}/*`;
  if (content.includes(workspaceEntry)) {
    return;
  }
  const lines = content.split(/\r?\n/);
  let inserted = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.match(new RegExp(`-\\s*["']${parentDir}["']`))) {
      const indent = line.match(/^\s*/)?.[0] ?? "  ";
      lines.splice(i + 1, 0, `${indent}- "${workspaceEntry}"`);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trim() === "packages:") {
        lines.splice(i + 1, 0, `  - "${workspaceEntry}"`);
        inserted = true;
        break;
      }
    }
  }
  if (!inserted) {
    throw new Error("Unable to update pnpm-workspace.yaml");
  }
  await writeIfChanged(
    workspacePath,
    lines.join("\n"),
    { dryRun, backup, changes },
  );
}

async function ensureBiomeConfig(appDir, configPaths, dryRun, backup, changes) {
  const relativePath = toPosixPath(
    path.relative(appDir, configPaths.biomePath),
  );
  const biomeConfig = {
    extends: [relativePath],
  };
  const targetPath = path.join(appDir, "biome.json");
  await writeJsonIfChanged(targetPath, biomeConfig, {
    dryRun,
    backup,
    changes,
  });
}

async function ensureTsConfig(appDir, configPaths, dryRun, backup, changes) {
  const relativePath = toPosixPath(
    path.relative(appDir, configPaths.tsConfigPath),
  );
  const tsConfig = {
    extends: relativePath,
    compilerOptions: {
      paths: {
        "@/*": ["./*"],
      },
    },
    include: [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
    ],
    exclude: ["node_modules"],
  };
  const targetPath = path.join(appDir, "tsconfig.json");
  await writeJsonIfChanged(targetPath, tsConfig, {
    dryRun,
    backup,
    changes,
  });
}

async function ensureTailwindConfig(appDir, configPaths, dryRun, backup, changes) {
  const relativeUiPath = ensureRelativePath(
    toPosixPath(path.relative(appDir, configPaths.uiSrcPath)),
  );
  const content = `import type { Config } from "tailwindcss";
import baseConfig from "@jeongrae/ui/tailwind.config";

const config = {
  ...baseConfig,
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "${relativeUiPath}/**/*.{ts,tsx}",
  ],
} satisfies Config;

export default config;
`;
  const targetPath = path.join(appDir, "tailwind.config.ts");
  await writeIfChanged(targetPath, content, { dryRun, backup, changes });
}

async function ensureComponentsJson(appDir, dryRun, backup, changes) {
  const targetPath = path.join(appDir, "components.json");
  if (!(await pathExists(targetPath))) {
    return;
  }
  const data = await readJson(targetPath);
  data.tailwind = data.tailwind ?? {};
  data.tailwind.config = "tailwind.config.ts";
  data.aliases = data.aliases ?? {};
  data.aliases.ui = "@jeongrae/ui";
  await writeJsonIfChanged(targetPath, data, { dryRun, backup, changes });
}

async function ensureNextConfig(appDir, withHooks, dryRun, backup, changes) {
  const targetPath = path.join(appDir, "next.config.ts");
  if (!(await pathExists(targetPath))) {
    return;
  }
  const content = await fs.readFile(targetPath, "utf8");
  const packages = ["@jeongrae/ui"];
  if (withHooks) {
    packages.push("@jeongrae/hook");
  }

  let updated = content;
  if (!content.includes("transpilePackages")) {
    const insertIndex = findNextConfigInsertionIndex(content);
    if (insertIndex === -1) {
      throw new Error("Unable to update next.config.ts (nextConfig not found)");
    }
    updated =
      content.slice(0, insertIndex) +
      `\n  transpilePackages: ${JSON.stringify(packages)},` +
      content.slice(insertIndex);
  } else {
    updated = ensureTranspilePackages(content, packages);
  }

  await writeIfChanged(targetPath, updated, { dryRun, backup, changes });
}

async function ensureGlobalsCss(appDir, configPaths, dryRun, backup, changes) {
  const appGlobals = path.join(appDir, "app", "globals.css");
  const srcGlobals = path.join(appDir, "src", "app", "globals.css");
  const globalsPath = (await pathExists(appGlobals)) ? appGlobals : srcGlobals;
  if (!(await pathExists(globalsPath))) {
    return;
  }
  const content = await fs.readFile(globalsPath, "utf8");
  const lines = content.split(/\r?\n/);

  const importIndexes = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim().startsWith("@import ")) {
      importIndexes.push(i);
    }
  }

  const insertAt = importIndexes.length
    ? importIndexes[importIndexes.length - 1] + 1
    : 0;

  const missingImports = REQUIRED_IMPORTS.filter(
    (statement) => !content.includes(statement),
  );
  if (missingImports.length > 0) {
    lines.splice(insertAt, 0, ...missingImports);
  }

  const sourceStatement = `@source "${ensureRelativePath(
    toPosixPath(path.relative(path.dirname(globalsPath), configPaths.uiSrcPath)),
  )}/**/*.{ts,tsx}";`;
  if (!content.includes("@source ")) {
    const lastImportIndex = importIndexes.length
      ? importIndexes[importIndexes.length - 1] + missingImports.length
      : Math.max(missingImports.length - 1, 0);
    lines.splice(lastImportIndex + 1, 0, "", sourceStatement);
  }

  await writeIfChanged(globalsPath, lines.join("\n"), {
    dryRun,
    backup,
    changes,
  });
}

async function updatePackageJson(appDir, withHooks, dryRun, backup, changes) {
  const packagePath = path.join(appDir, "package.json");
  const pkg = await readJson(packagePath);
  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.lint = "biome lint";
  if (!pkg.scripts.format) {
    pkg.scripts.format = "biome format --write";
  }

  pkg.dependencies = pkg.dependencies ?? {};
  if (!pkg.dependencies["@jeongrae/ui"]) {
    pkg.dependencies["@jeongrae/ui"] = "workspace:*";
  }
  if (withHooks && !pkg.dependencies["@jeongrae/hook"]) {
    pkg.dependencies["@jeongrae/hook"] = "workspace:*";
  }

  pkg.devDependencies = pkg.devDependencies ?? {};
  if (!pkg.devDependencies["@biomejs/biome"]) {
    pkg.devDependencies["@biomejs/biome"] = "2.3.8";
  }

  await writeJsonIfChanged(packagePath, pkg, { dryRun, backup, changes });
}

async function rewriteUiImports(appDir, dryRun, backup, changes) {
  const roots = ["app", "components", "lib", "pages", "src"];
  const targets = [];
  for (const root of roots) {
    const fullPath = path.join(appDir, root);
    if (await pathExists(fullPath)) {
      targets.push(fullPath);
    }
  }
  if (targets.length === 0) {
    return;
  }

  const files = [];
  for (const target of targets) {
    await collectFiles(target, files);
  }

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const updated = content.replace(
      /from\s+["']@\/components\/ui\/[^"']+["']/g,
      'from "@jeongrae/ui"',
    );
    if (updated !== content) {
      await writeIfChanged(file, updated, { dryRun, backup, changes });
    }
  }
}

async function collectFiles(dir, output) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, output);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (fullPath.match(/\.(ts|tsx|js|jsx)$/)) {
      output.push(fullPath);
    }
  }
}

async function cleanBackupFiles(appDir, workspaceRoot, dryRun, backupRemovals) {
  const backupFiles = new Set();
  await collectBackupFiles(appDir, backupFiles);
  const workspaceBackup = path.join(workspaceRoot, "pnpm-workspace.yaml.bak");
  if (await pathExists(workspaceBackup)) {
    backupFiles.add(workspaceBackup);
  }

  for (const filePath of backupFiles) {
    if (!dryRun) {
      await fs.unlink(filePath);
    }
    backupRemovals.push(filePath);
  }
}

async function collectBackupFiles(dir, output) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === ".turbo" ||
      entry.name === "dist"
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectBackupFiles(fullPath, output);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (entry.name.endsWith(".bak")) {
      output.add(fullPath);
    }
  }
}

function findNextConfigInsertionIndex(content) {
  const match = content.match(/const\s+nextConfig[^=]*=\s*{/);
  if (!match || match.index === undefined) {
    return -1;
  }
  return match.index + match[0].length;
}

function ensureTranspilePackages(content, packages) {
  const match = content.match(/transpilePackages:\s*\[([^\]]*)\]/);
  if (!match) {
    return content;
  }
  const existing = match[0];
  const existingItems = match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^["']|["']$/g, ""));

  const merged = new Set(existingItems);
  for (const pkg of packages) {
    merged.add(pkg);
  }

  const updated = `transpilePackages: [${Array.from(merged)
    .map((pkg) => `"${pkg}"`)
    .join(", ")}]`;
  return content.replace(existing, updated);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function ensureRelativePath(value) {
  if (value.startsWith(".")) {
    return value;
  }
  return `./${value}`;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJsonIfChanged(filePath, data, options) {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeIfChanged(filePath, content, options);
}

async function writeIfChanged(filePath, content, options) {
  const { dryRun, backup, changes } = options;
  const exists = await pathExists(filePath);
  if (exists) {
    const current = await fs.readFile(filePath, "utf8");
    if (current === content) {
      return;
    }
    if (backup) {
      await createBackup(filePath, dryRun);
    }
  } else {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }

  if (!dryRun) {
    await fs.writeFile(filePath, content);
  }
  changes.push(filePath);
}

async function createBackup(filePath, dryRun) {
  const backupPath = `${filePath}.bak`;
  if (await pathExists(backupPath)) {
    return;
  }
  if (!dryRun) {
    await fs.copyFile(filePath, backupPath);
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function printSummary(changes, backupRemovals, dryRun) {
  if (changes.length === 0 && backupRemovals.length === 0) {
    console.log("[v0-init] No changes required.");
    return;
  }
  if (changes.length > 0) {
    const header = dryRun ? "[v0-init] Planned changes:" : "[v0-init] Updated:";
    console.log(header);
    for (const change of changes) {
      console.log(`- ${change}`);
    }
  }
  if (backupRemovals.length > 0) {
    const header = dryRun
      ? "[v0-init] Planned backup removals:"
      : "[v0-init] Removed backups:";
    console.log(header);
    for (const removal of backupRemovals) {
      console.log(`- ${removal}`);
    }
  }
}
