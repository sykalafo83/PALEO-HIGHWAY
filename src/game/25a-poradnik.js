  // =============================================================== JAK GRAĆ (poradnik w menu głównym)
  // Rozdziały ▲▼, strony ◄► / ENTER. Klawisze w tekście pochodzą z aktualnych przypisań gracza 1,
  // a gdy ostatnio używany był pad — w ich miejscu pojawiają się ikony przycisków.
  const keyOf = a => (keysFor(0, a).split(' / ')[0] || '?');
  const K = a => '{' + a + '|' + keyOf(a) + '}';
  const SPEC = () => K('attack') + '+' + K('jump');
  const HOWTO = [
    { title: 'PODSTAWY', pages: [
      { demo: 'move', head: 'CEL GRY', lines: () => [
        'KŁUSOWNICY ŁAPIĄ DINOZAURY WZDŁUŻ STAREJ AUTOSTRADY. TWOJE ZADANIE:',
        '• PRZEJDŹ ETAP OD LEWEJ DO PRAWEJ, POKONUJĄC KOLEJNE FALE WROGÓW,',
        '• NA KOŃCU ETAPU POKONAJ BOSSA,',
        '• PO DRODZE ROZBIJAJ BECZKI, ZBIERAJ JEDZENIE, BROŃ I SKARBY.',
        'GDY FALA ZOSTANIE POKONANA, POJAWIA SIĘ NAPIS „GO ►” — IDŹ DALEJ W PRAWO.',
        'ZA KAŻDE 50 000 PUNKTÓW (PIERWSZE PRZY 30 000) DOSTAJESZ DODATKOWE ŻYCIE.'] },
      { demo: 'run', head: 'RUCH, BIEG I SKOK', lines: () => [
        'RUCH: ' + K('left') + ' ' + K('right') + ' ' + K('up') + ' ' + K('down') + ' (TAKŻE STRZAŁKI, GAŁKA LUB KRZYŻAK PADA).',
        'PLANSZA MA GŁĘBIĘ: ▲ I ▼ PRZESUWAJĄ CIĘ W GŁĄB I DO PRZODU EKRANU.',
        'WROGA TRAFISZ TYLKO, GDY STOICIE MNIEJ WIĘCEJ NA TEJ SAMEJ WYSOKOŚCI.',
        'BIEG: DWA SZYBKIE STUKNIĘCIA W KIERUNEK (◄◄ ALBO ►►).',
        'SKOK: ' + K('jump') + '. W BIEGU SKACZESZ DALEJ.',
        'START / PAUZA: ' + K('start') + ' / ' + K('pause') + '. W PAUZIE MOŻESZ WYJŚĆ DO MENU.'] },
      { demo: 'hud', head: 'EKRAN GRY', lines: () => [
        'LEWY GÓRNY RÓG: PORTRET, IMIĘ, WYNIK I PASEK ŻYCIA.',
        '×2 — ZAPASOWE ŻYCIA. POMARAŃCZOWA KROPKA — BURSZTYN NA ULEPSZENIA.',
        'POD ŻYCIEM ROŚNIE PASEK FURII (O NIM W ROZDZIALE „SPECJAŁY I FURIA”).',
        'NA ŚRODKU: CZAS. GDY DOJDZIE DO ZERA, TRACISZ ŻYCIE — NIE GUZDRAJ SIĘ.',
        'POD TWOIM PASKIEM: ŻYCIE OSTATNIO TRAFIONEGO WROGA. KOLOROWE WARSTWY',
        'I LICZNIK ×N U BOSSÓW TO KOLEJNE „PASKI” ŻYCIA DO ZBICIA.'] }
    ] },
    { title: 'WALKA', pages: [
      { demo: 'combo', head: 'KOMBO', lines: () => [
        'ATAK: ' + K('attack') + '. STUKAJ RYTMICZNIE — KOLEJNE CIOSY ŁĄCZĄ SIĘ W SERIĘ,',
        'A OSTATNI CIOS SERII PRZEWRACA WROGA.',
        'KAŻDA POSTAĆ MA WŁASNĄ SERIĘ: KRUK I NINA SĄ SZYBCY, TUR BIJE MOCNO,',
        'BORYS WALCZY LASKĄ Z DALEKA.',
        'TRAFIENIA BEZ PRZERWY BUDUJĄ KOMBO („12 HIT!”) — SERIA OD 5 TRAFIEŃ',
        'DAJE PREMIĘ PUNKTOWĄ, A DŁUGIE KOMBO PODKRĘCA MUZYKĘ.'] },
      { demo: 'jumpkick', head: 'ATAKI W RUCHU', lines: () => [
        'KOPNIĘCIE Z WYSKOKU: ' + K('jump') + ', A W POWIETRZU ' + K('attack') + '. PRZEWRACA I SIĘGA DALEKO.',
        'ATAK W BIEGU: BIEGNIJ (►►) I NACIŚNIJ ' + K('attack') + ' — SZARŻA, KTÓRA ROZTRĄCA WROGÓW.',
        'RUCH KOMENDOWY: ▼ ◢ ► + ' + K('attack') + ' (DÓŁ, SKOS, PRZÓD I ATAK — JAK W AUTOMATACH).',
        'KAŻDA POSTAĆ MA INNY: KRUK RZUCA KLUCZEM, NINA ROBI WŚLIZG, TUR TARANUJE,',
        'BORYS PCHA LASKĄ. LISTĘ RUCHÓW WIDZISZ NA EKRANIE WYBORU POSTACI.'] },
      { demo: 'launch', head: 'WYBICIE I ŻONGLERKA', lines: () => [
        'WYBICIE: STÓJ W MIEJSCU, TRZYMAJ ▲ I NACIŚNIJ ' + K('attack') + '. WRÓG LECI PIONOWO W GÓRĘ.',
        'WROGA W POWIETRZU MOŻESZ PODBIĆ JESZCZE 3 RAZY KOLEJNYMI CIOSAMI',
        '— „ŻONGLERKA ×N”: PUNKTY I DŁUŻSZE KOMBO.',
        'ODBICIE: WRÓG ODRZUCONY Z IMPETEM W KRAWĘDŹ EKRANU ODBIJA SIĘ OD NIEJ',
        '(„ODBICIE!”) I WRACA W POWIETRZU — DOBIJ GO.'] }
    ] },
    { title: 'CHWYTY I RZUTY', pages: [
      { demo: 'grab', head: 'CHWYT', lines: () => [
        'PODEJDŹ DO OSZOŁOMIONEGO LUB STOJĄCEGO WROGA — POSTAĆ SAMA GO ZŁAPIE.',
        'W CHWYCIE:',
        '• ' + K('attack') + ' — KOLANO (KILKA RAZY Z RZĘDU),',
        '• KIERUNEK DO TYŁU + ' + K('attack') + ' — RZUT ZA SIEBIE,',
        '• ' + K('jump') + ' — PUŚĆ WROGA.',
        'RZUCONY WRÓG RANI KAŻDEGO, W KOGO UDERZY. DUŻYCH WROGÓW I BOSSÓW NIE ZŁAPIESZ.'] },
      { demo: 'suplex', head: 'SUPLEX I RZUT W LOCIE', lines: () => [
        'CHWYT OD TYŁU: ZŁAP WROGA, KTÓRY STOI DO CIEBIE PLECAMI („Z TYŁU!”),',
        'I NACIŚNIJ ' + K('attack') + ' — SUPLEX, BARDZO MOCNY RZUT.',
        'RZUT W LOCIE: SKOCZ OBOK WROGA, TRZYMAJ ▼ I NACIŚNIJ ' + K('attack') + '.',
        'POSTAĆ ŁAPIE GO W POWIETRZU I CISKA NIM O ZIEMIĘ.',
        'RZUTY SĄ KLUCZEM W WYZWANIU „RZUTOWIEC”.'] },
      { demo: 'barrel', head: 'BECZKI I ZAGROŻENIA', lines: () => [
        'STAŃ PRZY BECZCE LUB SKRZYNI, TRZYMAJ ▼ I NACIŚNIJ ' + K('attack') + ' — PODNOSISZ JĄ NAD GŁOWĘ.',
        K('attack') + ' ALBO ' + K('jump') + ' — RZUT: BECZKA PRZEWRACA WSZYSTKICH NA SWOJEJ DRODZE,',
        'A BECZKA Z PALIWEM WYBUCHA PRZY UDERZENIU. ' + K('block') + ' — ODSTAWIASZ JĄ NA ZIEMIĘ.',
        'GDY KTOŚ CIĘ TRAFI, BECZKA SPADA I PĘKA.',
        'ODRZUĆ WROGA DO LAWY, ŚCIEKÓW ALBO MORZA PRZY PRZYPŁYWIE — „SPŁUKANY!” +1000.',
        'NA POCIĄGU ZRZUCONY Z PLATFORMY WRÓG ODPADA OD RAZU.'] }
    ] },
    { title: 'OBRONA', pages: [
      { demo: 'block', head: 'BLOK', lines: () => [
        'TRZYMAJ ' + K('block') + ' — POSTAĆ STAJE W GARDZIE. CIOSY I POCISKI Z PRZODU',
        '(KULE, NOŻE, HARPUNY, SIECI) ZADAJĄ TYLKO OK. 12% OBRAŻEŃ.',
        'NIE ZABLOKUJESZ: CIOSÓW W PLECY, WYBUCHÓW, CHWYTÓW I SPADAJĄCYCH ODŁAMKÓW.',
        'PASEK POD STOPAMI TO WYTRZYMAŁOŚĆ GARDY — GDY SPADNIE DO ZERA,',
        'CIOS PRZEBIJA GARDĘ. GARDA ODNAWIA SIĘ, GDY NIE BLOKUJESZ.',
        'Z GARDY MOŻESZ SKOCZYĆ (' + K('jump') + ') I ODPALIĆ SUPER (' + SPEC() + ').'] },
      { demo: 'parry', head: 'PAROWANIE', lines: () => [
        'NACIŚNIJ ' + K('block') + ' (ALBO ' + K('attack') + ') TUŻ PRZED CIOSEM WROGA Z PRZODU.',
        'UDANE „PAROWANIE!” ODBIJA CIOS, OGŁUSZA WROGA I DOŁADOWUJE FURIĘ.',
        'TO NAJLEPSZA ODPOWIEDŹ NA WOLNE, MOCNE CIOSY BOSSÓW.',
        'W OPCJACH MOŻESZ WŁĄCZYĆ TRYB OPIEKUNA — CZĘŚĆ CIOSÓW BLOKUJE SIĘ WTEDY',
        'SAMA, A PRZY PIERWSZYM SPOTKANIU WROGA DOSTAJESZ PODPOWIEDŹ.'] }
    ] },
    { title: 'SPECJAŁY I FURIA', pages: [
      { demo: 'special', head: 'SPECJAŁ', lines: () => [
        'SPECJAŁ: ' + SPEC() + ' NARAZ (ATAK I SKOK RAZEM).',
        'POSTAĆ WYKONUJE CIOS DOOKOŁA SIEBIE I NA CHWILĘ JEST NIETYKALNA —',
        'IDEALNE WYJŚCIE, GDY OTOCZĄ CIĘ WROGOWIE.',
        'UWAGA: GDY SPECJAŁ KOGOŚ TRAFI, KOSZTUJE CIĘ 6 PUNKTÓW ŻYCIA.',
        'NA PADZIE: ' + K('attack') + ' + ' + K('jump') + '. NA EKRANIE DOTYKOWYM: ATAK I SKOK DWOMA PALCAMI.'] },
      { demo: 'super', head: 'FURIA I SUPER-RUCH', lines: () => [
        'PASEK FURII ROŚNIE, GDY ZADAJESZ I OTRZYMUJESZ CIOSY ORAZ PRZY PAROWANIU.',
        'GDY JEST PEŁNY („FURIA!”), ' + SPEC() + ' ODPALA SUPER-RUCH ZAMIAST SPECJAŁU:',
        'KRUK — BURZA KLUCZY, NINA — TANIEC CIENI, TUR — FALA SEJSMICZNA,',
        'BORYS — GRAD LASKI. SUPER NIC NIE KOSZTUJE I CZYŚCI EKRAN.',
        'W CO-OPIE, GDY OBAJ MACIE PEŁNĄ FURIĘ, ODPALACIE SUPER DRUŻYNOWY.'] }
    ] },
    { title: 'BROŃ', pages: [
      { demo: 'melee', head: 'BROŃ BIAŁA I STRZELBA', lines: () => [
        'BROŃ PODNOSISZ, STAJĄC NA NIEJ I NACISKAJĄC ' + K('attack') + '.',
        '• RURA — 2 ZAMACHY, DRUGI PRZEWRACA.',
        '• MACZETA — SZYBKIE 3 CIĘCIA.',
        '• ŁAŃCUCH — DŁUGI ZASIĘG, DRUGI CIOS TO OBROTOWY ZAMACH DOOKOŁA.',
        'BROŃ BIAŁA ZUŻYWA SIĘ (LICZNIK PRZY PANELU) I W KOŃCU PĘKA.',
        '• STRZELBA — STRZAŁ PRZEZ CAŁY EKRAN, 8 NABOI. GDY CIĘ PRZEWRÓCĄ, BROŃ WYPADA.'] },
      { demo: 'thrown', head: 'BROŃ RZUCANA', lines: () => [
        '• DYNAMIT — PO UPADKU ŻARZY SIĘ CHWILĘ I ROBI DUŻY WYBUCH.',
        '• GRANAT — LECI DALEJ, ODBIJA SIĘ I WYBUCHA PO CZASIE.',
        '• BUTELKA — LECI PROSTO PRZED SIEBIE I ROZBIJA SIĘ NA WROGU.',
        'Z KIERUNKIEM DO PRZODU RZUCASZ DALEKO, DO TYŁU — BLISKO.',
        'BOMBY NIE RANIĄ GRACZY, ALE ROZBIJAJĄ BECZKI I ODPALAJĄ BECZKI Z PALIWEM.',
        'PRZY BURZY I DESZCZU WIATR (WSKAŹNIK „WIATR ►►”) ZNOSI LECĄCE BOMBY.'] }
    ] },
    { title: 'DINOZAURY I POJAZDY', pages: [
      { demo: 'tame', head: 'OSWAJANIE I JAZDA', lines: () => [
        'POKONANY RAPTOR, PACHY, TRICERATOPS, PARAZAUROLOF ALBO PTERANODON',
        'NIE UCIEKA — LEŻY Z GWIAZDKAMI NAD GŁOWĄ. PODEJDŹ I NACIŚNIJ ' + K('attack') + '.',
        'NA GRZBIECIE ' + K('attack') + ' TO ATAK DINOZAURA, ' + K('jump') + ' — SKOK, ' + SPEC() + ' — ZSIADANIE.',
        'RAPTOR GRYZIE, PACHY TARANUJE, TRICERATOPS BLOKUJE CIOSY KRYZĄ,',
        'PTERANODON LATA. JAZDA TRWA OKREŚLONY CZAS (ULEPSZENIE W SKLEPIE JĄ WYDŁUŻA).',
        'JEŹDZIEC NA RAPTORZE: PRZEWRÓĆ GO, A SPADNIE Z SIODŁA — RAPTOR OD RAZU JEST TWÓJ.'] },
      { demo: 'jeep', head: 'POJAZDY', lines: () => [
        'NA NIEKTÓRYCH ETAPACH STOJĄ POJAZDY — PODEJDŹ I NACIŚNIJ ' + K('attack') + ' („WSIĄDŹ!”).',
        '• JEEP — PĘDZI I TARANUJE WROGÓW NA SWOJEJ DRODZE.',
        '• WAGONIK — W KOPALNI: PĘDZI PO TORACH I ZMIATA WSZYSTKO.',
        'UWAŻAJ NA WAGONIKI WROGÓW — „!” NA BRZEGU EKRANU OSTRZEGA, Z KTÓREJ STRONY JADĄ.'] }
    ] },
    { title: 'ETAPY', pages: [
      { demo: 'items', head: 'PRZEDMIOTY', lines: () => [
        '• MIĘSO — DUŻO ŻYCIA, OWOC — TROCHĘ ŻYCIA.',
        '• MONETA I KLEJNOT — PUNKTY (KLEJNOT TAKŻE BURSZTYN).',
        '• BURSZTYN — WALUTA W OBOZIE (SKLEP Z ULEPSZENIAMI PRZED MAPĄ).',
        '• ŻYCIE (1UP) — DODATKOWE ŻYCIE.',
        'BECZKI I SKRZYNIE ROZBIJAJ — KRYJĄ JEDZENIE I BROŃ. CZERWONE BECZKI',
        'Z PALIWEM WYBUCHAJĄ I ODPALAJĄ SĄSIEDNIE. PĘKNIĘTE ŚCIANY KRYJĄ SEKRETY.'] },
      { demo: 'hazard', head: 'ZAGROŻENIA I POGODA', lines: () => [
        'LAWA (KOPALNIA) I TOKSYCZNE ŚCIEKI (KANAŁY) RANIĄ KAŻDEGO, KTO W NIE WEJDZIE.',
        'PODPALACZ ZOSTAWIA NA PODŁODZE OGIEŃ — PALI SIĘ CHWILĘ I RANI KAŻDEGO.',
        'PLAŻA: CO OK. 30 S PRZYPŁYW — W WODZIE RUSZASZ SIĘ DWA RAZY WOLNIEJ.',
        'KANAŁY: FALA ŚCIEKÓW — WEJDŹ NA PODWYŻSZENIE PRZY ŚCIANIE ALBO JĄ PRZESKOCZ.',
        'POGODA ZMIENIA SIĘ Z KAŻDYM PRZEJŚCIEM: W DESZCZU ŚLIZGASZ SIĘ PO BIEGU,',
        'W BURZY PIASKOWEJ WIDZISZ TYLKO OKOLICĘ, WIATR ZNOSI BOMBY.'] },
      { demo: 'foes', head: 'NOWI PRZECIWNICY', lines: () => [
        '• JEŹDZIEC — KŁUSOWNIK NA RAPTORZE. PRZEWRÓĆ GO I PRZEJMIJ DINOZAURA.',
        '• PODPALACZ — MIOTACZ OGNIA Z BLISKA. PODPALA PODŁOGĘ: NIE STÓJ W OGNIU,',
        '  PODCHODŹ Z GÓRY LUB Z DOŁU I BIJ, GDY KOŃCZY STRZAŁ.',
        '• LOTNIARZ — PRZELATUJE NA LOTNI I ZRZUCA SIEĆ TAM, GDZIE STOISZ.',
        '  UCIEKAJ SPOD CIENIA; KOPNIĘCIE Z WYSKOKU ŚCIĄGA GO NA ZIEMIĘ.',
        '• BRYGADZISTA — KOPARKA Z PANCERZEM (O NIEJ W „RADACH NA BOSSÓW”).'] },
      { demo: 'map', head: 'TRASA, SKLEP I BONUSY', lines: () => [
        'PO KAŻDYM ETAPIE: OCENA (S–D) I MAPA REGIONU. PO ETAPIE 2 WYBIERASZ TRASĘ:',
        'MIASTO CIENI ALBO OGNISTE SZYBY.',
        'PRZED MAPĄ JEST OBÓZ — ZA BURSZTYN KUPUJESZ ŻYCIE, DŁUŻSZE KOMBO, SILNIEJSZE',
        'BOMBY, DŁUŻSZĄ JAZDĘ, SZYBSZĄ FURIĘ I DODATKOWE ŻYCIA.',
        'BONUSY: JAZDA AUTEM (PO 3A/3B), ZAGRODA (PO 4), LOT NA PTERANODONIE (PO 5).',
        'PO KANAŁACH (6): POCIĄG DO TWIERDZY.',
        'GRA ZAPISUJE SIĘ SAMA — „KONTYNUUJ” W MENU GŁÓWNYM.'] },
      { demo: 'train', head: 'POCIĄG I ZAKOŃCZENIA', lines: () => [
        'POCIĄG DO TWIERDZY: WALCZYSZ NA PLATFORMACH PĘDZĄCEGO POCIĄGU.',
        'WROGOWIE WSKAKUJĄ Z OBU STRON TORU — PATRZ NA GÓRNĄ I DOLNĄ KRAWĘDŹ.',
        'WRÓG ODRZUCONY POZA PLATFORMĘ ODPADA OD RAZU („ZRZUCONY!”) — WALCZ',
        'PRZY KRAWĘDZI I POSYŁAJ ICH ZA BURTĘ. NA KOŃCU CZEKA BRYGADZISTA.',
        'PO NAPISACH KOŃCOWYCH {ok|ENTER} POKAZUJE KOMIKS O TYM, CO TWOJA POSTAĆ',
        'ROBI PO WSZYSTKIM — KAŻDA Z SIEDMIU POSTACI MA WŁASNE ZAKOŃCZENIE.'] }
    ] },
    { title: 'GRA WE DWÓCH', pages: [
      { demo: 'coop', head: 'DOŁĄCZANIE', lines: () => [
        'GRACZ 2: STRZAŁKI + ' + keyOfP2('attack') + ' ' + keyOfP2('jump') + ' ' + keyOfP2('block') + ', START: ' + keyOfP2('start') + ' (ALBO DRUGI PAD).',
        'DOŁĄCZYĆ MOŻNA NA EKRANIE WYBORU POSTACI ALBO W DOWOLNEJ CHWILI ETAPU.',
        'KAŻDY MA WŁASNE ŻYCIA I WYNIK. GDY GRACZ STRACI ŻYCIA, WRACA SWOIM STARTEM.',
        'TA SAMA POSTAĆ U OBU GRACZY DOSTAJE DRUGI ZESTAW KOLORÓW.'] },
      { demo: 'teamthrow', head: 'ATAKI DRUŻYNOWE', lines: () => [
        '• WYRZUT PARTNERA: PARTNER STOI OBOK W GARDZIE (' + K('block') + '), TY NACISKASZ ' + K('attack') + '',
        '  — LECI PRZED SIEBIE JAK POCISK I TARANUJE WROGÓW.',
        '• PODWÓJNY RZUT: PARTNER TRZYMA WROGA W CHWYCIE, TY PODCHODZISZ I NACISKASZ',
        '  ' + K('attack') + ' — OBAJ CISKACIE NIM O ZIEMIĘ.',
        '• SUPER DRUŻYNOWY: OBAJ Z PEŁNĄ FURIĄ, BLISKO SIEBIE — SUPER JEDNEGO',
        '  ODPALA OBA, A NA KONIEC WYBUCH RANI WSZYSTKICH WROGÓW NA EKRANIE.'] }
    ] },
    { title: 'TRYBY I RADY', pages: [
      { demo: 'modes', head: 'TRYBY GRY', lines: () => [
        '• START GRY — 7 ETAPÓW, POCIĄG, EPILOG I ZAKOŃCZENIE. PO PRZEJŚCIU: NOWA GRA+ I BARON.',
        '• TRENING — MANEKINY, KTÓRE NIE ODDAJĄ: ĆWICZ KOMBO I RUCHY.',
        '• WYZWANIA — KRÓTKIE ZADANIA NA GWIAZDKI I CODZIENNE WYZWANIE.',
        '• BOSS RUSH — WSZYSCY BOSSOWIE PO KOLEI. • PRZETRWANIE — FALE BEZ KOŃCA.',
        '• EKSTRA — OSIĄGNIĘCIA, BESTIARIUSZ, MUZYKA I WŁASNE ETAPY Z EDYTORA.',
        'POKONAJ PADLINIARZA LUB ŻMIJĘ BEZ UTRATY ŻYCIA, BY NIMI ZAGRAĆ.'] },
      { demo: 'boss', head: 'RADY NA BOSSÓW', lines: () => [
        '• NIE STÓJ NA LINII BOSSA — PODCHODŹ Z GÓRY LUB Z DOŁU I ATAKUJ Z BOKU.',
        '• PRZY 30% ŻYCIA WIĘKSZOŚĆ BOSSÓW WPADA W SZAŁ: PRZESKAKUJ SZARŻE',
        '  I BIJ, GDY ŁAPIĄ ZADYSZKĘ.',
        '• STARY KIEŁ PO UDERZENIU W ŚCIANĘ JEST OGŁUSZONY — TO TWOJA SZANSA.',
        '• ZĘBACZ ZNIKA W ŚCIEKACH: ODSUŃ SIĘ OD BĄBELKÓW I KONTRUJ PO LĄDOWANIU.',
        '• BRYGADZISTA: ŁYŻKA Z GÓRY BIJE PRZED KOPARKĘ, SZARŻA IDZIE PO LINII — BIJ Z BOKU.',
        '• DYNAMIT NA BOSSA TO PEWNE OBRAŻENIA. SUPER ZOSTAW NA KONIEC WALKI.'] },
      { demo: 'end', head: 'GOTOWY?', lines: () => [
        'TO WSZYSTKO, CO MUSISZ WIEDZIEĆ. NAJLEPIEJ POĆWICZ RUCHY NA MANEKINACH.',
        'SEKRET: UWOLNIJ WSZYSTKIE DINOZAURY W ZAGRODZIE I ODKRYJ 3 SEKRETY',
        'W JEDNYM PRZEJŚCIU, A ZOBACZYSZ PRAWDZIWE ZAKOŃCZENIE...',
        '',
        '{ok|ENTER} — PRZEJDŹ DO TRENINGU'] }
    ] }
  ];
  const keyOfP2 = a => '{' + a + ':1|' + (keysFor(1, a).split(' / ')[0] || '?') + '}';
  // ---- pokazy ruchów (animacje w ramce strony)
  const demoBuilds = {};
  const demoBuild = k => demoBuilds[k] || (demoBuilds[k] = ENEMIES[k].mk());
  function demoHero() { const k = selKeys()[app.sel] || 'kruk'; return CHARS[k] || CHARS.kruk; }
  function drawHowtoDemo(kind, bx, by, bw, bh, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    const g = ctx.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, '#2a3a5a'); g.addColorStop(0.62, '#5a6a8a'); g.addColorStop(0.63, '#6a5440'); g.addColorStop(1, '#4a3a2a');
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    const fy = by + bh - 8, hero = demoHero(), hb = hero.build, cx = bx + bw / 2;
    const fig = (b, pose, x, y, face, opt) => SP.drawFigure(ctx, b, pose, x, y, face, opt || {});
    const cyc = (n, len) => Math.floor(t / len) % n;
    const grunt = demoBuild('grunt');
    switch (kind) {
      case 'move': { const x = bx + 30 + ((t * 0.8) % (bw - 60)); fig(hb, P.walk[cyc(4, 7)], x, fy, 1); break; }
      case 'run': {
        const ph = t % 160;
        if (ph < 90) fig(hb, P.run[cyc(4, 5)], bx + 20 + ph * 2.2, fy, 1);
        else { const k = (ph - 90) / 70, x = bx + 218 + k * 40, z = Math.sin(k * Math.PI) * 30; fig(hb, P.jump[0], Math.min(x, bx + bw - 20), fy - z, 1); }
        break;
      }
      case 'hud': {
        ctx.fillStyle = P_COLS[0]; ctx.fillRect(bx + 10, by + 8, 24, 24); ctx.fillStyle = '#2a3a5a'; ctx.fillRect(bx + 11, by + 9, 22, 22);
        ctx.save(); ctx.beginPath(); ctx.rect(bx + 11, by + 9, 22, 22); ctx.clip(); SP.drawPortrait(ctx, hb, bx + 22, by + 22, 7, false); ctx.restore();
        bar(bx + 40, by + 18, 90, 6, 0.75, 0.8, '#3ad04a');
        ctx.fillStyle = '#ff8a20'; ctx.fillRect(bx + 40, by + 27, 90 * ((t % 200) / 200), 2);
        ctx.fillStyle = '#140c10'; ctx.fillRect(cx + 40, by + 6, 30, 18);
        bar(bx + 40, by + 42, 90, 5, 0.6, 0.7, '#e0c040');
        fig(grunt, P.idle[0], bx + bw - 40, fy, -1);
        break;
      }
      case 'combo': {
        const seq = hero.combo || ['jab', 'cross', 'jab', 'kick'], i = cyc(seq.length + 2, 14);
        const mv = MOVES[seq[Math.min(i, seq.length - 1)]] || MOVES.jab;
        fig(hb, i < seq.length ? P[mv.pose][0] : P.idle[0], cx - 30, fy, 1);
        const knocked = i >= seq.length - 1;
        if (knocked) { const k = ((t % ((seq.length + 2) * 14)) - (seq.length - 1) * 14) / 42; fig(grunt, P.fall[0], cx + 18 + k * 50, fy - Math.sin(Math.min(1, k) * Math.PI) * 20, -1); }
        else { fig(grunt, t % 14 < 7 ? P.hurt[0] : P.idle[0], cx + 4, fy, -1); if (t % 14 < 3) SP.drawSpark(ctx, cx - 6, fy - 30, 0.3, false); }
        break;
      }
      case 'jumpkick': {
        const k = (t % 70) / 70, x = bx + 40 + k * 120, z = Math.sin(k * Math.PI) * 34;
        fig(hb, k > 0.35 && k < 0.8 ? P.jumpkick[0] : P.jump[0], x, fy - z, 1);
        fig(grunt, k > 0.7 ? P.fall[0] : P.idle[0], bx + 180 + (k > 0.7 ? (k - 0.7) * 80 : 0), fy - (k > 0.7 ? 10 : 0), -1);
        break;
      }
      case 'launch': {
        const ph = t % 120, up = ph < 16 ? P.upper[0] : (ph % 24 < 12 ? P.jab[0] : P.cross[0]);
        fig(hb, up, cx - 22, fy, 1);
        const z = ph < 10 ? 0 : 20 + Math.abs(Math.sin((ph - 10) * 0.09)) * 30;
        fig(grunt, P.fall[0], cx + 6, fy - z, -1);
        if (ph > 16 && ph % 24 < 3) SP.drawSpark(ctx, cx + 6, fy - z - 20, 0.3, true);
        break;
      }
      case 'grab': case 'suplex': {
        const ph = t % 120;
        if (kind === 'grab') {
          fig(hb, ph < 70 ? (ph % 20 < 10 ? P.knee[0] : P.grab[0]) : P.throw[0], cx - 14, fy, 1);
          if (ph < 70) fig(grunt, P.hurt[0], cx + 2, fy, -1);
          else { const k = (ph - 70) / 50; fig(grunt, P.fall[0], cx - 20 - k * 70, fy - Math.sin(k * Math.PI) * 28, 1); }
        } else {
          fig(hb, ph < 40 ? P.grab[0] : P.throw[0], cx - 14, fy, 1);
          if (ph < 40) fig(grunt, P.idle[0], cx + 2, fy, 1);
          else { const k = Math.min(1, (ph - 40) / 30); fig(grunt, P.fall[0], cx - 10 * k, fy - Math.sin(k * Math.PI) * 30, -1); }
        }
        break;
      }
      case 'block': case 'parry': {
        const ph = t % 60;
        fig(hb, P.guard[0], cx - 26, fy, 1);
        ctx.strokeStyle = 'rgba(128,240,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx - 14, fy - 26, 5, 16, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        fig(grunt, ph < 20 ? P.jab[0] : P.idle[0], cx + 4, fy, -1);
        if (ph < 6) SP.drawSpark(ctx, cx - 10, fy - 26, 0.3, kind === 'parry');
        break;
      }
      case 'special': fig(hb, P.spin[cyc(2, 4)], cx, fy, 1); fig(grunt, P.fall[0], cx + 44, fy - 12, -1); fig(grunt, P.fall[0], cx - 44, fy - 12, 1); break;
      case 'super': {
        fig(hb, t % 60 < 30 ? P.victory[0] : P.spin[cyc(2, 4)], cx, fy, 1);
        const r = (t % 60) * 2.5; ctx.strokeStyle = `rgba(255,230,160,${1 - (t % 60) / 60})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, fy, r, r * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'melee': {
        ['pipe', 'machete', 'chain', 'rifle'].forEach((w, i) => SP.drawItem(ctx, w, bx + 30 + i * 30, fy - 2, t));
        fig(hb, t % 20 < 10 ? P.swingUp[0] : P.swingDown[0], cx + 70, fy, 1, { weapon: ['pipe', 'machete', 'chain'][cyc(3, 40)] });
        break;
      }
      case 'foes': {
        const fl = demoBuild('flamer'), k = t % 90;
        fig(fl, k < 30 ? P.idle[0] : P.aim[0], bx + 40, fy, 1, { weapon: 'flamer' });
        if (k >= 30) drawFlame({ state: 'flame', t: Math.min(70, k - 14), face: 1 }, bx + 40, fy);
        const rx = bx + 120 + Math.sin(t * 0.03) * 20;
        SP.drawRaptor(ctx, rx, fy, -1, t, 'run', { body: '#7a5a3a', belly: '#c8a878', stripe: '#3a2a1a' }, {});
        fig(demoBuild('grunt'), SEAT, rx + 1, fy - 25, -1, { weapon: 'knife' });
        drawGlider({ b: demoBuild('glider'), face: -1, state: 'glide', t: 0 }, bx + bw - 30 - ((t * 0.8) % (bw - 60)), by + 70, false);
        break;
      }
      case 'train': {
        // tło etapu przeskalowane do szerokości ramki, wyrównane do dołu (widać platformę)
        const T = window.SPECIAL_STAGES.train, k = bw / W, top = by + bh - H * k, deckY = top + 192 * k;
        ctx.save(); ctx.translate(bx, top); ctx.scale(k, k);
        T.drawBack(ctx, {}, 300, t); T.drawFront(ctx, {}, 300, t);
        ctx.restore();
        const ph = t % 100, fly = Math.max(0, ph - 20);
        fig(hb, ph < 20 ? P.jab[0] : P.idle[0], cx - 20, deckY, 1);
        if (ph < 60) fig(demoBuild('grunt'), ph < 20 ? P.idle[0] : P.fall[0], cx + 10 + fly * 1.2, deckY - fly * 0.5 - (ph > 20 ? 8 : 0), -1);
        break;
      }
      case 'barrel': {
        const ph = t % 120;
        if (ph < 30) { fig(hb, ph < 12 ? P.crouch[0] : P.hammerUp[0], bx + 60, fy, 1); SP.drawBarrel(ctx, bx + 62, fy - (ph < 12 ? 2 : 52), 2, 'barrel'); }
        else if (ph < 40) { fig(hb, P.throw[0], bx + 60, fy, 1); SP.drawBarrel(ctx, bx + 70 + (ph - 30) * 5, fy - 50 + (ph - 30) * 2, 2, 'barrel'); }
        else { fig(hb, P.idle[0], bx + 60, fy, 1); const k = Math.min(1, (ph - 40) / 30); if (k < 1) SP.drawBarrel(ctx, bx + 120 + k * 120, fy - 30 + k * 18, 2, 'barrel'); }
        fig(grunt, ph > 52 && ph < 100 ? P.fall[0] : P.idle[0], bx + 190, fy - (ph > 52 && ph < 100 ? 10 : 0), -1);
        fig(grunt, ph > 62 && ph < 110 ? P.fall[0] : P.idle[0], bx + 230, fy - (ph > 62 && ph < 110 ? 10 : 0), -1);
        break;
      }
      case 'thrown': {
        ['dynamite', 'grenade', 'bottle'].forEach((w, i) => SP.drawItem(ctx, w, bx + 30 + i * 26, fy - 2, t));
        const k = (t % 60) / 60;
        fig(hb, k < 0.2 ? P.lob[0] : P.throw[0], cx + 10, fy, 1);
        if (k > 0.15) SP.drawShot(ctx, { type: 'grenade', fuse: 99 }, cx + 20 + k * 80, fy - 30 - Math.sin(k * Math.PI) * 30 + k * 28, t);
        break;
      }
      case 'tame': {
        const ph = t % 160;
        if (ph < 70) { SP.drawRaptor(ctx, cx + 30, fy, -1, t, 'down', RAPTOR_COLS[0], {}); drawStars(cx + 22, fy - 30); fig(hb, P.walk[cyc(4, 7)], bx + 30 + ph, fy, 1); }
        else { const x = bx + 60 + (ph - 70) * 1.6; SP.drawRaptor(ctx, x, fy, 1, t, 'run', RAPTOR_COLS[0], {}); fig(hb, P.crouch[0], x - 2, fy - 16, 1); }
        break;
      }
      case 'jeep': SP.drawJeep(ctx, bx + 40 + ((t * 1.2) % (bw - 40)), fy, 1, t, {}); break;
      case 'items': ['meat', 'fruit', 'coin', 'gem', 'amber', '1up'].forEach((w, i) => SP.drawItem(ctx, w, bx + 26 + i * 38, fy - 4, t)); break;
      case 'hazard': {
        ctx.fillStyle = '#5ac82a'; ctx.beginPath(); ctx.ellipse(bx + 70, fy - 2, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(70,110,120,0.6)'; ctx.fillRect(bx + 130, by + bh * 0.62, bw - 130, 14 + Math.sin(t * 0.04) * 6);
        fig(hb, P.walk[cyc(4, 9)], bx + 180, fy, 1);
        break;
      }
      case 'map': SP.drawItem(ctx, 'amber', bx + 40, fy - 4, t); SP.drawJeep(ctx, cx + 40, fy, -1, t, {}); fig(hb, P.victory[0], cx - 40, fy, 1); break;
      case 'coop': case 'teamthrow': {
        const b2 = altBuild(CHAR_KEYS[1]);
        if (kind === 'coop') { fig(hb, P.idle[cyc(2, 28)], cx - 30, fy, 1); fig(b2, P.victory[0], cx + 30, fy, -1); }
        else {
          const k = (t % 80) / 80;
          fig(hb, k < 0.2 ? P.guard[0] : P.throw[0], bx + 50, fy, 1);
          fig(CHARS[CHAR_KEYS[1]].build, P.jumpkick[0], bx + 70 + k * 160, fy - 8 - Math.sin(k * Math.PI) * 14, 1);
          fig(grunt, k > 0.75 ? P.fall[0] : P.idle[0], bx + 220, fy - (k > 0.75 ? 12 : 0), -1);
        }
        break;
      }
      case 'modes': fig(demoBuild('dummy'), P.idle[0], cx + 30, fy, -1); fig(hb, P[['jab', 'cross', 'kick'][cyc(3, 12)]][0], cx - 2, fy, 1); break;
      case 'boss': SP.drawRaptor(ctx, cx + 40, fy, -1, t, 'roar', REX_COLS, { scale: 1.3, rex: true }); fig(hb, P.jump[0], cx - 60, fy - 20 - Math.sin(t * 0.08) * 8, 1); break;
      case 'end': fig(hb, P.victory[0], cx - 40, fy, 1); fig(CHARS[CHAR_KEYS[1]].build, P.victory[0], cx, fy, 1); SP.drawRaptor(ctx, cx + 60, fy, -1, t, 'idle', RAPTOR_COLS[0], {}); break;
    }
    ctx.restore();
    ctx.strokeStyle = '#140c10'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
  }
  const HT_X = 116, HT_W = W - HT_X - 6;
  function drawHowto() {
    drawScoresBg();
    ctx.fillStyle = 'rgba(10,6,16,0.6)'; ctx.fillRect(0, 0, W, H);
    const h = app.howto;
    HOWTO.forEach((c, i) => {
      if (i !== h.ch) return;
      ctx.fillStyle = 'rgba(255,200,60,0.18)'; ctx.fillRect(4, 22 + i * 17 - 2, HT_X - 8, 13);
    });
    drawHowtoDemo(HOWTO[h.ch].pages[h.pg].demo, HT_X, 30, HT_W, 82, app.frame || 0);
  }
  function drawHowtoText() {
    const h = app.howto, ch = HOWTO[h.ch], pg = ch.pages[h.pg];
    text('JAK GRAĆ', W / 2, 5, 8, '#ffe080', 'center');
    HOWTO.forEach((c, i) => text((i === h.ch ? '► ' : '') + c.title, 8, 22 + i * 17, 4.5, i === h.ch ? '#ffe040' : '#a0a0b0'));
    text(pg.head, HT_X, 19, 6, '#fff');
    text('STRONA ' + (h.pg + 1) + '/' + ch.pages.length, W - 6, 20, 4, '#c0c0c0', 'right');
    pg.lines().forEach((l, i) => text(l, HT_X, 117 + i * 12, 4, '#e8e0f0'));
    text('▲▼ ROZDZIAŁ   ◄► / {ok|ENTER} STRONA   {back|ESC} — POWRÓT', W / 2, 212, 4, '#c0c0c0', 'center');
  }
  function openHowto() { app.mode = 'howto'; app.t = 0; app.howto = app.howto || { ch: 0, pg: 0 }; safeSet('paleo_howto', '1'); }
  function updateHowto() {
    const h = app.howto, n = HOWTO.length;
    if (pressed.up) { h.ch = (h.ch + n - 1) % n; h.pg = 0; sfx('select'); }
    if (pressed.down) { h.ch = (h.ch + 1) % n; h.pg = 0; sfx('select'); }
    const pages = HOWTO[h.ch].pages.length, last = h.ch === n - 1 && h.pg === pages - 1;
    if (pressed.left) {
      if (h.pg > 0) h.pg--; else if (h.ch > 0) { h.ch--; h.pg = HOWTO[h.ch].pages.length - 1; }
      sfx('select');
    }
    if (pressed.right || ((pressed.start || pressed.attack) && app.t > 5)) {
      if (last && !pressed.right) { sfx('start'); app.gameMode = 'training'; app.ngpRun = false; app.p2Active = false; app.mode = 'select'; app.t = 0; return; }
      if (h.pg < pages - 1) h.pg++; else if (h.ch < n - 1) { h.ch++; h.pg = 0; }
      sfx('select');
    }
    if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); }
  }
