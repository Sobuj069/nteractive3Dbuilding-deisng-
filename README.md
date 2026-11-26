# nteractive3Dbuilding-deisng-

Interactive 3D Room & Desk Setup Explorer built with **Three.js** (`OrbitControls` + `Raycaster`), **Motion** (`motion/three`), and **Vite** — ready for static **cPanel** deployment.

## Features
- **360° Interactive Orbit Controls** with smooth damping, zoom limits, and Auto-Orbit toggle
- **3D Raycaster + Floating Hotspot Pins** for 6 interactive setup items (`Monitor`, `Keyboard`, `PC Tower`, `Desk Lamp`, `Speakers`, `Chair`)
- **Motion (`motion/three`)** smooth camera fly-to animations, animated desk lamp SpotLight toggle, and glassmorphic spec popups
- **Night RGB / Daylight** studio lighting modes
- **Static cPanel-Ready Build** (`vite build` → upload `dist/` contents to `public_html`)

## Run Locally
```bash
npm install
npm run dev
```

## Build for cPanel
```bash
npm run build
```
See `CPANEL_DEPLOY.md` for cPanel upload instructions.
