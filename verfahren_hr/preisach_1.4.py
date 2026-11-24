#!/usr/bin/env python3
"""preisach_1.4.py (24.11.2026) -- wie 1.3, dazu: (1) die Simulation liefert BLOCKMITTEL über jede Abtastung (die Messwerte sind Blockmittel über 1 ms,
Zeitstempel k + 0,5 ms; 1.3 gab den Blockanfang aus -- ein systematischer Versatz von 0,5 ms, bis 45 mV im Anstieg), (2) wahlweise ein Debye-Zweig am
Kondensator (dielektrische Nachwirkung des X7R: C_0(u) parallel zu R_1 + C_1, Zustand u_1; debye=1), (3) wahlweise Wirbelstrom R_Fe wie bisher.
Preisach-Hysterese der Eisendrossel, Dichte wählbar, gemeinsamer Fit über die vier Messungen.
Aus ld_aeste_1.0.png (modellfrei L_d = u_L/(di/dt)): auf dem Ast ab dem Umkehrpunkt wächst L_d von 3–5 H mit ≈ 4,2 H/mA und läuft bei
15–20 H in eine Sättigung -- also eine Koerzitivverteilung mit endlicher Breite; die Produktdichte (1.2) war zu rund (i_s lief auf 10–20 mA).
Dichten (dichte=):
  exp   ρ(α, β) = ρ_0·exp(−(α−β)/h_c)/h_c  (nur von der Koerzitivität abhängig, verschiebungsinvariant):
        Ast:  L_d = L_rev + 2ρ_0·(1 − exp(−d/h_c)),  d = |i − i_r|;  Rayleigh-Grenze ν = 2ρ_0/h_c;  Plateau L_rev + 2ρ_0
        Neukurve (entmagnetisiert): L_d = L_rev + 2ρ_0·(1 − exp(−2i/h_c))
  prod  ρ = ρ_0·sech²(α/i_s)·sech²(β/i_s) (wie 1.2): L_d = L_rev + 2ρ_0·sech²(i/i_s)·|W(i) − W(i_r)|, W = i_s·tanh(·/i_s)
Reversibler Anteil wahlweise sättigend: L_rev(i) = L_r/(1 + (i/i_r)²)  (rev=sat), sonst konstant.
Neukurve (neu=): demag = entmagnetisierter Anfangszustand (Preisach-Standard), ast = Start wie an einem Umkehrpunkt bei i = 0.
Kondensator C(u) = C_0/(1 + γu²); R_Cu = 92 Ω fest (rcu=frei lässt ihn frei); R_Fe wahlweise; δ Zeitversatz wahlweise.
Aufruf: python3 preisach_1.3.py [dichte=exp|prod] [neu=demag|ast] [rev=konst|sat] [ue=dreieck|roh] [rfe=1|0] [rcu=fest|frei] [strom=<Gewicht>] [delta=<ms>|frei] [global=1|0] [bild=1|0]
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import numpy as np, sys, time, glob, os, json
from scipy.optimize import least_squares, differential_evolution
from numba import njit
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
arg = dict(a.split("=") for a in sys.argv[1:]); UE = arg.get("ue", "dreieck"); MITRFE = arg.get("rfe", "0") == "1"; RCUFREI = arg.get("rcu", "fest") == "frei"
DELTA = arg.get("delta", "0"); DFREI = DELTA == "frei"; D0 = 0.0 if DFREI else float(DELTA) * 1e-3
WSTROM = float(arg.get("strom", "1")); GLOBAL = arg.get("global", "1") == "1"; BILD = arg.get("bild", "1") == "1"
DEBYE = arg.get("debye", "0") == "1"
DICHTE = {"exp": 0, "prod": 1}[arg.get("dichte", "exp")]; NEU = {"demag": 0, "ast": 1}[arg.get("neu", "demag")]; REVSAT = arg.get("rev", "konst") == "sat"
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
def Ld_von(x, ir, neukurve, Lr, rho, hc, iS, irev, dichte, neu, revsat):
    L = Lr / (1 + (x / irev) ** 2) if revsat else Lr
    if neukurve and neu == 0: ir = -x          # entmagnetisiert: untere Grenze −i
    d = abs(x - ir)
    if dichte == 0: return L + 2 * rho * (1 - np.exp(-d / hc))
    w = 1 / np.cosh(min(300.0, abs(x / iS))) ** 2
    return L + 2 * rho * w * abs(iS * np.tanh(x / iS) - iS * np.tanh(ir / iS))

@njit(cache=True)
def sim_kern(Lr, rho, hc, iS, irev, C0, ga, R, RFe, R1, C1, uE, unter, dt, dichte, neu, revsat, debye):
    n = uE.shape[0]; h = dt / unter; out_u = np.empty(n); out_i = np.empty(n); out_L = np.empty(n)
    stapel = np.empty(64); ns = 0; s = 1.0; x = 0.0; uc = 0.0; u1 = 0.0; mitRFe = RFe < 1e11
    kx = np.empty(4); ku = np.empty(4); k1 = np.empty(4)
    for j in range(n):
        ue = uE[j]; su = 0.0; si = 0.0; sL = 0.0
        for sub in range(unter):
            for st in range(4):
                if st == 0: xs = x; us = uc; u1s = u1
                elif st == 1: xs = x + h / 2 * kx[0]; us = uc + h / 2 * ku[0]; u1s = u1 + h / 2 * k1[0]
                elif st == 2: xs = x + h / 2 * kx[1]; us = uc + h / 2 * ku[1]; u1s = u1 + h / 2 * k1[1]
                else: xs = x + h * kx[2]; us = uc + h * ku[2]; u1s = u1 + h * k1[2]
                ir = stapel[ns - 1] if ns > 0 else 0.0
                L = Ld_von(xs, ir, ns == 0, Lr, rho, hc, iS, irev, dichte, neu, revsat)
                ul = (ue - R * xs - us) / (1 + R / RFe) if mitRFe else (ue - R * xs - us)
                ii = xs + (ul / RFe if mitRFe else 0.0)
                i1 = (us - u1s) / R1 if debye else 0.0          # Strom in den Debye-Zweig
                kx[st] = ul / L; ku[st] = (ii - i1) / (C0 / (1 + ga * us * us)); k1[st] = i1 / C1 if debye else 0.0
                if st == 0: su += us; si += ii; sL += L
            x += h / 6 * (kx[0] + 2 * kx[1] + 2 * kx[2] + kx[3]); uc += h / 6 * (ku[0] + 2 * ku[1] + 2 * ku[2] + ku[3]); u1 += h / 6 * (k1[0] + 2 * k1[1] + 2 * k1[2] + k1[3])
            if not (np.isfinite(x) and np.isfinite(uc) and np.isfinite(u1)):
                for q in range(n): out_u[q] = 1e3; out_i[q] = 1e3; out_L[q] = 1e3
                return out_u, out_i, out_L
            ul = (ue - R * x - uc) / (1 + R / RFe) if mitRFe else (ue - R * x - uc)
            if ul * s < 0:
                s = -s
                if ns < 64: stapel[ns] = x; ns += 1
            while ns >= 2 and ((s > 0 and x >= stapel[ns - 2]) or (s < 0 and x <= stapel[ns - 2])): ns -= 2
        # Blockmittel: Mittel der Unterschritt-Anfangswerte plus halber Randausgleich (Trapez): (Summe + (Ende − Anfang)/2)/unter
        ul = (ue - R * x - uc) / (1 + R / RFe) if mitRFe else (ue - R * x - uc); ie = x + (ul / RFe if mitRFe else 0.0)
        out_u[j] = su / unter + (uc - (su / unter)) / (2 * unter)
        out_i[j] = si / unter + (ie - (si / unter)) / (2 * unter)
        out_L[j] = sL / unter
    return out_u, out_i, out_L

def verschiebe(a, dlt):
    if dlt == 0: return a
    x = np.arange(len(a)) + dlt / dt; return np.interp(x, np.arange(len(a)), a)
NP = 12; namen = ["L_rev/H", "rho0/H", "h_c/A", "i_s/A", "i_rev/A", "C0/F", "gamma/V^-2", "R_Cu/Ω", "R_Fe/Ω", "delta/s", "R1/Ω", "C1/F"]
def simuliere(p, d, unter=UNTER):
    Lr, rho, hc, iS, irev, C0, ga, RCu, RFe, dlt, R1, C1 = p
    u, ii, L = sim_kern(Lr, rho, hc, iS, irev, C0, ga, RCu + Rs, RFe if np.isfinite(RFe) else 1e12, R1, C1, d["uE"], unter, dt, DICHTE, NEU, REVSAT, DEBYE)
    return verschiebe(u, dlt), verschiebe(ii, dlt), L
def fehler(u, d): e = u - d["uC"]; return e.std() / d["dU"] * 100, np.abs(e).max() / d["dU"] * 100

p0 = np.array([3.7, 17.7 if DICHTE == 0 else 2600.0, 5.4e-3, 10e-3, 5e-3, 27e-6, 0.037, 92.0, 5000.0 if MITRFE else 1.0, 1.0, 2000.0, 3e-6])
frei = [0, 1, 2 if DICHTE == 0 else 3] + ([4] if REVSAT else []) + [5, 6] + ([7] if RCUFREI else []) + ([8] if MITRFE else []) + ([9] if DFREI else []) + ([10, 11] if DEBYE else [])
def voll(z):
    p = p0.copy()
    for j, k in enumerate(frei): p[k] = z[j] * p0[k]
    if not MITRFE: p[8] = np.inf
    p[9] = (z[frei.index(9)] - 1.0) * 1e-3 if DFREI else D0
    return p
nU = sum(len(d["uC"]) for d in D)
def resid(z, unter=4):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 1e-5 or p[4] <= 1e-5 or p[5] <= 0 or p[6] < 0 or p[7] < 10 or (MITRFE and p[8] < 100) or abs(p[9]) > 3e-3 or p[10] <= 1 or p[11] <= 1e-9: return np.full(nU * (2 if WSTROM else 1), 10.0)
    r = []; ri = []
    for d in D:
        u, ii, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"])
        if WSTROM: ri.append(WSTROM * (ii - d["i"]) / d["iMax"])
    return np.concatenate(r + ri)
kennung = "%s_%s_%s_%s_%s_%s_s%g%s%s" % (arg.get("dichte", "exp"), arg.get("neu", "demag"), arg.get("rev", "konst"), UE, "rfe" if MITRFE else "ohne", "rcufrei" if RCUFREI else "rcufest", WSTROM, "_d" + DELTA if DELTA != "0" else "", "" if GLOBAL else "_lokal") + ("_debye" if DEBYE else "")
print("Preisach 1.4:", kennung, flush=True)
t0 = time.time(); z = np.ones(len(frei)); simuliere(voll(z), D[0])
if GLOBAL:
    g = differential_evolution(lambda z: float(np.sum(resid(z) ** 2)), [(0.2, 4)] * len(frei), seed=1, maxiter=80, popsize=14, tol=1e-9, polish=False)
    z = g.x; print("  global: Kosten %.4g, %d Auswertungen, %.0f s" % (g.fun / 2, g.nfev, time.time() - t0), flush=True)
best = None
for runde in range(4):
    r = least_squares(resid, z, method="trf", diff_step=[1e-2, 3e-3, 1e-3, 3e-4][runde], max_nfev=600, xtol=1e-10, ftol=1e-10, gtol=1e-10)
    if best is not None and r.cost >= best.cost * (1 - 1e-5): break
    best = r; z = r.x
print("  lokal: Kosten %.5g, %.0f s" % (best.cost, time.time() - t0))
p = voll(best.x)
print("Ergebnis:", ", ".join("%s = %.5g" % (namen[k], p[k]) for k in frei), "; δ = %.3f ms" % (p[9] * 1e3))
if DICHTE == 0: print("  Rayleigh-Grenze ν = 2ρ0/h_c = %.0f H/A; Plateau L_rev + 2ρ0 = %.1f H; Neukurve L_d(0) = %.2f H, L_d(2,8 mA) = %.2f H" % (2 * p[1] / p[2], p[0] + 2 * p[1], Ld_von(0.0, 0.0, True, *p[:5], DICHTE, NEU, REVSAT), Ld_von(2.8e-3, 0.0, True, *p[:5], DICHTE, NEU, REVSAT)))
else: print("  Rayleigh-Grenze ν = 2ρ0 = %.0f H/A; Neukurve L_d(2,8 mA) = %.2f H" % (2 * p[1], Ld_von(2.8e-3, 0.0, True, *p[:5], DICHTE, NEU, REVSAT)))
if DEBYE: print("  Debye-Zweig: R1 %.0f Ω, C1 %.2f µF, τ = %.1f ms" % (p[10], p[11] * 1e6, p[10] * p[11] * 1e3))
print("  C(0) %.1f µF, C(1,2 V) %.1f, C(2,7 V) %.1f, C(4,4 V) %.1f µF" % tuple(p[5] / (1 + p[6] * u * u) * 1e6 for u in (0, 1.2, 2.7, 4.4)))
ges = []; erg = {"param": {namen[k]: float(p[k]) for k in range(NP)}, "kennung": kennung, "mess": {}}; sims = {}
for d in D:
    u, ii, L = simuliere(p, d); e, mx = fehler(u, d); ges.append(e); k = np.argmax(u); km = np.argmax(d["uC"]); sims[d["T"]] = (u, ii, L)
    print("  T%d: RMSE %.2f %% (max %.1f %%)  Scheitel sim %.3f V @ %d ms, gemessen %.3f V @ %d ms;  i: RMS-Abw. %.3f mA;  L_d %.1f … %.1f H" % (d["T"], e, mx, u[k], d["t"][k] * 1e3, d["uC"][km], d["t"][km] * 1e3, (ii - d["i"]).std() * 1e3, L.min(), L.max()))
    erg["mess"]["T%d" % d["T"]] = {"rmse": e, "max": mx, "irms_mA": float((ii - d["i"]).std() * 1e3)}
print("Mittel RMSE %.2f %%  (%.0f s)" % (np.mean(ges), time.time() - t0)); erg["mittel"] = float(np.mean(ges))
json.dump(erg, open(os.path.join(H, "preisach_1.4_%s.json" % kennung), "w"), indent=1)
if BILD:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(3, 4, figsize=(20, 11))
    for c, d in enumerate(D):
        u, ii, L = sims[d["T"]]; tm = d["t"] * 1e3
        ax[0, c].plot(tm, d["uC"], "k", lw=0.8, label="gemessen"); ax[0, c].plot(tm, u, "r", lw=0.8, label="Preisach"); ax[0, c].set_title("T%d: u_C, RMSE %.2f %%" % (d["T"], erg["mess"]["T%d" % d["T"]]["rmse"])); ax[0, c].legend(); ax[0, c].set_xlim(0, 350)
        ax[1, c].plot(tm, (u - d["uC"]) * 1e3, "r", lw=0.8); ax[1, c].set_title("Rest u_C / mV"); ax[1, c].set_xlim(0, 350); ax[1, c].axhline(0, color="k", lw=0.5)
        ax[2, c].plot(tm, d["i"] * 1e3, "k", lw=0.8, label="i gemessen (Median)"); ax[2, c].plot(tm, ii * 1e3, "r", lw=0.8, label="i Preisach"); ax2 = ax[2, c].twinx(); ax2.plot(tm, L, "b", lw=0.6); ax2.set_ylabel("L_d / H", color="b"); ax[2, c].set_title("i / mA, blau L_d"); ax[2, c].set_xlim(0, 350); ax[2, c].legend(loc="upper right")
    fig.suptitle("Preisach 1.4 %s: " % kennung + ", ".join("%s = %.4g" % (namen[k], p[k]) for k in frei), fontsize=9)
    fig.tight_layout(); fig.savefig(os.path.join(H, "preisach_1.4_%s.png" % kennung), dpi=80); print("Bild preisach_1.4_%s.png" % kennung)
