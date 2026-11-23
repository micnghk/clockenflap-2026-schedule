# Stage 8 — Intermediate Zoom Out

Reviewer: egm-zoom-out. Scope: whole file, judged in light of stages 5–7.

## BLOCKER — the design is the wrong shape; repair cannot reach the goals

The cost centre of this document is a muted fill for the unfocused layer. That mechanism exists to serve Goal 3 ("wishlisted blocks remain the visually dominant layer, measured by a documented contrast margin over unfocused blocks rather than by the unfocused layer dropping out"). A muted fill *is* the unfocused layer dropping out, at reduced amplitude. The design contradicts itself at the level of mechanism, not parameter.

### The parameter space has no solution

Ink `#164234` has relative luminance Y = 0.0431. A 4.5:1 text floor requires fill Y ≥ 0.3692, i.e. `L* ≥ 67.2`. That is the darkest a muted fill can ever be while satisfying Goal 1 — and therefore the best case for layer separation in the whole legal space. At that extreme:

| Stage | Shipped Y | Max possible wishlisted ÷ muted |
|---|---|---|
| Harbourflap | 0.838 | 2.12:1 |
| Park / Minky Max | 0.767 | 1.95:1 |
| Robot | 0.872 | 2.20:1 |
| **Orbit** | 0.434 | **1.15:1** |
| **Poly*Technic** | 0.458 | **1.21:1** |

A 2:1 margin on Orbit would need `L* ≈ 51`, where text measures 2.60:1. Goals 1 and 3 are mutually exclusive for two of six stages *by construction*.

Stages 5–7 measured the chosen point (1.02–1.07:1) and one alternative (1.13–1.18:1 at `L* 68`). The bound shows no point works. That converts "bad parameter choice" into "wrong mechanism".

### One mechanism explains every major finding

State is reported by the fill of the layer that must not change. Every defect is a corollary:

| Prior finding | Why it follows |
|---|---|
| Layer margin absent; Alternative B rejected at the same value | The text floor pins muted luminance within ~2 `L*` of the pink fills |
| Every ΔE pair shrinks | Chroma scaling at fixed `L*` is a contraction; the goal says non-contraction |
| Cross-day mute | `has-wishlist` is global while `.wishlisted` is per-day; only a group state can be set by data the group cannot see |
| Dark-mode ordering inverts | Mode-invariant light fills on a dark page (muted 7.14–7.19:1 vs `--card-bg`) |
| Muted text out-contrasts promoted text | `L* 74` brightens Orbit (71.8) and Poly*Technic (73.4) |

Removing the group state and the fill change removes all five, not by mitigation but by deletion.

## MAJOR — the document's size is the YAGNI signal

472 lines and six rejected alternatives to arrive at one CSS property. The derivation section spends ~50 lines producing six constants, each used once, through three hops (`:root` token → `--stage-fill-muted` → `background-color`). Single-use constants are not reuse; the measurement table is the audit, so the `:root` layer only adds a second place to desynchronise. All six alternatives vary the muting parameter; none varies the premise. The decision carrying 90% of the cost was never a decision.

## MAJOR — the proposed mitigations, judged

* **Delete Goal 3, rely on border/ring/shadow.** Resolves the contradiction. Moves the cost: dominance becomes shape-only, which is weaker at scan distance across a dense grid. Introduces none of the other four defects.
* **Collapse six tokens to one or three.** Resolves the ΔE goal by abandoning it; a single fill also loses the per-stage hue the author asked for at the design gate. Leaves the cross-day and dark-mode defects untouched.
* **Gate the mute on a day-scoped fraction.** Fixes cross-day and the n=1 case. Introduces a discontinuous threshold and, if interpolated, ~60 intermediate fills that were never contrast-checked. Requires the JS change the plan currently forbids.
* **Add a mode-scoped edge token.** Fixes dark-mode ordering. Adds a seventh value to keep in sync with the page and puts an outline on every card of a pastel grid.
* **Day-scoped trigger only.** Fixes cross-day, not the mechanism or the layer margin.

## The smallest design that meets Goals 1–4

Leave every card at its shipped fill. Delete the muted tokens, the LCh rule, the `.has-wishlist` group state and the `.artist-time` alpha change is kept. Mark wishlisted cards with the 2px ink border, the shadow and the heart. Measure the border against the shipped fills, where it already reports 5.20:1 (Orbit) to 9.90:1 (Robot) — a state cue that clears 4.5:1 everywhere, which no fill-based scheme can.

Consequences, stated rather than discovered: no cross-day mute (no group state), no dark-mode inversion (no fill change), no ΔE question (no transformed fills), and the grid never reads as disabled. Costs: separation is shape-only, and the six-token palette disappears from the design — which the author explicitly chose at the gate, so adopting this is a scope decision, not a correction.
