# Drift significance: the e-witness bridge (E1–E5)

The shape layer answers **WHERE** — change-points, flat tails, zero tails,
threshold crossings, all content-addressed (`shape.mjs`, D1–D6). It never
answers **WHETHER**. A change-point in noisy data is not yet a finding; that
was this repo's pinned limit ("Shape ≠ significance", README) — and the fix
is not more shape predicates, it is the fleet's third drift question:

| layer | question | mechanism | home |
|---|---|---|---|
| signatures | altered? | HMAC envelopes | edge-ledger |
| shape | drifted? WHERE? | change-points (content-addressed) | this repo |
| e-process | significant? WHETHER | Ville-bound e-value, retractable | **SuperInstance/quilt-ewitness** |

This lane consumes **SuperInstance/quilt-ewitness** (anytime-valid e-process
witnesses for learning/drift claims; retraction built in) as a pinned vendored
instrument: `vendor/quilt-ewitness/eproc.mjs` @ commit
`61b9e0403f2254691570cdf877bbbf81624df1f1`, sha256
`aad90ac5aedb4d8e19b189808b47b22fc7258044af2c25c8f7fc90efec19e63a`.
`src/esign.mjs` hash-checks the bytes before trusting them (the hash IS the
identity — mismatched bytes refuse to witness) and joins the two layers:
`witnessDrift(series, {claim, sigma, delta})` returns the e-verdict plus the
shape layer's `change_points`/`shape_hash` of the same series.

## What the bridge adds that shape predicates cannot

1. **A bound, not a vibe.** Under the null, P(sup_t E_t ≥ 1/δ) ≤ δ (Ville).
   A change-point alarm carries no such guarantee; a witnessed drift claim
   carries it by construction (E3 pins the null staying far below the bar).
2. **Retraction.** Evidence that fires and then decays is *retracted* — E4
   pins a V-shape descending into a WITNESSED verdict and honestly retracting
   on the rebound. `zeroTail`, `flatTail`, `extinct` cannot retract: a fired
   tail predicate stays fired forever. The word "the evidence decayed" did
   not exist in this repo before this bridge.
3. **The honesty contract, inherited.** `sigma` is REQUIRED and
   pre-registered — the tool refuses to run without it (no silent defaults,
   no peeking). E5 pins the refusal. Registration discipline remains the
   user's duty; the bridge enforces only that registration happens.

## Honest limits (pinned, per the repo's doctrine)

- **Gaussian null on integer increments is an approximation.** delta-shape
  series are integer-counted; the likelihood ratio assumes Gaussian
  increments. For heavy-tailed count noise the Ville bound degrades
  (quilt-ewitness documents this as "no bound if null wrong"; a Student-t
  variant is the upgrade lane on their side).
- **σ mis-registration degrades power or validity** — a σ registered from
  the same series you then witness is peeking; register before looking.
- **Single series.** Multiplicity across many drift cells is not handled;
  per-cell δ does not compose into a family bound.
- **Magnitude blindness carries up.** The shape layer is value-independent
  by construction; the e-process is not — but the bridge witnesses the raw
  series, so a +1 drift and a +1000 drift of the same sign pattern now
  differ in significance even though their shapes hash alike. Read both.

## Reproduce

```sh
node --test test/esign.pins.mjs   # E1–E5
node --test test/shape.pins.mjs   # D1–D15 (unchanged, still green)
```

All e-pins series are seeded LCG (same construction as `learn.mjs`):
deterministic, integer, re-runnable bit-for-bit.
