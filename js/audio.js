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

let ctx = null, master, wetGain, dryGain, filt;
let running = false;                 // il motore sta suonando?

/* Le due classi si accendono e si spengono da sole, ciascuna col pulsante del
   proprio riquadro. Il motore gira finché almeno una delle due è accesa:
   spente entrambe, dopo la dissolvenza il clock si ferma e non si consuma
   nulla. La barra spaziatrice resta il comando globale — accende o spegne
   tutte e due insieme — perché una scorciatoia da tastiera che agisse su
   metà dello strumento sarebbe più sorprendente che utile.               */
let gocceOn = false, tessutiOn = false;

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

/* La stessa cosa per i tessuti, ma con due tempi invece di uno: un tessuto
   non accade, dura. La fascia in fondo al suo riquadro disegna segmenti, e
   per farlo deve sapere dove ciascuno comincia e dove finisce.           */
const toneHistory = [];

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
  /* `latencyHint: "playback"` chiede al browser il buffer PIÙ LUNGO che
     ritiene ragionevole, invece di quello più corto.

     Di suo un AudioContext nasce per strumenti suonati dal vivo, dove ogni
     millisecondo di ritardo si sente sotto le dita: buffer minuscoli, e se la
     CPU non consegna in tempo il buffer resta vuoto — è quel raschio. Rada
     però non risponde a nessun gesto in tempo reale: le gocce sono prenotate
     secondi in anticipo sul clock del motore audio, quindi un ritardo
     d'uscita più lungo non si percepisce affatto. In cambio il thread audio
     ha molto più margine per consegnare in tempo, che è esattamente ciò che
     manca su un telefono modesto.

     Nessun costo e nessun effetto udibile: solo più respiro.             */
  const Costruttore = window.AudioContext || window.webkitAudioContext;
  try { ctx = new Costruttore({ latencyHint: "playback" }); }
  catch (e) { ctx = new Costruttore(); }

  master = ctx.createGain();
  master.gain.value = 0;

  const riverbero = buildRiverbero();
  wetGain = ctx.createGain(); wetGain.gain.value = 0.6;
  dryGain = ctx.createGain(); dryGain.gain.value = 0.6;

  filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 4000;
  filt.Q.value = 0.6;

  filt.connect(dryGain); dryGain.connect(master);
  filt.connect(riverbero.ingresso);
  riverbero.uscita.connect(wetGain); wetGain.connect(master);
  master.connect(ctx.destination);

  restartCycles();
  setInterval(schedule, 25);
  dichiaraMediaSession();
}

/* --- IL RIVERBERO ----------------------------------------------------------
   Prima era una convoluzione: rumore con decadimento, lungo secondi. Suona
   benissimo e costa moltissimo — il costo cresce con la coda, e va pagato a
   ogni istante anche nel silenzio, perché il convolutore macina comunque.
   Con una coda di 2,6 secondi sono quasi 250.000 campioni per canale, sempre.
   È il costo FISSO della catena: la ragione per cui su Android il suono
   degradava allo stesso modo col mood più fitto e con quello più rarefatto.

   Qui c'è invece una rete di ritardi in retroazione, alla Schroeder: quattro
   filtri a pettine smorzati in parallelo, poi due catene passa-tutto che ne
   diffondono l'uscita. Ogni nodo costa lo stesso a ogni campione, qualunque
   sia la lunghezza della coda — e la coda diventa gratis, tanto che non serve
   più accorciarla sul telefono.

   I quattro ritardi sono 31, 37, 41 e 43 millisecondi: numeri primi, quindi
   coprimi a due a due. È la stessa regola che tiene sfasate le quattro frasi,
   e serve alla stessa cosa — se due ritardi condividessero un divisore le
   loro ripetizioni coinciderebbero, e la coda suonerebbe metallica invece che
   diffusa.

   I passa-tutto non colorano il timbro, rimescolano solo le fasi: è ciò che
   trasforma quattro echi distinti in una nube continua. Sinistra e destra ne
   hanno di lunghezze diverse, ed è da lì che nasce l'ampiezza stereo che
   prima veniva dal rumore scorrelato dei due canali dell'impulso.        */
const RIV_T60 = 3.6;                       // secondi perché la coda cali di 60 dB
const RIV_SMORZAMENTO = 2800;              // Hz: la coda si scurisce mentre svanisce

/* Quattro pettini in comune, poi due catene di passa-tutto — una per canale —
   con ritardi diversi. Tutti e otto i numeri sono primi, quindi coprimi a due
   a due: la stessa regola che tiene sfasate le quattro frasi, e per la stessa
   ragione. Se due ritardi condividessero un divisore le loro ripetizioni
   coinciderebbero, e la coda suonerebbe metallica invece che diffusa.

   I pettini stanno in comune, e non divisi fra i canali, per una ragione
   misurata: dividendoli, i due lati uscivano con sei decibel di scarto —
   un anello più corto ripete più spesso e rende più energia. Partendo dalla
   stessa somma il bilanciamento è garantito per costruzione, e la larghezza
   stereo la danno i passa-tutto, che spostano le fasi senza toccare i livelli. */
const RIV_PETTINI = [31, 37, 41, 43];      // ms, primi fra loro
const RIV_PASSATUTTO = [[7, 11], [5, 13]]; // ms, una coppia per canale

function buildRiverbero() {
  /* L'ingresso è forzato a un canale solo: la rete lavora in mono e la stereo
     rinasce dai passa-tutto. Lasciarla stereo raddoppierebbe il lavoro per
     un'informazione che il riverbero dissolve comunque.                   */
  const ingresso = ctx.createGain();
  ingresso.channelCount = 1;
  ingresso.channelCountMode = "explicit";

  const somma = ctx.createGain();
  somma.gain.value = 1 / RIV_PETTINI.length;

  for (const ms of RIV_PETTINI) {
    const ritardo = ctx.createDelay(0.1);
    ritardo.delayTime.value = ms / 1000;

    const smorza = ctx.createBiquadFilter();   // le alte svaniscono prima
    smorza.type = "lowpass";
    smorza.frequency.value = RIV_SMORZAMENTO;
    smorza.Q.value = Math.SQRT1_2;

    /* Guadagno dell'anello dal T60 voluto — g = 10^(−3·ritardo/T60) — diviso
       per il picco REALE del filtro che sta nell'anello.

       Quella divisione è la condizione di stabilità, e non è teoria. Il
       passa-basso di Web Audio non si comporta come dice il manuale: la sua
       risposta arriva a 1,22 anche a Q basso, dove un Butterworth non
       dovrebbe superare l'unità. Moltiplicato per lo 0,94 dell'anello il giro
       sale a 1,15, e la rete invece di spegnersi cresce — misurato prima di
       accorgersene: la coda saliva a +600 dB in venti secondi. Il picco non
       si indovina, si chiede al filtro.                                   */
    const anello = ctx.createGain();
    anello.gain.value = Math.pow(10, -3 * (ms / 1000) / RIV_T60) / piccoDi(smorza);

    ingresso.connect(ritardo);
    ritardo.connect(smorza); smorza.connect(anello); anello.connect(ritardo);
    ritardo.connect(somma);
  }

  const unione = ctx.createChannelMerger(2);
  RIV_PASSATUTTO.forEach((coppia, canale) => {
    let nodo = somma;
    for (const ms of coppia) nodo = passatutto(nodo, ms, 0.5);
    nodo.connect(unione, 0, canale);
  });

  /* Un filo di continua, inudibile, iniettato negli anelli.

     Quando la coda svanisce, i valori che circolano nei ritardi scendono
     sotto il minimo dei numeri in virgola mobile normalizzati e diventano
     "denormali": su molti processori l'aritmetica su quei valori costa
     decine di volte tanto, e il costo compare proprio quando il riverbero
     dovrebbe essere silenzioso. Aggiungendo 10⁻¹⁵ i valori nell'anello non
     scendono mai sotto il normale. A −300 dB non lo sente nessuno.

     Chrome di suo azzera i denormali, quindi su molti dispositivi questo non
     serve; costa un nodo e toglie di mezzo il dubbio.                    */
  if (typeof ctx.createConstantSource === "function") {
    const semino = ctx.createConstantSource();
    semino.offset.value = 1e-15;
    semino.connect(ingresso);
    semino.start();
  }

  return { ingresso, uscita: unione };
}

/* Il guadagno massimo di un filtro, misurato sulla sua risposta reale.
   Mai sotto l'unità: serve a dividere, e dividere per meno di uno alzerebbe
   il guadagno dell'anello invece di abbassarlo.                           */
function piccoDi(filtro) {
  /* Il ripiego non è 1, ed è importante che non lo sia: con 1 il guadagno
     dell'anello non verrebbe ridotto affatto, il giro tornerebbe sopra
     l'unità e la rete divergerebbe. Se la misura non riesce si preferisce
     una coda un po' più corta a un riverbero che esplode.                */
  const PRUDENTE = 1.3;
  try {
    const N = 512, nyq = ctx.sampleRate / 2;
    const hz = new Float32Array(N), mag = new Float32Array(N), fase = new Float32Array(N);
    for (let i = 0; i < N; i++) hz[i] = 20 * Math.pow(nyq / 20, i / (N - 1));
    filtro.getFrequencyResponse(hz, mag, fase);
    let max = 0;
    for (let i = 0; i < N; i++) if (mag[i] > max) max = mag[i];
    return (isFinite(max) && max >= 1) ? max : PRUDENTE;
  } catch (e) { return PRUDENTE; }
}

/* Passa-tutto di Schroeder, nella forma canonica:

       v[n] = x[n] + g·v[n−M]
       y[n] = v[n−M] − g·v[n]

   La reazione in avanti parte da v, cioè dall'INGRESSO del ritardo, non da x.
   Prendendola da x — come faceva la prima stesura — il coefficiente sul
   termine ritardato diventa (1+g²) invece di 1, e il filtro smette di essere
   passa-tutto: colora il timbro e sbilancia i livelli. Sembra una sfumatura,
   e invece è la differenza fra diffondere e alterare.                     */
function passatutto(sorgente, ms, g) {
  const v       = ctx.createGain();               // il nodo di somma: x + g·v ritardato
  const ritardo = ctx.createDelay(0.1);
  ritardo.delayTime.value = ms / 1000;
  const anello  = ctx.createGain(); anello.gain.value  =  g;
  const diretto = ctx.createGain(); diretto.gain.value = -g;
  const uscita  = ctx.createGain();

  sorgente.connect(v);
  ritardo.connect(anello); anello.connect(v);     // anello: v riceve g·v(ritardato)
  v.connect(ritardo);
  ritardo.connect(uscita);                        // + v(ritardato)
  v.connect(diretto); diretto.connect(uscita);    // − g·v
  return uscita;
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

  loops.forEach((L, i) => avvia(L, now, 0.2 + i * 0.28 + Math.random() * 0.25));
  /* Le tenute entrano più tardi e più distanziate: sono uno sfondo, e uno
     sfondo che attacca insieme al primo piano non è uno sfondo.          */
  droni.forEach((L, i) => avvia(L, now, 1.5 + i * 1.1 + Math.random() * 0.8));
}

function avvia(L, now, entrata) {
  const firstPh = L.plan.length ? L.plan[0].ph : 0;
  L.cycleStart = now + entrata - firstPh * L.period;
  L.idx = 0;
  L.cycles = [{ start: L.cycleStart, period: L.period }];
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
  /* Qui si guarda la FINE, non l'inizio: un tessuto lungo mezzo minuto è
     ancora in corso molto dopo essere cominciato, e buttarlo via per l'età
     del suo attacco lo cancellerebbe mentre sta ancora suonando.        */
  while (toneHistory.length && toneHistory[0].fino < now - TIMELINE_SEC) toneHistory.shift();

  /* I cicli avanzano comunque, anche a classe spenta: così riaccendendola
     riparte da dov'era invece che da capo — la stessa promessa che la pausa
     fa già per l'intero strumento.                                       */
  prenota(loops, buildPlan,      suonaGoccia, now, horizon, gocceOn);
  prenota(droni, buildPlanDrone, suonaTenuta, now, horizon, tessutiOn);
}

/* Il cuore dello scheduler, uguale per le gocce e per le tenute: le due classi
   differiscono per come si costruisce il piano e per come si suona un evento,
   non per come si prenota. Tenerlo in un posto solo evita che le due copie
   divergano — ed è già successo, in questo progetto, con altre due copie.  */
function prenota(lista, costruisciPiano, suona, now, horizon, attiva) {
  lista.forEach(L => {
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
        costruisciPiano(L);
        L.idx = 0;
        if (L.cycleStart > horizon) break;
        continue;
      }

      const p = L.plan[L.idx];
      const t = L.cycleStart + p.ph * L.period;
      if (t >= horizon) break;

      if (attiva && !L.muted && t >= now - 0.25) {
        /* Un evento lievemente in ritardo (scatto di frame) si suona subito
           invece di perderlo. Oltre il quarto di secondo è obsoleto — per
           esempio una scheda tornata in primo piano — e va scartato,
           altrimenti se ne scaricherebbero decine tutti insieme.          */
        suona(Math.max(t, now), p.ev, L);
      }
      L.idx++;
    }
  });
}

function suonaGoccia(at, ev, L) {
  playDrop(at, ev, L);
  ev.flash = at;
  dropHistory.push({ t: at, loop: L.i, rel: ev.rel });
}

function suonaTenuta(at, ev, L) {
  const dur = playTone(at, ev, L);
  ev.flash = at;
  ev.fino  = at + dur;
  toneHistory.push({ t: at, fino: at + dur, loop: L.i, rel: ev.rel });
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

/* --- VOCE: una tenuta -------------------------------------------------------
   Due sinusoidi appena scordate fra loro. Il battimento che ne nasce — lento,
   qualche ciclo al secondo — è tutta la vita che serve a un suono che deve
   restare fermo a lungo: senza, una tenuta è un tono di prova.

   L'inviluppo è l'opposto di quello delle gocce: apertura lentissima, un
   lungo pianoro, chiusura altrettanto lenta. Nulla attacca, tutto affiora.

   Passa dalla stessa catena delle gocce — filtro e riverbero — quindi eredita
   la palette oraria e lo spazio senza nodi propri.                        */
function playTone(when, ev, L) {
  const spread = effD.spread / 100;
  const half = SCALE.length / 2;
  const freq = SCALE[clamp(Math.round(half + ev.rel * spread * half), 0, SCALE.length - 1)];

  const dur = clamp(ev.dur * L.period, 2.5, 90);

  /* Lo scarto fra le due voci è ADDITIVO, non proporzionale: due sinusoidi
     distanti d hertz battono a d hertz, qualunque sia la loro altezza. Con
     uno scarto proporzionale — come era prima — i toni gravi avrebbero
     battuto molto più lenti degli acuti, e uno slider chiamato "battito" non
     avrebbe mantenuto la promessa.                                        */
  const a = ctx.createOscillator(); a.type = "sine"; a.frequency.value = freq;
  const b = ctx.createOscillator(); b.type = "sine"; b.frequency.value = freq + effD.battito;

  const env = ctx.createGain();
  env.gain.value = 0;
  const picco = 0.15 * (D.liv / 100) * ev.vel;

  /* Apertura e chiusura non possono sommarsi a più della durata, altrimenti
     la tenuta non raggiunge mai il suo livello.                           */
  let apri = effD.apri, chiudi = effD.chiudi;
  const eccesso = (apri + chiudi) / (dur * 0.9);
  if (eccesso > 1) { apri /= eccesso; chiudi /= eccesso; }

  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(picco, when + apri);
  env.gain.setValueAtTime(picco, when + dur - chiudi);
  env.gain.linearRampToValueAtTime(0, when + dur);

  const pan = ctx.createStereoPanner();
  pan.pan.value = clamp(L.pan + (Math.random() * 2 - 1) * 0.12, -1, 1);

  a.connect(env); b.connect(env);
  env.connect(pan); pan.connect(filt);

  const stop = when + dur + 0.05;
  a.start(when); a.stop(stop);
  b.start(when); b.stop(stop);

  /* Come per le gocce: scollegare a mano, che il rilascio automatico dipende
     dal thread principale (vedi CLAUDE.md).                               */
  a.onended = () => { a.disconnect(); b.disconnect(); env.disconnect(); pan.disconnect(); };

  return dur;
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

  /* e per l'altra classe, l'inclinazione della stagione */
  effettiviTessuti();

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

/* Porta il motore in accordo con le due classi. Nessuno decide qui COSA deve
   suonare: si limita a constatare se qualcosa deve.                       */
async function applicaStato() {
  const vuole = gocceOn || tessutiOn;
  if (vuole !== running) {
    if (vuole) {
      clearTimeout(sospensione);
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch (e) {} }
      running = true;
      dichiaraSessioneDiRiproduzione();   // la categoria si riafferma alla ripresa
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    } else {
      running = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      clearTimeout(sospensione);
      sospensione = setTimeout(() => {
        if (!running && ctx.state === "running") ctx.suspend();
      }, 900);
    }
  }
  onPowerChange();
  statoMediaSession();
}

/* Il pulsante di un riquadro: governa la sua classe e nient'altro. */
async function toggleClasse(quale) {
  if (!ctx) buildAudio();
  if (quale === "gocce") gocceOn = !gocceOn; else tessutiOn = !tessutiOn;
  await applicaStato();
}

/* Il comando globale: barra spaziatrice, soglia d'ingresso, pannello di
   sistema. Se qualcosa sta suonando spegne tutto, altrimenti accende tutto. */
async function togglePower() {
  if (!ctx) buildAudio();
  const acceso = gocceOn || tessutiOn;
  gocceOn = tessutiOn = !acceso;
  await applicaStato();
}

/* tempo audio corrente, 0 se il motore non esiste ancora */
function audioNow() { return ctx ? ctx.currentTime : 0; }
