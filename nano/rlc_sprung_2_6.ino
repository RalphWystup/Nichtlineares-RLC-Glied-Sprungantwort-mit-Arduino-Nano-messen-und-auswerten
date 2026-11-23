/* rlc_sprung_2_6.ino -- Fassung 2.6 (22.11.2026; 2.6: TMAX = 140 statt 150 -- der Überschwingfaktor ist NICHT konstant, er steigt mit der
 * Anregung (gemessen T 128/140/150: 1,541/1,599/1,623; bei T = 150 Scheitel 4,77 V, nur 0,23 V unter 5 V). Bei T = 140: Scheitel 4,39 V.
 * Datenblatt ATmega328P 7810D §28.1: Spannung an jedem Pin −0,5 V … VCC + 0,5 V, Injektionsstrom bei VCC = 5 V ±1 mA; §28.9: Vin GND … VREF. 2.5: U_C darf 0..5 V nie verlassen (sein Wort: „die sprungantwort sollte nicht höher als 5 Volt
 * sein wegen der ad wandler … das muss sichergestellt sein!“, „darf bei keiner anregung negativ sein, da das board keine schutzschaltung hat“):
 * (a) T <= TMAX = 150 hart, keine Ausnahme (Überschwingfaktor gemessen 1,546 bei T = 128 -> 2,94 V · 1,546 = 4,55 V);
 * (b) nach der Messung RAMPE abwärts über R ms statt Sprung auf 0 (der Sprung auf 0 ließe U_C gerechnet um 0,546·Endwert unterschwingen,
 *     bei 2,5 V also −1,4 V; der ADC sieht das nicht). Ein Wächter im Nano wurde gerechnet und verworfen: bei fließendem Drosselstrom treibt
 *     U_E = U_C den Kondensator noch bis ~1,8 V weiter (τ = L/R ≈ 36 ms), U_E = 0 lässt den Kreis negativ schwingen.
 * Befehl "M T N V F B P R" (R Vorgabe 2000 ms); "ENDE dauer_us verloren". 2.4: engere Bänder High ab 921 (4,5 V), Low bis 102 (0,5 V) --
 * in 2.3 kamen Flankentreffer bis 3,86 V in U_H; Spannungsabfall am Port bei den hier fließenden < 8 mA bleibt weit innerhalb. 2.3: Bänder statt Schwelle -- High ab 768 (3,75 V), Low bis 255 (1,25 V), dazwischen
 * = Flankentreffer, gezählt (nF) und nicht verwendet (2.2 maß U_H bis 2,98 V und U_L bis 1,42 V durch Flankentreffer); Schutz von A0: T > 160
 * nur mit Befehl "MX" (Überschwingen ~1,54 × Endwert -> bei T > ~165 über 5 V an A0, Eingangsschutzdiode leitet; so geschehen mit T = 255 in 2.2);
 * Zeile „k s0 sH nH sL nL nF“. 2.2: A1 getrennt nach High-/Low-Abtastungen summiert (Schwelle 512), damit der
 * MITTELWERT der Anregung U_E = d·U_H + (1-d)·U_L mit den Pegeln unter Last (Innenwiderstand des Ports) gerechnet werden kann, nicht das
 * PWM-Signal selbst (sein Wort: „vom Sprung der Mittelwert … nicht das pwm signal, das ist sonst unleserlich“, „Innenwiderstand der Ports“);
 * Zeile „k s0 sH nH sL nL“; 1000000 Bd. 2.1: 2.1: Tastgrad 0 trennt den Pin vom Timer -> dauernd LOW, auch im schnellen Modus;
 * in 2.0 gab das Register = 0 im schnellen Modus einen Nadelimpuls 1/256, gemessen U_C vor dem Sprung 11 mV), sein Wort: „exakter wie bisher, also PWM Frequenz erhöhen und abtastung anpassen, so dass
 * möglichst eine saubere messung erfolgt; zudem die Sprunganregung auch erfassen, geht auch auf einen AD kanal“; „die bisherige PWM Frequenz zu grob“.
 * - PWM an Pin 11 (Timer2), Frequenz wählbar F: 1 = 980,4 Hz (phasenrichtig /32, wie 1.0 und Simulink), 2 = 3921,6 Hz (phasenr. /8),
 *   3 = 31372,5 Hz (phasenr. /1, Vorgabe), 4 = 7812,5 Hz (schnell /8), 5 = 62500 Hz (schnell /1).
 *   Mittelwert: phasenrichtig T/255, schnell (T+1)/256 (T = 0 -> dauernd 0, T = 255 -> dauernd 1).
 * - ADC hardwaregetaktet: Timer1 CTC 125 µs löst jede Wandlung aus (Compare Match B), Vorteiler 128 (104 µs, volle Genauigkeit),
 *   abwechselnd A0 (U_C) und A1 (Anregung, Pin 11 direkt). Je Ausgabewert B Wandlungen je Kanal aufsummiert -> Takt B·250 µs (B = 4: 1 ms).
 * - Ablauf "M T N V F B P": PWM 0, V ms entladen, P Werte vor dem Sprung, Sprung (OCR2A wird zu Beginn von Wert 0 gesetzt), N Werte danach.
 *   Ausgabe sofort (500000 Bd): "START …", Zeilen "k s0 sH nH sL nL" (2.2) (k = -P … N-1; Wert k = Summe über [k, k+1)·Takt), "ENDE dauer_us verloren".
 * Autoren: Prof. Dr.-Ing. Ralph Wystup M.Sc. und Claude (Anthropic, Claude Code) -- gemeinsam erstellt. */
#define KANAL_E 1
const uint8_t RN = 64;
volatile uint16_t r0[RN], rH[RN], rL[RN];
volatile uint8_t rnH[RN], rnL[RN], rnF[RN];
volatile uint8_t kopf = 0, fuss = 0;
volatile uint16_t verloren = 0;
volatile uint16_t s0 = 0, sH = 0, sL = 0;
volatile uint8_t nH = 0, nL = 0, nF = 0;
volatile uint8_t zaehl = 0, kanal = 0, B = 4, tast = 0;
volatile long k = 0, kEnde = 0, kSprung = 0;
volatile bool laeuft = false;
const uint8_t TMAX = 140;

static inline void pwmSetzen(uint8_t t) {     // 2.1: 0 -> Pin vom Timer getrennt (LOW), sonst PWM
  if (t == 0) { TCCR2A &= ~(1 << COM2A1); PORTB &= ~(1 << PB3); } else { OCR2A = t; TCCR2A |= (1 << COM2A1); }
}

ISR(ADC_vect) {
  uint16_t v = ADC;
  TIFR1 = (1 << OCF1B);                                   // Auslöser wieder scharf machen
  if (kanal == 0) s0 += v; else if (v >= 921) { sH += v; nH++; } else if (v <= 102) { sL += v; nL++; } else nF++;
  kanal ^= 1; ADMUX = (1 << REFS0) | (kanal ? KANAL_E : 0);
  if (++zaehl < 2 * B) return;
  zaehl = 0;
  uint8_t n = (kopf + 1) % RN;
  if (n == fuss) verloren++; else { r0[kopf] = s0; rH[kopf] = sH; rnH[kopf] = nH; rL[kopf] = sL; rnL[kopf] = nL; rnF[kopf] = nF; kopf = n; }
  s0 = 0; sH = 0; sL = 0; nH = 0; nL = 0; nF = 0; k++;
  if (k == kSprung) pwmSetzen(tast);                          // Sprung zu Beginn von Wert 0
  if (k >= kEnde) { ADCSRA &= ~((1 << ADATE) | (1 << ADIE)); laeuft = false; }
}

void pwmModus(uint8_t F) {
  uint8_t wgm = (F >= 4) ? 0b11 : 0b01, cs = (F == 1) ? 0b011 : (F == 2 || F == 4) ? 0b010 : 0b001;
  TCCR2A = (TCCR2A & 0b11111100) | wgm;
  TCCR2B = (TCCR2B & 0b11111000) | cs;
}

void setup() {
  pinMode(11, OUTPUT); digitalWrite(11, LOW);
  pwmSetzen(0); pwmModus(3);
  TCCR1A = 0; TCCR1B = (1 << WGM12) | (1 << CS10); OCR1A = 1999; OCR1B = 1000; TIMSK1 = 0;   // 125 µs
  ADMUX = (1 << REFS0); ADCSRB = (1 << ADTS2) | (1 << ADTS0);                              // Auslöser Timer1 Compare B
  ADCSRA = (1 << ADEN) | 0b111;
  Serial.begin(1000000);
  Serial.println(F("RLC_SPRUNG 2.6 bereit"));
}

const char* FNAME[] = {"", "980.4Hz phasenr.", "3921.6Hz phasenr.", "31372.5Hz phasenr.", "7812.5Hz schnell", "62500Hz schnell"};

void loop() {
  if (!Serial.available()) return;
  String z = Serial.readStringUntil('\n'); z.trim();
  if (z == "?") { Serial.println(F("RLC_SPRUNG 2.6 Pin11 PWM F1..5, A0=U_C, A1=Anregung, ADC 125us Timer1, 1000000Bd")); return; }
  if (!z.startsWith("M")) { Serial.println(F("FEHLER unbekannter Befehl")); return; }
  long T = 128, N = 600, V = 2000, F = 3, Bb = 4, P = 20, R = 2000;
  sscanf(z.c_str() + 1, "%ld %ld %ld %ld %ld %ld %ld", &T, &N, &V, &F, &Bb, &P, &R);
  if (T < 0 || T > 255 || N < 1 || N > 200000L || V < 0 || V > 60000L || F < 1 || F > 5 || Bb < 2 || Bb > 16 || P < 0 || P > 10000 || R < 0 || R > 60000L) {
    Serial.println(F("FEHLER Bereich: T 0..140, N 1..200000, V 0..60000, F 1..5, B 2..16, P 0..10000, R 0..60000")); return; }
  if (T > TMAX) { Serial.println(F("FEHLER T > 140 gesperrt: Ueberschwingfaktor steigt mit der Anregung (1,62 bei T=150, Scheitel 4,77 V); A0 vertraegt nur 0..5 V")); return; }
  pwmSetzen(0); pwmModus(F); delay(V);
  Serial.print(F("START T=")); Serial.print(T); Serial.print(F(" N=")); Serial.print(N); Serial.print(F(" F=")); Serial.print(FNAME[F]);
  Serial.print(F(" B=")); Serial.print(Bb); Serial.print(F(" Takt_us=")); Serial.print(Bb * 250); Serial.print(F(" P=")); Serial.print(P); Serial.print(F(" R=")); Serial.println(R);
  noInterrupts();
  tast = T; B = Bb; kopf = fuss = 0; verloren = 0; s0 = sH = sL = 0; nH = nL = nF = 0; zaehl = 0; kanal = 0; k = -P; kSprung = 0; kEnde = N;
  ADMUX = (1 << REFS0);
  if (P == 0) pwmSetzen(tast);
  TCNT1 = 0; TIFR1 = (1 << OCF1B); laeuft = true;
  ADCSRA = (1 << ADEN) | (1 << ADATE) | (1 << ADIE) | (1 << ADIF) | 0b111;
  interrupts();
  unsigned long t0 = micros(); long kk = -P;
  while (laeuft || fuss != kopf) {
    if (fuss == kopf) continue;
    uint16_t a = r0[fuss], h = rH[fuss], l = rL[fuss]; uint8_t nh = rnH[fuss], nl = rnL[fuss], nf = rnF[fuss]; fuss = (fuss + 1) % RN;
    Serial.print(kk++); Serial.print(' '); Serial.print(a); Serial.print(' '); Serial.print(h); Serial.print(' '); Serial.print(nh);
    Serial.print(' '); Serial.print(l); Serial.print(' '); Serial.print(nl); Serial.print(' '); Serial.println(nf);
  }
  unsigned long dt = micros() - t0;
  uint8_t jetzt = (TCCR2A & (1 << COM2A1)) ? OCR2A : 0;     // 2.5: Rampe abwärts statt Sprung auf 0
  for (int d = jetzt - 1; d >= 0; d--) { pwmSetzen(d); delay(R / (jetzt > 0 ? jetzt : 1)); }
  pwmSetzen(0);
  Serial.print(F("ENDE ")); Serial.print(dt); Serial.print(' '); Serial.println(verloren);
}
