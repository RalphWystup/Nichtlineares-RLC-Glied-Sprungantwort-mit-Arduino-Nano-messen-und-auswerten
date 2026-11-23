#!/usr/bin/env python3
"""bau_rlc_seite_2.20.py (23.11.2026): baut RLC_Sprung_2.20.html aus rlc_sprung_vorlage_2.20.html und bettet zwei Nano-Messungen, zwei Fotos des Aufbaus (bilder_aufbau/) und den Schaltplan (schaltplan_rlc_1.3.svg) ein (All-in-one), bei jedem Bau neu aus
der Quelle: zwei Messungen mit rlc_sprung_2_7 und Shunt 47 Ω (23.11.2026, T = 140 und 128, mit Strom). Aufruf: python3 bau_rlc_seite_2.20.py <ziel.html>
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import json, os, sys, hashlib
H = os.path.dirname(os.path.abspath(__file__)); W = os.path.dirname(H)
Q = [("rlc27_2026-11-23_113109_T140_F3_B4.txt", os.path.join(W, "messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt"), "rlc_sprung_2_7 mit Shunt 47 Ω über die Brücke, T = 140, 31,4 kHz, 23.11.2026"),
     ("rlc27_2026-11-23_113104_T128_F3_B4.txt", os.path.join(W, "messungen/rlc27_2026-11-23_113104_T128_F3_B4.txt"), "rlc_sprung_2_7 mit Shunt 47 Ω über die Brücke, T = 128, 31,4 kHz, 23.11.2026")]
ziel = sys.argv[1]
if os.path.exists(ziel): raise SystemExit(f"{ziel} besteht schon -- nichts überschrieben")
m = []
for n, p, q in Q: t = open(p, encoding="utf-8").read(); m.append({"name": n, "quelle": q, "text": t}); print("  Quelle", n, hashlib.sha256(t.encode()).hexdigest()[:16])
s = open(os.path.join(H, "rlc_sprung_vorlage_2.20.html"), encoding="utf-8").read()
assert s.count("/*MESSUNGEN*/") == 1
s = s.replace("/*MESSUNGEN*/", json.dumps(m, ensure_ascii=False).replace("<", "\\u003c"))
import base64
for pl, f in (("/*FOTO1*/", "bilder_aufbau/aufbau_foto_1.jpg"), ("/*FOTO2*/", "bilder_aufbau/aufbau_foto_2.jpg")):
    d = open(os.path.join(H, f), "rb").read(); assert s.count(pl) == 1; s = s.replace(pl, "data:image/jpeg;base64," + base64.b64encode(d).decode()); print("  Foto", f, len(d), hashlib.sha256(d).hexdigest()[:16])
svg = open(os.path.join(H, "schaltplan_rlc_1.3.svg"), encoding="utf-8").read(); svg = svg[svg.index("<svg"):]
assert s.count("/*SCHALTPLAN*/") == 1; s = s.replace("/*SCHALTPLAN*/", svg); print("  Schaltplan schaltplan_rlc_1.3.svg", len(svg))
open(ziel, "x", encoding="utf-8").write(s); print("geschrieben", ziel, len(s.encode()), "Byte")
