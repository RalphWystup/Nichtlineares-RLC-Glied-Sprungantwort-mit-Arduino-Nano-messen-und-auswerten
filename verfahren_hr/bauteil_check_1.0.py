"""bauteil_check_1.0.py (24.11.2026): die beiden Bauteilmodelle einzeln gegen die Messkanäle prüfen, entkoppelt von der DGL.
(a) Drossel: gemessenes i(t) in das Preisach-Modell (exp-Dichte, Parameter aus preisach_1.4 exp/demag) -> ψ_modell(t); Vergleich mit
    ψ_mess(t) = ∫(u_E − u_A2 − R_Cu i) dt (Nullabgleich am Ende).  (b) Kondensator: gemessenes u_C(t) in C(u) -> q_modell; Vergleich mit q_mess = ∫i dt.
Bild bauteil_check_1.0.png. Zweck: welches Bauteilmodell trägt den Rest von 1,1 %?"""
import numpy as np, glob, os, json
from scipy.signal import savgol_filter
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(os.path.dirname(H), "messungen")
P = json.load(open(os.path.join(H, "preisach_1.4_exp_demag_konst_dreieck_ohne_rcufest_s1.json")))["param"]
Lr, rho, hc, C0, ga, RCu = P["L_rev/H"], P["rho0/H"], P["h_c/A"], P["C0/F"], P["gamma/V^-2"], P["R_Cu/Ω"]
def median3(a): b = a.copy(); b[1:-1] = np.median(np.vstack([a[:-2], a[1:-1], a[2:]]), axis=0); return b
fig, ax = plt.subplots(2, 4, figsize=(20, 8))
for c, f in enumerate(sorted(glob.glob(os.path.join(M, "rlc27_2026-11-23_*.txt")), key=lambda s: int(s.split("_T")[1].split("_")[0]))):
    T = int(f.split("_T")[1].split("_")[0]); D = np.loadtxt(f, comments="#"); t, uC, u2, uE, i = D[:,1], D[:,9], D[:,10], D[:,13], D[:,14]/1000; m = t >= 0
    t, uC, u2, uE, i = t[m], uC[m], u2[m], uE[m], median3(i[m]); i -= i[-100:].mean(); uE -= (uE[-100:].mean() - u2[-100:].mean())
    uL = uE - u2 - RCu * i; psi_m = np.cumsum(uL) * 1e-3
    # (a) Preisach entlang des gemessenen Stroms (geglättet für die Umkehrpunkte)
    ig = savgol_filter(i, 7, 2); stapel = []; s = 1.0; psi = np.zeros(len(ig))
    for n in range(1, len(ig)):
        di = ig[n] - ig[n-1]
        if di * s < 0 and abs(di) > 2e-5: s = -s; stapel.append(ig[n-1])
        while len(stapel) >= 2 and ((s > 0 and ig[n] >= stapel[-2]) or (s < 0 and ig[n] <= stapel[-2])): stapel.pop(); stapel.pop()
        ir = stapel[-1] if stapel else -ig[n]; d = abs(ig[n] - ir)
        Ld = Lr + 2 * rho * (1 - np.exp(-d / hc)); psi[n] = psi[n-1] + Ld * di
    # (b) Kondensator
    q_m = np.cumsum(i) * 1e-3; q = C0 / np.sqrt(ga) * np.arctan(np.sqrt(ga) * uC)   # ∫C0/(1+γu²)du
    tm = t * 1e3
    ax[0, c].plot(tm, psi_m * 1e3, "k", lw=.8, label="ψ gemessen"); ax[0, c].plot(tm, psi * 1e3, "r", lw=.8, label="ψ Preisach(i_mess)"); ax2 = ax[0, c].twinx(); ax2.plot(tm, (psi - psi_m) * 1e3, "b", lw=.6); ax2.set_ylabel("Rest / mVs", color="b")
    ax[0, c].set_title("T%d Drossel: ψ / mVs" % T); ax[0, c].legend(loc="upper right"); ax[0, c].set_xlim(0, 350)
    ax[1, c].plot(tm, q_m * 1e6, "k", lw=.8, label="q = ∫i dt gemessen"); ax[1, c].plot(tm, q * 1e6, "r", lw=.8, label="q = ∫C(u)du Modell"); ax3 = ax[1, c].twinx(); ax3.plot(tm, (q - q_m) * 1e6, "b", lw=.6); ax3.set_ylabel("Rest / µC", color="b")
    ax[1, c].set_title("T%d Kondensator: q / µC" % T); ax[1, c].legend(loc="lower right"); ax[1, c].set_xlim(0, 350)
    print("T%d: ψ-Rest RMS %.2f mVs (ψ_max %.1f), q-Rest RMS %.2f µC (q_end %.1f), q_end gemessen/Modell %.4f" % (T, (psi-psi_m).std()*1e3, psi_m.max()*1e3, (q-q_m).std()*1e6, q_m[-1]*1e6, q_m[-1]/q[-1]))
fig.tight_layout(); fig.savefig(os.path.join(H, "bauteil_check_1.0.png"), dpi=80); print("bauteil_check_1.0.png")
