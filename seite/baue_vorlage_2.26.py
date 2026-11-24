#!/usr/bin/env python3
"""baue_vorlage_2.26.py (24.11.2026) -- erzeugt rlc_sprung_vorlage_2.26.html aus rlc_sprung_vorlage_2.25.html (sein Wort: „die amplitudenabhängige
Dämpfung physikalisch modellieren, dann 2.26“). Änderungen: Reiter Verfahren_HR bekommt Schritt 13 (physikalisches Modell: Preisach-Hysterese der
Drossel, C(u_C), R; ein Parametersatz für alle Messungen; Code aus preisach_schritt_1.1.js, Vorrechnung verfahren_hr/preisach_1.8.py) und Schritt 14
(Wiederholbarkeit: zwei Aufzeichnungen derselben Anregung); die Suche in Schritt 11 rechnet mit 10 statt 4 Unterschritten (pruefe_dgl_fit_1.0.py:
4 Unterschritte = bis 5 mV Lösungsfehler); Fassung 2.26 in Titel, Kopf, Ausfuhr und Änderungsvermerk. Text und Rechnung der Schritte 0–12 unverändert.
Aufruf: python3 baue_vorlage_2.26.py   (schreibt rlc_sprung_vorlage_2.26.html, überschreibt nichts)
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import os, sys
H = os.path.dirname(os.path.abspath(__file__)); Q = os.path.join(H, "rlc_sprung_vorlage_2.25.html"); Z = os.path.join(H, "rlc_sprung_vorlage_2.26.html")
if os.path.exists(Z): sys.exit("Ziel besteht schon, nichts überschrieben: " + Z)
s = open(Q, encoding="utf-8").read(); js = open(os.path.join(H, "preisach_schritt_1.1.js"), encoding="utf-8").read()
def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, (s.count(alt), alt[:80]); s = s.replace(alt, neu)
# 1. Knöpfe
ersetze('        <button data-s="12"><span class="nr">12</span>Faltung mit der Impulsantwort gegen DGL</button>\n',
        '        <button data-s="12"><span class="nr">12</span>Faltung mit der Impulsantwort gegen DGL</button>\n'
        '        <button data-s="13"><span class="nr">13</span>Physikalisches Modell (Preisach)</button>\n'
        '        <button data-s="14"><span class="nr">14</span>Wiederholbarkeit der Messung</button>\n')
# 2. Schritte 13 und 14 (HTML) nach Schritt 12
eing = '''    <div class="schritt" id="hr_s13" hidden>
      <div><h2>13 · Physikalisches Modell: Hysterese der Drossel (Preisach), C(u<sub>C</sub>) und R – ein Parametersatz für alle Messungen</h2>
        <p>Die Schritte 2–11 beschreiben die Drossel mit einer eindeutigen Kennlinie ψ̃(i<sub>m</sub>) und einem Eisenverlust R<sub>Fe</sub> (Suche: 1,1 … 1,5 % ΔU). Die Messungen zeigen aber: die halbe Schwingungsdauer fällt in jeder Aufzeichnung von 53 ms auf 32 ms, und am Umkehrpunkt des Stroms ist die Induktivität klein (modellfrei L<sub>d</sub> = u<sub>L</sub>/(di/dt): 3–5 H) und wächst mit dem Abstand vom Umkehrpunkt (etwa 4 H je mA). Das ist das <b>Rayleigh-Gesetz</b> der Eisenhysterese, hier als <b>Preisach-Modell</b> mit einer Hysteronendichte ρ über der Koerzitivität h = α − β: die Hysterese liefert zugleich die amplitudenabhängige Induktivität und den amplitudenabhängigen Verlust (Schleifenfläche). Dazu C(u<sub>C</sub>) des X7R-Kondensators (Manuskript Gl. 5.1) und ein Reihenwiderstand R. Sechs physikalische Zahlen, aus den Schritten 2–8 vorbesetzt, mit Grobsuche und Levenberg-Marquardt gegen <b>alle</b> geladenen Messungen nachgestellt (Strom mit Gewicht); DGL mit RK4, Blockmittel je Abtastung, Umkehrpunkt-Stapel mit Löschregel (Vorrechnung preisach_1.8.py, Fitter geprüft mit pruefe_dgl_fit_1.0.py).</p>
        <div id="hr_pr_formeln"></div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button id="hr_pr_start" class="haupt">Modell anpassen</button><span class="hinweis">Anregung <select id="hr_pr_ue"><option value="ideal" selected>ideal: Sprung auf U∞ aus u_C (R enthält den Pin)</option><option value="mess">u_E der Messung (wie oben gewählt)</option></select></span><span class="hinweis">Strom-Gewicht <input id="hr_pr_strom" type="number" min="0" max="3" step="0.1" value="0.3" style="width:50px;padding:1px 3px;font:inherit"></span><span class="hinweis">höchstens <input id="hr_pr_it" type="number" min="1" max="200" step="1" value="40" style="width:50px;padding:1px 3px;font:inherit"> Schritte</span><span id="hr_pr_stand" class="hinweis"></span></div>
      </div>
      <div class="bilder drei"><div class="bild"><canvas id="c13a"></canvas><div class="tip" id="t13a" hidden></div></div><div class="bild"><canvas id="c13b"></canvas><div class="tip" id="t13b" hidden></div></div><div class="bild"><canvas id="c13c"></canvas><div class="tip" id="t13c" hidden></div></div></div>
      <div class="tafeln" id="hr_z13"></div>
    </div>
    <div class="schritt" id="hr_s14" hidden>
      <div><h2>14 · Wiederholbarkeit: zwei Aufzeichnungen derselben Anregung</h2>
        <p>Wie genau kann ein Modell überhaupt werden? Zwei Aufzeichnungen mit gleichem T (hier T140 vom 23. und vom 24.11.2026, eingebettet) werden Abtastwert für Abtastwert verglichen. Der Unterschied ist die Untergrenze für jedes gemeinsame Modell; der direkte Fit einer einzelnen Aufzeichnung (Schritt 9, 0,1 %) passt deren Eigenheiten mit und sagt deshalb nichts über die Wiederholbarkeit.</p>
      </div>
      <div class="bilder zwei"><div class="bild"><canvas id="c14a"></canvas><div class="tip" id="t14a" hidden></div></div><div class="bild"><canvas id="c14b"></canvas><div class="tip" id="t14b" hidden></div></div></div>
      <div class="tafeln" id="hr_z14"></div>
    </div>
'''
ersetze('      <div class="tafeln" id="hr_z12"></div>\n    </div>\n', '      <div class="tafeln" id="hr_z12"></div>\n    </div>\n' + eing)
# 3. CSS: drei Bilder nebeneinander
ersetze('#r_hr .bilder.zwei { grid-template-columns: 1fr 1fr; }\n', '#r_hr .bilder.zwei { grid-template-columns: 1fr 1fr; }\n#r_hr .bilder.drei { grid-template-columns: 1fr 1fr 1fr; }\n')
# 4. JS einsetzen (vor dem Zeigertipp, nach ZEICHNER)
ersetze('// ---------- Zeigertipp (Zeitbilder): nächster Abtastwert\n', js + '// ---------- Zeigertipp (Zeitbilder): nächster Abtastwert\n')
# 5. Rechenkette: Schritt 13 nach der Suche
ersetze('  await schrittStand("Schritt 11: Suche"); await suche(true);', '  await schrittStand("Schritt 11: Suche"); await suche(true);\n  await schrittStand("Schritt 13: physikalisches Modell"); await preisachFit(true);   // 2.26')
# 6. Schrittwahl bis 14; Suche mit 10 Unterschritten
ersetze('for (let j = 0; j <= 12; j++) $("hr_s" + j).hidden = j !== s;', 'for (let j = 0; j <= 14; j++) $("hr_s" + j).hidden = j !== s;')
ersetze('unterS = 4, unter = Number($("hr_unter").value)', 'unterS = 10, unter = Number($("hr_unter").value)')   # 2.26: 4 Unterschritte = bis 5 mV Lösungsfehler (pruefe_dgl_fit_1.0.py)
# 7. Schritt 0: Hinweis auf 13/14
ersetze('      </div>\n      <div></div><div></div>\n    </div>\n    <div class="schritt" id="hr_s1"', '        <p class="hinweis">2.26: Schritt 13 ersetzt die eindeutige Kennlinie ψ̃(i<sub>m</sub>) durch ein physikalisches Hysteresemodell (Preisach/Rayleigh) mit sechs Parametern für alle Messungen; Schritt 14 zeigt, wie genau die Messung selbst wiederholbar ist (zwei Aufzeichnungen T140).</p>\n      </div>\n      <div></div><div></div>\n    </div>\n    <div class="schritt" id="hr_s1"')   # 2.26-Bau 2: ohne zusätzliches </div> (das sprengte hr_rechts: Schritte als zweite Zeile des Gitters, Leinwände 218 statt 264 px)
# 7b. Simulation des physikalischen Modells nach außen (Proben, Vorrechnung): HR.preisachSim
ersetze('return {zeige, get E() { return E; }, ansichten, kurvenHR, kurveHR, dgl, rechnen: () => $("hr_rechnen").click()};', 'return {zeige, get E() { return E; }, ansichten, kurvenHR, kurveHR, dgl, preisachSim, ausklang, rechnen: () => $("hr_rechnen").click()};')
# 8. Fassung
for a, b in (("<title>RLC-Sprung 2.25 · Messen und Auswerten</title>", "<title>RLC-Sprung 2.26 · Messen und Auswerten</title>"), ("<h1>RLC-Sprung 2.25</h1>", "<h1>RLC-Sprung 2.26</h1>"),
             ("# RLC_Sprung_2.25.html / rlc_sprung_2_7", "# RLC_Sprung_2.26.html / rlc_sprung_2_7"), ("# RLC_Sprung_2.25.html / rlc_sprung_2_6", "# RLC_Sprung_2.26.html / rlc_sprung_2_6"),
             ("RLC-Sprung 2.25 · Reiter ${reiter}", "RLC-Sprung 2.26 · Reiter ${reiter}"), ("Gebaut mit bau_rlc_seite_2.25.py", "Gebaut mit bau_rlc_seite_2.26.py")):
    ersetze(a, b)
vermerk = ("RLC_Sprung_2.26.html (24.11.2026) -- 2.26 (sein Wort: „die amplitudenabhängige Dämpfung physikalisch modellieren, dann 2.26“): Reiter Verfahren_HR Schritt 13\n"
           "„Physikalisches Modell“: Preisach-Hysterese der Drossel (Hysteronendichte über der Koerzitivität exponentiell, L_d = L_rev + 2ρ0[1 − exp(−|i − i_r|/h_c)] auf dem Ast ab\n"
           "dem letzten Umkehrpunkt, Neukurve ab entmagnetisiertem Zustand, Umkehrpunkt-Stapel mit Löschregel; Kleinsignal Rayleigh ν = 2ρ0/h_c), C(u_C) = C0/(1+γu²), R in Reihe;\n"
           "sechs Parameter gegen alle Messungen (Strom gewichtet), Blockmittel je Abtastung, Startwerte aus den Schritten 2–8. Befunde (verfahren_hr/preisach_1.0 … 1.9, ld_aeste,\n"
           "bauteil_check, pruefe_dgl_fit): halbe Schwingungsdauer fällt je Aufzeichnung 53 → 32 ms; L_d modellfrei 3–5 H am Umkehrpunkt, +4 H/mA; gemeinsamer Fit 0,8 % ΔU\n"
           "(Kennlinienweg 1,1 … 1,5 %), Einzelmessung 0,6 %; Wirbelstrom R_Fe läuft im Fit gegen ∞, fester R_Fe überdämpft die erste Schwingung; Ausklang gemessen ζ 0,22–0,24,\n"
           "Modell 0,20 (fehlender linearer Verlust). Schritt 14 „Wiederholbarkeit“: T140 vom 23. und 24.11. unterscheiden sich um 0,47 % ΔU (49 mV bei 24 ms) -- Untergrenze\n"
           "für jedes gemeinsame Modell. Fitter geprüft: 4 Unterschritte = bis 5 mV Lösungsfehler -> Suche Schritt 11 jetzt 10; synthetische Antwort wird auf Rauschhöhe\n"
           "wiedergefunden, Parameter aber nur mit Stromkanal eindeutig. Fünf Messungen T20/30/40/50/140 vom 24.11. (Überschwingen 1,49 konstant bis T50); T140 (24.11.) eingebettet.\n")
k = s.index("RLC_Sprung_2.25.html (23.11.2026) -- 2.25"); s = s[:k] + vermerk + s[k:]
open(Z, "x", encoding="utf-8").write(s); print("geschrieben", Z, len(s.encode()), "Byte")
