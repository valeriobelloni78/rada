/* =============================================================================
   RADA · ui.js — i controlli attorno al canvas

   Cursori, mood, avvio e riga di stato restano elementi HTML: sono comandi
   standard, e come tali funzionano meglio se il browser li conosce
   (accessibilità, tastiera, comportamento nativo). Il canvas si occupa
   soltanto dei quadranti.
============================================================================= */

const $ = id => document.getElementById(id);

/* --- valori accanto ai cursori ------------------------------------------- */
function readouts() {
  $("vSpread").textContent = Math.round(G.spread) + "%";
  // calore e spazio: se l'ora li inclina, si mostra "cursore → efficace"
  const wf = Math.round(G.warmth), we = Math.round(effWarmth * 100);
  const rf = Math.round(G.rev),    re = Math.round(effRev * 100);
  $("vWarmth").textContent = (we === wf) ? wf + "%" : wf + "→" + we + "%";
  $("vRev").textContent    = (re === rf) ? rf + "%" : rf + "→" + re + "%";
  $("vDens").textContent   = "max " + Math.round(G.dens);
  $("vHead").textContent   = Math.round(G.head) + "%";
}
setInterval(readouts, 120);

/* --- indicatore di riallineamento ---------------------------------------- */
function onRealignChange() {
  const l = realignSeconds();
  let t;
  if (l < 3600)       t = Math.round(l / 60) + " min";
  else if (l < 86400) t = (l / 3600).toFixed(1).replace(".", ",") + " ore";
  else                t = (l / 86400).toFixed(1).replace(".", ",") + " giorni";
  $("realign").textContent = "si ripete ogni ≈ " + t;
}

/* --- riga di stato -------------------------------------------------------- */
function refreshStatus() {
  const d = new Date(), h = d.getHours();
  currentPalette = timePalette(h);
  const hh = String(h).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
  const st = $("status"), txt = $("statusText");

  if (!running) {
    st.classList.remove("live");
    // "in attesa" solo alla prima apertura; dopo un ascolto è una pausa
    const stato = ctx ? "in pausa" : "in attesa";
    txt.textContent = stato + " · " + hh + ":" + mm + ", palette " + currentPalette.name;
    return;
  }
  st.classList.add("live");
  const attivi = loops.filter(L => !L.muted).length;
  txt.textContent = "in ascolto · " + attivi + " loop su 4 · "
                  + hh + ":" + mm + ", palette " + currentPalette.name;
}
setInterval(refreshStatus, 15000);

/* chiamate dal canvas quando cambia lo stato dei loop */
function onLoopsChange() { refreshStatus(); }
/* Il pulsante è un COMANDO, non un indicatore: la scritta dice che cosa
   accadrà premendolo, non che cosa sta accadendo. Lo stato è già raccontato
   dal punto che pulsa e dalla riga in alto.                                */
function onPowerChange(on) {
  $("power").classList.toggle("on", on);
  $("powerLabel").textContent = on ? "Pausa" : "Avvia";
  refreshStatus();
}

/* --- cursori -------------------------------------------------------------- */
PARAMS.forEach(k => {
  $(k).addEventListener("input", e => { GT[k] = +e.target.value; });
});

/* --- mood: preset sonori + durate dei loop + nuove idee ------------------- */
const moodsEl = $("moods");
Object.keys(MOODS).forEach((name, i) => {
  const b = document.createElement("button");
  b.className = "mood" + (i === 0 ? " sel" : "");
  b.textContent = name;
  b.onclick = () => {
    document.querySelectorAll("#moods .mood").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    const m = MOODS[name];
    PARAMS.forEach(k => { GT[k] = m[k]; G[k] = m[k]; $(k).value = m[k]; });
    loops.forEach((L, k) => { L.target = L.period = m.periods[k]; L.idx = 0; });
    restartCycles();
    loops.forEach(regenerate);
    onRealignChange();
  };
  moodsEl.appendChild(b);
});

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

refreshStatus();
onRealignChange();
readouts();
