import { GrammarLesson } from '../../../types/arabic';
import { writingLessonsMore } from './writingLessonsMore';

// Arabic Writing course — Unit A: Foundations of the script.
// Fully bilingual EN/FR (every block has contentFr). Rendered through the
// grammar lesson screen (like verbs). Units B–E live in writingLessonsMore.
const writingLessonsUnitA: GrammarLesson[] = [
  // ── writing-1: Foundations — system, forms, joining, non-connectors ──
  {
    id: 'writing-1',
    title: 'How Arabic Is Written',
    titleFr: 'Comment s\'écrit l\'arabe',
    titleArabic: 'كَيْفَ تُكْتَبُ الْعَرَبِيَّة',
    description: 'Direction, the four letter forms, joining, and the letters that never join forward',
    descriptionFr: 'Le sens, les quatre formes, la liaison, et les lettres qui ne se lient jamais en avant',
    level: 'beginner',
    category: 'other',
    order: 1,
    exercises: [],
    content: [
      {
        type: 'rule',
        content: 'Arabic is written from [[right to left]] — the opposite of English and French. The first letter of a word sits on the [[right]] and you move toward the left.',
        contentFr: 'L\'arabe s\'écrit de [[droite à gauche]] — l\'inverse du français. La première lettre d\'un mot est à [[droite]] et l\'on avance vers la gauche.',
        arabicDescription: 'نَكْتُبُ مِنَ الْيَمِينِ إِلَى الْيَسَار',
        arabicTranslation: 'We write from right to left',
        arabicTranslationFr: 'On écrit de droite à gauche',
      },
      {
        type: 'rule',
        content: 'The alphabet has [[28 letters]]. There are [[no capital letters]], and writing is always [[cursive]] — the letters of a word are joined into one connected shape. The short vowels (harakāt) are [[small marks]] added above or below, and are usually left out in everyday text.',
        contentFr: 'L\'alphabet compte [[28 lettres]]. Il n\'y a [[pas de majuscules]], et l\'écriture est toujours [[cursive]] — les lettres d\'un mot sont liées en une seule forme. Les voyelles brèves (harakāt) sont de [[petits signes]] au-dessus ou en dessous, souvent omis dans les textes courants.',
        arabicDescription: 'ثَمَانِيَةٌ وَعِشْرُونَ حَرْفًا تُكْتَبُ مُتَّصِلَة',
        arabicTranslation: 'Twenty-eight letters, written joined',
        arabicTranslationFr: 'Vingt-huit lettres, écrites liées',
      },
      { type: 'text', content: 'Single letters joined into a word', contentFr: 'Des lettres seules liées en un mot' },
      {
        type: 'examples_grid',
        content: 'Read each from right to left',
        contentFr: 'Lisez chacun de droite à gauche',
        examples: [
          { arabic: 'ك + ت + ا + ب → كِتَاب', english: 'book', french: 'livre' },
          { arabic: 'ب + ي + ت → بَيْت', english: 'house', french: 'maison' },
          { arabic: 'ق + ل + م → قَلَم', english: 'pen', french: 'stylo' },
          { arabic: 'ش + م + س → شَمْس', english: 'sun', french: 'soleil' },
        ],
      },
      {
        type: 'rule',
        content: 'A letter [[changes shape]] by position. Each connecting letter can have up to [[four forms]]: [[isolated]] (alone), [[initial]] (start), [[medial]] (both sides), and [[final]] (end). Only the connecting strokes change — never the dots or the letter\'s identity.',
        contentFr: 'Une lettre [[change de forme]] selon sa place. Chaque lettre liante peut avoir jusqu\'à [[quatre formes]] : [[isolée]] (seule), [[initiale]] (début), [[médiane]] (des deux côtés) et [[finale]] (fin). Seuls les traits de liaison changent — jamais les points ni l\'identité.',
        arabicDescription: 'لِكُلِّ حَرْفٍ أَرْبَعَةُ أَشْكَال',
        arabicTranslation: 'Each letter has four forms',
        arabicTranslationFr: 'Chaque lettre a quatre formes',
      },
      { type: 'text', content: 'The letter ب (bā) in its four forms', contentFr: 'La lettre ب (bā) sous ses quatre formes' },
      {
        type: 'examples_grid',
        content: 'Same letter, four shapes',
        contentFr: 'Même lettre, quatre formes',
        examples: [
          { arabic: 'ب', english: 'isolated (alone)', french: 'isolée (seule)' },
          { arabic: 'بـ', english: 'initial (start)', french: 'initiale (début)' },
          { arabic: 'ـبـ', english: 'medial (middle)', french: 'médiane (milieu)' },
          { arabic: 'ـب', english: 'final (end)', french: 'finale (fin)' },
        ],
      },
      {
        type: 'rule',
        content: 'When letters [[join]], the first is [[initial]], the middle ones are [[medial]], and the last is [[final]] — all on one baseline, without lifting the pen.',
        contentFr: 'Quand les lettres se [[lient]], la première est [[initiale]], celles du milieu [[médianes]], la dernière [[finale]] — sur une même ligne, sans lever le stylo.',
        arabicDescription: 'أَوَّلُ الْكَلِمَةِ ابْتِدَاءٌ وَآخِرُهَا انْتِهَاء',
        arabicTranslation: 'The word starts initial and ends final',
        arabicTranslationFr: 'Le mot commence en initiale et finit en finale',
      },
      { type: 'text', content: 'Separate letters → one joined word', contentFr: 'Lettres séparées → un mot lié' },
      {
        type: 'examples_grid',
        content: 'Watch the pieces become one',
        contentFr: 'Regardez les morceaux devenir un seul',
        examples: [
          { arabic: 'ك + ت + ب → كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'س + م + ك → سَمَك', english: 'fish', french: 'poisson' },
          { arabic: 'ع + م + ل → عَمَل', english: 'work', french: 'travail' },
          { arabic: 'ف + ه + م → فَهِمَ', english: 'he understood', french: 'il a compris' },
        ],
      },
      {
        type: 'rule',
        content: 'Six letters are the exception — [[ا د ذ ر ز و]]. They join the letter [[before]] them (on their right) but [[never]] the letter after them, so the next letter [[starts fresh]] and a small gap appears. That is why some words look "broken" into parts.',
        contentFr: 'Six lettres font exception — [[ا د ذ ر ز و]]. Elles se lient à la lettre [[précédente]] (à droite) mais [[jamais]] à la suivante, si bien que la lettre d\'après [[recommence]] et laisse un petit espace. C\'est pourquoi certains mots semblent « coupés ».',
        arabicDescription: 'سِتَّةُ حُرُوفٍ لَا تَتَّصِلُ بِمَا بَعْدَهَا',
        arabicTranslation: 'Six letters do not join what follows',
        arabicTranslationFr: 'Six lettres ne se lient pas à ce qui suit',
      },
      { type: 'text', content: 'The break falls right after ا د ذ ر ز و', contentFr: 'La coupure tombe juste après ا د ذ ر ز و' },
      {
        type: 'examples_grid',
        content: 'The highlighted letters do not join forward',
        contentFr: 'Les lettres en surbrillance ne se lient pas en avant',
        examples: [
          { arabic: 'م + د + ر + س + ة → مَدْرَسَة', english: 'school — gap after د', french: 'école — espace après د' },
          { arabic: 'و + ر + د → وَرْد', english: 'roses — gaps after و and ر', french: 'roses — espaces après و et ر' },
          { arabic: 'ن + و + ر → نُور', english: 'light — gap after و', french: 'lumière — espace après و' },
          { arabic: 'د + ر + س → دَرْس', english: 'lesson — gaps after د and ر', french: 'leçon — espaces après د et ر' },
          { arabic: 'ج + د + ي + د → جَدِيد', english: 'new — gap after د', french: 'nouveau — espace après د' },
          { arabic: 'ي + د → يَد', english: 'hand — final د', french: 'main — د finale' },
        ],
      },
      {
        type: 'note',
        content: 'Memory aid — say the six together: [[أَدْ ذَرْ زَوْ]]. Recall them and you will always know where a word breaks.',
        contentFr: 'Aide-mémoire — dites les six ensemble : [[أَدْ ذَرْ زَوْ]]. Retenez-les et vous saurez toujours où un mot se coupe.',
        arabicDescription: 'احْفَظْ: ا د ذ ر ز و',
        arabicTranslation: 'Memorize: a d dh r z w',
        arabicTranslationFr: 'Mémorisez : a d dh r z w',
      },
      {
        type: 'note',
        content: '✍️ On paper: write ب in all four forms; then copy كَتَبَ (all joined) and مَدْرَسَة (note the gap after د), keeping everything on one baseline.',
        contentFr: '✍️ Sur papier : écrivez ب sous ses quatre formes ; puis recopiez كَتَبَ (tout lié) et مَدْرَسَة (notez l\'espace après د), en gardant tout sur une même ligne.',
      },
    ],
  },

  // ── writing-3: Dots & Letter Families ─────────────────────────
  {
    id: 'writing-3',
    title: 'Dots & Letter Families',
    titleFr: 'Les points et les familles de lettres',
    titleArabic: 'النَّقْطُ وَعَائِلَاتُ الْحُرُوف',
    description: 'Many letters share one skeleton and differ only by their dots',
    descriptionFr: 'Beaucoup de lettres partagent un même squelette et ne diffèrent que par leurs points',
    level: 'beginner',
    category: 'other',
    order: 3,
    exercises: [],
    content: [
      {
        type: 'rule',
        content: 'Several letters share the [[same skeleton]] and are told apart only by their [[dots]] (iʿjām) — how [[many]] dots and whether they sit [[above]] or [[below]]. Wrong dots means a [[different letter]] — and a different word.',
        contentFr: 'Plusieurs lettres partagent le [[même squelette]] et ne se distinguent que par leurs [[points]] (iʿjām) — leur [[nombre]] et leur position [[au-dessus]] ou [[en dessous]]. De mauvais points = une [[autre lettre]] — et un autre mot.',
        arabicDescription: 'النَّقْطُ يُمَيِّزُ الْحُرُوفَ الْمُتَشَابِهَة',
        arabicTranslation: 'Dots distinguish look-alike letters',
        arabicTranslationFr: 'Les points distinguent les lettres semblables',
      },
      { type: 'text', content: 'The "tooth" family — one shape, different dots', contentFr: 'La famille « dent » — une forme, des points différents' },
      {
        type: 'examples_grid',
        content: 'Count the dots and note above/below',
        contentFr: 'Comptez les points et notez dessus/dessous',
        examples: [
          { arabic: 'ب', english: '1 dot below → bā', french: '1 point dessous → bā' },
          { arabic: 'ت', english: '2 dots above → tā', french: '2 points dessus → tā' },
          { arabic: 'ث', english: '3 dots above → thā', french: '3 points dessus → thā' },
          { arabic: 'ن', english: '1 dot above → nūn', french: '1 point dessus → nūn' },
          { arabic: 'ي', english: '2 dots below → yā', french: '2 points dessous → yā' },
        ],
      },
      { type: 'text', content: 'One dot can change the whole word', contentFr: 'Un seul point peut changer tout le mot' },
      {
        type: 'examples_grid',
        content: 'Same skeleton, different dot = different meaning',
        contentFr: 'Même squelette, point différent = sens différent',
        examples: [
          { arabic: 'ج + م + ل → جَمَل', english: 'camel (ج, dot below)', french: 'chameau (ج, point dessous)' },
          { arabic: 'ح + م + ل → حَمَل', english: 'lamb (ح, no dot)', french: 'agneau (ح, sans point)' },
          { arabic: 'د + ب → دُبّ', english: 'bear (د, no dot)', french: 'ours (د, sans point)' },
          { arabic: 'ذ + ب → ذُبّ', english: 'one dot makes it ذ', french: 'un point le change en ذ' },
        ],
      },
      { type: 'text', content: 'Other look-alike families', contentFr: 'Autres familles de lettres semblables' },
      {
        type: 'examples_grid',
        content: 'Only the dot changes',
        contentFr: 'Seul le point change',
        examples: [
          { arabic: 'ج / ح / خ', english: 'dot below / none / above', french: 'point dessous / aucun / dessus' },
          { arabic: 'د / ذ', english: 'no dot / one above', french: 'aucun / un dessus' },
          { arabic: 'ر / ز', english: 'no dot / one above', french: 'aucun / un dessus' },
          { arabic: 'س / ش', english: 'no dots / three above', french: 'aucun / trois dessus' },
          { arabic: 'ص / ض', english: 'no dot / one above', french: 'aucun / un dessus' },
          { arabic: 'ط / ظ', english: 'no dot / one above', french: 'aucun / un dessus' },
          { arabic: 'ع / غ', english: 'no dot / one above', french: 'aucun / un dessus' },
          { arabic: 'ف / ق', english: '1 dot above / 2 above', french: '1 dessus / 2 dessus' },
        ],
      },
      {
        type: 'rule',
        content: 'When you write, draw the [[skeleton first]], then add the [[dots]]. A missing or misplaced dot completely changes the letter — so treat the dots as part of the letter, not decoration.',
        contentFr: 'Quand vous écrivez, tracez d\'abord le [[squelette]], puis ajoutez les [[points]]. Un point manquant ou mal placé change complètement la lettre — traitez donc les points comme une partie de la lettre, pas une décoration.',
        arabicDescription: 'اكْتُبِ الْجِسْمَ ثُمَّ ضَعِ النُّقَط',
        arabicTranslation: 'Write the body, then place the dots',
        arabicTranslationFr: 'Écrivez le corps, puis placez les points',
      },
      {
        type: 'note',
        content: '✍️ On paper: write the tooth family ب ت ث ن ي in a row; then cover the dots and quiz yourself on which is which. Do the same for ج ح خ.',
        contentFr: '✍️ Sur papier : écrivez la famille « dent » ب ت ث ن ي en ligne ; puis cachez les points et testez-vous sur leur identité. Faites de même pour ج ح خ.',
      },
    ],
  },
];

export const writingLessons: GrammarLesson[] = [...writingLessonsUnitA, ...writingLessonsMore];

export default writingLessons;
