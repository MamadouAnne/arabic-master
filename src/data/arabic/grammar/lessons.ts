import { GrammarLesson, GrammarContent } from '../../../types/arabic';
import { verbLessons } from '../verbs/verbLessons';
import { writingLessons } from '../writing/writingLessons';
import { ADDITIONAL_GRAMMAR_LESSONS } from './additionalLessons';

export const grammarLessons: GrammarLesson[] = [
  // LESSON 1: The Arabic Alphabet Overview
  {
    id: 'grammar-1',
    title: 'The Arabic Writing System',
    titleFr: 'Le Système d\'Écriture Arabe',
    titleArabic: 'نِظَامُ الْكِتَابَةِ الْعَرَبِيَّة',
    description: 'Discover the beautiful Arabic script - 28 letters, right-to-left flow, and connected writing',
    descriptionFr: 'Découvrez la belle écriture arabe - 28 lettres, écriture de droite à gauche et lettres connectées',
    level: 'beginner',
    category: 'other',
    order: 1,
    exercises: ['ex-grammar-1-1', 'ex-grammar-1-2'],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'Welcome to the Arabic writing system! Arabic is one of the world\'s most beautiful scripts, written from [[right to left]] with [[28 letters]] that flow together like water. Unlike English print, Arabic letters connect to each other, creating elegant, flowing words.',
        contentFr: 'Bienvenue dans le système d\'écriture arabe ! L\'arabe est l\'une des plus belles écritures du monde, écrite de [[droite à gauche]] avec [[28 lettres]] qui s\'enchaînent comme l\'eau. Contrairement à l\'écriture latine, les lettres arabes se connectent entre elles, créant des mots élégants et fluides.',
        arabicDescription: 'مَرْحَباً بِكَ فِي نِظَامِ الْكِتَابَةِ الْعَرَبِيَّة',
        arabicTranslation: 'Welcome to the Arabic writing system',
        arabicTranslationFr: 'Bienvenue dans le système d\'écriture arabe',
      },

      // The 28 Letters
      {
        type: 'rule',
        content: 'The Arabic alphabet has exactly [[28 letters]]. All letters are consonants — vowels are shown as small marks above or below letters, or sometimes not written at all!',
        contentFr: 'L\'alphabet arabe comporte exactement [[28 lettres]]. Toutes les lettres sont des consonnes — les voyelles sont indiquées par de petites marques au-dessus ou en dessous des lettres, ou parfois ne sont pas écrites du tout !',
        arabicDescription: 'الْأَبْجَدِيَّة الْعَرَبِيَّة فِيهَا ثَمَانِيَة وَعِشْرُون حَرْفاً',
        arabicTranslation: 'The Arabic alphabet has twenty-eight letters',
        arabicTranslationFr: 'L\'alphabet arabe comporte vingt-huit lettres',
      },

      // Full Alphabet Grid
      {
        type: 'letters_grid',
        content: 'The 28 Arabic Letters',
        contentFr: 'Les 28 Lettres Arabes',
        letters: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'],
        letterType: 'moon',
      },

      // Right to Left
      {
        type: 'rule',
        content: 'Arabic is written and read from [[right to left]] — the opposite of English! Books open from what English readers would consider the "back." Numbers, however, are written left to right.',
        contentFr: 'L\'arabe s\'écrit et se lit de [[droite à gauche]] — l\'inverse du français ! Les livres s\'ouvrent par ce que les lecteurs francophones considéreraient comme la « fin ». Les chiffres, cependant, s\'écrivent de gauche à droite.',
        arabicDescription: 'نَكْتُبُ مِنَ الْيَمِين إِلَى الْيَسَار',
        arabicTranslation: 'We write from right to left',
        arabicTranslationFr: 'Nous écrivons de droite à gauche',
      },

      // Direction comparison
      {
        type: 'comparison_grid',
        content: 'Reading Direction',
        contentFr: 'Sens de Lecture',
        leftLabel: 'Start Here ←',
        leftLabelFr: 'Commencez Ici ←',
        rightLabel: '← End Here',
        rightLabelFr: '← Finissez Ici',
        comparisons: [
          { left: { arabic: 'مَرْحَبا', label: 'Hello', labelFr: 'Bonjour' }, right: { arabic: 'ً', label: '(read right to left)', labelFr: '(lire de droite à gauche)' } },
          { left: { arabic: 'كِتَاب', label: 'Book', labelFr: 'Livre' }, right: { arabic: 'ً', label: '(read right to left)', labelFr: '(lire de droite à gauche)' } },
        ],
      },

      // Letter Forms
      {
        type: 'rule',
        content: 'Most Arabic letters have [[4 different shapes]] depending on their position in a word: [[isolated]] (alone), [[initial]] (beginning), [[medial]] (middle), and [[final]] (end). Don\'t worry — the changes follow patterns!',
        contentFr: 'La plupart des lettres arabes ont [[4 formes différentes]] selon leur position dans un mot : [[isolée]] (seule), [[initiale]] (début), [[médiane]] (milieu) et [[finale]] (fin). Ne vous inquiétez pas — les changements suivent des règles !',
        arabicDescription: 'لِكُلِّ حَرْفٍ أَرْبَعَة أَشْكَال',
        arabicTranslation: 'Each letter has four shapes',
        arabicTranslationFr: 'Chaque lettre a quatre formes',
      },

      // Letter Ba example
      {
        type: 'text',
        content: 'Letter Forms: ب (Ba)',
        contentFr: 'Formes de la Lettre : ب (Ba)',
      },
      {
        type: 'examples_grid',
        content: 'The 4 forms of Ba',
        contentFr: 'Les 4 formes de Ba',
        examples: [
          { arabic: 'ب', english: 'Isolated', french: 'Isolée' },
          { arabic: 'بـ', english: 'Initial', french: 'Initiale' },
          { arabic: 'ـبـ', english: 'Medial', french: 'Médiane' },
          { arabic: 'ـب', english: 'Final', french: 'Finale' },
        ],
      },

      // Letter Seen example
      {
        type: 'text',
        content: 'Letter Forms: س (Seen)',
        contentFr: 'Formes de la Lettre : س (Sine)',
      },
      {
        type: 'examples_grid',
        content: 'The 4 forms of Seen',
        contentFr: 'Les 4 formes de Sine',
        examples: [
          { arabic: 'س', english: 'Isolated', french: 'Isolée' },
          { arabic: 'سـ', english: 'Initial', french: 'Initiale' },
          { arabic: 'ـسـ', english: 'Medial', french: 'Médiane' },
          { arabic: 'ـس', english: 'Final', french: 'Finale' },
        ],
      },

      // Letter Meem example
      {
        type: 'text',
        content: 'Letter Forms: م (Meem)',
        contentFr: 'Formes de la Lettre : م (Mime)',
      },
      {
        type: 'examples_grid',
        content: 'The 4 forms of Meem',
        contentFr: 'Les 4 formes de Mime',
        examples: [
          { arabic: 'م', english: 'Isolated', french: 'Isolée' },
          { arabic: 'مـ', english: 'Initial', french: 'Initiale' },
          { arabic: 'ـمـ', english: 'Medial', french: 'Médiane' },
          { arabic: 'ـم', english: 'Final', french: 'Finale' },
        ],
      },

      // Non-connector letters
      {
        type: 'rule',
        content: 'Six special letters [[NEVER connect]] to the letter after them. They only have 2 forms (isolated and final). These are called [[non-connectors]] — they always "lift the pen."',
        contentFr: 'Six lettres spéciales ne se connectent [[JAMAIS]] à la lettre qui les suit. Elles n\'ont que 2 formes (isolée et finale). On les appelle les [[non-connecteurs]] — elles « lèvent toujours le stylo ».',
        arabicDescription: 'سِتَّة حُرُوف لَا تَتَّصِل بِمَا بَعْدَهَا',
        arabicTranslation: 'Six letters do not connect to what follows them',
        arabicTranslationFr: 'Six lettres ne se connectent pas à ce qui les suit',
      },

      // Non-connector grid
      {
        type: 'letters_grid',
        content: 'The 6 Non-Connectors',
        contentFr: 'Les 6 Non-Connecteurs',
        letters: ['ا', 'د', 'ذ', 'ر', 'ز', 'و'],
        letterType: 'sun',
      },

      // Words with non-connectors
      {
        type: 'text',
        content: 'Words with Non-Connectors',
        contentFr: 'Mots avec des Non-Connecteurs',
      },
      {
        type: 'examples_grid',
        content: 'Notice how these letters break the connection',
        contentFr: 'Remarquez comment ces lettres brisent la connexion',
        examples: [
          { arabic: 'دَرَسَ', english: 'he studied', french: 'il a étudié' },
          { arabic: 'وَلَد', english: 'boy', french: 'garçon' },
          { arabic: 'زَهْرَة', english: 'flower', french: 'fleur' },
          { arabic: 'رَجُل', english: 'man', french: 'homme' },
          { arabic: 'ذَهَبَ', english: 'he went', french: 'il est parti' },
          { arabic: 'أَب', english: 'father', french: 'père' },
        ],
      },

      // Connected words examples
      {
        type: 'text',
        content: 'Beautifully Connected Words',
        contentFr: 'De Beaux Mots Connectés',
      },
      {
        type: 'examples_grid',
        content: 'See how letters flow together',
        contentFr: 'Voyez comment les lettres s\'enchaînent',
        examples: [
          { arabic: 'كِتَاب', english: 'book', french: 'livre' },
          { arabic: 'مَكْتَب', english: 'desk/office', french: 'bureau' },
          { arabic: 'بَيْت', english: 'house', french: 'maison' },
          { arabic: 'سَلَام', english: 'peace', french: 'paix' },
          { arabic: 'جَمِيل', english: 'beautiful', french: 'beau' },
          { arabic: 'مَسْجِد', english: 'mosque', french: 'mosquée' },
          { arabic: 'طَعَام', english: 'food', french: 'nourriture' },
          { arabic: 'قَلَم', english: 'pen', french: 'stylo' },
        ],
      },

      // Dots distinction
      {
        type: 'rule',
        content: 'Many Arabic letters share the same base shape and are distinguished only by [[dots]]. For example: [[ب]] (ba) has 1 dot below, [[ت]] (ta) has 2 dots above, [[ث]] (tha) has 3 dots above — same base shape!',
        contentFr: 'De nombreuses lettres arabes partagent la même forme de base et ne se distinguent que par les [[points]]. Par exemple : [[ب]] (ba) a 1 point en dessous, [[ت]] (ta) a 2 points au-dessus, [[ث]] (tha) a 3 points au-dessus — même forme de base !',
        arabicDescription: 'النُّقَط تُمَيِّز الْحُرُوف',
        arabicTranslation: 'Dots distinguish the letters',
        arabicTranslationFr: 'Les points distinguent les lettres',
      },

      // Dot families
      {
        type: 'text',
        content: 'Letter Families (Same Shape, Different Dots)',
        contentFr: 'Familles de Lettres (Même Forme, Points Différents)',
      },
      {
        type: 'examples_grid',
        content: 'ب ت ث Family',
        contentFr: 'Famille ب ت ث',
        examples: [
          { arabic: 'ب', english: '1 dot below', french: '1 point en dessous' },
          { arabic: 'ت', english: '2 dots above', french: '2 points au-dessus' },
          { arabic: 'ث', english: '3 dots above', french: '3 points au-dessus' },
          { arabic: 'ن', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ج ح خ Family',
        contentFr: 'Famille ج ح خ',
        examples: [
          { arabic: 'ج', english: '1 dot below', french: '1 point en dessous' },
          { arabic: 'ح', english: 'no dots', french: 'sans point' },
          { arabic: 'خ', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'د ذ Family',
        contentFr: 'Famille د ذ',
        examples: [
          { arabic: 'د', english: 'no dots', french: 'sans point' },
          { arabic: 'ذ', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ر ز Family',
        contentFr: 'Famille ر ز',
        examples: [
          { arabic: 'ر', english: 'no dots', french: 'sans point' },
          { arabic: 'ز', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'س ش Family',
        contentFr: 'Famille س ش',
        examples: [
          { arabic: 'س', english: 'no dots', french: 'sans point' },
          { arabic: 'ش', english: '3 dots above', french: '3 points au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ص ض Family',
        contentFr: 'Famille ص ض',
        examples: [
          { arabic: 'ص', english: 'no dots', french: 'sans point' },
          { arabic: 'ض', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ط ظ Family',
        contentFr: 'Famille ط ظ',
        examples: [
          { arabic: 'ط', english: 'no dots', french: 'sans point' },
          { arabic: 'ظ', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ع غ Family',
        contentFr: 'Famille ع غ',
        examples: [
          { arabic: 'ع', english: 'no dots', french: 'sans point' },
          { arabic: 'غ', english: '1 dot above', french: '1 point au-dessus' },
        ],
      },

      {
        type: 'examples_grid',
        content: 'ف ق Family',
        contentFr: 'Famille ف ق',
        examples: [
          { arabic: 'ف', english: '1 dot above', french: '1 point au-dessus' },
          { arabic: 'ق', english: '2 dots above', french: '2 points au-dessus' },
        ],
      },

      // Practice reading
      {
        type: 'text',
        content: 'Practice Reading These Words',
        contentFr: 'Entraînez-vous à Lire ces Mots',
      },
      {
        type: 'examples_grid',
        content: 'Common words to practice',
        contentFr: 'Mots courants pour s\'entraîner',
        examples: [
          { arabic: 'مَاء', english: 'water', french: 'eau' },
          { arabic: 'سَمَاء', english: 'sky', french: 'ciel' },
          { arabic: 'شَمْس', english: 'sun', french: 'soleil' },
          { arabic: 'قَمَر', english: 'moon', french: 'lune' },
          { arabic: 'نَجْم', english: 'star', french: 'étoile' },
          { arabic: 'أَرْض', english: 'earth', french: 'terre' },
          { arabic: 'بَحْر', english: 'sea', french: 'mer' },
          { arabic: 'جَبَل', english: 'mountain', french: 'montagne' },
          { arabic: 'شَجَرَة', english: 'tree', french: 'arbre' },
          { arabic: 'وَرْدَة', english: 'rose', french: 'rose' },
        ],
      },

      // Final tip
      {
        type: 'note',
        content: 'Practice Tip: Think of Arabic like cursive handwriting — letters flow together naturally. Start by recognizing letter shapes, then practice connecting them. The more you read, the faster you\'ll recognize words!',
        contentFr: 'Conseil pratique : Pensez à l\'arabe comme à l\'écriture cursive — les lettres s\'enchaînent naturellement. Commencez par reconnaître les formes des lettres, puis entraînez-vous à les connecter. Plus vous lirez, plus vite vous reconnaîtrez les mots !',
        arabicDescription: 'كُلَّمَا قَرَأْتَ أَكْثَر، تَعَلَّمْتَ أَسْرَع',
        arabicTranslation: 'The more you read, the faster you learn',
        arabicTranslationFr: 'Plus vous lisez, plus vite vous apprenez',
      },
    ],
  },

  // LESSON 2: Vowels and Diacritics
  {
    id: 'grammar-2',
    title: 'Arabic Vowels (Harakat)',
    titleFr: 'Les Voyelles Arabes (Harakat)',
    titleArabic: 'الْحَرَكَات',
    description: 'Master the short vowels, long vowels, sukun, shadda, and tanween',
    descriptionFr: 'Maîtrisez les voyelles courtes, voyelles longues, sukun, shadda et tanween',
    level: 'beginner',
    category: 'other',
    order: 2,
    exercises: ['ex-grammar-2-1', 'ex-grammar-2-2', 'ex-grammar-2-3'],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'Arabic vowels are the soul of pronunciation! Unlike English where vowels are letters, Arabic uses [[small marks]] called [[حَرَكَات]] (harakat) placed above or below consonants. These marks tell you exactly how to pronounce each letter. In everyday writing, these marks are often omitted — but in the Quran and learning materials, they\'re always shown.',
        contentFr: 'Les voyelles arabes sont l\'âme de la prononciation ! Contrairement au français où les voyelles sont des lettres, l\'arabe utilise de [[petits signes]] appelés [[حَرَكَات]] (harakat) placés au-dessus ou en dessous des consonnes. Ces signes vous indiquent exactement comment prononcer chaque lettre. Dans l\'écriture courante, ces signes sont souvent omis — mais dans le Coran et les supports d\'apprentissage, ils sont toujours présents.',
        arabicDescription: 'الْحَرَكَات هِيَ رُوحُ النُّطْق',
        arabicTranslation: 'The vowel marks are the soul of pronunciation',
        arabicTranslationFr: 'Les signes de voyelles sont l\'âme de la prononciation',
      },

      // Short Vowels Introduction
      {
        type: 'rule',
        content: 'Arabic has [[3 short vowels]] — tiny marks that create the sounds "a", "i", and "u". They are called [[فَتْحَة]] (fatha), [[كَسْرَة]] (kasra), and [[ضَمَّة]] (damma). Master these three and you can read any Arabic word!',
        contentFr: 'L\'arabe possède [[3 voyelles courtes]] — de petits signes qui produisent les sons « a », « i » et « ou ». Elles s\'appellent [[فَتْحَة]] (fatha), [[كَسْرَة]] (kasra) et [[ضَمَّة]] (damma). Maîtrisez ces trois voyelles et vous pourrez lire n\'importe quel mot arabe !',
        arabicDescription: 'ثَلَاث حَرَكَات قَصِيرَة',
        arabicTranslation: 'Three short vowels',
        arabicTranslationFr: 'Trois voyelles courtes',
      },

      // FATHA Section
      {
        type: 'text',
        content: 'فَتْحَة (Fatha) — The "A" Sound',
        contentFr: 'فَتْحَة (Fatha) — Le son « A »',
      },
      {
        type: 'rule',
        content: '[[Fatha]] is a small diagonal line [[ـَ]] placed ABOVE the letter. It makes the "a" sound as in "cat" or "father". The name [[فَتْحَة]] means "opening" because you open your mouth to say it!',
        contentFr: '[[Fatha]] est un petit trait diagonal [[ـَ]] placé AU-DESSUS de la lettre. Il produit le son « a » comme dans « chat » ou « papa ». Le nom [[فَتْحَة]] signifie « ouverture » car on ouvre la bouche pour le prononcer !',
        arabicDescription: 'الْفَتْحَة فَوْقَ الْحَرْف',
        arabicTranslation: 'Fatha is above the letter',
        arabicTranslationFr: 'La fatha est au-dessus de la lettre',
      },
      {
        type: 'examples_grid',
        content: 'Letters with Fatha',
        contentFr: 'Lettres avec Fatha',
        examples: [
          { arabic: 'بَ', english: 'ba', french: 'ba' },
          { arabic: 'تَ', english: 'ta', french: 'ta' },
          { arabic: 'سَ', english: 'sa', french: 'sa' },
          { arabic: 'مَ', english: 'ma', french: 'ma' },
          { arabic: 'نَ', english: 'na', french: 'na' },
          { arabic: 'كَ', english: 'ka', french: 'ka' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Fatha',
        contentFr: 'Mots avec Fatha',
        examples: [
          { arabic: 'كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'فَتَحَ', english: 'he opened', french: 'il a ouvert' },
          { arabic: 'جَلَسَ', english: 'he sat', french: 'il s\'est assis' },
          { arabic: 'سَمَك', english: 'fish', french: 'poisson' },
          { arabic: 'وَلَد', english: 'boy', french: 'garçon' },
        ],
      },

      // KASRA Section
      {
        type: 'text',
        content: 'كَسْرَة (Kasra) — The "I" Sound',
        contentFr: 'كَسْرَة (Kasra) — Le son « I »',
      },
      {
        type: 'rule',
        content: '[[Kasra]] is a small diagonal line [[ـِ]] placed BELOW the letter. It makes the "i" sound as in "sit" or "bit". The name [[كَسْرَة]] means "breaking" — think of it as breaking downward!',
        contentFr: '[[Kasra]] est un petit trait diagonal [[ـِ]] placé EN DESSOUS de la lettre. Il produit le son « i » comme dans « lit » ou « midi ». Le nom [[كَسْرَة]] signifie « cassure » — imaginez qu\'il casse vers le bas !',
        arabicDescription: 'الْكَسْرَة تَحْتَ الْحَرْف',
        arabicTranslation: 'Kasra is below the letter',
        arabicTranslationFr: 'La kasra est en dessous de la lettre',
      },
      {
        type: 'examples_grid',
        content: 'Letters with Kasra',
        contentFr: 'Lettres avec Kasra',
        examples: [
          { arabic: 'بِ', english: 'bi', french: 'bi' },
          { arabic: 'تِ', english: 'ti', french: 'ti' },
          { arabic: 'سِ', english: 'si', french: 'si' },
          { arabic: 'مِ', english: 'mi', french: 'mi' },
          { arabic: 'نِ', english: 'ni', french: 'ni' },
          { arabic: 'كِ', english: 'ki', french: 'ki' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Kasra',
        contentFr: 'Mots avec Kasra',
        examples: [
          { arabic: 'كِتَاب', english: 'book', french: 'livre' },
          { arabic: 'بِنْت', english: 'girl', french: 'fille' },
          { arabic: 'مِفْتَاح', english: 'key', french: 'clé' },
          { arabic: 'سِرّ', english: 'secret', french: 'secret' },
          { arabic: 'فِيل', english: 'elephant', french: 'éléphant' },
          { arabic: 'إِبْرَة', english: 'needle', french: 'aiguille' },
        ],
      },

      // DAMMA Section
      {
        type: 'text',
        content: 'ضَمَّة (Damma) — The "U" Sound',
        contentFr: 'ضَمَّة (Damma) — Le son « OU »',
      },
      {
        type: 'rule',
        content: '[[Damma]] looks like a tiny [[و]] (waw) [[ـُ]] placed ABOVE the letter. It makes the "u" sound as in "put" or "book". The name [[ضَمَّة]] means "joining" — your lips come together!',
        contentFr: '[[Damma]] ressemble à un petit [[و]] (waw) [[ـُ]] placé AU-DESSUS de la lettre. Il produit le son « ou » comme dans « bout » ou « loup ». Le nom [[ضَمَّة]] signifie « jonction » — vos lèvres se rapprochent !',
        arabicDescription: 'الضَّمَّة فَوْقَ الْحَرْف',
        arabicTranslation: 'Damma is above the letter',
        arabicTranslationFr: 'La damma est au-dessus de la lettre',
      },
      {
        type: 'examples_grid',
        content: 'Letters with Damma',
        contentFr: 'Lettres avec Damma',
        examples: [
          { arabic: 'بُ', english: 'bu', french: 'bou' },
          { arabic: 'تُ', english: 'tu', french: 'tou' },
          { arabic: 'سُ', english: 'su', french: 'sou' },
          { arabic: 'مُ', english: 'mu', french: 'mou' },
          { arabic: 'نُ', english: 'nu', french: 'nou' },
          { arabic: 'كُ', english: 'ku', french: 'kou' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Damma',
        contentFr: 'Mots avec Damma',
        examples: [
          { arabic: 'كُتُب', english: 'books', french: 'livres' },
          { arabic: 'رُجُل', english: 'man', french: 'homme' },
          { arabic: 'سُكَّر', english: 'sugar', french: 'sucre' },
          { arabic: 'قُلْب', english: 'heart', french: 'cœur' },
          { arabic: 'حُبّ', english: 'love', french: 'amour' },
          { arabic: 'نُور', english: 'light', french: 'lumière' },
        ],
      },

      // Short Vowels Comparison
      {
        type: 'text',
        content: 'Compare All Three Short Vowels',
        contentFr: 'Comparez les trois voyelles courtes',
      },
      {
        type: 'comparison_grid',
        content: 'Same letter, different vowels',
        contentFr: 'Même lettre, voyelles différentes',
        leftLabel: 'Letter',
        rightLabel: 'Three Sounds',
        comparisons: [
          { left: { arabic: 'ب', label: 'Ba' }, right: { arabic: 'بَ  بِ  بُ', label: 'ba - bi - bu' } },
          { left: { arabic: 'ك', label: 'Kaf' }, right: { arabic: 'كَ  كِ  كُ', label: 'ka - ki - ku' } },
          { left: { arabic: 'م', label: 'Meem' }, right: { arabic: 'مَ  مِ  مُ', label: 'ma - mi - mu' } },
        ],
      },

      // LONG VOWELS Section
      {
        type: 'rule',
        content: 'Arabic also has [[3 long vowels]] — they\'re like short vowels but held for twice as long! Long vowels are formed by adding a [[letter]] after a short vowel: [[ا]] (alif) for "aa", [[ي]] (ya) for "ee", [[و]] (waw) for "oo".',
        contentFr: 'L\'arabe possède également [[3 voyelles longues]] — elles ressemblent aux voyelles courtes mais se prononcent deux fois plus longtemps ! Les voyelles longues sont formées en ajoutant une [[lettre]] après une voyelle courte : [[ا]] (alif) pour « aa », [[ي]] (ya) pour « ii », [[و]] (waw) pour « ou ».',
        arabicDescription: 'ثَلَاث حَرَكَات طَوِيلَة',
        arabicTranslation: 'Three long vowels',
        arabicTranslationFr: 'Trois voyelles longues',
      },

      // Long A (Alif)
      {
        type: 'text',
        content: 'Long "AA" — Fatha + Alif (ـَا)',
        contentFr: 'Le « AA » long — Fatha + Alif (ـَا)',
      },
      {
        type: 'rule',
        content: 'When [[فَتْحَة]] is followed by [[ا]] (alif), the "a" sound is stretched long: "aa" as in "father". This combination [[ـَا]] creates the long "aa" sound.',
        contentFr: 'Quand [[فَتْحَة]] est suivi de [[ا]] (alif), le son « a » est allongé : « aa » comme dans « pâte ». Cette combinaison [[ـَا]] crée le son long « aa ».',
        arabicDescription: 'فَتْحَة + أَلِف = آ طَوِيلَة',
        arabicTranslation: 'Fatha + Alif = long AA',
        arabicTranslationFr: 'Fatha + Alif = AA long',
      },
      {
        type: 'examples_grid',
        content: 'Words with Long AA',
        contentFr: 'Mots avec AA long',
        examples: [
          { arabic: 'بَاب', english: 'door', french: 'porte' },
          { arabic: 'كِتَاب', english: 'book', french: 'livre' },
          { arabic: 'سَلَام', english: 'peace', french: 'paix' },
          { arabic: 'مَاء', english: 'water', french: 'eau' },
          { arabic: 'سَمَاء', english: 'sky', french: 'ciel' },
          { arabic: 'نَار', english: 'fire', french: 'feu' },
          { arabic: 'دَار', english: 'house', french: 'maison' },
          { arabic: 'جَار', english: 'neighbor', french: 'voisin' },
        ],
      },

      // Long I (Ya)
      {
        type: 'text',
        content: 'Long "EE" — Kasra + Ya (ـِي)',
        contentFr: 'Le « II » long — Kasra + Ya (ـِي)',
      },
      {
        type: 'rule',
        content: 'When [[كَسْرَة]] is followed by [[ي]] (ya), the "i" sound is stretched long: "ee" as in "see". This combination [[ـِي]] creates the long "ee" sound.',
        contentFr: 'Quand [[كَسْرَة]] est suivi de [[ي]] (ya), le son « i » est allongé : « ii » comme dans « vie ». Cette combinaison [[ـِي]] crée le son long « ii ».',
        arabicDescription: 'كَسْرَة + يَاء = إِي طَوِيلَة',
        arabicTranslation: 'Kasra + Ya = long EE',
        arabicTranslationFr: 'Kasra + Ya = II long',
      },
      {
        type: 'examples_grid',
        content: 'Words with Long EE',
        contentFr: 'Mots avec II long',
        examples: [
          { arabic: 'كَبِير', english: 'big', french: 'grand' },
          { arabic: 'صَغِير', english: 'small', french: 'petit' },
          { arabic: 'جَمِيل', english: 'beautiful', french: 'beau' },
          { arabic: 'طَرِيق', english: 'road', french: 'route' },
          { arabic: 'صَدِيق', english: 'friend', french: 'ami' },
          { arabic: 'عَظِيم', english: 'great', french: 'grandiose' },
          { arabic: 'قَدِيم', english: 'old/ancient', french: 'ancien' },
          { arabic: 'جَدِيد', english: 'new', french: 'nouveau' },
        ],
      },

      // Long U (Waw)
      {
        type: 'text',
        content: 'Long "OO" — Damma + Waw (ـُو)',
        contentFr: 'Le « OU » long — Damma + Waw (ـُو)',
      },
      {
        type: 'rule',
        content: 'When [[ضَمَّة]] is followed by [[و]] (waw), the "u" sound is stretched long: "oo" as in "moon". This combination [[ـُو]] creates the long "oo" sound.',
        contentFr: 'Quand [[ضَمَّة]] est suivi de [[و]] (waw), le son « ou » est allongé : « ou » comme dans « loup ». Cette combinaison [[ـُو]] crée le son long « ou ».',
        arabicDescription: 'ضَمَّة + وَاو = أُو طَوِيلَة',
        arabicTranslation: 'Damma + Waw = long OO',
        arabicTranslationFr: 'Damma + Waw = OU long',
      },
      {
        type: 'examples_grid',
        content: 'Words with Long OO',
        contentFr: 'Mots avec OU long',
        examples: [
          { arabic: 'نُور', english: 'light', french: 'lumière' },
          { arabic: 'سُور', english: 'wall/fence', french: 'mur/clôture' },
          { arabic: 'طُور', english: 'mountain', french: 'montagne' },
          { arabic: 'حُور', english: 'companions', french: 'compagnons' },
          { arabic: 'يَوْم', english: 'day', french: 'jour' },
          { arabic: 'قُول', english: 'saying', french: 'parole' },
          { arabic: 'رَسُول', english: 'messenger', french: 'messager' },
          { arabic: 'بُيُوت', english: 'houses', french: 'maisons' },
        ],
      },

      // Short vs Long Comparison
      {
        type: 'comparison_grid',
        content: 'Short vs Long Vowels',
        contentFr: 'Voyelles courtes vs longues',
        leftLabel: 'Short',
        rightLabel: 'Long',
        comparisons: [
          { left: { arabic: 'كَتَبَ', label: 'kataba (he wrote)' }, right: { arabic: 'كِتَاب', label: 'kitaab (book)' } },
          { left: { arabic: 'بِنْت', label: 'bint (girl)' }, right: { arabic: 'بَنِين', label: 'baneen (sons)' } },
          { left: { arabic: 'كُتُب', label: 'kutub (books)' }, right: { arabic: 'مَكْتُوب', label: 'maktoob (written)' } },
        ],
      },

      // SUKUN Section
      {
        type: 'text',
        content: 'سُكُون (Sukun) — The Silent Mark',
        contentFr: 'سُكُون (Sukun) — Le signe du silence',
      },
      {
        type: 'rule',
        content: '[[Sukun]] is a small circle [[ـْ]] placed ABOVE a letter. It means "silence" — the letter has [[NO vowel]] and stops abruptly. The name [[سُكُون]] means "stillness" or "rest".',
        contentFr: '[[Sukun]] est un petit cercle [[ـْ]] placé AU-DESSUS d\'une lettre. Il signifie « silence » — la lettre n\'a [[aucune voyelle]] et s\'arrête brusquement. Le nom [[سُكُون]] signifie « immobilité » ou « repos ».',
        arabicDescription: 'السُّكُون يَعْنِي لَا حَرَكَة',
        arabicTranslation: 'Sukun means no vowel',
        arabicTranslationFr: 'Le sukun signifie absence de voyelle',
      },
      {
        type: 'examples_grid',
        content: 'Letters with Sukun',
        contentFr: 'Lettres avec Sukun',
        examples: [
          { arabic: 'بْ', english: 'b (stop)', french: 'b (arrêt)' },
          { arabic: 'تْ', english: 't (stop)', french: 't (arrêt)' },
          { arabic: 'سْ', english: 's (stop)', french: 's (arrêt)' },
          { arabic: 'مْ', english: 'm (stop)', french: 'm (arrêt)' },
          { arabic: 'نْ', english: 'n (stop)', french: 'n (arrêt)' },
          { arabic: 'كْ', english: 'k (stop)', french: 'k (arrêt)' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Sukun',
        contentFr: 'Mots avec Sukun',
        examples: [
          { arabic: 'قَلْب', english: 'heart (qalb)', french: 'cœur (qalb)' },
          { arabic: 'بَحْر', english: 'sea (bahr)', french: 'mer (bahr)' },
          { arabic: 'شَمْس', english: 'sun (shams)', french: 'soleil (shams)' },
          { arabic: 'أَرْض', english: 'earth (ard)', french: 'terre (ard)' },
          { arabic: 'عَيْن', english: 'eye (ayn)', french: 'œil (ayn)' },
          { arabic: 'بَيْت', english: 'house (bayt)', french: 'maison (bayt)' },
          { arabic: 'خُبْز', english: 'bread (khubz)', french: 'pain (khubz)' },
          { arabic: 'مِلْح', english: 'salt (milh)', french: 'sel (milh)' },
        ],
      },

      // SHADDA Section
      {
        type: 'text',
        content: 'شَدَّة (Shadda) — The Doubling Mark',
        contentFr: 'شَدَّة (Shadda) — Le signe du doublement',
      },
      {
        type: 'rule',
        content: '[[Shadda]] looks like a tiny "w" [[ـّ]] placed ABOVE a letter. It means the letter is [[DOUBLED]] — pronounced twice but written once! The name [[شَدَّة]] means "strength" or "emphasis".',
        contentFr: '[[Shadda]] ressemble à un petit « w » [[ـّ]] placé AU-DESSUS d\'une lettre. Il signifie que la lettre est [[DOUBLÉE]] — prononcée deux fois mais écrite une seule fois ! Le nom [[شَدَّة]] signifie « force » ou « emphase ».',
        arabicDescription: 'الشَّدَّة تُضَاعِف الْحَرْف',
        arabicTranslation: 'Shadda doubles the letter',
        arabicTranslationFr: 'La shadda double la lettre',
      },
      {
        type: 'examples_grid',
        content: 'Letters with Shadda',
        contentFr: 'Lettres avec Shadda',
        examples: [
          { arabic: 'بّ', english: 'bb', french: 'bb' },
          { arabic: 'تّ', english: 'tt', french: 'tt' },
          { arabic: 'سّ', english: 'ss', french: 'ss' },
          { arabic: 'مّ', english: 'mm', french: 'mm' },
          { arabic: 'نّ', english: 'nn', french: 'nn' },
          { arabic: 'لّ', english: 'll', french: 'll' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Shadda',
        contentFr: 'Mots avec Shadda',
        examples: [
          { arabic: 'مُحَمَّد', english: 'Muhammad', french: 'Muhammad' },
          { arabic: 'عَلَّمَ', english: 'he taught', french: 'il a enseigné' },
          { arabic: 'سَلَّمَ', english: 'he greeted', french: 'il a salué' },
          { arabic: 'حَقّ', english: 'truth/right', french: 'vérité/droit' },
          { arabic: 'رَبّ', english: 'Lord', french: 'Seigneur' },
          { arabic: 'أُمّ', english: 'mother', french: 'mère' },
          { arabic: 'جَنَّة', english: 'paradise', french: 'paradis' },
          { arabic: 'نَبِيّ', english: 'prophet', french: 'prophète' },
        ],
      },
      {
        type: 'note',
        content: 'Shadda combines with vowels! The vowel mark sits on top of (or below) the shadda: [[ـَّ]] (shadda + fatha = "bba"), [[ـِّ]] (shadda + kasra = "bbi"), [[ـُّ]] (shadda + damma = "bbu"). Look for these combinations in words!',
        contentFr: 'La shadda se combine avec les voyelles ! Le signe de voyelle se place au-dessus (ou en dessous) de la shadda : [[ـَّ]] (shadda + fatha = « bba »), [[ـِّ]] (shadda + kasra = « bbi »), [[ـُّ]] (shadda + damma = « bbou »). Repérez ces combinaisons dans les mots !',
        arabicDescription: 'الشَّدَّة تَجْتَمِع مَعَ الْحَرَكَات',
        arabicTranslation: 'Shadda combines with vowels',
        arabicTranslationFr: 'La shadda se combine avec les voyelles',
      },
      {
        type: 'examples_grid',
        content: 'Shadda + Vowel Combinations',
        contentFr: 'Combinaisons Shadda + Voyelle',
        examples: [
          { arabic: 'رَبَّنَا', english: 'Rabbana (Our Lord) - شَدَّة + فَتْحَة', french: 'Rabbana (Notre Seigneur) - شَدَّة + فَتْحَة' },
          { arabic: 'رَبِّي', english: 'Rabbi (My Lord) - شَدَّة + كَسْرَة', french: 'Rabbi (Mon Seigneur) - شَدَّة + كَسْرَة' },
          { arabic: 'أُمِّي', english: 'Ummi (My mother) - شَدَّة + كَسْرَة', french: 'Ummi (Ma mère) - شَدَّة + كَسْرَة' },
          { arabic: 'مُحَمَّدٌ', english: 'Muhammad - شَدَّة + فَتْحَة', french: 'Muhammad - شَدَّة + فَتْحَة' },
          { arabic: 'عَلَّمَ', english: '\'Allama (He taught) - شَدَّة + فَتْحَة', french: '\'Allama (Il a enseigné) - شَدَّة + فَتْحَة' },
          { arabic: 'يُسَبِّحُ', english: 'Yusabbihu (He glorifies) - شَدَّة + كَسْرَة', french: 'Yusabbihu (Il glorifie) - شَدَّة + كَسْرَة' },
        ],
      },

      // TANWEEN Section
      {
        type: 'text',
        content: 'تَنْوِين (Tanween) — The "N" Ending',
        contentFr: 'تَنْوِين (Tanween) — La terminaison en « N »',
      },
      {
        type: 'rule',
        content: '[[Tanween]] adds an "n" sound to the end of a word. It\'s shown by [[doubling the vowel mark]]: [[ـً]] (an), [[ـٍ]] (in), [[ـٌ]] (un). Tanween indicates an indefinite noun — like "a/an" in English!',
        contentFr: '[[Tanween]] ajoute un son « n » à la fin d\'un mot. Il se note en [[doublant le signe de voyelle]] : [[ـً]] (an), [[ـٍ]] (in), [[ـٌ]] (oun). Le tanween indique un nom indéfini — comme « un/une » en français !',
        arabicDescription: 'التَّنْوِين يُضِيف صَوْت النُّون',
        arabicTranslation: 'Tanween adds the "N" sound',
        arabicTranslationFr: 'Le tanween ajoute le son « N »',
      },
      {
        type: 'examples_grid',
        content: 'The Three Tanween',
        contentFr: 'Les trois Tanween',
        examples: [
          { arabic: 'ـًا', english: 'an - فَتْحَتَان (fathatan)', french: 'an - فَتْحَتَان (fathatan)' },
          { arabic: 'ـٍ', english: 'in - كَسْرَتَان (kasratan)', french: 'in - كَسْرَتَان (kasratan)' },
          { arabic: 'ـٌ', english: 'un - ضَمَّتَان (dammatan)', french: 'oun - ضَمَّتَان (dammatan)' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Words with Tanween',
        contentFr: 'Mots avec Tanween',
        examples: [
          { arabic: 'كِتَابًا', english: 'Kitaaban (a book) - فَتْحَتَان', french: 'Kitaaban (un livre) - فَتْحَتَان' },
          { arabic: 'بَيْتًا', english: 'Baytan (a house) - فَتْحَتَان', french: 'Baytan (une maison) - فَتْحَتَان' },
          { arabic: 'قَلَمًا', english: 'Qalaman (a pen) - فَتْحَتَان', french: 'Qalaman (un stylo) - فَتْحَتَان' },
          { arabic: 'وَقْتٍ', english: 'Waqtin (a time) - كَسْرَتَان', french: 'Waqtin (un moment) - كَسْرَتَان' },
          { arabic: 'بَيْتٍ', english: 'Baytin (a house) - كَسْرَتَان', french: 'Baytin (une maison) - كَسْرَتَان' },
          { arabic: 'رَجُلٍ', english: 'Rajulin (a man) - كَسْرَتَان', french: 'Rajulin (un homme) - كَسْرَتَان' },
          { arabic: 'كِتَابٌ', english: 'Kitaabun (a book) - ضَمَّتَان', french: 'Kitaabun (un livre) - ضَمَّتَان' },
          { arabic: 'رَجُلٌ', english: 'Rajulun (a man) - ضَمَّتَان', french: 'Rajulun (un homme) - ضَمَّتَان' },
        ],
      },
      {
        type: 'note',
        content: 'Fathatan [[ـً]] usually requires an extra [[ا]] (alif) at the end: [[ـًا]]. Exception: words ending in [[ة]] (ta marbuta) or [[ء]] (hamza).',
        contentFr: 'Le fathatan [[ـً]] nécessite généralement un [[ا]] (alif) supplémentaire à la fin : [[ـًا]]. Exception : les mots se terminant par [[ة]] (ta marbuta) ou [[ء]] (hamza).',
        arabicDescription: 'الْفَتْحَتَان تَحْتَاج أَلِفًا',
        arabicTranslation: 'Fathatan needs an Alif',
        arabicTranslationFr: 'Le fathatan nécessite un Alif',
      },
      {
        type: 'examples_grid',
        content: 'Fathatan Examples',
        contentFr: 'Exemples de Fathatan',
        examples: [
          { arabic: 'كِتَابًا', english: 'Kitaaban (a book) - with alif', french: 'Kitaaban (un livre) - avec alif' },
          { arabic: 'بَيْتًا', english: 'Baytan (a house) - with alif', french: 'Baytan (une maison) - avec alif' },
          { arabic: 'قَلَمًا', english: 'Qalaman (a pen) - with alif', french: 'Qalaman (un stylo) - avec alif' },
          { arabic: 'جَمِيلَةً', english: 'Jamilatan (beautiful) - ة exception', french: 'Jamilatan (belle) - exception ة' },
          { arabic: 'مَدْرَسَةً', english: 'Madrasatan (a school) - ة exception', french: 'Madrasatan (une école) - exception ة' },
          { arabic: 'سَمَاءً', english: "Samaa'an (a sky) - ء exception", french: "Samaa'an (un ciel) - exception ء" },
        ],
      },

      // Complete Vowel Chart with Examples
      {
        type: 'text',
        content: 'Complete Vowel Reference with Examples',
        contentFr: 'Référence complète des voyelles avec exemples',
      },
      {
        type: 'examples_grid',
        content: 'Short Vowels',
        contentFr: 'Voyelles courtes',
        examples: [
          { arabic: 'كَتَبَ', english: 'Fatha - [[a]]', french: 'Fatha - [[a]]' },
          { arabic: 'كِتَاب', english: 'Kasra - [[i]]', french: 'Kasra - [[i]]' },
          { arabic: 'كُتُب', english: 'Damma - [[u]]', french: 'Damma - [[ou]]' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Long Vowels',
        contentFr: 'Voyelles longues',
        examples: [
          { arabic: 'بَاب', english: 'Long - [[aa]]', french: 'Long - [[aa]]' },
          { arabic: 'كَبِير', english: 'Long - [[ee]]', french: 'Long - [[ii]]' },
          { arabic: 'نُور', english: 'Long - [[oo]]', french: 'Long - [[ou]]' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Special Marks',
        contentFr: 'Signes spéciaux',
        examples: [
          { arabic: 'قَلْب', english: 'Sukun - [[silent]]', french: 'Sukun - [[silence]]' },
          { arabic: 'مُحَمَّد', english: 'Shadda - [[mm]]', french: 'Shadda - [[mm]]' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Tanween (Nunation)',
        contentFr: 'Tanween (Nunation)',
        examples: [
          { arabic: 'كِتَابًا', english: 'Fathatan - [[an]]', french: 'Fathatan - [[an]]' },
          { arabic: 'وَقْتٍ', english: 'Kasratan - [[in]]', french: 'Kasratan - [[in]]' },
          { arabic: 'كِتَابٌ', english: 'Dammatan - [[un]]', french: 'Dammatan - [[oun]]' },
        ],
      },

      // Practice Reading
      {
        type: 'text',
        content: 'Practice Reading — Full Words',
        contentFr: 'Pratique de lecture — Mots complets',
      },
      {
        type: 'examples_grid',
        content: 'Read these words with all vowel marks',
        contentFr: 'Lisez ces mots avec tous les signes de voyelles',
        examples: [
          { arabic: 'بِسْمِ اللهِ', english: 'In the name of Allah', french: 'Au nom d\'Allah' },
          { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Praise be to Allah', french: 'Louange à Allah' },
          { arabic: 'السَّلَامُ عَلَيْكُم', english: 'Peace be upon you', french: 'Que la paix soit sur vous' },
          { arabic: 'إِنْ شَاءَ اللهُ', english: 'God willing', french: 'Si Dieu le veut' },
          { arabic: 'مَا شَاءَ اللهُ', english: 'As Allah willed', french: 'Selon la volonté d\'Allah' },
          { arabic: 'جَزَاكَ اللهُ خَيْرًا', english: 'May Allah reward you', french: 'Qu\'Allah vous récompense' },
        ],
      },

      // Final tip
      {
        type: 'note',
        content: 'Reading Tip: In most Arabic texts (newspapers, books, signs), vowel marks are [[NOT written]] — only consonants appear! Readers use context and knowledge to pronounce words correctly. The Quran, children\'s books, and learning materials always include full vowel marks.',
        contentFr: 'Astuce de lecture : dans la plupart des textes arabes (journaux, livres, panneaux), les signes de voyelles ne sont [[PAS écrits]] — seules les consonnes apparaissent ! Les lecteurs utilisent le contexte et leurs connaissances pour prononcer les mots correctement. Le Coran, les livres pour enfants et les supports d\'apprentissage incluent toujours tous les signes de voyelles.',
        arabicDescription: 'الْقُرْآن دَائِمًا مُشَكَّل بِالْكَامِل',
        arabicTranslation: 'The Quran is always fully vowelized',
        arabicTranslationFr: 'Le Coran est toujours entièrement vocalisé',
      },
    ],
  },

  // LESSON 3: The Definite Article
  {
    id: 'grammar-3',
    title: 'The Definite Article (ال)',
    titleFr: 'L\'Article Défini (ال)',
    titleArabic: 'أَدَاةُ التَّعْرِيف',
    description: 'Master the Arabic word for "the" and discover the beautiful system of Sun and Moon letters',
    descriptionFr: 'Maîtrisez le mot arabe pour « le/la » et découvrez le système des lettres solaires et lunaires',
    level: 'beginner',
    category: 'articles',
    order: 3,
    exercises: ['ex-grammar-3-1', 'ex-grammar-3-2', 'ex-grammar-3-3'],
    content: [
      // Introduction with bilingual description
      {
        type: 'description',
        content: 'In Arabic, there is only ONE word for "the" — it\'s [[أَلْ]] and it attaches directly to the beginning of nouns. The beautiful part? Arabic has NO word for "a" or "an" — to say "a book," you simply say the word without [[أَلْ]]!',
        contentFr: 'En arabe, il n\'y a qu\'UN SEUL mot pour « le/la » — c\'est [[أَلْ]] et il s\'attache directement au début des noms. La belle partie ? L\'arabe n\'a PAS de mot comme « un/une » en français ! Pour dire « un livre », vous dites simplement le mot sans [[أَلْ]] !',
        arabicDescription: 'أَلْ هِيَ أَدَاةُ التَّعْرِيف فِي اللُّغَةِ الْعَرَبِيَّة',
        arabicTranslation: 'Al is the definite article in the Arabic language',
        arabicTranslationFr: 'Al est l\'article défini dans la langue arabe',
      },

      // Comparison examples showing indefinite vs definite
      {
        type: 'comparison_grid',
        content: 'Making Words Definite',
        contentFr: 'Rendre les mots définis',
        leftLabel: 'Indefinite',
        leftLabelFr: 'Indéfini',
        rightLabel: 'Definite',
        rightLabelFr: 'Défini',
        comparisons: [
          { left: { arabic: 'كِتَاب', label: 'a book', labelFr: 'un livre' }, right: { arabic: 'الْكِتَاب', label: 'the book', labelFr: 'le livre' } },
          { left: { arabic: 'بَيْت', label: 'a house', labelFr: 'une maison' }, right: { arabic: 'الْبَيْت', label: 'the house', labelFr: 'la maison' } },
          { left: { arabic: 'قَلَم', label: 'a pen', labelFr: 'un stylo' }, right: { arabic: 'الْقَلَم', label: 'the pen', labelFr: 'le stylo' } },
          { left: { arabic: 'بَاب', label: 'a door', labelFr: 'une porte' }, right: { arabic: 'الْبَاب', label: 'the door', labelFr: 'la porte' } },
          { left: { arabic: 'وَلَد', label: 'a boy', labelFr: 'un garçon' }, right: { arabic: 'الْوَلَد', label: 'the boy', labelFr: 'le garçon' } },
          { left: { arabic: 'بِنْت', label: 'a girl', labelFr: 'une fille' }, right: { arabic: 'الْبِنْت', label: 'the girl', labelFr: 'la fille' } },
        ],
      },

      // Sun Letters Rule
      {
        type: 'rule',
        content: 'The 14 Sun Letters are special — when [[أَلْ]] comes before them, the [[ل]] becomes silent and the letter is pronounced twice (doubled). This is shown with a [[شَدَّة]] (ـّ) mark.',
        contentFr: 'Les 14 lettres solaires sont spéciales — quand [[أَلْ]] les précède, le [[ل]] devient muet et la lettre est prononcée deux fois (doublée). Cela est indiqué par un signe [[شَدَّة]] (ـّ).',
        arabicDescription: 'الْحُرُوف الشَّمْسِيَّة: يُدْغَمُ فِيهَا اللَّام',
        arabicTranslation: 'Sun letters: the Lam assimilates into them',
        arabicTranslationFr: 'Lettres solaires : le Lam s\'assimile en elles',
      },

      // Sun Letters Grid
      {
        type: 'letters_grid',
        content: 'Sun Letters ☀️',
        contentFr: 'Lettres Solaires ☀️',
        letters: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ن', 'ل'],
        letterType: 'sun',
      },

      // Sun Letter Examples
      {
        type: 'text',
        content: 'Sun Letter Examples',
        contentFr: 'Exemples de lettres solaires',
      },
      {
        type: 'examples_grid',
        content: 'Examples with Sun Letters',
        contentFr: 'Exemples avec les lettres solaires',
        examples: [
          { arabic: 'الشَّمْس', english: 'the sun', french: 'le soleil' },
          { arabic: 'السَّلَام', english: 'the peace', french: 'la paix' },
          { arabic: 'النُّور', english: 'the light', french: 'la lumière' },
          { arabic: 'الرَّجُل', english: 'the man', french: 'l\'homme' },
          { arabic: 'الدَّرْس', english: 'the lesson', french: 'la leçon' },
          { arabic: 'التُّفَّاحَة', english: 'the apple', french: 'la pomme' },
          { arabic: 'الطَّعَام', english: 'the food', french: 'la nourriture' },
          { arabic: 'الزَّهْرَة', english: 'the flower', french: 'la fleur' },
          { arabic: 'الصَّبَاح', english: 'the morning', french: 'le matin' },
          { arabic: 'الثَّوْب', english: 'the garment', french: 'le vêtement' },
        ],
      },

      // Moon Letters Rule
      {
        type: 'rule',
        content: 'The 14 Moon Letters keep the [[ل]] sound clear and unchanged. You pronounce the full [[أَلْ]] before these letters. The [[ل]] shows a [[سُكُون]] (ـْ) mark.',
        contentFr: 'Les 14 lettres lunaires gardent le son [[ل]] clair et inchangé. Vous prononcez le [[أَلْ]] complet devant ces lettres. Le [[ل]] porte un signe [[سُكُون]] (ـْ).',
        arabicDescription: 'الْحُرُوف الْقَمَرِيَّة: يُظْهَرُ فِيهَا اللَّام',
        arabicTranslation: 'Moon letters: the Lam is pronounced clearly',
        arabicTranslationFr: 'Lettres lunaires : le Lam est prononcé clairement',
      },

      // Moon Letters Grid
      {
        type: 'letters_grid',
        content: 'Moon Letters 🌙',
        contentFr: 'Lettres Lunaires 🌙',
        letters: ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'هـ', 'و', 'ي'],
        letterType: 'moon',
      },

      // Moon Letter Examples
      {
        type: 'text',
        content: 'Moon Letter Examples',
        contentFr: 'Exemples de lettres lunaires',
      },
      {
        type: 'examples_grid',
        content: 'Examples with Moon Letters',
        contentFr: 'Exemples avec les lettres lunaires',
        examples: [
          { arabic: 'الْقَمَر', english: 'the moon', french: 'la lune' },
          { arabic: 'الْكِتَاب', english: 'the book', french: 'le livre' },
          { arabic: 'الْبَيْت', english: 'the house', french: 'la maison' },
          { arabic: 'الْمَاء', english: 'the water', french: 'l\'eau' },
          { arabic: 'الْوَلَد', english: 'the boy', french: 'le garçon' },
          { arabic: 'الْجَبَل', english: 'the mountain', french: 'la montagne' },
          { arabic: 'الْحَدِيقَة', english: 'the garden', french: 'le jardin' },
          { arabic: 'الْفِيل', english: 'the elephant', french: 'l\'éléphant' },
          { arabic: 'الْعَيْن', english: 'the eye', french: 'l\'oeil' },
          { arabic: 'الْيَوْم', english: 'the day', french: 'le jour' },
        ],
      },

      // Memory tip
      {
        type: 'note',
        content: 'Memory Tip: The word [[الشَّمْس]] (the sun) starts with a sun letter, and [[الْقَمَر]] (the moon) starts with a moon letter! That\'s how these letter groups got their names.',
        contentFr: 'Astuce mémoire : Le mot [[الشَّمْس]] (le soleil) commence par une lettre solaire, et [[الْقَمَر]] (la lune) commence par une lettre lunaire ! C\'est ainsi que ces groupes de lettres ont reçu leurs noms.',
        arabicDescription: 'نُسَمِّيهَا شَمْسِيَّة وَقَمَرِيَّة نِسْبَةً إِلَى الشَّمْس وَالْقَمَر',
        arabicTranslation: 'We call them sun and moon letters in reference to the sun and moon',
        arabicTranslationFr: 'On les appelle solaires et lunaires en référence au soleil et à la lune',
      },

      // Practical examples in sentences
      {
        type: 'text',
        content: 'Used in Sentences',
        contentFr: 'Utilisé dans des phrases',
      },
      {
        type: 'examples_grid',
        content: 'Practical Sentences',
        contentFr: 'Phrases pratiques',
        examples: [
          { arabic: 'الْكِتَابُ عَلَى الطَّاوِلَة', english: 'The book is on the table', french: 'Le livre est sur la table' },
          { arabic: 'الشَّمْسُ جَمِيلَة', english: 'The sun is beautiful', french: 'Le soleil est beau' },
          { arabic: 'الْوَلَدُ فِي الْبَيْت', english: 'The boy is in the house', french: 'Le garçon est dans la maison' },
          { arabic: 'الْمَاءُ بَارِد', english: 'The water is cold', french: 'L\'eau est froide' },
        ],
      },
    ],
  },

  // LESSON: Indefinite Articles & Tanween
  {
    id: 'grammar-indefinite',
    title: 'Indefinite Articles & Tanween',
    titleFr: 'Articles Indéfinis & Tanween',
    titleArabic: 'النَّكِرَة وَالتَّنْوِين',
    description: 'Learn how Arabic expresses "a/an" through the absence of ال and the beautiful system of Tanween',
    descriptionFr: 'Apprenez comment l\'arabe exprime « un/une » par l\'absence de ال et le système du Tanween',
    level: 'beginner',
    category: 'articles',
    order: 3.5,
    exercises: ['ex-grammar-indef-1', 'ex-grammar-indef-2', 'ex-grammar-indef-3'],
    content: [
      // Introduction with bilingual description
      {
        type: 'description',
        content: 'Unlike English, Arabic has [[NO separate word]] for "a" or "an"! Instead, a noun is indefinite simply by [[not having]] [[أَلْ]] (the). To emphasize indefiniteness, Arabic uses [[Tanween]] — a special "n" sound added to the end of words.',
        contentFr: 'Contrairement au français avec « un/une », l\'arabe n\'a [[PAS de mot séparé]] pour l\'article indéfini ! Un nom est indéfini simplement en [[n\'ayant pas]] [[أَلْ]] (le/la). Pour souligner l\'indéfinition, l\'arabe utilise [[Tanween]] — un son « n » spécial ajouté à la fin des mots.',
        arabicDescription: 'النَّكِرَة هِيَ الاسْم بِدُون أَلْ',
        arabicTranslation: 'Indefinite is a noun without Al',
        arabicTranslationFr: 'L\'indéfini est un nom sans Al',
      },

      // Basic concept
      {
        type: 'rule',
        content: 'Simple rule: [[Without أَلْ]] = indefinite (a/an). [[With أَلْ]] = definite (the). When you see a bare noun without أَلْ, it means "a" or "an" in English!',
        contentFr: 'Règle simple : [[Sans أَلْ]] = indéfini (un/une). [[Avec أَلْ]] = défini (le/la). Quand vous voyez un nom sans أَلْ, cela signifie « un/une » en français !',
        arabicDescription: 'بِدُون أَلْ = نَكِرَة، مَعَ أَلْ = مَعْرِفَة',
        arabicTranslation: 'Without Al = indefinite, With Al = definite',
        arabicTranslationFr: 'Sans Al = indéfini, Avec Al = défini',
      },

      // Comparison examples showing indefinite vs definite
      {
        type: 'comparison_grid',
        content: 'Indefinite vs Definite',
        contentFr: 'Indéfini vs Défini',
        leftLabel: 'Indefinite (a/an)',
        leftLabelFr: 'Indéfini (un/une)',
        rightLabel: 'Definite (the)',
        rightLabelFr: 'Défini (le/la)',
        comparisons: [
          { left: { arabic: 'كِتَاب', label: 'a book', labelFr: 'un livre' }, right: { arabic: 'الْكِتَاب', label: 'the book', labelFr: 'le livre' } },
          { left: { arabic: 'بَيْت', label: 'a house', labelFr: 'une maison' }, right: { arabic: 'الْبَيْت', label: 'the house', labelFr: 'la maison' } },
          { left: { arabic: 'وَلَد', label: 'a boy', labelFr: 'un garçon' }, right: { arabic: 'الْوَلَد', label: 'the boy', labelFr: 'le garçon' } },
          { left: { arabic: 'بِنْت', label: 'a girl', labelFr: 'une fille' }, right: { arabic: 'الْبِنْت', label: 'the girl', labelFr: 'la fille' } },
          { left: { arabic: 'سَيَّارَة', label: 'a car', labelFr: 'une voiture' }, right: { arabic: 'السَّيَّارَة', label: 'the car', labelFr: 'la voiture' } },
          { left: { arabic: 'مَدْرَسَة', label: 'a school', labelFr: 'une école' }, right: { arabic: 'الْمَدْرَسَة', label: 'the school', labelFr: 'l\'école' } },
        ],
      },

      // Tanween Introduction
      {
        type: 'text',
        content: 'What is Tanween?',
        contentFr: 'Qu\'est-ce que le Tanween ?',
      },
      {
        type: 'description',
        content: '[[Tanween]] (تَنْوِين) means "nunation" — adding an "n" sound to the end of a word. It\'s written by [[doubling]] the short vowel mark. Tanween is a clear marker that a noun is [[indefinite]].',
        contentFr: '[[Tanween]] (تَنْوِين) signifie « nunation » — ajouter un son « n » à la fin d\'un mot. Il s\'écrit en [[doublant]] le signe de voyelle courte. Le Tanween est un marqueur clair qu\'un nom est [[indéfini]].',
        arabicDescription: 'التَّنْوِين هُوَ نُون سَاكِنَة تُضَاف آخِر الاسْم',
        arabicTranslation: 'Tanween is a silent noon added to the end of a noun',
        arabicTranslationFr: 'Le Tanween est un noun silencieux ajouté à la fin d\'un nom',
      },

      // Three Types of Tanween
      {
        type: 'rule',
        content: 'There are [[THREE]] types of Tanween, each with a different sound: [[ـً]] (an), [[ـٍ]] (in), and [[ـٌ]] (un). Which one you use depends on the [[grammatical case]] of the noun.',
        contentFr: 'Il y a [[TROIS]] types de Tanween, chacun avec un son différent : [[ـً]] (an), [[ـٍ]] (in), et [[ـٌ]] (un). Celui que vous utilisez dépend du [[cas grammatical]] du nom.',
        arabicDescription: 'ثَلَاثَة أَنْوَاع: فَتْحَتَان، كَسْرَتَان، ضَمَّتَان',
        arabicTranslation: 'Three types: Fathatan, Kasratan, Dammatan',
        arabicTranslationFr: 'Trois types : Fathatan, Kasratan, Dammatan',
      },

      // Tanween Chart
      {
        type: 'table',
        content: 'Tanween Types',
        contentFr: 'Types de Tanween',
        tableData: {
          headers: ['Tanween', 'Sound', 'Written', 'Case'],
          rows: [
            ['فَتْحَتَان', '-an', 'ـًا / ـً', 'Accusative (Object)'],
            ['كَسْرَتَان', '-in', 'ـٍ', 'Genitive (After preposition)'],
            ['ضَمَّتَان', '-un', 'ـٌ', 'Nominative (Subject)'],
          ],
        },
        tableDataFr: {
          headers: ['Tanween', 'Son', 'Écrit', 'Cas'],
          rows: [
            ['فَتْحَتَان', '-an', 'ـًا / ـً', 'Accusatif (Complément)'],
            ['كَسْرَتَان', '-in', 'ـٍ', 'Génitif (Après préposition)'],
            ['ضَمَّتَان', '-un', 'ـٌ', 'Nominatif (Sujet)'],
          ],
        },
      },

      // Reassuring note about grammatical cases
      {
        type: 'note',
        content: "Don't worry if \"Nominative\", \"Accusative\", and \"Genitive\" sound confusing right now! These are grammatical cases that will be explained in detail later in the course (Lessons 31-33). For now, just focus on [[recognizing]] the three Tanween sounds and knowing they mark indefinite nouns.",
        contentFr: 'Ne vous inquiétez pas si « Nominatif », « Accusatif » et « Génitif » semblent déroutants pour l\'instant ! Ce sont des cas grammaticaux qui seront expliqués en détail plus tard dans le cours (Leçons 31-33). Pour l\'instant, concentrez-vous sur [[reconnaître]] les trois sons du Tanween et savoir qu\'ils marquent les noms indéfinis.',
        arabicDescription: 'لَا تَقْلَق! سَتَتَعَلَّم الإِعْرَاب لَاحِقًا',
        arabicTranslation: "Don't worry! You will learn grammatical cases later",
        arabicTranslationFr: 'Ne vous inquiétez pas ! Vous apprendrez les cas grammaticaux plus tard',
      },

      // Dammatan - Subject case
      {
        type: 'text',
        content: 'Dammatan (ـٌ) — Subject Case',
        contentFr: 'Dammatan (ـٌ) — Cas sujet',
      },
      {
        type: 'note',
        content: 'Use [[Dammatan]] ([[ـٌ]] = "un") when the indefinite noun is the [[subject]] of the sentence — the one doing the action.',
        contentFr: 'Utilisez [[Dammatan]] ([[ـٌ]] = « un ») quand le nom indéfini est le [[sujet]] de la phrase — celui qui fait l\'action.',
        arabicDescription: 'الضَّمَّتَان لِلْفَاعِل وَالْمُبْتَدَأ',
        arabicTranslation: 'Dammatan for the doer and subject',
        arabicTranslationFr: 'Dammatan pour l\'agent et le sujet',
      },
      {
        type: 'examples_grid',
        content: 'Dammatan Examples',
        contentFr: 'Exemples de Dammatan',
        examples: [
          { arabic: 'وَلَدٌ', english: 'a boy (subject)', french: 'un garçon (sujet)' },
          { arabic: 'كِتَابٌ', english: 'a book (subject)', french: 'un livre (sujet)' },
          { arabic: 'بَيْتٌ', english: 'a house (subject)', french: 'une maison (sujet)' },
          { arabic: 'سَيَّارَةٌ', english: 'a car (subject)', french: 'une voiture (sujet)' },
        ],
      },

      // Fathatan - Object case
      {
        type: 'text',
        content: 'Fathatan (ـًا) — Object Case',
        contentFr: 'Fathatan (ـًا) — Cas complément',
      },
      {
        type: 'note',
        content: 'Use [[Fathatan]] ([[ـً]] = "an") when the indefinite noun is the [[object]] — receiving the action. Note: Fathatan usually needs an extra [[ا]] (alif) unless the word ends in [[ة]] or [[ء]].',
        contentFr: 'Utilisez [[Fathatan]] ([[ـً]] = « an ») quand le nom indéfini est le [[complément]] — celui qui reçoit l\'action. Note : Fathatan nécessite généralement un [[ا]] (alif) supplémentaire sauf si le mot se termine par [[ة]] ou [[ء]].',
        arabicDescription: 'الْفَتْحَتَان لِلْمَفْعُول بِه',
        arabicTranslation: 'Fathatan for the object',
        arabicTranslationFr: 'Fathatan pour le complément d\'objet',
      },
      {
        type: 'examples_grid',
        content: 'Fathatan Examples',
        contentFr: 'Exemples de Fathatan',
        examples: [
          { arabic: 'كِتَابًا', english: 'a book (object)', french: 'un livre (complément)' },
          { arabic: 'بَيْتًا', english: 'a house (object)', french: 'une maison (complément)' },
          { arabic: 'قَلَمًا', english: 'a pen (object)', french: 'un stylo (complément)' },
          { arabic: 'سَيَّارَةً', english: 'a car (object) - no alif with ة', french: 'une voiture (complément) - pas d\'alif avec ة' },
        ],
      },

      // Kasratan - After prepositions
      {
        type: 'text',
        content: 'Kasratan (ـٍ) — Genitive Case',
        contentFr: 'Kasratan (ـٍ) — Cas génitif',
      },
      {
        type: 'note',
        content: 'Use [[Kasratan]] ([[ـٍ]] = "in") when the indefinite noun comes [[after a preposition]] (في، مِن، إلى، على، etc.) or is the second part of an [[Idafa]] (possession).',
        arabicDescription: 'الْكَسْرَتَان لِلاسْم الْمَجْرُور',
        arabicTranslation: 'Kasratan for nouns after prepositions',
      },
      {
        type: 'examples_grid',
        content: 'Kasratan Examples',
        examples: [
          { arabic: 'فِي بَيْتٍ', english: 'in a house' },
          { arabic: 'مِنْ كِتَابٍ', english: 'from a book' },
          { arabic: 'إِلَى مَدْرَسَةٍ', english: 'to a school' },
          { arabic: 'عَلَى طَاوِلَةٍ', english: 'on a table' },
        ],
      },

      // Comparison of all three
      {
        type: 'text',
        content: 'Same Word, Different Tanween',
      },
      {
        type: 'description',
        content: 'Watch how the SAME word changes its Tanween based on its role in the sentence:',
      },
      {
        type: 'examples_grid',
        content: 'Tanween in Action',
        examples: [
          { arabic: 'وَلَدٌ جَاءَ', english: 'A boy came (subject = ـٌ)' },
          { arabic: 'رَأَيْتُ وَلَدًا', english: 'I saw a boy (object = ـًا)' },
          { arabic: 'سَلَّمْتُ عَلَى وَلَدٍ', english: 'I greeted a boy (after prep = ـٍ)' },
        ],
      },

      // Practical sentences
      {
        type: 'text',
        content: 'Indefinite Nouns in Sentences',
      },
      {
        type: 'examples_grid',
        content: 'Practical Sentences',
        examples: [
          { arabic: 'هَذَا كِتَابٌ', english: 'This is a book' },
          { arabic: 'قَرَأْتُ كِتَابًا', english: 'I read a book' },
          { arabic: 'أَنَا فِي غُرْفَةٍ', english: 'I am in a room' },
          { arabic: 'عِنْدِي سُؤَالٌ', english: 'I have a question' },
          { arabic: 'رَأَيْتُ رَجُلًا', english: 'I saw a man' },
          { arabic: 'ذَهَبْتُ إِلَى سُوقٍ', english: 'I went to a market' },
        ],
      },

      // Memory tip
      {
        type: 'note',
        content: 'Memory Tip: Think of Tanween as saying the word with an "n" at the end — [[كِتَابٌ]] sounds like "kitaab-UN", [[كِتَابًا]] like "kitaab-AN", and [[كِتَابٍ]] like "kitaab-IN". The doubled marks show this "n" sound!',
        arabicDescription: 'التَّنْوِين صَوْت النُّون فِي آخِر الْكَلِمَة',
        arabicTranslation: 'Tanween is the sound of Noon at the end of the word',
      },
    ],
  },

  // LESSON 4: Personal Pronouns
  {
    id: 'grammar-4',
    title: 'Personal Pronouns',
    titleFr: 'Les Pronoms Personnels',
    titleArabic: 'الضَّمَائِر الشَّخْصِيَّة',
    description: 'Learn I, you, he, she, we, they in Arabic',
    descriptionFr: 'Apprenez je, tu, il, elle, nous, ils en arabe',
    level: 'beginner',
    category: 'pronouns',
    order: 4,
    exercises: ['ex-grammar-4-1', 'ex-grammar-4-2', 'ex-grammar-4-3'],
    content: [
      {
        type: 'description',
        content: 'Arabic pronouns are fascinating! Unlike English, they distinguish between [[masculine]] and [[feminine]], and have special forms for [[singular]], [[dual]] (exactly two), and [[plural]]. Mastering pronouns is your key to building sentences!',
        contentFr: 'Les pronoms arabes sont fascinants ! Comme en fran\u00e7ais, l\'arabe distingue [[masculin]] et [[f\u00e9minin]], et a des formes sp\u00e9ciales pour [[singulier]], [[duel]] (exactement deux) et [[pluriel]]. Ma\u00eetriser les pronoms est la cl\u00e9 pour construire des phrases !',
        arabicDescription: 'الضَّمَائِر أَسَاس بِنَاء الْجُمَل',
        arabicTranslation: 'Pronouns are the foundation of building sentences',
        arabicTranslationFr: 'Les pronoms sont la base de la construction des phrases',
      },
      {
        type: 'rule',
        content: 'The pronoun [[أَنَا]] (I) is gender-neutral — the same for men and women. But "you" and "they" have [[separate masculine and feminine]] forms!',
        contentFr: 'Le pronom [[أَنَا]] (je) est neutre — le m\u00eame pour les hommes et les femmes. Mais \u00ab tu/vous \u00bb et \u00ab ils/elles \u00bb ont des [[formes masculines et f\u00e9minines s\u00e9par\u00e9es]] !',
        arabicDescription: 'أَنَا لِلْمُذَكَّر وَالْمُؤَنَّث',
        arabicTranslation: '"I" is for both masculine and feminine',
        arabicTranslationFr: '\u00ab Je \u00bb est pour le masculin et le f\u00e9minin',
      },

      {
        type: 'text',
        content: 'First Person — I & We',
        contentFr: 'Premi\u00e8re personne — Je & Nous',
      },
      {
        type: 'examples_grid',
        content: 'Talking about yourself',
        contentFr: 'Parler de soi-m\u00eame',
        examples: [
          { arabic: 'أَنَا', english: 'I', french: 'Je' },
          { arabic: 'نَحْنُ', english: 'We', french: 'Nous' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with I & We',
        contentFr: 'Exemples avec Je & Nous',
        examples: [
          { arabic: 'أَنَا سَعِيدٌ', english: 'I am happy (m)', french: 'Je suis heureux (m)' },
          { arabic: 'أَنَا سَعِيدَةٌ', english: 'I am happy (f)', french: 'Je suis heureuse (f)' },
          { arabic: 'نَحْنُ هُنَا', english: 'We are here', french: 'Nous sommes ici' },
          { arabic: 'نَحْنُ مُسْلِمُونَ', english: 'We are Muslims', french: 'Nous sommes musulmans' },
        ],
      },

      {
        type: 'text',
        content: 'Second Person — You (Singular)',
        contentFr: 'Deuxi\u00e8me personne — Tu/Vous (Singulier)',
      },
      {
        type: 'examples_grid',
        content: 'Talking to one person',
        contentFr: 'Parler \u00e0 une personne',
        examples: [
          { arabic: 'أَنْتَ', english: 'You (to a man)', french: 'Tu/Vous (\u00e0 un homme)' },
          { arabic: 'أَنْتِ', english: 'You (to a woman)', french: 'Tu/Vous (\u00e0 une femme)' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with You (singular)',
        contentFr: 'Exemples avec Tu/Vous (singulier)',
        examples: [
          { arabic: 'أَنْتَ طَالِبٌ', english: 'You are a student (m)', french: 'Tu es \u00e9tudiant (m)' },
          { arabic: 'أَنْتِ طَالِبَةٌ', english: 'You are a student (f)', french: 'Tu es \u00e9tudiante (f)' },
          { arabic: 'أَنْتَ مِنْ أَيْنَ؟', english: 'Where are you from? (m)', french: 'D\'o\u00f9 es-tu ? (m)' },
          { arabic: 'أَنْتِ جَمِيلَةٌ', english: 'You are beautiful (f)', french: 'Tu es belle (f)' },
        ],
      },

      {
        type: 'text',
        content: 'Second Person — You (Plural)',
        contentFr: 'Deuxi\u00e8me personne — Vous (Pluriel)',
      },
      {
        type: 'examples_grid',
        content: 'Talking to a group',
        contentFr: 'Parler \u00e0 un groupe',
        examples: [
          { arabic: 'أَنْتُمْ', english: 'You all (to men/mixed)', french: 'Vous tous (hommes/mixte)' },
          { arabic: 'أَنْتُنَّ', english: 'You all (to women only)', french: 'Vous toutes (femmes uniquement)' },
          { arabic: 'أَنْتُمَا', english: 'You two (dual)', french: 'Vous deux (duel)' },
        ],
      },

      {
        type: 'text',
        content: 'Third Person — He & She',
        contentFr: 'Troisi\u00e8me personne — Il & Elle',
      },
      {
        type: 'examples_grid',
        content: 'Talking about someone',
        contentFr: 'Parler de quelqu\'un',
        examples: [
          { arabic: 'هُوَ', english: 'He', french: 'Il' },
          { arabic: 'هِيَ', english: 'She', french: 'Elle' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with He & She',
        contentFr: 'Exemples avec Il & Elle',
        examples: [
          { arabic: 'هُوَ طَبِيبٌ', english: 'He is a doctor', french: 'Il est m\u00e9decin' },
          { arabic: 'هِيَ طَبِيبَةٌ', english: 'She is a doctor', french: 'Elle est m\u00e9decin' },
          { arabic: 'هُوَ مِنْ مِصْرَ', english: 'He is from Egypt', french: 'Il est d\'\u00c9gypte' },
          { arabic: 'هِيَ فِي الْبَيْتِ', english: 'She is at home', french: 'Elle est \u00e0 la maison' },
        ],
      },

      {
        type: 'text',
        content: 'Third Person — They',
        contentFr: 'Troisi\u00e8me personne — Ils/Elles',
      },
      {
        type: 'examples_grid',
        content: 'Talking about a group',
        contentFr: 'Parler d\'un groupe',
        examples: [
          { arabic: 'هُمْ', english: 'They (men/mixed)', french: 'Ils (hommes/mixte)' },
          { arabic: 'هُنَّ', english: 'They (women only)', french: 'Elles (femmes uniquement)' },
          { arabic: 'هُمَا', english: 'They two (dual)', french: 'Eux/Elles deux (duel)' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with They',
        contentFr: 'Exemples avec Ils/Elles',
        examples: [
          { arabic: 'هُمْ أَصْدِقَائِي', english: 'They are my friends', french: 'Ils sont mes amis' },
          { arabic: 'هُمْ فِي الْمَدْرَسَةِ', english: 'They are at school', french: 'Ils sont \u00e0 l\'\u00e9cole' },
          { arabic: 'هُنَّ مُعَلِّمَاتٌ', english: 'They (f) are teachers', french: 'Elles sont enseignantes' },
          { arabic: 'هُمَا أَخَوَانِ', english: 'They two are brothers', french: 'Ils sont deux fr\u00e8res' },
        ],
      },

      {
        type: 'note',
        content: 'In everyday spoken Arabic, [[أَنْتُنَّ]] (you all - fem) and [[هُنَّ]] (they - fem) are rarely used. Most people use [[أَنْتُمْ]] and [[هُمْ]] for everyone!',
        contentFr: 'Dans l\'arabe parl\u00e9 au quotidien, [[أَنْتُنَّ]] (vous toutes - f\u00e9m) et [[هُنَّ]] (elles) sont rarement utilis\u00e9s. La plupart des gens utilisent [[أَنْتُمْ]] et [[هُمْ]] pour tout le monde !',
        arabicDescription: 'فِي الْعَامِّيَّة نَسْتَخْدِم أَنْتُمْ وَهُمْ لِلْجَمِيع',
        arabicTranslation: 'In colloquial Arabic, we use antum and hum for everyone',
        arabicTranslationFr: 'En arabe courant, on utilise antum et hum pour tout le monde',
      },
    ],
  },

  // LESSON 5: Noun Gender
  {
    id: 'grammar-5',
    title: 'Masculine & Feminine Nouns',
    titleFr: 'Noms Masculins & Féminins',
    titleArabic: 'الْمُذَكَّر وَالْمُؤَنَّث',
    description: 'Understand how Arabic marks gender in nouns',
    descriptionFr: 'Comprenez comment l\'arabe marque le genre des noms',
    level: 'beginner',
    category: 'nouns',
    order: 5,
    exercises: ['ex-grammar-5-1', 'ex-grammar-5-2'],
    content: [
      {
        type: 'description',
        content: 'In Arabic, every noun has a gender — either [[masculine]] (مُذَكَّر) or [[feminine]] (مُؤَنَّث). This is crucial because adjectives, verbs, and pronouns must all match the gender of the noun!',
        contentFr: 'En arabe, chaque nom a un genre — soit [[masculin]] (مُذَكَّر) soit [[f\u00e9minin]] (مُؤَنَّث). C\'est essentiel car les adjectifs, les verbes et les pronoms doivent tous s\'accorder avec le genre du nom !',
        arabicDescription: 'كُلّ اسْم إِمَّا مُذَكَّر أَوْ مُؤَنَّث',
        arabicTranslation: 'Every noun is either masculine or feminine',
        arabicTranslationFr: 'Chaque nom est soit masculin soit f\u00e9minin',
      },
      {
        type: 'rule',
        content: 'The magic letter [[ة]] (Ta Marbuta) is the key sign of feminine nouns! Most feminine words end with this special letter. It sounds like "a" at the end of a word, or "at" when followed by another word.',
        contentFr: 'La lettre magique [[ة]] (Ta Marbuta) est le signe cl\u00e9 des noms f\u00e9minins ! La plupart des mots f\u00e9minins se terminent par cette lettre sp\u00e9ciale. Elle se prononce \u00ab a \u00bb en fin de mot, ou \u00ab at \u00bb quand elle est suivie d\'un autre mot.',
        arabicDescription: 'التَّاء الْمَرْبُوطَة عَلَامَة التَّأْنِيث',
        arabicTranslation: 'Ta Marbuta is the sign of femininity',
        arabicTranslationFr: 'Le Ta Marbuta est le signe du f\u00e9minin',
      },

      {
        type: 'text',
        content: 'People — Masculine vs Feminine',
        contentFr: 'Personnes — Masculin vs F\u00e9minin',
      },
      {
        type: 'comparison_grid',
        content: 'Add ة to make feminine',
        contentFr: 'Ajoutez ة pour former le f\u00e9minin',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine',
        rightLabelFr: 'F\u00e9minin',
        comparisons: [
          { left: { arabic: 'مُعَلِّم', label: 'teacher (m)', labelFr: 'enseignant (m)' }, right: { arabic: 'مُعَلِّمَة', label: 'teacher (f)', labelFr: 'enseignante (f)' } },
          { left: { arabic: 'طَالِب', label: 'student (m)', labelFr: '\u00e9tudiant (m)' }, right: { arabic: 'طَالِبَة', label: 'student (f)', labelFr: '\u00e9tudiante (f)' } },
          { left: { arabic: 'طَبِيب', label: 'doctor (m)', labelFr: 'm\u00e9decin (m)' }, right: { arabic: 'طَبِيبَة', label: 'doctor (f)', labelFr: 'm\u00e9decin (f)' } },
          { left: { arabic: 'صَدِيق', label: 'friend (m)', labelFr: 'ami (m)' }, right: { arabic: 'صَدِيقَة', label: 'friend (f)', labelFr: 'amie (f)' } },
        ],
      },

      {
        type: 'text',
        content: 'Adjectives — Must Match Gender!',
        contentFr: 'Adjectifs — Doivent s\'accorder en genre !',
      },
      {
        type: 'comparison_grid',
        content: 'Adjectives change with gender',
        contentFr: 'Les adjectifs changent selon le genre',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine',
        rightLabelFr: 'F\u00e9minin',
        comparisons: [
          { left: { arabic: 'كَبِير', label: 'big (m)', labelFr: 'grand (m)' }, right: { arabic: 'كَبِيرَة', label: 'big (f)', labelFr: 'grande (f)' } },
          { left: { arabic: 'صَغِير', label: 'small (m)', labelFr: 'petit (m)' }, right: { arabic: 'صَغِيرَة', label: 'small (f)', labelFr: 'petite (f)' } },
          { left: { arabic: 'جَمِيل', label: 'beautiful (m)', labelFr: 'beau (m)' }, right: { arabic: 'جَمِيلَة', label: 'beautiful (f)', labelFr: 'belle (f)' } },
          { left: { arabic: 'سَعِيد', label: 'happy (m)', labelFr: 'heureux (m)' }, right: { arabic: 'سَعِيدَة', label: 'happy (f)', labelFr: 'heureuse (f)' } },
        ],
      },

      {
        type: 'text',
        content: 'Examples in Sentences',
        contentFr: 'Exemples dans des phrases',
      },
      {
        type: 'examples_grid',
        content: 'Masculine sentences',
        contentFr: 'Phrases au masculin',
        examples: [
          { arabic: 'هُوَ طَالِبٌ جَدِيدٌ', english: 'He is a new student', french: 'Il est un nouvel \u00e9tudiant' },
          { arabic: 'الْوَلَدُ كَبِيرٌ', english: 'The boy is big', french: 'Le gar\u00e7on est grand' },
          { arabic: 'الْكِتَابُ جَمِيلٌ', english: 'The book is beautiful', french: 'Le livre est beau' },
          { arabic: 'أَخِي طَبِيبٌ', english: 'My brother is a doctor', french: 'Mon fr\u00e8re est m\u00e9decin' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Feminine sentences',
        contentFr: 'Phrases au f\u00e9minin',
        examples: [
          { arabic: 'هِيَ طَالِبَةٌ جَدِيدَةٌ', english: 'She is a new student', french: 'Elle est une nouvelle \u00e9tudiante' },
          { arabic: 'الْبِنْتُ كَبِيرَةٌ', english: 'The girl is big', french: 'La fille est grande' },
          { arabic: 'الْمَدْرَسَةُ جَمِيلَةٌ', english: 'The school is beautiful', french: 'L\'\u00e9cole est belle' },
          { arabic: 'أُخْتِي طَبِيبَةٌ', english: 'My sister is a doctor', french: 'Ma s\u0153ur est m\u00e9decin' },
        ],
      },

      {
        type: 'rule',
        content: 'Some nouns are [[naturally feminine]] without [[ة]]: body parts in pairs ([[يَد]] hand, [[عَيْن]] eye, [[أُذُن]] ear), and special words like [[شَمْس]] (sun), [[أَرْض]] (earth), [[نَار]] (fire).',
        contentFr: 'Certains noms sont [[naturellement f\u00e9minins]] sans [[ة]] : les parties du corps en paires ([[يَد]] main, [[عَيْن]] \u0153il, [[أُذُن]] oreille), et des mots sp\u00e9ciaux comme [[شَمْس]] (soleil), [[أَرْض]] (terre), [[نَار]] (feu).',
        arabicDescription: 'بَعْض الْأَسْمَاء مُؤَنَّثَة بِلَا تَاء',
        arabicTranslation: 'Some nouns are feminine without Ta Marbuta',
        arabicTranslationFr: 'Certains noms sont f\u00e9minins sans Ta Marbuta',
      },

      {
        type: 'text',
        content: 'Naturally Feminine Words',
        contentFr: 'Mots naturellement f\u00e9minins',
      },
      {
        type: 'examples_grid',
        content: 'No ة but still feminine!',
        contentFr: 'Pas de ة mais toujours f\u00e9minin !',
        examples: [
          { arabic: 'الشَّمْسُ سَاطِعَةٌ', english: 'The sun is bright', french: 'Le soleil est brillant' },
          { arabic: 'الْأَرْضُ كَبِيرَةٌ', english: 'The earth is big', french: 'La terre est grande' },
          { arabic: 'النَّارُ حَارَّةٌ', english: 'The fire is hot', french: 'Le feu est chaud' },
          { arabic: 'الْيَدُ نَظِيفَةٌ', english: 'The hand is clean', french: 'La main est propre' },
          { arabic: 'الْعَيْنُ جَمِيلَةٌ', english: 'The eye is beautiful', french: 'L\'\u0153il est beau' },
          { arabic: 'الرِّيحُ قَوِيَّةٌ', english: 'The wind is strong', french: 'Le vent est fort' },
        ],
      },

      {
        type: 'note',
        content: 'Remember: When describing a feminine noun, the adjective MUST also be feminine! [[وَلَدٌ كَبِيرٌ]] (big boy) but [[بِنْتٌ كَبِيرَةٌ]] (big girl).',
        contentFr: 'Rappelez-vous : pour d\u00e9crire un nom f\u00e9minin, l\'adjectif DOIT aussi \u00eatre au f\u00e9minin ! [[وَلَدٌ كَبِيرٌ]] (grand gar\u00e7on) mais [[بِنْتٌ كَبِيرَةٌ]] (grande fille).',
        arabicDescription: 'الصِّفَة تَتْبَع الْمَوْصُوف فِي التَّذْكِير وَالتَّأْنِيث',
        arabicTranslation: 'The adjective follows the noun in gender',
        arabicTranslationFr: 'L\'adjectif suit le nom en genre',
      },
    ],
  },

  // LESSON 6: Basic Sentence Structure
  {
    id: 'grammar-6',
    title: 'Basic Sentences (Nominal)',
    titleFr: 'Phrases de Base (Nominales)',
    titleArabic: 'الْجُمْلَة الاِسْمِيَّة',
    description: 'Build your first Arabic sentences without verbs',
    descriptionFr: 'Construisez vos premières phrases arabes sans verbes',
    level: 'beginner',
    category: 'sentences',
    order: 6,
    exercises: ['ex-grammar-6-1', 'ex-grammar-6-2', 'ex-grammar-6-3'],
    content: [
      {
        type: 'description',
        content: 'Great news for beginners! Arabic has [[nominal sentences]] that don\'t need the verb "to be"! In English you say "I am a student" — in Arabic you simply say [[أَنَا طَالِبٌ]] (I student). No "am" needed!',
        contentFr: 'Bonne nouvelle pour les d\u00e9butants ! L\'arabe a des [[phrases nominales]] qui n\'ont pas besoin du verbe \u00ab \u00eatre \u00bb ! En fran\u00e7ais on dit \u00ab je suis \u00e9tudiant \u00bb — en arabe on dit simplement [[أَنَا طَالِبٌ]] (je \u00e9tudiant). Pas besoin de \u00ab suis \u00bb !',
        arabicDescription: 'الْجُمْلَة الاِسْمِيَّة لَا تَحْتَاج فِعْلًا',
        arabicTranslation: 'The nominal sentence does not need a verb',
        arabicTranslationFr: 'La phrase nominale n\'a pas besoin de verbe',
      },
      {
        type: 'rule',
        content: 'A nominal sentence has two parts: [[المُبْتَدَأ]] (subject - what you\'re talking about) + [[الخَبَر]] (predicate - what you\'re saying about it). Together they make a complete sentence!',
        contentFr: 'Une phrase nominale a deux parties : [[المُبْتَدَأ]] (sujet - ce dont on parle) + [[الخَبَر]] (pr\u00e9dicat - ce qu\'on en dit). Ensemble, ils forment une phrase compl\u00e8te !',
        arabicDescription: 'مُبْتَدَأ + خَبَر = جُمْلَة كَامِلَة',
        arabicTranslation: 'Subject + predicate = complete sentence',
        arabicTranslationFr: 'Sujet + pr\u00e9dicat = phrase compl\u00e8te',
      },

      {
        type: 'text',
        content: 'Pronoun + Noun (I am a...)',
        contentFr: 'Pronom + Nom (Je suis un/une...)',
      },
      {
        type: 'examples_grid',
        content: 'Introducing yourself',
        contentFr: 'Se pr\u00e9senter',
        examples: [
          { arabic: 'أَنَا طَالِبٌ', english: 'I am a student (m)', french: 'Je suis \u00e9tudiant (m)' },
          { arabic: 'أَنَا طَالِبَةٌ', english: 'I am a student (f)', french: 'Je suis \u00e9tudiante (f)' },
          { arabic: 'أَنَا مُعَلِّمٌ', english: 'I am a teacher (m)', french: 'Je suis enseignant (m)' },
          { arabic: 'أَنَا طَبِيبَةٌ', english: 'I am a doctor (f)', french: 'Je suis m\u00e9decin (f)' },
          { arabic: 'أَنَا مِنْ مِصْرَ', english: 'I am from Egypt', french: 'Je suis d\'\u00c9gypte' },
          { arabic: 'أَنَا عَرَبِيٌّ', english: 'I am Arab', french: 'Je suis arabe' },
        ],
      },

      {
        type: 'text',
        content: 'Pronoun + Adjective (I am...)',
        contentFr: 'Pronom + Adjectif (Je suis...)',
      },
      {
        type: 'examples_grid',
        content: 'Describing yourself',
        contentFr: 'Se d\u00e9crire',
        examples: [
          { arabic: 'أَنَا سَعِيدٌ', english: 'I am happy (m)', french: 'Je suis heureux (m)' },
          { arabic: 'أَنَا سَعِيدَةٌ', english: 'I am happy (f)', french: 'Je suis heureuse (f)' },
          { arabic: 'أَنَا جَائِعٌ', english: 'I am hungry (m)', french: 'J\'ai faim (m)' },
          { arabic: 'أَنَا تَعْبَانَةٌ', english: 'I am tired (f)', french: 'Je suis fatigu\u00e9e (f)' },
          { arabic: 'أَنَا مَشْغُولٌ', english: 'I am busy (m)', french: 'Je suis occup\u00e9 (m)' },
          { arabic: 'أَنَا بِخَيْرٍ', english: 'I am fine', french: 'Je vais bien' },
        ],
      },

      {
        type: 'text',
        content: 'He/She is...',
        contentFr: 'Il/Elle est...',
      },
      {
        type: 'examples_grid',
        content: 'Talking about others',
        contentFr: 'Parler des autres',
        examples: [
          { arabic: 'هُوَ مُعَلِّمٌ', english: 'He is a teacher', french: 'Il est enseignant' },
          { arabic: 'هِيَ طَبِيبَةٌ', english: 'She is a doctor', french: 'Elle est m\u00e9decin' },
          { arabic: 'هُوَ طَوِيلٌ', english: 'He is tall', french: 'Il est grand' },
          { arabic: 'هِيَ ذَكِيَّةٌ', english: 'She is smart', french: 'Elle est intelligente' },
          { arabic: 'هُوَ مِنَ الْمَغْرِبِ', english: 'He is from Morocco', french: 'Il est du Maroc' },
          { arabic: 'هِيَ فِي الْبَيْتِ', english: 'She is at home', french: 'Elle est \u00e0 la maison' },
        ],
      },

      {
        type: 'text',
        content: 'Noun + Adjective (The... is...)',
        contentFr: 'Nom + Adjectif (Le/La... est...)',
      },
      {
        type: 'examples_grid',
        content: 'Describing things',
        contentFr: 'D\u00e9crire des choses',
        examples: [
          { arabic: 'الْبَيْتُ كَبِيرٌ', english: 'The house is big', french: 'La maison est grande' },
          { arabic: 'الْكِتَابُ جَدِيدٌ', english: 'The book is new', french: 'Le livre est nouveau' },
          { arabic: 'الطَّقْسُ جَمِيلٌ', english: 'The weather is beautiful', french: 'Le temps est beau' },
          { arabic: 'الْقَهْوَةُ سَاخِنَةٌ', english: 'The coffee is hot', french: 'Le caf\u00e9 est chaud' },
          { arabic: 'الْمَاءُ بَارِدٌ', english: 'The water is cold', french: 'L\'eau est froide' },
          { arabic: 'السَّيَّارَةُ سَرِيعَةٌ', english: 'The car is fast', french: 'La voiture est rapide' },
        ],
      },

      {
        type: 'text',
        content: 'Noun + Location (The... is in/on/at...)',
        contentFr: 'Nom + Lieu (Le/La... est dans/sur/\u00e0...)',
      },
      {
        type: 'examples_grid',
        content: 'Saying where things are',
        contentFr: 'Dire o\u00f9 sont les choses',
        examples: [
          { arabic: 'الْكِتَابُ عَلَى الطَّاوِلَةِ', english: 'The book is on the table', french: 'Le livre est sur la table' },
          { arabic: 'الْقَلَمُ فِي الْحَقِيبَةِ', english: 'The pen is in the bag', french: 'Le stylo est dans le sac' },
          { arabic: 'الْوَلَدُ فِي الْمَدْرَسَةِ', english: 'The boy is at school', french: 'Le gar\u00e7on est \u00e0 l\'\u00e9cole' },
          { arabic: 'الْأُمُّ فِي الْمَطْبَخِ', english: 'The mother is in the kitchen', french: 'La m\u00e8re est dans la cuisine' },
          { arabic: 'السَّيَّارَةُ أَمَامَ الْبَيْتِ', english: 'The car is in front of the house', french: 'La voiture est devant la maison' },
          { arabic: 'الْمَسْجِدُ قَرِيبٌ', english: 'The mosque is nearby', french: 'La mosqu\u00e9e est proche' },
        ],
      },

      {
        type: 'note',
        content: 'Notice there\'s [[no verb "is"]] in any of these sentences! Arabic nominal sentences are simpler than English. Just put two words together and you have a sentence: [[الْبَيْتُ كَبِيرٌ]] = The-house big = The house is big!',
        contentFr: 'Remarquez qu\'il n\'y a [[pas de verbe \u00ab est \u00bb]] dans ces phrases ! Les phrases nominales arabes sont plus simples qu\'en fran\u00e7ais. Mettez juste deux mots ensemble et vous avez une phrase : [[الْبَيْتُ كَبِيرٌ]] = La-maison grande = La maison est grande !',
        arabicDescription: 'لَا نَحْتَاج فِعْل "يَكُون" فِي الْجُمْلَة الاِسْمِيَّة',
        arabicTranslation: 'We do not need the verb "to be" in nominal sentences',
        arabicTranslationFr: 'Nous n\'avons pas besoin du verbe \u00ab \u00eatre \u00bb dans les phrases nominales',
      },
    ],
  },

  // LESSON 7: Question Words
  {
    id: 'grammar-7',
    title: 'Question Words',
    titleFr: 'Les Mots Interrogatifs',
    titleArabic: 'أَدَوَات الاِسْتِفْهَام',
    description: 'Learn to ask who, what, where, when, why, and how',
    descriptionFr: 'Apprenez à demander qui, quoi, où, quand, pourquoi et comment',
    level: 'beginner',
    category: 'other',
    order: 7,
    exercises: ['ex-grammar-7-1', 'ex-grammar-7-2', 'ex-grammar-7-3'],
    content: [
      {
        type: 'description',
        content: 'Asking questions is essential for conversations! Arabic question words come at the [[beginning]] of the sentence, just like English. Master these words and you can ask about anything!',
        contentFr: 'Poser des questions est essentiel pour les conversations ! Les mots interrogatifs arabes se placent au [[d\u00e9but]] de la phrase, comme en fran\u00e7ais. Ma\u00eetrisez ces mots et vous pourrez demander n\'importe quoi !',
        arabicDescription: 'أَدَوَات الاِسْتِفْهَام تَأْتِي فِي بِدَايَة الْجُمْلَة',
        arabicTranslation: 'Question words come at the beginning of the sentence',
        arabicTranslationFr: 'Les mots interrogatifs se placent au d\u00e9but de la phrase',
      },

      {
        type: 'text',
        content: 'The Essential Question Words',
        contentFr: 'Les mots interrogatifs essentiels',
      },
      {
        type: 'examples_grid',
        content: 'Memorize these!',
        contentFr: 'M\u00e9morisez-les !',
        examples: [
          { arabic: 'مَا / مَاذَا', english: 'What?', french: 'Quoi ?' },
          { arabic: 'مَنْ', english: 'Who?', french: 'Qui ?' },
          { arabic: 'أَيْنَ', english: 'Where?', french: 'O\u00f9 ?' },
          { arabic: 'مَتَى', english: 'When?', french: 'Quand ?' },
          { arabic: 'لِمَاذَا', english: 'Why?', french: 'Pourquoi ?' },
          { arabic: 'كَيْفَ', english: 'How?', french: 'Comment ?' },
          { arabic: 'كَمْ', english: 'How many/much?', french: 'Combien ?' },
          { arabic: 'أَيّ', english: 'Which?', french: 'Quel(le) ?' },
          { arabic: 'هَلْ', english: 'Is/Are? (yes/no)', french: 'Est-ce que ? (oui/non)' },
        ],
      },

      {
        type: 'rule',
        content: '[[مَا]] and [[مَاذَا]] both mean "what" — [[مَا]] is shorter and more common in questions like "What is...?" while [[مَاذَا]] is used with verbs "What did you...?"',
        contentFr: '[[مَا]] et [[مَاذَا]] signifient tous deux \u00ab quoi \u00bb — [[مَا]] est plus court et plus courant dans les questions comme \u00ab Qu\'est-ce que... ? \u00bb tandis que [[مَاذَا]] est utilis\u00e9 avec les verbes \u00ab Qu\'as-tu... ? \u00bb',
        arabicDescription: 'مَا وَمَاذَا كِلَاهُمَا بِمَعْنَى what',
        arabicTranslation: 'Ma and Madha both mean "what"',
        arabicTranslationFr: 'Ma et Madha signifient tous deux \u00ab quoi \u00bb',
      },

      {
        type: 'text',
        content: 'مَا / مَاذَا — What?',
        contentFr: 'مَا / مَاذَا — Quoi ?',
      },
      {
        type: 'examples_grid',
        content: 'Asking "What?"',
        contentFr: 'Demander \u00ab Quoi ? \u00bb',
        examples: [
          { arabic: 'مَا اسْمُكَ؟', english: 'What is your name?', french: 'Quel est ton nom ?' },
          { arabic: 'مَا هَذَا؟', english: 'What is this?', french: 'Qu\'est-ce que c\'est ?' },
          { arabic: 'مَاذَا تُرِيدُ؟', english: 'What do you want?', french: 'Que veux-tu ?' },
          { arabic: 'مَاذَا تَفْعَلُ؟', english: 'What are you doing?', french: 'Que fais-tu ?' },
        ],
      },

      {
        type: 'text',
        content: 'مَنْ — Who?',
        contentFr: 'مَنْ — Qui ?',
      },
      {
        type: 'examples_grid',
        content: 'Asking "Who?"',
        contentFr: 'Demander \u00ab Qui ? \u00bb',
        examples: [
          { arabic: 'مَنْ هَذَا؟', english: 'Who is this?', french: 'Qui est-ce ?' },
          { arabic: 'مَنْ أَنْتَ؟', english: 'Who are you?', french: 'Qui es-tu ?' },
          { arabic: 'مَنْ مَعَكَ؟', english: 'Who is with you?', french: 'Qui est avec toi ?' },
          { arabic: 'مَنْ يَعْرِفُ؟', english: 'Who knows?', french: 'Qui sait ?' },
        ],
      },

      {
        type: 'text',
        content: 'أَيْنَ — Where?',
        contentFr: 'أَيْنَ — O\u00f9 ?',
      },
      {
        type: 'examples_grid',
        content: 'Asking "Where?"',
        contentFr: 'Demander \u00ab O\u00f9 ? \u00bb',
        examples: [
          { arabic: 'أَيْنَ أَنْتَ؟', english: 'Where are you?', french: 'O\u00f9 es-tu ?' },
          { arabic: 'أَيْنَ الْمَسْجِدُ؟', english: 'Where is the mosque?', french: 'O\u00f9 est la mosqu\u00e9e ?' },
          { arabic: 'أَيْنَ تَسْكُنُ؟', english: 'Where do you live?', french: 'O\u00f9 habites-tu ?' },
          { arabic: 'مِنْ أَيْنَ أَنْتَ؟', english: 'Where are you from?', french: 'D\'o\u00f9 es-tu ?' },
        ],
      },

      {
        type: 'text',
        content: 'كَيْفَ — How?',
        contentFr: 'كَيْفَ — Comment ?',
      },
      {
        type: 'examples_grid',
        content: 'Asking "How?"',
        contentFr: 'Demander \u00ab Comment ? \u00bb',
        examples: [
          { arabic: 'كَيْفَ حَالُكَ؟', english: 'How are you?', french: 'Comment vas-tu ?' },
          { arabic: 'كَيْفَ الْحَالُ؟', english: 'How is it going?', french: 'Comment \u00e7a va ?' },
          { arabic: 'كَيْفَ تَفْعَلُ ذَلِكَ؟', english: 'How do you do that?', french: 'Comment fais-tu cela ?' },
          { arabic: 'كَيْفَ الطَّقْسُ؟', english: 'How is the weather?', french: 'Comment est le temps ?' },
        ],
      },

      {
        type: 'text',
        content: 'مَتَى — When? / لِمَاذَا — Why?',
        contentFr: 'مَتَى — Quand ? / لِمَاذَا — Pourquoi ?',
      },
      {
        type: 'examples_grid',
        content: 'Time and reason questions',
        contentFr: 'Questions de temps et de raison',
        examples: [
          { arabic: 'مَتَى السَّفَرُ؟', english: 'When is the trip?', french: 'Quand est le voyage ?' },
          { arabic: 'مَتَى تَأْتِي؟', english: 'When are you coming?', french: 'Quand viens-tu ?' },
          { arabic: 'لِمَاذَا أَنْتَ هُنَا؟', english: 'Why are you here?', french: 'Pourquoi es-tu ici ?' },
          { arabic: 'لِمَاذَا تَبْكِي؟', english: 'Why are you crying?', french: 'Pourquoi pleures-tu ?' },
        ],
      },

      {
        type: 'text',
        content: 'هَلْ — Yes/No Questions',
        contentFr: 'هَلْ — Questions Oui/Non',
      },
      {
        type: 'rule',
        content: '[[هَلْ]] turns any statement into a yes/no question! Just add it at the beginning. Statement: أَنْتَ طَالِبٌ (You are a student) → Question: [[هَلْ]] أَنْتَ طَالِبٌ؟ (Are you a student?)',
        contentFr: '[[هَلْ]] transforme n\'importe quelle affirmation en question oui/non ! Il suffit de l\'ajouter au d\u00e9but. Affirmation : أَنْتَ طَالِبٌ (Tu es \u00e9tudiant) → Question : [[هَلْ]] أَنْتَ طَالِبٌ؟ (Es-tu \u00e9tudiant ?)',
        arabicDescription: 'هَلْ تُحَوِّل الْجُمْلَة إِلَى سُؤَال',
        arabicTranslation: 'Hal transforms the sentence into a question',
        arabicTranslationFr: 'Hal transforme la phrase en question',
      },
      {
        type: 'examples_grid',
        content: 'Yes/No questions with هَلْ',
        contentFr: 'Questions oui/non avec هَلْ',
        examples: [
          { arabic: 'هَلْ أَنْتَ مُسْلِمٌ؟', english: 'Are you Muslim?', french: 'Es-tu musulman ?' },
          { arabic: 'هَلْ تَتَكَلَّمُ الْعَرَبِيَّةَ؟', english: 'Do you speak Arabic?', french: 'Parles-tu arabe ?' },
          { arabic: 'هَلْ هَذَا صَحِيحٌ؟', english: 'Is this correct?', french: 'Est-ce correct ?' },
          { arabic: 'هَلْ فَهِمْتَ؟', english: 'Did you understand?', french: 'As-tu compris ?' },
        ],
      },

      {
        type: 'text',
        content: 'كَمْ — How many/much?',
        contentFr: 'كَمْ — Combien ?',
      },
      {
        type: 'examples_grid',
        content: 'Asking about quantity',
        contentFr: 'Demander la quantit\u00e9',
        examples: [
          { arabic: 'كَمْ عُمْرُكَ؟', english: 'How old are you?', french: 'Quel \u00e2ge as-tu ?' },
          { arabic: 'كَمِ السَّاعَةُ؟', english: 'What time is it?', french: 'Quelle heure est-il ?' },
          { arabic: 'بِكَمْ هَذَا؟', english: 'How much is this?', french: 'Combien co\u00fbte ceci ?' },
          { arabic: 'كَمْ وَلَدًا عِنْدَكَ؟', english: 'How many children do you have?', french: 'Combien d\'enfants as-tu ?' },
        ],
      },

      {
        type: 'note',
        content: 'To answer yes/no questions: [[نَعَمْ]] = Yes, [[لَا]] = No. For "How are you?" reply with [[بِخَيْرٍ الْحَمْدُ لِلَّهِ]] (Fine, praise be to God)!',
        contentFr: 'Pour r\u00e9pondre aux questions oui/non : [[نَعَمْ]] = Oui, [[لَا]] = Non. Pour \u00ab Comment vas-tu ? \u00bb r\u00e9pondez avec [[بِخَيْرٍ الْحَمْدُ لِلَّهِ]] (Bien, louange \u00e0 Dieu) !',
        arabicDescription: 'نَعَمْ = Yes ، لَا = No',
        arabicTranslation: 'Naam = Yes, La = No',
        arabicTranslationFr: 'Naam = Oui, La = Non',
      },
    ],
  },

  // LESSON 8: Demonstrative Pronouns
  {
    id: 'grammar-8',
    title: 'This & That (Demonstratives)',
    titleFr: 'Ceci & Cela (Démonstratifs)',
    titleArabic: 'أَسْمَاء الْإِشَارَة',
    description: 'Point to things using this, that, these, those',
    descriptionFr: 'Désignez les choses avec ceci, cela, ces',
    level: 'beginner',
    category: 'pronouns',
    order: 8,
    exercises: ['ex-grammar-8-1', 'ex-grammar-8-2'],
    content: [
      {
        type: 'description',
        content: 'Pointing words like "this" and "that" are called [[demonstrative pronouns]]. In Arabic, they must match the [[gender]] of the noun — masculine or feminine. Let\'s learn to point like an Arab!',
        contentFr: 'Les mots pour désigner comme "ceci" et "cela" sont appelés [[pronoms démonstratifs]]. En arabe, ils doivent correspondre au [[genre]] du nom — masculin ou féminin. Apprenons à désigner comme un Arabe !',
        arabicDescription: 'أَسْمَاء الْإِشَارَة تُطَابِق الاِسْم',
        arabicTranslation: 'Demonstrative pronouns match the noun',
        arabicTranslationFr: 'Les pronoms démonstratifs correspondent au nom',
      },

      {
        type: 'text',
        content: 'This (Near) — هَذَا / هَذِهِ',
        contentFr: 'Ceci (Proche) — هَذَا / هَذِهِ',
      },
      {
        type: 'comparison_grid',
        content: 'This for near objects',
        contentFr: 'Ceci pour les objets proches',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine',
        rightLabelFr: 'Féminin',
        comparisons: [
          { left: { arabic: 'هَذَا', label: 'this (m)', labelFr: 'ceci (m)' }, right: { arabic: 'هَذِهِ', label: 'this (f)', labelFr: 'ceci (f)' } },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with "this"',
        contentFr: 'Exemples avec "ceci"',
        examples: [
          { arabic: 'هَذَا كِتَابٌ', english: 'This is a book', french: 'C\'est un livre' },
          { arabic: 'هَذِهِ سَيَّارَةٌ', english: 'This is a car', french: 'C\'est une voiture' },
          { arabic: 'هَذَا بَيْتِي', english: 'This is my house', french: 'C\'est ma maison' },
          { arabic: 'هَذِهِ أُخْتِي', english: 'This is my sister', french: 'C\'est ma s\u0153ur' },
          { arabic: 'هَذَا جَمِيلٌ', english: 'This is beautiful (m)', french: 'C\'est beau (m)' },
          { arabic: 'هَذِهِ لَذِيذَةٌ', english: 'This is delicious (f)', french: 'C\'est délicieux (f)' },
        ],
      },

      {
        type: 'text',
        content: 'That (Far) — ذَلِكَ / تِلْكَ',
        contentFr: 'Cela (Loin) — ذَلِكَ / تِلْكَ',
      },
      {
        type: 'comparison_grid',
        content: 'That for far objects',
        contentFr: 'Cela pour les objets éloignés',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine',
        rightLabelFr: 'Féminin',
        comparisons: [
          { left: { arabic: 'ذَلِكَ', label: 'that (m)', labelFr: 'cela (m)' }, right: { arabic: 'تِلْكَ', label: 'that (f)', labelFr: 'cela (f)' } },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with "that"',
        contentFr: 'Exemples avec "cela"',
        examples: [
          { arabic: 'ذَلِكَ الرَّجُلُ', english: 'That man', french: 'Cet homme' },
          { arabic: 'تِلْكَ الْمَرْأَةُ', english: 'That woman', french: 'Cette femme' },
          { arabic: 'ذَلِكَ الْمَسْجِدُ', english: 'That mosque', french: 'Cette mosquée' },
          { arabic: 'تِلْكَ الْمَدْرَسَةُ', english: 'That school', french: 'Cette école' },
          { arabic: 'ذَلِكَ صَحِيحٌ', english: 'That is correct', french: 'C\'est correct' },
          { arabic: 'تِلْكَ فِكْرَةٌ جَيِّدَةٌ', english: 'That is a good idea', french: 'C\'est une bonne idée' },
        ],
      },

      {
        type: 'text',
        content: 'These & Those (Plural)',
        contentFr: 'Ceux-ci & Ceux-là (Pluriel)',
      },
      {
        type: 'examples_grid',
        content: 'Plural demonstratives',
        contentFr: 'Démonstratifs pluriels',
        examples: [
          { arabic: 'هَؤُلَاءِ', english: 'These (people)', french: 'Ceux-ci (personnes)' },
          { arabic: 'أُولَئِكَ', english: 'Those (people)', french: 'Ceux-là (personnes)' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with plural',
        contentFr: 'Exemples avec le pluriel',
        examples: [
          { arabic: 'هَؤُلَاءِ طُلَّابٌ', english: 'These are students', french: 'Ce sont des étudiants' },
          { arabic: 'هَؤُلَاءِ أَصْدِقَائِي', english: 'These are my friends', french: 'Ce sont mes amis' },
          { arabic: 'أُولَئِكَ مُعَلِّمُونَ', english: 'Those are teachers', french: 'Ce sont des enseignants' },
          { arabic: 'أُولَئِكَ النَّاسُ', english: 'Those people', french: 'Ces gens-là' },
        ],
      },

      {
        type: 'rule',
        content: 'When pointing to a definite noun (with [[ال]]), the demonstrative comes [[BEFORE]] the noun: [[هَذَا الْكِتَابُ]] (this book), [[تِلْكَ السَّيَّارَةُ]] (that car).',
        contentFr: 'Lorsqu\'on désigne un nom défini (avec [[ال]]), le démonstratif vient [[AVANT]] le nom : [[هَذَا الْكِتَابُ]] (ce livre), [[تِلْكَ السَّيَّارَةُ]] (cette voiture).',
        arabicDescription: 'اسْم الْإِشَارَة يَأْتِي قَبْل الاِسْم الْمُعَرَّف',
        arabicTranslation: 'The demonstrative comes before the definite noun',
        arabicTranslationFr: 'Le démonstratif vient avant le nom défini',
      },

      {
        type: 'examples_grid',
        content: 'Demonstrative + Definite Noun',
        examples: [
          { arabic: 'هَذَا الْوَلَدُ', english: 'This boy' },
          { arabic: 'هَذِهِ الْبِنْتُ', english: 'This girl' },
          { arabic: 'ذَلِكَ الْكِتَابُ', english: 'That book' },
          { arabic: 'تِلْكَ الْغُرْفَةُ', english: 'That room' },
        ],
      },

      {
        type: 'note',
        content: 'Remember: [[هَذَا/ذَلِكَ]] for masculine nouns, [[هَذِهِ/تِلْكَ]] for feminine nouns. The plural forms [[هَؤُلَاءِ/أُولَئِكَ]] are used for people only!',
        arabicDescription: 'هَؤُلَاءِ وَأُولَئِكَ لِلْعُقَلَاء فَقَط',
        arabicTranslation: 'Ha\'ulai and Ulaika are for people only',
      },
    ],
  },

  // LESSON 9: Possessive Pronouns
  {
    id: 'grammar-9',
    title: 'Possessive Pronouns (My, Your, His)',
    titleFr: 'Pronoms Possessifs (Mon, Ton, Son)',
    titleArabic: 'ضَمَائِر الْمِلْكِيَّة',
    description: 'Express ownership: my book, your house, her car',
    descriptionFr: 'Exprimez la possession : mon livre, ta maison, sa voiture',
    level: 'beginner',
    category: 'pronouns',
    order: 9,
    exercises: ['ex-grammar-9-1', 'ex-grammar-9-2', 'ex-grammar-9-3'],
    content: [
      {
        type: 'description',
        content: 'In Arabic, possessive pronouns are [[suffixes]] — they attach to the end of nouns! Instead of saying "my book", you say [[كِتَابِي]] (book-my). This is one of Arabic\'s elegant features!',
        contentFr: 'En arabe, les pronoms possessifs sont des [[suffixes]] — ils se rattachent à la fin des noms ! Au lieu de dire « mon livre », on dit [[كِتَابِي]] (livre-mon). C\'est l\'une des caractéristiques élégantes de l\'arabe !',
        arabicDescription: 'ضَمَائِر الْمِلْكِيَّة تَتَّصِل بِآخِر الاِسْم',
        arabicTranslation: 'Possessive pronouns attach to the end of nouns',
        arabicTranslationFr: 'Les pronoms possessifs se rattachent à la fin des noms',
      },

      {
        type: 'rule',
        content: 'When adding a possessive suffix, you [[remove]] the [[ال]] if present. So [[الْكِتَابُ]] (the book) becomes [[كِتَابِي]] (my book), NOT الْكِتَابِي.',
        contentFr: 'Lorsqu\'on ajoute un suffixe possessif, on [[supprime]] le [[ال]] s\'il est présent. Ainsi [[الْكِتَابُ]] (le livre) devient [[كِتَابِي]] (mon livre), et NON الْكِتَابِي.',
        arabicDescription: 'نَحْذِف ال عِنْد إِضَافَة ضَمِير الْمِلْكِيَّة',
        arabicTranslation: 'We remove Al when adding a possessive pronoun',
        arabicTranslationFr: 'On supprime Al lorsqu\'on ajoute un pronom possessif',
      },

      {
        type: 'text',
        content: 'My — ـِي',
        contentFr: 'Mon/Ma — ـِي',
      },
      {
        type: 'examples_grid',
        content: 'Examples with "my"',
        contentFr: 'Exemples avec « mon/ma »',
        examples: [
          { arabic: 'كِتَابِي', english: 'my book', french: 'mon livre' },
          { arabic: 'بَيْتِي', english: 'my house', french: 'ma maison' },
          { arabic: 'اسْمِي', english: 'my name', french: 'mon nom' },
          { arabic: 'أُمِّي', english: 'my mother', french: 'ma mère' },
          { arabic: 'أَبِي', english: 'my father', french: 'mon père' },
          { arabic: 'صَدِيقِي', english: 'my friend', french: 'mon ami' },
        ],
      },

      {
        type: 'text',
        content: 'Your — ـكَ (m) / ـكِ (f)',
        contentFr: 'Ton/Ta — ـكَ (m) / ـكِ (f)',
      },
      {
        type: 'examples_grid',
        content: 'Examples with "your"',
        contentFr: 'Exemples avec « ton/ta »',
        examples: [
          { arabic: 'كِتَابُكَ', english: 'your book (to m)', french: 'ton livre (à un homme)' },
          { arabic: 'كِتَابُكِ', english: 'your book (to f)', french: 'ton livre (à une femme)' },
          { arabic: 'اسْمُكَ', english: 'your name (to m)', french: 'ton nom (à un homme)' },
          { arabic: 'اسْمُكِ', english: 'your name (to f)', french: 'ton nom (à une femme)' },
          { arabic: 'بَيْتُكَ', english: 'your house (to m)', french: 'ta maison (à un homme)' },
          { arabic: 'سَيَّارَتُكِ', english: 'your car (to f)', french: 'ta voiture (à une femme)' },
        ],
      },

      {
        type: 'text',
        content: 'His — ـهُ / Her — ـهَا',
        contentFr: 'Son/Sa (à lui) — ـهُ / Son/Sa (à elle) — ـهَا',
      },
      {
        type: 'examples_grid',
        content: 'Examples with "his/her"',
        contentFr: 'Exemples avec « son/sa (à lui/elle) »',
        examples: [
          { arabic: 'كِتَابُهُ', english: 'his book', french: 'son livre (à lui)' },
          { arabic: 'كِتَابُهَا', english: 'her book', french: 'son livre (à elle)' },
          { arabic: 'اسْمُهُ أَحْمَدُ', english: 'His name is Ahmad', french: 'Son nom est Ahmad' },
          { arabic: 'اسْمُهَا فَاطِمَةُ', english: 'Her name is Fatima', french: 'Son nom est Fatima' },
          { arabic: 'سَيَّارَتُهُ جَدِيدَةٌ', english: 'His car is new', french: 'Sa voiture est neuve' },
          { arabic: 'بَيْتُهَا كَبِيرٌ', english: 'Her house is big', french: 'Sa maison est grande' },
        ],
      },

      {
        type: 'text',
        content: 'Our — ـنَا / Their — ـهُمْ',
        contentFr: 'Notre — ـنَا / Leur — ـهُمْ',
      },
      {
        type: 'examples_grid',
        content: 'Examples with "our/their"',
        contentFr: 'Exemples avec « notre/leur »',
        examples: [
          { arabic: 'بَيْتُنَا', english: 'our house', french: 'notre maison' },
          { arabic: 'مَدْرَسَتُنَا', english: 'our school', french: 'notre école' },
          { arabic: 'بَلَدُنَا', english: 'our country', french: 'notre pays' },
          { arabic: 'كِتَابُهُمْ', english: 'their book', french: 'leur livre' },
          { arabic: 'سَيَّارَتُهُمْ', english: 'their car', french: 'leur voiture' },
          { arabic: 'أَوْلَادُهُمْ', english: 'their children', french: 'leurs enfants' },
        ],
      },

      {
        type: 'text',
        content: 'Family Members with Possessives',
        contentFr: 'Membres de la famille avec les possessifs',
      },
      {
        type: 'examples_grid',
        content: 'Common family expressions',
        contentFr: 'Expressions familiales courantes',
        examples: [
          { arabic: 'أَبِي وَأُمِّي', english: 'my father and mother', french: 'mon père et ma mère' },
          { arabic: 'أَخِي الْكَبِيرُ', english: 'my older brother', french: 'mon grand frère' },
          { arabic: 'أُخْتِي الصَّغِيرَةُ', english: 'my younger sister', french: 'ma petite sœur' },
          { arabic: 'جَدِّي وَجَدَّتِي', english: 'my grandfather and grandmother', french: 'mon grand-père et ma grand-mère' },
          { arabic: 'عَمِّي', english: 'my paternal uncle', french: 'mon oncle paternel' },
          { arabic: 'خَالَتِي', english: 'my maternal aunt', french: 'ma tante maternelle' },
        ],
      },

      {
        type: 'note',
        content: 'All possessive suffixes summary: [[ـِي]] (my), [[ـكَ]] (your-m), [[ـكِ]] (your-f), [[ـهُ]] (his), [[ـهَا]] (her), [[ـنَا]] (our), [[ـكُمْ]] (your-pl), [[ـهُمْ]] (their).',
        contentFr: 'Résumé de tous les suffixes possessifs : [[ـِي]] (mon/ma), [[ـكَ]] (ton-m), [[ـكِ]] (ton-f), [[ـهُ]] (son-à lui), [[ـهَا]] (son-à elle), [[ـنَا]] (notre), [[ـكُمْ]] (votre-pl), [[ـهُمْ]] (leur).',
        arabicDescription: 'ي - كَ - كِ - هُ - هَا - نَا - كُمْ - هُمْ',
        arabicTranslation: 'My - Your(m) - Your(f) - His - Her - Our - Your(pl) - Their',
        arabicTranslationFr: 'Mon - Ton(m) - Ton(f) - Son(lui) - Son(elle) - Notre - Votre(pl) - Leur',
      },
    ],
  },

  // LESSON 10: Prepositions
  {
    id: 'grammar-10',
    title: 'Common Prepositions',
    titleFr: 'Prépositions Courantes',
    titleArabic: 'حُرُوف الْجَرّ',
    description: 'Learn in, on, from, to, with and other prepositions',
    descriptionFr: 'Apprenez dans, sur, de, à, avec et autres prépositions',
    level: 'beginner',
    category: 'other',
    order: 10,
    exercises: ['ex-grammar-10-1', 'ex-grammar-10-2'],
    content: [
      {
        type: 'description',
        content: 'Prepositions are essential connecting words! They tell us [[where]], [[when]], and [[how]] things relate to each other. In Arabic, they\'re called [[حُرُوف الْجَرّ]] (particles of pulling) because they "pull" the noun into the genitive case.',
        contentFr: 'Les prépositions sont des mots de liaison essentiels ! Elles nous indiquent [[où]], [[quand]] et [[comment]] les choses sont liées entre elles. En arabe, on les appelle [[حُرُوف الْجَرّ]] (particules de traction) car elles « tirent » le nom au cas génitif.',
        arabicDescription: 'حُرُوف الْجَرّ تَرْبِط الْكَلِمَات',
        arabicTranslation: 'Prepositions connect words',
        arabicTranslationFr: 'Les prépositions relient les mots',
      },

      {
        type: 'text',
        content: 'Essential Prepositions',
        contentFr: 'Prépositions essentielles',
      },
      {
        type: 'examples_grid',
        content: 'The most common ones',
        contentFr: 'Les plus courantes',
        examples: [
          { arabic: 'فِي', english: 'in', french: 'dans' },
          { arabic: 'عَلَى', english: 'on', french: 'sur' },
          { arabic: 'مِنْ', english: 'from', french: 'de' },
          { arabic: 'إِلَى', english: 'to', french: 'à/vers' },
          { arabic: 'مَعَ', english: 'with', french: 'avec' },
          { arabic: 'عِنْدَ', english: 'at/have', french: 'chez/avoir' },
          { arabic: 'بِـ', english: 'with/by', french: 'avec/par' },
          { arabic: 'لِـ', english: 'for/to', french: 'pour/à' },
          { arabic: 'عَنْ', english: 'about', french: 'à propos de' },
        ],
      },

      {
        type: 'text',
        content: 'فِي — In',
        contentFr: 'فِي — Dans',
      },
      {
        type: 'examples_grid',
        content: 'Examples with فِي',
        contentFr: 'Exemples avec فِي',
        examples: [
          { arabic: 'أَنَا فِي الْبَيْتِ', english: 'I am in the house', french: 'Je suis dans la maison' },
          { arabic: 'الْكِتَابُ فِي الْحَقِيبَةِ', english: 'The book is in the bag', french: 'Le livre est dans le sac' },
          { arabic: 'هُوَ فِي الْمَدْرَسَةِ', english: 'He is in school', french: 'Il est à l\'école' },
          { arabic: 'نَحْنُ فِي السَّيَّارَةِ', english: 'We are in the car', french: 'Nous sommes dans la voiture' },
        ],
      },

      {
        type: 'text',
        content: 'عَلَى — On',
        contentFr: 'عَلَى — Sur',
      },
      {
        type: 'examples_grid',
        content: 'Examples with عَلَى',
        contentFr: 'Exemples avec عَلَى',
        examples: [
          { arabic: 'الْكِتَابُ عَلَى الطَّاوِلَةِ', english: 'The book is on the table', french: 'Le livre est sur la table' },
          { arabic: 'الصُّورَةُ عَلَى الْحَائِطِ', english: 'The picture is on the wall', french: 'L\'image est sur le mur' },
          { arabic: 'الْقَلَمُ عَلَى الْمَكْتَبِ', english: 'The pen is on the desk', french: 'Le stylo est sur le bureau' },
          { arabic: 'السَّلَامُ عَلَيْكُمْ', english: 'Peace be upon you', french: 'Que la paix soit sur vous' },
        ],
      },

      {
        type: 'text',
        content: 'مِنْ — From / إِلَى — To',
        contentFr: 'مِنْ — De / إِلَى — Vers',
      },
      {
        type: 'examples_grid',
        content: 'Movement and origin',
        contentFr: 'Mouvement et origine',
        examples: [
          { arabic: 'أَنَا مِنْ مِصْرَ', english: 'I am from Egypt', french: 'Je suis d\'Égypte' },
          { arabic: 'ذَهَبْتُ إِلَى الْمَدْرَسَةِ', english: 'I went to school', french: 'Je suis allé à l\'école' },
          { arabic: 'مِنَ الصَّبَاحِ إِلَى الْمَسَاءِ', english: 'From morning to evening', french: 'Du matin au soir' },
          { arabic: 'سَافَرْتُ مِنْ مَكَّةَ إِلَى الْمَدِينَةِ', english: 'I traveled from Mecca to Medina', french: 'J\'ai voyagé de La Mecque à Médine' },
        ],
      },

      {
        type: 'text',
        content: 'Position Words',
        contentFr: 'Mots de position',
      },
      {
        type: 'examples_grid',
        content: 'Location prepositions',
        contentFr: 'Prépositions de lieu',
        examples: [
          { arabic: 'تَحْتَ', english: 'under', french: 'sous' },
          { arabic: 'فَوْقَ', english: 'above', french: 'au-dessus' },
          { arabic: 'أَمَامَ', english: 'in front of', french: 'devant' },
          { arabic: 'وَرَاءَ', english: 'behind', french: 'derrière' },
          { arabic: 'بَيْنَ', english: 'between', french: 'entre' },
          { arabic: 'بِجَانِبِ', english: 'beside', french: 'à côté de' },
        ],
      },
      {
        type: 'examples_grid',
        content: 'Examples with position words',
        contentFr: 'Exemples avec les mots de position',
        examples: [
          { arabic: 'الْقِطَّةُ تَحْتَ السَّرِيرِ', english: 'The cat is under the bed', french: 'Le chat est sous le lit' },
          { arabic: 'الطَّائِرَةُ فَوْقَ السَّحَابِ', english: 'The plane is above the clouds', french: 'L\'avion est au-dessus des nuages' },
          { arabic: 'الْمَسْجِدُ أَمَامَ الْبَيْتِ', english: 'The mosque is in front of the house', french: 'La mosquée est devant la maison' },
          { arabic: 'الْحَدِيقَةُ وَرَاءَ الْمَدْرَسَةِ', english: 'The garden is behind the school', french: 'Le jardin est derrière l\'école' },
        ],
      },

      {
        type: 'text',
        content: 'عِنْدَ — At/Have (Possession)',
        contentFr: 'عِنْدَ — Chez/Avoir (Possession)',
      },
      {
        type: 'rule',
        content: '[[عِنْدَ]] is special — it means "at" but is also used for [[possession]]: عِنْدِي = "at me" = "I have". This is how you say "I have" in Arabic!',
        contentFr: '[[عِنْدَ]] est spécial — il signifie « chez » mais est aussi utilisé pour la [[possession]] : عِنْدِي = « chez moi » = « j\'ai ». C\'est ainsi qu\'on dit « j\'ai » en arabe !',
        arabicDescription: 'عِنْدِي تَعْنِي "أَمْلِكُ"',
        arabicTranslation: '"I have" means "I possess"',
        arabicTranslationFr: '« J\'ai » signifie « je possède »',
      },
      {
        type: 'examples_grid',
        content: 'Expressing possession with عِنْدَ',
        contentFr: 'Exprimer la possession avec عِنْدَ',
        examples: [
          { arabic: 'عِنْدِي كِتَابٌ', english: 'I have a book', french: 'J\'ai un livre' },
          { arabic: 'عِنْدَكَ سُؤَالٌ؟', english: 'Do you have a question?', french: 'As-tu une question ?' },
          { arabic: 'عِنْدَهُ سَيَّارَةٌ', english: 'He has a car', french: 'Il a une voiture' },
          { arabic: 'عِنْدَهَا ثَلَاثَةُ أَوْلَادٍ', english: 'She has three children', french: 'Elle a trois enfants' },
          { arabic: 'عِنْدَنَا وَقْتٌ', english: 'We have time', french: 'Nous avons du temps' },
          { arabic: 'عِنْدَهُمْ بَيْتٌ كَبِيرٌ', english: 'They have a big house', french: 'Ils ont une grande maison' },
        ],
      },

      {
        type: 'note',
        content: 'The attached prepositions [[بِـ]] (with/by) and [[لِـ]] (for/to) connect directly to the next word: [[بِسْمِ اللهِ]] (in the name of Allah), [[لِلَّهِ]] (for/to Allah).',
        contentFr: 'Les prépositions attachées [[بِـ]] (avec/par) et [[لِـ]] (pour/à) se lient directement au mot suivant : [[بِسْمِ اللهِ]] (au nom d\'Allah), [[لِلَّهِ]] (pour/à Allah).',
        arabicDescription: 'بِـ وَلِـ تَتَّصِل بِالْكَلِمَة',
        arabicTranslation: 'Bi and Li attach to the word',
        arabicTranslationFr: 'Bi et Li se rattachent au mot',
      },
    ],
  },

  // LESSON 11: Adjectives Agreement
  {
    id: 'grammar-11',
    title: 'Adjectives (Agreement)',
    titleFr: 'Les Adjectifs (Accord)',
    titleArabic: 'الصِّفَات',
    description: 'Learn how adjectives match nouns in gender and definiteness',
    descriptionFr: 'Apprenez comment les adjectifs s\'accordent avec les noms en genre et définition',
    level: 'beginner',
    category: 'adjectives',
    order: 11,
    exercises: ['ex-grammar-11-1', 'ex-grammar-11-2', 'ex-grammar-11-3'],
    content: [
      {
        type: 'description',
        content: 'Arabic adjectives are loyal followers — they [[match]] their nouns in everything! Gender, definiteness, number, and case. The adjective always comes [[AFTER]] the noun it describes.',
        contentFr: 'Les adjectifs arabes sont de fidèles suiveurs — ils [[s\'accordent]] avec leurs noms en tout ! Genre, définition, nombre et cas. L\'adjectif vient toujours [[APRÈS]] le nom qu\'il décrit.',
        arabicDescription: 'الصِّفَة تَتْبَع الْمَوْصُوف',
        arabicTranslation: 'The adjective follows the described noun',
        arabicTranslationFr: 'L\'adjectif suit le nom décrit',
      },

      {
        type: 'rule',
        content: 'Two main rules: 1) If noun is [[feminine]], adjective gets [[ة]]. 2) If noun has [[ال]], adjective gets [[ال]] too!',
        contentFr: 'Deux règles principales : 1) Si le nom est [[féminin]], l\'adjectif prend [[ة]]. 2) Si le nom a [[ال]], l\'adjectif prend [[ال]] aussi !',
        arabicDescription: 'الصِّفَة تُطَابِق الْمَوْصُوف فِي التَّذْكِير وَالتَّعْرِيف',
        arabicTranslation: 'The adjective matches the noun in gender and definiteness',
        arabicTranslationFr: 'L\'adjectif s\'accorde avec le nom en genre et en définition',
      },

      {
        type: 'text',
        content: 'Common Adjectives — Masculine & Feminine',
        contentFr: 'Adjectifs Courants — Masculin & Féminin',
      },
      {
        type: 'comparison_grid',
        content: 'Add ة for feminine',
        contentFr: 'Ajouter ة pour le féminin',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine',
        rightLabelFr: 'Féminin',
        comparisons: [
          { left: { arabic: 'كَبِير', label: 'big', labelFr: 'grand' }, right: { arabic: 'كَبِيرَة', label: 'big', labelFr: 'grande' } },
          { left: { arabic: 'صَغِير', label: 'small', labelFr: 'petit' }, right: { arabic: 'صَغِيرَة', label: 'small', labelFr: 'petite' } },
          { left: { arabic: 'جَمِيل', label: 'beautiful', labelFr: 'beau' }, right: { arabic: 'جَمِيلَة', label: 'beautiful', labelFr: 'belle' } },
          { left: { arabic: 'جَدِيد', label: 'new', labelFr: 'nouveau' }, right: { arabic: 'جَدِيدَة', label: 'new', labelFr: 'nouvelle' } },
        ],
      },

      {
        type: 'examples_grid',
        content: 'More adjective pairs',
        contentFr: 'Autres paires d\'adjectifs',
        examples: [
          { arabic: 'طَوِيل / طَوِيلَة', english: 'tall/long', french: 'grand/longue' },
          { arabic: 'قَصِير / قَصِيرَة', english: 'short', french: 'court(e)' },
          { arabic: 'سَهْل / سَهْلَة', english: 'easy', french: 'facile' },
          { arabic: 'صَعْب / صَعْبَة', english: 'difficult', french: 'difficile' },
          { arabic: 'سَرِيع / سَرِيعَة', english: 'fast', french: 'rapide' },
          { arabic: 'بَطِيء / بَطِيئَة', english: 'slow', french: 'lent(e)' },
          { arabic: 'حَارّ / حَارَّة', english: 'hot', french: 'chaud(e)' },
          { arabic: 'بَارِد / بَارِدَة', english: 'cold', french: 'froid(e)' },
        ],
      },

      {
        type: 'text',
        content: 'Indefinite (without ال)',
        contentFr: 'Indéfini (sans ال)',
      },
      {
        type: 'examples_grid',
        content: 'A big house, a new car...',
        contentFr: 'Une grande maison, une nouvelle voiture...',
        examples: [
          { arabic: 'بَيْتٌ كَبِيرٌ', english: 'a big house', french: 'une grande maison' },
          { arabic: 'سَيَّارَةٌ جَدِيدَةٌ', english: 'a new car', french: 'une nouvelle voiture' },
          { arabic: 'كِتَابٌ جَمِيلٌ', english: 'a beautiful book', french: 'un beau livre' },
          { arabic: 'مَدْرَسَةٌ كَبِيرَةٌ', english: 'a big school', french: 'une grande école' },
          { arabic: 'وَلَدٌ طَوِيلٌ', english: 'a tall boy', french: 'un garçon grand' },
          { arabic: 'بِنْتٌ ذَكِيَّةٌ', english: 'a smart girl', french: 'une fille intelligente' },
        ],
      },

      {
        type: 'text',
        content: 'Definite (with ال on BOTH)',
        contentFr: 'Défini (avec ال sur LES DEUX)',
      },
      {
        type: 'examples_grid',
        content: 'The big house, the new car...',
        contentFr: 'La grande maison, la nouvelle voiture...',
        examples: [
          { arabic: 'الْبَيْتُ الْكَبِيرُ', english: 'the big house', french: 'la grande maison' },
          { arabic: 'السَّيَّارَةُ الْجَدِيدَةُ', english: 'the new car', french: 'la nouvelle voiture' },
          { arabic: 'الْكِتَابُ الْجَمِيلُ', english: 'the beautiful book', french: 'le beau livre' },
          { arabic: 'الْمَدْرَسَةُ الْكَبِيرَةُ', english: 'the big school', french: 'la grande école' },
          { arabic: 'الْوَلَدُ الطَّوِيلُ', english: 'the tall boy', french: 'le garçon grand' },
          { arabic: 'الْبِنْتُ الذَّكِيَّةُ', english: 'the smart girl', french: 'la fille intelligente' },
        ],
      },

      {
        type: 'text',
        content: 'Multiple Adjectives',
        contentFr: 'Adjectifs Multiples',
      },
      {
        type: 'examples_grid',
        content: 'You can stack adjectives!',
        contentFr: 'Vous pouvez enchaîner les adjectifs !',
        examples: [
          { arabic: 'بَيْتٌ كَبِيرٌ جَمِيلٌ', english: 'a big beautiful house', french: 'une grande belle maison' },
          { arabic: 'سَيَّارَةٌ جَدِيدَةٌ سَرِيعَةٌ', english: 'a new fast car', french: 'une nouvelle voiture rapide' },
          { arabic: 'الْوَلَدُ الطَّوِيلُ الذَّكِيُّ', english: 'the tall smart boy', french: 'le garçon grand et intelligent' },
          { arabic: 'الْبِنْتُ الصَّغِيرَةُ الْجَمِيلَةُ', english: 'the small beautiful girl', french: 'la petite belle fille' },
        ],
      },

      {
        type: 'note',
        content: 'Warning: If only the noun has [[ال]] but not the adjective, it becomes a [[sentence]]! [[الْبَيْتُ كَبِيرٌ]] = The house IS big (a sentence). [[الْبَيْتُ الْكَبِيرُ]] = The big house (a phrase).',
        contentFr: 'Attention : Si seul le nom a [[ال]] mais pas l\'adjectif, cela devient une [[phrase]] ! [[الْبَيْتُ كَبِيرٌ]] = La maison EST grande (une phrase). [[الْبَيْتُ الْكَبِيرُ]] = La grande maison (un groupe nominal).',
        arabicDescription: 'إِذَا كَانَ الْمَوْصُوف مُعَرَّفًا وَالصِّفَة نَكِرَة = جُمْلَة',
        arabicTranslation: 'If the noun is definite and the adjective is indefinite = a sentence',
        arabicTranslationFr: 'Si le nom est défini et l\'adjectif est indéfini = une phrase',
      },
    ],
  },

  // LESSON 12: Numbers with Nouns
  {
    id: 'grammar-12',
    title: 'Numbers with Nouns',
    titleFr: 'Les Nombres avec les Noms',
    titleArabic: 'الْأَعْدَاد مَعَ الْأَسْمَاء',
    description: 'Learn how to count things in Arabic',
    descriptionFr: 'Apprenez à compter les choses en arabe',
    level: 'beginner',
    category: 'nouns',
    order: 12,
    exercises: ['ex-grammar-12-1', 'ex-grammar-12-2'],
    content: [
      {
        type: 'description',
        content: 'Counting in Arabic has unique rules that might seem strange at first! The noun form changes based on the number, and sometimes the number\'s gender is [[opposite]] to the noun. Let\'s master the basics!',
        contentFr: 'Compter en arabe a des règles uniques qui peuvent sembler étranges au début ! La forme du nom change selon le nombre, et parfois le genre du nombre est [[opposé]] à celui du nom. Maîtrisons les bases !',
        arabicDescription: 'الْأَعْدَاد لَهَا قَوَاعِد خَاصَّة',
        arabicTranslation: 'Numbers have special rules',
        arabicTranslationFr: 'Les nombres ont des règles spéciales',
      },

      {
        type: 'text',
        content: 'Numbers 1-10',
        contentFr: 'Les Nombres 1-10',
      },
      {
        type: 'examples_grid',
        content: 'Basic numbers',
        contentFr: 'Nombres de base',
        examples: [
          { arabic: 'وَاحِد', english: '1 - one', french: '1 - un' },
          { arabic: 'اِثْنَان', english: '2 - two', french: '2 - deux' },
          { arabic: 'ثَلَاثَة', english: '3 - three', french: '3 - trois' },
          { arabic: 'أَرْبَعَة', english: '4 - four', french: '4 - quatre' },
          { arabic: 'خَمْسَة', english: '5 - five', french: '5 - cinq' },
          { arabic: 'سِتَّة', english: '6 - six', french: '6 - six' },
          { arabic: 'سَبْعَة', english: '7 - seven', french: '7 - sept' },
          { arabic: 'ثَمَانِيَة', english: '8 - eight', french: '8 - huit' },
          { arabic: 'تِسْعَة', english: '9 - nine', french: '9 - neuf' },
          { arabic: 'عَشَرَة', english: '10 - ten', french: '10 - dix' },
        ],
      },

      {
        type: 'rule',
        content: 'Numbers [[1-2]]: Come AFTER the noun and match its gender. [[كِتَابٌ وَاحِدٌ]] (one book - masc.), [[سَيَّارَةٌ وَاحِدَةٌ]] (one car - fem.).',
        contentFr: 'Les nombres [[1-2]] : Viennent APRÈS le nom et s\'accordent en genre. [[كِتَابٌ وَاحِدٌ]] (un livre - masc.), [[سَيَّارَةٌ وَاحِدَةٌ]] (une voiture - fém.).',
        arabicDescription: 'وَاحِد وَاثْنَان يَتْبَعَان الاِسْم',
        arabicTranslation: 'One and two follow the noun',
        arabicTranslationFr: 'Un et deux suivent le nom',
      },
      {
        type: 'examples_grid',
        content: 'One and Two',
        contentFr: 'Un et Deux',
        examples: [
          { arabic: 'كِتَابٌ وَاحِدٌ', english: 'one book', french: 'un livre' },
          { arabic: 'سَيَّارَةٌ وَاحِدَةٌ', english: 'one car', french: 'une voiture' },
          { arabic: 'كِتَابَانِ اثْنَانِ', english: 'two books', french: 'deux livres' },
          { arabic: 'سَيَّارَتَانِ اثْنَتَانِ', english: 'two cars', french: 'deux voitures' },
        ],
      },

      {
        type: 'rule',
        content: 'Numbers [[3-10]]: The number has [[OPPOSITE gender]] from the noun, and the noun is [[PLURAL]]! This is the famous "reverse gender" rule.',
        contentFr: 'Les nombres [[3-10]] : Le nombre a le [[genre OPPOSÉ]] à celui du nom, et le nom est au [[PLURIEL]] ! C\'est la fameuse règle du « genre inversé ».',
        arabicDescription: 'الْأَعْدَاد ٣-١٠ تُخَالِف الْمَعْدُود',
        arabicTranslation: 'Numbers 3-10 have opposite gender from the counted noun',
        arabicTranslationFr: 'Les nombres 3-10 ont le genre opposé au nom compté',
      },
      {
        type: 'examples_grid',
        content: 'Three to Ten (opposite gender rule)',
        contentFr: 'Trois à Dix (règle du genre inversé)',
        examples: [
          { arabic: 'ثَلَاثَةُ كُتُبٍ', english: '3 books (fem. number + masc. noun)', french: '3 livres (nombre fém. + nom masc.)' },
          { arabic: 'ثَلَاثُ سَيَّارَاتٍ', english: '3 cars (masc. number + fem. noun)', french: '3 voitures (nombre masc. + nom fém.)' },
          { arabic: 'خَمْسَةُ طُلَّابٍ', english: '5 students (m)', french: '5 étudiants (m)' },
          { arabic: 'خَمْسُ طَالِبَاتٍ', english: '5 students (f)', french: '5 étudiantes (f)' },
          { arabic: 'سَبْعَةُ أَيَّامٍ', english: '7 days', french: '7 jours' },
          { arabic: 'عَشْرُ سَنَوَاتٍ', english: '10 years', french: '10 ans' },
        ],
      },

      {
        type: 'rule',
        content: 'Numbers [[11-99]]: The noun is [[SINGULAR]]! This is easier. [[عِشْرُونَ كِتَابًا]] (20 books), [[خَمْسَةَ عَشَرَ طَالِبًا]] (15 students).',
        contentFr: 'Les nombres [[11-99]] : Le nom est au [[SINGULIER]] ! C\'est plus facile. [[عِشْرُونَ كِتَابًا]] (20 livres), [[خَمْسَةَ عَشَرَ طَالِبًا]] (15 étudiants).',
        arabicDescription: 'مِنْ ١١ وَمَا فَوْق الْمَعْدُود مُفْرَد',
        arabicTranslation: 'From 11 and above, the counted noun is singular',
        arabicTranslationFr: 'À partir de 11, le nom compté est au singulier',
      },
      {
        type: 'examples_grid',
        content: 'Eleven and above',
        contentFr: 'Onze et plus',
        examples: [
          { arabic: 'أَحَدَ عَشَرَ كِتَابًا', english: '11 books', french: '11 livres' },
          { arabic: 'اِثْنَا عَشَرَ طَالِبًا', english: '12 students', french: '12 étudiants' },
          { arabic: 'عِشْرُونَ سَنَةً', english: '20 years', french: '20 ans' },
          { arabic: 'مِئَةُ كِتَابٍ', english: '100 books', french: '100 livres' },
        ],
      },

      {
        type: 'note',
        content: 'Quick tip: For everyday use, just remember [[3-10 use plural noun]], and [[11+ use singular noun]]. The gender rules take practice!',
        contentFr: 'Astuce : Pour l\'usage quotidien, retenez simplement que [[3-10 utilisent le nom au pluriel]], et [[11+ utilisent le nom au singulier]]. Les règles de genre s\'acquièrent avec la pratique !',
        arabicDescription: 'الْمُمَارَسَة تُسَهِّل التَّعَلُّم',
        arabicTranslation: 'Practice makes learning easier',
        arabicTranslationFr: 'La pratique facilite l\'apprentissage',
      },
    ],
  },

  // LESSON 13: Verbal Sentences
  {
    id: 'grammar-13',
    title: 'Verbal Sentences',
    titleFr: 'Phrases Verbales',
    titleArabic: 'الْجُمْلَة الْفِعْلِيَّة',
    description: 'Learn sentences that start with verbs - the other main sentence type',
    descriptionFr: 'Apprenez les phrases qui commencent par des verbes - l\'autre type de phrase principal',
    level: 'beginner',
    category: 'sentences',
    order: 13,
    exercises: ['ex-grammar-13-1', 'ex-grammar-13-2', 'ex-grammar-13-3'],
    content: [
      {
        type: 'description',
        content: 'Arabic has two sentence types! You already know [[nominal sentences]] (starts with noun). Now meet [[verbal sentences]] — they start with a [[VERB]] and are super common in storytelling and action descriptions!',
        contentFr: 'L\'arabe a deux types de phrases ! Vous connaissez déjà les [[phrases nominales]] (commençant par un nom). Découvrez maintenant les [[phrases verbales]] — elles commencent par un [[VERBE]] et sont très courantes dans les récits et les descriptions d\'actions !',
        arabicDescription: 'الْجُمْلَة الْفِعْلِيَّة تَبْدَأُ بِفِعْل',
        arabicTranslation: 'The verbal sentence starts with a verb',
        arabicTranslationFr: 'La phrase verbale commence par un verbe',
      },
      {
        type: 'rule',
        content: 'The magic formula: [[فِعْل]] (Verb) + [[فَاعِل]] (Subject) + [[مَفْعُول]] (Object). The verb comes [[FIRST]], then who did it, then what they did it to!',
        contentFr: 'La formule magique : [[فِعْل]] (Verbe) + [[فَاعِل]] (Sujet) + [[مَفْعُول]] (Objet). Le verbe vient en [[PREMIER]], puis qui l\'a fait, puis ce sur quoi il l\'a fait !',
        arabicDescription: 'فِعْل + فَاعِل + مَفْعُول بِهِ',
        arabicTranslation: 'Verb + Subject + Object',
        arabicTranslationFr: 'Verbe + Sujet + Objet',
      },

      {
        type: 'text',
        content: 'Basic Verbal Sentences',
        contentFr: 'Phrases Verbales de Base',
      },
      {
        type: 'examples_grid',
        content: 'Simple action sentences',
        contentFr: 'Phrases d\'action simples',
        examples: [
          { arabic: 'ذَهَبَ الْوَلَدُ', english: 'The boy went', french: 'Le garçon est parti' },
          { arabic: 'جَاءَتِ الْبِنْتُ', english: 'The girl came', french: 'La fille est venue' },
          { arabic: 'نَامَ الطِّفْلُ', english: 'The child slept', french: 'L\'enfant a dormi' },
          { arabic: 'خَرَجَ الْأَبُ', english: 'The father went out', french: 'Le père est sorti' },
          { arabic: 'دَخَلَتِ الْأُمُّ', english: 'The mother entered', french: 'La mère est entrée' },
          { arabic: 'رَجَعَ الطَّالِبُ', english: 'The student returned', french: 'L\'étudiant est revenu' },
        ],
      },

      {
        type: 'text',
        content: 'With Objects (Verb + Subject + Object)',
        contentFr: 'Avec des Objets (Verbe + Sujet + Objet)',
      },
      {
        type: 'examples_grid',
        content: 'Full sentences with objects',
        contentFr: 'Phrases complètes avec des objets',
        examples: [
          { arabic: 'كَتَبَ الطَّالِبُ الدَّرْسَ', english: 'The student wrote the lesson', french: 'L\'étudiant a écrit la leçon' },
          { arabic: 'قَرَأَ الْمُعَلِّمُ الْكِتَابَ', english: 'The teacher read the book', french: 'Le professeur a lu le livre' },
          { arabic: 'أَكَلَ الْوَلَدُ التُّفَّاحَةَ', english: 'The boy ate the apple', french: 'Le garçon a mangé la pomme' },
          { arabic: 'شَرِبَ الرَّجُلُ الْقَهْوَةَ', english: 'The man drank the coffee', french: 'L\'homme a bu le café' },
          { arabic: 'فَتَحَتِ الْبِنْتُ الْبَابَ', english: 'The girl opened the door', french: 'La fille a ouvert la porte' },
          { arabic: 'أَغْلَقَ الْأَبُ النَّافِذَةَ', english: 'The father closed the window', french: 'Le père a fermé la fenêtre' },
        ],
      },

      {
        type: 'text',
        content: 'Verbal vs Nominal — What\'s the Difference?',
        contentFr: 'Verbale vs Nominale — Quelle est la Différence ?',
      },
      {
        type: 'comparison_grid',
        content: 'Same meaning, different emphasis',
        contentFr: 'Même sens, accent différent',
        leftLabel: 'Verbal (Action focus)',
        leftLabelFr: 'Verbale (Accent sur l\'action)',
        rightLabel: 'Nominal (Topic focus)',
        rightLabelFr: 'Nominale (Accent sur le sujet)',
        comparisons: [
          { left: { arabic: 'ذَهَبَ الْوَلَدُ', label: 'The boy went', labelFr: 'Le garçon est parti' }, right: { arabic: 'الْوَلَدُ ذَهَبَ', label: 'The boy, he went', labelFr: 'Le garçon, il est parti' } },
          { left: { arabic: 'أَكَلَتِ الْبِنْتُ', label: 'The girl ate', labelFr: 'La fille a mangé' }, right: { arabic: 'الْبِنْتُ أَكَلَتْ', label: 'The girl, she ate', labelFr: 'La fille, elle a mangé' } },
          { left: { arabic: 'نَامَ الطِّفْلُ', label: 'The child slept', labelFr: 'L\'enfant a dormi' }, right: { arabic: 'الطِّفْلُ نَامَ', label: 'The child, he slept', labelFr: 'L\'enfant, il a dormi' } },
          { left: { arabic: 'جَاءَ الضَّيْفُ', label: 'The guest came', labelFr: 'L\'invité est venu' }, right: { arabic: 'الضَّيْفُ جَاءَ', label: 'The guest, he came', labelFr: 'L\'invité, il est venu' } },
        ],
      },

      {
        type: 'rule',
        content: 'Special rule: In verbal sentences, the verb only matches [[gender]], not number! [[جَاءَ الطُّلَّابُ]] uses singular verb even though "students" is plural. In nominal sentences, both gender AND number must match.',
        contentFr: 'Règle spéciale : Dans les phrases verbales, le verbe ne s\'accorde qu\'en [[genre]], pas en nombre ! [[جَاءَ الطُّلَّابُ]] utilise un verbe au singulier même si « étudiants » est au pluriel. Dans les phrases nominales, le genre ET le nombre doivent s\'accorder.',
        arabicDescription: 'الْفِعْل يُطَابِق الْفَاعِل فِي الْجِنْس فَقَط',
        arabicTranslation: 'The verb matches the subject in gender only',
        arabicTranslationFr: 'Le verbe s\'accorde avec le sujet en genre seulement',
      },

      {
        type: 'text',
        content: 'Everyday Actions',
        contentFr: 'Actions Quotidiennes',
      },
      {
        type: 'examples_grid',
        content: 'Common daily activities',
        contentFr: 'Activités quotidiennes courantes',
        examples: [
          { arabic: 'اِسْتَيْقَظَ الْوَلَدُ مُبَكِّرًا', english: 'The boy woke up early', french: 'Le garçon s\'est réveillé tôt' },
          { arabic: 'غَسَلَتِ الْأُمُّ الثِّيَابَ', english: 'The mother washed the clothes', french: 'La mère a lavé les vêtements' },
          { arabic: 'طَبَخَتِ الْجَدَّةُ الطَّعَامَ', english: 'The grandmother cooked the food', french: 'La grand-mère a cuisiné le repas' },
          { arabic: 'لَعِبَ الْأَطْفَالُ فِي الْحَدِيقَةِ', english: 'The children played in the garden', french: 'Les enfants ont joué dans le jardin' },
          { arabic: 'شَاهَدَ الْأَبُ التِّلْفَازَ', english: 'The father watched TV', french: 'Le père a regardé la télé' },
          { arabic: 'نَظَّفَ الطَّالِبُ غُرْفَتَهُ', english: 'The student cleaned his room', french: 'L\'étudiant a nettoyé sa chambre' },
        ],
      },

      {
        type: 'text',
        content: 'Travel & Movement',
        contentFr: 'Voyage & Déplacement',
      },
      {
        type: 'examples_grid',
        content: 'Going places',
        contentFr: 'Se déplacer',
        examples: [
          { arabic: 'سَافَرَ أَحْمَدُ إِلَى مِصْرَ', english: 'Ahmed traveled to Egypt', french: 'Ahmed a voyagé en Égypte' },
          { arabic: 'وَصَلَ الطَّائِرَةُ', english: 'The plane arrived', french: 'L\'avion est arrivé' },
          { arabic: 'رَكِبَ الْمُسَافِرُ الْقِطَارَ', english: 'The traveler boarded the train', french: 'Le voyageur a pris le train' },
          { arabic: 'مَشَى الرَّجُلُ إِلَى الْمَسْجِدِ', english: 'The man walked to the mosque', french: 'L\'homme a marché jusqu\'à la mosquée' },
        ],
      },

      {
        type: 'note',
        content: 'Use [[verbal sentences]] when emphasizing the action: "Wrote the student..." Use [[nominal sentences]] when emphasizing the doer: "The student, he wrote..."',
        contentFr: 'Utilisez les [[phrases verbales]] pour mettre l\'accent sur l\'action : « A écrit l\'étudiant... » Utilisez les [[phrases nominales]] pour mettre l\'accent sur l\'auteur : « L\'étudiant, il a écrit... »',
        arabicDescription: 'الْجُمْلَة الْفِعْلِيَّة تُرَكِّز عَلَى الْفِعْل',
        arabicTranslation: 'The verbal sentence focuses on the action',
        arabicTranslationFr: 'La phrase verbale met l\'accent sur l\'action',
      },
    ],
  },

  // LESSON 14: Past Tense Basics
  {
    id: 'grammar-14',
    title: 'Past Tense Basics',
    titleFr: 'Bases du Passé',
    titleArabic: 'الْمَاضِي',
    description: 'Learn to express actions that happened in the past',
    descriptionFr: 'Apprenez à exprimer des actions passées',
    level: 'beginner',
    category: 'verbs',
    order: 14,
    exercises: ['ex-grammar-14-1', 'ex-grammar-14-2', 'ex-grammar-14-3'],
    content: [
      {
        type: 'description',
        content: 'The past tense [[الْمَاضِي]] tells stories! It describes actions that are [[done and completed]]. Arabic verbs are built from a [[3-letter root]], and the past tense is the simplest form to learn.',
        contentFr: 'Le passé [[الْمَاضِي]] raconte des histoires ! Il décrit des actions qui sont [[terminées et accomplies]]. Les verbes arabes sont construits à partir d\'une [[racine de 3 lettres]], et le passé est la forme la plus simple à apprendre.',
        arabicDescription: 'الْمَاضِي يَدُلُّ عَلَى حَدَثٍ انْتَهَى',
        arabicTranslation: 'The past tense indicates a completed event',
        arabicTranslationFr: 'Le passé indique un événement accompli',
      },
      {
        type: 'rule',
        content: 'The [[هُوَ]] (he) form is the dictionary form! All conjugations are built by changing the [[ending]] of this base form. The root stays the same, only suffixes change.',
        contentFr: 'La forme [[هُوَ]] (il) est la forme du dictionnaire ! Toutes les conjugaisons se construisent en changeant la [[terminaison]] de cette forme de base. La racine reste la même, seuls les suffixes changent.',
        arabicDescription: 'صِيغَة "هُوَ" هِيَ الْأَصْل',
        arabicTranslation: 'The "he" form is the base form',
        arabicTranslationFr: 'La forme « il » est la forme de base',
      },

      {
        type: 'text',
        content: 'Common Past Tense Verbs',
        contentFr: 'Verbes Courants au Passé',
      },
      {
        type: 'examples_grid',
        content: 'Basic verbs in "he" form',
        contentFr: 'Verbes de base à la forme « il »',
        examples: [
          { arabic: 'كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'أَكَلَ', english: 'he ate', french: 'il a mangé' },
          { arabic: 'شَرِبَ', english: 'he drank', french: 'il a bu' },
          { arabic: 'قَرَأَ', english: 'he read', french: 'il a lu' },
          { arabic: 'سَمِعَ', english: 'he heard', french: 'il a entendu' },
          { arabic: 'فَهِمَ', english: 'he understood', french: 'il a compris' },
          { arabic: 'عَمِلَ', english: 'he worked', french: 'il a travaillé' },
          { arabic: 'جَلَسَ', english: 'he sat', french: 'il s\'est assis' },
          { arabic: 'خَرَجَ', english: 'he went out', french: 'il est sorti' },
          { arabic: 'دَخَلَ', english: 'he entered', french: 'il est entré' },
          { arabic: 'رَجَعَ', english: 'he returned', french: 'il est revenu' },
        ],
      },

      {
        type: 'text',
        content: 'I / We Forms (Speaker)',
        contentFr: 'Formes Je / Nous (Locuteur)',
      },
      {
        type: 'examples_grid',
        content: 'Talking about yourself',
        contentFr: 'Parler de soi-même',
        examples: [
          { arabic: 'كَتَبْتُ', english: 'I wrote', french: 'j\'ai écrit' },
          { arabic: 'ذَهَبْتُ', english: 'I went', french: 'je suis allé(e)' },
          { arabic: 'أَكَلْتُ', english: 'I ate', french: 'j\'ai mangé' },
          { arabic: 'شَرِبْتُ', english: 'I drank', french: 'j\'ai bu' },
          { arabic: 'كَتَبْنَا', english: 'we wrote', french: 'nous avons écrit' },
          { arabic: 'ذَهَبْنَا', english: 'we went', french: 'nous sommes allé(e)s' },
        ],
      },

      {
        type: 'text',
        content: 'You Forms (Addressing Someone)',
        contentFr: 'Formes Tu / Vous (Interlocuteur)',
      },
      {
        type: 'examples_grid',
        content: 'Talking to others',
        contentFr: 'Parler aux autres',
        examples: [
          { arabic: 'كَتَبْتَ', english: 'you wrote (m)', french: 'tu as écrit (m)' },
          { arabic: 'كَتَبْتِ', english: 'you wrote (f)', french: 'tu as écrit (f)' },
          { arabic: 'ذَهَبْتَ', english: 'you went (m)', french: 'tu es allé (m)' },
          { arabic: 'ذَهَبْتِ', english: 'you went (f)', french: 'tu es allée (f)' },
          { arabic: 'كَتَبْتُمْ', english: 'you all wrote', french: 'vous avez tous écrit' },
          { arabic: 'ذَهَبْتُمْ', english: 'you all went', french: 'vous êtes tous allés' },
        ],
      },

      {
        type: 'text',
        content: 'He / She / They Forms',
        contentFr: 'Formes Il / Elle / Ils / Elles',
      },
      {
        type: 'examples_grid',
        content: 'Talking about others',
        contentFr: 'Parler des autres',
        examples: [
          { arabic: 'كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'كَتَبَتْ', english: 'she wrote', french: 'elle a écrit' },
          { arabic: 'ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'ذَهَبَتْ', english: 'she went', french: 'elle est allée' },
          { arabic: 'كَتَبُوا', english: 'they wrote (m)', french: 'ils ont écrit' },
          { arabic: 'كَتَبْنَ', english: 'they wrote (f)', french: 'elles ont écrit' },
        ],
      },

      {
        type: 'rule',
        content: 'Pattern: [[ـتُ]] = I, [[ـتَ]] = you (m), [[ـتِ]] = you (f), [[ـنَا]] = we, [[ـتْ]] = she, [[ـوا]] = they. The vowel on ت tells you who!',
        contentFr: 'Schéma : [[ـتُ]] = je, [[ـتَ]] = tu (m), [[ـتِ]] = tu (f), [[ـنَا]] = nous, [[ـتْ]] = elle, [[ـوا]] = ils. La voyelle sur ت indique qui !',
        arabicDescription: 'الضَّمَّة لِلْمُتَكَلِّم وَالْفَتْحَة لِلْمُخَاطَب',
        arabicTranslation: 'Damma for the speaker and Fatha for the addressee',
        arabicTranslationFr: 'La Damma pour le locuteur et la Fatha pour l\'interlocuteur',
      },

      {
        type: 'text',
        content: 'Past Tense in Sentences',
        contentFr: 'Le Passé dans des Phrases',
      },
      {
        type: 'examples_grid',
        content: 'Complete sentences',
        contentFr: 'Phrases complètes',
        examples: [
          { arabic: 'ذَهَبْتُ إِلَى الْمَدْرَسَةِ', english: 'I went to school', french: 'Je suis allé(e) à l\'école' },
          { arabic: 'أَكَلْنَا الْغَدَاءَ', english: 'We ate lunch', french: 'Nous avons mangé le déjeuner' },
          { arabic: 'قَرَأَتْ كِتَابًا', english: 'She read a book', french: 'Elle a lu un livre' },
          { arabic: 'سَمِعُوا الْخَبَرَ', english: 'They heard the news', french: 'Ils ont entendu la nouvelle' },
          { arabic: 'شَرِبْتَ الْقَهْوَةَ؟', english: 'Did you drink coffee?', french: 'As-tu bu le café ?' },
          { arabic: 'فَهِمْتُ الدَّرْسَ', english: 'I understood the lesson', french: 'J\'ai compris la leçon' },
        ],
      },

      {
        type: 'text',
        content: 'Yesterday\'s Activities',
        contentFr: 'Les Activités d\'Hier',
      },
      {
        type: 'examples_grid',
        content: 'Telling what happened',
        contentFr: 'Raconter ce qui s\'est passé',
        examples: [
          { arabic: 'أَمْسِ ذَهَبْتُ إِلَى السُّوقِ', english: 'Yesterday I went to the market', french: 'Hier je suis allé(e) au marché' },
          { arabic: 'اِسْتَيْقَظْتُ مُبَكِّرًا', english: 'I woke up early', french: 'Je me suis réveillé(e) tôt' },
          { arabic: 'شَاهَدْنَا فِيلْمًا', english: 'We watched a movie', french: 'Nous avons regardé un film' },
          { arabic: 'زَارَنَا صَدِيقٌ', english: 'A friend visited us', french: 'Un ami nous a rendu visite' },
        ],
      },

      {
        type: 'note',
        content: 'No pronoun needed! The ending tells you who did it. [[كَتَبْتُ]] alone means "I wrote" — no need to add [[أَنَا]].',
        contentFr: 'Pas besoin de pronom ! La terminaison indique qui a fait l\'action. [[كَتَبْتُ]] seul signifie « j\'ai écrit » — pas besoin d\'ajouter [[أَنَا]].',
        arabicDescription: 'الضَّمِير مَفْهُوم مِنَ الْفِعْل',
        arabicTranslation: 'The pronoun is understood from the verb',
        arabicTranslationFr: 'Le pronom est compris à partir du verbe',
      },
    ],
  },

  // LESSON 15: Present Tense Basics
  {
    id: 'grammar-15',
    title: 'Present Tense Basics',
    titleFr: 'Bases du Présent',
    titleArabic: 'الْمُضَارِع',
    description: 'Express current actions and habits',
    descriptionFr: 'Exprimez les actions actuelles et les habitudes',
    level: 'beginner',
    category: 'verbs',
    order: 15,
    exercises: ['ex-grammar-15-1', 'ex-grammar-15-2', 'ex-grammar-15-3'],
    content: [
      {
        type: 'description',
        content: 'The present tense [[الْمُضَارِع]] describes what\'s happening [[now]] or what you [[usually do]]! Unlike past tense (endings only), present tense uses [[prefixes]] at the beginning of the verb.',
        contentFr: 'Le présent [[الْمُضَارِع]] décrit ce qui se passe [[maintenant]] ou ce que vous faites [[habituellement]] ! Contrairement au passé (terminaisons uniquement), le présent utilise des [[préfixes]] au début du verbe.',
        arabicDescription: 'الْمُضَارِع يَدُلُّ عَلَى الْحَاضِر أَوِ الْمُسْتَقْبَل',
        arabicTranslation: 'The present tense indicates present or future',
        arabicTranslationFr: 'Le présent indique le présent ou le futur',
      },
      {
        type: 'rule',
        content: 'Magic prefixes: [[أَ]] = I, [[تَ]] = you/she, [[يَ]] = he/they, [[نَ]] = we. Remember: "[[أَتَيْنَ]]" — I, you, he, we!',
        contentFr: 'Préfixes magiques : [[أَ]] = je, [[تَ]] = tu/elle, [[يَ]] = il/ils, [[نَ]] = nous. Retenez : « [[أَتَيْنَ]] » — je, tu, il, nous !',
        arabicDescription: 'حُرُوف الْمُضَارَعَة: أ ت ي ن',
        arabicTranslation: 'Present tense prefixes: A, T, Y, N',
        arabicTranslationFr: 'Les préfixes du présent : A, T, Y, N',
      },

      {
        type: 'text',
        content: 'Common Present Tense Verbs (He form)',
        contentFr: 'Verbes Courants au Présent (Forme Il)',
      },
      {
        type: 'examples_grid',
        content: 'Basic verbs',
        contentFr: 'Verbes de base',
        examples: [
          { arabic: 'يَكْتُبُ', english: 'he writes', french: 'il écrit' },
          { arabic: 'يَذْهَبُ', english: 'he goes', french: 'il va' },
          { arabic: 'يَأْكُلُ', english: 'he eats', french: 'il mange' },
          { arabic: 'يَشْرَبُ', english: 'he drinks', french: 'il boit' },
          { arabic: 'يَقْرَأُ', english: 'he reads', french: 'il lit' },
          { arabic: 'يَسْمَعُ', english: 'he hears', french: 'il entend' },
          { arabic: 'يَفْهَمُ', english: 'he understands', french: 'il comprend' },
          { arabic: 'يَعْمَلُ', english: 'he works', french: 'il travaille' },
          { arabic: 'يَجْلِسُ', english: 'he sits', french: 'il s\'assied' },
          { arabic: 'يَخْرُجُ', english: 'he goes out', french: 'il sort' },
          { arabic: 'يَدْخُلُ', english: 'he enters', french: 'il entre' },
          { arabic: 'يَرْجِعُ', english: 'he returns', french: 'il revient' },
        ],
      },

      {
        type: 'text',
        content: 'I / We Forms (Speaker)',
        contentFr: 'Formes Je / Nous (Locuteur)',
      },
      {
        type: 'examples_grid',
        content: 'Talking about yourself',
        contentFr: 'Parler de soi-même',
        examples: [
          { arabic: 'أَكْتُبُ', english: 'I write', french: 'j\'écris' },
          { arabic: 'أَذْهَبُ', english: 'I go', french: 'je vais' },
          { arabic: 'آكُلُ', english: 'I eat', french: 'je mange' },
          { arabic: 'أَشْرَبُ', english: 'I drink', french: 'je bois' },
          { arabic: 'نَكْتُبُ', english: 'we write', french: 'nous écrivons' },
          { arabic: 'نَذْهَبُ', english: 'we go', french: 'nous allons' },
        ],
      },

      {
        type: 'text',
        content: 'You Forms (Addressing Someone)',
        contentFr: 'Formes Tu / Vous (Interlocuteur)',
      },
      {
        type: 'examples_grid',
        content: 'Talking to others',
        contentFr: 'Parler aux autres',
        examples: [
          { arabic: 'تَكْتُبُ', english: 'you write (m)', french: 'tu écris (m)' },
          { arabic: 'تَكْتُبِينَ', english: 'you write (f)', french: 'tu écris (f)' },
          { arabic: 'تَذْهَبُ', english: 'you go (m)', french: 'tu vas (m)' },
          { arabic: 'تَذْهَبِينَ', english: 'you go (f)', french: 'tu vas (f)' },
          { arabic: 'تَكْتُبُونَ', english: 'you all write', french: 'vous écrivez tous' },
          { arabic: 'تَذْهَبُونَ', english: 'you all go', french: 'vous allez tous' },
        ],
      },

      {
        type: 'text',
        content: 'He / She / They Forms',
        contentFr: 'Formes Il / Elle / Ils / Elles',
      },
      {
        type: 'examples_grid',
        content: 'Talking about others',
        contentFr: 'Parler des autres',
        examples: [
          { arabic: 'يَكْتُبُ', english: 'he writes', french: 'il écrit' },
          { arabic: 'تَكْتُبُ', english: 'she writes', french: 'elle écrit' },
          { arabic: 'يَذْهَبُ', english: 'he goes', french: 'il va' },
          { arabic: 'تَذْهَبُ', english: 'she goes', french: 'elle va' },
          { arabic: 'يَكْتُبُونَ', english: 'they write (m)', french: 'ils écrivent' },
          { arabic: 'يَكْتُبْنَ', english: 'they write (f)', french: 'elles écrivent' },
        ],
      },

      {
        type: 'rule',
        content: 'Notice: [[تَكْتُبُ]] means both "you write (m)" AND "she writes"! Context tells you which. The feminine "you" adds [[ـينَ]]: [[تَكْتُبِينَ]].',
        contentFr: 'Remarque : [[تَكْتُبُ]] signifie à la fois « tu écris (m) » ET « elle écrit » ! Le contexte vous indique lequel. Le « tu » féminin ajoute [[ـينَ]] : [[تَكْتُبِينَ]].',
        arabicDescription: 'تَكْتُبُ لِلْمُخَاطَب وَلِلْغَائِبَة',
        arabicTranslation: 'Taktub is for "you (m)" and "she"',
        arabicTranslationFr: 'Taktub est pour « tu (m) » et « elle »',
      },

      {
        type: 'text',
        content: 'Daily Habits',
        contentFr: 'Habitudes Quotidiennes',
      },
      {
        type: 'examples_grid',
        content: 'What you do regularly',
        contentFr: 'Ce que vous faites régulièrement',
        examples: [
          { arabic: 'أَدْرُسُ الْعَرَبِيَّةَ كُلَّ يَوْمٍ', english: 'I study Arabic every day', french: 'J\'étudie l\'arabe tous les jours' },
          { arabic: 'أَذْهَبُ إِلَى الْعَمَلِ صَبَاحًا', english: 'I go to work in the morning', french: 'Je vais au travail le matin' },
          { arabic: 'نَأْكُلُ مَعًا', english: 'We eat together', french: 'Nous mangeons ensemble' },
          { arabic: 'يُصَلِّي خَمْسَ مَرَّاتٍ', english: 'He prays five times', french: 'Il prie cinq fois' },
        ],
      },

      {
        type: 'text',
        content: 'Right Now',
        contentFr: 'En Ce Moment',
      },
      {
        type: 'examples_grid',
        content: 'Current actions',
        contentFr: 'Actions en cours',
        examples: [
          { arabic: 'مَاذَا تَفْعَلُ الْآنَ؟', english: 'What are you doing now?', french: 'Que fais-tu maintenant ?' },
          { arabic: 'أَقْرَأُ كِتَابًا', english: 'I am reading a book', french: 'Je lis un livre' },
          { arabic: 'يَلْعَبُ الْأَطْفَالُ', english: 'The children are playing', french: 'Les enfants jouent' },
          { arabic: 'تَطْبُخُ أُمِّي', english: 'My mother is cooking', french: 'Ma mère cuisine' },
        ],
      },

      {
        type: 'note',
        content: 'The present tense can also express [[future]]! [[سَأَذْهَبُ غَدًا]] (I will go tomorrow) — just add [[سَـ]] or [[سَوْفَ]] before the verb.',
        contentFr: 'Le présent peut aussi exprimer le [[futur]] ! [[سَأَذْهَبُ غَدًا]] (J\'irai demain) — il suffit d\'ajouter [[سَـ]] ou [[سَوْفَ]] avant le verbe.',
        arabicDescription: 'الْمُضَارِع قَدْ يَدُلُّ عَلَى الْمُسْتَقْبَل',
        arabicTranslation: 'The present tense can also indicate the future',
        arabicTranslationFr: 'Le présent peut aussi indiquer le futur',
      },
    ],
  },

  // LESSON 16: Negation
  {
    id: 'grammar-16',
    title: 'Negation (Not, Don\'t)',
    titleFr: 'La Négation (Ne pas)',
    titleArabic: 'النَّفْي',
    description: 'Learn to say "not", "don\'t", and "didn\'t" in Arabic',
    descriptionFr: 'Apprenez à dire « ne...pas », « ne...plus » en arabe',
    level: 'beginner',
    category: 'other',
    order: 16,
    exercises: ['ex-grammar-16-1', 'ex-grammar-16-2', 'ex-grammar-16-3'],
    content: [
      {
        type: 'description',
        content: 'Saying "no" and "not" is essential! Arabic uses different negation words depending on [[when]] the action happens. Three main words: [[لَا]] for present, [[مَا]] for past, and [[لَيْسَ]] for "is not".',
        contentFr: 'Dire « non » et « ne...pas » est essentiel ! L\'arabe utilise différents mots de négation selon [[le moment]] de l\'action. Trois mots principaux : [[لَا]] pour le présent, [[مَا]] pour le passé, et [[لَيْسَ]] pour « n\'est pas ».',
        arabicDescription: 'أَدَوَات النَّفْي: لَا، مَا، لَيْسَ',
        arabicTranslation: 'Negation words: La, Ma, Laysa',
        arabicTranslationFr: 'Mots de négation : La, Ma, Laysa',
      },

      {
        type: 'text',
        content: 'لَا — Present Tense & Commands',
        contentFr: 'لَا — Présent et ordres',
      },
      {
        type: 'rule',
        content: '[[لَا]] is the most common! Use it for "don\'t" (present actions) and "Don\'t!" (commands). Just put [[لَا]] before the verb.',
        contentFr: '[[لَا]] est le plus courant ! Utilisez-le pour « ne...pas » (actions au présent) et « Ne...pas ! » (ordres). Placez simplement [[لَا]] avant le verbe.',
        arabicDescription: 'لَا تَنْفِي الْمُضَارِعَ وَالْأَمْر',
        arabicTranslation: 'La negates the present tense and commands',
        arabicTranslationFr: 'La nie le présent et les ordres',
      },
      {
        type: 'examples_grid',
        content: 'Present tense negation',
        contentFr: 'Négation au présent',
        examples: [
          { arabic: 'لَا أَفْهَمُ', english: 'I don\'t understand', french: 'Je ne comprends pas' },
          { arabic: 'لَا أَعْرِفُ', english: 'I don\'t know', french: 'Je ne sais pas' },
          { arabic: 'لَا يَذْهَبُ', english: 'He doesn\'t go', french: 'Il ne va pas' },
          { arabic: 'لَا نُرِيدُ', english: 'We don\'t want', french: 'Nous ne voulons pas' },
          { arabic: 'لَا أُحِبُّ الْقَهْوَةَ', english: 'I don\'t like coffee', french: 'Je n\'aime pas le café' },
          { arabic: 'لَا تَتَكَلَّمُ الْعَرَبِيَّةَ', english: 'She doesn\'t speak Arabic', french: 'Elle ne parle pas arabe' },
        ],
      },

      {
        type: 'text',
        content: 'Commands: Don\'t...!',
        contentFr: 'Ordres : Ne...pas !',
      },
      {
        type: 'examples_grid',
        content: 'Negative commands',
        contentFr: 'Ordres négatifs',
        examples: [
          { arabic: 'لَا تَذْهَبْ', english: 'Don\'t go!', french: 'Ne pars pas !' },
          { arabic: 'لَا تَأْكُلْ', english: 'Don\'t eat!', french: 'Ne mange pas !' },
          { arabic: 'لَا تَنْسَ', english: 'Don\'t forget!', french: 'N\'oublie pas !' },
          { arabic: 'لَا تَقْلَقْ', english: 'Don\'t worry!', french: 'Ne t\'inquiète pas !' },
          { arabic: 'لَا تَتَأَخَّرْ', english: 'Don\'t be late!', french: 'Ne sois pas en retard !' },
          { arabic: 'لَا تَتَكَلَّمْ', english: 'Don\'t speak!', french: 'Ne parle pas !' },
        ],
      },

      {
        type: 'text',
        content: 'مَا — Past Tense',
        contentFr: 'مَا — Passé',
      },
      {
        type: 'rule',
        content: '[[مَا]] negates the past — "didn\'t." Put [[مَا]] before the past tense verb.',
        contentFr: '[[مَا]] nie le passé — « n\'a pas fait ». Placez [[مَا]] avant le verbe au passé.',
        arabicDescription: 'مَا تَنْفِي الْمَاضِي',
        arabicTranslation: 'Ma negates the past',
        arabicTranslationFr: 'Ma nie le passé',
      },
      {
        type: 'examples_grid',
        content: 'Past tense negation',
        contentFr: 'Négation au passé',
        examples: [
          { arabic: 'مَا ذَهَبْتُ', english: 'I didn\'t go', french: 'Je ne suis pas allé' },
          { arabic: 'مَا فَهِمْتُ', english: 'I didn\'t understand', french: 'Je n\'ai pas compris' },
          { arabic: 'مَا أَكَلْنَا', english: 'We didn\'t eat', french: 'Nous n\'avons pas mangé' },
          { arabic: 'مَا سَمِعَ', english: 'He didn\'t hear', french: 'Il n\'a pas entendu' },
          { arabic: 'مَا رَأَيْتُهُ', english: 'I didn\'t see him', french: 'Je ne l\'ai pas vu' },
          { arabic: 'مَا قَالَتْ شَيْئًا', english: 'She didn\'t say anything', french: 'Elle n\'a rien dit' },
        ],
      },

      {
        type: 'text',
        content: 'لَيْسَ — "Is Not" (Nominal Sentences)',
        contentFr: 'لَيْسَ — « N\'est pas » (Phrases nominales)',
      },
      {
        type: 'rule',
        content: '[[لَيْسَ]] is special! It negates sentences with NO verb (nominal sentences). It [[conjugates]] to match the subject, like a verb!',
        contentFr: '[[لَيْسَ]] est spécial ! Il nie les phrases SANS verbe (phrases nominales). Il [[se conjugue]] pour s\'accorder avec le sujet, comme un verbe !',
        arabicDescription: 'لَيْسَ تَنْفِي الْجُمْلَة الاِسْمِيَّة',
        arabicTranslation: 'Laysa negates the nominal sentence',
        arabicTranslationFr: 'Laysa nie la phrase nominale',
      },
      {
        type: 'examples_grid',
        content: 'لَيْسَ conjugations',
        contentFr: 'Conjugaisons de لَيْسَ',
        examples: [
          { arabic: 'لَسْتُ', english: 'I am not', french: 'Je ne suis pas' },
          { arabic: 'لَسْتَ', english: 'you are not (m)', french: 'Tu n\'es pas (m)' },
          { arabic: 'لَسْتِ', english: 'you are not (f)', french: 'Tu n\'es pas (f)' },
          { arabic: 'لَيْسَ', english: 'he is not', french: 'Il n\'est pas' },
          { arabic: 'لَيْسَتْ', english: 'she is not', french: 'Elle n\'est pas' },
          { arabic: 'لَسْنَا', english: 'we are not', french: 'Nous ne sommes pas' },
          { arabic: 'لَسْتُمْ', english: 'you all are not', french: 'Vous n\'êtes pas' },
          { arabic: 'لَيْسُوا', english: 'they are not', french: 'Ils ne sont pas' },
        ],
      },

      {
        type: 'text',
        content: 'Using لَيْسَ in Sentences',
        contentFr: 'Utiliser لَيْسَ dans des phrases',
      },
      {
        type: 'examples_grid',
        content: 'Negating "to be"',
        contentFr: 'Nier « être »',
        examples: [
          { arabic: 'لَسْتُ طَالِبًا', english: 'I am not a student', french: 'Je ne suis pas étudiant' },
          { arabic: 'لَيْسَ هُنَا', english: 'He is not here', french: 'Il n\'est pas ici' },
          { arabic: 'لَيْسَتْ مُعَلِّمَةً', english: 'She is not a teacher', french: 'Elle n\'est pas enseignante' },
          { arabic: 'لَسْنَا جَائِعِينَ', english: 'We are not hungry', french: 'Nous n\'avons pas faim' },
          { arabic: 'لَيْسَ الْجَوُّ بَارِدًا', english: 'The weather is not cold', french: 'Le temps n\'est pas froid' },
          { arabic: 'لَسْتُ مَشْغُولًا', english: 'I am not busy', french: 'Je ne suis pas occupé' },
        ],
      },

      {
        type: 'text',
        content: 'Quick Reference',
        contentFr: 'Référence rapide',
      },
      {
        type: 'comparison_grid',
        content: 'Which negation to use?',
        contentFr: 'Quelle négation utiliser ?',
        leftLabel: 'Situation',
        leftLabelFr: 'Situation',
        rightLabel: 'Use This',
        rightLabelFr: 'Utilisez ceci',
        comparisons: [
          { left: { arabic: 'أَفْهَمُ', label: 'I understand', labelFr: 'Je comprends' }, right: { arabic: 'لَا أَفْهَمُ', label: 'I don\'t understand', labelFr: 'Je ne comprends pas' } },
          { left: { arabic: 'ذَهَبْتُ', label: 'I went', labelFr: 'Je suis allé' }, right: { arabic: 'مَا ذَهَبْتُ', label: 'I didn\'t go', labelFr: 'Je ne suis pas allé' } },
          { left: { arabic: 'أَنَا طَالِبٌ', label: 'I am a student', labelFr: 'Je suis étudiant' }, right: { arabic: 'لَسْتُ طَالِبًا', label: 'I am not a student', labelFr: 'Je ne suis pas étudiant' } },
        ],
      },

      {
        type: 'note',
        content: 'Memory trick: [[لَا]] for NOW (present), [[مَا]] for THEN (past), [[لَيْسَ]] for "IS NOT" (no verb).',
        contentFr: 'Astuce mémoire : [[لَا]] pour MAINTENANT (présent), [[مَا]] pour AVANT (passé), [[لَيْسَ]] pour « N\'EST PAS » (sans verbe).',
        arabicDescription: 'لَا لِلْحَاضِر، مَا لِلْمَاضِي، لَيْسَ لِلْجُمْلَة الاِسْمِيَّة',
        arabicTranslation: 'La for present, Ma for past, Laysa for nominal sentences',
        arabicTranslationFr: 'La pour le présent, Ma pour le passé, Laysa pour les phrases nominales',
      },
    ],
  },

  // LESSON 17: Idafa Construction
  {
    id: 'grammar-17',
    title: 'Idafa (Possessive Construction)',
    titleFr: 'Idafa (Construction Possessive)',
    titleArabic: 'الْإِضَافَة',
    description: 'Learn "X of Y" constructions like "door of the house"',
    descriptionFr: 'Apprenez les constructions « X de Y » comme « porte de la maison »',
    level: 'beginner',
    category: 'nouns',
    order: 17,
    exercises: ['ex-grammar-17-1', 'ex-grammar-17-2', 'ex-grammar-17-3'],
    content: [
      {
        type: 'description',
        content: 'How do you say "the student\'s book" in Arabic? You use [[الْإِضَافَة]] (Idafa)! It\'s elegant: just put two nouns [[side by side]] — no "of" needed! [[كِتَابُ الطَّالِبِ]] = book (of) the-student.',
        contentFr: 'Comment dire « le livre de l\'étudiant » en arabe ? On utilise [[الْإِضَافَة]] (Idafa) ! C\'est élégant : il suffit de mettre deux noms [[côte à côte]] — pas besoin de « de » ! [[كِتَابُ الطَّالِبِ]] = livre (de) l\'étudiant.',
        arabicDescription: 'الْإِضَافَة: نِسْبَة اسْم إِلَى آخَر',
        arabicTranslation: 'Idafa: attributing one noun to another',
        arabicTranslationFr: 'Idafa : attribuer un nom à un autre',
      },
      {
        type: 'rule',
        content: 'Golden rule: The [[first noun]] NEVER takes [[ال]]! The second noun determines if the phrase is definite. [[كِتَابُ الطَّالِبِ]] = THE book (definite because الطالب has ال).',
        contentFr: 'Règle d\'or : Le [[premier nom]] ne prend JAMAIS [[ال]] ! Le second nom détermine si l\'expression est définie. [[كِتَابُ الطَّالِبِ]] = LE livre (défini car الطالب a ال).',
        arabicDescription: 'الْمُضَاف لَا يَقْبَل أَل',
        arabicTranslation: 'The first noun does not take Al',
        arabicTranslationFr: 'Le premier nom n\'accepte pas Al',
      },

      {
        type: 'text',
        content: 'Basic Idafa Phrases',
        contentFr: 'Expressions Idafa de base',
      },
      {
        type: 'examples_grid',
        content: 'X of Y / X\'s Y',
        contentFr: 'X de Y / le Y de X',
        examples: [
          { arabic: 'بَابُ الْبَيْتِ', english: 'the door of the house', french: 'la porte de la maison' },
          { arabic: 'كِتَابُ الطَّالِبِ', english: 'the student\'s book', french: 'le livre de l\'étudiant' },
          { arabic: 'سَيَّارَةُ الْأُسْتَاذِ', english: 'the teacher\'s car', french: 'la voiture du professeur' },
          { arabic: 'مِفْتَاحُ الْغُرْفَةِ', english: 'the room key', french: 'la clé de la chambre' },
          { arabic: 'اسْمُ الْوَلَدِ', english: 'the boy\'s name', french: 'le nom du garçon' },
          { arabic: 'لَوْنُ السَّمَاءِ', english: 'the color of the sky', french: 'la couleur du ciel' },
        ],
      },

      {
        type: 'text',
        content: 'Places & Buildings',
        contentFr: 'Lieux et bâtiments',
      },
      {
        type: 'examples_grid',
        content: 'Location-related Idafa',
        contentFr: 'Idafa liée aux lieux',
        examples: [
          { arabic: 'مُدِيرُ الْمَدْرَسَةِ', english: 'the school principal', french: 'le directeur de l\'école' },
          { arabic: 'بَابُ الْمَسْجِدِ', english: 'the mosque door', french: 'la porte de la mosquée' },
          { arabic: 'شَارِعُ الْمَدِينَةِ', english: 'the city street', french: 'la rue de la ville' },
          { arabic: 'سُوقُ الْخُضَارِ', english: 'the vegetable market', french: 'le marché de légumes' },
          { arabic: 'مَكْتَبَةُ الْجَامِعَةِ', english: 'the university library', french: 'la bibliothèque de l\'université' },
          { arabic: 'مَطْبَخُ الْبَيْتِ', english: 'the house kitchen', french: 'la cuisine de la maison' },
        ],
      },

      {
        type: 'text',
        content: 'Definite vs Indefinite Idafa',
        contentFr: 'Idafa définie vs indéfinie',
      },
      {
        type: 'comparison_grid',
        content: 'ال on second noun makes it definite',
        contentFr: 'ال sur le second nom le rend défini',
        leftLabel: 'Indefinite (a...)',
        leftLabelFr: 'Indéfini (un...)',
        rightLabel: 'Definite (the...)',
        rightLabelFr: 'Défini (le...)',
        comparisons: [
          { left: { arabic: 'بَابُ بَيْتٍ', label: 'a door of a house', labelFr: 'une porte d\'une maison' }, right: { arabic: 'بَابُ الْبَيْتِ', label: 'the door of the house', labelFr: 'la porte de la maison' } },
          { left: { arabic: 'كِتَابُ طَالِبٍ', label: 'a student\'s book', labelFr: 'un livre d\'un étudiant' }, right: { arabic: 'كِتَابُ الطَّالِبِ', label: 'the student\'s book', labelFr: 'le livre de l\'étudiant' } },
          { left: { arabic: 'قَلَمُ مُعَلِّمٍ', label: 'a teacher\'s pen', labelFr: 'un stylo d\'un enseignant' }, right: { arabic: 'قَلَمُ الْمُعَلِّمِ', label: 'the teacher\'s pen', labelFr: 'le stylo de l\'enseignant' } },
        ],
      },

      {
        type: 'text',
        content: 'Common Expressions with Idafa',
        contentFr: 'Expressions courantes avec l\'Idafa',
      },
      {
        type: 'examples_grid',
        content: 'Everyday phrases',
        contentFr: 'Expressions quotidiennes',
        examples: [
          { arabic: 'صَبَاحُ الْخَيْرِ', english: 'good morning (morning of goodness)', french: 'bonjour (matin de bonté)' },
          { arabic: 'مَسَاءُ النُّورِ', english: 'good evening (evening of light)', french: 'bonsoir (soir de lumière)' },
          { arabic: 'غُرْفَةُ النَّوْمِ', english: 'bedroom (room of sleep)', french: 'chambre à coucher (chambre du sommeil)' },
          { arabic: 'غُرْفَةُ الْجُلُوسِ', english: 'living room (sitting room)', french: 'salon (chambre de l\'assise)' },
          { arabic: 'رَقْمُ الْهَاتِفِ', english: 'phone number', french: 'numéro de téléphone' },
          { arabic: 'بِطَاقَةُ الْهَوِيَّةِ', english: 'identity card', french: 'carte d\'identité' },
        ],
      },

      {
        type: 'text',
        content: 'Body & Family',
        contentFr: 'Corps et famille',
      },
      {
        type: 'examples_grid',
        content: 'People and parts',
        contentFr: 'Personnes et parties du corps',
        examples: [
          { arabic: 'أَبُ الْوَلَدِ', english: 'the boy\'s father', french: 'le père du garçon' },
          { arabic: 'أُمُّ الْبِنْتِ', english: 'the girl\'s mother', french: 'la mère de la fille' },
          { arabic: 'يَدُ الطِّفْلِ', english: 'the child\'s hand', french: 'la main de l\'enfant' },
          { arabic: 'عَيْنُ الْقِطَّةِ', english: 'the cat\'s eye', french: 'l\'oeil du chat' },
        ],
      },

      {
        type: 'text',
        content: 'Chain Idafa (3+ Nouns)',
        contentFr: 'Idafa en chaîne (3+ noms)',
      },
      {
        type: 'examples_grid',
        content: 'Complex possession chains',
        contentFr: 'Chaînes de possession complexes',
        examples: [
          { arabic: 'مُدِيرُ مَكْتَبِ الشَّرِكَةِ', english: 'the company office manager', french: 'le directeur du bureau de l\'entreprise' },
          { arabic: 'بَابُ غُرْفَةِ الْجُلُوسِ', english: 'the living room door', french: 'la porte du salon' },
          { arabic: 'كِتَابُ مُعَلِّمِ الْمَدْرَسَةِ', english: 'the school teacher\'s book', french: 'le livre de l\'enseignant de l\'école' },
          { arabic: 'سَيَّارَةُ صَدِيقِ أَخِي', english: 'my brother\'s friend\'s car', french: 'la voiture de l\'ami de mon frère' },
        ],
      },

      {
        type: 'note',
        content: 'Idafa is everywhere in Arabic! Once you master it, you\'ll understand compound words, titles, and everyday expressions. Remember: [[First noun = no ال]], second noun = add ال for "the".',
        contentFr: 'L\'Idafa est partout en arabe ! Une fois maîtrisée, vous comprendrez les mots composés, les titres et les expressions quotidiennes. Retenez : [[Premier nom = pas de ال]], second nom = ajoutez ال pour « le/la ».',
        arabicDescription: 'الْإِضَافَة أَسَاسِيَّة جِدًّا فِي الْعَرَبِيَّة',
        arabicTranslation: 'Idafa is very fundamental in Arabic',
        arabicTranslationFr: 'L\'Idafa est très fondamentale en arabe',
      },
    ],
  },

  // LESSON 18: Plurals (Intermediate)
  {
    id: 'grammar-18',
    title: 'Plurals (Sound & Broken)',
    titleFr: 'Les Pluriels (Réguliers & Irréguliers)',
    titleArabic: 'الْجَمْع',
    description: 'Master sound plurals and common broken plural patterns',
    descriptionFr: 'Maîtrisez les pluriels réguliers et les schèmes de pluriels irréguliers',
    level: 'intermediate',
    category: 'nouns',
    order: 18,
    exercises: ['ex-grammar-18-1', 'ex-grammar-18-2', 'ex-grammar-18-3'],
    content: [
      {
        type: 'description',
        content: 'Arabic plurals are unique! There are [[sound plurals]] (add endings like English -s) and [[broken plurals]] (internal pattern changes). Broken plurals are more common and give Arabic its distinctive sound!',
        contentFr: 'Les pluriels arabes sont uniques ! Il y a les [[pluriels réguliers]] (on ajoute des terminaisons comme le -s en français) et les [[pluriels irréguliers]] (changements internes du schème). Les pluriels irréguliers sont plus courants et donnent à l\'arabe sa sonorité distinctive !',
        arabicDescription: 'الْجَمْع السَّالِم وَجَمْع التَّكْسِير',
        arabicTranslation: 'Sound plurals and broken plurals',
        arabicTranslationFr: 'Pluriels réguliers et pluriels irréguliers',
      },

      {
        type: 'text',
        content: 'Sound Masculine Plural (ـونَ / ـينَ)',
        contentFr: 'Pluriel masculin régulier (ـونَ / ـينَ)',
      },
      {
        type: 'rule',
        content: 'For [[male humans]]: add [[ـونَ]] (nominative) or [[ـينَ]] (accusative/genitive). Simple and predictable!',
        contentFr: 'Pour les [[hommes]] : ajoutez [[ـونَ]] (nominatif) ou [[ـينَ]] (accusatif/génitif). Simple et prévisible !',
        arabicDescription: 'جَمْع الْمُذَكَّر السَّالِم لِلْعَاقِل',
        arabicTranslation: 'Sound masculine plural for rational beings',
        arabicTranslationFr: 'Pluriel masculin régulier pour les êtres doués de raison',
      },
      {
        type: 'comparison_grid',
        content: 'Singular → Plural',
        contentFr: 'Singulier → Pluriel',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'مُعَلِّم', label: 'teacher (m)', labelFr: 'enseignant (m)' }, right: { arabic: 'مُعَلِّمُونَ', label: 'teachers', labelFr: 'enseignants' } },
          { left: { arabic: 'مُهَنْدِس', label: 'engineer', labelFr: 'ingénieur' }, right: { arabic: 'مُهَنْدِسُونَ', label: 'engineers', labelFr: 'ingénieurs' } },
          { left: { arabic: 'مُسْلِم', label: 'Muslim (m)', labelFr: 'musulman (m)' }, right: { arabic: 'مُسْلِمُونَ', label: 'Muslims', labelFr: 'musulmans' } },
          { left: { arabic: 'عَامِل', label: 'worker', labelFr: 'ouvrier' }, right: { arabic: 'عَامِلُونَ', label: 'workers', labelFr: 'ouvriers' } },
          { left: { arabic: 'طَالِب', label: 'student (m)', labelFr: 'étudiant (m)' }, right: { arabic: 'طَالِبُونَ', label: 'students', labelFr: 'étudiants' } },
        ],
      },

      {
        type: 'text',
        content: 'Sound Feminine Plural (ـات)',
        contentFr: 'Pluriel féminin régulier (ـات)',
      },
      {
        type: 'rule',
        content: 'For [[feminine nouns]] (especially ending in [[ة]]): remove ة and add [[ـات]]. Also works for foreign words!',
        contentFr: 'Pour les [[noms féminins]] (surtout ceux terminant par [[ة]]) : enlevez ة et ajoutez [[ـات]]. Fonctionne aussi pour les mots étrangers !',
        arabicDescription: 'جَمْع الْمُؤَنَّث السَّالِم',
        arabicTranslation: 'Sound feminine plural',
        arabicTranslationFr: 'Pluriel féminin régulier',
      },
      {
        type: 'comparison_grid',
        content: 'ة → ات',
        contentFr: 'ة → ات',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'مُعَلِّمَة', label: 'teacher (f)', labelFr: 'enseignante (f)' }, right: { arabic: 'مُعَلِّمَات', label: 'teachers', labelFr: 'enseignantes' } },
          { left: { arabic: 'سَيَّارَة', label: 'car', labelFr: 'voiture' }, right: { arabic: 'سَيَّارَات', label: 'cars', labelFr: 'voitures' } },
          { left: { arabic: 'طَائِرَة', label: 'airplane', labelFr: 'avion' }, right: { arabic: 'طَائِرَات', label: 'airplanes', labelFr: 'avions' } },
          { left: { arabic: 'جَامِعَة', label: 'university', labelFr: 'université' }, right: { arabic: 'جَامِعَات', label: 'universities', labelFr: 'universités' } },
          { left: { arabic: 'كَلِمَة', label: 'word', labelFr: 'mot' }, right: { arabic: 'كَلِمَات', label: 'words', labelFr: 'mots' } },
        ],
      },

      {
        type: 'text',
        content: 'Broken Plurals — Pattern Changes',
        contentFr: 'Pluriels irréguliers — Changements de schème',
      },
      {
        type: 'rule',
        content: 'Broken plurals change the [[internal vowels]] of the word! They follow patterns. The most common: [[فُعُول]], [[أَفْعَال]], [[فِعَال]].',
        contentFr: 'Les pluriels irréguliers changent les [[voyelles internes]] du mot ! Ils suivent des schèmes. Les plus courants : [[فُعُول]], [[أَفْعَال]], [[فِعَال]].',
        arabicDescription: 'جَمْع التَّكْسِير يُغَيِّر بِنَاء الْكَلِمَة',
        arabicTranslation: 'Broken plural changes the word structure',
        arabicTranslationFr: 'Le pluriel irrégulier change la structure du mot',
      },

      {
        type: 'text',
        content: 'Pattern: فُعُول',
        contentFr: 'Schème : فُعُول',
      },
      {
        type: 'comparison_grid',
        content: 'CuCūC pattern',
        contentFr: 'Schème CuCūC',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'بَيْت', label: 'house', labelFr: 'maison' }, right: { arabic: 'بُيُوت', label: 'houses', labelFr: 'maisons' } },
          { left: { arabic: 'قَلْب', label: 'heart', labelFr: 'coeur' }, right: { arabic: 'قُلُوب', label: 'hearts', labelFr: 'coeurs' } },
          { left: { arabic: 'عَيْن', label: 'eye', labelFr: 'oeil' }, right: { arabic: 'عُيُون', label: 'eyes', labelFr: 'yeux' } },
          { left: { arabic: 'شَيْخ', label: 'sheikh', labelFr: 'cheikh' }, right: { arabic: 'شُيُوخ', label: 'sheikhs', labelFr: 'cheikhs' } },
        ],
      },

      {
        type: 'text',
        content: 'Pattern: أَفْعَال',
        contentFr: 'Schème : أَفْعَال',
      },
      {
        type: 'comparison_grid',
        content: 'aCCāC pattern',
        contentFr: 'Schème aCCāC',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'قَلَم', label: 'pen', labelFr: 'stylo' }, right: { arabic: 'أَقْلَام', label: 'pens', labelFr: 'stylos' } },
          { left: { arabic: 'وَلَد', label: 'boy', labelFr: 'garçon' }, right: { arabic: 'أَوْلَاد', label: 'boys', labelFr: 'garçons' } },
          { left: { arabic: 'يَوْم', label: 'day', labelFr: 'jour' }, right: { arabic: 'أَيَّام', label: 'days', labelFr: 'jours' } },
          { left: { arabic: 'شَهْر', label: 'month', labelFr: 'mois' }, right: { arabic: 'أَشْهُر', label: 'months', labelFr: 'mois' } },
        ],
      },

      {
        type: 'text',
        content: 'Pattern: فِعَال / فُعَّال',
        contentFr: 'Schème : فِعَال / فُعَّال',
      },
      {
        type: 'comparison_grid',
        content: 'CiCāC pattern',
        contentFr: 'Schème CiCāC',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'رَجُل', label: 'man', labelFr: 'homme' }, right: { arabic: 'رِجَال', label: 'men', labelFr: 'hommes' } },
          { left: { arabic: 'جَبَل', label: 'mountain', labelFr: 'montagne' }, right: { arabic: 'جِبَال', label: 'mountains', labelFr: 'montagnes' } },
          { left: { arabic: 'كِتَاب', label: 'book', labelFr: 'livre' }, right: { arabic: 'كُتُب', label: 'books', labelFr: 'livres' } },
          { left: { arabic: 'طَالِب', label: 'student', labelFr: 'étudiant' }, right: { arabic: 'طُلَّاب', label: 'students', labelFr: 'étudiants' } },
        ],
      },

      {
        type: 'text',
        content: 'More Common Broken Plurals',
        contentFr: 'Autres pluriels irréguliers courants',
      },
      {
        type: 'examples_grid',
        content: 'Memorize these!',
        contentFr: 'Mémorisez-les !',
        examples: [
          { arabic: 'صَدِيق ← أَصْدِقَاء', english: 'friend → friends', french: 'ami → amis' },
          { arabic: 'طَرِيق ← طُرُق', english: 'road → roads', french: 'route → routes' },
          { arabic: 'مَدِينَة ← مُدُن', english: 'city → cities', french: 'ville → villes' },
          { arabic: 'دَوْلَة ← دُوَل', english: 'country → countries', french: 'pays → pays' },
          { arabic: 'لُغَة ← لُغَات', english: 'language → languages', french: 'langue → langues' },
          { arabic: 'أُسْتَاذ ← أَسَاتِذَة', english: 'professor → professors', french: 'professeur → professeurs' },
        ],
      },

      {
        type: 'rule',
        content: 'Important: [[Non-human plurals]] are treated as [[feminine singular]] for adjective agreement! [[الْكُتُبُ الْجَدِيدَةُ]] (the new books) NOT الجديدون.',
        contentFr: 'Important : les [[pluriels non-humains]] sont traités comme [[féminin singulier]] pour l\'accord des adjectifs ! [[الْكُتُبُ الْجَدِيدَةُ]] (les nouveaux livres) et NON الجديدون.',
        arabicDescription: 'جَمْع غَيْر الْعَاقِل يُعَامَل مُعَامَلَة الْمُفْرَد الْمُؤَنَّث',
        arabicTranslation: 'Non-human plurals are treated as feminine singular',
        arabicTranslationFr: 'Les pluriels non-humains sont traités comme féminin singulier',
      },

      {
        type: 'examples_grid',
        content: 'Non-human plurals with adjectives',
        contentFr: 'Pluriels non-humains avec adjectifs',
        examples: [
          { arabic: 'الْكُتُبُ الْجَدِيدَةُ', english: 'the new books', french: 'les nouveaux livres' },
          { arabic: 'السَّيَّارَاتُ الْكَبِيرَةُ', english: 'the big cars', french: 'les grandes voitures' },
          { arabic: 'الْبُيُوتُ الْجَمِيلَةُ', english: 'the beautiful houses', french: 'les belles maisons' },
          { arabic: 'الْأَيَّامُ الْمَاضِيَةُ', english: 'the past days', french: 'les jours passés' },
        ],
      },

      {
        type: 'note',
        content: 'Broken plurals need memorization, but patterns help! When you learn a new noun, learn its plural too. Soon you\'ll start recognizing patterns automatically!',
        contentFr: 'Les pluriels irréguliers nécessitent de la mémorisation, mais les schèmes aident ! Quand vous apprenez un nouveau nom, apprenez aussi son pluriel. Bientôt vous reconnaîtrez les schèmes automatiquement !',
        arabicDescription: 'تَعَلَّم الْجَمْع مَعَ الْمُفْرَد',
        arabicTranslation: 'Learn the plural with the singular',
        arabicTranslationFr: 'Apprenez le pluriel avec le singulier',
      },
    ],
  },

  // LESSON 19: Dual Form
  {
    id: 'grammar-19',
    title: 'The Dual Form',
    titleFr: 'Le Duel',
    titleArabic: 'الْمُثَنَّى',
    description: 'Learn the special Arabic form for exactly two things',
    descriptionFr: 'Apprenez la forme arabe spéciale pour exactement deux choses',
    level: 'intermediate',
    category: 'nouns',
    order: 19,
    exercises: ['ex-grammar-19-1', 'ex-grammar-19-2', 'ex-grammar-19-3'],
    content: [
      {
        type: 'description',
        content: 'Arabic has something special that English doesn\'t: the [[dual]] form! When you have [[exactly two]] of something, you use a special ending instead of the plural. It\'s used for nouns, verbs, pronouns, and adjectives!',
        contentFr: 'L\'arabe possède quelque chose de spécial que le français n\'a pas : la forme [[duelle]] ! Quand vous avez [[exactement deux]] choses, vous utilisez une terminaison spéciale au lieu du pluriel. Elle s\'utilise pour les noms, les verbes, les pronoms et les adjectifs !',
        arabicDescription: 'الْمُثَنَّى لِلتَّعْبِير عَنْ اثْنَيْنِ',
        arabicTranslation: 'The dual is for expressing two',
        arabicTranslationFr: 'Le duel sert à exprimer deux',
      },
      {
        type: 'rule',
        content: 'Add [[ـانِ]] to the singular noun. For words ending in [[ة]], first change ة to ت, then add انِ: [[طَالِبَة]] → [[طَالِبَتَانِ]].',
        contentFr: 'Ajoutez [[ـانِ]] au nom singulier. Pour les mots terminant par [[ة]], changez d\'abord ة en ت, puis ajoutez انِ : [[طَالِبَة]] → [[طَالِبَتَانِ]].',
        arabicDescription: 'أَضِف ـانِ لِلْمَرْفُوع وَـيْنِ لِلْمَنْصُوب وَالْمَجْرُور',
        arabicTranslation: 'Add -aan for nominative and -ayn for accusative and genitive',
        arabicTranslationFr: 'Ajoutez -aan pour le nominatif et -ayn pour l\'accusatif et le génitif',
      },

      {
        type: 'text',
        content: 'Nouns in Dual Form',
        contentFr: 'Noms au duel',
      },
      {
        type: 'comparison_grid',
        content: 'Singular → Dual',
        contentFr: 'Singulier → Duel',
        leftLabel: 'Singular (One)',
        leftLabelFr: 'Singulier (Un)',
        rightLabel: 'Dual (Two)',
        rightLabelFr: 'Duel (Deux)',
        comparisons: [
          { left: { arabic: 'كِتَاب', label: 'book', labelFr: 'livre' }, right: { arabic: 'كِتَابَانِ', label: 'two books', labelFr: 'deux livres' } },
          { left: { arabic: 'طَالِب', label: 'student (m)', labelFr: 'étudiant (m)' }, right: { arabic: 'طَالِبَانِ', label: 'two students', labelFr: 'deux étudiants' } },
          { left: { arabic: 'طَالِبَة', label: 'student (f)', labelFr: 'étudiante (f)' }, right: { arabic: 'طَالِبَتَانِ', label: 'two students', labelFr: 'deux étudiantes' } },
          { left: { arabic: 'بَيْت', label: 'house', labelFr: 'maison' }, right: { arabic: 'بَيْتَانِ', label: 'two houses', labelFr: 'deux maisons' } },
          { left: { arabic: 'يَوْم', label: 'day', labelFr: 'jour' }, right: { arabic: 'يَوْمَانِ', label: 'two days', labelFr: 'deux jours' } },
          { left: { arabic: 'سَاعَة', label: 'hour', labelFr: 'heure' }, right: { arabic: 'سَاعَتَانِ', label: 'two hours', labelFr: 'deux heures' } },
        ],
      },

      {
        type: 'text',
        content: 'Body Parts (Natural Pairs)',
        contentFr: 'Parties du corps (Paires naturelles)',
      },
      {
        type: 'examples_grid',
        content: 'Parts that come in twos',
        contentFr: 'Parties qui vont par deux',
        examples: [
          { arabic: 'يَدَانِ', english: 'two hands', french: 'deux mains' },
          { arabic: 'عَيْنَانِ', english: 'two eyes', french: 'deux yeux' },
          { arabic: 'أُذُنَانِ', english: 'two ears', french: 'deux oreilles' },
          { arabic: 'رِجْلَانِ', english: 'two legs', french: 'deux jambes' },
          { arabic: 'قَدَمَانِ', english: 'two feet', french: 'deux pieds' },
          { arabic: 'جَنَاحَانِ', english: 'two wings', french: 'deux ailes' },
        ],
      },

      {
        type: 'text',
        content: 'Dual Pronouns',
        contentFr: 'Pronoms duels',
      },
      {
        type: 'rule',
        content: 'Two special pronouns: [[هُمَا]] (they two) and [[أَنْتُمَا]] (you two). Both work for masculine AND feminine!',
        contentFr: 'Deux pronoms spéciaux : [[هُمَا]] (eux/elles deux) et [[أَنْتُمَا]] (vous deux). Les deux fonctionnent pour le masculin ET le féminin !',
        arabicDescription: 'هُمَا وَأَنْتُمَا لِلْمُذَكَّر وَالْمُؤَنَّث',
        arabicTranslation: 'Huma and Antuma are for both masculine and feminine',
        arabicTranslationFr: 'Huma et Antuma sont pour le masculin et le féminin',
      },
      {
        type: 'examples_grid',
        content: 'Using dual pronouns',
        contentFr: 'Utilisation des pronoms duels',
        examples: [
          { arabic: 'هُمَا طَالِبَانِ', english: 'They two are students (m)', french: 'Eux deux sont étudiants (m)' },
          { arabic: 'هُمَا طَالِبَتَانِ', english: 'They two are students (f)', french: 'Elles deux sont étudiantes (f)' },
          { arabic: 'أَنْتُمَا صَدِيقَانِ', english: 'You two are friends', french: 'Vous deux êtes amis' },
          { arabic: 'هُمَا فِي الْبَيْتِ', english: 'They two are at home', french: 'Eux deux sont à la maison' },
        ],
      },

      {
        type: 'text',
        content: 'Dual Verbs — Past Tense',
        contentFr: 'Verbes au duel — Passé',
      },
      {
        type: 'examples_grid',
        content: 'Two people did something',
        contentFr: 'Deux personnes ont fait quelque chose',
        examples: [
          { arabic: 'ذَهَبَا', english: 'they two went (m)', french: 'eux deux sont allés (m)' },
          { arabic: 'ذَهَبَتَا', english: 'they two went (f)', french: 'elles deux sont allées (f)' },
          { arabic: 'كَتَبَا الدَّرْسَ', english: 'they two wrote the lesson', french: 'eux deux ont écrit la leçon' },
          { arabic: 'أَكَلَتَا الطَّعَامَ', english: 'they two ate the food (f)', french: 'elles deux ont mangé la nourriture (f)' },
        ],
      },

      {
        type: 'text',
        content: 'Dual Verbs — Present Tense',
        contentFr: 'Verbes au duel — Présent',
      },
      {
        type: 'examples_grid',
        content: 'Two people do something',
        contentFr: 'Deux personnes font quelque chose',
        examples: [
          { arabic: 'يَذْهَبَانِ', english: 'they two go (m)', french: 'eux deux vont (m)' },
          { arabic: 'تَذْهَبَانِ', english: 'they two go (f) / you two go', french: 'elles deux vont (f) / vous deux allez' },
          { arabic: 'يَكْتُبَانِ', english: 'they two write (m)', french: 'eux deux écrivent (m)' },
          { arabic: 'تَقْرَآنِ', english: 'they two read (f)', french: 'elles deux lisent (f)' },
        ],
      },

      {
        type: 'text',
        content: 'Dual in Complete Sentences',
        contentFr: 'Le duel dans des phrases complètes',
      },
      {
        type: 'examples_grid',
        content: 'Practical examples',
        contentFr: 'Exemples pratiques',
        examples: [
          { arabic: 'عِنْدِي كِتَابَانِ', english: 'I have two books', french: 'J\'ai deux livres' },
          { arabic: 'الطَّالِبَانِ ذَهَبَا إِلَى الْمَكْتَبَةِ', english: 'The two students went to the library', french: 'Les deux étudiants sont allés à la bibliothèque' },
          { arabic: 'الْبِنْتَانِ تَلْعَبَانِ', english: 'The two girls are playing', french: 'Les deux filles jouent' },
          { arabic: 'اِشْتَرَيْتُ قَمِيصَيْنِ', english: 'I bought two shirts', french: 'J\'ai acheté deux chemises' },
          { arabic: 'فِي الْغُرْفَةِ نَافِذَتَانِ', english: 'There are two windows in the room', french: 'Il y a deux fenêtres dans la chambre' },
          { arabic: 'الْأُسْبُوعُ سَبْعَةُ أَيَّامٍ وَيَوْمَانِ لِلْعُطْلَةِ', english: 'A week has seven days and two days are weekend', french: 'La semaine a sept jours et deux jours sont le week-end' },
        ],
      },

      {
        type: 'note',
        content: 'The dual is elegant! Instead of saying [[كِتَابَانِ اثْنَانِ]] (two books - redundant), just say [[كِتَابَانِ]]. The ending already tells you it\'s two!',
        contentFr: 'Le duel est élégant ! Au lieu de dire [[كِتَابَانِ اثْنَانِ]] (deux livres - redondant), dites simplement [[كِتَابَانِ]]. La terminaison indique déjà que c\'est deux !',
        arabicDescription: 'الْمُثَنَّى يُغْنِي عَنْ ذِكْر الْعَدَد',
        arabicTranslation: 'The dual makes mentioning the number unnecessary',
        arabicTranslationFr: 'Le duel rend inutile la mention du nombre',
      },
    ],
  },

  // LESSON 20: Object Pronouns
  {
    id: 'grammar-20',
    title: 'Object Pronouns (Attached)',
    titleFr: 'Pronoms Compléments (Suffixés)',
    titleArabic: 'الضَّمَائِر الْمُتَّصِلَة',
    description: 'Learn "me", "him", "her", "us" attached to verbs',
    descriptionFr: 'Apprenez « me », « lui », « elle », « nous » attachés aux verbes',
    level: 'intermediate',
    category: 'pronouns',
    order: 20,
    exercises: ['ex-grammar-20-1', 'ex-grammar-20-2', 'ex-grammar-20-3'],
    content: [
      {
        type: 'description',
        content: 'How do you say "he saw [[me]]" or "I love [[her]]"? In Arabic, object pronouns are [[attached directly]] to the verb as suffixes! No separate word needed — they become part of the verb!',
        contentFr: 'Comment dit-on « il m\'a vu [[moi]] » ou « j\'aime [[elle]] » ? En arabe, les pronoms compléments sont [[attachés directement]] au verbe sous forme de suffixes ! Pas de mot séparé — ils font partie du verbe !',
        arabicDescription: 'الضَّمَائِر الْمُتَّصِلَة تُضَاف إِلَى آخِر الْفِعْل',
        arabicTranslation: 'Attached pronouns are added to the end of the verb',
        arabicTranslationFr: 'Les pronoms attachés sont ajoutés à la fin du verbe',
      },
      {
        type: 'rule',
        content: 'These suffixes are the [[same]] as possessive suffixes on nouns! [[كِتَابِي]] (my book) uses the same [[ـي]] as [[رَآنِي]] (he saw me).',
        contentFr: 'Ces suffixes sont les [[mêmes]] que les suffixes possessifs sur les noms ! [[كِتَابِي]] (mon livre) utilise le même [[ـي]] que [[رَآنِي]] (il m\'a vu).',
        arabicDescription: 'نَفْس ضَمَائِر الْمِلْكِيَّة',
        arabicTranslation: 'Same as possessive pronouns',
        arabicTranslationFr: 'Les mêmes que les pronoms possessifs',
      },

      {
        type: 'text',
        content: 'Object Pronoun Suffixes',
        contentFr: 'Suffixes des pronoms compléments',
      },
      {
        type: 'examples_grid',
        content: 'All the suffixes',
        contentFr: 'Tous les suffixes',
        examples: [
          { arabic: 'ـنِي', english: 'me', french: 'me / moi' },
          { arabic: 'ـكَ', english: 'you (m)', french: 'te / toi (m)' },
          { arabic: 'ـكِ', english: 'you (f)', french: 'te / toi (f)' },
          { arabic: 'ـهُ', english: 'him / it (m)', french: 'le / lui (m)' },
          { arabic: 'ـهَا', english: 'her / it (f)', french: 'la / elle (f)' },
          { arabic: 'ـنَا', english: 'us', french: 'nous' },
          { arabic: 'ـكُمْ', english: 'you all', french: 'vous' },
          { arabic: 'ـهُمْ', english: 'them (m)', french: 'les / eux (m)' },
          { arabic: 'ـهُنَّ', english: 'them (f)', french: 'les / elles (f)' },
        ],
      },

      {
        type: 'text',
        content: 'Me & Us (First Person)',
        contentFr: 'Moi & Nous (Première personne)',
      },
      {
        type: 'examples_grid',
        content: 'Someone did something to me/us',
        contentFr: 'Quelqu\'un m\'a / nous a fait quelque chose',
        examples: [
          { arabic: 'رَآنِي', english: 'he saw me', french: 'il m\'a vu' },
          { arabic: 'سَمِعَنِي', english: 'he heard me', french: 'il m\'a entendu' },
          { arabic: 'سَأَلَنِي', english: 'he asked me', french: 'il m\'a demandé' },
          { arabic: 'أَخْبَرَنِي', english: 'he told me', french: 'il m\'a informé' },
          { arabic: 'زَارَنَا', english: 'he visited us', french: 'il nous a rendus visite' },
          { arabic: 'سَاعَدَنَا', english: 'he helped us', french: 'il nous a aidés' },
        ],
      },

      {
        type: 'text',
        content: 'Him & Her (Third Person)',
        contentFr: 'Lui & Elle (Troisième personne)',
      },
      {
        type: 'examples_grid',
        content: 'I/someone did something to him/her',
        contentFr: 'J\'ai / quelqu\'un a fait quelque chose à lui/elle',
        examples: [
          { arabic: 'رَأَيْتُهُ', english: 'I saw him', french: 'je l\'ai vu' },
          { arabic: 'رَأَيْتُهَا', english: 'I saw her', french: 'je l\'ai vue' },
          { arabic: 'سَاعَدْتُهُ', english: 'I helped him', french: 'je l\'ai aidé' },
          { arabic: 'سَأَلْتُهَا', english: 'I asked her', french: 'je lui ai demandé' },
          { arabic: 'أَحَبَّتْهُ', english: 'she loved him', french: 'elle l\'a aimé' },
          { arabic: 'عَرَفَتْهَا', english: 'she knew her', french: 'elle l\'a connue' },
        ],
      },

      {
        type: 'text',
        content: 'You (Second Person)',
        contentFr: 'Toi / Vous (Deuxième personne)',
      },
      {
        type: 'examples_grid',
        content: 'I did something to you',
        contentFr: 'J\'ai fait quelque chose à toi',
        examples: [
          { arabic: 'رَأَيْتُكَ', english: 'I saw you (m)', french: 'je t\'ai vu (m)' },
          { arabic: 'رَأَيْتُكِ', english: 'I saw you (f)', french: 'je t\'ai vue (f)' },
          { arabic: 'سَمِعْتُكَ', english: 'I heard you (m)', french: 'je t\'ai entendu (m)' },
          { arabic: 'فَهِمْتُكِ', english: 'I understood you (f)', french: 'je t\'ai comprise (f)' },
          { arabic: 'أُحِبُّكَ', english: 'I love you (m)', french: 'je t\'aime (m)' },
          { arabic: 'أُحِبُّكِ', english: 'I love you (f)', french: 'je t\'aime (f)' },
        ],
      },

      {
        type: 'text',
        content: 'Them (Third Person Plural)',
        contentFr: 'Eux / Elles (Troisième personne du pluriel)',
      },
      {
        type: 'examples_grid',
        content: 'Someone did something to them',
        contentFr: 'Quelqu\'un leur a fait quelque chose',
        examples: [
          { arabic: 'رَأَيْتُهُمْ', english: 'I saw them', french: 'je les ai vus' },
          { arabic: 'سَأَلْنَاهُمْ', english: 'we asked them', french: 'nous leur avons demandé' },
          { arabic: 'زَارَهُمْ', english: 'he visited them', french: 'il leur a rendu visite' },
          { arabic: 'عَلَّمَهُمْ', english: 'he taught them', french: 'il les a enseignés' },
        ],
      },

      {
        type: 'text',
        content: 'Present Tense + Object Pronouns',
        contentFr: 'Présent + Pronoms compléments',
      },
      {
        type: 'examples_grid',
        content: 'Current actions with objects',
        contentFr: 'Actions actuelles avec compléments',
        examples: [
          { arabic: 'يَرَانِي', english: 'he sees me', french: 'il me voit' },
          { arabic: 'أَرَاهَا', english: 'I see her', french: 'je la vois' },
          { arabic: 'يُحِبُّهَا', english: 'he loves her', french: 'il l\'aime' },
          { arabic: 'تَسْأَلُنِي', english: 'she asks me', french: 'elle me demande' },
          { arabic: 'يُعَلِّمُنَا', english: 'he teaches us', french: 'il nous enseigne' },
          { arabic: 'نَفْهَمُهُ', english: 'we understand him', french: 'nous le comprenons' },
        ],
      },

      {
        type: 'text',
        content: 'In Complete Sentences',
        contentFr: 'Dans des phrases complètes',
      },
      {
        type: 'examples_grid',
        content: 'Natural conversation',
        contentFr: 'Conversation naturelle',
        examples: [
          { arabic: 'هَلْ فَهِمْتَنِي؟', english: 'Did you understand me?', french: 'Est-ce que tu m\'as compris ?' },
          { arabic: 'الْمُعَلِّمَةُ سَأَلَتْنِي', english: 'The teacher asked me', french: 'L\'enseignante m\'a demandé' },
          { arabic: 'أَعْطَيْتُهُ الْكِتَابَ', english: 'I gave him the book', french: 'Je lui ai donné le livre' },
          { arabic: 'زَارُونَا أَمْسِ', english: 'They visited us yesterday', french: 'Ils nous ont rendu visite hier' },
          { arabic: 'سَأَرَاكَ غَدًا', english: 'I will see you tomorrow', french: 'Je te verrai demain' },
          { arabic: 'أَحَبَّهَا كَثِيرًا', english: 'He loved her very much', french: 'Il l\'a beaucoup aimée' },
        ],
      },

      {
        type: 'rule',
        content: 'With two objects (give, show, teach), [[person comes first]], then thing: [[أَعْطَيْتُهُ الْمَالَ]] (I gave [[him]] the-money) — not the other way around!',
        contentFr: 'Avec deux compléments (donner, montrer, enseigner), [[la personne vient en premier]], puis la chose : [[أَعْطَيْتُهُ الْمَالَ]] (j\'ai donné à [[lui]] l\'argent) — pas l\'inverse !',
        arabicDescription: 'الْمَفْعُول الْأَوَّل لِلشَّخْص وَالثَّانِي لِلشَّيْء',
        arabicTranslation: 'First object for the person, second for the thing',
        arabicTranslationFr: 'Le premier complément pour la personne, le second pour la chose',
      },

      {
        type: 'examples_grid',
        content: 'Double object verbs',
        contentFr: 'Verbes à double complément',
        examples: [
          { arabic: 'أَعْطَيْتُهُ الْكِتَابَ', english: 'I gave him the book', french: 'je lui ai donné le livre' },
          { arabic: 'أَرَيْتُهَا الصُّوَرَ', english: 'I showed her the photos', french: 'je lui ai montré les photos' },
          { arabic: 'عَلَّمَنَا الْعَرَبِيَّةَ', english: 'He taught us Arabic', french: 'il nous a enseigné l\'arabe' },
          { arabic: 'أَرْسَلْتُ لَهُ رِسَالَةً', english: 'I sent him a message', french: 'je lui ai envoyé un message' },
        ],
      },

      {
        type: 'note',
        content: 'Object pronouns make Arabic flow beautifully! Instead of "I saw him yesterday" (3 words), Arabic says [[رَأَيْتُهُ أَمْسِ]] — the verb and object become one smooth word!',
        contentFr: 'Les pronoms compléments rendent l\'arabe fluide et élégant ! Au lieu de « je l\'ai vu hier » (plusieurs mots), l\'arabe dit [[رَأَيْتُهُ أَمْسِ]] — le verbe et le complément ne forment qu\'un seul mot !',
        arabicDescription: 'الضَّمِير الْمُتَّصِل يَجْعَل الْكَلَام أَكْثَر سَلَاسَة',
        arabicTranslation: 'The attached pronoun makes speech smoother',
        arabicTranslationFr: 'Le pronom attaché rend le discours plus fluide',
      },
    ],
  },

  // LESSON 21: Future Tense
  {
    id: 'grammar-21',
    title: 'The Future Tense',
    titleFr: 'Le Futur',
    titleArabic: 'الْمُسْتَقْبَل',
    description: 'Express future plans and predictions with سَـ and سَوْفَ',
    descriptionFr: 'Exprimez des plans et prédictions avec سَـ et سَوْفَ',
    level: 'intermediate',
    category: 'verbs',
    order: 21,
    exercises: ['ex-grammar-21-1', 'ex-grammar-21-2'],
    content: [
      {
        type: 'description',
        content: 'Great news! Arabic future tense is incredibly simple. Just add [[سَـ]] (sa) or [[سَوْفَ]] (sawfa) before any present tense verb, and you\'re talking about the future! No conjugation changes needed.',
        contentFr: 'Bonne nouvelle ! Le futur en arabe est incroyablement simple. Il suffit d\'ajouter [[سَـ]] (sa) ou [[سَوْفَ]] (sawfa) avant n\'importe quel verbe au présent, et vous parlez du futur ! Aucun changement de conjugaison nécessaire.',
        arabicDescription: 'لِلتَّعْبِير عَنِ الْمُسْتَقْبَل نُضِيف سَـ أَوْ سَوْفَ',
        arabicTranslation: 'To express the future, we add Sa or Sawfa',
        arabicTranslationFr: 'Pour exprimer le futur, on ajoute Sa ou Sawfa',
      },
      {
        type: 'rule',
        content: '[[سَـ]] (sa) is a prefix attached directly to the verb for [[near future]]. [[سَوْفَ]] (sawfa) is a separate word for [[distant future]] or more formal contexts. Both work the same way!',
        contentFr: '[[سَـ]] (sa) est un préfixe attaché directement au verbe pour le [[futur proche]]. [[سَوْفَ]] (sawfa) est un mot séparé pour le [[futur lointain]] ou les contextes plus formels. Les deux fonctionnent de la même manière !',
        arabicDescription: 'سَـ لِلْمُسْتَقْبَل الْقَرِيب، سَوْفَ لِلْمُسْتَقْبَل الْبَعِيد',
        arabicTranslation: 'Sa for near future, Sawfa for distant future',
        arabicTranslationFr: 'Sa pour le futur proche, Sawfa pour le futur lointain',
      },
      {
        type: 'text',
        content: 'Near Future with سَـ',
        contentFr: 'Futur proche avec سَـ',
      },
      {
        type: 'examples_grid',
        content: 'Quick, informal future',
        contentFr: 'Futur rapide et informel',
        examples: [
          { arabic: 'سَأَذْهَبُ', english: 'I will go (soon)', french: 'j\'irai (bientôt)' },
          { arabic: 'سَتَكْتُبُ', english: 'You will write', french: 'tu écriras' },
          { arabic: 'سَيَدْرُسُ', english: 'He will study', french: 'il étudiera' },
          { arabic: 'سَتَقْرَأُ', english: 'She will read', french: 'elle lira' },
          { arabic: 'سَنَأْكُلُ', english: 'We will eat', french: 'nous mangerons' },
          { arabic: 'سَيَعْمَلُونَ', english: 'They will work', french: 'ils travailleront' },
        ],
      },
      {
        type: 'text',
        content: 'Distant Future with سَوْفَ',
        contentFr: 'Futur lointain avec سَوْفَ',
      },
      {
        type: 'examples_grid',
        content: 'Formal or distant future',
        contentFr: 'Futur formel ou lointain',
        examples: [
          { arabic: 'سَوْفَ أَذْهَبُ', english: 'I will go (eventually)', french: 'j\'irai (un jour)' },
          { arabic: 'سَوْفَ تَكْتُبُ', english: 'You will write', french: 'tu écriras' },
          { arabic: 'سَوْفَ يَدْرُسُ', english: 'He will study', french: 'il étudiera' },
          { arabic: 'سَوْفَ نَسَافِرُ', english: 'We will travel', french: 'nous voyagerons' },
          { arabic: 'سَوْفَ تَنْجَحُ', english: 'She will succeed', french: 'elle réussira' },
          { arabic: 'سَوْفَ يَفْهَمُونَ', english: 'They will understand', french: 'ils comprendront' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Present vs Future',
        contentFr: 'Présent vs Futur',
        leftLabel: 'Present',
        leftLabelFr: 'Présent',
        rightLabel: 'Future',
        rightLabelFr: 'Futur',
        comparisons: [
          { left: { arabic: 'أَذْهَبُ', label: 'I go', labelFr: 'je vais' }, right: { arabic: 'سَأَذْهَبُ', label: 'I will go', labelFr: 'j\'irai' } },
          { left: { arabic: 'يَكْتُبُ', label: 'He writes', labelFr: 'il écrit' }, right: { arabic: 'سَيَكْتُبُ', label: 'He will write', labelFr: 'il écrira' } },
          { left: { arabic: 'نَدْرُسُ', label: 'We study', labelFr: 'nous étudions' }, right: { arabic: 'سَنَدْرُسُ', label: 'We will study', labelFr: 'nous étudierons' } },
        ],
      },
      {
        type: 'text',
        content: 'In Everyday Sentences',
        contentFr: 'Dans des phrases du quotidien',
      },
      {
        type: 'examples_grid',
        content: 'Natural future expressions',
        contentFr: 'Expressions naturelles au futur',
        examples: [
          { arabic: 'سَأَتَّصِلُ بِكَ غَدًا', english: 'I will call you tomorrow', french: 'je t\'appellerai demain' },
          { arabic: 'سَوْفَ أَزُورُكَ قَرِيبًا', english: 'I will visit you soon', french: 'je te rendrai visite bientôt' },
          { arabic: 'سَيَصِلُ الْقِطَارُ بَعْدَ سَاعَة', english: 'The train will arrive in an hour', french: 'le train arrivera dans une heure' },
          { arabic: 'سَنَلْتَقِي فِي الْمَطْعَم', english: 'We will meet at the restaurant', french: 'nous nous retrouverons au restaurant' },
        ],
      },
      {
        type: 'note',
        content: 'In spoken Arabic, [[سَـ]] is much more common. Use [[سَوْفَ]] for emphasis, promises, or formal writing. Both are correct!',
        contentFr: 'En arabe parlé, [[سَـ]] est beaucoup plus courant. Utilisez [[سَوْفَ]] pour l\'emphase, les promesses ou l\'écrit formel. Les deux sont corrects !',
        arabicDescription: 'سَـ أَكْثَر شُيُوعًا فِي الْكَلَام الْيَوْمِي',
        arabicTranslation: 'Sa is more common in everyday speech',
        arabicTranslationFr: 'Sa est plus courant dans le langage quotidien',
      },
    ],
  },

  // LESSON 22: Imperative (Commands)
  {
    id: 'grammar-22',
    title: 'Commands (Imperative)',
    titleFr: 'Les Ordres (Impératif)',
    titleArabic: 'فِعْلُ الْأَمْر',
    description: 'Give commands and make requests in Arabic',
    descriptionFr: 'Donnez des ordres et faites des demandes en arabe',
    level: 'intermediate',
    category: 'verbs',
    order: 22,
    exercises: ['ex-grammar-22-1', 'ex-grammar-22-2'],
    content: [
      {
        type: 'description',
        content: 'Want to tell someone what to do? Arabic commands are formed from the present tense with some modifications. Commands exist for [[you (masculine)]], [[you (feminine)]], and [[you (plural)]].',
        contentFr: 'Vous voulez dire à quelqu\'un quoi faire ? Les ordres en arabe sont formés à partir du présent avec quelques modifications. Les ordres existent pour [[tu (masculin)]], [[tu (féminin)]] et [[vous (pluriel)]].',
        arabicDescription: 'نَسْتَخْدِم فِعْل الْأَمْر لِلطَّلَب وَالتَّوْجِيه',
        arabicTranslation: 'We use the imperative verb for requests and directions',
        arabicTranslationFr: 'On utilise le verbe impératif pour les demandes et les directives',
      },
      {
        type: 'rule',
        content: 'To form a command: Take the present tense "you" form, [[remove the prefix]] (تَـ or يَـ), and [[adjust the beginning]] if needed. If the result starts with a consonant cluster, add [[اِ]] (i) at the start.',
        contentFr: 'Pour former un ordre : prenez la forme « tu » au présent, [[supprimez le préfixe]] (تَـ ou يَـ), et [[ajustez le début]] si nécessaire. Si le résultat commence par un groupe de consonnes, ajoutez [[اِ]] (i) au début.',
        arabicDescription: 'نَحْذِف حَرْف الْمُضَارَعَة وَنُضِيف هَمْزَة إِذَا لَزِم',
        arabicTranslation: 'We remove the present tense prefix and add hamza if needed',
        arabicTranslationFr: 'On supprime le préfixe du présent et on ajoute une hamza si nécessaire',
      },
      {
        type: 'text',
        content: 'Commands to One Male (أَنْتَ)',
        contentFr: 'Ordres à un homme (أَنْتَ)',
      },
      {
        type: 'examples_grid',
        content: 'Masculine singular commands',
        contentFr: 'Ordres au masculin singulier',
        examples: [
          { arabic: 'اُكْتُبْ!', english: 'Write!', french: 'Écris !' },
          { arabic: 'اِقْرَأْ!', english: 'Read!', french: 'Lis !' },
          { arabic: 'اِذْهَبْ!', english: 'Go!', french: 'Va !' },
          { arabic: 'اُدْرُسْ!', english: 'Study!', french: 'Étudie !' },
          { arabic: 'تَعَالَ!', english: 'Come!', french: 'Viens !' },
          { arabic: 'اِجْلِسْ!', english: 'Sit!', french: 'Assieds-toi !' },
        ],
      },
      {
        type: 'text',
        content: 'Commands to One Female (أَنْتِ)',
        contentFr: 'Ordres à une femme (أَنْتِ)',
      },
      {
        type: 'examples_grid',
        content: 'Feminine singular commands',
        contentFr: 'Ordres au féminin singulier',
        examples: [
          { arabic: 'اُكْتُبِي!', english: 'Write! (f)', french: 'Écris ! (f)' },
          { arabic: 'اِقْرَئِي!', english: 'Read! (f)', french: 'Lis ! (f)' },
          { arabic: 'اِذْهَبِي!', english: 'Go! (f)', french: 'Va ! (f)' },
          { arabic: 'اُدْرُسِي!', english: 'Study! (f)', french: 'Étudie ! (f)' },
          { arabic: 'تَعَالَيْ!', english: 'Come! (f)', french: 'Viens ! (f)' },
          { arabic: 'اِجْلِسِي!', english: 'Sit! (f)', french: 'Assieds-toi ! (f)' },
        ],
      },
      {
        type: 'text',
        content: 'Commands to a Group (أَنْتُم)',
        contentFr: 'Ordres à un groupe (أَنْتُم)',
      },
      {
        type: 'examples_grid',
        content: 'Plural commands',
        contentFr: 'Ordres au pluriel',
        examples: [
          { arabic: 'اُكْتُبُوا!', english: 'Write! (pl)', french: 'Écrivez !' },
          { arabic: 'اِقْرَؤُوا!', english: 'Read! (pl)', french: 'Lisez !' },
          { arabic: 'اِذْهَبُوا!', english: 'Go! (pl)', french: 'Allez !' },
          { arabic: 'اُدْرُسُوا!', english: 'Study! (pl)', french: 'Étudiez !' },
          { arabic: 'تَعَالَوْا!', english: 'Come! (pl)', french: 'Venez !' },
          { arabic: 'اِجْلِسُوا!', english: 'Sit! (pl)', french: 'Asseyez-vous !' },
        ],
      },
      {
        type: 'text',
        content: 'Polite Requests',
        contentFr: 'Demandes polies',
      },
      {
        type: 'examples_grid',
        content: 'Soften commands with من فضلك',
        contentFr: 'Adoucir les ordres avec من فضلك',
        examples: [
          { arabic: 'مِنْ فَضْلِكَ اِجْلِسْ', english: 'Please sit down', french: 'S\'il te plaît, assieds-toi' },
          { arabic: 'لَوْ سَمَحْتَ اُكْتُبْ', english: 'If you please, write', french: 'Si tu le permets, écris' },
          { arabic: 'أَرْجُوكَ اِنْتَظِرْ', english: 'Please wait', french: 'S\'il te plaît, attends' },
          { arabic: 'مِنْ فَضْلِكِ سَاعِدِينِي', english: 'Please help me (f)', french: 'S\'il te plaît, aide-moi (f)' },
        ],
      },
      {
        type: 'note',
        content: 'Commands can sound harsh! Always add [[مِنْ فَضْلِكَ]] (please) or [[لَوْ سَمَحْتَ]] (if you permit) to be polite in formal situations.',
        contentFr: 'Les ordres peuvent paraître durs ! Ajoutez toujours [[مِنْ فَضْلِكَ]] (s\'il te plaît) ou [[لَوْ سَمَحْتَ]] (si tu le permets) pour être poli dans les situations formelles.',
        arabicDescription: 'أَضِفْ مِنْ فَضْلِكَ لِتَكُون مُهَذَّبًا',
        arabicTranslation: 'Add "please" to be polite',
        arabicTranslationFr: 'Ajoutez « s\'il te plaît » pour être poli',
      },
    ],
  },

  // LESSON 23: Relative Pronouns
  {
    id: 'grammar-23',
    title: 'Relative Pronouns',
    titleFr: 'Les Pronoms Relatifs',
    titleArabic: 'الْأَسْمَاء الْمَوْصُولَة',
    description: 'Connect sentences with who, which, and that',
    descriptionFr: 'Reliez les phrases avec qui, lequel et que',
    level: 'intermediate',
    category: 'pronouns',
    order: 23,
    exercises: ['ex-grammar-23-1', 'ex-grammar-23-2'],
    content: [
      {
        type: 'description',
        content: 'Relative pronouns connect two ideas: "The man [[who]] came" or "The book [[that]] I read." Arabic has different relative pronouns depending on [[gender]] and [[number]] of what you\'re referring to.',
        contentFr: 'Les pronoms relatifs relient deux idées : « L\'homme [[qui]] est venu » ou « Le livre [[que]] j\'ai lu. » L\'arabe a différents pronoms relatifs selon le [[genre]] et le [[nombre]] de ce à quoi vous faites référence.',
        arabicDescription: 'الْأَسْمَاء الْمَوْصُولَة تَرْبِط بَيْنَ جُمْلَتَيْن',
        arabicTranslation: 'Relative pronouns connect two sentences',
        arabicTranslationFr: 'Les pronoms relatifs relient deux phrases',
      },
      {
        type: 'rule',
        content: 'The main relative pronoun is [[الَّذِي]] (who/which/that) for masculine singular. It changes based on gender and number: [[الَّتِي]] (feminine), [[الَّذِينَ]] (masculine plural), [[اللَّوَاتِي/اللَّائِي]] (feminine plural).',
        contentFr: 'Le pronom relatif principal est [[الَّذِي]] (qui/lequel/que) pour le masculin singulier. Il change selon le genre et le nombre : [[الَّتِي]] (féminin), [[الَّذِينَ]] (masculin pluriel), [[اللَّوَاتِي/اللَّائِي]] (féminin pluriel).',
        arabicDescription: 'الَّذِي لِلْمُذَكَّر، الَّتِي لِلْمُؤَنَّث',
        arabicTranslation: 'Alladhi for masculine, Allati for feminine',
        arabicTranslationFr: 'Alladhi pour le masculin, Allati pour le féminin',
      },
      {
        type: 'text',
        content: 'Relative Pronouns Chart',
        contentFr: 'Tableau des pronoms relatifs',
      },
      {
        type: 'examples_grid',
        content: 'All forms',
        contentFr: 'Toutes les formes',
        examples: [
          { arabic: 'الَّذِي', english: 'who/which/that (m. sing.)', french: 'qui/lequel/que (m. sing.)' },
          { arabic: 'الَّتِي', english: 'who/which/that (f. sing.)', french: 'qui/laquelle/que (f. sing.)' },
          { arabic: 'الَّذِينَ', english: 'who/which/that (m. pl.)', french: 'qui/lesquels/que (m. pl.)' },
          { arabic: 'اللَّوَاتِي', english: 'who/which/that (f. pl.)', french: 'qui/lesquelles/que (f. pl.)' },
          { arabic: 'اللَّذَانِ', english: 'who/which (m. dual)', french: 'qui/lesquels (m. duel)' },
          { arabic: 'اللَّتَانِ', english: 'who/which (f. dual)', french: 'qui/lesquelles (f. duel)' },
        ],
      },
      {
        type: 'text',
        content: 'Masculine Singular الَّذِي',
        contentFr: 'Masculin singulier الَّذِي',
      },
      {
        type: 'examples_grid',
        content: 'For one male or masculine noun',
        contentFr: 'Pour un nom masculin singulier',
        examples: [
          { arabic: 'الرَّجُلُ الَّذِي جَاءَ', english: 'The man who came', french: 'L\'homme qui est venu' },
          { arabic: 'الْكِتَابُ الَّذِي قَرَأْتُهُ', english: 'The book that I read', french: 'Le livre que j\'ai lu' },
          { arabic: 'الْبَيْتُ الَّذِي اِشْتَرَيْتُهُ', english: 'The house that I bought', french: 'La maison que j\'ai achetée' },
          { arabic: 'الْوَلَدُ الَّذِي يَلْعَبُ', english: 'The boy who is playing', french: 'Le garçon qui joue' },
        ],
      },
      {
        type: 'text',
        content: 'Feminine Singular الَّتِي',
        contentFr: 'Féminin singulier الَّتِي',
      },
      {
        type: 'examples_grid',
        content: 'For one female or feminine noun',
        contentFr: 'Pour un nom féminin singulier',
        examples: [
          { arabic: 'الْمَرْأَةُ الَّتِي جَاءَتْ', english: 'The woman who came', french: 'La femme qui est venue' },
          { arabic: 'السَّيَّارَةُ الَّتِي اِشْتَرَيْتُهَا', english: 'The car that I bought', french: 'La voiture que j\'ai achetée' },
          { arabic: 'الْمَدْرَسَةُ الَّتِي أَدْرُسُ فِيهَا', english: 'The school that I study in', french: 'L\'école dans laquelle j\'étudie' },
          { arabic: 'الْبِنْتُ الَّتِي تَكْتُبُ', english: 'The girl who is writing', french: 'La fille qui écrit' },
        ],
      },
      {
        type: 'text',
        content: 'Plural Forms',
        contentFr: 'Formes plurielles',
      },
      {
        type: 'examples_grid',
        content: 'For groups',
        contentFr: 'Pour les groupes',
        examples: [
          { arabic: 'الرِّجَالُ الَّذِينَ جَاؤُوا', english: 'The men who came', french: 'Les hommes qui sont venus' },
          { arabic: 'النِّسَاءُ اللَّوَاتِي ذَهَبْنَ', english: 'The women who went', french: 'Les femmes qui sont parties' },
          { arabic: 'الطُّلَّابُ الَّذِينَ نَجَحُوا', english: 'The students who passed', french: 'Les étudiants qui ont réussi' },
          { arabic: 'الْمُعَلِّمَاتُ اللَّوَاتِي يُدَرِّسْنَ', english: 'The teachers (f) who teach', french: 'Les enseignantes qui enseignent' },
        ],
      },
      {
        type: 'note',
        content: 'Important! When the relative pronoun is the object of the relative clause, you need a [[resumptive pronoun]]: الْكِتَابُ الَّذِي قَرَأْتُ[[هُ]] — "the book that I read [[it]]".',
        contentFr: 'Important ! Lorsque le pronom relatif est l\'objet de la proposition relative, vous avez besoin d\'un [[pronom de rappel]] : الْكِتَابُ الَّذِي قَرَأْتُ[[هُ]] — « le livre que j\'ai lu [[le]] ».',
        arabicDescription: 'نُضِيف ضَمِيرًا عَائِدًا إِذَا كَانَ الاِسْم مَفْعُولًا بِهِ',
        arabicTranslation: 'We add a resumptive pronoun if the noun is an object',
        arabicTranslationFr: 'On ajoute un pronom de rappel si le nom est un complément d\'objet',
      },
    ],
  },

  // LESSON 24: Conjunctions
  {
    id: 'grammar-24',
    title: 'Conjunctions',
    titleFr: 'Les Conjonctions',
    titleArabic: 'حُرُوف الْعَطْف',
    description: 'Connect words and sentences with and, or, but, then',
    descriptionFr: 'Reliez les mots et les phrases avec et, ou, mais, puis',
    level: 'intermediate',
    category: 'other',
    order: 24,
    exercises: ['ex-grammar-24-1', 'ex-grammar-24-2'],
    content: [
      {
        type: 'description',
        content: 'Conjunctions are the glue that holds sentences together! Arabic has several conjunctions to express different relationships: [[وَ]] (and), [[أَوْ]] (or), [[لَكِنْ]] (but), [[ثُمَّ]] (then), and more.',
        contentFr: 'Les conjonctions sont le ciment qui maintient les phrases ensemble ! L\'arabe possède plusieurs conjonctions pour exprimer différentes relations : [[وَ]] (et), [[أَوْ]] (ou), [[لَكِنْ]] (mais), [[ثُمَّ]] (puis), et plus encore.',
        arabicDescription: 'حُرُوف الْعَطْف تَرْبِط بَيْنَ الْكَلِمَات وَالْجُمَل',
        arabicTranslation: 'Conjunctions connect words and sentences',
        arabicTranslationFr: 'Les conjonctions relient les mots et les phrases',
      },
      {
        type: 'text',
        content: 'وَ (and) - The Most Common',
        contentFr: 'وَ (et) - La plus courante',
      },
      {
        type: 'rule',
        content: '[[وَ]] (wa) means "and" and is [[attached]] directly to the next word. It\'s the most common Arabic conjunction, used constantly to connect words, phrases, and sentences.',
        contentFr: '[[وَ]] (wa) signifie « et » et est [[attaché]] directement au mot suivant. C\'est la conjonction arabe la plus courante, utilisée constamment pour relier des mots, des expressions et des phrases.',
        arabicDescription: 'وَ تَعْنِي "and" وَتَتَّصِل بِالْكَلِمَة الَّتِي بَعْدَهَا',
        arabicTranslation: 'Wa means "and" and attaches to the following word',
        arabicTranslationFr: 'Wa signifie « et » et s\'attache au mot suivant',
      },
      {
        type: 'examples_grid',
        content: 'Using وَ (and)',
        contentFr: 'Utilisation de وَ (et)',
        examples: [
          { arabic: 'أَحْمَدُ وَمُحَمَّد', english: 'Ahmad and Muhammad', french: 'Ahmad et Muhammad' },
          { arabic: 'قَهْوَة وَشَاي', english: 'Coffee and tea', french: 'Café et thé' },
          { arabic: 'جَاءَ وَجَلَسَ', english: 'He came and sat', french: 'Il est venu et s\'est assis' },
          { arabic: 'أَكَلْتُ وَشَرِبْتُ', english: 'I ate and drank', french: 'J\'ai mangé et bu' },
        ],
      },
      {
        type: 'text',
        content: 'أَوْ (or)',
        contentFr: 'أَوْ (ou)',
      },
      {
        type: 'examples_grid',
        content: 'Giving options',
        contentFr: 'Donner des choix',
        examples: [
          { arabic: 'قَهْوَة أَوْ شَاي؟', english: 'Coffee or tea?', french: 'Café ou thé ?' },
          { arabic: 'الْيَوْم أَوْ غَدًا', english: 'Today or tomorrow', french: 'Aujourd\'hui ou demain' },
          { arabic: 'هَلْ تُرِيدُ هَذَا أَوْ ذَاكَ؟', english: 'Do you want this or that?', french: 'Veux-tu ceci ou cela ?' },
          { arabic: 'اِقْرَأْ أَوْ اُكْتُبْ', english: 'Read or write', french: 'Lis ou écris' },
        ],
      },
      {
        type: 'text',
        content: 'لَكِنْ / لَكِنَّ (but)',
        contentFr: 'لَكِنْ / لَكِنَّ (mais)',
      },
      {
        type: 'examples_grid',
        content: 'Showing contrast',
        contentFr: 'Exprimer le contraste',
        examples: [
          { arabic: 'صَغِير لَكِنْ ذَكِي', english: 'Small but smart', french: 'Petit mais intelligent' },
          { arabic: 'أُحِبُّهُ لَكِنَّهُ بَعِيد', english: 'I love him but he\'s far', french: 'Je l\'aime mais il est loin' },
          { arabic: 'حَاوَلْتُ لَكِنْ فَشِلْتُ', english: 'I tried but failed', french: 'J\'ai essayé mais j\'ai échoué' },
          { arabic: 'غَنِيٌّ لَكِنَّهُ بَخِيل', english: 'Rich but stingy', french: 'Riche mais avare' },
        ],
      },
      {
        type: 'text',
        content: 'ثُمَّ / فَـ (then)',
        contentFr: 'ثُمَّ / فَـ (puis/alors)',
      },
      {
        type: 'examples_grid',
        content: 'Sequence of events',
        contentFr: 'Séquence d\'événements',
        examples: [
          { arabic: 'جَاءَ ثُمَّ جَلَسَ', english: 'He came, then sat', french: 'Il est venu, puis s\'est assis' },
          { arabic: 'أَكَلْتُ ثُمَّ نِمْتُ', english: 'I ate, then slept', french: 'J\'ai mangé, puis j\'ai dormi' },
          { arabic: 'اِسْتَيْقَظْتُ فَذَهَبْتُ', english: 'I woke up and (so) went', french: 'Je me suis réveillé et (donc) je suis parti' },
          { arabic: 'دَرَسَ فَنَجَحَ', english: 'He studied and (so) passed', french: 'Il a étudié et (donc) a réussi' },
        ],
      },
      {
        type: 'text',
        content: 'More Conjunctions',
        contentFr: 'Autres conjonctions',
      },
      {
        type: 'examples_grid',
        content: 'Additional connectors',
        contentFr: 'Connecteurs supplémentaires',
        examples: [
          { arabic: 'بَلْ', english: 'Rather, but rather', french: 'Plutôt, mais plutôt' },
          { arabic: 'أَمْ', english: 'Or (in questions)', french: 'Ou (dans les questions)' },
          { arabic: 'حَتَّى', english: 'Until, even', french: 'Jusqu\'à, même' },
          { arabic: 'لَا...وَلَا', english: 'Neither...nor', french: 'Ni...ni' },
        ],
      },
      {
        type: 'note',
        content: '[[فَـ]] (fa) implies [[immediate sequence]] or [[cause and effect]], while [[ثُمَّ]] (thumma) implies a [[delay]] between actions. Choose wisely!',
        contentFr: '[[فَـ]] (fa) implique une [[séquence immédiate]] ou une [[cause et effet]], tandis que [[ثُمَّ]] (thumma) implique un [[délai]] entre les actions. Choisissez judicieusement !',
        arabicDescription: 'فَـ لِلتَّرْتِيب الْفَوْرِي، ثُمَّ لِلتَّرْتِيب مَعَ تَرَاخٍ',
        arabicTranslation: 'Fa for immediate sequence, Thumma for delayed sequence',
        arabicTranslationFr: 'Fa pour la séquence immédiate, Thumma pour la séquence différée',
      },
    ],
  },

  // LESSON 25: Comparative & Superlative
  {
    id: 'grammar-25',
    title: 'Comparative & Superlative',
    titleFr: 'Comparatif & Superlatif',
    titleArabic: 'أَفْعَل التَّفْضِيل',
    description: 'Express bigger, smaller, best, and most in Arabic',
    descriptionFr: 'Exprimez plus grand, plus petit, le meilleur en arabe',
    level: 'intermediate',
    category: 'adjectives',
    order: 25,
    exercises: ['ex-grammar-25-1', 'ex-grammar-25-2'],
    content: [
      {
        type: 'description',
        content: 'How do you say "bigger," "more beautiful," or "the best" in Arabic? Use the special [[أَفْعَل]] pattern! This single form works for both comparative (bigger) and superlative (biggest).',
        contentFr: 'Comment dit-on « plus grand », « plus beau » ou « le meilleur » en arabe ? Utilisez le schème spécial [[أَفْعَل]] ! Cette forme unique fonctionne à la fois pour le comparatif (plus grand) et le superlatif (le plus grand).',
        arabicDescription: 'نَسْتَخْدِم وَزْن أَفْعَل لِلْمُقَارَنَة وَالتَّفْضِيل',
        arabicTranslation: 'We use the Af\'al pattern for comparison and preference',
        arabicTranslationFr: 'On utilise le schème Af\'al pour la comparaison et la préférence',
      },
      {
        type: 'rule',
        content: 'The comparative/superlative pattern is [[أَفْعَل]] (af\'al). Take the 3 root letters and put them in this pattern. For comparative, add [[مِنْ]] (than). For superlative, add [[ال]] or use with a noun.',
        contentFr: 'Le schème comparatif/superlatif est [[أَفْعَل]] (af\'al). Prenez les 3 lettres radicales et placez-les dans ce schème. Pour le comparatif, ajoutez [[مِنْ]] (que). Pour le superlatif, ajoutez [[ال]] ou utilisez-le avec un nom.',
        arabicDescription: 'أَفْعَل + مِنْ = أَكْبَر مِنْ (bigger than)',
        arabicTranslation: 'Af\'al + Min = Akbar min (bigger than)',
        arabicTranslationFr: 'Af\'al + Min = Akbar min (plus grand que)',
      },
      {
        type: 'text',
        content: 'Common Comparatives',
        contentFr: 'Comparatifs courants',
      },
      {
        type: 'examples_grid',
        content: 'Building the أَفْعَل pattern',
        contentFr: 'Construire le schème أَفْعَل',
        examples: [
          { arabic: 'كَبِير ← أَكْبَر', english: 'big → bigger/biggest', french: 'grand → plus grand/le plus grand' },
          { arabic: 'صَغِير ← أَصْغَر', english: 'small → smaller/smallest', french: 'petit → plus petit/le plus petit' },
          { arabic: 'جَمِيل ← أَجْمَل', english: 'beautiful → more beautiful', french: 'beau → plus beau' },
          { arabic: 'سَرِيع ← أَسْرَع', english: 'fast → faster/fastest', french: 'rapide → plus rapide/le plus rapide' },
          { arabic: 'طَوِيل ← أَطْوَل', english: 'tall → taller/tallest', french: 'grand → plus grand/le plus grand' },
          { arabic: 'قَصِير ← أَقْصَر', english: 'short → shorter/shortest', french: 'court → plus court/le plus court' },
        ],
      },
      {
        type: 'text',
        content: 'Comparative with مِنْ (than)',
        contentFr: 'Comparatif avec مِنْ (que)',
      },
      {
        type: 'examples_grid',
        content: 'Comparing two things',
        contentFr: 'Comparer deux choses',
        examples: [
          { arabic: 'أَحْمَدُ أَكْبَرُ مِنْ عَلِي', english: 'Ahmad is bigger than Ali', french: 'Ahmad est plus grand qu\'Ali' },
          { arabic: 'هِيَ أَجْمَلُ مِنْهَا', english: 'She is more beautiful than her', french: 'Elle est plus belle qu\'elle' },
          { arabic: 'السَّيَّارَةُ أَسْرَعُ مِنَ الْحِصَان', english: 'The car is faster than the horse', french: 'La voiture est plus rapide que le cheval' },
          { arabic: 'الْفِيلُ أَكْبَرُ مِنَ الْأَسَد', english: 'The elephant is bigger than the lion', french: 'L\'éléphant est plus grand que le lion' },
        ],
      },
      {
        type: 'text',
        content: 'Superlative (The Best)',
        contentFr: 'Superlatif (Le meilleur)',
      },
      {
        type: 'examples_grid',
        content: 'Using ال for superlative',
        contentFr: 'Utilisation de ال pour le superlatif',
        examples: [
          { arabic: 'الْأَكْبَر', english: 'The biggest', french: 'Le plus grand' },
          { arabic: 'الْأَفْضَل', english: 'The best', french: 'Le meilleur' },
          { arabic: 'الْأَجْمَل', english: 'The most beautiful', french: 'Le plus beau' },
          { arabic: 'الْأَسْرَع', english: 'The fastest', french: 'Le plus rapide' },
          { arabic: 'هُوَ الْأَفْضَل', english: 'He is the best', french: 'Il est le meilleur' },
          { arabic: 'هَذَا أَكْبَر بَيْت', english: 'This is the biggest house', french: 'C\'est la plus grande maison' },
        ],
      },
      {
        type: 'text',
        content: 'More Useful Comparatives',
        contentFr: 'Autres comparatifs utiles',
      },
      {
        type: 'examples_grid',
        content: 'Expand your vocabulary',
        contentFr: 'Enrichissez votre vocabulaire',
        examples: [
          { arabic: 'أَحْسَن', english: 'better/best', french: 'mieux/le mieux' },
          { arabic: 'أَسْوَأ', english: 'worse/worst', french: 'pire/le pire' },
          { arabic: 'أَكْثَر', english: 'more/most', french: 'plus/le plus' },
          { arabic: 'أَقَلّ', english: 'less/least', french: 'moins/le moins' },
          { arabic: 'أَهَمّ', english: 'more important', french: 'plus important' },
          { arabic: 'أَسْهَل', english: 'easier/easiest', french: 'plus facile/le plus facile' },
        ],
      },
      {
        type: 'note',
        content: 'The أَفْعَل form is [[invariable]] for gender and number in comparative use. [[أَكْبَر]] stays the same whether talking about a man, woman, or group!',
        contentFr: 'La forme أَفْعَل est [[invariable]] en genre et en nombre dans l\'usage comparatif. [[أَكْبَر]] reste identique qu\'on parle d\'un homme, d\'une femme ou d\'un groupe !',
        arabicDescription: 'أَفْعَل التَّفْضِيل لَا يَتَغَيَّر لِلْمُذَكَّر وَالْمُؤَنَّث',
        arabicTranslation: 'The comparative form does not change for masculine and feminine',
        arabicTranslationFr: 'La forme comparative ne change pas pour le masculin et le féminin',
      },
    ],
  },

  // LESSON 26: Active Participles
  {
    id: 'grammar-26',
    title: 'Active Participles',
    titleFr: 'Les Participes Actifs',
    titleArabic: 'اِسْم الْفَاعِل',
    description: 'The doer form: writer, teacher, student',
    descriptionFr: 'La forme de l\'agent : écrivain, enseignant, étudiant',
    level: 'intermediate',
    category: 'nouns',
    order: 26,
    exercises: ['ex-grammar-26-1', 'ex-grammar-26-2'],
    content: [
      {
        type: 'description',
        content: 'The Active Participle ([[اِسْم الْفَاعِل]]) describes the [[doer]] of an action. From "to write" you get "writer"; from "to teach" you get "teacher". Arabic has a pattern for this: [[فَاعِل]]!',
        contentFr: 'Le participe actif ([[اِسْم الْفَاعِل]]) décrit l\'[[auteur]] d\'une action. De « écrire » on obtient « écrivain » ; de « enseigner » on obtient « enseignant ». L\'arabe a un schème pour cela : [[فَاعِل]] !',
        arabicDescription: 'اِسْم الْفَاعِل يَدُلّ عَلَى مَنْ يَقُوم بِالْفِعْل',
        arabicTranslation: 'The active participle indicates the one who does the action',
        arabicTranslationFr: 'Le participe actif désigne celui qui accomplit l\'action',
      },
      {
        type: 'rule',
        content: 'For Form I verbs (basic 3-letter verbs), the active participle follows the pattern [[فَاعِل]] (faa\'il). Take the root letters and apply the pattern. This works for most basic verbs!',
        contentFr: 'Pour les verbes de forme I (verbes basiques à 3 lettres), le participe actif suit le schème [[فَاعِل]] (faa\'il). Prenez les lettres radicales et appliquez le schème. Cela fonctionne pour la plupart des verbes de base !',
        arabicDescription: 'وَزْن فَاعِل لِلْفِعْل الثُّلَاثِي الْمُجَرَّد',
        arabicTranslation: 'The Faa\'il pattern for the basic triliteral verb',
        arabicTranslationFr: 'Le schème Faa\'il pour le verbe trilitère de base',
      },
      {
        type: 'text',
        content: 'Basic Active Participles',
        contentFr: 'Participes actifs de base',
      },
      {
        type: 'examples_grid',
        content: 'Following the فَاعِل pattern',
        contentFr: 'Suivant le schème فَاعِل',
        examples: [
          { arabic: 'كَتَبَ ← كَاتِب', english: 'he wrote → writer', french: 'il a écrit → écrivain' },
          { arabic: 'دَرَسَ ← دَارِس', english: 'he studied → student', french: 'il a étudié → étudiant' },
          { arabic: 'عَمِلَ ← عَامِل', english: 'he worked → worker', french: 'il a travaillé → travailleur' },
          { arabic: 'سَافَرَ ← مُسَافِر', english: 'he traveled → traveler', french: 'il a voyagé → voyageur' },
          { arabic: 'لَعِبَ ← لَاعِب', english: 'he played → player', french: 'il a joué → joueur' },
          { arabic: 'قَرَأَ ← قَارِئ', english: 'he read → reader', french: 'il a lu → lecteur' },
        ],
      },
      {
        type: 'text',
        content: 'Common Professions & Roles',
        contentFr: 'Professions et rôles courants',
      },
      {
        type: 'examples_grid',
        content: 'Active participles as job titles',
        contentFr: 'Participes actifs comme titres de métiers',
        examples: [
          { arabic: 'مُعَلِّم', english: 'teacher (m)', french: 'enseignant (m)' },
          { arabic: 'مُعَلِّمَة', english: 'teacher (f)', french: 'enseignante (f)' },
          { arabic: 'طَالِب', english: 'student (m)', french: 'étudiant (m)' },
          { arabic: 'طَالِبَة', english: 'student (f)', french: 'étudiante (f)' },
          { arabic: 'سَائِق', english: 'driver', french: 'conducteur' },
          { arabic: 'طَبَّاخ', english: 'cook', french: 'cuisinier' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Masculine vs Feminine',
        contentFr: 'Masculin vs Féminin',
        leftLabel: 'Masculine',
        leftLabelFr: 'Masculin',
        rightLabel: 'Feminine (add ة)',
        rightLabelFr: 'Féminin (ajouter ة)',
        comparisons: [
          { left: { arabic: 'كَاتِب', label: 'writer (m)', labelFr: 'écrivain (m)' }, right: { arabic: 'كَاتِبَة', label: 'writer (f)', labelFr: 'écrivaine (f)' } },
          { left: { arabic: 'عَامِل', label: 'worker (m)', labelFr: 'travailleur (m)' }, right: { arabic: 'عَامِلَة', label: 'worker (f)', labelFr: 'travailleuse (f)' } },
          { left: { arabic: 'قَارِئ', label: 'reader (m)', labelFr: 'lecteur (m)' }, right: { arabic: 'قَارِئَة', label: 'reader (f)', labelFr: 'lectrice (f)' } },
        ],
      },
      {
        type: 'text',
        content: 'Used as Adjectives',
        contentFr: 'Utilisés comme adjectifs',
      },
      {
        type: 'examples_grid',
        content: 'Describing ongoing states',
        contentFr: 'Décrire des états en cours',
        examples: [
          { arabic: 'رَجُل نَائِم', english: 'A sleeping man', french: 'Un homme endormi' },
          { arabic: 'طِفْل بَاكٍ', english: 'A crying child', french: 'Un enfant qui pleure' },
          { arabic: 'مَاء جَارٍ', english: 'Running water', french: 'De l\'eau courante' },
          { arabic: 'شَمْس سَاطِعَة', english: 'Shining sun', french: 'Un soleil éclatant' },
        ],
      },
      {
        type: 'note',
        content: 'Active participles can function as [[nouns]] (a writer) or [[adjectives]] (a writing person). Context tells you which! Add [[ة]] for feminine.',
        contentFr: 'Les participes actifs peuvent fonctionner comme [[noms]] (un écrivain) ou [[adjectifs]] (une personne qui écrit). Le contexte vous indique lequel ! Ajoutez [[ة]] pour le féminin.',
        arabicDescription: 'اِسْم الْفَاعِل يَعْمَل كَاسْم أَوْ صِفَة',
        arabicTranslation: 'The active participle works as a noun or adjective',
        arabicTranslationFr: 'Le participe actif fonctionne comme un nom ou un adjectif',
      },
    ],
  },

  // LESSON 27: Passive Participles
  {
    id: 'grammar-27',
    title: 'Passive Participles',
    titleFr: 'Les Participes Passifs',
    titleArabic: 'اِسْم الْمَفْعُول',
    description: 'The receiver form: written, known, loved',
    descriptionFr: 'La forme du récepteur : écrit, connu, aimé',
    level: 'intermediate',
    category: 'nouns',
    order: 27,
    exercises: ['ex-grammar-27-1', 'ex-grammar-27-2'],
    content: [
      {
        type: 'description',
        content: 'While the Active Participle is the doer, the Passive Participle ([[اِسْم الْمَفْعُول]]) is the [[receiver]] of the action. From "to write" you get "written"; from "to know" you get "known".',
        contentFr: 'Alors que le participe actif est l\'agent, le participe passif ([[اِسْم الْمَفْعُول]]) est le [[récepteur]] de l\'action. De « écrire » on obtient « écrit » ; de « savoir » on obtient « connu ».',
        arabicDescription: 'اِسْم الْمَفْعُول يَدُلّ عَلَى مَنْ وَقَعَ عَلَيْهِ الْفِعْل',
        arabicTranslation: 'The passive participle indicates the one upon whom the action fell',
        arabicTranslationFr: 'Le participe passif désigne celui sur qui l\'action est tombée',
      },
      {
        type: 'rule',
        content: 'For Form I verbs, the passive participle follows the pattern [[مَفْعُول]] (maf\'ool). The [[مَـ]] prefix is the key marker! This pattern produces words like "known," "beloved," "written."',
        contentFr: 'Pour les verbes de forme I, le participe passif suit le schème [[مَفْعُول]] (maf\'ool). Le préfixe [[مَـ]] est le marqueur clé ! Ce schème produit des mots comme « connu », « aimé », « écrit ».',
        arabicDescription: 'وَزْن مَفْعُول لِلْفِعْل الثُّلَاثِي الْمُجَرَّد',
        arabicTranslation: 'The Maf\'ool pattern for the basic triliteral verb',
        arabicTranslationFr: 'Le schème Maf\'ool pour le verbe trilitère de base',
      },
      {
        type: 'text',
        content: 'Basic Passive Participles',
        contentFr: 'Participes passifs de base',
      },
      {
        type: 'examples_grid',
        content: 'Following the مَفْعُول pattern',
        contentFr: 'Suivant le schème مَفْعُول',
        examples: [
          { arabic: 'كَتَبَ ← مَكْتُوب', english: 'wrote → written', french: 'a écrit → écrit' },
          { arabic: 'عَرَفَ ← مَعْرُوف', english: 'knew → known', french: 'a connu → connu' },
          { arabic: 'فَهِمَ ← مَفْهُوم', english: 'understood → understood', french: 'a compris → compris' },
          { arabic: 'سَمِعَ ← مَسْمُوع', english: 'heard → heard', french: 'a entendu → entendu' },
          { arabic: 'فَتَحَ ← مَفْتُوح', english: 'opened → open/opened', french: 'a ouvert → ouvert' },
          { arabic: 'كَسَرَ ← مَكْسُور', english: 'broke → broken', french: 'a cassé → cassé' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Active vs Passive Participles',
        contentFr: 'Participes actifs vs passifs',
        leftLabel: 'Active (doer)',
        leftLabelFr: 'Actif (agent)',
        rightLabel: 'Passive (receiver)',
        rightLabelFr: 'Passif (récepteur)',
        comparisons: [
          { left: { arabic: 'كَاتِب', label: 'writer', labelFr: 'écrivain' }, right: { arabic: 'مَكْتُوب', label: 'written', labelFr: 'écrit' } },
          { left: { arabic: 'فَاهِم', label: 'understander', labelFr: 'celui qui comprend' }, right: { arabic: 'مَفْهُوم', label: 'understood', labelFr: 'compris' } },
          { left: { arabic: 'فَاتِح', label: 'opener', labelFr: 'celui qui ouvre' }, right: { arabic: 'مَفْتُوح', label: 'opened', labelFr: 'ouvert' } },
        ],
      },
      {
        type: 'text',
        content: 'Common Passive Participles',
        contentFr: 'Participes passifs courants',
      },
      {
        type: 'examples_grid',
        content: 'Useful vocabulary',
        contentFr: 'Vocabulaire utile',
        examples: [
          { arabic: 'مَشْهُور', english: 'famous (known widely)', french: 'célèbre (largement connu)' },
          { arabic: 'مَحْبُوب', english: 'beloved', french: 'bien-aimé' },
          { arabic: 'مَطْلُوب', english: 'wanted/required', french: 'recherché/requis' },
          { arabic: 'مَشْغُول', english: 'busy (occupied)', french: 'occupé' },
          { arabic: 'مَمْنُوع', english: 'forbidden', french: 'interdit' },
          { arabic: 'مَسْمُوح', english: 'allowed', french: 'autorisé' },
        ],
      },
      {
        type: 'text',
        content: 'In Sentences',
        contentFr: 'Dans des phrases',
      },
      {
        type: 'examples_grid',
        content: 'Using passive participles',
        contentFr: 'Utilisation des participes passifs',
        examples: [
          { arabic: 'الْبَاب مَفْتُوح', english: 'The door is open', french: 'La porte est ouverte' },
          { arabic: 'الْكِتَاب مَكْتُوب بِالْعَرَبِيَّة', english: 'The book is written in Arabic', french: 'Le livre est écrit en arabe' },
          { arabic: 'هُوَ مَشْهُور جِدًّا', english: 'He is very famous', french: 'Il est très célèbre' },
          { arabic: 'التَّدْخِين مَمْنُوع هُنَا', english: 'Smoking is forbidden here', french: 'Fumer est interdit ici' },
        ],
      },
      {
        type: 'note',
        content: 'Passive participles often become [[adjectives]] or [[nouns]] on their own. [[مَشْغُول]] (busy) and [[مَمْنُوع]] (forbidden) are used constantly in everyday Arabic!',
        contentFr: 'Les participes passifs deviennent souvent des [[adjectifs]] ou des [[noms]] à part entière. [[مَشْغُول]] (occupé) et [[مَمْنُوع]] (interdit) sont utilisés constamment dans l\'arabe quotidien !',
        arabicDescription: 'كَثِير مِنْ أَسْمَاء الْمَفْعُول تُسْتَخْدَم كَصِفَات',
        arabicTranslation: 'Many passive participles are used as adjectives',
        arabicTranslationFr: 'Beaucoup de participes passifs sont utilisés comme adjectifs',
      },
    ],
  },

  // LESSON 28: The Verbal Noun (Masdar)
  {
    id: 'grammar-28',
    title: 'The Verbal Noun (Masdar)',
    titleFr: 'Le Nom Verbal (Masdar)',
    titleArabic: 'الْمَصْدَر',
    description: 'Turn verbs into nouns: writing, reading, studying',
    descriptionFr: 'Transformez les verbes en noms : écriture, lecture, étude',
    level: 'intermediate',
    category: 'nouns',
    order: 28,
    exercises: ['ex-grammar-28-1', 'ex-grammar-28-2'],
    content: [
      {
        type: 'description',
        content: 'The [[مَصْدَر]] (Masdar) is the verbal noun — it turns an action into a concept. From "to write" you get "writing" (the act of writing). English uses "-ing" or "-tion"; Arabic has various patterns.',
        contentFr: 'Le [[مَصْدَر]] (Masdar) est le nom verbal — il transforme une action en concept. De « écrire » on obtient « écriture » (l\'acte d\'écrire). Le français utilise des suffixes comme « -tion » ou « -ure » ; l\'arabe a divers schèmes.',
        arabicDescription: 'الْمَصْدَر هُوَ اسْم الْفِعْل الَّذِي يَدُلّ عَلَى الْحَدَث',
        arabicTranslation: 'The masdar is the noun of the verb that indicates the event',
        arabicTranslationFr: 'Le masdar est le nom du verbe qui désigne l\'événement',
      },
      {
        type: 'rule',
        content: 'Unlike active/passive participles, Form I masdars have [[multiple patterns]] and must often be memorized. Common patterns include [[فَعْل]], [[فِعَالَة]], [[فُعُول]], and many more.',
        contentFr: 'Contrairement aux participes actifs/passifs, les masdars de forme I ont [[plusieurs schèmes]] et doivent souvent être mémorisés. Les schèmes courants incluent [[فَعْل]], [[فِعَالَة]], [[فُعُول]], et bien d\'autres.',
        arabicDescription: 'لِلْفِعْل الثُّلَاثِي أَوْزَان مُتَعَدِّدَة لِلْمَصْدَر',
        arabicTranslation: 'The triliteral verb has multiple patterns for the masdar',
        arabicTranslationFr: 'Le verbe trilitère a plusieurs schèmes pour le masdar',
      },
      {
        type: 'text',
        content: 'Common Masdar Patterns',
        contentFr: 'Schèmes courants du Masdar',
      },
      {
        type: 'examples_grid',
        content: 'Various verbal noun forms',
        contentFr: 'Différentes formes de noms verbaux',
        examples: [
          { arabic: 'كَتَبَ ← كِتَابَة', english: 'wrote → writing', french: 'a écrit → écriture' },
          { arabic: 'قَرَأَ ← قِرَاءَة', english: 'read → reading', french: 'a lu → lecture' },
          { arabic: 'دَرَسَ ← دِرَاسَة', english: 'studied → studying', french: 'a étudié → étude' },
          { arabic: 'عَمِلَ ← عَمَل', english: 'worked → work', french: 'a travaillé → travail' },
          { arabic: 'فَهِمَ ← فَهْم', english: 'understood → understanding', french: 'a compris → compréhension' },
          { arabic: 'ذَهَبَ ← ذَهَاب', english: 'went → going', french: 'est allé → départ' },
        ],
      },
      {
        type: 'text',
        content: 'Derived Form Masdars (Predictable!)',
        contentFr: 'Masdars des formes dérivées (prévisibles !)',
      },
      {
        type: 'rule',
        content: 'Good news! Derived verb forms (II-X) have [[predictable masdar patterns]]. Form II: [[تَفْعِيل]], Form III: [[مُفَاعَلَة]], Form V: [[تَفَعُّل]], and so on.',
        contentFr: 'Bonne nouvelle ! Les formes verbales dérivées (II-X) ont des [[schèmes de masdar prévisibles]]. Forme II : [[تَفْعِيل]], Forme III : [[مُفَاعَلَة]], Forme V : [[تَفَعُّل]], et ainsi de suite.',
        arabicDescription: 'مَصَادِر الْأَفْعَال الْمَزِيدَة قِيَاسِيَّة',
        arabicTranslation: 'The masdars of derived verbs are regular',
        arabicTranslationFr: 'Les masdars des verbes dérivés sont réguliers',
      },
      {
        type: 'examples_grid',
        content: 'Predictable patterns',
        contentFr: 'Schèmes prévisibles',
        examples: [
          { arabic: 'عَلَّمَ ← تَعْلِيم', english: 'taught → teaching (Form II)', french: 'a enseigné → enseignement (Forme II)' },
          { arabic: 'سَافَرَ ← مُسَافَرَة', english: 'traveled → traveling (Form III)', french: 'a voyagé → voyage (Forme III)' },
          { arabic: 'تَكَلَّمَ ← تَكَلُّم', english: 'spoke → speaking (Form V)', french: 'a parlé → parole (Forme V)' },
          { arabic: 'اِسْتَعْمَلَ ← اِسْتِعْمَال', english: 'used → usage (Form X)', french: 'a utilisé → utilisation (Forme X)' },
        ],
      },
      {
        type: 'text',
        content: 'Using Masdars in Sentences',
        contentFr: 'Utilisation des Masdars dans des phrases',
      },
      {
        type: 'examples_grid',
        content: 'Verbal nouns as subjects and objects',
        contentFr: 'Noms verbaux comme sujets et compléments',
        examples: [
          { arabic: 'الْقِرَاءَةُ مُفِيدَة', english: 'Reading is useful', french: 'La lecture est utile' },
          { arabic: 'أُحِبُّ السِّبَاحَة', english: 'I love swimming', french: 'J\'aime la natation' },
          { arabic: 'التَّعْلِيم مُهِمّ', english: 'Education is important', french: 'L\'éducation est importante' },
          { arabic: 'شُكْرًا عَلَى الْمُسَاعَدَة', english: 'Thanks for the help', french: 'Merci pour l\'aide' },
        ],
      },
      {
        type: 'note',
        content: 'Masdars are essential for abstract concepts and are used as [[subjects]], [[objects]], and after [[prepositions]]. They\'re everywhere in formal Arabic!',
        contentFr: 'Les masdars sont essentiels pour les concepts abstraits et sont utilisés comme [[sujets]], [[compléments]], et après les [[prépositions]]. On les trouve partout dans l\'arabe formel !',
        arabicDescription: 'الْمَصْدَر يُسْتَخْدَم كَفَاعِل وَمَفْعُول وَبَعْدَ حُرُوف الْجَرّ',
        arabicTranslation: 'The masdar is used as subject, object, and after prepositions',
        arabicTranslationFr: 'Le masdar est utilisé comme sujet, complément, et après les prépositions',
      },
    ],
  },

  // LESSON 29: Introduction to Verb Patterns
  {
    id: 'grammar-29',
    title: 'Introduction to Verb Patterns',
    titleFr: 'Introduction aux Schèmes Verbaux',
    titleArabic: 'مُقَدِّمَة فِي الْأَوْزَان',
    description: 'Discover the 10 Arabic verb forms and their meanings',
    descriptionFr: 'Découvrez les 10 formes verbales arabes et leurs significations',
    level: 'intermediate',
    category: 'verbs',
    order: 29,
    exercises: ['ex-grammar-29-1', 'ex-grammar-29-2'],
    content: [
      {
        type: 'description',
        content: 'Arabic has a brilliant system: from one 3-letter root, you can create up to [[10 different verb forms]], each with predictable meaning changes! This is the key to unlocking thousands of words.',
        contentFr: 'L\'arabe possède un système brillant : à partir d\'une seule racine de 3 lettres, on peut créer jusqu\'à [[10 formes verbales différentes]], chacune avec des changements de sens prévisibles ! C\'est la clé pour débloquer des milliers de mots.',
        arabicDescription: 'الْأَوْزَان الْعَشَرَة تُنْتِج مَعَانِيَ مُخْتَلِفَة مِنْ جَذْر وَاحِد',
        arabicTranslation: 'The ten patterns produce different meanings from one root',
        arabicTranslationFr: 'Les dix schèmes produisent des sens différents à partir d\'une seule racine',
      },
      {
        type: 'rule',
        content: 'Arabic verbs are organized into [[10 forms]] (أَوْزَان). Form I is the basic 3-letter verb ([[فَعَلَ]]). Forms II-X add letters or modify the root to change meaning in predictable ways.',
        contentFr: 'Les verbes arabes sont organisés en [[10 formes]] (أَوْزَان). La forme I est le verbe basique de 3 lettres ([[فَعَلَ]]). Les formes II-X ajoutent des lettres ou modifient la racine pour changer le sens de manière prévisible.',
        arabicDescription: 'الْفِعْل الْعَرَبِي لَهُ عَشَرَة أَوْزَان',
        arabicTranslation: 'The Arabic verb has ten patterns',
        arabicTranslationFr: 'Le verbe arabe a dix schèmes',
      },
      {
        type: 'text',
        content: 'The 10 Verb Forms Overview',
        contentFr: 'Aperçu des 10 formes verbales',
      },
      {
        type: 'examples_grid',
        content: 'Pattern and meaning',
        contentFr: 'Schème et signification',
        examples: [
          { arabic: 'فَعَلَ (I)', english: 'Basic verb (to do)', french: 'Verbe de base (faire)' },
          { arabic: 'فَعَّلَ (II)', english: 'Intensive/Causative', french: 'Intensif/Causatif' },
          { arabic: 'فَاعَلَ (III)', english: 'Mutual action', french: 'Action mutuelle' },
          { arabic: 'أَفْعَلَ (IV)', english: 'Causative', french: 'Causatif' },
          { arabic: 'تَفَعَّلَ (V)', english: 'Reflexive of II', french: 'Réfléchi de II' },
          { arabic: 'تَفَاعَلَ (VI)', english: 'Reciprocal', french: 'Réciproque' },
          { arabic: 'اِنْفَعَلَ (VII)', english: 'Passive-like', french: 'Quasi-passif' },
          { arabic: 'اِفْتَعَلَ (VIII)', english: 'Reflexive', french: 'Réfléchi' },
          { arabic: 'اِفْعَلَّ (IX)', english: 'Colors/Defects', french: 'Couleurs/Défauts' },
          { arabic: 'اِسْتَفْعَلَ (X)', english: 'Seeking/Asking', french: 'Demande/Recherche' },
        ],
      },
      {
        type: 'text',
        content: 'Example: Root ع-ل-م (knowledge)',
        contentFr: 'Exemple : Racine ع-ل-م (savoir)',
      },
      {
        type: 'examples_grid',
        content: 'Different forms, related meanings',
        contentFr: 'Différentes formes, sens liés',
        examples: [
          { arabic: 'عَلِمَ', english: 'I: he knew', french: 'I : il a su' },
          { arabic: 'عَلَّمَ', english: 'II: he taught (made know)', french: 'II : il a enseigné (fait savoir)' },
          { arabic: 'تَعَلَّمَ', english: 'V: he learned (taught himself)', french: 'V : il a appris (s\'est enseigné)' },
          { arabic: 'أَعْلَمَ', english: 'IV: he informed', french: 'IV : il a informé' },
          { arabic: 'اِسْتَعْلَمَ', english: 'X: he inquired', french: 'X : il s\'est renseigné' },
        ],
      },
      {
        type: 'text',
        content: 'Example: Root ك-ت-ب (writing)',
        contentFr: 'Exemple : Racine ك-ت-ب (écriture)',
      },
      {
        type: 'examples_grid',
        content: 'From one root, many verbs',
        contentFr: 'D\'une seule racine, plusieurs verbes',
        examples: [
          { arabic: 'كَتَبَ', english: 'I: he wrote', french: 'I : il a écrit' },
          { arabic: 'كَاتَبَ', english: 'III: he corresponded with', french: 'III : il a correspondu avec' },
          { arabic: 'أَكْتَبَ', english: 'IV: he dictated', french: 'IV : il a dicté' },
          { arabic: 'تَكَاتَبَ', english: 'VI: they wrote to each other', french: 'VI : ils se sont écrit mutuellement' },
          { arabic: 'اِكْتَتَبَ', english: 'VIII: he subscribed', french: 'VIII : il s\'est abonné' },
          { arabic: 'اِسْتَكْتَبَ', english: 'X: he asked to write', french: 'X : il a demandé d\'écrire' },
        ],
      },
      {
        type: 'note',
        content: 'You don\'t need to memorize all 10 forms now! Start with [[Form I]] (basic), [[Form II]] (intensive), and [[Form V]] (reflexive). These are the most common!',
        contentFr: 'Pas besoin de mémoriser les 10 formes maintenant ! Commencez par la [[Forme I]] (basique), la [[Forme II]] (intensive) et la [[Forme V]] (réfléchie). Ce sont les plus courantes !',
        arabicDescription: 'اِبْدَأْ بِالْأَوْزَان الْأَكْثَر شُيُوعًا: I, II, V',
        arabicTranslation: 'Start with the most common patterns: I, II, V',
        arabicTranslationFr: 'Commencez par les schèmes les plus courants : I, II, V',
      },
    ],
  },

  // LESSON 30: Conditional Sentences
  {
    id: 'grammar-30',
    title: 'Conditional Sentences',
    titleFr: 'Les Phrases Conditionnelles',
    titleArabic: 'الْجُمْلَة الشَّرْطِيَّة',
    description: 'Express if-then relationships in Arabic',
    descriptionFr: 'Exprimez les relations si-alors en arabe',
    level: 'intermediate',
    category: 'sentences',
    order: 30,
    exercises: ['ex-grammar-30-1', 'ex-grammar-30-2'],
    content: [
      {
        type: 'description',
        content: '"If you study, you will pass." Arabic conditional sentences use particles like [[إِذَا]] (if - likely) and [[لَوْ]] (if - unlikely/hypothetical) to express conditions and results.',
        contentFr: '"Si tu étudies, tu réussiras." Les phrases conditionnelles arabes utilisent des particules comme [[إِذَا]] (si - probable) et [[لَوْ]] (si - improbable/hypothétique) pour exprimer des conditions et des résultats.',
        arabicDescription: 'الْجُمْلَة الشَّرْطِيَّة تُعَبِّر عَنْ عَلَاقَة الشَّرْط وَالْجَوَاب',
        arabicTranslation: 'The conditional sentence expresses the relationship of condition and answer',
        arabicTranslationFr: 'La phrase conditionnelle exprime la relation entre la condition et la réponse',
      },
      {
        type: 'rule',
        content: '[[إِذَا]] is used for [[likely or real]] conditions (If you come...). [[لَوْ]] is used for [[unlikely or hypothetical]] conditions (If I were rich...). [[إِنْ]] is also used for general conditions.',
        contentFr: '[[إِذَا]] est utilisé pour les conditions [[probables ou réelles]] (Si tu viens...). [[لَوْ]] est utilisé pour les conditions [[improbables ou hypothétiques]] (Si j\'étais riche...). [[إِنْ]] est également utilisé pour les conditions générales.',
        arabicDescription: 'إِذَا لِلشَّرْط الْمُحْتَمَل، لَوْ لِلشَّرْط غَيْر الْمُحْتَمَل',
        arabicTranslation: 'Idha for likely conditions, Law for unlikely conditions',
        arabicTranslationFr: 'Idha pour les conditions probables, Law pour les conditions improbables',
      },
      {
        type: 'text',
        content: 'إِذَا (If - Likely)',
        contentFr: 'إِذَا (Si - Probable)',
      },
      {
        type: 'examples_grid',
        content: 'Real, possible conditions',
        contentFr: 'Conditions réelles et possibles',
        examples: [
          { arabic: 'إِذَا دَرَسْتَ نَجَحْتَ', english: 'If you study, you will pass', french: 'Si tu étudies, tu réussiras' },
          { arabic: 'إِذَا جَاءَ سَأُخْبِرُهُ', english: 'If he comes, I will tell him', french: 'S\'il vient, je lui dirai' },
          { arabic: 'إِذَا أَكَلْتَ شَبِعْتَ', english: 'If you eat, you will be full', french: 'Si tu manges, tu seras rassasié' },
          { arabic: 'إِذَا سَأَلْتَ أَجَبْتُكَ', english: 'If you ask, I will answer you', french: 'Si tu demandes, je te répondrai' },
        ],
      },
      {
        type: 'text',
        content: 'لَوْ (If - Hypothetical)',
        contentFr: 'لَوْ (Si - Hypothétique)',
      },
      {
        type: 'examples_grid',
        content: 'Unreal or impossible conditions',
        contentFr: 'Conditions irréelles ou impossibles',
        examples: [
          { arabic: 'لَوْ كُنْتُ غَنِيًّا لَاشْتَرَيْتُ بَيْتًا', english: 'If I were rich, I would buy a house', french: 'Si j\'étais riche, j\'achèterais une maison' },
          { arabic: 'لَوْ عَرَفْتُ لَأَخْبَرْتُكَ', english: 'If I had known, I would have told you', french: 'Si j\'avais su, je te l\'aurais dit' },
          { arabic: 'لَوْ كَانَ هُنَا لَسَاعَدَنَا', english: 'If he were here, he would help us', french: 'S\'il était ici, il nous aiderait' },
          { arabic: 'لَوْ أَمْكَنَنِي لَفَعَلْتُ', english: 'If I could, I would do it', french: 'Si je pouvais, je le ferais' },
        ],
      },
      {
        type: 'text',
        content: 'إِنْ (If - General)',
        contentFr: 'إِنْ (Si - Général)',
      },
      {
        type: 'examples_grid',
        content: 'General conditional',
        contentFr: 'Conditionnel général',
        examples: [
          { arabic: 'إِنْ تَدْرُسْ تَنْجَحْ', english: 'If you study, you pass', french: 'Si tu étudies, tu réussis' },
          { arabic: 'إِنْ شَاءَ اللَّه', english: 'If God wills (God willing)', french: 'Si Dieu le veut (Inch\'Allah)' },
          { arabic: 'إِنْ أَرَدْتَ فَاذْهَبْ', english: 'If you want, then go', french: 'Si tu veux, alors vas-y' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'إِذَا vs لَوْ',
        contentFr: 'إِذَا vs لَوْ',
        leftLabel: 'إِذَا (Likely)',
        leftLabelFr: 'إِذَا (Probable)',
        rightLabel: 'لَوْ (Hypothetical)',
        rightLabelFr: 'لَوْ (Hypothétique)',
        comparisons: [
          { left: { arabic: 'إِذَا رَأَيْتُهُ', label: 'If I see him', labelFr: 'Si je le vois' }, right: { arabic: 'لَوْ رَأَيْتُهُ', label: 'If I saw/had seen him', labelFr: 'Si je l\'avais vu' } },
          { left: { arabic: 'إِذَا جَاءَ', label: 'If he comes', labelFr: 'S\'il vient' }, right: { arabic: 'لَوْ جَاءَ', label: 'If he came/had come', labelFr: 'S\'il était venu' } },
        ],
      },
      {
        type: 'note',
        content: 'The result clause after [[لَوْ]] often uses [[لَـ]] before the verb: لَوْ دَرَسْتُ [[لَـ]]نَجَحْتُ (If I had studied, I [[would have]] passed).',
        contentFr: 'La proposition résultante après [[لَوْ]] utilise souvent [[لَـ]] avant le verbe : لَوْ دَرَسْتُ [[لَـ]]نَجَحْتُ (Si j\'avais étudié, j\'[[aurais]] réussi).',
        arabicDescription: 'جَوَاب لَوْ غَالِبًا يَبْدَأ بِـ لَـ',
        arabicTranslation: 'The answer to Law usually starts with La',
        arabicTranslationFr: 'La réponse à Law commence généralement par La',
      },
    ],
  },

  // ============================================
  // ADVANCED LESSONS (31-40)
  // ============================================

  // LESSON 31: Case Endings - Nominative
  {
    id: 'grammar-31',
    title: 'Case Endings: Nominative',
    titleFr: 'Cas : Le Nominatif',
    titleArabic: 'الرَّفْع',
    description: 'Master the nominative case for subjects and predicates',
    descriptionFr: 'Maîtrisez le cas nominatif pour les sujets et prédicats',
    level: 'advanced',
    category: 'nouns',
    order: 31,
    exercises: ['ex-grammar-31-1', 'ex-grammar-31-2'],
    content: [
      {
        type: 'description',
        content: 'Arabic nouns change their endings based on their role in the sentence. The [[nominative case]] (الرَّفْع) marks [[subjects]] and [[predicates]]. This is the "default" case for main sentence elements.',
        contentFr: 'Les noms arabes changent leurs terminaisons selon leur rôle dans la phrase. Le [[cas nominatif]] (الرَّفْع) marque les [[sujets]] et les [[prédicats]]. C\'est le cas "par défaut" pour les éléments principaux de la phrase.',
        arabicDescription: 'الرَّفْع هُوَ حَالَة الْفَاعِل وَالْمُبْتَدَأ وَالْخَبَر',
        arabicTranslation: 'Nominative is the case of the subject and predicate',
        arabicTranslationFr: 'Le nominatif est le cas du sujet et du prédicat',
      },
      {
        type: 'rule',
        content: 'Nominative endings: singular nouns add [[ـُ]] (damma) or [[ـٌ]] (tanwin). Dual nouns end in [[ـَانِ]]. Sound masculine plurals end in [[ـُونَ]]. Sound feminine plurals end in [[ـَاتٌ]].',
        contentFr: 'Terminaisons du nominatif : les noms singuliers ajoutent [[ـُ]] (damma) ou [[ـٌ]] (tanwin). Les noms duels se terminent par [[ـَانِ]]. Les pluriels masculins réguliers se terminent par [[ـُونَ]]. Les pluriels féminins réguliers se terminent par [[ـَاتٌ]].',
        arabicDescription: 'عَلَامَات الرَّفْع: الضَّمَّة، الْأَلِف وَالنُّون، الْوَاو وَالنُّون',
        arabicTranslation: 'Signs of nominative: damma, alif and nun, waw and nun',
        arabicTranslationFr: 'Signes du nominatif : damma, alif et noun, waw et noun',
      },
      {
        type: 'text',
        content: 'Singular Nominative',
        contentFr: 'Nominatif singulier',
      },
      {
        type: 'examples_grid',
        content: 'Subjects with damma',
        contentFr: 'Sujets avec damma',
        examples: [
          { arabic: 'جَاءَ الْوَلَدُ', english: 'The boy came', french: 'Le garçon est venu' },
          { arabic: 'الْبَيْتُ كَبِيرٌ', english: 'The house is big', french: 'La maison est grande' },
          { arabic: 'هَذَا كِتَابٌ', english: 'This is a book', french: 'Ceci est un livre' },
          { arabic: 'الْمُعَلِّمُ ذَكِيٌّ', english: 'The teacher is smart', french: 'L\'enseignant est intelligent' },
        ],
      },
      {
        type: 'text',
        content: 'Dual Nominative (-āni)',
        contentFr: 'Nominatif duel (-āni)',
      },
      {
        type: 'examples_grid',
        content: 'Two of something as subject',
        contentFr: 'Deux de quelque chose comme sujet',
        examples: [
          { arabic: 'جَاءَ الْوَلَدَانِ', english: 'The two boys came', french: 'Les deux garçons sont venus' },
          { arabic: 'الْكِتَابَانِ جَدِيدَانِ', english: 'The two books are new', french: 'Les deux livres sont nouveaux' },
          { arabic: 'الطَّالِبَتَانِ مُجْتَهِدَتَانِ', english: 'The two (f) students are hardworking', french: 'Les deux étudiantes sont travailleuses' },
        ],
      },
      {
        type: 'text',
        content: 'Plural Nominative',
        contentFr: 'Nominatif pluriel',
      },
      {
        type: 'examples_grid',
        content: 'Plurals as subjects',
        contentFr: 'Pluriels comme sujets',
        examples: [
          { arabic: 'جَاءَ الْمُعَلِّمُونَ', english: 'The (male) teachers came', french: 'Les enseignants (masculin) sont venus' },
          { arabic: 'الْمُسْلِمُونَ يُصَلُّونَ', english: 'The Muslims pray', french: 'Les musulmans prient' },
          { arabic: 'الطَّالِبَاتُ مُجْتَهِدَاتٌ', english: 'The (female) students are hardworking', french: 'Les étudiantes (féminin) sont travailleuses' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Nominative Endings Summary',
        contentFr: 'Résumé des terminaisons du nominatif',
        leftLabel: 'Definite',
        leftLabelFr: 'Défini',
        rightLabel: 'Indefinite',
        rightLabelFr: 'Indéfini',
        comparisons: [
          { left: { arabic: 'الْكِتَابُ', label: 'the book', labelFr: 'le livre' }, right: { arabic: 'كِتَابٌ', label: 'a book', labelFr: 'un livre' } },
          { left: { arabic: 'الْوَلَدَانِ', label: 'the two boys', labelFr: 'les deux garçons' }, right: { arabic: 'وَلَدَانِ', label: 'two boys', labelFr: 'deux garçons' } },
          { left: { arabic: 'الْمُعَلِّمُونَ', label: 'the teachers', labelFr: 'les enseignants' }, right: { arabic: 'مُعَلِّمُونَ', label: 'teachers', labelFr: 'enseignants' } },
        ],
      },
      {
        type: 'note',
        content: 'The nominative is used for: [[subjects of verbal sentences]], [[subjects (مُبْتَدَأ) of nominal sentences]], [[predicates (خَبَر)]], and [[names of إِنَّ after its predicate]].',
        contentFr: 'Le nominatif est utilisé pour : les [[sujets des phrases verbales]], les [[sujets (مُبْتَدَأ) des phrases nominales]], les [[prédicats (خَبَر)]], et les [[noms de إِنَّ après son prédicat]].',
        arabicDescription: 'الرَّفْع لِلْفَاعِل وَالْمُبْتَدَأ وَالْخَبَر',
        arabicTranslation: 'Nominative is for the subject and predicate',
        arabicTranslationFr: 'Le nominatif est pour le sujet et le prédicat',
      },
    ],
  },

  // LESSON 32: Case Endings - Accusative
  {
    id: 'grammar-32',
    title: 'Case Endings: Accusative',
    titleFr: 'Cas : L\'Accusatif',
    titleArabic: 'النَّصْب',
    description: 'Learn the accusative case for objects and adverbs',
    descriptionFr: 'Apprenez le cas accusatif pour les compléments et adverbes',
    level: 'advanced',
    category: 'nouns',
    order: 32,
    exercises: ['ex-grammar-32-1', 'ex-grammar-32-2'],
    content: [
      {
        type: 'description',
        content: 'The [[accusative case]] (النَّصْب) marks [[direct objects]], words after certain particles, and various adverbial expressions. It\'s essential for expressing "what" or "whom" receives the action.',
        contentFr: 'Le [[cas accusatif]] (النَّصْب) marque les [[compléments d\'objet direct]], les mots après certaines particules, et diverses expressions adverbiales. Il est essentiel pour exprimer "quoi" ou "qui" reçoit l\'action.',
        arabicDescription: 'النَّصْب هُوَ حَالَة الْمَفْعُول بِهِ وَالظَّرْف وَاسْم إِنَّ',
        arabicTranslation: 'Accusative is the case of the object, adverb, and subject of Inna',
        arabicTranslationFr: 'L\'accusatif est le cas du complément d\'objet, de l\'adverbe et du sujet de Inna',
      },
      {
        type: 'rule',
        content: 'Accusative endings: singular nouns add [[ـَ]] (fatha) or [[ـً]] (tanwin fatha, written ـًا). Dual nouns end in [[ـَيْنِ]]. Sound masculine plurals end in [[ـِينَ]]. Sound feminine plurals end in [[ـَاتٍ]].',
        contentFr: 'Terminaisons de l\'accusatif : les noms singuliers ajoutent [[ـَ]] (fatha) ou [[ـً]] (tanwin fatha, écrit ـًا). Les noms duels se terminent par [[ـَيْنِ]]. Les pluriels masculins réguliers se terminent par [[ـِينَ]]. Les pluriels féminins réguliers se terminent par [[ـَاتٍ]].',
        arabicDescription: 'عَلَامَات النَّصْب: الْفَتْحَة، الْيَاء وَالنُّون، الْكَسْرَة',
        arabicTranslation: 'Signs of accusative: fatha, ya and nun, kasra',
        arabicTranslationFr: 'Les marques de l\'accusatif : fatha, ya et noun, kasra',
      },
      {
        type: 'text',
        content: 'Direct Objects',
        contentFr: 'Compléments d\'objet direct',
      },
      {
        type: 'examples_grid',
        content: 'What receives the action',
        contentFr: 'Ce qui reçoit l\'action',
        examples: [
          { arabic: 'قَرَأْتُ الْكِتَابَ', english: 'I read the book', french: 'J\'ai lu le livre' },
          { arabic: 'رَأَيْتُ وَلَدًا', english: 'I saw a boy', french: 'J\'ai vu un garçon' },
          { arabic: 'أَكَلْتُ تُفَّاحَةً', english: 'I ate an apple', french: 'J\'ai mangé une pomme' },
          { arabic: 'زُرْتُ الْمَدِينَةَ', english: 'I visited the city', french: 'J\'ai visité la ville' },
        ],
      },
      {
        type: 'text',
        content: 'After إِنَّ and its Sisters',
        contentFr: 'Après إِنَّ et ses sœurs',
      },
      {
        type: 'examples_grid',
        content: 'Subject takes accusative after إِنَّ',
        contentFr: 'Le sujet prend l\'accusatif après إِنَّ',
        examples: [
          { arabic: 'إِنَّ الْعِلْمَ نُورٌ', english: 'Indeed, knowledge is light', french: 'Certes, le savoir est lumière' },
          { arabic: 'لَكِنَّ الْحَيَاةَ صَعْبَةٌ', english: 'But life is difficult', french: 'Mais la vie est difficile' },
          { arabic: 'لَعَلَّ الْجَوَّ جَمِيلٌ', english: 'Perhaps the weather is nice', french: 'Peut-être que le temps est beau' },
          { arabic: 'كَأَنَّ الْبَيْتَ قَصْرٌ', english: 'As if the house is a palace', french: 'Comme si la maison était un palais' },
        ],
      },
      {
        type: 'text',
        content: 'Time & Place Adverbs (ظَرْف)',
        contentFr: 'Adverbes de temps et de lieu (ظَرْف)',
      },
      {
        type: 'examples_grid',
        content: 'Adverbial accusative',
        contentFr: 'Accusatif adverbial',
        examples: [
          { arabic: 'سَافَرْتُ يَوْمًا', english: 'I traveled for a day', french: 'J\'ai voyagé pendant un jour' },
          { arabic: 'جَلَسْتُ أَمَامَ الْبَابِ', english: 'I sat in front of the door', french: 'Je me suis assis devant la porte' },
          { arabic: 'دَرَسْتُ سَاعَةً', english: 'I studied for an hour', french: 'J\'ai étudié pendant une heure' },
          { arabic: 'مَشَيْتُ كَثِيرًا', english: 'I walked a lot', french: 'J\'ai beaucoup marché' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Accusative Endings Summary',
        contentFr: 'Résumé des terminaisons de l\'accusatif',
        leftLabel: 'Singular',
        leftLabelFr: 'Singulier',
        rightLabel: 'Plural',
        rightLabelFr: 'Pluriel',
        comparisons: [
          { left: { arabic: 'الْكِتَابَ', label: 'the book (obj)', labelFr: 'le livre (obj)' }, right: { arabic: 'الْكُتُبَ', label: 'the books (obj)', labelFr: 'les livres (obj)' } },
          { left: { arabic: 'مُعَلِّمًا', label: 'a teacher (obj)', labelFr: 'un enseignant (obj)' }, right: { arabic: 'مُعَلِّمِينَ', label: 'teachers (obj)', labelFr: 'des enseignants (obj)' } },
        ],
      },
      {
        type: 'note',
        content: 'Remember: [[إِنَّ، أَنَّ، لَكِنَّ، كَأَنَّ، لَيْتَ، لَعَلَّ]] all put their subject in the accusative! These are called "إِنَّ and her sisters" (إِنَّ وَأَخَوَاتُهَا).',
        contentFr: 'Rappelez-vous : [[إِنَّ، أَنَّ، لَكِنَّ، كَأَنَّ، لَيْتَ، لَعَلَّ]] mettent tous leur sujet à l\'accusatif ! On les appelle "إِنَّ et ses sœurs" (إِنَّ وَأَخَوَاتُهَا).',
        arabicDescription: 'إِنَّ وَأَخَوَاتُهَا تَنْصِب الْمُبْتَدَأ',
        arabicTranslation: 'Inna and its sisters put the subject in accusative',
        arabicTranslationFr: 'Inna et ses sœurs mettent le sujet à l\'accusatif',
      },
    ],
  },

  // LESSON 33: Case Endings - Genitive
  {
    id: 'grammar-33',
    title: 'Case Endings: Genitive',
    titleFr: 'Cas : Le Génitif',
    titleArabic: 'الْجَرّ',
    description: 'Understand the genitive case after prepositions',
    descriptionFr: 'Comprenez le cas génitif après les prépositions',
    level: 'advanced',
    category: 'nouns',
    order: 33,
    exercises: ['ex-grammar-33-1', 'ex-grammar-33-2'],
    content: [
      {
        type: 'description',
        content: 'The [[genitive case]] (الْجَرّ) appears after [[prepositions]] and in [[possessive constructions]] (إضافة). It indicates relationships like location, direction, possession, and more.',
        contentFr: 'Le [[cas génitif]] (الْجَرّ) apparaît après les [[prépositions]] et dans les [[constructions possessives]] (إضافة). Il indique des relations comme le lieu, la direction, la possession, et plus encore.',
        arabicDescription: 'الْجَرّ يَأْتِي بَعْدَ حُرُوف الْجَرّ وَفِي الْإِضَافَة',
        arabicTranslation: 'Genitive comes after prepositions and in possessive constructions',
        arabicTranslationFr: 'Le génitif vient après les prépositions et dans les constructions possessives',
      },
      {
        type: 'rule',
        content: 'Genitive endings: singular nouns add [[ـِ]] (kasra) or [[ـٍ]] (tanwin kasra). Dual nouns end in [[ـَيْنِ]] (same as accusative). Sound masculine plurals end in [[ـِينَ]]. Sound feminine plurals end in [[ـَاتٍ]].',
        contentFr: 'Terminaisons du génitif : les noms singuliers ajoutent [[ـِ]] (kasra) ou [[ـٍ]] (tanwin kasra). Les noms duels se terminent par [[ـَيْنِ]] (comme l\'accusatif). Les pluriels masculins réguliers se terminent par [[ـِينَ]]. Les pluriels féminins réguliers se terminent par [[ـَاتٍ]].',
        arabicDescription: 'عَلَامَات الْجَرّ: الْكَسْرَة، الْيَاء وَالنُّون',
        arabicTranslation: 'Signs of genitive: kasra, ya and nun',
        arabicTranslationFr: 'Les marques du génitif : kasra, ya et noun',
      },
      {
        type: 'text',
        content: 'After Prepositions',
        contentFr: 'Après les prépositions',
      },
      {
        type: 'examples_grid',
        content: 'Common prepositions with genitive',
        contentFr: 'Prépositions courantes avec le génitif',
        examples: [
          { arabic: 'فِي الْبَيْتِ', english: 'in the house', french: 'dans la maison' },
          { arabic: 'مِنَ الْمَدْرَسَةِ', english: 'from the school', french: 'de l\'école' },
          { arabic: 'إِلَى السُّوقِ', english: 'to the market', french: 'au marché' },
          { arabic: 'عَلَى الطَّاوِلَةِ', english: 'on the table', french: 'sur la table' },
          { arabic: 'بِالْقَلَمِ', english: 'with the pen', french: 'avec le stylo' },
          { arabic: 'لِلطَّالِبِ', english: 'for the student', french: 'pour l\'étudiant' },
        ],
      },
      {
        type: 'text',
        content: 'In Possessive (إِضَافَة)',
        contentFr: 'Dans le possessif (إِضَافَة)',
      },
      {
        type: 'examples_grid',
        content: 'Second noun is always genitive',
        contentFr: 'Le deuxième nom est toujours au génitif',
        examples: [
          { arabic: 'كِتَابُ الطَّالِبِ', english: 'the student\'s book', french: 'le livre de l\'étudiant' },
          { arabic: 'بَابُ الْمَدْرَسَةِ', english: 'the school\'s door', french: 'la porte de l\'école' },
          { arabic: 'مُعَلِّمُ اللُّغَةِ', english: 'the language teacher', french: 'le professeur de langue' },
          { arabic: 'سَيَّارَةُ أَبِي', english: 'my father\'s car', french: 'la voiture de mon père' },
        ],
      },
      {
        type: 'text',
        content: 'Common Prepositions',
        contentFr: 'Prépositions courantes',
      },
      {
        type: 'examples_grid',
        content: 'Essential prepositions',
        contentFr: 'Prépositions essentielles',
        examples: [
          { arabic: 'فِي', english: 'in, at', french: 'dans, à' },
          { arabic: 'مِنْ', english: 'from', french: 'de, depuis' },
          { arabic: 'إِلَى', english: 'to, toward', french: 'à, vers' },
          { arabic: 'عَلَى', english: 'on, upon', french: 'sur' },
          { arabic: 'عَنْ', english: 'about, from', french: 'à propos de, de' },
          { arabic: 'بِـ', english: 'with, by', french: 'avec, par' },
          { arabic: 'لِـ', english: 'for, to', french: 'pour, à' },
          { arabic: 'كَـ', english: 'like, as', french: 'comme' },
        ],
      },
      {
        type: 'comparison_grid',
        content: 'Three Cases Summary',
        contentFr: 'Résumé des trois cas',
        leftLabel: 'Case',
        leftLabelFr: 'Cas',
        rightLabel: 'الْكِتَاب',
        rightLabelFr: 'الْكِتَاب',
        comparisons: [
          { left: { arabic: 'الرَّفْع', label: 'Nominative', labelFr: 'Nominatif' }, right: { arabic: 'الْكِتَابُ', label: 'the book (subj)', labelFr: 'le livre (sujet)' } },
          { left: { arabic: 'النَّصْب', label: 'Accusative', labelFr: 'Accusatif' }, right: { arabic: 'الْكِتَابَ', label: 'the book (obj)', labelFr: 'le livre (obj)' } },
          { left: { arabic: 'الْجَرّ', label: 'Genitive', labelFr: 'Génitif' }, right: { arabic: 'الْكِتَابِ', label: 'the book (after prep)', labelFr: 'le livre (après prép.)' } },
        ],
      },
      {
        type: 'note',
        content: 'Diptotes (الْمَمْنُوع مِنَ الصَّرْف) like أَحْمَد، مَكَّة، صَحْرَاء take [[فَتْحَة]] instead of [[كَسْرَة]] in genitive when indefinite: فِي صَحْرَاءَ (in a desert).',
        contentFr: 'Les diptotes (الْمَمْنُوع مِنَ الصَّرْف) comme أَحْمَد، مَكَّة، صَحْرَاء prennent [[فَتْحَة]] au lieu de [[كَسْرَة]] au génitif quand ils sont indéfinis : فِي صَحْرَاءَ (dans un désert).',
        arabicDescription: 'الْمَمْنُوع مِنَ الصَّرْف يُجَرّ بِالْفَتْحَة',
        arabicTranslation: 'Diptotes take fatha in genitive',
        arabicTranslationFr: 'Les diptotes prennent la fatha au génitif',
      },
    ],
  },

  // LESSON 34: The Passive Voice
  {
    id: 'grammar-34',
    title: 'The Passive Voice',
    titleFr: 'La Voix Passive',
    titleArabic: 'الْمَبْنِيّ لِلْمَجْهُول',
    description: 'Express actions without naming the doer',
    descriptionFr: 'Exprimez des actions sans nommer l\'agent',
    level: 'advanced',
    category: 'verbs',
    order: 34,
    exercises: ['ex-grammar-34-1', 'ex-grammar-34-2'],
    content: [
      {
        type: 'description',
        content: 'The [[passive voice]] shifts focus from who did the action to what was done. "The book was written" emphasizes the book, not the writer. Arabic has a built-in passive pattern!',
        contentFr: 'La [[voix passive]] déplace l\'attention de celui qui a fait l\'action vers ce qui a été fait. "Le livre a été écrit" met l\'accent sur le livre, pas l\'écrivain. L\'arabe a un schème passif intégré !',
        arabicDescription: 'الْمَبْنِيّ لِلْمَجْهُول يُرَكِّز عَلَى الْفِعْل لَا الْفَاعِل',
        arabicTranslation: 'The passive voice focuses on the action not the doer',
        arabicTranslationFr: 'La voix passive se concentre sur l\'action et non sur l\'agent',
      },
      {
        type: 'rule',
        content: 'Past passive: change vowels to [[ُـِـ]] pattern. [[كَتَبَ]] (wrote) → [[كُتِبَ]] (was written). Present passive: change to [[ُـْـَـ]] pattern. [[يَكْتُبُ]] → [[يُكْتَبُ]] (is written).',
        contentFr: 'Passif au passé : changez les voyelles en schème [[ُـِـ]]. [[كَتَبَ]] (a écrit) → [[كُتِبَ]] (a été écrit). Passif au présent : changez en schème [[ُـْـَـ]]. [[يَكْتُبُ]] → [[يُكْتَبُ]] (est écrit).',
        arabicDescription: 'الْمَاضِي: ضَمَّة ثُمَّ كَسْرَة. الْمُضَارِع: ضَمَّة ثُمَّ فَتْحَة',
        arabicTranslation: 'Past: damma then kasra. Present: damma then fatha',
        arabicTranslationFr: 'Passé : damma puis kasra. Présent : damma puis fatha',
      },
      {
        type: 'text',
        content: 'Past Tense Passive',
        contentFr: 'Passif au passé',
      },
      {
        type: 'comparison_grid',
        content: 'Active to Passive',
        contentFr: 'Actif vers passif',
        leftLabel: 'Active (مَعْلُوم)',
        leftLabelFr: 'Actif (مَعْلُوم)',
        rightLabel: 'Passive (مَجْهُول)',
        rightLabelFr: 'Passif (مَجْهُول)',
        comparisons: [
          { left: { arabic: 'كَتَبَ', label: 'he wrote', labelFr: 'il a écrit' }, right: { arabic: 'كُتِبَ', label: 'it was written', labelFr: 'il a été écrit' } },
          { left: { arabic: 'فَتَحَ', label: 'he opened', labelFr: 'il a ouvert' }, right: { arabic: 'فُتِحَ', label: 'it was opened', labelFr: 'il a été ouvert' } },
          { left: { arabic: 'سَمِعَ', label: 'he heard', labelFr: 'il a entendu' }, right: { arabic: 'سُمِعَ', label: 'it was heard', labelFr: 'il a été entendu' } },
          { left: { arabic: 'عَلِمَ', label: 'he knew', labelFr: 'il a su' }, right: { arabic: 'عُلِمَ', label: 'it was known', labelFr: 'il a été su' } },
        ],
      },
      {
        type: 'text',
        content: 'Present Tense Passive',
        contentFr: 'Passif au présent',
      },
      {
        type: 'comparison_grid',
        content: 'Active to Passive',
        contentFr: 'Actif vers passif',
        leftLabel: 'Active',
        leftLabelFr: 'Actif',
        rightLabel: 'Passive',
        rightLabelFr: 'Passif',
        comparisons: [
          { left: { arabic: 'يَكْتُبُ', label: 'he writes', labelFr: 'il écrit' }, right: { arabic: 'يُكْتَبُ', label: 'it is written', labelFr: 'il est écrit' } },
          { left: { arabic: 'يَفْتَحُ', label: 'he opens', labelFr: 'il ouvre' }, right: { arabic: 'يُفْتَحُ', label: 'it is opened', labelFr: 'il est ouvert' } },
          { left: { arabic: 'يَسْمَعُ', label: 'he hears', labelFr: 'il entend' }, right: { arabic: 'يُسْمَعُ', label: 'it is heard', labelFr: 'il est entendu' } },
        ],
      },
      {
        type: 'text',
        content: 'Full Sentences',
        contentFr: 'Phrases complètes',
      },
      {
        type: 'examples_grid',
        content: 'Passive in context',
        contentFr: 'Le passif en contexte',
        examples: [
          { arabic: 'كُتِبَ الْكِتَابُ', english: 'The book was written', french: 'Le livre a été écrit' },
          { arabic: 'فُتِحَ الْبَابُ', english: 'The door was opened', french: 'La porte a été ouverte' },
          { arabic: 'يُدَرَّسُ الدَّرْسُ', english: 'The lesson is being taught', french: 'La leçon est enseignée' },
          { arabic: 'أُكِلَ الطَّعَامُ', english: 'The food was eaten', french: 'La nourriture a été mangée' },
          { arabic: 'بُنِيَ الْمَسْجِدُ', english: 'The mosque was built', french: 'La mosquée a été construite' },
          { arabic: 'قِيلَ إِنَّ...', english: 'It was said that...', french: 'Il a été dit que...' },
        ],
      },
      {
        type: 'note',
        content: 'The original object becomes the [[نَائِب الْفَاعِل]] (deputy subject) and takes [[nominative case]]: كَتَبَ الرَّجُلُ [[الْكِتَابَ]] → كُتِبَ [[الْكِتَابُ]]',
        contentFr: 'Le complément d\'objet original devient le [[نَائِب الْفَاعِل]] (sujet suppléant) et prend le [[cas nominatif]] : كَتَبَ الرَّجُلُ [[الْكِتَابَ]] → كُتِبَ [[الْكِتَابُ]]',
        arabicDescription: 'الْمَفْعُول بِهِ يُصْبِح نَائِب فَاعِل مَرْفُوع',
        arabicTranslation: 'The object becomes deputy subject in nominative',
        arabicTranslationFr: 'Le complément d\'objet devient sujet suppléant au nominatif',
      },
    ],
  },

  // LESSON 35: Verb Forms II-IV
  {
    id: 'grammar-35',
    title: 'Verb Forms II, III, IV',
    titleFr: 'Formes Verbales II, III, IV',
    titleArabic: 'الْأَوْزَان II-III-IV',
    description: 'Intensify, interact, and cause with verb forms',
    descriptionFr: 'Intensifiez, interagissez et causez avec les formes verbales',
    level: 'advanced',
    category: 'verbs',
    order: 35,
    exercises: ['ex-grammar-35-1', 'ex-grammar-35-2'],
    content: [
      {
        type: 'description',
        content: 'These three forms transform basic verbs into more complex meanings. [[Form II]] intensifies or makes causative, [[Form III]] indicates interaction with someone, and [[Form IV]] is causative.',
        contentFr: 'Ces trois formes transforment les verbes de base en significations plus complexes. [[La forme II]] intensifie ou rend causatif, [[la forme III]] indique l\'interaction avec quelqu\'un, et [[la forme IV]] est causative.',
        arabicDescription: 'الْوَزْن الثَّانِي لِلتَّكْثِير، الثَّالِث لِلْمُشَارَكَة، الرَّابِع لِلتَّعْدِيَة',
        arabicTranslation: 'Form II for intensifying, Form III for reciprocal, Form IV for causative',
        arabicTranslationFr: 'Forme II pour l\'intensification, forme III pour le réciproque, forme IV pour le causatif',
      },
      {
        type: 'text',
        content: 'Form II: فَعَّلَ (Double Middle)',
        contentFr: 'Forme II : فَعَّلَ (Doublement du milieu)',
      },
      {
        type: 'rule',
        content: 'Form II doubles the middle letter: [[فَعَّلَ]]. It often means: 1) [[Intensive]] - doing something a lot, 2) [[Causative]] - making someone do something, 3) [[Denominative]] - making a verb from a noun.',
        contentFr: 'La forme II double la lettre médiane : [[فَعَّلَ]]. Elle signifie souvent : 1) [[Intensif]] - faire quelque chose beaucoup, 2) [[Causatif]] - faire faire quelque chose à quelqu\'un, 3) [[Dénominatif]] - former un verbe à partir d\'un nom.',
        arabicDescription: 'فَعَّلَ: تَشْدِيد الْعَيْن لِلتَّكْثِير وَالتَّعْدِيَة',
        arabicTranslation: 'Fa33ala: doubling the middle letter for intensifying and causative',
        arabicTranslationFr: 'Fa33ala : doublement de la lettre médiane pour l\'intensification et le causatif',
      },
      {
        type: 'examples_grid',
        content: 'Form II Examples',
        contentFr: 'Exemples de la forme II',
        examples: [
          { arabic: 'عَلِمَ ← عَلَّمَ', english: 'knew → taught (made know)', french: 'savait → a enseigné (faire savoir)' },
          { arabic: 'كَسَرَ ← كَسَّرَ', english: 'broke → smashed (broke into pieces)', french: 'a cassé → a fracassé (cassé en morceaux)' },
          { arabic: 'فَرِحَ ← فَرَّحَ', english: 'was happy → made happy', french: 'était heureux → a rendu heureux' },
          { arabic: 'نَظُفَ ← نَظَّفَ', english: 'was clean → cleaned', french: 'était propre → a nettoyé' },
          { arabic: 'صَوَّرَ', english: 'photographed (from صُورَة)', french: 'a photographié (de صُورَة)' },
        ],
      },
      {
        type: 'text',
        content: 'Form III: فَاعَلَ (Add Alif)',
        contentFr: 'Forme III : فَاعَلَ (Ajout du Alif)',
      },
      {
        type: 'rule',
        content: 'Form III adds alif after first letter: [[فَاعَلَ]]. It usually means [[doing something with/to someone]] - reciprocal or attempted action toward another person.',
        contentFr: 'La forme III ajoute un alif après la première lettre : [[فَاعَلَ]]. Elle signifie généralement [[faire quelque chose avec/à quelqu\'un]] - action réciproque ou tentée envers une autre personne.',
        arabicDescription: 'فَاعَلَ: إِضَافَة أَلِف لِلْمُشَارَكَة',
        arabicTranslation: 'Faa3ala: adding alif for reciprocal action',
        arabicTranslationFr: 'Faa3ala : ajout du alif pour l\'action réciproque',
      },
      {
        type: 'examples_grid',
        content: 'Form III Examples',
        contentFr: 'Exemples de la forme III',
        examples: [
          { arabic: 'كَتَبَ ← كَاتَبَ', english: 'wrote → corresponded with', french: 'a écrit → a correspondu avec' },
          { arabic: 'قَتَلَ ← قَاتَلَ', english: 'killed → fought with', french: 'a tué → s\'est battu avec' },
          { arabic: 'سَافَرَ', english: 'traveled (went far)', french: 'a voyagé (est allé loin)' },
          { arabic: 'سَاعَدَ', english: 'helped', french: 'a aidé' },
          { arabic: 'حَاوَلَ', english: 'tried, attempted', french: 'a essayé, a tenté' },
        ],
      },
      {
        type: 'text',
        content: 'Form IV: أَفْعَلَ (Add Hamza)',
        contentFr: 'Forme IV : أَفْعَلَ (Ajout du Hamza)',
      },
      {
        type: 'rule',
        content: 'Form IV adds hamza at the start: [[أَفْعَلَ]]. It\'s primarily [[causative]] - making someone/something do the action of Form I.',
        contentFr: 'La forme IV ajoute un hamza au début : [[أَفْعَلَ]]. Elle est principalement [[causative]] - faire faire l\'action de la forme I à quelqu\'un/quelque chose.',
        arabicDescription: 'أَفْعَلَ: إِضَافَة هَمْزَة لِلتَّعْدِيَة',
        arabicTranslation: 'Af3ala: adding hamza for causative',
        arabicTranslationFr: 'Af3ala : ajout du hamza pour le causatif',
      },
      {
        type: 'examples_grid',
        content: 'Form IV Examples',
        contentFr: 'Exemples de la forme IV',
        examples: [
          { arabic: 'خَرَجَ ← أَخْرَجَ', english: 'went out → took out', french: 'est sorti → a sorti' },
          { arabic: 'جَلَسَ ← أَجْلَسَ', english: 'sat → seated (made sit)', french: 's\'est assis → a fait asseoir' },
          { arabic: 'سْلَمَ ← أَسْلَمَ', english: 'was safe → submitted (to Islam)', french: 'était sauf → s\'est soumis (à l\'Islam)' },
          { arabic: 'أَرْسَلَ', english: 'sent', french: 'a envoyé' },
          { arabic: 'أَعْطَى', english: 'gave', french: 'a donné' },
        ],
      },
      {
        type: 'note',
        content: 'Form II and IV are both causative but differ: Form II often implies repetition or intensity, while Form IV is simpler causation. عَلَّمَ (II) = taught repeatedly; أَعْلَمَ (IV) = informed.',
        contentFr: 'Les formes II et IV sont toutes deux causatives mais diffèrent : la forme II implique souvent la répétition ou l\'intensité, tandis que la forme IV est une causation plus simple. عَلَّمَ (II) = a enseigné de manière répétée ; أَعْلَمَ (IV) = a informé.',
        arabicDescription: 'فَعَّلَ لِلتَّكْثِير، أَفْعَلَ لِلتَّعْدِيَة الْبَسِيطَة',
        arabicTranslation: 'Fa33ala for intensifying, Af3ala for simple causative',
        arabicTranslationFr: 'Fa33ala pour l\'intensification, Af3ala pour le causatif simple',
      },
    ],
  },

  // LESSON 36: Verb Forms V-VII
  {
    id: 'grammar-36',
    title: 'Verb Forms V, VI, VII',
    titleFr: 'Formes Verbales V, VI, VII',
    titleArabic: 'الْأَوْزَان V-VI-VII',
    description: 'Reflexive, reciprocal, and passive-like forms',
    descriptionFr: 'Formes réfléchies, réciproques et passives',
    level: 'advanced',
    category: 'verbs',
    order: 36,
    exercises: ['ex-grammar-36-1', 'ex-grammar-36-2'],
    content: [
      {
        type: 'description',
        content: 'These forms add [[تَـ]] or [[اِنْـ]] prefixes. [[Form V]] is reflexive of II, [[Form VI]] is reciprocal, and [[Form VII]] has a passive-like meaning. The action "happens to" the subject.',
        contentFr: 'Ces formes ajoutent les préfixes [[تَـ]] ou [[اِنْـ]]. [[La forme V]] est le réfléchi de la II, [[la forme VI]] est réciproque, et [[la forme VII]] a un sens passif. L\'action « arrive au » sujet.',
        arabicDescription: 'تَفَعَّلَ وَتَفَاعَلَ وَاِنْفَعَلَ: الْفِعْل يَقَع عَلَى الْفَاعِل',
        arabicTranslation: 'Tafa33ala, Tafaa3ala, Infa3ala: the action falls on the subject',
        arabicTranslationFr: 'Tafa33ala, Tafaa3ala, Infa3ala : l\'action retombe sur le sujet',
      },
      {
        type: 'text',
        content: 'Form V: تَفَعَّلَ (Reflexive of II)',
        contentFr: 'Forme V : تَفَعَّلَ (Réfléchi de la II)',
      },
      {
        type: 'rule',
        content: 'Form V = تَـ + Form II: [[تَفَعَّلَ]]. It\'s the [[reflexive]] of Form II - you do the action to yourself. If عَلَّمَ means "taught," then تَعَلَّمَ means "learned (taught oneself)."',
        contentFr: 'Forme V = تَـ + Forme II : [[تَفَعَّلَ]]. C\'est le [[réfléchi]] de la forme II - on fait l\'action à soi-même. Si عَلَّمَ signifie « a enseigné », alors تَعَلَّمَ signifie « a appris (s\'est enseigné) ».',
        arabicDescription: 'تَفَعَّلَ: مُطَاوِع فَعَّلَ، الْفِعْل يَرْجِع إِلَى الْفَاعِل',
        arabicTranslation: 'Tafa33ala: reflexive of Fa33ala, the action returns to the subject',
        arabicTranslationFr: 'Tafa33ala : réfléchi de Fa33ala, l\'action revient au sujet',
      },
      {
        type: 'examples_grid',
        content: 'Form V Examples',
        contentFr: 'Exemples de la forme V',
        examples: [
          { arabic: 'عَلَّمَ ← تَعَلَّمَ', english: 'taught → learned', french: 'a enseigné → a appris' },
          { arabic: 'كَلَّمَ ← تَكَلَّمَ', english: 'spoke to → spoke, talked', french: 'a parlé à → a parlé, a discuté' },
          { arabic: 'ذَكَّرَ ← تَذَكَّرَ', english: 'reminded → remembered', french: 'a rappelé → s\'est souvenu' },
          { arabic: 'تَوَقَّعَ', english: 'expected', french: 's\'est attendu à' },
          { arabic: 'تَصَرَّفَ', english: 'behaved, acted', french: 's\'est comporté, a agi' },
        ],
      },
      {
        type: 'text',
        content: 'Form VI: تَفَاعَلَ (Reciprocal)',
        contentFr: 'Forme VI : تَفَاعَلَ (Réciproque)',
      },
      {
        type: 'rule',
        content: 'Form VI = تَـ + Form III: [[تَفَاعَلَ]]. It means [[doing something with each other]] or [[pretending]] to do something.',
        contentFr: 'Forme VI = تَـ + Forme III : [[تَفَاعَلَ]]. Elle signifie [[faire quelque chose l\'un avec l\'autre]] ou [[faire semblant]] de faire quelque chose.',
        arabicDescription: 'تَفَاعَلَ: لِلْمُشَارَكَة الْمُتَبَادَلَة أَوْ التَّظَاهُر',
        arabicTranslation: 'Tafaa3ala: for mutual action or pretending',
        arabicTranslationFr: 'Tafaa3ala : pour l\'action mutuelle ou faire semblant',
      },
      {
        type: 'examples_grid',
        content: 'Form VI Examples',
        contentFr: 'Exemples de la forme VI',
        examples: [
          { arabic: 'قَاتَلَ ← تَقَاتَلَ', english: 'fought → fought each other', french: 's\'est battu avec → se sont battus entre eux' },
          { arabic: 'كَاتَبَ ← تَكَاتَبَ', english: 'wrote to → wrote to each other', french: 'a écrit à → se sont écrit mutuellement' },
          { arabic: 'تَعَاوَنَ', english: 'cooperated', french: 'a coopéré' },
          { arabic: 'تَبَادَلَ', english: 'exchanged', french: 'a échangé' },
          { arabic: 'تَظَاهَرَ', english: 'pretended', french: 'a fait semblant' },
        ],
      },
      {
        type: 'text',
        content: 'Form VII: اِنْفَعَلَ (Passive-like)',
        contentFr: 'Forme VII : اِنْفَعَلَ (Quasi-passif)',
      },
      {
        type: 'rule',
        content: 'Form VII adds اِنْـ: [[اِنْفَعَلَ]]. It has a [[passive or resultative]] meaning - the action happens to the subject. Often used for physical changes.',
        contentFr: 'La forme VII ajoute اِنْـ : [[اِنْفَعَلَ]]. Elle a un sens [[passif ou résultatif]] - l\'action arrive au sujet. Souvent utilisée pour les changements physiques.',
        arabicDescription: 'اِنْفَعَلَ: لِلْمُطَاوَعَة، الْفِعْل يَحْدُث لِلْفَاعِل',
        arabicTranslation: 'Infa3ala: for passive-like meaning, the action happens to the subject',
        arabicTranslationFr: 'Infa3ala : pour le sens quasi-passif, l\'action arrive au sujet',
      },
      {
        type: 'examples_grid',
        content: 'Form VII Examples',
        contentFr: 'Exemples de la forme VII',
        examples: [
          { arabic: 'كَسَرَ ← اِنْكَسَرَ', english: 'broke → got broken', french: 'a cassé → s\'est cassé' },
          { arabic: 'فَتَحَ ← اِنْفَتَحَ', english: 'opened → got opened', french: 'a ouvert → s\'est ouvert' },
          { arabic: 'قَطَعَ ← اِنْقَطَعَ', english: 'cut → got cut off', french: 'a coupé → s\'est coupé' },
          { arabic: 'اِنْطَلَقَ', english: 'set off, departed', french: 'est parti, s\'est élancé' },
          { arabic: 'اِنْتَشَرَ', english: 'spread', french: 's\'est répandu' },
        ],
      },
      {
        type: 'note',
        content: 'Form VII cannot take a direct object! كَسَرْتُ الزُّجَاجَ (I broke the glass) but اِنْكَسَرَ الزُّجَاجُ (The glass broke). The subject "receives" the action.',
        contentFr: 'La forme VII ne peut pas prendre de complément d\'objet direct ! كَسَرْتُ الزُّجَاجَ (J\'ai cassé le verre) mais اِنْكَسَرَ الزُّجَاجُ (Le verre s\'est cassé). Le sujet « reçoit » l\'action.',
        arabicDescription: 'اِنْفَعَلَ لَا يَتَعَدَّى إِلَى مَفْعُول بِهِ',
        arabicTranslation: 'Infa3ala does not take a direct object',
        arabicTranslationFr: 'Infa3ala ne prend pas de complément d\'objet direct',
      },
    ],
  },

  // LESSON 37: Verb Forms VIII-X
  {
    id: 'grammar-37',
    title: 'Verb Forms VIII, IX, X',
    titleFr: 'Formes Verbales VIII, IX, X',
    titleArabic: 'الْأَوْزَان VIII-IX-X',
    description: 'Reflexive, colors, and seeking with advanced forms',
    descriptionFr: 'Formes réfléchies, couleurs et demande avec les formes avancées',
    level: 'advanced',
    category: 'verbs',
    order: 37,
    exercises: ['ex-grammar-37-1', 'ex-grammar-37-2'],
    content: [
      {
        type: 'description',
        content: '[[Form VIII]] is reflexive with infixed ت, [[Form IX]] is rare and used for colors/defects, and [[Form X]] means "to seek, consider, or ask for" something.',
        contentFr: '[[La forme VIII]] est réfléchie avec un ت infixé, [[la forme IX]] est rare et utilisée pour les couleurs/défauts, et [[la forme X]] signifie « chercher, considérer ou demander » quelque chose.',
        arabicDescription: 'اِفْتَعَلَ لِلاِكْتِسَاب، اِفْعَلَّ لِلْأَلْوَان، اِسْتَفْعَلَ لِلطَّلَب',
        arabicTranslation: 'Ifta3ala for acquiring, If3alla for colors, Istaf3ala for seeking',
        arabicTranslationFr: 'Ifta3ala pour l\'acquisition, If3alla pour les couleurs, Istaf3ala pour la demande',
      },
      {
        type: 'text',
        content: 'Form VIII: اِفْتَعَلَ (Reflexive)',
        contentFr: 'Forme VIII : اِفْتَعَلَ (Réfléchi)',
      },
      {
        type: 'rule',
        content: 'Form VIII infixes ت after first radical: [[اِفْتَعَلَ]]. It often means [[doing something for oneself]], [[acquiring]], or has [[reflexive/middle]] sense.',
        contentFr: 'La forme VIII insère un ت après la première radicale : [[اِفْتَعَلَ]]. Elle signifie souvent [[faire quelque chose pour soi-même]], [[acquérir]], ou a un sens [[réfléchi/moyen]].',
        arabicDescription: 'اِفْتَعَلَ: إِضَافَة تَاء بَعْد الْفَاء لِلاِكْتِسَاب',
        arabicTranslation: 'Ifta3ala: adding ta after the first letter for acquiring',
        arabicTranslationFr: 'Ifta3ala : ajout du ta après la première lettre pour l\'acquisition',
      },
      {
        type: 'examples_grid',
        content: 'Form VIII Examples',
        contentFr: 'Exemples de la forme VIII',
        examples: [
          { arabic: 'جَمَعَ ← اِجْتَمَعَ', english: 'gathered → met, assembled', french: 'a rassemblé → s\'est réuni, s\'est assemblé' },
          { arabic: 'قَرَبَ ← اِقْتَرَبَ', english: 'was near → approached', french: 'était proche → s\'est approché' },
          { arabic: 'اِخْتَارَ', english: 'chose (for oneself)', french: 'a choisi (pour soi-même)' },
          { arabic: 'اِشْتَرَى', english: 'bought', french: 'a acheté' },
          { arabic: 'اِكْتَشَفَ', english: 'discovered', french: 'a découvert' },
          { arabic: 'اِحْتَرَمَ', english: 'respected', french: 'a respecté' },
        ],
      },
      {
        type: 'text',
        content: 'Form IX: اِفْعَلَّ (Colors & Defects)',
        contentFr: 'Forme IX : اِفْعَلَّ (Couleurs et défauts)',
      },
      {
        type: 'rule',
        content: 'Form IX doubles the final letter: [[اِفْعَلَّ]]. It\'s rare and only used for [[colors]] and [[physical defects]]. Very predictable!',
        contentFr: 'La forme IX double la dernière lettre : [[اِفْعَلَّ]]. Elle est rare et utilisée uniquement pour les [[couleurs]] et les [[défauts physiques]]. Très prévisible !',
        arabicDescription: 'اِفْعَلَّ: تَشْدِيد اللَّام لِلْأَلْوَان وَالْعُيُوب',
        arabicTranslation: 'If3alla: doubling the last letter for colors and defects',
        arabicTranslationFr: 'If3alla : doublement de la dernière lettre pour les couleurs et les défauts',
      },
      {
        type: 'examples_grid',
        content: 'Form IX Examples',
        contentFr: 'Exemples de la forme IX',
        examples: [
          { arabic: 'اِحْمَرَّ', english: 'became red, blushed', french: 'est devenu rouge, a rougi' },
          { arabic: 'اِصْفَرَّ', english: 'became yellow', french: 'est devenu jaune' },
          { arabic: 'اِسْوَدَّ', english: 'became black', french: 'est devenu noir' },
          { arabic: 'اِبْيَضَّ', english: 'became white', french: 'est devenu blanc' },
          { arabic: 'اِعْوَرَّ', english: 'became one-eyed', french: 'est devenu borgne' },
        ],
      },
      {
        type: 'text',
        content: 'Form X: اِسْتَفْعَلَ (Seeking)',
        contentFr: 'Forme X : اِسْتَفْعَلَ (Demande)',
      },
      {
        type: 'rule',
        content: 'Form X adds اِسْتَـ: [[اِسْتَفْعَلَ]]. It primarily means [[seeking]], [[asking for]], or [[considering something to be]]. Very productive form!',
        contentFr: 'La forme X ajoute اِسْتَـ : [[اِسْتَفْعَلَ]]. Elle signifie principalement [[chercher]], [[demander]], ou [[considérer quelque chose comme]]. Forme très productive !',
        arabicDescription: 'اِسْتَفْعَلَ: إِضَافَة سِين وَتَاء لِلطَّلَب وَالاِعْتِبَار',
        arabicTranslation: 'Istaf3ala: adding sin and ta for seeking and considering',
        arabicTranslationFr: 'Istaf3ala : ajout du sin et du ta pour la demande et la considération',
      },
      {
        type: 'examples_grid',
        content: 'Form X Examples',
        contentFr: 'Exemples de la forme X',
        examples: [
          { arabic: 'غَفَرَ ← اِسْتَغْفَرَ', english: 'forgave → sought forgiveness', french: 'a pardonné → a demandé pardon' },
          { arabic: 'عَمَلَ ← اِسْتَعْمَلَ', english: 'worked → used, employed', french: 'a travaillé → a utilisé, a employé' },
          { arabic: 'خْرَجَ ← اِسْتَخْرَجَ', english: 'went out → extracted', french: 'est sorti → a extrait' },
          { arabic: 'اِسْتَطَاعَ', english: 'was able, could', french: 'a pu, pouvait' },
          { arabic: 'اِسْتَمَعَ', english: 'listened (sought to hear)', french: 'a écouté (a cherché à entendre)' },
          { arabic: 'اِسْتَحْسَنَ', english: 'approved, found good', french: 'a approuvé, a trouvé bien' },
        ],
      },
      {
        type: 'note',
        content: 'Form X has three main meanings: 1) [[To seek]]: اِسْتَغْفَرَ (seek forgiveness), 2) [[To consider as]]: اِسْتَحْسَنَ (consider good), 3) [[To ask for]]: اِسْتَأْذَنَ (ask permission).',
        contentFr: 'La forme X a trois significations principales : 1) [[Chercher]] : اِسْتَغْفَرَ (chercher le pardon), 2) [[Considérer comme]] : اِسْتَحْسَنَ (considérer comme bon), 3) [[Demander]] : اِسْتَأْذَنَ (demander la permission).',
        arabicDescription: 'اِسْتَفْعَلَ: لِلطَّلَب، الاِعْتِبَار، وَالسُّؤَال',
        arabicTranslation: 'Istaf3ala: for seeking, considering, and asking',
        arabicTranslationFr: 'Istaf3ala : pour la demande, la considération et la question',
      },
    ],
  },

  // LESSON 38: Adverbs & Adverbial Expressions
  {
    id: 'grammar-38',
    title: 'Adverbs & Adverbial Expressions',
    titleFr: 'Adverbes & Expressions Adverbiales',
    titleArabic: 'الظُّرُوف وَالْأَحْوَال',
    description: 'Modify verbs with time, place, and manner',
    descriptionFr: 'Modifiez les verbes avec le temps, le lieu et la manière',
    level: 'advanced',
    category: 'sentences',
    order: 38,
    exercises: ['ex-grammar-38-1', 'ex-grammar-38-2'],
    content: [
      {
        type: 'description',
        content: 'Arabic modifies verbs using [[adverbs of time]] (ظَرْف الزَّمَان), [[adverbs of place]] (ظَرْف الْمَكَان), and [[حَال]] (the state/manner of the subject). These add rich detail to sentences.',
        contentFr: 'L\'arabe modifie les verbes en utilisant des [[adverbes de temps]] (ظَرْف الزَّمَان), des [[adverbes de lieu]] (ظَرْف الْمَكَان), et [[حَال]] (l\'état/la manière du sujet). Ceux-ci ajoutent des détails riches aux phrases.',
        arabicDescription: 'الظُّرُوف تُضِيف مَعْلُومَات عَنِ الزَّمَان وَالْمَكَان وَالْحَال',
        arabicTranslation: 'Adverbs add information about time, place, and state',
        arabicTranslationFr: 'Les adverbes ajoutent des informations sur le temps, le lieu et l\'état',
      },
      {
        type: 'text',
        content: 'Time Adverbs (ظَرْف الزَّمَان)',
        contentFr: 'Adverbes de temps (ظَرْف الزَّمَان)',
      },
      {
        type: 'examples_grid',
        content: 'When things happen',
        contentFr: 'Quand les choses se passent',
        examples: [
          { arabic: 'الْيَوْمَ', english: 'today', french: 'aujourd\'hui' },
          { arabic: 'غَدًا', english: 'tomorrow', french: 'demain' },
          { arabic: 'أَمْسِ', english: 'yesterday', french: 'hier' },
          { arabic: 'الْآنَ', english: 'now', french: 'maintenant' },
          { arabic: 'دَائِمًا', english: 'always', french: 'toujours' },
          { arabic: 'أَبَدًا', english: 'never, ever', french: 'jamais' },
          { arabic: 'أَحْيَانًا', english: 'sometimes', french: 'parfois' },
          { arabic: 'قَرِيبًا', english: 'soon', french: 'bientôt' },
        ],
      },
      {
        type: 'text',
        content: 'Place Adverbs (ظَرْف الْمَكَان)',
        contentFr: 'Adverbes de lieu (ظَرْف الْمَكَان)',
      },
      {
        type: 'examples_grid',
        content: 'Where things happen',
        contentFr: 'Où les choses se passent',
        examples: [
          { arabic: 'هُنَا', english: 'here', french: 'ici' },
          { arabic: 'هُنَاكَ', english: 'there', french: 'là-bas' },
          { arabic: 'فَوْقَ', english: 'above', french: 'au-dessus' },
          { arabic: 'تَحْتَ', english: 'below, under', french: 'en dessous, sous' },
          { arabic: 'أَمَامَ', english: 'in front of', french: 'devant' },
          { arabic: 'خَلْفَ', english: 'behind', french: 'derrière' },
          { arabic: 'بَيْنَ', english: 'between', french: 'entre' },
          { arabic: 'حَوْلَ', english: 'around', french: 'autour' },
        ],
      },
      {
        type: 'text',
        content: 'Manner Adverbs (using الْحَال)',
        contentFr: 'Adverbes de manière (utilisant الْحَال)',
      },
      {
        type: 'rule',
        content: 'The [[حَال]] describes [[how]] the subject does the action. It\'s an [[indefinite accusative]] adjective: جَاءَ [[مُبْتَسِمًا]] (He came [[smiling]]). The حَال agrees with what it describes.',
        contentFr: 'Le [[حَال]] décrit [[comment]] le sujet fait l\'action. C\'est un adjectif [[accusatif indéfini]] : جَاءَ [[مُبْتَسِمًا]] (Il est venu [[souriant]]). Le حَال s\'accorde avec ce qu\'il décrit.',
        arabicDescription: 'الْحَال وَصْف لِلْفَاعِل فِي حَالَة الْفِعْل، مَنْصُوب وَنَكِرَة',
        arabicTranslation: 'Hal describes the subject during the action, accusative and indefinite',
        arabicTranslationFr: 'Le hal décrit le sujet pendant l\'action, accusatif et indéfini',
      },
      {
        type: 'examples_grid',
        content: 'حَال Examples',
        contentFr: 'Exemples de حَال',
        examples: [
          { arabic: 'جَاءَ مُسْرِعًا', english: 'He came quickly', french: 'Il est venu rapidement' },
          { arabic: 'رَجَعَتْ سَعِيدَةً', english: 'She returned happy', french: 'Elle est revenue heureuse' },
          { arabic: 'قَرَأْتُ الْكِتَابَ جَالِسًا', english: 'I read the book sitting', french: 'J\'ai lu le livre assis' },
          { arabic: 'دَخَلُوا صَامِتِينَ', english: 'They entered silently', french: 'Ils sont entrés silencieusement' },
        ],
      },
      {
        type: 'text',
        content: 'Common Manner Expressions',
        contentFr: 'Expressions de manière courantes',
      },
      {
        type: 'examples_grid',
        content: 'Useful adverbial phrases',
        contentFr: 'Expressions adverbiales utiles',
        examples: [
          { arabic: 'بِسُرْعَة', english: 'quickly', french: 'rapidement' },
          { arabic: 'بِبُطْء', english: 'slowly', french: 'lentement' },
          { arabic: 'جِدًّا', english: 'very', french: 'très' },
          { arabic: 'فَقَط', english: 'only', french: 'seulement' },
          { arabic: 'أَيْضًا', english: 'also', french: 'aussi' },
          { arabic: 'تَقْرِيبًا', english: 'approximately', french: 'approximativement' },
        ],
      },
      {
        type: 'note',
        content: 'Time and place adverbs take the [[accusative case]] because they answer "when?" and "where?" implicitly: سَافَرْتُ [[يَوْمًا]] (I traveled [[for a day]]). They function as hidden objects.',
        contentFr: 'Les adverbes de temps et de lieu prennent le [[cas accusatif]] car ils répondent implicitement à « quand ? » et « où ? » : سَافَرْتُ [[يَوْمًا]] (J\'ai voyagé [[pendant un jour]]). Ils fonctionnent comme des compléments cachés.',
        arabicDescription: 'ظَرْف الزَّمَان وَالْمَكَان مَنْصُوبَان دَائِمًا',
        arabicTranslation: 'Time and place adverbs are always accusative',
        arabicTranslationFr: 'Les adverbes de temps et de lieu sont toujours à l\'accusatif',
      },
    ],
  },

  // LESSON 39: Exception (الاِسْتِثْنَاء)
  {
    id: 'grammar-39',
    title: 'Exception',
    titleFr: 'L\'Exception',
    titleArabic: 'الاِسْتِثْنَاء',
    description: 'Express "except," "but," and "only" in Arabic',
    descriptionFr: 'Exprimez « sauf », « mais » et « seulement » en arabe',
    level: 'advanced',
    category: 'sentences',
    order: 39,
    exercises: ['ex-grammar-39-1', 'ex-grammar-39-2'],
    content: [
      {
        type: 'description',
        content: 'Exception (الاِسْتِثْنَاء) excludes something from a general statement: "Everyone came [[except]] Ali." Arabic uses words like [[إِلَّا]], [[غَيْر]], [[سِوَى]] for this.',
        contentFr: 'L\'exception (الاِسْتِثْنَاء) exclut quelque chose d\'une déclaration générale : « Tout le monde est venu [[sauf]] Ali. » L\'arabe utilise des mots comme [[إِلَّا]], [[غَيْر]], [[سِوَى]] pour cela.',
        arabicDescription: 'الاِسْتِثْنَاء يُخْرِج شَيْئًا مِنَ الْحُكْم الْعَامّ',
        arabicTranslation: 'Exception excludes something from the general rule',
        arabicTranslationFr: 'L\'exception exclut quelque chose de la règle générale',
      },
      {
        type: 'rule',
        content: '[[إِلَّا]] is the main exception particle. In a complete affirmative sentence, the excepted noun (الْمُسْتَثْنَى) takes the [[accusative]]: حَضَرَ الطُّلَّابُ [[إِلَّا]] عَلِيًّا.',
        contentFr: '[[إِلَّا]] est la particule d\'exception principale. Dans une phrase affirmative complète, le nom excepté (الْمُسْتَثْنَى) prend l\'[[accusatif]] : حَضَرَ الطُّلَّابُ [[إِلَّا]] عَلِيًّا.',
        arabicDescription: 'الْمُسْتَثْنَى بِإِلَّا مَنْصُوب فِي الْجُمْلَة التَّامَّة الْمُوجَبَة',
        arabicTranslation: 'The excepted noun with illa is accusative in complete affirmative sentences',
        arabicTranslationFr: 'Le nom excepté avec illa est à l\'accusatif dans les phrases affirmatives complètes',
      },
      {
        type: 'text',
        content: 'Complete Affirmative (تَامّ مُوجَب)',
        contentFr: 'Affirmative complète (تَامّ مُوجَب)',
      },
      {
        type: 'examples_grid',
        content: 'Accusative after إِلَّا',
        contentFr: 'Accusatif après إِلَّا',
        examples: [
          { arabic: 'جَاءَ الطُّلَّابُ إِلَّا مُحَمَّدًا', english: 'The students came except Muhammad', french: 'Les étudiants sont venus sauf Muhammad' },
          { arabic: 'قَرَأْتُ الْكُتُبَ إِلَّا كِتَابًا', english: 'I read the books except one book', french: 'J\'ai lu les livres sauf un livre' },
          { arabic: 'أَكَلْتُ كُلَّ شَيْءٍ إِلَّا اللَّحْمَ', english: 'I ate everything except the meat', french: 'J\'ai mangé tout sauf la viande' },
        ],
      },
      {
        type: 'text',
        content: 'Negative Sentence (تَامّ مَنْفِيّ)',
        contentFr: 'Phrase négative (تَامّ مَنْفِيّ)',
      },
      {
        type: 'rule',
        content: 'In negative sentences, the excepted noun can follow the case of what it refers to ([[بَدَل]]) OR be accusative: مَا جَاءَ أَحَدٌ إِلَّا عَلِيٌّ/عَلِيًّا.',
        contentFr: 'Dans les phrases négatives, le nom excepté peut suivre le cas de ce à quoi il se réfère ([[بَدَل]]) OU être à l\'accusatif : مَا جَاءَ أَحَدٌ إِلَّا عَلِيٌّ/عَلِيًّا.',
        arabicDescription: 'فِي الْمَنْفِيّ: يَجُوز الْبَدَل أَوْ النَّصْب',
        arabicTranslation: 'In negative sentences: substitution or accusative is allowed',
        arabicTranslationFr: 'Dans les phrases négatives : la substitution ou l\'accusatif est permis',
      },
      {
        type: 'examples_grid',
        content: 'Exception in negative',
        contentFr: 'Exception dans la négation',
        examples: [
          { arabic: 'مَا حَضَرَ أَحَدٌ إِلَّا زَيْدٌ', english: 'No one came except Zaid (nominative)', french: 'Personne n\'est venu sauf Zaid (nominatif)' },
          { arabic: 'لَمْ أَرَ أَحَدًا إِلَّا أَخَاكَ', english: 'I didn\'t see anyone except your brother', french: 'Je n\'ai vu personne sauf ton frère' },
        ],
      },
      {
        type: 'text',
        content: 'Using غَيْر and سِوَى',
        contentFr: 'Utilisation de غَيْر et سِوَى',
      },
      {
        type: 'examples_grid',
        content: 'Alternative exception words',
        contentFr: 'Mots d\'exception alternatifs',
        examples: [
          { arabic: 'جَاءَ الطُّلَّابُ غَيْرَ مُحَمَّدٍ', english: 'The students came except Muhammad', french: 'Les étudiants sont venus sauf Muhammad' },
          { arabic: 'لَيْسَ لِي صَدِيقٌ سِوَاكَ', english: 'I have no friend but you', french: 'Je n\'ai pas d\'ami sauf toi' },
          { arabic: 'لَا أُحِبُّ غَيْرَكَ', english: 'I love no one but you', french: 'Je n\'aime personne d\'autre que toi' },
        ],
      },
      {
        type: 'text',
        content: 'Common Expressions',
        contentFr: 'Expressions courantes',
      },
      {
        type: 'examples_grid',
        content: 'Useful exception phrases',
        contentFr: 'Expressions d\'exception utiles',
        examples: [
          { arabic: 'لَا إِلَهَ إِلَّا اللَّه', english: 'There is no god but God', french: 'Il n\'y a de dieu que Dieu' },
          { arabic: 'لَيْسَ إِلَّا', english: 'nothing but, only', french: 'rien que, seulement' },
          { arabic: 'مَا هُوَ إِلَّا...', english: 'It is nothing but...', french: 'Ce n\'est rien d\'autre que...' },
          { arabic: 'فَقَط/فَحَسْب', english: 'only (also used)', french: 'seulement (aussi utilisé)' },
        ],
      },
      {
        type: 'note',
        content: '[[غَيْر]] acts like a noun and takes the case required by its position. The word after غَيْر is always [[genitive]]: غَيْرِ مُحَمَّدٍ.',
        contentFr: '[[غَيْر]] agit comme un nom et prend le cas requis par sa position. Le mot après غَيْر est toujours au [[génitif]] : غَيْرِ مُحَمَّدٍ.',
        arabicDescription: 'غَيْر تُعْرَب حَسَب مَوْقِعِهَا، وَمَا بَعْدَهَا مَجْرُور',
        arabicTranslation: 'Ghayr takes case based on its position, and what follows is genitive',
        arabicTranslationFr: 'Ghayr prend le cas selon sa position, et ce qui suit est au génitif',
      },
    ],
  },

  // LESSON 40: Complex Sentences & Emphasis
  {
    id: 'grammar-40',
    title: 'Complex Sentences & Emphasis',
    titleFr: 'Phrases Complexes & Emphase',
    titleArabic: 'الْجُمَل الْمُرَكَّبَة وَالتَّوْكِيد',
    description: 'Build sophisticated sentences with emphasis particles',
    descriptionFr: 'Construisez des phrases sophistiquées avec les particules d\'emphase',
    level: 'advanced',
    category: 'sentences',
    order: 40,
    exercises: ['ex-grammar-40-1', 'ex-grammar-40-2'],
    content: [
      {
        type: 'description',
        content: 'Master Arabic rhetoric with [[emphasis particles]], [[oath formulas]], and complex sentence structures. These tools make your Arabic more expressive, persuasive, and elegant.',
        contentFr: 'Maîtrisez la rhétorique arabe avec les [[particules d\'emphase]], les [[formules de serment]], et les structures de phrases complexes. Ces outils rendent votre arabe plus expressif, persuasif et élégant.',
        arabicDescription: 'أَدَوَات التَّوْكِيد وَالْقَسَم تُعَزِّز الْمَعْنَى وَتُضِيف قُوَّة',
        arabicTranslation: 'Emphasis and oath tools strengthen meaning and add power',
        arabicTranslationFr: 'Les outils d\'emphase et de serment renforcent le sens et ajoutent de la puissance',
      },
      {
        type: 'text',
        content: 'Emphasis with إِنَّ and لَـ',
        contentFr: 'Emphase avec إِنَّ et لَـ',
      },
      {
        type: 'rule',
        content: '[[إِنَّ]] emphasizes a statement: "Indeed, verily." Adding [[لَـ]] to the predicate doubles the emphasis: إِنَّ الْعِلْمَ [[لَـ]]نُورٌ (Indeed, knowledge IS light!).',
        contentFr: '[[إِنَّ]] met l\'accent sur une déclaration : « En vérité, certes. » Ajouter [[لَـ]] au prédicat double l\'emphase : إِنَّ الْعِلْمَ [[لَـ]]نُورٌ (En vérité, le savoir EST lumière !).',
        arabicDescription: 'إِنَّ لِلتَّوْكِيد، وَلَام الاِبْتِدَاء تَزِيد التَّوْكِيد',
        arabicTranslation: 'Inna for emphasis, and lam al-ibtida increases emphasis',
        arabicTranslationFr: 'Inna pour l\'emphase, et lam al-ibtida augmente l\'emphase',
      },
      {
        type: 'examples_grid',
        content: 'إِنَّ with emphasis',
        contentFr: 'إِنَّ avec emphase',
        examples: [
          { arabic: 'إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ', english: 'Indeed, God is Forgiving, Merciful', french: 'En vérité, Dieu est Pardonneur, Miséricordieux' },
          { arabic: 'إِنَّ الصَّبْرَ لَجَمِيلٌ', english: 'Indeed, patience IS beautiful', french: 'En vérité, la patience EST belle' },
          { arabic: 'إِنَّكَ لَعَلَى خُلُقٍ عَظِيم', english: 'Indeed, you ARE of great character', french: 'En vérité, tu ES d\'un caractère noble' },
        ],
      },
      {
        type: 'text',
        content: 'Emphasis with قَدْ',
        contentFr: 'Emphase avec قَدْ',
      },
      {
        type: 'rule',
        content: '[[قَدْ]] + past verb = "certainly, indeed" (emphasis). [[قَدْ]] + present verb = "may, might" (possibility). Context determines meaning.',
        contentFr: '[[قَدْ]] + verbe au passé = « certainement, en effet » (emphase). [[قَدْ]] + verbe au présent = « peut-être, il se peut » (possibilité). Le contexte détermine le sens.',
        arabicDescription: 'قَدْ مَعَ الْمَاضِي لِلتَّحْقِيق، وَمَعَ الْمُضَارِع لِلاِحْتِمَال',
        arabicTranslation: 'Qad with past for certainty, with present for possibility',
        arabicTranslationFr: 'Qad avec le passé pour la certitude, avec le présent pour la possibilité',
      },
      {
        type: 'examples_grid',
        content: 'قَدْ usage',
        contentFr: 'Utilisation de قَدْ',
        examples: [
          { arabic: 'قَدْ نَجَحَ', english: 'He has certainly succeeded', french: 'Il a certainement réussi' },
          { arabic: 'قَدْ فَهِمْتُ', english: 'I have (indeed) understood', french: 'J\'ai (en effet) compris' },
          { arabic: 'قَدْ يَأْتِي', english: 'He may come', french: 'Il se peut qu\'il vienne' },
          { arabic: 'قَدْ أُسَافِرُ', english: 'I might travel', french: 'Il se peut que je voyage' },
        ],
      },
      {
        type: 'text',
        content: 'Oaths (الْقَسَم)',
        contentFr: 'Serments (الْقَسَم)',
      },
      {
        type: 'examples_grid',
        content: 'Swearing formulas',
        contentFr: 'Formules de serment',
        examples: [
          { arabic: 'وَاللَّهِ', english: 'By God (I swear)', french: 'Par Dieu (je jure)' },
          { arabic: 'بِاللَّهِ', english: 'By God', french: 'Par Dieu' },
          { arabic: 'تَاللَّهِ', english: 'By God (emphatic)', french: 'Par Dieu (emphatique)' },
          { arabic: 'وَاللَّهِ لَأَفْعَلَنَّ', english: 'By God, I will certainly do it!', french: 'Par Dieu, je le ferai certainement !' },
        ],
      },
      {
        type: 'text',
        content: 'Intensified Verbs (نُون التَّوْكِيد)',
        contentFr: 'Verbes intensifiés (نُون التَّوْكِيد)',
      },
      {
        type: 'rule',
        content: 'Add [[ـَنَّ]] or [[ـَنْ]] to present verbs for strong emphasis, especially after oaths: لَأَذْهَبَ[[نَّ]] (I will DEFINITELY go!). The verb loses its final vowel.',
        contentFr: 'Ajoutez [[ـَنَّ]] ou [[ـَنْ]] aux verbes au présent pour une forte emphase, surtout après les serments : لَأَذْهَبَ[[نَّ]] (J\'irai CERTAINEMENT !). Le verbe perd sa voyelle finale.',
        arabicDescription: 'نُون التَّوْكِيد الثَّقِيلَة وَالْخَفِيفَة تُؤَكِّد الْفِعْل',
        arabicTranslation: 'Heavy and light emphatic nun emphasize the verb',
        arabicTranslationFr: 'Le noun d\'emphase lourd et léger renforcent le verbe',
      },
      {
        type: 'examples_grid',
        content: 'Emphatic nun',
        contentFr: 'Noun emphatique',
        examples: [
          { arabic: 'لَأَكْتُبَنَّ', english: 'I will definitely write!', french: 'J\'écrirai certainement !' },
          { arabic: 'لَتَعْرِفَنَّ الْحَقِيقَةَ', english: 'You will surely know the truth!', french: 'Tu connaîtras sûrement la vérité !' },
          { arabic: 'لَيُعَذِّبَنَّهُم', english: 'He will certainly punish them!', french: 'Il les punira certainement !' },
        ],
      },
      {
        type: 'text',
        content: 'Other Emphasis Tools',
        contentFr: 'Autres outils d\'emphase',
      },
      {
        type: 'examples_grid',
        content: 'Additional emphatic particles',
        contentFr: 'Particules emphatiques supplémentaires',
        examples: [
          { arabic: 'نَفْس / عَيْن', english: 'self, very (الرَّجُلُ نَفْسُهُ - the man himself)', french: 'même, en personne (الرَّجُلُ نَفْسُهُ - l\'homme lui-même)' },
          { arabic: 'كُلّ / جَمِيع', english: 'all, every (كُلُّهُم - all of them)', french: 'tout, chaque (كُلُّهُم - tous)' },
          { arabic: 'لَا... إِلَّا', english: 'only, nothing but (restriction)', french: 'seulement, rien que (restriction)' },
          { arabic: 'إِنَّمَا', english: 'only, nothing but (restriction)', french: 'seulement, rien que (restriction)' },
        ],
      },
      {
        type: 'note',
        content: 'Combining tools creates powerful rhetoric: [[وَاللَّهِ إِنَّ الصَّبْرَ لَمِفْتَاحُ الْفَرَج]] (By God, indeed patience IS the key to relief!). Arabic loves layered emphasis!',
        contentFr: 'La combinaison des outils crée une rhétorique puissante : [[وَاللَّهِ إِنَّ الصَّبْرَ لَمِفْتَاحُ الْفَرَج]] (Par Dieu, en vérité la patience EST la clé du soulagement !). L\'arabe aime l\'emphase en couches !',
        arabicDescription: 'الْجَمْع بَيْن أَدَوَات التَّوْكِيد يُقَوِّي الْمَعْنَى',
        arabicTranslation: 'Combining emphasis tools strengthens the meaning',
        arabicTranslationFr: 'La combinaison des outils d\'emphase renforce le sens',
      },
    ],
  },
  ...ADDITIONAL_GRAMMAR_LESSONS,
];

// Helper functions
export const getLessonById = (id: string): GrammarLesson | undefined => {
  return grammarLessons.find(lesson => lesson.id === id)
    || verbLessons.find(lesson => lesson.id === id)
    || writingLessons.find(lesson => lesson.id === id);
};

export const getLessonsByLevel = (level: 'beginner' | 'intermediate' | 'advanced'): GrammarLesson[] => {
  return grammarLessons.filter(lesson => lesson.level === level).sort((a, b) => a.order - b.order);
};

export const getLessonsByCategory = (category: GrammarLesson['category']): GrammarLesson[] => {
  return grammarLessons.filter(lesson => lesson.category === category).sort((a, b) => a.order - b.order);
};

// Re-export verbLessons for easy access
export { verbLessons };
