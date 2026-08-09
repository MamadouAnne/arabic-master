import { VocabularyTheme, VocabularyWord } from '../../../../types/arabic';

// Additional vocabulary themes extending the core 10 (greetings, numbers,
// family, colors, food, body, animals, time, places, objects).
// Bilingual EN/FR throughout.

// ── Themes ──────────────────────────────────────────────────────
export const natureTheme: VocabularyTheme = {
  id: 'nature',
  name: 'Nature & Weather',
  nameFr: 'Nature et météo',
  nameArabic: 'الطَّبِيعَة وَالطَّقْس',
  icon: '🌳',
  color: '#14b8a6',
  description: 'The sky, land, water and weather',
  descriptionFr: 'Le ciel, la terre, l\'eau et la météo',
  wordCount: 12,
  level: 'beginner',
  order: 11,
};

export const clothingTheme: VocabularyTheme = {
  id: 'clothing',
  name: 'Clothing',
  nameFr: 'Vêtements',
  nameArabic: 'الْمَلَابِس',
  icon: '👕',
  color: '#ec4899',
  description: 'Everyday clothes and accessories',
  descriptionFr: 'Les vêtements et accessoires du quotidien',
  wordCount: 12,
  level: 'beginner',
  order: 12,
};

export const professionsTheme: VocabularyTheme = {
  id: 'professions',
  name: 'Professions',
  nameFr: 'Métiers',
  nameArabic: 'الْمِهَن',
  icon: '💼',
  color: '#8b5cf6',
  description: 'Jobs and the people who do them',
  descriptionFr: 'Les métiers et ceux qui les exercent',
  wordCount: 12,
  level: 'intermediate',
  order: 13,
};

export const travelTheme: VocabularyTheme = {
  id: 'travel',
  name: 'Travel & Transport',
  nameFr: 'Voyage et transport',
  nameArabic: 'السَّفَر وَالْمُوَاصَلَات',
  icon: '✈️',
  color: '#0ea5e9',
  description: 'Getting around and going on trips',
  descriptionFr: 'Se déplacer et partir en voyage',
  wordCount: 12,
  level: 'intermediate',
  order: 14,
};

export const commonVerbsTheme: VocabularyTheme = {
  id: 'verbs-common',
  name: 'Common Verbs',
  nameFr: 'Verbes courants',
  nameArabic: 'الْأَفْعَال الشَّائِعَة',
  icon: '⚡',
  color: '#6366f1',
  description: 'Everyday actions you use constantly',
  descriptionFr: 'Les actions du quotidien que l\'on emploie sans cesse',
  wordCount: 12,
  level: 'intermediate',
  order: 15,
};

export const emotionsTheme: VocabularyTheme = {
  id: 'emotions',
  name: 'Emotions & Feelings',
  nameFr: 'Émotions et sentiments',
  nameArabic: 'الْمَشَاعِر',
  icon: '❤️',
  color: '#f43f5e',
  description: 'How you feel and describe moods',
  descriptionFr: 'Comment on se sent et décrit les humeurs',
  wordCount: 12,
  level: 'intermediate',
  order: 16,
};

// ── Words ───────────────────────────────────────────────────────
export const natureWords: VocabularyWord[] = [
  { id: 'nature-1', themeId: 'nature', arabic: 'شمس', arabicWithVowels: 'شَمْس', transliteration: 'shams', english: 'Sun', french: 'Soleil', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 1, exampleSentence: { arabic: 'الشَّمْسُ سَاطِعَةٌ الْيَوْمَ', transliteration: 'ash-shamsu sāṭiʿatun al-yawm', english: 'The sun is shining today', french: 'Le soleil brille aujourd\'hui' } },
  { id: 'nature-2', themeId: 'nature', arabic: 'قمر', arabicWithVowels: 'قَمَر', transliteration: 'qamar', english: 'Moon', french: 'Lune', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 2, exampleSentence: { arabic: 'الْقَمَرُ جَمِيلٌ اللَّيْلَةَ', transliteration: 'al-qamaru jamīlun al-laylah', english: 'The moon is beautiful tonight', french: 'La lune est belle ce soir' } },
  { id: 'nature-3', themeId: 'nature', arabic: 'سماء', arabicWithVowels: 'سَمَاء', transliteration: 'samāʾ', english: 'Sky', french: 'Ciel', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 3 },
  { id: 'nature-4', themeId: 'nature', arabic: 'نجم', arabicWithVowels: 'نَجْم', transliteration: 'najm', english: 'Star', french: 'Étoile', partOfSpeech: 'noun', gender: 'masculine', plural: 'نُجُوم', level: 'beginner', order: 4 },
  { id: 'nature-5', themeId: 'nature', arabic: 'شجرة', arabicWithVowels: 'شَجَرَة', transliteration: 'shajara', english: 'Tree', french: 'Arbre', partOfSpeech: 'noun', gender: 'feminine', plural: 'أَشْجَار', level: 'beginner', order: 5, exampleSentence: { arabic: 'الشَّجَرَةُ كَبِيرَةٌ', transliteration: 'ash-shajaratu kabīra', english: 'The tree is big', french: 'L\'arbre est grand' } },
  { id: 'nature-6', themeId: 'nature', arabic: 'زهرة', arabicWithVowels: 'زَهْرَة', transliteration: 'zahra', english: 'Flower', french: 'Fleur', partOfSpeech: 'noun', gender: 'feminine', plural: 'أَزْهَار', level: 'beginner', order: 6 },
  { id: 'nature-7', themeId: 'nature', arabic: 'مطر', arabicWithVowels: 'مَطَر', transliteration: 'maṭar', english: 'Rain', french: 'Pluie', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 7, exampleSentence: { arabic: 'يَنْزِلُ الْمَطَرُ فِي الشِّتَاء', transliteration: 'yanzilu al-maṭaru fī ash-shitāʾ', english: 'Rain falls in winter', french: 'La pluie tombe en hiver' } },
  { id: 'nature-8', themeId: 'nature', arabic: 'ريح', arabicWithVowels: 'رِيح', transliteration: 'rīḥ', english: 'Wind', french: 'Vent', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 8 },
  { id: 'nature-9', themeId: 'nature', arabic: 'بحر', arabicWithVowels: 'بَحْر', transliteration: 'baḥr', english: 'Sea', french: 'Mer', partOfSpeech: 'noun', gender: 'masculine', plural: 'بِحَار', level: 'beginner', order: 9 },
  { id: 'nature-10', themeId: 'nature', arabic: 'جبل', arabicWithVowels: 'جَبَل', transliteration: 'jabal', english: 'Mountain', french: 'Montagne', partOfSpeech: 'noun', gender: 'masculine', plural: 'جِبَال', level: 'beginner', order: 10 },
  { id: 'nature-11', themeId: 'nature', arabic: 'نهر', arabicWithVowels: 'نَهْر', transliteration: 'nahr', english: 'River', french: 'Rivière', partOfSpeech: 'noun', gender: 'masculine', plural: 'أَنْهَار', level: 'beginner', order: 11 },
  { id: 'nature-12', themeId: 'nature', arabic: 'سحابة', arabicWithVowels: 'سَحَابَة', transliteration: 'saḥāba', english: 'Cloud', french: 'Nuage', partOfSpeech: 'noun', gender: 'feminine', plural: 'سَحَاب', level: 'beginner', order: 12 },
];

export const clothingWords: VocabularyWord[] = [
  { id: 'clothing-1', themeId: 'clothing', arabic: 'قميص', arabicWithVowels: 'قَمِيص', transliteration: 'qamīṣ', english: 'Shirt', french: 'Chemise', partOfSpeech: 'noun', gender: 'masculine', plural: 'قُمْصَان', level: 'beginner', order: 1, exampleSentence: { arabic: 'أَلْبَسُ قَمِيصًا أَبْيَضَ', transliteration: 'albasu qamīṣan abyaḍ', english: 'I wear a white shirt', french: 'Je porte une chemise blanche' } },
  { id: 'clothing-2', themeId: 'clothing', arabic: 'بنطلون', arabicWithVowels: 'بَنْطَلُون', transliteration: 'banṭalūn', english: 'Trousers', french: 'Pantalon', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 2 },
  { id: 'clothing-3', themeId: 'clothing', arabic: 'حذاء', arabicWithVowels: 'حِذَاء', transliteration: 'ḥidhāʾ', english: 'Shoe', french: 'Chaussure', partOfSpeech: 'noun', gender: 'masculine', plural: 'أَحْذِيَة', level: 'beginner', order: 3 },
  { id: 'clothing-4', themeId: 'clothing', arabic: 'قبعة', arabicWithVowels: 'قُبَّعَة', transliteration: 'qubbaʿa', english: 'Hat', french: 'Chapeau', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 4 },
  { id: 'clothing-5', themeId: 'clothing', arabic: 'معطف', arabicWithVowels: 'مِعْطَف', transliteration: 'miʿṭaf', english: 'Coat', french: 'Manteau', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 5 },
  { id: 'clothing-6', themeId: 'clothing', arabic: 'فستان', arabicWithVowels: 'فُسْتَان', transliteration: 'fustān', english: 'Dress', french: 'Robe', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 6 },
  { id: 'clothing-7', themeId: 'clothing', arabic: 'جورب', arabicWithVowels: 'جَوْرَب', transliteration: 'jawrab', english: 'Sock', french: 'Chaussette', partOfSpeech: 'noun', gender: 'masculine', plural: 'جَوَارِب', level: 'beginner', order: 7 },
  { id: 'clothing-8', themeId: 'clothing', arabic: 'حجاب', arabicWithVowels: 'حِجَاب', transliteration: 'ḥijāb', english: 'Hijab (head covering)', french: 'Hijab (voile)', partOfSpeech: 'noun', gender: 'masculine', level: 'beginner', order: 8 },
  { id: 'clothing-9', themeId: 'clothing', arabic: 'ثوب', arabicWithVowels: 'ثَوْب', transliteration: 'thawb', english: 'Garment / robe', french: 'Vêtement / robe longue', partOfSpeech: 'noun', gender: 'masculine', plural: 'ثِيَاب', level: 'beginner', order: 9 },
  { id: 'clothing-10', themeId: 'clothing', arabic: 'نظارة', arabicWithVowels: 'نَظَّارَة', transliteration: 'naẓẓāra', english: 'Glasses', french: 'Lunettes', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 10 },
  { id: 'clothing-11', themeId: 'clothing', arabic: 'ساعة', arabicWithVowels: 'سَاعَة', transliteration: 'sāʿa', english: 'Watch / clock', french: 'Montre / horloge', partOfSpeech: 'noun', gender: 'feminine', level: 'beginner', order: 11 },
  { id: 'clothing-12', themeId: 'clothing', arabic: 'ملابس', arabicWithVowels: 'مَلَابِس', transliteration: 'malābis', english: 'Clothes', french: 'Vêtements', partOfSpeech: 'noun', level: 'beginner', order: 12, exampleSentence: { arabic: 'مَلَابِسِي جَدِيدَةٌ', transliteration: 'malābisī jadīda', english: 'My clothes are new', french: 'Mes vêtements sont neufs' } },
];

export const professionsWords: VocabularyWord[] = [
  { id: 'prof-1', themeId: 'professions', arabic: 'طبيب', arabicWithVowels: 'طَبِيب', transliteration: 'ṭabīb', english: 'Doctor', french: 'Médecin', partOfSpeech: 'noun', gender: 'masculine', plural: 'أَطِبَّاء', level: 'intermediate', order: 1, exampleSentence: { arabic: 'الطَّبِيبُ فِي الْمُسْتَشْفَى', transliteration: 'aṭ-ṭabību fī al-mustashfā', english: 'The doctor is in the hospital', french: 'Le médecin est à l\'hôpital' } },
  { id: 'prof-2', themeId: 'professions', arabic: 'مهندس', arabicWithVowels: 'مُهَنْدِس', transliteration: 'muhandis', english: 'Engineer', french: 'Ingénieur', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 2 },
  { id: 'prof-3', themeId: 'professions', arabic: 'معلم', arabicWithVowels: 'مُعَلِّم', transliteration: 'muʿallim', english: 'Teacher', french: 'Enseignant', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 3 },
  { id: 'prof-4', themeId: 'professions', arabic: 'طالب', arabicWithVowels: 'طَالِب', transliteration: 'ṭālib', english: 'Student', french: 'Étudiant', partOfSpeech: 'noun', gender: 'masculine', plural: 'طُلَّاب', level: 'intermediate', order: 4 },
  { id: 'prof-5', themeId: 'professions', arabic: 'طباخ', arabicWithVowels: 'طَبَّاخ', transliteration: 'ṭabbākh', english: 'Cook', french: 'Cuisinier', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 5 },
  { id: 'prof-6', themeId: 'professions', arabic: 'شرطي', arabicWithVowels: 'شُرْطِيّ', transliteration: 'shurṭiyy', english: 'Police officer', french: 'Policier', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 6 },
  { id: 'prof-7', themeId: 'professions', arabic: 'مزارع', arabicWithVowels: 'مُزَارِع', transliteration: 'muzāriʿ', english: 'Farmer', french: 'Agriculteur', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 7 },
  { id: 'prof-8', themeId: 'professions', arabic: 'تاجر', arabicWithVowels: 'تَاجِر', transliteration: 'tājir', english: 'Merchant', french: 'Commerçant', partOfSpeech: 'noun', gender: 'masculine', plural: 'تُجَّار', level: 'intermediate', order: 8 },
  { id: 'prof-9', themeId: 'professions', arabic: 'محامي', arabicWithVowels: 'مُحَامِي', transliteration: 'muḥāmī', english: 'Lawyer', french: 'Avocat', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 9 },
  { id: 'prof-10', themeId: 'professions', arabic: 'كاتب', arabicWithVowels: 'كَاتِب', transliteration: 'kātib', english: 'Writer', french: 'Écrivain', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 10 },
  { id: 'prof-11', themeId: 'professions', arabic: 'سائق', arabicWithVowels: 'سَائِق', transliteration: 'sāʾiq', english: 'Driver', french: 'Chauffeur', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 11 },
  { id: 'prof-12', themeId: 'professions', arabic: 'ممرض', arabicWithVowels: 'مُمَرِّض', transliteration: 'mumarriḍ', english: 'Nurse', french: 'Infirmier', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 12, exampleSentence: { arabic: 'الْمُمَرِّضُ يُسَاعِدُ الْمَرْضَى', transliteration: 'al-mumarriḍu yusāʿidu al-marḍā', english: 'The nurse helps the patients', french: 'L\'infirmier aide les malades' } },
];

export const travelWords: VocabularyWord[] = [
  { id: 'travel-1', themeId: 'travel', arabic: 'سيارة', arabicWithVowels: 'سَيَّارَة', transliteration: 'sayyāra', english: 'Car', french: 'Voiture', partOfSpeech: 'noun', gender: 'feminine', level: 'intermediate', order: 1, exampleSentence: { arabic: 'أَرْكَبُ السَّيَّارَةَ', transliteration: 'arkabu as-sayyāra', english: 'I ride in the car', french: 'Je monte dans la voiture' } },
  { id: 'travel-2', themeId: 'travel', arabic: 'طائرة', arabicWithVowels: 'طَائِرَة', transliteration: 'ṭāʾira', english: 'Airplane', french: 'Avion', partOfSpeech: 'noun', gender: 'feminine', level: 'intermediate', order: 2 },
  { id: 'travel-3', themeId: 'travel', arabic: 'قطار', arabicWithVowels: 'قِطَار', transliteration: 'qiṭār', english: 'Train', french: 'Train', partOfSpeech: 'noun', gender: 'masculine', plural: 'قِطَارَات', level: 'intermediate', order: 3 },
  { id: 'travel-4', themeId: 'travel', arabic: 'حافلة', arabicWithVowels: 'حَافِلَة', transliteration: 'ḥāfila', english: 'Bus', french: 'Bus', partOfSpeech: 'noun', gender: 'feminine', level: 'intermediate', order: 4 },
  { id: 'travel-5', themeId: 'travel', arabic: 'دراجة', arabicWithVowels: 'دَرَّاجَة', transliteration: 'darrāja', english: 'Bicycle', french: 'Vélo', partOfSpeech: 'noun', gender: 'feminine', level: 'intermediate', order: 5 },
  { id: 'travel-6', themeId: 'travel', arabic: 'سفينة', arabicWithVowels: 'سَفِينَة', transliteration: 'safīna', english: 'Ship', french: 'Navire', partOfSpeech: 'noun', gender: 'feminine', plural: 'سُفُن', level: 'intermediate', order: 6 },
  { id: 'travel-7', themeId: 'travel', arabic: 'مطار', arabicWithVowels: 'مَطَار', transliteration: 'maṭār', english: 'Airport', french: 'Aéroport', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 7, exampleSentence: { arabic: 'وَصَلْتُ إِلَى الْمَطَار', transliteration: 'waṣaltu ilā al-maṭār', english: 'I arrived at the airport', french: 'Je suis arrivé à l\'aéroport' } },
  { id: 'travel-8', themeId: 'travel', arabic: 'محطة', arabicWithVowels: 'مَحَطَّة', transliteration: 'maḥaṭṭa', english: 'Station', french: 'Gare / station', partOfSpeech: 'noun', gender: 'feminine', level: 'intermediate', order: 8 },
  { id: 'travel-9', themeId: 'travel', arabic: 'تذكرة', arabicWithVowels: 'تَذْكِرَة', transliteration: 'tadhkira', english: 'Ticket', french: 'Billet', partOfSpeech: 'noun', gender: 'feminine', plural: 'تَذَاكِر', level: 'intermediate', order: 9 },
  { id: 'travel-10', themeId: 'travel', arabic: 'جواز سفر', arabicWithVowels: 'جَوَاز سَفَر', transliteration: 'jawāz safar', english: 'Passport', french: 'Passeport', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 10 },
  { id: 'travel-11', themeId: 'travel', arabic: 'فندق', arabicWithVowels: 'فُنْدُق', transliteration: 'funduq', english: 'Hotel', french: 'Hôtel', partOfSpeech: 'noun', gender: 'masculine', plural: 'فَنَادِق', level: 'intermediate', order: 11 },
  { id: 'travel-12', themeId: 'travel', arabic: 'حقيبة', arabicWithVowels: 'حَقِيبَة', transliteration: 'ḥaqība', english: 'Bag / suitcase', french: 'Sac / valise', partOfSpeech: 'noun', gender: 'feminine', plural: 'حَقَائِب', level: 'intermediate', order: 12 },
];

export const commonVerbsWords: VocabularyWord[] = [
  { id: 'cverb-1', themeId: 'verbs-common', arabic: 'ذهب', arabicWithVowels: 'ذَهَبَ', transliteration: 'dhahaba', english: 'to go', french: 'aller', partOfSpeech: 'verb', level: 'intermediate', order: 1, exampleSentence: { arabic: 'ذَهَبَ إِلَى الْمَدْرَسَة', transliteration: 'dhahaba ilā al-madrasa', english: 'He went to school', french: 'Il est allé à l\'école' } },
  { id: 'cverb-2', themeId: 'verbs-common', arabic: 'أكل', arabicWithVowels: 'أَكَلَ', transliteration: 'akala', english: 'to eat', french: 'manger', partOfSpeech: 'verb', level: 'intermediate', order: 2 },
  { id: 'cverb-3', themeId: 'verbs-common', arabic: 'شرب', arabicWithVowels: 'شَرِبَ', transliteration: 'shariba', english: 'to drink', french: 'boire', partOfSpeech: 'verb', level: 'intermediate', order: 3 },
  { id: 'cverb-4', themeId: 'verbs-common', arabic: 'كتب', arabicWithVowels: 'كَتَبَ', transliteration: 'kataba', english: 'to write', french: 'écrire', partOfSpeech: 'verb', level: 'intermediate', order: 4 },
  { id: 'cverb-5', themeId: 'verbs-common', arabic: 'قرأ', arabicWithVowels: 'قَرَأَ', transliteration: 'qaraʾa', english: 'to read', french: 'lire', partOfSpeech: 'verb', level: 'intermediate', order: 5, exampleSentence: { arabic: 'قَرَأَ الْكِتَابَ', transliteration: 'qaraʾa al-kitāb', english: 'He read the book', french: 'Il a lu le livre' } },
  { id: 'cverb-6', themeId: 'verbs-common', arabic: 'نام', arabicWithVowels: 'نَامَ', transliteration: 'nāma', english: 'to sleep', french: 'dormir', partOfSpeech: 'verb', level: 'intermediate', order: 6 },
  { id: 'cverb-7', themeId: 'verbs-common', arabic: 'جلس', arabicWithVowels: 'جَلَسَ', transliteration: 'jalasa', english: 'to sit', french: 's\'asseoir', partOfSpeech: 'verb', level: 'intermediate', order: 7 },
  { id: 'cverb-8', themeId: 'verbs-common', arabic: 'فتح', arabicWithVowels: 'فَتَحَ', transliteration: 'fataḥa', english: 'to open', french: 'ouvrir', partOfSpeech: 'verb', level: 'intermediate', order: 8 },
  { id: 'cverb-9', themeId: 'verbs-common', arabic: 'سمع', arabicWithVowels: 'سَمِعَ', transliteration: 'samiʿa', english: 'to hear', french: 'entendre', partOfSpeech: 'verb', level: 'intermediate', order: 9 },
  { id: 'cverb-10', themeId: 'verbs-common', arabic: 'رأى', arabicWithVowels: 'رَأَى', transliteration: 'raʾā', english: 'to see', french: 'voir', partOfSpeech: 'verb', level: 'intermediate', order: 10 },
  { id: 'cverb-11', themeId: 'verbs-common', arabic: 'تكلم', arabicWithVowels: 'تَكَلَّمَ', transliteration: 'takallama', english: 'to speak', french: 'parler', partOfSpeech: 'verb', level: 'intermediate', order: 11 },
  { id: 'cverb-12', themeId: 'verbs-common', arabic: 'عمل', arabicWithVowels: 'عَمِلَ', transliteration: 'ʿamila', english: 'to work / to do', french: 'travailler / faire', partOfSpeech: 'verb', level: 'intermediate', order: 12 },
];

export const emotionsWords: VocabularyWord[] = [
  { id: 'emo-1', themeId: 'emotions', arabic: 'سعيد', arabicWithVowels: 'سَعِيد', transliteration: 'saʿīd', english: 'Happy', french: 'Heureux', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 1, exampleSentence: { arabic: 'أَنَا سَعِيدٌ جِدًّا', transliteration: 'anā saʿīdun jiddan', english: 'I am very happy', french: 'Je suis très heureux' } },
  { id: 'emo-2', themeId: 'emotions', arabic: 'حزين', arabicWithVowels: 'حَزِين', transliteration: 'ḥazīn', english: 'Sad', french: 'Triste', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 2 },
  { id: 'emo-3', themeId: 'emotions', arabic: 'غاضب', arabicWithVowels: 'غَاضِب', transliteration: 'ghāḍib', english: 'Angry', french: 'En colère', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 3 },
  { id: 'emo-4', themeId: 'emotions', arabic: 'خائف', arabicWithVowels: 'خَائِف', transliteration: 'khāʾif', english: 'Afraid', french: 'Effrayé', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 4 },
  { id: 'emo-5', themeId: 'emotions', arabic: 'متعب', arabicWithVowels: 'مُتْعَب', transliteration: 'mutʿab', english: 'Tired', french: 'Fatigué', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 5, exampleSentence: { arabic: 'أَنَا مُتْعَبٌ الْيَوْمَ', transliteration: 'anā mutʿabun al-yawm', english: 'I am tired today', french: 'Je suis fatigué aujourd\'hui' } },
  { id: 'emo-6', themeId: 'emotions', arabic: 'فرح', arabicWithVowels: 'فَرَح', transliteration: 'faraḥ', english: 'Joy', french: 'Joie', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 6 },
  { id: 'emo-7', themeId: 'emotions', arabic: 'حب', arabicWithVowels: 'حُبّ', transliteration: 'ḥubb', english: 'Love', french: 'Amour', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 7 },
  { id: 'emo-8', themeId: 'emotions', arabic: 'خوف', arabicWithVowels: 'خَوْف', transliteration: 'khawf', english: 'Fear', french: 'Peur', partOfSpeech: 'noun', gender: 'masculine', level: 'intermediate', order: 8 },
  { id: 'emo-9', themeId: 'emotions', arabic: 'قلق', arabicWithVowels: 'قَلِق', transliteration: 'qaliq', english: 'Worried', french: 'Inquiet', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 9 },
  { id: 'emo-10', themeId: 'emotions', arabic: 'متحمس', arabicWithVowels: 'مُتَحَمِّس', transliteration: 'mutaḥammis', english: 'Excited', french: 'Enthousiaste', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 10 },
  { id: 'emo-11', themeId: 'emotions', arabic: 'وحيد', arabicWithVowels: 'وَحِيد', transliteration: 'waḥīd', english: 'Lonely', french: 'Seul', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 11 },
  { id: 'emo-12', themeId: 'emotions', arabic: 'فخور', arabicWithVowels: 'فَخُور', transliteration: 'fakhūr', english: 'Proud', french: 'Fier', partOfSpeech: 'adjective', gender: 'masculine', level: 'intermediate', order: 12 },
];

// ── Aggregates ──────────────────────────────────────────────────
export const additionalThemes: VocabularyTheme[] = [
  natureTheme,
  clothingTheme,
  professionsTheme,
  travelTheme,
  commonVerbsTheme,
  emotionsTheme,
];

export const additionalWords: VocabularyWord[] = [
  ...natureWords,
  ...clothingWords,
  ...professionsWords,
  ...travelWords,
  ...commonVerbsWords,
  ...emotionsWords,
];
