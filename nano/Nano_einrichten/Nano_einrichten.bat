@echo off
rem ===========================================================================================================
rem  RLC-Sprungantwort mit dem Arduino Nano  --  Nano einrichten: USB-Treiber CH340 und Firmware rlc_sprung_2_7  (Nano_einrichten.bat, Fassung 1.0)
rem  Autor: Prof. Dr.-Ing. Ralph Wystup M.Sc.  -  erstellt mit KI und Agent (Claude Code, Anthropic)  -  Fassung 1.0 vom 24.11.2026
rem  Sein Wort: "ja nano-einrichten bat erzeugen" -- Anlass: bei der Uebergabe der Hardware fehlte der Treiber fuer den Nano.
rem -----------------------------------------------------------------------------------------------------------
rem  Ablauf: 1. CH340-Treiber (aus pakete\CH341SER.ZIP, sonst vom Hersteller; Windows fragt einmal nach Administratorrechten)
rem          2. avrdude (aus pakete\avrdude.zip, sonst von arduino.cc)   3. Nano am USB suchen   4. rlc_sprung_2_7.hex aufspielen
rem          (zuerst 57600 Baud = alter Bootloader der meisten Nano-Nachbauten, sonst 115200 Baud = neuer Bootloader)
rem  Keine Klammerbloecke (eine Klammer im Text liess cmd am 24.11. eine andere Batch abbrechen); das Fenster bleibt bei jedem Fehler offen.
rem ===========================================================================================================
if "%~1"=="innen" goto innen
cmd /c ""%~f0" innen"
echo.
echo ---------------------------------------------------------------------------
echo  Fenster schliessen mit einer beliebigen Taste.
pause >nul
exit /b

:innen
setlocal
title Nano einrichten
set "HIER=%~dp0"
set "PAK=%HIER%pakete"
set "HEX=%HIER%rlc_sprung_2_7.hex"
set "TD=%TEMP%\nano_einrichten"
set "AVR=%PAK%\avrdude\bin\avrdude.exe"
set "CONF=%PAK%\avrdude\etc\avrdude.conf"
if not exist "%TD%" mkdir "%TD%"
if not exist "%PAK%" mkdir "%PAK%"
echo.
echo  RLC-Sprungantwort: Arduino Nano einrichten -- Treiber CH340 und Firmware rlc_sprung_2_7
echo.
if not exist "%HEX%" echo  FEHLER: rlc_sprung_2_7.hex fehlt neben dieser Batch-Datei.
if not exist "%HEX%" goto ende

echo --- 1. USB-Treiber CH340 ---
pnputil /enum-drivers > "%TD%\treiber.txt" 2>&1
findstr /i /c:"ch341ser.inf" "%TD%\treiber.txt" >nul
if errorlevel 1 goto treiber_holen
echo  CH340-Treiber ist schon da -- nichts zu tun.
goto avrdude

:treiber_holen
if exist "%PAK%\CH341SER.ZIP" goto treiber_entpacken
echo  CH341SER.ZIP fehlt im Ordner pakete -- wird beim Hersteller WCH geladen ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; try { Invoke-WebRequest -Uri 'https://www.wch-ic.com/download/file?id=5' -OutFile '%PAK%\CH341SER.ZIP' } catch { exit 2 }"
if exist "%PAK%\CH341SER.ZIP" goto treiber_entpacken
echo  HINWEIS: Treiber nicht zu bekommen. Nur noetig, wenn Windows den Nano nicht als COM-Anschluss zeigt.
goto avrdude

:treiber_entpacken
powershell -NoProfile -Command "Expand-Archive -Force '%PAK%\CH341SER.ZIP' '%TD%\CH340'"
set "INF="
for /f "delims=" %%i in ('dir /s /b "%TD%\CH340\ch341ser.inf" 2^>nul') do if not defined INF set "INF=%%i"
if defined INF goto treiber_installieren
echo  FEHLER: ch341ser.inf nicht im ZIP gefunden.
goto avrdude

:treiber_installieren
echo  Treiber wird installiert -- Windows fragt nach Administratorrechten, bitte mit Ja beantworten.
powershell -NoProfile -Command "Start-Process -FilePath pnputil -ArgumentList '/add-driver','\"%INF%\"','/install' -Verb RunAs -Wait"
pnputil /enum-drivers > "%TD%\treiber.txt" 2>&1
findstr /i /c:"ch341ser.inf" "%TD%\treiber.txt" >nul
if errorlevel 1 echo  FEHLER: Treiber danach nicht im Treiberspeicher -- Administratorfrage mit Nein beantwortet?
if not errorlevel 1 echo  CH340-Treiber installiert.

:avrdude
echo.
echo --- 2. avrdude, das Programmierwerkzeug ---
if exist "%AVR%" goto avr_da
if exist "%PAK%\avrdude.zip" goto avr_entpacken
echo  avrdude.zip fehlt im Ordner pakete -- wird von arduino.cc geladen ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; try { Invoke-WebRequest -Uri 'https://downloads.arduino.cc/tools/avrdude-6.3.0-arduino17-i686-w64-mingw32.zip' -OutFile '%PAK%\avrdude.zip' } catch { exit 2 }"
if exist "%PAK%\avrdude.zip" goto avr_entpacken
echo  FEHLER: avrdude nicht zu bekommen -- Internetverbindung pruefen oder pakete\avrdude.zip mitbringen.
goto ende

:avr_entpacken
powershell -NoProfile -Command "Expand-Archive -Force '%PAK%\avrdude.zip' '%PAK%'"
if exist "%AVR%" goto avr_da
echo  FEHLER: avrdude.exe fehlt nach dem Entpacken.
goto ende

:avr_da
echo  avrdude: "%AVR%"

echo.
echo --- 3. Nano am USB suchen ---
set "PORT="
set "ANZAHL=0"
for /f "usebackq delims=" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%HIER%nano_port.ps1"`) do call :port_merken %%p
if defined PORT goto aufspielen
echo  Kein Nano gefunden: kein USB-Seriell-Anschluss mit CH340, CP210x oder FTDI.
echo  Pruefen: USB-DATENkabel (manche Kabel laden nur), anderer USB-Anschluss, Geraete-Manager unter "Anschluesse (COM und LPT)".
goto ende

:port_merken
set /a ANZAHL+=1
if not defined PORT set "PORT=%~1"
echo  gefunden: %~1
goto :eof

:aufspielen
if %ANZAHL% GTR 1 echo  HINWEIS: mehrere Anschluesse -- es wird der erste genommen: %PORT%. Sonst nur den Nano anstecken.
echo.
echo --- 4. Firmware rlc_sprung_2_7 auf %PORT% aufspielen ---
"%AVR%" -C "%CONF%" -q -p atmega328p -c arduino -P %PORT% -b 57600 -D -U flash:w:"%HEX%":i
if not errorlevel 1 goto fertig
echo.
echo  Mit 57600 Baud nicht gelungen -- zweiter Versuch mit 115200 Baud, neuer Bootloader ...
"%AVR%" -C "%CONF%" -q -p atmega328p -c arduino -P %PORT% -b 115200 -D -U flash:w:"%HEX%":i
if not errorlevel 1 goto fertig
echo.
echo  FEHLER: Firmware nicht aufgespielt. Anschluss %PORT% frei, also kein Arduino-Programm und keine Seite mit dem Nano offen?
echo  Dann Kabel abziehen, 5 Sekunden warten, anstecken und diese Batch noch einmal starten.
goto ende

:fertig
echo.
echo  FERTIG: rlc_sprung_2_7 ist auf dem Nano an %PORT%.
echo  Jetzt RLC_Sprung_2.26.html im Browser oeffnen, "Nano verbinden" druecken und %PORT% waehlen.

:ende
endlocal
exit /b
