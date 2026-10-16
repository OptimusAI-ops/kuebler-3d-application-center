# Sales experience refresh — 15 October 2026

This refresh supersedes the earlier four-application presentation layout. The active collection now contains three customer stories.

## Architecture reviewed and implemented

- One authoritative controller per machine. Existing conveyor integration, crane kinematics and carousel rotary integration remain intact.
- `conveyor/feedback.ts` derives motor and measuring-wheel readings from the original shaft/belt state. It declares the ideal 20:1 reduction, 300 mm wheel circumference, 1024 PPR and ideal wheel rolling contact.
- `FeedbackEncoders.tsx` adds a coaxial motor-rear encoder and a spring-arm measuring wheel at the belt edge. The original coupled shaft encoder remains installed.
- `LiveInstrument.tsx` provides direct sensor selection, Measurements / Graphic / Raw data tabs and a customer proof action. Differential graphics and sampled A/Ā/B/B̄ values are implemented in `InstrumentViews.tsx`.
- One combined crane route offers inclination, draw-wire or both. Legacy crane routes resolve to it.
- The carnival scene uses the existing rotary controller with new supply and actuator-phase states. Lights and actuator motion require a closed rotating circuit. The base drive remains independently supplied. Physical teaching traces connect the stator, rings and rotor to lighting and actuator branches.
- The home spotlight reuses the real scenes at gentle speeds. Reduced-motion preferences stop the automatic spotlight motion. Card images are local renders of the actual models.
- The desktop instrument spans the workspace height alongside the canvas and its controls. Selected product markers stay hidden during inspection.

## Automated verification

- `npm test`: 54 passed, 0 failed.
- `npm run build`: TypeScript and production bundling passed.
- Existing tests cover conveyor ramps, reversal, pulse/count relationships, slip, crane geometry and independent axes, carousel integration, contact separation, direct-cable limits and guided-demo timing.
- Added tests cover gearbox/wheel derivation, wheel detection of slip, complementary raw channels, open-circuit actuator hold with continuing platform rotation, contact reassembly, tour pause and the combined crane route aliases.
- Vite retains a large-chunk advisory for the shared Three.js scene bundle. Model, image and environment assets are served locally; no external runtime asset dependency was added.

## Browser verification

- Home: all three local images loaded; spotlight selector updates the destination and rendered machine. Application navigation works.
- Conveyor: all three physical encoder views work. At 60 shaft RPM, motor feedback reads 1200 RPM and the surface comparison reads 1.005 m/s before slip. With 15% slip, the wheel reads 0.855 m/s while motor/shaft estimates stay 1.005 m/s. Graphic and Raw data display all four differential channels.
- Wheel inspection: corrected the bracket depth so the housing and cable remain visible rather than being hidden by the support plate.
- Crane: 45° and 6 m display together, with 6.88 m cable payout. Individual draw-wire inspection, internal mechanism, combined selection and simultaneous automatic axes verified.
- Carousel: start, disconnect, reconnect, inspection, power overlay, exploded contacts, direct-cable comparison, restore-slip-ring controls and guided start/pause/next/exit verified. The power-loss state shows lights OFF and horse actuators STOPPED while platform RPM remains positive.
- Desktop 1280 × 720: no page scroll; measurement, graphic and raw content end above the sales actions. The instrument and controls remain visible together.
- Desktop 1280 × 650 with a paused guide: no page scroll; instrument content ends before the proof/action controls. The guide sits below the scene rather than covering the product.
- Portrait 390 × 844: no horizontal overflow or panel overlap. The portrait layout uses vertical scrolling with a sticky machine view.
- Final runtime console inspection returned no application errors.

## Presentation artifacts

- `conveyor-wheel-sales.png`: visible measuring-wheel installation and three-way slip comparison.
- `carnival-energy-sales.png`: rotating carousel, energy flow and customer proof action.
- `sales-home.png`: live spotlight and revised customer-facing home page.
- `docs/PRESENTATION.md`: suggested five-minute owner presentation.

The installation geometry, electrical loads and horse actuators are illustrative. No application certification or configured product rating is asserted. Browser verification is not a GPU benchmark across presentation hardware.
