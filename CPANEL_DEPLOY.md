# cPanel Live Deployment Guide

This project builds to a pure static bundle inside `dist/`, so it works on any standard cPanel hosting plan without Node.js running on the server.

## Steps to Go Live on cPanel

1. **Build the production files** (already generated in `dist/`):
   ```bash
   npm run build
   ```
2. **Zip the contents inside `dist/`** (make sure `index.html`, `.htaccess`, and `assets/` are at the root of the zip—not wrapped inside an outer `dist/` folder).
3. **Upload to cPanel**:
   - Open **cPanel → File Manager → `public_html`** (or a subfolder like `public_html/3d`).
   - Click **Upload**, upload the `.zip` file, and click **Extract**.
4. **Done!** Visit your domain (e.g. `https://yourdomain.com` or `https://yourdomain.com/3d`) to view the live 3D room.

> **Note:** `public/.htaccess` is automatically copied into `dist/.htaccess` during `npm run build` to enable GZIP compression, asset caching, and `.glb`/`.gltf` MIME types if you add custom 3D models later.
