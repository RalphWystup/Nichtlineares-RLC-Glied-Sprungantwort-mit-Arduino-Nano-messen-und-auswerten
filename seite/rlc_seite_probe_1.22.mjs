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
const titel = await js("document.title"); P("P1 Seite geladen", /RLC-Sprung 2\.21/.test(titel), titel);
const au = await js(`(() => { const a = $("autor"), b = a.getBoundingClientRect(), h = document.querySelector("header").getBoundingClientRect(), m = document.querySelector("main").getBoundingClientRect(); return [a.textContent, b.width > 100 && b.right <= innerWidth, m.top >= h.bottom, Math.round(h.height)].join("|"); })()`);
P("P1b Namensnennung sichtbar in der Kopfzeile, Hauptteil darunter", /^Prof\. Dr\.-Ing\. Ralph Wystup M\.Sc\. — erstellt mit KI und Agent \(Claude Code, Anthropic\)\|true\|true\|\d+$/.test(au), au);
const n0 = await js("kurven.length"); P("P2 eingebettete Kurven", n0 === 2, `${n0} Kurven (rlc27 T140, T128 mit Strom)`);
// P3 Kennwerte gegen eigene Rechnung aus der Messdatei T140
const rohT = (await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc27_2026-11-23_113109_T140_F3_B4.txt", "utf8")), spalten = rohT.split("\n").find(l => l.startsWith("# k ")).slice(1).trim().split(/\s+/), iUC = spalten.indexOf("U_C_V");
const roh = rohT.split("\n").filter(l => l && !l.startsWith("#")).map(l => l.split(" ").map(Number));
const nach = roh.filter(r => r[0] >= 0), uc = nach.map(r => r[iUC]), imax = uc.indexOf(Math.max(...uc)), tmax = nach[imax][1];
const uend = uc.slice(-60).reduce((a, b) => a + b, 0) / 60;
const kw = await js(`(() => { const k = kurven.find(k => k.name.startsWith("rlc27")); const r = kennwerte(k); return {Umax: r.Umax, tmax: r.tmax, Uend: r.Uend, UEend: r.UEend, D: r.D, f0: r.f0, abfall: r.abfall}; })()`);
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
const n1 = await js("kurven.length"), k4 = await js(`kurven.slice(2).map(k => k.name + ":" + k.t.length + ":" + Math.max(...k.u).toFixed(3)).join(" | ")`);
P("P6 drei Dateien geladen (ADC-Zählwerte, 1.0, 2.0)", n1 === 5 && /RLC_Glied.txt:676:3\.6\d\d/.test(k4) && /rlc_2026.*:600:3\.851/.test(k4) && /rlc2_.*:620:3\.86/.test(k4), k4);
P("P6c Format-2.0-Kurve zeichnet keine Anregung (roher PWM-Mittel)", (await js(`ue(kurven.find(k => k.name.startsWith("rlc2_"))) === null`)) === true, "ue() = null");
P("P6b Tafel hat 5 Zeilen, Liste 5 Einträge", (await js(`$("tab").tBodies[0].rows.length`)) === 5 && (await js(`$("kurven").children.length`)) === 5, "");
await bild("p6_sechs_kurven");
// P7 Differenz: Bezug T128 (rlc25) gegen rlc2 T128 -> klein; Werte am Zeiger
await js(`$("bezug").value = kurven.find(k => k.name.includes("T128")).id; $("bezug").dispatchEvent(new Event("change"));`);
await warte(200);
const dmax = await js(`(() => { const r = kurven.find(k => k.name.includes("T128") && k.name.startsWith("rlc27")), k = kurven.find(k => k.name.startsWith("rlc2_")); const d = differenz(k, r).filter(Number.isFinite); return Math.max(...d.map(Math.abs)); })()`);
P("P7 Differenz rlc2 T128 (22.11., ohne Shunt) − rlc27 T128 (23.11., mit Shunt 47 Ω) kleiner 500 mV (Strecke geändert, Scheitel 3,866 → 3,947 V)", dmax < 500, `größte |Δ| ${dmax.toFixed(1)} mV`);
// P8c Strom im unteren Bild (Vorgabe, weil die eingebetteten Kurven Strom haben)
const v8 = await js(`$("unten").value`); await js(`$("unten").value = "i"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const s8 = await js(`(() => { const r = ansicht2.reihen; const mess = r.filter(x => !x.s.length), mx = Math.max(...mess.flatMap(x => x.y.filter(Number.isFinite))); return [ansicht2.art, ansicht2.einheit, r.length, mx.toFixed(2), r.filter(x => x.s.length).length].join("|"); })()`);
P("P8c Auswertung unten: Strom als Vorgabe nach dem Laden, 4 Reihen (2 gemessen, 2 C·dU/dt), Scheitel nach Median 2,6 … 3,0 mA", v8 === "i" && /^i\|mA\|4\|2\.[6-9]\d\|2$/.test(s8), v8 + " · " + s8);
const b2 = await js(`(() => { const b = $("c2").getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
await cdp("Input.dispatchMouseEvent", {type: "mouseMoved", x: b2[0] + 58 + (b2[2] - 72) * 0.04, y: b2[1] + b2[3] * 0.5}); await warte(150);
const tip2 = await js(`$("tip2").hidden ? "versteckt" : $("tip2").textContent`); P("P8d Zeigertipp im Strombild in mA mit „gemessen“ und „C·dU/dt“", /gemessen: -?\d+,\d{3} mA/.test(tip2) && /C·dU\/dt: -?\d+,\d{3} mA/.test(tip2), tip2.slice(0, 160));
await bild("p8c_strom_auswertung");
// P8 unteres Bild umschalten: Port-Abfall und U_E − ideal
await js(`$("unten").value = "p"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenP = await js("ansicht2.reihen.length"); P("P8 Port-Abfall gezeichnet (2 Reihen je Kurve mit Anregung)", reihenP === 4 + 0, `${reihenP} Reihen (erwartet 4: beide rlc27 je U_H und U_L)`);
await bild("p8_port_abfall");
await js(`$("unten").value = "e"; $("unten").dispatchEvent(new Event("change"));`); await warte(200);
const reihenE = await js("ansicht2.reihen.length"); P("P8b U_E − ideal gezeichnet", reihenE === 2, `${reihenE} Reihen`);
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
const t18 = await js(`(() => { const f1 = $("foto1"), f2 = $("foto2"), sv = document.querySelector("#schaltplan svg"), mm = [...document.querySelectorAll("#r_theorie math")], fr = document.querySelector("#r_theorie mfrac");
  return [$("r_theorie").hidden, $("r_pruef").hidden, f1.naturalWidth + "x" + f1.naturalHeight, f2.naturalWidth + "x" + f2.naturalHeight, f1.src.slice(0, 22), sv ? Math.round(sv.getBoundingClientRect().width) : 0, mm.length, fr ? Math.round(fr.getBoundingClientRect().height) : 0, $("r_theorie").scrollWidth <= $("r_theorie").clientWidth, Math.round(f1.getBoundingClientRect().width)].join("|"); })()`);
const t = t18.split("|");
P("P18 Aufbau und Theorie: zwei Fotos 2048×944 als data:, Schaltplan-SVG gezeichnet, 11 MathML-Blöcke mit Bruchhöhe, kein waagerechtes Rollen", t[0] === "false" && t[1] === "true" && t[2] === "2048x944" && t[3] === "2048x944" && t[4] === "data:image/jpeg;base64" && Number(t[5]) > 300 && Number(t[6]) === 11 && Number(t[7]) > 20 && t[8] === "true" && Number(t[9]) > 200, t18);
const rx = await js(`document.querySelector("#schaltplan svg").textContent.includes("ext") + "|" + document.querySelector("#schaltplan svg").textContent.includes("= 92 Ω") + "|" + document.querySelector("#schaltplan svg").textContent.includes("A2 (ADC)")`);
P("P18c Schaltplan ohne R_ext, R_Cu = 92 Ω, A2 am Spulenende", rx === "false|true|true", rx);
await bild("p18_theorie_oben");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.3`); await warte(200); await bild("p18_theorie_mitte");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.5`); await warte(200); await bild("p18_theorie_mitte2");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight * 0.68`); await warte(200); await bild("p18_theorie_mitte3");
await js(`$("r_theorie").scrollTop = $("r_theorie").scrollHeight`); await warte(200); await bild("p18_theorie_unten");
P("P18b Seite nach dem Theorie-Reiter nicht gewachsen (kein Rollbalken der Seite)", await js("document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight"), await js(`document.documentElement.scrollWidth + "x" + document.documentElement.scrollHeight + " Fenster " + innerWidth + "x" + innerHeight`));
// P19 Reiter Anfitten: drei Ansätze mit gleicher Parameterzahl
await js(`$("rt_fit").click()`); await warte(300);
await js(`$("fk").value = String(kurven.find(k => k.name.includes("T140")).id); $("fk").dispatchEvent(new Event("change")); $("f_K").value = 3; $("f_starts").value = 8; $("f_rechnen").click();`); await warte(4000);
for (let i = 0; i < 20 && (await js(`$("f_rechnen").disabled`)); i++) await warte(500);
const f19 = await js(`(() => { const e = fitErg; if (!e) return "kein Ergebnis"; return JSON.stringify({n: e.modelle.length, P: e.modelle.map(m => m.P), ges: e.modelle.map(m => +(m.gesamt * 1000).toFixed(1)), eing: e.modelle.map(m => +(m.eing * 1000).toFixed(1)), fort: e.modelle.map(m => +(m.fort * 1000).toFixed(1)), zeilen: $("f_modelle").tBodies[0].rows.length, c9: Math.round($("c9").getBoundingClientRect().height), stand: $("f_stand").textContent.slice(0, 50)}); })()`);
const m19 = f19.startsWith("{") ? JSON.parse(f19) : null;
P("P19 Anfitten T140, K = 3: drei Ansätze mit 10 (Fourier 9) Parametern, Tafel 3 Zeilen, Fehler im Fenster endlich und unter 500 mV, tanh im eingeschwungenen Abschnitt besser als die Potenzreihe und in der Fortsetzung besser als beide", !!m19 && m19.n === 3 && m19.P[0] === 10 && Math.abs(m19.P[1] - 10) <= 1 && m19.P[2] === 10 && m19.zeilen === 3 && m19.ges.every(x => Number.isFinite(x) && x < 500) && m19.eing[0] < m19.eing[2] && m19.fort[0] < m19.fort[1] && m19.fort[0] < m19.fort[2] && m19.c9 > 100, f19);
await bild("p19_anfitten");
P("P19b Treppen-Knopf vorhanden und frei", await js(`!$("f_treppe").disabled && $("f_treppe").textContent.includes("Treppe")`), "");
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
