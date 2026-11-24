#!/usr/bin/env python3
"""preisach_1.9.py (24.11.2026) -- wie 1.8, dazu Kondensatorform cp=frei: C(u) = C_0/(1 + (|u|/u_0)^p) mit freiem Exponenten p (p = 2 ist das
bisherige Modell C_0/(1+γu²); X7R hat eine flache Kuppe und fällt dann steil -- der Rest des Einzelfits T140 zeigt die doppelte Eigenfrequenz,
also eine falsche gerade Nichtlinearität). γ wird zu u_0 = γ^(−1/2).
Aus 1.8: nur=T140 (eine Messung allein fitten: trägt die Modellstruktur, wenn sie nicht über vier Messungen
teilen muss?), gew=huelle (Hüllkurven-Gewichtung wie auf der Seite: Rest durch (Hüllkurve + 0,1·ΔU) -- die späten Maxima zählen dann gleich viel
wie der erste Scheitel; sein Wort: „Die späteren Maxima bestimmen, ob das Modell trägt“).
Aus 1.7: rfe=<Ω> fest, rfe0=<Startwert>, rp=frei|<Ω> Verlustwiderstand parallel zum Kondensator
(dielektrischer Verlust / Leckstrom; i_C = i − u_C/R_p). Anlass: Ausklang-Analyse -- gemessen α 21–23 1/s (ζ 0,22–0,24), Modell 18,7 (ζ 0,20):
dem Modell fehlt bei kleiner Amplitude ein LINEARER Verlust (etwa 35 Ω in Reihe oder 7 kΩ parallel), den die Hysterese (Verlust ~ Amplitude³) nicht liefert.
Aus 1.6: Anregung ue=ideal: idealer Sprung auf U_∞ = Mittel der letzten 100 ms von u_C (der gemessene
PWM-Mittelwert u_E streut je Block ±0,1…0,2 V und ist nur auf etwa 0,5 %% sicher; der Einbruch des Pin-Pegels mit dem Strom wird dann vom freien
Gesamtwiderstand R_Cu getragen, rcu=frei -> R = R_Cu + R_Port + R_s). Aus 1.5: Dichte gamma: Koerzitivverteilung f(h) ∝ (h/h_c)·exp(−h/h_c) mit Maximum bei h_c (Befund: die
späten Halbschwingungen behalten 32–34 ms, obwohl die Amplitude noch um den Faktor 10 fällt -- reines Rayleigh müsste die Periode weiter verkürzen);
Ast: L_d = L_rev + 2ρ_0·[1 − (1 + d/h_c)·exp(−d/h_c)], klein: L_d ≈ L_rev + ρ_0 (d/h_c)² (keine Rayleigh-Gerade), Plateau L_rev + 2ρ_0.
Aus 1.4: (1) die Simulation liefert BLOCKMITTEL über jede Abtastung (die Messwerte sind Blockmittel über 1 ms,
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
arg = dict(a.split("=") for a in sys.argv[1:]); UE = arg.get("ue", "dreieck"); RFEARG = arg.get("rfe", "0"); MITRFE = RFEARG == "1"; RFEFEST = float(RFEARG) if RFEARG not in ("0", "1") else None
RFE0 = float(arg.get("rfe0", "5000")); RPARG = arg.get("rp", "0"); RPFREI = RPARG == "frei"; RP0 = 7000.0 if RPFREI else (float(RPARG) if RPARG != "0" else np.inf); RCUFREI = arg.get("rcu", "fest") == "frei"
DELTA = arg.get("delta", "0"); DFREI = DELTA == "frei"; D0 = 0.0 if DFREI else float(DELTA) * 1e-3
WSTROM = float(arg.get("strom", "1")); GLOBAL = arg.get("global", "1") == "1"; BILD = arg.get("bild", "1") == "1"
DEBYE = arg.get("debye", "0") == "1"
DICHTE = {"exp": 0, "prod": 1, "gamma": 2}[arg.get("dichte", "exp")]; NEU = {"demag": 0, "ast": 1}[arg.get("neu", "demag")]; REVSAT = arg.get("rev", "konst") == "sat"
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
    if UE == "ideal": uE = np.full(len(uE), uC[-100:].mean())
    return dict(T=int(f.split("_T")[1].split("_")[0]), t=t, uC=uC, uE=uE, i=i, dU=uC[-20:].mean(), iMax=np.abs(i).max())
D = sorted([lade(f) for f in glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt"))], key=lambda d: d["T"])
NUR = arg.get("nur", ""); GEW = arg.get("gew", ""); CPFREI = arg.get("cp", "2") == "frei"; CP0 = 2.0 if CPFREI else float(arg.get("cp", "2"))
if NUR: D = [d for d in D if "T%d" % d["T"] == NUR]
for d in D:   # Gewicht je Abtastwert
    if GEW == "huelle":
        a = np.abs(d["uC"] - d["dU"]); h = 60; e = np.array([a[max(0, j - h):j + h + 1].max() for j in range(len(a))]) + 0.1 * d["dU"]; d["gew"] = (1 / e) / np.mean(1 / e)
    else: d["gew"] = np.ones(len(d["uC"]))

@njit(cache=True)
def Ld_von(x, ir, neukurve, Lr, rho, hc, iS, irev, dichte, neu, revsat):
    L = Lr / (1 + (x / irev) ** 2) if revsat else Lr
    if neukurve and neu == 0: ir = -x          # entmagnetisiert: untere Grenze −i
    d = abs(x - ir)
    if dichte == 0: return L + 2 * rho * (1 - np.exp(-d / hc))
    if dichte == 2: return L + 2 * rho * (1 - (1 + d / hc) * np.exp(-d / hc))
    w = 1 / np.cosh(min(300.0, abs(x / iS))) ** 2
    return L + 2 * rho * w * abs(iS * np.tanh(x / iS) - iS * np.tanh(ir / iS))

@njit(cache=True)
def sim_kern(Lr, rho, hc, iS, irev, C0, ga, R, RFe, R1, C1, Rp, cp, uE, unter, dt, dichte, neu, revsat, debye):
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
                ip = us / Rp if Rp < 1e11 else 0.0
                Cu = C0 / (1 + ga * us * us) if cp == 2.0 else C0 / (1 + (abs(us) * np.sqrt(ga)) ** cp)
                kx[st] = ul / L; ku[st] = (ii - i1 - ip) / Cu; k1[st] = i1 / C1 if debye else 0.0
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
NP = 14; namen = ["L_rev/H", "rho0/H", "h_c/A", "i_s/A", "i_rev/A", "C0/F", "gamma/V^-2", "R_Cu/Ω", "R_Fe/Ω", "delta/s", "R1/Ω", "C1/F", "R_p/Ω", "p_C"]
def simuliere(p, d, unter=UNTER):
    Lr, rho, hc, iS, irev, C0, ga, RCu, RFe, dlt, R1, C1, Rp, cp = p
    u, ii, L = sim_kern(Lr, rho, hc, iS, irev, C0, ga, RCu + Rs, RFe if np.isfinite(RFe) else 1e12, R1, C1, Rp if np.isfinite(Rp) else 1e12, cp, d["uE"], unter, dt, DICHTE, NEU, REVSAT, DEBYE)
    return verschiebe(u, dlt), verschiebe(ii, dlt), L

def schwanz(t, u, t0=0.17, t1=0.45):
    """gedämpfte Schwingung U∞ + A·e^{−αt}·cos(ωt+φ) an den Ausklang anpassen; liefert (α, ω, ζ, U∞)."""
    m = (t >= t0) & (t <= t1); tt = t[m] - t0; uu = u[m]
    def f(p): return p[0] + p[1] * np.exp(-p[2] * tt) * np.cos(p[3] * tt + p[4]) - uu
    best = None
    for w in (80.0, 95.0, 110.0):
        for ph in (0.0, 1.5, 3.0, 4.5):
            r = least_squares(f, [uu[-20:].mean(), np.ptp(uu[:40]) / 2, 20.0, w, ph], max_nfev=2000)
            if best is None or r.cost < best.cost: best = r
    a, w = best.x[2], best.x[3]; w0 = np.sqrt(w * w + a * a); return a, w, a / w0, best.x[0]
def fehler(u, d): e = u - d["uC"]; return e.std() / d["dU"] * 100, np.abs(e).max() / d["dU"] * 100

p0 = np.array([3.7, 17.7 if DICHTE != 1 else 2600.0, 5.4e-3 if DICHTE == 0 else 3e-3, 10e-3, 5e-3, 27e-6, 0.037, 92.0, RFE0 if MITRFE else (RFEFEST if RFEFEST else 1.0), 1.0, 2000.0, 3e-6, RP0 if np.isfinite(RP0) else 1.0, CP0])
frei = [0, 1, 2 if DICHTE != 1 else 3] + ([4] if REVSAT else []) + [5, 6] + ([7] if RCUFREI else []) + ([8] if MITRFE else []) + ([9] if DFREI else []) + ([10, 11] if DEBYE else []) + ([12] if RPFREI else []) + ([13] if CPFREI else [])
def voll(z):
    p = p0.copy()
    for j, k in enumerate(frei): p[k] = z[j] * p0[k]
    if not MITRFE and RFEFEST is None: p[8] = np.inf
    if not RPFREI: p[12] = RP0
    p[9] = (z[frei.index(9)] - 1.0) * 1e-3 if DFREI else D0
    return p
nU = sum(len(d["uC"]) for d in D)
def resid(z, unter=4):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 1e-5 or p[4] <= 1e-5 or p[5] <= 0 or p[6] < 0 or p[7] < 10 or (MITRFE and p[8] < 100) or abs(p[9]) > 3e-3 or p[10] <= 1 or p[11] <= 1e-9 or p[12] <= 100 or p[13] < 1.0 or p[13] > 8: return np.full(nU * (2 if WSTROM else 1), 10.0)
    r = []; ri = []
    for d in D:
        u, ii, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"] * d["gew"])
        if WSTROM: ri.append(WSTROM * (ii - d["i"]) / d["iMax"])
    return np.concatenate(r + ri)
kennung = "%s_%s_%s_%s_%s_%s_s%g%s%s" % (arg.get("dichte", "exp"), arg.get("neu", "demag"), arg.get("rev", "konst"), UE, "rfe" if MITRFE else "ohne", "rcufrei" if RCUFREI else "rcufest", WSTROM, "_d" + DELTA if DELTA != "0" else "", "" if GLOBAL else "_lokal") + ("_debye" if DEBYE else "") + ("_rfe%g" % RFEFEST if RFEFEST else "") + ("_rp" + RPARG if RPARG != "0" else "") + ("_" + NUR if NUR else "") + ("_cp" + arg.get("cp") if arg.get("cp") else "") + ("_huelle" if GEW == "huelle" else "")
print("Preisach 1.9:", kennung, flush=True)
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
if DICHTE == 2: print("  Gamma-Dichte: h_c %.2f mA, Plateau L_rev + 2ρ0 = %.1f H; Neukurve L_d(0) = %.2f H, L_d(2,8 mA) = %.2f H" % (p[2] * 1e3, p[0] + 2 * p[1], Ld_von(0.0, 0.0, True, *p[:5], DICHTE, NEU, REVSAT), Ld_von(2.8e-3, 0.0, True, *p[:5], DICHTE, NEU, REVSAT)))
elif DICHTE == 0: print("  Rayleigh-Grenze ν = 2ρ0/h_c = %.0f H/A; Plateau L_rev + 2ρ0 = %.1f H; Neukurve L_d(0) = %.2f H, L_d(2,8 mA) = %.2f H" % (2 * p[1] / p[2], p[0] + 2 * p[1], Ld_von(0.0, 0.0, True, *p[:5], DICHTE, NEU, REVSAT), Ld_von(2.8e-3, 0.0, True, *p[:5], DICHTE, NEU, REVSAT)))
else: print("  Rayleigh-Grenze ν = 2ρ0 = %.0f H/A; Neukurve L_d(2,8 mA) = %.2f H" % (2 * p[1], Ld_von(2.8e-3, 0.0, True, *p[:5], DICHTE, NEU, REVSAT)))
if DEBYE: print("  Debye-Zweig: R1 %.0f Ω, C1 %.2f µF, τ = %.1f ms" % (p[10], p[11] * 1e6, p[10] * p[11] * 1e3))
if np.isfinite(p[12]): print("  R_p parallel zu C: %.0f Ω" % p[12])
if RFEFEST: print("  R_Fe fest %.0f Ω" % RFEFEST)
print("  C(0) %.1f µF, C(1,2 V) %.1f, C(2,7 V) %.1f, C(4,4 V) %.1f µF; p = %.2f, u_0 = %.2f V" % (tuple(p[5] / (1 + (u * np.sqrt(p[6])) ** p[13]) * 1e6 for u in (0, 1.2, 2.7, 4.4)) + (p[13], p[6] ** -0.5)))
ges = []; erg = {"param": {namen[k]: float(p[k]) for k in range(NP)}, "kennung": kennung, "mess": {}}; sims = {}
for d in D:
    u, ii, L = simuliere(p, d); e, mx = fehler(u, d); ges.append(e); k = np.argmax(u); km = np.argmax(d["uC"]); sims[d["T"]] = (u, ii, L)
    print("  T%d: RMSE %.2f %% (max %.1f %%)  Scheitel sim %.3f V @ %d ms, gemessen %.3f V @ %d ms;  i: RMS-Abw. %.3f mA;  L_d %.1f … %.1f H" % (d["T"], e, mx, u[k], d["t"][k] * 1e3, d["uC"][km], d["t"][km] * 1e3, (ii - d["i"]).std() * 1e3, L.min(), L.max()))
    erg["mess"]["T%d" % d["T"]] = {"rmse": e, "max": mx, "irms_mA": float((ii - d["i"]).std() * 1e3)}
print("Mittel RMSE %.2f %%  (%.0f s)" % (np.mean(ges), time.time() - t0)); erg["mittel"] = float(np.mean(ges))
print("Ausklang 170–450 ms (kleine Amplitude): α, ω_d, ζ gemessen gegen Modell; daraus R_eff = 2α·L und L aus ω0 mit C(U∞)")
for d in D:
    u, ii, L = sims[d["T"]]; am, wm, zm, Um = schwanz(d["t"], d["uC"]); as_, ws, zs, Us = schwanz(d["t"], u)
    Cq = p[5] / (1 + (abs(Um) * np.sqrt(p[6])) ** p[13]); Lm = 1 / ((wm * wm + am * am) * Cq); Ls = 1 / ((ws * ws + as_ * as_) * Cq)
    print("  T%d: gemessen α %.1f 1/s, ω_d %.1f rad/s, ζ %.3f -> L %.2f H, R_eff %.0f Ω | Modell α %.1f, ω_d %.1f, ζ %.3f -> L %.2f H, R_eff %.0f Ω   (R_Cu+R_s = %.0f Ω)" % (d["T"], am, wm, zm, Lm, 2 * am * Lm, as_, ws, zs, Ls, 2 * as_ * Ls, p[7] + Rs))
json.dump(erg, open(os.path.join(H, "preisach_1.9_%s.json" % kennung), "w"), indent=1)
if BILD:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(3, 4, figsize=(20, 11))
    for c, d in enumerate(D):
        u, ii, L = sims[d["T"]]; tm = d["t"] * 1e3
        ax[0, c].plot(tm, d["uC"], "k", lw=0.8, label="gemessen"); ax[0, c].plot(tm, u, "r", lw=0.8, label="Preisach"); ax[0, c].set_title("T%d: u_C, RMSE %.2f %%" % (d["T"], erg["mess"]["T%d" % d["T"]]["rmse"])); ax[0, c].legend(); ax[0, c].set_xlim(0, 350)
        ax[1, c].plot(tm, (u - d["uC"]) * 1e3, "r", lw=0.8); ax[1, c].set_title("Rest u_C / mV"); ax[1, c].set_xlim(0, 350); ax[1, c].axhline(0, color="k", lw=0.5)
        ax[2, c].plot(tm, d["i"] * 1e3, "k", lw=0.8, label="i gemessen (Median)"); ax[2, c].plot(tm, ii * 1e3, "r", lw=0.8, label="i Preisach"); ax2 = ax[2, c].twinx(); ax2.plot(tm, L, "b", lw=0.6); ax2.set_ylabel("L_d / H", color="b"); ax[2, c].set_title("i / mA, blau L_d"); ax[2, c].set_xlim(0, 350); ax[2, c].legend(loc="upper right")
    fig.suptitle("Preisach 1.9 %s: " % kennung + ", ".join("%s = %.4g" % (namen[k], p[k]) for k in frei), fontsize=9)
    fig.tight_layout(); fig.savefig(os.path.join(H, "preisach_1.9_%s.png" % kennung), dpi=80); print("Bild preisach_1.9_%s.png" % kennung)
