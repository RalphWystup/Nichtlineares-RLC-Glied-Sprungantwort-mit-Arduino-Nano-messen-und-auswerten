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
// Eingabeprüfung (T > 140 gesperrt, Nano-Knöpfe gesperrt ohne Verbindung), Dateiladen (Simulink-txt, rlc_ 1.0, rlc26), Bezug/Differenz,
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
const titel = await js("document.title"); P("P1 Seite geladen", /RLC-Sprung 2\.12/.test(titel), titel);
const au = await js(`(() => { const a = $("autor"), b = a.getBoundingClientRect(), h = document.querySelector("header").getBoundingClientRect(), m = document.querySelector("main").getBoundingClientRect(); return [a.textContent, b.width > 100 && b.right <= innerWidth, m.top >= h.bottom, Math.round(h.height)].join("|"); })()`);
P("P1b Namensnennung sichtbar in der Kopfzeile, Hauptteil darunter", /^Prof\. Dr\.-Ing\. Ralph Wystup M\.Sc\. — erstellt mit KI und Agent \(Claude Code, Anthropic\)\|true\|true\|\d+$/.test(au), au);
const n0 = await js("kurven.length"); P("P2 eingebettete Kurven", n0 === 3, `${n0} Kurven (Simulink, T140, T128)`);
// P3 Kennwerte gegen eigene Rechnung aus der Messdatei T140
const roh = (await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc26_2026-11-22_164113_T140_F3_B4.txt", "utf8")).split("\n").filter(l => l && !l.startsWith("#")).map(l => l.split(" ").map(Number));
const nach = roh.filter(r => r[0] >= 0), uc = nach.map(r => r[8]), imax = uc.indexOf(Math.max(...uc)), tmax = nach[imax][1];
const uend = uc.slice(-60).reduce((a, b) => a + b, 0) / 60;
const kw = await js(`(() => { const k = kurven.find(k => k.name.startsWith("rlc26")); const r = kennwerte(k); return {Umax: r.Umax, tmax: r.tmax, Uend: r.Uend, UEend: r.UEend, D: r.D, f0: r.f0, abfall: r.abfall}; })()`);
P("P3 Kennwerte T140 gegen Datei", Math.abs(kw.Umax - Math.max(...uc)) < 1e-9 && Math.abs(kw.tmax - tmax) < 1e-9 && Math.abs(kw.Uend - uend) < 1e-6,
  `Seite Umax ${kw.Umax.toFixed(4)} V @ ${(kw.tmax * 1000).toFixed(1)} ms, Uend ${kw.Uend.toFixed(4)}; Datei ${Math.max(...uc).toFixed(4)} @ ${(tmax * 1000).toFixed(1)}, ${uend.toFixed(4)}; D ${kw.D?.toFixed(3)}, f0 ${kw.f0?.toFixed(2)} Hz, U_E,end ${kw.UEend?.toFixed(4)} V, Abfall ${kw.abfall?.toFixed(0)} mV`);
P("P3b U_C unter 5 V und nie negativ (alle eingebetteten)", await js("kurven.every(k => k.u.every(u => u >= 0 && u <= 5))"), "alle Werte 0 … 5 V");
// P4 Sperren ohne Verbindung
const sperr = await js(`["messen","trennen","kennung","k_messen","speichern"].map(i => $(i).disabled + ":" + $(i).title).join(" | ")`);
P("P4 Knöpfe ohne Nano gesperrt mit Begründung", /^true:Erst mit dem Nano/.test(sperr) && !/false:/.test(sperr.split(" | ").slice(0, 4).join(" | ")), sperr);
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
const n1 = await js("kurven.length"), k4 = await js(`kurven.slice(3).map(k => k.name + ":" + k.t.length + ":" + Math.max(...k.u).toFixed(3)).join(" | ")`);
P("P6 drei Dateien geladen (ADC-Zählwerte, 1.0, 2.0)", n1 === 6 && /RLC_Glied.txt:676:3\.6\d\d/.test(k4) && /rlc_2026.*:600:3\.851/.test(k4) && /rlc2_.*:620:3\.86/.test(k4), k4);
P("P6c Format-2.0-Kurve zeichnet keine Anregung (roher PWM-Mittel)", (await js(`ue(kurven.find(k => k.name.startsWith("rlc2_"))) === null`)) === true, "ue() = null");
P("P6b Tafel hat 6 Zeilen, Liste 6 Einträge", (await js(`$("tab").tBodies[0].rows.length`)) === 6 && (await js(`$("kurven").children.length`)) === 6, "");
await bild("p6_sechs_kurven");
// P7 Differenz: Bezug T128 (rlc25) gegen rlc2 T128 -> klein; Werte am Zeiger
await js(`$("bezug").value = kurven.find(k => k.name.startsWith("rlc25")).id; $("bezug").dispatchEvent(new Event("change"));`);
await warte(200);
const dmax = await js(`(() => { const r = kurven.find(k => k.name.startsWith("rlc25")), k = kurven.find(k => k.name.startsWith("rlc2_")); const d = differenz(k, r).filter(Number.isFinite); return Math.max(...d.map(Math.abs)); })()`);
P("P7 Differenz rlc2 T128 − rlc25 T128 kleiner 120 mV", dmax < 120, `größte |Δ| ${dmax.toFixed(1)} mV`);
// P8 unteres Bild umschalten: Port-Abfall und U_E − ideal
await js(`$("unten").value = "p"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenP = await js("ansicht2.reihen.length"); P("P8 Port-Abfall gezeichnet (2 Reihen je Kurve mit Anregung)", reihenP === 4 + 0, `${reihenP} Reihen (erwartet 4: rlc26, rlc25 je U_H und U_L)`);
await bild("p8_port_abfall");
await js(`$("unten").value = "e"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenE = await js("ansicht2.reihen.length"); P("P8b U_E − ideal gezeichnet", reihenE === 2, `${reihenE} Reihen`);
await js(`$("unten").value = "d"; $("unten").dispatchEvent(new Event("change"));`);
// P9 Mauszeiger
const b1 = await js(`(() => { const b = $("c1").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: b1[0] + 58 + (b1[2] - 72) * 0.12, y: b1[1] + 100}); await warte(150);
const tip = await js(`$("tip1").hidden ? "versteckt" : $("tip1").textContent`);
P("P9 Zeigertipp zeigt t und Werte aller Kurven", /t = \d+,\d ms/.test(tip) && (tip.match(/U_?C/g) || tip.match(/UC/g) || []).length >= 6, tip.slice(0, 160));
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
await js(`$("pk").value = String(kurven.find(k => k.name.startsWith("rlc26")).id); $("pk").dispatchEvent(new Event("change"));`); await warte(200);
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
P("P16 Zählwerte je Wert vollständig (nH+nL+nF = 4), nach dem Sprung nH 1…3, Leinwand 4 zeigt die Kurve", /^4\|true\|[0-4]\|[0-4]\|rlc26/.test(z16), z16);
// P18 Reiter Aufbau und Theorie: Fotos eingebettet (data:), Schaltplan als SVG, Formeln als MathML gesetzt, kein waagerechtes Rollen
await js(`$("rt_theorie").click()`); await warte(400);
const t18 = await js(`(() => { const f1 = $("foto1"), f2 = $("foto2"), sv = document.querySelector("#schaltplan svg"), mm = [...document.querySelectorAll("#r_theorie math")], fr = document.querySelector("#r_theorie mfrac");
  return [$("r_theorie").hidden, $("r_pruef").hidden, f1.naturalWidth + "x" + f1.naturalHeight, f2.naturalWidth + "x" + f2.naturalHeight, f1.src.slice(0, 22), sv ? Math.round(sv.getBoundingClientRect().width) : 0, mm.length, fr ? Math.round(fr.getBoundingClientRect().height) : 0, $("r_theorie").scrollWidth <= $("r_theorie").clientWidth, Math.round(f1.getBoundingClientRect().width)].join("|"); })()`);
const t = t18.split("|");
P("P18 Aufbau und Theorie: zwei Fotos 2048×944 als data:, Schaltplan-SVG gezeichnet, 11 MathML-Blöcke mit Bruchhöhe, kein waagerechtes Rollen", t[0] === "false" && t[1] === "true" && t[2] === "2048x944" && t[3] === "2048x944" && t[4] === "data:image/jpeg;base64" && Number(t[5]) > 300 && Number(t[6]) === 11 && Number(t[7]) > 20 && t[8] === "true" && Number(t[9]) > 200, t18);
const rx = await js(`document.querySelector("#schaltplan svg").textContent.includes("ext") + "|" + document.querySelector("#schaltplan svg").textContent.includes("= 92 Ω")`);
P("P18c Schaltplan ohne R_ext, R_Cu = 92 Ω beschriftet", rx === "false|true", rx);
await bild("p18_theorie_oben");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.3`); await warte(200); await bild("p18_theorie_mitte");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.5`); await warte(200); await bild("p18_theorie_mitte2");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.68`); await warte(200); await bild("p18_theorie_mitte3");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight`); await warte(200); await bild("p18_theorie_unten");
P("P18b Seite nach dem Theorie-Reiter nicht gewachsen (kein Rollbalken der Seite)", await js("document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight"), await js(`document.documentElement.scrollWidth + "x" + document.documentElement.scrollHeight + " Fenster " + innerWidth + "x" + innerHeight`));
// P19 Reiter Anfitten (vorbereitet): Schnittstelle liefert Daten ab dem Sprung, Registratur leer, Tafel gefüllt
await js(`$("rt_fit").click()`); await warte(300);
const f19 = await js(`(() => { const k = kurven.find(k => k.name.startsWith("rlc26")); $("fk").value = String(k.id); $("fk").dispatchEvent(new Event("change")); $("f_daten").click(); const d = fitDaten(k);
  return [$("r_fit").hidden, $("r_theorie").hidden, d.n, d.t[0].toFixed(4), d.u.length === d.n && d.uE.length === d.n, Math.abs(d.dt - 0.001) < 1e-9, fitModelle.length, $("f_tafel").tBodies[0].rows.length, $("f_stand").textContent.slice(0, 40), (d.abschnitte.schwingen[1] * 1000).toFixed(0)].join("|"); })()`);
const f = f19.split("|");
P("P19 Reiter Anfitten: 600 Werte ab t = 0,5 ms, U_C und U_E gleich lang, Δt = 1 ms, Registratur leer, Tafel 1 Zeile, Abschnittsgrenze Schwingen 5·T_d", f[0] === "false" && f[1] === "true" && f[2] === "600" && f[3] === "0.0005" && f[4] === "true" && f[5] === "true" && f[6] === "0" && f[7] === "1" && /^Daten von/.test(f[8]) && Number(f[9]) > 500 && Number(f[9]) < 650, f19);
await bild("p19_anfitten");
// P20 Kalibrierreiter
await js(`$("rt_kal").click()`); await warte(300);
await js(`$("k_R").value = 200`); let k20 = await js(`(() => { try { pruefeKal(); return "keine Sperre"; } catch (e) { return e.message; } })()`);
P("P20a R_cal = 200 Ω abgewiesen (über 20 mA)", /250 … 100000 Ω/.test(k20) && /20 mA/.test(k20), k20.slice(0, 100));
// synthetische Rohzeilen: High-Pegel 4,80 V (ADC 982), Low 0,03 V (ADC 6); R_cal 470 -> i = 10,21 mA, Abfall 200 mV, R_out 19,6 Ω
k20 = await js(`(() => { const roh = []; for (let k = 0; k < 50; k++) roh.push([k, 0, 982 * 2, 2, 6 * 2, 2, 0]); const p = kalRechnen(roh, 470, "gnd", 4); kalPunkte = [p];
  const q = kalRechnen(roh.map(z => [z[0], 0, 1018 * 2, 2, 41 * 2, 2, 0]), 470, "5v", 4); kalPunkte.push(q); kalTafel(); zeichneKal(); const g = kalFit();
  return [p.i.toFixed(5), (p.abfall * 1000).toFixed(1), p.Rout.toFixed(2), (p.null * 1000).toFixed(1), q.i.toFixed(5), (q.abfall * 1000).toFixed(1), q.Rout.toFixed(2), g.H.n, g.H.R.toFixed(2), (g.H.U0 * 1000).toFixed(2), g.L.n, g.L.R.toFixed(2), $("k_tafel").tBodies[0].rows.length, ansicht5.pts.length].join("|"); })()`);
P("P20b Rechnung: GND-Punkt i = 10,21 mA, Abfall 200,4 mV, R_out 19,6 Ω, Nullpunkt Low 29,3 mV; 5-V-Punkt ebenso, Nullpunkt High 24,4 mV; Gerade High (0; 24,4) – (10,21; 200,4) = 17,2 Ω, Low 16,7 Ω",
  /^0\.01021\|200\.4\|19\.6\d\|29\.3\|0\.01021\|200\.4\|19\.6\d\|2\|17\.2\d\|24\.4\d\|2\|16\.7\d\|2\|4$/.test(k20), k20);
await js(`$("k_fit").click()`); await warte(100);
k20 = await js(`[kal ? kal.RH.toFixed(2) : "-", kal ? kal.RL.toFixed(2) : "-", $("k_ergebnis").textContent.slice(0, 60), JSON.parse(kalText()).punkte.length].join("|")`);
P("P20c Übernehmen setzt RH/RL, JSON-Text enthält 2 Punkte", /^17\.2\d\|16\.7\d\|High-Treiber: R_out = 17,2 Ω, U0 = 24,4 mV \(2 Punkte\)/.test(k20) && k20.endsWith("|2"), k20);
await bild("p20_kalibrieren");
const kt = await js("kalText()"); await js(`kalPunkte = []; kal = null; kalLadenText(${JSON.stringify(kt)}, "probe.json")`);
k20 = await js(`[kalPunkte.length, kal ? kal.RH.toFixed(2) : "-", $("k_stand").textContent.slice(0, 40)].join("|")`);
P("P20d Kalibrierdatei laden stellt Punkte und Kalibrierung wieder her", /^2\|17\.2\d\|probe\.json: 2 Punkte geladen/.test(k20), k20);
// Stromansicht im Prüfreiter
await js(`$("rt_pruef").click()`); await warte(300); await js(`$("pk").value = String(kurven.find(k => k.name.startsWith("rlc26")).id); $("unten4").value = "i"; $("unten4").dispatchEvent(new Event("change")); $("z_sprung").click();`); await warte(200);
k20 = await js(`(() => { const s = ansicht4.strom, n = a => a.filter(Number.isFinite).length, mx = a => Math.max(...a.filter(Number.isFinite)); return [!!s, n(s.iH), n(s.iL), n(s.iC), (mx(s.iC) * 1000).toFixed(2), (mx(s.iH) * 1000).toFixed(1)].join("|"); })()`);
P("P20e Stromansicht: i_H über 100 Werte, i_L über 10 (nur wo U_L über 1 LSB), C·dU/dt 620 Werte mit Scheitel 2,5 … 3,5 mA bei 28,2 µF", /^true\|[1-9]\d\d\|[1-9]\d\|6[12]\d\|/.test(k20) && Number(k20.split("|")[4]) > 2.5 && Number(k20.split("|")[4]) < 3.5, k20);
await bild("p20_strom");
await js(`$("unten4").value = "n"; $("unten4").dispatchEvent(new Event("change")); $("z_alles").click();`);
// P21 Impulsantwort
await js(`$("rt_imp").click()`); await warte(300);
await js(`$("ik").value = String(kurven.find(k => k.name.startsWith("rlc26")).id); $("i_rechnen").click()`); await warte(300);
const i21 = await js(`(() => { const r = imp; const m = {it: r.it, rms: (r.rms * 1000).toFixed(2), erreicht: r.erreicht, integ: r.integral.toFixed(3), gmax: r.gmax.toFixed(1), tgmax: (r.tgmax * 1000).toFixed(1), tnull: (r.tnull * 1000).toFixed(1), rohRms: (r.rohRms * 1000).toFixed(3), rohSpitze: r.rohSpitze.toFixed(1), lin: !!r.lin, linmax: r.lin ? Math.max(...r.lin).toFixed(1) : "-", zeilen: $("i_tafel").tBodies[0].rows.length, reihen: ansicht6.reihen.length, c6h: Math.round($("c6").getBoundingClientRect().height)}; return JSON.stringify(m); })()`);
const m21 = JSON.parse(i21);
P("P21 Impulsantwort rlc26: Rest RMS ≤ 4,9 mV erreicht, ∫g = 0,97 … 1,03, g-Scheitel 10 … 60 ms, Nulldurchgang 50 … 70 ms, rohe Differenz exakt (Rest 0) aber Spitze über 4 s⁻¹, lineares Modell da, drei Reihen gezeichnet",
  m21.erreicht === true && Number(m21.rms) <= 4.9 && Math.abs(Number(m21.integ) - 1) < 0.03 && Number(m21.tgmax) > 10 && Number(m21.tgmax) < 60 && Number(m21.tnull) > 50 && Number(m21.tnull) < 70 && Number(m21.rohRms) < 0.001 && Number(m21.rohSpitze) > 4 && m21.lin && m21.zeilen === 1 && m21.reihen === 3 && m21.c6h > 150, i21);
await bild("p21_impulsantwort");
const b6 = await js(`(() => { const b = $("c6").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: b6[0] + 58 + (b6[2] - 72) * 0.05, y: b6[1] + b6[3] * 0.5}); await warte(150);
const t6 = await js(`$("tip6").hidden ? "versteckt" : $("tip6").textContent`); P("P21b Zeigertipp der Impulsantwort", /g iterativ .* s⁻¹/.test(t6) && /Rest/.test(t6), t6.slice(0, 120));
await js(`$("i_w").value = 3; $("i_rechnen").click()`); await warte(200);
const i21b = await js(`[imp.it, (imp.rms * 1000).toFixed(2), imp.erreicht].join("|")`); P("P21c kleinere Glättung w = 3: Rest ebenfalls erreicht", /\|true$/.test(i21b), i21b);
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
const okn = erg.filter(e => e[1]).length; console.log(`\nERGEBNIS ${okn} von ${erg.length} RICHTIG (Skalierung ${dsf})`);
await writeFile(`${out}/ergebnis_s${dsf}.json`, JSON.stringify(erg, null, 1)); ws.close(); process.exit(okn === erg.length ? 0 : 1);
