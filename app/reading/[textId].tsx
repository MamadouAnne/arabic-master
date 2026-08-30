import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import SpeechSpeedControl from '../../src/components/SpeechSpeedControl';
import { ShareToGroupModal } from '../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../src/data/community/socialData';
import { font, color as tk, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

// Reading content
const readingContent: Record<string, {
  title: string;
  titleFr?: string;
  titleArabic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string;
  paragraphs: { arabic: string; english: string; french?: string }[];
}> = {
  'intro-1': {
    title: 'Introducing Yourself',
    titleFr: 'Se presenter',
    titleArabic: 'التَّعْرِيفُ بِالنَّفْس',
    level: 'beginner',
    icon: '👋',
    color: tk.progress,
    paragraphs: [
      { arabic: 'مَرْحَبًا، اِسْمِي أَحْمَد.', english: 'Hello, my name is Ahmad.', french: "Bonjour, je m'appelle Ahmad." },
      { arabic: 'أَنَا مِنْ مِصْر.', english: 'I am from Egypt.', french: "Je suis d'Égypte." },
      { arabic: 'عُمْرِي عِشْرُونَ سَنَة.', english: 'I am twenty years old.', french: "J'ai vingt ans." },
      { arabic: 'أَنَا طَالِبٌ فِي الْجَامِعَة.', english: 'I am a student at the university.', french: "Je suis étudiant à l'université." },
      { arabic: 'أَدْرُسُ اللُّغَةَ الْعَرَبِيَّة وَالتَّارِيخ.', english: 'I study the Arabic language and history.', french: "J'étudie la langue arabe et l'histoire." },
      { arabic: 'أَسْكُنُ فِي شَقَّةٍ صَغِيرَةٍ مَعَ صَدِيقِي.', english: 'I live in a small apartment with my friend.', french: "J'habite dans un petit appartement avec mon ami." },
      { arabic: 'أُحِبُّ الْقِرَاءَةَ وَالْمُوسِيقَى.', english: 'I love reading and music.', french: "J'aime la lecture et la musique." },
      { arabic: 'أَقْرَأُ كِتَابًا كُلَّ أُسْبُوع.', english: 'I read a book every week.', french: 'Je lis un livre chaque semaine.' },
      { arabic: 'أَلْعَبُ كُرَةَ الْقَدَمِ يَوْمَ الْجُمُعَة.', english: 'I play football on Friday.', french: 'Je joue au football le vendredi.' },
      { arabic: 'أُرِيدُ أَنْ أَكُونَ مُعَلِّمًا فِي الْمُسْتَقْبَل.', english: 'I want to be a teacher in the future.', french: 'Je veux être enseignant dans le futur.' },
      { arabic: 'أُحِبُّ مُسَاعَدَةَ النَّاس.', english: 'I love helping people.', french: "J'aime aider les gens." },
      { arabic: 'تَشَرَّفْتُ بِمَعْرِفَتِكُمْ!', english: 'Pleased to meet you!', french: 'Enchanté de vous connaître !' },
    ],
  },
  'family-1': {
    title: 'My Family',
    titleFr: 'Ma famille',
    titleArabic: 'عَائِلَتِي',
    level: 'beginner',
    icon: '👨‍👩‍👧‍👦',
    color: tk.accentStrong,
    paragraphs: [
      { arabic: 'هَذِهِ عَائِلَتِي.', english: 'This is my family.', french: 'Voici ma famille.' },
      { arabic: 'عَائِلَتِي كَبِيرَةٌ وَسَعِيدَة.', english: 'My family is big and happy.', french: 'Ma famille est grande et heureuse.' },
      { arabic: 'أَبِي اِسْمُهُ مُحَمَّد وَهُوَ مُهَنْدِس.', english: "My father's name is Muhammad and he is an engineer.", french: "Mon père s'appelle Muhammad et il est ingénieur." },
      { arabic: 'أَبِي رَجُلٌ طَيِّبٌ وَكَرِيم.', english: 'My father is a kind and generous man.', french: 'Mon père est un homme gentil et généreux.' },
      { arabic: 'أُمِّي اِسْمُهَا فَاطِمَة وَهِيَ مُعَلِّمَة.', english: "My mother's name is Fatima and she is a teacher.", french: "Ma mère s'appelle Fatima et elle est enseignante." },
      { arabic: 'أُمِّي تَطْبُخُ طَعَامًا لَذِيذًا كُلَّ يَوْم.', english: 'My mother cooks delicious food every day.', french: 'Ma mère prépare de la nourriture délicieuse chaque jour.' },
      { arabic: 'عِنْدِي أَخٌ وَاحِدٌ وَأُخْتَان.', english: 'I have one brother and two sisters.', french: "J'ai un frère et deux sœurs." },
      { arabic: 'أَخِي اِسْمُهُ عَلِيّ وَهُوَ طَبِيب.', english: "My brother's name is Ali and he is a doctor.", french: "Mon frère s'appelle Ali et il est médecin." },
      { arabic: 'أُخْتِي الْكَبِيرَة اِسْمُهَا مَرْيَم وَهِيَ مُحَامِيَة.', english: "My older sister's name is Maryam and she is a lawyer.", french: "Ma grande sœur s'appelle Maryam et elle est avocate." },
      { arabic: 'أُخْتِي الصَّغِيرَة اِسْمُهَا سَارَة وَهِيَ طَالِبَة.', english: "My younger sister's name is Sara and she is a student.", french: "Ma petite sœur s'appelle Sara et elle est étudiante." },
      { arabic: 'عِنْدَنَا قِطَّةٌ جَمِيلَةٌ اِسْمُهَا لُولُو.', english: 'We have a beautiful cat named Lulu.', french: "Nous avons une belle chatte qui s'appelle Loulou." },
      { arabic: 'نَجْتَمِعُ كُلَّ يَوْمِ جُمُعَةٍ لِتَنَاوُلِ الْغَدَاء.', english: 'We gather every Friday for lunch.', french: 'Nous nous réunissons chaque vendredi pour le déjeuner.' },
      { arabic: 'نَأْكُلُ وَنَتَحَدَّثُ وَنَضْحَك.', english: 'We eat, talk, and laugh.', french: 'Nous mangeons, discutons et rions.' },
      { arabic: 'أُحِبُّ عَائِلَتِي كَثِيرًا.', english: 'I love my family very much.', french: "J'aime beaucoup ma famille." },
    ],
  },
  'daily-routine': {
    title: 'Daily Routine',
    titleFr: 'Routine quotidienne',
    titleArabic: 'الرُّوتِينُ الْيَوْمِي',
    level: 'beginner',
    icon: '☀️',
    color: tk.warning,
    paragraphs: [
      { arabic: 'أَسْتَيْقِظُ فِي السَّاعَةِ السَّادِسَةِ صَبَاحًا.', english: "I wake up at six o'clock in the morning.", french: 'Je me réveille à six heures du matin.' },
      { arabic: 'أَغْسِلُ وَجْهِي وَأُنَظِّفُ أَسْنَانِي.', english: 'I wash my face and brush my teeth.', french: 'Je me lave le visage et je me brosse les dents.' },
      { arabic: 'أُصَلِّي صَلَاةَ الْفَجْر.', english: 'I pray the Fajr prayer.', french: 'Je fais la prière du Fajr.' },
      { arabic: 'أَتَنَاوَلُ الْفُطُورَ مَعَ عَائِلَتِي.', english: 'I have breakfast with my family.', french: 'Je prends le petit-déjeuner avec ma famille.' },
      { arabic: 'آكُلُ الْخُبْزَ وَالْجُبْنَ وَأَشْرَبُ الْحَلِيب.', english: 'I eat bread and cheese and drink milk.', french: 'Je mange du pain et du fromage et je bois du lait.' },
      { arabic: 'أَذْهَبُ إِلَى الْعَمَلِ فِي السَّاعَةِ الثَّامِنَة.', english: "I go to work at eight o'clock.", french: 'Je vais au travail à huit heures.' },
      { arabic: 'أَرْكَبُ الْحَافِلَةَ كُلَّ يَوْم.', english: 'I take the bus every day.', french: 'Je prends le bus chaque jour.' },
      { arabic: 'أَعْمَلُ فِي مَكْتَبٍ كَبِير.', english: 'I work in a big office.', french: 'Je travaille dans un grand bureau.' },
      { arabic: 'أَعْمَلُ حَتَّى السَّاعَةِ الْخَامِسَة.', english: "I work until five o'clock.", french: "Je travaille jusqu'à cinq heures." },
      { arabic: 'أَرْجِعُ إِلَى الْبَيْتِ وَأَسْتَرِيح.', english: 'I return home and rest.', french: 'Je rentre à la maison et je me repose.' },
      { arabic: 'أَتَعَشَّى مَعَ عَائِلَتِي فِي السَّاعَةِ السَّابِعَة.', english: "I have dinner with my family at seven o'clock.", french: 'Je dîne avec ma famille à sept heures.' },
      { arabic: 'أُشَاهِدُ التِّلْفَازَ أَوْ أَقْرَأُ كِتَابًا.', english: 'I watch TV or read a book.', french: 'Je regarde la télévision ou je lis un livre.' },
      { arabic: 'أَنَامُ فِي السَّاعَةِ الْعَاشِرَةِ مَسَاءً.', english: "I sleep at ten o'clock in the evening.", french: "Je m'endors à dix heures du soir." },
    ],
  },
  'at-school': {
    title: 'At School',
    titleFr: "A l'ecole",
    titleArabic: 'فِي الْمَدْرَسَة',
    level: 'intermediate',
    icon: '🏫',
    color: tk.accent,
    paragraphs: [
      { arabic: 'أَذْهَبُ إِلَى الْمَدْرَسَةِ كُلَّ يَوْم.', english: 'I go to school every day.', french: "Je vais à l'école chaque jour." },
      { arabic: 'مَدْرَسَتِي كَبِيرَةٌ وَجَمِيلَة.', english: 'My school is big and beautiful.', french: 'Mon école est grande et belle.' },
      { arabic: 'فِيهَا حَدِيقَةٌ خَضْرَاءُ وَمَلْعَب.', english: 'It has a green garden and a playground.', french: 'Il y a un jardin vert et un terrain de jeux.' },
      { arabic: 'عِنْدِي مُعَلِّمُونَ مُمْتَازُونَ وَلَطِيفُون.', english: 'I have excellent and kind teachers.', french: "J'ai des enseignants excellents et gentils." },
      { arabic: 'مُعَلِّمَةُ الْعَرَبِيَّةِ اِسْمُهَا أُسْتَاذَة نُورَة.', english: "The Arabic teacher's name is teacher Noura.", french: "La professeure d'arabe s'appelle maîtresse Noura." },
      { arabic: 'أَدْرُسُ الْعَرَبِيَّةَ وَالرِّيَاضِيَّاتِ وَالْعُلُوم.', english: 'I study Arabic, mathematics, and science.', french: "J'étudie l'arabe, les mathématiques et les sciences." },
      { arabic: 'أُحِبُّ حِصَّةَ الْعُلُومِ كَثِيرًا.', english: 'I love the science class very much.', french: "J'aime beaucoup le cours de sciences." },
      { arabic: 'نَتَعَلَّمُ عَنِ النَّبَاتَاتِ وَالْحَيَوَانَات.', english: 'We learn about plants and animals.', french: 'Nous apprenons sur les plantes et les animaux.' },
      { arabic: 'أُحِبُّ الْقِرَاءَةَ وَالْكِتَابَةَ فِي الْعَرَبِيَّة.', english: 'I love reading and writing in Arabic.', french: "J'aime lire et écrire en arabe." },
      { arabic: 'فِي الاِسْتِرَاحَةِ أَلْعَبُ مَعَ أَصْدِقَائِي.', english: 'During break, I play with my friends.', french: 'Pendant la récréation, je joue avec mes amis.' },
      { arabic: 'نَلْعَبُ كُرَةَ الْقَدَمِ فِي الْمَلْعَب.', english: 'We play football on the playground.', french: 'Nous jouons au football sur le terrain.' },
      { arabic: 'نَأْكُلُ السَّنْدَوِيتْشَاتِ وَنَشْرَبُ الْعَصِير.', english: 'We eat sandwiches and drink juice.', french: 'Nous mangeons des sandwichs et buvons du jus.' },
      { arabic: 'تَنْتَهِي الْمَدْرَسَةُ فِي السَّاعَةِ الثَّانِيَة.', english: "School ends at two o'clock.", french: "L'école se termine à deux heures." },
      { arabic: 'أَرْجِعُ إِلَى الْبَيْتِ سَعِيدًا.', english: 'I return home happy.', french: 'Je rentre à la maison content.' },
    ],
  },
  'at-market': {
    title: 'At the Market',
    titleFr: 'Au marche',
    titleArabic: 'فِي السُّوق',
    level: 'intermediate',
    icon: '🛒',
    color: tk.accent,
    paragraphs: [
      { arabic: 'أُحِبُّ الذَّهَابَ إِلَى السُّوقِ مَعَ أُمِّي.', english: 'I love going to the market with my mother.', french: "J'aime aller au marché avec ma mère." },
      { arabic: 'نَذْهَبُ كُلَّ يَوْمِ سَبْتٍ صَبَاحًا.', english: 'We go every Saturday morning.', french: 'Nous y allons chaque samedi matin.' },
      { arabic: 'السُّوقُ كَبِيرٌ وَمَلِيءٌ بِالنَّاس.', english: 'The market is big and full of people.', french: 'Le marché est grand et plein de monde.' },
      { arabic: 'هُنَاكَ مَحَلَّاتٌ كَثِيرَةٌ وَمُخْتَلِفَة.', english: 'There are many different shops.', french: 'Il y a beaucoup de boutiques différentes.' },
      { arabic: 'نَشْتَرِي الْفَوَاكِهَ وَالْخُضْرَاوَاتِ الطَّازَجَة.', english: 'We buy fresh fruits and vegetables.', french: 'Nous achetons des fruits et légumes frais.' },
      { arabic: 'أُحِبُّ التُّفَّاحَ الْأَحْمَرَ وَالْمَوْزَ الْأَصْفَر.', english: 'I love red apples and yellow bananas.', french: "J'aime les pommes rouges et les bananes jaunes." },
      { arabic: 'نَشْتَرِي الْبُرْتُقَالَ وَالْعِنَبَ أَيْضًا.', english: 'We also buy oranges and grapes.', french: 'Nous achetons aussi des oranges et du raisin.' },
      { arabic: 'نَشْتَرِي الْخُبْزَ الطَّازَجَ مِنَ الْمَخْبَز.', english: 'We buy fresh bread from the bakery.', french: 'Nous achetons du pain frais à la boulangerie.' },
      { arabic: 'رَائِحَةُ الْخُبْزِ لَذِيذَةٌ جِدًّا.', english: 'The smell of bread is very delicious.', french: "L'odeur du pain est très agréable." },
      { arabic: 'الْبَائِعُ لَطِيفٌ وَيُسَاعِدُنَا فِي الاِخْتِيَار.', english: 'The seller is nice and helps us choose.', french: 'Le vendeur est gentil et nous aide à choisir.' },
      { arabic: 'نَسْأَلُهُ عَنِ الْأَسْعَار.', english: 'We ask him about the prices.', french: 'Nous lui demandons les prix.' },
      { arabic: 'أَحْيَانًا نُسَاوِمُ عَلَى الثَّمَن.', english: 'Sometimes we bargain for the price.', french: 'Parfois nous négocions le prix.' },
      { arabic: 'نَدْفَعُ وَنَشْكُرُ الْبَائِعَ.', english: 'We pay and thank the seller.', french: 'Nous payons et remercions le vendeur.' },
      { arabic: 'نَرْجِعُ إِلَى الْبَيْتِ وَنَطْبُخُ طَعَامًا لَذِيذًا.', english: 'We return home and cook delicious food.', french: 'Nous rentrons à la maison et préparons un repas délicieux.' },
    ],
  },
  'weather': {
    title: 'The Weather',
    titleFr: 'La meteo',
    titleArabic: 'الطَّقْس',
    level: 'intermediate',
    icon: '🌤️',
    color: tk.progress,
    paragraphs: [
      { arabic: 'الطَّقْسُ جَمِيلٌ الْيَوْم.', english: 'The weather is beautiful today.', french: "Le temps est beau aujourd'hui." },
      { arabic: 'الشَّمْسُ مُشْرِقَةٌ وَالسَّمَاءُ زَرْقَاء.', english: 'The sun is shining and the sky is blue.', french: 'Le soleil brille et le ciel est bleu.' },
      { arabic: 'الْجَوُّ دَافِئٌ وَلَطِيف.', english: 'The air is warm and pleasant.', french: "L'air est doux et agréable." },
      { arabic: 'فِي الرَّبِيعِ تَتَفَتَّحُ الْأَزْهَارُ الْمُلَوَّنَة.', english: 'In spring, colorful flowers bloom.', french: 'Au printemps, les fleurs colorées éclosent.' },
      { arabic: 'الْأَشْجَارُ تُصْبِحُ خَضْرَاءَ وَجَمِيلَة.', english: 'The trees become green and beautiful.', french: 'Les arbres deviennent verts et beaux.' },
      { arabic: 'فِي الصَّيْفِ يَكُونُ الطَّقْسُ حَارًّا جِدًّا.', english: 'In summer, the weather is very hot.', french: 'En été, le temps est très chaud.' },
      { arabic: 'أُحِبُّ السِّبَاحَةَ فِي الْبَحْرِ فِي الصَّيْف.', english: 'I love swimming in the sea in summer.', french: "J'aime nager dans la mer en été." },
      { arabic: 'نَأْكُلُ الْمُثَلَّجَاتِ لِنُبَرِّدَ أَجْسَامَنَا.', english: 'We eat ice cream to cool our bodies.', french: 'Nous mangeons des glaces pour nous rafraîchir.' },
      { arabic: 'فِي الْخَرِيفِ تَسْقُطُ الْأَوْرَاقُ مِنَ الشَّجَر.', english: 'In autumn, the leaves fall from the trees.', french: 'En automne, les feuilles tombent des arbres.' },
      { arabic: 'الْأَوْرَاقُ تُصْبِحُ صَفْرَاءَ وَبُرْتُقَالِيَّة.', english: 'The leaves become yellow and orange.', french: 'Les feuilles deviennent jaunes et oranges.' },
      { arabic: 'فِي الشِّتَاءِ يَكُونُ الطَّقْسُ بَارِدًا جِدًّا.', english: 'In winter, the weather is very cold.', french: 'En hiver, le temps est très froid.' },
      { arabic: 'أَحْيَانًا يَنْزِلُ الْمَطَرُ أَوِ الثَّلْج.', english: 'Sometimes it rains or snows.', french: 'Parfois il pleut ou il neige.' },
      { arabic: 'أَلْبَسُ مِعْطَفًا ثَقِيلًا وَقُفَّازَات.', english: 'I wear a heavy coat and gloves.', french: 'Je porte un manteau épais et des gants.' },
      { arabic: 'أُحِبُّ الْجُلُوسَ قُرْبَ الْمِدْفَأَة.', english: 'I love sitting near the fireplace.', french: "J'aime m'asseoir près de la cheminée." },
    ],
  },
  'travel-story': {
    title: 'A Travel Story',
    titleFr: 'Une histoire de voyage',
    titleArabic: 'قِصَّةُ سَفَر',
    level: 'advanced',
    icon: '✈️',
    color: tk.sacred,
    paragraphs: [
      { arabic: 'سَافَرْتُ إِلَى مِصْرَ فِي الصَّيْفِ الْمَاضِي.', english: 'I traveled to Egypt last summer.', french: "J'ai voyagé en Égypte l'été dernier." },
      { arabic: 'كَانَتْ أَوَّلَ رِحْلَةٍ لِي خَارِجَ بَلَدِي.', english: 'It was my first trip outside my country.', french: "C'était mon premier voyage hors de mon pays." },
      { arabic: 'رَكِبْتُ الطَّائِرَةَ لِمُدَّةِ ثَلَاثِ سَاعَات.', english: 'I flew on the plane for three hours.', french: "J'ai pris l'avion pendant trois heures." },
      { arabic: 'وَصَلْتُ إِلَى مَطَارِ الْقَاهِرَةِ الدَّوْلِي.', english: 'I arrived at Cairo International Airport.', french: "Je suis arrivé à l'aéroport international du Caire." },
      { arabic: 'زُرْتُ الْأَهْرَامَاتِ الْعَظِيمَةَ فِي الْجِيزَة.', english: 'I visited the great pyramids in Giza.', french: "J'ai visité les grandes pyramides de Gizeh." },
      { arabic: 'الْأَهْرَامَاتُ ضَخْمَةٌ وَمُذْهِلَة.', english: 'The pyramids are huge and amazing.', french: 'Les pyramides sont immenses et incroyables.' },
      { arabic: 'رَكِبْتُ الْجَمَلَ فِي الصَّحْرَاءِ حَوْلَ الْأَهْرَامَات.', english: 'I rode a camel in the desert around the pyramids.', french: "J'ai monté un chameau dans le désert autour des pyramides." },
      { arabic: 'شَاهَدْتُ أَبُو الْهَوْلِ وَالتَقَطْتُ صُوَرًا كَثِيرَة.', english: 'I saw the Sphinx and took many pictures.', french: "J'ai vu le Sphinx et j'ai pris beaucoup de photos." },
      { arabic: 'زُرْتُ الْمَتْحَفَ الْمِصْرِيَّ وَرَأَيْتُ الْآثَارَ الْقَدِيمَة.', english: 'I visited the Egyptian Museum and saw ancient artifacts.', french: "J'ai visité le musée égyptien et j'ai vu des antiquités." },
      { arabic: 'أَكَلْتُ الطَّعَامَ الْمِصْرِيَّ اللَّذِيذَ كَالْكُشَرِي وَالْفُول.', english: 'I ate delicious Egyptian food like koshari and foul.', french: "J'ai mangé de la délicieuse cuisine égyptienne comme le koshari et le foul." },
      { arabic: 'شَرِبْتُ الشَّايَ الْمِصْرِيَّ فِي مَقْهًى قَدِيم.', english: 'I drank Egyptian tea in an old cafe.', french: "J'ai bu du thé égyptien dans un vieux café." },
      { arabic: 'تَعَرَّفْتُ عَلَى نَاسٍ لَطِيفِينَ وَكَرِيمِين.', english: 'I met nice and generous people.', french: "J'ai rencontré des gens gentils et généreux." },
      { arabic: 'النَّاسُ فِي مِصْرَ وَدُودُونَ جِدًّا.', english: 'The people in Egypt are very friendly.', french: 'Les gens en Égypte sont très accueillants.' },
      { arabic: 'كَانَتْ رِحْلَةً لَا تُنْسَى وَأُرِيدُ الْعَوْدَةَ قَرِيبًا.', english: 'It was an unforgettable trip and I want to return soon.', french: "C'était un voyage inoubliable et je veux y retourner bientôt." },
    ],
  },
  'arab-culture': {
    title: 'Arab Culture',
    titleFr: 'Culture arabe',
    titleArabic: 'الثَّقَافَةُ الْعَرَبِيَّة',
    level: 'advanced',
    icon: '🕌',
    color: tk.danger,
    paragraphs: [
      { arabic: 'الثَّقَافَةُ الْعَرَبِيَّةُ غَنِيَّةٌ وَمُتَنَوِّعَة.', english: 'Arab culture is rich and diverse.', french: 'La culture arabe est riche et diversifiée.' },
      { arabic: 'يَمْتَدُّ تَارِيخُهَا لِآلَافِ السِّنِين.', english: 'Its history extends for thousands of years.', french: "Son histoire s'étend sur des milliers d'années." },
      { arabic: 'اللُّغَةُ الْعَرَبِيَّةُ مِنْ أَقْدَمِ اللُّغَاتِ فِي الْعَالَم.', english: 'The Arabic language is one of the oldest languages in the world.', french: "La langue arabe est l'une des plus anciennes langues au monde." },
      { arabic: 'يَتَكَلَّمُهَا أَكْثَرُ مِنْ أَرْبَعِمِئَةِ مِلْيُونِ شَخْص.', english: 'More than four hundred million people speak it.', french: 'Plus de quatre cents millions de personnes la parlent.' },
      { arabic: 'الْقُرْآنُ الْكَرِيمُ نَزَلَ بِاللُّغَةِ الْعَرَبِيَّة.', english: 'The Holy Quran was revealed in Arabic.', french: 'Le Saint Coran a été révélé en langue arabe.' },
      { arabic: 'الضِّيَافَةُ قِيمَةٌ مُهِمَّةٌ جِدًّا عِنْدَ الْعَرَب.', english: 'Hospitality is a very important value among Arabs.', french: "L'hospitalité est une valeur très importante chez les Arabes." },
      { arabic: 'يُرَحِّبُ الْعَرَبُ بِالضُّيُوفِ بِحَرَارَة.', english: 'Arabs welcome guests warmly.', french: 'Les Arabes accueillent chaleureusement leurs invités.' },
      { arabic: 'الْقَهْوَةُ الْعَرَبِيَّةُ رَمْزٌ لِلْكَرَمِ وَالتَّرْحِيب.', english: 'Arabic coffee is a symbol of generosity and welcome.', french: "Le café arabe est un symbole de générosité et d'accueil." },
      { arabic: 'تُقَدَّمُ مَعَ التَّمْرِ لِلضُّيُوف.', english: 'It is served with dates to guests.', french: 'Il est servi avec des dattes aux invités.' },
      { arabic: 'الْخَطُّ الْعَرَبِيُّ فَنٌّ جَمِيلٌ وَفَرِيد.', english: 'Arabic calligraphy is a beautiful and unique art.', french: 'La calligraphie arabe est un art beau et unique.' },
      { arabic: 'يُزَيِّنُ الْمَسَاجِدَ وَالْقُصُورَ وَالْكُتُب.', english: 'It decorates mosques, palaces, and books.', french: 'Elle orne les mosquées, les palais et les livres.' },
      { arabic: 'الْمُوسِيقَى الْعَرَبِيَّةُ مَشْهُورَةٌ فِي كُلِّ الْعَالَم.', english: 'Arabic music is famous all over the world.', french: 'La musique arabe est célèbre dans le monde entier.' },
      { arabic: 'تَسْتَخْدِمُ آلَاتٍ مِثْلَ الْعُودِ وَالنَّاي.', english: 'It uses instruments like the oud and the ney.', french: 'Elle utilise des instruments comme le oud et le ney.' },
      { arabic: 'الشِّعْرُ الْعَرَبِيُّ لَهُ مَكَانَةٌ خَاصَّةٌ فِي الثَّقَافَة.', english: 'Arabic poetry has a special place in the culture.', french: 'La poésie arabe occupe une place spéciale dans la culture.' },
    ],
  },
  'my-house': {
    title: 'My House',
    titleFr: 'Ma maison',
    titleArabic: 'بَيْتِي',
    level: 'beginner',
    icon: '🏠',
    color: tk.progress,
    paragraphs: [
      { arabic: 'هَذَا بَيْتِي، وَهُوَ جَمِيلٌ وَمُرِيح.', english: 'This is my house, and it is beautiful and comfortable.', french: 'Voici ma maison, belle et confortable.' },
      { arabic: 'بَيْتِي فِي حَيٍّ هَادِئٍ قَرِيبٍ مِنَ الْمَدِينَة.', english: 'My house is in a quiet neighborhood near the city.', french: 'Ma maison est dans un quartier calme près de la ville.' },
      { arabic: 'فِيهِ ثَلَاثُ غُرَفِ نَوْمٍ وَمَطْبَخٌ كَبِير.', english: 'It has three bedrooms and a big kitchen.', french: 'Elle a trois chambres et une grande cuisine.' },
      { arabic: 'غُرْفَةُ الْجُلُوسِ وَاسِعَةٌ وَمُشْمِسَة.', english: 'The living room is spacious and sunny.', french: 'Le salon est spacieux et ensoleillé.' },
      { arabic: 'أُحِبُّ أَنْ أَقْرَأَ الْكُتُبَ عَلَى الْأَرِيكَة.', english: 'I love to read books on the sofa.', french: 'J\'aime lire des livres sur le canapé.' },
      { arabic: 'فِي الْحَدِيقَةِ أَشْجَارٌ وَأَزْهَارٌ مُلَوَّنَة.', english: 'In the garden there are trees and colorful flowers.', french: 'Dans le jardin il y a des arbres et des fleurs colorées.' },
      { arabic: 'نَتَنَاوَلُ الْعَشَاءَ مَعًا فِي غُرْفَةِ الطَّعَام.', english: 'We eat dinner together in the dining room.', french: 'Nous dînons ensemble dans la salle à manger.' },
      { arabic: 'غُرْفَتِي فِي الطَّابِقِ الْعُلْوِيّ.', english: 'My room is on the upper floor.', french: 'Ma chambre est à l\'étage.' },
      { arabic: 'مِنْ نَافِذَتِي أَرَى السَّمَاءَ وَالنُّجُوم.', english: 'From my window I see the sky and the stars.', french: 'De ma fenêtre je vois le ciel et les étoiles.' },
      { arabic: 'أَشْعُرُ بِالسَّعَادَةِ فِي بَيْتِي مَعَ عَائِلَتِي.', english: 'I feel happy in my house with my family.', french: 'Je me sens heureux dans ma maison avec ma famille.' },
    ],
  },
  'at-hospital': {
    title: 'At the Hospital',
    titleFr: 'À l\'hôpital',
    titleArabic: 'فِي الْمُسْتَشْفَى',
    level: 'intermediate',
    icon: '🏥',
    color: tk.accentStrong,
    paragraphs: [
      { arabic: 'ذَهَبْتُ إِلَى الْمُسْتَشْفَى لِأَنِّي كُنْتُ مَرِيضًا.', english: 'I went to the hospital because I was sick.', french: 'Je suis allé à l\'hôpital parce que j\'étais malade.' },
      { arabic: 'شَعَرْتُ بِأَلَمٍ فِي رَأْسِي وَحَرَارَةٍ عَالِيَة.', english: 'I felt a pain in my head and a high fever.', french: 'J\'avais mal à la tête et une forte fièvre.' },
      { arabic: 'اِسْتَقْبَلَتْنِي مُمَرِّضَةٌ لَطِيفَةٌ عِنْدَ الْبَاب.', english: 'A kind nurse received me at the door.', french: 'Une infirmière gentille m\'a accueilli à la porte.' },
      { arabic: 'اِنْتَظَرْتُ قَلِيلًا فِي غُرْفَةِ الِانْتِظَار.', english: 'I waited a little in the waiting room.', french: 'J\'ai attendu un peu dans la salle d\'attente.' },
      { arabic: 'فَحَصَنِي الطَّبِيبُ بِعِنَايَة.', english: 'The doctor examined me carefully.', french: 'Le médecin m\'a examiné avec soin.' },
      { arabic: 'سَأَلَنِي عَنْ أَعْرَاضِي وَمَتَى بَدَأَت.', english: 'He asked me about my symptoms and when they began.', french: 'Il m\'a interrogé sur mes symptômes et leur début.' },
      { arabic: 'قَالَ إِنَّ الْمَرَضَ بَسِيطٌ وَلَا دَاعِيَ لِلْقَلَق.', english: 'He said the illness was minor and there was no need to worry.', french: 'Il a dit que la maladie était bénigne, pas d\'inquiétude.' },
      { arabic: 'كَتَبَ لِي وَصْفَةً طِبِّيَّةً لِلدَّوَاء.', english: 'He wrote me a prescription for medicine.', french: 'Il m\'a rédigé une ordonnance pour un médicament.' },
      { arabic: 'نَصَحَنِي بِالرَّاحَةِ وَشُرْبِ الْمَاءِ كَثِيرًا.', english: 'He advised me to rest and drink a lot of water.', french: 'Il m\'a conseillé de me reposer et de boire beaucoup d\'eau.' },
      { arabic: 'شَكَرْتُ الطَّبِيبَ وَعُدْتُ إِلَى الْبَيْت.', english: 'I thanked the doctor and returned home.', french: 'J\'ai remercié le médecin et je suis rentré à la maison.' },
      { arabic: 'بَعْدَ أَيَّامٍ، تَحَسَّنَتْ صِحَّتِي وَلِلَّهِ الْحَمْد.', english: 'After a few days, my health improved, praise be to God.', french: 'Après quelques jours, ma santé s\'est améliorée, Dieu merci.' },
    ],
  },
  'ramadan': {
    title: 'The Month of Ramadan',
    titleFr: 'Le mois du Ramadan',
    titleArabic: 'شَهْرُ رَمَضَان',
    level: 'advanced',
    icon: '🌙',
    color: tk.sacred,
    paragraphs: [
      { arabic: 'رَمَضَانُ هُوَ الشَّهْرُ التَّاسِعُ فِي التَّقْوِيمِ الْهِجْرِيّ.', english: 'Ramadan is the ninth month in the Islamic calendar.', french: 'Le Ramadan est le neuvième mois du calendrier musulman.' },
      { arabic: 'يَصُومُ الْمُسْلِمُونَ مِنَ الْفَجْرِ إِلَى غُرُوبِ الشَّمْس.', english: 'Muslims fast from dawn until sunset.', french: 'Les musulmans jeûnent de l\'aube au coucher du soleil.' },
      { arabic: 'الصِّيَامُ رُكْنٌ مِنْ أَرْكَانِ الْإِسْلَامِ الْخَمْسَة.', english: 'Fasting is one of the five pillars of Islam.', french: 'Le jeûne est l\'un des cinq piliers de l\'islam.' },
      { arabic: 'يَبْدَأُ الْيَوْمُ بِوَجْبَةِ السُّحُورِ قَبْلَ الْفَجْر.', english: 'The day begins with the suhūr meal before dawn.', french: 'La journée commence par le repas du sohour avant l\'aube.' },
      { arabic: 'وَعِنْدَ الْغُرُوبِ يُفْطِرُ النَّاسُ عَلَى التَّمْرِ وَالْمَاء.', english: 'At sunset, people break their fast with dates and water.', french: 'Au coucher du soleil, on rompt le jeûne avec des dattes et de l\'eau.' },
      { arabic: 'رَمَضَانُ شَهْرُ الْعِبَادَةِ وَالصَّبْرِ وَالرَّحْمَة.', english: 'Ramadan is a month of worship, patience, and mercy.', french: 'Le Ramadan est un mois d\'adoration, de patience et de miséricorde.' },
      { arabic: 'يُكْثِرُ الْمُسْلِمُونَ مِنْ قِرَاءَةِ الْقُرْآنِ وَالدُّعَاء.', english: 'Muslims increase their reading of the Quran and supplication.', french: 'Les musulmans multiplient la lecture du Coran et les invocations.' },
      { arabic: 'كَمَا يَتَصَدَّقُونَ عَلَى الْفُقَرَاءِ وَالْمُحْتَاجِين.', english: 'They also give charity to the poor and needy.', french: 'Ils font aussi l\'aumône aux pauvres et aux nécessiteux.' },
      { arabic: 'تَجْتَمِعُ الْعَائِلَاتُ عَلَى مَائِدَةِ الْإِفْطَار.', english: 'Families gather around the iftar table.', french: 'Les familles se réunissent autour de la table de l\'iftar.' },
      { arabic: 'وَيَنْتَهِي الشَّهْرُ بِعِيدِ الْفِطْرِ الْمُبَارَك.', english: 'The month ends with the blessed Eid al-Fitr.', french: 'Le mois se termine par la fête bénie de l\'Aïd al-Fitr.' },
    ],
  },
  'value-of-time': {
    title: 'The Value of Time',
    titleFr: 'La valeur du temps',
    titleArabic: 'قِيمَةُ الْوَقْت',
    level: 'advanced',
    icon: '⏳',
    color: '#f43f5e',
    paragraphs: [
      { arabic: 'الْوَقْتُ مِنْ أَثْمَنِ مَا يَمْلِكُهُ الْإِنْسَان.', english: 'Time is among the most precious things a person owns.', french: 'Le temps est l\'une des choses les plus précieuses que l\'on possède.' },
      { arabic: 'فَالدَّقِيقَةُ الَّتِي تَمْضِي لَا تَعُودُ أَبَدًا.', english: 'The minute that passes never returns.', french: 'La minute qui passe ne revient jamais.' },
      { arabic: 'قَالَ الْحُكَمَاءُ: الْوَقْتُ كَالسَّيْف، إِنْ لَمْ تَقْطَعْهُ قَطَعَك.', english: 'The wise said: time is like a sword; if you do not cut it, it cuts you.', french: 'Les sages ont dit : le temps est comme une épée, si tu ne le tranches pas, il te tranche.' },
      { arabic: 'يَنْجَحُ مَنْ يُنَظِّمُ وَقْتَهُ وَيَسْتَغِلُّهُ جَيِّدًا.', english: 'Those who organize their time and use it well succeed.', french: 'Réussit celui qui organise son temps et l\'exploite bien.' },
      { arabic: 'مِنَ الْمُهِمِّ أَنْ نَضَعَ خُطَّةً لِيَوْمِنَا.', english: 'It is important to make a plan for our day.', french: 'Il est important d\'établir un plan pour notre journée.' },
      { arabic: 'الْبِدَايَةُ بِالْأَعْمَالِ الْمُهِمَّةِ تُوَفِّرُ الْوَقْت.', english: 'Starting with important tasks saves time.', french: 'Commencer par les tâches importantes fait gagner du temps.' },
      { arabic: 'أَمَّا التَّأْجِيلُ فَهُوَ عَدُوُّ النَّجَاح.', english: 'As for procrastination, it is the enemy of success.', french: 'Quant à la procrastination, elle est l\'ennemie de la réussite.' },
      { arabic: 'يَجِبُ أَنْ نُخَصِّصَ وَقْتًا لِلْعَمَلِ وَوَقْتًا لِلرَّاحَة.', english: 'We must set aside time for work and time for rest.', french: 'Nous devons réserver du temps au travail et du temps au repos.' },
      { arabic: 'وَلَا نَنْسَى الْوَقْتَ الَّذِي نَقْضِيهِ مَعَ الْعَائِلَة.', english: 'And let us not forget the time we spend with family.', french: 'Et n\'oublions pas le temps passé en famille.' },
      { arabic: 'مَنْ حَفِظَ وَقْتَهُ حَفِظَ حَيَاتَه.', english: 'Whoever preserves his time preserves his life.', french: 'Qui préserve son temps préserve sa vie.' },
    ],
  },
};

// Sentence Card Component (similar to AyahCard)
interface SentenceCardProps {
  index: number;
  arabic: string;
  english: string;
  french?: string;
  color: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
}

const SentenceCard = memo(function SentenceCard({ index, arabic, english, french, color, isPlaying, isLoading, onPlay }: SentenceCardProps) {
  return (
    <View style={styles.sentenceCard}>
      {/* Header with Number and Play Button */}
      <View style={styles.sentenceHeader}>
        <View style={[styles.sentenceNumber, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sentenceNumberText, { color }]}>{index + 1}</Text>
        </View>
        <Pressable
          style={[
            styles.playButton,
            { backgroundColor: color },
            isPlaying && styles.playButtonActive,
          ]}
          onPress={onPlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={tk.text} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={tk.text} />
          )}
        </Pressable>
      </View>

      {/* Arabic Text */}
      <Text style={styles.sentenceArabic}>{arabic}</Text>

      {/* Translation */}
      <Text style={styles.sentenceEnglish}>{english}</Text>
    </View>
  );
});

export default function ReadingDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { textId } = useLocalSearchParams<{ textId: string }>();
  const { startReading, completeReading, addXp, updateStreak } = useProgressStore();

  const { speak, stop, isSpeaking } = useArabicSpeech();
  const text = readingContent[textId || ''];

  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);
  const isPlayingAllRef = useRef(false);
  const currentIndexRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (textId) {
      startReading(textId);
    }
    return () => {
      stop();
      isPlayingAllRef.current = false;
    };
  }, [textId]);

  // Play or stop a single sentence
  const handlePlaySentence = useCallback((index: number) => {
    if (!text) return;
    if (currentPlayingIndex === index && isSpeaking) {
      stop();
      setCurrentPlayingIndex(null);
      return;
    }
    setCurrentPlayingIndex(index);
    speak(text.paragraphs[index].arabic);
  }, [text, speak, stop, currentPlayingIndex, isSpeaking]);

  // Play all sentences sequentially
  const handlePlayAll = useCallback(async () => {
    if (!text) return;

    if (isPlayingAll) {
      // Stop playback
      isPlayingAllRef.current = false;
      stop();
      setIsPlayingAll(false);
      setCurrentPlayingIndex(null);
    } else {
      // Start playing all
      isPlayingAllRef.current = true;
      setIsPlayingAll(true);

      for (let i = 0; i < text.paragraphs.length; i++) {
        if (!isPlayingAllRef.current) break;

        currentIndexRef.current = i;
        setCurrentPlayingIndex(i);

        // Await actual playback completion (Google TTS resolves when finished).
        await speak(text.paragraphs[i].arabic);
      }

      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      setCurrentPlayingIndex(null);
    }
  }, [text, speak, stop, isPlayingAll]);

  const handleComplete = () => {
    if (textId) {
      completeReading(textId);
      addXp(30);
      updateStreak();
      router.back();
    }
  };

  if (!text) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.comingSoon}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={tk.text} />
          </Pressable>
          <View style={styles.comingSoonContent}>
            <Ionicons name="book" size={64} color={tk.progress} />
            <Text style={styles.comingSoonTitle}>{t('common.comingSoon')}</Text>
            <Text style={styles.comingSoonText}>
              {t('reading.comingSoonReading')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const levelColors = {
    beginner: tk.progress,
    intermediate: tk.accentStrong,
    advanced: tk.sacred,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={tk.text} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.titleArabic}>{text.titleArabic}</Text>
            <Text style={styles.title}>{lc(text.title, text.titleFr)}</Text>
          </View>
          <Pressable
            style={styles.shareHeaderButton}
            onPress={() => setShareContent({
              kind: 'lesson',
              arabic: text.titleArabic,
              translation: lc(text.title, text.titleFr),
              example: text.paragraphs[0]?.arabic,
              exampleTranslation: text.paragraphs[0] ? lc(text.paragraphs[0].english, text.paragraphs[0].french) : undefined,
              audioText: text.titleArabic,
              ref: text.level,
              route: `/reading/${textId}`,
            })}
            accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
          >
            <Ionicons name="paper-plane-outline" size={22} color={tk.accent} />
          </Pressable>
          <View style={styles.headerIcon}>
            <Text style={styles.iconText}>{text.icon}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { borderColor: text.color + '30' }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="list" size={16} color={text.color} />
              <Text style={styles.infoText}>{t('reading.sentencesCount', { count: text.paragraphs.length })}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="school" size={16} color={text.color} />
              <Text style={[styles.infoText, { textTransform: 'capitalize' }]}>{text.level}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={text.color} />
              <Text style={styles.infoText}>~{Math.ceil(text.paragraphs.length * 0.5)} min</Text>
            </View>
          </View>
        </View>

        {/* Sentences Header with Play All */}
        <View style={styles.sentencesHeader}>
          <Text style={styles.sectionTitle}>{t('reading.sentences')}</Text>
          <View style={styles.headerButtons}>
            {/* Numbered speed control (app-wide) */}
            <SpeechSpeedControl showIcon={false} />
            {/* Play All Button */}
            <Pressable
              style={[
                styles.playAllButton,
                { backgroundColor: text.color },
                isPlayingAll && styles.playAllButtonActive,
              ]}
              onPress={handlePlayAll}
            >
              {isPlayingAll ? (
                <>
                  <Ionicons name="stop" size={14} color={tk.text} />
                  <Text style={styles.playAllText}>
                    {currentPlayingIndex !== null ? `${currentPlayingIndex + 1}/${text.paragraphs.length}` : t('reading.stop')}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="play" size={14} color={tk.text} />
                  <Text style={styles.playAllText}>{t('reading.playAll')}</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Sentence Cards */}
        <View style={styles.sentencesContainer}>
          {text.paragraphs.map((paragraph, index) => (
            <SentenceCard
              key={index}
              index={index}
              arabic={paragraph.arabic}
              english={lc(paragraph.english, paragraph.french)}
              color={text.color}
              isPlaying={currentPlayingIndex === index}
              isLoading={false}
              onPlay={() => handlePlaySentence(index)}
            />
          ))}
        </View>

        {/* Complete Button */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Pressable
            style={[styles.completeButton, { backgroundColor: text.color }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle" size={24} color={tk.text} />
            <Text style={styles.completeButtonText}>{t('reading.markComplete')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ShareToGroupModal
        visible={!!shareContent}
        content={shareContent}
        onClose={() => setShareContent(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tk.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: tk.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 41,
    color: tk.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: tk.progress,
    fontSize: 14,
    marginTop: 4,
  },
  shareHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(tk.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: tk.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  infoCard: {
    backgroundColor: tk.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: tk.textMuted,
    fontSize: 13,
  },
  sentencesHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: tk.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: tk.surface,
    borderWidth: 1,
    borderColor: tk.border,
  },
  speedToggleActive: {
    backgroundColor: tk.accentStrong,
    borderColor: tk.accentStrong,
  },
  speedToggleText: {
    color: tk.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  speedToggleTextActive: {
    color: tk.text,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  playAllButtonActive: {
    backgroundColor: tk.danger,
  },
  playAllText: {
    color: tk.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sentencesContainer: {
    paddingHorizontal: 20,
  },
  // Sentence Card Styles
  sentenceCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  sentenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sentenceNumber: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: tk.accent,
  },
  sentenceArabic: {
    fontFamily: font.arabic,
    fontSize: 24,
    color: tk.text,
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  sentenceEnglish: {
    fontSize: 14,
    color: tk.textMuted,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  completeButton: {
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: tk.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoon: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  comingSoonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tk.text,
    marginTop: 24,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: tk.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
