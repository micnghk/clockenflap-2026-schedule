# Stage 7 — Critic Review

Reviewers: egm-design, egm-structural, egm-style. Target: lines 1–356.

Converged findings appear once, with the reviewer(s) that raised them. Numeric claims below were independently recomputed; the document's muting rule reproduces exactly (all six muted hexes, the `L* 68/62` ranges), so the disagreements are about criteria and defects, not arithmetic method.

## BLOCKER 1 — Goal 3's "documented contrast margin" is neither documented nor met (design, style, comprehension)

No wishlisted-vs-muted contrast ratio appears in the document. Measured: Orbit 1.07:1, Poly*Technic 1.02:1, Park/Minky 1.58:1, Harbourflap 1.71:1, Robot 1.79:1. Alternative B is rejected at 1.00:1 and the chosen rule delivers 1.02:1. The document's headline metric (ΔE 19.2–34.1) is a different quantity and does not satisfy a goal that names contrast.

Cause: `L* 74` is *lighter* than Orbit (71.8) and Poly*Technic (73.4), so muting brightens those fills and collapses the pair.

## BLOCKER 2 — Goal 2 is violated by every pair, and the evidence matrix is never published (design, style, comprehension)

Shipped → muted ΔE76: Harbourflap↔Robot 6.6 → 3.2; Orbit↔Poly*Technic 2.8 → 1.3; Park↔Minky Max 1.7 → 0.7. Inter-family pairs shrink too (48.6 → 21.6; 73.4 → 32.5). No chroma-reducing rule at fixed `L*` can preserve pairwise distance; the goal is unachievable as worded. The document publishes only per-stage ΔE from shipped and the rejected 0.30 matrix.

## BLOCKER 3 — Identity carrier is asserted both ways (design, catalyst, style)

"Stage identity is carried by column position, not colour" (L67–68) versus "the point of keeping the fills per stage is that a user can still tell stages apart" (L291). If position, Alternative E's rejection is empty. If colour, the chosen rule already collapses Park↔Minky to 0.69 ΔE. The 0.45-vs-0.30 choice rests on which is true.

## BLOCKER 4 — The trigger is deferred, and the cross-day case is unhandled (design)

The Problem ranks the all-or-nothing trigger beside the contrast collapse, then Open Questions defers it. Worse, a case the document never mentions is guaranteed by the code: `has-wishlist` is set from the global `wishlist.size` before the day filter, while `.wishlisted` only applies to blocks on the rendered day. With Friday artists wishlisted, tapping Saturday mutes the *entire* Saturday grid with zero promoted blocks and no way out but clearing the wishlist. CUJ 1 has no counterpart for this.

## BLOCKER 5 — The ring contributes nothing in light mode and its rationale names a neighbour that does not exist (design, style)

`--bg-color` on the `--bg-color` page is 1.00:1 — invisible. The grid's actual backdrop is `--card-bg`; in dark mode that differs from `--bg-color` by 1.10:1. Muted neighbours are light (`L* 74`), not dark. The border already measures 5.57:1 against muted fills. Separately, the ring consumes the 1–2px inter-column gap (`margin: 1px 2px`), so at density it collides with promoted neighbours.

## BLOCKER 6 — The transition cannot run (design, catalyst, style)

`toggleCurrentWishlist()` → `renderSchedule()` → `container.innerHTML = ''` then rebuild. New elements have no previous computed style, so `background-color 0.25s` never interpolates. The existing `opacity 0.3s` is already dead for the same reason.

## BLOCKER 7 — No Risks & Mitigations section (structural)

`feature-spec-standard.md` requires the spec to identify failure modes, security implications, scalability limits and mitigations. A search for `risk|security|scalab|failure mode|mitigat` returns zero matches. Concrete unhandled failures on the touched path:

* `new Set(JSON.parse(localStorage.getItem(...)))` has no `try`/`catch`; private mode or corrupt JSON throws before first render and blanks the timetable.
* The fallback claim "a stage added without a muted token renders at full strength" is false: the stage rules set `background-color` today and no `--stage-fill`; `background: var(--stage-fill-muted, var(--stage-fill))` with both undefined is invalid at computed-value time, so the card becomes transparent.
* Cross-day mute (BLOCKER 4).
* Security is never stated as N/A (static offline file, no network, no user-supplied HTML).

## MAJOR 1 — The headline numbers do not reproduce and the mode ordering is inverted (design, style)

The Problem claims light 1.34–1.59:1 and dark 1.00–1.27:1. Applying the shipped stack (`grayscale(65%)` then group `opacity: 0.3`, ink at full alpha for names, `0.88` for the time label) against `--card-bg`: **light 1.42–1.71, dark 1.65–2.27**. The document's light range matches a model in which the filter does not paint the text; its dark range matches text-versus-page, not text-versus-card. The qualitative conclusion survives; the "near 1.0:1" that motivates the dark-mode section does not.

## MAJOR 2 — The 3:1 trade arithmetic is wrong by a full ratio unit (design, style, comprehension)

At `L* 66` the fill measures 2.38:1 against `#FAF3F3`, not 3:1. 3:1 requires `L* ≈ 58.9`, where text is 3.43:1, not 4.4:1. In dark mode 3:1 requires `L* ≈ 47.8` and text falls to 2.32:1. The cost of the concession is understated by roughly a full unit, and computed only for the mode where the exception exists.

## MAJOR 3 — The 1.4.11 concession is attributed to the wrong layer (style)

The muted fill is 1.85:1 against the light page, but the *shipped* (wishlisted) fills are 1.04–1.98:1 — four of six are worse. The muted state is not the non-conforming case this design introduces; the emphasised state is worse and is presented as compliant.

## MAJOR 4 — The grid-line mitigation is false (style, comprehension)

`.grid-line` is a horizontal hour line at `z-index: 1`, covered wherever an opaque card at `z-index: 2` sits. There are no vertical cell boundaries. The visible boundary is the 1–2px margin showing `--card-bg`.

## MAJOR 5 — Muted text out-contrasts wishlisted text on two stages (catalyst)

Muted 5.53–5.57:1 on all six; wishlisted 5.20:1 (Orbit) and 5.45:1 (Poly*Technic), identical size and weight. On two stages the de-emphasised card is more legible than the promoted one. No `L*` can place muted below wishlisted for all six, because two shipped fills sit above the mute target.

## MAJOR 6 — The muting parameter's acceptance criterion does not bind (design)

"0.45 keeps every stage at least 19 ΔE from its shipped fill": the 19 has no source; four stages satisfy it by the lightness change alone (Harbourflap at chroma ratio 1.0 is already 19.3 ΔE from `L* 93.3 → 74`); only Poly*Technic, whose `L*` barely moves, is bound by desaturation. The "text contrast" column is a tautology — contrast against fixed ink is a function of `L*` alone, and every row was forced to the same `L*`.

## MAJOR 7 — The floor moves from 4.5 to ~5.5 between Goals and the alternatives (catalyst, comprehension)

Goals state 4.5:1. `L* 68` yields 4.59–4.62 and is rejected as "a floor met by 0.1". The operative floor is therefore ~5.5 and is stated nowhere. Alternative D also has better layer separation (1.12–2.14) than the chosen rule, so it is not strictly worse on the document's own criteria.

## MAJOR 8 — Scope statements contradict each other and the constraint decides behaviour (design, comprehension, style)

"CSS and the small render helpers" versus "no JavaScript changes" versus "no new files" (contradicted by creating the document). The "no JS" constraint is what leaves BLOCKER 4 and BLOCKER 6 unfixed.

## MAJOR 9 — Tappability has no mechanism that survives touch (design, style)

`cursor: pointer` is invisible on touch; `-webkit-tap-highlight-color: transparent` suppresses the press flash; `:active` fires after contact. The blocks are `div`s with `onclick`, no role, no tabindex, no keyboard handler. A muted mid-tone reads as disabled.

## MAJOR 10 — Accessibility completeness claim is false (design)

"One item deliberately does not meet WCAG 1.4.11" is presented as the complete set. The same nodes also fail 1.4.4 (viewport sets `maximum-scale=1.0, user-scalable=no`, blocking zoom on 8.5px text) and 2.1.1/4.1.2 (div-as-button). Removing `user-scalable=no` is one line and outweighs the entire muting rule for legibility.

## MAJOR 11 — The wishlist-only filter is claimed as an evaluated alternative but is not one (design, comprehension, style)

Non-Goals says "This is evaluated as an alternative and not adopted here." No such alternative exists. The exclusion is load-bearing: with a hide-non-wishlisted toggle there is no muted layer, so the six tokens, the LCh rule, the alpha change and the dominance goal all disappear. It also dissolves BLOCKER 4.

## MAJOR 12 — "Dark mode is unreachable" is declared in scope then entrenched (design, style)

Line 47 declares cards ignoring dark mode a defect in scope; line 177 makes light cards on a dark page the intended design. Both cannot hold. The defect the line describes is real (card fills, ink and stage tokens do not adapt), but the wording is wrong: dark mode is reachable and active; cards ignore it.

## MAJOR 13 — Palette section contains two false claims (style)

"The stage fills exist in neither token set" — the table directly above maps site pink `#FFABAD` to app `#F396A0`, i.e. Orbit's fill *is* the app's pink token. "Adopting them would raise every contrast margin" — text-on-fill rises, but ink on the site surface falls from 10.29:1 to 9.88:1, muted fills against `#B3FFEA` fall to 1.77–1.79:1, and Robot against `#B3FFEA` is 1.00:1.

## MAJOR 14 — Six alternatives attributed to "the author" with no linked discussion (structural, design, style)

Six occurrences. The standard forbids attributing a rejection to a maintainer without linking the discussion. In four of six the reason restates the preceding Cons.

## MAJOR 15 — Palette documented twice in incompatible formats (structural)

`Palette provenance` table and the `Additional Resources` bullet cover the same facts with different schemas and different token names for the same value. A palette edit must update two sections.

## STRUCTURAL — `Additional Resources` and `Future Improvements` are H3 outside any H2

Both sit at H3 after an H2-level rule, with Title Case matching every H2 and sentence case used for every genuine H3. A TOC renders palette references and future work as sub-items of NFR.

## STRUCTURAL — Section placement ruling

Not a defect: the implementation plan is last, and Additional Resources before it is a consequence of that constraint. The mis-levelled H3s must still be fixed.

## NIT-level findings (structural + style)

* Line 21: "1.0–1.6 contrast" — missing `:1`, and the lower bound conflicts with line 34.
* Line 51: `index.html:242` cited for `color: #164234`; the colour is on 241, `overflow: hidden` is on 242.
* `ΔE76` defined at line 64, then used bare as `ΔE` at 157–161, 285–289.
* Wishlisted text contrast reported as 5.20–9.90 in one place and 5.21–9.92 in another.
* Alternative D heading uses an escaped `L\*` that the body does not; Alternative F is the only heading with an inline code span.
* Thematic rules appear at 4 of 11 H2 boundaries.
* `Open Questions` contains a decided item ("Retained here") and no decision procedure.
* NFR uses bold run-in leads while the Technical Plan uses H3s.
* Line 173: "`L* = 74` is the highest muting" — it is the least.
* Line 289: "falls from 3.2" — 3.2 is the 0.45-rule value, not the shipped 6.6.
* Line 55: the 4.32:1 figure only holds with `opacity: 0.88` still applied; the sentence reads as full-strength text.
* Five terms for one state: focus state, unfocused, faded, dim, muted; plus "promoted" for the other.
* Line 30 "destroys", line 53 "blobs", line 350 "honest", line 324 "rather than silently resolved" — rhetorical, no measurement.
* Lines 183–191: "gains, in this order" followed by items marked "(unchanged)".
* Lines 352–353: inverted — six distinct hues would make a per-stage marker redundant, not the reverse.
* Line 231: "a later migration only requires re-running the rule" — migration also changes ink, page and brand and forces re-verification.
* Line 128: "Technical Plan (Architecture)" — nothing in it is architecture.
* Line 155: "CIE LCh" for a regeneration rule should name CIELCh(ab) and D65.
* Line 164: "Text contrast" column does not say against what.
* Line 314: "six fills on screen" means six distinct fills, not six cards.
