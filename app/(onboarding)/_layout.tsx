import { Stack } from 'expo-router';
import { color } from '../../src/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="language" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="features" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
