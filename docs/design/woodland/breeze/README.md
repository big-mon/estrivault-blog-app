# Visible, localized breeze and ripples

The cloud cadence remains one CSS pixel every 0.5 seconds. This refinement changes only plant details and water.

- Tree trunks and crown silhouettes are fixed. Small leaf-color patches shift 0 → 1 → 2 → 3 SVG pixels and back in a repeating 3-second cycle (four held positions in each 1.5-second leg). At mobile/tablet scale the total excursion is 3 CSS pixels; at full desktop scale it is 6 CSS pixels.
- Sparse grass clusters use the same three-pixel excursion over a 4-second round trip. The right-side foliage has a phase offset so both sides do not move in lockstep.
- Two groups of water highlights move 0 → 6 SVG pixels and back over six seconds, with seven held integer-pixel positions in each three-second leg. The second group is offset by 1.5 seconds. Opacity stays between 0.8 and 1, avoiding disappearance or flashing. Mobile ripple strokes are three pixels high instead of two so the narrow water band remains legible. Shorelines and the water body stay fixed.
- All movement uses existing CSS transforms/opacity. Reduced motion removes it; offscreen and hidden-document pause behavior is retained. No dependency, timer, or rendering loop was added.

## Visual and regression evidence

The five actual elapsed-time screenshots for each width (390, 820, 1440) show approximately 0, 1.5, 3, 4.5, and 6 seconds. `observations.json` records geometry and computed transforms at each capture. They include the full reading area to make its stationary position reviewable.

The browser regression samples actual motion for six seconds at each width. It checks that the selected leaf and water details are within the visible scene, cover their full 3/6 SVG-pixel excursion, and leave tree silhouettes and reading-panel geometry stationary. Existing cloud cadence, loop endpoints, reduced-motion, offscreen pause, overflow, archive, notes, and footer checks remain in the full suite.

These are headless Linux Chromium captures, not a physical iOS test. Perceptibility is supported by visible paired frames and measured movement, not a claim about every observer or device. Existing Library transfer restrictions remain; images are committed for review in the draft PR.
