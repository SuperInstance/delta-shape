// src/esign.mjs — drift SIGNIFICANCE on top of drift POSITION: the e-witness
// bridge. The shape layer (shape.mjs) answers WHERE — change-points, tails,
// crossings, all content-addressed. It cannot answer WHETHER: a change-point
// in noisy data is not yet a finding (README's pinned limit). That third
// question — significant? — is answered by an e-process with a Ville bound,
// and the fleet's tool for that is SuperInstance/quilt-ewitness: anytime-
// valid e-process witnesses with RETRACTION built in (evidence that fires
// and then decays is retracted — a process that cannot retract is a p-value
// in disguise).
//
// Consumption is by pinned vendored bytes (fleet pattern, cf. quilt-tools'
// vendor/quilt-core): vendor/quilt-ewitness/eproc.mjs @ 61b9e04, sha256
// pinned below. The hash IS the identity — the bridge refuses to witness
// against bytes that do not hash to the pin. See vendor/quilt-ewitness/
// SOURCE.txt and docs/DRIFT-SIGNIFICANCE.md.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { changePoints, shapeHash } from "./shape.mjs";

export const VENDOR_REPO = "SuperInstance/quilt-ewitness";
export const VENDOR_COMMIT = "61b9e0403f2254691570cdf877bbbf81624df1f1";
export const VENDOR_SHA256 = "aad90ac5aedb4d8e19b189808b47b22fc7258044af2c25c8f7fc90efec19e63a";

const vendorPath = join(dirname(fileURLToPath(import.meta.url)), "..", "vendor", "quilt-ewitness", "eproc.mjs");

// the hash IS the identity: integrity check BEFORE trust, loud refusal after.
export function vendorDigest() {
  return createHash("sha256").update(readFileSync(vendorPath)).digest("hex");
}
export function vendorOk() {
  return vendorDigest() === VENDOR_SHA256;
}

let _witness = null;
async function loadWitness() {
  if (_witness) return _witness;
  if (!vendorOk())
    throw new Error(`vendored ${VENDOR_REPO} eproc.mjs fails sha256 pin — refusing to witness (hash IS identity)`);
  const mod = await import(vendorPath);
  _witness = mod.witness;
  return _witness;
}

// witnessDrift: join the two layers. WHERE from the shape layer (exact,
// content-addressed), WHETHER from the e-process (Ville-bound, retractable).
// sigma is REQUIRED and pre-registered — the honesty contract is inherited
// verbatim from quilt-ewitness (the tool refuses to run without it; no
// silent defaults, no peeking). claim: DECREASES | INCREASES.
export async function witnessDrift(series, { claim = "DECREASES", sigma, delta = 0.05 } = {}) {
  const witness = await loadWitness();
  const w = witness(series, { claim, sigma, delta }); // throws on missing sigma / short / non-finite
  return {
    ...w,
    vendor: { repo: VENDOR_REPO, commit: VENDOR_COMMIT, sha256: VENDOR_SHA256 },
    where: { change_points: changePoints(series), shape_hash: shapeHash(series) },
    // the joint read: a drift claim is complete only when the e-process
    // fires AND the shape layer can name where the regime lives.
    joint: w.verdict === "WITNESSED" && !w.retracted
      ? `WITNESSED at t=${w.stop_t}; regime change-points ${JSON.stringify(changePoints(series))} @ ${shapeHash(series)}`
      : w.retracted
        ? `RETRACTED (fired t=${w.stop_t}, evidence decayed to E_final=${w.E_final.toExponential(2)} < bar ${w.bar})`
        : `NOT_WITNESSED (E_max=${w.E_max.toExponential(2)} < Ville bar ${w.bar})`,
  };
}
