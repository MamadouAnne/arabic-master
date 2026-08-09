// Arabic Numbering System — a structured, comprehensive course.
// Covers the Arabic-Indic numerals (writing), the number words 0–1,000,000+,
// ordinals, and the full grammar of counting (العدد والمعدود): gender
// polarity and the case of the counted noun. Bilingual (EN/FR) + Arabic.

export interface NumberEntry {
  digit?: string;        // Arabic-Indic numeral glyph, e.g. ٣
  value?: string;        // Western numeral, e.g. "3"
  arabic: string;        // the word, e.g. ثَلَاثَة
  translit: string;      // e.g. thalātha
  en: string;
  fr: string;
}

export interface NumberExample {
  arabic: string;
  translit: string;
  en: string;
  fr: string;
}

export type NumbersBlock =
  | { type: 'intro'; text: string; textFr: string }
  | { type: 'numbers'; title?: string; titleFr?: string; items: NumberEntry[] }
  | { type: 'rule'; title: string; titleFr: string; text: string; textFr: string }
  | { type: 'examples'; title?: string; titleFr?: string; items: NumberExample[] }
  | { type: 'table'; title?: string; titleFr?: string; headers: string[]; headersFr: string[]; rows: string[][]; rowsFr: string[][] }
  | { type: 'tip'; text: string; textFr: string };

export interface NumbersLesson {
  id: string;
  title: string;
  titleFr: string;
  titleArabic: string;
  subtitle: string;
  subtitleFr: string;
  icon: string;
  color: string;
  blocks: NumbersBlock[];
}

export const NUMBERS_LESSONS: NumbersLesson[] = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'numerals',
    title: 'Arabic Numerals (٠–٩)',
    titleFr: 'Les chiffres arabes (٠–٩)',
    titleArabic: 'الْأَرْقَامُ الْعَرَبِيَّة',
    subtitle: 'The digits and how they are written',
    subtitleFr: 'Les chiffres et comment on les écrit',
    icon: 'keypad',
    color: '#6366f1',
    blocks: [
      {
        type: 'intro',
        text: 'The digits we call "Arabic numerals" (1, 2, 3…) came to Europe from the Arabs. In the Arab world, a related set called Arabic-Indic numerals is used: ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩. Learn to recognize them first — then the number words.',
        textFr: 'Les chiffres que nous appelons « chiffres arabes » (1, 2, 3…) sont venus en Europe grâce aux Arabes. Dans le monde arabe, on utilise une variante appelée chiffres arabo-indiens : ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩. Apprenez d\'abord à les reconnaître, puis les mots des nombres.',
      },
      {
        type: 'numbers',
        title: 'The ten digits',
        titleFr: 'Les dix chiffres',
        items: [
          { digit: '٠', value: '0', arabic: 'صِفْر', translit: 'ṣifr', en: 'zero', fr: 'zéro' },
          { digit: '١', value: '1', arabic: 'وَاحِد', translit: 'wāḥid', en: 'one', fr: 'un' },
          { digit: '٢', value: '2', arabic: 'اِثْنَان', translit: 'ithnān', en: 'two', fr: 'deux' },
          { digit: '٣', value: '3', arabic: 'ثَلَاثَة', translit: 'thalātha', en: 'three', fr: 'trois' },
          { digit: '٤', value: '4', arabic: 'أَرْبَعَة', translit: 'arbaʿa', en: 'four', fr: 'quatre' },
          { digit: '٥', value: '5', arabic: 'خَمْسَة', translit: 'khamsa', en: 'five', fr: 'cinq' },
          { digit: '٦', value: '6', arabic: 'سِتَّة', translit: 'sitta', en: 'six', fr: 'six' },
          { digit: '٧', value: '7', arabic: 'سَبْعَة', translit: 'sabʿa', en: 'seven', fr: 'sept' },
          { digit: '٨', value: '8', arabic: 'ثَمَانِيَة', translit: 'thamāniya', en: 'eight', fr: 'huit' },
          { digit: '٩', value: '9', arabic: 'تِسْعَة', translit: 'tisʿa', en: 'nine', fr: 'neuf' },
        ],
      },
      {
        type: 'rule',
        title: 'Numbers are written left-to-right',
        titleFr: 'Les nombres s\'écrivent de gauche à droite',
        text: 'Even though Arabic text runs right-to-left, multi-digit numbers are written left-to-right, exactly like in English. So 1446 is written ١٤٤٦ — read the digits in the same order you would in English.',
        textFr: 'Même si l\'arabe s\'écrit de droite à gauche, les nombres à plusieurs chiffres s\'écrivent de gauche à droite, comme en français. Ainsi 1446 s\'écrit ١٤٤٦ — on lit les chiffres dans le même ordre qu\'en français.',
      },
      {
        type: 'examples',
        title: 'Reading multi-digit numbers',
        titleFr: 'Lire des nombres à plusieurs chiffres',
        items: [
          { arabic: '١٢', translit: '12', en: 'twelve', fr: 'douze' },
          { arabic: '٤٥', translit: '45', en: 'forty-five', fr: 'quarante-cinq' },
          { arabic: '٢٠٢٦', translit: '2026', en: 'the year 2026', fr: 'l\'année 2026' },
        ],
      },
      {
        type: 'tip',
        text: 'A few digits look confusing: ٠ (zero) is a dot, ٥ (five) looks like a heart/circle, and ٦ (six) looks like a Western 7. Practice writing each one.',
        textFr: 'Quelques chiffres prêtent à confusion : ٠ (zéro) est un point, ٥ (cinq) ressemble à un cœur, et ٦ (six) ressemble à un 7 occidental. Entraînez-vous à écrire chacun.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'one-to-ten',
    title: 'Numbers 1–10',
    titleFr: 'Les nombres 1 à 10',
    titleArabic: 'مِنْ وَاحِد إِلَى عَشَرَة',
    subtitle: 'The core number words',
    subtitleFr: 'Les mots de base des nombres',
    icon: 'list',
    color: '#22c55e',
    blocks: [
      {
        type: 'intro',
        text: 'These ten words are the foundation of every number in Arabic. Learn them by heart with their pronunciation. (The forms shown here are the base/counting forms; you will see how they change with nouns in the "Counting Rules" lesson.)',
        textFr: 'Ces dix mots sont la base de tous les nombres en arabe. Apprenez-les par cœur avec leur prononciation. (Les formes montrées ici sont les formes de base ; vous verrez comment elles changent avec les noms dans la leçon « Règles de comptage ».)',
      },
      {
        type: 'numbers',
        items: [
          { value: '1', digit: '١', arabic: 'وَاحِد', translit: 'wāḥid', en: 'one', fr: 'un' },
          { value: '2', digit: '٢', arabic: 'اِثْنَان', translit: 'ithnān', en: 'two', fr: 'deux' },
          { value: '3', digit: '٣', arabic: 'ثَلَاثَة', translit: 'thalātha', en: 'three', fr: 'trois' },
          { value: '4', digit: '٤', arabic: 'أَرْبَعَة', translit: 'arbaʿa', en: 'four', fr: 'quatre' },
          { value: '5', digit: '٥', arabic: 'خَمْسَة', translit: 'khamsa', en: 'five', fr: 'cinq' },
          { value: '6', digit: '٦', arabic: 'سِتَّة', translit: 'sitta', en: 'six', fr: 'six' },
          { value: '7', digit: '٧', arabic: 'سَبْعَة', translit: 'sabʿa', en: 'seven', fr: 'sept' },
          { value: '8', digit: '٨', arabic: 'ثَمَانِيَة', translit: 'thamāniya', en: 'eight', fr: 'huit' },
          { value: '9', digit: '٩', arabic: 'تِسْعَة', translit: 'tisʿa', en: 'nine', fr: 'neuf' },
          { value: '10', digit: '١٠', arabic: 'عَشَرَة', translit: 'ʿashara', en: 'ten', fr: 'dix' },
        ],
      },
      {
        type: 'tip',
        text: '"One" and "two" (وَاحِد, اِثْنَان) behave differently from 3–10. They agree with the noun\'s gender and are often left out because the noun form already shows singular/dual.',
        textFr: '« Un » et « deux » (وَاحِد, اِثْنَان) se comportent différemment de 3 à 10. Ils s\'accordent en genre avec le nom et sont souvent omis, car la forme du nom montre déjà le singulier/duel.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'eleven-to-twenty',
    title: 'Numbers 11–20',
    titleFr: 'Les nombres 11 à 20',
    titleArabic: 'مِنْ أَحَدَ عَشَر إِلَى عِشْرِين',
    subtitle: 'The "teens" and twenty',
    subtitleFr: 'De onze à vingt',
    icon: 'list',
    color: '#14b8a6',
    blocks: [
      {
        type: 'intro',
        text: 'From 11 to 19, each number is built from a unit + the word عَشَر (ʿashar, "-teen"). Notice that 11 and 12 are special, and 13–19 follow a clear pattern: unit + عَشَر.',
        textFr: 'De 11 à 19, chaque nombre se forme avec une unité + le mot عَشَر (ʿashar, « -ze/-dix »). Notez que 11 et 12 sont particuliers, et que 13 à 19 suivent un schéma clair : unité + عَشَر.',
      },
      {
        type: 'numbers',
        items: [
          { value: '11', digit: '١١', arabic: 'أَحَدَ عَشَر', translit: 'aḥada ʿashar', en: 'eleven', fr: 'onze' },
          { value: '12', digit: '١٢', arabic: 'اِثْنَا عَشَر', translit: 'ithnā ʿashar', en: 'twelve', fr: 'douze' },
          { value: '13', digit: '١٣', arabic: 'ثَلَاثَةَ عَشَر', translit: 'thalāthata ʿashar', en: 'thirteen', fr: 'treize' },
          { value: '14', digit: '١٤', arabic: 'أَرْبَعَةَ عَشَر', translit: 'arbaʿata ʿashar', en: 'fourteen', fr: 'quatorze' },
          { value: '15', digit: '١٥', arabic: 'خَمْسَةَ عَشَر', translit: 'khamsata ʿashar', en: 'fifteen', fr: 'quinze' },
          { value: '16', digit: '١٦', arabic: 'سِتَّةَ عَشَر', translit: 'sittata ʿashar', en: 'sixteen', fr: 'seize' },
          { value: '17', digit: '١٧', arabic: 'سَبْعَةَ عَشَر', translit: 'sabʿata ʿashar', en: 'seventeen', fr: 'dix-sept' },
          { value: '18', digit: '١٨', arabic: 'ثَمَانِيَةَ عَشَر', translit: 'thamāniyata ʿashar', en: 'eighteen', fr: 'dix-huit' },
          { value: '19', digit: '١٩', arabic: 'تِسْعَةَ عَشَر', translit: 'tisʿata ʿashar', en: 'nineteen', fr: 'dix-neuf' },
          { value: '20', digit: '٢٠', arabic: 'عِشْرُون', translit: 'ʿishrūn', en: 'twenty', fr: 'vingt' },
        ],
      },
      {
        type: 'tip',
        text: 'The forms above are for masculine counted nouns. With feminine nouns the unit part drops the ة (e.g. ثَلَاثَ عَشْرَةَ for 13). Focus on recognition first; agreement is covered in "Counting Rules".',
        textFr: 'Les formes ci-dessus sont pour les noms masculins. Avec les noms féminins, l\'unité perd le ة (ex. ثَلَاثَ عَشْرَةَ pour 13). Concentrez-vous d\'abord sur la reconnaissance ; l\'accord est traité dans « Règles de comptage ».',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'tens',
    title: 'Tens (20–100)',
    titleFr: 'Les dizaines (20–100)',
    titleArabic: 'الْعُقُود',
    subtitle: 'Round tens from twenty to a hundred',
    subtitleFr: 'Les dizaines rondes de vingt à cent',
    icon: 'layers',
    color: '#f59e0b',
    blocks: [
      {
        type: 'intro',
        text: 'The tens (20, 30, 40 …) are formed by adding the ending ـُون (-ūn) to the unit root. They do not change for gender — the same word is used for masculine and feminine.',
        textFr: 'Les dizaines (20, 30, 40 …) se forment en ajoutant la terminaison ـُون (-ūn) à la racine de l\'unité. Elles ne changent pas selon le genre — le même mot sert au masculin et au féminin.',
      },
      {
        type: 'numbers',
        items: [
          { value: '20', digit: '٢٠', arabic: 'عِشْرُون', translit: 'ʿishrūn', en: 'twenty', fr: 'vingt' },
          { value: '30', digit: '٣٠', arabic: 'ثَلَاثُون', translit: 'thalāthūn', en: 'thirty', fr: 'trente' },
          { value: '40', digit: '٤٠', arabic: 'أَرْبَعُون', translit: 'arbaʿūn', en: 'forty', fr: 'quarante' },
          { value: '50', digit: '٥٠', arabic: 'خَمْسُون', translit: 'khamsūn', en: 'fifty', fr: 'cinquante' },
          { value: '60', digit: '٦٠', arabic: 'سِتُّون', translit: 'sittūn', en: 'sixty', fr: 'soixante' },
          { value: '70', digit: '٧٠', arabic: 'سَبْعُون', translit: 'sabʿūn', en: 'seventy', fr: 'soixante-dix' },
          { value: '80', digit: '٨٠', arabic: 'ثَمَانُون', translit: 'thamānūn', en: 'eighty', fr: 'quatre-vingts' },
          { value: '90', digit: '٩٠', arabic: 'تِسْعُون', translit: 'tisʿūn', en: 'ninety', fr: 'quatre-vingt-dix' },
          { value: '100', digit: '١٠٠', arabic: 'مِائَة', translit: 'miʾa', en: 'one hundred', fr: 'cent' },
        ],
      },
      {
        type: 'tip',
        text: 'Note that 20 (عِشْرُون) comes from the root of 10, not 2. The rest follow their unit: 30 ← 3, 40 ← 4, and so on.',
        textFr: 'Remarquez que 20 (عِشْرُون) vient de la racine de 10, et non de 2. Les autres suivent leur unité : 30 ← 3, 40 ← 4, etc.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'hundreds-thousands',
    title: 'Hundreds, Thousands & Beyond',
    titleFr: 'Centaines, milliers et au-delà',
    titleArabic: 'الْمِئَات وَالْآلَاف',
    subtitle: 'Big numbers: 100, 1,000, 1,000,000',
    subtitleFr: 'Les grands nombres : 100, 1 000, 1 000 000',
    icon: 'trending-up',
    color: '#ec4899',
    blocks: [
      {
        type: 'intro',
        text: 'Large numbers are built from a small set of words: مِئَة (hundred), أَلْف (thousand), مِلْيُون (million). Their dual forms (‑ān) give 200 and 2,000.',
        textFr: 'Les grands nombres se construisent à partir de quelques mots : مِئَة (cent), أَلْف (mille), مِلْيُون (million). Leurs formes duelles (‑ān) donnent 200 et 2 000.',
      },
      {
        type: 'numbers',
        items: [
          { value: '100', digit: '١٠٠', arabic: 'مِئَة', translit: 'miʾa', en: 'one hundred', fr: 'cent' },
          { value: '200', digit: '٢٠٠', arabic: 'مِئَتَان', translit: 'miʾatān', en: 'two hundred', fr: 'deux cents' },
          { value: '300', digit: '٣٠٠', arabic: 'ثَلَاثُ مِائَة', translit: 'thalāthu miʾa', en: 'three hundred', fr: 'trois cents' },
          { value: '1000', digit: '١٠٠٠', arabic: 'أَلْف', translit: 'alf', en: 'one thousand', fr: 'mille' },
          { value: '2000', digit: '٢٠٠٠', arabic: 'أَلْفَان', translit: 'alfān', en: 'two thousand', fr: 'deux mille' },
          { value: '3000', digit: '٣٠٠٠', arabic: 'ثَلَاثَةُ آلَاف', translit: 'thalāthatu ālāf', en: 'three thousand', fr: 'trois mille' },
          { value: '1,000,000', arabic: 'مِلْيُون', translit: 'milyūn', en: 'one million', fr: 'un million' },
        ],
      },
      {
        type: 'tip',
        text: 'For 300–900 you combine the unit (3–9) with مِائَة, e.g. خَمْسُ مِائَة = 500. Both a joined spelling (خمسمائة) and separated spelling are common.',
        textFr: 'Pour 300 à 900, on combine l\'unité (3–9) avec مِائَة, ex. خَمْسُ مِائَة = 500. On voit couramment l\'orthographe soudée (خمسمائة) et l\'orthographe séparée.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'compound',
    title: 'Building Compound Numbers',
    titleFr: 'Former les nombres composés',
    titleArabic: 'الْأَعْدَادُ الْمُرَكَّبَة',
    subtitle: 'Say 21, 48, 135 and more',
    subtitleFr: 'Dire 21, 48, 135 et plus',
    icon: 'construct',
    color: '#8b5cf6',
    blocks: [
      {
        type: 'intro',
        text: 'From 21 to 99, Arabic says the unit FIRST, then "and", then the ten: unit + وَ + ten. So 21 is literally "one and twenty". Larger numbers list the parts from largest to smallest, each joined with وَ (wa, "and").',
        textFr: 'De 21 à 99, l\'arabe dit d\'abord l\'unité, puis « et », puis la dizaine : unité + وَ + dizaine. Ainsi 21 se dit littéralement « un et vingt ». Les grands nombres énumèrent les parties de la plus grande à la plus petite, reliées par وَ (wa, « et »).',
      },
      {
        type: 'examples',
        title: 'Units + tens',
        titleFr: 'Unités + dizaines',
        items: [
          { arabic: 'وَاحِدٌ وَعِشْرُون', translit: 'wāḥid wa-ʿishrūn', en: '21 (one and twenty)', fr: '21 (un et vingt)' },
          { arabic: 'خَمْسَةٌ وَعِشْرُون', translit: 'khamsa wa-ʿishrūn', en: '25 (five and twenty)', fr: '25 (cinq et vingt)' },
          { arabic: 'ثَمَانِيَةٌ وَأَرْبَعُون', translit: 'thamāniya wa-arbaʿūn', en: '48 (eight and forty)', fr: '48 (huit et quarante)' },
          { arabic: 'تِسْعَةٌ وَتِسْعُون', translit: 'tisʿa wa-tisʿūn', en: '99 (nine and ninety)', fr: '99 (neuf et quatre-vingt-dix)' },
        ],
      },
      {
        type: 'examples',
        title: 'Hundreds and up',
        titleFr: 'Centaines et plus',
        items: [
          { arabic: 'مِئَةٌ وَخَمْسَةٌ وَثَلَاثُون', translit: 'miʾa wa-khamsa wa-thalāthūn', en: '135 (hundred and five and thirty)', fr: '135 (cent et cinq et trente)' },
          { arabic: 'أَلْفٌ وَتِسْعُ مِائَةٍ وَسِتَّةٌ وَتِسْعُون', translit: 'alf wa-tisʿu miʾa wa-sitta wa-tisʿūn', en: '1996', fr: '1996' },
          { arabic: 'أَلْفَانِ وَسِتَّةٌ وَعِشْرُون', translit: 'alfān wa-sitta wa-ʿishrūn', en: '2026', fr: '2026' },
        ],
      },
      {
        type: 'tip',
        text: 'The order is the mirror of English/French for the last two: you say the ones before the tens, joined by وَ. Everything else goes largest → smallest.',
        textFr: 'L\'ordre est inversé par rapport au français pour les deux derniers : on dit les unités avant les dizaines, reliées par وَ. Le reste se dit du plus grand au plus petit.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'ordinals',
    title: 'Ordinal Numbers (1st–10th)',
    titleFr: 'Les nombres ordinaux (1er–10e)',
    titleArabic: 'الْأَعْدَادُ التَّرْتِيبِيَّة',
    subtitle: 'First, second, third…',
    subtitleFr: 'Premier, deuxième, troisième…',
    icon: 'ribbon',
    color: '#D4AF37',
    blocks: [
      {
        type: 'intro',
        text: 'Ordinals describe order (first, second…). Except for "first", they are formed on the pattern فَاعِل from the cardinal number. They behave like adjectives and agree with the noun in gender — add ة for the feminine.',
        textFr: 'Les ordinaux indiquent l\'ordre (premier, deuxième…). Sauf « premier », ils se forment sur le schéma فَاعِل à partir du nombre cardinal. Ils fonctionnent comme des adjectifs et s\'accordent en genre avec le nom — on ajoute ة au féminin.',
      },
      {
        type: 'numbers',
        title: 'Masculine ordinals',
        titleFr: 'Ordinaux masculins',
        items: [
          { value: '1st', arabic: 'الْأَوَّل', translit: 'al-awwal', en: 'first', fr: 'premier' },
          { value: '2nd', arabic: 'الثَّانِي', translit: 'ath-thānī', en: 'second', fr: 'deuxième' },
          { value: '3rd', arabic: 'الثَّالِث', translit: 'ath-thālith', en: 'third', fr: 'troisième' },
          { value: '4th', arabic: 'الرَّابِع', translit: 'ar-rābiʿ', en: 'fourth', fr: 'quatrième' },
          { value: '5th', arabic: 'الْخَامِس', translit: 'al-khāmis', en: 'fifth', fr: 'cinquième' },
          { value: '6th', arabic: 'السَّادِس', translit: 'as-sādis', en: 'sixth', fr: 'sixième' },
          { value: '7th', arabic: 'السَّابِع', translit: 'as-sābiʿ', en: 'seventh', fr: 'septième' },
          { value: '8th', arabic: 'الثَّامِن', translit: 'ath-thāmin', en: 'eighth', fr: 'huitième' },
          { value: '9th', arabic: 'التَّاسِع', translit: 'at-tāsiʿ', en: 'ninth', fr: 'neuvième' },
          { value: '10th', arabic: 'الْعَاشِر', translit: 'al-ʿāshir', en: 'tenth', fr: 'dixième' },
        ],
      },
      {
        type: 'examples',
        title: 'Agreeing with the noun',
        titleFr: 'Accord avec le nom',
        items: [
          { arabic: 'الدَّرْسُ الْأَوَّل', translit: 'ad-darsu al-awwal', en: 'the first lesson (masc.)', fr: 'la première leçon (masc.)' },
          { arabic: 'الْمَرَّةُ الْأُولَى', translit: 'al-marratu al-ūlā', en: 'the first time (fem.)', fr: 'la première fois (fém.)' },
          { arabic: 'السُّورَةُ الثَّانِيَة', translit: 'as-sūratu ath-thāniya', en: 'the second surah (fem.)', fr: 'la deuxième sourate (fém.)' },
        ],
      },
      {
        type: 'tip',
        text: '"First" is irregular: masculine الْأَوَّل, feminine الْأُولَى. From "second" onward, just add ة for the feminine: الثَّانِي → الثَّانِيَة.',
        textFr: '« Premier » est irrégulier : masculin الْأَوَّل, féminin الْأُولَى. À partir de « deuxième », il suffit d\'ajouter ة au féminin : الثَّانِي → الثَّانِيَة.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'counting-rules',
    title: 'Counting Rules (العدد والمعدود)',
    titleFr: 'Règles de comptage (العدد والمعدود)',
    titleArabic: 'الْعَدَدُ وَالْمَعْدُود',
    subtitle: 'Gender polarity and the case of the counted noun',
    subtitleFr: 'La polarité du genre et le cas du nom compté',
    icon: 'git-compare',
    color: '#f43f5e',
    blocks: [
      {
        type: 'intro',
        text: 'This is the heart of Arabic numbers — and its most famous puzzle. Two things change depending on the number: (1) the GENDER of the number word, and (2) the FORM and CASE of the counted noun (the معدود). Take it rule by rule.',
        textFr: 'C\'est le cœur des nombres arabes — et son énigme la plus célèbre. Deux choses changent selon le nombre : (1) le GENRE du mot-nombre, et (2) la FORME et le CAS du nom compté (le معدود). Prenez-le règle par règle.',
      },
      {
        type: 'rule',
        title: '1 & 2 — agreement',
        titleFr: '1 et 2 — accord',
        text: 'The counted noun comes first; the number agrees with it in gender and usually just emphasizes it. Often the number is dropped, because the singular/dual noun form already shows the count: كِتَابٌ (a/one book), كِتَابَانِ (two books).',
        textFr: 'Le nom compté vient en premier ; le nombre s\'accorde en genre avec lui et ne fait souvent que le souligner. Le nombre est souvent omis, car la forme singulier/duel du nom montre déjà le compte : كِتَابٌ (un livre), كِتَابَانِ (deux livres).',
      },
      {
        type: 'rule',
        title: '3–10 — gender polarity (reverse!)',
        titleFr: '3–10 — polarité du genre (inverse !)',
        text: 'The number takes the OPPOSITE gender of the noun. A masculine noun takes a number WITH ة; a feminine noun takes a number WITHOUT ة. The counted noun is an indefinite genitive PLURAL (جمع مجرور).',
        textFr: 'Le nombre prend le genre OPPOSÉ à celui du nom. Un nom masculin prend un nombre AVEC ة ; un nom féminin prend un nombre SANS ة. Le nom compté est un PLURIEL indéfini au génitif (جمع مجرور).',
      },
      {
        type: 'examples',
        title: '3–10 in action',
        titleFr: '3–10 en pratique',
        items: [
          { arabic: 'ثَلَاثَةُ كُتُبٍ', translit: 'thalāthatu kutub', en: 'three books (كتاب masc. → number WITH ة)', fr: 'trois livres (كتاب masc. → nombre AVEC ة)' },
          { arabic: 'ثَلَاثُ بَنَاتٍ', translit: 'thalāthu banāt', en: 'three girls (بنت fem. → number WITHOUT ة)', fr: 'trois filles (بنت fém. → nombre SANS ة)' },
          { arabic: 'خَمْسَةُ رِجَالٍ', translit: 'khamsatu rijāl', en: 'five men', fr: 'cinq hommes' },
          { arabic: 'خَمْسُ سَيَّارَاتٍ', translit: 'khamsu sayyārāt', en: 'five cars', fr: 'cinq voitures' },
        ],
      },
      {
        type: 'rule',
        title: '11–99 — singular accusative',
        titleFr: '11–99 — singulier à l\'accusatif',
        text: 'After any number from 11 to 99, the counted noun is a SINGULAR in the accusative case with tanwīn (مفرد منصوب): e.g. ثَلَاثُونَ طَالِبًا = 30 students. (11–19 have their own gender rules; the tens 20–90 do not change for gender.)',
        textFr: 'Après tout nombre de 11 à 99, le nom compté est un SINGULIER à l\'accusatif avec tanwīn (مفرد منصوب) : ex. ثَلَاثُونَ طَالِبًا = 30 étudiants. (11–19 ont leurs propres règles de genre ; les dizaines 20–90 ne changent pas selon le genre.)',
      },
      {
        type: 'rule',
        title: '100, 1000 & up — singular genitive',
        titleFr: '100, 1000 et plus — singulier au génitif',
        text: 'After مِئَة, أَلْف and their multiples, the counted noun is a SINGULAR in the genitive case (مفرد مجرور): مِئَةُ طَالِبٍ = 100 students, أَلْفُ عَامٍ = 1000 years.',
        textFr: 'Après مِئَة, أَلْف et leurs multiples, le nom compté est un SINGULIER au génitif (مفرد مجرور) : مِئَةُ طَالِبٍ = 100 étudiants, أَلْفُ عَامٍ = 1000 ans.',
      },
      {
        type: 'table',
        title: 'Quick reference',
        titleFr: 'Référence rapide',
        headers: ['Number', 'Gender', 'Counted noun'],
        headersFr: ['Nombre', 'Genre', 'Nom compté'],
        rows: [
          ['1–2', 'agrees', 'sing. / dual (often no number)'],
          ['3–10', 'reverse (polarity)', 'indefinite genitive plural'],
          ['11–99', 'see lesson', 'singular accusative (‑an)'],
          ['100, 1000+', 'invariable', 'singular genitive'],
        ],
        rowsFr: [
          ['1–2', 's\'accorde', 'sing. / duel (souvent sans nombre)'],
          ['3–10', 'inverse (polarité)', 'pluriel indéfini au génitif'],
          ['11–99', 'voir la leçon', 'singulier à l\'accusatif (‑an)'],
          ['100, 1000+', 'invariable', 'singulier au génitif'],
        ],
      },
      {
        type: 'tip',
        text: 'The single most surprising rule is gender polarity for 3–10: the number and its noun take OPPOSITE genders. Master that one and the rest falls into place.',
        textFr: 'La règle la plus surprenante est la polarité du genre pour 3–10 : le nombre et son nom prennent des genres OPPOSÉS. Maîtrisez-la et le reste suivra.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'daily-life',
    title: 'Numbers in Daily Life',
    titleFr: 'Les nombres au quotidien',
    titleArabic: 'الْأَرْقَامُ فِي الْحَيَاةِ الْيَوْمِيَّة',
    subtitle: 'Age, price, phone numbers, the year',
    subtitleFr: 'Âge, prix, numéros de téléphone, l\'année',
    icon: 'chatbubbles',
    color: '#10b981',
    blocks: [
      {
        type: 'intro',
        text: 'Now put numbers to work in real sentences you will actually use.',
        textFr: 'Mettons maintenant les nombres en pratique dans des phrases que vous utiliserez vraiment.',
      },
      {
        type: 'examples',
        title: 'Everyday sentences',
        titleFr: 'Phrases du quotidien',
        items: [
          { arabic: 'عُمْرِي عِشْرُونَ سَنَةً', translit: 'ʿumrī ʿishrūna sana', en: 'I am 20 years old', fr: 'J\'ai 20 ans' },
          { arabic: 'الثَّمَنُ خَمْسَةُ دَرَاهِمَ', translit: 'ath-thaman khamsatu darāhim', en: 'The price is 5 dirhams', fr: 'Le prix est de 5 dirhams' },
          { arabic: 'السَّاعَةُ الثَّالِثَة', translit: 'as-sāʿatu ath-thālitha', en: "It's three o'clock", fr: 'Il est trois heures' },
          { arabic: 'رَقْمُ هَاتِفِي ...', translit: 'raqmu hātifī …', en: 'My phone number is …', fr: 'Mon numéro de téléphone est …' },
          { arabic: 'فِي السَّنَةِ أَلْفَانِ وَسِتَّةٌ وَعِشْرُون', translit: 'fī s-sanati alfān wa-sitta wa-ʿishrūn', en: 'in the year 2026', fr: 'en l\'an 2026' },
        ],
      },
      {
        type: 'tip',
        text: 'Phone numbers are read digit by digit, left to right — so just read the Arabic-Indic digits one at a time using the words for 0–9.',
        textFr: 'Les numéros de téléphone se lisent chiffre par chiffre, de gauche à droite — lisez donc les chiffres arabo-indiens un à un avec les mots de 0 à 9.',
      },
    ],
  },
];

export function getNumbersLesson(id: string): NumbersLesson | undefined {
  return NUMBERS_LESSONS.find((l) => l.id === id);
}
