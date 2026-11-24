#!/usr/bin/env python3
"""rayleigh_1.0.py (24.11.2026) -- physikalisches Modell der amplitudenabhängigen Dämpfung: Rayleigh-Hysterese der Eisendrossel.
Befund (extrema_1.0.py): halbe Schwingungsdauer fällt in jeder Aufzeichnung von 53 ms (erste Schwingung) auf 32 ms (Ausklingen),
die Dämpfung der ersten Halbschwingung wächst mit der Amplitude (ζ 0,25 bei T60 → 0,30 bei T140), die späte Dämpfung ist in allen vier gleich.
Rayleigh (1887), Bozorth Kap. 11: im Kleinfeldbereich gilt auf jedem Ast ab dem Umkehrpunkt (i_r, ψ_r)
    ψ = ψ_r + s·[L_i·d + (ν/2)·d²],  d = s·(i_m − i_r) ≥ 0,  s = Richtung,  L_d = L_i + ν·d;
Neukurve ψ = L_i·i + ν·i² (Faktor ν statt ν/2). Verlust je Zyklus (4/3)·ν·î³, Energie ~ (L_i + ν î) î²/2 → relative Dämpfung wächst mit î,
Induktivität wächst mit dem Hub → lange Periode bei großer Amplitude, kurze beim Ausklingen (L_i).
Kondensator: C(u) = C_0/(1 + γ u²) (Manuskript Gl. 5.1). Wirbelstrom R_Fe parallel (wahlweise), Kupfer R_Cu + Shunt R_s in Reihe.
Aufruf: python3 rayleigh_1.0.py [ue=dreieck|roh] [rfe=1|0] [rcu=fest|frei]
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import numpy as np, sys, time, glob, os
from scipy.optimize import least_squares
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
arg = dict(a.split("=") for a in sys.argv[1:]); UE = arg.get("ue", "dreieck"); MITRFE = arg.get("rfe", "0") == "1"; RCUFREI = arg.get("rcu", "fest") == "frei"
Rs = 47.0; dt = 0.001; UNTER = 10

def mittel(a, w):
    h = w // 2; r = np.empty_like(a)
    for n in range(len(a)): r[n] = a[max(0, n - h):n + h + 1].mean()
    return r
def lade(f):
    D = np.loadtxt(f, comments="#"); t, uC, uE, i = D[:, 1], D[:, 9], D[:, 13], D[:, 14] / 1000; m = t >= 0
    t, uC, uE, i = t[m], uC[m], uE[m], i[m]
    if UE == "dreieck": uE = mittel(mittel(uE, 5), 5)
    return dict(T=int(f.split("_T")[1].split("_")[0]), t=t, uC=uC, uE=uE, i=i, dU=uC[-20:].mean())
D = sorted([lade(f) for f in glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt"))], key=lambda d: d["T"])

def simuliere(p, d, unter=UNTER):
    """p = (L_i, nu, C0, gamma, RCu, RFe); liefert u_C(t), i(t)."""
    Li, nu, C0, ga, RCu, RFe = p; R = RCu + Rs; h = dt / unter; uE = d["uE"]; n = len(uE)
    # Zustand: psi, uC; Gedächtnis: s (Richtung), ir, pr, c (Astkoeffizient: nu Neukurve, nu/2 danach)
    st = dict(s=1.0, ir=0.0, pr=0.0, c=nu)
    def im_von(ps):
        a = st["s"] * (ps - st["pr"]); c = st["c"]
        if a < 0: a = 0.0
        dd = (np.sqrt(Li * Li + 2 * c * a) - Li) / c if c > 0 else a / Li
        return st["ir"] + st["s"] * dd
    def rhs(ps, uc, ue):
        x = im_von(ps)
        ul = (ue - R * x - uc) / (1 + R / RFe) if np.isfinite(RFe) else (ue - R * x - uc)
        ii = x + (ul / RFe if np.isfinite(RFe) else 0.0)
        C = C0 / (1 + ga * uc * uc)
        return ul, ii / C, ii, x
    ps, uc = 0.0, 0.0; out_u = np.empty(n); out_i = np.empty(n)
    for j in range(n):
        ue = uE[j]; r0 = rhs(ps, uc, ue); out_u[j] = uc; out_i[j] = r0[2]
        for _ in range(unter):
            k1 = rhs(ps, uc, ue); k2 = rhs(ps + h / 2 * k1[0], uc + h / 2 * k1[1], ue); k3 = rhs(ps + h / 2 * k2[0], uc + h / 2 * k2[1], ue); k4 = rhs(ps + h * k3[0], uc + h * k3[1], ue)
            ps += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); uc += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
            if not (np.isfinite(ps) and np.isfinite(uc)): return np.full(n, 1e3), np.full(n, 1e3)
            ul, _, _, x = rhs(ps, uc, ue)
            if ul * st["s"] < 0:   # Umkehrpunkt: neuer Ast ab (i_m, psi), Koeffizient nu/2
                st.update(s=-st["s"], ir=x, pr=ps, c=nu / 2)
    return out_u, out_i

def fehler(u, d): e = u - d["uC"]; return e.std() / d["dU"] * 100, np.abs(e).max() / d["dU"] * 100

# Startwerte: aus den Perioden (32 ms halbe Periode bei kleiner Amplitude, C(2,7 V) ≈ 20 µF -> L_i ≈ 1/(ω² C))
C0, ga = 29e-6, 0.05; w = np.pi / 0.032; Li = 1 / (w * w * C0 / (1 + ga * 2.7 ** 2)); nu = 0.6 * Li / 1e-3; RCu = 92.0; RFe = 5000.0 if MITRFE else np.inf
p0 = np.array([Li, nu, C0, ga, RCu, RFe if MITRFE else 1.0])
frei = [0, 1, 2, 3] + ([4] if RCUFREI else []) + ([5] if MITRFE else [])
print("Start: L_i %.2f H, ν %.0f H/A, C0 %.1f µF, γ %.3f, R_Cu %.0f Ω, R_Fe %s" % (Li, nu, C0 * 1e6, ga, RCu, RFe), flush=True)
def voll(z):
    p = p0.copy()
    for j, k in enumerate(frei): p[k] = z[j] * p0[k]
    if not MITRFE: p[5] = np.inf
    return p
def resid(z, unter=4):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 0 or p[3] < 0 or p[4] < 10: return np.full(sum(len(d["uC"]) for d in D), 10.0)
    r = []
    for d in D: u, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"])
    return np.concatenate(r)
for d in D: u, _ = simuliere(p0 if MITRFE else voll(np.ones(len(frei))), d); print("  Start T%d: RMSE %.2f %% (max %.1f)" % (d["T"], *fehler(u, d)))
t0 = time.time(); z0 = np.ones(len(frei))
r = least_squares(resid, z0, method="trf", diff_step=1e-3, max_nfev=300, xtol=1e-7, ftol=1e-7)
p = voll(r.x); print("Suche: %d Auswertungen, %.0f s, Status %d" % (r.nfev, time.time() - t0, r.status))
print("Ergebnis: L_i %.3f H, ν %.0f H/A (ν·1 mA = %.3f H), C0 %.2f µF, γ %.4f 1/V², R_Cu %.1f Ω, R_Fe %s" % (p[0], p[1], p[1] * 1e-3, p[2] * 1e6, p[3], p[4], ("%.0f Ω" % p[5]) if MITRFE else "∞"))
print("  L_d am Umkehrpunkt = L_i; auf dem Ast nach 5,3 mA Hub: %.2f H; Neukurve bei 2,8 mA: %.2f H" % (p[0] + p[1] * 5.3e-3, p[0] + 2 * p[1] * 2.8e-3))
print("  C(0) %.1f µF, C(1,2 V) %.1f, C(2,7 V) %.1f, C(4,4 V) %.1f µF" % tuple(p[2] / (1 + p[3] * u * u) * 1e6 for u in (0, 1.2, 2.7, 4.4)))
ges = []
for d in D:
    u, ii = simuliere(p, d); e, mx = fehler(u, d); ges.append(e)
    k = np.argmax(u); km = np.argmax(d["uC"])
    print("  T%d: RMSE %.2f %% (max %.1f %%)  Scheitel sim %.3f V @ %d ms, gemessen %.3f V @ %d ms;  i: RMS-Abw. %.3f mA" % (d["T"], e, mx, u[k], d["t"][k] * 1e3, d["uC"][km], d["t"][km] * 1e3, (ii - d["i"]).std() * 1e3))
    np.save(os.path.join(H, "rayleigh_sim_T%d.npy" % d["T"]), np.vstack([d["t"], u, ii]))
print("Mittel RMSE %.2f %%" % np.mean(ges))
np.save(os.path.join(H, "rayleigh_param_%s_%s_%s.npy" % (UE, "rfe" if MITRFE else "ohne", "rcufrei" if RCUFREI else "rcufest")), p)
