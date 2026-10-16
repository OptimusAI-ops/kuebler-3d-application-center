# Product construction and mounting verification — 15 October 2026

## Automated checks

- `npm test`: 57 passed, 0 failed.
- `npm run build`: TypeScript and production bundle passed. Existing shared Three.js bundle size advisory remains.
- New construction checks: 300 mm wheel rolling contact and parcel-lane clearance; product cutaway preserves motion and circuit state; all four installed supply/output cable curves clear the floor and interface fits below the carousel deck.
- Existing motion, encoder channels, slip, crane kinematics, guides and rotating-load tests remain passing.

## Browser checks against production preview

- Conveyor: motor inside enclosure; RIM magnetic ring, fixed head and cable visible in motor section; running feedback reaches 1200 RPM at 60 roller RPM through the existing 20:1 demonstration ratio. Raw A/Ā and B/B̄ remain complementary. Wheel cutaway shows optical disk, electronics and spring-loaded mount. Shaft section retains coupling and frame mounting.
- Crane: IN88 mounting inspected at 45 degrees, matching its reading. Draw-wire section shows drum, return spring and magnetic pickup; setting 4 m gives 4.00 m extension with 4.88 m endpoint-derived payout at 30 degrees. Both legacy measurement demonstrations remain in the combined crane application.
- Carousel: exterior product is enclosed in the pedestal; service cuts expose independent bearing and adapter. Product cutaway leaves electrical contact closed. Opening rotating supply gives OPEN/OFF/STOP for circuit/lights/actuators while platform drive remains RUN; reconnect restores supply. Exploded view independently opens contacts.
- Guided carousel playback starts and pauses. At 1280 × 650, document height equals viewport height, with readings and controls visible together. Crane at 45 degrees also fits this viewport without page scrolling.
- Home previews regenerated from the final exterior scenes. No new application runtime errors during final verification. Browser history contains an earlier stale module-load error while preview assets were being rebuilt; reload recovered it. Three.js emits its existing Clock deprecation notice.

## Scope

Official photographs and published envelope data inform the exteriors. Internal constructions are functional illustrations, not proprietary CAD or manufacturer-approved installation drawings. Sources and mounting intent are recorded in `docs/PRODUCT_REFERENCES.md`.
