# Rada

**Quattro loop sonori di lunghezza diversa che non tornano mai insieme allo stesso modo.**

Rada è uno strumento generativo che vive nel browser. Non riproduce un brano
registrato: costruisce il suono in tempo reale, ora per ora, e non si ripete mai.

→ **[Ascolta Rada](https://TUO-UTENTE.github.io/rada/)**

<!-- Sostituisci TUO-UTENTE con il tuo nome utente GitHub dopo aver attivato Pages -->

---

## L'idea

Quattro frasi musicali girano ciascuna col proprio periodo — 7, 11, 13 e 17
secondi nella configurazione di partenza. Ogni frase concentra le sue note nella
**testa** del giro; tutto il resto è silenzio, e quel silenzio non è un
riempitivo: **è il meccanismo**. Sfasando i periodi, le frasi si incontrano ogni
volta in una combinazione diversa.

Perché funzioni, i quattro periodi devono essere **coprimi a due a due**. Se due
loop condividessero un divisore — 6 e 9, poniamo — tornerebbero insieme ogni 18
secondi e il collage collasserebbe in un motivo riconoscibile. Con 7, 11, 13 e 17
la combinazione completa si ripete dopo quasi cinque ore. L'interfaccia mostra
sempre questo tempo di riallineamento: è il numero che dice quanto a lungo lo
strumento resterà imprevedibile.

Il debito verso il *Music for Airports* di Brian Eno è dichiarato: là erano
spezzoni di nastro di lunghezze diverse, qui sono oscillatori e uno scheduler.

## Come si usa

| Gesto | Effetto |
|---|---|
| Trascina un quadrante in verticale | cambia la durata di quel loop (3–30 s) |
| Clic su un quadrante | silenzia o riattiva quel loop |
| ↻ sopra un quadrante | genera una nuova idea musicale per quel loop |
| Barra spaziatrice | avvia e ferma |

I cinque cursori governano il suono d'insieme: ampiezza del registro, calore
timbrico, spazio riverberante, densità delle idee e addensamento (quanta parte
del giro è attiva). I quattro **mood** sono preset completi — timbro *e*
configurazione temporale — e rigenerano tutte le idee.

L'app legge inoltre **l'ora del sistema** e inclina di conseguenza registro,
calore e riverbero: alle 23 suona più cupa e spaziosa che a mezzogiorno. È
l'unica influenza esterna, e non richiede alcun permesso.

## Come funziona, tecnicamente

Nessuna dipendenza da installare, nessun passaggio di compilazione: si apre
`index.html` e funziona.

```
index.html          struttura e collegamenti
css/style.css       palette, tipografia, impaginazione
js/model.js         lo stato: loop, idee, piani. Non dipende da nulla
js/audio.js         Web Audio API: sintesi e scheduler
js/sketch.js        p5.js: disegno dei quadranti e interazione
js/ui.js            cursori, mood, riga di stato
```

**Il suono usa la Web Audio API direttamente, non p5.sound.** Il cuore di Rada è
uno *scheduler a lookahead*: ogni 25 ms guarda 150 ms avanti e prenota le note sul
clock del motore audio, preciso al singolo campione. I timer di JavaScript sono
troppo imprecisi per loop che devono restare in fase per ore, e p5.sound è pensato
per gesti immediati più che per pianificazione rigorosa. La precisione temporale
qui è il progetto, non un dettaglio.

**La grafica usa p5.js**, con tutti e quattro i quadranti su un unico canvas.
Un solo piano di disegno permette, in futuro, effetti che attraversano i loop:
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
ricordati la regola dei periodi coprimi, altrimenti perdi lo sfasamento.

## Limiti noti

- Se lasci la scheda in secondo piano il browser rallenta i timer e il suono
  diventa intermittente. È un limite del web, non aggirabile: Rada è pensata per
  essere ascoltata mentre la si guarda.
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

Drag a dial to change its loop length, click to mute, press ↻ for a new musical
idea. Five faders shape the overall sound; four presets change both timbre and
temporal configuration. The instrument also reads your system clock and shifts
its character across the day.

Audio uses the Web Audio API directly with a lookahead scheduler (sample-accurate
timing matters here); graphics use p5.js. No build step, no dependencies to
install — open `index.html` and it runs. MIT licensed.
