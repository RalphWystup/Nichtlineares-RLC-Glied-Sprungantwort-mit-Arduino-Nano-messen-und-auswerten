"""ld_aeste_1.0.py (24.11.2026): modellfrei L_d = u_L / (di/dt) entlang der Äste (Neukurve, erster absteigender Ast) aus T140 und T60;
i geglättet (Savitzky-Golay 11/2), u_L = u_E − u_A2 − R_Cu i (R_Cu = 92 Ω), Nullabgleich am Ende. Bild ld_aeste_1.0.png."""
import numpy as np, glob, os
from scipy.signal import savgol_filter
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
fig, ax = plt.subplots(1, 3, figsize=(18, 5.5))
for p in sorted(glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt")), key=lambda s: int(s.split("_T")[1].split("_")[0])):
    T = int(p.split("_T")[1].split("_")[0]); D = np.loadtxt(p, comments="#"); t, uC, u2, uE, i = D[:,1], D[:,9], D[:,10], D[:,13], D[:,14]/1000; m = t >= 0
    t, uC, u2, uE, i = t[m], uC[m], u2[m], uE[m], i[m]
    i[1:-1] = np.median(np.vstack([i[:-2], i[1:-1], i[2:]]), axis=0); i -= i[-100:].mean(); uE -= (uE[-100:].mean() - u2[-100:].mean())
    uL = uE - u2 - 92.0 * i; psi = np.cumsum(uL) * 1e-3
    ig = savgol_filter(i, 11, 2); di = savgol_filter(i, 11, 2, deriv=1, delta=1e-3); uLg = savgol_filter(uL, 11, 2)
    Ld = uLg / di; ok = np.abs(di) > 0.02   # A/s
    k0 = np.argmax(ig); k1 = k0 + np.argmin(ig[k0:k0+120])
    ax[0].plot(ig[:k0]*1e3, np.where(ok, Ld, np.nan)[:k0], ".-", ms=3, lw=0.6, label="T%d Neukurve" % T)
    ax[1].plot(ig[k0:k1]*1e3, np.where(ok, Ld, np.nan)[k0:k1], ".-", ms=3, lw=0.6, label="T%d 1. abst. Ast" % T)
    ax[2].plot(ig*1e3, psi*1e3, lw=0.7, label="T%d" % T)
for a, ti in zip(ax, ["Neukurve: L_d = u_L/(di/dt) über i / mA", "erster absteigender Ast (vom Maximum zum Minimum)", "ψ(i) / mVs (Schleifen)"]):
    a.set_title(ti); a.grid(alpha=.3); a.legend()
ax[0].set_ylim(0, 40); ax[1].set_ylim(0, 40); ax[0].set_ylabel("L_d / H")
fig.tight_layout(); fig.savefig(os.path.join(H, "ld_aeste_1.0.png"), dpi=80); print("ld_aeste_1.0.png")
