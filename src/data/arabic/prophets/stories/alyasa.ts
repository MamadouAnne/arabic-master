// Story of Prophet Al-Yasa (اليسع) - The Successor
// Single continuous narrative with Quran sources

import { Prophet, SubStory, StoryContentBlock, QuranReference } from '../../../../types/prophetStories';

// Full prophet data with story details
export const alyasaStory: Prophet = {
  id: 'al-yasa',
  nameEnglish: "Al-Yasa'",
  nameFrench: "Al-Yasa'",
  nameArabic: 'اليسع',
  order: 20,
  title: 'The Successor',
  titleFr: 'Le Successeur',
  titleArabic: 'الخليفة',
  summary: "Prophet Al-Yasa' is mentioned twice in the Quran, both times in the company of other great prophets, and is praised as being among the chosen and the excellent. The commentators mention that he was sent to the Children of Israel after Prophet Ilyas and continued his call to the worship of Allah alone. The Quran gives no further details of his story, and no authentic hadith describes it. What the Quran establishes is enough: he was one of Allah's messengers, preferred over the worlds and counted among the best.",
  summaryFr: "Le Prophète Al-Yasa' est mentionné deux fois dans le Coran, les deux fois en compagnie d'autres grands prophètes, et il est loué comme faisant partie des élus et des meilleurs. Les commentateurs mentionnent qu'il fut envoyé aux Enfants d'Israël après le Prophète Ilyas et qu'il poursuivit son appel à l'adoration d'Allah seul. Le Coran ne donne pas d'autres détails sur son histoire, et aucun hadith authentique ne la décrit. Ce que le Coran établit suffit : il fut l'un des messagers d'Allah, préféré au-dessus des mondes et compté parmi les meilleurs.",
  hasSubStories: false,
  lessons: [
    'Continuing the work of righteous predecessors is honorable',
    'Every prophet, regardless of fame, carries immense responsibility',
    'Persistence in guidance even when facing opposition',
    'Being chosen by Allah is the highest honor',
    'Faith must be passed from generation to generation',
    'The prophetic mission is always the same: calling to Allah',
  ],
  lessonsFr: [
    'Poursuivre l\'œuvre des prédécesseurs vertueux est honorable',
    'Chaque prophète, quelle que soit sa renommée, porte une immense responsabilité',
    'La persévérance dans la guidance même face à l\'opposition',
    'Être choisi par Allah est le plus grand honneur',
    'La foi doit être transmise de génération en génération',
    'La mission prophétique est toujours la même : appeler à Allah',
  ],
  estimatedReadTime: 6,
  quranMentions: 2,
  icon: '🌟',
};

// Single continuous narrative
const alyasaStoryContent: StoryContentBlock[] = [
  {
    id: 'alyasa-1',
    type: 'narrative',
    order: 1,
    content: "Prophet Al-Yasa' was one of the messengers Allah sent to the Children of Israel. The commentators mention that he came after Prophet Ilyas and continued his call to the worship of Allah alone. Beyond this, the Quran and the authentic Sunnah give us no details of his life, and Muslim scholars have cautioned against filling that silence with stories taken from other scriptures.",
    contentFr: "Le Prophète Al-Yasa' fut l'un des messagers qu'Allah envoya aux Enfants d'Israël. Les commentateurs mentionnent qu'il vint après le Prophète Ilyas et poursuivit son appel à l'adoration d'Allah seul. Au-delà de cela, le Coran et la Sunna authentique ne nous donnent aucun détail sur sa vie, et les savants musulmans ont mis en garde contre le fait de combler ce silence avec des récits tirés d'autres écritures.",
  },
  {
    id: 'alyasa-2',
    type: 'narrative',
    order: 2,
    content: "The Quran mentions Al-Yasa' twice, both times in the company of other great prophets. While detailed stories about him are not narrated in the Quran, his inclusion among Allah's messengers confirms his status and importance. The very act of being named in the Quran is an eternal honor.",
    contentFr: "Le Coran mentionne Al-Yasa' deux fois, les deux fois en compagnie d'autres grands prophètes. Bien que des récits détaillés à son sujet ne soient pas narrés dans le Coran, son inclusion parmi les messagers d'Allah confirme son statut et son importance. Le simple fait d'être nommé dans le Coran est un honneur éternel.",
  },
  {
    id: 'alyasa-3',
    type: 'quran_source',
    order: 3,
    content: "Allah mentions Al-Yasa' among the favored prophets.",
    contentFr: "Allah mentionne Al-Yasa' parmi les prophètes favorisés.",
    source: {
      type: 'quran',
      surahNumber: 6,
      surahNameEnglish: "Al-An'am",
      surahNameArabic: 'الأنعام',
      ayahStart: 86,
      ayahEnd: 86,
      arabicText: 'وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا ۚ وَكُلًّا فَضَّلْنَا عَلَى الْعَالَمِينَ',
      translation: 'And Ismail and Al-Yasa\' and Yunus and Lut - and all [of them] We preferred over the worlds.',
      translationFr: 'Et Ismaïl, Al-Yasa\', Younous et Lout : à chacun Nous avons donné la préférence sur les mondes.',
    } as QuranReference,
  },
  {
    id: 'alyasa-4',
    type: 'narrative',
    order: 4,
    content: "In this verse, Al-Yasa' is mentioned alongside Ismail, Yunus, and Lut - prophets whose stories are told in greater detail in the Quran. All of them, Allah declares, were 'preferred over the worlds' (faddalna 'ala al-'alamin). This phrase indicates their exalted status - each prophet was favored above all other people of their time and given a rank that ordinary humans could never attain.",
    contentFr: "Dans ce verset, Al-Yasa' est mentionné aux côtés d'Ismaïl, Younous et Lout — des prophètes dont les histoires sont racontées plus en détail dans le Coran. Tous, déclare Allah, furent « préférés au-dessus des mondes » (faddalna 'ala al-'alamin). Cette expression indique leur statut exalté — chaque prophète fut favorisé au-dessus de tous les autres gens de son époque et reçut un rang que les humains ordinaires ne pourraient jamais atteindre.",
  },
  {
    id: 'alyasa-5',
    type: 'quran_source',
    order: 5,
    content: "Allah mentions Al-Yasa' among the outstanding.",
    contentFr: "Allah mentionne Al-Yasa' parmi les remarquables.",
    source: {
      type: 'quran',
      surahNumber: 38,
      surahNameEnglish: 'Sad',
      surahNameArabic: 'ص',
      ayahStart: 48,
      ayahEnd: 48,
      arabicText: 'وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ',
      translation: 'And remember Ismail and Al-Yasa\' and Dhul-Kifl, and all are among the outstanding.',
      translationFr: 'Et rappelle-toi Ismaïl, Al-Yasa\' et Dhoul-Kifl : tous font partie des meilleurs.',
    } as QuranReference,
  },
  {
    id: 'alyasa-6',
    type: 'narrative',
    order: 6,
    content: "Here, Al-Yasa' is listed with Ismail and Dhul-Kifl, and all three are described as 'min al-akhyar' - among the best, the outstanding, the excellent. The Quran commands us to remember these prophets, keeping their examples alive. Though their stories may be brief in the Quran, their rank with Allah is immense.",
    contentFr: "Ici, Al-Yasa' est cité avec Ismaïl et Dhoul-Kifl, et tous trois sont décrits comme « min al-akhyar » — parmi les meilleurs, les remarquables, les excellents. Le Coran nous ordonne de nous souvenir de ces prophètes, gardant leurs exemples vivants. Bien que leurs histoires soient brèves dans le Coran, leur rang auprès d'Allah est immense.",
  },
  {
    id: 'alyasa-7',
    type: 'narrative',
    order: 7,
    content: "We do not know the details of the opposition he faced or the signs he was given. What we know is the nature of his mission, for it was the mission of every messenger: to call people to worship Allah alone, to establish justice, and to warn of the Day of Judgement. Whatever trials he met, Allah tells us the outcome - he was among those Allah preferred over the worlds.",
    contentFr: "Nous ne connaissons pas les détails de l'opposition qu'il rencontra ni des signes qui lui furent donnés. Ce que nous savons, c'est la nature de sa mission, car c'était la mission de tout messager : appeler les gens à adorer Allah seul, établir la justice et avertir du Jour du Jugement. Quelles que soient les épreuves qu'il rencontra, Allah nous en dit l'issue : il fut de ceux qu'Allah a préférés au-dessus des mondes.",
  },
  {
    id: 'alyasa-8',
    type: 'narrative',
    order: 8,
    content: "Being 'preferred over the worlds' (6:86) is no small thing. It means that Allah chose him, purified him, and raised him above the people of his time. Prophets are not made by fame or by the number of stories told about them; they are made by Allah's choice.",
    contentFr: "Être « préféré au-dessus des mondes » (6:86) n'est pas une petite chose. Cela signifie qu'Allah l'a choisi, l'a purifié et l'a élevé au-dessus des gens de son époque. Les prophètes ne sont pas faits par la renommée ni par le nombre d'histoires racontées à leur sujet ; ils sont faits par le choix d'Allah.",
  },
  {
    id: 'alyasa-9',
    type: 'narrative',
    order: 9,
    content: "Being 'among the excellent' (38:48) tells us about his character. The word akhyar describes those whose goodness is complete: sincere in worship, truthful in speech, and upright in dealings. Allah commands His Prophet ﷺ - and us - to remember him.",
    contentFr: "Être « parmi les meilleurs » (38:48) nous renseigne sur son caractère. Le mot akhyar désigne ceux dont la bonté est complète : sincères dans l'adoration, véridiques dans la parole et droits dans les transactions. Allah ordonne à Son Prophète ﷺ, et à nous, de nous souvenir de lui.",
  },
  {
    id: 'alyasa-12',
    type: 'narrative',
    order: 10,
    content: "The commentators' mention of Al-Yasa' following Ilyas illustrates an important principle: the prophetic mission continues from generation to generation. When one messenger passes, another rises to carry the message forward. The content of the message - worship Allah alone - remains unchanged, even as the messenger changes.",
    contentFr: "La mention par les commentateurs d'Al-Yasa' succédant à Ilyas illustre un principe important : la mission prophétique se poursuit de génération en génération. Quand un messager s'en va, un autre se lève pour porter le message. Le contenu du message, adorer Allah seul, reste inchangé, même si le messager change.",
  },
  {
    id: 'alyasa-14',
    type: 'narrative',
    order: 11,
    content: "The fact that Al-Yasa' is mentioned in the Quran, despite limited details about his story, teaches us something important: not all prophets are meant to be equally famous. Some are mentioned extensively, like Musa; others briefly, like Al-Yasa'. But all are honored by Allah. Fame in this world is not the measure of worth with the Creator.",
    contentFr: "Le fait qu'Al-Yasa' soit mentionné dans le Coran, malgré les détails limités sur son histoire, nous enseigne quelque chose d'important : tous les prophètes ne sont pas destinés à être également célèbres. Certains sont mentionnés abondamment, comme Moussa ; d'autres brièvement, comme Al-Yasa'. Mais tous sont honorés par Allah. La renommée dans ce monde n'est pas la mesure de la valeur auprès du Créateur.",
  },
  {
    id: 'alyasa-15',
    type: 'narrative',
    order: 12,
    content: "For believers today, Al-Yasa's example teaches the importance of carrying on the work of those who came before us. Just as he continued Ilyas's mission, we are called to continue the work of the Prophet Muhammad ﷺ - calling people to Allah, establishing prayer, enjoining good, and forbidding evil. The specific person matters less than the continuity of the message.",
    contentFr: "Pour les croyants d'aujourd'hui, l'exemple d'Al-Yasa' enseigne l'importance de poursuivre l'œuvre de ceux qui nous ont précédés. Tout comme il poursuivit la mission d'Ilyas, nous sommes appelés à continuer l'œuvre du Prophète Muhammad ﷺ — appeler les gens à Allah, établir la prière, ordonner le bien et interdire le mal. La personne spécifique compte moins que la continuité du message.",
  },
  {
    id: 'alyasa-16',
    type: 'narrative',
    order: 13,
    content: "Prophet Al-Yasa', who carried the call of Allah after Ilyas, stands as an example for all who inherit responsibility from those before them. When we read his name in the Quran, we send peace upon him and remember that he too was among Allah's chosen servants, preferred above the worlds, counted among the excellent. What greater honour could there be?",
    contentFr: "Le Prophète Al-Yasa', qui porta l'appel d'Allah après Ilyas, est un exemple pour tous ceux qui héritent d'une responsabilité de ceux qui les ont précédés. Quand nous lisons son nom dans le Coran, nous lui envoyons la paix et nous rappelons qu'il faisait lui aussi partie des serviteurs élus d'Allah, préféré au-dessus des mondes, compté parmi les meilleurs. Quel plus grand honneur pourrait-il y avoir ?",
  },
];

// Export as single continuous story
export const alyasaSubStories: SubStory[] = [
  {
    id: 'alyasa-complete',
    prophetId: 'al-yasa',
    title: "The Story of Prophet Al-Yasa'",
    titleArabic: 'قصة نبي الله اليسع',
    order: 14,
    estimatedReadTime: 6,
    content: alyasaStoryContent,
  },
];
