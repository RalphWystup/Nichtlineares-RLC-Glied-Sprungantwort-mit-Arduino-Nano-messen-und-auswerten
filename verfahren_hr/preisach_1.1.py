#!/usr/bin/env python3
"""preisach_1.1.py (24.11.2026) -- physikalisches Modell der amplitudenabhängigen Dämpfung: Preisach-Hysterese der Eisendrossel mit Produktdichte.
Aus rayleigh_1.0.py: die Rayleigh-Parabel trifft alle vier Messungen gemeinsam auf 1,0 % (4 Parameter), aber ν läuft davon (64 H bei 2,8 mA) --
es fehlt die Sättigung. Preisach (1935)/Mayergoyz: Hysteronen γ_αβ mit Dichte ρ(α, β); hier Produktdichte
    ρ(α, β) = ρ_0 · w(α) · w(β),  w(x) = sech²(x / i_s),  W(x) = ∫w = i_s · tanh(x / i_s).
Differentielle Induktivität auf dem Ast ab dem letzten Umkehrpunkt i_r (Richtung s = ±1):
    L_d(i) = L_rev + 2 ρ_0 · w(i) · |W(i) − W(i_r)|            (Neukurve ab dem entmagnetisierten Zustand: i_r = −i)
Kleinsignal (|i|, |i_r| ≪ i_s): L_d = L_rev + 2 ρ_0 |i − i_r| = Rayleigh mit ν = 2 ρ_0. Großsignal: w(i) → 0, Hysterese sättigt.
Gedächtnis: Stapel der Umkehrpunkte (Preisach-Löschregel: ein Ast, der einen älteren Umkehrpunkt überschreitet, löscht ihn).
Zustände: i_m (Magnetisierungsstrom), u_C; i = i_m + u_L/R_Fe (Wirbelstrom, wahlweise); C(u) = C_0/(1 + γ u²).
Aufruf: python3 preisach_1.1.py [ue=dreieck|roh] [rfe=1|0] [rcu=fest|frei] [strom=<Gewicht, 0 = aus>] [esr=1|0]
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import numpy as np, sys, time, glob, os, json
from scipy.optimize import least_squares
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
arg = dict(a.split("=") for a in sys.argv[1:]); UE = arg.get("ue", "dreieck"); MITRFE = arg.get("rfe", "0") == "1"; RCUFREI = arg.get("rcu", "fest") == "frei"
WSTROM = float(arg.get("strom", "0")); MITESR = arg.get("esr", "0") == "1"
Rs = 47.0; dt = 0.001; UNTER = 10

def mittel(a, w):
    h = w // 2; r = np.empty_like(a)
    for n in range(len(a)): r[n] = a[max(0, n - h):n + h + 1].mean()
    return r
def lade(f):
    D = np.loadtxt(f, comments="#"); t, uC, uE, i = D[:, 1], D[:, 9], D[:, 13], D[:, 14] / 1000; m = t >= 0
    t, uC, uE, i = t[m], uC[m], uE[m], i[m]; i = i - i[-100:].mean()   # Nullabgleich des Stroms am Ende
    if UE == "dreieck": uE = mittel(mittel(uE, 5), 5)
    return dict(T=int(f.split("_T")[1].split("_")[0]), t=t, uC=uC, uE=uE, i=i, dU=uC[-20:].mean(), iMax=np.abs(i).max())
D = sorted([lade(f) for f in glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt"))], key=lambda d: d["T"])

def simuliere(p, d, unter=UNTER):
    """p = (L_rev, rho0, i_s, C0, gamma, RCu, RFe, ESR); liefert u_C(t), i(t), L_d(t)."""
    Lr, rho, iS, C0, ga, RCu, RFe, ESR = p; R = RCu + Rs; h = dt / unter; uE = d["uE"]; n = len(uE)
    W = lambda x: iS * np.tanh(x / iS); w = lambda x: 1 / np.cosh(min(300.0, abs(x / iS))) ** 2
    st = dict(s=1.0, stapel=[])   # Umkehrpunkte (Strom), Neukurve: leer -> i_r = -i
    def Ld(x):
        ir = st["stapel"][-1] if st["stapel"] else -x
        return Lr + 2 * rho * w(x) * abs(W(x) - W(ir))
    def rhs(x, uc, ue):
        L = Ld(x)
        if np.isfinite(RFe):
            ul = (ue - R * x - uc) / (1 + R / RFe); ii = x + ul / RFe
        else: ul = ue - R * x - uc; ii = x
        if MITESR: ul -= ESR * ii / (1 + R / RFe if np.isfinite(RFe) else 1)   # grob: ESR in Reihe zu C (kleine Korrektur)
        C = C0 / (1 + ga * uc * uc)
        return ul / L, ii / C, ii, ul, L
    x, uc = 0.0, 0.0; out_u = np.empty(n); out_i = np.empty(n); out_L = np.empty(n)
    for j in range(n):
        ue = uE[j]; r0 = rhs(x, uc, ue); out_u[j] = uc; out_i[j] = r0[2]; out_L[j] = r0[4]
        for _ in range(unter):
            k1 = rhs(x, uc, ue); k2 = rhs(x + h / 2 * k1[0], uc + h / 2 * k1[1], ue); k3 = rhs(x + h / 2 * k2[0], uc + h / 2 * k2[1], ue); k4 = rhs(x + h * k3[0], uc + h * k3[1], ue)
            x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); uc += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
            if not (np.isfinite(x) and np.isfinite(uc)): return np.full(n, 1e3), np.full(n, 1e3), np.full(n, 1e3)
            ul = rhs(x, uc, ue)[3]
            if ul * st["s"] < 0:   # Umkehrpunkt
                st["s"] = -st["s"]; st["stapel"].append(x)
            # Löschregel: Ast überschreitet ältere Umkehrpunkte (gleiche Richtung) -> löschen
            sp = st["stapel"]
            while len(sp) >= 2 and ((st["s"] > 0 and x >= sp[-2]) or (st["s"] < 0 and x <= sp[-2])): sp.pop(); sp.pop()
    return out_u, out_i, out_L

def fehler(u, d): e = u - d["uC"]; return e.std() / d["dU"] * 100, np.abs(e).max() / d["dU"] * 100

# Startwerte: Kleinsignal halbe Periode 32 ms, C(2,7 V) ≈ 20 µF -> L_rev; Rayleigh ν ≈ 3000 H/A -> rho0 = 1500; i_s 2 mA
C0, ga = 29e-6, 0.05; w0 = np.pi / 0.032; Lr = 1 / (w0 * w0 * C0 / (1 + ga * 2.7 ** 2))
p0 = np.array([Lr, 1500.0, 2e-3, C0, ga, 92.0, 5000.0 if MITRFE else 1.0, 1.0])
frei = [0, 1, 2, 3, 4] + ([5] if RCUFREI else []) + ([6] if MITRFE else []) + ([7] if MITESR else [])
namen = ["L_rev/H", "rho0/(H/A)", "i_s/A", "C0/F", "gamma/V^-2", "R_Cu/Ω", "R_Fe/Ω", "ESR/Ω"]
def voll(z):
    p = p0.copy()
    for j, k in enumerate(frei): p[k] = z[j] * p0[k]
    if not MITRFE: p[6] = np.inf
    if not MITESR: p[7] = 0.0
    return p
nU = sum(len(d["uC"]) for d in D)
def resid(z, unter=4):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 0 or p[4] < 0 or p[5] < 10 or (MITRFE and p[6] < 100): return np.full(nU * (2 if WSTROM else 1), 10.0)
    r = []; ri = []
    for d in D:
        u, ii, _ = simuliere(p, d, unter); r.append((u - d["uC"]) / d["dU"])
        if WSTROM: ri.append(WSTROM * (ii - d["i"]) / d["iMax"])
    return np.concatenate(r + ri)
print("Modell: Preisach-Produktdichte; Anregung %s; R_Fe %s; R_Cu %s; Stromgewicht %g; ESR %s" % (UE, "frei" if MITRFE else "∞", "frei" if RCUFREI else "92 Ω fest", WSTROM, "frei" if MITESR else "0"), flush=True)
for d in D: u, _, _ = simuliere(voll(np.ones(len(frei))), d); print("  Start T%d: RMSE %.2f %% (max %.1f)" % (d["T"], *fehler(u, d)), flush=True)
t0 = time.time(); z = np.ones(len(frei)); best = None
for runde in range(3):
    r = least_squares(resid, z, method="trf", diff_step=1e-2 if runde == 0 else 3e-3, max_nfev=400, xtol=1e-9, ftol=1e-9, gtol=1e-9)
    print("  Runde %d: %d Auswertungen, Kosten %.4g, Status %d, %.0f s" % (runde + 1, r.nfev, r.cost, r.status, time.time() - t0), flush=True)
    if best is not None and r.cost >= best.cost * (1 - 1e-4): break
    best = r; z = r.x
p = voll(best.x)
print("Ergebnis:", ", ".join("%s = %.5g" % (namen[k], p[k]) for k in range(8) if k in frei or k < 5))
print("  Rayleigh-Grenze: ν = 2ρ0 = %.0f H/A; L_d nach 5,3 mA Hub um 0: %.2f H; Neukurve L_d(2,8 mA) = %.2f H; L_rev = %.2f H" % (2 * p[1], p[0] + 2 * p[1] * p[2] * np.tanh(5.3e-3 / p[2]) * 0 + 2 * p[1] * abs(p[2] * np.tanh(0 / p[2]) - p[2] * np.tanh(-2.6e-3 / p[2])), p[0] + 2 * p[1] / np.cosh(2.8e-3 / p[2]) ** 2 * 2 * p[2] * np.tanh(2.8e-3 / p[2]), p[0]))
print("  C(0) %.1f µF, C(1,2 V) %.1f, C(2,7 V) %.1f, C(4,4 V) %.1f µF" % tuple(p[3] / (1 + p[4] * u * u) * 1e6 for u in (0, 1.2, 2.7, 4.4)))
ges = []; erg = {"param": {namen[k]: float(p[k]) for k in range(8)}, "ue": UE, "strom": WSTROM, "mess": {}}
for d in D:
    u, ii, L = simuliere(p, d); e, mx = fehler(u, d); ges.append(e); k = np.argmax(u); km = np.argmax(d["uC"])
    print("  T%d: RMSE %.2f %% (max %.1f %%)  Scheitel sim %.3f V @ %d ms, gemessen %.3f V @ %d ms;  i: RMS-Abw. %.3f mA (i_max %.2f);  L_d %.1f … %.1f H" % (d["T"], e, mx, u[k], d["t"][k] * 1e3, d["uC"][km], d["t"][km] * 1e3, (ii - d["i"]).std() * 1e3, d["iMax"] * 1e3, L.min(), L.max()))
    erg["mess"]["T%d" % d["T"]] = {"rmse": e, "max": mx, "irms_mA": float((ii - d["i"]).std() * 1e3)}
    np.save(os.path.join(H, "preisach_sim_T%d.npy" % d["T"]), np.vstack([d["t"], u, ii, L]))
print("Mittel RMSE %.2f %%  (%.0f s)" % (np.mean(ges), time.time() - t0))
kennung = "%s_%s_%s_s%g%s" % (UE, "rfe" if MITRFE else "ohne", "rcufrei" if RCUFREI else "rcufest", WSTROM, "_esr" if MITESR else "")
json.dump(erg, open(os.path.join(H, "preisach_1.1_%s.json" % kennung), "w"), indent=1)
