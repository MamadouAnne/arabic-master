// Additional grammar lessons — core MSA topics that complete the course:
// Kāna & sisters, Inna & sisters, weak verbs, Hal, Tamyiz, the five nouns,
// and diptotes. Bilingual (EN/FR) + Arabic. Appended to grammarLessons.

import { GrammarLesson } from '../../../types/arabic';

export const ADDITIONAL_GRAMMAR_LESSONS: GrammarLesson[] = [
  // ── Kāna & its sisters ──────────────────────────────────────────
  {
    id: 'grammar-kana',
    title: 'Kāna & Its Sisters (كان وأخواتها)',
    titleFr: 'Kāna et ses sœurs (كان وأخواتها)',
    titleArabic: 'كَانَ وَأَخَوَاتُهَا',
    description: 'Verbs of being that put the predicate in the accusative.',
    descriptionFr: 'Les verbes d\'état qui mettent le prédicat à l\'accusatif.',
    level: 'intermediate',
    category: 'verbs',
    order: 41,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'A nominal sentence has no verb: الطَّالِبُ مُجْتَهِدٌ (the student is diligent). When you add كَانَ ("was"), it turns into the past. كَانَ and its "sisters" are a family of verbs that enter a nominal sentence and change its endings.',
        contentFr: 'Une phrase nominale n\'a pas de verbe : الطَّالِبُ مُجْتَهِدٌ (l\'étudiant est appliqué). En ajoutant كَانَ (« était »), on la met au passé. كَانَ et ses « sœurs » forment une famille de verbes qui entrent dans une phrase nominale et en changent les terminaisons.',
      },
      {
        type: 'rule',
        content: 'كَانَ keeps the subject in the NOMINATIVE (called اسم كان) but puts the predicate in the ACCUSATIVE (called خبر كان). So the predicate that ended in ‑un now ends in ‑an.',
        contentFr: 'كَانَ garde le sujet au NOMINATIF (appelé اسم كان) mais met le prédicat à l\'ACCUSATIF (appelé خبر كان). Le prédicat qui se terminait en ‑un se termine désormais en ‑an.',
      },
      {
        type: 'examples_grid',
        content: 'From nominal sentence to كان',
        contentFr: 'De la phrase nominale à كان',
        examples: [
          { arabic: 'الطَّالِبُ مُجْتَهِدٌ ← كَانَ الطَّالِبُ مُجْتَهِدًا', english: 'The student is → was diligent', french: 'L\'étudiant est → était appliqué' },
          { arabic: 'البَيْتُ كَبِيرٌ ← كَانَ البَيْتُ كَبِيرًا', english: 'The house is → was big', french: 'La maison est → était grande' },
          { arabic: 'الجَوُّ جَمِيلٌ ← أَصْبَحَ الجَوُّ جَمِيلًا', english: 'The weather became beautiful', french: 'Le temps est devenu beau' },
        ],
      },
      {
        type: 'table',
        content: 'The most common sisters of كان',
        contentFr: 'Les sœurs les plus courantes de كان',
        tableData: {
          headers: ['Verb', 'Meaning'],
          rows: [
            ['كَانَ', 'was / to be'],
            ['أَصْبَحَ', 'became (in the morning)'],
            ['صَارَ', 'became / turned into'],
            ['لَيْسَ', 'is not (negation)'],
            ['ظَلَّ', 'remained / kept'],
            ['مَا زَالَ', 'still / continued to be'],
          ],
        },
        tableDataFr: {
          headers: ['Verbe', 'Sens'],
          rows: [
            ['كَانَ', 'était / être'],
            ['أَصْبَحَ', 'devint (le matin)'],
            ['صَارَ', 'devint / se transforma en'],
            ['لَيْسَ', 'n\'est pas (négation)'],
            ['ظَلَّ', 'resta / continua à'],
            ['مَا زَالَ', 'toujours / continua d\'être'],
          ],
        },
      },
      {
        type: 'note',
        content: 'لَيْسَ is the sister you will use most: it negates a nominal sentence — لَيْسَ الطَّالِبُ مُجْتَهِدًا = "the student is not diligent".',
        contentFr: 'لَيْسَ est la sœur la plus utile : elle nie une phrase nominale — لَيْسَ الطَّالِبُ مُجْتَهِدًا = « l\'étudiant n\'est pas appliqué ».',
      },
    ],
  },

  // ── Inna & its sisters ──────────────────────────────────────────
  {
    id: 'grammar-inna',
    title: 'Inna & Its Sisters (إنّ وأخواتها)',
    titleFr: 'Inna et ses sœurs (إنّ وأخواتها)',
    titleArabic: 'إِنَّ وَأَخَوَاتُهَا',
    description: 'Emphatic particles that put the subject in the accusative.',
    descriptionFr: 'Les particules d\'emphase qui mettent le sujet à l\'accusatif.',
    level: 'intermediate',
    category: 'sentences',
    order: 42,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'إِنَّ ("indeed / verily") and its sisters are particles placed at the start of a nominal sentence to add emphasis or meaning. They do the OPPOSITE of كان.',
        contentFr: 'إِنَّ (« certes / en vérité ») et ses sœurs sont des particules placées au début d\'une phrase nominale pour ajouter de l\'emphase ou du sens. Elles font le CONTRAIRE de كان.',
      },
      {
        type: 'rule',
        content: 'إِنَّ puts the subject in the ACCUSATIVE (اسم إنّ) and leaves the predicate in the NOMINATIVE (خبر إنّ). Compare with كان, which does the reverse.',
        contentFr: 'إِنَّ met le sujet à l\'ACCUSATIF (اسم إنّ) et laisse le prédicat au NOMINATIF (خبر إنّ). À comparer avec كان, qui fait l\'inverse.',
      },
      {
        type: 'examples_grid',
        content: 'إنّ in action',
        contentFr: 'إنّ en pratique',
        examples: [
          { arabic: 'إِنَّ اللهَ غَفُورٌ رَحِيمٌ', english: 'Indeed Allah is Forgiving, Merciful', french: 'Certes, Allah est Pardonneur, Miséricordieux' },
          { arabic: 'إِنَّ الطَّالِبَ مُجْتَهِدٌ', english: 'Indeed the student is diligent', french: 'Certes, l\'étudiant est appliqué' },
          { arabic: 'لَعَلَّ الاِمْتِحَانَ سَهْلٌ', english: 'Perhaps the exam is easy', french: 'Peut-être que l\'examen est facile' },
        ],
      },
      {
        type: 'table',
        content: 'The sisters of إنّ',
        contentFr: 'Les sœurs de إنّ',
        tableData: {
          headers: ['Particle', 'Meaning'],
          rows: [
            ['إِنَّ', 'indeed / verily'],
            ['أَنَّ', 'that'],
            ['كَأَنَّ', 'as if / like'],
            ['لَكِنَّ', 'but / however'],
            ['لَيْتَ', 'if only / I wish'],
            ['لَعَلَّ', 'perhaps / maybe'],
          ],
        },
        tableDataFr: {
          headers: ['Particule', 'Sens'],
          rows: [
            ['إِنَّ', 'certes / en vérité'],
            ['أَنَّ', 'que'],
            ['كَأَنَّ', 'comme si'],
            ['لَكِنَّ', 'mais / cependant'],
            ['لَيْتَ', 'si seulement / je souhaite'],
            ['لَعَلَّ', 'peut-être'],
          ],
        },
      },
      {
        type: 'note',
        content: 'Memory hook: كان lifts the subject and lowers the predicate; إنّ lowers the subject and lifts the predicate. They are mirror images.',
        contentFr: 'Astuce : كان élève le sujet et abaisse le prédicat ; إنّ abaisse le sujet et élève le prédicat. Ce sont des images en miroir.',
      },
    ],
  },

  // ── Weak verbs ──────────────────────────────────────────────────
  {
    id: 'grammar-weak-verbs',
    title: 'Weak Verbs (الأفعال المعتلة)',
    titleFr: 'Les verbes malades (الأفعال المعتلة)',
    titleArabic: 'الْأَفْعَالُ الْمُعْتَلَّة',
    description: 'Verbs whose root contains a weak letter (و ي ا).',
    descriptionFr: 'Les verbes dont la racine contient une lettre faible (و ي ا).',
    level: 'advanced',
    category: 'verbs',
    order: 43,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'Most verbs are "sound" — all three root letters are strong (كَتَبَ). A "weak" verb has one of the weak letters (و, ي, or ا) in its root. That weak letter shifts or drops when the verb is conjugated.',
        contentFr: 'La plupart des verbes sont « sains » — les trois lettres de la racine sont fortes (كَتَبَ). Un verbe « malade » contient une lettre faible (و, ي ou ا) dans sa racine. Cette lettre faible se déplace ou disparaît lors de la conjugaison.',
      },
      {
        type: 'table',
        content: 'The three types',
        contentFr: 'Les trois types',
        tableData: {
          headers: ['Type', 'Weak letter', 'Example'],
          rows: [
            ['مِثَال (assimilated)', 'first radical', 'وَعَدَ (to promise)'],
            ['أَجْوَف (hollow)', 'middle radical', 'قَالَ (to say)'],
            ['نَاقِص (defective)', 'last radical', 'دَعَا / رَمَى (to call / throw)'],
          ],
        },
        tableDataFr: {
          headers: ['Type', 'Lettre faible', 'Exemple'],
          rows: [
            ['مِثَال (assimilé)', 'première radicale', 'وَعَدَ (promettre)'],
            ['أَجْوَف (concave)', 'radicale médiane', 'قَالَ (dire)'],
            ['نَاقِص (défectueux)', 'dernière radicale', 'دَعَا / رَمَى (appeler / lancer)'],
          ],
        },
      },
      {
        type: 'rule',
        content: 'Hollow verbs (أجوف) show the weak letter as a long vowel in the past (قَالَ) but often lose it in the present jussive and imperative (قُلْ = "say!"). Assimilated verbs (مثال) usually drop the و in the present: وَعَدَ → يَعِدُ.',
        contentFr: 'Les verbes concaves (أجوف) montrent la lettre faible comme voyelle longue au passé (قَالَ) mais la perdent souvent au présent apocopé et à l\'impératif (قُلْ = « dis ! »). Les verbes assimilés (مثال) perdent en général le و au présent : وَعَدَ → يَعِدُ.',
      },
      {
        type: 'examples_grid',
        content: 'How the weak letter behaves',
        contentFr: 'Comportement de la lettre faible',
        examples: [
          { arabic: 'قَالَ ← يَقُولُ ← قُلْ', english: 'said → says → say!', french: 'dit → il dit → dis !' },
          { arabic: 'وَعَدَ ← يَعِدُ', english: 'promised → promises (و drops)', french: 'promit → il promet (le و tombe)' },
          { arabic: 'دَعَا ← يَدْعُو', english: 'called → calls', french: 'appela → il appelle' },
        ],
      },
      {
        type: 'note',
        content: 'Don\'t try to memorize every change at once. Recognize the type from the root, and the pattern of dropping/shifting the weak letter will become familiar.',
        contentFr: 'N\'essayez pas de tout mémoriser d\'un coup. Reconnaissez le type d\'après la racine, et le schéma de chute/déplacement de la lettre faible deviendra familier.',
      },
    ],
  },

  // ── Hal (circumstantial accusative) ─────────────────────────────
  {
    id: 'grammar-hal',
    title: 'The Circumstance (الحال)',
    titleFr: 'Le complément d\'état (الحال)',
    titleArabic: 'الْحَال',
    description: 'Describes the state of the subject or object during the action.',
    descriptionFr: 'Décrit l\'état du sujet ou de l\'objet pendant l\'action.',
    level: 'advanced',
    category: 'other',
    order: 44,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'الحال answers the question "how?" — it describes the condition of someone or something at the moment of the action. In English it is often an "-ing" phrase: "He came running."',
        contentFr: 'الحال répond à la question « comment ? » — il décrit l\'état de quelqu\'un ou de quelque chose au moment de l\'action. En français c\'est souvent un gérondif : « Il vint en courant. »',
      },
      {
        type: 'rule',
        content: 'The حال is an INDEFINITE noun in the ACCUSATIVE case (‑an). Its owner (صاحب الحال — the person/thing it describes) is usually DEFINITE.',
        contentFr: 'Le حال est un nom INDÉFINI à l\'ACCUSATIF (‑an). Son « propriétaire » (صاحب الحال — la personne/chose décrite) est en général DÉFINI.',
      },
      {
        type: 'examples_grid',
        content: 'Examples',
        contentFr: 'Exemples',
        examples: [
          { arabic: 'جَاءَ الطَّالِبُ مُسْرِعًا', english: 'The student came hurrying', french: 'L\'étudiant vint en se dépêchant' },
          { arabic: 'شَرِبْتُ المَاءَ بَارِدًا', english: 'I drank the water cold', french: 'J\'ai bu l\'eau froide' },
          { arabic: 'رَجَعَ الأَبُ مُتْعَبًا', english: 'The father returned tired', french: 'Le père rentra fatigué' },
        ],
      },
      {
        type: 'note',
        content: 'Tell الحال apart from a normal adjective: an adjective describes a permanent quality and matches its noun in definiteness; the حال is indefinite/accusative and describes a temporary state during the action.',
        contentFr: 'Distinguez le حال d\'un simple adjectif : l\'adjectif décrit une qualité permanente et s\'accorde en définitude avec le nom ; le حال est indéfini/accusatif et décrit un état temporaire pendant l\'action.',
      },
    ],
  },

  // ── Tamyiz (specification) ──────────────────────────────────────
  {
    id: 'grammar-tamyiz',
    title: 'Specification (التمييز)',
    titleFr: 'Le spécificatif (التمييز)',
    titleArabic: 'التَّمْيِيز',
    description: 'Clarifies an ambiguous amount, measure, or number.',
    descriptionFr: 'Précise une quantité, une mesure ou un nombre ambigus.',
    level: 'advanced',
    category: 'nouns',
    order: 45,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'التمييز removes ambiguity: it answers "in what respect?" after amounts, weights, measures, and numbers. "Twenty" of what? "A litre" of what? The تمييز supplies the answer.',
        contentFr: 'التمييز lève l\'ambiguïté : il répond à « en quoi ? » après les quantités, poids, mesures et nombres. « Vingt » de quoi ? « Un litre » de quoi ? Le تمييز fournit la réponse.',
      },
      {
        type: 'rule',
        content: 'The تمييز is an INDEFINITE noun in the ACCUSATIVE case (‑an). After numbers 11–99 the counted noun is exactly this: a singular accusative تمييز.',
        contentFr: 'Le تمييز est un nom INDÉFINI à l\'ACCUSATIF (‑an). Après les nombres 11–99, le nom compté est précisément cela : un تمييز singulier à l\'accusatif.',
      },
      {
        type: 'examples_grid',
        content: 'Examples',
        contentFr: 'Exemples',
        examples: [
          { arabic: 'عِنْدِي عِشْرُونَ كِتَابًا', english: 'I have twenty books', french: 'J\'ai vingt livres' },
          { arabic: 'اِشْتَرَيْتُ لِتْرًا حَلِيبًا', english: 'I bought a litre of milk', french: 'J\'ai acheté un litre de lait' },
          { arabic: 'اِزْدَادَ الطَّالِبُ عِلْمًا', english: 'The student increased in knowledge', french: 'L\'étudiant a gagné en savoir' },
        ],
      },
      {
        type: 'note',
        content: 'Both الحال and التمييز are indefinite accusatives, but الحال describes a state ("how?") while التمييز clarifies an amount ("in what respect?").',
        contentFr: 'الحال et التمييز sont tous deux des accusatifs indéfinis, mais الحال décrit un état (« comment ? ») tandis que التمييز précise une quantité (« en quoi ? »).',
      },
    ],
  },

  // ── The five nouns ──────────────────────────────────────────────
  {
    id: 'grammar-five-nouns',
    title: 'The Five Nouns (الأسماء الخمسة)',
    titleFr: 'Les cinq noms (الأسماء الخمسة)',
    titleArabic: 'الْأَسْمَاءُ الْخَمْسَة',
    description: 'Five special nouns that take long-vowel case endings.',
    descriptionFr: 'Cinq noms particuliers qui prennent des voyelles longues comme désinences.',
    level: 'advanced',
    category: 'nouns',
    order: 46,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'Five common nouns show their case not with the usual short vowels but with LONG vowels (و / ا / ي) — but only when they are singular and joined to a following word (idāfa), and not attached to the "my" pronoun.',
        contentFr: 'Cinq noms courants montrent leur cas non pas avec les voyelles brèves habituelles, mais avec des voyelles LONGUES (و / ا / ي) — seulement au singulier et en annexion (idāfa), et non attachés au pronom « mon ».',
      },
      {
        type: 'table',
        content: 'The five nouns and their case endings',
        contentFr: 'Les cinq noms et leurs désinences',
        tableData: {
          headers: ['Noun', 'Nom. (و)', 'Acc. (ا)', 'Gen. (ي)'],
          rows: [
            ['أَب (father)', 'أَبُو', 'أَبَا', 'أَبِي'],
            ['أَخ (brother)', 'أَخُو', 'أَخَا', 'أَخِي'],
            ['حَم (father-in-law)', 'حَمُو', 'حَمَا', 'حَمِي'],
            ['فو (mouth)', 'فُو', 'فَا', 'فِي'],
            ['ذو (possessor of)', 'ذُو', 'ذَا', 'ذِي'],
          ],
        },
        tableDataFr: {
          headers: ['Nom', 'Nom. (و)', 'Acc. (ا)', 'Gén. (ي)'],
          rows: [
            ['أَب (père)', 'أَبُو', 'أَبَا', 'أَبِي'],
            ['أَخ (frère)', 'أَخُو', 'أَخَا', 'أَخِي'],
            ['حَم (beau-père)', 'حَمُو', 'حَمَا', 'حَمِي'],
            ['فو (bouche)', 'فُو', 'فَا', 'فِي'],
            ['ذو (doté de)', 'ذُو', 'ذَا', 'ذِي'],
          ],
        },
      },
      {
        type: 'examples_grid',
        content: 'Same noun, three cases',
        contentFr: 'Même nom, trois cas',
        examples: [
          { arabic: 'جَاءَ أَبُوكَ', english: 'Your father came (subject → و)', french: 'Ton père est venu (sujet → و)' },
          { arabic: 'رَأَيْتُ أَبَاكَ', english: 'I saw your father (object → ا)', french: 'J\'ai vu ton père (objet → ا)' },
          { arabic: 'مَرَرْتُ بِأَبِيكَ', english: 'I passed by your father (genitive → ي)', french: 'Je suis passé près de ton père (génitif → ي)' },
        ],
      },
      {
        type: 'note',
        content: 'ذو always means "possessor/owner of" and is always followed by another noun: ذُو عِلْمٍ = "a person of knowledge".',
        contentFr: 'ذو signifie toujours « doté de / possesseur de » et est toujours suivi d\'un autre nom : ذُو عِلْمٍ = « une personne de savoir ».',
      },
    ],
  },

  // ── Diptotes ────────────────────────────────────────────────────
  {
    id: 'grammar-diptote',
    title: 'Diptotes (الممنوع من الصرف)',
    titleFr: 'Les diptotes (الممنوع من الصرف)',
    titleArabic: 'الْمَمْنُوعُ مِنَ الصَّرْف',
    description: 'Nouns that refuse tanwīn and take fatḥa in the genitive.',
    descriptionFr: 'Les noms qui refusent le tanwīn et prennent la fatḥa au génitif.',
    level: 'advanced',
    category: 'nouns',
    order: 47,
    exercises: [],
    content: [
      {
        type: 'text',
        content: 'Most nouns are "fully inflected": they take tanwīn (‑un/‑an/‑in) and a kasra in the genitive. A diptote is a noun "forbidden from full inflection": it never takes tanwīn, and in the genitive it takes a FATḤA instead of a kasra.',
        contentFr: 'La plupart des noms sont « pleinement fléchis » : ils prennent le tanwīn (‑un/‑an/‑in) et une kasra au génitif. Un diptote est un nom « interdit de pleine flexion » : il ne prend jamais de tanwīn et, au génitif, il prend une FATḤA au lieu d\'une kasra.',
      },
      {
        type: 'rule',
        content: 'Two case endings only: ‑u (nominative) and ‑a (both accusative AND genitive), with no tanwīn — as long as the word is indefinite and not in idāfa.',
        contentFr: 'Deux désinences seulement : ‑u (nominatif) et ‑a (à la fois accusatif ET génitif), sans tanwīn — tant que le mot est indéfini et hors idāfa.',
      },
      {
        type: 'table',
        content: 'Common diptote categories',
        contentFr: 'Catégories courantes de diptotes',
        tableData: {
          headers: ['Category', 'Examples'],
          rows: [
            ['Many proper names', 'أَحْمَد، فَاطِمَة، مَكَّة'],
            ['Adjectives of pattern أَفْعَل', 'أَحْمَر (red), أَكْبَر (bigger)'],
            ['Plurals of pattern مَفَاعِل/مَفَاعِيل', 'مَسَاجِد، مَصَابِيح'],
            ['Words ending in ‑āʾ / ‑ā', 'صَحْرَاء، ذِكْرَى'],
          ],
        },
        tableDataFr: {
          headers: ['Catégorie', 'Exemples'],
          rows: [
            ['Beaucoup de noms propres', 'أَحْمَد، فَاطِمَة، مَكَّة'],
            ['Adjectifs du schéma أَفْعَل', 'أَحْمَر (rouge), أَكْبَر (plus grand)'],
            ['Pluriels du schéma مَفَاعِل/مَفَاعِيل', 'مَسَاجِد، مَصَابِيح'],
            ['Mots finissant en ‑āʾ / ‑ā', 'صَحْرَاء، ذِكْرَى'],
          ],
        },
      },
      {
        type: 'examples_grid',
        content: 'Genitive takes fatḥa (no kasra, no tanwīn)',
        contentFr: 'Le génitif prend la fatḥa (ni kasra, ni tanwīn)',
        examples: [
          { arabic: 'صَلَّيْتُ فِي مَسَاجِدَ', english: 'I prayed in mosques (not مساجدٍ)', french: 'J\'ai prié dans des mosquées (et non مساجدٍ)' },
          { arabic: 'ذَهَبْتُ إِلَى مَكَّةَ', english: 'I went to Mecca (not مكةٍ)', french: 'Je suis allé à La Mecque (et non مكةٍ)' },
          { arabic: 'مَرَرْتُ بِأَحْمَدَ', english: 'I passed by Ahmad (not أحمدٍ)', french: 'Je suis passé près d\'Ahmad (et non أحمدٍ)' },
        ],
      },
      {
        type: 'note',
        content: 'Once a diptote becomes definite (with ال) or enters idāfa, it behaves normally again and takes a kasra in the genitive: فِي الْمَسَاجِدِ.',
        contentFr: 'Dès qu\'un diptote devient défini (avec ال) ou entre en idāfa, il redevient normal et prend une kasra au génitif : فِي الْمَسَاجِدِ.',
      },
    ],
  },
];
