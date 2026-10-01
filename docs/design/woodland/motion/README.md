# Ambient motion

Clouds move in one direction across the sky, with their reset outside both viewport edges. Desktop periods are 220/260 seconds; mobile/tablet periods are 120/160 seconds. Two clouds use different starting phases. The clipped decorative container prevents horizontal page overflow.

Only two oak crowns and small grass highlights move on desktop (one crown and shrubs on mobile). Crowns move 1 SVG unit over 8 seconds and back over 8 seconds; grass uses 10 seconds each way. Water highlight strokes move 3 SVG units and change opacity from 0.6 to 0.9 over 6 seconds each way. Stepped timing retains the quiet, coarse pixel appearance. Trunks, cottage, ground, shoreline, and all reading content stay still.

CSS performs the motion. A small IntersectionObserver and visibilitychange listener pause it offscreen or in hidden documents; there is no render loop, timer, new dependency, layout animation, or filter. Hidden responsive artwork has its animations disabled. Reduced-motion removes every scenery animation and keeps clouds in static visible positions.

## Evidence

- `390/820/1440-start.png` and corresponding `-5s.png`: actual elapsed-time screenshots; mobile/tablet use touch/mobile emulation.
- `motion-390/820/1440-0.png` and corresponding `-12.png`: before/after desktop Chromium viewport samples used for the performance measurement.
- `performance.json`: Chrome DevTools Performance metrics during three approximately 12-second samples. Zero layout operations; about 0.007–0.008 seconds of main-thread task time and under 0.001 seconds of style recalculation per sample. Five active CSS animations on mobile/tablet, seven on desktop. Reading-panel rectangles remain identical. Cloud travel was 49/92/90 pixels respectively. This is a limited headless Linux measurement, not a zero-cost claim or a GPU/battery benchmark.
- Regression tests at 390/820/1440 verify actual cloud, leaf, and water progress, stationary reading geometry, cloud loop endpoints offscreen, no horizontal overflow, offscreen pause/resume, and fully static reduced-motion. Existing footer and archive tests remain in the full suite.

Physical iOS devices and actual background-tab suspension were not exercised. Visibility handling is event-based; no polling is added. Existing Library transfer limitations remain, so these files provide review evidence in the draft PR.
