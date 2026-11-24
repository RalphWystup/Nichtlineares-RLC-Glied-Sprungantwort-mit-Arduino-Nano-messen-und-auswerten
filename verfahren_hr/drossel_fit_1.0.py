"""drossel_fit_1.0.py (24.11.2026): Hysteresemodell der Drossel DIREKT an ψ(i) der vier Messungen fitten (ohne DGL, ohne Kondensator).
ψ_mess = ∫(u_E − u_A2 − R_Cu i)dt (R_Cu = 92 Ω, Nullabgleich am Ende); ψ_modell: Preisach entlang des gemessenen (geglätteten) Stroms.
Dichten: exp (verschiebungsinvariant, ρ0·e^{−h/h_c}/h_c), expsat (dazu Sättigungshülle g(m) = sech²(m/i_s) über die Mitte m = (α+β)/2 --
Gauß-Legendre 8 Punkte auf dem Ast), gamma, gammasat. Neukurve ab entmagnetisiertem Zustand (untere Grenze −i).
Ausgabe: Parameter, ψ-Rest je Messung, Bild drossel_fit_1.0_<dichte>.png."""
import numpy as np, glob, os, sys, json
from scipy.signal import savgol_filter
from scipy.optimize import least_squares, differential_evolution
from numba import njit
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
DICHTE = sys.argv[1] if len(sys.argv) > 1 else "expsat"; RCU = float(sys.argv[2]) if len(sys.argv) > 2 else 92.0
GLX, GLW = np.polynomial.legendre.leggauss(8); GLX = (GLX + 1) / 2; GLW = GLW / 2   # auf [0,1]
def median3(a): b = a.copy(); b[1:-1] = np.median(np.vstack([a[:-2], a[1:-1], a[2:]]), axis=0); return b
D = []
for f in sorted(glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt")), key=lambda s: int(s.split("_T")[1].split("_")[0])):
    T = int(f.split("_T")[1].split("_")[0]); A = np.loadtxt(f, comments="#"); t, uC, u2, uE, i = A[:,1], A[:,9], A[:,10], A[:,13], A[:,14]/1000; m = t >= 0
    t, uC, u2, uE, i = t[m], uC[m], u2[m], uE[m], median3(i[m]); i -= i[-100:].mean(); uE -= (uE[-100:].mean() - u2[-100:].mean())
    psi = np.cumsum(uE - u2 - RCU * i) * 1e-3; ig = savgol_filter(i, 7, 2)
    D.append(dict(T=T, t=t, ig=ig, psi=psi, n=int(0.35 / 1e-3)))   # nur die ersten 350 ms (danach Rauschen/Drift)
@njit(cache=True)
def Ld(x, ir, s, Lr, rho, hc, iS, art, glx, glw):
    d = abs(x - ir)
    if art == 0: return Lr + 2 * rho * (1 - np.exp(-d / hc))
    if art == 2: return Lr + 2 * rho * (1 - (1 + d / hc) * np.exp(-d / hc))
    acc = 0.0
    for k in range(glx.shape[0]):
        h = d * glx[k]; mid = x - s * h / 2
        fc = np.exp(-h / hc) / hc if art == 1 else (h / hc) * np.exp(-h / hc) / hc
        g = 1 / np.cosh(min(300.0, abs(mid / iS))) ** 2
        acc += glw[k] * fc * g
    return Lr + 2 * rho * d * acc
@njit(cache=True)
def psi_entlang(ig, Lr, rho, hc, iS, art, glx, glw):
    n = ig.shape[0]; psi = np.zeros(n); stapel = np.empty(64); ns = 0; s = 1.0
    for k in range(1, n):
        di = ig[k] - ig[k-1]
        if di * s < 0 and abs(di) > 2e-5:
            s = -s
            if ns < 64: stapel[ns] = ig[k-1]; ns += 1
        while ns >= 2 and ((s > 0 and ig[k] >= stapel[ns-2]) or (s < 0 and ig[k] <= stapel[ns-2])): ns -= 2
        ir = stapel[ns-1] if ns > 0 else -ig[k]
        psi[k] = psi[k-1] + Ld(ig[k], ir, s, Lr, rho, hc, iS, art, glx, glw) * di
    return psi
ART = {"exp": 0, "expsat": 1, "gamma": 2, "gammasat": 3}[DICHTE]
p0 = np.array([4.0, 20.0, 5e-3, 3e-3]); frei = [0, 1, 2] + ([3] if ART in (1, 3) else [])
def voll(z): p = p0.copy(); [p.__setitem__(k, z[j] * p0[k]) for j, k in enumerate(frei)]; return p
def resid(z):
    p = voll(z)
    if p[0] <= 0 or p[1] < 0 or p[2] <= 1e-5 or p[3] <= 1e-5: return np.full(sum(d["n"] for d in D), 1.0)
    return np.concatenate([(psi_entlang(d["ig"], *p, ART, GLX, GLW)[:d["n"]] - d["psi"][:d["n"]]) / d["psi"].max() for d in D])
g = differential_evolution(lambda z: float(np.sum(resid(z) ** 2)), [(0.1, 5)] * len(frei), seed=1, maxiter=100, popsize=15, tol=1e-10, polish=False)
r = least_squares(resid, g.x, diff_step=1e-3, xtol=1e-10, ftol=1e-10); p = voll(r.x)
print("Dichte %s, R_Cu %.0f Ω: L_rev %.3f H, rho0 %.2f H, h_c %.3f mA, i_s %.3f mA" % (DICHTE, RCU, p[0], p[1], p[2]*1e3, p[3]*1e3))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
fig, ax = plt.subplots(1, 4, figsize=(20, 4.5)); ges = []
for c, d in enumerate(D):
    ps = psi_entlang(d["ig"], *p, ART, GLX, GLW); e = (ps - d["psi"])[:d["n"]]; ges.append(e.std() / d["psi"].max() * 100)
    print("  T%d: ψ-Rest RMS %.2f mVs = %.2f %% von ψ_max %.1f mVs; Scheitel ψ Modell %.1f, gemessen %.1f" % (d["T"], e.std()*1e3, ges[-1], d["psi"].max()*1e3, ps.max()*1e3, d["psi"].max()*1e3))
    tm = d["t"] * 1e3; ax[c].plot(tm, d["psi"]*1e3, "k", lw=.8, label="ψ gemessen"); ax[c].plot(tm, ps*1e3, "r", lw=.8, label="ψ Modell(i_mess)"); a2 = ax[c].twinx(); a2.plot(tm, (ps - d["psi"])*1e3, "b", lw=.6); ax[c].set_xlim(0, 350); ax[c].set_title("T%d ψ / mVs, Rest %.2f %%" % (d["T"], ges[-1])); ax[c].legend()
print("Mittel %.2f %%" % np.mean(ges)); fig.tight_layout(); fig.savefig(os.path.join(H, "drossel_fit_1.0_%s.png" % DICHTE), dpi=80)
json.dump({"dichte": DICHTE, "RCu": RCU, "L_rev": p[0], "rho0": p[1], "h_c": p[2], "i_s": p[3], "rest": ges}, open(os.path.join(H, "drossel_fit_1.0_%s.json" % DICHTE), "w"), indent=1)
