// rlc_seite_dateiprobe_1.0.mjs -- Probe des Dateiumwegs der Seite RLC_Sprung_2.6.html: Knopf „Messdateien laden“ / Ziehen -> dateienLaden(File[])
// -> File.text() -> lesen() -> neueKurve(). Eigene CDP-Sitzung (nur Runtime + Page), weil File.text() in der Hauptprobe mit Network+Emulation ohne Antwort blieb.
// Aufruf: node rlc_seite_dateiprobe_1.0.mjs <cdp-port> <datei.html>
import {readFile} from "node:fs/promises";
const port = process.argv[2], datei = process.argv[3];
const tab = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === "page");
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener("open", r, {once: true}));
let id = 1; const pend = new Map(), fehler = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") fehler.push(JSON.stringify(m.params).slice(0, 200)); });
const cdp = (method, params = {}) => Promise.race([new Promise(res => { const i = id++; pend.set(i, res); ws.send(JSON.stringify({id: i, method, params})); }), new Promise((_, j) => setTimeout(() => j(new Error("keine CDP-Antwort nach 20 s: " + method)), 20000))]);
const js = async (e) => { const r = await cdp("Runtime.evaluate", {expression: e, awaitPromise: true, returnByValue: true}); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result.value; };
await cdp("Runtime.enable"); await cdp("Page.enable");
await cdp("Page.navigate", {url: "file://" + datei}); await new Promise(r => setTimeout(r, 1500));
const erg = []; const P = (n, ok, t) => { erg.push(ok); console.log((ok ? "RICHTIG " : "FALSCH  ") + n + ": " + t); };
const n0 = await js("kurven.length");
const klein = ["0 0", "0.001 1", "0.002 2", "0.003 2.5", "0.004 2.4", "0.005 2.3", "0.006 2.3", ""].join(String.fromCharCode(10));
const n1 = await js(`dateienLaden([new File([${JSON.stringify(klein)}], "klein.txt")]).then(() => kurven.length)`);
P("D1 kleine Datei über File -> dateienLaden", n1 === n0 + 1, `${n0} -> ${n1} Kurven`);
const gross = await readFile("/workspace/Streckenbestimmung_6b/messungen/rlc26_2026-11-22_164113_T140_F3_B4.txt", "utf8");
const n2 = await js(`dateienLaden([new File([${JSON.stringify(gross)}], "rlc26_x.txt")]).then(() => kurven.length)`);
const kw = await js(`(() => { const k = kurven[kurven.length - 1]; const r = kennwerte(k); return k.name + " " + r.Umax.toFixed(4) + " " + (r.UEend || 0).toFixed(4); })()`);
P("D2 große Datei (rlc26, 42 kB) über File -> dateienLaden, Kennwerte", n2 === n0 + 2 && /rlc26_x.txt 4\.4734 2\.7442/.test(kw), kw);
const n3 = await js(`dateienLaden([new File(["# nur Kopf" + String.fromCharCode(10)], "leer.txt")]).then(() => kurven.length + " | " + $("stand_m").textContent)`);
P("D3 unbrauchbare Datei wird mit Meldung abgewiesen", n3 === `${n0 + 2} | Laden: leer.txt: keine Messwerte erkannt`, n3);   // 1.0b: Vergleich statt Regex-Literal (kein ${} darin)
P("D4 keine Skriptfehler", fehler.length === 0, fehler.join(" || ") || "keine");
const ok = erg.filter(Boolean).length; console.log(`ERGEBNIS Dateiprobe ${ok} von ${erg.length} RICHTIG`); process.exit(ok === erg.length ? 0 : 1);
