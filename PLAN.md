# PALEO HIGHWAY — plan projektu

Bijatyka side-scroll (beat 'em up z ruchem w głąb ekranu) w stylu automatów z lat 90.,
inspirowana gatunkiem gier typu *Cadillacs and Dinosaurs*. Wszystkie postacie, grafiki,
muzyka i efekty dźwiękowe są **oryginalne** – generowane proceduralnie w kodzie
(Canvas 2D + Web Audio API). Brak zewnętrznych zasobów, gra działa z `file://`.

## 1. Analiza gatunku (na podstawie longplaya)
| Element oryginału (gatunek)            | Nasza implementacja |
|----------------------------------------|---------------------|
| Przewijanie w bok + głębia (oś Y)      | świat `x`, głębia `y` (pas 150–214 px), wysokość `z` |
| Kamera blokowana falami wrogów, „GO →” | `waves` w etapie, blokada kamery do wyczyszczenia fali |
| Kombo 3–4 ciosów, ostatni przewraca    | łańcuch kombo z oknem czasowym, finisher = knockdown |
| Chwyt po wejściu we wroga, kolana/rzut | stan `grab`: atak = kolano, kierunek+atak = rzut |
| Atak specjalny kosztem HP              | atak+skok = obrót, -HP tylko gdy trafi |
| Bieg (2× kierunek) + atak z biegu      | podwójne stuknięcie = sprint, dash-attack |
| Broń z beczek (rury, karabiny)         | rura (wytrzymałość), strzelba (amunicja) |
| Jedzenie odnawia zdrowie               | mięso / owoce / klejnoty za punkty |
| Dinozaury agresywne wobec wszystkich   | raptory atakują najbliższy cel – gracza **i** kłusowników |
| Boss na końcu etapu z paskiem życia    | Kapitan Rdza: młot elektryczny, szarża, fala uderzeniowa |

## 2. Postacie grywalne (oryginalne)
| Postać | Rola | Szybkość | Siła | Finisher kombo | Specjał |
|--------|------|----------|------|----------------|---------|
| **KRUK**  | mechanik, kombinezon, chusta | ●●●○ | ●●●○ | kopnięcie z obrotu | wirujący kopniak |
| **NINA**  | strażniczka rezerwatu        | ●●●● | ●●○○ | wysokie kopnięcie  | salto kopnięcie |
| **TUR**   | były górnik, broda           | ●●○○ | ●●●● | podwójny młot pięściami | uderzenie w ziemię |

## 3. Przeciwnicy etapu 1
| Wróg | Opis | Zachowanie |
|------|------|------------|
| **SZAKAL** | szeregowy kłusownik z nożem, irokez | podchodzi z boku, pchnięcia nożem |
| **ĆWIEK**  | chudy w kapturze | szybki, doskoki z kopnięciem, ucieka |
| **GŁAZ**   | gruby osiłek | wolny, szarża brzuchem, dużo HP |
| **RAPTOR** | dinozaur | szarżuje i gryzie najbliższy cel (także wrogów) |
| **KAPITAN RDZA** (boss) | opancerzony szef kłusowników z młotem | kombo młotem, szarża, fala uderzeniowa, wzywa posiłki przy 50% HP |

## 4. Etap 1 — „Zielona Rdza”
Długość ~3400 px, 4 sekcje (wszystkie tła rysowane proceduralnie z deterministycznym RNG):
1. **Ruiny wioski** – chaty na palach, beczki (mięso, rura). Fala: 3× Szakal.
2. **Droga przez dżunglę** – zardzewiały krążownik szos, paprocie. Fale: Ćwiek + 2 raptory, potem 2 Szakale + Ćwiek.
3. **Obóz kłusowników** – namioty, klatki, skrzynie (strzelba). Fale: Głaz + 2 Szakale, potem mieszana.
4. **Kamieniołom** – arena bossa, ogrodzenie z blokadą kamery. Boss: Kapitan Rdza (+ posiłki).

Parallaksa: niebo z gradientem → wulkan z dymem (0.15) → góry (0.3) → dżungla (0.6) → teren gry (1.0) → paprocie na pierwszym planie (1.25).

## 5. Audio (Web Audio, w pełni syntetyczne)
- **Sekwencer trackerowy** (16-tki, lookahead scheduler), kanały: lead (square + vibrato),
  bas (saw + lowpass), arpeggio (triangle), pad, perkusja (kick/snare/hat z szumu i sinusa).
- Utwory: `title` (heroiczny, 120 BPM), `stage1` (dżungla, 138 BPM), `boss` (152 BPM, molowy),
  `clear` (fanfara), `gameover`.
- Sample SFX (~22): cios, trafienie, mocne trafienie, świst, skok, lądowanie, chwyt, rzut,
  rozbita beczka, podniesienie, jedzenie, strzał, pusty magazynek, skrzek raptora, ryk,
  okrzyk gracza, okrzyk wroga, KO, uderzenie młota, elektryczność, „GO”, menu.
- `export.html` renderuje wszystkie sample i utwory przez `OfflineAudioContext` do WAV
  (ten sam kod co w grze – jedno źródło prawdy); `tools/export-audio.js` zapisuje je do `assets/audio/`.

## 6. Architektura
```
index.html        – canvas, ładowanie skryptów
js/audio.js       – silnik audio: SFX + sekwencer + utwory
js/sprites.js     – szkieletowy renderer postaci, pozy, palety, raptor, rekwizyty, efekty
js/stage1.js      – dane etapu: tła, fale, obiekty
js/game.js        – pętla gry, wejście, encje, walka, AI, HUD, stany ekranów
export.html       – eksport audio do WAV
```
Rozdzielczość logiczna 384×224 (jak automaty CPS), skalowana całkowitoliczbowo,
tekst HUD renderowany w wysokiej rozdzielczości na warstwie wyświetlania.

## 7. Sterowanie
| Akcja | Klawisze | Pad |
|-------|----------|-----|
| Ruch | strzałki / WASD | lewa gałka / D-pad |
| Atak | J / Z | A |
| Skok | K / X | B |
| Specjał | L / C (lub atak+skok) | X |
| Start / pauza | Enter / P | Start |
| Wycisz | M | – |

## 8. Etapy 2–6 (zrealizowane)
Szczegóły w README.md. Każdy etap to plik `js/stages/stageN.js` zbudowany fabryką `Scenery.makeStage`
(warstwy: far / mid / near / front + animacje i nakładki pogodowe), z własnym utworem i bossem.

## 9. Kolejne kroki
- Co-op 2 graczy, etap bonusowy z jazdą samochodem, tabela wyników z inicjałami,
  wybór poziomu trudności, broń do rzucania dla gracza (dynamit).
