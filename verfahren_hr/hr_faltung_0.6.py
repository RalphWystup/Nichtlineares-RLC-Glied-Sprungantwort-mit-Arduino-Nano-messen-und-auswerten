"""hr_faltung_0.6.py -- Prüfung der Behauptung „mit der approximierten Impulsantwort erhält man durch Faltung jede Sprungantwort“ am nichtlinearen RLC-Glied:
g aus T140 (geglättete Ableitung der Sprungantwort / ΔU), FIR-Faltung mit der gemessenen Anregung u_E(t) von T128, Vergleich mit der Messung T128."""
import numpy as np
def lade(f):
    D = np.loadtxt(f, comments="#"); m = D[:,1] >= 0; return D[m,1], D[m,9], D[m,13]
t, uC, uE = lade("../messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt"); t8, uC8, uE8 = lade("../messungen/rlc27_2026-11-23_113104_T128_F3_B4.txt")
dt = 0.001; dU, dU8 = uC[-20:].mean(), uC8[-20:].mean()
def dreieck(a, w): k = np.ones(w)/w; return np.convolve(np.convolve(a, k, "same"), k, "same")
g = dreieck(np.gradient(uC, dt), 3) / dU          # Impulsantwort aus T140 (1/s), ∫g dt ≈ 1
print("∫g dt =", round(g.sum()*dt, 4), "Scheitel", round(g.max(), 2), "1/s")
def falte(g, u): return np.convolve(u, g)[:len(u)] * dt   # FIR-Faltung y = (g * u_E)
y_eigen = falte(g, uE); y_8 = falte(g, uE8)
e1 = y_eigen - uC; e2 = y_8 - uC8
print(f"T140 mit eigenem g: RMSE {e1.std()/dU*100:.2f} % ΔU, max {np.abs(e1).max()/dU*100:.1f} %  (Selbsttest der Faltung)")
print(f"T128 mit g aus T140: RMSE {e2.std()/dU8*100:.2f} % ΔU, max {np.abs(e2).max()/dU8*100:.1f} %; Scheitel Faltung {y_8.max():.3f} V, Messung {uC8.max():.3f} V")
# umgekehrt: g aus T128 auf T140
g8 = dreieck(np.gradient(uC8, dt), 3) / dU8; y_40 = falte(g8, uE); e3 = y_40 - uC
print(f"T140 mit g aus T128: RMSE {e3.std()/dU*100:.2f} % ΔU, max {np.abs(e3).max()/dU*100:.1f} %; Scheitel Faltung {y_40.max():.3f} V, Messung {uC.max():.3f} V")
# Überschwingfaktoren
print(f"Überschwingfaktor T140 {uC.max()/dU:.3f}, T128 {uC8.max()/dU8:.3f}; Periode (Nulldurchgänge von uC−ΔU): ",
      [round(x,1) for x in t[np.where(np.diff(np.sign(uC-dU))!=0)[0][:4]]*1000], [round(x,1) for x in t8[np.where(np.diff(np.sign(uC8-dU8))!=0)[0][:4]]*1000])
