# PALEO HIGHWAY — Rdza i Kły: instrukcja gry

Bijatyka side-scroll w stylu automatów z lat 90. (gatunek *Cadillacs and Dinosaurs*), z w pełni
**oryginalnymi** postaciami, grafiką, muzyką i dźwiękami. Wszystko jest generowane kodem
(Canvas 2D + Web Audio), bez zewnętrznych zasobów. 8 etapów (z rozwidleniem trasy), 3 etapy bonusowe, epilog i dwa zakończenia.

## Uruchomienie
**Najprościej:** otwórz `index.html` w przeglądarce (działa bezpośrednio z dysku, `file://`).
Pierwszy klawisz włącza dźwięk (wymóg przeglądarek).
Start od wybranego etapu: `index.html?stage=4` (1–8, kolejno: 1, 2, 3A, 3B, 4, 5, 6, 7).

**Jako aplikacja (offline, ikona na pulpicie/telefonie):** uruchom `uruchom-serwer.bat` (albo `node tools/serve.mjs`)
i otwórz `http://localhost:8080`. Po pierwszym wczytaniu gra działa też bez internetu. W menu głównym pojawi się
**ZAINSTALUJ APLIKACJĘ** (albo użyj ikony instalacji w pasku adresu Chrome/Edge). Na telefonie grę trzeba
udostępnić przez https (np. dowolny hosting plików statycznych) — wtedy „Dodaj do ekranu głównego”.
Tryb offline/instalacja nie działają przy otwieraniu pliku z dysku (ograniczenie przeglądarek dla service workerów).

**Zapis postępu:** po każdym ukończonym etapie, bonusie i wyborze trasy gra zapisuje drużynę, wynik, życia i trasę.
Na ekranie tytułowym pojawia się **KONTYNUUJ** z opisem zapisu (etap, postacie, punkty, data). Zapis znika po przegranej
(koniec kontynuacji) i po ukończeniu gry. Wyjście z gry przez pauzę zostawia ostatni zapis.

**Tryb debug / wybór etapu:** ustaw `debug: true` w pliku `config.js` i odśwież stronę. Po wyborze
postaci pojawi się ekran **WYBÓR ETAPU**: ▲/▼ wybór, Enter/atak start, skok/Esc powrót.

### Menu główne
**JAK GRAĆ** — wbudowany poradnik: 10 rozdziałów (podstawy, walka, chwyty i rzuty, obrona, specjały i furia, broń,
dinozaury i pojazdy, etapy, gra we dwóch, tryby i rady), 27 stron z animowanymi pokazami. ▲▼ rozdział, ◄► / Enter
strona, Esc powrót; klawisze w tekście są brane z Twoich ustawień, przy padzie pokazują się ikony przycisków.
Ostatnia strona prowadzi prosto do treningu.

**START GRY**, **JAK GRAĆ**, **TRENING**, **WYZWANIA**, **BOSS RUSH**, **PRZETRWANIE**, **EKSTRA**, **OPCJE**, **NAJLEPSZE WYNIKI**
(▲▼ wybór, Enter/atak zatwierdza).

**Wyzwania:** krótkie zadania z gwiazdkami za czas (rekordy zapisują się w przeglądarce, przegrana = 0 gwiazdek):
| Wyzwanie | Zadanie | Limit | ★★★ / ★★ |
|---|---|---|---|
| Rzutowiec | pokonaj 10 wrogów rzutami (chwyt, rzut w locie, suplex, wróg rzucony w innych) | 4:00 | 1:30 / 2:30 |
| Cyrk | 12 podbić wrogów w powietrzu (▲ + ATAK wybija) | 2:00 | 1:00 / 1:30 |
| Mistrz kombo | seria 25 trafień | 2:00 | 0:45 / 1:20 |
| Nietykalny | 3 pierwsze fale Zielonej Rdzy bez żadnych obrażeń | 4:00 | 1:10 / 1:50 |
| Sucha stopa | całe Kanały Otchłani bez dotknięcia ścieków (kałuże i fala) | 10:00 | 4:00 / 5:30 |
| Poskromiciel | pokonaj Zębacza | 1:00 | 0:35 / 0:48 |
| Król śmieci | pokonaj Padliniarza | 1:15 | 0:45 / 1:00 |
Po wyniku: ENTER — powtórz, ESC — lista. Wszystkie 3★ = osiągnięcie „Mistrz wyzwań”.

**Codzienne wyzwanie** (pierwsza pozycja w WYZWANIACH): etap, pogoda i układ wrogów losowane z dzisiejszej daty —
każdy, kto gra danego dnia, dostaje ten sam zestaw. Bez kontynuacji; wynik trafia do osobnej tabeli
„CODZIENNE dd.mm.rrrr” (w NAJLEPSZYCH WYNIKACH przełączasz ◄ ►). Tabela jest lokalna — gra nie ma serwera,
więc porównujcie wyniki ze znajomymi np. przez kartę z wynikiem (▲ — udostępnij).

**Nowe postacie do odblokowania:** pokonaj bossa bez utraty życia na jego etapie (także w Boss Rush):
- **Padliniarz** (za Padliniarza) — powolny, wytrzymały i mocny, z kotwicą; specjał: młyn kotwicą, ↓↘→+ATAK: rzut kotwicą, super: Kotwica Zagłady.
- **Żmija** (za Żmiję) — najszybsza, krucha, z biczem o dużym zasięgu; specjał: wir bicza, ↓↘→+ATAK: wachlarz noży, super: Taniec Bicza.

**Boss Rush:** ośmiu bossów po kolei (Kapitan Rdza, Żmija, Bracia Trzask, Stary Kieł, Admirał Szpon, Padliniarz, Zębacz, Baron Bursztyn),
każdy na swojej arenie, z pełnym leczeniem między walkami. Liczy się liczba pokonanych bossów, przy remisie — łączny czas.
Bez kontynuacji.

**Przetrwanie:** niekończące się fale na arenie w kamieniołomie. Fale rosną liczebnie i dochodzą nowe typy wrogów;
co 5. fala — Biały Kieł, co 10. — prawdziwy boss. Premia za każdą falę, co 3. fala mięso. Bez kontynuacji.

**Tabele wyników:** osobne dla zwykłej gry, Boss Rush i przetrwania — w ekranie wyników przełączasz je ◄ ►.

**Ekstra:**
- **Własne etapy** — etapy z edytora i z pliku `js/stages/custom.js`; stąd też otwierasz edytor.
- **Osiągnięcia** (29, m.in. „Sprzątacz plaży” — wszystkie beczki i skrzynie na Plaży, „Szczurołap” — 10 szczurów
  w Kanałach (przebiegają po chodniku: łap je ciosem albo skokiem), „Ponad falą” — 3 fale ścieków bez zalania; m.in. „Zgrana drużyna” za atak drużynowy i „Żongler” za trzy podbicia), np. „Bez zadrapania” (etap bez obrażeń), „Dynamitowy łowca” (Stary Kieł pokonany dynamitem),
  „Czysty lakier” (autostrada bez zadrapania), „Mistrz kombo” (20 trafień), „Jeździec”, „Reakcja łańcuchowa”, „Pogromca bossów”…
  Odblokowanie pokazuje komunikat u góry ekranu; licznik widać na ekranie tytułowym.
- **Bestiariusz** — 25 wpisów (bohaterowie, kłusownicy, bestie, bossowie) z animowanym modelem, opisem i parametrami;
  wpis odblokowuje się po pierwszym spotkaniu.
- **Odtwarzacz muzyki** — 17 utworów z wizualizacją widma; utwór odblokowuje się, gdy raz zabrzmi w grze.

**Opcje** (zapisywane w przeglądarce; wartości domyślne w `config.js`, „PRZYWRÓĆ DOMYŚLNE” do nich wraca):
| Opcja | Wartości |
|---|---|
| Poziom trudności | ŁATWY (wrogowie −25% HP, −40% obrażeń) / NORMALNY / ARCADE (+25% HP, +40% obrażeń) |
| Życia | 1–5 |
| Muzyka / efekty | głośność 0–10 |
| Sterowanie dotykowe | AUTO (telefony i tablety) / WŁ. / WYŁ. |
| Wibracje pada | WŁ. / WYŁ. (domyślnie `rumble` w `config.js`) |
| Pad gracza 1 i 2 | przypisanie przycisków akcji |
| Ramka automatu | WŁ. / WYŁ. — zamiast czarnych pasów wokół ekranu: gra wypełnia całą wysokość okna, a po bokach jest obudowa z pixel-artową scenerią i listwami ramki (domyślnie `bezel` w `config.js`) |
| Filtr CRT | WYŁ. / AUTOMAT (zakrzywiony kineskop, poświata, skanlinie, winieta) / MONITOR PC (płaski, ostry ekran z pionową maską RGB jak Trinitron i delikatnymi skanliniami) / STARY TV (mocna wypukłość, rozmycie, kolorowe obwódki sygnału antenowego, szum, pas zakłóceń, migotanie); domyślnie `crt` w `config.js` (`'off'`, `'arcade'`, `'pc'`, `'tv'`) |
| Klawisze gracza 1 i 2 | wybierz akcję, Enter, naciśnij nowy klawisz (Esc anuluje; P, M i Esc są zarezerwowane) |

**Sterowanie dotykowe:** wirtualny krzyżak po lewej, przyciski ATAK / SKOK / BLOK po prawej (specjał: ATAK i SKOK naraz), START u góry
(START = pauza; w menu pauzy krzyżak + ATAK).

**Trening:** arena z dwoma manekinami (nie oddają, nie da się ich pokonać), licznik kombo,
obrażenia ostatniego ciosu, suma i liczba trafień, lista ruchów postaci. Rura, strzelba, dynamit i granaty
odnawiają się, co ~15 s pojawia się oswojony dinozaur do ćwiczenia jazdy. Wyjście: pauza → WYJDŹ DO MENU.

**Kombo:** kolejne trafienia bez przerwy dłuższej niż ~1,6 s budują serię („12 HIT!” przy panelu gracza).
Seria od 5 trafień daje premię: trafienia² × 10 pkt (maks. 20 000).

**Udostępnianie wyniku:** na ekranie wyników etapu, końca gry i zakończenia naciśnij **▲ (górę)**, aby
wygenerować kartę PNG z portretem postaci, wynikiem, oceną, statystykami, trybem i datą (w co-opie — obaj gracze).
Opcje: **POBIERZ** (plik `paleo-highway-<wynik>.png`), **KOPIUJ** (obrazek do schowka; przez `file://` część przeglądarek
blokuje schowek — wtedy uruchom grę przez `uruchom-serwer.bat`) oraz **UDOSTĘPNIJ** (systemowe menu na telefonach).

**Statystyki po etapie:** czas etapu, pokonani wrogowie, najdłuższe kombo, otrzymane obrażenia, stracone życia
i **ocena S/A/B/C/D** z premią 20 000 / 10 000 / 5 000 / 2 000 / 0 pkt (liczą się obrażenia, życia, czas i kombo).

### Sterowanie (1–2 graczy)
| Akcja | Gracz 1 | Gracz 2 | Pad |
|---|---|---|---|
| Ruch | WASD (strzałki, gdy gra jeden gracz) | strzałki | gałka / D-pad (pad 1 = 1P, pad 2 = 2P) |
| Atak | J / Z | , (przecinek) / Num 1 | A / X |
| Skok | K / X / Spacja | . (kropka) / Num 2 | B / Y |
| Specjał (kosztuje 6 HP, gdy trafi) | atak + skok naraz (J+K) | atak + skok naraz | A + B (atak + skok) |
| Blok (trzymaj) | U / V | ' (apostrof) / Num 0 | LB / LT |
| Start / dołączenie / kontynuacja | Enter | prawy Shift / Num Enter | Start |
| Pauza / wycisz | P, Esc / M | | Select (Wstecz) |
| Wstecz w menu | Esc (także K / skok) | Esc | B (zawsze, niezależnie od przypisań) |

**Wykrywanie pada:** przeglądarka udostępnia pad dopiero po naciśnięciu na nim dowolnego przycisku, gdy okno gry jest
aktywne — wtedy u góry pojawia się komunikat „PAD 1 WYKRYTY”. Pady z niestandardowym układem są ujednolicane
automatycznie (np. pad Xbox połączony przez Bluetooth, zgłaszany jako „Unknown Gamepad Vendor 045e”), a krzyżak
typu „hat” działa jak zwykły krzyżak.

**Pad:** kierunki (góra, dół, lewo, prawo) i przyciski akcji (atak, skok, specjał, start, pauza) przypiszesz osobno
dla każdego pada w **OPCJE → PAD — GRACZ 1/2**: wybierz pozycję, Enter, naciśnij przycisk albo wychyl gałkę/krzyżak
(Esc anuluje, R przywraca domyślne). Kierunek może mieć naraz przycisk (np. krzyżak D▲), oś gałki (lewa L, prawa R
lub dowolna inna oś) i krzyżak typu „hat” (tanie pady DirectInput zgłaszają go jako jedną oś — skosy działają);
nowe przypisanie zastępuje wpis tego samego rodzaju. Domyślnie: krzyżak + lewa gałka.
Wibracje przy trafieniach, otrzymanych ciosach, wybuchach i super-ruchach (przełącznik **WIBRACJE PADA**; działa w
przeglądarkach z Gamepad Haptics, np. Chrome/Edge). Gdy ostatnio użyjesz pada, podpowiedzi na ekranach pokazują
ikony przycisków (A/B/X/Y, LB/RB, START…) zamiast nazw klawiszy; naciśnięcie klawisza przywraca opis klawiatury.

**Blok:** trzymaj przycisk bloku, a postać staje w gardzie (może się obracać, skok przerywa gardę). Ciosy
i pociski wrogów z przodu (kule, noże, harpuny, sieci) zadają tylko ~12% obrażeń i lekko odpychają; ciosy w plecy,
wybuchy i chwyty przechodzą. Pasek pod stopami to wytrzymałość gardy — każdy zablokowany cios ją zmniejsza
(ciosy bossów mocniej), a gdy spadnie do zera, cios przebija gardę. Garda odnawia się, gdy nie blokujesz.
**Blok wciśnięty tuż przed ciosem** działa jak parowanie (ogłusza wroga, ładuje furię). Na ekranie dotykowym — przycisk BLOK.

**Ataki drużynowe (co-op):**
- **Wyrzut partnera** — gdy partner stoi obok w gardzie (trzyma blok), naciśnij ATAK: wyrzucisz go przed siebie jak pocisk, taranuje wrogów.
- **Podwójny rzut** — gdy partner trzyma wroga w chwycie, podejdź i naciśnij ATAK: obaj ciskacie nim o ziemię (28 obrażeń).
- **Super drużynowy** — gdy obaj macie pełną furię i stoicie blisko, super-ruch jednego uruchamia oba, a na koniec wybuch rani wszystkich wrogów na ekranie.

**Druga faza bossów:** przy 30% życia Kapitan Rdza, Żmija, Admirał Szpon i Padliniarz wpadają w szał — „OSTATNI ATAK!”:
trzy szarże przez całą arenę z bronią (przeskakuj albo uciekaj w głąb planszy), potem chwila zadyszki (najlepszy moment na kontrę);
atak powtarza się co kilka sekund. Stary Kieł, Zębacz i Bursztynowy Kolos wpadają we wściekłość i atakują częściej.
Na trudności ARCADE bossowie mają +15% życia (zwykli wrogowie +25%), na ŁATWYM -15%.

**Ataki specjalne bestii:**
- **Bursztynowy Kolos — deszcz odłamków:** po ryku na ziemi pojawiają się rosnące cienie; gdy się zamkną, spadają w nie
  bursztynowe odłamki. Uciekaj z cieni — garda nie pomaga.
- **Zębacz — atak z rynny:** zanurza się w ściekach i znika; pod powierzchnią sunie za tobą tylko ślad bąbelków. Potem wyskakuje
  i spada z impetem — odsuń się od bąbelków. Po lądowaniu jest chwilę ogłuszony („TERAZ!”) — czas na kontrę.

**Wydarzenia na etapach:**
- **Plaża — przypływ:** co ok. 30 s ostrzeżenie „PRZYPŁYW!”, potem woda zalewa pas planszy od strony morza; w wodzie wszyscy (poza bossem) poruszają się o połowę wolniej.
- **Kanały — fala ścieków:** co ok. 20 s ostrzeżenie „FALA ŚCIEKÓW! NA PODWYŻSZENIE!” i strzałka z kierunkiem; fala przechodzi przez cały ekran i przewraca każdego na dole.
  Schroń się na podwyższonym chodniku przy ścianie (pas z żółto-czarną krawędzią) albo przeskocz falę.

**Gra we dwóch:** na ekranie wyboru postaci gracz 2 dołącza swoim Startem (skok = rezygnacja), może też
dołączyć w dowolnym momencie etapu. Kamera pilnuje obu graczy, każdy ma własny panel, życia i wynik.
Gdy gracz straci wszystkie życia, wraca do gry swoim Startem; koniec gry następuje, gdy odpadną obaj.
Ta sama postać u obu graczy dostaje drugi zestaw kolorów.

**Postacie i ich ruchy:**
| Postać | Specjał | Ruch komendowy (dół, przód + atak) |
|---|---|---|
| **KRUK** — mechanik, balans | wirujący kopniak | rzut kluczem francuskim (pocisk) |
| **NINA** — strażniczka, szybka | salto z kopnięciem | wślizg |
| **TUR** — górnik, siła | trzęsienie ziemi (fala wokół) | taran barkiem (nietykalny podczas szarży) |
| **BORYS** — stary tropiciel z laską, zasięg | młynek laską (3 trafienia) | długie pchnięcie laską |

**Chwyty i rzuty:** wejdź we wroga, by go chwycić — atak = kolano (3× rzut), wstecz+atak = rzut za siebie.
Złapany **od tyłu** (wróg odwrócony plecami, np. zajęty drugim graczem lub ogłuszony) — atak = **suplex**.
**Rzut w powietrzu:** w skoku przytrzymaj dół i naciśnij atak przy wrogu.

**Ujeżdżanie dinozaurów:** pokonany raptor, pachy, triceratops, parazaurolof lub pteranodon nie ginie, tylko leży
oszołomiony (gwiazdki, „ATAK — DOSIĄDŹ!”). Podejdź i naciśnij atak. Specjał = zeskok, trafienie zrzuca z grzbietu.
| Wierzchowiec | Czas | Atak | Cecha |
|---|---|---|---|
| Raptor | 15 s | ugryzienie | szybki, wysoki skok |
| Pachy | 15 s | taran głową | lądowanie powala wrogów |
| Triceratops | 15 s | długa szarża | kryza blokuje ciosy z przodu |
| Parazaurolof | 15 s | ryk ogłuszający wrogów wokół (co 1,5 s), inaczej ugryzienie | szybki |
| Pteranodon | 8 s | pikowanie | lot ponad ciosami, kulami i lawą |

**Pasek furii i super-ruchy:** cienki pomarańczowy pasek pod życiem ładuje się, gdy zadajesz i otrzymujesz obrażenia.
Pełny (miga, „FURIA! SPECJAŁ”) zamienia specjał w super-ruch z przerywnikiem: KRUK — *Burza kluczy*,
NINA — *Taniec cieni* (teleport od wroga do wroga), TUR — *Fala sejsmiczna* (cały ekran), BORYS — *Grad laski*.

**Parowanie:** naciśnij atak tuż przed ciosem wroga od przodu (≈ 1/8 s) — cios nie wchodzi, napastnik zostaje
ogłuszony (boss zachwiany, Stary Kieł oszołomiony), dostajesz furię i 300 pkt. Nie działa na pociski i wybuchy.

**Obóz z ulepszeniami:** z pokonanych wrogów wypadają bursztyny (bossowie — 4), każdy klejnot to też +1 bursztyn.
Przed każdą mapą trasy odwiedzasz obóz: +10% życia (3 poziomy), dłuższe kombo, mocniejsze bomby, dłuższa jazda,
szybsza furia (po 2 poziomy) i dodatkowe życie. W grze we dwóch każdy ma własną sakwę (◄ ► zmiana gracza).
Ulepszenia i bursztyn trafiają do zapisu postępu.

**Opiekun (opcja):** 40% ciosów wroga, gdy stoisz lub idziesz, blokuje się samo, a przy pierwszym spotkaniu
każdego typu wroga/dinozaura/bossa pojawia się podpowiedź. Domyślne ustawienie: `assist` w `config.js`.

### Broń biała
Podnoszona atakiem, zużywa się z każdym trafieniem (licznik przy panelu gracza; przy zerze „PĘKŁO!”):
| Broń | Działanie |
|---|---|
| **Rura** | seria 2 zamachów, drugi przewraca (wytrzymałość 16) |
| **Maczeta** | szybka seria 3 cięć, trzecie przewraca (12) |
| **Łańcuch** | długi zasięg; drugi cios to obrotowy zamach dookoła, który wybija wrogów w górę (14) |
| **Butelka** | rzucana prosto przed siebie (2 sztuki), rozbija się i przewraca trafionego |

Bronie leżą w beczkach i skrzyniach (m.in. etapy 1, 2, 3A, 4, Plaża, Kanały) i na arenie treningowej.

### Beczki i skrzynie
- **▼ + ATAK** przy beczce lub skrzyni — podnosisz ją nad głowę (idziesz wolniej).
- **ATAK** albo **SKOK** — rzut: beczka przewraca **wszystkich** na swojej drodze, a po upadku pęka i zostawia łup.
- **Beczka z paliwem** wybucha przy pierwszym uderzeniu we wroga.
- **BLOK** — odstawiasz beczkę na ziemię. Gdy ktoś cię trafi albo złapie w sieć, beczka spada i pęka.

### Wrzucanie w zagrożenia
Wróg odrzucony lub rzucony prosto do **lawy** (3B), **ścieków** (Kanały) albo do **morza przy przypływie** (Plaża)
znika od razu — „W LAWIE!” / „SPŁUKANY!”, **+1000 pkt**. Na pociągu wróg zrzucony poza platformę odpada („ZRZUCONY!”).
Bossów nie da się tak pokonać.

### Żonglerka i odbicia
- **▲ + ATAK (stojąc w miejscu)** — wybicie: wróg leci pionowo w górę.
- Wroga w powietrzu można podbić jeszcze 3 razy — każde podbicie to „ŻONGLERKA ×n”, punkty (200 × n) i dodatkowe trafienie w kombo.
- Wróg odrzucony z impetem w krawędź ekranu **odbija się** („ODBICIE!”), traci trochę życia i wraca w powietrzu — można go dobić.

### Broń do rzucania
**Broń do rzucania:** podnieś **dynamit** lub **granaty** atakiem (po 3 szt., ten sam typ się sumuje, maks. 9).
Atak = rzut w stronę patrzenia; z wciśniętym kierunkiem do przodu rzut daleki, do tyłu — krótki.
Dynamit po upadku żarzy się chwilę i robi duży wybuch; granat leci dalej, odbija się i wybucha po czasie.
Bomba trafiająca w locie wroga spada mu pod nogi. Wybuchy ranią wrogów i bossów, rozbijają beczki, nie ranią gracza.
Dynamit wypada z Miotaczy, granaty ze Strzelców; są też w beczkach i skrzyniach na każdym etapie.

## Przebieg gry
**1 → 2 → [3A Miasto Cieni | 3B Ogniste Szyby] → bonus „Autostrada 7” → 4 Port → bonus „Zagroda” → 5 Twierdza → epilog „Ucieczka”**

**Scenki fabularne:** przed każdym etapem i epilogiem — komiksowe plansze z portretami i dialogami
(mówią bohaterowie z twojej drużyny i bossowie). Enter — dalej, Esc — pomiń.

**Epilog „Ucieczka”:** po pokonaniu Barona twierdza płonie. Kamera przewija się sama i przyspiesza,
od lewej goni ściana lawy (rani każdego, kto zostanie w tyle), z sufitu lecą odłamki (patrz na cień),
drogę zagradzają uciekający kłusownicy. Dobiegnij do wyjścia, zanim skończy się czas.

**Pojazdy:** w porcie stoją dwa jeepy (taranują wrogów przy prędkości, atak = zryw nitro, 12 s),
w kopalni wagonik na torach (miażdży wszystko po drodze, jedzie do końca torów). Podejdź i naciśnij atak.

**Po ukończeniu gry odblokowujesz:**
- **NOWA GRA+** (w menu głównym): etapy na zmianę nocne i jesienne, wrogowie przemieszani w obrębie swoich
  grup i silniejsi (+30% życia, +25% obrażeń), bossowie +50% życia, osobne „prawdziwe zakończenie” i osiągnięcie.
- **BARON BURSZTYN** jako piąta postać grywalna: kombo laską, specjał *Skok przez cień* (znika i uderza
  od tyłu najbliższego wroga), dół, przód + atak — *Fala energii*, super-ruch *Bursztynowa burza*.

Po etapie 2 na mapie wybierasz trasę (◄ ►, Enter): miasto z Braćmi Trzask albo kopalnię ze Starym Kłem.
Drugą lokację pomijasz — jedno przejście to 5 etapów + 2 bonusy.

### Bonus 2 — „Zagroda”
Nocny obóz kłusowników: rozbij 10 klatek z młodymi dinozaurami w 45 s (każda wytrzymuje 4 ciosy),
strażnicy nadbiegają co kilka sekund. 1000 pkt za każdego uwolnionego, komplet = +10 000 i premia za czas.

### Nowi przeciwnicy
- **Tarczownik** — blokuje ciosy z przodu (BLOK!). Obraca się powoli: zajdź go od tyłu, chwyć, kopnij z wyskoku,
  użyj specjału, ruchu komendowego lub wybuchu.
- **Snajper** — stoi na rusztowaniu i oznacza czerwonym celownikiem miejsce strzału: uciekaj z celownika.
  Zdejmiesz go kopnięciem z wyskoku albo strzelbą; po upadku walczy wręcz.
- **Sieciarz** — rzuca sieć, która unieruchamia; szybko wciskaj przyciski, by się uwolnić.
- **Pteranodon** — krąży wysoko i zrzuca kamienie (patrz na cień), czasem pikuje; trafisz go z wyskoku.
- **Jeździec** — kłusownik na osiodłanym raptorze. Przewróć go (cios kończący, kopnięcie z wyskoku, rzut),
  a spadnie z siodła — raptor zostaje oszołomiony i możesz go od razu dosiąść.
- **Podpalacz** — miotacz ognia o krótkim zasięgu; zostawia na podłodze płonące plamy, które ranią każdego (także wrogów).
- **Lotniarz** — przelatuje nad ekranem na lotni i zrzuca sieci tam, gdzie stoisz (uciekaj spod cienia).
  Po trzech przelotach ląduje; trafiony z wyskoku spada od razu i walczy wręcz.
- **Brygadzista** (mini-boss pociągu) — koparka z pancerzem: zamach łyżką z góry (pole rażenia przed maszyną)
  i szarża z łyżką przy ziemi. Uderzaj z boku i odskakuj przed szarżą.

### Sekrety
- **Popękane ściany** (rozbijalne): skarb (klejnoty, mięso, czasem bursztynowe jajo = dodatkowe życie)
  albo ukryty mini-boss **Biały Kieł** — albinoski raptor, którego po pokonaniu można dosiąść; zostawia dodatkowe życie.
- **Beczki z dodatkowym życiem** ukryte na etapach 2 i 4.

### Otoczenie
- **Beczki z paliwem** (czerwone, z płomieniem) wybuchają po trafieniu i odpalają sąsiednie.
- **Lawa** (3B) rani każdego, kto w nią wejdzie — także wrogów.
- **Wagoniki** (3B, kopalnia) pędzą po torach; „!” na brzegu ekranu ostrzega, z której strony.
- **Ulewa** (3A) co jakiś czas zaciemnia ekran — widać tylko okolice graczy.

### Oprawa i tryb demo
- **Portret w HUD** reaguje na walkę: po trafieniu krzywi się z bólu, przy niskim życiu (poniżej 25%) tło pulsuje
  na czerwono i pojawia się pot, a przy pełnej furii portret płonie i ma gniewne spojrzenie.
- **Rozpoznawanie wrogów:** Szakal ma chustę na twarzy, Ćwiek gogle, Głaz opaskę na oku, Miotacz plecak z dynamitem,
  Strzelec radio, Snajper czerwoną lunetę, Sieciarz zwiniętą sieć, Podpalacz maskę gazową i zbiorniki, Lotniarz gogle i plecak.
- **Światło:** wybuchy i ogień rozświetlają otoczenie, lampy w Kanałach rzucają stożki światła i co jakiś czas jaskrawo
  rozbłyskują; w deszczu na ziemi stoją kałuże, w których odbijają się postacie.
- **Tryb demo:** po chwili bezczynności na ekranie tytułowym komputer sam gra kawałek losowego etapu
  (na zmianę z tabelą wyników). Dowolny przycisk wraca do menu. Demo niczego nie zapisuje.

### Komiksowe przerywniki
Scenki przed etapami to strony komiksu: każda kwestia to osobny kadr (tło etapu, postać w zbliżeniu, dymek, podpis),
kadry pojawiają się po kolei, przeciwnicy mają linie akcji i dźwiękonaśladowcze napisy („GRRR!”, „BUM!”).
ENTER — dalej, ESC — pomiń.

### Pogoda i pora dnia
Losowane przy każdym nowym przejściu gry, więc ten sam etap wygląda za każdym razem inaczej.
Nazwa pogody pojawia się pod tytułem etapu.

| Etap | Możliwe warianty |
|---|---|
| 1 — Zielona Rdza | pogodnie, świt, burza piaskowa, deszcz |
| 2 — Smolne Bagna | mgła (najczęściej), zmierzch, deszcz |
| 3A — Miasto Cieni | pogodnie, zmierzch, mgła (+ stałe ulewy) |
| 3B — Ogniste Szyby | burza piaskowa (najczęściej), deszcz popiołu, pogodnie |
| 4 — Port Przemytników | zachód słońca (najczęściej), pogodnie, mgła |
| 5 — Bursztynowa Twierdza | pogodnie, zmierzch, deszcz, zachód słońca |

W NG+ zamiast pogody obowiązuje jego własna noc i jesień.

**Pogoda wpływa na rozgrywkę:**
- **Deszcz / ulewa** — mokra nawierzchnia: po biegu postać ślizga się przy hamowaniu i zawracaniu („POŚLIZG!”).
- **Burza piaskowa** — w porywach piasek zasłania ekran; dobrze widać tylko okolicę graczy.
- **Wiatr** (burza piaskowa, deszcz, ulewa) — znosi lecący dynamit, granaty i butelki, także wrogów; wskaźnik „WIATR ►►”
  przy liczniku czasu pokazuje kierunek i siłę, a co jakiś czas wiatr się odwraca.

## Edytor etapów
`editor.html` (albo EKSTRA → WŁASNE ETAPY → OTWÓRZ EDYTOR ETAPÓW) — edytor w przeglądarce:
- **Ustawienia:** nazwa, podtytuł, tło (jeden z sześciu etapów gry), długość, muzyka etapu i bossa, trudność, pogoda.
- **Podgląd** z prawdziwym tłem, suwak i minimapa całej planszy; przewijanie kółkiem lub strzałkami.
- **Narzędzia:** beczka, skrzynia, beczka z paliwem, ściana z sekretem (skarb, skarb + życie albo Biały Kieł),
  przedmiot, jeep, wagonik, wróg w fali. Klik stawia, przeciąganie przesuwa, Delete usuwa, Ctrl+Z cofa.
- **Fale:** „+ Fala w bieżącym widoku” blokuje kamerę w tym miejscu; każda fala ma grupy wrogów (typ, strona wejścia,
  wysokość, opóźnienie), kolejna grupa wchodzi, gdy zostanie podana liczba wrogów. Fala z bossem kończy etap;
  bez bossa etap kończy się po ostatniej fali na końcu planszy.
- **Sprawdzenie** ostrzega o pustych falach, braku bossa, falach po bossie i falach zbyt blisko siebie.
- **Zapisz** (Ctrl+S) — do biblioteki w przeglądarce; etap od razu jest w grze w **EKSTRA → WŁASNE ETAPY**.
- **Testuj ▶** — zapisuje i otwiera grę w nowej karcie od razu na wyborze postaci.
- **Eksport custom.js** — wszystkie etapy (biblioteka + obecny plik) jako `js/stages/custom.js`; podmień plik,
  a etapy będą w grze na każdym komputerze. **Eksport .json / Import…** — pojedyncze etapy i wczytywanie plików.
Własne etapy nie dają osiągnięć i nie trafiają do tabeli wyników. `js/stages/custom.js` zawiera przykładowy etap.

## Etapy
Kolejność: 1 → 2 → 3A lub 3B (wybór trasy) → 4 → 5 → 6 → pociąg → 7 (finał), potem epilog „Ucieczka”.

| # | Etap | Nowości | Boss |
|---|---|---|---|
| 1 | **Zielona Rdza** — wioska, dżungla, obóz, kamieniołom | Szakal, Ćwiek, Głaz, Raptor | **Kapitan Rdza** — młot elektryczny, szarża, skok z falą uderzeniową |
| 2 | **Smolne Bagna** — osada na palach, pole naftowe, kładki, rafineria | **Miotacz** (dynamit), **Pachy** (dinozaur-taran) | **Żmija** — bicz, salto w tył, noże do rzucania |
| 3A | **Miasto Cieni** — nocna ulica w deszczu, neony, estakada | **Strzelec** (celownik laserowy, kule — przeskakuj) | **Bracia Trzask** — Klin (szarża) i Klamra (noże), walczą razem |
| 3B | **Ogniste Szyby** — wulkan, kopalnia, most nad lawą, kaldera | żar i lawa | **Stary Kieł** — olbrzymi drapieżnik: ugryzienie, ogon, ryk ogłuszający, szarża (po uderzeniu w ścianę jest ogłuszony) |
| 4 | **Port Przemytników** — nabrzeże, kontenery, magazyny, statek | mieszane oddziały | **Admirał Szpon** — harpun z celownikiem, kotwica, szarża |
| 5 | **Opuszczona Plaża** — zaśmiecony brzeg, brudne fale z ropą, wrak tankowca, wieża ratownika, przewrócone łodzie, góry śmieci, opony i wielkie szkielety dinozaurów; muchy nad śmieciami | parazaurolofy i pteranodony nad brzegiem, triceratops, jeep do przejęcia, beczki z paliwem | **Padliniarz** — Król Śmietniska w żółtym sztormiaku: ciężka kotwica, szarża, skok z falą uderzeniową, wzywa zbieraczy |
| 6 | **Kanały Otchłani** — ceglane tunele pod miastem, rury, kraty, graffiti, migające lampy, rynna ze ściekami, kapiąca woda | **toksyczne kałuże** (ranią każdego, kto w nie wejdzie), Biały Kieł w ciemnościach, stada raptorów | **Zębacz** — mutant z kanałów, zdziczały kuzyn Starego Kła: ugryzienie, ogon, ryk, szarża |
| 7 | **Bursztynowa Twierdza** — burza, hangar, laboratorium, sala tronowa | powrót Klina i Żmii jako mini-bossów | **Baron Bursztyn** — teleport za plecy, kombo laską, fale energii po ziemi (przeskakuj), druga faza |

### Etap specjalny — „Pociąg do Twierdzy” (po etapie 6)
Walka na platformach pędzącego pociągu: tło przesuwa się szybko, wrogowie wskakują z obu stron toru,
a każdy wróg strącony poza krawędź platformy odpada od razu. Na końcu czeka **Brygadzista** w koparce.

### Zakończenia postaci
Po napisach końcowych ENTER pokazuje krótki komiks dla każdej postaci z drużyny (w co-opie — dla obu):
Kruk, Nina, Tur, Borys, Baron, Padliniarz i Żmija mają własne zakończenia.

### Etap bonusowy — „Lot nad Zatoką” (po etapie 5)
Lot na pteranodonie wzdłuż wybrzeża przez 50 s: **▲▼◄►** lot, **ATAK** — zrzuć kamień, **SKOK** — zryw do przodu.
Zatapiaj łodzie kłusowników: pontony (1 trafienie), kutry z dinozaurem w klatce (2 — zatopienie go uwalnia)
i kanonierki (3 — strzelają harpunami w pteranodona). Omijaj klucze mew, zbieraj bursztyny w chmurach.
Zestrzelenie pteranodona tylko kończy bonus. 12 zatopionych łodzi = osiągnięcie „Podniebny bombardier”.

### Prawdziwe zakończenie
W jednym przejściu gry **uwolnij wszystkie dinozaury w Zagrodzie** i **odkryj co najmniej 3 sekrety** (rozbijalne ściany).
Wtedy po ucieczce z twierdzy z morza wychodzi **Bursztynowy Kolos** — ostatnia walka o świcie nad zatoką —
a po zwycięstwie czeka prawdziwe zakończenie (osiągnięcie „Prawdziwe zakończenie”). Postęp warunków zapisuje się razem z grą.

### Etap bonusowy — „Autostrada 7” (po etapie 3)
Jazda krążownikiem szos do wulkanu w 60 sekund: **▲/▼** zmiana pasa, **►** gaz, **◄** hamulec,
**skok** — podskok autem (nad kamieniami, beczkami, smołą i raptorami = punkty), **atak** — dopalacz
(taranuje motocyklistów, beczki i jeepa — jeep wymaga dwóch uderzeń). Stopery dają +5 s, klejnoty i monety punkty.
Na koniec podsumowanie: meta, stan auta, pozostały czas, zdobycze. Rozbicie auta tylko kończy bonus (bez utraty życia).
W trybie debug oba bonusy są dostępne na liście wyboru etapu.

### Tabela wyników
Top 10 zapisywane w przeglądarce (localStorage). Po końcu gry lub po zakończeniu, jeśli wynik się kwalifikuje,
wpisujesz 3 inicjały (▲▼ litera, ◄► pozycja, atak/Enter zatwierdza; dostępne też polskie litery).
Na ekranie tytułowym tabela pokazuje się co ok. 12 s (tryb „attract” jak w automatach).
Kontynuacja po przegranej zachowuje wynik.

Przed każdym etapem pojawia się **mapa regionu** (w stylu Final Fight): czerwony szlak z już
przebytą trasą, przekreślone ukończone lokacje i krążownik szos jadący do następnego celu,
z nazwą etapu i portretem postaci. Enter przyspiesza / pomija animację.

Trudność rośnie z etapem (więcej HP i obrażeń wrogów, więcej jednoczesnych napastników).
Wynik, życia i postać przechodzą między etapami; dodatkowe życie co 50 000 pkt (pierwsze przy 30 000).

## Audio
- Utwory: `title`, `map`, `drive` (etap bonusowy), `stage1`–`stage6`, `beach` (Opuszczona Plaża), `sewer` (Kanały Otchłani), `boss`, `beast` (Stary Kieł), `final` (Baron), `clear`, `gameover`, `ending`.
- 35 sampli SFX (ciosy, skrzeki, strzały, wybuchy, bicz, harpun, teleport, grzmot…).
- **Głosy postaci:** syntezowane okrzyki (`v_<postać>_special|super|win|hurt`) przy specjale, super-ruchu,
  mocnym ciosie i wygranej. Każdy bohater ma własną barwę: Kruk średni, Nina wysoki, Tur niski i chropowaty,
  Borys zachrypnięty z drżeniem, Baron gładki z wibratem.
- **Dynamiczna muzyka:** przy kombo 10+ albo gdy bossowi zostało poniżej 25% życia, do utworu dochodzi dodatkowa
  ścieżka perkusji (tomy, werbel, talerz na wejście) i wycisza się, gdy napięcie opada.
- Gotowe pliki WAV: `assets/audio/` (72 pliki, w tym 20 okrzyków postaci, 44,1 kHz, 16 bit, stereo).
- Odsłuch i pobieranie: `export.html`. Ponowne wygenerowanie: `node tools/export-audio.mjs` (Node 22+ i Edge/Chrome).

## Struktura
```
index.html              gra
editor.html, js/editor.js  edytor etapów
config.js               konfiguracja: debug, domyślna trudność, życia, głośność, sterowanie dotykowe
export.html             odsłuch i eksport audio do WAV
js/audio.js             syntezator SFX, instrumenty, sekwencer, utwory, eksport offline
js/sprites.js           szkieletowy renderer postaci, pozy, raptor/pachy/olbrzym, bronie, pociski, efekty
js/scenery.js           wspólne elementy scenerii + fabryka etapów (warstwy paralaksy)
js/stages/stage1..8.js  tła, animacje, fale wrogów i obiekty każdego etapu (stage7 = plaża, stage8 = kanały)
js/stages/cages.js      bonus „Zagroda”
js/stages/training.js   arena treningowa
js/stages/survival.js   arena trybu przetrwania
js/stages/escape.js     epilog „Ucieczka” (płonąca twierdza)
js/stages/custom.js     własne etapy z edytora (window.CUSTOM_STAGES)
js/stages/extras.js     nowi wrogowie, sekrety, paliwo, lawa, wagoniki, ulewa (uzupełnienia etapów)
js/bonus.js             etap bonusowy z jazdą samochodem
js/flight.js            etap bonusowy — lot na pteranodonie
js/game.js              pętla gry, sterowanie, walka, AI wrogów i bossów, kamera, HUD, ekrany
tools/export-audio.mjs  wsadowy eksport audio przez headless Chromium
tools/serve.mjs         lokalny serwer (tryb offline / instalacja PWA); uruchom-serwer.bat — skrót
tools/icon.html         generator ikon aplikacji
manifest.webmanifest    manifest aplikacji (PWA), icons/ — ikony
sw.js                   service worker: pamięć podręczna i praca offline
PLAN.md                 plan projektu i analiza gatunku
```
