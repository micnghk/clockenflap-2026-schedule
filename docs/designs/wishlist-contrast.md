# Wishlist Muting with a Dark Ink

*   **Author:** yellowcandle
*   **Status:** Proposed
*   **Date:** 2026-11-23

--------------------------------------------------------------------------------

## Overview

`index.html` is a single-file, offline timetable for Clockenflap 2026. Tapping a
card opens a modal that adds the artist to a wishlist stored in `localStorage`.
While that wishlist is non-empty, the grid switches to a focus state: every
non-wishlisted card fades, and wishlisted cards keep full strength.

The fade is `opacity: 0.3` plus `filter: grayscale(65%)` on `.artist-block`
(`index.html:260-263`). Measured against the surface the cards sit on
(`--card-bg`, `#FAF3F3` light and `#122E25` dark), that state leaves card text at
1.42–1.71:1 in light mode and 1.65–2.27:1 in dark. The minimum for text this size
is 4.5:1.

This design replaces the fade with a second opaque fill per stage, derived by
desaturating the shipped fill to `L* 60` at 45% chroma, and darkens the card ink
to the official site value `#001A14`. The ink change is what makes muting
possible: at the shipped ink `#164234`, a 4.5:1 text floor caps the muted fill at
`L* ≥ 67.2`, where the layer is only 1.02–1.07:1 away from the wishlisted card.

## The Problem

The focus state destroys the timetable it is meant to help you read.

1.  **Text contrast collapses.** Non-wishlisted name text measures 1.42–1.71:1 in
    light mode and 1.65–2.27:1 in dark; the 8.5px time label carries its own
    `opacity: 0.88` (`index.html:279-282`) and falls to 1.36–1.59 and 1.56–2.08.
    Both are far below 4.5:1.
2.  **Stage identity erodes.** `grayscale(65%)` removes the hue that separates the
    three stage families, and the opacity blend pulls all six fills toward the
    page.
3.  **The focus state is all-or-nothing, and cross-day it is worse.**
    `.has-wishlist` is set from the global `wishlist.size` (`index.html:716-720`)
    before the day filter, while `.wishlisted` only applies to blocks on the
    rendered day (`index.html:784-786`). Wishlist Friday artists, tap Saturday,
    and the whole Saturday grid is muted with **zero** promoted blocks. The only
    escape is clearing the wishlist.
4.  **The wishlisted baseline itself fails on two stages.** With `opacity: 1` and
    no filter, `--color-orbit` yields 4.32:1 and `--color-polytechnic` 4.47:1 for
    the time label — the only two that fail, and they fail because of the label's
    own `opacity: 0.88`, not the fill.

Dark mode is not an additional defect. Faded cards measure *better* in dark mode
than in light (1.65–2.27 against 1.42–1.71) because a 30% light card composites
toward a dark grid while the faded glyph composites faster. What dark mode does
have is a different problem, addressed below: with mode-invariant light fills,
the muted layer can become the more page-salient object.

## Goals

*   Every card's artist name and time label measure 4.5:1 or better in both
    light and dark mode, in both states. Muted text lands at 5.70–5.73:1;
    wishlisted text at 8.36–15.93:1.
*   The wishlisted card is separated from its muted neighbour by a documented
    luminance margin of at least 1.45:1 on every stage, and by a state cue that
    itself clears 4.5:1 against the wishlisted fill.
*   Cross-family stage separation survives muting: every pair from different
    families stays above 20 ΔE76 (measured minimum 21.6).
*   Tapping any card, in any state, opens the modal for that artist.
*   The change stays inside `index.html`: CSS plus three small JavaScript edits
    (day-scoped trigger, unused class removal, storage guard). No runtime
    dependency, no build step. One development-only check script is added under
    `tools/`.

## Non-Goals

*   No change to the six shipped stage fills. Their hex values are the poster
    artwork and are untouched.
*   No migration of the page, brand or header tokens to the official site
    palette. Only the card ink changes.
*   No hide-non-wishlisted filter. It is the honest focus mode for a large
    wishlist and is recorded under Future Improvements.
*   No grid geometry change, no modal change, no theme toggle.
*   No transition on the fill. The grid is rebuilt on every wishlist change, so a
    fill transition cannot run; the document does not claim one.

## Decisions

*   **Card ink is `#001A14`, not `#164234`.** This is the single decision that
    makes muting possible. At `#164234` the 4.5:1 floor pins the muted fill at
    `L* ≥ 67.2` and the layer margin cannot exceed 1.15:1 on Orbit. At `#001A14`
    the floor moves to `L* ≥ 52.6`, and `L* 60` yields 1.47:1 on the same stage.
    The ink is the official site token, so this also reduces palette drift.
*   **Stage identity is carried by column position and the sticky stage header,
    not by hue.** Cross-family hue is a secondary cue and is preserved; within-
    family pairs (Orbit/Poly*Technic, Park/Minky Max, Harbourflap/Robot) are
    already within 1.7–6.6 ΔE of each other in the shipped palette and cannot be
    separated by muting. Muting shrinks them further, which is accepted and
    measured rather than claimed otherwise.
*   **The trigger is day-scoped.** `.has-wishlist` is applied only when at least
    one artist on the rendered day is wishlisted.

## Critical User Journeys (CUJs)

### CUJ 1: Read the timetable around a small wishlist

*   **Given**: Two artists are wishlisted on Friday.
*   **When**: Friday renders.
*   **Then**: Both wishlisted cards keep their shipped fill with a 2px ink
    border, shadow and heart; every other card renders at its muted fill with
    text at 5.70–5.73:1 and a layer margin of at least 1.47:1 from the cards it
    sits beside.

### CUJ 2: Extend the wishlist from the muted layer

*   **Given**: The focus state is active.
*   **When**: The user taps a muted card.
*   **Then**: The modal opens for that artist and "Add to Wishlist" is available.

### CUJ 3: Cross-day

*   **Given**: Only Friday artists are wishlisted.
*   **When**: The user switches to Saturday.
*   **Then**: Saturday renders at full strength. No card is muted, because the
    trigger counts wishlisted artists on the rendered day.

### CUJ 4: Dark mode parity

*   **Given**: The device is set to dark appearance.
*   **When**: Friday renders with a wishlist.
*   **Then**: Muted cards measure 4.57–4.60:1 against the dark card surface and
    wishlisted cards 6.71–12.78:1, so the wishlisted layer remains the more
    salient one.

### CUJ 5: Clear the wishlist

*   **Given**: Any set of wishlisted artists.
*   **When**: The wishlist is cleared.
*   **Then**: The grid returns to shipped fills at full strength with no border,
    shadow or heart, and the fill snaps rather than animating.

## Technical Plan (Architecture)

The focus state becomes a property of the fill: each stage carries two opaque
backgrounds, and the grid switches between them. Text contrast is then decided by
the fill alone, so it can be measured per stage instead of depending on whatever
the page background does.

```text
renderSchedule(day)
  ├─ dayData = rawData.filter(d === day)
  ├─ wishlistedOnDay = |wishlist ∩ dayData| > 0   → .has-wishlist on the grid
  └─ per artist → .artist-block .stage-X [.wishlisted]
                        │
.stage-X                                  → --stage-fill, --stage-fill-muted
.artist-block                             → background: var(--stage-fill)
.schedule-grid.has-wishlist .artist-block → background: var(--stage-fill-muted)
.schedule-grid.has-wishlist .artist-block.wishlisted
                                          → background: var(--stage-fill)
```

The wishlisted rule must redeclare `background-color`. It wins on specificity
(0,4,0 against 0,3,0) but specificity does not inherit declarations: without the
redeclaration the muted rule is the only background that applies, and wishlisted
cards render muted. This is the single easiest way to implement the design
backwards.

### Tokens

```text
:root
  --card-ink: #001A14
  --color-harbourflap-muted: #969269
  --color-orbit-muted:      #AF868A
  --color-park-muted:       #74988A
  --color-robot-muted:      #95926E
  --color-polytechnic-muted:#AE878A
  --color-minkymax-muted:   #75988A
```

The six shipped `--color-*` tokens are unchanged. Token names use the existing
lowercase convention (`--color-polytechnic`, `--color-minkymax`), not the display
names (`Poly*Technic`, `Minky Max`), because `*` and spaces are not valid CSS
identifiers.

### Muting rule

Hold hue, set `L* = 60`, scale `C* × 0.45`, convert to sRGB with a D65 white
point, clamp channels to [0,1], round per channel. `L*` fixes luminance, so the
chroma ratio trades hue recognisability against the ΔE distance from the shipped
fill; 0.45 keeps every stage at least 23 ΔE away.

| Stage | Shipped fill | Muted fill | Wishlisted text | Muted text | Layer margin | Shipped→muted ΔE76 |
|---|---|---|---|---|---|---|
| Harbourflap | `#F6F08A` | `#969269` | 15.33:1 | 5.71:1 | 2.68:1 | 43.8 |
| Orbit | `#F396A0` | `#AF868A` | 8.36:1 | 5.70:1 | 1.47:1 | 23.8 |
| Park | `#98F5D4` | `#74988A` | 14.12:1 | 5.70:1 | 2.48:1 | 36.2 |
| Robot | `#F9F49B` | `#95926E` | 15.93:1 | 5.71:1 | 2.79:1 | 42.7 |
| Poly*Technic | `#F49CA6` | `#AE878A` | 8.77:1 | 5.73:1 | 1.53:1 | 23.4 |
| Minky Max | `#9DF4D3` | `#75988A` | 14.09:1 | 5.71:1 | 2.47:1 | 35.5 |

"Wishlisted text" is `#001A14` on the shipped fill; "muted text" is `#001A14` on
the muted fill; "layer margin" is the shipped fill against the muted fill.

`L* 60` is chosen for the darkest legal muted value with margin: the 4.5:1 floor
sits at `L* 52.6`, so text has 1.2:1 of headroom at 60 and the layer margin is
1.47 at worst. `L* 56` would lift the layer margin to 1.67 and the card-to-page
boundary to 3.30:1 (clearing WCAG 1.4.11) but drops text to 5.00:1, which is
recorded in Alternatives C.

### Page and mode

| Measure | Light (`#FAF3F3`) | Dark (`#122E25`) |
|---|---|---|
| Muted fill vs card surface | 2.89–2.91:1 | 4.57–4.60:1 |
| Shipped fill vs card surface | 1.04–1.98:1 | 6.71–12.78:1 |

The ordering that matters holds in both modes: a shipped fill is always more
salient against the surface than its muted counterpart. This is what the shipped
design breaks in dark mode, where a 30% pastel card lands closer to the page than
its neighbour.

### Wishlisted emphasis

*   2px solid `--card-ink` border, plus `border: 2px solid transparent` reserved
    on the base rule so selection does not shift the content box by 4px.
*   `box-shadow: 0 6px 16px rgba(0, 26, 20, 0.38)`.
*   `z-index: 5`.
*   11px heart badge with a 1.5px `#FFFFFF` text-shadow halo, so it reads on all
    six shipped fills in both modes.

No coloured ring. The previous draft proposed a 2px `--bg-color` ring; measured,
that is 1.00:1 against a `--bg-color` page, and the muted neighbours it was meant
to separate from are mid-tone, not dark. The border already measures 8.36–15.93:1
against the shipped fills.

### Text

`.artist-time` loses `opacity: 0.88` and uses `--card-ink`. With the alpha in
place the label measures 4.32:1 on Orbit and 4.47:1 on Poly*Technic; without it
it carries the same contrast as the name. Hierarchy comes from size (8.5px vs
10px) and weight (600 vs 800).

### Mode invariance

Fills and ink are mode-invariant; the page and chrome follow
`prefers-color-scheme`. A dark card variant would be a second palette with no
artwork behind it. The measured consequence is the table in "Page and mode":
ordering holds, boundary margins differ.

## Alternatives Considered

### Alternative A: Additive emphasis, no muting

*   **Mechanism**: leave every card at its shipped fill; mark wishlisted cards
    with the border, shadow and heart only.
*   **Pros**: meets the text floor trivially (5.20–9.90:1 at the old ink), no new
    tokens, no rule that can render backwards.
*   **Cons**: the field never recedes, so with many wishlisted cards the grid is
    uniformly saturated and the cue is the only separation.
*   **Reason for Rejection**: the focus state stops being a focus state. It is
    the fallback if the muted fills are rejected on appearance, and it needs no
    measurement work.

### Alternative B: Muting at the shipped ink `#164234`

*   **Mechanism**: the chosen rule with `--card-ink` left at `#164234`.
*   **Pros**: no ink change; text 5.53–5.57:1 at `L* 74`.
*   **Cons**: the 4.5:1 floor pins the fill at `L* ≥ 67.2`, where the layer margin
    is 1.02–1.07:1 on the pink stages — the noise floor for a flat field. Lowering
    `L*` to buy margin breaks the text floor: `L* 60` gives 2.89:1 text.
*   **Reason for Rejection**: the ink is a free variable and holding it fixed
    makes the two goals mutually exclusive for two of six stages.

### Alternative C: `L* 56` instead of `L* 60`

*   **Mechanism**: the chosen rule at a darker target.
*   **Pros**: card-to-page 3.30:1, clearing WCAG 1.4.11 for the muted boundary;
    layer margin 1.67–3.18:1.
*   **Cons**: muted text drops to 5.00:1 and the muted cards read as dark slabs
    rather than tinted paper.
*   **Reason for Rejection**: 5.00:1 leaves 0.5 of margin on 7.5px type, and the
    1.4.11 gain is on a decorative boundary, not the text the design exists to
    fix. Retained as the option if 1.4.11 is a hard requirement.

### Alternative D: Chroma-only muting

*   **Mechanism**: hold `L*` at the shipped value, scale chroma only.
*   **Pros**: text contrast preserved exactly.
*   **Cons**: luminance identical to the wishlisted card, so the layer margin is
    1.00:1 and the boundary falls back to the page.
*   **Reason for Rejection**: no measurable separation between the layers.

### Alternative E: Mix each fill toward the page

*   **Mechanism**: interpolate 55% toward `--bg-color`.
*   **Pros**: high text contrast (7.12–10.05:1).
*   **Cons**: fills land at 1.03–1.40:1 against the page, so block edges dissolve
    and the grid reads as an empty page with two cards on it.
*   **Reason for Rejection**: swaps one unreadable state for another.

### Alternative F: Runtime `color-mix()`

*   **Mechanism**: `background: color-mix(in oklab, var(--stage-fill) 58%, var(--muted-base))`.
*   **Pros**: no token matrix; follows palette edits.
*   **Cons**: Safari 16.2+, with non-SRGB interpolation fixed in 16.4; older
    iPhones need an `@supports` fallback, a second visual system to maintain.
*   **Reason for Rejection**: a compatibility branch is worse than six static
    values.

### Alternative G: Hide non-wishlisted blocks

*   **Mechanism**: a toggle that removes every non-wishlisted card.
*   **Pros**: no muted layer at all; strongest focus; dissolves the cross-day
    problem and the layer-margin question.
*   **Cons**: removes the surrounding programme, needs new UI and an empty state.
*   **Reason for Rejection**: out of scope; recorded under Future Improvements.

--------------------------------------------------------------------------------

## Non-Functional Requirements

### Performance

`opacity` on the card forced a compositing group and `filter` forced a per-card
paint pass. Both are deleted. The muted state is one opaque background swap with
no compositing, so the focus state paints less than the current focus state does.

### Accessibility

Card text measures 5.70–5.73:1 muted and 8.36–15.93:1 wishlisted, in both modes.

Three gaps remain, stated rather than implied fixed:

*   **Card boundary vs page**: muted fills measure 2.89–2.91:1 against the light
    page, 0.1 below the 3:1 non-text threshold. `L* 56` clears it at 3.30:1 and is
    Alternative C. Wishlisted fills are 1.04–1.98:1 against the page — unchanged
    from the shipped design, which already failed this.
*   **Viewport zoom**: `<meta name="viewport" ... maximum-scale=1.0,
    user-scalable=no>` blocks zoom on 8.5px text. Removing it is a larger
    legibility win than any colour change here, and it is out of scope only
    because it changes the whole page's gesture behaviour.
*   **Keyboard**: the blocks are `div`s with `onclick`, no role and no tabindex.

### Rollout

Single static file, no build step, no flag. Revert is `git revert` of one commit.
The ink change alters every card's text weight, so the first check after deploy
is a visual pass on the neutral state.

--------------------------------------------------------------------------------

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Wishlisted rule omits `background-color` | Every wishlisted card renders muted — the feature inverted | Both selectors and both declarations are written verbatim in the plan; verification step 2 checks a wishlisted card's computed background |
| `localStorage` read throws (private mode, corrupt JSON) | Blank timetable before first render | Wrap the parse in `try`/`catch`, start from an empty wishlist |
| Day-scoped trigger misses an artist | The grid stays neutral when it should fade | Trigger is computed from the same `dayData` array that renders the blocks, so the two cannot disagree |
| Muted fill reads as disabled on touch | Users do not tap the faded layer | Cards keep their click handler; the muted fill is mid-tone (2.90:1 against the page), not a 30% wash; verification step 3 taps a muted card |
| Ink change alters text weight app-wide | Visual regression on the neutral grid | Checked against the mockup; the ink is one token and reverts with the commit |
| Card boundary misses WCAG 1.4.11 by 0.1 | Strict accessibility failure | Recorded; `L* 56` is the documented escape hatch |

Security: static file, no network calls, no authentication, no user-supplied
HTML. The only stored value is a list of artist IDs under
`clockenflapWishlist2026`. No exposure to mitigate.

--------------------------------------------------------------------------------

### Additional Resources

*   Official brand palette: `www.clockenflap.com` Squarespace tokens
    (`--black-hsl: 166.15,100%,5.1%` → `#001A14`, `--lightAccent-hsl` → `#FF6571`).
    This design adopts the ink only.
*   Editable mockup: `webui.pen`; export boards with the app's Export
    command when a visual is needed (exports are not committed).
*   Mobbin references used while drafting: Toggl Track calendar, Premier League
    fixture grid.

### Future Improvements

*   **Hide-non-wishlisted filter**: the honest focus mode for a large wishlist.
*   **Full palette migration**: adopting the site surface `#B3FFEA` and coral
    `#FF6571` would raise text-on-fill contrast and lower the card-to-page
    boundary margin, which is already the weakest number here.
*   **Remove `user-scalable=no`**: the largest single legibility win available.
*   **Responsive grid geometry**: landed separately in `12151bf`
    (`repeat(6, minmax(var(--col-width), 1fr))`), so the "no grid geometry
    change" non-goal above still reads true of this design — it did not include
    that change. The contrast figures here are colour-only and unaffected by
    column width; what the wider columns change is how much text wraps inside a
    card.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

One runtime file changes, plus a development-only check script. Six new colour
tokens and one ink token; no new selectors beyond the existing stage classes.

### Target Files to Create/Modify

#### 1. `index.html` (Modify)

*   **Type / Scope**: single-file HTML app — `<style>` block plus three small
    JavaScript edits.
*   **Proposed Changes**:
    *   **`:root`** — add `--card-ink: #001A14` and the six
        `--color-<stage>-muted` tokens from the Technical Plan table. Leave the six
        shipped `--color-*` values untouched.
    *   **Dark-mode block** — add no stage values. The fills and ink are
        mode-invariant by design; a comment records why so a later editor does not
        "fix" the omission.
    *   **Six `.stage-*` rules** — replace `background-color: var(--color-X)`
        with two custom properties, `--stage-fill: var(--color-X)` and
        `--stage-fill-muted: var(--color-X-muted)`.
    *   **`.artist-block`** — set `background-color: var(--stage-fill)`,
        `color: var(--card-ink)`, and `border: 2px solid transparent`. The
        reserved border prevents a 4px content-box shift when a card is selected.
    *   **Delete** `.schedule-grid.has-wishlist .artist-block` (the `opacity: 0.3`
        and `filter: grayscale(65%)` rule). No part of it survives.
    *   **Add** `.schedule-grid.has-wishlist .artist-block { background-color:
        var(--stage-fill-muted, var(--stage-fill)); }`, placed after the
        `.artist-block` rule.
    *   **`.schedule-grid.has-wishlist .artist-block.wishlisted`** — keep the
        existing border, shadow and `z-index: 5`; **add**
        `background-color: var(--stage-fill, transparent);`; delete `opacity: 1`
        and `filter: none`, which no longer have anything to override; delete the
        existing `border` colour literal in favour of `--card-ink`; raise the
        shadow to `0 6px 16px rgba(0, 26, 20, 0.38)`.
    *   **`.artist-block.wishlisted::after`** — 11px heart, 1.5px `#FFFFFF`
        text-shadow halo.
    *   **`.artist-time`** — delete `opacity: 0.88`; set `color: var(--card-ink)`.
    *   **`.artist-block` transition** — remove `opacity` from the list; keep
        `transform 0.1s` and `border 0.3s`. Do not add a `background-color`
        transition: `renderSchedule` rebuilds the grid, so it would never run.
    *   **`renderSchedule`** — compute `dayData` before the class toggle and set
        `.has-wishlist` only when at least one rendered artist is in the wishlist.
        This is the cross-day fix. Reuse `createId` so the comparison uses the same
        identifiers as `.wishlisted`.
    *   **Delete** the old `wishlist.size > 0` toggle (`index.html:716-720`).
    *   **`localStorage` read** (`index.html:705`) — wrap the `JSON.parse` in
        `try`/`catch` returning an empty array.

#### 2. `tools/check-contrast.mjs` (Create)

*   **Type / Scope**: development check script, not loaded by the page.
*   **Proposed Changes**: parse the six `--color-*` and six `--color-*-muted`
    values plus `--card-ink` from `index.html`; assert each token equals its
    expected literal (so a swap or typo fails); assert every muted and shipped
    fill against the ink is ≥4.5:1; print the layer margin per stage. Rationale:
    a contrast-only assertion passes every single-digit typo (all six muted fills
    measure 5.70–5.73:1) and every permutation of the six fills.

#### 3. `docs/designs/wishlist-contrast.md` (Modify)

*   **Type / Scope**: documentation.
*   **Proposed Changes**: this document. `docs/reviews/` holds the review record
    for the muted-token designs that preceded it.

#### 4. `webui.pen` (Modify)

*   **Type / Scope**: design source and generated exports.
*   **Proposed Changes**: the two "after" boards show muted fills with the new
    ink; exports regenerate from the canvas on every change and are removed before
    merge.

### Verification Plan

*   **Build**: none. Open `index.html` from disk.
*   **Token audit**: `node tools/check-contrast.mjs`. Expected: twelve token
    literals match, twelve ink pairs at or above 4.5:1 (muted 5.70–5.73,
    wishlisted 8.36–15.93), layer margins 1.47–2.79.
*   **Computed-style check (the cascade trap)**: with a wishlist active, read
    `getComputedStyle` on a wishlisted card and assert its `backgroundColor`
    equals its shipped fill, not its muted one.
*   **Dead-code check**: `grep -n "has-wishlist" index.html` returns only the
    day-scoped toggle; `grep -n "opacity: 0.3\|grayscale" index.html` returns
    nothing.
*   **Behavioural (manual, Safari and Chrome)**:
    1.  Clear `localStorage`, load: every card at its shipped fill, no borders.
    2.  Wishlist two Friday artists: both gain a 2px ink border, the larger
        shadow and a heart; every other card renders muted and legible.
    3.  Tap a muted card: the modal opens for that artist.
    4.  Switch to Saturday with only Friday artists wishlisted: no card is muted.
    5.  Clear the wishlist: fills snap back to shipped; no layout shift, because
        the border box is reserved.
    6.  Repeat 2–4 with dark appearance.
*   **Visual check**: export the two after-boards from `webui.pen` and compare
    against the shipped page; do not commit the exports.
*   **Density check**: with ten or more wishlisted cards, confirm the muted layer
    still reads as secondary and the hearts remain distinguishable at 390px.
