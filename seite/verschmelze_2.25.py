#!/usr/bin/env python3
"""verschmelze_2.25.py (23.11.2026, sein Wort: „klar gemeinsame html“): erzeugt rlc_sprung_vorlage_2.25.html aus rlc_sprung_vorlage_2.24.html
und verfahren_hr_vorlage_1.1.html. Der Kennlinienweg (zwölf Schritte + Suche + Faltung) wird Reiter „Verfahren_HR“ der Messseite:
- nutzt die in der Messseite geladenen Messungen (nur solche mit Strom, Format rlc27) statt eigener Lade- und Kurvenverwaltung,
- nutzt deren Zeichenhelfer, Shunt-Eingabe (R_s) und Median-Schalter,
- sein Skript liegt in einem eigenen Gültigkeitsbereich (HR = (() => {…})()), alle Element-Kennungen tragen das Präfix hr_, das CSS den Vorsatz #r_hr,
- Zustand E, Ansichten und Rechnen sind über HR.* für die Probe erreichbar; der Anker #hr öffnet den Reiter.
Die Einzelseite Verfahren_HR_1.1.html entfällt (Wegweiser im Repositorium). Aufruf: python3 verschmelze_2.25.py (überschreibt nichts).
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import os, re, sys
H = os.path.dirname(os.path.abspath(__file__))
Z = os.path.join(H, "rlc_sprung_vorlage_2.25.html")
if os.path.exists(Z): sys.exit("Ziel besteht schon: " + Z)
M = open(os.path.join(H, "rlc_sprung_vorlage_2.24.html"), encoding="utf-8").read()
V = open(os.path.join(H, "verfahren_hr_vorlage_1.1.html"), encoding="utf-8").read()
def zwischen(s, a, b, einschl_a=False, einschl_b=False):
    i = s.index(a); j = s.index(b, i + len(a))
    return s[(i if einschl_a else i + len(a)):(j + len(b) if einschl_b else j)]
def ers(s, alt, neu, n=1):
    c = s.count(alt)
    if c != n: sys.exit(f"Treffer {c} statt {n} für: {alt[:90]!r}")
    return s.replace(alt, neu)

# ---------- 1) CSS des Reiters: jede Regel mit #r_hr vorsetzen, Seitengerüst-Regeln weglassen
css = zwischen(V, "<style>\n", "\n</style>")
weg = (":root", "*", "html, body", "body", "header", "main", ".links", ".rechts")
zeilen = []
for z in css.split("\n"):
    z = z.strip()
    if not z or z.startswith("/*"): continue
    sel, rest = z.split("{", 1)
    sels = [x.strip() for x in sel.split(",")]
    if any(x.startswith(w) for x in sels for w in weg) and not any(x.startswith(".schritt") for x in sels): continue
    zeilen.append(", ".join("#r_hr " + x for x in sels) + " {" + rest)
css_hr = "\n".join(zeilen)
css_hr = ("/* ---- Reiter Verfahren_HR (2.25, aus verfahren_hr_vorlage_1.1.html verschmolzen) ---- */\n"
          "#r_hr { display: grid; grid-template-columns: 290px minmax(0, 1fr); gap: 12px; min-height: 0; min-width: 0; overflow: hidden; }\n"
          "#r_hr[hidden] { display: none; }\n"
          "#r_hr .hr_links { display: flex; flex-direction: column; gap: 8px; overflow: auto; min-height: 0; }\n"
          "#r_hr .hr_rechts { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 6px; min-height: 0; min-width: 0; }\n"
          "#r_hr .hr_rechts > div { min-width: 0; }\n" + css_hr + "\n")

# ---------- 2) Markup: linke Spalte (Schritte + Rechenwerte ohne Messungsliste und ohne R_s), rechte Spalte (Kopfzeile + Schritte 0 … 12)
links = zwischen(V, '    <fieldset>\n      <legend>Schritte</legend>', '  </div>\n  <div class="rechts">', einschl_a=True)
mess = zwischen(links, '    <fieldset>\n      <legend>Messung</legend>', '    </fieldset>\n', einschl_a=True, einschl_b=True)
links = links.replace(mess, "")
links = ers(links, '      <label class="zeile">Shunt R<sub>s</sub><input id="Rs" type="number" min="1" max="1000" step="0.1" value="47"><span class="einheit">Ω</span></label>\n',
            '      <div class="hinweis">Messungen und Shunt R<sub>s</sub> kommen aus der linken Spalte der Seite (gewählte Kurve, Format rlc27 mit Strom); Ausreißer-Median wie in der Auswertung.</div>\n')
links = ers(links, '      <label class="zeile" style="display:flex;gap:6px"><input id="median" type="checkbox" checked> 3-Punkt-Median gegen die 51-ms-Ausreißer des Stroms</label>\n', '')
rechts = zwischen(V, '    <div class="hinweis" id="kopfzeile"></div>', '  </div>\n</main>', einschl_a=True)
markup = ('    <div class="inhalt" id="r_hr" hidden>\n      <div class="hr_links">\n' + links + '      </div>\n      <div class="hr_rechts">\n' + rechts + '      </div>\n    </div>\n')
# Kennungen mit Präfix hr_ (im Markup)
IDS = ["schritte", "schwelle", "Kpsi", "Kq", "starts", "RFe", "RFe_art", "unter", "Kdir", "ue_art", "rechnen", "stand", "kopfzeile", "such_it", "such_h", "such_d", "such_rcu", "suchen", "such_stand"] + [f"s{j}" for j in range(13)] + [f"z{j}" for j in range(1, 13)]
for i in IDS: markup = markup.replace(f'id="{i}"', f'id="hr_{i}"')
assert 'id="hr_s12"' in markup and 'id="hr_z12"' in markup and 'id="kurven"' not in markup and 'id="laden"' not in markup

# ---------- 3) Skript: eigener Gültigkeitsbereich, Daten aus den Kurven der Seite
js = zwischen(V, "/*GEMEINSAM*/\n", "\n</script>")
# Datenverwaltung der Einzelseite entfernen
js = ers(js, zwischen(js, "// ---------- Daten\n", "// ---------- Verfahren_HR: tanh-Summe anfitten", einschl_a=True), '''// ---------- Daten: die Messungen der Seite (nur mit Strom und Spulenende: Format rlc27), ab dem Sprung (t >= 0)
let E = null; const vorrat = new Map();
function hrForm(k) {   // Kurve der Seite -> Form des Kennlinienwegs {id, name, farbe, n, t, uC, u2, uE, i}
  let d = vorrat.get(k.id); if (d && d.quelle === k) return d;
  const ab = k.t.findIndex(t => t >= 0), s = a => a.slice(ab);
  const uEroh = k.ue_fertig || k.t.map((t, i) => { const dd = k.kk[i] >= 0 ? k.d : 0; return dd * k.uh[i] + (1 - dd) * k.ul[i]; });   // je Block wie die Spalte U_E_V der Datei (roh, ohne den Glättungsschalter der Seite)
  d = {id: k.id, name: k.name, farbe: k.farbe, quelle: k, t: s(k.t), uC: s(k.u), u2: s(k.u2), uE: s(uEroh), i: s(k.im)}; d.n = d.t.length; vorrat.set(k.id, d); return d;
}
const kurvenHR = () => kurven.filter(k => k.im && k.u2 && (k.ue_fertig || k.uh) && k.t.some(t => t >= 0)).map(hrForm);
const kurveHR = () => { const v = kurvenHR(); return v.find(d => d.id === gewaehlt) || v[0] || null; };
function stand(t, art) { const e = $("hr_stand"); e.textContent = t; e.className = "stand" + (art ? " " + art : ""); }
''')
# Kennungen
for i in IDS: js = js.replace(f'$("{i}")', f'$("hr_{i}")')
js = js.replace('$("median")', '$("i_median")')
js = ers(js, 'for (const id of ["Rs", "schwelle", "Kpsi", "Kq", "starts", "RFe", "RFe_art", "unter", "Kdir", "median", "ue_art"]) $(id).onchange = () => { E = null; stand("Werte geändert – „Alle Schritte rechnen“."); zeichneAlles(); };',
         'for (const id of ["hr_schwelle", "hr_Kpsi", "hr_Kq", "hr_starts", "hr_RFe", "hr_RFe_art", "hr_unter", "hr_Kdir", "hr_ue_art"]) $(id).onchange = () => { E = null; stand("Werte geändert – „Alle Schritte rechnen“."); zeichneAlles(); };')
js = js.replace('$("hr_s" + j).hidden', '$("hr_s" + j).hidden')
js = ers(js, 'for (let j = 0; j <= 12; j++) $("s" + j).hidden = j !== s;', 'for (let j = 0; j <= 12; j++) $("hr_s" + j).hidden = j !== s;')
js = ers(js, 'const z = $("z" + s); if (z) z.innerHTML = "";', 'const z = $("hr_z" + s); if (z) z.innerHTML = "";')
js = re.sub(r'\$\("z(\d+)"\)\.innerHTML', r'$("hr_z\1").innerHTML', js)
js = ers(js, 'document.querySelectorAll(`#s${s} canvas`)', 'document.querySelectorAll(`#hr_s${s} canvas`)')
js = ers(js, 'for (const c of document.querySelectorAll(".bild canvas")) {', 'for (const c of document.querySelectorAll("#r_hr .bild canvas")) {')
assert 'new ResizeObserver(() => zeichneAlles()).observe($("hr_s1").parentElement);' in js   # durch die Kennungsersetzung schon umbenannt
# rechnen(): gewählte Kurve der Seite; Rs aus der Seite
js = ers(js, '  const k = kurven.find(q => q.id === gewaehlt); if (!k) { stand("Keine Messung geladen.", "schlecht"); return; }\n  const schrittStand',
         '  const k = kurveHR(); if (!k) { stand("Keine Messung mit Strom geladen (Format rlc27, Firmware 2.7).", "schlecht"); return; }\n  const schrittStand')
js = ers(js, 'const Rs = Number($("Rs").value), dt =', 'const Rs = Number($("Rs").value) || (k.quelle.Rs > 0 ? k.quelle.Rs : 47), dt =')
# Kurvenlisten des Kennlinienwegs
js = js.replace('kurven.map(kk => dgl(', 'kurvenHR().map(kk => dgl(')
js = ers(js, 'const sim = kurven.map(kk => { const d = dgl(', 'const sim = kurvenHR().map(kk => { const d = dgl(')
js = ers(js, 'leer(c, kurven.length ? ', 'leer(c, kurvenHR().length ? ')
js = ers(js, 'andere = kurven.filter(x => x !== k), S = E.suche;', 'andere = kurvenHR().filter(x => x !== k), S = E.suche;')
assert js.count('kurven.filter(') == 1 and 'kurven.find(' not in js and 'kurven.map(' not in js, "Kurvenzugriff der Einzelseite übrig (erlaubt ist nur der Adapter kurvenHR)"
# Start/Ende: eingebettete Messungen und Selbststart ersetzen durch zeige()
ende = zwischen(js, '// eingebettete Messungen\n', 'if (kurven.length && location.hash !== "#ohne") $("hr_rechnen").click();   // #ohne: nicht von selbst rechnen (Prüfmittel)', einschl_a=True, einschl_b=True)
js = ers(js, ende, '''let gerechnetFuer = "";
function zeige() {   // beim Öffnen des Reiters und nach Änderungen der Kurvenliste
  const v = kurvenHR(), k = kurveHR(), kenn = v.map(d => d.id).join(",") + "|" + (k ? k.id : "") + "|" + (k ? k.n : 0);
  if (kenn !== gerechnetFuer) { E = null; gerechnetFuer = kenn; if (k && location.hash !== "#ohne") { $("hr_rechnen").click(); return; } }
  if (!k) stand("Keine Messung mit Strom geladen (Format rlc27, Firmware 2.7).", "schlecht");
  zeichneAlles();
}
schrittWahl(0);
return {zeige, get E() { return E; }, ansichten, kurvenHR, kurveHR, dgl, rechnen: () => $("hr_rechnen").click()};''')
js = js.replace('$("hr_rechnen").onclick = async () => { $("hr_rechnen").disabled = true; stand("Rechnet …"); await pause(); try { await rechnen(); } catch (e) { stand("Fehler: " + e.message, "schlecht"); console.error(e); } $("hr_rechnen").disabled = false; };',
                '$("hr_rechnen").onclick = async () => { $("hr_rechnen").disabled = true; stand("Rechnet …"); await pause(); try { await rechnen(); } catch (e) { stand("Fehler: " + e.message, "schlecht"); console.error(e); } $("hr_rechnen").disabled = false; gerechnetFuer = kurvenHR().map(d => d.id).join(",") + "|" + (kurveHR() ? kurveHR().id : "") + "|" + (kurveHR() ? kurveHR().n : 0); };')
assert "gerechnetFuer = kurvenHR()" in js
js_hr = "// ---------- Reiter Verfahren_HR (2.25): verschmolzen aus verfahren_hr_vorlage_1.1.html; eigener Gültigkeitsbereich, Kennungen hr_*\nconst HR = (() => {\n" + js + "\n})();\n"
for verboten in ('$("Rs").value = ', 'location.hash !== "#ohne") $("hr_rechnen")'):
    assert verboten not in js_hr

# ---------- 4) in die Messseite einsetzen
S = M
S = ers(S, "RLC-Sprung 2.24", "RLC-Sprung 2.25", S.count("RLC-Sprung 2.24"))
S = ers(S, "RLC_Sprung_2.24.html", "RLC_Sprung_2.25.html", S.count("RLC_Sprung_2.24.html"))
S = ers(S, "bau_rlc_seite_2.24.py", "bau_rlc_seite_2.25.py", S.count("bau_rlc_seite_2.24.py"))
kopfV = zwischen(V, "<!--\n", "\n-->")   # Kopf der Einzelseite (Befunde) als Vermerk übernehmen
vermerk = ("RLC_Sprung_2.25.html (23.11.2026) -- 2.25 (sein Wort: „klar gemeinsame html“): der Kennlinienweg (bisher eigene Seite Verfahren_HR_1.1.html) ist jetzt der Reiter\n"
           "„Verfahren_HR“ dieser Seite (verschmelze_2.25.py); er nutzt die hier geladenen Messungen mit Strom (rlc27), R_s und den Ausreißer-Median der Seite; Anker #hr öffnet den Reiter.\n"
           "Einzelseite und ihre Fassungen 1.0/1.1 entfallen (Wegweiser im Repositorium). Kopf der Einzelseite, übernommen:\n" + kopfV.replace("<!--", "").strip() + "\n")
S = ers(S, "RLC_Sprung_2.25.html (23.11.2026) -- 2.24:", vermerk + "RLC_Sprung_2.24.html (23.11.2026) -- 2.24:")
S = ers(S, "\n</style>", "\n" + css_hr + "</style>")
# Reiterknopf und Inhalt
S = ers(S, '<button id="rt_imp" data-r="imp"', '<button id="rt_hr" data-r="hr" title="Das Verfahren_HR Schritt für Schritt: Kennlinien ψ(i) und q(u_C) aus der Messung extrahieren, als tanh-Summen anfitten, DGL lösen, Parameter nachstellen, Faltung gegen DGL">Verfahren_HR</button><button id="rt_imp" data-r="imp"')
S = ers(S, '    <div class="inhalt" id="r_imp" hidden>', markup + '    <div class="inhalt" id="r_imp" hidden>')
S = ers(S, 'for (const n of ["aus", "pruef", "theorie", "fit", "imp"])', 'for (const n of ["aus", "pruef", "theorie", "fit", "imp", "hr"])', S.count('for (const n of ["aus", "pruef", "theorie", "fit", "imp"])'))
S = ers(S, 'if (r === "imp") requestAnimationFrame(() => { impListe(); zeichneImp(); });', 'if (r === "imp") requestAnimationFrame(() => { impListe(); zeichneImp(); }); if (r === "hr") requestAnimationFrame(() => HR.zeige());', S.count('if (r === "imp") requestAnimationFrame(() => { impListe(); zeichneImp(); });'))
S = ers(S, 'const idsImp = {aus: ["c1", "c2"], pruef: ["c3", "c4"], theorie: [], fit: ["c9", "c10"], imp: ["c6", "c7", "c8"]};',
        'const idsImp = {aus: ["c1", "c2"], pruef: ["c3", "c4"], theorie: [], fit: ["c9", "c10"], imp: ["c6", "c7", "c8"], hr: []};')
# Skript des Reiters vor dem Ende des Hauptskripts; Reiterbuttons sind schon verdrahtet? (Hauptseite: reiterleiste-Handler) -- Anker #hr
S = ers(S, "\n</script>\n</body>", "\n" + js_hr + 'if (location.hash === "#hr") reiterWahl("hr");\n</script>\n</body>')
# Kurvenänderungen dem Reiter melden: alles() ruft zeige(), wenn der Reiter offen ist
S = ers(S, 'function alles() { liste(); tafel(); if (reiter === "aus") { zeichne1(); zeichne2(); } else if (reiter === "pruef") { zeichne3(); zeichne4(); } }',
        'function alles() { liste(); tafel(); if (reiter === "aus") { zeichne1(); zeichne2(); } else if (reiter === "pruef") { zeichne3(); zeichne4(); } else if (reiter === "hr" && typeof HR !== "undefined") HR.zeige(); }')
# Verweis im Theorie-Reiter auf die eigene Seite -> auf den Reiter
S = ers(S, 'auf der eigenen Seite <a href="Verfahren_HR_1.0.html">Verfahren_HR 1.0</a>', 'im Reiter <a href="#hr" onclick="reiterWahl(\'hr\'); return false;">Verfahren_HR</a>')
assert ("Rup" + "pert") not in S and "Verfahren_HR_1.0.html" not in S[S.index("</head>"):], "alter Seitenname im Hauptteil"   # im Änderungsvermerk des Kopfes darf er als Geschichte stehen
open(Z, "w", encoding="utf-8").write(S)
print("geschrieben", Z, len(S), "Zeichen; CSS-Regeln", len(zeilen), "; Markup", len(markup), "; Skript", len(js_hr))
