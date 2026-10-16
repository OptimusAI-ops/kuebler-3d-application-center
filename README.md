# Kübler 3D Application Center

A browser-only React / TypeScript industrial education platform built with Vite, Three.js, React Three Fiber, Drei, Tailwind CSS, and Lucide icons. No backend, API keys, paid assets or runtime AI calls.

## Run locally

Requires Node.js 22.13+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

For production verification:

```sh
npm test
npm run build
npm run preview
```

## Applications and scope

- **01 — Conveyor Feedback.** Three reference-based products: an RIM2000 magnetic ring and head inside the motor, a Sendix KIS50 at the drive shaft, and a spring-loaded MWE61 double O-ring measuring wheel at the belt surface. Exterior and cutaway buttons reveal each sensing principle. Compare their readings and introduce 15% belt slip. Motor feedback uses an explicit ideal 20:1 gearbox; the measuring wheel uses a 300 mm circumference and ideal rolling contact. Measurements, four-channel signal graphics and raw A/Ā/B/B̄ logic are selected with direct tabs. Existing acceleration, reversal, belt motion and shaft calculations are retained.
- **02 — Mobile Crane.** One application combines IN88 inclination and draw-wire linear position, with individual or combined selection. Both axes retain independent hold, slider, numeric and automatic controls. The existing endpoint-derived payout, nesting, cylinder geometry, sectioned drum, return spring and magnetic pickup illustration and guided stories remain. Legacy boom-angle and boom-extension URLs resolve to this application.
- **03 — The Power of Rotation.** A carnival carousel with sculpted horses, electric actuator sleeves, illuminated trim and an SR085-reference slip ring inside its central drive pedestal. Service sections open the deck, load-bearing collar and independent platform bearing; a separate product cutaway reveals the sliding contacts. Open the rotating circuit to extinguish the lights and freeze actuator motion while the independently powered base rotates. Follow power through the contacts to both the lights and actuator branches. Inspect the contacts, open the mechanism or compare a limited-turn direct cable. The verified rotary motion integration remains the underlying controller.

The customer-facing home page has a live 3D spotlight, actual-model preview images and three customer challenges. Each application includes a customer advantage, a direct proof action and a product discussion guide. See [the presentation sequence](docs/PRESENTATION.md) and [sales refresh verification](docs/qa/presentation/sales-verification.md).

See [product references and construction scope](docs/PRODUCT_REFERENCES.md) for the official product pages and mounting details used in the models.

Geometry and electrical loads are educational application examples. Product families and links support discussion; the models do not certify a configured product or installation.

## Architecture

```text
src/
  config/applications.ts          Application/product metadata and camera presets
  components/                    Shared sales home, workspace, camera, instruments and guide components
  conveyor/
    simulation.ts                Pure SI-unit physics, encoder counts and signal states
    controller.ts                Authoritative motion, signal history and demo clock
    demo.ts                      Nine 6-second guided steps
    useConveyor.ts               Immutable React snapshot subscription
    Controls.tsx                 Conveyor controls within shared MachineControls
    Readouts.tsx                 Live data and waveform within shared SensorReadouts
    geometry.ts                  Belt path and mounting geometry
    README.md                    Mechanical assumptions and validation details
  scenes/
    registry.tsx                 Machine identifier → modular scene
    ConveyorScene.tsx            Operating conveyor; reads the authoritative controller
    encoder/                     Reused exterior geometry and procedural finishes
    CraneScene.tsx               Shared articulated model for the combined crane
    crane/                       Chassis, upper structure, nested boom and IN88 exterior
    CarouselScene.tsx            Carnival carousel and mounted slip ring
    carousel/                    Mechanical parts, electrical interface and finishes
    Primitives.tsx
  carousel/                      Motion, filling state, transmission modes, comparison and guide
  crane/                         Authoritative angle/extension state, kinematics, controls, gauge and guide
  state/                         Existing reusable foundation demo and calculation helpers
```

New applications add configuration and a scene entry if needed. Keep each machine's geometry and readouts derived from one controller. Crane product selections share geometry and authoritative motion state. New feedback readings must derive from the existing motion state rather than introduce independent animation clocks.

Rendering is on demand while idle and continuous during operation, with capped device pixel ratio and 20 Hz React telemetry snapshots. Custom geometry, textures, environment maps and model resources are explicitly disposed; declarative R3F resources use automatic disposal. The 3D workspace is loaded lazily. Vite reports the expected large Three.js chunk; it is separate from the gallery.

## Vercel

Set **Root Directory** to `application-center`. The included `vercel.json` selects Vite, runs `npm run build`, and serves `dist`. Hash routes work without server rewrites. No deployment was performed.

## Verification

`npm test` runs 57 checks, including carousel speeds, reversal, bottle alignment, contact separation, fixed/rotating cable transforms, constant-length bounded direct wiring and the full 60-second guide. It also covers the four conveyor speed cases, ramps, reversal, counts, quadrature phase, stopped motion, controlled slip, reset, the complete timed demo and its lifecycle, plus all six crane elevations, five extension positions, cylinder pins/stroke, clearances, telescopic overlap, endpoint-derived cable length and drum rotation, simultaneous controls, cycles, both crane guides and existing cable-payout helpers. Browser verification covers live controls, sensor focus, cutaway, camera views, guided playback, desktop/mobile sizing, and navigation to the other applications.

The conveyor includes a locally bundled CC0 industrial HDR environment, physical metal/rubber/cardboard materials, beveled and bolted mechanical geometry, and soft/contact shadows. Asset provenance is documented in `public/environments/ATTRIBUTION.md`.
