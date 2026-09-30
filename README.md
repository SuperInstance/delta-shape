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

## Time-first measurement (D10–D12, `src/time.mjs`)

The captain: *flash-to-thunder ranging — 5 sec/mile is rough but the ratios are
exact (half the seconds, half the distance); a boat's 5-minute predictor line is
where-I-was-5-minutes-ago that length behind me; cruising speed is RPM (discrete
rotations in time); people care how far in TIME you are; time breaks the analog
problem — a distance question fractures into the coastline paradox, but set your
caliper-divider to the length you go in one tick and count in whole numbers.*

- **Ranging with honest remainders** (D10): `range(15,5) = {units:3, exact}`;
`range(2,5) = {units:0, remainderTicks:2}` — a half-mile is *felt, not yet
counted*. Doubling the delay doubles the count AND the remainder; no information
lost to rounding.
- **Ratios are calibration-independent**: `ratioExact` is cross-multiplied
integer equality — exact under ANY `ticksPerUnit`. Relative exactness never
drifts; only the label on the unit does. (The tuning fork, one layer down.)
- **The predictor line is the degenerate gate** (D11): `trail(series, t, 1)` ≡
`surround(series, t, 1)` — the boat instrument and the perceptual membrane are
one object. `eta` rounds UP in whole ticks: 13 units at 3/tick = 5 ticks — the
5th boundary is not optional.
- **No replays** (D12): sealing identical content twice yields different
receipt_ids, because the parent moved. *A repeated message is a new message of
what the old message was* — structural, not metaphorical. (subleq-fabric's
`run(N)` as an absolute cap is the same law for machines: a resumed run may not
coast on the old budget.)

## Senses as gates (the captain's framing, mapped)

Audio is the slow, System-2 sense — listening happens over someone else's time.
Its System-1 exceptions are alarms: the window break, the yell, the voice from
behind. In `eLearn` the alarm lane is exactly one event: **silent + click =
kill** — a hypothesis dies with no deliberation, the only interrupt in the
learner. Vision at fast frame rate is motion-centric: percepts are *notices* of
change — the shape layer (D3) is precisely "vision consuming deltas, not
states." Scale is a dimension like color, pitch, timbre: the Weber gate's
`level` is scale, content-addressed by `perceptHash`.

## Cells: the fleet as organism

Every cell (blood, brain, bone) stems from a division under pressure, incubated
until its first breath of its own information, then iterating with the training
wheels off. Mapped: genesis receipt with a **nonzero parent** = lineage;
passing pins without the parent lane = training wheels off; a cell's first
autonomous receipt about the world = first breath. The maturity ladder is the
fleet's own greenhorn → able-seaman, written in receipts.

## Trained intelligence on the perceptual layer (D13–D15, `src/learn.mjs`)

The captain: *"see if you can train your own intelligence for tasks on them."*
Two classical learners, both integer-exact, seeded, deterministic:

- **Perceptron over percept-histogram features** (D13): features are counts of
gate events (`[nulls, level0..6, plus, minus]`) — the intelligence sits one
derivative down from raw values, consuming *notices* not *states*. Trains on 5
seeded generators (`drift/osc/step/chirp/noise`): mistake curve `[4,4,3,3,2,2]`,
20/20 train, ≥18/20 holdout, weights golden-hashed (`12f14b6b1c4a68a6`),
retraining reproduces the intelligence bit-for-bit.
- **The learning curve is a shape object** (D14): non-increasing, at least one
strict drop — decay of surprise, System-2 listening pinned as a delta-shape.
- **NGram next-event prediction** (D15): drift/step/chirp ≥0.95 predictable;
osc with magnitude jitter 0.45; noise 0.17. Predictability is a property of
the *generator*, and the trained model exposes it rather than hallucinating
order. An intelligence that knows its limits, pinned.

Honest note (the doctrine): 90% holdout, not 100% — two seeded episodes are
genuinely confusable through the Weber gate, and the pin says so.

## Honest limits (pinned, not hidden)

- **Magnitude blindness is deliberate.** A +1 rise and a +1000 rise hash alike. Value
  lives in the value layer; change lives here. Read both.
- **Recompute chains detect reorder/splice, not silent field edits** (D6): `verify()`
  recomputes from current fields, so editing content and rehashing passes. The
  adversarial layer is a *signature* (edge-ledger's HMAC), not rehashing — the same
  lesson as Casey's FNV-1a-64 fleet chains vs our sha256: pick the digest for the
  adversary you actually have.
- **Shape ≠ significance — now answered by the e-witness bridge** (E1–E5, `src/esign.mjs`,
  `docs/DRIFT-SIGNIFICANCE.md`). A change-point in noisy data is not yet a finding; the third
  drift layer is an anytime-valid e-process with a Ville bound — consumed from
  **SuperInstance/quilt-ewitness** as a sha256-pinned vendored instrument (retraction built in:
  a fired tail predicate can never un-fire, a retracted e-witness can). `witnessDrift` returns
  WHETHER (WITNESSED / NOT_WITNESSED / RETRACTED) joined with WHERE (change-points + shape hash).
  `sigma` is REQUIRED and pre-registered; the honesty contract is inherited verbatim.
  On real telemetry: register σ per-lane BEFORE looking, then witness. Honest limits in the doc
  (Gaussian null on integer increments is an approximation; single series; per-cell δ).

MIT.
