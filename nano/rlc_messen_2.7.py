"""rlc_messen_2.7.py -- (2.7: für rlc_sprung_2_7 mit A2 = Spulenende hinter dem Messwiderstand R_s zwischen Spule und Kondensator; Zeile k s0 s2 sH nH sL nL nF; Strom i = (U_2 − U_C)/R_s; Satz T:N:V:F:B:P[:R[:Rs]], Rs Vorgabe 47 Ω; B gerade; 2.6: für rlc_sprung_2_6, T <= 140; 2.5: für rlc_sprung_2_5: T <= 140 hart (U_C nie über 5 V), Rampe abwärts R ms nach der Messung (nie negativ), Satz T:N:V:F:B:P[:R]; 2.4: für rlc_sprung_2_4, Bänder 4,5 V / 0,5 V; Ablehnung des Nano wird gemeldet statt Absturz; 2.3: Flankentreffer nF getrennt; T > 160 abgelehnt, außer mit Zusatz :X bei vorhandenem Teiler vor A0) läuft auf dem Laptop (22.11.2026): Sprungmessungen mit rlc_sprung_2_6 (Nano an COM5, 1000000 Bd).
Aufruf: rlc_messen_2.2.py T:N:V:F:B:P [...]   (Vorgabe 128:600:2000:3:4:20; F 1 = 980 Hz, 2 = 3,9 kHz, 3 = 31,4 kHz, 4 = 7,8 kHz, 5 = 62,5 kHz)
Ablage NEU im Ordner Messungen_TT.MM.JJJJ neben diesem Skript (wird angelegt). Spalten:
k t_s s0 s2 sH nH sL nL nF U_C U_2 U_H U_L U_E i_mA  mit U_C = s0/(B/2·1023)·5, U_2 = s2/(B/2·1023)·5, U_H = sH/(nH·1023)·5, U_L = sL/(nL·1023)·5 (fehlt ein Pegel im Fenster: letzter Wert
gehalten; vor dem ersten High: U_H = 5 V), U_E = d·U_H + (1−d)·U_L = MITTELWERT der Anregung unter Last; d = T/255 (F 1–3) bzw. (T+1)/256 (F 4, 5),
d = 0 vor dem Sprung, T = 0 -> 0, T = 255 -> 1. Bezug AVCC = 5 V nominal (wie Simulink-Modell)."""
import os, sys, time, serial
sys.stdout.reconfigure(errors="replace")
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), time.strftime("Messungen_%d.%m.%Y")); os.makedirs(O, exist_ok=True)
def tastgrad(T, F): return 0.0 if T == 0 else 1.0 if T == 255 else (T / 255 if F <= 3 else (T + 1) / 256)
def auswerten(w, T, F, B, Rs):
    f = 5 / 1023; uh, ul = 5.0, 0.0; aus = []
    for k, s0, s2, sH, nH, sL, nL, nF in w:
        if nH: uh = sH / nH * f
        if nL: ul = sL / nL * f
        d = tastgrad(T, F) if k >= 0 else 0.0
        uc, u2 = s0 / (B / 2) * f, s2 / (B / 2) * f
        aus.append((k, (k + 0.5) * B * 250e-6, s0, s2, sH, nH, sL, nL, nF, uc, u2, uh, ul, d * uh + (1 - d) * ul, (u2 - uc) / Rs * 1000 if Rs > 0 else 0.0))
    return aus
if __name__ == "__main__":
    saetze = sys.argv[1:] or ["128:600:2000:3:4:20"]
    with serial.Serial("COM5", 1000000, timeout=5) as s:
        time.sleep(2.5); s.reset_input_buffer()
        for satz in saetze:
            teile = list(map(float, satz.split(":"))); T, N, V, F, B, P = map(int, teile[:6]); R = int(teile[6]) if len(teile) > 6 else 2000; Rs = teile[7] if len(teile) > 7 else 47.0
            s.write(f"M {T} {N} {V} {F} {B} {P} {R}\n".encode()); z = []; t0 = time.time()
            while time.time() - t0 < V / 1000 + (N + P) * B * 0.00025 + R / 1000 + 30:
                l = s.readline().decode(errors="replace").strip()
                if l: z.append(l)
                if l.startswith("ENDE") or l.startswith("FEHLER"): break
            kopf = [l for l in z if not (l[0].isdigit() or l[0] == "-")]
            w = [tuple(map(int, l.split())) for l in z if (l[0].isdigit() or l[0] == "-") and len(l.split()) == 8]
            if not w: print(f"== {satz}: keine Messwerte -- {' | '.join(kopf)}"); continue
            lueck = sum(1 for i in range(1, len(w)) if w[i][0] != w[i - 1][0] + 1)
            a = auswerten(w, T, F, B, Rs)
            p = os.path.join(O, time.strftime("rlc27_%Y-%m-%d_%H%M%S") + f"_T{T}_F{F}_B{B}.txt")
            with open(p, "x") as fo:
                fo.write(f"# rlc_messen_2.7 / rlc_sprung_2_7: Pin 11 PWM, A0 = U_C, A2 = Spulenende (Shunt Rs zwischen Spule und C), A1 = Pinspannung (High ab 4,5 V / Low bis 0,5 V getrennt, Flanken nF verworfen); Satz T:N:V:F:B:P:R = {T}:{N}:{V}:{F}:{B}:{P}:{R}; d = {tastgrad(T, F):.6f}; Rs = {Rs}; {kopf}\n")
                fo.write("# k t_s s0 s2 sH nH sL nL nF U_C_V U_2_V U_H_V U_L_V U_E_V i_mA\n")
                for r in a: fo.write("%d %.6f %d %d %d %d %d %d %d %.6f %.6f %.6f %.6f %.6f %.4f\n" % r)
            nach = [r for r in a if r[0] >= 0]; uc = [r[9] for r in nach]; i = max(range(len(uc)), key=uc.__getitem__); m = max(1, len(uc) // 10)
            ih = min(range(len(nach)), key=lambda j: nach[j][11]); il = max(range(len(nach)), key=lambda j: nach[j][12]); ii = max(range(len(nach)), key=lambda j: nach[j][14]); an = sum(1 for r in a if r[3] >= 1023 * (B / 2) or r[3] == 0)
            print(f"== {satz}: {kopf[0] if kopf else '?'}")
            print(f"   {kopf[-1] if kopf else '?'} (ENDE dauer_us verloren), Werte {len(w)}, Lücken {lueck}, Zeilen gesamt {len(z)}")
            print(f"   U_C: max {uc[i]:.4f} V bei {nach[i][1]*1000:.2f} ms, Ende {sum(uc[-m:]) / m:.4f} V")
            print(f"   U_H kleinster {nach[ih][11]:.4f} V bei {nach[ih][1]*1000:.1f} ms; U_L größter {nach[il][12]:.4f} V bei {nach[il][1]*1000:.1f} ms")
            print(f"   Strom (Shunt {Rs} Ohm): max {nach[ii][14]:.3f} mA bei {nach[ii][1]*1000:.1f} ms, min {min(r[14] for r in nach):.3f} mA; A2 am Anschlag {an}-mal")
            print(f"   U_E (Mittelwert): erster Wert {nach[0][13]:.4f} V, Ende {sum(r[13] for r in nach[-m:]) / m:.4f} V; Flankentreffer {sum(r[8] for r in a)} von {sum(r[5] + r[7] + r[8] for r in a)}, ideal d·5 V = {tastgrad(T, F)*5:.4f} V")
            print("   Datei", p)
