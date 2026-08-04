# Rada — contesto di progetto

Strumento generativo nel browser. Quattro frasi sonore di lunghezza diversa,
ciascuno col proprio periodo, che non tornano mai insieme allo stesso modo.

**Rispondi sempre in italiano.** Commenti nel codice, messaggi di commit e
testi dell'interfaccia sono in italiano.

## Regole da non violare

**I periodi delle frasi devono restare coprimi a due a due.** È il cuore del
progetto: se due frasi condividono un divisore tornano insieme presto e il
collage collassa in un motivo riconoscibile. Vale per ogni serie in `MOODS`.
Verificare sempre il minimo comune multiplo prima di proporre nuove serie.

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

**Un solo set di ascoltatori per il trascinamento.** Non registrarne uno per
quadrante: ogni movimento del puntatore ne sveglierebbe quattro volte tanti.

**Attenzione alle allocazioni nei cicli a 60 fps.** Niente nuovi buffer o
array dentro `draw`.

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

Se la scheda va in secondo piano il browser rallenta i timer e il suono si
fa intermittente. È un limite del web, non aggirabile: Rada è pensata per
essere ascoltata mentre la si guarda.
