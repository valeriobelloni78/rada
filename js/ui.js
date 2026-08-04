/* =============================================================================
   RADA · ui.js — i controlli attorno al canvas

   Cursori, mood, lingua, avvio e riga di stato restano elementi HTML: sono
   comandi standard, e come tali funzionano meglio se il browser li conosce
   (accessibilità, tastiera, comportamento nativo). Il canvas si occupa
   soltanto dei quadranti.
============================================================================= */

const $ = id => document.getElementById(id);

/* --- valori accanto ai cursori ------------------------------------------- */
function readouts() {
  $("vSpread").textContent = fmtInt(Math.round(G.spread)) + "%";
  // calore e spazio: se l'ora li inclina, si mostra "cursore → efficace"
  const wf = Math.round(G.warmth), we = Math.round(effWarmth * 100);
  const rf = Math.round(G.rev),    re = Math.round(effRev * 100);
  $("vWarmth").textContent = (we === wf) ? fmtInt(wf) + "%" : fmtInt(wf) + "→" + fmtInt(we) + "%";
  $("vRev").textContent    = (re === rf) ? fmtInt(rf) + "%" : fmtInt(rf) + "→" + fmtInt(re) + "%";
  $("vDens").textContent   = T("ctl.densValue", { n: fmtInt(Math.round(G.dens)) });
  $("vHead").textContent   = fmtInt(Math.round(G.head)) + "%";
}
setInterval(readouts, 120);

/* --- indicatore di riallineamento ----------------------------------------
   Le unità e il separatore decimale cambiano con la lingua: "4,7 ore" in
   italiano, "4.7 hours" in inglese, "約4.7時間で一巡" in giapponese. Se ne
   occupa Intl, non un replace cablato.                                     */
function onRealignChange() {
  const l = realignSeconds();
  const sep = T("unit.sep");
  let t;
  if (l < 3600)       t = fmtInt(Math.round(l / 60)) + sep + T("unit.min");
  else if (l < 86400) t = fmtOne(l / 3600)           + sep + T("unit.hours");
  else                t = fmtOne(l / 86400)          + sep + T("unit.days");
  $("realign").textContent = T("realign", { t });
}

/* --- riga di stato -------------------------------------------------------- */
function refreshStatus() {
  const d = new Date(), h = d.getHours();
  currentPalette = timePalette(h);
  const hh = String(h).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
  const time = hh + ":" + mm;
  const palette = paletteName(currentPalette.id);
  const st = $("status"), txt = $("statusText");

  if (!running) {
    st.classList.remove("live");
    // "in attesa" solo alla prima apertura; dopo un ascolto è una pausa
    const state = ctx ? T("status.paused") : T("status.idle");
    txt.textContent = T("status.stopped", { state, time, palette });
    return;
  }
  st.classList.add("live");
  const attivi = loops.filter(L => !L.muted).length;
  txt.textContent = T("status.playing", { n: fmtInt(attivi), time, palette });
}
setInterval(refreshStatus, 15000);

/* chiamate dal canvas quando cambia lo stato delle frasi */
function onLoopsChange() { refreshStatus(); }
/* Il pulsante è un COMANDO, non un indicatore: la scritta dice che cosa
   accadrà premendolo, non che cosa sta accadendo. Lo stato è già raccontato
   dal punto che pulsa e dalla riga in alto.                                */
function onPowerChange(on) {
  $("power").classList.toggle("on", on);
  $("powerLabel").textContent = on ? T("power.pause") : T("power.play");
  refreshStatus();
}

/* --- cursori -------------------------------------------------------------- */
PARAMS.forEach(k => {
  $(k).addEventListener("input", e => { GT[k] = +e.target.value; });
});

/* --- mood: preset sonori + durate delle frasi + nuove idee -----------------
   Il bottone porta l'id del preset; l'etichetta arriva dal dizionario e viene
   riscritta a ogni cambio di lingua senza ricostruire i bottoni, così la
   selezione corrente non si perde.                                         */
const moodsEl = $("moods");
Object.keys(MOODS).forEach((id, i) => {
  const b = document.createElement("button");
  b.className = "mood" + (i === 0 ? " sel" : "");
  b.dataset.mood = id;
  b.textContent = moodName(id);
  b.onclick = () => {
    document.querySelectorAll("#moods .mood").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    const m = MOODS[id];
    PARAMS.forEach(k => { GT[k] = m[k]; G[k] = m[k]; $(k).value = m[k]; });
    loops.forEach((L, k) => { L.target = L.period = m.periods[k]; L.idx = 0; });
    restartCycles();
    loops.forEach(regenerate);
    onRealignChange();
  };
  moodsEl.appendChild(b);
});

/* --- lingua ---------------------------------------------------------------
   Quattro sigle, quella attiva in arancione. La lingua di partenza la decide
   il browser (vedi detectLang in i18n.js); da qui in poi comanda la scelta
   dell'utente, che resta memorizzata.                                      */
const langsEl = $("langs");
LANGS.forEach(l => {
  const b = document.createElement("button");
  b.className = "lang";
  b.dataset.lang = l;
  b.textContent = LANG_LABEL[l];
  if (l === "ja") b.lang = "ja";   // così le sintesi vocali lo leggono giusto
  b.onclick = () => setLang(l);
  langsEl.appendChild(b);
});

function markLang() {
  langsEl.querySelectorAll(".lang").forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle("sel", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  langsEl.setAttribute("aria-label", T("ui.langNav"));
}

/* Chiamata da setLang (i18n.js) dopo che il documento è già stato tradotto:
   qui si aggiorna solo ciò che il dizionario non raggiunge da solo, cioè il
   testo costruito a runtime.                                               */
function onLanguageChange() {
  document.querySelectorAll("#moods .mood").forEach(b => {
    b.textContent = moodName(b.dataset.mood);
  });
  markLang();
  onPowerChange(running);
  onRealignChange();
  readouts();
}

/* --- avvio ---------------------------------------------------------------- */
$("power").addEventListener("click", togglePower);

// barra spaziatrice: avvia e ferma
addEventListener("keydown", e => {
  if (e.code === "Space" && !/^(INPUT|BUTTON|TEXTAREA)$/.test(e.target.tagName)) {
    e.preventDefault();
    togglePower();
  }
});

/* --- soglia d'ingresso ----------------------------------------------------
   I browser vietano l'audio prima di un gesto esplicito dell'utente: la
   schermata d'ingresso trasforma quel vincolo in un momento di presentazione.
--------------------------------------------------------------------------- */
$("gate").addEventListener("click", async () => {
  $("gate").classList.add("off");
  await togglePower();
});

applyI18n();
markLang();
$("powerLabel").textContent = T("power.play");
refreshStatus();
onRealignChange();
readouts();
