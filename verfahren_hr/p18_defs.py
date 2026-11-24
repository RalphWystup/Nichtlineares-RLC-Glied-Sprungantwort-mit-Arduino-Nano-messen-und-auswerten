"""p18_defs.py -- Definitionen aus preisach_1.8.py (Kern, Laden, Residuum) als Modul für pruefe_dgl_fit_1.0.py; ARGS vor dem Import setzen."""
ARGS = __import__("os").environ.get("P18ARGS", "").split()
#!/usr/bin/env python3
"""preisach_1.8.py (24.11.2026) -- wie 1.7, dazu: nur=T140 (eine Messung allein fitten: trägt die Modellstruktur, wenn sie nicht über vier Messungen
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
arg = dict(a.split("=") for a in ARGS); UE = arg.get("ue", "dreieck"); RFEARG = arg.get("rfe", "0"); MITRFE = RFEARG == "1"; RFEFEST = float(RFEARG) if RFEARG not in ("0", "1") else None
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
NUR = arg.get("nur", ""); GEW = arg.get("gew", "")
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
def sim_kern(Lr, rho, hc, iS, irev, C0, ga, R, RFe, R1, C1, Rp, uE, unter, dt, dichte, neu, revsat, debye):
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
                kx[st] = ul / L; ku[st] = (ii - i1 - ip) / (C0 / (1 + ga * us * us)); k1[st] = i1 / C1 if debye else 0.0
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
NP = 13; namen = ["L_rev/H", "rho0/H", "h_c/A", "i_s/A", "i_rev/A", "C0/F", "gamma/V^-2", "R_Cu/Ω", "R_Fe/Ω", "delta/s", "R1/Ω", "C1/F", "R_p/Ω"]
def simuliere(p, d, unter=UNTER):
    Lr, rho, hc, iS, irev, C0, ga, RCu, RFe, dlt, R1, C1, Rp = p
    u, ii, L = sim_kern(Lr, rho, hc, iS, irev, C0, ga, RCu + Rs, RFe if np.isfinite(RFe) else 1e12, R1, C1, Rp if np.isfinite(Rp) else 1e12, d["uE"], unter, dt, DICHTE, NEU, REVSAT, DEBYE)
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

p0 = np.array([3.7, 17.7 if DICHTE != 1 else 2600.0, 5.4e-3 if DICHTE == 0 else 3e-3, 10e-3, 5e-3, 27e-6, 0.037, 92.0, RFE0 if MITRFE else (RFEFEST if RFEFEST else 1.0), 1.0, 2000.0, 3e-6, RP0 if np.isfinite(RP0) else 1.0])
frei = [0, 1, 2 if DICHTE != 1 else 3] + ([4] if REVSAT else []) + [5, 6] + ([7] if RCUFREI else []) + ([8] if MITRFE else []) + ([9] if DFREI else []) + ([10, 11] if DEBYE else []) + ([12] if RPFREI else [])
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
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 1e-5 or p[4] <= 1e-5 or p[5] <= 0 or p[6] < 0 or p[7] < 10 or (MITRFE and p[8] < 100) or abs(p[9]) > 3e-3 or p[10] <= 1 or p[11] <= 1e-9 or p[12] <= 100: return np.full(nU * (2 if WSTROM else 1), 10.0)
    r = []; ri = []
    for d in D:
        u, ii, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"] * d["gew"])
        if WSTROM: ri.append(WSTROM * (ii - d["i"]) / d["iMax"])
    return np.concatenate(r + ri)
