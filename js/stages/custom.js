/* Własne etapy — plik generuje edytor (editor.html → „Eksportuj custom.js”).
 * Zastąp ten plik wyeksportowanym, a etapy pojawią się w grze: EKSTRA → WŁASNE ETAPY.
 * Etapy zapisane w edytorze widać tam także bez eksportu (pamięć przeglądarki).
 */
window.CUSTOM_STAGES = window.CUSTOM_STAGES || [];
window.CUSTOM_STAGES.push({
  "id": "przyklad-nocny-patrol",
  "name": "PRZYKŁAD — NOCNY PATROL",
  "sub": "KRÓTKI ETAP Z EDYTORA",
  "theme": 1,
  "LEN": 2000,
  "music": "stage2",
  "bossMusic": "boss",
  "diff": 1.1,
  "weather": "mist",
  "WAVES": [
    { "lock": 300, "groups": [
      { "when": 0, "spawns": [{ "type": "grunt", "side": "R", "y": 175 }, { "type": "thin", "side": "L", "y": 200, "delay": 40 }] },
      { "when": 1, "spawns": [{ "type": "raptor", "side": "R", "y": 190 }] }] },
    { "lock": 900, "groups": [
      { "when": 0, "spawns": [{ "type": "shield", "side": "R", "y": 185 }, { "type": "bomber", "side": "R", "y": 165, "delay": 30 }, { "type": "grunt", "side": "L", "y": 205, "delay": 60 }] }] },
    { "lock": 1616, "groups": [
      { "when": 0, "spawns": [{ "type": "zmija", "side": "R", "y": 185 }] },
      { "when": 1, "spawns": [{ "type": "thin", "side": "L", "y": 200, "delay": 200 }] }] }
  ],
  "PROPS": [
    { "x": 220, "y": 200, "kind": "barrel", "drop": "dynamite" },
    { "x": 640, "y": 175, "kind": "crate", "drop": "meat" },
    { "x": 1180, "y": 205, "kind": "fuel" },
    { "x": 1240, "y": 165, "kind": "fuel" },
    { "x": 1450, "y": 158, "kind": "wall", "secret": "treasure1up" }
  ],
  "PICKUPS": [{ "x": 520, "y": 190, "type": "coin" }, { "x": 1350, "y": 200, "type": "fruit" }],
  "VEHICLES": []
});
