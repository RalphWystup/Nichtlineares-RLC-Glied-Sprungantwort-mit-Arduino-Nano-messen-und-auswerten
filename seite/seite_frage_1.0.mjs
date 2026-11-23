// seite_frage_1.0.mjs -- Werkzeug: lädt eine Seite als Datei im kopflosen Chromium (CDP) und wertet einen JS-Ausdruck aus (zum Nachmessen von Maßen und Zuständen).
// Aufruf: node seite_frage_1.0.mjs <cdp-port> <datei.html> <ausdruck> [wartezeit ms] [vorab-ausdruck] [warte-bis-bedingung]   -- Ausgabeordner/Skalierung entfallen (process.argv[4] = Ausdruck)
// Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt.
import {writeFile, mkdir, readFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
const port = process.argv[2], datei = process.argv[3], ausdruck = process.argv[4], wz = Number(process.argv[5] || "1500"), out = ".", dsf = 1;

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
await cdp("Page.navigate", {url: "file://" + datei}); await warte(wz);
const lies = x => (x && x.startsWith("@")) ? (await0(x.slice(1))) : x;   // @datei: Ausdruck aus Datei lesen (umgeht die Anführungszeichen der Shell)
function await0(f) { return readFileSync(f, "utf8"); }
const vorab = lies(process.argv[6]), bis = lies(process.argv[7]);   // optional: vorab = Ausdruck, der etwas anstößt; bis = Bedingung, auf die bis 300 s gewartet wird (alle 500 ms gefragt)
if (vorab) await js(vorab);
if (bis) for (let i = 0; i < 600 && !(await js(bis)); i++) await warte(500);
console.log(JSON.stringify(await js(lies(ausdruck)), null, 1)); if (fehler.length) console.log("FEHLER:", fehler.join(" | ")); ws.close(); process.exit(0);
