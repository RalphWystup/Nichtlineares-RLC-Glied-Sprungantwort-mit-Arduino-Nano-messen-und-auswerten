// ---------- Schritt 13 (2.26): physikalisches Modell -- Preisach-Hysterese der Drossel (preisach_schritt_1.1.js, beim Bau eingesetzt)
// 1.1: Suche in drei Stufen (Differenzenschritt 1 % -> 0,3 % -> 0,1 % der Skala, wie preisach_1.8.py) und sechs Startpunkte (R ×0,75/1/1,3, L_rev ×0,8/1,2);
//      1.0 blieb nach fünf Schritten in einem Nebenminimum stehen (R rührte sich nicht, 1,2 % statt 0,8 % ΔU).
// Vorrechnung in Python: verfahren_hr/preisach_1.8.py (Kern 1:1), Prüfung des Fitters pruefe_dgl_fit_1.0.py (Schrittweite, Wiederfinden).
// Modell: Hysteronendichte ρ(α,β) = (ρ0/h_c)·exp(−(α−β)/h_c) (nur von der Koerzitivität abhängig); auf dem Ast ab dem letzten Umkehrpunkt i_r
//   L_d = L_rev + 2ρ0·[1 − exp(−|i − i_r|/h_c)]  (Neukurve ab entmagnetisiertem Zustand: i_r = −i); Umkehrpunkt-Stapel mit Löschregel;
//   C(u_C) = C0/(1 + γ u_C²); Reihe R = R_Cu + R_s (+ Ausgangswiderstand des Pins bei idealer Anregung); DGL mit RK4, Ausgabe als Blockmittel
//   über jede Abtastung (die Messwerte sind Blockmittel, Zeitstempel k + 0,5 ms).
function preisachSim(p, kk, unter, ueArt) {   // p = {Lr, rho, hc, C0, ga, R}; liefert {u, i, L, …} als Blockmittel, null wenn die Lösung wegläuft
  const ikRoh = $("i_median").checked ? median3(kk.i) : kk.i, n = kk.n, dtk = (kk.t[n - 1] - kk.t[0]) / (n - 1), h = dtk / unter;
  const m100 = Math.min(100, n), uInf = kk.uC.slice(-m100).reduce((a, v) => a + v, 0) / m100, uE = ueArt === "ideal" ? kk.uC.map(() => uInf) : anregung(kk);
  const {Lr, rho, hc, C0, ga, R} = p, stapel = new Float64Array(64); let ns = 0, s = 1, x = 0, uc = 0;
  const Ld = xs => { const ir = ns > 0 ? stapel[ns - 1] : -xs, d = Math.abs(xs - ir); return Lr + 2 * rho * (1 - Math.exp(-d / hc)); };
  const u = new Array(n), ii = new Array(n), LL = new Array(n), kx = [0, 0, 0, 0], ku = [0, 0, 0, 0];
  for (let j = 0; j < n; j++) { const ue = uE[j]; let su = 0, si = 0, sL = 0;
    for (let sub = 0; sub < unter; sub++) {
      for (let st = 0; st < 4; st++) { let xs, us; if (st === 0) { xs = x; us = uc; } else if (st === 1) { xs = x + h / 2 * kx[0]; us = uc + h / 2 * ku[0]; } else if (st === 2) { xs = x + h / 2 * kx[1]; us = uc + h / 2 * ku[1]; } else { xs = x + h * kx[2]; us = uc + h * ku[2]; }
        const L = Ld(xs), ul = ue - R * xs - us; kx[st] = ul / L; ku[st] = xs / (C0 / (1 + ga * us * us)); if (st === 0) { su += us; si += xs; sL += L; } }
      x += h / 6 * (kx[0] + 2 * kx[1] + 2 * kx[2] + kx[3]); uc += h / 6 * (ku[0] + 2 * ku[1] + 2 * ku[2] + ku[3]);
      if (!Number.isFinite(x) || !Number.isFinite(uc)) return null;
      const ul = ue - R * x - uc; if (ul * s < 0) { s = -s; if (ns < 64) stapel[ns++] = x; }
      while (ns >= 2 && ((s > 0 && x >= stapel[ns - 2]) || (s < 0 && x <= stapel[ns - 2]))) ns -= 2; }
    u[j] = su / unter + (uc - su / unter) / (2 * unter); ii[j] = si / unter + (x - si / unter) / (2 * unter); LL[j] = sL / unter; }
  const dU = kk.uC.slice(-20).reduce((a, v) => a + v, 0) / 20, e = u.map((v, j) => v - kk.uC[j]), i0 = ikRoh.slice(-m100).reduce((a, v) => a + v, 0) / m100, ik = ikRoh.map(v => v - i0), ei = ii.map((v, j) => v - ik[j]);
  return {k: kk, u, i: ii, L: LL, dU, uInf, rmse: rms(e) / dU * 100, max: Math.max(...e.map(Math.abs)) / dU * 100, irms: rms(ei) * 1000, scheitel: Math.max(...u), scheitelMess: Math.max(...kk.uC), ik, iMax: Math.max(...ik.map(Math.abs))};
}
function lmKlein(resid, p0, maxIt, schritt) {   // kleiner Levenberg-Marquardt (numerische Ableitung, relativer Schritt), für den Ausklang und als Baustein
  let z = p0.slice(), r = resid(z); if (!r) return null; const O = a => a.reduce((s, v) => s + v * v, 0); let Oz = O(r), lam = 1e-2, n = z.length;
  for (let it = 0; it < maxIt; it++) { const J = []; for (let j = 0; j < n; j++) { const zj = z.slice(), d = schritt * Math.max(Math.abs(z[j]), 1e-3); zj[j] += d; const rj = resid(zj); J.push(rj ? rj.map((v, q) => (v - r[q]) / d) : r.map(() => 0)); }
    const M = Array.from({length: n}, () => new Array(n).fill(0)), g = new Array(n).fill(0);
    for (let a = 0; a < n; a++) { for (let q = 0; q < r.length; q++) g[a] += J[a][q] * r[q]; for (let b = a; b < n; b++) { let sum = 0; for (let q = 0; q < r.length; q++) sum += J[a][q] * J[b][q]; M[a][b] = M[b][a] = sum; } }
    let ok = false; for (let v = 0; v < 16; v++) { const Md = M.map((row, a) => row.map((q, b) => a === b ? q + lam * (q + 1e-12) : q)), dl = cholLoesen(Md, g.map(q => -q)), zn = z.map((q, j) => q + dl[j]), rn = resid(zn);
      if (rn && O(rn) < Oz) { const rel = (Oz - O(rn)) / Oz; z = zn; r = rn; Oz = O(rn); lam = Math.max(1e-9, lam / 3); ok = true; if (rel < 1e-9) it = maxIt; break; } lam *= 4; }
    if (!ok) break; }
  return {z, cost: Oz, r};
}
function ausklang(t, u, t0 = 0.17, t1 = 0.45) {   // gedämpfte Schwingung U∞ + A·e^{−αt}·cos(ωt+φ) an den Ausklang: {a, w, zeta, Uinf}
  const idx = []; for (let j = 0; j < t.length; j++) if (t[j] >= t0 && t[j] <= t1) idx.push(j); if (idx.length < 30) return null;
  const tt = idx.map(j => t[j] - t0), uu = idx.map(j => u[j]), f = p => uu.map((v, q) => p[0] + p[1] * Math.exp(-p[2] * tt[q]) * Math.cos(p[3] * tt[q] + p[4]) - v);
  let best = null; const Uinf = uu.slice(-20).reduce((a, v) => a + v, 0) / 20, A0 = (Math.max(...uu.slice(0, 40)) - Math.min(...uu.slice(0, 40))) / 2;
  for (const w of [80, 95, 110]) for (const ph of [0, 1.5, 3, 4.5]) { const r = lmKlein(f, [Uinf, A0, 20, w, ph], 60, 1e-4); if (r && (!best || r.cost < best.cost)) best = r; }
  const a = best.z[2], w = Math.abs(best.z[3]), w0 = Math.sqrt(w * w + a * a); return {a, w, zeta: a / w0, w0, Uinf: best.z[0]};
}
function huelle(z, dUz) { const a = z.uC.map(v => Math.abs(v - dUz)), h = 60, e = new Array(z.n); for (let j = 0; j < z.n; j++) { let mx = 0; for (let q = Math.max(0, j - h); q <= Math.min(z.n - 1, j + h); q++) mx = Math.max(mx, a[q]); e[j] = mx + 0.1 * dUz; } const m = e.reduce((p, q) => p + 1 / q, 0) / z.n; return e.map(v => 1 / v / m); }
async function preisachFit(still) {   // Schritt 13: sechs physikalische Parameter gegen alle Messungen (u_C, Strom gewichtet) nachstellen
  if (!E) { $("hr_pr_stand").textContent = "Erst „Alle Schritte rechnen“."; return; }
  const ziele = kurvenHR(), k = E.k, unterS = 10, unterE = 40, ueArt = $("hr_pr_ue").value, wI = Number($("hr_pr_strom").value) || 0, maxIt = Number($("hr_pr_it").value) || 40, gew = $("hr_such_gew").checked, t0 = performance.now();
  // Startwerte aus den Schritten 2–8 (nichts Gespeichertes): C_d aus q̃ (0 V und U∞), L_rev aus dem Ausklang der gewählten Messung, R aus Schritt 2
  const dU = E.dU, C0s = Math.max(5e-6, E.fQ.df(0)), CU = Math.max(3e-6, E.fQ.df(dU)), ga0 = Math.max(0.005, (C0s / CU - 1) / (dU * dU));
  const ak = ausklang(k.t, k.uC), Lr0 = ak ? Math.max(0.5, 0.9 / (ak.w0 * ak.w0 * CU)) : 4, p0 = [Lr0, 25, 0.008, C0s, ga0, E.RCu + E.Rs];
  const skala = p0.map(v => Math.abs(v)), entp = z => ({Lr: z[0] * skala[0], rho: z[1] * skala[1], hc: z[2] * skala[2], C0: z[3] * skala[3], ga: z[4] * skala[4], R: z[5] * skala[5]});
  const daten = ziele.map(z => { const dUz = z.uC.slice(-20).reduce((a, v) => a + v, 0) / 20; return {z, dUz, g: gew ? huelle(z, dUz) : null}; });
  const resid = z => { const p = entp(z); if (p.Lr <= 0 || p.rho < 0 || p.hc <= 1e-5 || p.C0 <= 0 || p.ga < 0 || p.R < 10) return null; const r = [];
    for (const {z: kk, dUz, g} of daten) { const d = preisachSim(p, kk, unterS, ueArt); if (!d) return null; const iM = d.iMax || 1; for (let j = 0; j < kk.n; j++) { r.push((d.u[j] - kk.uC[j]) / dUz * (g ? g[j] : 1)); if (wI) r.push(wI * (d.i[j] - d.ik[j]) / iM); } } return r; };
  const O = r => r.reduce((a, v) => a + v * v, 0), nR = () => daten.reduce((a, d) => a + d.z.n, 0), nP = 6; let ausw = 0; const verlauf = [];
  const lm = async (z, r, Oz, maxIt, dz, stufe) => {   // eine Stufe Levenberg-Marquardt ab z; dz = Differenzenschritt der skalierten Parameter
    let lam = 1e-2, it = 0;
    for (; it < maxIt; it++) {
      $("hr_pr_stand").textContent = `${stufe}: Schritt ${it + 1} von höchstens ${maxIt}, RMSE ${zahl(Math.sqrt(Oz / r.length) * 100, 3)} %, ${ausw} DGL-Läufe, ${zahl((performance.now() - t0) / 1000, 0)} s`; await pause();
      const J = []; for (let j = 0; j < nP; j++) { const zj = z.slice(); zj[j] += dz; const rj = resid(zj); ausw++; J.push(rj ? rj.map((v, q) => (v - r[q]) / dz) : r.map(() => 0)); }
      const M = Array.from({length: nP}, () => new Array(nP).fill(0)), g = new Array(nP).fill(0);
      for (let a = 0; a < nP; a++) { for (let q = 0; q < r.length; q++) g[a] += J[a][q] * r[q]; for (let b = a; b < nP; b++) { let sum = 0; for (let q = 0; q < r.length; q++) sum += J[a][q] * J[b][q]; M[a][b] = M[b][a] = sum; } }
      let ok = false;
      for (let v = 0; v < 22; v++) { const Md = M.map((row, a) => row.map((q, b) => a === b ? q + lam * (q + 1e-9) : q)), dl = cholLoesen(Md, g.map(q => -q)), zn = z.map((q, j) => q + dl[j]), rn = resid(zn); ausw++;
        if (rn && O(rn) < Oz) { const rel = (Oz - O(rn)) / Oz; z = zn; r = rn; Oz = O(rn); lam = Math.max(1e-7, lam / 3); ok = true; verlauf.push(Math.sqrt(Oz / r.length) * 100); if (rel < 1e-7) it = maxIt; break; } else lam *= 4; }
      if (!ok) break;
    }
    return {z, r, Oz, it};
  };
  // Grobsuche wie die Differentialevolution der Vorrechnung, nur sparsamer: 96 Zufallspunkte (Latin-Hypercube, fester Keim) im Kasten 0,4 … 2,5 je Parameter
  // (R 0,7 … 1,6), die vier besten mit drei LM-Stufen verfeinern, der beste zählt. Sechs feste Startpunkte (1.1 erste Fassung) fanden nur die Mulde R ≈ R_Cu + R_s (1,2 % ΔU);
  // die Vorrechnung preisach_1.8 (DE) liegt bei R ≈ 150 Ω, h_c 11 mA, ρ0 32 H mit 0,8 % -- dieselbe Zielfunktion (auf der Seite nachgerechnet).
  let keim = 20261124; const zufall = () => { keim |= 0; keim = keim + 0x6D2B79F5 | 0; let t = Math.imul(keim ^ keim >>> 15, 1 | keim); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const NS = 96, unten = [0.4, 0.4, 0.4, 0.6, 0.4, 0.7], oben = [2.5, 2.5, 2.5, 1.6, 2.5, 1.6], perm = [];
  for (let j = 0; j < nP; j++) { const a = Array.from({length: NS}, (_, q) => q); for (let q = NS - 1; q > 0; q--) { const w = Math.floor(zufall() * (q + 1)); [a[q], a[w]] = [a[w], a[q]]; } perm.push(a); }
  const kandidaten = [{z: p0.map(() => 1)}];
  for (let q = 0; q < NS; q++) kandidaten.push({z: Array.from({length: nP}, (_, j) => unten[j] + (perm[j][q] + zufall()) / NS * (oben[j] - unten[j]))});
  for (const kd of kandidaten) { const r0 = resid(kd.z); ausw++; kd.r = r0; kd.Oz = r0 ? O(r0) : Infinity; }
  $("hr_pr_stand").textContent = `Grobsuche: ${kandidaten.length} Punkte, beste ${zahl(Math.sqrt(Math.min(...kandidaten.map(k => k.Oz)) / nR()) * 100, 2)} %`; await pause();
  kandidaten.sort((a, b) => a.Oz - b.Oz); let e = null;
  for (const kd of kandidaten.slice(0, 4)) { let q = {z: kd.z, r: kd.r, Oz: kd.Oz};
    for (const [dz, mx] of [[1e-2, Math.ceil(maxIt / 3)], [3e-3, Math.ceil(maxIt / 3)], [1e-3, Math.ceil(maxIt / 4)]]) q = await lm(q.z, q.r, q.Oz, mx, dz, `Verfeinerung ab ${zahl(Math.sqrt(kd.Oz / nR()) * 100, 2)} %, Stufe ${dz}`);
    if (!e || q.Oz < e.Oz) e = q; }
  if (!e) { $("hr_pr_stand").textContent = "Startwerte untauglich (Lösung läuft weg)."; return; }
  e = await lm(e.z, e.r, e.Oz, maxIt, 1e-3, "Feinstufe");
  const z = e.z, it = verlauf.length;
  const p = entp(z), sim = ziele.map(kk => preisachSim(p, kk, unterE, ueArt)).filter(Boolean);
  const aus = sim.map(d => { const mess = ausklang(d.k.t, d.k.uC), mod = ausklang(d.k.t, d.u); const Cq = p.C0 / (1 + p.ga * d.uInf * d.uInf); const L = a => a ? 1 / (a.w0 * a.w0 * Cq) : NaN; return {k: d.k, mess, mod, Lm: L(mess), Ls: L(mod), Rm: mess ? 2 * mess.a * L(mess) : NaN, Rsim: mod ? 2 * mod.a * L(mod) : NaN}; });
  E.preisach = {p, p0: entp(p0.map(() => 1)), sim, aus, verlauf, it, ausw, dauer: (performance.now() - t0) / 1000, ueArt, wI, gew, ziele: ziele.map(x => x.id), nR: nR()};
  const eig = sim.find(x => x.k === k);
  $("hr_pr_stand").textContent = `Fertig nach ${E.preisach.it} Schritten (${ausw} DGL-Läufe, ${zahl(E.preisach.dauer, 0)} s): ${k.name} ${zahl(eig.rmse, 2)} % ΔU, Mittel über ${sim.length} Messungen ${zahl(sim.reduce((a, x) => a + x.rmse, 0) / sim.length, 2)} %.`;
  if (!still) zeichneAlles();
}
$("hr_pr_start").onclick = async () => { $("hr_pr_start").disabled = true; try { await preisachFit(); } catch (e) { $("hr_pr_stand").textContent = "Fehler: " + e.message; console.error(e); } $("hr_pr_start").disabled = false; };
for (const id of ["hr_pr_ue", "hr_pr_strom", "hr_pr_it"]) $(id).onchange = () => { if (E) { E.preisach = null; $("hr_pr_stand").textContent = "Werte geändert – „Modell anpassen“ drücken."; zeichneAlles(); } };
function preisachFormeln() {   // Gleichungen des Modells (MathML über die Helfer der Seite; feste Klammern um Argumente, dehnbare nur um Brüche in eigener mrow)
  const bruch = (a, b) => `<mfrac>${a}${b}</mfrac>`, klammerBruch = inner => `<mrow><mo>(</mo>${inner}<mo>)</mo></mrow>`;
  const g1 = mathe(`${mi("ρ")}${mof("(")}${mi("α")}${mo(",")}${mi("β")}${mof(")")}${mo("=")}${bruch(sub("ρ", mn(0)), sub("h", mi("c")))}${mo("·")}${mi("exp")}${mo("⁡")}${klammerBruch(`${mo("−")}${bruch(`<mrow>${mi("α")}${mo("−")}${mi("β")}</mrow>`, sub("h", mi("c")))}`)}${mo(",")}<mspace width="1em"/>${mi("h")}${mo("=")}${mi("α")}${mo("−")}${mi("β")}${mo("≥")}${mn(0)}`);
  const g2 = mathe(`${sub("L", mi("d"))}${mof("(")}${mi("i")}${mof(")")}${mo("=")}${sub("L", mi("rev"))}${mo("+")}${mn(2)}${sub("ρ", mn(0))}${mo("·")}${mof("[")}${mn(1)}${mo("−")}${mi("exp")}${mo("⁡")}${klammerBruch(`${mo("−")}${bruch(`<mrow>${mof("|")}${mi("i")}${mo("−")}${sub("i", mi("r"))}${mof("|")}</mrow>`, sub("h", mi("c")))}`)}${mof("]")}${mo(",")}<mspace width="1em"/>${mi("Neukurve")}${mo(":")}${sub("i", mi("r"))}${mo("=")}${mo("−")}${mi("i")}`);
  const g3 = mathe(`${sub("L", mi("d"))}${mo("≈")}${sub("L", mi("rev"))}${mo("+")}${mi("ν")}${mo("·")}${mof("|")}${mi("i")}${mo("−")}${sub("i", mi("r"))}${mof("|")}${mo(",")}<mspace width="1em"/>${mi("ν")}${mo("=")}${bruch(`<mrow>${mn(2)}${sub("ρ", mn(0))}</mrow>`, sub("h", mi("c")))}<mspace width="1em"/>${mo("(")}${mi("Rayleigh")}${mo(",")}${mof("|")}${mi("i")}${mo("−")}${sub("i", mi("r"))}${mof("|")}${mo("≪")}${sub("h", mi("c"))}${mo(")")}`).replace('<mo>(</mo>' + mi("Rayleigh"), '<mo stretchy="false">(</mo>' + mi("Rayleigh")).replace(`${sub("h", mi("c"))}<mo>)</mo>`, `${sub("h", mi("c"))}<mo stretchy="false">)</mo>`);
  const g4 = mathe(`${mi("C")}${mof("(")}${sub("u", mi("C"))}${mof(")")}${mo("=")}${bruch(sub("C", mn(0)), `<mrow>${mn(1)}${mo("+")}${mi("γ")}<msup>${sub("u", mi("C"))}${mn(2)}</msup></mrow>`)}`);
  const g5 = mathe(`${sub("L", mi("d"))}${mof("(")}${mi("i")}${mo(",")}${mi("Gedächtnis")}${mof(")")}${mo("·")}${bruch(`<mrow>${mi("d")}${mi("i")}</mrow>`, `<mrow>${mi("d")}${mi("t")}</mrow>`)}${mo("=")}${sub("u", mi("E"))}${mo("−")}${mi("R")}${mo("·")}${mi("i")}${mo("−")}${sub("u", mi("C"))}${mo(",")}<mspace width="1em"/>${mi("C")}${mof("(")}${sub("u", mi("C"))}${mof(")")}${mo("·")}${bruch(`<mrow>${mi("d")}${sub("u", mi("C"))}</mrow>`, `<mrow>${mi("d")}${mi("t")}</mrow>`)}${mo("=")}${mi("i")}`);
  const zusammen = (x, y) => x.replace("</mrow></math>", `<mspace width="2em"/>${y.slice(y.indexOf("<mrow>") + 6, y.lastIndexOf("</mrow>"))}</mrow></math>`);   // zwei Gleichungen in einer Zeile
  return g1 + zusammen(g2, g3) + zusammen(g4, g5);
}
$("hr_pr_formeln").innerHTML = preisachFormeln();
ZEICHNER[13] = () => { const P = E.preisach, k = E.k; if (!P) { for (const c of ["c13a", "c13b", "c13c"]) leer($(c), "„Modell anpassen“ drücken"); $("hr_z13").innerHTML = ""; return; }
  const sim = P.sim, eig = sim.find(x => x.k === k) || sim[0], T = ms(eig.k.t), tEnd = Math.min(T[T.length - 1], 350);   // bis 350 ms: danach nur Ruhe
  { const alle = sim.flatMap(x => [...x.k.uC, ...x.u]), [lo, hi] = spanne(alle), {g, X, Y} = bildAchsen($("c13a"), 0, tEnd, ...rahmen(0, 0, Math.min(0, lo), hi).slice(2), "u_C / V", "t / ms   ·   farbig Messungen, schwarz Modell");
    for (const x of sim) { zug(g, X, Y, ms(x.k.t), x.k.uC, x.k.farbe, 1.6); zug(g, X, Y, ms(x.k.t), x.u, "#111", 0.9); } g.restore(); }
  { const rs = sim.map(x => x.u.map((v, j) => (v - x.k.uC[j]) / x.dU * 100)), [lo, hi] = spanne(rs.flat()), {g, X, Y} = bildAchsen($("c13b"), 0, tEnd, ...rahmen(0, 0, lo, hi).slice(2), "Rest / % ΔU", "t / ms   ·   Modell − Messung: " + sim.map(x => `${(x.k.name.match(/_T(\d+)_/) || ["", "?"])[1]} ${zahl(x.rmse, 2)}`).join(", ") + " %");
    sim.forEach((x, q) => zug(g, X, Y, ms(x.k.t), rs[q], x.k.farbe, 1.2)); g.restore(); }
  { const iM = mA(eig.i), [a, b] = spanne(iM), [c, d] = spanne(eig.L), {g, X, Y} = bildAchsen($("c13c"), ...rahmen(a, b, 0, 0).slice(0, 2), ...rahmen(0, 0, 0, d).slice(2), "L_d / H", "i / mA   ·   L_d entlang der Lösung " + (eig.k.name.match(/_T(\d+)_/) || ["", ""])[1] + ", Farbe = Zeit; Umkehr: L_rev " + zahl(P.p.Lr, 2) + " H");
    punkte(g, X, Y, iM, eig.L, j => zeitfarbe(j, eig.k.n), 1.8); g.restore(); }
  const p = P.p, nu = 2 * p.rho / p.hc, Lneu = p.Lr + 2 * p.rho * (1 - Math.exp(-2 * 2.8e-3 / p.hc)), RPort = p.R - E.Rs - (E.RCu || 0);
  const mittel = sim.reduce((a, x) => a + x.rmse, 0) / sim.length, S = E.suche, direktRmse = E.uFit ? rms(E.uFit.map((v, j) => v - k.uC[j])) / E.dU * 100 : NaN;
  const befund = `<b>Befund.</b> Ein Parametersatz mit sechs physikalischen Größen trifft alle ${sim.length} Messungen auf ${sim.map(x => zahl(x.rmse, 2)).join(" / ")} % ΔU (Mittel ${zahl(mittel, 2)} %; Kennlinienweg nach der gemeinsamen Suche ${S ? S.sim.map(x => zahl(x.rmse, 2)).join(" / ") : "–"} % mit ${E.fPsi.P + E.fQ.P + 2} Parametern). ` +
    `Die Anfangsinduktivität am Umkehrpunkt ist ${zahl(p.Lr, 2)} H; mit dem Abstand vom Umkehrpunkt wächst L<sub>d</sub> (Rayleigh-Konstante ν = ${zahl(nu, 0)} H/A) bis ${zahl(p.Lr + 2 * p.rho, 1)} H, auf der Neukurve bei 2,8 mA ${zahl(Lneu, 1)} H. Das erklärt die lange erste Schwingung (große Hübe) und das kurze Ausklingen, und die Schleifenfläche der Hysterese ist der amplitudenabhängige Verlust. ` +
    `Im Ausklang (170–450 ms, kleine Amplitude) ist die gemessene Dämpfung ${P.aus.filter(a => a.mess && a.mod).map(a => zahl(a.mess.zeta, 3)).join(" / ")} (ζ), das Modell gibt ${P.aus.filter(a => a.mess && a.mod).map(a => zahl(a.mod.zeta, 3)).join(" / ")}: dem Modell fehlt dort ein linearer Verlust, den ein fester R<sub>Fe</sub> nicht liefern kann, ohne die erste Schwingung zu überdämpfen (Vorrechnung). Zwei Aufzeichnungen derselben Anregung unterscheiden sich um etwa 0,5 % ΔU (Schritt 14); ein gemeinsames Modell kann nicht genauer werden.`;
  $("hr_z13").innerHTML = `<div class="kasten" style="max-width:1400px">${befund}</div>` +
    tafel(["Parameter", "Start (aus den Schritten 2–8)", "angepasst", "Bedeutung"], [["L_rev / H", zahl(P.p0.Lr, 3), zahl(p.Lr, 3), "reversible Induktivität am Umkehrpunkt (kleinste Steigung ψ(i))"], ["ρ0 / H", zahl(P.p0.rho, 2), zahl(p.rho, 2), "Gewicht der Hysteronen: L_d wächst bis L_rev + 2ρ0"], ["h_c / mA", zahl(P.p0.hc * 1000, 2), zahl(p.hc * 1000, 2), "Breite der Koerzitivverteilung (Stromäquivalent)"], ["ν = 2ρ0/h_c / (H/A)", zahl(2 * P.p0.rho / P.p0.hc, 0), zahl(nu, 0), "Rayleigh-Konstante: Anstieg von L_d je Ampere Abstand vom Umkehrpunkt"], ["C0 / µF", zahl(P.p0.C0 * 1e6, 2), zahl(p.C0 * 1e6, 2), "Kapazität bei 0 V"], ["γ / V⁻²", zahl(P.p0.ga, 4), zahl(p.ga, 4), `C(U∞) = ${zahl(p.C0 / (1 + p.ga * E.dU * E.dU) * 1e6, 1)} µF bei ${zahl(E.dU, 2)} V`], ["R / Ω", zahl(P.p0.R, 1), zahl(p.R, 1), P.ueArt === "ideal" ? `R_Cu + R_s + Ausgangswiderstand des Pins (= ${zahl(RPort, 0)} Ω bei R_Cu ${zahl(E.RCu, 0)} Ω)` : "R_Cu + R_s"], ["Anregung", "", P.ueArt === "ideal" ? "ideal: Sprung auf U∞ aus u_C" : "u_E der Messung (wie oben gewählt)", ""], ["Suche", "", `${P.it} LM-Schritte, ${P.ausw} DGL-Läufe, ${zahl(P.dauer, 0)} s, Strom-Gewicht ${P.wI}${P.gew ? ", Hüllkurven-Gewichtung" : ""}`, ""]]) +
    tafel(["Messung", "RMSE / % ΔU", "größter Fehler / %", "Scheitel Modell / V", "Scheitel Messung / V", "Strom RMSE / mA", "Ausklang ζ gemessen", "ζ Modell", "L aus ω0 gemessen / H", "Modell / H", "R_eff gemessen / Ω", "Modell / Ω"], sim.map((x, q) => { const a = P.aus[q]; return [x.k.name + (x.k === k ? " (gewählt)" : ""), zahl(x.rmse, 2), zahl(x.max, 1), zahl(x.scheitel, 3), zahl(x.scheitelMess, 3), zahl(x.irms, 3), a.mess ? zahl(a.mess.zeta, 3) : "–", a.mod ? zahl(a.mod.zeta, 3) : "–", zahl(a.Lm, 2), zahl(a.Ls, 2), zahl(a.Rm, 0), zahl(a.Rsim, 0)]; })) +
    tafel(["Weg", "Parameter", "gilt für", k.name + " RMSE / % ΔU", "alle Messungen"], [["direkter Fit der Sprungantwort (Schritt 9, tanh-Summe K = " + E.fDir.K + ")", E.fDir.P, "eine Messung", zahl(direktRmse, 2), "je Messung eigener Satz"], ["Kennlinienweg (Schritte 2–8, ohne Sprungantwort)", E.fPsi.P + E.fQ.P + 2, "aus " + k.name, zahl(E.sim.find(x => x.k === k).rmse, 2), E.sim.map(x => zahl(x.rmse, 2)).join(" / ")], ["Kennlinienweg nach gemeinsamer Suche (Schritt 11)", E.fPsi.P + E.fQ.P + 2, S && S.ziele.length > 1 ? "alle" : "eine", S ? zahl(S.sim.find(x => x.k === k).rmse, 2) : "–", S ? S.sim.map(x => zahl(x.rmse, 2)).join(" / ") : "–"], ["physikalisches Modell (Preisach + C(u) + R)", 6, "alle", zahl(eig.rmse, 2), sim.map(x => zahl(x.rmse, 2)).join(" / ")]]) +
    `<div class="block"><b>Verlauf der Anpassung (Effektivwert je angenommenem Schritt)</b>` + tafel(["Schritt", "RMSE / %"], P.verlauf.map((v, j) => [j, zahl(v, 3)])) + `</div>`; };
// ---------- Schritt 14 (2.26): Wiederholbarkeit -- zwei Aufzeichnungen derselben Anregung
ZEICHNER[14] = () => { const alle = kurvenHR(), tv = n => { const m = /_T(\d+)_/.exec(n); return m ? Number(m[1]) : NaN; };
  let paar = null; for (let a = 0; a < alle.length && !paar; a++) for (let b = a + 1; b < alle.length; b++) if (tv(alle[a].name) === tv(alle[b].name) && Number.isFinite(tv(alle[a].name)) && alle[a].n === alle[b].n) { paar = [alle[a], alle[b]]; break; }
  if (!paar) { leer($("c14a"), "zwei Messungen derselben Anregung (gleiches T) laden"); leer($("c14b"), ""); $("hr_z14").innerHTML = `<div class="kasten">Für diesen Schritt braucht es zwei Aufzeichnungen mit gleichem T (z. B. T140 von zwei Tagen). Geladen: ${alle.map(x => x.name).join(", ")}.</div>`; return; }
  const [A, B] = paar, T = ms(A.t), dUa = A.uC.slice(-20).reduce((p, q) => p + q, 0) / 20, dUb = B.uC.slice(-20).reduce((p, q) => p + q, 0) / 20, e = B.uC.map((v, j) => v - A.uC[j]), eR = rms(e), jm = e.reduce((m, v, j) => Math.abs(v) > Math.abs(e[m]) ? j : m, 0);
  { const [lo, hi] = spanne([...A.uC, ...B.uC]), {g, X, Y} = bildAchsen($("c14a"), 0, T[T.length - 1], ...rahmen(0, 0, Math.min(0, lo), hi).slice(2), "u_C / V", `t / ms   ·   ${A.name} (${A.farbe === B.farbe ? "dunkel" : "Farbe der Kurve"})   ·   ${B.name}`); zug(g, X, Y, T, A.uC, A.farbe, 1.8); zug(g, X, Y, T, B.uC, B.farbe === A.farbe ? "#111" : B.farbe, 1.2); g.restore(); }
  { const eM = e.map(v => v * 1000), [lo, hi] = spanne(eM), {g, X, Y} = bildAchsen($("c14b"), 0, T[T.length - 1], ...rahmen(0, 0, Math.min(lo, 0), Math.max(hi, 0)).slice(2), "Unterschied / mV", `t / ms   ·   ${B.name} − ${A.name}: Effektivwert ${zahl(eR * 1000, 1)} mV = ${zahl(eR / dUa * 100, 2)} % ΔU, größter ${zahl(e[jm] * 1000, 1)} mV bei ${zahl(T[jm], 0)} ms`); zug(g, X, Y, T, eM, "#b42318", 1.4); g.restore(); }
  const iA = ($("i_median").checked ? median3(A.i) : A.i), iB = ($("i_median").checked ? median3(B.i) : B.i), P = E && E.preisach ? E.preisach.sim : null, pa = P ? P.find(x => x.k === A) : null, pb = P ? P.find(x => x.k === B) : null;
  $("hr_z14").innerHTML = `<div class="kasten" style="max-width:1400px"><b>Befund.</b> Zwei Aufzeichnungen derselben Anregung unterscheiden sich um ${zahl(eR / dUa * 100, 2)} % ΔU im Effektivwert, bis ${zahl(Math.abs(e[jm]) * 1000, 0)} mV bei ${zahl(T[jm], 0)} ms${T[jm] < 60 ? " – im Anstieg, wo auch jedes DGL-Modell seinen größten Rest hat" : ""}; die Scheitel liegen bei ${zahl(Math.max(...A.uC), 3)} und ${zahl(Math.max(...B.uC), 3)} V. So gut ist die Messung wiederholbar; ein gemeinsames Modell über mehrere Aufzeichnungen kann nicht genauer sein, der direkte Fit einer einzelnen Aufzeichnung (0,1 %) passt deren Eigenheiten mit. Vermutliche Ursache des Unterschieds im Anstieg: der magnetische Vorzustand der Drossel (welche Messung vorher lief).</div>` +
    tafel(["", A.name, B.name], [["U∞ / V", zahl(dUa, 4), zahl(dUb, 4)], ["Scheitel / V", zahl(Math.max(...A.uC), 4), zahl(Math.max(...B.uC), 4)], ["Zeit des Scheitels / ms", zahl(T[A.uC.indexOf(Math.max(...A.uC))], 0), zahl(T[B.uC.indexOf(Math.max(...B.uC))], 0)], ["größter Strom / mA", zahl(Math.max(...iA) * 1000, 2), zahl(Math.max(...iB) * 1000, 2)], ["Unterschied u_C Effektivwert / mV (% ΔU)", "–", `${zahl(eR * 1000, 1)} (${zahl(eR / dUa * 100, 2)} %)`], ["größter Unterschied / mV bei t", "–", `${zahl(e[jm] * 1000, 1)} bei ${zahl(T[jm], 0)} ms`]].concat(pa && pb ? [["Preisach-Modell RMSE / % ΔU", zahl(pa.rmse, 2), zahl(pb.rmse, 2)]] : [])); };
