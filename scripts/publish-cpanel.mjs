import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpanel-wt-'));
const skipPush = process.argv.includes('--no-push');

function resolveGitBin() {
  const candidates = ['git', 'G:\\laragon\\bin\\git\\cmd\\git.exe', 'C:\\Program Files\\Git\\cmd\\git.exe'];
  for (const cmd of candidates) {
    try {
      execSync(`"${cmd}" --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error('Git executable not found in PATH or Laragon/Program Files.');
}

const gitBin = resolveGitBin();

function run(cmd, cwd = rootDir) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function runGit(args, cwd = rootDir) {
  return execSync(`"${gitBin}" ${args}`, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function hasRef(ref) {
  try {
    runGit(`show-ref --verify --quiet "${ref}"`);
    return true;
  } catch {
    return false;
  }
}

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('1/4 Building static production bundle...');
  run('npm run build', rootDir);

  if (!fs.existsSync(distDir)) {
    throw new Error('dist/ folder not found after build.');
  }

  console.log('2/4 Preparing local cpanel-build worktree...');
  try {
    runGit('fetch origin cpanel-build');
  } catch {
    // origin/cpanel-build may not exist yet
  }

  if (hasRef('refs/heads/cpanel-build')) {
    runGit(`worktree add "${tempDir}" cpanel-build`);
  } else if (hasRef('refs/remotes/origin/cpanel-build')) {
    runGit(`worktree add -b cpanel-build "${tempDir}" origin/cpanel-build`);
  } else {
    runGit(`worktree add --orphan -b cpanel-build "${tempDir}"`);
  }

  for (const name of fs.readdirSync(tempDir)) {
    if (name === '.git') continue;
    fs.rmSync(path.join(tempDir, name), { recursive: true, force: true });
  }

  console.log('3/4 Copying dist/ build output...');
  copyRecursive(distDir, tempDir);

  runGit('add -A', tempDir);
  const status = runGit('status --porcelain', tempDir);

  if (!status) {
    console.log('No changes in dist/ compared to cpanel-build.');
  } else {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    runGit(`commit -m "build: cpanel static bundle (${timestamp})"`, tempDir);
    console.log('Updated local cpanel-build branch.');
  }

  if (!skipPush) {
    console.log('4/4 Pushing cpanel-build to GitHub...');
    run(`"${gitBin}" push -u origin cpanel-build`, rootDir);
    console.log('Done! cpanel-build is live on GitHub.');
  } else {
    console.log('4/4 Skipped push (--no-push).');
  }
} finally {
  try {
    runGit(`worktree remove --force "${tempDir}"`);
  } catch {
    // ignore if worktree wasn't created
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
}
