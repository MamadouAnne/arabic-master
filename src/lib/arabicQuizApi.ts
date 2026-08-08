// Arabic Quiz Generator API - Uses dynamic vocabulary from translation APIs
import { DEFAULT_QUIZ_CONFIG } from '../types/arabicQuiz';
import {
  ArabicVocabularyWord,
  getVocabularyForQuiz,
  fetchArabicVocabulary,
} from './arabicVocabularyApi';

export type QuizDirection = 'arabicToEnglish' | 'englishToArabic';

export interface QuizQuestion {
  id: string;
  direction: QuizDirection;
  word: ArabicVocabularyWord;
  question: string;
  questionArabic?: string;
  options: string[];
  /** Option labels in English and French, same order/correctIndex, so the UI can
   *  localize choices live instead of baking one language at generation time.
   *  For englishToArabic questions both arrays hold the (language-neutral) Arabic. */
  optionsEn: string[];
  optionsFr: string[];
  correctIndex: number;
  explanation: DetailedExplanation;
}

export interface DetailedExplanation {
  summary: string;
  arabic: string;
  transliteration: string;
  english: string;
  french: string;
  pronunciationTip?: string;
  pronunciationTipFr?: string;
  memoryTip?: string;
  memoryTipFr?: string;
}

export interface GenerateQuizResult {
  questions: QuizQuestion[];
  wordsUsed: ArabicVocabularyWord[];
}

// Generate a multiple choice question with detailed explanation
function generateMultipleChoiceQuestion(
  word: ArabicVocabularyWord,
  allWords: ArabicVocabularyWord[],
  direction: QuizDirection,
  index: number,
  language: string = 'en'
): QuizQuestion {
  const isFr = language === 'fr';
  const localWord = isFr ? word.french : word.english;

  // Get 3 random wrong answers (distractors)
  const distractors = allWords
    .filter((w) => w.id !== word.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  let question: string;
  let questionArabic: string | undefined;
  let options: string[];
  let optionsEn: string[];
  let optionsFr: string[];
  let correctIndex: number;

  if (direction === 'arabicToEnglish') {
    // Show Arabic word, ask for meaning in user's language
    question = isFr
      ? 'Que signifie ce mot arabe ?'
      : 'What does this Arabic word mean?';
    questionArabic = word.arabic;

    // Keep both languages so the UI can localize choices live.
    correctIndex = Math.floor(Math.random() * 4);
    optionsEn = distractors.map((w) => w.english);
    optionsFr = distractors.map((w) => w.french);
    optionsEn.splice(correctIndex, 0, word.english);
    optionsFr.splice(correctIndex, 0, word.french);
    options = isFr ? optionsFr : optionsEn;
  } else {
    // Show word in user's language, ask for Arabic translation
    question = isFr
      ? `Comment dit-on « ${localWord} » en arabe ?`
      : `How do you say "${localWord}" in Arabic?`;

    // Options are Arabic words (language-neutral)
    const wrongOptions = distractors.map((w) => w.arabic);
    correctIndex = Math.floor(Math.random() * 4);
    options = [...wrongOptions];
    options.splice(correctIndex, 0, word.arabic);
    optionsEn = options;
    optionsFr = options;
  }

  // Create detailed explanation
  const explanation = createDetailedExplanation(word, direction);

  return {
    id: `quiz-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    direction,
    word,
    question,
    questionArabic,
    options,
    optionsEn,
    optionsFr,
    correctIndex,
    explanation,
  };
}

// Create a detailed, educational explanation for each word
function createDetailedExplanation(
  word: ArabicVocabularyWord,
  direction: QuizDirection
): DetailedExplanation {
  const explanation: DetailedExplanation = {
    summary: `"${word.english}" in Arabic is "${word.arabic}"`,
    arabic: word.arabic,
    transliteration: word.transliteration,
    english: word.english,
    french: word.french,
  };

  // Add pronunciation tips (EN + FR)
  explanation.pronunciationTip = generatePronunciationTip(word.transliteration, word.arabic, 'en');
  explanation.pronunciationTipFr = generatePronunciationTip(word.transliteration, word.arabic, 'fr');

  // Add memory tips (EN + FR)
  explanation.memoryTip = generateMemoryTip(word.english, word.transliteration, 'en');
  explanation.memoryTipFr = generateMemoryTip(word.french, word.transliteration, 'fr');

  return explanation;
}

// Generate helpful pronunciation tips
function generatePronunciationTip(transliteration: string, arabic: string, lang: string = 'en'): string {
  const isFr = lang === 'fr';
  const tips: string[] = [];

  if (transliteration.includes("'") || transliteration.includes('ع')) {
    tips.push(isFr
      ? "Le son ' (ع) est un son guttural profond propre à l'arabe"
      : "The ' sound (ع) is a deep throat sound unique to Arabic");
  }
  if (transliteration.includes('kh')) {
    tips.push(isFr
      ? "'kh' se prononce comme la jota espagnole ou le 'ch' allemand"
      : "'kh' is pronounced like the 'ch' in Scottish 'loch'");
  }
  if (transliteration.includes('gh')) {
    tips.push(isFr
      ? "'gh' est un son guttural, comme un gargarisme"
      : "'gh' is a guttural sound, like gargling");
  }
  if (transliteration.includes('q')) {
    tips.push(isFr
      ? "'q' se prononce au fond de la gorge, différent du 'k'"
      : "'q' is pronounced deep in the throat, different from 'k'");
  }
  if (transliteration.includes('aa') || transliteration.includes('ee') || transliteration.includes('oo')) {
    tips.push(isFr
      ? 'Les voyelles doublées indiquent un son plus long'
      : 'Double vowels indicate a longer sound');
  }

  if (arabic.includes('ال')) {
    tips.push(isFr
      ? "'ال' (al-) est l'article défini arabe, comme « le/la » en français"
      : "'ال' (al-) is the Arabic definite article, like 'the' in English");
  }

  if (tips.length === 0) {
    return isFr
      ? `Prononcez : « ${transliteration} »`
      : `Pronounce it as: "${transliteration}"`;
  }

  return isFr
    ? `Prononcez : « ${transliteration} ». ${tips[0]}`
    : `Pronounce it as: "${transliteration}". ${tips[0]}`;
}

// Generate memory tips to help remember words
function generateMemoryTip(localWord: string, transliteration: string, lang: string = 'en'): string {
  const isFr = lang === 'fr';

  const memoryTips = isFr
    ? [
        `Associez « ${transliteration} » au sens « ${localWord} »`,
        `Répétez « ${transliteration} » trois fois en pensant à « ${localWord} »`,
        `Imaginez quelque chose lié à « ${localWord} » en disant « ${transliteration} »`,
        `Le mot arabe se prononce « ${transliteration} » — reliez-le à « ${localWord} »`,
      ]
    : [
        `Try to associate "${transliteration}" with the meaning "${localWord}"`,
        `Repeat "${transliteration}" three times while thinking of "${localWord}"`,
        `Picture something related to "${localWord}" while saying "${transliteration}"`,
        `The Arabic word sounds like "${transliteration}" - connect it to "${localWord}"`,
      ];

  // Check for sound similarities
  if (transliteration.toLowerCase().includes(localWord.substring(0, 2).toLowerCase())) {
    return isFr
      ? `Remarquez que « ${transliteration} » commence comme « ${localWord} » — utilisez cela pour retenir !`
      : `Notice how "${transliteration}" starts similarly to "${localWord}" - use this to remember!`;
  }

  return memoryTips[Math.floor(Math.random() * memoryTips.length)];
}

// Generate a quiz with dynamically fetched vocabulary
export async function generateArabicQuiz(
  questionCount: number = DEFAULT_QUIZ_CONFIG.questionCount,
  mixDirections: boolean = true,
  language: string = 'en'
): Promise<GenerateQuizResult> {
  // Fetch vocabulary from APIs (with caching)
  const vocabulary = await getVocabularyForQuiz(questionCount + 5);

  if (vocabulary.length < 4) {
    throw new Error(
      language === 'fr'
        ? 'Pas assez de mots disponibles. Veuillez réessayer.'
        : 'Not enough vocabulary words available. Please try again.'
    );
  }

  // Select words for the quiz
  const selectedWords = vocabulary.slice(0, Math.min(questionCount, vocabulary.length));

  // Generate questions
  const questions: QuizQuestion[] = selectedWords.map((word, index) => {
    // Determine direction - mix or consistent
    let direction: QuizDirection;
    if (mixDirections) {
      direction = Math.random() > 0.5 ? 'arabicToEnglish' : 'englishToArabic';
    } else {
      direction = 'arabicToEnglish';
    }

    return generateMultipleChoiceQuestion(word, vocabulary, direction, index, language);
  });

  return {
    questions,
    wordsUsed: selectedWords,
  };
}

// Fetch fresh vocabulary (bypassing cache) - use when user passes quiz
export async function fetchFreshVocabulary(count: number = 15): Promise<ArabicVocabularyWord[]> {
  return fetchArabicVocabulary(count);
}

// Calculate quiz score
export function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number,
  maxStreak: number
): { score: number; xpEarned: number; passed: boolean } {
  const baseXP = correctAnswers * DEFAULT_QUIZ_CONFIG.xpPerCorrect;
  const streakBonus = maxStreak >= 3 ? (maxStreak - 2) * DEFAULT_QUIZ_CONFIG.streakBonus : 0;
  const xpEarned = baseXP + streakBonus;

  const accuracy = (correctAnswers / totalQuestions) * 100;
  const passed = accuracy >= DEFAULT_QUIZ_CONFIG.passingScore;

  return {
    score: Math.round(accuracy),
    xpEarned,
    passed,
  };
}
