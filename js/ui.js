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
  syncA11y();          // il trascinamento sul canvas deve riscrivere i cursori
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
  const attivi = gocceOn ? loops.filter(L => !L.muted).length : 0;
  txt.textContent = T("status.playing", { n: fmtInt(attivi), time, palette });
}
setInterval(refreshStatus, 15000);

/* Annunci dal canvas: il disegno segnala che qualcosa è cambiato senza
   sapere chi lo ascolta. */
function onLoopsChange() { refreshStatus(); syncA11y(); }
addEventListener("rada:loops",   onLoopsChange);
addEventListener("rada:realign", () => onRealignChange());
/* Il pulsante è un COMANDO, non un indicatore: la scritta dice che cosa
   accadrà premendolo, non che cosa sta accadendo. Lo stato è già raccontato
   dal punto che pulsa e dalla riga in alto.                                */
function onPowerChange() {
  $("power").classList.toggle("on", gocceOn);
  $("powerLabel").textContent = gocceOn ? T("power.pause") : T("power.play");
  $("powerTessuti").classList.toggle("on", tessutiOn);
  $("powerTessutiLabel").textContent = tessutiOn ? T("power.pause") : T("power.play");
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

/* --- i cinque cursori dei tessuti -------------------------------------------
   A differenza di quelli delle frasi, questi non hanno bisogno di smussatura:
   un tessuto riceve il suo inviluppo nell'istante in cui viene prenotato, e
   da lì non cambia più. Le modifiche valgono per i tessuti successivi — che è
   inevitabile, e onesto: un suono lungo non si può ritoccare mentre dura.

   I valori sono in unità vere, quindi ciascuno ha la sua lettura.        */
const LETTURA_D = {
  /* "oct" e "Hz" restano in alfabeto latino in tutte le lingue, e una sigla
     latina attaccata a una cifra si legge male: quelle vogliono lo spazio
     anche in giapponese. I secondi no, perché lì l'unità è 秒, un kanji che
     si attacca al numero come vuole la sua tipografia — e infatti è
     `unit.sep` a saperlo.                                                */
  spread:  v => fmtOne(v / 100 * 4) + " " + T("unit.oct"),
  apri:    v => fmtOne(v)           + T("unit.sep") + T("unit.s"),
  chiudi:  v => fmtOne(v)           + T("unit.sep") + T("unit.s"),
  sovr:    v => fmtTwo(v),                                     // numero puro: quante sovrapposte
  battito: v => fmtTwo(v)           + " " + T("unit.hz"),
};

function letturaTessuti() {
  DPARAMS.forEach(k => { $("v_" + k).textContent = LETTURA_D[k](D[k]); });
}

DPARAMS.forEach(k => {
  $("d_" + k).addEventListener("input", e => {
    D[k] = +e.target.value;
    letturaTessuti();
    /* Intreccio e densità decidono insieme quanto dura ogni tessuto: mosso
       quello, il piano va ricostruito, altrimenti la nuova misura si vedrebbe
       solo al giro dopo.                                                  */
    if (k === "sovr") droni.forEach(buildPlanDrone);
  });
});

/* --- mood dei tessuti -------------------------------------------------------
   Il preset porta anche i due parametri senza cursore — quanti tessuti per
   giro e quanto stanno sotto alle gocce — perché sono il carattere del mood,
   non una manopola.                                                       */
const droniMoodsEl = $("droniMoods");
Object.keys(DRONI_MOODS).forEach((id, i) => {
  const b = document.createElement("button");
  b.className = "mood" + (i === 0 ? " sel" : "");
  b.dataset.droneMood = id;
  b.textContent = droneMoodName(id);
  b.onclick = () => {
    document.querySelectorAll("#droniMoods .mood").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    const m = DRONI_MOODS[id];
    DPARAMS.forEach(k => { D[k] = m[k]; $("d_" + k).value = m[k]; });
    D.dens = m.dens; D.liv = m.liv;
    droni.forEach((L, k) => { L.target = L.period = m.periods[k]; L.idx = 0; });
    restartCycles();
    droni.forEach(regeneraTenute);
    letturaTessuti();
    onDroniChange();
  };
  droniMoodsEl.appendChild(b);
});

/* Il riallineamento della seconda classe, con le stesse unità della prima. */
function onDroniChange() {
  const l = realignDroni();
  const sep = T("unit.sep");
  let t;
  if (l < 3600)       t = fmtInt(Math.round(l / 60)) + sep + T("unit.min");
  else if (l < 86400) t = fmtOne(l / 3600)           + sep + T("unit.hours");
  else                t = fmtOne(l / 86400)          + sep + T("unit.days");
  $("realignDroni").textContent = T("realign", { t });
  refreshStatus();
}

/* --- comandi equivalenti da tastiera --------------------------------------
   I quadranti vivono nel canvas, che per una tastiera e per un lettore di
   schermo è una superficie muta: trascinare, silenziare e rigenerare erano
   gesti raggiungibili solo col puntatore. Qui gli stessi tre comandi
   esistono come elementi HTML nativi, fuori campo ma nel documento.

   La sincronia va in DUE direzioni: questi comandi cambiano il modello, e il
   trascinamento sul canvas riscrive questi comandi (vedi syncA11y, chiamata
   da onRealignChange e onLoopsChange).                                     */
const ROMAN = ["I", "II", "III", "IV"];
const a11yEls = [];

(function buildA11y() {
  const box = $("a11yLoops");
  loops.forEach((L, i) => {
    const row = document.createElement("div");
    row.className = "a11yRow";

    const lab = document.createElement("label");
    lab.htmlFor = "a11yDur" + i;
    const dur = document.createElement("input");
    dur.type = "range"; dur.id = "a11yDur" + i;
    dur.min = PERIOD_MIN; dur.max = PERIOD_MAX; dur.step = 0.5;
    dur.value = L.target;
    dur.addEventListener("input", e => {
      L.target = +e.target.value;
      onRealignChange();
    });

    const mute = document.createElement("button");
    mute.type = "button";
    mute.addEventListener("click", () => { L.muted = !L.muted; onLoopsChange(); });

    const regen = document.createElement("button");
    regen.type = "button";
    regen.addEventListener("click", () => regenerate(L));

    row.append(lab, dur, mute, regen);
    box.appendChild(row);
    a11yEls.push({ lab, dur, mute, regen });
  });
})();

/* Riallinea etichette e valori: le prime cambiano con la lingua, i secondi
   col trascinamento sul canvas.                                            */
function syncA11y() {
  a11yEls.forEach((e, i) => {
    const n = ROMAN[i], L = loops[i];
    e.lab.textContent = T("a11y.duration", { n });
    e.dur.value = L.target;
    e.dur.setAttribute("aria-valuetext", fmtOne(L.target) + " " + T("canvas.seconds"));
    e.mute.textContent = T(L.muted ? "a11y.unmute" : "a11y.mute", { n });
    e.mute.setAttribute("aria-pressed", L.muted ? "true" : "false");
    e.regen.textContent = T("a11y.regen", { n });
  });
}

/* --- lingua ---------------------------------------------------------------
   Le quattro sigle le costruisce i18n.js, che le fa identiche qui e nella
   guida. La lingua di partenza la decide il browser (vedi detectLang); da qui
   in poi comanda la scelta dell'utente, che resta memorizzata.             */
buildLangSwitch($("langs"));

/* Chiamata da setLang (i18n.js) dopo che il documento è già stato tradotto:
   qui si aggiorna solo ciò che il dizionario non raggiunge da solo, cioè il
   testo costruito a runtime.                                               */
function onLanguageChange() {
  document.querySelectorAll("#moods .mood").forEach(b => {
    b.textContent = moodName(b.dataset.mood);
  });
  onPowerChange();
  onRealignChange();
  readouts();
  syncA11y();
  document.querySelectorAll("#droniMoods .mood").forEach(b => {
    b.textContent = droneMoodName(b.dataset.droneMood);
  });
  letturaTessuti();       // le unità cambiano con la lingua: "s" diventa "秒"
  onDroniChange();
}

/* --- avvio ---------------------------------------------------------------- */
/* Ogni riquadro ha il suo interruttore, e governa solo la propria classe:
   due pulsanti che facessero la stessa cosa sarebbero un pulsante di troppo. */
$("power").addEventListener("click", () => toggleClasse("gocce"));
$("powerTessuti").addEventListener("click", () => toggleClasse("tessuti"));

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
  /* `inert` e non solo la dissolvenza: la transizione CSS non gira se la
     scheda passa in secondo piano proprio in questo istante, e il bottone
     resterebbe raggiungibile col Tab pur essendo invisibile.              */
  $("gate").inert = true;
  document.querySelector(".stage").inert = false;   // la pagina torna navigabile
  /* Il fuoco va spostato solo se si è entrati da tastiera: chi ha usato il
     mouse non se lo aspetta, e l'anello di messa a fuoco sarebbe rumore in
     un'interfaccia costruita sul poco. Chi invece è entrato col tasto Invio
     resterebbe altrimenti con il fuoco su un elemento appena disattivato.  */
  if (ingressoDaTastiera) $("power").focus();
  await togglePower();
});
/* Il bottone è dentro la soglia: il clic risale da solo. Qui si intercetta
   solo la tastiera, perché Invio e spazio su un <button> non generano un
   clic sull'antenato in tutti i browser.                                   */
let ingressoDaTastiera = false;
$("enter").addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    ingressoDaTastiera = true;
    $("gate").click();
  }
});

applyI18n();
$("powerLabel").textContent = T("power.play");
$("powerTessutiLabel").textContent = T("power.play");
refreshStatus();
onRealignChange();
onDroniChange();
DPARAMS.forEach(k => { $("d_" + k).value = D[k]; });
letturaTessuti();
readouts();
syncA11y();

/* Finché il cancello è chiuso, tutto ciò che sta dietro è fuori gioco: senza
   questo il Tab uscirebbe dalla soglia e andrebbe a dare fuoco a comandi che
   nessuno può vedere. `inert` fa esattamente questo, ed è ignorato senza
   danni dai browser che non lo conoscono.                                 */
document.querySelector(".stage").inert = true;
$("enter").focus();

/* Se p5 non arriva — CDN irraggiungibile, rete assente — il canvas non nasce
   e resterebbe un vuoto inspiegato al centro della pagina. Il motore audio
   però è indipendente da p5 e continua a suonare: si dice.                */
if (typeof window.p5 === "undefined") {
  const avviso = document.createElement("p");
  avviso.className = "loopHint";
  avviso.setAttribute("data-i18n", "err.noCanvas");
  avviso.textContent = T("err.noCanvas");
  $("canvas-holder").appendChild(avviso);

  /* E qui la parte che non si vede ma si sente. `tickParams` — che smussa i
     cursori verso il valore scelto e applica l'inclinazione oraria — è
     chiamata da `draw`, che senza p5 non gira mai: i cinque comandi
     resterebbero inerti, e il messaggio qui sopra sarebbe una mezza verità.
     Il battito lo riprende requestAnimationFrame, che è del browser e non di
     p5, con la stessa cadenza e la stessa pausa quando la pagina si nasconde. */
  (function battito() {
    tickParams();
    requestAnimationFrame(battito);
  })();
}
