/* PALEO HIGHWAY — konfiguracja gry.
 * Zmień wartości i odśwież stronę w przeglądarce.
 * Wartości poniżej są domyślne — zmiany zrobione w menu OPCJE zapisują się w przeglądarce
 * i mają pierwszeństwo; „PRZYWRÓĆ DOMYŚLNE” w menu wraca do tych wartości.
 */
window.GAME_CONFIG = {
  // true = po wyborze postaci pojawia się ekran wyboru etapu
  debug: false,
  // język gry: 'auto' (wg przeglądarki), 'pl' (polski), 'en' (English)
  lang: 'auto',
  // poziom trudności: 'easy' (łatwy), 'normal' (normalny), 'arcade'
  difficulty: 'normal',
  // liczba żyć na start (1–5)
  lives: 3,
  // głośność 0–10
  musicVolume: 7,
  sfxVolume: 8,
  // tryb opiekuna: automatyczne bloki i podpowiedzi o nowych wrogach
  assist: false,
  // sterowanie dotykowe: 'auto' (na telefonach/tabletach), 'on', 'off'
  touch: 'auto',
  // filtr CRT: 'off' (wyłączony), 'arcade' (automat), 'pc' (monitor PC), 'tv' (stary telewizor)
  // (liczony na karcie graficznej przez WebGL; bez WebGL — na procesorze)
  crt: 'off',
  // filtr CRT wyłącza się sam do końca sesji, gdy gra zaczyna zwalniać (true/false)
  crtAuto: true,
  // wibracje pada przy trafieniach i wybuchach (true/false)
  rumble: true,
  // ramka automatu (grafika obudowy) wokół ekranu gry zamiast czarnych pasów (true/false)
  bezel: true,
  // wspólna tabela wyników w sieci: adres serwera z tools/score-server.mjs, np. 'https://wyniki.example.com'
  // pusty tekst = tylko lokalne tabele
  onlineScores: ''
};
