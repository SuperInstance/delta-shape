// test/esign.pins.mjs — E1–E5: drift significance via pinned vendored
// SuperInstance/quilt-ewitness e-processes. The shape layer says WHERE;
// these pins say WHETHER — Ville-bounded, retractable, honesty-contract
// inherited. All series are seeded LCG (same doctrine as learn.mjs):
// deterministic, integer, re-runnable bit-for-bit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { witnessDrift, vendorOk, vendorDigest, VENDOR_SHA256, VENDOR_REPO, VENDOR_COMMIT } from "../src/esign.mjs";

// seeded LCG — identical construction to learn.mjs genSeries.
function lcg(seed) {
  let s = seed >>> 0;
  return (k) => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0, s % k);
}
// real downward drift: d = -2 + u, u uniform {-2..2} -> mean -2, sd ~1.41.
// sigma pre-registered at 1.5 (registration is the user's duty; the tool
// enforces only that it HAPPENS — quilt-ewitness's contract, inherited).
const driftDown = (n, seed = 7) => {
  const rnd = lcg(seed);
  const out = [];
  let x = 400;
  for (let i = 0; i < n; i++) { out.push(x); x += -2 + (rnd(5) - 2); }
  return out;
};
// directionless jitter: d uniform {-4..4}, mean 0, sd ~2.58 -> sigma 2.6.
const flatNoise = (n, seed = 11) => {
  const rnd = lcg(seed);
  const out = [];
  let x = 250;
  for (let i = 0; i < n; i++) { out.push(x); x += rnd(9) - 4; }
  return out;
};
// V-shape: steep honest descent, then FULL rebound. The correct retraction
// control for drift detectors (quilt-ewitness lesson 3: shuffle NCs are
// wrong — drift is order-invariant).
const vShape = (n, seed = 5) => {
  const rnd = lcg(seed);
  const out = [];
  let x = 500;
  for (let i = 0; i < n; i++) {
    out.push(x);
    const u = rnd(3) - 1; // {-1,0,1}
    x += i < n / 2 ? -3 + u : 3 - u; // mirror rebound
  }
  return out;
};

test("E1 vendored instrument integrity: the hash IS the identity, provenance names the repo", () => {
  assert.equal(vendorDigest(), VENDOR_SHA256, "vendored eproc.mjs hashes to the pin");
  assert.ok(vendorOk());
  const src = readFileSync(new URL("../vendor/quilt-ewitness/SOURCE.txt", import.meta.url), "utf8");
  assert.ok(src.includes("SuperInstance/quilt-ewitness"), "provenance names the owning repo");
  assert.ok(src.includes(VENDOR_COMMIT), "provenance pins the commit");
});

test("E2 real drift is WITNESSED, and the shape layer names where the regime lives", async () => {
  const r = await witnessDrift(driftDown(300), { claim: "DECREASES", sigma: 1.5, delta: 0.05 });
  assert.equal(r.verdict, "WITNESSED");
  assert.ok(r.stop_t > 0 && r.stop_t < 300, "crosses the Ville bar before the series ends");
  assert.ok(r.E_max >= r.bar, "E_max respects the bar");
  assert.equal(r.retracted, false);
  assert.ok(Array.isArray(r.where.change_points), "WHERE: change-points ride along");
  assert.match(r.joint, /^WITNESSED at t=\d+/);
  assert.match(r.where.shape_hash, /^[0-9a-f]{16}$/);
  assert.equal(r.vendor.repo, VENDOR_REPO);
  assert.equal(r.vendor.commit, VENDOR_COMMIT);
});

test("E3 the null is NOT WITNESSED: Ville protects against seeing shape in noise", async () => {
  const r = await witnessDrift(flatNoise(2000), { claim: "DECREASES", sigma: 2.6, delta: 0.05 });
  assert.equal(r.verdict, "NOT_WITNESSED");
  assert.equal(r.stop_t, -1);
  assert.ok(r.E_max < r.bar, `E_max ${r.E_max} below bar ${r.bar}`);
  assert.match(r.joint, /^NOT_WITNESSED/);
});

test("E4 retraction: a V-shape fires then honestly retracts — the capability integer predicates lack", async () => {
  const r = await witnessDrift(vShape(400), { claim: "DECREASES", sigma: 1.0, delta: 0.05 });
  assert.ok(r.stop_t > 0, "the descent genuinely witnesses first");
  assert.equal(r.retracted, true, "full rebound decays the evidence below the bar — RETRACTED");
  assert.ok(r.E_final < r.bar, `E_final ${r.E_final} < bar ${r.bar}`);
  assert.match(r.joint, /^RETRACTED/);
  // the doctrine point, pinned: zeroTail/flatTail/extinct CANNOT retract —
  // a fired tail predicate stays fired. The e-layer can say "the evidence
  // decayed", and that word did not exist in this repo before this bridge.
});

test("E5 honesty contract inherited verbatim: no sigma, no witness", async () => {
  await assert.rejects(() => witnessDrift(driftDown(60), {}), /sigma/, "sigma REQUIRED — no silent default, no peeking");
  await assert.rejects(() => witnessDrift([1, 2, 3], { sigma: 1 }), /short/, "series too short — refuse");
  const bad = driftDown(60);
  bad[30] = NaN;
  await assert.rejects(() => witnessDrift(bad, { sigma: 1.5 }), /non-finite/, "non-finite — refuse");
});
