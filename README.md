# Rada

**Quattro frasi sonore di lunghezza diversa che non tornano mai insieme allo stesso modo.**

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

Perché funzioni, i quattro periodi devono essere **coprimi a due a due**. Se due
frasi condividessero un divisore — 6 e 9, poniamo — tornerebbero insieme ogni 18
secondi e il collage collasserebbe in un motivo riconoscibile. Con 7, 11, 13 e 17
la combinazione completa si ripete dopo quasi cinque ore. L'interfaccia mostra
sempre questo tempo di riallineamento: è il numero che dice quanto a lungo lo
strumento resterà imprevedibile.

Il debito verso il *Music for Airports* di Brian Eno è dichiarato: là erano
spezzoni di nastro di lunghezze diverse, qui sono oscillatori e uno scheduler.

## Come si usa

| Gesto | Effetto |
|---|---|
| Trascina un quadrante in verticale | cambia la durata di quella frase (3–30 s) |
| Clic su un quadrante | silenzia o riattiva quella frase |
| ↻ sopra un quadrante | genera una nuova idea musicale per quella frase |
| Barra spaziatrice | avvia e ferma |
| Tasto Tab | raggiunge gli stessi comandi in forma nativa, per chi non usa il puntatore |

I cinque cursori governano il suono d'insieme: ampiezza del registro, calore
timbrico, spazio riverberante, densità delle idee e addensamento (quanta parte
del giro è attiva). Gli otto **mood** sono preset completi — timbro *e*
configurazione temporale — e rigenerano tutte le idee.

Tutta l'interazione dei quadranti esiste anche come comandi HTML nativi,
fuori campo ma raggiungibili col tasto Tab: il canvas da solo sarebbe muto
per una tastiera e per un lettore di schermo.

L'app legge inoltre **l'ora del sistema** e inclina di conseguenza registro,
calore e riverbero: alle 23 suona più cupa e spaziosa che a mezzogiorno. È
l'unica influenza esterna, e non richiede alcun permesso.

## Come funziona, tecnicamente

Nessuna dipendenza da installare, nessun passaggio di compilazione: si apre
`index.html` e funziona.

```
index.html          lo strumento: struttura e collegamenti
guida.html          la pagina di documentazione
css/style.css       palette, tipografia, impaginazione
css/guida.css       impaginazione della sola guida
js/i18n.js          le quattro lingue. Non dipende da nulla
js/guida-i18n.js    le parole della guida, sempre nelle quattro lingue
js/model.js         lo stato: frasi, idee, piani. Non dipende da nulla
js/audio.js         Web Audio API: sintesi e scheduler
js/sketch.js        p5.js: disegno dei quadranti e interazione
js/ui.js            cursori, mood, lingua, riga di stato
testi-guida.md      tavolo di lavoro dei testi italiani della guida
```

**L'interfaccia parla quattro lingue** — italiano, francese, inglese e
giapponese — e sceglie da sé quella del browser alla prima apertura,
ripiegando sull'inglese per tutte le altre. Le sigle in alto a destra
cambiano lingua al volo, anche mentre suona, e la scelta viene ricordata.
Si può anche imporre dall'indirizzo, con `?lang=ja`.

**Il suono usa la Web Audio API direttamente, non p5.sound.** Il cuore di Rada è
uno *scheduler a lookahead*: ogni 25 ms prenota le note sul clock del motore
audio, preciso al singolo campione. La finestra è adattiva — 150 ms quando la
pagina si vede, tre secondi quando è in secondo piano, dove il browser rallenta
i timer ma non il thread audio. I timer di JavaScript sono
troppo imprecisi per frasi che devono restare in fase per ore, e p5.sound è pensato
per gesti immediati più che per pianificazione rigorosa. La precisione temporale
qui è il progetto, non un dettaglio.

**La grafica usa p5.js**, con tutti e quattro i quadranti su un unico canvas.
Un solo piano di disegno permette, in futuro, effetti che attraversano le frasi:
scie, relazioni, campi che reagiscono all'insieme.

Un dettaglio che chi mette mano al codice apprezzerà: la palette è definita
**una volta sola**, nelle variabili CSS di `style.css`. Anche il canvas le legge.
Cambiarle lì cambia tutto.

## Modificarlo

Il punto d'ingresso più interessante è `js/sketch.js`, dove ogni quadrante è
disegnato in proporzioni relative al raggio: il disegno regge a qualunque
dimensione. Provare a sostituire i trattini con qualcos'altro è il modo più
rapido per capire come funziona.

Per cambiare le configurazioni temporali, guarda `MOODS` in `js/model.js` — e
ricordati la regola dei periodi coprimi, altrimenti perdi lo sfasamento. Le
chiavi lì sono identificatori: i nomi che si leggono sui bottoni stanno in
`js/i18n.js`, uno per lingua.

## Limiti noti

- In secondo piano il browser rallenta i timer, ma il thread audio no: lo
  scheduler se ne accorge e prenota le gocce tre secondi avanti invece di 150
  millisecondi, così il suono regge. Su iOS invece non c'è rimedio — ogni
  browser è WebKit, e WebKit sospende il Web Audio quando esci dall'app.
- Serve una connessione al primo caricamento, perché p5.js arriva da una CDN.
  Per usarla del tutto offline, scarica `p5.min.js` in una cartella `lib/` e
  cambia la riga corrispondente in `index.html`.

## Licenza

Codice rilasciato sotto licenza **MIT** — vedi [LICENSE](LICENSE). In pratica:
puoi usarlo, modificarlo e ridistribuirlo, anche in progetti commerciali,
mantenendo l'avviso di copyright.

p5.js è distribuita separatamente sotto licenza LGPL-2.1 e resta soggetta ai
propri termini.

---

## In English

**Rada** is a generative sound instrument that runs in the browser. Four musical
phrases loop at different periods (7, 11, 13, 17 seconds by default), each
concentrating its notes at the head of its cycle with silence filling the rest.
Because the periods are pairwise coprime, the phrases never realign the same way
— the full combination repeats only after nearly five hours.

Drag a dial to change its phrase length, click to mute, press ↻ for a new
musical idea. Five faders shape the overall sound; eight presets change both
timbre and temporal configuration. The instrument also reads your system clock
and shifts its character across the day.

The interface speaks Italian, French, English and Japanese, picking up your
browser's language on first visit and falling back to English. Switch it from
the top right, or force it with `?lang=ja`.

Audio uses the Web Audio API directly with a lookahead scheduler (sample-accurate
timing matters here); graphics use p5.js. No build step, no dependencies to
install — open `index.html` and it runs. MIT licensed.
