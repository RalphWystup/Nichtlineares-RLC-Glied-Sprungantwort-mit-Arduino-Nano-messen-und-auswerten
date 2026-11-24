"""pruefe_dgl_fit_1.0.py (24.11.2026) -- sein Wort: „bitte den abgleich der DGL lösung nochmals prüfen, da das anfitten mit der DGL keine sauberen
lösungen brachte“. Zwei Proben am Löser/Fitter von preisach_1.8 (Kern wie auf der Seite geplant):
(1) Schrittweite: dieselbe Lösung mit 4, 10, 40, 100 Unterschritten je ms -- größte Abweichung gegen 100 (muss ≪ Rest 0,8 % sein).
(2) Wiederfinden: aus bekannten Parametern p* vier synthetische Sprungantworten (reale Anregung T60…T140, ideal) erzeugen, Messrauschen 3 mV
    (Gauß) und 5-mV-Quantisierung dazu, dann mit verstelltem Start (×0,5…2) fitten -- kommen p* und ein Rest auf Rauschhöhe (≈0,1 %) heraus?"""
import os, sys, numpy as np, time
os.environ["P18ARGS"] = "ue=ideal rcu=frei strom=0 global=1 bild=0"
sys.argv = ["x"]; import p18_defs as P
from scipy.optimize import least_squares, differential_evolution
p_true = P.voll(np.ones(len(P.frei))); p_true[0], p_true[1], p_true[2], p_true[5], p_true[6], p_true[7] = 4.24, 31.8, 0.0113, 26.9e-6, 0.0377, 102.7
print("(1) Schrittweite:")
for d in P.D:
    u100, _, _ = P.simuliere(p_true, d, 100)
    print("  T%d: " % d["T"] + ", ".join("unter %d: %.3f mV" % (n, np.abs(P.simuliere(p_true, d, n)[0] - u100).max() * 1e3) for n in (4, 10, 40)))
print("(2) Wiederfinden aus synthetischen Antworten (Rauschen 3 mV + 5-mV-Stufen):")
rng = np.random.default_rng(3)
for d in P.D:
    u, ii, _ = P.simuliere(p_true, d, 10); d["uC"] = np.round((u + rng.normal(0, 0.003, len(u))) / 0.00489) * 0.00489; d["i"] = ii; d["dU"] = d["uC"][-20:].mean()
z0 = np.array([0.5, 2.0, 0.7, 1.5, 0.6, 1.3][:len(P.frei)]); t0 = time.time()
g = differential_evolution(lambda z: float(np.sum(P.resid(z) ** 2)), [(0.2, 4)] * len(P.frei), seed=1, maxiter=80, popsize=14, tol=1e-9, polish=False)
r = least_squares(P.resid, g.x, diff_step=1e-2, xtol=1e-10, ftol=1e-10); z = r.x
for runde in range(3):
    r2 = least_squares(P.resid, z, diff_step=[3e-3, 1e-3, 3e-4][runde], xtol=1e-10, ftol=1e-10)
    if r2.cost < r.cost: r = r2; z = r2.x
p = P.voll(z); print("  %.0f s" % (time.time() - t0))
for k in P.frei: print("  %-12s wahr %.5g  gefunden %.5g  (%.2f %%)" % (P.namen[k], p_true[k], p[k], (p[k] / p_true[k] - 1) * 100))
for d in P.D:
    u, _, _ = P.simuliere(p, d, 10); e = u - d["uC"]; print("  T%d: Rest RMSE %.3f %% ΔU (Rauschen allein %.3f %%)" % (d["T"], e.std() / d["dU"] * 100, 0.003 / d["dU"] * 100))
