"""hr_suche_0.5.py (23.11.2026) -- „Simulation und Suche“: Start = Kennlinienweg (psi(i_m), q(u_C) als tanh-Summen K=2, R_Cu aus psi(∞)=0, R_Fe aus
kleinstem DGL-Fehler); dann alle 16 Parameter mit least_squares so nachstellen, dass die DGL-Lösung die gemessene Sprungantwort T140 trifft.
Danach Vorhersage T128 mit den nachgestellten Parametern (Überanpassung?). Sein Wort: „so dass die abweichungen minimal werden halt“."""
import numpy as np, time
from scipy.optimize import least_squares
def lade(f):
    D = np.loadtxt(f, comments="#"); t, uC, u2, uE, i = D[:,1], D[:,9], D[:,10], D[:,13], D[:,14]/1000
    im = i.copy(); im[1:-1] = np.median(np.vstack([i[:-2], i[1:-1], i[2:]]), axis=0); m = t >= 0
    return t[m], uC[m], u2[m], uE[m], im[m]
def tanhsum(p, x, K):
    b1, b2, b3 = p[:K], p[K:2*K], p[2*K:3*K]; return (b1[None,:]*np.tanh(b2[None,:]*(x[:,None]+b3[None,:]))).sum(1) + p[3*K]
def dtanhsum(p, x, K):
    b1, b2, b3 = p[:K], p[K:2*K], p[2*K:3*K]; a = np.clip(b2[None,:]*(x[:,None]+b3[None,:]), -300, 300); return (b1[None,:]*b2[None,:]/np.cosh(a)**2).sum(1)
def fit(x, y, K, s, n=8):
    best = None; rng = np.random.default_rng(1)
    for v in range(n):
        p0 = np.concatenate([rng.uniform(0.5,1.5,K)*np.ptp(y)/K, rng.uniform(0.3,3,K)/s, rng.uniform(-0.5,0.5,K)*s, [0]])
        r = least_squares(lambda p: tanhsum(p,x,K)-y, p0, max_nfev=3000)
        if best is None or r.cost < best.cost: best = r
    return best.x
dt = 0.001; Rs = 47.0; K = 2
t, uC, u2, uE, im = lade("../messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt")
t8, uC8, u28, uE8, im8 = lade("../messungen/rlc27_2026-11-23_113104_T128_F3_B4.txt")
I1 = np.cumsum(uE - u2) * dt; I2 = np.cumsum(im) * dt; RCu = I1[-1] / I2[-1]; uL = uE - u2 - RCu * im; psi = np.cumsum(uL) * dt; q = I2
RFe = 2331.0; imag = im - uL / RFe
pp = fit(imag, psi, K, imag.std()); pq = fit(uC, q, K, uC.std())
def simuliere(pp, pq, RCu, RFe, uEk, unter=4):
    R = RCu + Rs; h = dt/unter
    def im_von_psi(ps, x0):
        x = x0
        for _ in range(6): x -= (tanhsum(pp, np.array([x]), K)[0] - ps) / max(dtanhsum(pp, np.array([x]), K)[0], 0.3)
        return x
    st = {"x0": 0.0}
    def rhs(y, ue):
        ps, uc = y; x = im_von_psi(ps, st["x0"]); st["x0"] = x; ul = (ue - R*x - uc) / (1 + R/RFe); ii = x + ul/RFe
        return np.array([ul, ii/max(dtanhsum(pq, np.array([uc]), K)[0], 1e-6)])
    y = np.array([tanhsum(pp, np.array([0.]), K)[0], 0.]); out = np.empty(len(uEk))
    for n in range(len(uEk)):
        out[n] = y[1]; ue = uEk[n]
        for _ in range(unter):
            k1 = rhs(y, ue); k2 = rhs(y+h/2*k1, ue); k3 = rhs(y+h/2*k2, ue); k4 = rhs(y+h*k3, ue); y = y + h/6*(k1+2*k2+2*k3+k4)
            if not np.all(np.isfinite(y)): return np.full(len(uEk), 1e3)
    return out
dU = uC[-20:].mean(); dU8 = uC8[-20:].mean()
def fehler(u, m, d): e = u - m; return e.std()/d*100, np.abs(e).max()/d*100
u0 = simuliere(pp, pq, RCu, RFe, uE, 10); u08 = simuliere(pp, pq, RCu, RFe, uE8, 10)
print("Start: T140 RMSE %.2f %% (max %.1f), T128 %.2f %% (max %.1f)" % (*fehler(u0, uC, dU), *fehler(u08, uC8, dU8)), flush=True)
# Skalierung: Parameter als Vielfache des Startwerts (log für b2, R)
p0 = np.concatenate([pp, pq, [RCu, RFe]]); skala = np.where(np.abs(p0) > 1e-12, np.abs(p0), 1e-3)
def entpacken(z):
    p = z * skala; return p[:3*K+1], p[3*K+1:6*K+2], p[-2], p[-1]
def resid(z):
    a, b, rc, rf = entpacken(z); 
    if rc < 10 or rf < 200: return np.full(len(uC), 10.0)
    return (simuliere(a, b, rc, rf, uE, 4) - uC) / dU
z0 = p0 / skala; t0 = time.time()
r = least_squares(resid, z0, method="trf", diff_step=1e-3, max_nfev=400, xtol=1e-6, ftol=1e-6, verbose=0)
a, b, rc, rf = entpacken(r.x); print("Suche: %d Auswertungen, %.0f s" % (r.nfev, time.time()-t0), flush=True)
u1 = simuliere(a, b, rc, rf, uE, 10); u18 = simuliere(a, b, rc, rf, uE8, 10)
print("Nachgestellt: T140 RMSE %.2f %% (max %.1f), T128 %.2f %% (max %.1f)" % (*fehler(u1, uC, dU), *fehler(u18, uC8, dU8)))
print("R_Cu %.1f -> %.1f Ω, R_Fe %.0f -> %.0f Ω" % (RCu, rc, RFe, rf))
print("psi vorher", np.round(pp, 5)); print("psi nachher", np.round(a, 5)); print("q vorher", np.round(pq*1e6, 3), "µ"); print("q nachher", np.round(b*1e6, 3), "µ")
print("L_d(0) %.1f -> %.1f H; L_d(2.5 mA) %.1f -> %.1f H; C_d(0) %.1f -> %.1f µF; C_d(4 V) %.1f -> %.1f µF" % (dtanhsum(pp, np.array([0.]), K)[0], dtanhsum(a, np.array([0.]), K)[0], dtanhsum(pp, np.array([2.5e-3]), K)[0], dtanhsum(a, np.array([2.5e-3]), K)[0], dtanhsum(pq, np.array([0.]), K)[0]*1e6, dtanhsum(b, np.array([0.]), K)[0]*1e6, dtanhsum(pq, np.array([4.]), K)[0]*1e6, dtanhsum(b, np.array([4.]), K)[0]*1e6))
np.save("suche_T140.npy", np.concatenate([a, b, [rc, rf]]))
