/* =============================================================================
   RADA · i18n.js — le quattro lingue

   Non dipende da nulla, come il modello: contiene solo parole, e va caricato
   per primo. La direzione delle dipendenze resta quella di sempre —
   i18n/model ← audio ← sketch/ui.

   Due regole che valgono qui più che altrove:

   LE FRASI STANNO INTERE NEL DIZIONARIO, non si compongono concatenando
   pezzi. "palette pomeriggio" in giapponese diventa "昼下がりのパレット":
   l'ordine si rovescia, e nessuna concatenazione può prevederlo.

   LE STRINGHE DEL CANVAS SONO IN CACHE. `draw` gira a 60 fps e non deve
   costruire testo né, peggio, creare formattatori Intl: si preparano qui a
   ogni cambio di lingua e lì si limitano a leggerle.
============================================================================= */

const LANGS = ["it", "fr", "en", "ja"];
const LANG_LABEL = { it: "IT", fr: "FR", en: "EN", ja: "日本語" };

/* Lo spazio unificatore stretto che il francese vuole prima dei due punti:
   scritto in codice, così non lo si scambia per uno spazio normale.        */
const NNBSP = " ";

const STRINGS = {

  it: {
    "meta.description": "Quattro frasi sonore di lunghezza diversa che non tornano mai insieme allo stesso modo. Strumento generativo nel browser.",
    "ui.langNav":       "Lingua",
    "gate.text":        "Quattro frasi sonore di lunghezza diversa, ciascuna col proprio periodo.",
    "gate.enter":       "Entra",
    "card.title":       "Le quattro frasi",
    "card.hint":        "trascina: durata · clic: silenzia · ↻ nuova idea",
    "ctl.spread":       "Ampiezza registro",
    "ctl.warmth":       "Calore timbrico",
    "ctl.rev":          "Spazio / coda",
    "ctl.dens":         "Densità dell'idea",
    "ctl.head":         "Addensamento",
    "ctl.densValue":    "max {n}",
    "power.play":       "Avvia",
    "power.pause":      "Pausa",
    "status.idle":      "in attesa",
    "status.paused":    "in pausa",
    "status.stopped":   "{state} · {time}, palette {palette}",
    "status.playing":   "in ascolto · {n} frasi su 4 · {time}, palette {palette}",
    "realign":          "si ripete ogni ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "ore",
    "unit.days":        "giorni",
    "canvas.phrase":    "FRASE",
    "canvas.seconds":   "s",
    "canvas.drops":     { one: "{n} GOCCIA", other: "{n} GOCCE" },
    mood: { sereno: "Sereno", pioggia: "Pioggia", vespro: "Vespro", carillon: "Carillon",
            arcipelago: "Arcipelago", collina: "Collina", finestra: "Finestra", nuvola: "Nuvola" },
    palette: { alba: "alba", mattino: "mattino", pomeriggio: "pomeriggio",
               tramonto: "tramonto", sera: "sera", notturna: "notturna" },
  },

  fr: {
    "meta.description": "Quatre phrases sonores de longueurs différentes qui ne reviennent jamais ensemble de la même façon. Un instrument génératif dans le navigateur.",
    "ui.langNav":       "Langue",
    "gate.text":        "Quatre phrases sonores de longueurs différentes, chacune avec sa propre période.",
    "gate.enter":       "Entrer",
    "card.title":       "Les quatre phrases",
    "card.hint":        "glisser" + NNBSP + ": durée · clic" + NNBSP + ": silence · ↻ nouvelle idée",
    "ctl.spread":       "Étendue du registre",
    "ctl.warmth":       "Chaleur du timbre",
    "ctl.rev":          "Espace / traîne",
    "ctl.dens":         "Densité de l'idée",
    "ctl.head":         "Concentration",
    "ctl.densValue":    "max {n}",
    "power.play":       "Lancer",
    "power.pause":      "Pause",
    "status.idle":      "en attente",
    "status.paused":    "en pause",
    "status.stopped":   "{state} · {time}, palette {palette}",
    "status.playing":   "à l'écoute · {n} phrases sur 4 · {time}, palette {palette}",
    "realign":          "se répète tous les ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "heures",
    "unit.days":        "jours",
    "canvas.phrase":    "PHRASE",
    "canvas.seconds":   "s",
    "canvas.drops":     { one: "{n} GOUTTE", other: "{n} GOUTTES" },
    mood: { sereno: "Serein", pioggia: "Pluie", vespro: "Vêpres", carillon: "Carillon",
            arcipelago: "Archipel", collina: "Colline", finestra: "Fenêtre", nuvola: "Nuage" },
    palette: { alba: "aube", mattino: "matin", pomeriggio: "après-midi",
               tramonto: "crépuscule", sera: "soir", notturna: "nuit" },
  },

  en: {
    "meta.description": "Four sound phrases of different lengths that never come back together the same way. A generative instrument in the browser.",
    "ui.langNav":       "Language",
    "gate.text":        "Four sound phrases of different lengths, each with its own period.",
    "gate.enter":       "Enter",
    "card.title":       "The four phrases",
    "card.hint":        "drag: duration · click: mute · ↻ new idea",
    "ctl.spread":       "Register range",
    "ctl.warmth":       "Timbral warmth",
    "ctl.rev":          "Space / decay",
    "ctl.dens":         "Idea density",
    "ctl.head":         "Concentration",
    "ctl.densValue":    "max {n}",
    "power.play":       "Play",
    "power.pause":      "Pause",
    "status.idle":      "idle",
    "status.paused":    "paused",
    "status.stopped":   "{state} · {time}, {palette} palette",
    "status.playing":   "playing · {n} of 4 phrases · {time}, {palette} palette",
    "realign":          "repeats every ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "hours",
    "unit.days":        "days",
    "canvas.phrase":    "PHRASE",
    "canvas.seconds":   "s",
    "canvas.drops":     { one: "{n} DROP", other: "{n} DROPS" },
    mood: { sereno: "Clear", pioggia: "Rain", vespro: "Vespers", carillon: "Carillon",
            arcipelago: "Archipelago", collina: "Hillside", finestra: "Window", nuvola: "Cloud" },
    palette: { alba: "dawn", mattino: "morning", pomeriggio: "afternoon",
               tramonto: "dusk", sera: "evening", notturna: "night" },
  },

  ja: {
    "meta.description": "長さの異なる四つの音のフレーズが、二度と同じかたちで重ならない。ブラウザで動く生成的な楽器。",
    "ui.langNav":       "言語",
    "gate.text":        "長さの異なる四つの音のフレーズ。それぞれが固有の周期を持つ。",
    "gate.enter":       "入る",
    "card.title":       "四つのフレーズ",
    "card.hint":        "ドラッグ：長さ · クリック：消音 · ↻ 新しい楽想",
    "ctl.spread":       "音域の幅",
    "ctl.warmth":       "音色の温かみ",
    "ctl.rev":          "空間と余韻",
    "ctl.dens":         "楽想の密度",
    "ctl.head":         "集中度",
    "ctl.densValue":    "最大{n}",
    "power.play":       "再生",
    "power.pause":      "一時停止",
    "status.idle":      "待機中",
    "status.paused":    "一時停止中",
    "status.stopped":   "{state} · {time}、{palette}のパレット",
    "status.playing":   "再生中 · 4フレーズ中{n} · {time}、{palette}のパレット",
    "realign":          "約{t}で一巡",
    "unit.sep":         "",     // il giapponese non stacca il numero dall'unità
    "unit.min":         "分",
    "unit.hours":       "時間",
    "unit.days":        "日",
    "canvas.phrase":    "フレーズ",
    "canvas.seconds":   "秒",
    "canvas.drops":     { other: "{n}滴" },
    mood: { sereno: "凪", pioggia: "雨", vespro: "晩鐘", carillon: "風鈴",
            arcipelago: "島々", collina: "稜線", finestra: "窓辺", nuvola: "霞" },
    palette: { alba: "暁", mattino: "朝", pomeriggio: "昼下がり",
               tramonto: "夕暮れ", sera: "宵", notturna: "夜半" },
  },

};

/* --- scelta della lingua ---------------------------------------------------
   Ordine: indirizzo (?lang=ja, per condividere un link già in una lingua) →
   scelta salvata → preferenze del browser → inglese. `navigator.languages` è
   l'impostazione del browser, che quasi ovunque eredita da quella del
   sistema: nessun permesso da chiedere, nessuna rete — la stessa discrezione
   con cui il progetto legge l'ora.                                          */
const STORE_KEY = "rada.lang";

/* localStorage può essere vietato (navigazione privata, certe restrizioni su
   file://): l'app deve funzionare comunque, quindi ogni accesso è protetto. */
function readStored() {
  try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
}
function writeStored(v) {
  try { localStorage.setItem(STORE_KEY, v); } catch (e) {}
}

function detectLang() {
  let q = null;
  try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
  if (LANGS.includes(q)) return q;

  const saved = readStored();
  if (LANGS.includes(saved)) return saved;

  const prefs = navigator.languages && navigator.languages.length
              ? navigator.languages
              : [navigator.language || ""];
  for (const tag of prefs) {
    const primary = String(tag).toLowerCase().split("-")[0];
    if (primary === "it" || primary === "fr" || primary === "ja") return primary;
  }
  return "en";     // tutto il resto del mondo
}

let lang = detectLang();

/* --- formattatori ---------------------------------------------------------
   Costruiti UNA VOLTA per lingua. Crearne uno dentro draw costerebbe più
   del disegno stesso.                                                      */
let fmt0, fmt1, pluralRules;

function buildFormatters() {
  fmt0 = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 });
  fmt1 = new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  pluralRules = new Intl.PluralRules(lang);
}

const fmtInt = n => fmt0.format(n);
const fmtOne = n => fmt1.format(n);

/* --- lettura delle stringhe ----------------------------------------------- */
function T(key, vars) {
  let s = STRINGS[lang][key];
  if (s === undefined) s = STRINGS.en[key];
  if (s === undefined) return key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

const moodName    = id => (STRINGS[lang].mood    || {})[id] || id;
const paletteName = id => (STRINGS[lang].palette || {})[id] || id;

/* --- cache per il canvas --------------------------------------------------
   Le etichette dei quadranti non cambiano mai fra un fotogramma e l'altro:
   solo al cambio di lingua. Si preparano qui e `draw` le legge e basta.     */
const CANVAS = { phrase: [], drops: [], seconds: "", trackMul: 1 };
const MAX_DROPS_CACHE = 24;

function buildCanvasCache() {
  const roman = ["I", "II", "III", "IV"];
  CANVAS.phrase = roman.map(r => T("canvas.phrase") + " " + r);

  const forms = STRINGS[lang]["canvas.drops"];
  CANVAS.drops = [];
  for (let n = 0; n <= MAX_DROPS_CACHE; n++) {
    const tpl = forms[pluralRules.select(n)] || forms.other;
    CANVAS.drops[n] = tpl.split("{n}").join(fmtInt(n));
  }

  CANVAS.seconds = T("canvas.seconds");

  /* Il giapponese non si spazia come il latino: i glifi sono già a piena
     larghezza, e il tracking ampio delle etichette minute li slaccerebbe.  */
  CANVAS.trackMul = (lang === "ja") ? 0.35 : 1;
}

function dropsLabel(n) {
  return CANVAS.drops[n] !== undefined ? CANVAS.drops[n] : CANVAS.drops[MAX_DROPS_CACHE];
}

/* --- applicazione al documento -------------------------------------------- */
function applyI18n() {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = T(el.getAttribute("data-i18n"));
  });

  /* Le anteprime social restano in inglese nel sorgente, perché i crawler
     leggono prima che il JavaScript giri; qui si aggiornano comunque, per i
     motori che invece lo eseguono.                                         */
  const desc = T("meta.description");
  const m1 = document.querySelector('meta[name="description"]');
  const m2 = document.querySelector('meta[property="og:description"]');
  if (m1) m1.setAttribute("content", desc);
  if (m2) m2.setAttribute("content", desc);
}

function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  lang = l;
  writeStored(l);
  buildFormatters();
  buildCanvasCache();
  applyI18n();
  if (typeof onLanguageChange === "function") onLanguageChange();
}

buildFormatters();
buildCanvasCache();
