"""arduino_cli_laden_1.2.py -- (1.2: Release-Seite auf GitHub, Prüfsummen „{V}-checksums.txt“; 1.1 ist ein leerer Fehlbau) läuft auf dem Laptop (22.11.2026, sein Wort: „ja, arduino-cli laden"). Portabel in den Ordner arduino neben diesem Skript:
arduino-cli 1.1.1 (offizieller Download, SHA-256 gegen die veröffentlichte Prüfsummenliste), eigene Konfiguration (Daten, Downloads,
Sketchbuch alle im Ordner arduino neben diesem Skript), dann Kern arduino:avr. Keine Installation im System, keine Administratorrechte, nichts überschrieben."""
import os, sys, hashlib, urllib.request, zipfile, subprocess
sys.stdout.reconfigure(errors="replace")
Z = os.path.join(os.path.dirname(os.path.abspath(__file__)), "arduino"); V = "1.1.1"; N = f"arduino-cli_{V}_Windows_64bit.zip"; U = f"https://github.com/arduino/arduino-cli/releases/download/v{V}/"
os.makedirs(Z, exist_ok=True); exe = os.path.join(Z, "arduino-cli.exe")
if not os.path.exists(exe):
    summen = urllib.request.urlopen(U + f"{V}-checksums.txt", timeout=60).read().decode()
    soll = [l.split()[0] for l in summen.splitlines() if l.strip().endswith(N)][0]
    b = urllib.request.urlopen(U + N, timeout=300).read(); ist = hashlib.sha256(b).hexdigest()
    print("Download", len(b), "Byte; SHA-256", "RICHTIG" if ist == soll else f"FALSCH {ist} != {soll}")
    if ist != soll: raise SystemExit("Prüfsumme falsch -- abgebrochen")
    zp = os.path.join(Z, N); open(zp, "xb").write(b)
    with zipfile.ZipFile(zp) as z: z.extract("arduino-cli.exe", Z)
cfg = os.path.join(Z, "arduino-cli.yaml")
if not os.path.exists(cfg):
    d = lambda s: os.path.join(Z, s).replace("\\", "/")
    open(cfg, "x").write(f"directories:\n  data: {d('daten')}\n  downloads: {d('downloads')}\n  user: {d('sketchbuch')}\n")
def cli(*a, t=900):
    r = subprocess.run([exe, "--config-file", cfg, *a], capture_output=True, text=True, timeout=t, creationflags=0x08000000)
    print(">", " ".join(a), "->", r.returncode); print((r.stdout + r.stderr).strip()[-1500:]); return r
cli("version"); cli("core", "update-index"); cli("core", "install", "arduino:avr"); cli("core", "list"); cli("board", "list")
