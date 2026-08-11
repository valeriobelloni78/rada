# Rada · proposta per il README

Il README oggi racconta metà strumento: parla delle quattro frasi di gocce e
non sa che esistono i tessuti. Qui sotto c'è la versione riscritta, da
correggere direttamente in questo file. Quando mi dici che l'hai aggiornato,
la riporto in `README.md` e cancello questo.

**Come funziona questo file**, come per `testi-guida.md`: sotto la riga
orizzontale c'è **il README proposto, parola per parola**. Modifica quello che
vuoi — è già nella forma finale, non c'è nulla da tradurre e nessun titoletto
fra parentesi quadre da rispettare. Cancella pure interi paragrafi: quello che
non c'è, non ci sarà.

**Cosa è cambiato rispetto a oggi**, se vuoi guardare solo lì:

| Dove | Cosa |
|---|---|
| la riga d'apertura | non promette più quattro linee, ma otto |
| «L'idea» | un paragrafo nuovo sui tessuti e sui loro periodi |
| «Come si usa» | i gesti valgono per due riquadri; i cursori sono dieci, i preset sedici |
| «Come funziona» | la grafica non è più p5; una nota sul ciclo di fotogrammi unico |
| «Limiti noti» | tolta la riga sulla rete, che non vale più |
| «In English» | rifatta di conseguenza |

I numeri che compaiono qui sotto li ho verificati nel codice, non ricordati:
periodi di partenza, estremi dei cursori, secondi della fascia temporale.

---

# Rada

**Otto linee sonore di lunghezza diversa che non tornano mai insieme allo stesso modo.**

Rada è uno strumento generativo che vive nel browser. Non riproduce un brano
registrato: costruisce il suono in tempo reale, ora per ora, e non si ripete mai.

→ **[Ascolta Rada](https://valeriobelloni78.github.io/rada/)** · [Guida](https://valeriobelloni78.github.io/rada/guida.html)

---

## L'idea

Quattro frasi musicali girano ciascuna col proprio periodo — 7, 11, 13 e 17
secondi nella configurazione di partenza. Ogni frase concentra le sue note nella
**testa** del giro; tutto il resto è silenzio, e quel silenzio non è un
riempitivo: **è il meccanismo**. Sfasando i periodi, le frasi si incontrano ogni
volta in una combinazione diversa.

Perché funzioni, i periodi devono essere **coprimi a due a due**. Se due
frasi condividessero un divisore — 6 e 9, poniamo — tornerebbero insieme ogni 18
secondi e il collage collasserebbe in un motivo riconoscibile. Con 7, 11, 13 e 17
la combinazione completa si ripete dopo quasi cinque ore. L'interfaccia mostra
sempre questo tempo di riallineamento: è il numero che dice quanto a lungo lo
strumento resterà imprevedibile.

Sotto le quattro frasi ne girano altre quattro, e non fanno la stessa cosa. Le
gocce **accadono**: un attacco, una coda, e la nota è già passata. I tessuti
**durano** — si aprono lentamente, restano aperti anche mezzo minuto, si
dissolvono — e sovrapponendosi fra loro e alle gocce formano le tessiture. I
loro periodi sono coprimi anche con quelli delle frasi — 9, 16, 25 e 31 alla
partenza — e non devono essere numeri primi: basta che non condividano fattori.
**Le linee che non tornano mai insieme sono otto, non due gruppi da quattro.**

Il debito verso il *Music for Airports* di Brian Eno è dichiarato: là erano
spezzoni di nastro di lunghezze diverse, qui sono oscillatori e uno scheduler.

## Come si usa

I gesti sono gli stessi nei due riquadri.

| Gesto | Effetto |
|---|---|
| Trascina un quadrante in verticale | cambia la durata di quella linea (3–30 s le frasi, 7–60 s i tessuti) |
| Clic su un quadrante | silenzia o riattiva quella linea |
| ↻ sopra un quadrante | genera una nuova idea musicale per quella linea |
| Avvia / Pausa sotto un riquadro | ferma solo quella classe: si possono lasciare i tessuti e mettere in pausa le frasi, o il contrario |
| Barra spaziatrice | avvia e ferma tutto |
| Tasto Tab | raggiunge gli stessi comandi in forma nativa, per chi non usa il puntatore |

Ogni riquadro ha **cinque cursori** e **otto preset**.

Per le frasi: ampiezza del registro, calore timbrico, spazio riverberante,
densità delle idee e addensamento (quanta parte del giro è attiva).

Per i tessuti: estensione del registro in ottave, secondi di affioramento,
secondi di dissolvenza, intreccio (quanti tessuti restano aperti insieme, in
media) e battito, cioè la pulsazione in hertz fra le due sinusoidi appena
scordate di cui ogni tessuto è fatto.

I preset — otto per classe — sono configurazioni complete, timbro *e*
configurazione temporale, e rigenerano tutte le idee di quella classe.

In fondo a ciascun riquadro una **fascia temporale** mostra gli ultimi trenta
secondi di tutte e quattro le linee sulla stessa riga del tempo: è il modo più
diretto per vedere lo sfasamento, che i quadranti, isole indipendenti, non
possono mostrare da soli. Sotto le frasi ogni punto è una goccia; sotto i
tessuti ogni segmento è un suono che dura, e la sua lunghezza è il tempo per
cui resta aperto.

L'app legge inoltre **l'orologio del sistema**, e ne ricava due influenze
simmetriche: l'ora del giorno inclina le gocce — alle 23 suonano più cupe e
spaziose che a mezzogiorno — e la stagione inclina i tessuti, raccogliendone il
registro d'inverno e allargandolo d'estate. Ciascuna ha la sua riga di stato,
sopra il riquadro che governa. Sono le uniche influenze esterne, e non
richiedono alcun permesso.

## Come funziona, tecnicamente

Nessuna dipendenza da installare, nessun passaggio di compilazione, nessuna
libreria: si apre `index.html` e funziona, anche senza rete.

```
index.html          lo strumento: struttura e collegamenti
guida.html          la pagina di documentazione
css/style.css       palette, tipografia, impaginazione
css/guida.css       impaginazione della sola guida
js/i18n.js          le quattro lingue. Non dipende da nulla
js/guida-i18n.js    le parole della guida, sempre nelle quattro lingue
js/model.js         lo stato: linee, idee, piani. Non dipende da nulla
js/audio.js         Web Audio API: sintesi, riverbero e scheduler
js/frasi.js         disegno delle frasi, interazione e ciclo di fotogrammi
js/droni.js         la seconda tela: il riquadro dei tessuti
js/ui.js            cursori, preset, lingua, riga di stato
testi-guida.md      tavolo di lavoro dei testi italiani della guida
```

**L'interfaccia parla quattro lingue** — italiano, francese, inglese e
giapponese — e sceglie da sé quella del browser alla prima apertura,
ripiegando sull'inglese per tutte le altre. Le sigle in alto a destra
cambiano lingua al volo, anche mentre suona, e la scelta viene ricordata.
Si può anche imporre dall'indirizzo, con `?lang=ja`.

**Il suono usa la Web Audio API direttamente.** Il cuore di Rada è uno
*scheduler a lookahead*: ogni 25 ms prenota le note sul clock del motore
audio, preciso al singolo campione. La finestra è adattiva — 150 ms quando la
pagina si vede, tre secondi quando è in secondo piano, dove il browser rallenta
i timer ma non il thread audio, e fino a dodici se i timer vengono strozzati sul
serio. I timer di JavaScript sono troppo imprecisi per linee che devono restare
in fase per ore: la precisione temporale qui è il progetto, non un dettaglio.

Anche il riverbero è scritto a mano — quattro filtri a pettine e due passa-tutto
per canale, la rete di Schroeder — perché una convoluzione costava troppo ai
telefoni modesti, e su quelli Rada gracchiava.

**La grafica usa l'API 2D del browser**, con i quattro quadranti delle frasi su
un unico canvas. Un solo piano di disegno permette effetti che le attraversano:
già oggi il filo che unisce due gocce quasi simultanee, e in futuro scie,
relazioni, campi che reagiscono all'insieme. Il riquadro dei tessuti ha una tela
propria, perché due riquadri con un bordo proprio non possono condividerne una,
ma **il ciclo di fotogrammi è uno solo**: due animazioni indipendenti si
sfaserebbero, e su un telefono costerebbero il doppio.

Tutta l'interazione dei quadranti — di tutti e otto — esiste anche come comandi
HTML nativi, fuori campo ma raggiungibili col tasto Tab: il canvas da solo
sarebbe muto per una tastiera e per un lettore di schermo.

Un dettaglio che chi mette mano al codice apprezzerà: la palette è definita
**una volta sola**, nelle variabili CSS di `style.css`. Anche il canvas le legge.
Cambiarle lì cambia tutto.

## Modificarlo

Il punto d'ingresso più interessante è `js/frasi.js`, dove ogni quadrante è
disegnato in proporzioni relative al raggio: il disegno regge a qualunque
dimensione. Provare a sostituire i trattini con qualcos'altro è il modo più
rapido per capire come funziona.

Per cambiare le configurazioni temporali, guarda `MOODS` e `DRONI_MOODS` in
`js/model.js` — e ricordati la regola dei periodi coprimi, altrimenti perdi lo
sfasamento. Le chiavi lì sono identificatori: i nomi che si leggono sui bottoni
stanno in `js/i18n.js`, uno per lingua.

## Limiti noti

- In secondo piano il browser rallenta i timer, ma il thread audio no: lo
  scheduler se ne accorge e prenota le gocce più avanti — tre secondi, e fino
  a dodici se i timer vengono strozzati sul serio, come a schermo bloccato.
- Su iOS Rada si dichiara al sistema come riproduzione musicale, così da
  restare viva a schermo bloccato e comparire fra i comandi della schermata di
  blocco. Ne consegue che suona anche con l'interruttore del silenzioso
  inserito. Se il sistema congela del tutto la pagina non c'è comunque
  finestra che tenga: servirebbe spostare lo scheduler in un AudioWorklet.

## Licenza

Codice rilasciato sotto licenza **MIT** — vedi [LICENSE](LICENSE). In pratica:
puoi usarlo, modificarlo e ridistribuirlo, anche in progetti commerciali,
mantenendo l'avviso di copyright. Non c'è codice di terzi: nessuna libreria,
nessuna licenza da rispettare oltre a questa.

---

## In English

**Rada** is a generative sound instrument that runs in the browser. Four
phrases of drops loop at different periods (7, 11, 13, 17 seconds by default),
each concentrating its notes at the head of its cycle with silence filling the
rest. Below them four sustained weaves turn at periods of their own, coprime
with the phrases' as well. Because every period is pairwise coprime with every
other, the eight lines never realign the same way.

Drag a dial to change its length, click to mute, press ↻ for a new musical
idea. Each of the two cards has five faders, eight presets and its own play
button, so you can leave the weaves running while the phrases rest. The
instrument also reads your system clock and shifts its character across the day.

The interface speaks Italian, French, English and Japanese, picking up your
browser's language on first visit and falling back to English. Switch it from
the top right, or force it with `?lang=ja`.

Audio uses the Web Audio API directly with a lookahead scheduler (sample-accurate
timing matters here); graphics use the browser's own 2D canvas API. No build
step, no libraries, nothing to install — open `index.html` and it runs, even
offline. MIT licensed.
