// Arabic Vocabulary API - Fetches translations from MyMemory API
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  speakArabic,
  stopArabic,
  isArabicSpeaking,
} from '../services/speech/arabicTTS';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const CACHE_KEY = 'arabic-vocabulary-cache';
const CACHE_VERSION = 12; // Increment to invalidate old cache - v12 adds French translations
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface ArabicVocabularyWord {
  id: string;
  english: string;
  french: string;
  arabic: string; // With vowels (tashkeel)
  arabicWithoutVowels: string; // Without vowels for display variation
  transliteration: string;
  fetchedAt: number;
}

interface CachedVocabulary {
  words: ArabicVocabularyWord[];
  lastUsedIndex: number;
  fetchedAt: number;
  version?: number;
}

// Play Arabic word audio using free Google TTS
export async function playArabicAudio(arabicText: string): Promise<void> {
  try {
    await speakArabic(arabicText, {
      onError: (e) => __DEV__ && console.error('Error playing Arabic audio:', e),
    });
  } catch (error) {
    __DEV__ && console.error('Error playing Arabic audio:', error);
  }
}

// Check if speech is currently playing
export async function isSpeaking(): Promise<boolean> {
  return isArabicSpeaking();
}

// Stop any playing speech
export async function stopAudio(): Promise<void> {
  stopArabic();
}

// Vocalized Arabic vocabulary with tashkeel (vowel marks)
// Using standard tanween forms for grammatically correct Arabic
const VOCALIZED_VOCABULARY: { english: string; french: string; arabic: string; transliteration: string }[] = [
  // Greetings & Basics
  { english: 'hello', french: 'bonjour', arabic: 'مَرْحَبًا', transliteration: 'marhaban' },
  { english: 'goodbye', french: 'au revoir', arabic: 'وَدَاعًا', transliteration: 'wadaa\'an' },
  { english: 'please', french: 's\'il vous plaît', arabic: 'مِنْ فَضْلِكَ', transliteration: 'min fadlika' },
  { english: 'thanks', french: 'merci', arabic: 'شُكْرًا', transliteration: 'shukran' },
  { english: 'yes', french: 'oui', arabic: 'نَعَمْ', transliteration: 'na\'am' },
  { english: 'no', french: 'non', arabic: 'لَا', transliteration: 'laa' },
  { english: 'welcome', french: 'bienvenue', arabic: 'أَهْلًا وَسَهْلًا', transliteration: 'ahlan wa sahlan' },
  { english: 'sorry', french: 'désolé', arabic: 'آسِفٌ', transliteration: 'aasifun' },
  { english: 'peace', french: 'paix', arabic: 'سَلَامٌ', transliteration: 'salaamun' },

  // Family
  { english: 'mother', french: 'mère', arabic: 'أُمٌّ', transliteration: 'ummun' },
  { english: 'father', french: 'père', arabic: 'أَبٌ', transliteration: 'abun' },
  { english: 'sister', french: 'sœur', arabic: 'أُخْتٌ', transliteration: 'ukhtun' },
  { english: 'brother', french: 'frère', arabic: 'أَخٌ', transliteration: 'akhun' },
  { english: 'son', french: 'fils', arabic: 'اِبْنٌ', transliteration: 'ibnun' },
  { english: 'daughter', french: 'fille', arabic: 'بِنْتٌ', transliteration: 'bintun' },
  { english: 'family', french: 'famille', arabic: 'عَائِلَةٌ', transliteration: 'aa\'ilatun' },
  { english: 'baby', french: 'bébé', arabic: 'طِفْلٌ', transliteration: 'tiflun' },
  { english: 'husband', french: 'mari', arabic: 'زَوْجٌ', transliteration: 'zawjun' },
  { english: 'wife', french: 'épouse', arabic: 'زَوْجَةٌ', transliteration: 'zawjatun' },

  // Numbers
  { english: 'one', french: 'un', arabic: 'وَاحِدٌ', transliteration: 'waahidun' },
  { english: 'two', french: 'deux', arabic: 'اِثْنَانِ', transliteration: 'ithnaani' },
  { english: 'three', french: 'trois', arabic: 'ثَلَاثَةٌ', transliteration: 'thalaathatun' },
  { english: 'four', french: 'quatre', arabic: 'أَرْبَعَةٌ', transliteration: 'arba\'atun' },
  { english: 'five', french: 'cinq', arabic: 'خَمْسَةٌ', transliteration: 'khamsatun' },
  { english: 'six', french: 'six', arabic: 'سِتَّةٌ', transliteration: 'sittatun' },
  { english: 'seven', french: 'sept', arabic: 'سَبْعَةٌ', transliteration: 'sab\'atun' },
  { english: 'eight', french: 'huit', arabic: 'ثَمَانِيَةٌ', transliteration: 'thamaaniyatun' },
  { english: 'nine', french: 'neuf', arabic: 'تِسْعَةٌ', transliteration: 'tis\'atun' },
  { english: 'ten', french: 'dix', arabic: 'عَشَرَةٌ', transliteration: '\'asharatun' },

  // Colors
  { english: 'red', french: 'rouge', arabic: 'أَحْمَرُ', transliteration: 'ahmaru' },
  { english: 'blue', french: 'bleu', arabic: 'أَزْرَقُ', transliteration: 'azraqu' },
  { english: 'green', french: 'vert', arabic: 'أَخْضَرُ', transliteration: 'akhdaru' },
  { english: 'yellow', french: 'jaune', arabic: 'أَصْفَرُ', transliteration: 'asfaru' },
  { english: 'white', french: 'blanc', arabic: 'أَبْيَضُ', transliteration: 'abyadu' },
  { english: 'black', french: 'noir', arabic: 'أَسْوَدُ', transliteration: 'aswadu' },

  // Food & Drink
  { english: 'water', french: 'eau', arabic: 'مَاءٌ', transliteration: 'maa\'un' },
  { english: 'bread', french: 'pain', arabic: 'خُبْزٌ', transliteration: 'khubzun' },
  { english: 'rice', french: 'riz', arabic: 'أَرُزٌّ', transliteration: 'aruzzun' },
  { english: 'meat', french: 'viande', arabic: 'لَحْمٌ', transliteration: 'lahmun' },
  { english: 'fish', french: 'poisson', arabic: 'سَمَكٌ', transliteration: 'samakun' },
  { english: 'milk', french: 'lait', arabic: 'حَلِيبٌ', transliteration: 'haleebun' },
  { english: 'fruit', french: 'fruit', arabic: 'فَاكِهَةٌ', transliteration: 'faakihatun' },
  { english: 'apple', french: 'pomme', arabic: 'تُفَّاحَةٌ', transliteration: 'tuffaahatun' },
  { english: 'food', french: 'nourriture', arabic: 'طَعَامٌ', transliteration: 'ta\'aamun' },
  { english: 'coffee', french: 'café', arabic: 'قَهْوَةٌ', transliteration: 'qahwatun' },
  { english: 'tea', french: 'thé', arabic: 'شَايٌ', transliteration: 'shaayun' },

  // Body
  { english: 'head', french: 'tête', arabic: 'رَأْسٌ', transliteration: 'ra\'sun' },
  { english: 'eye', french: 'œil', arabic: 'عَيْنٌ', transliteration: '\'aynun' },
  { english: 'nose', french: 'nez', arabic: 'أَنْفٌ', transliteration: 'anfun' },
  { english: 'mouth', french: 'bouche', arabic: 'فَمٌ', transliteration: 'famun' },
  { english: 'hand', french: 'main', arabic: 'يَدٌ', transliteration: 'yadun' },
  { english: 'heart', french: 'cœur', arabic: 'قَلْبٌ', transliteration: 'qalbun' },
  { english: 'ear', french: 'oreille', arabic: 'أُذُنٌ', transliteration: 'udhunun' },
  { english: 'face', french: 'visage', arabic: 'وَجْهٌ', transliteration: 'wajhun' },

  // Nature
  { english: 'sun', french: 'soleil', arabic: 'شَمْسٌ', transliteration: 'shamsun' },
  { english: 'moon', french: 'lune', arabic: 'قَمَرٌ', transliteration: 'qamarun' },
  { english: 'star', french: 'étoile', arabic: 'نَجْمٌ', transliteration: 'najmun' },
  { english: 'sky', french: 'ciel', arabic: 'سَمَاءٌ', transliteration: 'samaa\'un' },
  { english: 'tree', french: 'arbre', arabic: 'شَجَرَةٌ', transliteration: 'shajaratun' },
  { english: 'flower', french: 'fleur', arabic: 'زَهْرَةٌ', transliteration: 'zahratun' },
  { english: 'rain', french: 'pluie', arabic: 'مَطَرٌ', transliteration: 'matarun' },
  { english: 'sea', french: 'mer', arabic: 'بَحْرٌ', transliteration: 'bahrun' },
  { english: 'mountain', french: 'montagne', arabic: 'جَبَلٌ', transliteration: 'jabalun' },
  { english: 'river', french: 'rivière', arabic: 'نَهْرٌ', transliteration: 'nahrun' },

  // Animals
  { english: 'cat', french: 'chat', arabic: 'قِطَّةٌ', transliteration: 'qittatun' },
  { english: 'dog', french: 'chien', arabic: 'كَلْبٌ', transliteration: 'kalbun' },
  { english: 'bird', french: 'oiseau', arabic: 'طَائِرٌ', transliteration: 'taa\'irun' },
  { english: 'horse', french: 'cheval', arabic: 'حِصَانٌ', transliteration: 'hisaanun' },
  { english: 'lion', french: 'lion', arabic: 'أَسَدٌ', transliteration: 'asadun' },
  { english: 'elephant', french: 'éléphant', arabic: 'فِيلٌ', transliteration: 'feelun' },
  { english: 'camel', french: 'chameau', arabic: 'جَمَلٌ', transliteration: 'jamalun' },

  // Places
  { english: 'house', french: 'maison', arabic: 'بَيْتٌ', transliteration: 'baytun' },
  { english: 'school', french: 'école', arabic: 'مَدْرَسَةٌ', transliteration: 'madrasatun' },
  { english: 'market', french: 'marché', arabic: 'سُوقٌ', transliteration: 'suuqun' },
  { english: 'mosque', french: 'mosquée', arabic: 'مَسْجِدٌ', transliteration: 'masjidun' },
  { english: 'hospital', french: 'hôpital', arabic: 'مُسْتَشْفًى', transliteration: 'mustashfan' },
  { english: 'street', french: 'rue', arabic: 'شَارِعٌ', transliteration: 'shaari\'un' },
  { english: 'city', french: 'ville', arabic: 'مَدِينَةٌ', transliteration: 'madeenatun' },
  { english: 'country', french: 'pays', arabic: 'بَلَدٌ', transliteration: 'baladun' },
  { english: 'door', french: 'porte', arabic: 'بَابٌ', transliteration: 'baabun' },
  { english: 'window', french: 'fenêtre', arabic: 'نَافِذَةٌ', transliteration: 'naafidhatun' },

  // Time
  { english: 'day', french: 'jour', arabic: 'يَوْمٌ', transliteration: 'yawmun' },
  { english: 'night', french: 'nuit', arabic: 'لَيْلٌ', transliteration: 'laylun' },
  { english: 'morning', french: 'matin', arabic: 'صَبَاحٌ', transliteration: 'sabaahun' },
  { english: 'today', french: 'aujourd\'hui', arabic: 'اَلْيَوْمَ', transliteration: 'alyawma' },
  { english: 'tomorrow', french: 'demain', arabic: 'غَدًا', transliteration: 'ghadan' },
  { english: 'week', french: 'semaine', arabic: 'أُسْبُوعٌ', transliteration: 'usbuu\'un' },
  { english: 'month', french: 'mois', arabic: 'شَهْرٌ', transliteration: 'shahrun' },
  { english: 'year', french: 'année', arabic: 'سَنَةٌ', transliteration: 'sanatun' },

  // Common Objects
  { english: 'book', french: 'livre', arabic: 'كِتَابٌ', transliteration: 'kitaabun' },
  { english: 'pen', french: 'stylo', arabic: 'قَلَمٌ', transliteration: 'qalamun' },
  { english: 'car', french: 'voiture', arabic: 'سَيَّارَةٌ', transliteration: 'sayyaaratun' },
  { english: 'phone', french: 'téléphone', arabic: 'هَاتِفٌ', transliteration: 'haatifun' },
  { english: 'money', french: 'argent', arabic: 'مَالٌ', transliteration: 'maalun' },
  { english: 'key', french: 'clé', arabic: 'مِفْتَاحٌ', transliteration: 'miftaahun' },
  { english: 'table', french: 'table', arabic: 'طَاوِلَةٌ', transliteration: 'taawilatun' },
  { english: 'chair', french: 'chaise', arabic: 'كُرْسِيٌّ', transliteration: 'kursiyyun' },

  // Adjectives
  { english: 'big', french: 'grand', arabic: 'كَبِيرٌ', transliteration: 'kabeerun' },
  { english: 'small', french: 'petit', arabic: 'صَغِيرٌ', transliteration: 'sagheerun' },
  { english: 'good', french: 'bon', arabic: 'جَيِّدٌ', transliteration: 'jayyidun' },
  { english: 'bad', french: 'mauvais', arabic: 'سَيِّئٌ', transliteration: 'sayyi\'un' },
  { english: 'new', french: 'nouveau', arabic: 'جَدِيدٌ', transliteration: 'jadeedun' },
  { english: 'old', french: 'ancien', arabic: 'قَدِيمٌ', transliteration: 'qadeemun' },
  { english: 'beautiful', french: 'beau', arabic: 'جَمِيلٌ', transliteration: 'jameelun' },
  { english: 'happy', french: 'heureux', arabic: 'سَعِيدٌ', transliteration: 'sa\'eedun' },
  { english: 'sad', french: 'triste', arabic: 'حَزِينٌ', transliteration: 'hazeenun' },
  { english: 'hot', french: 'chaud', arabic: 'حَارٌّ', transliteration: 'haarrun' },
  { english: 'cold', french: 'froid', arabic: 'بَارِدٌ', transliteration: 'baaridun' },

  // Verbal Nouns (masdar)
  { english: 'eating', french: 'manger', arabic: 'أَكْلٌ', transliteration: 'aklun' },
  { english: 'drinking', french: 'boire', arabic: 'شُرْبٌ', transliteration: 'shurbun' },
  { english: 'sleeping', french: 'dormir', arabic: 'نَوْمٌ', transliteration: 'nawmun' },
  { english: 'studying', french: 'étudier', arabic: 'دِرَاسَةٌ', transliteration: 'diraasatun' },
  { english: 'writing', french: 'écrire', arabic: 'كِتَابَةٌ', transliteration: 'kitaabatun' },
  { english: 'walking', french: 'marcher', arabic: 'مَشْيٌ', transliteration: 'mashyun' },
  { english: 'running', french: 'courir', arabic: 'جَرْيٌ', transliteration: 'jaryun' },
  { english: 'working', french: 'travailler', arabic: 'عَمَلٌ', transliteration: '\'amalun' },
  { english: 'love', french: 'amour', arabic: 'حُبٌّ', transliteration: 'hubbun' },
  { english: 'knowledge', french: 'connaissance', arabic: 'مَعْرِفَةٌ', transliteration: 'ma\'rifatun' },

  // Islamic/Religious
  { english: 'worship', french: 'adoration', arabic: 'عِبَادَةٌ', transliteration: '\'ibaadatun' },
  { english: 'god', french: 'Dieu', arabic: 'اللهُ', transliteration: 'Allaahu' },
  { english: 'faith', french: 'foi', arabic: 'إِيمَانٌ', transliteration: 'eemaanun' },
  { english: 'blessing', french: 'bénédiction', arabic: 'بَرَكَةٌ', transliteration: 'barakatun' },
  { english: 'prophet', french: 'prophète', arabic: 'نَبِيٌّ', transliteration: 'nabiyyun' },
];

// Remove vowels from Arabic text for display variation
function removeVowels(arabic: string): string {
  // Arabic diacritics (tashkeel) Unicode range
  return arabic.replace(/[\u064B-\u0652\u0670]/g, '');
}

// Get random words from the vocabulary list
function getRandomWords(count: number, usedIndices: Set<number>): { words: typeof VOCALIZED_VOCABULARY; indices: number[] } {
  const available = VOCALIZED_VOCABULARY
    .map((word, index) => ({ word, index }))
    .filter(({ index }) => !usedIndices.has(index));

  // Shuffle available words
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return {
    words: selected.map((s) => s.word),
    indices: selected.map((s) => s.index),
  };
}

// Fetch vocabulary - now uses local vocalized data (API optional for expansion)
export async function fetchArabicVocabulary(count: number = 15): Promise<ArabicVocabularyWord[]> {
  const usedIndices = new Set<number>();
  const { words: selectedWords } = getRandomWords(count, usedIndices);

  return selectedWords.map((word) => ({
    id: `word-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    english: word.english,
    french: word.french,
    arabic: word.arabic, // With vowels
    arabicWithoutVowels: removeVowels(word.arabic),
    transliteration: word.transliteration,
    fetchedAt: Date.now(),
  }));
}

// Get vocabulary for quiz - uses cache
export async function getVocabularyForQuiz(count: number = 10): Promise<ArabicVocabularyWord[]> {
  try {
    // Check cache first
    const cached = await getCachedVocabulary();

    if (cached && cached.words.length >= count) {
      // Return words from cache
      const shuffled = [...cached.words].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // Fetch new vocabulary
    const newWords = await fetchArabicVocabulary(count + 10);

    // Merge with existing cache (remove duplicates)
    const allWords = cached ? [...cached.words] : [];
    for (const word of newWords) {
      if (!allWords.some((w) => w.english === word.english)) {
        allWords.push(word);
      }
    }

    // Save to cache
    await cacheVocabulary(allWords);

    // Return requested count
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    __DEV__ && console.error('Error getting vocabulary:', error);
    // Return directly from vocabulary list
    return fetchArabicVocabulary(count);
  }
}

// Cache management
async function getCachedVocabulary(): Promise<CachedVocabulary | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedVocabulary = JSON.parse(cached);
      // Check version and expiry
      if (data.version === CACHE_VERSION && Date.now() - data.fetchedAt < CACHE_EXPIRY) {
        return data;
      }
      // Clear old cache
      await AsyncStorage.removeItem(CACHE_KEY);
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function cacheVocabulary(words: ArabicVocabularyWord[]): Promise<void> {
  try {
    const data: CachedVocabulary = {
      words,
      lastUsedIndex: 0,
      fetchedAt: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    __DEV__ && console.error('Error caching vocabulary:', error);
  }
}

export async function clearVocabularyCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    __DEV__ && console.error('Error clearing vocabulary cache:', error);
  }
}
