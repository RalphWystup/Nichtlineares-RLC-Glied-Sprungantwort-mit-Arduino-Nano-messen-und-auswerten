"""hr_schritte_0.3.py -- R_Fe fein abtasten (Schleifenfläche und Fit-Rest), Kennlinien aus T140, dann DGL für T140 UND T128 mit denselben Kennlinien (Übertragbarkeit)."""
import numpy as np
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
dt = 0.001; Rs = 47.0
t, uC, u2, uE, im = lade("../messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt")
I1 = np.cumsum(uE - u2) * dt; I2 = np.cumsum(im) * dt; RCu = I1[-1] / I2[-1]
uL = uE - u2 - RCu * im; psi = np.cumsum(uL) * dt; q = I2; w = t <= 0.45
print("R_Cu", round(RCu, 1))
for RFe in (2500, 3000, 3500, 4000, 5000, 6000, 8000, 12000):
    imag = im - uL / RFe; A = np.trapezoid(psi[w], imag[w])
    p = fit(imag[w], psi[w], 2, imag[w].std(), 3); r = tanhsum(p, imag[w], 2) - psi[w]
    print(f"R_Fe {RFe:6d}: Schleife {A*1e6:7.1f} µJ, Rest K=2 {r.std()/np.ptp(psi[w])*100:.2f} %")
RFe = 3000.0; imag = im - uL / RFe
pp = fit(imag[w], psi[w], 2, imag[w].std()); pq = fit(uC[w], q[w], 2, uC[w].std()); K = 2
print("psi-Summe b1,b2,b3,b0:", np.round(pp, 5)); print("q-Summe:", np.round(pq, 8))
R = RCu + Rs
def im_von_psi(ps, x0):
    x = x0
    for _ in range(6): x -= (tanhsum(pp, np.array([x]), K)[0] - ps) / max(dtanhsum(pp, np.array([x]), K)[0], 0.5)
    return x
def rhs(y, ue, x0):
    ps, uc = y; x = im_von_psi(ps, x0); uLv = (ue - R*x - uc) / (1 + R/RFe); ii = x + uLv/RFe
    Cd = max(dtanhsum(pq, np.array([uc]), K)[0], 2e-6); return np.array([uLv, ii/Cd]), x, ii
def simuliere(t, uE):
    y = np.array([0., 0.]); sim = []; h = dt/10; x0 = 0.
    for n in range(len(t)):
        d, x0, ii = rhs(y, uE[n], x0); sim.append([ii, y[1]])
        for _ in range(10):
            k1,_,_ = rhs(y, uE[n], x0); k2,_,_ = rhs(y+h/2*k1, uE[n], x0); k3,_,_ = rhs(y+h/2*k2, uE[n], x0); k4,_,_ = rhs(y+h*k3, uE[n], x0); y = y + h/6*(k1+2*k2+2*k3+k4)
    return np.array(sim)
for name, f in (("T140 (Quelle der Kennlinien)", "../messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt"), ("T128 (nur vorhergesagt)", "../messungen/rlc27_2026-11-23_113104_T128_F3_B4.txt")):
    t2, uC2, u22, uE2, im2 = lade(f); sim = simuliere(t2, uE2); dU = uC2[-20:].mean(); e = sim[:,1] - uC2; ei = sim[:,0] - im2
    print(f"{name}: uC RMSE {e.std()/dU*100:.2f} % ΔU, max {np.abs(e).max()/dU*100:.2f} %; Scheitel sim {sim[:,1].max():.3f} / mess {uC2.max():.3f} V; i RMSE {ei.std()*1e3:.3f} mA")
