# Shared mobile crane

Applications 02 and 03 are live and share one mounted `CraneScene`, controller, Canvas and motion state. Changing between their hash routes changes product focus without rebuilding the machine. Both products and control axes are available from either route.

## Geometry and coordinates

All distances are metres. The truck longitudinal direction is +X, up is +Y, and the inspected boom side is +Z. The level chassis remains stationary. A separate Y-axis superstructure group provides the future slew hierarchy. The boom rotates about local Z at `CRANE.pivot = [-1, 2.8, 0]`.

`CraneController.motion.boomAngleDegrees` is the authoritative elevation. 0° is horizontal; 0–75° is an illustrative machine range, not an IN88 specification. Initial/reset elevation is 30°; the guide begins at 10°. Motion uses a 6°/s demonstration speed, acceleration/deceleration and bounded travel. Frame updates use substeps up to 1/120 second, with browser deltas capped at 50 ms. Hidden tabs do not advance. A paused guide freezes both geometry and its clock. React takes immutable telemetry snapshots at 20 Hz.

The sensor belongs to the base-boom group at `CRANE.sensorMount`. Its mounting offset is explicitly zero; the same kinematic transform drives the hotspot and close-up camera. Selection draws a world-horizontal line and an arc, while the gravity illustration stays vertical. The IN88 reads orientation relative to gravity, not a mechanical link. The demonstration assumes quasi-static, level-ground conditions and does not simulate vibration or inertial sensor filtering.

Two hydraulic cylinders connect the fixed upper-structure lower pins to transformed boom upper pins. Each cylinder group aligns to that vector every frame; the barrel stays fixed length while the chrome rod and upper eye track the pin distance. Over 0–75°, pin distance stays above the barrel length and the exposed stroke remains shorter than the barrel. The lower boom edge clears the truck cab and roof beacons at 0°. The operator cab is beside the boom sweep. A winch feed, boom hoist cable, tip sheave and vertically suspended hook represent an unloaded hoist.

## Telescopic geometry and measurement

`boomExtensionMeters` is independent of elevation, with an illustrative 0–8 m travel. Both stages translate; no boom mesh is scaled. Initial/reset extension is 2.4 m; RESET EXTENSION smoothly retracts only the telescopic axis to zero. The extension guide starts retracted. Hold controls use a 0.65 m/s maximum demonstration speed and 0.5 m/s² acceleration with braking at limits. Angle and extension automation can run simultaneously and stop independently.

- Base section: local X 0–6 m.
- Middle section: X = 0.35 + extension / 2; length 5.6 m. Minimum overlap 1.65 m.
- Inner section: X = 0.7 + extension; length 5.2 m. Minimum overlap with the middle section 1.25 m.
- The inner group is a child of the middle group; its local offset subtracts the middle offset.
- A fixed sensor housing at `[5.3, -0.11, 0.43]` mounts near the front of the base boom. Its exit is `[5.375, -0.065, 0.43]` in boom coordinates.
- The attachment on the inner-stage tip head is `[5.55, -0.065, 0.43]` in inner-section coordinates. Its standoff stays ahead of the nested walls even when retracted; it never passes through either enclosing boom section.
- Both ends share Y/Z coordinates in the boom frame. The straight cable remains outside the widest collar (Z = 0.43 m versus a 0.37 m outer half-width), clear of the hoist cable on the boom centerline.

`drawWireReadout()` transforms both endpoints into world coordinates and calculates their Euclidean distance. Retracted reference payout is calculated from the same geometry with extension set to zero, at the current elevation/slew. **Extension = current payout − reference payout.** Thus elevation or slew cannot masquerade as telescopic displacement. Reference payout is 0.875 m and maximum payout is 8.875 m, distinct from overall boom length.

The physical cable uses an illustrative 0.9 mm diameter. Selection adds a screen-width cyan highlight for visibility, without changing its path or measurement. Its mount and moving anchor stay bolted to the actual sections.

## Draw-wire reference and teaching mechanism

Official family reference: https://www.kuebler.com/en/products/measurement/linear-measuring-systems/product-finder/product-details/D125

Checked 2026-10-15: the official product page lists a 124 × 124 × 94 mm envelope, 6–10 m family measuring-length choices, M12 connection and 1 m/s maximum speed. The linked datasheet redirected to the document finder during implementation; exact mounting-hole locations and a compatible order code were not confirmed. The black housing and encoder pod follow the product image and approximate envelope, with a separate illustrative bracket. The UI explicitly says **Kübler Draw-Wire Encoder · Conceptual Application**. The teaching model assumes 10 m cable capacity, sufficient for its 8.875 m maximum external payout; it does not assert a validated product configuration.

SHOW INTERNAL MECHANISM makes the installed housing translucent and reveals a drum, decreasing/increasing single-layer winding and coupled encoder. A separate labeled schematic shows the return-spring principle. These are conceptual internals, not a manufacturer construction drawing.

A constant effective radius of 45 mm is used: `drumRadians = -cablePayout / radius`. The sign follows pulling +X at the drum's +Y tangent. Retraction reverses rotation. Wound cable remaining is `10 - cablePayout`, using a 0.95 mm illustrative winding pitch. The helix's tiny axial contribution is neglected in the declared constant-radius teaching model. Spring drawing deformation explains energy storage/tension without claiming calibrated spring force or exact internal geometry. Drum, cable and schematic all read the same motion state, with no independent animation clock.

The 12-step extension guide takes 65 seconds: overview, nested structure, 3 m extension, cable highlight, sensor location, close-up, mechanism, 6 m extension, live measurement, retraction to zero, machine view and simultaneous sensor overview. It finishes at 45° elevation and 2 m extension. Pause freezes both axes and its clock.

## IN88 source

Official product page: https://www.kuebler.com/en/products/measurement/inclinometers/product-details/IN88

Checked 2026-10-14: published metal housing envelope 60 × 80 × 23 mm and M12 connections. The official product image informed the silver casting, mounting ears, white label with orange strips and two connectors. No usable CAD was available through the product page's download service during implementation. The mesh is an illustrative exterior using the published envelope; the bracket, ear shapes, label, pins and cable routing are simplified, not a manufacturer CAD model. No exact mounting-hole spacing is asserted. The product reference link is also available in the application panel.

The shared local industrial HDR and its CC0 attribution are in `public/environments/`. Crane paint, metal, rubber and concrete use procedural PBR textures; no external runtime asset calls.

## Verification

`npm test` includes 0, 15, 30, 45, 60 and 75° orientation and sensor checks, stationary pivot, cylinder attachment and stroke, cab clearance, hook clearance, telescopic overlap, extension independence, hold/release/reversal, slider/reset actions, cycle/stop, guide pause/end and numerical integration. Existing conveyor tests run in the same suite. The complete suite also covers all five requested extension positions at six elevations and two slews, cable/drum calculations, clearances, simultaneous commands, limit braking, cycles and the 65-second guide. Browser QA exercises both sensor panels, state-preserving navigation, cutaway, guides, controls and mobile layout. Captures are in `docs/qa/crane/` and `docs/qa/draw-wire/`.

Elevation contributes to machine geometry and load-moment management. A single inclinometer does not determine lifting safety; actual lifting depends on additional measurements, conditions, controls and certified systems. This is an educational unloaded crane model.
