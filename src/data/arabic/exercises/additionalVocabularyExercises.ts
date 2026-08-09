// Quiz exercises for the added vocabulary themes (nature, clothing,
// professions, travel, common verbs, emotions). Bilingual EN/FR.
// IDs use the prefixes wired into themePrefixMap in ./index.ts.

import { Exercise } from '../../../types/arabic';

const mc = (
  id: string,
  q: string, qFr: string,
  opts: { t: string; ar?: string; correct?: boolean }[],
  correct: string,
  hint: string, hintFr: string,
  explanation: string, explanationFr: string,
): Exercise => ({
  id,
  type: 'multiple_choice',
  moduleType: 'vocabulary',
  level: 'beginner',
  question: q,
  questionFr: qFr,
  options: opts.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o.t, textFr: o.t, textArabic: o.ar, isCorrect: !!o.correct })),
  correctAnswer: correct,
  hint,
  hintFr,
  explanation,
  explanationFr,
  xpReward: 10,
});

export const additionalVocabularyExercises: Exercise[] = [
  // ── nature ────────────────────────────────────────────────────
  mc('ex-vocab-nature-1', 'How do you say "Sun" in Arabic?', 'Comment dit-on « Soleil » en arabe ?',
    [{ t: 'شَمْس', correct: true }, { t: 'قَمَر' }, { t: 'نَجْم' }, { t: 'سَمَاء' }],
    'a', '"Shams".', '« Shams ».', 'شَمْس (shams) = "Sun".', 'شَمْس (shams) = « Soleil ».'),
  mc('ex-vocab-nature-2', 'What does "قَمَر" mean?', 'Que signifie « قَمَر » ?',
    [{ t: 'Sun' }, { t: 'Moon', correct: true }, { t: 'Star' }, { t: 'Cloud' }],
    'b', 'You see it at night.', 'On le voit la nuit.', 'قَمَر (qamar) = "Moon".', 'قَمَر (qamar) = « Lune ».'),
  mc('ex-vocab-nature-3', 'How do you say "Tree"?', 'Comment dit-on « Arbre » ?',
    [{ t: 'زَهْرَة' }, { t: 'جَبَل' }, { t: 'شَجَرَة', correct: true }, { t: 'نَهْر' }],
    'c', '"Shajara".', '« Shajara ».', 'شَجَرَة (shajara) = "Tree".', 'شَجَرَة (shajara) = « Arbre ».'),
  mc('ex-vocab-nature-4', 'What does "مَطَر" mean?', 'Que signifie « مَطَر » ?',
    [{ t: 'Wind' }, { t: 'Sea' }, { t: 'Rain', correct: true }, { t: 'Mountain' }],
    'c', 'It falls from the sky.', 'Elle tombe du ciel.', 'مَطَر (maṭar) = "Rain".', 'مَطَر (maṭar) = « Pluie ».'),

  // ── clothing ──────────────────────────────────────────────────
  mc('ex-vocab-cloth-1', 'How do you say "Shirt"?', 'Comment dit-on « Chemise » ?',
    [{ t: 'قَمِيص', correct: true }, { t: 'حِذَاء' }, { t: 'مِعْطَف' }, { t: 'جَوْرَب' }],
    'a', '"Qamīṣ".', '« Qamīṣ ».', 'قَمِيص (qamīṣ) = "Shirt".', 'قَمِيص (qamīṣ) = « Chemise ».'),
  mc('ex-vocab-cloth-2', 'What does "حِذَاء" mean?', 'Que signifie « حِذَاء » ?',
    [{ t: 'Hat' }, { t: 'Shoe', correct: true }, { t: 'Coat' }, { t: 'Sock' }],
    'b', 'You wear it on your foot.', 'On le porte au pied.', 'حِذَاء (ḥidhāʾ) = "Shoe".', 'حِذَاء (ḥidhāʾ) = « Chaussure ».'),
  mc('ex-vocab-cloth-3', 'How do you say "Coat"?', 'Comment dit-on « Manteau » ?',
    [{ t: 'قُبَّعَة' }, { t: 'فُسْتَان' }, { t: 'مِعْطَف', correct: true }, { t: 'ثَوْب' }],
    'c', '"Miʿṭaf".', '« Miʿṭaf ».', 'مِعْطَف (miʿṭaf) = "Coat".', 'مِعْطَف (miʿṭaf) = « Manteau ».'),
  mc('ex-vocab-cloth-4', 'What does "مَلَابِس" mean?', 'Que signifie « مَلَابِس » ?',
    [{ t: 'Clothes', correct: true }, { t: 'Glasses' }, { t: 'Watch' }, { t: 'Dress' }],
    'a', 'The general word.', 'Le mot général.', 'مَلَابِس (malābis) = "Clothes".', 'مَلَابِس (malābis) = « Vêtements ».'),

  // ── professions ───────────────────────────────────────────────
  mc('ex-vocab-prof-1', 'How do you say "Doctor"?', 'Comment dit-on « Médecin » ?',
    [{ t: 'طَبِيب', correct: true }, { t: 'مُهَنْدِس' }, { t: 'تَاجِر' }, { t: 'سَائِق' }],
    'a', '"Ṭabīb".', '« Ṭabīb ».', 'طَبِيب (ṭabīb) = "Doctor".', 'طَبِيب (ṭabīb) = « Médecin ».'),
  mc('ex-vocab-prof-2', 'What does "مُهَنْدِس" mean?', 'Que signifie « مُهَنْدِس » ?',
    [{ t: 'Teacher' }, { t: 'Engineer', correct: true }, { t: 'Farmer' }, { t: 'Cook' }],
    'b', 'They design and build.', 'Il conçoit et construit.', 'مُهَنْدِس (muhandis) = "Engineer".', 'مُهَنْدِس (muhandis) = « Ingénieur ».'),
  mc('ex-vocab-prof-3', 'How do you say "Teacher"?', 'Comment dit-on « Enseignant » ?',
    [{ t: 'طَالِب' }, { t: 'مُعَلِّم', correct: true }, { t: 'كَاتِب' }, { t: 'طَبَّاخ' }],
    'b', '"Muʿallim".', '« Muʿallim ».', 'مُعَلِّم (muʿallim) = "Teacher".', 'مُعَلِّم (muʿallim) = « Enseignant ».'),
  mc('ex-vocab-prof-4', 'What does "مُمَرِّض" mean?', 'Que signifie « مُمَرِّض » ?',
    [{ t: 'Merchant' }, { t: 'Lawyer' }, { t: 'Nurse', correct: true }, { t: 'Driver' }],
    'c', 'They help patients.', 'Il aide les malades.', 'مُمَرِّض (mumarriḍ) = "Nurse".', 'مُمَرِّض (mumarriḍ) = « Infirmier ».'),

  // ── travel ────────────────────────────────────────────────────
  mc('ex-vocab-travel-1', 'How do you say "Car"?', 'Comment dit-on « Voiture » ?',
    [{ t: 'سَيَّارَة', correct: true }, { t: 'طَائِرَة' }, { t: 'قِطَار' }, { t: 'سَفِينَة' }],
    'a', '"Sayyāra".', '« Sayyāra ».', 'سَيَّارَة (sayyāra) = "Car".', 'سَيَّارَة (sayyāra) = « Voiture ».'),
  mc('ex-vocab-travel-2', 'What does "طَائِرَة" mean?', 'Que signifie « طَائِرَة » ?',
    [{ t: 'Train' }, { t: 'Airplane', correct: true }, { t: 'Ship' }, { t: 'Bus' }],
    'b', 'It flies.', 'Elle vole.', 'طَائِرَة (ṭāʾira) = "Airplane".', 'طَائِرَة (ṭāʾira) = « Avion ».'),
  mc('ex-vocab-travel-3', 'How do you say "Airport"?', 'Comment dit-on « Aéroport » ?',
    [{ t: 'مَحَطَّة' }, { t: 'فُنْدُق' }, { t: 'مَطَار', correct: true }, { t: 'تَذْكِرَة' }],
    'c', '"Maṭār".', '« Maṭār ».', 'مَطَار (maṭār) = "Airport".', 'مَطَار (maṭār) = « Aéroport ».'),
  mc('ex-vocab-travel-4', 'What does "تَذْكِرَة" mean?', 'Que signifie « تَذْكِرَة » ?',
    [{ t: 'Passport' }, { t: 'Bag' }, { t: 'Hotel' }, { t: 'Ticket', correct: true }],
    'd', 'You buy it to travel.', 'On l\'achète pour voyager.', 'تَذْكِرَة (tadhkira) = "Ticket".', 'تَذْكِرَة (tadhkira) = « Billet ».'),

  // ── common verbs ──────────────────────────────────────────────
  mc('ex-vocab-cverb-1', 'What does "ذَهَبَ" mean?', 'Que signifie « ذَهَبَ » ?',
    [{ t: 'to go', correct: true }, { t: 'to eat' }, { t: 'to sleep' }, { t: 'to read' }],
    'a', '"Dhahaba".', '« Dhahaba ».', 'ذَهَبَ (dhahaba) = "to go".', 'ذَهَبَ (dhahaba) = « aller ».'),
  mc('ex-vocab-cverb-2', 'How do you say "to write"?', 'Comment dit-on « écrire » ?',
    [{ t: 'قَرَأَ' }, { t: 'كَتَبَ', correct: true }, { t: 'سَمِعَ' }, { t: 'جَلَسَ' }],
    'b', '"Kataba".', '« Kataba ».', 'كَتَبَ (kataba) = "to write".', 'كَتَبَ (kataba) = « écrire ».'),
  mc('ex-vocab-cverb-3', 'What does "شَرِبَ" mean?', 'Que signifie « شَرِبَ » ?',
    [{ t: 'to eat' }, { t: 'to open' }, { t: 'to drink', correct: true }, { t: 'to see' }],
    'c', 'Think of water.', 'Pensez à l\'eau.', 'شَرِبَ (shariba) = "to drink".', 'شَرِبَ (shariba) = « boire ».'),
  mc('ex-vocab-cverb-4', 'How do you say "to see"?', 'Comment dit-on « voir » ?',
    [{ t: 'رَأَى', correct: true }, { t: 'نَامَ' }, { t: 'عَمِلَ' }, { t: 'تَكَلَّمَ' }],
    'a', '"Raʾā".', '« Raʾā ».', 'رَأَى (raʾā) = "to see".', 'رَأَى (raʾā) = « voir ».'),

  // ── emotions ──────────────────────────────────────────────────
  mc('ex-vocab-emo-1', 'How do you say "Happy"?', 'Comment dit-on « Heureux » ?',
    [{ t: 'سَعِيد', correct: true }, { t: 'حَزِين' }, { t: 'غَاضِب' }, { t: 'خَائِف' }],
    'a', '"Saʿīd".', '« Saʿīd ».', 'سَعِيد (saʿīd) = "Happy".', 'سَعِيد (saʿīd) = « Heureux ».'),
  mc('ex-vocab-emo-2', 'What does "حَزِين" mean?', 'Que signifie « حَزِين » ?',
    [{ t: 'Happy' }, { t: 'Sad', correct: true }, { t: 'Angry' }, { t: 'Tired' }],
    'b', 'The opposite of happy.', 'Le contraire d\'heureux.', 'حَزِين (ḥazīn) = "Sad".', 'حَزِين (ḥazīn) = « Triste ».'),
  mc('ex-vocab-emo-3', 'How do you say "Tired"?', 'Comment dit-on « Fatigué » ?',
    [{ t: 'قَلِق' }, { t: 'فَخُور' }, { t: 'مُتْعَب', correct: true }, { t: 'وَحِيد' }],
    'c', '"Mutʿab".', '« Mutʿab ».', 'مُتْعَب (mutʿab) = "Tired".', 'مُتْعَب (mutʿab) = « Fatigué ».'),
  mc('ex-vocab-emo-4', 'What does "حُبّ" mean?', 'Que signifie « حُبّ » ?',
    [{ t: 'Fear' }, { t: 'Joy' }, { t: 'Love', correct: true }, { t: 'Pride' }],
    'c', 'The strongest positive feeling.', 'Le sentiment positif le plus fort.', 'حُبّ (ḥubb) = "Love".', 'حُبّ (ḥubb) = « Amour ».'),
];

export default additionalVocabularyExercises;
