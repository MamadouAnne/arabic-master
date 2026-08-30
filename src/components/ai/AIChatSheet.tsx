import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments, useGlobalSearchParams } from 'expo-router';
import { useAIChatStore } from '../../stores/aiChatStore';
import { useCreditStore, getCreditDisplayInfo } from '../../stores/creditStore';
import { sendAIChatMessage } from '../../services/aiChatService';
import { AIChatHeader } from './AIChatHeader';
import { AIChatMessageList } from './AIChatMessageList';
import { AIChatInput } from './AIChatInput';
import { AIQuickSuggestions } from './AIQuickSuggestions';
import { CreditPurchaseSheet } from './CreditPurchaseSheet';
import { AIVoiceChat } from './AIVoiceChat';
import { color } from '../../theme/tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT_RATIO = 0.85;

export function AIChatSheet() {
  const insets = useSafeAreaInsets();
  const rawSegments = useSegments();
  const params = useGlobalSearchParams();
  const abortRef = useRef<AbortController | null>(null);

  // Resolve template segments like '[lessonId]' to actual values
  const segments = (rawSegments as string[]).map((seg) => {
    if (seg.startsWith('[') && seg.endsWith(']')) {
      const paramName = seg.slice(1, -1);
      const value = params[paramName];
      return typeof value === 'string' ? value : seg;
    }
    return seg;
  });

  const {
    isOpen,
    closeChat,
    activeModule,
    conversations,
    isStreaming,
    streamingContent,
    preferredModel,
    setPreferredModel,
    clearConversation,
    startInVoiceMode,
  } = useAIChatStore();

  const creditBalance = useCreditStore((s) => s.creditBalance);
  const subStatus = useCreditStore((s) => s.subscriptionStatus);
  const subExpires = useCreditStore((s) => s.subscriptionExpiresAt);
  const freeUsed = useCreditStore((s) => s.freeMessagesUsed);
  const freeDate = useCreditStore((s) => s.freeMessagesDate);

  const creditInfo = useMemo(
    () => getCreditDisplayInfo({
      creditBalance, subscriptionStatus: subStatus,
      subscriptionExpiresAt: subExpires, freeMessagesUsed: freeUsed,
      freeMessagesDate: freeDate,
    }),
    [creditBalance, subStatus, subExpires, freeUsed, freeDate]
  );

  const messages = conversations[activeModule] || [];
  const hasCredits = creditInfo.source !== 'empty';

  const [inputText, setInputText] = useState('');
  const [purchaseSheetVisible, setPurchaseSheetVisible] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(startInVoiceMode);

  // Sync voice mode when sheet opens with startInVoiceMode flag
  useEffect(() => {
    if (isOpen) setIsVoiceMode(startInVoiceMode);
  }, [isOpen, startInVoiceMode]);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Animate sheet in when opened
  const animateIn = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  const animateOut = useCallback((onDone?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(onDone);
  }, []);

  // Drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = useCallback(() => {
    setInputText('');
    setIsVoiceMode(false);
    animateOut(() => closeChat());
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      setInputText('');
      const controller = new AbortController();
      abortRef.current = controller;
      sendAIChatMessage({
        userMessage: text,
        model: preferredModel,
        abortController: controller,
      });
    },
    [preferredModel]
  );

  const handleStopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleClear = useCallback(() => {
    clearConversation();
  }, []);

  const handleModelSwitch = useCallback(() => {
    const current = useAIChatStore.getState().preferredModel;
    setPreferredModel(current === 'haiku' ? 'sonnet' : 'haiku');
  }, []);

  const handleSuggestionPress = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend]
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onShow={animateIn}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                height: SCREEN_HEIGHT * SHEET_HEIGHT_RATIO,
                paddingBottom: insets.bottom,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {isVoiceMode ? (
              /* ── Voice Chat Mode ─────────────────────────────── */
              <AIVoiceChat onClose={() => setIsVoiceMode(false)} />
            ) : (
              /* ── Text Chat Mode ──────────────────────────────── */
              <>
                {/* Only the header area responds to drag-to-dismiss */}
                <Animated.View {...panResponder.panHandlers}>
                  <AIChatHeader
                    module={activeModule}
                    model={preferredModel}
                    creditInfo={creditInfo}
                    onClear={handleClear}
                    onClose={handleClose}
                    onCreditPress={() => setPurchaseSheetVisible(true)}
                    onTeacherSwitch={handleModelSwitch}
                  />
                </Animated.View>

                <View style={styles.messageArea}>
                  <AIChatMessageList
                    messages={messages}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    module={activeModule}
                    model={preferredModel}
                    segments={segments}
                    onSuggestionPress={handleSuggestionPress}
                  />
                </View>

                <AIQuickSuggestions
                  messages={messages}
                  isStreaming={isStreaming}
                  activeModule={activeModule}
                  segments={segments}
                  onPress={handleSuggestionPress}
                />

                <AIChatInput
                  value={inputText}
                  onChangeText={setInputText}
                  onSend={handleSend}
                  isStreaming={isStreaming}
                  onStopStreaming={handleStopStreaming}
                  hasCredits={hasCredits}
                  onVoicePress={() => setIsVoiceMode(true)}
                />
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>

      <CreditPurchaseSheet
        visible={purchaseSheetVisible}
        onClose={() => setPurchaseSheetVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  messageArea: {
    flex: 1,
    backgroundColor: color.bg,
  },
});
