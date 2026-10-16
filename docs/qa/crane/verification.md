# Mobile crane acceptance check — 2026-10-14

- Production build: `npm run build` passed. Vite retains the existing large Three.js application chunk warning.
- Automated suite: 27 / 27 passed, including all existing conveyor tests and 11 crane tests (six individual elevation cases and five motion/geometry lifecycle checks).
- Browser at 0°, 15°, 30°, 45°, 60°, 75°: readout and accessible gauge labels matched each exact setting. Side-view captures saved alongside this file.
- Geometry: stationary pivot, sensor rigid transform, cylinder pin positions, barrel/stroke limits, cab clearance, hook clearance and telescopic overlap checked with kinematic tests; zero-angle side and maximum-angle overview inspected visually.
- Slider Home → 0°, End → 75°, Reset → 30° confirmed through live UI.
- Hold/release acceleration, lower/raise limits and smooth stopping tested through the controller. Pointer capture, cancellation, keyboard release, window blur and hidden-tab release are wired in the UI.
- Guided demo ran through its full 46 seconds in the browser and finished at 10°. UI pause held angle at 10.5° with the demo clock paused. Reset/restart/next/manual interruption are covered by controller tests.
- Automatic cycle showed both positive and negative 6°/s, and STOP CYCLE returned it to rest.
- Sensor close-up, gravity overlay and principle explanation rendered. Camera and hotspot use the moving sensor transform. Overview framing adjusts with elevated boom height; manual camera control cancels automatic framing.
- 390 × 844 mobile viewport: content width 390 px, no horizontal overflow, 76 px angle value; crane, controls and information stack correctly. Temporary viewport override reset afterward.
- Conveyor regression in browser: drive reached 60.0 RPM and 1.005 m/s; stop and application switch worked. No visible quadrature-count readout was added.
- Application 03 resolves to the same detailed CraneScene with its measurement implementation still pending.
- No browser runtime errors. Upstream Three.Clock deprecation warning remains from the renderer dependency.

The source reference and mechanical assumptions are documented in `src/crane/README.md`.
