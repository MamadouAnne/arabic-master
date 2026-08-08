import "../global.css";
import '../src/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { quranAudioService } from '../src/services/quranAudioService';
import { adService } from '../src/services/adService';
import { iapService } from '../src/services/iapService';
import { revenueCatService } from '../src/services/revenueCatService';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useCreditStore } from '../src/stores/creditStore';
import { supabase, isSupabaseConfigured, safeGetSession } from '../src/lib/supabase';
import { MiniAudioPlayer } from '../src/components/quran/MiniAudioPlayer';
import { AIFloatingButton } from '../src/components/ai/AIFloatingButton';
import { AIChatSheet } from '../src/components/ai/AIChatSheet';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const segments = useSegments();

  const language = useSettingsStore((s) => s.language);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useSettingsStore((s) => s.isAuthenticated);
  const setSession = useSettingsStore((s) => s.setSession);

  const [authReady, setAuthReady] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);

  // Hard fallback: force app ready after 5s no matter what
  useEffect(() => {
    const fallback = setTimeout(() => {
      setAuthReady(true);
      setUpdateComplete(true);
    }, 5000);
    return () => clearTimeout(fallback);
  }, []);

  // Check for OTA updates in the background — don't block app launch
  useEffect(() => {
    if (__DEV__) {
      setUpdateComplete(true);
      return;
    }
    setUpdateComplete(true); // Let app launch immediately

    // Download update in background, prompt to restart
    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version has been downloaded. Restart now to apply?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Restart', onPress: () => Updates.reloadAsync() },
            ]
          );
        }
      } catch {
        // OTA update check failed silently
      }
    })();
  }, []);

  // Android navigation bar: keep light buttons. Background color is no longer
  // set — with edge-to-edge (SDK 54 default) the nav bar is transparent and
  // setBackgroundColorAsync is unsupported (it only logs a warning).
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, []);

  // Sync persisted language with i18next
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      return;
    }

    // Timeout: if auth check hangs, proceed anyway after 3s
    const timeout = setTimeout(() => setAuthReady(true), 3000);

    safeGetSession().then((session) => {
      clearTimeout(timeout);
      setSession(session);
      setAuthReady(true);
      // Start auto-refresh only after initial session is validated
      if (session) {
        supabase!.auth.startAutoRefresh();
        useCreditStore.getState().syncCredits();
      }
    }).catch(() => {
      clearTimeout(timeout);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        useCreditStore.getState().syncCredits();
        revenueCatService.identifyUser(session.user.id);
      } else {
        useCreditStore.getState().reset();
        revenueCatService.logout();
      }
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/reset-password');
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Handle deep links for Supabase auth (password reset, email confirmation)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let lastHandledUrl = '';

    async function handleDeepLink(url: string) {
      if (!url || !supabase) return;
      // Prevent replaying the same URL (e.g. on app restart)
      if (url === lastHandledUrl) return;
      lastHandledUrl = url;

      try {
        // PKCE flow: Supabase sends ?code=... as a query parameter
        const codeMatch = url.match(/[?&]code=([^&#]+)/);
        if (codeMatch) {
          await supabase.auth.exchangeCodeForSession(codeMatch[1]);
          return;
        }

        // Implicit flow: tokens in hash fragment #access_token=...&refresh_token=...
        const hashIndex = url.indexOf('#');
        if (hashIndex === -1) return;

        const fragment = url.substring(hashIndex + 1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      } catch (e: any) {
        // Stale/expired tokens — silently ignore, user can request a new reset
        console.warn('[DeepLink] Auth token error:', e.message || e);
      }
    }

    // Handle URL that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle URLs while the app is already open (warm start)
    const linkingSub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => linkingSub.remove();
  }, []);

  // Route protection
  useEffect(() => {
    if (!authReady) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';
    const seg = segments[0] as string;
    const inLegal = seg === 'privacy-policy' || seg === 'terms-of-service';
    const inResetPassword = seg === 'reset-password';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/language');
    } else if (hasCompletedOnboarding && !isAuthenticated && !inAuth && !inLegal && !inResetPassword) {
      router.replace('/auth');
    }
  }, [authReady, hasCompletedOnboarding, isAuthenticated, segments]);

  const appReady = authReady && updateComplete;

  // Hide the native splash exactly once. Calling hideAsync more than once (or
  // when no splash is registered, e.g. in Expo Go) rejects with "No native
  // splash screen registered", so guard it and swallow any error.
  const splashHidden = useRef(false);
  const hideSplash = useCallback(async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    try { await SplashScreen.hideAsync(); } catch {}
  }, []);

  // Defensive: hide as soon as we're ready (independent of layout timing) and,
  // as a hard backstop, never let it stay up longer than ~7s.
  useEffect(() => {
    if (appReady) hideSplash();
  }, [appReady, hideSplash]);
  useEffect(() => {
    const t = setTimeout(hideSplash, 7000);
    return () => clearTimeout(t);
  }, [hideSplash]);

  // Cleanup IAP listeners on unmount
  useEffect(() => {
    return () => {
      iapService.cleanup();
      adService.cleanup();
    };
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appReady) {
      hideSplash();
      quranAudioService.warmUp();
      adService.initialize();
      iapService.initialize();
      revenueCatService.initialize();
    }
  }, [appReady, hideSplash]);

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: '#0f172a' }} />;
  }

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0f172a' }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f172a' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="alphabet/index" />
          <Stack.Screen name="alphabet/[letterId]" />
          <Stack.Screen name="alphabet/writing-practice" />
          <Stack.Screen name="vocabulary/index" />
          <Stack.Screen name="vocabulary/[themeId]" />
          <Stack.Screen name="vocabulary/flashcards" />
          <Stack.Screen name="grammar/index" />
          <Stack.Screen name="grammar/[lessonId]" />
          <Stack.Screen name="reading/index" />
          <Stack.Screen name="reading/[textId]" />
          <Stack.Screen name="exercise/[exerciseId]" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          <Stack.Screen name="exercise/typing-practice" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          <Stack.Screen name="community/thread/[id]" />
          <Stack.Screen name="community/groups/[id]" />
          <Stack.Screen name="community/groups/invite/[code]" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="terms-of-service" />
        </Stack>
        <MiniAudioPlayer />
        {/* Show the AI floating button only on the home tab. */}
        {segments[0] === '(tabs)' && !segments[1] && <AIFloatingButton />}
        <AIChatSheet />
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
