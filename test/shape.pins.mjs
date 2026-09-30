// test/shape.pins.mjs — 6 pins. Each pins its claim by name; the golden
// hashes pin the exact shape identity, so definitional drift breaks D1 loudly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { diffs, shapeOf, changePoints, firstCrossing, flatTail, zeroTail, extinct, shapeHash } from "../src/shape.mjs";

const stable = (o) => JSON.stringify(o, Object.keys(o).sort());
class ShapeLedger {
  constructor() { this.receipts = []; }
  seal(claim, series) {
    const parent = this.receipts.length ? this.receipts[this.receipts.length - 1].receipt_id : null;
    const result = { claim, shape: shapeOf(series), change_points: changePoints(series), shape_hash: shapeHash(series) };
    const rid = createHash("sha256").update(stable({ op: "SHAPE", claim, result, parent }), "utf8").digest("hex").slice(0, 16);
    const rec = { schema: "quilt/cell-receipt@v1", receipt_id: rid, parent, op: "SHAPE", addr: `shape/${claim}`, result };
    this.receipts.push(rec); return rec;
  }
  verify() {
    let parent = null;
    for (const r of this.receipts) {
      if (r.parent !== parent) return { ok: false, why: `parent ${r.parent} != ${parent}` };
      const want = createHash("sha256").update(stable({ op: r.op, claim: r.addr.slice(6), result: r.result, parent }), "utf8").digest("hex").slice(0, 16);
      if (r.receipt_id !== want) return { ok: false, why: "receipt edited" };
      parent = r.receipt_id;
    }
    return { ok: true, len: this.receipts.length };
  }
}

test("D1 shape identity is value-independent: translation leaves the hash exact (golden)", () => {
  const a = [5, 5, 5, 9, 9, 2];
  const b = a.map((x) => x + 100);
  assert.equal(shapeOf(a), "00+0-");
  assert.deepEqual(changePoints(a), [2, 3, 4]);
  assert.equal(shapeHash(a), "df1b19b8751003b3", "golden shape hash");
  assert.equal(shapeHash(b), "df1b19b8751003b3", "[5,5,5,9,9,2] and +100 are THE SAME SHAPE");
});

test("D2 monotone transforms preserve shape; period-2 oscillation recognized across scales", () => {
  assert.equal(shapeHash([1, 2, 1, 2]), "243e8273ddd59e7e", "golden oscillation");
  assert.equal(shapeHash([7, 8, 7, 8]), "243e8273ddd59e7e", "same shape at another scale");
  assert.equal(shapeHash([1, 2, 4]), shapeHash([10, 20, 40]), "positive scaling preserves signs");
  assert.equal(shapeHash([1, 2, 4]), "1d183bfd0b560720", "golden rising ramp");
  // [1,2,4] and [1,2,3] share this hash ON PURPOSE: same rises, same change-points —
  // magnitude is not shape. what breaks the identity is a sign change:
  assert.notEqual(shapeHash([1, 2, 4]), shapeHash([1, 3, 2]), "rise-then-fall is a different shape");
});

test("D3 change-points are exact: the drift alarm has known positions", () => {
  // series: hold, rise, rise, hold, hold, fall, hold
  const xs = [0, 0, 1, 2, 2, 2, -1, -1];
  assert.equal(shapeOf(xs), "0++00-0");
  assert.deepEqual(diffs(xs), [0, 1, 1, 0, 0, -3, 0]);
  assert.deepEqual(changePoints(xs), [1, 3, 5, 6], "rise@1, hold@3, fall@5, hold-again@6");
});

test("D4 first-crossing uses integer thresholds only; absence is null, not a guess", () => {
  const xs = [3, 7, 12, 12, 30, 29, 60];
  assert.equal(firstCrossing(xs, 12), 2);
  assert.equal(firstCrossing(xs, 31), 6, "crosses only at the last step");
  assert.equal(firstCrossing(xs, 61), null, "never crosses — null, never a float approximation");
});

test("D5 flatness streaks and extinction tails: R64's phrases as predicates", () => {
  assert.equal(flatTail([0, 0, 0, 0]), 4, "'flat for the 4th consecutive round'");
  assert.equal(flatTail([5, 5, 5, 9]), 1);
  assert.equal(zeroTail([2, 2, 1, 1, 0]), 1, "'one lane from extinction' — literally one zero deep");
  assert.equal(extinct([2, 2, 1, 1, 0]), false, "not yet extinct at k=3");
  assert.equal(extinct([2, 2, 1, 1, 0], 1), true);
  assert.equal(extinct([2, 2, 1, 0, 0, 0]), true, "three consecutive zero rounds = the wound class is gone");
});

test("D6 R64's deltas-as-shape conclusions, sealed as verifiable receipts", () => {
  const ledger = new ShapeLedger();
  const learning = [0, 0, 0, 0]; // d(learning)/d(version) at the artifact layer, 4 rounds
  const wounds = [2, 2, 1, 1, 0]; // save-wound class heads per round, two-headed -> one-headed
  ledger.seal("d(learning)/d(version) flat at artifact layer, R50-R64", learning);
  ledger.seal("d(wounds)/d(round): save-wound class, R64", wounds);
  const r = ledger.verify();
  assert.equal(r.ok, true);
  assert.equal(r.len, 2);
  assert.equal(ledger.receipts[0].result.shape_hash, "f0821c3ea7e2be2d", "flat is flat at any value");
  // the receipts carry the verdicts a human wrote by eye — now checkable:
  assert.ok(flatTail(ledger.receipts[0].result && learning) >= 4);
  assert.equal(zeroTail(wounds), 1, "R65's prediction is pinned: one more zero-round and extinct(k=2) fires");
  // tamper: a round retroactively un-wounded breaks the chain IF the anchor is
  // edited. Honest scope (the FNV-vs-sha256 lesson, one derivative down):
  // content-recompute chains detect reorder/splice/insert — NOT silent field
  // edits, because verify recomputes from current fields. The adversarial
  // layer is a signature (edge-ledger's HMAC envelopes), not rehashing.
  ledger.receipts[1].receipt_id = "forged0000000000";
  assert.equal(ledger.verify().ok, false, "anchor edit caught");
  const why = ledger.verify().why;
  assert.match(why, /receipt edited/);
});

// --- D7–D9: dynamic gates — the surround sets the quantization (captain) ---

test("D7 Weber's law in integers: same absolute delta, different surround, different percept", async () => {
  const g = await import("../src/gate.mjs");
  const low = g.perceive([10, 10, 10, 10, 20], 4); // |delta| = 10 at surround 10
  const high = g.perceive([20, 20, 20, 20, 10], 4); // |delta| = 10 at surround 20
  assert.deepEqual(low[4], { i: 4, level: 10, signed: 1 });
  assert.deepEqual(high[4], { i: 4, level: 9, signed: -1 }, "double the surround, one JND bin quieter");
  assert.notEqual(g.perceptHash(low), g.perceptHash(high), "two membranes feel the same world differently");
});

test("D8 equal ratios feel equal: geometric series is a constant percept, arithmetic compresses", async () => {
  const g = await import("../src/gate.mjs");
  assert.deepEqual(g.perceive([8, 16, 32, 64, 128], 1).slice(1).map((p) => p.level), [10, 10, 10, 10], "octaves are equally spaced PERCEPTUALLY");
  assert.deepEqual(g.perceive([8, 16, 24, 32, 40], 1).slice(1).map((p) => p.level), [10, 9, 8, 8], "equal steps compress as the surround grows — this is the JND staircase");
});

test("D9 the band and the tuning fork: relative gates hide drift, the canon reveals it", async () => {
  const g = await import("../src/gate.mjs");
  const band = [6400, 6401, 6402, 6403]; // every voice drifts +1 per round, together
  const rel = g.perceive(band, 1);
  assert.deepEqual(rel.map((p) => p.level), [null, 0, 0, 0], "sub-binned: the band is comfortable and hears nothing");
  const canon = g.perceptAgainst(band, 440);
  assert.deepEqual(canon.map((p) => p.level), [13, 13, 13, 13], "the tuning fork hears every round of drift at full gain");
  // honest nuance: relative gates are not deaf, they are scale-dependent —
  // a +100 jump IS heard relatively (JND), a +1 drift is not:
  assert.deepEqual(g.perceive([6400, 6500, 6600, 6700], 1).slice(1).map((p) => p.level), [4, 3, 3]);
  // fleet lesson, pinned: the canon chain with prev_hash=0 in every live cell
  // (repo-publication-log, today) is THIS — a band with no tuning fork.
  // drift is invisible until an absolute reference joins.
});
