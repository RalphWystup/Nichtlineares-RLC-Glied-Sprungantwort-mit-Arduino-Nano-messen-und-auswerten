"""formeln_klammern_1.0.py (23.11.2026) -- erzeugt rlc_sprung_vorlage_2.24.html aus 2.23: setzt die MathML-Klammern richtig.
Befund (sein Wort: „die gleichung fehlen die klamern“; Bild aller zwölf Formeln im kopflosen Chromium): Klammern um Funktionsargumente
wie L(i), u_E(t), C(u_C) sind dehnbare <mo> in derselben <mrow> wie Brüche und werden auf Bruchhöhe gedehnt; bei (Ih)_n und (Dr)_n
steht die schließende Klammer im Index (öffnende riesig, schließende winzig); sin ω_d t und cos ω_d t haben keine Argumentklammern.
Regeln: (1) jede Klammer ( ) [ ] | wird stretchy="false", außer das Paar umschließt unmittelbar einen Bruch (<mfrac>) -- dann bleibt sie
dehnbar (auch wenn der Bruch in einer inneren Klammer steht) und steht mit ihrem Inhalt in einer eigenen <mrow>; (2) (Ih)_n, (Dr)_n als <msub><mrow>(…)</mrow>n</msub>; (3) sin(…), cos(…),
tanh(…) mit Klammern. Der Text der Seite wird sonst nicht angefasst; Versionsnummer 2.23 -> 2.24 in Titel, Kopf, Protokoll und Bildunterschrift.
Aufruf: python3 formeln_klammern_1.0.py   (schreibt rlc_sprung_vorlage_2.24.html, überschreibt nichts Bestehendes)
Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) — gemeinsam erstellt."""
import re, os, sys
H = os.path.dirname(os.path.abspath(__file__))
Q = os.path.join(H, "rlc_sprung_vorlage_2.23.html"); Z = os.path.join(H, "rlc_sprung_vorlage_2.24.html")
if os.path.exists(Z): sys.exit("Ziel besteht schon, nichts überschrieben: " + Z)
s = open(Q, encoding="utf-8").read()
F = 'stretchy="false"'
OPEN = {"(": ")", "[": "]"}

def paare(m):
    """Klammerpaare in einem <math>-Block: Liste (i_auf, j_zu, zeichen) über die Token-Positionen der <mo>."""
    toks = [(t.start(), t.end(), t.group(1)) for t in re.finditer(r'<mo>([()\[\]|])</mo>', m)]
    st, out = [], []
    for a, b, z in toks:
        if z in OPEN: st.append((a, b, z))
        elif z == "|":
            if st and st[-1][2] == "|": a0, b0, _ = st.pop(); out.append((a0, b0, a, b, "|"))
            else: st.append((a, b, z))
        else:
            if st and OPEN.get(st[-1][2]) == z: a0, b0, _ = st.pop(); out.append((a0, b0, a, b, z))
            else: raise SystemExit("unpaarige Klammer in: " + m[:120])
    if st: raise SystemExit("offene Klammer in: " + m[:120])
    return out

def klammern(m):
    """Ein <math>-Block: Klammern setzen."""
    # (2) (Ih)_n und (Dr)_n
    for x in ("<mi>I</mi><mi>h</mi>", "<mi>D</mi><mi>r</mi>"):
        alt = f"<mo>(</mo>{x}<msub><mo>)</mo><mi>n</mi></msub>"
        neu = f"<msub><mrow><mo {F}>(</mo>{x}<mo {F}>)</mo></mrow><mi>n</mi></msub>"
        if alt in m: m = m.replace(alt, neu)
    # (3) sin/cos ω_d t -> sin(ω_d t)
    wd = "<msub><mi>ω</mi><mi>d</mi></msub><mi>t</mi>"
    for fkt in ("sin", "cos"):
        alt = f"<mi>{fkt}</mi><mo>⁡</mo>{wd}"
        m = m.replace(alt, f"<mi>{fkt}</mi><mo>⁡</mo><mo {F}>(</mo>{wd}<mo {F}>)</mo>")
    # tanh i/I_s -> tanh(i/I_s) mit dehnbarer Klammer um den Bruch
    alt = "<mi>tanh</mi><mo>⁡</mo><mfrac><mi>i</mi><msub><mi>I</mi><mi>s</mi></msub></mfrac>"
    m = m.replace(alt, "<mi>tanh</mi><mo>⁡</mo><mo>(</mo><mfrac><mi>i</mi><msub><mi>I</mi><mi>s</mi></msub></mfrac><mo>)</mo>")
    # (1) alle übrigen Paare: nicht dehnbar, außer der Inhalt enthält einen Bruch auf oberster Ebene
    ersetz = []  # (pos, alt_len, neu)
    for a0, b0, a1, b1, z in paare(m):
        inhalt = m[b0:a1]
        # Bruch irgendwo im Inhalt (auch in einer inneren Klammer: die äußere muss dann ebenfalls mitwachsen) -> dehnbar
        if "<mfrac>" in inhalt:
            # dehnbar lassen, aber in eigener <mrow> mit dem Inhalt
            vor, nach = m[max(0, a0 - 6):a0], m[b1:b1 + 7]
            if not (vor == "<mrow>" and nach == "</mrow>"):
                ersetz.append((a0, 0, "<mrow>")); ersetz.append((b1, 0, "</mrow>"))
        else:
            ersetz.append((a0, b0 - a0, m[a0:b0].replace("<mo>", f"<mo {F}>")))
            ersetz.append((a1, b1 - a1, m[a1:b1].replace("<mo>", f"<mo {F}>")))
    for pos, ln, neu in sorted(ersetz, key=lambda e: -e[0]):
        m = m[:pos] + neu + m[pos + ln:]
    return m

n_math = 0
def ersetze(t):
    global n_math; n_math += 1
    return klammern(t.group(0))
s = re.sub(r'<math[^>]*>.*?</math>', ersetze, s, flags=re.S)
anz = s.count(F)
# Versionsnummer und Änderungsvermerk
s = s.replace("RLC_Sprung_2.23.html", "RLC_Sprung_2.24.html").replace("RLC-Sprung 2.23", "RLC-Sprung 2.24").replace("bau_rlc_seite_2.23.py", "bau_rlc_seite_2.24.py")
vermerk = ("RLC_Sprung_2.24.html (23.11.2026) -- 2.24: nur Formelsatz (sein Wort: „die gleichung fehlen die klamern“): Klammern um Funktionsargumente nicht mehr "
           "dehnbar (stretchy=\"false\"), (Ih)_n und (Dr)_n mit zusammengehörigen Klammern, sin(ω_d t), cos(ω_d t), tanh(i/I_s) mit Argumentklammern; "
           f"{anz} Klammern gesetzt (formeln_klammern_1.0.py). Rechnung, Reiter und Text unverändert gegenüber 2.23.\n")
k = s.index("RLC_Sprung_2.24.html (23.11.2026) -- 2.23:")
s = s[:k] + vermerk + s[k:].replace("RLC_Sprung_2.24.html (23.11.2026) -- 2.23:", "RLC_Sprung_2.23.html (23.11.2026) -- 2.23:", 1)
open(Z, "w", encoding="utf-8").write(s)
print("Formeln:", n_math, "Klammern nicht dehnbar:", anz, "->", Z)
