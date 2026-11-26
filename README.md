# nteractive3Dbuilding-deisng-

Interactive **House Floor Plan to 3D Model Studio (`PlanTo3D`)** built with **Three.js** (`OrbitControls` + `Raycaster`), **Motion** (`motion/three`), and **Vite** — built for showing clients custom 3D residential homes directly from floor plans, ready for static **cPanel** deployment.

## Features
- **Interactive 2D Blueprint + 3D Cutaway Views:** Switch seamlessly between `Full House`, `1st Floor`, `Ground Plan`, and `Explode` views with animated roof/floor lifting
- **Live Plan Customizer:** Adjust Width (`ft`), Length (`ft`), Stories (`1-Story Home` / `2-Story Duplex`), Roof Style (`Flat`, `Pitched Gable`, `Roof Terrace`), Exterior Paint Swatches, and Interior Furniture live
- **Auto Area Calculation:** Calculates total `sq ft`, `Shotok`, and `Katha` along with individual room dimensions
- **360° Orbit + Room Inspection:** Click any room on the 2D blueprint or directly inside the 3D house to fly in and inspect room specs
- **cPanel Ready (`cpanel-build`):** Pure static build deployed via `git pull`

## Run Locally
```bash
npm install
npm run dev
```

## Deploy to cPanel
```bash
npm run deploy:cpanel
```
Then inside cPanel Terminal (`~/interactive3dbuilding-deisng.smcloudit.top`), run `git pull`.
