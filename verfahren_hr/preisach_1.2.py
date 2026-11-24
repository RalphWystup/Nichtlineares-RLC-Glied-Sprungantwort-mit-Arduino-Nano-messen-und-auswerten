#!/usr/bin/env python3
"""preisach_1.2.py (24.11.2026; δ-Option nachgetragen: delta=<ms>|frei verschiebt die Simulation u(t+δ), weil der Rest früh im Anstieg (20 ms, −60…−120 mV) nach einem Zeitversatz aussieht: du_C/dt ≈ 90 V/s) -- wie preisach_1.1.py (Preisach-Hysterese mit Produktdichte, C(u) = C_0/(1+γu²)), aber:
(1) DGL-Schleife mit numba (etwa 100-mal schneller), (2) Strom mit 3-Punkt-Median (die periodischen Ausreißer des Shunt-Kanals,
Seite 2.21: PWM-Flanke läuft kapazitiv ans Spulenende; der „Scheitel 3,9 mA“ ist ein Treffer, echt 2,8 mA), (3) Bild der Residuen
(preisach_1.2_<kennung>.png) zum Ansehen, (4) wahlweise globale Suche (Differentialevolution) vor der lokalen.
Modell: L_d(i) = L_rev + 2ρ_0·w(i)·|W(i) − W(i_r)|, w = sech²(i/i_s), W = i_s·tanh(i/i_s), Umkehrpunkt-Stapel mit Löschregel;
i = i_m + u_L/R_Fe (R_Fe wahlweise), R = R_Cu + R_s in Reihe, du_C/dt = i/C(u_C).
Aufruf: python3 preisach_1.2.py [ue=dreieck|roh] [rfe=1|0] [rcu=fest|frei] [strom=<Gewicht>] [global=1|0] [bild=1|0]
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import numpy as np, sys, time, glob, os, json
from scipy.optimize import least_squares, differential_evolution
from numba import njit
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
arg = dict(a.split("=") for a in sys.argv[1:]); UE = arg.get("ue", "dreieck"); MITRFE = arg.get("rfe", "0") == "1"; RCUFREI = arg.get("rcu", "fest") == "frei"
DELTA = arg.get("delta", "0"); DFREI = DELTA == "frei"; D0 = 0.0 if DFREI else float(DELTA) * 1e-3   # Zeitversatz der Simulation in ms (frei: mitgesucht)
WSTROM = float(arg.get("strom", "1")); GLOBAL = arg.get("global", "0") == "1"; BILD = arg.get("bild", "1") == "1"
Rs = 47.0; dt = 0.001; UNTER = 10

def mittel(a, w):
    h = w // 2; r = np.empty_like(a)
    for n in range(len(a)): r[n] = a[max(0, n - h):n + h + 1].mean()
    return r
def median3(a):
    b = a.copy(); b[1:-1] = np.median(np.vstack([a[:-2], a[1:-1], a[2:]]), axis=0); return b
def lade(f):
    D = np.loadtxt(f, comments="#"); t, uC, uE, i = D[:, 1], D[:, 9], D[:, 13], D[:, 14] / 1000; m = t >= 0
    t, uC, uE, i = t[m], uC[m], uE[m], median3(i[m]); i = i - i[-100:].mean()
    if UE == "dreieck": uE = mittel(mittel(uE, 5), 5)
    return dict(T=int(f.split("_T")[1].split("_")[0]), t=t, uC=uC, uE=uE, i=i, dU=uC[-20:].mean(), iMax=np.abs(i).max())
D = sorted([lade(f) for f in glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt"))], key=lambda d: d["T"])

@njit(cache=True)
def sim_kern(Lr, rho, iS, C0, ga, R, RFe, uE, unter, dt):
    n = uE.shape[0]; h = dt / unter; out_u = np.empty(n); out_i = np.empty(n); out_L = np.empty(n)
    stapel = np.empty(64); ns = 0; s = 1.0; x = 0.0; uc = 0.0
    mitRFe = RFe < 1e11
    for j in range(n):
        ue = uE[j]
        for sub in range(unter + 1):
            # RK4 (sub < unter) bzw. Ausgabe (sub == 0 vor dem Schritt)
            if sub == 0:
                ir = stapel[ns - 1] if ns > 0 else -x
                L = Lr + 2 * rho / np.cosh(min(300.0, abs(x / iS))) ** 2 * abs(iS * np.tanh(x / iS) - iS * np.tanh(ir / iS))
                ul = (ue - R * x - uc) / (1 + R / RFe) if mitRFe else (ue - R * x - uc)
                ii = x + (ul / RFe if mitRFe else 0.0)
                out_u[j] = uc; out_i[j] = ii; out_L[j] = L
                continue
            # vier Stufen
            kx = np.empty(4); ku = np.empty(4)
            for st in range(4):
                if st == 0: xs = x; us = uc
                elif st == 1: xs = x + h / 2 * kx[0]; us = uc + h / 2 * ku[0]
                elif st == 2: xs = x + h / 2 * kx[1]; us = uc + h / 2 * ku[1]
                else: xs = x + h * kx[2]; us = uc + h * ku[2]
                ir = stapel[ns - 1] if ns > 0 else -xs
                L = Lr + 2 * rho / np.cosh(min(300.0, abs(xs / iS))) ** 2 * abs(iS * np.tanh(xs / iS) - iS * np.tanh(ir / iS))
                ul = (ue - R * xs - us) / (1 + R / RFe) if mitRFe else (ue - R * xs - us)
                ii = xs + (ul / RFe if mitRFe else 0.0)
                C = C0 / (1 + ga * us * us)
                kx[st] = ul / L; ku[st] = ii / C
            x += h / 6 * (kx[0] + 2 * kx[1] + 2 * kx[2] + kx[3]); uc += h / 6 * (ku[0] + 2 * ku[1] + 2 * ku[2] + ku[3])
            if not (np.isfinite(x) and np.isfinite(uc)):
                for q in range(n): out_u[q] = 1e3; out_i[q] = 1e3; out_L[q] = 1e3
                return out_u, out_i, out_L
            ul = (ue - R * x - uc) / (1 + R / RFe) if mitRFe else (ue - R * x - uc)
            if ul * s < 0:
                s = -s
                if ns < 64: stapel[ns] = x; ns += 1
            while ns >= 2 and ((s > 0 and x >= stapel[ns - 2]) or (s < 0 and x <= stapel[ns - 2])): ns -= 2
    return out_u, out_i, out_L

def verschiebe(a, dlt):   # a(t + δ), linear interpoliert, Rand gehalten
    if dlt == 0: return a
    x = np.arange(len(a)) + dlt / dt; return np.interp(x, np.arange(len(a)), a)
def simuliere(p, d, unter=UNTER):
    Lr, rho, iS, C0, ga, RCu, RFe, dlt = p
    u, ii, L = sim_kern(Lr, rho, iS, C0, ga, RCu + Rs, RFe if np.isfinite(RFe) else 1e12, d["uE"], unter, dt)
    return verschiebe(u, dlt), verschiebe(ii, dlt), L
def fehler(u, d): e = u - d["uC"]; return e.std() / d["dU"] * 100, np.abs(e).max() / d["dU"] * 100

C0, ga = 29e-6, 0.05; w0 = np.pi / 0.032; Lr = 1 / (w0 * w0 * C0 / (1 + ga * 2.7 ** 2))
p0 = np.array([Lr, 2600.0, 7e-3, 27e-6, 0.037, 92.0, 5000.0 if MITRFE else 1.0, 1.0])
frei = [0, 1, 2, 3, 4] + ([5] if RCUFREI else []) + ([6] if MITRFE else []) + ([7] if DFREI else [])
namen = ["L_rev/H", "rho0/(H/A)", "i_s/A", "C0/F", "gamma/V^-2", "R_Cu/Ω", "R_Fe/Ω", "delta/s"]
def voll(z):
    p = p0.copy()
    for j, k in enumerate(frei): p[k] = z[j] * p0[k]
    if not MITRFE: p[6] = np.inf
    p[7] = (z[frei.index(7)] - 1.0) * 1e-3 if DFREI else D0   # δ: Skala 1 ms um 0
    return p
nU = sum(len(d["uC"]) for d in D)
def resid(z, unter=4):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 0 or p[4] < 0 or p[5] < 10 or (MITRFE and p[6] < 100) or abs(p[7]) > 3e-3: return np.full(nU * (2 if WSTROM else 1), 10.0)
    r = []; ri = []
    for d in D:
        u, ii, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"])
        if WSTROM: ri.append(WSTROM * (ii - d["i"]) / d["iMax"])
    return np.concatenate(r + ri)
kennung = "%s_%s_%s_s%g%s" % (UE, "rfe" if MITRFE else "ohne", "rcufrei" if RCUFREI else "rcufest", WSTROM, "_glob" if GLOBAL else "") + ("_d%s" % DELTA if DELTA != "0" else "")
print("Modell: Preisach-Produktdichte 1.2; Anregung %s; R_Fe %s; R_Cu %s; Stromgewicht %g; global %s" % (UE, "frei" if MITRFE else "∞", "frei" if RCUFREI else "92 Ω fest", WSTROM, GLOBAL), flush=True)
t0 = time.time(); z = np.ones(len(frei)); simuliere(voll(z), D[0]); print("  numba bereit %.1f s" % (time.time() - t0), flush=True)
t0 = time.time()
if GLOBAL:
    grenzen = [(0.3, 3)] * len(frei)
    g = differential_evolution(lambda z: float(np.sum(resid(z) ** 2)), grenzen, seed=1, maxiter=60, popsize=12, tol=1e-8, polish=False)
    z = g.x; print("  global: Kosten %.4g, %d Auswertungen, %.0f s" % (g.fun / 2, g.nfev, time.time() - t0), flush=True)
best = None
for runde in range(4):
    r = least_squares(resid, z, method="trf", diff_step=[1e-2, 3e-3, 1e-3, 3e-4][runde], max_nfev=600, xtol=1e-10, ftol=1e-10, gtol=1e-10)
    print("  Runde %d: %d Auswertungen, Kosten %.5g, Status %d, %.0f s" % (runde + 1, r.nfev, r.cost, r.status, time.time() - t0), flush=True)
    if best is not None and r.cost >= best.cost * (1 - 1e-5): break
    best = r; z = r.x
p = voll(best.x)
print("Ergebnis:", ", ".join("%s = %.5g" % (namen[k], p[k]) for k in range(8) if k in frei or k < 5) + ", δ = %.3f ms" % (p[7] * 1e3))
Ld_ast = p[0] + 2 * p[1] * (p[2] * np.tanh(2.6e-3 / p[2]) * 2)   # grob: Mitte des Asts (w ≈ 1) nach 5,2 mA Hub
print("  Rayleigh-Grenze ν = 2ρ0 = %.0f H/A; L_rev %.2f H; Neukurve L_d(2,8 mA) = %.2f H; L_d(0) auf dem Ast nach Umkehr bei ±2,6 mA ≈ %.1f H" % (2 * p[1], p[0], p[0] + 2 * p[1] / np.cosh(2.8e-3 / p[2]) ** 2 * 2 * p[2] * np.tanh(2.8e-3 / p[2]), Ld_ast))
print("  C(0) %.1f µF, C(1,2 V) %.1f, C(2,7 V) %.1f, C(4,4 V) %.1f µF" % tuple(p[3] / (1 + p[4] * u * u) * 1e6 for u in (0, 1.2, 2.7, 4.4)))
ges = []; erg = {"param": {namen[k]: float(p[k]) for k in range(8)}, "ue": UE, "strom": WSTROM, "mess": {}}; sims = {}
for d in D:
    u, ii, L = simuliere(p, d); e, mx = fehler(u, d); ges.append(e); k = np.argmax(u); km = np.argmax(d["uC"]); sims[d["T"]] = (u, ii, L)
    print("  T%d: RMSE %.2f %% (max %.1f %%)  Scheitel sim %.3f V @ %d ms, gemessen %.3f V @ %d ms;  i: RMS-Abw. %.3f mA (i_max %.2f);  L_d %.1f … %.1f H" % (d["T"], e, mx, u[k], d["t"][k] * 1e3, d["uC"][km], d["t"][km] * 1e3, (ii - d["i"]).std() * 1e3, d["iMax"] * 1e3, L.min(), L.max()))
    erg["mess"]["T%d" % d["T"]] = {"rmse": e, "max": mx, "irms_mA": float((ii - d["i"]).std() * 1e3)}
    np.save(os.path.join(H, "preisach_sim_T%d.npy" % d["T"]), np.vstack([d["t"], u, ii, L]))
print("Mittel RMSE %.2f %%  (%.0f s)" % (np.mean(ges), time.time() - t0))
json.dump(erg, open(os.path.join(H, "preisach_1.2_%s.json" % kennung), "w"), indent=1)
if BILD:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(3, 4, figsize=(20, 11))
    for c, d in enumerate(D):
        u, ii, L = sims[d["T"]]; tm = d["t"] * 1e3
        ax[0, c].plot(tm, d["uC"], "k", lw=0.8, label="gemessen"); ax[0, c].plot(tm, u, "r", lw=0.8, label="Preisach"); ax[0, c].set_title("T%d: u_C, RMSE %.2f %%" % (d["T"], erg["mess"]["T%d" % d["T"]]["rmse"])); ax[0, c].legend(); ax[0, c].set_xlim(0, 350)
        ax[1, c].plot(tm, (u - d["uC"]) * 1e3, "r", lw=0.8); ax[1, c].set_title("Rest u_C / mV"); ax[1, c].set_xlim(0, 350); ax[1, c].axhline(0, color="k", lw=0.5)
        ax[2, c].plot(tm, d["i"] * 1e3, "k", lw=0.8, label="i gemessen (Median)"); ax[2, c].plot(tm, ii * 1e3, "r", lw=0.8, label="i Preisach"); ax2 = ax[2, c].twinx(); ax2.plot(tm, L, "b", lw=0.6); ax2.set_ylabel("L_d / H", color="b"); ax[2, c].set_title("i / mA, blau L_d"); ax[2, c].set_xlim(0, 350); ax[2, c].legend(loc="upper right")
    fig.suptitle("Preisach-Produktdichte, gemeinsamer Fit über vier Messungen (%s): " % kennung + ", ".join("%s = %.4g" % (namen[k], p[k]) for k in range(8) if k in frei or k < 5), fontsize=9)
    fig.tight_layout(); fig.savefig(os.path.join(H, "preisach_1.2_%s.png" % kennung), dpi=80); print("Bild preisach_1.2_%s.png" % kennung)
