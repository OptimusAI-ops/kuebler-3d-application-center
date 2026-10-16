# Kübler application experience — presentation run

Open http://127.0.0.1:5174/ on the presentation laptop. The local server must be running (`npm run build`, then `npm run preview -- --port 5174`). All scene assets are local.

## Suggested 5-minute sequence

1. **Home — 20 seconds.** “Small components. Extraordinary impact.” Choose **Find the slip**. The three stories connect the customer challenge to a visible Kübler advantage.
2. **Conveyor — 90 seconds.** Start the belt. Select **Motor**, **Shaft**, then **Belt** to inspect the three installations. Motor selection opens the motor section: its RIM2000 magnetic ring is on the internal shaft with a fixed sensing head. Use **Exterior / Cutaway** for the KIS50 optical mechanism and MWE61 wheel assembly. Choose **Prove it: introduce belt slip**. At 60 shaft RPM, the drive estimate stays 1.005 m/s while belt travel falls to 0.855 m/s. The measuring wheel exposes the difference. Switch directly between **Measurements**, **Graphic** and **Raw data** to show A, Ā, B and B̄. Restore grip before moving on.
3. **Crane — 60 seconds.** Choose the single **Mobile Crane** application. **Both** puts angle and extension together; individual selections zoom into the IN88 or draw-wire installation. **Move both axes together** starts the two automatic cycles. Select **Draw-wire → Cutaway** to expose the cable drum, return spring and magnetic pickup. Use **STOP ALL MOTION** before leaving.
4. **Carnival carousel — 90 seconds.** Start the carousel and point out the lights and rising horses. **Disconnect rotating power**: the lights go dark and the horses hold position, while the separately powered platform keeps turning. Reconnect. Inspect the slip ring inside the central drive pedestal. The deck and independent load-bearing collar open for access; **Exterior / Cutaway** opens the product itself. Enable the amber power path. Explain fixed supply → brush → conductive ring → rotating loads. **EXPLODED VIEW** opens the contacts; **WHY USE A SLIP RING?** compares the limited turn of a direct cable. Restore the slip-ring arrangement.
5. **Close — 20 seconds.** “Where does the customer need to know motion or position, and what needs to stay connected while rotating?” Use the product guides to discuss the real installation and appropriate Kübler configuration.

## Engineering context

- Existing conveyor and crane motion calculations are retained. Added motor and wheel values derive from that same authoritative state.
- Demonstration assumptions: ideal 20:1 gearbox, 300 mm measuring-wheel circumference, 1024 PPR and ideal rolling contact. Optional drive-to-belt slip is 15%.
- The carnival uses the verified carousel rotation controller with added circuit and actuator states. Lights require a closed interface. Horse motion represents electrical actuators on the rotating assembly; actual ride mechanisms vary.
- The slip-ring model and mounting are illustrative; the demo does not assert a rated load, voltage, exact order code or approved amusement-ride design.
- The older boom-angle and boom-extension URLs resolve to the single combined crane experience.

## Product references

- [Kübler measuring wheel systems](https://www.kuebler.com/en/products/measurement/linear-measuring-systems/measuring-wheel-systems)
- [Kübler encoders](https://www.kuebler.com/en/products/measurement/encoders)
- [Kübler IN88](https://www.kuebler.com/en/products/measurement/inclinometers/product-details/IN88)
- [Kübler SR085](https://www.kuebler.com/en/products/transmission/slip-rings/product-details/SR085)

The modeled exteriors follow the official product photographs. Internal sections explain function rather than reproduce proprietary construction. See [the product reference record](PRODUCT_REFERENCES.md).
