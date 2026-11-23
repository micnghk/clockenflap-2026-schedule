# Stage 5 — Initial Zoom Out Review

Reviewers: egm-zoom-out, egm-inventive-catalyst. Target: `docs/designs/wishlist-contrast.md` lines 1–356.

All figures below were recomputed from the document's own hex values and the shipped CSS in `index.html`.

## BLOCKER 1 — The cheapest design is absent from the alternative set

The document rejects six alternatives, and all six presuppose a muted fill. The design that changes no fill at all — keep every card at shipped strength and mark wishlisted cards with the border, ring, shadow and heart already specified — is never evaluated. It is the design the author rejected at the architecture gate, and the document does not record that rejection.

Evidence that muting is not needed for the stated contrast requirement: the shipped fills already measure 5.20–9.90:1 against the ink. The only shipped failures are the 8.5px time label on Orbit (4.32:1) and Poly*Technic (4.47:1), caused solely by `.artist-time { opacity: 0.88 }` — which this design already removes. That fix is orthogonal to muting.

Effect: Goal 3 ("visually dominant layer, measured by a documented contrast margin") is doing the work of justifying six new tokens, and it is the goal that cannot be met (see BLOCKER 2). The additive design meets Goals 1, 2 and 4 with zero new tokens.

## BLOCKER 2 — Goal 3's margin is undocumented and, where measurable, reproduces the defect used to reject Alternative B

No wishlisted-vs-muted contrast ratio appears anywhere in the document. The only published margin is `Muted vs page` (1.85–1.86:1), which measures the muted layer against the page, not against the layer it must recede from. Computed:

| Stage | Shipped | Muted | Wishlisted ÷ muted |
|---|---|---|---|
| Harbourflap | `#F6F08A` | `#BCB88D` | 1.71:1 |
| Orbit | `#F396A0` | `#D7ABAF` | **1.07:1** |
| Park | `#98F5D4` | `#98BEAF` | 1.58:1 |
| Robot | `#F9F49B` | `#BBB792` | 1.79:1 |
| Poly*Technic | `#F49CA6` | `#D5ACAF` | **1.02:1** |
| Minky Max | `#9DF4D3` | `#9ABEAF` | 1.58:1 |

Alternative B is rejected because "the measured contrast between the two layers is 1.00:1". The chosen rule produces 1.02:1 on Poly*Technic and 1.07:1 on Orbit. The document rejects a mechanism at 1.00 and adopts it at 1.02.

The contradiction is structural: muted text must hold 5.5:1, which pins the muted fill at `L* 74`, which pins its luminance within ~2 `L*` of the pink fills (Orbit 71.8, Poly*Technic 73.4). Salience on this grid is luminance; the text floor fixes luminance; the two pinks have no room to move.

Resolution that removes the contradiction rather than balancing it: stop asking the fill to report state. The wishlisted card already carries four discrete markers — 2px border, ring, shadow, heart — that the muted card does not. Measure one of those instead: border `#164234` against muted fill is 5.57:1 and against shipped Orbit 5.20:1. Fill ΔE then becomes an aesthetic preference and the chroma-ratio question disappears.

## BLOCKER 3 — Every rejection rationale attributes the decision to "the author"

Six occurrences ("Rejected by author: …"). The spec standard forbids attributing a rejection to a maintainer without linking the discussion. "The author" is undefined in the body and adds nothing to the trade-off that follows the colon.

## MAJOR 1 — Goal 2 is falsified by the chosen rule

Goal 2 says muting "does not reduce the families below their shipped separation". Measured, ΔE76: Harbourflap↔Robot 6.6 → 3.2, Orbit↔Poly*Technic 2.8 → 1.3, Park↔Minky Max 1.7 → 0.7. Every pair shrinks; two fall below the just-noticeable threshold. Chroma scaling at fixed `L*` is a contraction, so no ratio can satisfy the sentence as written.

Alternative E is rejected using "Harbourflap↔Robot falls from 3.2 to 1.7" — 3.2 is what the *chosen* rule already produces. The shipped 6.6 is omitted.

## MAJOR 2 — Identity carrier is asserted both ways

Line 67–68: "stage identity is carried by column position, not colour." Line 291: "the point of keeping the fills per stage is that a user can still tell stages apart". If position carries identity, Alternative E's rejection has no force and 0.30 is preferable (larger separation from the layer above). If colour carries identity, the chosen 0.45 already collapses Park↔Minky Max to 0.69 ΔE. The 0.45-vs-0.30 decision depends entirely on which sentence is true.

## MAJOR 3 — Mode-invariant fills invert de-emphasis in dark mode

Page tokens differ; fills do not. Against the surface the cards actually sit on (`--card-bg`: `#FAF3F3` light, `#122E25` dark):

* Muted fill vs page: **1.85:1 light, 7.14–7.19:1 dark.**
* Orbit wishlisted in dark: 6.71:1 against the page. Orbit muted in dark: 7.16:1.

In dark mode the de-emphasised card is the *more* page-salient object for the pink stages. De-emphasis by fill works only in light mode; in dark the ordering rests entirely on the border. The Accessibility section's 1.4.11 concession (1.85:1) is a light-mode fact stated as universal.

Narrow fix that preserves the single-token argument: segment the *edge*, not the fill — one mode-scoped boundary token at ≥3:1 against `--card-bg`.

## MAJOR 4 — The trigger is constant while its meaning scales with the wishlist fraction

The mute is a fixed token pair; the wishlist is variable. At one artist the mute covers the whole day; at fifteen it covers the minority. The document defers this to Open Questions and separately calls the wishlist-only filter "the honest version of focus" — acknowledging the state stops functioning while keeping the trigger.

Density adds a geometry failure: each promoted card contributes a 2px border plus a 2px ring, while `.artist-block` has `margin: 1px 2px`. The ring consumes the entire inter-column gap. With many promoted neighbours at `z-index: 5`, rings overlap and borders clip.

## MAJOR 5 — Tappability is argued with a property absent on the target device

`cursor: pointer` is invisible on touch; the document's own compatibility argument rests on "phones at a festival". The only other feedback is `.artist-block:active { transform: scale(0.98) }`, which fires after the finger lands. The blocks are `div`s with `onclick`, no `role`, no `tabindex`. A desaturated mid-tone is the standard visual grammar of a disabled control.

## MAJOR 6 — The muted state out-contrasts the wishlisted state on two stages

Muted text is 5.53–5.57:1 on all six stages. Wishlisted text is 5.20:1 (Orbit) and 5.45:1 (Poly*Technic). Size and weight are identical in both states. So on two stages the de-emphasised card is more legible than the promoted one — because `L* 74` *brightens* Orbit (71.8) and Poly*Technic (73.4).

## MAJOR 7 — The transition cannot run

`toggleCurrentWishlist()` calls `renderSchedule(currentDay)`; `renderSchedule` begins with `container.innerHTML = ''` and rebuilds every block. New elements have no previous computed style, so no transition interpolates. The same is already true of the existing `opacity 0.3s`, which is dead CSS.

## NIT 1 — The ring is invisible by construction

A `var(--bg-color)` ring on a `var(--bg-color)` page is 1.00:1. The immediate backdrop is `--card-bg`, which differs from `--bg-color` only in dark mode (1.10:1). Muted neighbours are light (`L* 74`), not dark, so the stated rationale ("the dark edge reads against a dark muted neighbour") describes a neighbour that does not exist. The border already measures 5.57:1 against muted fills.

## NIT 2 — Three smaller unaccounted consequences

1. Performance compares replacement-focus to today-neutral. The valid comparison is old focus (compositing group + per-card filter) to new focus.
2. Removing group opacity un-dims the per-card shadow (`0 1px 2px rgba(22,66,52,0.12)` currently renders at 30%). The muted layer gains elevation it never had.
3. The 0.25s transition has no `prefers-reduced-motion` guard, and none exists in the file.
