/* =============================================================================
   RADA · guida-i18n.js — le parole della guida, nelle quattro lingue

   Sta separato da i18n.js per una ragione di misura: là ci sono le etichette
   minute dell'interfaccia, qui la prosa lunga della documentazione. Tenerle
   insieme avrebbe reso illeggibile il file che serve a ogni schermata.

   Si carica solo da guida.html, DOPO i18n.js, di cui usa il macchinario:
   il dizionario si limita ad aggiungersi a quello dell'interfaccia. Le voci
   che esistono già — i nomi dei cursori, quelli dei mood — non si riscrivono:
   arrivano da lì, così le due pagine non possono divergere.
============================================================================= */

const GUIDA = {

  it: {
    "g.title":        "Rada · Guida",
    "meta.description": "Come funziona Rada e come si usa: quattro frasi, periodi coprimi, e il collage che accade fra loro.",
    "g.back":         "Ascolta Rada",

    "g.open1": "Rada è uno spazio sonoro nel quale si può indugiare nei propri ricordi mentre si guarda fuori dalla finestra. In questo spazio puoi prenderti cura della tua attenzione, i tessuti sonori producono delle sensazioni tattili e le gocce che ascolti cadono in un tempo dilatato nel quale puoi chiederti “come mi sento?”. L'ascolto è un'attività da coltivare, è un territorio che ha le sue poetiche e i suoi campi di forza. Rada è un'insenatura tranquilla lungo la costa di un oceano di rumore. Tra le gocce troverai dei silenzi che parlano; ascoltali.",

    "g.concept.t": "Il concetto",
    "g.concept1": "Rada sviluppa il suono mentre lo ascolti.",
    "g.concept2": "Frasi composte da gocce e tessuti sonori fatti di lunghi respiri girano ciascuno col proprio periodo. Nella configurazione di partenza questi periodi sono, per le gocce, di sette, undici, tredici e diciassette secondi. Ogni frase concentra le sue note in un arco, poi tace fino al giro successivo. Quei silenzi fuori fase fanno in modo che i quattro archi si incontrino ogni volta in una combinazione diversa. Sotto le quattro frasi ne girano altre quattro, coi propri periodi: non gocce ma suoni tenuti, che si aprono e si dissolvono lentamente. Le linee fuori fase sono otto in tutto, e il pezzo è quello che accade quando si sovrappongono.",
    "g.concept3": "Questa è l'idea alla base di “Music for Airports” di Brian Eno e questo progetto è un tributo al suo lavoro.",

    "g.flow.t":     "Lo scorrere dei tempi",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 ore",
    "g.flow1": "Perché la combinazione resti imprevedibile, i periodi devono essere <i>coprimi</i> a due a due: presi a coppie, non devono avere alcun divisore in comune.",
    "g.flow2": "Se due frasi durassero ad esempio sei e nove secondi condividerebbero il tre come divisore, e tornerebbero a coincidere ogni diciotto secondi. L'orecchio sentirebbe subito questa ripetizione e il collage collasserebbe in un motivo riconoscibile. Con sette, undici, tredici e diciassette — primi fra loro — la combinazione completa si ripete solo dopo 17.017 secondi, quasi cinque ore.",

    "g.lbl.gestures": "I gesti",
    "g.gest1.k": "Trascina in verticale",
    "g.gest1": "Cambia la durata di quella frase, fra 3 e 30 secondi. La nuova durata entra in vigore al giro successivo, mai a metà di uno in corso.",
    "g.gest2.k": "Clic su un quadrante",
    "g.gest2": "Silenzia quella frase, o la riattiva. Il quadrante impallidisce ma continua a girare in silenzio: quando la riaccendi è già dove sarebbe stata, non riparte da capo.",
    "g.gest3.k": "↻ sopra un quadrante",
    "g.gest3": "Genera una nuova idea musicale per quella frase soltanto: altre note, altro numero di gocce, altra posizione dell'arco.",
    "g.gest4.k": "Barra spaziatrice",
    "g.gest4": "Avvia e ferma tutto. Ogni riquadro ha però anche il suo pulsante, che governa solo la propria classe. Alla ripresa il collage riparte esattamente da dov'era.",

    "g.lbl.faders": "I cinque cursori per le frasi",
    "g.f1": "Modifica quanto si allarga il ventaglio delle altezze. A zero tutte le gocce cadono sulla stessa nota centrale; al massimo l'idea si distende sulle quattro ottave della scala.",
    "g.f2": "Da vetroso a morbido. Più calore significa meno armoniche acute e una coda più lunga: il decadimento passa da poco meno di due secondi a quasi cinque.",
    "g.f3": "Modifica quanta parte del suono passa per il riverbero. Al massimo le gocce restano sospese a lungo dopo aver smesso di suonare.",
    "g.f4": "Modifica il numero <em>massimo</em> di gocce che una nuova idea può contenere: è un tetto, non un numero fisso. Ogni rigenerazione pesca fra una goccia e questo limite, perciò le quattro frasi restano diverse fra loro.",
    "g.f5": "Modifica quanta parte del giro è occupata dalle note. Al 30% le gocce stanno nel primo terzo e tutto il resto è silenzio; al massimo si distribuiscono quasi su tutto il giro, e lo sfasamento si fa meno percepibile.",
    "g.f.note": "I cursori del calore e dello spazio mostrano due numeri quando l'ora del giorno li inclina: il primo è dove l'hai messo tu, il secondo è il valore che sta davvero suonando.",

    "g.lbl.moods": "Gli otto stati d'animo per le frasi",
    "g.moods.intro": "Ogni stato d'animo è una configurazione completa: timbro <em>e</em> configurazione temporale. Cambiarlo rigenera anche le quattro idee. Il tempo indicato è quello di riallineamento.",
    "g.m.sereno":     "L'equilibrio di partenza: registro medio, coda ampia, poche gocce ben distanziate.",
    "g.m.pioggia":    "Periodi brevi e densità alta: il fitto continuo, dove le quattro frasi si incrociano di continuo.",
    "g.m.vespro":     "Periodi lunghi, timbro caldissimo, pochissime note. Il più rarefatto.",
    "g.m.carillon":   "Registro largo e timbro chiaro, con gocce sparse su tutte le ottave.",
    "g.m.arcipelago": "Isole di suono molto distanti fra loro: massimo tre gocce per idea, riverbero esteso, zone attive molto strette.",
    "g.m.collina":    "Caldo e raccolto, con una zona attiva ampia che dà un andamento ondulato e continuo.",
    "g.m.finestra":   "Timbro netto e freddo, coda corta: il più asciutto e definito degli otto.",
    "g.m.nuvola":     "Densità massima, riverbero quasi al limite e timbro vetroso: tante gocce dure dentro una coda che ne diluisce i contorni.",
    "g.mt.sereno": "4,7 ore",  "g.mt.pioggia": "58 minuti", "g.mt.vespro": "2,5 giorni", "g.mt.carillon": "4,3 ore",
    "g.mt.arcipelago": "1,3 giorni", "g.mt.collina": "14,8 ore", "g.mt.finestra": "20,1 ore", "g.mt.nuvola": "8,7 ore",

    "g.hour.t": "L'ora del giorno",
    "g.hour1": "Rada legge l'orologio del sistema e inclina di conseguenza il registro, il calore e lo spazio: alle 23 suona più cupa e riverberata che a mezzogiorno.",
    "g.hour2": "Le palette sono sei: <em>alba</em>, <em>mattino</em>, <em>pomeriggio</em>, <em>tramonto</em>, <em>sera</em> e <em>notturna</em>. La riga di stato in alto dice sempre quale è in vigore.",
    "g.hour3": "Ai tessuti parla invece la stagione, che è la stessa idea a un'altra scala: la riga sopra il loro riquadro dice il giorno e quale delle quattro è in vigore. L'inverno raccoglie il registro e rallenta il respiro; l'estate lo allarga e accelera il battito. Un giro però dura un anno, quindi non lo vedrai muoversi.",

    "g.strip.t": "La fascia temporale",
    "g.strip1": "Ogni riquadro ne ha una: da destra verso sinistra scorrono gli ultimi trenta secondi. Sotto le frasi ogni punto è una goccia; sotto i tessuti ogni segmento è un suono che dura, e la sua lunghezza è il tempo per cui resta aperto.",
    "g.strip2": "Puoi guardarlo come se fosse uno spartito in movimento, o un sovrapporsi di strati sonori che scorrono con viscosità differenti.",

    "g.name.t": "Il nome",
    "g.name1": "Una <em>rada</em> è il tratto di mare riparato dove le navi sostano al riparo dai venti e dalle onde.",
    "g.name.note": "Un dettaglio che si nota solo guardando: quando due gocce di frasi diverse suonano a meno di due decimi di secondo l'una dall'altra, un sottile filo rosso le unisce per un istante.",

    "g.foot.code": "Il codice su GitHub",
    "g.tes.t": "I tessuti",
    "g.tes1": "Sotto le quattro frasi ce ne sono altre quattro, e non fanno la stessa cosa. Le gocce accadono: un attacco, una coda, e la nota è già passata. I tessuti invece durano — si aprono lentamente, restano aperti anche mezzo minuto, si dissolvono. Sovrapponendosi fra loro e alle gocce formano le tessiture, ed è la ragione per cui esistono.",
    "g.tes2": "Anche qui i periodi sono coprimi a due a due, e lo sono anche con quelli delle frasi: le linee che non tornano mai insieme sono otto, non due gruppi da quattro. Non devono essere numeri primi — basta che non abbiano fattori in comune — ed è per questo che si scende fino a otto secondi.",
    "g.tes3": "Ogni riquadro ha il suo pulsante: si possono lasciare i tessuti e mettere in pausa le frasi, o il contrario. La barra spaziatrice invece vale per entrambi.",
    "g.lbl.tfaders": "I cinque cursori dei tessuti",
    "g.tf1": "Quanto si allarga il ventaglio delle altezze, misurato in ottave. A zero tutti i tessuti cadono sulla stessa nota; al massimo si distendono sulle quattro ottave della scala.",
    "g.tf2": "I secondi che un tessuto impiega a emergere. Nulla attacca, tutto affiora: è l'inviluppo rovesciato rispetto a quello delle gocce.",
    "g.tf3": "I secondi che impiega a sparire. Insieme all'affioramento decide quanta parte del tessuto è movimento e quanta è stasi.",
    "g.tf4": "Quanti tessuti restano aperti insieme, in media, su ciascuna linea. Sotto uno restano dei silenzi; sopra due la trama non si interrompe mai. È il numero che si vede nella fascia in fondo al riquadro.",
    "g.tf5": "Ogni tessuto è fatto di due sinusoidi appena scordate, e la loro differenza in hertz è la pulsazione che si sente: a mezzo hertz il suono si gonfia e si sgonfia una volta ogni due secondi, a due hertz trema. Senza quel battito una nota tenuta mezzo minuto sarebbe un muro immobile, e l'orecchio smetterebbe di seguirla.",
    "g.lbl.tmoods": "Gli otto tessuti",
    "g.tmoods.intro": "Come per le frasi, ogni stato d'animo è una configurazione completa. Due cose però restano fuori dai cursori: quanti tessuti per giro e quanto stanno sotto alle gocce sono il carattere del preset, non una manopola.",
    "g.tm.velo": "L'equilibrio di partenza: registro medio, sovrapposizione appena sopra l'uno.",
    "g.tm.fondale": "Uno strato solo per giro, lunghissimo e grave. Il più immobile degli otto.",
    "g.tm.lino": "Tre per giro molto sovrapposti: la trama non si interrompe mai.",
    "g.tm.respiro": "Registro largo e sovrapposizione sotto l'uno: fra un tessuto e l'altro resta il silenzio.",
    "g.tm.bruma": "Il più acuto e il più tenue, quasi tre ottave di estensione.",
    "g.tm.tenda": "Meno di un'ottava, tutta in basso, e il livello più alto degli otto.",
    "g.tm.seta": "Battito quasi doppio degli altri e affioramento rapido: il più inquieto.",
    "g.tm.vela": "Un tessuto solo per giro, che può durare fino a cinquanta secondi.",
    "g.tmt.velo": "1,3 giorni",
    "g.tmt.fondale": "23,4 giorni",
    "g.tmt.lino": "14,6 ore",
    "g.tmt.respiro": "13,6 giorni",
    "g.tmt.bruma": "26,8 giorni",
    "g.tmt.tenda": "11,1 giorni",
    "g.tmt.seta": "14,5 ore",
    "g.tmt.vela": "36,6 giorni",
    "g.credits": "Rada è un progetto sviluppato da Valerio Belloni",
  },

  fr: {
    "g.title":        "Rada · Guide",
    "meta.description": "Comment fonctionne Rada et comment s'en servir : quatre phrases, des périodes premières entre elles, et le collage qui naît entre elles.",
    "g.back":         "Écouter Rada",

    "g.open1": "Rada est un espace sonore où l'on peut s'attarder dans ses souvenirs en regardant par la fenêtre. Dans cet espace tu peux prendre soin de ton attention~: les tissus sonores produisent des sensations tactiles et les gouttes que tu écoutes tombent dans un temps dilaté où tu peux te demander «~comment est-ce que je me sens~?~». L'écoute est une pratique à cultiver, un territoire qui a ses poétiques et ses champs de force. Rada est une crique tranquille sur la côte d'un océan de bruit. Entre les gouttes tu trouveras des silences qui parlent~; écoute-les.",

    "g.concept.t": "Le concept",
    "g.concept1": "Rada développe le son pendant que tu l'écoutes.",
    "g.concept2": "Des phrases faites de gouttes et des tissus sonores faits de longues respirations tournent chacun avec sa propre période. Dans la configuration de départ ces périodes sont, pour les gouttes, de sept, onze, treize et dix-sept secondes. Chaque phrase concentre ses notes dans un arc, puis se tait jusqu'au tour suivant. Ces silences déphasés font que les quatre arcs se rencontrent chaque fois dans une combinaison différente. Sous les quatre phrases en tournent quatre autres, avec leurs propres périodes~: non pas des gouttes mais des sons tenus, qui s'ouvrent et se dissolvent lentement. Les lignes déphasées sont huit en tout, et la pièce est ce qui advient lorsqu'elles se superposent.",
    "g.concept3": "C'est l'idée à la base de «~Music for Airports~» de Brian Eno, et ce projet est un hommage à son travail.",

    "g.flow.t":     "L'écoulement des temps",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 heures",
    "g.flow1": "Pour que la combinaison reste imprévisible, les périodes doivent être <i>premières entre elles</i> deux à deux~: prises par paires, elles ne doivent avoir aucun diviseur commun.",
    "g.flow2": "Si deux phrases duraient par exemple six et neuf secondes, elles partageraient le trois comme diviseur et reviendraient à coïncider toutes les dix-huit secondes. L'oreille entendrait aussitôt cette répétition et le collage s'effondrerait en un motif reconnaissable. Avec sept, onze, treize et dix-sept — premiers entre eux — la combinaison complète ne se répète qu'après 17 017 secondes, presque cinq heures.",

    "g.lbl.gestures": "Les gestes",
    "g.gest1.k": "Glisser à la verticale",
    "g.gest1": "Change la durée de cette phrase, entre 3 et 30 secondes. La nouvelle durée prend effet au tour suivant, jamais au milieu d'un tour en cours.",
    "g.gest2.k": "Clic sur un cadran",
    "g.gest2": "Met cette phrase en silence, ou la réveille. Le cadran pâlit mais continue de tourner en silence~: quand tu la rallumes, elle est déjà là où elle serait arrivée, elle ne repart pas du début.",
    "g.gest3.k": "↻ au-dessus d'un cadran",
    "g.gest3": "Engendre une nouvelle idée musicale pour cette phrase seulement~: d'autres notes, un autre nombre de gouttes, une autre position de l'arc.",
    "g.gest4.k": "Barre d'espace",
    "g.gest4": "Lance et arrête tout. Chaque cadre a pourtant aussi son bouton, qui ne gouverne que sa propre classe. À la reprise, le collage repart exactement d'où il était.",

    "g.lbl.faders": "Les cinq curseurs des phrases",
    "g.f1": "Modifie l'ouverture de l'éventail des hauteurs. À zéro toutes les gouttes tombent sur la même note centrale~; au maximum l'idée s'étend sur les quatre octaves de la gamme.",
    "g.f2": "Du vitreux au moelleux. Plus de chaleur signifie moins d'harmoniques aiguës et une traîne plus longue~: la décroissance passe d'un peu moins de deux secondes à presque cinq.",
    "g.f3": "Modifie la part du son qui passe par la réverbération. Au maximum les gouttes restent longtemps suspendues après avoir cessé de sonner.",
    "g.f4": "Modifie le nombre <em>maximal</em> de gouttes qu'une nouvelle idée peut contenir~: c'est un plafond, pas un nombre fixe. Chaque régénération tire entre une goutte et cette limite, et c'est pourquoi les quatre phrases restent différentes.",
    "g.f5": "Modifie la part du tour occupée par les notes. À 30~% les gouttes tiennent dans le premier tiers et tout le reste est silence~; au maximum elles se répartissent sur presque tout le tour, et le déphasage devient moins perceptible.",
    "g.f.note": "Les curseurs de la chaleur et de l'espace affichent deux nombres quand l'heure du jour les incline~: le premier est là où tu l'as mis, le second est la valeur qui sonne réellement.",

    "g.lbl.moods": "Les huit humeurs des phrases",
    "g.moods.intro": "Chaque humeur est une configuration complète~: le timbre <em>et</em> la disposition temporelle. En changer régénère aussi les quatre idées. Le temps indiqué est celui du réalignement.",
    "g.m.sereno":     "L'équilibre de départ~: registre moyen, traîne ample, peu de gouttes bien espacées.",
    "g.m.pioggia":    "Périodes courtes et densité élevée~: le tissu serré, où les quatre phrases se croisent sans cesse.",
    "g.m.vespro":     "Périodes longues, timbre très chaud, très peu de notes. Le plus raréfié.",
    "g.m.carillon":   "Registre large et timbre clair, avec des gouttes dispersées sur toutes les octaves.",
    "g.m.arcipelago": "Des îles de son très éloignées les unes des autres~: trois gouttes au maximum par idée, réverbération étendue, zones actives très étroites.",
    "g.m.collina":    "Chaud et recueilli, avec une zone active ample qui donne une allure ondulée et continue.",
    "g.m.finestra":   "Timbre net et froid, traîne courte~: le plus sec et le plus défini des huit.",
    "g.m.nuvola":     "Densité maximale, réverbération presque à la limite et timbre vitreux~: beaucoup de gouttes dures dans une traîne qui en dilue les contours.",
    "g.mt.sereno": "4,7 heures", "g.mt.pioggia": "58 minutes", "g.mt.vespro": "2,5 jours", "g.mt.carillon": "4,3 heures",
    "g.mt.arcipelago": "1,3 jours", "g.mt.collina": "14,8 heures", "g.mt.finestra": "20,1 heures", "g.mt.nuvola": "8,7 heures",

    "g.hour.t": "L'heure du jour",
    "g.hour1": "Rada lit l'horloge du système et incline en conséquence le registre, la chaleur et l'espace~: à 23~h elle sonne plus sombre et plus réverbérée qu'à midi.",
    "g.hour2": "Les palettes sont six~: <em>aube</em>, <em>matin</em>, <em>après-midi</em>, <em>crépuscule</em>, <em>soir</em> et <em>nuit</em>. La ligne d'état, en haut, indique toujours celle qui est en vigueur.",
    "g.hour3": "Aux tissus parle la saison, la même idée à une autre échelle~: la ligne au-dessus de leur cadre dit le jour et laquelle des quatre est en vigueur. L'hiver resserre le registre et ralentit la respiration~; l'été l'élargit et accélère le battement. Un tour dure pourtant un an~: tu ne le verras pas bouger.",

    "g.strip.t": "La bande temporelle",
    "g.strip1": "Chaque cadre a la sienne~: de droite à gauche défilent les trente dernières secondes. Sous les phrases chaque point est une goutte~; sous les tissus chaque segment est un son qui dure, et sa longueur est le temps pendant lequel il reste ouvert.",
    "g.strip2": "Tu peux la regarder comme une partition en mouvement, ou comme des couches sonores superposées qui s'écoulent avec des viscosités différentes.",

    "g.name.t": "Le nom",
    "g.name1": "Une <em>rade</em> est cette portion de mer abritée où les navires mouillent, à l'abri des vents et des vagues.",
    "g.name.note": "Un détail qu'on ne remarque qu'en regardant~: quand deux gouttes de phrases différentes sonnent à moins de deux dixièmes de seconde l'une de l'autre, un fin fil rouge les relie un instant.",

    "g.foot.code": "Le code sur GitHub",
    "g.tes.t": "Les tissus",
    "g.tes1": "Sous les quatre phrases il y en a quatre autres, et elles ne font pas la même chose. Les gouttes arrivent~: une attaque, une traîne, et la note est déjà passée. Les tissus durent — ils s'ouvrent lentement, restent ouverts jusqu'à une demi-minute, se dissolvent. En se superposant entre eux et aux gouttes ils forment les textures, et c'est la raison de leur existence.",
    "g.tes2": "Ici aussi les périodes sont premières entre elles deux à deux, et elles le sont aussi avec celles des phrases~: les lignes qui ne reviennent jamais ensemble sont huit, et non deux groupes de quatre. Nul besoin de nombres premiers — il suffit qu'ils n'aient aucun facteur commun — et c'est pour cela que l'on descend jusqu'à huit secondes.",
    "g.tes3": "Chaque cadre a son bouton~: on peut laisser les tissus et mettre les phrases en pause, ou l'inverse. La barre d'espace, elle, vaut pour les deux.",
    "g.lbl.tfaders": "Les cinq curseurs des tissus",
    "g.tf1": "L'ouverture de l'éventail des hauteurs, mesurée en octaves. À zéro tous les tissus tombent sur la même note~; au maximum ils s'étendent sur les quatre octaves de la gamme.",
    "g.tf2": "Les secondes qu'un tissu met à émerger. Rien n'attaque, tout affleure~: c'est l'enveloppe renversée par rapport à celle des gouttes.",
    "g.tf3": "Les secondes qu'il met à disparaître. Avec l'émergence, décide quelle part du tissu est mouvement et quelle part est immobilité.",
    "g.tf4": "Combien de tissus restent ouverts en même temps, en moyenne, sur chaque ligne. En dessous de un il reste des silences~; au-dessus de deux la trame ne s'interrompt jamais. C'est le nombre que l'on voit dans la bande au bas du cadre.",
    "g.tf5": "Chaque tissu est fait de deux sinusoïdes à peine désaccordées, et leur écart en hertz est la pulsation que l'on entend~: à un demi-hertz le son enfle et retombe une fois toutes les deux secondes, à deux hertz il tremble. Sans ce battement, une note tenue une demi-minute serait un mur immobile, et l'oreille cesserait de la suivre.",
    "g.lbl.tmoods": "Les huit tissus",
    "g.tmoods.intro": "Comme pour les phrases, chaque humeur est une configuration complète. Deux choses restent pourtant hors des curseurs~: combien de tissus par tour et à quel point ils se tiennent sous les gouttes sont le caractère du préréglage, pas une molette.",
    "g.tm.velo": "L'équilibre de départ~: registre moyen, superposition à peine au-dessus de un.",
    "g.tm.fondale": "Une seule couche par tour, très longue et grave. La plus immobile des huit.",
    "g.tm.lino": "Trois par tour très superposés~: la trame ne s'interrompt jamais.",
    "g.tm.respiro": "Registre large et superposition sous un~: entre un tissu et l'autre le silence demeure.",
    "g.tm.bruma": "Le plus aigu et le plus ténu, près de trois octaves d'étendue.",
    "g.tm.tenda": "Moins d'une octave, tout en bas, et le niveau le plus haut des huit.",
    "g.tm.seta": "Battement presque double des autres et émergence rapide~: le plus inquiet.",
    "g.tm.vela": "Un seul tissu par tour, qui peut durer jusqu'à cinquante secondes.",
    "g.tmt.velo": "1,3 jours",
    "g.tmt.fondale": "23,4 jours",
    "g.tmt.lino": "14,6 heures",
    "g.tmt.respiro": "13,6 jours",
    "g.tmt.bruma": "26,8 jours",
    "g.tmt.tenda": "11,1 jours",
    "g.tmt.seta": "14,5 heures",
    "g.tmt.vela": "36,6 jours",
    "g.credits": "Rada est un projet développé par Valerio Belloni",
  },

  en: {
    "g.title":        "Rada · Guide",
    "meta.description": "How Rada works and how to use it: four phrases, coprime periods, and the collage that happens between them.",
    "g.back":         "Listen to Rada",

    "g.open1": "Rada is a sound space where you can linger among your own memories while looking out of the window. In this space you can take care of your attention: the sonic weaves produce tactile sensations and the drops you hear fall through a dilated time in which you can ask yourself, “how do I feel?”. Listening is a practice to be cultivated, a territory with its own poetics and its own force fields. Rada is a quiet cove on the shore of an ocean of noise. Between the drops you will find silences that speak; listen to them.",

    "g.concept.t": "The concept",
    "g.concept1": "Rada unfolds the sound while you listen to it.",
    "g.concept2": "Phrases made of drops, and sonic weaves made of long breaths, each turn with their own period. In the starting configuration those periods are, for the drops, seven, eleven, thirteen and seventeen seconds. Each phrase gathers its notes into an arc, then falls silent until the next turn. Those out-of-phase silences make the four arcs meet in a different combination every time. Below the four phrases four more turn, each with its own period: not drops but sustained tones, which open and dissolve slowly. There are eight out-of-phase lines in all, and the piece is what happens when they overlap.",
    "g.concept3": "This is the idea behind Brian Eno's “Music for Airports”, and this project is a tribute to his work.",

    "g.flow.t":     "The flow of times",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7 hours",
    "g.flow1": "For the combination to stay unpredictable, the periods must be pairwise <i>coprime</i>: taken two at a time, they must share no common divisor.",
    "g.flow2": "If two phrases lasted, say, six and nine seconds, they would share three as a divisor and would coincide again every eighteen seconds. The ear would catch that repetition at once and the collage would collapse into a recognisable pattern. With seven, eleven, thirteen and seventeen — coprime — the full combination returns only after 17,017 seconds, almost five hours.",

    "g.lbl.gestures": "The gestures",
    "g.gest1.k": "Drag vertically",
    "g.gest1": "Changes the length of that phrase, between 3 and 30 seconds. The new length takes effect on the next turn, never in the middle of one already running.",
    "g.gest2.k": "Click a dial",
    "g.gest2": "Mutes that phrase, or brings it back. The dial fades but keeps turning in silence: when you switch it on again it is already where it would have been, it does not start over.",
    "g.gest3.k": "↻ above a dial",
    "g.gest3": "Generates a new musical idea for that phrase alone: other notes, another number of drops, another position for the arc.",
    "g.gest4.k": "Spacebar",
    "g.gest4": "Starts and stops everything. Each card also has its own button, though, governing only its own class. On resuming, the collage picks up exactly where it was.",

    "g.lbl.faders": "The five phrase faders",
    "g.f1": "Changes how wide the fan of pitches opens. At zero every drop falls on the same central note; at maximum the idea spreads across the four octaves of the scale.",
    "g.f2": "From glassy to soft. More warmth means fewer high harmonics and a longer tail: the decay goes from just under two seconds to almost five.",
    "g.f3": "Changes how much of the sound goes through the reverb. At maximum the drops stay suspended long after they have stopped sounding.",
    "g.f4": "Changes the <em>largest</em> number of drops a new idea may hold: it is a ceiling, not a fixed count. Each regeneration draws somewhere between one drop and that limit, which is why the four phrases stay different from one another.",
    "g.f5": "Changes how much of the turn the notes occupy. At 30% the drops sit in the first third and all the rest is silence; at maximum they spread across almost the whole turn, and the drift becomes harder to hear.",
    "g.f.note": "The warmth and space faders show two numbers when the hour of the day tilts them: the first is where you put it, the second is the value actually sounding.",

    "g.lbl.moods": "The eight phrase moods",
    "g.moods.intro": "Each mood is a complete configuration: timbre <em>and</em> temporal layout. Changing it also regenerates the four ideas. The time given is the realignment time.",
    "g.m.sereno":     "The starting balance: middle register, ample tail, few well-spaced drops.",
    "g.m.pioggia":    "Short periods and high density: a close weave, where the four phrases cross one another constantly.",
    "g.m.vespro":     "Long periods, a very warm timbre, very few notes. The most rarefied of them.",
    "g.m.carillon":   "A wide register and a bright timbre, with drops scattered across every octave.",
    "g.m.arcipelago": "Islands of sound far apart from one another: at most three drops per idea, extended reverb, very narrow active zones.",
    "g.m.collina":    "Warm and gathered, with a wide active zone that gives a rolling, continuous motion.",
    "g.m.finestra":   "A clean, cold timbre with a short tail: the driest and most defined of the eight.",
    "g.m.nuvola":     "Maximum density, reverb near its limit and a glassy timbre: many hard drops inside a tail that dissolves their edges.",
    "g.mt.sereno": "4.7 hours", "g.mt.pioggia": "58 minutes", "g.mt.vespro": "2.5 days", "g.mt.carillon": "4.3 hours",
    "g.mt.arcipelago": "1.3 days", "g.mt.collina": "14.8 hours", "g.mt.finestra": "20.1 hours", "g.mt.nuvola": "8.7 hours",

    "g.hour.t": "The hour of the day",
    "g.hour1": "Rada reads the system clock and tilts register, warmth and space accordingly: at eleven at night it sounds darker and more reverberant than at noon.",
    "g.hour2": "There are six palettes: <em>dawn</em>, <em>morning</em>, <em>afternoon</em>, <em>dusk</em>, <em>evening</em> and <em>night</em>. The status line at the top always says which one is in force.",
    "g.hour3": "The weaves listen to the season instead — the same idea at another scale: the line above their card gives the day and which of the four is in force. Winter draws the register in and slows the breathing; summer widens it and quickens the beating. One turn takes a year, though, so you will not see it move.",

    "g.strip.t": "The time strip",
    "g.strip1": "Each card has one: the last thirty seconds scroll from right to left. Under the phrases every dot is a drop; under the weaves every segment is a sound that lasts, and its length is how long it stays open.",
    "g.strip2": "You can read it as a score in motion, or as layers of sound sliding over one another at different viscosities.",

    "g.name.t": "The name",
    "g.name1": "A <em>roadstead</em> — <em>rada</em> in Italian — is the sheltered stretch of sea where ships lie at anchor, out of the wind and the waves.",
    "g.name.note": "A detail you only catch by watching: when two drops from different phrases sound less than two tenths of a second apart, a thin red thread joins them for a moment.",

    "g.foot.code": "The code on GitHub",
    "g.tes.t": "The weaves",
    "g.tes1": "Below the four phrases there are four more, and they do something else. Drops happen: an attack, a tail, and the note is already gone. Weaves last — they open slowly, stay open for as long as half a minute, dissolve. Layering over one another and over the drops they build the textures, which is why they exist.",
    "g.tes2": "Here too the periods are pairwise coprime, and coprime with the phrases' periods as well: the lines that never come back together are eight, not two groups of four. They need not be prime numbers — sharing no factor is enough — which is why they can go down to eight seconds.",
    "g.tes3": "Each card has its own button: you can leave the weaves running and pause the phrases, or the other way round. The spacebar governs both.",
    "g.lbl.tfaders": "The five weave faders",
    "g.tf1": "How wide the fan of pitches opens, measured in octaves. At zero every weave falls on the same note; at maximum they spread across the four octaves of the scale.",
    "g.tf2": "The seconds a weave takes to emerge. Nothing attacks, everything surfaces: it is the envelope of the drops turned inside out.",
    "g.tf3": "The seconds it takes to vanish. Together with the surfacing it decides how much of a weave is motion and how much is stillness.",
    "g.tf4": "How many weaves stay open at once, on average, on each line. Below one, silences remain; above two the fabric never breaks. It is the number you can see in the strip at the foot of the card.",
    "g.tf5": "Each weave is two barely detuned sine waves, and their distance in hertz is the pulsation you hear: at half a hertz the sound swells and falls once every two seconds, at two hertz it trembles. Without that beating, a note held for half a minute would stand there like a wall, and the ear would stop following it.",
    "g.lbl.tmoods": "The eight weaves",
    "g.tmoods.intro": "As with the phrases, each mood is a complete configuration. Two things stay outside the faders, though: how many weaves per turn, and how far below the drops they sit, are the character of the preset rather than a knob.",
    "g.tm.velo": "The starting balance: middle register, overlap just above one.",
    "g.tm.fondale": "A single layer per turn, very long and low. The stillest of the eight.",
    "g.tm.lino": "Three per turn, heavily overlapped: the fabric never breaks.",
    "g.tm.respiro": "A wide register and overlap below one: between one weave and the next, silence remains.",
    "g.tm.bruma": "The highest and the faintest, nearly three octaves of spread.",
    "g.tm.tenda": "Less than an octave, all of it low, and the highest level of the eight.",
    "g.tm.seta": "Beating almost twice as fast as the others and a quick surfacing: the most restless.",
    "g.tm.vela": "A single weave per turn, which can last up to fifty seconds.",
    "g.tmt.velo": "1.3 days",
    "g.tmt.fondale": "23.4 days",
    "g.tmt.lino": "14.6 hours",
    "g.tmt.respiro": "13.6 days",
    "g.tmt.bruma": "26.8 days",
    "g.tmt.tenda": "11.1 days",
    "g.tmt.seta": "14.5 hours",
    "g.tmt.vela": "36.6 days",
    "g.credits": "Rada is a project developed by Valerio Belloni",
  },

  ja: {
    "g.title":        "Rada · 手引き",
    "meta.description": "Radaの仕組みと使い方。四つのフレーズ、互いに素の周期、そしてそのあいだに生まれるコラージュ。",
    "g.back":         "Radaを聴く",

    "g.open1": "Radaは、窓の外を眺めながら自分の記憶のなかに佇んでいられる音の空間です。この空間では、自分の注意を手入れすることができます。織りの響きは触れるような感覚を生み、聞こえてくる滴は引き伸ばされた時間のなかに落ちて、そのあいだに「いま自分はどう感じているだろう」と問いかけることができます。聴くことは育てていく営みであり、それ自体の詩学と力の場を持つひとつの土地です。Radaは、騒音の大洋の岸辺にある、静かな入り江です。滴と滴のあいだに、語る沈黙が見つかります。それに耳を澄ませてください。",

    "g.concept.t": "発想",
    "g.concept1": "Radaは、聴いているあいだに音を組み立てていきます。",
    "g.concept2": "滴でできたフレーズと、長い呼吸でできた響きの織り——そのどれもが、それぞれの周期で回ります。初期設定では、滴の周期は七秒、十一秒、十三秒、十七秒です。どのフレーズも音符をひとつの弧のなかに集め、次の周回まで沈黙します。位相のずれたこれらの沈黙によって、四つの弧は毎回ちがう組み合わせで出会います。四つのフレーズの下では、さらに四つがそれぞれの周期で回っています。滴ではなく、ゆっくりと開いてゆっくりと消えていく持続音です。位相のずれた線は全部で八本あり、作品はそれらが重なるところに生まれます。",
    "g.concept3": "これはブライアン・イーノの「Music for Airports」の根底にある考えであり、この作品はその仕事への賛辞です。",

    "g.flow.t":     "時の流れ",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7時間",
    "g.flow1": "組み合わせが予測できないままであるためには、周期がふたつずつ<i>互いに素</i>である必要があります。どの二つを取っても、共通の約数を持たないということです。",
    "g.flow2": "たとえば二つのフレーズが六秒と九秒だったとすると、三という約数を共有し、十八秒ごとにふたたび重なります。耳はその反復をすぐに聞き取り、コラージュは見覚えのある型へと崩れてしまいます。七、十一、十三、十七であれば——互いに素なので——完全な組み合わせが戻ってくるのは17,017秒後、ほぼ五時間後です。",

    "g.lbl.gestures": "操作",
    "g.gest1.k": "上下にドラッグ",
    "g.gest1": "そのフレーズの長さを3秒から30秒のあいだで変えます。新しい長さが効くのは次の周回からで、進行中の周回の途中で変わることはありません。",
    "g.gest2.k": "文字盤をクリック",
    "g.gest2": "そのフレーズを消音し、もう一度で戻します。文字盤は淡くなりますが、沈黙のまま回り続けます。ふたたび鳴らすとき、それは本来あったはずの位置にすでにあり、最初からやり直すことはありません。",
    "g.gest3.k": "文字盤の上の ↻",
    "g.gest3": "そのフレーズだけに新しい楽想を生みます。ちがう音、ちがう滴の数、ちがう弧の位置。",
    "g.gest4.k": "スペースキー",
    "g.gest4": "すべての再生と停止。ただしどちらの枠にもそれぞれのボタンがあり、そちらは自分の側だけを受け持ちます。再開したときコラージュはちょうど止まった場所から続きます。",

    "g.lbl.faders": "フレーズの五つのスライダー",
    "g.f1": "音の高さの広がりを変えます。ゼロではすべての滴が同じ中央の音に落ち、最大では楽想が音階の四オクターヴに広がります。",
    "g.f2": "硝子質から柔らかさへ。温かみが増すほど高い倍音は減り、余韻は長くなります。減衰は二秒弱から五秒近くまで変わります。",
    "g.f3": "音のどれだけが残響を通るかを変えます。最大では、滴は鳴りやんだあとも長く宙に留まります。",
    "g.f4": "新しい楽想が持ちうる滴の<em>最大</em>数を変えます。決まった数ではなく、上限です。生成のたびに一滴からこの上限までのあいだが選ばれるので、四つのフレーズは互いに異なったままでいます。",
    "g.f5": "周回のうち音符が占める割合を変えます。30%では滴は最初の三分の一に収まり、残りはすべて沈黙です。最大ではほぼ周回全体に散らばり、位相のずれは感じ取りにくくなります。",
    "g.f.note": "時刻が値を傾けているとき、温かみと空間のスライダーには数字が二つ並びます。前がこちらで設定した値、後ろが実際に鳴っている値です。",

    "g.lbl.moods": "フレーズの八つの気分",
    "g.moods.intro": "どの気分も完全な設定です。音色<em>と</em>時間の配置の両方を含みます。切り替えると四つの楽想も作り直されます。示されている時間は、ふたたび同じ組み合わせに戻るまでの長さです。",
    "g.m.sereno":     "出発点の均衡。中庸の音域、ゆたかな余韻、間をおいた少ない滴。",
    "g.m.pioggia":    "短い周期と高い密度。四つのフレーズが絶えず交差する、目の詰んだ織物。",
    "g.m.vespro":     "長い周期、きわめて温かい音色、ごくわずかな音。もっとも希薄。",
    "g.m.carillon":   "広い音域と明るい音色。滴はすべてのオクターヴに散らばります。",
    "g.m.arcipelago": "遠く離れあった音の島々。楽想ごとに滴は最大三つ、残響は長く、活動域はごく狭い。",
    "g.m.collina":    "温かく、内へ向かう。広い活動域が、うねるような連続した動きを与えます。",
    "g.m.finestra":   "くっきりと冷たい音色、短い余韻。八つのなかでもっとも乾いて、輪郭のはっきりしたもの。",
    "g.m.nuvola":     "最大の密度、限界近くの残響、硝子質の音色。硬い滴が数多く、その輪郭を溶かしていく余韻のなかにあります。",
    "g.mt.sereno": "4.7時間", "g.mt.pioggia": "58分", "g.mt.vespro": "2.5日", "g.mt.carillon": "4.3時間",
    "g.mt.arcipelago": "1.3日", "g.mt.collina": "14.8時間", "g.mt.finestra": "20.1時間", "g.mt.nuvola": "8.7時間",

    "g.hour.t": "時刻",
    "g.hour1": "Radaはシステムの時計を読み、それに応じて音域と温かみと空間を傾けます。夜の二十三時には、正午よりも暗く、残響の深い響きになります。",
    "g.hour2": "パレットは六つあります。<em>暁</em>、<em>朝</em>、<em>昼下がり</em>、<em>夕暮れ</em>、<em>宵</em>、<em>夜半</em>。いま効いているものは、上部の状態表示がつねに示しています。",
    "g.hour3": "織りに語りかけるのは季節です。同じ考えを別の尺度に移したもので、枠の上の行がその日と、四つのうちどれが効いているかを告げます。冬は音域を狭め、呼吸をゆるめます。夏は音域を広げ、うなりを速めます。ただし一巡には一年かかるので、動くところは見られません。",

    "g.strip.t": "時間の帯",
    "g.strip1": "どちらの枠にもあります。直近三十秒が右から左へ流れ、フレーズの下では点のひとつひとつが滴、織りの下では線分のひとつひとつが持続する音で、その長さがそのまま開いている時間です。",
    "g.strip2": "動く楽譜として眺めることもできますし、それぞれ異なる粘りで流れる音の層の重なりとして見ることもできます。",

    "g.name.t": "名前",
    "g.name1": "イタリア語の<em>rada</em>とは、風と波を避けて船が停泊する、囲われた海の一帯のことです。",
    "g.name.note": "見ていなければ気づかない細部があります。異なるフレーズの滴どうしが五分の一秒に満たない差で鳴るとき、細い赤い糸が一瞬だけ両者を結びます。",

    "g.foot.code": "GitHubのコード",
    "g.tes.t": "織り",
    "g.tes1": "四つのフレーズの下に、もう四つあります。役割はちがいます。滴は出来事です——立ち上がり、余韻、そして音はもう過ぎています。織りは持続します。ゆっくりと開き、半分ほどの時間そのまま留まり、やがて消えていきます。互いに、そして滴に重なりあってテクスチュアを織りなす——それが存在する理由です。",
    "g.tes2": "ここでも周期は二つずつ互いに素で、フレーズの周期とも互いに素です。二度と同じ組み合わせに戻らない線は、四つが二組ではなく、八本です。素数である必要はなく、共通の約数がなければ足りるので、八秒まで下げられます。",
    "g.tes3": "どちらの枠にもボタンがあります。織りを鳴らしたままフレーズだけを止めることも、その逆もできます。スペースキーは両方にかかります。",
    "g.lbl.tfaders": "織りの五つのスライダー",
    "g.tf1": "音の高さの広がりを、オクターヴで表したもの。ゼロではすべての織りが同じ音に落ち、最大では音階の四オクターヴに広がります。",
    "g.tf2": "織りが立ち上がるまでの秒数。何も打ちつけず、すべてが浮かび上がります。滴とは裏返しの包絡線です。",
    "g.tf3": "消えるまでの秒数。立ち上がりとあわせて、織りのどれだけが動きで、どれだけが静止かを決めます。",
    "g.tf4": "それぞれの線の上で、平均していくつの織りが同時に開いているか。一を下回ると沈黙が残り、二を超えると織り目は途切れません。枠の下の帯に見えているのが、この数です。",
    "g.tf5": "どの織りもわずかに調子のずれた二つの正弦波でできていて、その差のヘルツがそのまま聞こえるうなりになります。〇・五ヘルツなら二秒に一度ふくらんではしぼみ、二ヘルツなら細かく震えます。このうなりがなければ、三十秒も持続する音はただの動かない壁になり、耳はそれを追うのをやめてしまいます。",
    "g.lbl.tmoods": "八つの織り",
    "g.tmoods.intro": "フレーズと同じく、どの気分も完全な設定です。ただし二つだけスライダーの外に残ります。一周あたりいくつ織るか、滴に対してどれだけ下に置くか——それは気分の性格であって、つまみではありません。",
    "g.tm.velo": "出発点の均衡。中庸の音域、重なりは一をわずかに超える程度。",
    "g.tm.fondale": "一周にひと層だけ、きわめて長く低い。八つのなかでもっとも動かない。",
    "g.tm.lino": "一周に三つ、深く重なりあう。織り目は途切れません。",
    "g.tm.respiro": "広い音域と、一を下回る重なり。織りと織りのあいだに沈黙が残ります。",
    "g.tm.bruma": "もっとも高く、もっとも淡い。広がりは三オクターヴ近く。",
    "g.tm.tenda": "一オクターヴに満たず、すべて低域に。八つのなかで最も高い音量。",
    "g.tm.seta": "うなりは他のほぼ倍、立ち上がりも速い。もっとも落ち着かない。",
    "g.tm.vela": "一周にひとつだけ。五十秒に及ぶこともあります。",
    "g.tmt.velo": "1.3日",
    "g.tmt.fondale": "23.4日",
    "g.tmt.lino": "14.6時間",
    "g.tmt.respiro": "13.6日",
    "g.tmt.bruma": "26.8日",
    "g.tmt.tenda": "11.1日",
    "g.tmt.seta": "14.5時間",
    "g.tmt.vela": "36.6日",
    "g.credits": "RadaはValerio Belloniが制作しています。",
  },

};

/* Nel francese la tilde segna lo spazio unificatore stretto, quello che la
   tipografia francese vuole prima di : ; ? ! e dentro le virgolette a
   caporale. Scritto così il testo resta leggibile nel sorgente; se lo si
   incollasse direttamente, sarebbe uno spazio invisibile e indistinguibile
   da quello normale.                                                       */
for (const k in GUIDA.fr) GUIDA.fr[k] = GUIDA.fr[k].split("~").join(NNBSP);

/* Il dizionario della guida si aggiunge a quello dell'interfaccia: da qui in
   poi T() trova le une e le altre senza distinzione.

   Object.assign sovrascrive in silenzio: una chiave scelta per sbaglio uguale
   a una dell'interfaccia cambierebbe le parole dei comandi senza che nessuno
   se ne accorga. L'unica sovrapposizione voluta è la descrizione per le
   anteprime, che qui deve parlare della guida e non dello strumento.      */
const SOVRASCRIVIBILI = new Set(["meta.description"]);
for (const l of LANGS) {
  for (const k in GUIDA[l])
    if (k in STRINGS[l] && !SOVRASCRIVIBILI.has(k))
      console.warn("guida-i18n: la chiave « " + k + " » esisteva già in " + l);
  Object.assign(STRINGS[l], GUIDA[l]);
}

/* I nomi dei mood NON stanno qui: arrivano dal dizionario dell'interfaccia,
   così i bottoni e la guida non possono raccontare due nomi diversi.       */
function fillMoodNames() {
  document.querySelectorAll("[data-mood]").forEach(el => {
    el.textContent = moodName(el.dataset.mood);
  });
  document.querySelectorAll("[data-drone-mood]").forEach(el => {
    el.textContent = droneMoodName(el.dataset.droneMood);
  });
}

/* Chiamata da setLang dopo che il documento è stato ritradotto. */
function onLanguageChange() { fillMoodNames(); }

/* --- da dove si è arrivati ------------------------------------------------
   Due situazioni molto diverse portano su questa pagina.

   Chi arriva DALLO STRUMENTO ha già Rada aperta e in ascolto nella scheda
   accanto: offrirgli "Ascolta Rada" gli farebbe aprire una seconda copia,
   muta e ferma al cancello, mentre la prima continua a suonare. Il richiamo
   sparisce.

   Chi arriva DA FUORI — un link condiviso, un segnalibro, una ricerca — non
   ha nessuno strumento aperto, e senza quel richiamo resterebbe in un vicolo
   cieco. Lì il richiamo serve, ed è l'unica porta d'ingresso.

   Le due situazioni si distinguono con un contrassegno nell'indirizzo, messo
   dal collegamento nell'interfaccia. Il referente sarebbe stato più elegante,
   ma dipende da impostazioni di riservatezza che possono azzerarlo: questo
   invece è deterministico. Nel dubbio i richiami restano — il comportamento
   sicuro è non lasciare nessuno in un vicolo cieco. E il logo rimanda allo
   strumento in entrambi i casi, per chi una seconda sessione la vuole.

   Il contrassegno viene poi tolto dall'indirizzo, così un link copiato dalla
   barra resta pulito e condivisibile. Le altre voci — ?lang= — sopravvivono. */
function vieneDalloStrumento() {
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("da") !== "strumento") return false;
    p.delete("da");
    const q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
    return true;
  } catch (e) { return false; }
}

if (vieneDalloStrumento()) {
  /* via i due richiami e i separatori che li accompagnano, altrimenti
     resterebbero appesi nel vuoto come trattini senza nulla a fianco */
  document.querySelectorAll('[data-i18n="g.back"]').forEach(el => el.remove());
  document.querySelectorAll(".langSep, .docFoot .sep").forEach(el => el.remove());
}

buildLangSwitch(document.getElementById("langs"));
applyI18n();
fillMoodNames();
