import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Txt } from '../src/components/ui/Primitives';
import { color, space } from '../src/theme/tokens';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View style={styles.container}>
        <Txt variant="title" weight="bold">{t('notFound.message')}</Txt>

        <Link href="/" style={styles.link}>
          <Txt variant="body" weight="semibold" tone="accent">{t('notFound.goHome')}</Txt>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    backgroundColor: color.bg,
  },
  link: {
    marginTop: space.lg,
    paddingVertical: space.md,
  },
});
