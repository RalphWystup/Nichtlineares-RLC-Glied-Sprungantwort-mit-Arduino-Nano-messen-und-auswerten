# nano_port.ps1 (24.11.2026) -- gibt je Zeile einen COM-Anschluss aus, hinter dem ein USB-Seriell-Wandler haengt (CH340, CP210x, FTDI).
# Wird von Nano_einrichten.bat aufgerufen; liest nur die Geraeteliste von Windows.
# Autor: Prof. Dr.-Ing. Ralph Wystup M.Sc. - erstellt mit KI und Agent (Claude Code, Anthropic)
$g = Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match '\(COM\d+\)' }
foreach ($e in $g) {
    $n = [string]$e.Name; $id = [string]$e.PNPDeviceID
    if ($n -match 'CH340|CH341|CP210|FTDI|USB-SERIAL|USB Serial|Arduino' -or $id -match 'VID_1A86|VID_10C4|VID_0403|VID_2341') {
        if ($n -match '\((COM\d+)\)') { Write-Output $matches[1] }
    }
}
