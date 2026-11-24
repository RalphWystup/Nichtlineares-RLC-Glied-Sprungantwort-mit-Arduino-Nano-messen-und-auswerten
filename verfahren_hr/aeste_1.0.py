import numpy as np, glob
RCu=92.0
for p in sorted(glob.glob("messungen/rlc27_2026-11-23_*.txt"), key=lambda s:int(s.split("_T")[1].split("_")[0])):
    D=np.loadtxt(p,comments="#"); t,uC,u2,uE,i=D[:,1],D[:,9],D[:,10],D[:,13],D[:,14]/1000; m=t>=0; t,uC,u2,uE,i=t[m],uC[m],u2[m],uE[m],i[m]
    i0=i[-100:].mean(); i=i-i0; uE=uE-(uE[-100:].mean()-u2[-100:].mean())  # Nullabgleich am Ende
    uL=uE-u2-RCu*i; psi=np.cumsum(uL)*1e-3
    # Umkehrpunkte des Stroms: geglättet
    k=7; isg=np.convolve(i,np.ones(k)/k,mode="same")
    ext=[0]
    for n in range(k,len(isg)-k):
        if (isg[n]>isg[n-1] and isg[n]>=isg[n+1]) or (isg[n]<isg[n-1] and isg[n]<=isg[n+1]):
            if abs(isg[n]-isg[ext[-1]])>0.15e-3: ext.append(n)
    T=p.split("_T")[1].split("_")[0]
    print(f"T{T}: psi_end={psi[-1]*1e3:.2f} mVs   Äste (Umkehr -> Umkehr): Hub |Δi| mA, Δψ/Δi H, L_i-Schätzung aus Rayleigh (Chord = L_i + ν/2·Hub)")
    for a,b in zip(ext[:-1],ext[1:]):
        di=isg[b]-isg[a]; dp=psi[b]-psi[a]
        print(f"   {t[a]*1e3:4.0f}->{t[b]*1e3:4.0f} ms  i {isg[a]*1e3:+5.2f}->{isg[b]*1e3:+5.2f}  Hub {abs(di)*1e3:5.2f} mA   Δψ/Δi {dp/di:6.2f} H")
