import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { color, type, weight } from '../../src/theme/tokens';

/**
 * Icons swap between outline and filled on selection, which is the platform
 * convention and gives the active tab a second signal beyond colour. Previously
 * each tab hardcoded one variant, so "Quran" read as permanently inactive.
 */
const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  index: { on: 'home', off: 'home-outline' },
  learn: { on: 'book', off: 'book-outline' },
  community: { on: 'people', off: 'people-outline' },
  quran: { on: 'bookmark', off: 'bookmark-outline' },
  profile: { on: 'person', off: 'person-outline' },
};

function tabIcon(name: keyof typeof ICONS) {
  return ({ color: tint, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? ICONS[name].on : ICONS[name].off} size={23} color={tint} />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 24);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopColor: color.border,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.textFaint,
        tabBarLabelStyle: {
          ...type.micro,
          fontWeight: weight.semibold,
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon('index') }} />
      <Tabs.Screen name="learn" options={{ title: t('tabs.learn'), tabBarIcon: tabIcon('learn') }} />
      <Tabs.Screen name="community" options={{ title: t('tabs.community'), tabBarIcon: tabIcon('community') }} />
      <Tabs.Screen name="quran" options={{ title: t('tabs.quran'), tabBarIcon: tabIcon('quran') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}
