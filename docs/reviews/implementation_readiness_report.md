# Stage 9 — Implementation Readiness Test

Reviewers: egm-implementation-readiness, egm-codebase-details, egm-style. Target: lines 357–472, checked against `index.html`.

**Verdict: not executable as written.** Two instructions produce the inverse of the design or an impossible result, the file list is stale against the repo, and five verification steps have no observable pass condition.

## BLOCKER 1 — Wishlisted cards would render muted

The plan removes `background-color` from every `.stage-*` rule (lines 378–382; code `index.html:289-294`), adds `background: var(--stage-fill)` on `.artist-block` (0,1,0), and adds the focused rule `background-color: var(--stage-fill-muted, …)` at `.schedule-grid.has-wishlist .artist-block` (0,3,0). The live wishlisted rule (`index.html:264-270`) declares `opacity`, `filter`, `border`, `box-shadow`, `z-index` — and **no background**. It wins on specificity (0,4,0) but declares nothing for `background-color`, so the 0,3,0 muted declaration is the only one that applies.

Result: every card under `.has-wishlist`, wishlisted included, renders muted. That is the inverse of the design and it fails the plan's own verification step 2 ("both cards render at shipped fill").

The plan's shorthand selectors make it worse: `.has-wishlist .wishlisted` is (0,2,0) and loses to (0,3,0) outright.

Fix: state both rules verbatim, and add `background-color: var(--stage-fill);` to `.schedule-grid.has-wishlist .artist-block.wishlisted`.

## BLOCKER 2 — The fill transition cannot run, and the plan forbids the fix

`renderSchedule` does `container.innerHTML = ''` (`index.html:722`) then recreates every block. Toggle (`924`), clear (`949`) and day-switch (`979`) all call it. A new element has no previous computed `background-color`, so no transition fires; the fill paints at its final value.

The plan claims "no JavaScript changes" (359), so it cannot deliver the animation its verification step 4 requires. The same applies to the existing `border 0.3s` / `transform 0.1s`, so the "matching the existing transitions" rationale is also built on a false premise.

Fix: either (a) drop the transition change and rewrite step 4 as "the fill snaps", recording that the re-render makes a cross-fade impossible, or (b) authorize the JS change (mutate classes on existing nodes) and drop the no-JS claim.

## BLOCKER 3 — File items 2 and 5 cannot be executed

`design_draft.md` no longer exists in the repo; `docs/designs/wishlist-contrast.md` already exists at 23,729 bytes, so "(Create)" is wrong; "Step 6" occurs once and no step list exists; items 2 and 5 describe the same move twice.

Fix: mark item 2 as complete (or "Modify"), delete the Step 6 reference, delete item 5.

## MAJOR 1 — The replacement rule has no selector

"The focused fill rule" is described only by its declaration, and the preceding bullet deletes the rule whose selector it should reuse. The implementer must invent selector, specificity and file position in a 1029-line file.

## MAJOR 2 — Token names are never given and `<stage>` is not substitutable

Six bare hex values in table order. The existing tokens are lowercase (`--color-minkymax`) while the classes are `.stage-Minkymax`; `Poly*Technic` contains `*` and `Minky Max` contains a space. The audit parses these names, so spelling is load-bearing.

Fix: list six literal declarations.

## MAJOR 3 — The audit cannot catch the regression it claims to catch

"Assert every card-and-ink pair is ≥4.5:1 … this catches a typo in a token." Single-digit typos all still pass:

| Typo | vs `#164234` |
|---|---|
| `#BCB88D`→`#BCB8D8` | 5.90:1 |
| `#D7ABAF`→`#D7ABFA` | 5.96:1 |
| `#98BEAF`→`#98BEEF` | 5.88:1 |
| `#BBB792`→`#BBB729` | 5.32:1 |
| `#9ABEAF`→`#9ABEEF` | 5.90:1 |

A swapped pair also passes: all six muted fills measure 5.53–5.57:1, so any permutation satisfies the assertion while rendering the wrong stage colour. A token-name typo is masked at runtime by the plan's own fallback. And the script is throwaway, so no reviewer can rerun it.

Fix: assert expected hex per token, not just contrast; commit the check.

## MAJOR 4 — The `overflow: hidden` / `outline` mechanism claim is false

The plan says the ring "must sit outside the border box, which a `box-shadow` spread does and an `outline` inside the block's `overflow: hidden` would not." An element's own `overflow` clips its descendants, not its own `box-shadow` or `outline`; both are painted outside the border box. What clips either is a scroll/overflow ancestor (`.schedule-viewport { overflow: auto }`), which applies equally to `box-shadow`.

Fix: correct the rationale. `box-shadow` remains a valid choice, but not for the stated reason.

## MAJOR 5 — Heart badge specified three ways

Technical Plan: "1.4px `var(--bg-color)` outline behind the glyph". Detailed plan: "`var(--bg-color)` text-shadow halo of 1.5px". Style stage: "not expressible as written". Pick one mechanism and one size, in both places.

## MAJOR 6 — `mockup/` lifecycle is ambiguous

The plan says "delete before merge" in one place and lists it as a target file in another, without saying whether the deletion is part of the change or a post-merge cleanup.

## MAJOR 7 — Verification steps without observable pass conditions

* "at the narrowest viewport the app supports" — never defined; the grid is a fixed 698px with `min-width: fit-content` inside a scrolling viewport, so the margin is viewport-independent.
* "the transition animates the fill rather than snapping" — impossible (BLOCKER 2).
* "confirm the grid gains `.has-wishlist`" — no method given for inspecting the class on a phone.
* No step covers the cross-day case (wishlist artists on another day), which is the highest-probability failure.

## MAJOR 8 — Claims about `index.html` that do not hold

* `index.html:242` is cited for `color: #164234`; the colour is on 241 and 242 is `overflow: hidden`.
* The plan says `.schedule-grid` already has `transition: 0.3s` and `padding-bottom: 85px`; it has `padding-bottom: 85px` and `transition: 0.3s`, but the transition is the generic all-properties shorthand, and the per-card transitions are on `.artist-block` (248), not the grid.
* "no JavaScript changes" contradicts the Goals' "and the small render helpers".
