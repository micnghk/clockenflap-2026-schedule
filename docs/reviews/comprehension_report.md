# Stage 6 — Comprehension Test

Reviewer: egm-comprehension. Target: whole file (472 lines).

## What this proposes

The app is a single `index.html` whose timetable cards are shaded by stage. Today, as soon as any artist is wishlisted, every other card is dimmed with group `opacity: 0.3` plus `grayscale(65%)`, which the document says destroys text contrast and stage colour. The proposal replaces the dim with a second, precomputed opaque background per stage — a "muted" fill derived by desaturating the shipped poster colour in CIE LCh at `L* = 74` and `C* × 0.45` — so the unfocused layer stays readable and tappable, while wishlisted cards keep the shipped fill and gain a border, a page-coloured ring, a shadow and a heart badge. The time label loses its extra `opacity: 0.88`, the hardcoded ink becomes `--card-ink`, and `.artist-block` switches between `--stage-fill` and `--stage-fill-muted` instead of changing `opacity`/`filter`. The plan claims to be CSS-only: six new tokens, six `.stage-*` rules, one new fill rule, one removed rule, and one extra shadow layer, checked by a throwaway contrast script and manual Safari/Chrome passes.

## How the existing system works, per this document

`renderSchedule(day)` sets `.has-wishlist` on the grid whenever `wishlist.size > 0` and renders each artist as one element carrying both `artist-block` and a stage class, so the same node holds the stage background and the card text. Ink is hardcoded `color: #164234`, and `.artist-time` adds `opacity: 0.88`. The dim rule at `index.html:260-263` sets `opacity: 0.3` and `filter: grayscale(65%)` on every card, with `.wishlisted` overriding `opacity: 1; filter: none` plus a 2px border, a shadow and `z-index: 5`. Dark mode changes only page-level tokens, never `--color-*`, so card fills stay light pastels in both modes.

## Findings

### 1. BLOCKER — the stated goal is falsified by the document's own table

Goal 2 (lines 64–70) says muting "does not reduce the families below their shipped separation", two sentences after saying "stage identity is carried by column position, not colour". Recomputing ΔE76 on the document's own hexes, every pair is reduced, not preserved: Park↔Minky Max 1.7 → 0.7; Orbit↔Poly*Technic 2.8 → 1.3; Harbourflap↔Robot 6.6 → 3.2. Minimum cross-family distance falls from 42.5 to 18.9. CUJ 3's "stage colours remain distinguishable" is unsatisfiable at 1.3 and 0.7. The paragraph also self-cancels: if identity is positional, Problem failure #2 and Goal 2 are not requirements at all. "Hue families" is never defined; membership must be inferred from the pairs.

### 2. BLOCKER — the two competing background rules have no selectors or source order

The plan says to add `background-color: var(--stage-fill-muted, var(--stage-fill))` without naming the selector, and says the `.has-wishlist .wishlisted` rule keeps its border and adds a shadow — but never says it must declare `background-color`. The real rules are `.schedule-grid.has-wishlist .artist-block` (specificity 0,3,0) and `.schedule-grid.has-wishlist .artist-block.wishlisted` (0,4,0). The wishlisted rule does not currently set a background because nothing needs to override one. An implementer following the plan literally ships wishlisted cards with the muted fill. The diagram's `.has-wishlist .wishlisted` (0,2,0) loses to 0,3,0 outright.

### 3. MAJOR — the goal promises a documented layer margin; two stages have none

The only documented margin is ΔE from the shipped fill (19.2–34.1), a Lab distance, not a contrast ratio. Actual wishlisted-vs-muted contrast: Poly*Technic 1.02:1, Orbit 1.07:1, Park/Minky 1.58:1, Harbourflap 1.71:1, Robot 1.79:1. At 1.02:1 there is no luminance separation; dominance rests on border, ring and shadow. Alternative B is rejected for yielding none of this margin.

### 4. MAJOR — the accessibility trade is mode-blind, and the 3:1 bound is wrong by ~8 L* points

"The muted fill is 1.85:1 against the page" is the light-mode value only; against the dark page the same fills are 7.84–7.89:1, above the threshold. At `L* 66` the fill is 2.38:1 against `#FAF3F3`, not 3:1; 3:1 requires `L* ≈ 58`, where text is 3.32:1. The stated bound understates the conflict.

### 5. MAJOR — the WCAG 1.4.11 mitigation does not exist

"Cell boundaries remain visible through the existing 1px grid lines" is false. `.grid-line` is a horizontal hour line at `z-index: 1` beneath opaque cards at `z-index: 2`, so cards cover it. There are no vertical cell boundaries; adjacent cards are separated only by the 1–2px `--card-bg` margin. In light mode `--border-color` is 1.51:1 against the page.

### 6. MAJOR — JavaScript scope contradicts itself

Goals: "confined to CSS and the small render helpers". Detailed plan: "There are no JavaScript changes". Non-Functional: "a CSS edit plus no JavaScript". Two statements exclude JS, one includes it; no helper is named.

### 7. MAJOR — "L* = 74 is the highest muting" is inverted

Lower `L*` is *more* muting, so 74 is the least muting in the tested set. `L* 68` yields 4.59–4.62:1, which satisfies the only stated threshold (4.5:1), yet is rejected on an unstated margin policy. A reader cannot reproduce the choice or audit a future palette change.

### 8. MAJOR — the six values are unlabelled and the audit cannot detect mis-assignment

Six bare hex strings with no stage keys; the reader must infer table order. All six muted fills give 5.53–5.57:1 against the ink, so any permutation passes the stated audit. Swapping Harbourflap `#BCB88D` and Robot `#BBB792` (ΔE 1.0 apart) is invisible to the verification and visibly wrong on screen.

### 9. MAJOR — the display-name → token/class mapping is absent and not derivable

The table says `Harbourflap`, `Poly*Technic`, `Minky Max`; the code has `--color-harbourflap`, `--color-polytechnic`, `--color-minkymax` and `.stage-Polytechnic`, `.stage-Minkymax`. `<stage>` cannot be substituted literally: `Poly*Technic` contains `*` and `Minky Max` contains a space. A naive implementer writes `.stage-Poly*Technic`.

### 10. MAJOR — the ring's stated job is impossible and dark mode is the case it does not solve

A ring in `var(--bg-color)` cannot "read against the page" — it is the page colour. Muted neighbours are light, not dark, and the dark border already contrasts 5.55:1 with them. In dark mode `--bg-color` `#0E261E` differs from the grid `--card-bg` `#122E25` by 1.10:1, so the ring matches neither the page nor the immediate backdrop.

### 11. MAJOR — the heart badge is specified two different ways

Wishlisted emphasis: "1.4px `var(--bg-color)` outline behind the glyph". Detailed plan: "a `var(--bg-color)` text-shadow halo of 1.5px". Different mechanism, different size. In light mode the halo is the same family as the fill and adds nothing.

### 12. MAJOR — "regenerable" is promised but the colour pipeline is not pinned

CIE LCh does not fix the white point (D50 vs D65), the RGB matrix, the gamut-clipping policy or the rounding step. All change the resulting hex. ΔE76 is used as a decision input without being defined.

### 13. MAJOR — dangling cross-reference

"The value is unchanged for now (see Open Questions on the official palette)." Open Questions contains only single-wishlist behaviour; the palette is discussed under Palette provenance and Future Improvements.

### 14. MAJOR — the wishlist-only filter is claimed to be evaluated and is not

Non-Goals: "This is evaluated as an alternative and not adopted here." Alternatives A–F contain no filter. The idea appears only under Future Improvements.

### 15. NIT — the diagram uses a descendant selector for a single element

`.artist-block .stage-X` means "a stage-X descendant of an artist-block" and does not match `class="artist-block stage-X"`. The custom properties would not resolve and the card would lose its background.

### 16. NIT — five undefined project-local terms

"muted", "ring", "neutral", "stage fill", "fill" are all used before definition. No glossary.

### 17. NIT — undefined references

"Step 6" (no step procedure in the document), `--muted-base` (appears nowhere else, not a token in the code), "Export" (a pen.dev command the reader cannot locate).

### 18. NIT — `background` vs `background-color`, and "matching" transition timings

The two sections use different properties. The existing transitions are `border 0.3s` and `transform 0.1s`; 0.25s matches neither.

### 19. NIT — the dark-mode Problem measurement is not reproducible

"The name text measures 1.00–1.27:1 in dark mode" does not reproduce; sRGB compositing gives 1.64–2.27 against `#0E261E` and 1.66–2.29 against `#122E25`, the surface the cards actually sit on. The document states no measurement pipeline.

### 20. NIT — the verification step has an undefined viewport and no remediation

"At the narrowest viewport the app supports" is never defined; the grid is a fixed 698px with `min-width: fit-content` inside a scrolling viewport, so the margin is viewport-independent. With a 2px ring on a 2px margin, contact is the expected outcome and no fallback is given.

### 21. NIT — two target-file entries describe the same action twice

`docs/designs/wishlist-contrast.md` (Create) and `design_draft.md` (Delete) both describe the document's own publication, not a code change. `design_draft.md` no longer exists.
