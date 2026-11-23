#!/usr/bin/env python3
"""bau_verfahren_hr_1.0.py (23.11.2026): baut Verfahren_HR_1.0.html aus verfahren_hr_vorlage_1.0.html. Eingebettet werden die beiden Nano-Messungen
mit Strom (rlc27, Shunt 47 Ω, T = 140 und 128) und die gemeinsamen Zeichenhelfer aus rlc_sprung_vorlage_2.24.html (zahl, leinwand, teilung, stellen,
achsen, linie, klipp -- Marke /*GEMEINSAM*/; ein Quelltext für beide Seiten, hier beim Bau eingesetzt und gegen die Quelle geprüft).
Aufruf: python3 bau_verfahren_hr_1.0.py <ziel.html>   (überschreibt nichts)
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import json, os, sys, hashlib, re
H = os.path.dirname(os.path.abspath(__file__)); W = os.path.dirname(H)
Q = [("rlc27_2026-11-23_113109_T140_F3_B4.txt", os.path.join(W, "messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt")),
     ("rlc27_2026-11-23_113104_T128_F3_B4.txt", os.path.join(W, "messungen/rlc27_2026-11-23_113104_T128_F3_B4.txt"))]
ziel = sys.argv[1]
if os.path.exists(ziel): raise SystemExit(f"{ziel} besteht schon -- nichts überschrieben")
m = []
for n, p in Q: t = open(p, encoding="utf-8").read(); m.append({"name": n, "text": t}); print("  Quelle", n, hashlib.sha256(t.encode()).hexdigest()[:16])
haupt = open(os.path.join(H, "rlc_sprung_vorlage_2.24.html"), encoding="utf-8").read()
# gemeinsame Helfer: zahl (eine Zeile) und der Block leinwand … klipp
zahl = re.search(r"^const zahl = .*$", haupt, re.M).group(0)
a = haupt.index("function leinwand(c) {"); b = haupt.index("let ansicht1 = null"); block = haupt[a:b]
c = haupt.index("function klipp(g, w, h) {"); d = haupt.index("\n", c) + 1; block += haupt[c:d]
for name in ("function leinwand(", "function teilung(", "function stellen(", "function achsen(", "function linie(", "function klipp("):
    assert name in block, name
gemeinsam = "// ---- gemeinsame Zeichenhelfer, beim Bau aus rlc_sprung_vorlage_2.24.html eingesetzt (bau_verfahren_hr_1.0.py)\n" + zahl + "\n" + block
s = open(os.path.join(H, "verfahren_hr_vorlage_1.0.html"), encoding="utf-8").read()
assert s.count("/*MESSUNGEN*/") == 1 and s.count("/*GEMEINSAM*/") == 1
s = s.replace("/*GEMEINSAM*/", gemeinsam).replace("/*MESSUNGEN*/", json.dumps(m, ensure_ascii=False).replace("</", "<\\/"))
open(ziel, "w", encoding="utf-8").write(s); print("geschrieben", ziel, len(s.encode("utf-8")), "Byte")
