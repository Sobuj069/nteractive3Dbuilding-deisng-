# cPanel Live Deployment Guide (`git pull` Auto-Deploy)

Because shared cPanel servers often do not have Node.js/npm in the terminal, this project keeps a dedicated **`cpanel-build`** branch on GitHub containing **only** the compiled static output from `dist/` (`index.html`, `.htaccess`, `assets/`).

## One-Time Setup in cPanel Terminal

Inside your domain document root (for example `~/interactive3dbuilding-deisng.smcloudit.top`):

```bash
cd ~/interactive3dbuilding-deisng.smcloudit.top
[ -f .htaccess ] && mv .htaccess .htaccess.bak
git init -b cpanel-build
git remote add origin https://github.com/Sobuj069/nteractive3Dbuilding-deisng-.git
git fetch origin cpanel-build
git checkout -f -B cpanel-build origin/cpanel-build
git branch --set-upstream-to=origin/cpanel-build cpanel-build
```

## Updating Later

1. On your local PC, rebuild & push the `cpanel-build` branch:
   ```bash
   npm run deploy:cpanel
   ```
2. In cPanel Terminal, simply pull:
   ```bash
   cd ~/interactive3dbuilding-deisng.smcloudit.top
   git pull
   ```
