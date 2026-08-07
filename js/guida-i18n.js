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

    "g.open1": "Rada è uno spazio sonoro nel quale si può indugiare nei propri ricordi mentre si guarda fuori dalla finestra.",
    "g.open2": "In questo spazio puoi prenderti cura della tua attenzione, le gocce che ascolti cadono in un tempo dilatato nel quale puoi chiederti “come mi sento?”.",
    "g.open3": "L'ascolto è un'attività da coltivare, è un territorio che ha le sue poetiche e i suoi campi di forza.<br>Rada è un'insenatura tranquilla lungo la costa di un oceano di rumore.",
    "g.open4": "Tra le gocce troverai dei silenzi che parlano; ascoltali.",

    "g.concept.t": "Il concetto",
    "g.concept1": "Rada sviluppa il suono mentre lo ascolti.",
    "g.concept2": "Quattro frasi girano ciascuna col proprio periodo, nella configurazione di partenza questi periodi sono di sette, undici, tredici e diciassette secondi. Ogni frase concentra le sue note in un arco, poi tace fino al giro successivo. Quei silenzi fuori fase fanno in modo che i quattro archi si incontrino ogni volta in una combinazione diversa.",
    "g.concept3": "Questa è l'idea alla base di “Music for Airports” di Brian Eno e questo progetto è un tributo al suo lavoro.",

    "g.flow.t":     "Lo scorrere dei tempi",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 ore",
    "g.flow1": "Perché la combinazione resti imprevedibile, i quattro periodi devono essere <i>coprimi</i> a due a due: presi a coppie, non devono avere alcun divisore in comune.",
    "g.flow2": "Se due frasi durassero ad esempio sei e nove secondi condividerebbero il tre come divisore, e tornerebbero a coincidere ogni diciotto secondi. L'orecchio sentirebbe subito questa ripetizione e il collage collasserebbe in un motivo riconoscibile. Con sette, undici, tredici e diciassette — primi fra loro — la combinazione completa si ripete solo dopo 17.017 secondi, quasi cinque ore.",

    "g.lbl.gestures": "I gesti",
    "g.gest1.k": "Trascina in verticale",
    "g.gest1": "Cambia la durata di quella frase, fra 3 e 30 secondi. La nuova durata entra in vigore al giro successivo, mai a metà di uno in corso.",
    "g.gest2.k": "Clic su un quadrante",
    "g.gest2": "Silenzia quella frase, o la riattiva. Il quadrante impallidisce ma continua a girare in silenzio: quando la riaccendi è già dove sarebbe stata, non riparte da capo.",
    "g.gest3.k": "↻ sopra un quadrante",
    "g.gest3": "Genera una nuova idea musicale per quella frase soltanto: altre note, altro numero di gocce, altra posizione dell'arco.",
    "g.gest4.k": "Barra spaziatrice",
    "g.gest4": "Avvia e ferma. Ferma il clock del motore audio, e alla ripresa il collage riparte esattamente da dov'era.",

    "g.lbl.faders": "I cinque cursori",
    "g.f1": "Modifica quanto si allarga il ventaglio delle altezze. A zero tutte le gocce cadono sulla stessa nota centrale; al massimo l'idea si distende sulle quattro ottave della scala.",
    "g.f2": "Da vetroso a morbido. Più calore significa meno armoniche acute e una coda più lunga: il decadimento passa da poco meno di due secondi a quasi cinque.",
    "g.f3": "Modifica quanta parte del suono passa per il riverbero. Al massimo le gocce restano sospese a lungo dopo aver smesso di suonare.",
    "g.f4": "Modifica il numero <em>massimo</em> di gocce che una nuova idea può contenere: è un tetto, non un numero fisso. Ogni rigenerazione pesca fra una goccia e questo limite, perciò le quattro frasi restano diverse fra loro.",
    "g.f5": "Modifica quanta parte del giro è occupata dalle note. Al 30% le gocce stanno nel primo terzo e tutto il resto è silenzio; al massimo si distribuiscono quasi su tutto il giro, e lo sfasamento si fa meno percepibile.",
    "g.f.note": "I cursori del calore e dello spazio mostrano due numeri quando l'ora del giorno li inclina: il primo è dove l'hai messo tu, il secondo è il valore che sta davvero suonando.",

    "g.lbl.moods": "Gli otto mood",
    "g.moods.intro": "Ogni mood è una configurazione completa: timbro <em>e</em> configurazione temporale. Cambiarlo rigenera anche le quattro idee. Il tempo indicato è quello di riallineamento.",
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

    "g.strip.t": "La fascia temporale",
    "g.strip1": "Sotto i quadranti scorrono da destra verso sinistra gli ultimi trenta secondi di tutte e quattro le frasi. Ogni punto è una goccia.",
    "g.strip2": "Puoi guardarlo come se fosse uno spartito in movimento, o un sovrapporsi di strati sonori che scorrono con viscosità differenti.",

    "g.name.t": "Il nome",
    "g.name1": "Una <em>rada</em> è il tratto di mare riparato dove le navi sostano al riparo dai venti e dalle onde.",
    "g.name.note": "Un dettaglio che si nota solo guardando: quando due gocce di frasi diverse suonano a meno di due decimi di secondo l'una dall'altra, un sottile filo rosso le unisce per un istante.",

    "g.foot.code": "Il codice su GitHub",
    "g.credits": "Rada è un progetto sviluppato da Valerio Belloni",
  },

  fr: {
    "g.title":        "Rada · Guide",
    "meta.description": "Comment fonctionne Rada et comment s'en servir : quatre phrases, des périodes premières entre elles, et le collage qui naît entre elles.",
    "g.back":         "Écouter Rada",

    "g.open1": "Rada est un espace sonore où l'on peut s'attarder dans ses souvenirs en regardant par la fenêtre.",
    "g.open2": "Dans cet espace tu peux prendre soin de ton attention~: les gouttes que tu écoutes tombent dans un temps dilaté où tu peux te demander «~comment est-ce que je me sens~?~».",
    "g.open3": "L'écoute est une pratique à cultiver, un territoire qui a ses poétiques et ses champs de force.<br>Rada est une crique tranquille sur la côte d'un océan de bruit.",
    "g.open4": "Entre les gouttes tu trouveras des silences qui parlent~; écoute-les.",

    "g.concept.t": "Le concept",
    "g.concept1": "Rada développe le son pendant que tu l'écoutes.",
    "g.concept2": "Quatre phrases tournent chacune avec sa propre période~; dans la configuration de départ ces périodes sont de sept, onze, treize et dix-sept secondes. Chaque phrase concentre ses notes dans un arc, puis se tait jusqu'au tour suivant. Ces silences déphasés font que les quatre arcs se rencontrent chaque fois dans une combinaison différente.",
    "g.concept3": "C'est l'idée à la base de «~Music for Airports~» de Brian Eno, et ce projet est un hommage à son travail.",

    "g.flow.t":     "L'écoulement des temps",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 heures",
    "g.flow1": "Pour que la combinaison reste imprévisible, les quatre périodes doivent être <i>premières entre elles</i> deux à deux~: prises par paires, elles ne doivent avoir aucun diviseur commun.",
    "g.flow2": "Si deux phrases duraient par exemple six et neuf secondes, elles partageraient le trois comme diviseur et reviendraient à coïncider toutes les dix-huit secondes. L'oreille entendrait aussitôt cette répétition et le collage s'effondrerait en un motif reconnaissable. Avec sept, onze, treize et dix-sept — premiers entre eux — la combinaison complète ne se répète qu'après 17 017 secondes, presque cinq heures.",

    "g.lbl.gestures": "Les gestes",
    "g.gest1.k": "Glisser à la verticale",
    "g.gest1": "Change la durée de cette phrase, entre 3 et 30 secondes. La nouvelle durée prend effet au tour suivant, jamais au milieu d'un tour en cours.",
    "g.gest2.k": "Clic sur un cadran",
    "g.gest2": "Met cette phrase en silence, ou la réveille. Le cadran pâlit mais continue de tourner en silence~: quand tu la rallumes, elle est déjà là où elle serait arrivée, elle ne repart pas du début.",
    "g.gest3.k": "↻ au-dessus d'un cadran",
    "g.gest3": "Engendre une nouvelle idée musicale pour cette phrase seulement~: d'autres notes, un autre nombre de gouttes, une autre position de l'arc.",
    "g.gest4.k": "Barre d'espace",
    "g.gest4": "Lance et arrête. Arrête l'horloge du moteur audio, et à la reprise le collage repart exactement d'où il était.",

    "g.lbl.faders": "Les cinq curseurs",
    "g.f1": "Modifie l'ouverture de l'éventail des hauteurs. À zéro toutes les gouttes tombent sur la même note centrale~; au maximum l'idée s'étend sur les quatre octaves de la gamme.",
    "g.f2": "Du vitreux au moelleux. Plus de chaleur signifie moins d'harmoniques aiguës et une traîne plus longue~: la décroissance passe d'un peu moins de deux secondes à presque cinq.",
    "g.f3": "Modifie la part du son qui passe par la réverbération. Au maximum les gouttes restent longtemps suspendues après avoir cessé de sonner.",
    "g.f4": "Modifie le nombre <em>maximal</em> de gouttes qu'une nouvelle idée peut contenir~: c'est un plafond, pas un nombre fixe. Chaque régénération tire entre une goutte et cette limite, et c'est pourquoi les quatre phrases restent différentes.",
    "g.f5": "Modifie la part du tour occupée par les notes. À 30~% les gouttes tiennent dans le premier tiers et tout le reste est silence~; au maximum elles se répartissent sur presque tout le tour, et le déphasage devient moins perceptible.",
    "g.f.note": "Les curseurs de la chaleur et de l'espace affichent deux nombres quand l'heure du jour les incline~: le premier est là où tu l'as mis, le second est la valeur qui sonne réellement.",

    "g.lbl.moods": "Les huit ambiances",
    "g.moods.intro": "Chaque ambiance est une configuration complète~: le timbre <em>et</em> la disposition temporelle. En changer régénère aussi les quatre idées. Le temps indiqué est celui du réalignement.",
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

    "g.strip.t": "La bande temporelle",
    "g.strip1": "Sous les cadrans défilent, de droite à gauche, les trente dernières secondes des quatre phrases. Chaque point est une goutte.",
    "g.strip2": "Tu peux la regarder comme une partition en mouvement, ou comme des couches sonores superposées qui s'écoulent avec des viscosités différentes.",

    "g.name.t": "Le nom",
    "g.name1": "Une <em>rade</em> est cette portion de mer abritée où les navires mouillent, à l'abri des vents et des vagues.",
    "g.name.note": "Un détail qu'on ne remarque qu'en regardant~: quand deux gouttes de phrases différentes sonnent à moins de deux dixièmes de seconde l'une de l'autre, un fin fil rouge les relie un instant.",

    "g.foot.code": "Le code sur GitHub",
    "g.credits": "Rada est un projet développé par Valerio Belloni",
  },

  en: {
    "g.title":        "Rada · Guide",
    "meta.description": "How Rada works and how to use it: four phrases, coprime periods, and the collage that happens between them.",
    "g.back":         "Listen to Rada",

    "g.open1": "Rada is a sound space where you can linger among your own memories while looking out of the window.",
    "g.open2": "In this space you can take care of your attention: the drops you hear fall through a dilated time in which you can ask yourself, “how do I feel?”.",
    "g.open3": "Listening is a practice to be cultivated, a territory with its own poetics and its own force fields.<br>Rada is a quiet cove on the shore of an ocean of noise.",
    "g.open4": "Between the drops you will find silences that speak; listen to them.",

    "g.concept.t": "The concept",
    "g.concept1": "Rada unfolds the sound while you listen to it.",
    "g.concept2": "Four phrases each turn with their own period; in the starting configuration those periods are seven, eleven, thirteen and seventeen seconds. Each phrase gathers its notes into an arc, then falls silent until the next turn. Those out-of-phase silences make the four arcs meet in a different combination every time.",
    "g.concept3": "This is the idea behind Brian Eno's “Music for Airports”, and this project is a tribute to his work.",

    "g.flow.t":     "The flow of times",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7 hours",
    "g.flow1": "For the combination to stay unpredictable, the four periods must be pairwise <i>coprime</i>: taken two at a time, they must share no common divisor.",
    "g.flow2": "If two phrases lasted, say, six and nine seconds, they would share three as a divisor and would coincide again every eighteen seconds. The ear would catch that repetition at once and the collage would collapse into a recognisable pattern. With seven, eleven, thirteen and seventeen — coprime — the full combination returns only after 17,017 seconds, almost five hours.",

    "g.lbl.gestures": "The gestures",
    "g.gest1.k": "Drag vertically",
    "g.gest1": "Changes the length of that phrase, between 3 and 30 seconds. The new length takes effect on the next turn, never in the middle of one already running.",
    "g.gest2.k": "Click a dial",
    "g.gest2": "Mutes that phrase, or brings it back. The dial fades but keeps turning in silence: when you switch it on again it is already where it would have been, it does not start over.",
    "g.gest3.k": "↻ above a dial",
    "g.gest3": "Generates a new musical idea for that phrase alone: other notes, another number of drops, another position for the arc.",
    "g.gest4.k": "Spacebar",
    "g.gest4": "Starts and stops. It halts the audio engine's clock, and on resuming the collage picks up exactly where it was.",

    "g.lbl.faders": "The five faders",
    "g.f1": "Changes how wide the fan of pitches opens. At zero every drop falls on the same central note; at maximum the idea spreads across the four octaves of the scale.",
    "g.f2": "From glassy to soft. More warmth means fewer high harmonics and a longer tail: the decay goes from just under two seconds to almost five.",
    "g.f3": "Changes how much of the sound goes through the reverb. At maximum the drops stay suspended long after they have stopped sounding.",
    "g.f4": "Changes the <em>largest</em> number of drops a new idea may hold: it is a ceiling, not a fixed count. Each regeneration draws somewhere between one drop and that limit, which is why the four phrases stay different from one another.",
    "g.f5": "Changes how much of the turn the notes occupy. At 30% the drops sit in the first third and all the rest is silence; at maximum they spread across almost the whole turn, and the drift becomes harder to hear.",
    "g.f.note": "The warmth and space faders show two numbers when the hour of the day tilts them: the first is where you put it, the second is the value actually sounding.",

    "g.lbl.moods": "The eight moods",
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

    "g.strip.t": "The time strip",
    "g.strip1": "Below the dials, the last thirty seconds of all four phrases scroll from right to left. Each dot is a drop.",
    "g.strip2": "You can read it as a score in motion, or as layers of sound sliding over one another at different viscosities.",

    "g.name.t": "The name",
    "g.name1": "A <em>roadstead</em> — <em>rada</em> in Italian — is the sheltered stretch of sea where ships lie at anchor, out of the wind and the waves.",
    "g.name.note": "A detail you only catch by watching: when two drops from different phrases sound less than two tenths of a second apart, a thin red thread joins them for a moment.",

    "g.foot.code": "The code on GitHub",
    "g.credits": "Rada is a project developed by Valerio Belloni",
  },

  ja: {
    "g.title":        "Rada · 手引き",
    "meta.description": "Radaの仕組みと使い方。四つのフレーズ、互いに素の周期、そしてそのあいだに生まれるコラージュ。",
    "g.back":         "Radaを聴く",

    "g.open1": "Radaは、窓の外を眺めながら自分の記憶のなかに佇んでいられる音の空間です。",
    "g.open2": "この空間では、自分の注意を手入れすることができます。聞こえてくる滴は引き伸ばされた時間のなかに落ち、そのあいだに「いま自分はどう感じているだろう」と問いかけることができます。",
    "g.open3": "聴くことは育てていく営みであり、それ自体の詩学と力の場を持つひとつの土地です。<br>Radaは、騒音の大洋の岸辺にある、静かな入り江です。",
    "g.open4": "滴と滴のあいだに、語る沈黙が見つかります。それに耳を澄ませてください。",

    "g.concept.t": "発想",
    "g.concept1": "Radaは、聴いているあいだに音を組み立てていきます。",
    "g.concept2": "四つのフレーズがそれぞれの周期で回ります。初期設定では、その周期は七秒、十一秒、十三秒、十七秒です。どのフレーズも音符をひとつの弧のなかに集め、次の周回まで沈黙します。位相のずれたこれらの沈黙によって、四つの弧は毎回ちがう組み合わせで出会います。",
    "g.concept3": "これはブライアン・イーノの「Music for Airports」の根底にある考えであり、この作品はその仕事への賛辞です。",

    "g.flow.t":     "時の流れ",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7時間",
    "g.flow1": "組み合わせが予測できないままであるためには、四つの周期がふたつずつ<i>互いに素</i>である必要があります。どの二つを取っても、共通の約数を持たないということです。",
    "g.flow2": "たとえば二つのフレーズが六秒と九秒だったとすると、三という約数を共有し、十八秒ごとにふたたび重なります。耳はその反復をすぐに聞き取り、コラージュは見覚えのある型へと崩れてしまいます。七、十一、十三、十七であれば——互いに素なので——完全な組み合わせが戻ってくるのは17,017秒後、ほぼ五時間後です。",

    "g.lbl.gestures": "操作",
    "g.gest1.k": "上下にドラッグ",
    "g.gest1": "そのフレーズの長さを3秒から30秒のあいだで変えます。新しい長さが効くのは次の周回からで、進行中の周回の途中で変わることはありません。",
    "g.gest2.k": "文字盤をクリック",
    "g.gest2": "そのフレーズを消音し、もう一度で戻します。文字盤は淡くなりますが、沈黙のまま回り続けます。ふたたび鳴らすとき、それは本来あったはずの位置にすでにあり、最初からやり直すことはありません。",
    "g.gest3.k": "文字盤の上の ↻",
    "g.gest3": "そのフレーズだけに新しい楽想を生みます。ちがう音、ちがう滴の数、ちがう弧の位置。",
    "g.gest4.k": "スペースキー",
    "g.gest4": "再生と停止。音声エンジンの時計そのものを止めるので、再開したときコラージュはちょうど止まった場所から続きます。",

    "g.lbl.faders": "五つのスライダー",
    "g.f1": "音の高さの広がりを変えます。ゼロではすべての滴が同じ中央の音に落ち、最大では楽想が音階の四オクターヴに広がります。",
    "g.f2": "硝子質から柔らかさへ。温かみが増すほど高い倍音は減り、余韻は長くなります。減衰は二秒弱から五秒近くまで変わります。",
    "g.f3": "音のどれだけが残響を通るかを変えます。最大では、滴は鳴りやんだあとも長く宙に留まります。",
    "g.f4": "新しい楽想が持ちうる滴の<em>最大</em>数を変えます。決まった数ではなく、上限です。生成のたびに一滴からこの上限までのあいだが選ばれるので、四つのフレーズは互いに異なったままでいます。",
    "g.f5": "周回のうち音符が占める割合を変えます。30%では滴は最初の三分の一に収まり、残りはすべて沈黙です。最大ではほぼ周回全体に散らばり、位相のずれは感じ取りにくくなります。",
    "g.f.note": "時刻が値を傾けているとき、温かみと空間のスライダーには数字が二つ並びます。前がこちらで設定した値、後ろが実際に鳴っている値です。",

    "g.lbl.moods": "八つのムード",
    "g.moods.intro": "どのムードも完全な設定です。音色<em>と</em>時間の配置の両方を含みます。切り替えると四つの楽想も作り直されます。示されている時間は、ふたたび同じ組み合わせに戻るまでの長さです。",
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

    "g.strip.t": "時間の帯",
    "g.strip1": "文字盤の下では、四つのフレーズすべての直近三十秒が右から左へ流れます。点のひとつひとつが滴です。",
    "g.strip2": "動く楽譜として眺めることもできますし、それぞれ異なる粘りで流れる音の層の重なりとして見ることもできます。",

    "g.name.t": "名前",
    "g.name1": "イタリア語の<em>rada</em>とは、風と波を避けて船が停泊する、囲われた海の一帯のことです。",
    "g.name.note": "見ていなければ気づかない細部があります。異なるフレーズの滴どうしが五分の一秒に満たない差で鳴るとき、細い赤い糸が一瞬だけ両者を結びます。",

    "g.foot.code": "GitHubのコード",
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
