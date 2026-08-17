/* =============================================================================
   RADA · i18n.js — le quattro lingue

   Non dipende da nulla, come il modello: contiene solo parole, e va caricato
   per primo. La direzione delle dipendenze resta quella di sempre —
   i18n/model ← audio ← disegno/ui.

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
    "ui.guide":         "Guida",
    "ui.guideAria":     "Guida (si apre in una nuova scheda)",
    "foot.credits":     "questo è un progetto open source ideato da Valerio Belloni",
    "a11y.title":       "Comandi equivalenti da tastiera",
    "a11y.duration":    "Frase {n} · durata in secondi",
    "a11y.mute":        "Silenzia la frase {n}",
    "a11y.unmute":      "Riattiva la frase {n}",
    "a11y.regen":       "Nuova idea per la frase {n}",
    "a11y.dDuration":   "Tessuto {n} · durata in secondi",
    "a11y.dMute":       "Silenzia il tessuto {n}",
    "a11y.dUnmute":     "Riattiva il tessuto {n}",
    "a11y.dRegen":      "Nuova idea per il tessuto {n}",
    "media.artist":     "Strumento generativo",
    "gate.text":        "Uno spazio sonoro nel quale si può indugiare nei propri ricordi mentre si guarda fuori dalla finestra.",
    "gate.enter":       "Entra",
    "card.title":       "Le quattro frasi",
    "card.hint":        "trascina: durata · clic: silenzia · ↻ nuova idea",
    "ctl.spread":       "Ampiezza registro",
    "ctl.warmth":       "Calore",
    "ctl.rev":          "Spazio / coda",
    "ctl.dens":         "Densità dell'idea",
    "ctl.head":         "Addensamento",
    "ctl.densValue":    "max {n}",
    "power.play":       "Avvia",
    "power.pause":      "Pausa",
    "status.idle":      "in attesa",
    "status.paused":    "in pausa",
    "status.stopped":   "{state} · {when}, palette {palette}",
    "status.playing":   "in ascolto · {when}, palette {palette}",
    "realign":          "si ripete ogni ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "ore",
    "unit.days":        "giorni",
    "canvas.phrase":    "FRASE",
    "canvas.seconds":   "s",
    "canvas.drone":     "TESSUTO",
    "drone.title":      "I quattro tessuti",
    "dctl.spread":      "Estensione",
    "dctl.apri":        "Affioramento",
    "dctl.chiudi":      "Dissolvenza",
    "dctl.sovr":        "Intreccio",
    "dctl.battito":     "Battito",
    "unit.oct":         "ott.",
    "unit.s":           "s",
    "unit.hz":          "Hz",
    "drone.hint":       "trascina: durata · clic: silenzia · ↻ nuova idea",
    mood: { sereno: "Sereno", pioggia: "Pioggia", vespro: "Vespro", carillon: "Carillon",
            arcipelago: "Arcipelago", collina: "Collina", finestra: "Finestra", nuvola: "Nuvola" },
        droneMood: { velo: "Velo", fondale: "Fondale", lino: "Lino", respiro: "Respiro",
                 bruma: "Bruma", tenda: "Tenda", seta: "Seta", vela: "Vela" },
    palette: { alba: "alba", mattino: "mattino", pomeriggio: "pomeriggio",
               tramonto: "tramonto", sera: "sera", notturna: "notturna" },
    season:  { primavera: "primavera", estate: "estate", autunno: "autunno", inverno: "inverno" },
  },

  fr: {
    "meta.description": "Quatre phrases sonores de longueurs différentes qui ne reviennent jamais ensemble de la même façon. Un instrument génératif dans le navigateur.",
    "ui.langNav":       "Langue",
    "ui.guide":         "Guide",
    "ui.guideAria":     "Guide (s'ouvre dans un nouvel onglet)",
    "foot.credits":     "ce projet libre est une idée de Valerio Belloni",
    "a11y.title":       "Commandes équivalentes au clavier",
    "a11y.duration":    "Phrase {n} · durée en secondes",
    "a11y.mute":        "Mettre en silence la phrase {n}",
    "a11y.unmute":      "Réveiller la phrase {n}",
    "a11y.regen":       "Nouvelle idée pour la phrase {n}",
    "a11y.dDuration":   "Tissu {n} · durée en secondes",
    "a11y.dMute":       "Mettre en silence le tissu {n}",
    "a11y.dUnmute":     "Réveiller le tissu {n}",
    "a11y.dRegen":      "Nouvelle idée pour le tissu {n}",
    "media.artist":     "Instrument génératif",
    "gate.text":        "Un espace sonore où l'on peut s'attarder dans ses souvenirs en regardant par la fenêtre.",
    "gate.enter":       "Entrer",
    "card.title":       "Les quatre phrases",
    "card.hint":        "glisser" + NNBSP + ": durée · clic" + NNBSP + ": silence · ↻ nouvelle idée",
    "ctl.spread":       "Étendue du registre",
    "ctl.warmth":       "Chaleur",
    "ctl.rev":          "Espace / traîne",
    "ctl.dens":         "Densité de l'idée",
    "ctl.head":         "Concentration",
    "ctl.densValue":    "max {n}",
    "power.play":       "Lancer",
    "power.pause":      "Pause",
    "status.idle":      "en attente",
    "status.paused":    "en pause",
    "status.stopped":   "{state} · {when}, palette {palette}",
    "status.playing":   "à l'écoute · {when}, palette {palette}",
    "realign":          "se répète tous les ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "heures",
    "unit.days":        "jours",
    "canvas.phrase":    "PHRASE",
    "canvas.seconds":   "s",
    "canvas.drone":     "TISSU",
    "drone.title":      "Les quatre tissus",
    "dctl.spread":      "Étendue",
    "dctl.apri":        "Émergence",
    "dctl.chiudi":      "Fondu",
    "dctl.sovr":        "Entrelacs",
    "dctl.battito":     "Battement",
    "unit.oct":         "oct.",
    "unit.s":           "s",
    "unit.hz":          "Hz",
    "drone.hint":       "glisser" + NNBSP + ": durée · clic" + NNBSP + ": silence · ↻ nouvelle idée",
    mood: { sereno: "Serein", pioggia: "Pluie", vespro: "Vêpres", carillon: "Carillon",
            arcipelago: "Archipel", collina: "Colline", finestra: "Fenêtre", nuvola: "Nuage" },
        droneMood: { velo: "Voile", fondale: "Fond", lino: "Lin", respiro: "Souffle",
                 bruma: "Brume", tenda: "Rideau", seta: "Soie", vela: "Voilure" },
    palette: { alba: "aube", mattino: "matin", pomeriggio: "après-midi",
               tramonto: "crépuscule", sera: "soir", notturna: "nuit" },
    season:  { primavera: "printemps", estate: "été", autunno: "automne", inverno: "hiver" },
  },

  en: {
    "meta.description": "Four sound phrases of different lengths that never come back together the same way. A generative instrument in the browser.",
    "ui.langNav":       "Language",
    "ui.guide":         "Guide",
    "ui.guideAria":     "Guide (opens in a new tab)",
    "foot.credits":     "this is an open source project by Valerio Belloni",
    "a11y.title":       "Keyboard equivalents",
    "a11y.duration":    "Phrase {n} · length in seconds",
    "a11y.mute":        "Mute phrase {n}",
    "a11y.unmute":      "Unmute phrase {n}",
    "a11y.regen":       "New idea for phrase {n}",
    "a11y.dDuration":   "Weave {n} · length in seconds",
    "a11y.dMute":       "Mute weave {n}",
    "a11y.dUnmute":     "Unmute weave {n}",
    "a11y.dRegen":      "New idea for weave {n}",
    "media.artist":     "Generative instrument",
    "gate.text":        "A sound space where you can linger among your own memories while looking out of the window.",
    "gate.enter":       "Enter",
    "card.title":       "The four phrases",
    "card.hint":        "drag: duration · click: mute · ↻ new idea",
    "ctl.spread":       "Register range",
    "ctl.warmth":       "Warmth",
    "ctl.rev":          "Space / decay",
    "ctl.dens":         "Idea density",
    "ctl.head":         "Concentration",
    "ctl.densValue":    "max {n}",
    "power.play":       "Play",
    "power.pause":      "Pause",
    "status.idle":      "idle",
    "status.paused":    "paused",
    "status.stopped":   "{state} · {when}, {palette} palette",
    "status.playing":   "playing · {when}, {palette} palette",
    "realign":          "repeats every ≈ {t}",
    "unit.sep":         " ",
    "unit.min":         "min",
    "unit.hours":       "hours",
    "unit.days":        "days",
    "canvas.phrase":    "PHRASE",
    "canvas.seconds":   "s",
    "canvas.drone":     "WEAVE",
    "drone.title":      "The four weaves",
    "dctl.spread":      "Expanse",
    "dctl.apri":        "Surfacing",
    "dctl.chiudi":      "Fading",
    "dctl.sovr":        "Interlacing",
    "dctl.battito":     "Beating",
    "unit.oct":         "oct",
    "unit.s":           "s",
    "unit.hz":          "Hz",
    "drone.hint":       "drag: duration · click: mute · ↻ new idea",
    mood: { sereno: "Clear", pioggia: "Rain", vespro: "Vespers", carillon: "Carillon",
            arcipelago: "Archipelago", collina: "Hillside", finestra: "Window", nuvola: "Cloud" },
        droneMood: { velo: "Veil", fondale: "Backdrop", lino: "Linen", respiro: "Breath",
                 bruma: "Haze", tenda: "Curtain", seta: "Silk", vela: "Sail" },
    palette: { alba: "dawn", mattino: "morning", pomeriggio: "afternoon",
               tramonto: "dusk", sera: "evening", notturna: "night" },
    season:  { primavera: "spring", estate: "summer", autunno: "autumn", inverno: "winter" },
  },

  ja: {
    "meta.description": "長さの異なる四つの音のフレーズが、二度と同じかたちで重ならない。ブラウザで動く生成的な楽器。",
    "ui.langNav":       "言語",
    "ui.guide":         "手引き",
    "ui.guideAria":     "手引き（新しいタブで開きます）",
    "foot.credits":     "Valerio Belloniによる、オープンソースの企画です。",
    "a11y.title":       "キーボードでの操作",
    "a11y.duration":    "フレーズ{n}・長さ（秒）",
    "a11y.mute":        "フレーズ{n}を消音する",
    "a11y.unmute":      "フレーズ{n}をふたたび鳴らす",
    "a11y.regen":       "フレーズ{n}に新しい楽想",
    "a11y.dDuration":   "織り{n}・長さ（秒）",
    "a11y.dMute":       "織り{n}を消音する",
    "a11y.dUnmute":     "織り{n}をふたたび鳴らす",
    "a11y.dRegen":      "織り{n}に新しい楽想",
    "media.artist":     "生成的な楽器",
    "gate.text":        "窓の外を眺めながら、自分の記憶のなかに佇んでいられる音の空間。",
    "gate.enter":       "入る",
    "card.title":       "四つのフレーズ",
    "card.hint":        "ドラッグ：長さ · クリック：消音 · ↻ 新しい楽想",
    "ctl.spread":       "音域の幅",
    "ctl.warmth":       "温かみ",
    "ctl.rev":          "空間と余韻",
    "ctl.dens":         "楽想の密度",
    "ctl.head":         "集中度",
    "ctl.densValue":    "最大{n}",
    "power.play":       "再生",
    "power.pause":      "一時停止",
    "status.idle":      "待機中",
    "status.paused":    "一時停止中",
    "status.stopped":   "{state} · {when}、{palette}のパレット",
    "status.playing":   "再生中 · {when}、{palette}のパレット",
    "realign":          "約{t}で一巡",
    "unit.sep":         "",     // il giapponese non stacca il numero dall'unità
    "unit.min":         "分",
    "unit.hours":       "時間",
    "unit.days":        "日",
    "canvas.phrase":    "フレーズ",
    "canvas.seconds":   "秒",
    "canvas.drone":     "織り",
    "drone.title":      "四つの織り",
    "dctl.spread":      "広がり",
    "dctl.apri":        "立ち上がり",
    "dctl.chiudi":      "消えぎわ",
    "dctl.sovr":        "重なり",
    "dctl.battito":     "うなり",
    "unit.oct":         "oct",
    "unit.s":           "秒",
    "unit.hz":          "Hz",
    "drone.hint":       "ドラッグ：長さ · クリック：消音 · ↻ 新しい楽想",
    mood: { sereno: "凪", pioggia: "雨", vespro: "晩鐘", carillon: "風鈴",
            arcipelago: "島々", collina: "稜線", finestra: "窓辺", nuvola: "霞" },
        droneMood: { velo: "薄衣", fondale: "底", lino: "亜麻", respiro: "息",
                 bruma: "靄", tenda: "帳", seta: "絹", vela: "帆" },
    palette: { alba: "暁", mattino: "朝", pomeriggio: "昼下がり",
               tramonto: "夕暮れ", sera: "宵", notturna: "夜半" },
    season:  { primavera: "春", estate: "夏", autunno: "秋", inverno: "冬" },
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
let fmt0, fmt1, fmt2, fmtData;

function buildFormatters() {
  fmt0 = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 });
  fmt1 = new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  /* Due decimali: fra un intreccio di 1,10 e uno di 1,15 c'è una differenza
     che si sente, e una cifra sola la nasconderebbe.                      */
  fmt2 = new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /* Giorno e mese, nell'ordine che ogni lingua vuole: "11 agosto" in
     italiano, "August 11" in inglese, "8月11日" in giapponese. L'inversione
     non si scrive a mano — la sa Intl, e la sa meglio.                    */
  fmtData = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long" });
}

const fmtInt  = n => fmt0.format(n);
const fmtOne  = n => fmt1.format(n);
const fmtTwo  = n => fmt2.format(n);
const fmtGiorno = d => fmtData.format(d);

/* --- lettura delle stringhe ----------------------------------------------- */
function T(key, vars) {
  let s = STRINGS[lang][key];
  if (s === undefined) s = STRINGS.en[key];
  if (s === undefined) return key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

const moodName    = id => (STRINGS[lang].mood    || {})[id] || id;
const droneMoodName = id => (STRINGS[lang].droneMood || {})[id] || id;
const paletteName = id => (STRINGS[lang].palette || {})[id] || id;
const seasonName  = id => (STRINGS[lang].season  || {})[id] || id;

/* --- cache per il canvas --------------------------------------------------
   Le etichette dei quadranti non cambiano mai fra un fotogramma e l'altro:
   solo al cambio di lingua. Si preparano qui e `draw` le legge e basta.     */
const CANVAS = { phrase: [], drone: [], seconds: "", trackMul: 1 };

function buildCanvasCache() {
  const roman = ["I", "II", "III", "IV"];
  CANVAS.phrase = roman.map(r => T("canvas.phrase") + " " + r);
  CANVAS.drone  = roman.map(r => T("canvas.drone")  + " " + r);
  CANVAS.seconds = T("canvas.seconds");

  /* Il giapponese non si spazia come il latino: i glifi sono già a piena
     larghezza, e il tracking ampio delle etichette minute li slaccerebbe.  */
  CANVAS.trackMul = (lang === "ja") ? 0.35 : 1;
}

/* --- il selettore di lingua ------------------------------------------------
   Costruito qui e non nelle singole pagine, perché dev'essere identico
   ovunque compaia: interfaccia e guida hanno le stesse quattro sigle, con lo
   stesso comportamento. Prima esisteva in due copie e sarebbero divergute.  */
let langSwitchEl = null;

function buildLangSwitch(el) {
  if (!el) return;
  langSwitchEl = el;
  LANGS.forEach(l => {
    const b = document.createElement("button");
    b.className = "lang";
    b.dataset.lang = l;
    b.textContent = LANG_LABEL[l];
    if (l === "ja") b.lang = "ja";   // così le sintesi vocali lo leggono giusto
    b.onclick = () => setLang(l);
    el.appendChild(b);
  });
  markLang();
}

function markLang() {
  if (!langSwitchEl) return;
  langSwitchEl.querySelectorAll(".lang").forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle("sel", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  langSwitchEl.setAttribute("aria-label", T("ui.langNav"));
}

/* --- applicazione al documento --------------------------------------------
   Due attributi, non uno: `data-i18n` scrive testo semplice, `data-i18n-html`
   accetta il marcatore interno (corsivi, risalti, capoversi) di cui la guida
   ha bisogno. Le stringhe vengono da questi file, non da fuori.            */
function applyI18n() {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = T(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = T(el.getAttribute("data-i18n-html"));
  });

  /* L'etichetta che sente chi non vede: un collegamento che apre una scheda
     nuova va annunciato, altrimenti il cambio di contesto arriva senza
     preavviso. Sullo schermo non compare nulla.                            */
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", T(el.getAttribute("data-i18n-aria")));
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
  markLang();
  if (typeof onLanguageChange === "function") onLanguageChange();
}

buildFormatters();
buildCanvasCache();
