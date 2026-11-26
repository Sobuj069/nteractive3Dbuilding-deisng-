# nteractive3Dbuilding-deisng-

Interactive **3D Architectural Building Design & Animation** website built with **Three.js** (`OrbitControls` + `Raycaster`), **Motion** (`motion/three`), and **Vite** — configured for instant static **cPanel** deployment (`cpanel-build` branch).

## Features
- **10-Story Architectural Sky Tower** with cantilevered terraces, double-height glass lobby, sky infinity pool, solar penthouse crown, and landscaped reflecting plaza
- **Floor Assembly & Exploded View Animations** powered by `motion/three`
- **3 Time-of-Day Lighting Modes** (`Golden Hour`, `Night Skyline`, `Daylight`)
- **360° Orbit + Raycaster Hotspots + Floating 2D Pins** with guided architectural specs drawer
- **cPanel Ready (`cpanel-build`)** — static build output with `.htaccess` protection & MIME types

## Run Locally
```bash
npm install
npm run dev
```

## Deploy to cPanel
```bash
npm run deploy:cpanel
```
Then inside cPanel Terminal (`~/interactive3dbuilding-deisng.smcloudit.top`), run `git pull`. See [CPANEL_DEPLOY.md](CPANEL_DEPLOY.md).
