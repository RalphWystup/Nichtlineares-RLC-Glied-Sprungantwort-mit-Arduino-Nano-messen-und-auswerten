// verfahren_hr_probe_1.0.mjs -- Knopfprobe der Seite Verfahren_HR_1.0.html als DATEI (file://) im kopflosen Chromium über CDP, Skalierung wählbar.
// Prüft: Laden, zwei eingebettete Messungen, Rechnung aller Schritte (R_Cu, R_Fe, C_mittel, Fit-Reste, DGL-Fehler gegen die Vorrechnung hr_schritte_0.3.py),
// jeden Schritt 0 … 10 anklicken (Leinwände gezeichnet, Tafeln gefüllt, kein waagerechtes Rollen, Bild je Schritt), Gleichungen mit Koeffiziententafeln
// (Schritt 6, 7, 9), Klammern im Bild (feste Klammern höchstens 1,6 Schrifthöhen, dehnbare mit Bruch in eigener mrow), Vergleichstafel Schritt 10 (11 Zeilen),
// Eingabe ändern und neu rechnen, Datei über lesen()+neueKurve(), Leinwandmaße über die Zeit, keine Skriptfehler, kein Netzabruf.
// Aufruf: node verfahren_hr_probe_1.0.mjs <cdp-port> <datei.html> <ausgabeordner> <skalierung>
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

const massWert = async () => { await js(`$("schritte").querySelector('button[data-s="1"]').click()`); await warte(300); return await js(`[...document.querySelectorAll("#s1 .bild, #s8 .bild")].map(b => Math.round(b.getBoundingClientRect().height)).join(",")`); };
// P1 geladen
const titel = await js("document.title"); P("P1 Seite geladen", /Verfahren_HR 1\.0/.test(titel), titel);
const au = await js(`(() => { const a = $("autor"), r = a.getBoundingClientRect(); return a.textContent + "|" + (r.width > 100 && r.height > 8) + "|" + (document.querySelector("main").getBoundingClientRect().top >= r.bottom - 1); })()`);
P("P1b Namensnennung sichtbar in der Kopfzeile, Hauptteil darunter", /^Prof\. Dr\.-Ing\. Ralph Wystup M\.Sc\. — erstellt mit KI und Agent \(Claude Code, Anthropic\)\|true\|true$/.test(au), au);
const nk = await js("kurven.length + '|' + kurven.map(k => k.name + ':' + k.n).join(',')"); P("P2 zwei eingebettete Messungen mit Strom (rlc27 T140, T128)", /^2\|.*T140.*:600,.*T128.*:600$/.test(nk), nk);
// P3 Rechnung läuft beim Laden an; warten
for (let i = 0; i < 240 && !/Gerechnet|Fehler/.test(await js(`$("stand").textContent`)); i++) await warte(500);
const st = await js(`$("stand").textContent`); P("P3 alle Schritte gerechnet (Standzeile)", /^Gerechnet/.test(st), st);
const masse0 = await massWert();
const z = JSON.parse(await js(`JSON.stringify({RCu: E.RCu, RFe: E.RFe, Cm: E.q[E.k.n - 1] / E.dU * 1e6, ePsi: E.fPsi.rmse / (Math.max(...E.psi) - Math.min(...E.psi)) * 100, eQ: E.fQ.rmse / Math.max(...E.q) * 100, dgl: E.sim.map(s => [s.k.name.includes("T140") ? "T140" : "T128", +s.rmse.toFixed(2), +s.max.toFixed(2)]), A0: E.A0 * 1e6, A1: E.A1 * 1e6, w: E.w, Ld0: E.fPsi.df(0), LdS: E.fPsi.df(Math.max(...E.im.slice(0, E.w))), Cd0: E.fQ.df(0) * 1e6, dir: E.vgl.direkt.map(x => +x.rmse.toFixed(3)), weg: E.vgl.weg.map(x => [+x.rmse.toFixed(2), +x.vorher.toFixed(2)])})`));
P("P4 Kupferwiderstand aus ψ(∞) = 0 zwischen 85 und 100 Ω (Angabe 92 Ω, Vorrechnung 93,1 Ω)", z.RCu > 85 && z.RCu < 100, zahl2(z.RCu));
P("P5 Eisenverlust R_Fe aus der Schleifenfläche zwischen 2 und 8 kΩ (Vorrechnung 4 … 5 kΩ), Schleife vorher negativ, nachher kleiner", z.RFe > 2000 && z.RFe < 8000 && z.A0 < 0 && Math.abs(z.A1) < Math.abs(z.A0), JSON.stringify([z.RFe, z.A0, z.A1]));
P("P6 mittlere Kapazität q(t_end)/ΔU zwischen 24 und 30 µF (Vorrechnung 27,1 µF)", z.Cm > 24 && z.Cm < 30, zahl2(z.Cm));
const t7 = JSON.parse(await js(`JSON.stringify(E.tafelRFe.filter(e => isFinite(e.RFe)).reduce((a, e) => Math.abs(Math.log(e.RFe / E.RFeSchleife)) < Math.abs(Math.log(a.RFe / E.RFeSchleife)) ? e : a))`));
P("P7 Verfahren_HR-Fits: ψ(i_m) beim Schleifen-Kriterium Rest ≤ 3,5 % des Hubs (Vorrechnung 2,3 … 2,6 % bei 4 … 5 kΩ), q(u_C) Rest ≤ 2 % (0,9 %)", t7.rest <= 3.5 && z.eQ <= 2, JSON.stringify([t7.RFe, t7.rest, z.eQ]));
P("P7b ψ(i_m) beim gewählten R_Fe (kleinster DGL-Fehler, Schleife überkorrigiert): Rest ≤ 6 % des Hubs, in der Tafel ausgewiesen", z.ePsi <= 6 && t7.dglFehler > 0, JSON.stringify([z.RFe, z.ePsi]));
P("P8 L_d(0) zwischen 2 und 20 H (schlecht bestimmt: 3,8 … 11 H je nach Fenster, siehe Schritt 7), L_d am Stromscheitel 5 … 25 H, C_d(0) zwischen 15 und 40 µF", z.Ld0 > 2 && z.Ld0 < 20 && z.LdS > 5 && z.LdS < 25 && z.Cd0 > 15 && z.Cd0 < 40, JSON.stringify([z.Ld0, z.LdS, z.Cd0]));
const eig = z.dgl.find(d => d[0] === "T140"), and = z.dgl.find(d => d[0] === "T128");
P("P9 DGL mit den Kennlinien: T140 (Quelle) RMSE ≤ 5 % ΔU (Vorrechnung 2,6 %), T128 (Vorhersage) RMSE ≤ 6 % (3,8 %), beide größter Fehler ≤ 15 %", eig && and && eig[1] <= 5 && and[1] <= 6 && eig[2] <= 15 && and[2] <= 15, JSON.stringify(z.dgl));
P("P10 Vergleich: direkter Fit fällt monoton mit K (8 Werte), Kennlinienweg drei Werte endlich, Vorhersage endlich", z.dir.length === 8 && z.dir.every((v, i) => i === 0 || v <= z.dir[i - 1] * 1.05) && z.weg.length === 3 && z.weg.every(v => Number.isFinite(v[0]) && Number.isFinite(v[1])), JSON.stringify([z.dir, z.weg]));
// P11 jeden Schritt anklicken
const schritte = [];
for (let s = 0; s <= 10; s++) {
  await js(`$("schritte").querySelector('button[data-s="${s}"]').click()`); await warte(350);
  const r = JSON.parse(await js(`(() => { const sec = $("s${s}"), cv = [...sec.querySelectorAll("canvas")], re = document.querySelector(".rechts"); return JSON.stringify({sichtbar: !sec.hidden, andere: [...document.querySelectorAll(".schritt")].filter(x => x !== sec && !x.hidden).length, hoehen: cv.map(c => Math.round(c.getBoundingClientRect().height)), gezeichnet: cv.map(c => !!ansichten[c.id]), tafeln: sec.querySelectorAll("table").length, mathe: sec.querySelectorAll("math").length, rollt: re.scrollWidth > re.clientWidth + 1 || sec.scrollWidth > sec.clientWidth + 1}); })()`));
  schritte.push(r); await bild("hr_s" + s);
  const ok = r.sichtbar && r.andere === 0 && (s === 0 || (r.hoehen.every(h => h > 100) && r.gezeichnet.every(Boolean) && r.tafeln >= 1)) && !r.rollt;
  P(`P11.${s} Schritt ${s}: nur dieser sichtbar, Leinwände > 100 px und gezeichnet, Tafel vorhanden, kein waagerechtes Rollen`, ok, JSON.stringify(r));
}
P("P12 Gleichungen mit Koeffiziententafeln: Schritt 6 ≥ 4 Gleichungen und ≥ 5 Tafeln, Schritt 7 ≥ 5 Gleichungen, Schritt 9 ≥ 3 Gleichungen und ≥ 3 Tafeln", schritte[6].mathe >= 4 && schritte[6].tafeln >= 5 && schritte[7].mathe >= 5 && schritte[9].mathe >= 3 && schritte[9].tafeln >= 3, JSON.stringify([schritte[6].mathe, schritte[6].tafeln, schritte[7].mathe, schritte[9].mathe, schritte[9].tafeln]));
const t6 = JSON.parse(await js(`(() => { const tb = [...$("z6").querySelectorAll("table")].map(t => t.tBodies[0].rows.length); return JSON.stringify({zeilen: tb, Kpsi: E.fPsi.K, Kq: E.fQ.K, Ppsi: E.fPsi.P}); })()`));
P("P12b Koeffiziententafeln Schritt 6: tanh-Tafeln haben K Zeilen, Polynomtafeln P Zeilen", t6.zeilen[1] === t6.Kpsi && t6.zeilen[2] === t6.Kq && t6.zeilen[3] === t6.Ppsi, JSON.stringify(t6));
const v10 = JSON.parse(await js(`(() => { const t = $("z10").querySelector("table"); return JSON.stringify({zeilen: t ? t.tBodies[0].rows.length : 0, befund: $("z10").textContent.includes("Befund"), vorher: $("z10").textContent.includes("sagt die andere Messung")}); })()`));
P("P13 Vergleichstafel Schritt 10: 11 Zeilen (8 direkt + 3 Kennlinienweg), Befund und Vorhersage-Satz", v10.zeilen === 11 && v10.befund && v10.vorher, JSON.stringify(v10));
// P14 Klammern im Bild (alle Schritte sichtbar machen, messen, zurück)
const k14 = JSON.parse(await js(`(() => { const erg = {fest: 0, festHoch: [], dehn: 0, dehnOhneBruch: []}; const secs = [...document.querySelectorAll(".schritt")], war = secs.map(x => x.hidden); secs.forEach(x => x.hidden = false);
  for (const mo of document.querySelectorAll("math mo")) { const z = mo.textContent.trim(); if (!"()[]|".includes(z) || !z) continue; const fs = parseFloat(getComputedStyle(mo).fontSize), h = mo.getBoundingClientRect().height;
    if (mo.getAttribute("stretchy") === "false") { erg.fest++; if (h > 1.6 * fs) erg.festHoch.push(z + ":" + Math.round(h) + "/" + Math.round(fs)); } else { erg.dehn++; const r = mo.parentElement; if (!(r && r.tagName.toLowerCase() === "mrow" && r.querySelector("mfrac"))) erg.dehnOhneBruch.push(z + "@" + (r ? r.tagName : "-")); } }
  secs.forEach((x, i) => x.hidden = war[i]); return JSON.stringify(erg); })()`));
P("P14 Klammern: ≥ 60 feste Klammern, keine höher als 1,6 Schrifthöhen, jede dehnbare mit Bruch in eigener mrow", k14.fest >= 60 && k14.festHoch.length === 0 && k14.dehnOhneBruch.length === 0, JSON.stringify(k14));
// P15 Eingabe ändern und neu rechnen (K für ψ = 1)
await js(`$("Kpsi").value = 1; $("Kpsi").dispatchEvent(new Event("change"));`); const leerStand = await js(`$("stand").textContent + "|" + (E === null)`);
await js(`$("rechnen").click()`); for (let i = 0; i < 240 && !/Gerechnet|Fehler/.test(await js(`$("stand").textContent`)); i++) await warte(500);
const k15 = await js(`E ? E.fPsi.K + "|" + $("stand").textContent.slice(0, 9) : "kein E"`); P("P15 Eingabe ändern löscht das Ergebnis, „Alle Schritte rechnen“ rechnet mit K = 1 neu", /Werte geändert.*\|true$/.test(leerStand) && k15 === "1|Gerechnet", leerStand + " → " + k15);
// P16 Datei über lesen()+neueKurve() (Dateiumweg wie auf der Messseite), Auswahl wechseln
await js(`neueKurve(lesen(kurven[0].text, "kopie_T140.txt")); $("kurven").querySelectorAll("input")[2].click();`); await warte(200);
await js(`$("rechnen").click()`); for (let i = 0; i < 240 && !/Gerechnet|Fehler/.test(await js(`$("stand").textContent`)); i++) await warte(500);
const k16 = await js(`kurven.length + "|" + E.k.name + "|" + E.sim.length + "|" + Math.round(E.RCu)`); P("P16 dritte Kurve geladen, gewählt und gerechnet (drei DGL-Läufe)", /^3\|kopie_T140\.txt\|3\|\d+$/.test(k16), k16);
// P17 unbrauchbare Datei
const k17 = await js(`(() => { try { lesen("1 2 3\\n4 5 6", "x.txt"); return "angenommen"; } catch (e) { return "abgewiesen: " + e.message.slice(0, 60); } })()`); P("P17 Datei ohne rlc27-Kopf wird mit Meldung abgewiesen", /^abgewiesen/.test(k17), k17);
const masse1 = await massWert();
P("P18 Leinwandmaße über die Zeit unverändert (kein Wachsen)", masse0 === masse1, masse0.slice(0, 60) + " → " + masse1.slice(0, 60));
P("P19 keine Skriptfehler", fehler.length === 0, fehler.join(" | ").slice(0, 300) || "keine");
P("P20 kein Netzabruf", netz.length === 0, netz.join(", ") || "keiner");
function zahl2(x) { return String(Math.round(x * 100) / 100); }
const okn = erg.filter(e => e[1]).length; console.log(`\nERGEBNIS ${okn} von ${erg.length} RICHTIG (Skalierung ${dsf})`);
await writeFile(`${out}/ergebnis_hr_s${dsf}.json`, JSON.stringify(erg, null, 1)); ws.close(); process.exit(okn === erg.length ? 0 : 1);
