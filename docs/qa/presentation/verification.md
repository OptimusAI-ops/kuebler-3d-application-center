# Presentation refresh verification

Verified locally on 15 October 2026 against the production preview at http://127.0.0.1:5174/.

## Architecture and scope

The existing conveyor, crane and carousel controllers remain the source of machine state. The two crane applications continue sharing their controller and scene. The refresh changes presentation components, camera paths, lighting, materials and cosmetic machine detail; it does not modify simulation, kinematics, electrical connection logic or mechanical relationships.

The shared application shell now puts the 3D view, live instrument and machine controls together. `LiveInstrument` reads the existing measurement functions. Detailed educational content is available in a dismissible native dialog. Guided narration sits below the workspace, outside the 3D canvas. Selected hotspot banners are hidden during product inspection.

Camera transitions use time-based easing, exterior approach waypoints and reduced-motion support. Sensor views continue tracking the crane mounting location. Shared lighting, existing local environment reflections and modest geometric additions improve visual consistency. No additional external asset requests are required.

## Verification

- `npm test`: all 49 tests passed.
- `npm run build`: passed TypeScript and production bundling. Vite retains its large-chunk advisory for the Three.js application bundle.
- Conveyor: start/stop, 60 RPM / 1.005 m/s readout, 15% belt-slip comparison, product inspection and guide open/close verified. Quadrature count is omitted from the visible product readings.
- Boom angle: set 45°, inspect the IN88 mounting, switch between crane products and return to overview verified.
- Boom extension: set 6 m / 45°, inspect the draw-wire housing and cable, internal mechanism, guided tour start/pause/next/exit verified. Cable payout reads 6.88 m with the existing 0.875 m reference.
- Carousel: start at 6 RPM, inspect the slip ring, connected power/signal readings, exploded view and guided-tour controls verified.
- Selected hotspot visibility is `hidden`; the product remains visible in the close-up.
- Desktop at 1280 × 720, 1176 × 755 and the browser's final 1280 × 783 viewport: page and live instrument fit without overflow. At 1280 × 650, the crane tour and instrument also fit without overflow after the compact-height adjustment.
- Portrait 390 × 844: crane overview, live readings, both axes and demo button fit on one screen. Shorter portrait screens retain vertical scrolling with a sticky machine view.
- Final browser console inspection returned no application errors.

## Visual evidence

- `conveyor-product.png`: encoder, fixed bracket, rotating coupling and live readouts.
- `inclinometer-product.png`: IN88 installation and angle readings.
- `draw-wire-product.png`: draw-wire housing, cable and extension readings.
- `slip-ring-product.png`: central slip ring, stator/rotor explanation and connections.
- `mobile-crane.png`: compact portrait workspace.

These checks validate the local browser session and existing deterministic tests. They are not a cross-device GPU benchmark or certification of the illustrative installation geometry. Frame-rate performance on the presentation hardware has not been benchmarked.
