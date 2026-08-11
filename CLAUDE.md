# Rada — contesto di progetto

Strumento generativo nel browser. Quattro frasi sonore di lunghezza diversa,
ciascuno col proprio periodo, che non tornano mai insieme allo stesso modo.

**Rispondi sempre in italiano.** Commenti nel codice, messaggi di commit e
testi dell'interfaccia sono in italiano.

## Regole da non violare

**I periodi devono restare coprimi a due a due.** È il cuore del progetto: se
due linee condividono un divisore tornano insieme presto e il collage collassa
in un motivo riconoscibile. Vale per ogni serie in `MOODS` e in `DRONI_MOODS`.
Verificare sempre il minimo comune multiplo prima di proporre nuove serie.

Le due classi sono otto linee, non due gruppi da quattro. I periodi delle
tenute sono **numeri primi da 19 in su**, e non per estetica: così sono
coprimi anche con i 7·11·13·17 delle gocce, e le due classi non tornano
insieme più di quanto non facciano le quattro frasi fra loro.

**L'audio usa la Web Audio API, mai p5.sound.** Lo scheduler a lookahead
prenota le note sul clock del motore audio, preciso al campione. p5.sound è
pensato per gesti immediati e sarebbe una regressione sulla parte più
delicata del progetto. p5 serve *solo* al disegno.

**La palette è definita una volta sola**, nelle variabili CSS di
`css/style.css`. Anche il canvas le legge (`readPalette` in `sketch.js`).
Non introdurre colori scritti direttamente nel JavaScript.

**Un solo colore.** Tutta l'interfaccia è in scala di grigi caldi su fondo
avorio; l'unico accento è l'arancione mattone `--amber`, usato con
parsimonia: la "d" del logo, il punto che pulsa, la lancetta, le gocce che
suonano. Non aggiungere altri colori senza chiederlo.

**Nessuna dipendenza da installare, nessun passaggio di compilazione.** Si
apre `index.html` e funziona. Non introdurre bundler, npm o framework.
Vale anche per le traduzioni: **niente file JSON caricati con `fetch`**, che
su `file://` il CORS blocca — l'app resterebbe senza testi al doppio clic.
Il dizionario è un oggetto JavaScript in `i18n.js`.

**Il modello non conosce le parole.** `MOODS` e `timePalette` espongono
`id` (`vespro`, `notturna`), mai etichette: i nomi visibili stanno in
`i18n.js`, uno per lingua. Prima le due cose coincidevano, e un mood non si
poteva rinominare senza rinominare il preset.

## Insidie già incontrate (non ripeterle)

**Lo scheduler corre avanti rispetto all'ascolto.** `cycleStart` e `period`
descrivono il ciclo *in pianificazione*, non quello *udibile*: lo scheduler
passa al giro successivo appena ha prenotato l'ultima goccia, cioè molto
prima che il giro finisca. Per il disegno esiste la coda `L.cycles`, che
conserva i cicli realmente in ascolto. **La lancetta deve leggere da lì.**
Usare `cycleStart` per disegnare produce un disallineamento fino a un terzo
di giro appena l'utente cambia una durata.

**Il disegno deve usare il piano, non i valori correnti.** Le gocce e la zona
attiva si disegnano da `L.plan` e `L.planHead`, non da `G.head`: il piano è
ciò che suonerà davvero. Ricalcolare le posizioni dai cursori fa divergere
ciò che si vede da ciò che si sente.

**La zona attiva può scavalcare la fine del ciclo.** Ogni frase ha un
`offset` casuale, quindi le fasi delle gocce rientrano dall'inizio e vanno
riordinate (lo fa `buildPlan`). In `rebuildPlans` il confronto avviene su
**tempi assoluti**, non su fasi: `cycleStart` può essere nel futuro, e
avvolgere la fase fa saltare gocce o interi cicli.

**Il modello si popola da sé.** In fondo a `model.js` c'è
`loops.forEach(regenerate)`. Senza quella riga le frasi nascono vuote e l'app
è muta all'apertura: è già successo dividendo il file in moduli.

**La finestra dello scheduler è una sola, e la usano in due.** `LOOKAHEAD`
vive in `model.js` perché `schedule` e `rebuildPlans` devono guardare
esattamente altrettanto avanti: se lo scheduler prenotasse a tre secondi e
`rebuildPlans` ne considerasse pianificati solo 0,15, una mossa
dell'addensamento riposizionerebbe gocce già prenotate e le sentiresti due
volte. Cambiando l'una, cambiare l'altra.

**p5 2.x consegna i tocchi come pointer event, e questo cambia tutto.**
`touchStarted`, `touchMoved` e `touchEnded` **non esistono più** nella
libreria: zero occorrenze nel sorgente della 2.3.2. p5 ascolta `pointerdown`
e compagni **su `window`**, e li instrada nelle callback del mouse. Due
conseguenze che è costato fatica scoprire:

- p5 scrive `touch-action:none` **nell'attributo style del canvas**. Una
  regola normale del foglio di stile perde contro lo stile in linea: serve
  `!important`, che è l'unica dichiarazione d'autore che lo batte.
- con i pointer event lo scorrimento della pagina lo decide **solo**
  `touch-action`. `preventDefault` su `pointerdown` non lo ferma. Quindi non
  esiste modo di decidere da JavaScript, gesto per gesto, se scorrere.

Da qui i **quattro riquadri trasparenti** (`.dialZone`) sopra i quadranti: il
canvas lascia scorrere la pagina, i riquadri no. È l'unica leva rimasta —
cambiare quale elemento riceve il tocco. E poiché p5 ascolta su `window`,
le sue callback del mouse si sommerebbero a quelle dei riquadri facendo
scattare ogni gesto due volte: per questo `mousePressed` e sorelle sono state
tolte, e tutta l'interazione passa dai riquadri.

**Ogni goccia lascia sette nodi audio, e vanno scollegati a mano.**
`playDrop` costruisce tre oscillatori più guadagni e panner. Il rilascio
automatico dipende dalla raccolta della memoria, che è attività del thread
PRINCIPALE — proprio quello che a schermo bloccato viene strozzato. Il thread
audio intanto continua ad accumulare: il grafo cresce più in fretta di quanto
venga ripulito, la CPU audio sale, i buffer prima frusciano e poi saltano.
Misurato col mood più denso a pagina nascosta: senza `onended` i nodi vivi
salivano senza limite (189 → 273 → 371 in ventuno secondi), con `onended` si
assestano attorno al centinaio. **Chiunque aggiunga nodi per nota deve
scollegarli quando la nota finisce.**

**Il contesto audio nasce con `latencyHint: "playback"`.** Di suo un
AudioContext è tarato per strumenti suonati dal vivo: buffer da 256 campioni,
cioè 5,8 ms per consegnare senza mai mancare un colpo. Su un telefono modesto
non ce la fa, e ogni buffer mancato è un raschio. Rada non risponde a nessun
gesto in tempo reale — le gocce sono prenotate secondi prima — quindi il
ritardo d'uscita non si percepisce: con `playback` il buffer sale a 1024
campioni, quattro volte il margine. **Non rimetterlo com'era per "ridurre la
latenza": qui non serve a niente e costa il suono.**

**La rete del riverbero è in retroazione, quindi va trattata con rispetto.**
Due trappole già scattate: il passa-basso di Web Audio ha guadagno fino a
1,22 anche a Q basso — moltiplicato per il guadagno dell'anello porta il giro
sopra l'unità e la coda cresce invece di spegnersi (misurato: +600 dB in venti
secondi) — e per questo `piccoDi` misura il picco vero del filtro e ci divide,
con un ripiego prudente a 1,3 se la misura non riesce, **mai 1**. C'è poi un
filo di continua a 10⁻¹⁵ iniettato negli anelli: tiene i valori sopra la
soglia dei denormali, che su molti processori costano decine di volte tanto
proprio quando la coda sta svanendo.

**Un solo set di ascoltatori per il trascinamento.** Non registrarne uno per
quadrante: ogni movimento del puntatore ne sveglierebbe quattro volte tanti.

**Attenzione alle allocazioni nei cicli a 60 fps.** Niente nuovi buffer o
array dentro `draw`.

**Le stringhe del canvas si preparano al cambio di lingua, non a ogni
fotogramma.** `CANVAS.phrase` e `CANVAS.drops` sono costruite una volta da
`buildCanvasCache`; `draw` le legge e basta. Vale soprattutto per i
formattatori: costruire un `Intl.NumberFormat` dentro `draw` costa più di
tutto il resto del disegno. Ne esistono due, creati una volta per lingua.

**Il giapponese non ha maiuscolo.** La gerarchia delle etichette minute
poggia su MAIUSCOLO più tracking ampio, un dispositivo che in giapponese
semplicemente non esiste: le regole `:lang(ja)` in `style.css` la
ricostruiscono con corpo e 字間, e sul canvas c'è `CANVAS.trackMul`, perché
i glifi a piena larghezza vanno spaziati molto meno di quelli latini.

**Nei tessuti lo scarto fra le due voci è ADDITIVO, non proporzionale.**
Due sinusoidi distanti d hertz battono a d hertz qualunque sia la loro
altezza; con uno scarto proporzionale i toni gravi batterebbero molto più
lenti degli acuti, e il cursore "Battito" non manterrebbe la promessa.

**L'Intreccio va riscalato, non solo ripianificato.** Le durate dei tessuti
vivono dentro l'idea, costruita una volta sola: muovendo il cursore, senza
riscalarle il nuovo valore si vedrebbe soltanto alla prossima rigenerazione.
`L.planSovr` ricorda con quale intreccio sono state calcolate — stesso ruolo
di `planHead` per le gocce — e `buildPlanDrone` le moltiplica per il rapporto.
Verificato su quattrocento rigenerazioni per valore: la somma media delle
durate coincide col cursore entro lo 0,4%.

**Ogni riquadro accende e spegne la propria classe.** `gocceOn` e `tessutiOn`
in `audio.js`: il motore gira finché almeno una è accesa, e spente entrambe il
clock si ferma davvero (`applicaStato`). I cicli però continuano ad avanzare
anche a classe spenta, così riaccendendola riparte da dov'era — la stessa
promessa che la pausa fa per l'intero strumento. La barra spaziatrice resta il
comando globale: una scorciatoia che agisse su metà strumento sorprenderebbe.

**Le due classi di eventi si prenotano con lo stesso codice.** `prenota` in
`audio.js` è generica: prende la lista, la funzione che ricostruisce il piano
e quella che suona un evento. Le gocce e le tenute differiscono per come
suonano, non per come vengono collocate nel tempo — e due copie dello
scheduler divergerebbero al primo ritocco.

**Il riquadro delle tenute ha una tela propria, disegnata senza p5.** Due
riquadri con bordo proprio non possono condividere una tela, e p5 in modalità
globale ne governa comunque una sola: `droni.js` usa l'API 2D nativa. Il ciclo
di fotogrammi resta però **uno solo** — `draw` in `sketch.js` chiama
`drawDroni` — perché due animazioni indipendenti si sfaserebbero e su un
telefono costerebbero il doppio.

**Una tenuta accesa non può restare arancione.** Una goccia lampeggia per
meno di mezzo secondo; una tenuta resta aperta anche trenta. Tenerla accesa
riempirebbe la pagina dell'unico accento che il progetto vuole raro: arancione
solo nell'istante in cui si apre, poi inchiostro pieno finché suona.

## Convenzioni

**Il modello non dipende da nulla.** `model.js` non conosce né l'audio né la
grafica. Le dipendenze scorrono in una direzione sola:
model ← audio ← sketch/ui. Mantenere questa separazione.

**Le proporzioni del disegno sono frazioni del raggio**, mai pixel fissi:
i quadranti devono reggere a qualunque dimensione.

**Tipografia**: una sola famiglia (grottesco di sistema), gerarchia data da
peso e spaziatura. Peso 200 per i display, 300 per il testo, 400 con
tracking ampio per le etichette minute. p5 non conosce la spaziatura fra
lettere: per il testo su canvas usare `trackedText`.

**Le etichette dei comandi descrivono l'azione, non lo stato**
("Pausa", non "In ascolto"). Lo stato è raccontato dalla riga in alto e dal
punto che pulsa.

**I numeri che cambiano** usano cifre a larghezza fissa, altrimenti
tremolano a ogni aggiornamento.

## Verifica e pubblicazione

Non c'è una suite di test. Prima di ogni commit che tocchi il motore,
**verificare in locale** aprendo `index.html` e controllando che il suono
parta entro un secondo e che le lancette passino sulle gocce esattamente
quando suonano.

Per modifiche allo scheduler vale la pena scrivere una simulazione usa e
getta in Node, con i nodi audio sostituiti da stub, e controllare che ogni
goccia suoni una volta per ciclo, senza duplicati e con tempi crescenti.
È così che sono stati trovati i disallineamenti passati.

Ogni push su `main` ricostruisce automaticamente il sito su GitHub Pages:
https://valeriobelloni78.github.io/rada/

## Direzioni di lavoro

La priorità ora è **far crescere la parte visiva**. Idee già discusse, in
ordine di interesse:

1. **Rendere visibile l'altezza delle gocce.** Ogni evento ha un `rel` che
   ne decide il registro, oggi del tutto invisibile: tutte le gocce appaiono
   identiche. Mapparlo rivelerebbe il profilo melodico di ogni idea.
2. **Estendere la palette oraria al visivo.** L'ora del giorno oggi agisce
   solo sul suono: alle 23 Rada suona cupa ma appare identica a mezzogiorno.
3. **Rendere visibile il collage.** I quattro quadranti sono isole, ma il
   pezzo è ciò che accade *fra* loro. Ipotesi: una fascia temporale che
   mostri gli ultimi trenta secondi di tutti e quattro insieme (il modo più
   diretto per vedere lo sfasamento); legami effimeri fra frasi che suonano
   ravvicinate; un campo condiviso dove le gocce lasciano traccia.
4. **Rendere visibile il tempo lungo.** Una sedimentazione che accumuli i
   segni della sessione, e magari l'esportazione di un'immagine finale.

Tutti e quattro i quadranti stanno su **un unico canvas** proprio per
rendere possibili gli effetti che li attraversano: non separarli.

## Limiti noti

**In secondo piano il browser rallenta i timer**, da 25 ms a circa un secondo.
Il thread audio però non viene mai rallentato: una goccia già prenotata suona
comunque con precisione al campione. Per questo lo scheduler allarga la
finestra di prenotazione a tre secondi quando la pagina non si vede — con la
finestra stretta si perdeva il 61% delle gocce, misurato in simulazione.

La finestra però si adatta: se i giri dello scheduler si diradano davvero —
schermo bloccato, non semplice secondo piano — insegue il ritardo osservato
fino a dodici secondi. Il tetto è un compromesso: più in alto si va, più
audio resta impegnato al ritorno, e i cursori sembrano non rispondere.

Su **iOS** il problema è doppio e va tenuto distinto. Il primo è che WebKit
considera un AudioContext "suono d'ambiente" e lo sospende a schermo bloccato:
per questo si dichiara `navigator.audioSession.type = "playback"`, che è la
categoria della riproduzione lunga (e che fa suonare Rada anche con
l'interruttore del silenzioso inserito — voluto). Il secondo è che lo
scheduler vive sul thread principale: se iOS lo congela del tutto, nessuna
finestra basta, e l'unica vera soluzione sarebbe spostare la prenotazione
dentro un AudioWorklet, cioè sul thread audio. **Da verificare su un iPhone
vero.**
