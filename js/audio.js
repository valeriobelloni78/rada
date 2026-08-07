/* =============================================================================
   RADA · audio.js — il motore sonoro

   Usa la Web Audio API direttamente, non p5.sound: il cuore di Rada è uno
   SCHEDULER A LOOKAHEAD che prenota le gocce sul clock del motore audio, con
   precisione al campione. I timer di JavaScript sono troppo imprecisi per
   frasi che devono restare in fase per ore; p5.sound è pensato per gesti
   immediati, non per pianificazione temporale rigorosa. Qui la precisione
   è il punto, quindi si parla con l'API nativa.

   Catena: [gocce] → filtro passa-basso → (diretto + riverbero) → uscita
============================================================================= */

let ctx = null, master, verb, wetGain, dryGain, filt;
let running = false;

/* Storia delle gocce suonate di recente, per la fascia temporale condivisa
   del disegno: gli ultimi TIMELINE_SEC secondi di tutte e quattro le frasi
   sulla stessa riga del tempo. Scritta qui perché è lo scheduler a sapere
   con esattezza quando una goccia suona davvero; il disegno la legge soltanto,
   come già fa con L.cycles per la lancetta.                                */
const TIMELINE_SEC = 30;
/* Non si chiama `history`: una const globale con quel nome OSCURA
   window.history per ogni script caricato dopo, e il giorno in cui servisse
   toccare la cronologia nella pagina principale il guasto sarebbe muto.   */
const dropHistory = [];

/* --- come il sistema deve considerare questo suono ------------------------
   Di suo, un AudioContext è "suono d'ambiente": iOS lo zittisce con
   l'interruttore laterale e lo sospende appena si blocca lo schermo, perché
   lo tratta come l'effetto sonoro di una pagina qualsiasi.

   `playback` dichiara l'opposto — questo è un lettore, il suono è il
   contenuto — ed è la categoria che WebKit riserva alla riproduzione lunga.
   Due conseguenze, ed entrambe sono volute: Rada suona anche con
   l'interruttore del silenzioso inserito, e chiede al sistema di continuare
   a schermo bloccato.

   L'API esiste solo su WebKit; altrove il ramo non fa nulla.             */
function dichiaraSessioneDiRiproduzione() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
  } catch (e) {}
}

/* Il pannello di controllo del sistema — schermata di blocco, centro di
   controllo — mostra ciò che sta suonando e offre play e pausa. Dichiararsi
   qui non è solo una cortesia: è il modo in cui il sistema riconosce una
   sessione musicale come tale, e quindi degna di restare viva.            */
function dichiaraMediaSession() {
  const ms = navigator.mediaSession;
  if (!ms) return;
  try {
    if (typeof MediaMetadata === "function")
      ms.metadata = new MediaMetadata({ title: "Rada", artist: T("media.artist") });
    ms.setActionHandler("play",  () => { if (!running) togglePower(); });
    ms.setActionHandler("pause", () => { if (running)  togglePower(); });
    ms.setActionHandler("stop",  () => { if (running)  togglePower(); });
  } catch (e) {}
}

function statoMediaSession() {
  try {
    if (navigator.mediaSession) navigator.mediaSession.playbackState = running ? "playing" : "paused";
  } catch (e) {}
}

/* --- costruzione del grafo ----------------------------------------------- */
function buildAudio() {
  dichiaraSessioneDiRiproduzione();
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  master = ctx.createGain();
  master.gain.value = 0;

  verb = ctx.createConvolver();
  /* La convoluzione è di gran lunga la voce più cara della catena, e il costo
     cresce con la lunghezza dell'impulso. Su uno schermo piccolo — cioè su un
     telefono, dove la CPU è quella che crepita — se ne usa uno più corto:
     all'orecchio cambia poco, al processore molto.                        */
  const piccolo = typeof matchMedia === "function"
                && matchMedia("(max-width: 719px)").matches;
  makeImpulse(piccolo ? 2.6 : 5.5);
  wetGain = ctx.createGain(); wetGain.gain.value = 0.6;
  dryGain = ctx.createGain(); dryGain.gain.value = 0.6;

  filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 4000;
  filt.Q.value = 0.6;

  filt.connect(dryGain); dryGain.connect(master);
  filt.connect(verb);    verb.connect(wetGain); wetGain.connect(master);
  master.connect(ctx.destination);

  restartCycles();
  setInterval(schedule, 25);
  dichiaraMediaSession();
}

/* Impulso di riverbero: rumore con decadimento esponenziale. Sintetico, così
   non serve caricare un file esterno.

   Mezzo milione di campioni generati uno per uno, e tutti nell'istante esatto
   in cui l'utente preme "Entra": in un colpo solo bloccherebbero il thread
   principale proprio lì, con uno scatto visibile mentre la soglia sfuma.
   Si genera quindi a fette, restituendo il controllo al browser fra l'una e
   l'altra, e il buffer si attacca al convolutore solo quando è pronto.

   Nel frattempo il convolutore, che senza buffer tace, semplicemente non
   contribuisce: si sente il suono diretto. Non è un problema, perché le
   prime gocce arrivano comunque dopo due decimi di secondo buoni — e la
   generazione, a fette, ne impiega meno.

   L'inviluppo si calcola UNA volta per campione e serve entrambi i canali:
   prima il ciclo era per canale, e la potenza — la parte cara — veniva
   calcolata due volte per ogni posizione.

   Le fette si concatenano con un MessageChannel e non con setTimeout, che ha
   un'attesa minima imposta dal browser — quattro millisecondi, che diventano
   un secondo se la pagina non si vede: l'impulso arriverebbe dopo le prime
   gocce, e il pezzo attaccherebbe asciutto. Un messaggio su una porta è un
   compito come gli altri, ma senza quel ritardo.                          */
const FETTA = 12000;            // campioni per volta: circa un millisecondo

function makeImpulse(sec) {
  const len = Math.floor(ctx.sampleRate * sec);
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  const sx = b.getChannelData(0), dx = b.getChannelData(1);
  let i = 0;

  const fetta = () => {
    const fine = Math.min(i + FETTA, len);
    for (; i < fine; i++) {
      const env = Math.pow(1 - i / len, 3.4);
      sx[i] = (Math.random() * 2 - 1) * env;
      dx[i] = (Math.random() * 2 - 1) * env;
    }
    return i < len;
  };

  if (typeof MessageChannel !== "function") {   // rete di sicurezza
    while (fetta()) {}
    if (verb) verb.buffer = b;
    return;
  }

  const canale = new MessageChannel();
  canale.port1.onmessage = () => {
    if (fetta()) { canale.port2.postMessage(0); return; }
    if (verb) verb.buffer = b;
    canale.port1.close(); canale.port2.close();
  };
  canale.port2.postMessage(0);
}

/* Ripartenza dei cicli.
   La zona attiva di ogni frase comincia in un punto qualsiasi della
   circonferenza, quindi la sua prima goccia potrebbe cadere molto avanti nel
   giro: all'apertura si resterebbe in silenzio per parecchi secondi. Qui ogni
   ciclo viene quindi posizionato all'indietro, in modo che la prima goccia
   arrivi entro un attimo — con ingressi comunque sfalsati, perché le quattro
   frasi non attacchino all'unisono.                                        */
function restartCycles() {
  if (!ctx) return;
  const now = ctx.currentTime;
  bookedUntil = 0;                // i vecchi cicli non esistono più
  loops.forEach((L, i) => {
    const firstPh = L.plan.length ? L.plan[0].ph : 0;
    const entrata = 0.2 + i * 0.28 + Math.random() * 0.25;   // 0,2 – 1,3 s
    L.cycleStart = now + entrata - firstPh * L.period;
    L.idx = 0;
    L.cycles = [{ start: L.cycleStart, period: L.period }];
  });
}

/* --- quando la pagina non si vede -----------------------------------------
   In secondo piano il browser porta i timer da 25 ms a circa un secondo. Il
   thread audio invece non viene MAI rallentato: una goccia già prenotata
   suona con precisione al campione anche se il thread principale è congelato.

   Quindi la cura non è correre di più, è prenotare più avanti. Con la
   finestra a 150 ms e il timer a un secondo restano 850 ms scoperti a ogni
   giro, e le gocce in ritardo di oltre un quarto di secondo vengono scartate
   qui sotto: una simulazione dello scheduler ne ha misurate il 61% perse.
   Con tre secondi di margine non se ne perde nessuna.

   In primo piano la finestra torna stretta, perché è ciò che rende immediati
   i cursori: quel che è già prenotato non si può più cambiare.            */
const LOOKAHEAD_VISIBILE = 0.15, LOOKAHEAD_NASCOSTA = 3.0, LOOKAHEAD_MAX = 12.0;

/* Quando lo scheduler è passato l'ultima volta, sul clock audio. Serve a
   misurare quanto il sistema sta davvero strozzando i timer: tre secondi di
   margine bastano contro il rallentamento a un secondo di una scheda in
   secondo piano, ma non contro uno schermo bloccato, dove il thread può
   restare fermo molto più a lungo. La finestra si adatta al ritardo
   osservato invece di indovinarlo — e nel caso normale non cambia nulla,
   perché il ritardo è piccolo.                                            */
let ultimoGiro = 0;

document.addEventListener("visibilitychange", () => {
  LOOKAHEAD = document.hidden ? LOOKAHEAD_NASCOSTA : LOOKAHEAD_VISIBILE;
  if (!document.hidden) schedule();   // recupera subito, senza aspettare il timer
});

/* --- SCHEDULER ------------------------------------------------------------
   Ogni 25 ms guarda avanti quanto dice LOOKAHEAD e prenota gli eventi sul
   clock audio.                                                             */
function schedule() {
  if (!ctx || !running) return;
  const now = ctx.currentTime;

  /* A pagina nascosta la finestra insegue il ritardo vero, con un margine di
     sicurezza. Reattiva e non profetica: il primo ritardo lungo si paga
     comunque, ma dal secondo in poi la finestra lo copre.                 */
  if (document.hidden) {
    const ritardo = now - ultimoGiro;
    LOOKAHEAD = clamp(ritardo * 2.5, LOOKAHEAD_NASCOSTA, LOOKAHEAD_MAX);
  }
  ultimoGiro = now;

  const horizon = now + LOOKAHEAD;
  /* Solo in avanti: al ritorno in primo piano la finestra si stringe, ma le
     gocce prenotate con quella larga restano prenotate. Assegnare qui il
     nuovo orizzonte cancellerebbe proprio la memoria che serve. Il valore è
     assoluto, quindi invecchia da sé: appena `now` lo supera, il massimo
     qui sotto torna a essere la finestra corrente.                        */
  if (horizon > bookedUntil) bookedUntil = horizon;

  while (dropHistory.length && dropHistory[0].t < now - TIMELINE_SEC) dropHistory.shift();

  loops.forEach(L => {
    let guard = 0;
    while (guard++ < 300) {

      if (L.idx >= L.plan.length) {          // ciclo concluso → giro successivo
        L.cycleStart += L.period;
        L.period = L.target;                 // la nuova durata entra qui
        /* Lo scheduler corre avanti rispetto all'ascolto, quindi il disegno
           non può usare cycleStart/period: descrivono il ciclo in
           pianificazione, non quello udibile. La coda conserva
           l'informazione esatta per la lancetta.                          */
        L.cycles.push({ start: L.cycleStart, period: L.period });
        if (L.cycles.length > 8) L.cycles.shift();
        buildPlan(L);
        L.idx = 0;
        if (L.cycleStart > horizon) break;
        continue;
      }

      const p = L.plan[L.idx];
      const t = L.cycleStart + p.ph * L.period;
      if (t >= horizon) break;

      if (!L.muted && t >= now - 0.25) {
        /* Una goccia lievemente in ritardo (scatto di frame) si suona subito
           invece di perderla. Oltre il quarto di secondo è obsoleta — per
           esempio una scheda tornata in primo piano — e va scartata,
           altrimenti se ne scaricherebbero decine tutte insieme.          */
        const at = Math.max(t, now);
        playDrop(at, p.ev, L);
        p.ev.flash = at;
        dropHistory.push({ t: at, loop: L.i, rel: p.ev.rel });
      }
      L.idx++;
    }
  });
}

/* --- VOCE: una goccia -----------------------------------------------------
   Sintesi FM morbida: portante + modulante a rapporto armonico basso, più un
   filo di parziale "campana" scordata dell'1% per un battimento lento.
   L'inviluppo ha attacco brevissimo e coda lunga.                          */
function playDrop(when, ev, L) {
  const spread = G.spread / 100;
  const warmth = effWarmth;                 // calore già inclinato dall'ora
  const half = SCALE.length / 2;
  const freq = SCALE[clamp(Math.round(half + ev.rel * spread * half), 0, SCALE.length - 1)];

  const car = ctx.createOscillator();
  car.type = "sine"; car.frequency.value = freq;

  const mod = ctx.createOscillator();
  mod.type = "sine"; mod.frequency.value = freq * (warmth > 0.5 ? 2 : 3);
  const modGain = ctx.createGain();
  modGain.gain.value = freq * (0.6 - warmth * 0.45);
  mod.connect(modGain); modGain.connect(car.frequency);

  /* Il parziale "campana" si spegne da sé man mano che il calore sale: oltre
     una certa soglia il suo guadagno è sotto la soglia dell'udibile, e
     accendere un oscillatore per nulla costa quanto accenderne uno che si
     sente. Con i mood caldi è un terzo delle voci risparmiato.            */
  const parAmp = (1 - warmth) * 0.11;
  let par = null, parGain = null;
  if (parAmp > 0.004) {
    par = ctx.createOscillator();
    par.type = "sine"; par.frequency.value = freq * 2.01;
    parGain = ctx.createGain();
    parGain.gain.value = parAmp;
  }

  const env = ctx.createGain();
  env.gain.value = 0;
  const peak = 0.15 * ev.vel;
  const rel = 1.9 + warmth * 2.8;
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(peak, when + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0008, when + rel);

  const pan = ctx.createStereoPanner();
  pan.pan.value = clamp(L.pan + (Math.random() * 2 - 1) * 0.18, -1, 1);

  car.connect(env);
  if (par) { par.connect(parGain); parGain.connect(env); }
  env.connect(pan); pan.connect(filt);

  const stop = when + rel + 0.1;
  car.start(when); car.stop(stop);
  mod.start(when); mod.stop(stop);
  if (par) { par.start(when); par.stop(stop); }

  /* Sette nodi per goccia, e finché restano collegati il thread audio continua
     a percorrerli. Il rilascio automatico però dipende dalla raccolta della
     memoria, che è attività del thread PRINCIPALE — proprio quello che a
     schermo bloccato viene strozzato. Il risultato è che il grafo cresce più
     in fretta di quanto venga ripulito: prima frusciano i buffer, poi saltano,
     infine il suono crolla. Scollegare a mano rende il rilascio immediato e
     non più soggetto a quando il thread principale trova tempo.           */
  car.onended = () => {
    car.disconnect(); mod.disconnect(); modGain.disconnect();
    if (par) { par.disconnect(); parGain.disconnect(); }
    env.disconnect(); pan.disconnect();
  };
}

/* --- modulazione lenta ----------------------------------------------------
   Chiamata a ogni fotogramma da draw(): smussa i parametri e applica la
   palette oraria. Gira anche a motore spento, così i cursori rispondono
   subito.                                                                  */
function tickParams() {
  for (const k in GT) G[k] += (GT[k] - G[k]) * 0.06;

  // se l'addensamento è cambiato, ricolloca le gocce senza risuonare quelle già emesse
  if (Math.abs(G.head - lastHead) > 0.3) {
    lastHead = G.head;
    rebuildPlans(ctx ? ctx.currentTime : null);
  }

  const pal = currentPalette;
  effWarmth = clamp(G.warmth + pal.warmBias,  0, 100) / 100;
  effRev    = clamp(G.rev    + pal.spaceBias, 0, 100) / 100;

  if (!ctx) return;
  const openness = clamp(45 + pal.toneBias, 0, 100);
  filt.frequency.setTargetAtTime(600 * Math.pow(16, openness / 100), ctx.currentTime, 0.5);
  wetGain.gain.setTargetAtTime(0.32 + effRev * 0.55, ctx.currentTime, 0.6);
  dryGain.gain.setTargetAtTime(0.75 - effRev * 0.25, ctx.currentTime, 0.6);
}

/* --- avvio / pausa --------------------------------------------------------
   La pausa non azzera nulla: dopo una breve dissolvenza ferma il clock del
   motore audio. Fermandolo, tutti i tempi già prenotati restano coerenti, e
   alla ripresa il collage riparte esattamente da dov'era invece di
   ricominciare da capo. È ciò che la parola "pausa" promette.             */
let sospensione = null;

async function togglePower() {
  if (!ctx) buildAudio();

  if (running) {
    running = false;
    onPowerChange(false);
    statoMediaSession();
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    clearTimeout(sospensione);
    sospensione = setTimeout(() => {
      if (!running && ctx.state === "running") ctx.suspend();
    }, 900);
  } else {
    clearTimeout(sospensione);
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch (e) {} }
    running = true;
    dichiaraSessioneDiRiproduzione();   // la categoria si riafferma alla ripresa
    onPowerChange(true);
    statoMediaSession();
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
  }
}

/* tempo audio corrente, 0 se il motore non esiste ancora */
function audioNow() { return ctx ? ctx.currentTime : 0; }
