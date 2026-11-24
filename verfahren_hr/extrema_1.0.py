import numpy as np, glob, sys
def lade(p):
    d = np.loadtxt(p, comments="#")
    return d[:,1], d[:,9], d[:,10], d[:,13], d[:,14]  # t, uC, u2, uE, i
for p in sorted(glob.glob("messungen/rlc27_2026-11-23_*.txt"), key=lambda s: int(s.split("_T")[1].split("_")[0])):
    t,uC,u2,uE,i = lade(p)
    T = int(p.split("_T")[1].split("_")[0])
    m = t>0
    t,uC,u2,uE,i = t[m],uC[m],u2[m],uE[m],i[m]
    Uinf = uC[-100:].mean(); Einf = uE[-100:].mean()
    # smooth a bit for extrema
    k = 5; us = np.convolve(uC, np.ones(k)/k, mode="same")
    ext=[]
    for n in range(k, len(us)-k):
        if us[n]>=us[n-1] and us[n]>us[n+1] and us[n]>Uinf: ext.append(n)
        if us[n]<=us[n-1] and us[n]<us[n+1] and us[n]<Uinf: ext.append(n)
    # keep alternating sign and |A| > 8 mV
    ex=[]
    for n in ext:
        A = uC[max(0,n-3):n+4].mean()-Uinf if False else us[n]-Uinf
        if abs(A) < 0.008: continue
        if ex and np.sign(A)==np.sign(ex[-1][1]): 
            if abs(A)>abs(ex[-1][1]): ex[-1]=(n,A)
            continue
        ex.append((n,A))
    print(f"\nT{T}: U_inf={Uinf:.4f} V  U_E,inf={Einf:.4f} V  U_E/U_inf={Einf/Uinf:.4f}  i_end={i[-100:].mean():.3f} mA  Ueber={1+ex[0][1]/Uinf:.3f}")
    print("  k   t_ms    A_V     |A|/Uinf   dt_half_ms  Lambda   zeta_eq   i_peak_mA")
    for j,(n,A) in enumerate(ex):
        ipk = i[max(0,n-30):n+30]; ipk = ipk[np.argmax(np.abs(ipk))]
        if j+1<len(ex):
            n2,A2 = ex[j+1]; dt=(t[n2]-t[n])*1e3; lam=np.log(abs(A/A2)); z=lam/np.sqrt(np.pi**2+lam**2)
            print(f"  {j:2d} {t[n]*1e3:6.0f} {A:+7.3f}  {abs(A)/Uinf:7.3f}    {dt:6.1f}    {lam:6.3f}   {z:6.3f}    {ipk:+7.2f}")
        else:
            print(f"  {j:2d} {t[n]*1e3:6.0f} {A:+7.3f}  {abs(A)/Uinf:7.3f}")
