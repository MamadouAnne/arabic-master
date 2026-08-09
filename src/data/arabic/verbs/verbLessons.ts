import { GrammarLesson } from '../../../types/arabic';
import { ADDITIONAL_VERB_LESSONS } from './additionalVerbLessons';

export const verbLessons: GrammarLesson[] = [
  // LESSON 1: Introduction to Arabic Verbs
  {
    id: 'verb-lesson-1',
    title: 'Introduction to Arabic Verbs',
    titleFr: 'Introduction aux verbes arabes',
    titleArabic: 'مُقَدِّمَة الأَفْعَال الْعَرَبِيَّة',
    description: 'Learn the foundations: root system, patterns, and basics of Arabic verbs',
    descriptionFr: 'Apprendre les fondements : système de racines, modèles et bases des verbes arabes',
    level: 'beginner',
    category: 'verbs',
    order: 1,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'Arabic verbs are built from [[3-letter roots]] called الجذر (al-jadhr). The root carries the core meaning, while patterns and vowels modify it to create different words. This elegant system means once you know a root, you can understand many related words!',
        arabicDescription: 'الْفِعْل هُوَ قَلْب اللُّغَة الْعَرَبِيَّة',
        arabicTranslation: 'The verb is the heart of the Arabic language',
      },

      // Root System Rule
      {
        type: 'rule',
        content: 'Every Arabic verb comes from a [[3-letter root]] (الجذر). These three consonants carry the core meaning. For example, the root [[ك-ت-ب]] (k-t-b) relates to "writing" and produces dozens of related words.',
        arabicDescription: 'كُلُّ فِعْل مِنْ جَذْر ثُلَاثِي',
        arabicTranslation: 'Every verb comes from a 3-letter root',
      },

      // Root Example: ك-ت-ب
      {
        type: 'text',
        content: 'Words from Root ك-ت-ب (writing)',
      },
      {
        type: 'examples_grid',
        content: 'All these words share the same root!',
        examples: [
          { arabic: 'كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'يَكْتُبُ', english: 'he writes', french: 'il écrit' },
          { arabic: 'كِتَاب', english: 'book', french: 'livre' },
          { arabic: 'مَكْتَبَة', english: 'library', french: 'bibliothèque' },
          { arabic: 'كَاتِب', english: 'writer', french: 'écrivain' },
          { arabic: 'مَكْتُوب', english: 'written/letter', french: 'écrit/lettre' },
        ],
      },

      // Root Example: د-ر-س
      {
        type: 'text',
        content: 'Words from Root د-ر-س (studying)',
      },
      {
        type: 'examples_grid',
        content: 'Notice the pattern!',
        examples: [
          { arabic: 'دَرَسَ', english: 'he studied', french: 'il a étudié' },
          { arabic: 'يَدْرُسُ', english: 'he studies', french: 'il étudie' },
          { arabic: 'دَرْس', english: 'lesson', french: 'leçon' },
          { arabic: 'مَدْرَسَة', english: 'school', french: 'école' },
          { arabic: 'مُدَرِّس', english: 'teacher', french: 'enseignant' },
          { arabic: 'دِرَاسَة', english: 'study', french: 'étude' },
        ],
      },

      // Basic Verb Structure
      {
        type: 'rule',
        content: 'The basic Arabic verb (Form I) follows the pattern [[فَعَلَ]] (fa-ʿa-la). The letters ف-ع-ل act as placeholders showing where the root letters go. The first root letter replaces ف, the second replaces ع, and the third replaces ل.',
        arabicDescription: 'الْوَزْن الأَسَاسِي: فَعَلَ',
        arabicTranslation: 'The basic pattern: faʿala',
      },

      // Pattern Examples
      {
        type: 'text',
        content: 'How Roots Fill the Pattern',
      },
      {
        type: 'examples_grid',
        content: 'Root + Pattern = Verb',
        examples: [
          { arabic: 'ك-ت-ب → كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'د-ر-س → دَرَسَ', english: 'he studied', french: 'il a étudié' },
          { arabic: 'ذ-ه-ب → ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'ش-ر-ب → شَرِبَ', english: 'he drank', french: 'il a bu' },
          { arabic: 'ع-ل-م → عَلِمَ', english: 'he knew', french: 'il a su' },
        ],
      },

      // The 13 Arabic Pronouns
      {
        type: 'rule',
        content: 'Arabic verbs change based on [[who]] does the action. There are [[13 personal pronouns]] covering: person (I, you, he/she, we, they), number (singular, dual, plural), and gender (masculine/feminine).',
        arabicDescription: 'الضَّمَائِر الْعَرَبِيَّة ثَلَاثَةَ عَشَرَ',
        arabicTranslation: 'Arabic pronouns are thirteen',
      },

      // كَتَبَ Past Tense
      {
        type: 'text',
        content: 'كَتَبَ (to write) - Past Tense الماضي',
      },
      {
        type: 'examples_grid',
        content: 'All 13 conjugations',
        examples: [
          { arabic: 'أَنَا كَتَبْتُ', english: 'I wrote', french: 'j\'ai écrit' },
          { arabic: 'أَنْتَ كَتَبْتَ', english: 'you wrote (m.)', french: 'tu as écrit (m.)' },
          { arabic: 'أَنْتِ كَتَبْتِ', english: 'you wrote (f.)', french: 'tu as écrit (f.)' },
          { arabic: 'هُوَ كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'هِيَ كَتَبَتْ', english: 'she wrote', french: 'elle a écrit' },
          { arabic: 'أَنْتُمَا كَتَبْتُمَا', english: 'you two wrote', french: 'vous deux avez écrit' },
          { arabic: 'هُمَا كَتَبَا', english: 'they two wrote (m.)', french: 'ils deux ont écrit (m.)' },
          { arabic: 'هُمَا كَتَبَتَا', english: 'they two wrote (f.)', french: 'elles deux ont écrit (f.)' },
          { arabic: 'نَحْنُ كَتَبْنَا', english: 'we wrote', french: 'nous avons écrit' },
          { arabic: 'أَنْتُمْ كَتَبْتُمْ', english: 'you all wrote (m.)', french: 'vous avez écrit (m.)' },
          { arabic: 'أَنْتُنَّ كَتَبْتُنَّ', english: 'you all wrote (f.)', french: 'vous avez écrit (f.)' },
          { arabic: 'هُمْ كَتَبُوا', english: 'they wrote (m.)', french: 'ils ont écrit' },
          { arabic: 'هُنَّ كَتَبْنَ', english: 'they wrote (f.)', french: 'elles ont écrit' },
        ],
      },

      // كَتَبَ Present Tense
      {
        type: 'text',
        content: 'يَكْتُبُ (to write) - Present Tense المضارع',
      },
      {
        type: 'examples_grid',
        content: 'All 13 conjugations',
        examples: [
          { arabic: 'أَنَا أَكْتُبُ', english: 'I write', french: 'j\'écris' },
          { arabic: 'أَنْتَ تَكْتُبُ', english: 'you write (m.)', french: 'tu écris (m.)' },
          { arabic: 'أَنْتِ تَكْتُبِينَ', english: 'you write (f.)', french: 'tu écris (f.)' },
          { arabic: 'هُوَ يَكْتُبُ', english: 'he writes', french: 'il écrit' },
          { arabic: 'هِيَ تَكْتُبُ', english: 'she writes', french: 'elle écrit' },
          { arabic: 'أَنْتُمَا تَكْتُبَانِ', english: 'you two write', french: 'vous deux écrivez' },
          { arabic: 'هُمَا يَكْتُبَانِ', english: 'they two write (m.)', french: 'ils deux écrivent (m.)' },
          { arabic: 'هُمَا تَكْتُبَانِ', english: 'they two write (f.)', french: 'elles deux écrivent (f.)' },
          { arabic: 'نَحْنُ نَكْتُبُ', english: 'we write', french: 'nous écrivons' },
          { arabic: 'أَنْتُمْ تَكْتُبُونَ', english: 'you all write (m.)', french: 'vous écrivez (m.)' },
          { arabic: 'أَنْتُنَّ تَكْتُبْنَ', english: 'you all write (f.)', french: 'vous écrivez (f.)' },
          { arabic: 'هُمْ يَكْتُبُونَ', english: 'they write (m.)', french: 'ils écrivent' },
          { arabic: 'هُنَّ يَكْتُبْنَ', english: 'they write (f.)', french: 'elles écrivent' },
        ],
      },

      // ذَهَبَ Past Tense
      {
        type: 'text',
        content: 'ذَهَبَ (to go) - Past Tense الماضي',
      },
      {
        type: 'examples_grid',
        content: 'All 13 conjugations',
        examples: [
          { arabic: 'أَنَا ذَهَبْتُ', english: 'I went', french: 'je suis allé(e)' },
          { arabic: 'أَنْتَ ذَهَبْتَ', english: 'you went (m.)', french: 'tu es allé (m.)' },
          { arabic: 'أَنْتِ ذَهَبْتِ', english: 'you went (f.)', french: 'tu es allée (f.)' },
          { arabic: 'هُوَ ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'هِيَ ذَهَبَتْ', english: 'she went', french: 'elle est allée' },
          { arabic: 'أَنْتُمَا ذَهَبْتُمَا', english: 'you two went', french: 'vous deux êtes allés' },
          { arabic: 'هُمَا ذَهَبَا', english: 'they two went (m.)', french: 'ils deux sont allés (m.)' },
          { arabic: 'هُمَا ذَهَبَتَا', english: 'they two went (f.)', french: 'elles deux sont allées (f.)' },
          { arabic: 'نَحْنُ ذَهَبْنَا', english: 'we went', french: 'nous sommes allés' },
          { arabic: 'أَنْتُمْ ذَهَبْتُمْ', english: 'you all went (m.)', french: 'vous êtes allés (m.)' },
          { arabic: 'أَنْتُنَّ ذَهَبْتُنَّ', english: 'you all went (f.)', french: 'vous êtes allées (f.)' },
          { arabic: 'هُمْ ذَهَبُوا', english: 'they went (m.)', french: 'ils sont allés' },
          { arabic: 'هُنَّ ذَهَبْنَ', english: 'they went (f.)', french: 'elles sont allées' },
        ],
      },

      // ذَهَبَ Present Tense
      {
        type: 'text',
        content: 'يَذْهَبُ (to go) - Present Tense المضارع',
      },
      {
        type: 'examples_grid',
        content: 'All 13 conjugations',
        examples: [
          { arabic: 'أَنَا أَذْهَبُ', english: 'I go', french: 'je vais' },
          { arabic: 'أَنْتَ تَذْهَبُ', english: 'you go (m.)', french: 'tu vas (m.)' },
          { arabic: 'أَنْتِ تَذْهَبِينَ', english: 'you go (f.)', french: 'tu vas (f.)' },
          { arabic: 'هُوَ يَذْهَبُ', english: 'he goes', french: 'il va' },
          { arabic: 'هِيَ تَذْهَبُ', english: 'she goes', french: 'elle va' },
          { arabic: 'أَنْتُمَا تَذْهَبَانِ', english: 'you two go', french: 'vous deux allez' },
          { arabic: 'هُمَا يَذْهَبَانِ', english: 'they two go (m.)', french: 'ils deux vont (m.)' },
          { arabic: 'هُمَا تَذْهَبَانِ', english: 'they two go (f.)', french: 'elles deux vont (f.)' },
          { arabic: 'نَحْنُ نَذْهَبُ', english: 'we go', french: 'nous allons' },
          { arabic: 'أَنْتُمْ تَذْهَبُونَ', english: 'you all go (m.)', french: 'vous allez (m.)' },
          { arabic: 'أَنْتُنَّ تَذْهَبْنَ', english: 'you all go (f.)', french: 'vous allez (f.)' },
          { arabic: 'هُمْ يَذْهَبُونَ', english: 'they go (m.)', french: 'ils vont' },
          { arabic: 'هُنَّ يَذْهَبْنَ', english: 'they go (f.)', french: 'elles vont' },
        ],
      },

      // Quick Reference
      {
        type: 'note',
        content: 'Don\'t be overwhelmed by 13 forms! Start with the most common 6: [[أنا]] (I), [[أنتَ/أنتِ]] (you m./f.), [[هو/هي]] (he/she), [[نحن]] (we). These cover 90% of everyday conversations.',
        arabicDescription: 'اِبْدَأ بِالضَّمَائِر الأَسَاسِيَّة السِّتَّة',
        arabicTranslation: 'Start with the six basic pronouns',
      },

      // Common Beginner Verbs
      {
        type: 'text',
        content: 'Essential Beginner Verbs',
      },
      {
        type: 'examples_grid',
        content: 'Learn these common verbs first',
        examples: [
          { arabic: 'كَتَبَ', english: 'to write', french: 'écrire' },
          { arabic: 'قَرَأَ', english: 'to read', french: 'lire' },
          { arabic: 'ذَهَبَ', english: 'to go', french: 'aller' },
          { arabic: 'جَلَسَ', english: 'to sit', french: 's\'asseoir' },
          { arabic: 'أَكَلَ', english: 'to eat', french: 'manger' },
          { arabic: 'شَرِبَ', english: 'to drink', french: 'boire' },
          { arabic: 'فَتَحَ', english: 'to open', french: 'ouvrir' },
          { arabic: 'نَامَ', english: 'to sleep', french: 'dormir' },
        ],
      },
    ],
  },

  // LESSON 2: Past Tense Patterns
  {
    id: 'verb-lesson-2',
    title: 'Past Tense (الماضي)',
    titleFr: 'Le passé (الماضي)',
    titleArabic: 'الْفِعْل الْمَاضِي',
    description: 'Master past tense conjugation - add suffixes to describe completed actions',
    descriptionFr: 'Maîtriser la conjugaison au passé - ajouter des suffixes pour décrire les actions accomplies',
    level: 'beginner',
    category: 'verbs',
    order: 3,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'The past tense (الماضي) describes actions that have been [[completed]]. It\'s the simplest tense to learn because you only add [[suffixes]] (endings) to the base form. The base form (3rd person masculine singular) is the "dictionary form" of the verb.',
        arabicDescription: 'الْمَاضِي يَدُلُّ عَلَى حَدَث انْتَهَى',
        arabicTranslation: 'The past indicates an action that has finished',
      },

      // Key Rule
      {
        type: 'rule',
        content: 'To conjugate past tense verbs, start with the base form (e.g., [[كَتَبَ]]) and add the appropriate [[suffix]] based on who performed the action. The root letters stay the same - only the endings change!',
        arabicDescription: 'نُضِيف لَوَاحِق لِآخِر الْفِعْل',
        arabicTranslation: 'We add suffixes to the end of the verb',
      },

      // COMPLETE Past Tense - كَتَبَ
      {
        type: 'text',
        content: 'Complete Past Tense Conjugation: كَتَبَ (to write)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - الماضي',
        examples: [
          { arabic: 'أَنَا كَتَبْتُ', english: 'I wrote', french: 'j\'ai écrit' },
          { arabic: 'أَنْتَ كَتَبْتَ', english: 'you wrote (m.)', french: 'tu as écrit (m.)' },
          { arabic: 'أَنْتِ كَتَبْتِ', english: 'you wrote (f.)', french: 'tu as écrit (f.)' },
          { arabic: 'هُوَ كَتَبَ', english: 'he wrote', french: 'il a écrit' },
          { arabic: 'هِيَ كَتَبَتْ', english: 'she wrote', french: 'elle a écrit' },
          { arabic: 'أَنْتُمَا كَتَبْتُمَا', english: 'you two wrote', french: 'vous deux avez écrit' },
          { arabic: 'هُمَا كَتَبَا', english: 'they two wrote (m.)', french: 'ils deux ont écrit (m.)' },
          { arabic: 'هُمَا كَتَبَتَا', english: 'they two wrote (f.)', french: 'elles deux ont écrit (f.)' },
          { arabic: 'نَحْنُ كَتَبْنَا', english: 'we wrote', french: 'nous avons écrit' },
          { arabic: 'أَنْتُمْ كَتَبْتُمْ', english: 'you all wrote (m.)', french: 'vous avez écrit (m.)' },
          { arabic: 'أَنْتُنَّ كَتَبْتُنَّ', english: 'you all wrote (f.)', french: 'vous avez écrit (f.)' },
          { arabic: 'هُمْ كَتَبُوا', english: 'they wrote (m.)', french: 'ils ont écrit' },
          { arabic: 'هُنَّ كَتَبْنَ', english: 'they wrote (f.)', french: 'elles ont écrit' },
        ],
      },

      // Suffix Pattern Note
      {
        type: 'note',
        content: 'Notice the pattern: "I/you" forms use [[ت]] with different endings. [[هو]] has no suffix (base form). [[هي]] adds [[ت]] with sukun. [[هم]] adds [[وا]]. [[نحن]] adds [[نا]].',
        arabicDescription: 'لَاحِظ نَمَط اللَّوَاحِق',
        arabicTranslation: 'Notice the suffix pattern',
      },

      // COMPLETE Past Tense - ذَهَبَ
      {
        type: 'text',
        content: 'Complete Past Tense Conjugation: ذَهَبَ (to go)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - الماضي',
        examples: [
          { arabic: 'أَنَا ذَهَبْتُ', english: 'I went', french: 'je suis allé(e)' },
          { arabic: 'أَنْتَ ذَهَبْتَ', english: 'you went (m.)', french: 'tu es allé (m.)' },
          { arabic: 'أَنْتِ ذَهَبْتِ', english: 'you went (f.)', french: 'tu es allée (f.)' },
          { arabic: 'هُوَ ذَهَبَ', english: 'he went', french: 'il est allé' },
          { arabic: 'هِيَ ذَهَبَتْ', english: 'she went', french: 'elle est allée' },
          { arabic: 'أَنْتُمَا ذَهَبْتُمَا', english: 'you two went', french: 'vous deux êtes allés' },
          { arabic: 'هُمَا ذَهَبَا', english: 'they two went (m.)', french: 'ils deux sont allés (m.)' },
          { arabic: 'هُمَا ذَهَبَتَا', english: 'they two went (f.)', french: 'elles deux sont allées (f.)' },
          { arabic: 'نَحْنُ ذَهَبْنَا', english: 'we went', french: 'nous sommes allés' },
          { arabic: 'أَنْتُمْ ذَهَبْتُمْ', english: 'you all went (m.)', french: 'vous êtes allés (m.)' },
          { arabic: 'أَنْتُنَّ ذَهَبْتُنَّ', english: 'you all went (f.)', french: 'vous êtes allées (f.)' },
          { arabic: 'هُمْ ذَهَبُوا', english: 'they went (m.)', french: 'ils sont allés' },
          { arabic: 'هُنَّ ذَهَبْنَ', english: 'they went (f.)', french: 'elles sont allées' },
        ],
      },

      // COMPLETE Past Tense - دَرَسَ
      {
        type: 'text',
        content: 'Complete Past Tense Conjugation: دَرَسَ (to study)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - الماضي',
        examples: [
          { arabic: 'أَنَا دَرَسْتُ', english: 'I studied', french: 'j\'ai étudié' },
          { arabic: 'أَنْتَ دَرَسْتَ', english: 'you studied (m.)', french: 'tu as étudié (m.)' },
          { arabic: 'أَنْتِ دَرَسْتِ', english: 'you studied (f.)', french: 'tu as étudié (f.)' },
          { arabic: 'هُوَ دَرَسَ', english: 'he studied', french: 'il a étudié' },
          { arabic: 'هِيَ دَرَسَتْ', english: 'she studied', french: 'elle a étudié' },
          { arabic: 'أَنْتُمَا دَرَسْتُمَا', english: 'you two studied', french: 'vous deux avez étudié' },
          { arabic: 'هُمَا دَرَسَا', english: 'they two studied (m.)', french: 'ils deux ont étudié (m.)' },
          { arabic: 'هُمَا دَرَسَتَا', english: 'they two studied (f.)', french: 'elles deux ont étudié (f.)' },
          { arabic: 'نَحْنُ دَرَسْنَا', english: 'we studied', french: 'nous avons étudié' },
          { arabic: 'أَنْتُمْ دَرَسْتُمْ', english: 'you all studied (m.)', french: 'vous avez étudié (m.)' },
          { arabic: 'أَنْتُنَّ دَرَسْتُنَّ', english: 'you all studied (f.)', french: 'vous avez étudié (f.)' },
          { arabic: 'هُمْ دَرَسُوا', english: 'they studied (m.)', french: 'ils ont étudié' },
          { arabic: 'هُنَّ دَرَسْنَ', english: 'they studied (f.)', french: 'elles ont étudié' },
        ],
      },

      // Sentences
      {
        type: 'text',
        content: 'Past Tense in Sentences',
      },
      {
        type: 'examples_grid',
        content: 'Real examples with different pronouns',
        examples: [
          { arabic: 'كَتَبْتُ رِسَالَةً', english: 'I wrote a letter', french: 'j\'ai écrit une lettre' },
          { arabic: 'دَرَسْتَ جَيِّدًا', english: 'You (m.) studied well', french: 'tu as bien étudié (m.)' },
          { arabic: 'ذَهَبَتْ إِلَى السُّوق', english: 'She went to the market', french: 'elle est allée au marché' },
          { arabic: 'أَكَلْنَا الطَّعَام', english: 'We ate the food', french: 'nous avons mangé la nourriture' },
          { arabic: 'كَتَبُوا الْوَاجِب', english: 'They (m.) wrote the homework', french: 'ils ont écrit les devoirs' },
          { arabic: 'ذَهَبْنَ إِلَى الْمَدْرَسَة', english: 'They (f.) went to school', french: 'elles sont allées à l\'école' },
        ],
      },

      // Memory Tip
      {
        type: 'note',
        content: 'Memory trick: The suffix [[تُ]] for "I" sounds like "too" - "I did it [[too]]!" The suffix [[وا]] for "they (m.)" has a و like the و in هُم.',
        arabicDescription: 'حِيلَة لِلتَّذَكُّر',
        arabicTranslation: 'Memory trick',
      },
    ],
  },

  // LESSON 3: Present Tense Patterns
  {
    id: 'verb-lesson-3',
    title: 'Present Tense (المضارع)',
    titleFr: 'Le présent (المضارع)',
    titleArabic: 'الْفِعْل الْمُضَارِع',
    description: 'Learn present tense conjugation - prefixes and suffixes for ongoing actions',
    descriptionFr: 'Apprendre la conjugaison au présent - préfixes et suffixes pour les actions en cours',
    level: 'beginner',
    category: 'verbs',
    order: 2,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'The present tense (المضارع) describes actions happening [[now]] or [[habitually]]. Unlike past tense which only uses suffixes, present tense uses both [[prefixes]] (beginnings) AND [[suffixes]] (endings). The prefix tells you the person; the suffix adds more detail.',
        arabicDescription: 'الْمُضَارِع يَدُلُّ عَلَى الْحَاضِر وَالْمُسْتَمِر',
        arabicTranslation: 'The present indicates current and ongoing actions',
      },

      // Key Rule
      {
        type: 'rule',
        content: 'Present tense verbs start with one of four prefix letters: [[أ]] (I), [[ت]] (you/she), [[ي]] (he/they), [[ن]] (we). Remember them with the word [[أَنَيْتُ]] - these are the four letters!',
        arabicDescription: 'حُرُوف الْمُضَارَعَة: أَنَيْتُ',
        arabicTranslation: 'Present tense letters: anaytu',
      },

      // Prefix Letters Grid
      {
        type: 'letters_grid',
        content: 'The 4 Present Tense Prefixes',
        letters: ['أ', 'ن', 'ي', 'ت'],
        letterType: 'moon',
      },

      // COMPLETE Present Tense - يَكْتُبُ
      {
        type: 'text',
        content: 'Complete Present Tense Conjugation: يَكْتُبُ (to write)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - المضارع',
        examples: [
          { arabic: 'أَنَا أَكْتُبُ', english: 'I write', french: 'j\'écris' },
          { arabic: 'أَنْتَ تَكْتُبُ', english: 'you write (m.)', french: 'tu écris (m.)' },
          { arabic: 'أَنْتِ تَكْتُبِينَ', english: 'you write (f.)', french: 'tu écris (f.)' },
          { arabic: 'هُوَ يَكْتُبُ', english: 'he writes', french: 'il écrit' },
          { arabic: 'هِيَ تَكْتُبُ', english: 'she writes', french: 'elle écrit' },
          { arabic: 'أَنْتُمَا تَكْتُبَانِ', english: 'you two write', french: 'vous deux écrivez' },
          { arabic: 'هُمَا يَكْتُبَانِ', english: 'they two write (m.)', french: 'ils deux écrivent (m.)' },
          { arabic: 'هُمَا تَكْتُبَانِ', english: 'they two write (f.)', french: 'elles deux écrivent (f.)' },
          { arabic: 'نَحْنُ نَكْتُبُ', english: 'we write', french: 'nous écrivons' },
          { arabic: 'أَنْتُمْ تَكْتُبُونَ', english: 'you all write (m.)', french: 'vous écrivez (m.)' },
          { arabic: 'أَنْتُنَّ تَكْتُبْنَ', english: 'you all write (f.)', french: 'vous écrivez (f.)' },
          { arabic: 'هُمْ يَكْتُبُونَ', english: 'they write (m.)', french: 'ils écrivent' },
          { arabic: 'هُنَّ يَكْتُبْنَ', english: 'they write (f.)', french: 'elles écrivent' },
        ],
      },

      // Pattern Note
      {
        type: 'note',
        content: 'Notice: [[أَنْتَ]] (you m.) and [[هِيَ]] (she) have the exact same form: تَكْتُبُ. Context tells you which is meant. [[أَنْتِ]] (you f.) adds [[ينَ]] at the end. Plural/dual forms add [[ونَ]], [[انِ]], or [[نَ]].',
        arabicDescription: 'أَنْتَ وَهِيَ لَهُمَا نَفْس الصِّيغَة',
        arabicTranslation: '"You (m.)" and "she" have the same form',
      },

      // COMPLETE Present Tense - يَذْهَبُ
      {
        type: 'text',
        content: 'Complete Present Tense Conjugation: يَذْهَبُ (to go)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - المضارع',
        examples: [
          { arabic: 'أَنَا أَذْهَبُ', english: 'I go', french: 'je vais' },
          { arabic: 'أَنْتَ تَذْهَبُ', english: 'you go (m.)', french: 'tu vas (m.)' },
          { arabic: 'أَنْتِ تَذْهَبِينَ', english: 'you go (f.)', french: 'tu vas (f.)' },
          { arabic: 'هُوَ يَذْهَبُ', english: 'he goes', french: 'il va' },
          { arabic: 'هِيَ تَذْهَبُ', english: 'she goes', french: 'elle va' },
          { arabic: 'أَنْتُمَا تَذْهَبَانِ', english: 'you two go', french: 'vous deux allez' },
          { arabic: 'هُمَا يَذْهَبَانِ', english: 'they two go (m.)', french: 'ils deux vont (m.)' },
          { arabic: 'هُمَا تَذْهَبَانِ', english: 'they two go (f.)', french: 'elles deux vont (f.)' },
          { arabic: 'نَحْنُ نَذْهَبُ', english: 'we go', french: 'nous allons' },
          { arabic: 'أَنْتُمْ تَذْهَبُونَ', english: 'you all go (m.)', french: 'vous allez (m.)' },
          { arabic: 'أَنْتُنَّ تَذْهَبْنَ', english: 'you all go (f.)', french: 'vous allez (f.)' },
          { arabic: 'هُمْ يَذْهَبُونَ', english: 'they go (m.)', french: 'ils vont' },
          { arabic: 'هُنَّ يَذْهَبْنَ', english: 'they go (f.)', french: 'elles vont' },
        ],
      },

      // COMPLETE Present Tense - يَدْرُسُ
      {
        type: 'text',
        content: 'Complete Present Tense Conjugation: يَدْرُسُ (to study)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - المضارع',
        examples: [
          { arabic: 'أَنَا أَدْرُسُ', english: 'I study', french: 'j\'étudie' },
          { arabic: 'أَنْتَ تَدْرُسُ', english: 'you study (m.)', french: 'tu étudies (m.)' },
          { arabic: 'أَنْتِ تَدْرُسِينَ', english: 'you study (f.)', french: 'tu étudies (f.)' },
          { arabic: 'هُوَ يَدْرُسُ', english: 'he studies', french: 'il étudie' },
          { arabic: 'هِيَ تَدْرُسُ', english: 'she studies', french: 'elle étudie' },
          { arabic: 'أَنْتُمَا تَدْرُسَانِ', english: 'you two study', french: 'vous deux étudiez' },
          { arabic: 'هُمَا يَدْرُسَانِ', english: 'they two study (m.)', french: 'ils deux étudient (m.)' },
          { arabic: 'هُمَا تَدْرُسَانِ', english: 'they two study (f.)', french: 'elles deux étudient (f.)' },
          { arabic: 'نَحْنُ نَدْرُسُ', english: 'we study', french: 'nous étudions' },
          { arabic: 'أَنْتُمْ تَدْرُسُونَ', english: 'you all study (m.)', french: 'vous étudiez (m.)' },
          { arabic: 'أَنْتُنَّ تَدْرُسْنَ', english: 'you all study (f.)', french: 'vous étudiez (f.)' },
          { arabic: 'هُمْ يَدْرُسُونَ', english: 'they study (m.)', french: 'ils étudient' },
          { arabic: 'هُنَّ يَدْرُسْنَ', english: 'they study (f.)', french: 'elles étudient' },
        ],
      },

      // Vowel Patterns
      {
        type: 'rule',
        content: 'The middle vowel of the present tense can vary by verb. Most common patterns: [[يَفْعُلُ]] (ya-fʿu-lu), [[يَفْعِلُ]] (ya-fʿi-lu), and [[يَفْعَلُ]] (ya-fʿa-lu). You\'ll learn which pattern each verb uses.',
        arabicDescription: 'الْحَرَكَة الْوُسْطَى تَتَغَيَّر',
        arabicTranslation: 'The middle vowel varies',
      },

      // Sentences
      {
        type: 'text',
        content: 'Present Tense in Sentences',
      },
      {
        type: 'examples_grid',
        content: 'Real examples with different pronouns',
        examples: [
          { arabic: 'أَكْتُبُ رِسَالَةً', english: 'I write a letter', french: 'j\'écris une lettre' },
          { arabic: 'تَدْرُسِينَ الْعَرَبِيَّة', english: 'You (f.) study Arabic', french: 'tu étudies l\'arabe (f.)' },
          { arabic: 'يَذْهَبُ إِلَى الْعَمَل', english: 'He goes to work', french: 'il va au travail' },
          { arabic: 'نَأْكُلُ الْفُطُور', english: 'We eat breakfast', french: 'nous mangeons le petit-déjeuner' },
          { arabic: 'يَكْتُبُونَ الدَّرْس', english: 'They (m.) write the lesson', french: 'ils écrivent la leçon' },
          { arabic: 'تَذْهَبَانِ مَعًا', english: 'You two go together', french: 'vous deux allez ensemble' },
        ],
      },

      // Memory Tip
      {
        type: 'note',
        content: 'Quick summary: [[أ]] = I, [[نَ]] = we, [[تَ]] = you/she, [[يَ]] = he/they (m.). Remember: ي is for masculine 3rd person (he/they m.).',
        arabicDescription: 'خُلَاصَة الضَّمَائِر',
        arabicTranslation: 'Summary of pronouns',
      },
    ],
  },

  // LESSON 4: Future Tense
  {
    id: 'verb-lesson-4',
    title: 'Future Tense (المستقبل)',
    titleFr: 'Le futur (المستقبل)',
    titleArabic: 'الْفِعْل الْمُسْتَقْبَل',
    description: 'Express future actions by adding سـ or سوف to present tense verbs',
    descriptionFr: 'Exprimer des actions futures en ajoutant سـ ou سوف aux verbes au présent',
    level: 'beginner',
    category: 'verbs',
    order: 4,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'Good news! The future tense in Arabic is easy. Just take the [[present tense]] verb and add [[سَـ]] (sa) or [[سَوْفَ]] (sawfa) before it. That\'s it! The verb conjugation stays exactly the same as present tense.',
        arabicDescription: 'الْمُسْتَقْبَل = سَـ أَوْ سَوْفَ + الْمُضَارِع',
        arabicTranslation: 'Future = sa or sawfa + present',
      },

      // Key Rule - سَـ
      {
        type: 'rule',
        content: '[[سَـ]] (sa) indicates [[near future]] - something that will happen soon. It attaches directly to the verb as a prefix. [[سَوْفَ]] (sawfa) indicates [[distant future]] or adds emphasis. It\'s a separate word.',
        arabicDescription: 'سَـ لِلْقَرِيب، سَوْفَ لِلْبَعِيد',
        arabicTranslation: 'Sa for near, sawfa for distant',
      },

      // COMPLETE Future Tense with سَـ - يَكْتُبُ
      {
        type: 'text',
        content: 'Complete Future Tense with سَـ: يَكْتُبُ (to write)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - المستقبل',
        examples: [
          { arabic: 'أَنَا سَأَكْتُبُ', english: 'I will write', french: 'j\'écrirai' },
          { arabic: 'أَنْتَ سَتَكْتُبُ', english: 'you will write (m.)', french: 'tu écriras (m.)' },
          { arabic: 'أَنْتِ سَتَكْتُبِينَ', english: 'you will write (f.)', french: 'tu écriras (f.)' },
          { arabic: 'هُوَ سَيَكْتُبُ', english: 'he will write', french: 'il écrira' },
          { arabic: 'هِيَ سَتَكْتُبُ', english: 'she will write', french: 'elle écrira' },
          { arabic: 'أَنْتُمَا سَتَكْتُبَانِ', english: 'you two will write', french: 'vous deux écrirez' },
          { arabic: 'هُمَا سَيَكْتُبَانِ', english: 'they two will write (m.)', french: 'ils deux écriront (m.)' },
          { arabic: 'هُمَا سَتَكْتُبَانِ', english: 'they two will write (f.)', french: 'elles deux écriront (f.)' },
          { arabic: 'نَحْنُ سَنَكْتُبُ', english: 'we will write', french: 'nous écrirons' },
          { arabic: 'أَنْتُمْ سَتَكْتُبُونَ', english: 'you all will write (m.)', french: 'vous écrirez (m.)' },
          { arabic: 'أَنْتُنَّ سَتَكْتُبْنَ', english: 'you all will write (f.)', french: 'vous écrirez (f.)' },
          { arabic: 'هُمْ سَيَكْتُبُونَ', english: 'they will write (m.)', french: 'ils écriront' },
          { arabic: 'هُنَّ سَيَكْتُبْنَ', english: 'they will write (f.)', french: 'elles écriront' },
        ],
      },

      // COMPLETE Future Tense with سَـ - يَذْهَبُ
      {
        type: 'text',
        content: 'Complete Future Tense with سَـ: يَذْهَبُ (to go)',
      },
      {
        type: 'examples_grid',
        content: 'All 13 Forms - المستقبل',
        examples: [
          { arabic: 'أَنَا سَأَذْهَبُ', english: 'I will go', french: 'j\'irai' },
          { arabic: 'أَنْتَ سَتَذْهَبُ', english: 'you will go (m.)', french: 'tu iras (m.)' },
          { arabic: 'أَنْتِ سَتَذْهَبِينَ', english: 'you will go (f.)', french: 'tu iras (f.)' },
          { arabic: 'هُوَ سَيَذْهَبُ', english: 'he will go', french: 'il ira' },
          { arabic: 'هِيَ سَتَذْهَبُ', english: 'she will go', french: 'elle ira' },
          { arabic: 'أَنْتُمَا سَتَذْهَبَانِ', english: 'you two will go', french: 'vous deux irez' },
          { arabic: 'هُمَا سَيَذْهَبَانِ', english: 'they two will go (m.)', french: 'ils deux iront (m.)' },
          { arabic: 'هُمَا سَتَذْهَبَانِ', english: 'they two will go (f.)', french: 'elles deux iront (f.)' },
          { arabic: 'نَحْنُ سَنَذْهَبُ', english: 'we will go', french: 'nous irons' },
          { arabic: 'أَنْتُمْ سَتَذْهَبُونَ', english: 'you all will go (m.)', french: 'vous irez (m.)' },
          { arabic: 'أَنْتُنَّ سَتَذْهَبْنَ', english: 'you all will go (f.)', french: 'vous irez (f.)' },
          { arabic: 'هُمْ سَيَذْهَبُونَ', english: 'they will go (m.)', french: 'ils iront' },
          { arabic: 'هُنَّ سَيَذْهَبْنَ', english: 'they will go (f.)', french: 'elles iront' },
        ],
      },

      // Comparison سَـ vs سَوْفَ
      {
        type: 'comparison_grid',
        content: 'سَـ vs سَوْفَ',
        leftLabel: 'سَـ (Soon)',
        rightLabel: 'سَوْفَ (Later/Emphatic)',
        comparisons: [
          { left: { arabic: 'سَأَكْتُبُ', label: 'I\'ll write (soon)' }, right: { arabic: 'سَوْفَ أَكْتُبُ', label: 'I shall write' } },
          { left: { arabic: 'سَيَذْهَبُ', label: 'He\'ll go (soon)' }, right: { arabic: 'سَوْفَ يَذْهَبُ', label: 'He shall go' } },
          { left: { arabic: 'سَنَدْرُسُ', label: 'We\'ll study (soon)' }, right: { arabic: 'سَوْفَ نَدْرُسُ', label: 'We shall study' } },
        ],
      },

      // سَوْفَ Examples
      {
        type: 'text',
        content: 'Examples with سَوْفَ (All Pronouns)',
      },
      {
        type: 'examples_grid',
        content: 'Distant/emphatic future',
        examples: [
          { arabic: 'سَوْفَ أَنْجَحُ', english: 'I shall succeed', french: 'je réussirai' },
          { arabic: 'سَوْفَ تَفْهَمُ', english: 'You (m.) will understand', french: 'tu comprendras (m.)' },
          { arabic: 'سَوْفَ تَتَعَلَّمِينَ', english: 'You (f.) will learn', french: 'tu apprendras (f.)' },
          { arabic: 'سَوْفَ يَعُودُ', english: 'He will return', french: 'il reviendra' },
          { arabic: 'سَوْفَ نَلْتَقِي', english: 'We shall meet', french: 'nous nous rencontrerons' },
          { arabic: 'سَوْفَ يَنْتَصِرُونَ', english: 'They (m.) will win', french: 'ils vaincront' },
        ],
      },

      // Sentences
      {
        type: 'text',
        content: 'Future Tense in Sentences',
      },
      {
        type: 'examples_grid',
        content: 'Real examples with different pronouns',
        examples: [
          { arabic: 'سَأَدْرُسُ غَدًا', english: 'I will study tomorrow', french: 'j\'étudierai demain' },
          { arabic: 'سَتَذْهَبِينَ إِلَى السُّوق', english: 'You (f.) will go to the market', french: 'tu iras au marché (f.)' },
          { arabic: 'سَيَكْتُبُ الرِّسَالَة', english: 'He will write the letter', french: 'il écrira la lettre' },
          { arabic: 'سَنَأْكُلُ مَعًا', english: 'We will eat together', french: 'nous mangerons ensemble' },
          { arabic: 'سَيَدْرُسُونَ الْعَرَبِيَّة', english: 'They (m.) will study Arabic', french: 'ils étudieront l\'arabe' },
          { arabic: 'سَوْفَ أَزُورُكَ', english: 'I shall visit you', french: 'je te rendrai visite' },
        ],
      },

      // Time Words
      {
        type: 'text',
        content: 'Common Future Time Words',
      },
      {
        type: 'examples_grid',
        content: 'Use these with future tense',
        examples: [
          { arabic: 'غَدًا', english: 'tomorrow', french: 'demain' },
          { arabic: 'بَعْد غَدٍ', english: 'day after tomorrow', french: 'après-demain' },
          { arabic: 'الأُسْبُوع الْقَادِم', english: 'next week', french: 'la semaine prochaine' },
          { arabic: 'الشَّهْر الْقَادِم', english: 'next month', french: 'le mois prochain' },
          { arabic: 'السَّنَة الْقَادِمَة', english: 'next year', french: 'l\'année prochaine' },
          { arabic: 'قَرِيبًا', english: 'soon', french: 'bientôt' },
        ],
      },

      // Usage Note
      {
        type: 'note',
        content: 'In modern spoken Arabic, [[سَـ]] is used much more often than سَوْفَ. For formal or written Arabic, both are common. Remember: future = سَـ/سَوْفَ + present tense (no changes to the verb itself!).',
        arabicDescription: 'سَـ أَكْثَر شُيُوعًا فِي الْكَلَام الْيَوْمِي',
        arabicTranslation: 'Sa is more common in everyday speech',
      },
    ],
  },

  // LESSON 5: Imperative/Commands
  {
    id: 'verb-lesson-5',
    title: 'Commands (الأمر)',
    titleFr: 'Les ordres (الأمر)',
    titleArabic: 'فِعْل الأَمْر',
    description: 'Learn to form imperatives - give commands and instructions in Arabic',
    descriptionFr: 'Apprendre à former l\'impératif - donner des ordres et des instructions en arabe',
    level: 'intermediate',
    category: 'verbs',
    order: 5,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'The imperative (الأمر) is used to give [[commands]], [[instructions]], or [[requests]]. Commands are only given to "you" (2nd person), so there are only 5 forms: masculine singular, feminine singular, dual, masculine plural, and feminine plural.',
        arabicDescription: 'الأَمْر يُسْتَخْدَم لِلطَّلَب',
        arabicTranslation: 'The imperative is used for requests',
      },

      // Formation Rule
      {
        type: 'rule',
        content: 'To form the imperative: 1) Take the present tense "you" form, 2) Remove the prefix تَـ, 3) If needed, add [[اِ]] (alif with kasra) or [[اُ]] (alif with damma) at the beginning to make it pronounceable.',
        arabicDescription: 'اِحْذِف تَاء الْمُضَارَعَة وَأَضِف هَمْزَة الْوَصْل',
        arabicTranslation: 'Remove the present tense ta and add hamzat al-wasl',
      },

      // Complete Imperative - كَتَبَ
      {
        type: 'text',
        content: 'Complete Imperative Forms: اُكْتُبْ (Write!)',
      },
      {
        type: 'examples_grid',
        content: 'All 5 Command Forms',
        examples: [
          { arabic: 'أَنْتَ اُكْتُبْ', english: 'Write! (to one male)', french: 'Écris ! (à un homme)' },
          { arabic: 'أَنْتِ اُكْتُبِي', english: 'Write! (to one female)', french: 'Écris ! (à une femme)' },
          { arabic: 'أَنْتُمَا اُكْتُبَا', english: 'Write! (to two people)', french: 'Écrivez ! (à deux personnes)' },
          { arabic: 'أَنْتُمْ اُكْتُبُوا', english: 'Write! (to males/mixed)', french: 'Écrivez ! (à des hommes/mixte)' },
          { arabic: 'أَنْتُنَّ اُكْتُبْنَ', english: 'Write! (to females)', french: 'Écrivez ! (à des femmes)' },
        ],
      },

      // Complete Imperative - ذَهَبَ
      {
        type: 'text',
        content: 'Complete Imperative Forms: اِذْهَبْ (Go!)',
      },
      {
        type: 'examples_grid',
        content: 'All 5 Command Forms',
        examples: [
          { arabic: 'أَنْتَ اِذْهَبْ', english: 'Go! (to one male)', french: 'Va ! (à un homme)' },
          { arabic: 'أَنْتِ اِذْهَبِي', english: 'Go! (to one female)', french: 'Va ! (à une femme)' },
          { arabic: 'أَنْتُمَا اِذْهَبَا', english: 'Go! (to two people)', french: 'Allez ! (à deux personnes)' },
          { arabic: 'أَنْتُمْ اِذْهَبُوا', english: 'Go! (to males/mixed)', french: 'Allez ! (à des hommes/mixte)' },
          { arabic: 'أَنْتُنَّ اِذْهَبْنَ', english: 'Go! (to females)', french: 'Allez ! (à des femmes)' },
        ],
      },

      // Complete Imperative - جَلَسَ
      {
        type: 'text',
        content: 'Complete Imperative Forms: اِجْلِسْ (Sit!)',
      },
      {
        type: 'examples_grid',
        content: 'All 5 Command Forms',
        examples: [
          { arabic: 'أَنْتَ اِجْلِسْ', english: 'Sit! (to one male)', french: 'Assieds-toi ! (à un homme)' },
          { arabic: 'أَنْتِ اِجْلِسِي', english: 'Sit! (to one female)', french: 'Assieds-toi ! (à une femme)' },
          { arabic: 'أَنْتُمَا اِجْلِسَا', english: 'Sit! (to two people)', french: 'Asseyez-vous ! (à deux personnes)' },
          { arabic: 'أَنْتُمْ اِجْلِسُوا', english: 'Sit! (to males/mixed)', french: 'Asseyez-vous ! (à des hommes/mixte)' },
          { arabic: 'أَنْتُنَّ اِجْلِسْنَ', english: 'Sit! (to females)', french: 'Asseyez-vous ! (à des femmes)' },
        ],
      },

      // Hamza Rule
      {
        type: 'rule',
        content: 'The initial hamza takes [[kasra]] (اِ) if the middle vowel of the present is fatha or kasra. It takes [[damma]] (اُ) if the middle vowel is damma. يَكْتُ[[بُ]] → اُكْتُبْ, يَجْلِ[[سُ]] → اِجْلِسْ.',
        arabicDescription: 'الْهَمْزَة تَتْبَع حَرَكَة عَيْن الْفِعْل',
        arabicTranslation: 'The hamza follows the vowel of the middle letter',
      },

      // Common Commands
      {
        type: 'text',
        content: 'Common Commands (All 5 Forms)',
      },
      {
        type: 'examples_grid',
        content: 'Essential commands to know',
        examples: [
          { arabic: 'اُكْتُبْ / اُكْتُبِي / اُكْتُبُوا', english: 'Write! (m./f./pl.)', french: 'Écris / Écris / Écrivez !' },
          { arabic: 'اِقْرَأْ / اِقْرَئِي / اِقْرَأُوا', english: 'Read! (m./f./pl.)', french: 'Lis / Lis / Lisez !' },
          { arabic: 'اِذْهَبْ / اِذْهَبِي / اِذْهَبُوا', english: 'Go! (m./f./pl.)', french: 'Va / Va / Allez !' },
          { arabic: 'اِجْلِسْ / اِجْلِسِي / اِجْلِسُوا', english: 'Sit! (m./f./pl.)', french: 'Assieds-toi / Assieds-toi / Asseyez-vous !' },
          { arabic: 'اِفْتَحْ / اِفْتَحِي / اِفْتَحُوا', english: 'Open! (m./f./pl.)', french: 'Ouvre / Ouvre / Ouvrez !' },
          { arabic: 'اِسْمَعْ / اِسْمَعِي / اِسْمَعُوا', english: 'Listen! (m./f./pl.)', french: 'Écoute / Écoute / Écoutez !' },
        ],
      },

      // Polite Commands
      {
        type: 'note',
        content: 'To make commands more polite, add [[مِنْ فَضْلِكَ]] (please, to male), [[مِنْ فَضْلِكِ]] (please, to female), or [[مِنْ فَضْلِكُمْ]] (please, to plural) after the command.',
        arabicDescription: 'أَضِف "مِنْ فَضْلِكَ" لِلتَّأَدُّب',
        arabicTranslation: 'Add "min fadlik" to be polite',
      },

      // Polite Examples
      {
        type: 'examples_grid',
        content: 'Polite commands',
        examples: [
          { arabic: 'اِجْلِسْ مِنْ فَضْلِكَ', english: 'Please sit (to male)', french: 'Assieds-toi s\'il te plaît (à un homme)' },
          { arabic: 'اِجْلِسِي مِنْ فَضْلِكِ', english: 'Please sit (to female)', french: 'Assieds-toi s\'il te plaît (à une femme)' },
          { arabic: 'اِفْتَحُوا الْكِتَاب', english: 'Open the book (to group)', french: 'Ouvrez le livre (à un groupe)' },
          { arabic: 'اُكْتُبِي اسْمَكِ', english: 'Write your name (to female)', french: 'Écris ton nom (à une femme)' },
        ],
      },

      // Negative Commands
      {
        type: 'rule',
        content: 'For negative commands (prohibitions), use [[لَا]] + present tense (jussive mood). The verb stays in present tense form, not imperative. Example: [[لَا تَكْتُبْ]] = "Don\'t write!"',
        arabicDescription: 'النَّهْي = لَا + الْمُضَارِع الْمَجْزُوم',
        arabicTranslation: 'Prohibition = la + jussive present',
      },

      // Negative Command
      {
        type: 'text',
        content: 'Negative Commands: لَا تَكْتُبْ (Don\'t write!)',
      },
      {
        type: 'examples_grid',
        content: 'All 5 Prohibition Forms',
        examples: [
          { arabic: 'أَنْتَ لَا تَكْتُبْ', english: 'Don\'t write! (to male)', french: 'N\'écris pas ! (à un homme)' },
          { arabic: 'أَنْتِ لَا تَكْتُبِي', english: 'Don\'t write! (to female)', french: 'N\'écris pas ! (à une femme)' },
          { arabic: 'أَنْتُمَا لَا تَكْتُبَا', english: 'Don\'t write! (to two)', french: 'N\'écrivez pas ! (à deux)' },
          { arabic: 'أَنْتُمْ لَا تَكْتُبُوا', english: 'Don\'t write! (to males)', french: 'N\'écrivez pas ! (à des hommes)' },
          { arabic: 'أَنْتُنَّ لَا تَكْتُبْنَ', english: 'Don\'t write! (to females)', french: 'N\'écrivez pas ! (à des femmes)' },
        ],
      },
    ],
  },

  // LESSON 6: Verb Forms Overview
  {
    id: 'verb-lesson-6',
    title: 'Arabic Verb Forms (I-X)',
    titleFr: 'Les formes verbales arabes (I-X)',
    titleArabic: 'أَوْزَان الْفِعْل الْعَرَبِي',
    description: 'Discover how Arabic creates related verbs using ten different forms',
    descriptionFr: 'Découvrir comment l\'arabe crée des verbes apparentés en utilisant dix formes différentes',
    level: 'intermediate',
    category: 'verbs',
    order: 6,
    exercises: [],
    content: [
      // Introduction
      {
        type: 'description',
        content: 'Arabic has [[10 verb forms]] (أوزان) that modify the 3-letter root to create related meanings. Form I is the basic verb; Forms II-X add letters or double consonants to change the meaning in predictable ways. This is one of Arabic\'s most elegant features!',
        arabicDescription: 'لِلْفِعْل الْعَرَبِي عَشَرَة أَوْزَان',
        arabicTranslation: 'The Arabic verb has ten forms',
      },

      // Why Forms Matter
      {
        type: 'rule',
        content: 'Each form has a general meaning tendency. [[Form II]] often means "to cause to do" (causative). [[Form V]] often means "to do to oneself" (reflexive). Learning forms helps you guess meanings of new words!',
        arabicDescription: 'كُلُّ وَزْن لَهُ مَعْنَى عَام',
        arabicTranslation: 'Each form has a general meaning',
      },

      // All 10 Forms Overview
      {
        type: 'text',
        content: 'The 10 Arabic Verb Forms',
      },
      {
        type: 'examples_grid',
        content: 'Complete Forms Overview',
        examples: [
          { arabic: 'الوزن الأول: فَعَلَ - يَفْعَلُ', english: 'Form I: Basic meaning', french: 'Forme I : Sens de base' },
          { arabic: 'الوزن الثاني: فَعَّلَ - يُفَعِّلُ', english: 'Form II: Causative, intensive', french: 'Forme II : Causatif, intensif' },
          { arabic: 'الوزن الثالث: فَاعَلَ - يُفَاعِلُ', english: 'Form III: Doing with someone', french: 'Forme III : Action avec quelqu\'un' },
          { arabic: 'الوزن الرابع: أَفْعَلَ - يُفْعِلُ', english: 'Form IV: Causative', french: 'Forme IV : Causatif' },
          { arabic: 'الوزن الخامس: تَفَعَّلَ - يَتَفَعَّلُ', english: 'Form V: Reflexive of II', french: 'Forme V : Réfléchi de II' },
          { arabic: 'الوزن السادس: تَفَاعَلَ - يَتَفَاعَلُ', english: 'Form VI: Mutual/reciprocal', french: 'Forme VI : Mutuel/réciproque' },
          { arabic: 'الوزن السابع: اِنْفَعَلَ - يَنْفَعِلُ', english: 'Form VII: Passive/reflexive', french: 'Forme VII : Passif/réfléchi' },
          { arabic: 'الوزن الثامن: اِفْتَعَلَ - يَفْتَعِلُ', english: 'Form VIII: Reflexive/middle', french: 'Forme VIII : Réfléchi/moyen' },
          { arabic: 'الوزن التاسع: اِفْعَلَّ - يَفْعَلُّ', english: 'Form IX: Colors/defects', french: 'Forme IX : Couleurs/défauts' },
          { arabic: 'الوزن العاشر: اِسْتَفْعَلَ - يَسْتَفْعِلُ', english: 'Form X: Seeking/considering', french: 'Forme X : Demande/considération' },
        ],
      },

      // Form I
      {
        type: 'text',
        content: 'Form I (الوزن الأول): فَعَلَ',
      },
      {
        type: 'examples_grid',
        content: 'Basic form - the root meaning',
        examples: [
          { arabic: 'كَتَبَ - يَكْتُبُ', english: 'to write', french: 'écrire' },
          { arabic: 'عَلِمَ - يَعْلَمُ', english: 'to know', french: 'savoir' },
          { arabic: 'فَتَحَ - يَفْتَحُ', english: 'to open', french: 'ouvrir' },
          { arabic: 'دَخَلَ - يَدْخُلُ', english: 'to enter', french: 'entrer' },
        ],
      },

      // Form II
      {
        type: 'text',
        content: 'Form II (الوزن الثاني): فَعَّلَ',
      },
      {
        type: 'rule',
        content: 'Form II [[doubles the middle letter]]. It often means: [[causative]] (make someone do), [[intensive]] (do intensely), or creates verbs from nouns.',
        arabicDescription: 'تَضْعِيف الْعَيْن - لِلتَّكْثِير وَالتَّعْدِيَة',
        arabicTranslation: 'Doubling middle letter - for intensity and causation',
      },
      {
        type: 'examples_grid',
        content: 'Form II examples',
        examples: [
          { arabic: 'عَلَّمَ - يُعَلِّمُ', english: 'to teach (make know)', french: 'enseigner (faire savoir)' },
          { arabic: 'دَرَّسَ - يُدَرِّسُ', english: 'to teach (lessons)', french: 'enseigner (des cours)' },
          { arabic: 'كَسَّرَ - يُكَسِّرُ', english: 'to smash (break intensely)', french: 'fracasser (casser intensément)' },
          { arabic: 'صَوَّرَ - يُصَوِّرُ', english: 'to photograph', french: 'photographier' },
        ],
      },

      // Form III
      {
        type: 'text',
        content: 'Form III (الوزن الثالث): فَاعَلَ',
      },
      {
        type: 'rule',
        content: 'Form III adds [[alif after the first letter]]. It indicates [[doing with someone]] (reciprocal action) or [[attempting]].',
        arabicDescription: 'زِيَادَة أَلِف - لِلْمُشَارَكَة',
        arabicTranslation: 'Adding alif - for participation',
      },
      {
        type: 'examples_grid',
        content: 'Form III examples',
        examples: [
          { arabic: 'كَاتَبَ - يُكَاتِبُ', english: 'to correspond with', french: 'correspondre avec' },
          { arabic: 'قَاتَلَ - يُقَاتِلُ', english: 'to fight (with)', french: 'combattre (avec)' },
          { arabic: 'سَافَرَ - يُسَافِرُ', english: 'to travel', french: 'voyager' },
          { arabic: 'حَاوَلَ - يُحَاوِلُ', english: 'to try/attempt', french: 'essayer/tenter' },
        ],
      },

      // Form IV
      {
        type: 'text',
        content: 'Form IV (الوزن الرابع): أَفْعَلَ',
      },
      {
        type: 'examples_grid',
        content: 'Form IV adds أَ - causative',
        examples: [
          { arabic: 'أَخْرَجَ - يُخْرِجُ', english: 'to take out', french: 'sortir/extraire' },
          { arabic: 'أَدْخَلَ - يُدْخِلُ', english: 'to insert', french: 'insérer/faire entrer' },
          { arabic: 'أَرْسَلَ - يُرْسِلُ', english: 'to send', french: 'envoyer' },
          { arabic: 'أَسْلَمَ - يُسْلِمُ', english: 'to submit/become Muslim', french: 'se soumettre/devenir musulman' },
        ],
      },

      // Form V
      {
        type: 'text',
        content: 'Form V (الوزن الخامس): تَفَعَّلَ',
      },
      {
        type: 'examples_grid',
        content: 'Form V = تَ + Form II - reflexive',
        examples: [
          { arabic: 'تَعَلَّمَ - يَتَعَلَّمُ', english: 'to learn (teach oneself)', french: 'apprendre (s\'enseigner)' },
          { arabic: 'تَكَلَّمَ - يَتَكَلَّمُ', english: 'to speak', french: 'parler' },
          { arabic: 'تَذَكَّرَ - يَتَذَكَّرُ', english: 'to remember', french: 'se souvenir' },
          { arabic: 'تَوَقَّعَ - يَتَوَقَّعُ', english: 'to expect', french: 's\'attendre à' },
        ],
      },

      // Form VI
      {
        type: 'text',
        content: 'Form VI (الوزن السادس): تَفَاعَلَ',
      },
      {
        type: 'examples_grid',
        content: 'Form VI = تَ + Form III - mutual action',
        examples: [
          { arabic: 'تَبَادَلَ - يَتَبَادَلُ', english: 'to exchange', french: 'échanger' },
          { arabic: 'تَعَاوَنَ - يَتَعَاوَنُ', english: 'to cooperate', french: 'coopérer' },
          { arabic: 'تَقَاتَلَ - يَتَقَاتَلُ', english: 'to fight each other', french: 'se battre mutuellement' },
          { arabic: 'تَوَاصَلَ - يَتَوَاصَلُ', english: 'to communicate', french: 'communiquer' },
        ],
      },

      // Forms VII-X
      {
        type: 'text',
        content: 'Forms VII-X',
      },
      {
        type: 'examples_grid',
        content: 'Advanced Forms',
        examples: [
          { arabic: 'الوزن السابع: اِنْكَسَرَ', english: 'Form VII: it broke (passive)', french: 'Forme VII : s\'est cassé (passif)' },
          { arabic: 'الوزن الثامن: اِجْتَمَعَ', english: 'Form VIII: to gather/meet', french: 'Forme VIII : se rassembler/se réunir' },
          { arabic: 'الوزن التاسع: اِحْمَرَّ', english: 'Form IX: to become red', french: 'Forme IX : devenir rouge' },
          { arabic: 'الوزن العاشر: اِسْتَخْدَمَ', english: 'Form X: to use (seek service)', french: 'Forme X : utiliser (chercher un service)' },
        ],
      },

      // Form X Detail
      {
        type: 'rule',
        content: 'Form X (اِسْتَفْعَلَ) is very common. It often means [[to seek/request]] the action, or [[to consider]] something. Pattern: اِسْتَفْعَلَ - يَسْتَفْعِلُ',
        arabicDescription: 'اِسْتَفْعَلَ - لِلطَّلَب',
        arabicTranslation: 'Istafʿala - for requesting',
      },
      {
        type: 'examples_grid',
        content: 'Form X examples',
        examples: [
          { arabic: 'اِسْتَخْدَمَ - يَسْتَخْدِمُ', english: 'to use', french: 'utiliser' },
          { arabic: 'اِسْتَعْمَلَ - يَسْتَعْمِلُ', english: 'to employ/use', french: 'employer/utiliser' },
          { arabic: 'اِسْتَقْبَلَ - يَسْتَقْبِلُ', english: 'to welcome', french: 'accueillir' },
          { arabic: 'اِسْتَفْهَمَ - يَسْتَفْهِمُ', english: 'to inquire', french: 'se renseigner' },
        ],
      },

      // Root Comparison
      {
        type: 'text',
        content: 'One Root, Many Forms: ع-ل-م (knowing)',
      },
      {
        type: 'examples_grid',
        content: 'Same root across different forms',
        examples: [
          { arabic: 'عَلِمَ - يَعْلَمُ', english: 'Form I: to know', french: 'Forme I : savoir' },
          { arabic: 'عَلَّمَ - يُعَلِّمُ', english: 'Form II: to teach', french: 'Forme II : enseigner' },
          { arabic: 'أَعْلَمَ - يُعْلِمُ', english: 'Form IV: to inform', french: 'Forme IV : informer' },
          { arabic: 'تَعَلَّمَ - يَتَعَلَّمُ', english: 'Form V: to learn', french: 'Forme V : apprendre' },
          { arabic: 'اِسْتَعْلَمَ - يَسْتَعْلِمُ', english: 'Form X: to inquire', french: 'Forme X : se renseigner' },
        ],
      },

      // Learning Tip
      {
        type: 'note',
        content: 'Focus on [[Forms I, II, V, and X]] first - these are the most common. As you encounter new verbs, noting their form will help you understand and remember their meanings.',
        arabicDescription: 'اِبْدَأ بِالأَوْزَان الأَكْثَر شُيُوعًا',
        arabicTranslation: 'Start with the most common forms',
      },
    ],
  },
  ...ADDITIONAL_VERB_LESSONS,
];

export default verbLessons;
