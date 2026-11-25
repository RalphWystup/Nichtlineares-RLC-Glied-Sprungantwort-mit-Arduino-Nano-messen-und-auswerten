# Arduino Nano einrichten – RLC-Sprungantwort

Prof. Dr.-Ing. Ralph Wystup M.Sc. · erstellt mit KI und Agent (Claude Code, Anthropic) · Fassung 1.0 vom 24.11.2026

Dieser Ordner bringt einen fabrikfrischen Arduino Nano (Nachbau mit CH340-Wandler) in einem Schritt auf die
Firmware `rlc_sprung_2_7`, mit der die Seite `RLC_Sprung_2.26.html` misst. Anlass: Bei der Übergabe der Hardware
fehlte auf dem Zielrechner der USB-Treiber, und ohne ihn erscheint der Nano gar nicht als Anschluss.

## So geht es

1. Ordner `Nano_einrichten` auf den eigenen Rechner kopieren.
2. Den Nano mit einem USB-**Daten**kabel anstecken (manche Kabel laden nur).
3. **`Nano_einrichten.bat`** doppelklicken. Sie macht der Reihe nach:
   - USB-Treiber CH340 installieren, falls er fehlt (Windows fragt einmal nach Administratorrechten – mit Ja beantworten);
   - das Programmierwerkzeug `avrdude` entpacken;
   - den Nano am USB suchen (CH340, CP210x oder FTDI);
   - die Firmware `rlc_sprung_2_7.hex` aufspielen, zuerst mit 57600 Baud (alter Bootloader der meisten Nachbauten), sonst mit 115200 Baud.
4. Am Ende steht **FERTIG** mit dem Anschluss (z. B. `COM5`). Das Fenster bleibt offen, bis eine Taste gedrückt wird – auch bei Fehlern,
   damit die Meldung lesbar bleibt.
5. Dann `RLC_Sprung_2.26.html` im Browser (Chrome oder Edge) öffnen, „Nano verbinden“ drücken und den Anschluss wählen.

## Ohne Internet

Liegen `pakete\CH341SER.ZIP` und `pakete\avrdude.zip` im Ordner, braucht die Batch kein Internet. Fehlen sie, lädt sie den
Treiber beim Hersteller WCH (`https://www.wch-ic.com/download/file?id=5`) und `avrdude` bei arduino.cc
(`https://downloads.arduino.cc/tools/avrdude-6.3.0-arduino17-i686-w64-mingw32.zip`, SHA-256 beginnt mit `e9918887`).

## Was im Ordner liegt

| Datei | Inhalt |
|:--|:--|
| `Nano_einrichten.bat` | die eine Batch-Datei (Treiber, avrdude, Nano suchen, Firmware aufspielen) |
| `nano_port.ps1` | sucht den COM-Anschluss des USB-Seriell-Wandlers (nur lesend) |
| `rlc_sprung_2_7.hex` | Firmware, mit arduino-cli 1.x und Kern arduino:avr 1.8.8 aus `nano/rlc_sprung_2_7.ino` gebaut (8658 Byte Programm) |
| `pakete\CH341SER.ZIP` | CH340-Treiber des Herstellers WCH (nicht im Repositorium, siehe oben) |
| `pakete\avrdude.zip` | avrdude 6.3.0-arduino17 für Windows (nicht im Repositorium, siehe oben) |

## Wenn etwas nicht geht

- „Kein Nano gefunden“: Datenkabel, anderer USB-Anschluss; im Geräte-Manager unter „Anschlüsse (COM und LPT)“ nachsehen.
  Steht dort ein Gerät mit gelbem Ausrufezeichen, fehlt der Treiber – Batch noch einmal starten und die Administratorfrage mit Ja beantworten.
- „Firmware nicht aufgespielt“: Keine Seite und kein Arduino-Programm darf den Anschluss offen halten. Kabel abziehen, 5 Sekunden warten, erneut.
- Mehrere Anschlüsse: Die Batch nimmt den ersten. Sicherer ist, nur den Nano anzustecken.
