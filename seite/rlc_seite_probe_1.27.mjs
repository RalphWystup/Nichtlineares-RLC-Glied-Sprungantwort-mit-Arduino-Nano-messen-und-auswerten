// rlc_seite_probe_1.27.mjs -- (1.27: für Seite 2.26: fünf eingebettete Kurven (T140 vom 24.11. dazu), Schritt 13 physikalisches Modell (H23), Schritt 14 Wiederholbarkeit (H24), Suche mit 10 Unterschritten);
// rlc_seite_probe_1.26.mjs -- (1.26: für Seite 2.25: Reiter Verfahren_HR (verschmolzene Einzelseite) mit den Prüfungen H1 … H22 (Rechnung mit Suche, jeder Schritt, Gleichungen, Klammern, Vergleichstafel, Faltung, Eingabe ändern, dritte Kurve);
// rlc_seite_probe_1.25.mjs -- (1.25: für Seite 2.24: P1 erwartet 2.24; neu P18c Klammern: jede nicht dehnbare Klammer ( ) [ ] | ist höchstens 1,6 Schrifthöhen hoch,
//   jede dehnbare Klammer steht mit einem Bruch in einer eigenen <mrow>, (Ih)_n und (Dr)_n als <msub><mrow>(…)</mrow>n</msub>, sin/cos/tanh mit Argumentklammer -- gemessen im Bild, nicht im Quelltext;
//   P1c der frühere Name des Verfahrens kommt nicht mehr vor (Verfahren_HR überall); P19c jede Reihe als Gleichung mit Koeffiziententafel (tanh K Zeilen, Fourier M+1, Potenzreihe P, vier MathML);
//   P19d Impulsantwort aus der Ableitung der Verfahren_HR-Summe gezeichnet und nahe der iterativen Lösung;
// rlc_seite_probe_1.24.mjs -- (1.24: für Seite 2.23: P19 fährt „K steigern bis 0,1 %“ und verlangt das Ziel bei K ≤ 12, größter Fehler ≤ 0,5 %, tanh in der Fortsetzung
//   besser als Fourier und Potenzreihe; P19b Treppen-Tafel ≥ 9 Zeilen;
// rlc_seite_probe_1.23.mjs -- (1.23: für Seite 2.22: P18 prüft drei Fotos (das dritte mit Shunt);
// rlc_seite_probe_1.22.mjs -- (1.22: für Seite 2.21: P19 ersetzt durch Anfitten (drei Ansätze gleicher Parameterzahl, Tafel, Fehler endlich, tanh im eingeschwungenen
//   Abschnitt besser als Potenzreihe), P19b Treppe-Knopf vorhanden;
// rlc_seite_probe_1.21.mjs -- (1.21: für Seite 2.20: P21f drittes Bild (Rest in mV) gezeichnet, P24 Median blendet die 51-ms-Ausreißer aus (T140: 46 roh, 0 danach), P8c Scheitel nach Median 2,6 … 3,0 mA;
// rlc_seite_probe_1.20.mjs -- (1.20: für Seite 2.19: P21 prüft das Abnahmekriterium Rest RMS ≤ 0,1 % ΔU für beide eingebetteten Kurven (w = 3);
// rlc_seite_probe_1.19.mjs -- (1.19: für Seite 2.18: P8c Strom im unteren Bild der Auswertung (Vorgabe, 4 Reihen, Scheitel 3,9 mA, Zeigertipp in mA);
// rlc_seite_probe_1.18.mjs -- (1.18: für Seite 2.17: eingebettet rlc27 T140/T128 mit Strom (Spalte U_C_V aus dem Kopf gelesen); zwei eingebettete Kurven (ohne Simulink), kein Kalibrierreiter (P20, P21d entfallen), Stromansicht nur Shunt;
// rlc_seite_probe_1.17.mjs -- (1.17: für Seite 2.16; P21d prüft auch, dass der Rest am Ende keine Rampe hat (Mittel der letzten 50 Werte unter 3 mV);
// rlc_seite_probe_1.16.mjs -- (1.16: für Seite 2.15; P23 Beobachtbarkeit (Protokollzeile, PNG-Blob je Reiter); P21d Impulsantwort der Simulink-Kurve konvergiert (Rest endlich, unter 60 mV, ∫g ≈ 1) -- in 2.14 lief sie davon;
// rlc_seite_probe_1.15.mjs -- (1.15: für Seite 2.14 (Schaltplan 1.3);
// rlc_seite_probe_1.14.mjs -- (1.14: für Seite 2.13; P22 Format 2.7 lesen (U_2_V, i_mA, Rs), Stromansicht mit gemessenem Strom, R_s-Eingabe geprüft, Kennung 2.7 angenommen;
// rlc_seite_probe_1.13.mjs -- (1.13: für Seite 2.12; P21 Impulsantwort: Rest unter 1 ADC-Stufe, ∫g ≈ 1, rohe Differenz exakt aber mit Spitzen über 4 s⁻¹, lineares Modell vorhanden;
// rlc_seite_probe_1.12.mjs -- (1.12: für Seite 2.11; P20 Kalibrierreiter: R_cal < 250 abgewiesen, Rechnung aus synthetischen Rohzeilen, Gerade aus zwei Punkten,
//   JSON-Text, Laden, Stromansicht im Prüfreiter zeichnet drei Reihen; P4 prüft auch k_messen gesperrt;
// rlc_seite_probe_1.11.mjs -- (1.11: für Seite 2.10; P18 prüft, dass kein R_ext mehr im Schaltplan steht;
// rlc_seite_probe_1.10.mjs -- (1.10: für Seite 2.9; P1b Namensnennung sichtbar in der Kopfzeile, Hauptteil beginnt unter der Kopfzeile;
// rlc_seite_probe_1.9.mjs -- (1.9: für Seite 2.8; P18 Reiter Aufbau und Theorie (Fotos data:, SVG, MathML); neu P14 Reiter Prüfen (Leinwand c3/c4 gezeichnet, Messpunkte-Hinweis), P15 Zoom (Rad, Rahmen, Knöpfe Sprung/Scheitel/Zurück/Alles),
//   P16 Zählwerte nH+nL+nF = B je Wert, P17 Löschknöpfe (Gewählte entfernen; Alle entfernen zweistufig, erster Klick entfernt nichts);
// rlc_seite_probe_1.8.mjs -- (1.8: für Seite 2.7; P1 erwartet 2.7; P10 prüft auch scrollWidth <= innerWidth (kein waagerechter Rollbalken);
//   P6c: Kurve im Format 2.0 hat keine Anregung; Browserstart mit --disable-dev-shm-usage (sonst Absturz des Seitenprozesses bei 64 MB /dev/shm);
// rlc_seite_probe_1.7.mjs -- (1.7: meldet Inspector.targetCrashed und fragt beim Hängen die Zielliste ab (Absturz des Seitenprozesses?);
// rlc_seite_probe_1.6.mjs -- (1.6: keine CDP-Emulation der Bildschirmmaße mehr -- mit ihr blieb der Browser nach der dritten geladenen Datei ohne Antwort
//   (kein JS-Rahmen beim Anhalten); Fenster 1600x900 und Skalierung kommen jetzt vom Browserstart (--window-size, --force-device-scale-factor);
// rlc_seite_probe_1.5.mjs -- (1.5: der Dateiumweg (File -> dateienLaden) ist in die eigene Probe rlc_seite_dateiprobe_1.0.mjs ausgelagert, die in einer
//   frischen CDP-Sitzung ohne Network/Emulation läuft -- dort antwortet File.text(); in dieser Sitzung blieb der Aufruf ohne Antwort (Prüfmittel-Umgebung);
// rlc_seite_probe_1.4.mjs -- (1.4: P6a (Dateiumweg File -> dateienLaden) wird ohne awaitPromise gestartet und über kurven.length abgefragt; in 1.3 blieb
//   das Versprechen von File.text() im kopflosen Browser mit Network+Emulation aus, ohne dass die Seite rechnete (Debugger fand keinen Rahmen) -- Prüfmittel-Umgebung;
// rlc_seite_probe_1.3.mjs -- (1.3: bleibt eine Auswertung 8 s ohne Antwort, hält der Debugger die Seite an und die Aufrufkette wird ausgegeben (wo hängt es?);
// rlc_seite_probe_1.2.mjs -- (1.2: P6 lädt die drei Dateien über lesen()+neueKurve() (die Zeilen der Seite) und nur die kleinste zusätzlich als File über dateienLaden();
//   1.1 hing kopflos beim File-Umweg mit großem Inhalt, in Einzelversuchen (diag_p6) lief derselbe Aufruf -- Prüfmittel, nicht Seite. 1.1: jede CDP-Anfrage mit 20-s-Frist statt stillem Hängen; Dateien einzeln laden -- 1.0 hing bei drei Dateien in einer Anfrage)
// rlc_seite_probe_1.0.mjs -- Knopfprobe der Seite RLC_Sprung_2.6.html als DATEI (file://) im kopflosen Chromium über CDP, Skalierung wählbar.
// Web Serial gibt es kopflos nicht; geprüft wird alles andere: Laden, eingebettete Kurven, Kennwerte gegen eigene Rechnung aus der Messdatei,
// Eingabeprüfung (T > 140 gesperrt, Nano-Knöpfe gesperrt ohne Verbindung), Dateiladen (Simulink-txt, rlc_ 1.0, rlc27), Bezug/Differenz,
// unteres Bild umschalten, Mauszeiger-Tipp, Größe über die Zeit (kein Wachsen), keine Fehler in der Konsole, kein Netzabruf.
// Aufruf: node rlc_seite_probe_1.0.mjs <cdp-port> <datei.html> <ausgabeordner> <skalierung>
// Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt.
import {writeFile, mkdir, readFile} from "node:fs/promises";
const port = process.argv[2], datei = process.argv[3], out = process.argv[4] || ".", dsf = Number(process.argv[5] || "1");
await mkdir(out, {recursive: true});
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const tab = tabs.find(t => t.type === "page");
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r, j) => { ws.addEventListener("open", r, {once: true}); ws.addEventListener("error", j, {once: true}); });
let id = 1; const pend = new Map(), fehler = [], netz = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === "Inspector.targetCrashed") console.log("SEITENPROZESS ABGESTÜRZT (Inspector.targetCrashed)");
  if (m.method === "Inspector.detached") console.log("Inspector.detached", JSON.stringify(m.params));
  if (m.method === "Debugger.paused") { console.log("SEITE HÄNGT -- Aufrufkette:"); for (const f of m.params.callFrames.slice(0, 10)) console.log("   ", f.functionName || "(anonym)", "Zeile", f.location.lineNumber + 1, "Spalte", f.location.columnNumber);
    const sc = m.params.callFrames[0].scopeChain.find(x => x.type === "local"); const fertig = () => { console.log("ERGEBNIS abgebrochen: Seite hängt"); process.exit(2); };
    if (sc) cdp("Runtime.getProperties", {objectId: sc.object.objectId}).then(r => { console.log("    lokal:", r.result.result.map(p => p.name + "=" + String(p.value?.value ?? p.value?.description).slice(0, 60)).join(", ").slice(0, 600)); fertig(); }); else fertig(); }
  if (m.method === "Runtime.exceptionThrown") fehler.push(m.params.exceptionDetails.text + " " + (m.params.exceptionDetails.exception?.description || "").slice(0, 300));
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") fehler.push("console.error " + m.params.args.map(a => a.value || a.description).join(" ").slice(0, 300));
  if (m.method === "Network.requestWillBeSent" && /^https?:/.test(m.params.request.url)) netz.push(m.params.request.url); });
const cdp = (method, params = {}) => Promise.race([new Promise(res => { const i = id++; pend.set(i, res); ws.send(JSON.stringify({id: i, method, params})); }), new Promise((_, j) => setTimeout(() => j(new Error("keine CDP-Antwort nach 20 s: " + method)), 20000))]);
const js = async (expr) => { const zeit = setTimeout(async () => { console.log("keine Antwort nach 8 s, halte an:", expr.slice(0, 80)); ws.send(JSON.stringify({id: id++, method: "Debugger.pause"})); const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); console.log("Ziele:", JSON.stringify(l.map(t => [t.type, t.title, t.url.slice(0, 60)]))); }, 8000);
  const r = await cdp("Runtime.evaluate", {expression: expr, awaitPromise: true, returnByValue: true}); clearTimeout(zeit); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result.result.value; };
const warte = ms => new Promise(r => setTimeout(r, ms));
const bild = async (n) => { const r = await cdp("Page.captureScreenshot", {format: "png"}); await writeFile(`${out}/${n}_s${dsf}.png`, Buffer.from(r.result.data, "base64")); };
await cdp("Runtime.enable"); await cdp("Network.enable"); await cdp("Page.enable"); await cdp("Debugger.enable"); await cdp("Inspector.enable");
const dprIst = await (async () => { const r = await cdp("Runtime.evaluate", {expression: "window.devicePixelRatio + \"x\" + innerWidth + \"x\" + innerHeight", returnByValue: true}); return r.result.result.value; })(); console.log("Browser: Skalierung/Fenster", dprIst);
await cdp("Page.navigate", {url: "file://" + datei}); await warte(1500);
const erg = []; const P = (name, ok, text) => { erg.push([name, ok, text]); console.log((ok ? "RICHTIG " : "FALSCH  ") + name + ": " + text); };

// P1 geladen, Titel, Kurven eingebettet
const titel = await js("document.title"); P("P1 Seite geladen", /RLC-Sprung 2\.26/.test(titel), titel);
const au = await js(`(() => { const a = $("autor"), b = a.getBoundingClientRect(), h = document.querySelector("header").getBoundingClientRect(), m = document.querySelector("main").getBoundingClientRect(); return [a.textContent, b.width > 100 && b.right <= innerWidth, m.top >= h.bottom, Math.round(h.height)].join("|"); })()`);
P("P1b Namensnennung sichtbar in der Kopfzeile, Hauptteil darunter", /^Prof\. Dr\.-Ing\. Ralph Wystup M\.Sc\. — erstellt mit KI und Agent \(Claude Code, Anthropic\)\|true\|true\|\d+$/.test(au), au);
const altname = "Rup" + "pert";   // der frühere Name des Verfahrens darf nirgends mehr stehen (sein Wort: Verfahren_HR überall) -- auch nicht in dieser Probe
const rp = await js(`document.documentElement.outerHTML.includes("${altname}") + "|" + document.documentElement.outerHTML.includes("${altname.toLowerCase()}")`);
P("P1c der frühere Name des Verfahrens kommt auf der Seite nicht mehr vor (überall Verfahren_HR)", rp === "false|false", rp);
const n0 = await js("kurven.length"); P("P2 eingebettete Kurven", n0 === 5, `${n0} Kurven (rlc27 T140 vom 24.11., T60, T100, T128, T140 mit Strom; 2.26)`);
// P3 Kennwerte gegen eigene Rechnung aus der Messdatei T140
const rohT = (await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt", "utf8")), spalten = rohT.split("\n").find(l => l.startsWith("# k ")).slice(1).trim().split(/\s+/), iUC = spalten.indexOf("U_C_V");
const roh = rohT.split("\n").filter(l => l && !l.startsWith("#")).map(l => l.split(" ").map(Number));
const nach = roh.filter(r => r[0] >= 0), uc = nach.map(r => r[iUC]), imax = uc.indexOf(Math.max(...uc)), tmax = nach[imax][1];
const uend = uc.slice(-60).reduce((a, b) => a + b, 0) / 60;
const kw = await js(`(() => { const k = kurven.find(k => k.name.includes("113109_T140")); const r = kennwerte(k); return {Umax: r.Umax, tmax: r.tmax, Uend: r.Uend, UEend: r.UEend, D: r.D, f0: r.f0, abfall: r.abfall}; })()`);
P("P3 Kennwerte T140 (rlc27, Shunt) gegen Datei", Math.abs(kw.Umax - Math.max(...uc)) < 1e-9 && Math.abs(kw.tmax - tmax) < 1e-9 && Math.abs(kw.Uend - uend) < 1e-6,
  `Seite Umax ${kw.Umax.toFixed(4)} V @ ${(kw.tmax * 1000).toFixed(1)} ms, Uend ${kw.Uend.toFixed(4)}; Datei ${Math.max(...uc).toFixed(4)} @ ${(tmax * 1000).toFixed(1)}, ${uend.toFixed(4)}; D ${kw.D?.toFixed(3)}, f0 ${kw.f0?.toFixed(2)} Hz, U_E,end ${kw.UEend?.toFixed(4)} V, Abfall ${kw.abfall?.toFixed(0)} mV`);
P("P3b U_C unter 5 V und nie negativ (alle eingebetteten)", await js("kurven.every(k => k.u.every(u => u >= 0 && u <= 5))"), "alle Werte 0 … 5 V");
// P4 Sperren ohne Verbindung
const sperr = await js(`["messen","trennen","kennung","speichern"].map(i => $(i).disabled + ":" + $(i).title).join(" | ")`);
P("P4 Knöpfe ohne Nano gesperrt mit Begründung", /^true:Erst mit dem Nano/.test(sperr) && !/false:/.test(sperr.split(" | ").slice(0, 3).join(" | ")), sperr);
// P5 Eingabeprüfung T > 140 (Seite) und T-Feldgrenze
await js(`$("T").value = 141; $("T").dispatchEvent(new Event("input"));`);
let e = await js(`(() => { try { pruefeEingabe(); return "keine Sperre"; } catch (x) { return x.message; } })()`);
P("P5 T = 141 gesperrt", /T > 140 gesperrt/.test(e), e.slice(0, 120));
await js(`$("T").value = 140; $("T").dispatchEvent(new Event("input"));`);
e = await js(`(() => { try { const E = pruefeEingabe(); return "ok " + JSON.stringify(E); } catch (x) { return x.message; } })()`);
P("P5b T = 140 erlaubt, Satz vollständig (mit R)", /^ok .*"R":2000/.test(e), e.slice(0, 120));
P("P5c Tastgradanzeige", (await js(`$("T_V").textContent + " " + $("F_d").textContent`)) === "2,75 V d 0,5490", await js(`$("T_V").textContent + " " + $("F_d").textContent`));
// P6 Dateien laden (Simulink-txt, rlc 1.0, rlc2) über dateienLaden mit File-Objekten
const simul = await readFile("/workspace/Streckenbestimmung_6b/roh/Streckenausmessung/RLC_Strecke/RLC_Glied.txt", "utf8");
const alt10 = await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc_2026-11-22_161403_T128.txt", "utf8");
const r20 = await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc2_2026-11-22_162318_T128_F3_B4.txt", "utf8");
for (const [t, n] of [[simul, "RLC_Glied.txt"], [alt10, "rlc_2026-11-22_161403_T128.txt"], [r20, "rlc2_2026-11-22_162318_T128_F3_B4.txt"]]) {
  console.log("  lade", n); await js(`neueKurve(${JSON.stringify(n)}, lesen(${JSON.stringify(t)}, ${JSON.stringify(n)}), "Datei " + ${JSON.stringify(n)}); kurven.length`); }
// P6a: siehe rlc_seite_dateiprobe_1.0.mjs
await warte(500);
const n1 = await js("kurven.length"), k4 = await js(`kurven.slice(5).map(k => k.name + ":" + k.t.length + ":" + Math.max(...k.u).toFixed(3)).join(" | ")`);
P("P6 drei Dateien geladen (ADC-Zählwerte, 1.0, 2.0)", n1 === 8 && /RLC_Glied.txt:676:3\.6\d\d/.test(k4) && /rlc_2026.*:600:3\.851/.test(k4) && /rlc2_.*:620:3\.86/.test(k4), k4);
P("P6c Format-2.0-Kurve zeichnet keine Anregung (roher PWM-Mittel)", (await js(`ue(kurven.find(k => k.name.startsWith("rlc2_"))) === null`)) === true, "ue() = null");
P("P6b Tafel hat 8 Zeilen, Liste 8 Einträge", (await js(`$("tab").tBodies[0].rows.length`)) === 8 && (await js(`$("kurven").children.length`)) === 8, "");
await bild("p6_sechs_kurven");
// P7 Differenz: Bezug T128 (rlc25) gegen rlc2 T128 -> klein; Werte am Zeiger
await js(`$("bezug").value = kurven.find(k => k.name.includes("T128")).id; $("bezug").dispatchEvent(new Event("change"));`);
await warte(200);
const dmax = await js(`(() => { const r = kurven.find(k => k.name.includes("T128") && k.name.startsWith("rlc27")), k = kurven.find(k => k.name.startsWith("rlc2_")); const d = differenz(k, r).filter(Number.isFinite); return Math.max(...d.map(Math.abs)); })()`);
P("P7 Differenz rlc2 T128 (22.11., ohne Shunt) − rlc27 T128 (23.11., mit Shunt 47 Ω) kleiner 500 mV (Strecke geändert, Scheitel 3,866 → 3,947 V)", dmax < 500, `größte |Δ| ${dmax.toFixed(1)} mV`);
// P8c Strom im unteren Bild (Vorgabe, weil die eingebetteten Kurven Strom haben)
const v8 = await js(`$("unten").value`); await js(`$("unten").value = "i"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const s8 = await js(`(() => { const r = ansicht2.reihen; const mess = r.filter(x => !x.s.length), mx = Math.max(...mess.flatMap(x => x.y.filter(Number.isFinite))); return [ansicht2.art, ansicht2.einheit, r.length, mx.toFixed(2), r.filter(x => x.s.length).length].join("|"); })()`);
P("P8c Auswertung unten: Strom als Vorgabe nach dem Laden, 10 Reihen (5 gemessen, 5 C·dU/dt), Scheitel nach Median 2,6 … 3,0 mA", v8 === "i" && /^i\|mA\|10\|2\.[6-9]\d\|5$/.test(s8), v8 + " · " + s8);
const b2 = await js(`(() => { const b = $("c2").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: b2[0] + 58 + (b2[2] - 72) * 0.04, y: b2[1] + b2[3] * 0.5}); await warte(150);
const tip2 = await js(`$("tip2").hidden ? "versteckt" : $("tip2").textContent`); P("P8d Zeigertipp im Strombild in mA mit „gemessen“ und „C·dU/dt“", /gemessen: -?\d+,\d{3} mA/.test(tip2) && /C·dU\/dt: -?\d+,\d{3} mA/.test(tip2), tip2.slice(0, 160));
await bild("p8c_strom_auswertung");
// P8 unteres Bild umschalten: Port-Abfall und U_E − ideal
await js(`$("unten").value = "p"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenP = await js("ansicht2.reihen.length"); P("P8 Port-Abfall gezeichnet (2 Reihen je Kurve mit Anregung)", reihenP === 10, `${reihenP} Reihen (erwartet 10: fünf rlc27 je U_H und U_L)`);
await bild("p8_port_abfall");
await js(`$("unten").value = "e"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenE = await js("ansicht2.reihen.length"); P("P8b U_E − ideal gezeichnet", reihenE === 5, `${reihenE} Reihen`);
await js(`$("unten").value = "d"; $("unten").dispatchEvent(new Event("change"));`);
// P9 Mauszeiger
const b1 = await js(`(() => { const b = $("c1").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: b1[0] + 58 + (b1[2] - 72) * 0.12, y: b1[1] + 100}); await warte(150);
const tip = await js(`$("tip1").hidden ? "versteckt" : $("tip1").textContent`);
P("P9 Zeigertipp zeigt t und Werte aller Kurven", /t = \d+,\d ms/.test(tip) && (tip.match(/U_?C/g) || tip.match(/UC/g) || []).length >= 5, tip.slice(0, 160));
await bild("p9_tipp");
// P10 Größe über die Zeit und bei Skalierung: Canvas-Maße nach 3 s unverändert, Seite nicht gescrollt
const m0 = await js(`[$("c1").width, $("c1").height, document.documentElement.scrollWidth, document.documentElement.scrollHeight].join("x")`);
await warte(3000); for (let i = 0; i < 5; i++) await js("alles()");
const m1 = await js(`[$("c1").width, $("c1").height, document.documentElement.scrollWidth, document.documentElement.scrollHeight].join("x")`);
const iw = await js("innerWidth + \"x\" + innerHeight");
P("P10 Maße stabil, kein Wachsen, kein Scrollen (Höhe und Breite)", m0 === m1 && Number(m0.split("x")[3]) <= Number(iw.split("x")[1]) && Number(m0.split("x")[2]) <= Number(iw.split("x")[0]), `${m0} -> ${m1}, Fenster ${iw}`);
const vb = await js(`[getComputedStyle($("r_pruef")).display, Math.round($("b1").getBoundingClientRect().height)].join("|")`);
P("P10b Prüfreiter im Auswertungsreiter ausgeblendet, Bild 1 über 250 px hoch", /^none\|/.test(vb) && Number(vb.split("|")[1]) > 250, vb);
// P11 Speichern ohne Ordner = Download (kein Fehler), Zeile in stand_o
await js(`gewaehlt = kurven[0].id; liste();`); await js(`$("speichern").click()`); await warte(400);
const so = await js(`$("stand_o").textContent`); P("P11 Speichern ohne Ordner meldet Download", /Als Download gespeichert/.test(so), so.slice(0, 120));
// P14 Reiter Prüfen
await js(`$("rt_pruef").click()`); await warte(300);
const r14 = await js(`[$("r_pruef").hidden, $("r_aus").hidden, $("rt_pruef").classList.contains("aktiv"), Math.round($("c3").getBoundingClientRect().height), Math.round($("c4").getBoundingClientRect().height), Math.round($("b1").getBoundingClientRect().height), ansicht3 ? ansicht3.v.length : -1, $("pk").value].join("|")`);
const r14t = r14.split("|");
P("P14 Reiter Prüfen sichtbar (Leinwand 3 über 200 px hoch, Leinwand 4 über 80 px, Auswertung ausgeblendet = 0 px)", r14t[0] === "false" && r14t[1] === "true" && r14t[2] === "true" && Number(r14t[3]) > 200 && Number(r14t[4]) > 80 && r14t[5] === "0" && Number(r14t[6]) > 0, r14);
await js(`$("pk").value = String(kurven.find(k => k.name.startsWith("rlc27") && k.name.includes("T140")).id); $("pk").dispatchEvent(new Event("change"));`); await warte(200);
await bild("p14_pruefen_alles");
// P15 Zoom: Knopf Sprung, Rad am Zeiger, Rahmen ziehen, Zurück, Alles
await js(`$("z_sprung").click()`); await warte(150);
let z = await js(`ansicht3.x0.toFixed(1) + ".." + ansicht3.x1.toFixed(1) + " v=" + ansicht3.v.length`);
P("P15a Knopf Sprung ±20 ms", /^-20\.0\.\.20\.0 v=1$/.test(z), z);
const b3 = await js(`(() => { const b = $("c3").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
const xm = b3[0] + 58 + (b3[2] - 72) * 0.5, ym = b3[1] + b3[3] * 0.5;
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: xm, y: ym}); await warte(100);
const tip3 = await js(`$("tip3").hidden ? "versteckt" : $("tip3").textContent`);
P("P15b Zeigertipp im Prüfreiter mit k, U_H, nH", /k -?\d+ .*U_?H.*nH \d nL \d nF \d/.test(tip3) || /k -?\d+/.test(tip3) && /nH/.test(tip3), tip3.slice(0, 160));
await cdp("Input.dispatchMouseEvent", {type: "mouseWheel", x: xm, y: ym, deltaX: 0, deltaY: -120}); await warte(150);
z = await js(`(ansicht3.x1 - ansicht3.x0).toFixed(2)`);
P("P15c Rad zoomt die Zeit (40 ms -> 32 ms)", z === "32.00", z + " ms Ausschnitt");
const tk = await js(`(() => { const t = teilung(ansicht3.x0, ansicht3.x1, 10), n = stellen(t); const b = t.map(v => zahl(v, n)); return [b.join(" "), new Set(b).size === b.length].join("|"); })()`);
P("P15c2 Zeitachse im Zoom eindeutig beschriftet (keine doppelten Werte)", tk.endsWith("|true"), tk);
await bild("p15_sprung_zoom");
const vor15 = await js(`[ansicht3.x1 - ansicht3.x0, ansicht3.y1 - ansicht3.y0, ansicht3.w - 72, ansicht3.h - 46]`);
await cdp("Input.dispatchMouseEvent", {type: "mousePressed", x: xm - 60, y: ym - 40, button: "left", clickCount: 1});
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: xm + 60, y: ym + 40, button: "left"});
await cdp("Input.dispatchMouseEvent", {type: "mouseReleased", x: xm + 60, y: ym + 40, button: "left", clickCount: 1}); await warte(150);
const zr = await js(`[(ansicht3.x1 - ansicht3.x0).toFixed(2), (ansicht3.y1 - ansicht3.y0).toFixed(3), Zalt.length].join("|")`);
const sollX = 120 / vor15[2] * vor15[0], sollY = 80 / vor15[3] * vor15[1];
P("P15d Rahmen ziehen (120 × 80 px) zoomt auf den gerechneten Ausschnitt, Verlauf 2", Math.abs(Number(zr.split("|")[0]) - sollX) < 0.02 * sollX && Math.abs(Number(zr.split("|")[1]) - sollY) < 0.02 * sollY && zr.endsWith("|2"), zr + ` (Soll ${sollX.toFixed(2)} ms × ${sollY.toFixed(3)} V)`);
await bild("p15_rahmen_zoom");
const nPunkte = await js(`(() => { const k = pruefEine(); return k.t.filter(t => t * 1000 >= ansicht3.x0 && t * 1000 <= ansicht3.x1).length; })()`);
P("P15e Messpunkte im Ausschnitt gezeichnet (unter 600)", nPunkte > 0 && nPunkte < 600, nPunkte + " Punkte");
await js(`$("z_zurueck").click()`); await warte(100);
z = await js(`(ansicht3.x1 - ansicht3.x0).toFixed(2)`); P("P15f Zurück = voriger Ausschnitt 32 ms", z === "32.00", z);
await js(`$("z_scheitel").click()`); await warte(100);
const zs = await js(`(() => { const r = kennwerte(pruefEine()); return [Math.abs((ansicht3.x0 + ansicht3.x1) / 2 - r.tmax * 1000).toFixed(3), (ansicht3.y1 - ansicht3.y0).toFixed(3)].join("|"); })()`);
P("P15g Scheitel: Mitte = t_max, Spannung 0,2 V", zs === "0.000|0.200", zs);
await bild("p15_scheitel");
await js(`$("z_alles").click()`); await warte(100);
const za = await js(`[Z === null, ansicht3.x0.toFixed(0), ansicht3.x1 > 590].join("|")`); P("P15h Alles = ganze Messung (bis 599,5 ms)", za === "true|-20|true", za);
// P16 Zählwerte nH+nL+nF = B
const z16 = await js(`(() => { const k = pruefEine(); const B = Math.max(...k.nh.map((v, i) => v + k.nl[i] + k.nf[i])), alle = k.nh.every((v, i) => v + k.nl[i] + k.nf[i] === B); const nach = k.kk.map((kk, i) => kk >= 0 ? k.nh[i] : -1).filter(v => v >= 0); return [B, alle, Math.min(...nach), Math.max(...nach), ansicht4 && ansicht4.k ? ansicht4.k.name : "-"].join("|"); })()`);
P("P16 Zählwerte je Wert vollständig (nH+nL+nF = 4), nach dem Sprung nH 1…3, Leinwand 4 zeigt die Kurve", /^4\|true\|[0-4]\|[0-4]\|rlc27/.test(z16), z16);
// P18 Reiter Aufbau und Theorie: Fotos eingebettet (data:), Schaltplan als SVG, Formeln als MathML gesetzt, kein waagerechtes Rollen
await js(`$("rt_theorie").click()`); await warte(400);
const t18 = await js(`(() => { const f1 = $("foto1"), f2 = $("foto2"), f3 = $("foto3"), sv = document.querySelector("#schaltplan svg"), mm = [...document.querySelectorAll("#r_theorie math")], fr = document.querySelector("#r_theorie mfrac");
  return [$("r_theorie").hidden, $("r_pruef").hidden, f1.naturalWidth + "x" + f1.naturalHeight, f2.naturalWidth + "x" + f2.naturalHeight + "/" + f3.naturalWidth + "x" + f3.naturalHeight, f1.src.slice(0, 22), sv ? Math.round(sv.getBoundingClientRect().width) : 0, mm.length, fr ? Math.round(fr.getBoundingClientRect().height) : 0, $("r_theorie").scrollWidth <= $("r_theorie").clientWidth, Math.round(f1.getBoundingClientRect().width)].join("|"); })()`);
const t = t18.split("|");
P("P18 Aufbau und Theorie: drei Fotos 2048×944 als data: (das dritte mit Shunt), Schaltplan-SVG gezeichnet, 11 MathML-Blöcke mit Bruchhöhe, kein waagerechtes Rollen", t[0] === "false" && t[1] === "true" && t[2] === "2048x944" && t[3] === "2048x944/2048x944" && t[4] === "data:image/jpeg;base64" && Number(t[5]) > 300 && Number(t[6]) === 11 && Number(t[7]) > 20 && t[8] === "true" && Number(t[9]) > 200, t18);
// P18c Klammern (sein Wort: „die gleichung fehlen die klamern“): im Bild gemessen, auf allen Reitern mit Formeln
const k18 = await js(`(() => { const erg = {fest: 0, festHoch: [], dehn: 0, dehnOhneBruch: [], ih: 0, fkt: 0}; const sichtbar = (e) => { let p = e; while (p) { if (p.hidden) return false; p = p.parentElement; } return true; };
  for (const mo of document.querySelectorAll("math mo")) { const z = mo.textContent.trim(); if (!"()[]|".includes(z) || !z) continue;
    const fs = parseFloat(getComputedStyle(mo).fontSize); const h = mo.getBoundingClientRect().height;
    if (mo.getAttribute("stretchy") === "false") { erg.fest++; if (sichtbar(mo) && h > 1.6 * fs) erg.festHoch.push(z + ":" + Math.round(h) + "/" + Math.round(fs)); }
    else { erg.dehn++; const r = mo.parentElement; if (!(r && r.tagName.toLowerCase() === "mrow" && r.querySelector("mfrac"))) erg.dehnOhneBruch.push(z + "@" + (r ? r.tagName : "-")); } }
  for (const ms of document.querySelectorAll("#r_imp math msub")) { const r = ms.firstElementChild; if (r && r.tagName.toLowerCase() === "mrow" && /^\\((Ih|Dr)\\)$/.test(r.textContent.replace(/\\s/g, ""))) erg.ih++; }
  for (const mi of document.querySelectorAll("math mi")) { if (/^(sin|cos|tanh)$/.test(mi.textContent)) { let n = mi.nextElementSibling; if (n && n.textContent.trim() === "\u2061") n = n.nextElementSibling; if (n && n.textContent.trim().startsWith("(")) erg.fkt++; } }
  return JSON.stringify(erg); })()`);
const k = JSON.parse(k18);
P("P18c Klammern: ≥ 90 feste Klammern, keine höher als 1,6 Schrifthöhen, jede dehnbare mit Bruch in eigener mrow, (Ih)_n und (Dr)_n zusammengehörig, sin/cos/tanh mit Argumentklammer", k.fest >= 90 && k.festHoch.length === 0 && k.dehn >= 6 && k.dehnOhneBruch.length === 0 && k.ih === 2 && k.fkt >= 5, k18);
const rx = await js(`document.querySelector("#schaltplan svg").textContent.includes("ext") + "|" + document.querySelector("#schaltplan svg").textContent.includes("= 92 Ω") + "|" + document.querySelector("#schaltplan svg").textContent.includes("A2 (ADC)")`);
P("P18c Schaltplan ohne R_ext, R_Cu = 92 Ω, A2 am Spulenende", rx === "false|true|true", rx);
await bild("p18_theorie_oben");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.3`); await warte(200); await bild("p18_theorie_mitte");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.5`); await warte(200); await bild("p18_theorie_mitte2");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.68`); await warte(200); await bild("p18_theorie_mitte3");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight`); await warte(200); await bild("p18_theorie_unten");
P("P18b Seite nach dem Theorie-Reiter nicht gewachsen (kein Rollbalken der Seite)", await js("document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight"), await js(`document.documentElement.scrollWidth + "x" + document.documentElement.scrollHeight + " Fenster " + innerWidth + "x" + innerHeight`));
// P19 Reiter Anfitten: K steigern bis 0,1 % (tanh nach dem Verfahren_HR), Fourier und Potenzreihe bei gleicher Parameterzahl
await js(`$("rt_fit").click()`); await warte(300);
await js(`$("fk").value = String(kurven.find(k => k.name.includes("113109_T140")).id); $("fk").dispatchEvent(new Event("change")); $("f_starts").value = 6; $("f_treppe").click();`);
for (let i = 0; i < 240 && (await js(`$("f_treppe").disabled`)); i++) await warte(1000);
const f19 = await js(`(() => { const e = fitErg; if (!e) return "kein Ergebnis"; const mt = e.modelle.find(x => x.name.startsWith("tanh")), mf = e.modelle.find(x => x.name.startsWith("Fourier")), mp = e.modelle.find(x => x.name.startsWith("Potenz")); const pz = x => +(x / e.dU * 100).toFixed(3);
  return JSON.stringify({K: Number($("f_K").value), P: e.P, rms: pz(mt.gesamt), max: pz(mt.max), fort: pz(mt.fort), fortF: pz(mf.fort), fortP: pz(mp.fort), zeilen: $("f_treppe_tafel").tBodies[0].rows.length, stand: $("f_stand").textContent.slice(-30)}); })()`);
const m19 = f19.startsWith("{") ? JSON.parse(f19) : null;
P("P19 Anfitten T140: tanh-Netz erreicht RMSE ≤ 0,1 % ΔU bei K ≤ 12, größter Fehler ≤ 0,5 %, Fortsetzung tanh unter 0,3 % und besser als Fourier und Potenzreihe", !!m19 && m19.K <= 12 && m19.rms <= 0.1 && m19.max <= 0.5 && m19.fort < 0.3 && m19.fort < m19.fortF && m19.fort < m19.fortP && /erreicht\.$/.test(m19.stand), f19);
await bild("p19_anfitten");
P("P19b Treppen-Tafel hat mindestens 9 Zeilen (K = 1 … erreicht)", !!m19 && m19.zeilen >= 9 && m19.zeilen === m19.K, m19 ? m19.zeilen + " Zeilen, K = " + m19.K : "–");
const s19 = await js(`(() => { const b = $("f_summe"), tb = [...b.querySelectorAll("table")]; return JSON.stringify({tafeln: tb.length, zeilen: tb.map(t => t.tBodies[0].rows.length), mathe: b.querySelectorAll("math").length, breit: b.scrollWidth <= b.clientWidth + 1, text: b.textContent.slice(0, 50)}); })()`);
const j19 = JSON.parse(s19);
P("P19c Reihen als Gleichungen mit Koeffiziententafeln: drei Tafeln (tanh K Zeilen, Fourier M+1, Potenzreihe P), vier MathML-Gleichungen, kein waagerechtes Rollen", !!m19 && j19.tafeln === 3 && j19.zeilen[0] === m19.K && j19.zeilen[1] === Math.floor((m19.P - 1) / 2) + 1 && j19.zeilen[2] === m19.P && j19.mathe === 4 && j19.breit, s19);
await js(`$("f_summe").scrollTop = 0`); await bild("p19c_reihen");
// P19d Impulsantwort aus der Verfahren_HR-Summe (analytische Ableitung) gegen die iterative Lösung derselben Kurve
await js(`$("rt_imp").click()`); await warte(300);
await js(`$("ik").value = String(kurven.find(k => k.name.includes("113109_T140")).id); $("ik").dispatchEvent(new Event("change")); $("i_rechnen").click();`); await warte(2500);
const h19 = await js(`(() => { const A = ansicht6; if (!A || !imp) return "kein Bild"; const r = A.reihen.find(x => x[4] === "Verfahren_HR"); if (!r) return "keine HR-Reihe: " + A.reihen.map(x => x[4]).join(","); const g = imp.g, h = r[0]; let s2 = 0, n = 0, gm = 0; for (let i = 0; i < g.length; i++) { if (!Number.isFinite(g[i]) || !Number.isFinite(h[i])) continue; s2 += (g[i] - h[i]) ** 2; n++; gm = Math.max(gm, Math.abs(g[i])); } return JSON.stringify({rel: +(Math.sqrt(s2 / n) / gm * 100).toFixed(2), gmax: +gm.toFixed(3), hmax: +Math.max(...h).toFixed(3), reihen: A.reihen.length}); })()`);
const i19 = h19.startsWith("{") ? JSON.parse(h19) : null;
P("P19d Impulsantwort: Ableitung der Verfahren_HR-Summe gezeichnet, Effektivabweichung zur iterativen Lösung unter 20 % von g_max, Scheitel innerhalb 20 %", !!i19 && i19.rel < 20 && Math.abs(i19.hmax - i19.gmax) / i19.gmax < 0.2, h19);
await bild("p19d_impuls_hr");
// P17 Löschknöpfe
await js(`$("rt_aus").click()`); await warte(200);
const n17 = await js("kurven.length");
await js(`gewaehlt = kurven.find(k => k.name.startsWith("rlc2_")).id; liste();`); await js(`$("entfernen").click()`); await warte(100);
const e17 = await js(`[kurven.length, kurven.some(k => k.name.startsWith("rlc2_")), $("stand_k").textContent].join("|")`);
P("P17a Gewählte entfernen nimmt genau die gewählte Kurve", e17.startsWith((n17 - 1) + "|false|") && /entfernt; die Datei bleibt/.test(e17), e17.slice(0, 120));
await js(`$("alle_weg").click()`); await warte(100);
const a1 = await js(`[kurven.length, $("alle_weg").textContent, $("alle_weg").classList.contains("warn")].join("|")`);
P("P17b Alle entfernen: erster Klick entfernt nichts, fragt nach", a1 === (n17 - 1) + "|Wirklich alle " + (n17 - 1) + " entfernen? (nochmal klicken)|true", a1);
await js(`document.querySelector(".links").scrollTop = 10000`); await warte(150); await bild("p17_nachfrage");
await js(`$("alle_weg").click()`); await warte(100);
const a2 = await js(`[kurven.length, $("alle_weg").textContent, $("alle_weg").disabled, $("entfernen").disabled, $("tab").tBodies[0].rows.length].join("|")`);
P("P17c zweiter Klick entfernt alle, Knöpfe danach gesperrt", a2 === "0|Alle entfernen|true|true|0", a2);
await bild("p17_leer");
// P12 Fehler und Netz
P("P12 keine Skriptfehler", fehler.length === 0, fehler.join(" || ").slice(0, 300) || "keine");
P("P13 kein Netzabruf", netz.length === 0, netz.join(", ") || "keiner");
await bild("p13_ende");

{ const zahl2 = x => String(Math.round(x * 100) / 100);
// ---------- Reiter Verfahren_HR (2.25, verschmolzen; Prüfungen H3 … H22 aus verfahren_hr_probe_1.1.mjs übernommen, Zustand über HR.E)
await js(`for (const e of JSON.parse($("d_messungen").textContent)) neueKurve(e.name, lesen(e.text, e.name), e.quelle); gewaehlt = kurven.find(k => k.name.includes("T140")).id; liste();`);   // die Hauptprobe hat zuvor alle Kurven entfernt
await js(`$("rt_hr").click()`); await warte(600);
const h0 = await js(`[$("r_hr").hidden, $("r_aus").hidden, $("r_fit").hidden, HR.kurvenHR().length, HR.kurveHR().name.includes("T140")].join("|")`);
P("H1 Reiter Verfahren_HR geöffnet, andere Reiter verborgen, eingebettete Messungen mit Strom übernommen, T140 gewählt", /^false\|true\|true\|[2-9]\|true$/.test(h0), h0);
const massWert = async () => { await js(`$("hr_schritte").querySelector('button[data-s="1"]').click()`); await warte(300); return await js(`[...document.querySelectorAll("#hr_s1 .bild, #hr_s8 .bild")].map(b => Math.round(b.getBoundingClientRect().height)).join(",")`); };
// P3 Rechnung läuft beim Laden an; warten
for (let i = 0; i < 240 && !/Gerechnet|Fehler/.test(await js(`$("hr_stand").textContent`)); i++) await warte(500);
// 1.27: erst nach dem Lauf beim Laden die Messung T140 vom 23.11. ausdrücklich wählen (zwei T140 eingebettet; die Vergleichszahlen H4 … H13 gelten für diese) und neu rechnen lassen
await js(`gewaehlt = kurven.find(k => k.name.includes("113109_T140")).id; HR.zeige();`); await warte(500);
for (let i = 0; i < 240 && !/^Gerechnet|Fehler/.test(await js(`$("hr_stand").textContent`)); i++) await warte(500);
const st = await js(`$("hr_stand").textContent + " | " + HR.E.k.name`); P("H3 alle Schritte gerechnet (Standzeile), T140 vom 23.11. gewählt", /^Gerechnet/.test(st) && st.includes("113109_T140"), st);
const masse0 = await massWert();
const z = JSON.parse(await js(`JSON.stringify({RCu: HR.E.RCu, RFe: HR.E.RFe, Cm: HR.E.q[HR.E.k.n - 1] / HR.E.dU * 1e6, ePsi: HR.E.fPsi.rmse / (Math.max(...HR.E.psi) - Math.min(...HR.E.psi)) * 100, eQ: HR.E.fQ.rmse / Math.max(...HR.E.q) * 100, dgl: HR.E.sim.map(s => [s.k.name.includes("T140") ? "T140" : "T128", +s.rmse.toFixed(2), +s.max.toFixed(2)]), A0: HR.E.A0 * 1e6, A1: HR.E.A1 * 1e6, w: HR.E.w, Ld0: HR.E.fPsi.df(0), LdS: HR.E.fPsi.df(Math.max(...HR.E.im.slice(0, HR.E.w))), Cd0: HR.E.fQ.df(0) * 1e6, dir: HR.E.vgl.direkt.map(x => +x.rmse.toFixed(3)), weg: HR.E.vgl.weg.map(x => [+x.rmse.toFixed(2), +x.vorher.toFixed(2)])})`));
P("H4 Kupferwiderstand aus ψ(∞) = 0 zwischen 85 und 100 Ω (Angabe 92 Ω, Vorrechnung 93,1 Ω)", z.RCu > 85 && z.RCu < 100, zahl2(z.RCu));
P("H5 Eisenverlust R_Fe aus der Schleifenfläche zwischen 2 und 8 kΩ (Vorrechnung 4 … 5 kΩ), Schleife vorher negativ, nachher kleiner", z.RFe > 2000 && z.RFe < 8000 && z.A0 < 0 && Math.abs(z.A1) < Math.abs(z.A0), JSON.stringify([z.RFe, z.A0, z.A1]));
P("H6 mittlere Kapazität q(t_end)/ΔU zwischen 24 und 30 µF (Vorrechnung 27,1 µF)", z.Cm > 24 && z.Cm < 30, zahl2(z.Cm));
const t7 = JSON.parse(await js(`JSON.stringify(HR.E.tafelRFe.filter(e => isFinite(e.RFe)).reduce((a, e) => Math.abs(Math.log(e.RFe / HR.E.RFeSchleife)) < Math.abs(Math.log(a.RFe / HR.E.RFeSchleife)) ? e : a))`));
P("H7 Verfahren_HR-Fits: ψ(i_m) beim Schleifen-Kriterium Rest ≤ 3,5 % des Hubs (Vorrechnung 2,3 … 2,6 % bei 4 … 5 kΩ), q(u_C) Rest ≤ 2 % (0,9 %)", t7.rest <= 3.5 && z.eQ <= 2, JSON.stringify([t7.RFe, t7.rest, z.eQ]));
P("H7b ψ(i_m) beim gewählten R_Fe (kleinster DGL-Fehler, Schleife überkorrigiert): Rest ≤ 6 % des Hubs, in der Tafel ausgewiesen", z.ePsi <= 6 && t7.dglFehler > 0, JSON.stringify([z.RFe, z.ePsi]));
P("H8 L_d(0) zwischen 2 und 20 H (schlecht bestimmt: 3,8 … 11 H je nach Fenster, siehe Schritt 7), L_d am Stromscheitel 5 … 25 H, C_d(0) zwischen 15 und 40 µF", z.Ld0 > 2 && z.Ld0 < 20 && z.LdS > 5 && z.LdS < 25 && z.Cd0 > 15 && z.Cd0 < 40, JSON.stringify([z.Ld0, z.LdS, z.Cd0]));
const d9 = JSON.parse(await js(`JSON.stringify(HR.E.sim.map(x => [x.k.name.replace(/.*_(T\\d+)_.*/, "$1"), +x.rmse.toFixed(2), +x.max.toFixed(2)]))`)), n9 = JSON.parse(await js(`JSON.stringify(HR.E.suche ? HR.E.suche.sim.map(x => [x.k.name.replace(/.*_(T\\d+)_.*/, "$1"), +x.rmse.toFixed(2), +x.max.toFixed(2), +x.scheitel.toFixed(3), +x.scheitelMess.toFixed(3)]) : null)`));
const eig = d9.find(d => d[0] === "T140"), and = d9.find(d => d[0] === "T128");
P("H9 DGL mit den Kennlinien aus T140 (Schritte 2–8): T140 RMSE ≤ 5 % ΔU, T128 ≤ 6 %, beide größter Fehler ≤ 15 %; T60/T100 ohne Nachstellen 5 … 15 % (trägt nicht über die Amplitude)", !!eig && !!and && eig[1] <= 5 && and[1] <= 6 && eig[2] <= 15 && and[2] <= 15 && d9.filter(d => d[0] === "T60" || d[0] === "T100").every(d => d[1] > 5 && d[1] < 15), JSON.stringify(d9));
P("H9b gemeinsame Suche über alle vier Messungen (Vorgabe): ein Parametersatz, RMSE ≤ 2 % ΔU auf jeder, größter Fehler ≤ 10 %, Scheitel innerhalb 5 %", !!n9 && n9.length === 5 && n9.every(d => d[1] <= 2 && d[2] <= 10 && Math.abs(d[3] - d[4]) / d[4] <= 0.05), JSON.stringify(n9));
P("H10 Vergleich: direkter Fit fällt monoton mit K (8 Werte), Kennlinienweg drei Werte endlich, Vorhersage endlich", z.dir.length === 8 && z.dir.every((v, i) => i === 0 || v <= z.dir[i - 1] * 1.05) && z.weg.length === 3 && z.weg.every(v => Number.isFinite(v[0]) && Number.isFinite(v[1])), JSON.stringify([z.dir, z.weg]));
// P11 jeden Schritt anklicken
const schritte = [];
for (let s = 0; s <= 12; s++) {
  await js(`$("hr_schritte").querySelector('button[data-s="${s}"]').click()`); await warte(350);
  const r = JSON.parse(await js(`(() => { const sec = $("hr_s${s}"), cv = [...sec.querySelectorAll("canvas")], re = document.querySelector("#r_hr"); return JSON.stringify({sichtbar: !sec.hidden, andere: [...document.querySelectorAll("#r_hr .schritt")].filter(x => x !== sec && !x.hidden).length, hoehen: cv.map(c => Math.round(c.getBoundingClientRect().height)), gezeichnet: cv.map(c => !!HR.ansichten[c.id]), tafeln: sec.querySelectorAll("table").length, mathe: sec.querySelectorAll("math").length, rollt: re.scrollWidth > re.clientWidth + 1 || sec.scrollWidth > sec.clientWidth + 1}); })()`));
  schritte.push(r); await bild("hr_s" + s);
  const ok = r.sichtbar && r.andere === 0 && (s === 0 || (r.hoehen.every(h => h > 100) && (s === 11 || r.gezeichnet.every(Boolean)) && r.tafeln >= 1)) && !r.rollt;   // Schritt 11 zeichnet erst nach der Suche
  P(`P11.${s} Schritt ${s}: nur dieser sichtbar, Leinwände > 100 px und gezeichnet, Tafel vorhanden, kein waagerechtes Rollen`, ok, JSON.stringify(r));
}
P("H12 Gleichungen mit Koeffiziententafeln: Schritt 6 ≥ 4 Gleichungen und ≥ 5 Tafeln, Schritt 7 ≥ 5 Gleichungen, Schritt 9 ≥ 3 Gleichungen und ≥ 3 Tafeln", schritte[6].mathe >= 4 && schritte[6].tafeln >= 5 && schritte[7].mathe >= 5 && schritte[9].mathe >= 3 && schritte[9].tafeln >= 3, JSON.stringify([schritte[6].mathe, schritte[6].tafeln, schritte[7].mathe, schritte[9].mathe, schritte[9].tafeln]));
const t6 = JSON.parse(await js(`(() => { const tb = [...$("hr_z6").querySelectorAll("table")].map(t => t.tBodies[0].rows.length); return JSON.stringify({zeilen: tb, Kpsi: HR.E.fPsi.K, Kq: HR.E.fQ.K, Ppsi: HR.E.fPsi.P}); })()`));
P("H12b Koeffiziententafeln Schritt 6: tanh-Tafeln haben K Zeilen, Polynomtafeln P Zeilen", t6.zeilen[1] === t6.Kpsi && t6.zeilen[2] === t6.Kq && t6.zeilen[3] === t6.Ppsi, JSON.stringify(t6));
const v10 = JSON.parse(await js(`(() => { const t = $("hr_z10").querySelector("table"); return JSON.stringify({zeilen: t ? t.tBodies[0].rows.length : 0, befund: $("hr_z10").textContent.includes("Befund"), vorher: $("hr_z10").textContent.includes("sagt die andere Messung")}); })()`));
P("H13 Vergleichstafel Schritt 10: 12 Zeilen (8 direkt + 3 Kennlinienweg + nach der Suche), Befund und Vorhersage-Satz", v10.zeilen === 12 && v10.befund && v10.vorher, JSON.stringify(v10));
// P14 Klammern im Bild (alle Schritte sichtbar machen, messen, zurück)
const k14 = JSON.parse(await js(`(() => { const erg = {fest: 0, festHoch: [], dehn: 0, dehnOhneBruch: []}; const secs = [...document.querySelectorAll("#r_hr .schritt")], war = secs.map(x => x.hidden); secs.forEach(x => x.hidden = false);
  for (const mo of document.querySelectorAll("math mo")) { const z = mo.textContent.trim(); if (!"()[]|".includes(z) || !z) continue; const fs = parseFloat(getComputedStyle(mo).fontSize), h = mo.getBoundingClientRect().height;
    if (mo.getAttribute("stretchy") === "false") { erg.fest++; if (h > 1.6 * fs) erg.festHoch.push(z + ":" + Math.round(h) + "/" + Math.round(fs)); } else { erg.dehn++; const r = mo.parentElement; if (!(r && r.tagName.toLowerCase() === "mrow" && r.querySelector("mfrac"))) erg.dehnOhneBruch.push(z + "@" + (r ? r.tagName : "-")); } }
  secs.forEach((x, i) => x.hidden = war[i]); return JSON.stringify(erg); })()`));
P("H14 Klammern: ≥ 60 feste Klammern, keine höher als 1,6 Schrifthöhen, jede dehnbare mit Bruch in eigener mrow", k14.fest >= 60 && k14.festHoch.length === 0 && k14.dehnOhneBruch.length === 0, JSON.stringify(k14));
// P21 Schritt 11: Suche starten (höchstens 25 Schritte), Fehler der gewählten Messung sinkt, Vorhersage ausgewiesen, Tafeln vorher/nachher
await js(`$("hr_schritte").querySelector('button[data-s="11"]').click(); $("hr_such_it").value = 25; $("hr_suchen").click();`);
for (let i = 0; i < 600 && !/Fertig|Fehler/.test(await js(`$("hr_such_stand").textContent`)); i++) await warte(500);
const s21 = JSON.parse(await js(`(() => { const S = HR.E.suche; if (!S) return JSON.stringify({fehlt: $("hr_such_stand").textContent}); const k = HR.E.k, vor = HR.E.sim.find(x => x.k === k), nach = S.sim.find(x => x.k === k), aV = HR.E.sim.find(x => x.k !== k), aN = S.sim.find(x => x.k !== k);
  return JSON.stringify({stand: $("hr_such_stand").textContent.slice(0, 40), it: S.it, vor: +vor.rmse.toFixed(3), nach: +nach.rmse.toFixed(3), andereVor: +aV.rmse.toFixed(3), andereNach: +aN.rmse.toFixed(3), tafeln: $("hr_z11").querySelectorAll("table").length, befund: $("hr_z11").textContent.includes("Befund"), gezeichnet: !!HR.ansichten["c11a"] && !!HR.ansichten["c11b"], RCu: Math.round(S.m.RCu), RFe: Math.round(S.m.RFe)}); })()`));
P("H21 Simulation und Suche: läuft durch, Fehler der gewählten Messung sinkt unter den Startwert und unter 1,5 % ΔU, andere Messung mit Zahl ausgewiesen, zwei Bilder, drei Tafeln, Befund", !s21.fehlt && /^Fertig/.test(s21.stand) && s21.it >= 1 && s21.nach < s21.vor && s21.nach < 1.5 && Number.isFinite(s21.andereNach) && s21.tafeln >= 3 && s21.befund && s21.gezeichnet && s21.RCu > 20 && s21.RFe > 200, JSON.stringify(s21));
await bild("hr_s11_suche");
// P22 Schritt 12: Faltung g̃ ∗ u_E der anderen Messung gegen Messung und DGL (Vorrechnung: T140→T128 0,56 % mit geglätteter Differenz)
await js(`$("hr_schritte").querySelector('button[data-s="12"]').click()`); await warte(400);
const s22 = JSON.parse(await js(`(() => { const t = $("hr_z12").querySelector("table"); const z = [...t.tBodies[0].rows].map(r => [...r.cells].map(c => c.textContent)); const w = (m, art) => { const r = z.find(x => x[0].includes(m) && x[1].startsWith(art)); return r ? parseFloat(r[2].replace(",", ".")) : NaN; }; return JSON.stringify({zeilen: z.length, t128_faltH: w("T128", "Faltung mit g̃"), t128_faltG: w("T128", "Faltung mit g ("), t128_dgl: w("T128", "DGL nach"), t60_faltG: w("T60", "Faltung mit g ("), t60_dgl: w("T60", "DGL nach"), t100_faltG: w("T100", "Faltung mit g ("), t100_dgl: w("T100", "DGL nach"), befund: $("hr_z12").textContent.includes("Befund"), gezeichnet: !!HR.ansichten["c12a"] && !!HR.ansichten["c12b"]}); })()`));
P("H22 Faltung aus T140: T128 mit g̃ und g je ≤ 1 % ΔU (Vorrechnung 0,56 %); T60 Faltung 3 … 8 % und schlechter als die gemeinsam nachgestellte DGL (≤ 2 %); Tafel ≥ 15 Zeilen, Befund, zwei Bilder", s22.zeilen >= 15 && s22.t128_faltH <= 1 && s22.t128_faltG <= 1 && s22.t60_faltG > 3 && s22.t60_faltG < 8 && s22.t60_dgl <= 2 && s22.t60_dgl < s22.t60_faltG && Number.isFinite(s22.t100_dgl) && s22.befund && s22.gezeichnet, JSON.stringify(s22));
await bild("hr_s12_faltung");
// H23 Schritt 13 (2.26): physikalisches Modell nach der Rechenkette vorhanden (sechs Parameter, alle Messungen), Mittel ≤ 1,5 % ΔU, drei Bilder, vier Tafeln, Gleichungen, Ausklang-Zahlen
await js(`$("hr_schritte").querySelector('button[data-s="13"]').click()`); await warte(500);
const s23 = JSON.parse(await js(`(() => { const P = HR.E.preisach; if (!P) return JSON.stringify({fehlt: $("hr_pr_stand").textContent}); const p = P.p; return JSON.stringify({it: P.it, n: P.sim.length, mittel: +(P.sim.reduce((a, x) => a + x.rmse, 0) / P.sim.length).toFixed(3), maxR: +Math.max(...P.sim.map(x => x.rmse)).toFixed(3), Lr: +p.Lr.toFixed(2), hc: +(p.hc * 1000).toFixed(2), C0: +(p.C0 * 1e6).toFixed(1), R: +p.R.toFixed(0), zeta: P.aus.filter(a => a.mess).map(a => +a.mess.zeta.toFixed(3)), tafeln: $("hr_z13").querySelectorAll("table").length, math: $("hr_pr_formeln").querySelectorAll("math").length, bilder: ["c13a", "c13b", "c13c"].map(c => !!HR.ansichten[c]).join(","), befund: $("hr_z13").textContent.includes("Befund")}); })()`));
P("H23 Schritt 13 physikalisches Modell: ein Parametersatz für alle Messungen, Mittel ≤ 1,5 % ΔU und jede ≤ 2 %, L_rev 2 … 8 H, C0 15 … 40 µF, R 100 … 250 Ω, Ausklang ζ 0,15 … 0,3, drei Bilder, vier Tafeln, drei Gleichungszeilen, Befund", !s23.fehlt && s23.it >= 1 && s23.n >= 4 && s23.mittel <= 1.5 && s23.maxR <= 2 && s23.Lr > 2 && s23.Lr < 8 && s23.C0 > 15 && s23.C0 < 40 && s23.R > 100 && s23.R < 250 && s23.zeta.every(z => z > 0.15 && z < 0.3) && s23.bilder === "true,true,true" && s23.tafeln === 4 && s23.math === 3 && s23.befund, JSON.stringify(s23));
await bild("hr_s13_preisach");
// H24 Schritt 14 (2.26): Wiederholbarkeit -- zwei T140-Aufzeichnungen gefunden, Unterschied 0,2 … 1 % ΔU, zwei Bilder, Tafel ≥ 6 Zeilen, Befund
await js(`$("hr_schritte").querySelector('button[data-s="14"]').click()`); await warte(400);
const s24 = JSON.parse(await js(`(() => { const t = $("hr_z14").querySelector("table"); const z = t ? [...t.tBodies[0].rows].map(r => [...r.cells].map(c => c.textContent)) : []; const e = z.find(r => r[0].startsWith("Unterschied u_C")); const m = e ? /\\((\\d+,\\d+) %\\)/.exec(e[2]) : null; return JSON.stringify({zeilen: z.length, prozent: m ? parseFloat(m[1].replace(",", ".")) : NaN, kopf: t ? [...t.tHead.rows[0].cells].map(c => c.textContent).join("|") : "", bilder: ["c14a", "c14b"].map(c => !!HR.ansichten[c]).join(","), befund: $("hr_z14").textContent.includes("Befund")}); })()`));
P("H24 Schritt 14 Wiederholbarkeit: zwei T140-Aufzeichnungen verglichen, Unterschied 0,2 … 1 % ΔU, Tafel ≥ 6 Zeilen, zwei Bilder, Befund", s24.zeilen >= 6 && s24.prozent >= 0.2 && s24.prozent <= 1 && /T140.*T140/.test(s24.kopf) && s24.bilder === "true,true" && s24.befund, JSON.stringify(s24));
await bild("hr_s14_wiederholbarkeit");
// P16 Datei über lesen()+neueKurve() (Dateiumweg wie auf der Messseite), Auswahl wechseln
await js(`neueKurve("kopie_T140.txt", lesen(kurven[0].text, "kopie_T140.txt"), "Probe");`); await warte(200);
await js(`$("hr_rechnen").click()`); for (let i = 0; i < 240 && !/Gerechnet|Fehler/.test(await js(`$("hr_stand").textContent`)); i++) await warte(500);
const k16 = await js(`kurven.length + "|" + HR.E.k.name + "|" + HR.E.sim.length + "|" + Math.round(HR.E.RCu) + "|" + kurven.length`); P("H16 sechste Kurve über die Seite geladen (neueKurve), vom Reiter übernommen und gerechnet (sechs DGL-Läufe)", /^6\|kopie_T140\.txt\|6\|\d+\|6$/.test(k16), k16);
const masse1 = await massWert();
const mh = (a, b) => { const x = a.split(",").map(Number), y = b.split(",").map(Number); return x.length === y.length && x.every((v, j) => Math.abs(v - y[j]) <= 0.1 * Math.max(v, 1)); };
P("H18 Leinwandmaße über die Zeit innerhalb 10 % (kein Wachsen; Tafelzeilen dürfen die Bildhöhe leicht ändern)", mh(masse0, masse1), masse0.slice(0, 60) + " → " + masse1.slice(0, 60));

}
const okn = erg.filter(e => e[1]).length; console.log(`\nERGEBNIS ${okn} von ${erg.length} RICHTIG (Skalierung ${dsf})`);
await writeFile(`${out}/ergebnis_s${dsf}.json`, JSON.stringify(erg, null, 1)); ws.close(); process.exit(okn === erg.length ? 0 : 1);
