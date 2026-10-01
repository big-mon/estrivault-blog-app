# Ambient motion

Clouds move in one direction across the sky, with their reset outside both viewport edges. Both now advance exactly one CSS pixel every 500 milliseconds: 2 pixels/second and 2 position updates/second. Travel distance is the viewport width plus the cloud width; step count and duration are calculated once on load and on resize, never in a rendering loop. Two clouds use different starting phases. The clipped decorative container prevents horizontal page overflow. At 390/820/1440px, periods are 245/460/820 seconds respectively.

Only two oak crowns and small grass highlights move on desktop (one crown and shrubs on mobile). Crowns move 1 SVG unit over 8 seconds and back over 8 seconds; grass uses 10 seconds each way. Water highlight strokes move 3 SVG units and change opacity from 0.6 to 0.9 over 6 seconds each way. Stepped timing retains the quiet, coarse pixel appearance. Trunks, cottage, ground, shoreline, and all reading content stay still.

CSS performs the motion. A small IntersectionObserver and visibilitychange listener pause it offscreen or in hidden documents; there is no render loop, timer, new dependency, layout animation, or filter. Hidden responsive artwork has its animations disabled. Reduced-motion removes every scenery animation and keeps clouds in static visible positions.

## Evidence

- `390/820/1440-start.png` and corresponding `-5s.png`: actual elapsed-time screenshots; mobile/tablet use touch/mobile emulation.
- Historical measurements from the faster-cloud commit `36a25a0`: `motion-390/820/1440-0.png` and corresponding `-12.png`: before/after desktop Chromium viewport samples used for the performance measurement.
- Historical `performance.json` (commit `36a25a0`): Chrome DevTools Performance metrics during three approximately 12-second samples. Zero layout operations; about 0.007–0.008 seconds of main-thread task time and under 0.001 seconds of style recalculation per sample. Five active CSS animations on mobile/tablet, seven on desktop. Reading-panel rectangles remain identical. Cloud travel was 49/92/90 pixels respectively. This is a limited headless Linux measurement, not a zero-cost claim or a GPU/battery benchmark.
- Regression tests at 390/820/1440 verify actual cloud, leaf, and water progress, stationary reading geometry, cloud loop endpoints offscreen, actual 1px steps at approximately 2Hz, no horizontal overflow, offscreen pause/resume, and fully static reduced-motion. Existing footer and archive tests remain in the full suite.

Physical iOS devices and actual background-tab suspension were not exercised. Visibility handling is event-based; no polling is added. Existing Library transfer limitations remain, so these files provide review evidence in the draft PR.

## Slower cloud cadence comparison

`cloud-cadence-before.json` and `cloud-cadence-after.json` contain actual position samples every approximately 50ms for six seconds at each width. Both clouds are sampled, with content geometry and overflow checks. The before sample uses commit `36a25a0`. The after sample uses the one-pixel/500ms settings. Small rate differences from exactly 2Hz reflect the finite measurement window. No universal retro-game frame rate is implied: this controls only decorative cloud position updates, not browser rendering or scrolling.

| Width | Before px/s (left / right) | Before updates/s (left / right) | Before step size | After px/s and updates/s (both) | After step size |
| ----- | -------------------------- | ------------------------------- | ---------------- | ------------------------------- | --------------- |
| 390   | 4.03 / 3.02                | 2.63 / 1.97                     | 1.531px          | 1.96                            | 1px             |
| 820   | 7.57 / 5.68                | 2.63 / 1.98                     | 2.875px          | 1.97                            | 1px             |
| 1440  | 7.57 / 6.58                | 3.78 / 3.29                     | 2px              | 1.97                            | 1px             |
