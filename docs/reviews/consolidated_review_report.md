# Consolidated Review — `docs/designs/wishlist-contrast.md`

Five stages, ten Goldfish reviewers, no shared context. Every numeric claim below was recomputed from the document's hex values and `index.html`.

**Verdict: not publishable.** The document's central goal cannot be met by its chosen mechanism anywhere in the parameter space, its headline measurements do not reproduce, one implementation step renders the feature backwards, and a case the document never mentions breaks the feature outright.

## What the review found, by severity

| # | Finding | Sources |
|---|---|---|
| B1 | Goal 1 and Goal 3 are mutually exclusive for Orbit and Poly*Technic across the entire legal `L*` range (max layer margin 1.15:1 at the darkest legal fill) | Z8, D, C, S |
| B2 | Goal 2 is falsified by every stage pair; Park↔Minky Max collapses to 0.7 ΔE | Z5, C, D, S, K |
| B3 | The headline dim-state numbers do not reproduce, and dark mode is the *better* case, not the worse | S, D, K |
| B4 | Following the plan literally renders **wishlisted** cards muted | R, R2, S2, K |
| B5 | The alternative set omits both the no-muting design (actually rejected at the gate) and the wishlist-only filter (claimed as evaluated) | Z5, Z8, D, K |
| B6 | The cross-day case mutes a whole day with zero promoted cards | D, Z8 |
| B7 | The fill transition cannot run; the plan's no-JS constraint forbids the fix | C, D, S, Z8, R |
| B8 | No Risks & Mitigations section, and the missing-token fallback it would document is false | T, D, R |
| B9 | The ring is 1.00:1 against its own field, targets the wrong token, and collides with neighbours at depth | Z5, D, S, K |
| B10 | Identity carrier is asserted both ways, and the 0.45-vs-0.30 decision depends on which is true | D, Z8, K |

Legend: Z5 zoom-out (stage 5), C inventive-catalyst, K comprehension, D design, T structural, S style (stage 7), Z8 zoom-out (stage 8), R implementation-readiness, R2 codebase-details, S2 style (stage 9).

## Blockers

### B1 — The goals are mutually exclusive, not merely mis-parameterised

Ink `#164234` has relative luminance Y = 0.0431. A 4.5:1 text floor requires fill Y ≥ 0.3692 (`L* ≥ 67.2`). That is the darkest a muted fill can ever be while satisfying Goal 1, so it is the *best case* for layer separation. At that extreme:

| Stage | Shipped Y | Max possible wishlisted ÷ muted |
|---|---|---|
| Orbit | 0.434 | **1.15:1** |
| Poly*Technic | 0.458 | **1.21:1** |
| Park / Minky Max | 0.767 | 1.95:1 |
| Harbourflap | 0.838 | 2.12:1 |
| Robot | 0.872 | 2.20:1 |

A 2:1 margin on Orbit needs `L* ≈ 51`, where text is 2.60:1. The chosen point measures 1.02–1.07:1. Alternative B is rejected at 1.00:1.

### B2 — Goal 2 is false as written

ΔE76, shipped → muted: Harbourflap↔Robot 6.6 → 3.2; Orbit↔Poly*Technic 2.8 → 1.3; Park↔Minky Max 1.7 → 0.7. Chroma scaling at fixed `L*` is a contraction; no ratio satisfies "does not reduce below their shipped separation".

### B3 — The evidence in The Problem is wrong

Shipped stack, measured against `--card-bg` (the surface cards sit on), with `0.88` applied only to `.artist-time`:

| | Document | Correct |
|---|---|---|
| Light names | 1.34–1.59 | **1.42–1.71** |
| Light time | 1.26–1.49 | **1.36–1.59** |
| Dark names | 1.00–1.27 | **1.65–2.27** |
| Dark time | 1.07–1.17 | **1.56–2.08** |

Dark mode is the better case because the faded card darkens toward the dark grid while the faded glyph darkens faster. The document's light range matches a model where the filter does not paint the text; its dark range matches text-versus-page rather than text-versus-card. The qualitative conclusion (badly broken) survives; the "near 1.0:1" motivating the dark-mode section does not.

### B4 — The cascade renders the feature backwards

`.schedule-grid.has-wishlist .artist-block` (0,3,0) sets the muted fill. `.schedule-grid.has-wishlist .artist-block.wishlisted` (0,4,0) sets border, shadow and z-index but **no background**. Specificity wins, declaration is absent, so wishlisted cards inherit the muted fill. The plan's shorthand `.has-wishlist .wishlisted` (0,2,0) is worse — it loses outright.

### B5 — The alternative set is incomplete in two load-bearing ways

* The design with no muting at all — every card at shipped fill, wishlisted marked by border, shadow and heart — was rejected at the design gate and is not recorded. It meets Goals 1, 2 and 4 with zero new tokens, and the border already measures 5.20–9.90:1 against the shipped fills.
* Non-Goals says the wishlist-only filter "is evaluated as an alternative"; no such alternative exists. The exclusion is load-bearing: with a hide-non-wishlisted toggle there is no muted layer, so the tokens, the LCh rule, the alpha change and Goal 3 all disappear.

### B6 — The cross-day mute

`has-wishlist` is set from the global `wishlist.size` before the day filter; `.wishlisted` only applies to blocks on the rendered day. Wishlist Friday artists, tap Saturday: the entire Saturday grid is muted with zero promoted blocks and no way out but clearing the wishlist. CUJ 1 has no counterpart for this, and it is the more likely failure for a three-day festival.

### B7 — The transition is dead code

`renderSchedule` empties the grid (`innerHTML = ''`) and recreates every block; toggle, clear and day-switch all call it. New nodes have no previous computed background, so `background-color 0.25s` never interpolates. The existing `border 0.3s` / `transform 0.1s` are dead for the same reason, so "matching the existing transitions" is also false.

### B8 — No risk section, and the stated fallback is false

`feature-spec-standard.md` requires failure modes, security, scalability and mitigations. None is present. The fallback claim ("a stage added without a muted token renders at full strength") fails: the stage rules set `background-color` today and no `--stage-fill`, so `var(--stage-fill-muted, var(--stage-fill))` with both undefined is invalid at computed-value time and the card becomes transparent. Also unhandled: `new Set(JSON.parse(localStorage.getItem(...)))` has no `try`/`catch`, so private mode or corrupt JSON throws before first render and blanks the timetable.

### B9 — The ring

`--bg-color` on the `--bg-color` page is 1.00:1 — invisible by construction. The grid's actual backdrop is `--card-bg`; in dark mode the two differ by 1.10:1, so the ring matches neither. Muted neighbours are light (`L* 74`), not dark. The ring consumes the 1–2px inter-column gap, so at depth it collides with promoted neighbours.

### B10 — Identity carrier asserted both ways

"Stage identity is carried by column position, not colour" (L67–68) versus "the point of keeping the fills per stage is that a user can still tell stages apart" (L291). If position, the 0.30 ratio rejected in Alternative E costs nothing and is preferable (larger layer separation). If colour, the chosen 0.45 already collapses Park↔Minky Max to 0.69 ΔE.

## Major findings

| # | Finding | Fix |
|---|---|---|
| M1 | 3:1 trade arithmetic wrong: `L* 66` measures 2.38:1, not 3:1; 3:1 needs `L* ≈ 59` where text is 3.4:1 | Restate the real cost |
| M2 | 1.4.11 concession attributed to the muted layer, but shipped fills are 1.04–1.98:1 — four of six worse | Report both layers |
| M3 | "Cell boundaries remain visible through the grid lines" is false: hour lines sit at `z-index: 1` under opaque cards; no vertical lines exist | Name the 1–2px margin, or add a real edge |
| M4 | Floor moves from 4.5 to ~5.5 without saying so; `L* 74` described as "highest muting" when it is the least | State the operative floor; inverse wording |
| M5 | Muted text (5.53–5.57) out-contrasts wishlisted text on Orbit (5.20) and Poly*Technic (5.45) | Widening the band requires a darker ink, which the design already contemplates |
| M6 | Dark mode inverts de-emphasis: muted fills are 7.14–7.19:1 against `--card-bg`, shipped pinks 6.71:1 | Mode-scope the edge, or state dark mode is chrome-only |
| M7 | Tappability argued with `cursor: pointer`, invisible on touch; blocks are `div`s with no role or tabindex; viewport blocks zoom (`user-scalable=no`) | Name a touch-surviving affordance; the zoom meta is a one-line fix |
| M8 | Scope stated three ways: "CSS and the small render helpers", "no JavaScript", "no new files" | State it once |
| M9 | Performance compares new focus to today's neutral; the valid comparison is old focus to new focus | Restate |
| M10 | Palette claims false: Orbit's fill *is* the app's pink token; migration lowers ink-on-page and card-to-page margins | Correct both claims |
| M11 | Six alternatives attributed to "the author" with no linked discussion | Drop the prefix |
| M12 | Palette documented twice, different schemas, different token names | One source |
| M13 | `Additional Resources` and `Future Improvements` are H3 outside any H2 | Promote to H2 |
| M14 | Token names never given; `<stage>` is not substitutable (`Poly*Technic`, `Minky Max`) | List six literal declarations |
| M15 | Token audit cannot catch typos (five of six single-digit typos still pass) or mis-assignment (all six fills measure 5.53–5.57) | Assert expected hex per token |
| M16 | `overflow: hidden` / `outline` rationale is false; own `overflow` clips descendants, not its own outline or shadow | Correct the rationale |
| M17 | Heart badge specified three ways (1.4px outline, 1.5px text-shadow, "not expressible") | One mechanism |
| M18 | File list stale: `design_draft.md` no longer exists; `docs/designs/wishlist-contrast.md` already exists, so "(Create)" is wrong | Update |
| M19 | `Open Questions` contains a decided item and no decision procedure | Rename to Decisions |
| M20 | Undefined terms (`muted`, `ring`, `neutral`, `fill`) and dangling references (`Step 6`, `--muted-base`, `Export`) | Glossary + fix refs |

## Nits

Line 21 missing `:1` and conflicting with line 34; `index.html:242` cited for a property on 241; `ΔE76` defined once then used bare; wishlisted range reported as both 5.20–9.90 and 5.21–9.92; Alternative D heading escapes `L*` while the body does not; thematic rules at 4 of 11 H2 boundaries; NFR uses bold run-ins where the Technical Plan uses H3s; "falls from 3.2" cites the 0.45-rule value as if it were shipped; "destroys", "blobs", "honest", "rather than silently resolved" are rhetorical; "gains, in this order" lists unchanged items; the six-hue remark in Future Improvements is inverted; "a later migration only requires re-running the rule" understates it; "Technical Plan (Architecture)" names nothing architectural; "CIE LCh" should be CIELCh(ab)/D65 for a regeneration rule.

## Two paths

**Path A — rewrite around the smaller design (Stage 8's recommendation).** Leave every card at its shipped fill; delete the muted tokens, the LCh rule, the `.has-wishlist` group state and Goal 3; keep the border, shadow and heart; measure the border against shipped fills (5.20–9.90:1). Removes B1, B2, B4, B6, B7, B9, B10 and M5, M6 by deletion rather than mitigation. Costs the per-stage muted palette the author chose at the design gate.

**Path B — repair the muting design.** Requires, at minimum: delete or rewrite Goal 3 with a threshold the design can meet; publish the per-stage layer-contrast column; state the identity carrier once and re-derive the chroma ratio from it; add both missing alternatives; resolve the cross-day trigger (a JS change); name both selectors and add `background-color` to the wishlisted rule; drop the transition claim or authorize the class-flip change; add Risks & Mitigations with the storage and missing-token guards; fix the corrected measurements, the 3:1 arithmetic and the ring; fix the scope, palette and token-name statements.

Path B is roughly twenty substantive edits and leaves B1 unresolved unless Goal 3 is deleted anyway — at which point the muting mechanism is no longer justified by its own goals.

## Resolution (post-review author decision)

The author rejected both paths above and chose a third the review did not evaluate: keep the muting mechanism and change the variable the impossibility proof held fixed. Adopting the official site ink `#001A14` moves the 4.5:1 fill floor from `L* ≥ 67.2` to `L* ≥ 52.6`; at `L* 60` the layer margin is 1.47–2.79:1 with muted text at 5.70–5.73:1 and wishlisted text at 8.36–15.93:1.

Closed by the rewrite: B1 (margin now 1.47 minimum, published per stage), B2 (goal restated as cross-family ≥20 ΔE, within-family shrinkage measured and accepted), B3 (corrected measurements), B4 (both selectors and both background declarations written verbatim), B5 (additive design and hide-filter added as alternatives A and G), B6 (day-scoped trigger), B7 (transition claim deleted), B8 (Risks and Mitigations added; fallback corrected), B9 (ring deleted), B10 (identity carrier decided), and M1–M20 except as noted below.

Still open by decision: the muted boundary measures 2.89–2.91:1 against the light page, 0.1 short of WCAG 1.4.11 (`L* 56` is the documented escape hatch at 3.30:1 but drops text to 5.00:1); viewport zoom and keyboard access remain out of scope; the hide-non-wishlisted filter remains a future improvement. The token audit must assert literal hex values, not contrast alone, because all six muted fills pass any contrast threshold and every permutation of them passes too.
