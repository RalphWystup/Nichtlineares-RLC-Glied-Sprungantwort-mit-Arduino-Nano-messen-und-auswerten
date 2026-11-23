"""rlc_bauen_laden_2.7.py -- läuft auf dem Laptop (23.11.2026; Argument „compile“ = nur übersetzen, nicht laden): übersetzt rlc_sprung_2_7.ino (portables arduino-cli) und lädt es auf den Nano an
COM5 (alter Bootloader, wie bei 1.0 festgestellt: arduino:avr:nano:cpu=atmega328old). Ersetzt rlc_sprung_2_6 auf dem Nano. Danach Kennung."""
import os, sys, shutil, subprocess, time
sys.stdout.reconfigure(errors="replace")
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "arduino");   # arduino-cli portabel neben diesem Skript (arduino_cli_laden_1.2.py) exe = os.path.join(A, "arduino-cli.exe"); cfg = os.path.join(A, "arduino-cli.yaml"); PORT = "COM5"
sk = os.path.join(A, "sketche", "rlc_sprung_2_7"); os.makedirs(sk, exist_ok=True)
ziel = os.path.join(sk, "rlc_sprung_2_7.ino")
if not os.path.exists(ziel): shutil.copyfile(os.path.join(os.path.dirname(os.path.abspath(__file__)), "rlc_sprung_2_7.ino"), ziel)
FQ = "arduino:avr:nano:cpu=atmega328old"
def cli(*a):
    r = subprocess.run([exe, "--config-file", cfg, *a], capture_output=True, text=True, timeout=600, creationflags=0x08000000)
    print(">", " ".join(a), "->", r.returncode); print((r.stdout + r.stderr).strip()[-1500:]); return r.returncode
nur = len(sys.argv) > 1 and sys.argv[1] == "compile"
if cli("compile", "--warnings", "default", "--fqbn", FQ, sk) == 0 and not nur and cli("upload", "-p", PORT, "--fqbn", FQ, sk) == 0:
    import serial
    with serial.Serial(PORT, 1000000, timeout=3) as s:
        time.sleep(2.5); print("Meldung:", s.read_all().decode(errors="replace").strip())
        s.write(b"?\n"); time.sleep(0.5); print("Kennung:", s.read_all().decode(errors="replace").strip())
