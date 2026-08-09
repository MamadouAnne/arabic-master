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
    color: '#10b981',
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
    color: '#6366f1',
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
    color: '#f59e0b',
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
    color: '#8b5cf6',
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
    color: '#ec4899',
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
    color: '#14b8a6',
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
    color: '#D4AF37',
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
    color: '#ef4444',
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
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#ffffff" />
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
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.comingSoonContent}>
            <Ionicons name="book" size={64} color="#10b981" />
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
    beginner: '#10b981',
    intermediate: '#6366f1',
    advanced: '#D4AF37',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
            <Ionicons name="paper-plane-outline" size={22} color="#818cf8" />
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
                  <Ionicons name="stop" size={14} color="#ffffff" />
                  <Text style={styles.playAllText}>
                    {currentPlayingIndex !== null ? `${currentPlayingIndex + 1}/${text.paragraphs.length}` : t('reading.stop')}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="play" size={14} color="#ffffff" />
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
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
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
    backgroundColor: '#0f172a',
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
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleArabic: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 4,
  },
  shareHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#818cf820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
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
    color: '#94a3b8',
    fontSize: 13,
  },
  sentencesHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#ffffff',
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
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedToggleActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  speedToggleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  speedToggleTextActive: {
    color: '#ffffff',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  playAllButtonActive: {
    backgroundColor: '#ef4444',
  },
  playAllText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sentencesContainer: {
    paddingHorizontal: 20,
  },
  // Sentence Card Styles
  sentenceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
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
    borderRadius: 18,
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
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sentenceArabic: {
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  sentenceEnglish: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  completeButton: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: '#ffffff',
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
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
