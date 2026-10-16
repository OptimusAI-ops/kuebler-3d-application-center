# Carnival carousel / slip-ring sales story

The active scene is `scenes/carousel/Carnival.tsx`, in Application 03. Earlier filling-cell geometry and deterministic filling helpers remain as tested legacy utilities; the sales experience does not render them.

`CarouselController` retains the existing rotary ramp, angular position, reversal, direct-cable limits and contact explosion. It adds `supplyConnected` and `ridePhase`. Closed contacts and supply are required for the horse actuator phase to advance. Opening the circuit freezes that phase and extinguishes the trim lights. The independently supplied base drive keeps rotating. A paused guide freezes both clocks.

The slip ring retains its physical scale and shaft/stator mounting. Its output wire follows the rotating assembly. Amber teaching traces branch to canopy lighting and each actuator at the deck. Inspection hides the canopy to expose the interface; this is a service visualization.

Eight horses share one sculpted body geometry. Canopy bulbs use an instanced mesh. Materials and geometries are disposed with the scene. The home spotlight uses the same scene at 2 RPM, with reduced-motion support.

This is an educational electrical-actuator interpretation. Real rides may use other horse mechanisms. No configured slip-ring voltage, current, load capacity or approved ride design is claimed. The product guide links to the SR085 family.

See `docs/PRESENTATION.md` and `docs/qa/presentation/sales-verification.md`.
