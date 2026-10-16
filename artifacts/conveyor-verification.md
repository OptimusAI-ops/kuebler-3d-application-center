# Application 01 verification

Production build: passed (`tsc -b && vite build`). Vite emits the existing Three.js chunk-size advisory; no build errors.

Automated tests: 16 passed, including all four requested speeds, exact ramp integration, reversal through zero, negative counts, quadrature sequence, slip, stopped signal state, reference reset, history linkage, frame-size independence, and the guided-demo lifecycle. Existing crane and draw-wire tests remain passing.

Observed in the production browser:

- At 0 RPM: 0.000 m/s.
- At 30 RPM: 0.503 m/s; with 15% slip, actual belt speed 0.427 m/s.
- At 60 RPM: 1.005 m/s and 1024 Hz/channel.
- At 120 RPM: 2.011 m/s; with 15% slip, actual belt speed 1.709 m/s.
- Reverse requested while moving: the direction stayed Forward during braking and changed to Reverse after passing zero. Pulse counts decreased during reverse motion.
- Stop reduced RPM to zero. Reset restored the reference and controls.
- The timed demo completed naturally, returned to overview and stopped: 26.500 net revolutions, 27,136 ×1 phase counts and 108,544 ×4 counts.
- Pause at 30 RPM held the displayed RPM and pulse count unchanged across subsequent checks. Resume, restart, next and exit worked.
- The sensor close-up showed aligned drive shaft, coupling, encoder input shaft, stationary flange mount and radial cable. Simplified cutaway and housing restore worked.
- Camera presets, grid toggle, and application switching worked. Both crane views and the carousel still loaded their original contexts.
- At a 390 px browser viewport, document width remained 390 px. The mobile machine controls appear before the product panel, and the scene continued producing 60 RPM / 1.005 m/s.

The browser reports a Three.Clock deprecation from the R3F dependency. This is a library warning, not an application runtime error. No production console errors were observed during the tested flows.

## Readability and rendering revision

The visible quadrature-count row was removed. Primary desktop speed values now render at 54 px; secondary readings at 29 px. At a 390 px viewport, primary values render at 50 px and other readings at 30 px, with the document remaining 390 px wide. Encoder signals are now an optional expandable section. Resolution, units, direction, relative-reference information and slip behavior remain available.

The conveyor now uses beveled profiles, T-slots, hex fasteners, cast bearing blocks, adjustable feet, a finned geared motor, a bellows-style coupling, textured parcels and belt, a locally bundled CC0 photographic workshop HDR environment, physical metal finishes, concrete flooring, and soft/contact shadows. The encoder housing remains stationary, and the same controller still drives machine motion and readouts. Asset credit is in `public/environments/ATTRIBUTION.md`.

The 16 numerical tests still pass. Production compilation succeeds. Browser checks confirmed larger computed font sizes, absence of the quadrature-count element, the optional signal section, live 60 RPM / 1.005 m/s feedback, and 0.855 m/s actual belt speed with 15% slip.
