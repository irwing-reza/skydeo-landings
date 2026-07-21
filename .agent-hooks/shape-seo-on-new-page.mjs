#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

const APPROVAL_TTL_MS = 60 * 60 * 1000;
const PAGE_EXTENSIONS = new Set([".astro", ".html", ".md", ".mdx"]);

function projectRoot(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
    }).trim();
  } catch {
    return cwd;
  }
}

function normalizePath(filePath, cwd, root) {
  const absolutePath = isAbsolute(filePath) ? filePath : resolve(cwd, filePath);
  return relative(root, absolutePath).split(sep).join("/");
}

function isPagePath(filePath) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\/+/, "");
  const extension = normalized.slice(normalized.lastIndexOf("."));

  if (!PAGE_EXTENSIONS.has(extension)) {
    return false;
  }

  return (
    normalized.startsWith("src/pages/") ||
    /^src\/domains\/[^/]+\/pages\/.+/.test(normalized)
  );
}

function extractAddedPaths(input, cwd, root) {
  const paths = [];
  const toolInput = input.tool_input ?? {};

  if (typeof toolInput.file_path === "string") {
    const absolutePath = isAbsolute(toolInput.file_path)
      ? toolInput.file_path
      : resolve(cwd, toolInput.file_path);
    const normalized = normalizePath(absolutePath, cwd, root);

    if (!existsSync(absolutePath)) {
      paths.push(normalized);
    }
  }

  const patch =
    typeof toolInput.command === "string"
      ? toolInput.command
      : typeof toolInput.patch === "string"
        ? toolInput.patch
        : "";

  for (const match of patch.matchAll(/^\*\*\* Add File: (.+)$/gm)) {
    paths.push(normalizePath(match[1].trim(), cwd, root));
  }

  return [...new Set(paths)].filter(isPagePath);
}

function approvalFile(cwd, pagePath) {
  const projectHash = createHash("sha256").update(resolve(cwd)).digest("hex");
  const pageHash = createHash("sha256").update(pagePath).digest("hex");
  return resolve(
    tmpdir(),
    "shape-seo-page-approvals",
    projectHash,
    `${pageHash}.json`,
  );
}

function approve(cwd, pagePath) {
  const root = projectRoot(cwd);
  const normalizedInput = pagePath.replaceAll("\\", "/").replace(/^\.\/+/, "");
  const pathBase = normalizedInput.startsWith("src/") ? root : cwd;
  const normalized = normalizePath(pagePath, pathBase, root);

  if (!isPagePath(normalized)) {
    throw new Error(
      `Not an Astro page path: ${normalized}. Expected src/pages/** or src/domains/*/pages/**.`,
    );
  }

  const file = approvalFile(root, normalized);
  mkdirSync(resolve(file, ".."), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({ pagePath: normalized, approvedAt: Date.now() }),
    "utf8",
  );
  process.stdout.write(`SEO interview approved for ${normalized}\n`);
}

function hasFreshApproval(cwd, pagePath) {
  const file = approvalFile(cwd, pagePath);

  if (!existsSync(file)) {
    return false;
  }

  try {
    const approval = JSON.parse(readFileSync(file, "utf8"));
    const isFresh =
      approval.pagePath === pagePath &&
      Date.now() - approval.approvedAt <= APPROVAL_TTL_MS;

    if (!isFresh) {
      rmSync(file, { force: true });
    }
    return isFresh;
  } catch {
    rmSync(file, { force: true });
    return false;
  }
}

function consumeApproval(cwd, pagePath) {
  rmSync(approvalFile(cwd, pagePath), { force: true });
}

function blockForShapeSeo(pagePaths) {
  const formattedPaths = pagePaths.map((path) => `\`${path}\``).join(", ");
  const approvalCommands = pagePaths
    .map(
      (path) =>
        `npm run shape-seo-hook -- approve ${JSON.stringify(path)}`,
    )
    .join("\n");
  const message = [
    `New page creation detected for ${formattedPaths}.`,
    "Invoke the `shape-seo` skill at `.agents/skills/shape-seo/SKILL.md` now.",
    "Ask its single SEO intake question and deliver the brief before creating the page.",
    "After the one-question intake is complete, approve each page with:",
    approvalCommands,
    "Then retry the file creation. Do not approve the page before completing the intake.",
  ].join("\n");

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: message,
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: message,
        additionalContext: message,
      },
    }),
  );
}

async function main() {
  const cwd = process.cwd();

  if (process.argv[2] === "approve") {
    const pagePath = process.argv[3];

    if (!pagePath) {
      throw new Error("Usage: shape-seo-on-new-page.mjs approve <page-path>");
    }

    approve(cwd, pagePath);
    return;
  }

  const rawInput = await new Promise((resolveInput) => {
    let value = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      value += chunk;
    });
    process.stdin.on("end", () => resolveInput(value));
  });

  if (!rawInput.trim()) {
    return;
  }

  const input = JSON.parse(rawInput);
  const hookCwd = input.cwd ? resolve(input.cwd) : cwd;
  const root = projectRoot(hookCwd);
  const pagePaths = extractAddedPaths(input, hookCwd, root);
  const unapprovedPaths = pagePaths.filter(
    (pagePath) => !hasFreshApproval(root, pagePath),
  );

  if (unapprovedPaths.length > 0) {
    blockForShapeSeo(unapprovedPaths);
    return;
  }

  pagePaths.forEach((pagePath) => consumeApproval(root, pagePath));
}

main().catch((error) => {
  process.stderr.write(`shape-seo hook failed: ${error.message}\n`);
  process.exitCode = 1;
});
