# Conveyor Automation — Application 01

Application 01 extends the existing shared workspace, navigation, camera controls, product panel, readouts, machine controls and guided-demo presentation. The combined crane and carnival carousel use the same workspace.

## Mechanical arrangement

A 3.6 m roller-center spacing, 0.85 m belt width and 0.160 m effective drive radius establish the educational conveyor scale. These are machine assumptions, not Kübler specifications. Four metal legs support the frame. Equal-radius drive and idler rollers carry an ideal, non-stretch belt. A geared motor connects to the negative-Z drive-shaft end.

The **solid-shaft encoder** mounts at the opposite shaft end, with its input shaft facing the machine. The machine shaft steps down to the encoder coupling diameter; a flexible coupling bridges the two coaxial shafts. The flange contacts a stationary plate, whose horizontal foot reaches back to the frame rail. The housing, flange, bracket and radial electrical cable stay stationary; only the drive shaft, coupling and encoder shaft rotate.

The shaft and measuring-wheel encoders use Sendix KIS50 exterior references, adapted from the existing photo-based geometry and finish utilities. The MWE61 assembly uses a 300 mm double O-ring wheel, pivot arm, paired springs and a frame bracket. The motor uses a separate RIM2000 magnetic ring and fixed head inside its rear end space. Product cutaways expose illustrative optical or magnetic sensing components. Their internal layout and visible disk-slot count are explanatory, not proprietary CAD or the source of the simulation resolution. See `docs/PRODUCT_REFERENCES.md` for the official references and modeling scope.

Engineering reference: Kübler's [solid-shaft encoder accessory documentation](https://www.kuebler.com/en/pdf?5000-5020_en.pdf=) describes shaft-coupling mounting accessories. This assembly is an educational installation, not manufacturer-approved construction CAD or an installation procedure.

## Authoritative state and motion

`simulation.ts` owns signed accumulated shaft angle, actual RPM, requested RPM/direction, elapsed simulation time, and belt travel. `advanceConveyor` exactly integrates piecewise linear acceleration at 30 RPM/s. Reversal first reaches zero before accelerating in the other direction. The scene reads the controller directly each frame; React receives immutable snapshots at 20 Hz.

- Shaft angular velocity: `omega = RPM × 2π / 60`.
- Ideal shaft-derived belt speed: `v = omega × 0.160 m`.
- Drive roller and shaft: same signed accumulated angle.
- Encoder input shaft and coupling: same physical rotation, with the model's reversed local shaft-axis convention accounted for.
- Idler angle: actual belt travel divided by its radius.
- Belt texture and packages: actual belt travel. Opaque packages reset at the infeed/outfeed limits to represent recirculation, without claiming a physical return transport.

The belt's rendered thin outer surface is an illustrative thickness around the ideal effective drive radius; calculations use the declared 160 mm no-stretch reference. Visible teeth, cooling fins and rotating witness marks are visual cues, not separately simulated mechanisms.

With the controlled slip scenario enabled, actual belt speed is 85% of shaft-derived speed. Both packages and the idler follow that actual speed. The shaft encoder is unaffected. This does not imply a shaft-mounted encoder can detect slip: a measuring wheel or another independent surface reference is needed to measure surface motion directly.

## Encoder and waveform semantics

1024 PPR is an **example configuration**: 1024 pulse periods per revolution per channel. Net ×1 phase counts follow the signed number of crossed pulse-period boundaries relative to reset. These are not a cumulative unsigned count of all rising edges. The internal ×4 decoder tracks signed quarter-cycle boundaries (4096 edges/revolution), but its count is intentionally omitted from the user-facing panel. Floating-point tolerance only stabilizes exact boundary results.

The panel distinguishes angular position within one revolution, accumulated revolutions, and signed shaft-derived travel since reference. An incremental encoder does not inherently retain absolute position through power loss.

A and B form the sequence `10 → 11 → 01 → 00` for forward rotation; reverse traverses that sequence backward. The waveform is explicitly time-expanded: its displayed frequency is the actual per-channel frequency divided by 256, preserving a quarter-cycle phase difference. Its phase and history derive from accumulated shaft angle, never a separate animation timer. Actual channel frequency is shown in the expandable Encoder signals section. The main readouts use a larger instrument type scale and do not expose a quadrature count. A leads B forward; B leads A in reverse under the selected wiring convention. Traces stop changing when motion stops. The view keeps at most 241 samples over approximately 2 seconds of simulation time.

## Guided demonstration

Nine steps of six simulation seconds produce the **54-second** walkthrough. The same controller advances machine motion and the demo clock. It introduces the conveyor, starts at 30 RPM, increases to 90 RPM, highlights the encoder, approaches the coupling, explains counts, reverses through zero, demonstrates phase order, then returns to overview and stops.

Pause freezes both clocks and the geometry at the same state, with a visible paused-time label. Resume continues that state. Restart establishes a new reference and repeats from rest. Exit requests a smooth stop; it preserves accumulated position. Manual motion controls interrupt the walkthrough. Camera inspection and sensor selection also interrupt the walkthrough and request a smooth stop. At natural completion the net rotation is 26.5 revolutions, giving 27,136 net ×1 phase counts.

Browser frames are limited to 50 ms of simulation advancement after long scheduling gaps. Hidden tabs do not fast-forward the machine; consequently wall-clock presentation time can exceed 54 seconds if the browser is suspended or cannot maintain 20 FPS.

## Validation

Run `npm test` and `npm run build` from the project root. Tests cover:

| Shaft speed | Belt speed, no slip | Channel frequency | Net ×1 count in 1 s | ×4 count in 1 s |
|---|---|---|---|---|
| 0 RPM | 0.000000 m/s | 0 Hz | 0 | 0 |
| 30 RPM | 0.502655 m/s | 512 Hz | 512 | 2048 |
| 60 RPM | 1.005310 m/s | 1024 Hz | 1024 | 4096 |
| 120 RPM | 2.010619 m/s | 2048 Hz | 2048 | 8192 |

Additional tests exercise ramps, reversal, frame-size independence, negative counts, stopped signal states, slip consistency, range limits, reset, demo pause/restart/exit/completion, and signal-angle linkage. Existing shared-crane and draw-wire calculation tests remain in place.

## Visual presentation and asset provenance

The operating conveyor uses 54 px speed values and approximately 30 px secondary measurements, with larger labels, a wider inspector and an optional signal disclosure. The quadrature count has been removed from the panel; decoder math is retained for signal consistency and tests.

The machine now uses beveled structural members, T-slot grooves, cast bearing housings, hex fasteners, adjustable leveling feet, a finned geared motor, a bellows-style shaft coupling, cable clips and physical metal finishes. Kraft-paper, printed parcel labels, packing tape, woven belt material and concrete textures are generated locally. All animation still reads the same controller.

Lighting and reflections use [Industrial Workshop Foundry](https://polyhaven.com/a/industrial_workshop_foundry), photographed by Dimitrios Savva and processed by Jarod Guest, from Poly Haven. This is a free **CC0** asset, bundled locally at 2K; it is not an asset authored by this project. See `public/environments/ATTRIBUTION.md` and [Poly Haven's license](https://polyhaven.com/license). No third-party asset request is needed at runtime. Soft shadows and contact shadows ground the machine; the optional engineering grid starts hidden for this application.

## Three-point sales comparison

`feedback.ts` derives wheel and motor values from the original motion state. The motor encoder is coaxial at the motor rear, before an illustrative ideal 20:1 reduction. The measuring wheel has a 300 mm circumference and rests at the rendered belt surface on a spring arm. Its motion follows actual belt travel; ideal rolling contact is assumed. `FeedbackEncoders.tsx` adds the installed geometry without changing the established belt, roller or package relationships.

`LiveInstrument` compares all three feedback locations and provides Measurements / Graphic / Raw data tabs. The differential example adds complementary A and B channels; the old internal ×4 decoding remains available to calculations but is not displayed as quadrature count. The scope is explicitly time-expanded, while raw logic uses the selected encoder's actual accumulated position.
