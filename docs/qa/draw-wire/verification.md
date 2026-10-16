# Application 03 acceptance check — 2026-10-15

- `npm test`: 37 / 37 passed. Includes existing conveyor and angle tests, plus five extension cases (0, 2, 4, 6, 8 m) across six elevations and two slew orientations, geometric cable length, drum rotation, retained overlap, clear mounting locations, smooth limits, simultaneous commands/cycles, resets and the complete extension guide.
- `npm run build`: passed. Existing large Three.js chunk warning remains; no compilation errors.
- Browser readings at 0, 2, 4, 6, 8 m: measured 0.00, 2.00, 4.00, 6.00, 8.00 m respectively. Payout displayed 0.88, 2.88, 4.88, 6.88, 8.88 m; the full reference calculation uses 0.875 m. Inclinometer remained 30.0° during these tests.
- At 8 m extension, changing elevation to 60° retained 8.00 m extension and 8.88 m displayed payout. Switching 03 → 02 → 03 preserved both 60° and 8 m; product focus changed on the same mounted crane.
- Full 65-second guide ran in the browser and ended in both-sensor mode at 45° / 2.00 m, with no runtime errors. Its lifecycle/pause/next/restart/manual interruption is covered in controller tests.
- Both automatic cycles operated at once, showing changing angle and extension. STOP ALL MOTION canceled both cycles. Hold/release, acceleration, independent stopping and limit braking are covered in controller tests.
- Transparent housing and live drum schematic inspected. Changing extension from 2.4 to 4 m changed drum angle from −72.78 to −108.33 rad, matching actual payout / 0.045 m radius.
- Fully retracted horizontal side view inspected: boom clears truck cab; cable standoff remains on the exposed tip, clear of nested boom walls. At maximum travel the telescopic stages remain connected and the cable highlight follows both physical endpoints.
- Combined view highlights both products with separate large angle/extension values. Sensor labels avoid one another in the projected view.
- 390 × 844 viewport: page and content widths both 390 px, no horizontal overflow, 76 px extension value. Temporary viewport override reset after testing.
- Conveyor browser regression: reached 60.0 RPM / 1.005 m/s, stop and application switching worked. No browser runtime errors.

Screenshots: `retracted-horizontal.png`, `mobile.png`, `mechanism.png`, `overview.png`. Product assumptions and source references are in `src/crane/README.md`.
