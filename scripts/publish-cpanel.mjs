import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpanel-build-'));

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

  console.log('2/4 Preparing cpanel-build branch...');
  const remoteUrl = runGit('remote get-url origin');
  const hasRemoteBranch = (() => {
    try {
      return Boolean(runGit('ls-remote --heads origin cpanel-build'));
    } catch {
      return false;
    }
  })();

  if (hasRemoteBranch) {
    run(`"${gitBin}" clone --branch cpanel-build --single-branch "${remoteUrl}" "${tempDir}"`, rootDir);
    // Remove old files cleanly except .git
    for (const name of fs.readdirSync(tempDir)) {
      if (name === '.git') continue;
      fs.rmSync(path.join(tempDir, name), { recursive: true, force: true });
    }
  } else {
    run(`"${gitBin}" init -b cpanel-build "${tempDir}"`, rootDir);
    runGit(`remote add origin "${remoteUrl}"`, tempDir);
  }

  // Copy local Git identity if configured
  try {
    const userName = runGit('config user.name');
    const userEmail = runGit('config user.email');
    if (userName) runGit(`config user.name "${userName}"`, tempDir);
    if (userEmail) runGit(`config user.email "${userEmail}"`, tempDir);
  } catch {
    // use global git config
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
    console.log('4/4 Pushing cpanel-build to GitHub...');
    run(`"${gitBin}" push -u origin cpanel-build`, tempDir);
    console.log('Done! cpanel-build is live on GitHub.');
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
