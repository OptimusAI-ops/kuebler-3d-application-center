# Application 04 verification

Verified locally on 2026-10-15 against the production preview at `http://127.0.0.1:5174/#/applications/carousel`.

- `npm test`: 49 passing checks (12 carousel checks and all 37 existing conveyor/crane/shared checks).
- `npm run build`: passed TypeScript and Vite. The existing large Three.js application chunk still produces Vite's size advisory.
- Browser: stopped, 2 RPM, 6 RPM, 12 RPM, reverse feedback and controls verified. The 60-second guided sequence reached step 10 and completed automatically with the carousel running.
- Installed inspection reveals fixed and rotating interfaces, transparent housing and both teaching paths. Power and signal overlays toggle independently.
- Exploded mode separates the housing upward/backward and withdraws the contact carrier; both simulated connections become inactive. Reassembly restores active connections after the transition settles. Rotation continues independently through the stationary drive.
- Direct-cable comparison reached 90.0° and stopped; the cable remains visible with a fixed upper and rotating lower end. Switching to the slip ring resumes continuous rotation.
- Mobile at 390 × 844: no horizontal overflow; main speed is 76 px. Caption and motion status do not overlap. Temporary viewport override was reset.
- Regression browser checks: conveyor starts and reports motion; crane angle 45° survives switching to the extension route; extension 6.00 m survives switching back. No console errors during carousel and cross-application checks. Three.js emits its existing Clock deprecation advisory.

Screenshots: `overview.png`, `exploded.png`, `comparison.png`, `mobile-overview.png`, and `mobile-readouts.png`. Full-page browser capture can reflow the canvas during capture; normal viewport inspection was also performed.

The machine and internal slip-ring mechanism remain conceptual. Product references and geometry assumptions are documented in `src/carousel/README.md` and in the application.
