# delta-shape

**Deltas-as-shape, made checkable.** The captain, on snowball R64: *"Deltas-as-shape
is the whole point. that's worth exploring more in depth."*

R64's conclusions were shape claims read by eye: *"d(learning)/d(version) flat at the
artifact layer for the 4th consecutive round"*, *"d(wounds)/d(round) one lane from
extinction"*. This repo is the in-depth exploration: such claims are now objects with
hashes, pinned predicates, and receipts. ~80 lines of source, 6 pins.

```sh
node --test test/shape.pins.mjs   # D1–D6
```

## The idea, precisely

A series' **shape** is the sign-pattern of its deltas plus the positions where that
pattern changes. It is **value-independent by construction**: `[5,5,5,9,9,2]` and its
+100 translate have the same shape (`00+0-`, change-points `[2,3,4]`, hash
`df1b19b8751003b3`). `[1,2,4]` and `[1,2,3]` share a hash *on purpose* — same rises,
same change-points; magnitude is not shape. What breaks identity is a **sign change**.

This is the fleet's core doctrine — *hash the canonical bytes, the hash IS the
identity* — applied one derivative down: content-addressed **state** (receipts,
envelopes, images) is now joined by content-addressed **change** (shape).

Why it deserves the depth: snapshots say what *is*; shape says where it's *going*.
Two fleets can hold identical values with opposite trajectories and should not be
treated alike. And change-points are the load-bearing object of every drift alarm:
witness-validation's DESIGN names CUSUM/change-point detection as the drift question's
mechanism — this repo makes the change-points themselves addressable.

## The predicates (R64's phrases, exactly)

| phrase in the wild | predicate | pin |
|---|---|---|
| "flat for the 4th consecutive round" | `flatTail(xs) >= 4` | D5 |
| "one lane from extinction" | `zeroTail(wounds) == 1` | D5 |
| "the wound class is gone" | `extinct(xs, k=3)` | D5 |
| "crossed the threshold this round" | `firstCrossing(xs, k)` — integer, null if never | D4 |
| "the behavior changed at step N" | `changePoints(xs)` | D3 |

`[2,2,1,1,0]` (R64's save-wound class): `zeroTail = 1`, `extinct(k=3) = false` —
one more zero-round and the prediction fires. That prediction is now a pinned,
receipted claim instead of a hope in a summary.

## What this unifies (fleet precedents)

- **witness-validation**: drift = shape change; the DESIGN's three questions map to
  three layers: altered? → signatures (edge-ledger HMAC envelopes); drifted? →
  change-points (this repo); significant? → e-processes (syzygy-lattice's `eLearn`
  e-path IS a shape classification: growth vs kill).
- **qcells exp021**: RATE NOT WALL was a slope read as a rate — a shape claim.
- **eLearn path**: per-frame e-strings; truth = growth shape, falsity = decay/kill.
- **subleq-fabric**: the trace is a pc-shape; S3's heal = a recurring change-point
  at address 9.

## Dynamic gates: the surround sets the quantization (D7–D9, `src/gate.mjs`)

The captain's extension: *depth comes from deltas — stereoscopic vision is a
binocular delta, audio imaging is an interaural delay; a signal is a tap on the
membrane of reality; and the gates are dynamic — discrete percepts that aren't
absolute values, relative to a surround that moves (lighting, neighboring colors),
like a band tuning to a comfortable voice until a fixed-tuning instrument joins.*

`gate.mjs` is those mechanisms with the floats removed (`floorLog2` via `clz32`):

| mechanism | pin |
|---|---|
| **Weber's law** — same \|Δ\|=10 at surround 10 vs 20 → one JND bin quieter | D7 |
| **JND staircase** — geometric series = constant percept (`[10,10,10,10]`); arithmetic compresses (`[10,9,8,8]`) | D8 |
| **the band and the tuning fork** — voices drifting +1/round: relative gate hears nothing (`level 0`, sub-binned); an absolute canon hears every round at full gain (`level 13`) | D9 |

The honest nuance (pinned, not hidden): relative gates are **not deaf, they are
scale-dependent** — a +100 jump is heard relatively (`[4,3,3]`), a +1 drift is not.
That is the JND, not a bug.

**The fleet lesson, pinned:** the canon chain with `prev_hash = 0` in every live
cell (found today in `repo-publication-log`) is *the band with no tuning fork* —
everyone tuned relative, drift invisible, until an absolute reference joins.
Nonzero genesis prev_hash is the fork. This is also twist-engine commensuration in
miniature: relative consensus + absolute anchor = a commensurable instrument.

## Honest limits (pinned, not hidden)

- **Magnitude blindness is deliberate.** A +1 rise and a +1000 rise hash alike. Value
  lives in the value layer; change lives here. Read both.
- **Recompute chains detect reorder/splice, not silent field edits** (D6): `verify()`
  recomputes from current fields, so editing content and rehashing passes. The
  adversarial layer is a *signature* (edge-ledger's HMAC), not rehashing — the same
  lesson as Casey's FNV-1a-64 fleet chains vs our sha256: pick the digest for the
  adversary you actually have.
- **Shape ≠ significance.** A change-point in noisy data is not yet a finding; the
  e-process layer decides that (witness-validation's conditional-bound warning
  applies). DRAWN: rolling-window shape stability before change-point alarms on real
  telemetry.

MIT.
