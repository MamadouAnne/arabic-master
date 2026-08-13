// Exercises for the Arabic Writing course — Unit A. Bilingual EN/FR.
import { Exercise } from '../../../types/arabic';

const mc = (
  id: string, q: string, qFr: string,
  opts: { t: string; correct?: boolean }[], correct: string,
  hint: string, hintFr: string, explanation: string, explanationFr: string,
): Exercise => ({
  id, type: 'multiple_choice', moduleType: 'alphabet', level: 'beginner',
  question: q, questionFr: qFr,
  options: opts.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o.t, textFr: o.t, isCorrect: !!o.correct })),
  correctAnswer: correct, hint, hintFr, explanation, explanationFr, xpReward: 10,
});

export const writingExercises: Exercise[] = [
  // ── writing-1: foundations (system + forms + joining + non-connectors) ──
  mc('ex-writing-1-1', 'In which direction is Arabic written?', 'Dans quel sens l\'arabe s\'écrit-il ?',
    [{ t: 'Left to right' }, { t: 'Right to left', correct: true }, { t: 'Top to bottom' }, { t: 'Either way' }],
    'b', 'Opposite of French.', 'L\'inverse du français.',
    'Arabic is written right to left — the first letter is on the right.', 'L\'arabe s\'écrit de droite à gauche — la première lettre est à droite.'),
  mc('ex-writing-1-2', 'How many letters are in the Arabic alphabet?', 'Combien de lettres compte l\'alphabet arabe ?',
    [{ t: '26' }, { t: '28', correct: true }, { t: '29' }, { t: '30' }],
    'b', 'Two more than Latin.', 'Deux de plus que le latin.',
    'The Arabic alphabet has 28 letters, and no capitals.', 'L\'alphabet arabe compte 28 lettres, sans majuscules.'),
  mc('ex-writing-1-3', 'How many forms can a connecting letter have?', 'Combien de formes une lettre liante peut-elle avoir ?',
    [{ t: 'Two' }, { t: 'Three' }, { t: 'Four', correct: true }, { t: 'One' }],
    'c', 'Isolated, initial, medial, final.', 'Isolée, initiale, médiane, finale.',
    'A connecting letter has up to four forms: isolated, initial, medial, final.', 'Une lettre liante a jusqu\'à quatre formes : isolée, initiale, médiane, finale.'),
  mc('ex-writing-1-4', 'A letter joined on BOTH sides takes which form?', 'Une lettre liée des DEUX côtés prend quelle forme ?',
    [{ t: 'Initial' }, { t: 'Medial', correct: true }, { t: 'Final' }, { t: 'Isolated' }],
    'b', 'In the middle.', 'Au milieu.',
    'Joined on both sides = medial form.', 'Liée des deux côtés = forme médiane.'),
  mc('ex-writing-1-5', 'How many letters never join to the NEXT letter?', 'Combien de lettres ne se lient jamais à la lettre SUIVANTE ?',
    [{ t: 'Four' }, { t: 'Six', correct: true }, { t: 'Eight' }, { t: 'Two' }],
    'b', 'ا د ذ ر ز و.', 'ا د ذ ر ز و.',
    'Six letters (ا د ذ ر ز و) join on the right only.', 'Six lettres (ا د ذ ر ز و) se lient à droite seulement.'),
  mc('ex-writing-1-6', 'Which of these does NOT join to the next letter?', 'Laquelle NE se lie PAS à la lettre suivante ?',
    [{ t: 'ب' }, { t: 'ر', correct: true }, { t: 'س' }, { t: 'ك' }],
    'b', 'One of ا د ذ ر ز و.', 'L\'une de ا د ذ ر ز و.',
    'ر is a non-connector; the next letter starts fresh, leaving a gap.', 'ر est non liante ; la lettre suivante recommence, laissant un espace.'),

  // ── writing-3: dots & families ────────────────────────────────
  mc('ex-writing-3-1', 'How many dots does ث have, and where?', 'Combien de points a ث, et où ?',
    [{ t: '2 above' }, { t: '3 above', correct: true }, { t: '1 below' }, { t: '3 below' }],
    'b', 'One more than ت.', 'Un de plus que ت.',
    'ث (thā) has three dots above.', 'ث (thā) a trois points au-dessus.'),
  mc('ex-writing-3-2', 'Which letter has ONE dot BELOW?', 'Quelle lettre a UN point EN DESSOUS ?',
    [{ t: 'ب', correct: true }, { t: 'ت' }, { t: 'ن' }, { t: 'ث' }],
    'a', 'The tooth with a dot underneath.', 'La « dent » avec un point dessous.',
    'ب (bā) has one dot below.', 'ب (bā) a un point en dessous.'),
  mc('ex-writing-3-3', 'ت and ث differ by…', 'ت et ث diffèrent par…',
    [{ t: 'their shape' }, { t: 'the number of dots', correct: true }, { t: 'their direction' }, { t: 'their sound only' }],
    'b', 'Same skeleton.', 'Même squelette.',
    'They share the same skeleton; ت has 2 dots above, ث has 3.', 'Elles partagent le même squelette ; ت a 2 points au-dessus, ث en a 3.'),
  mc('ex-writing-3-4', 'How many dots does ح have?', 'Combien de points a ح ?',
    [{ t: 'None', correct: true }, { t: 'One above' }, { t: 'One below' }, { t: 'Two' }],
    'a', 'ج has one below, خ one above.', 'ج en a un dessous, خ un dessus.',
    'ح (ḥā) has no dots; ج has one below, خ one above.', 'ح (ḥā) n\'a aucun point ; ج en a un dessous, خ un dessus.'),
  mc('ex-writing-3-5', 'Which letter shares its skeleton with ص?', 'Quelle lettre partage son squelette avec ص ?',
    [{ t: 'ض', correct: true }, { t: 'س' }, { t: 'ط' }, { t: 'ع' }],
    'a', 'Add one dot above.', 'Ajoutez un point au-dessus.',
    'ص and ض share the same skeleton; ض has one dot above.', 'ص et ض partagent le même squelette ; ض a un point au-dessus.'),
  mc('ex-writing-3-6', 'You write the skeleton of ج but add a dot ABOVE instead of below. What did you write?', 'Vous écrivez le squelette de ج mais mettez un point AU-DESSUS au lieu de dessous. Qu\'avez-vous écrit ?',
    [{ t: 'خ (a different letter)', correct: true }, { t: 'still ج' }, { t: 'ح' }, { t: 'nothing valid' }],
    'a', 'Dot position changes the letter.', 'La position du point change la lettre.',
    'A dot above that skeleton makes خ, not ج — dot placement changes the letter entirely.', 'Un point au-dessus de ce squelette donne خ, et non ج — la position du point change entièrement la lettre.'),
];

export default writingExercises;
