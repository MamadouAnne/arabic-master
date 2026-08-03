import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIModuleContext, AIModelChoice, ChatMessage, ConversationSummary } from '../types/aiChat';
import { analyzeConversation } from '../services/aiMemoryService';
import { useAIMemoryStore } from './aiMemoryStore';

interface AIChatState {
  // Persisted
  conversations: Record<AIModuleContext, ChatMessage[]>;
  preferredModel: AIModelChoice;
  /** Stored summaries of earlier messages per module (Feature 2) */
  conversationSummaries: Partial<Record<AIModuleContext, ConversationSummary>>;

  // Transient (not persisted)
  isOpen: boolean;
  isStreaming: boolean;
  streamingContent: string;
  activeModule: AIModuleContext;
  activeSegments: string[];
  speakingMessageId: string | null;
  /** When true, the chat sheet opens directly in voice mode */
  startInVoiceMode: boolean;

  // Actions
  openChat: (module?: AIModuleContext, segments?: string[], voiceMode?: boolean) => void;
  closeChat: () => void;
  setActiveModule: (module: AIModuleContext) => void;
  setActiveSegments: (segments: string[]) => void;
  addUserMessage: (content: string) => string;
  appendStreamChunk: (chunk: string) => void;
  finalizeStreamedMessage: () => void;
  setStreaming: (streaming: boolean) => void;
  clearConversation: (module?: AIModuleContext) => void;
  setPreferredModel: (model: AIModelChoice) => void;
  setSpeakingMessageId: (id: string | null) => void;
  /** Store a conversation summary for a module (Feature 2) */
  setSummary: (module: AIModuleContext, summary: ConversationSummary) => void;
  /** Get the stored summary for a module */
  getSummary: (module: AIModuleContext) => ConversationSummary | undefined;
}

const EMPTY_CONVERSATIONS: Record<AIModuleContext, ChatMessage[]> = {
  alphabet: [],
  vocabulary: [],
  grammar: [],
  verbs: [],
  reading: [],
  practice: [],
  quran: [],
  prayer: [],
  duas: [],
  general: [],
};

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      // Persisted state
      conversations: { ...EMPTY_CONVERSATIONS },
      preferredModel: 'haiku',
      conversationSummaries: {},

      // Transient state
      isOpen: false,
      isStreaming: false,
      streamingContent: '',
      activeModule: 'general',
      activeSegments: [],
      speakingMessageId: null,
      startInVoiceMode: false,

      openChat: (module, segments, voiceMode) => set({
        isOpen: true,
        startInVoiceMode: !!voiceMode,
        ...(module ? { activeModule: module } : {}),
        ...(segments ? { activeSegments: segments } : {}),
      }),

      closeChat: () => {
        const { activeModule, conversations } = get();
        const msgs = conversations[activeModule] || [];
        // Analyze conversation for memory if it has enough messages
        if (msgs.length >= 4) {
          const memStore = useAIMemoryStore.getState();
          const existing = memStore.getMemory(activeModule);
          const memory = analyzeConversation(msgs, activeModule, existing);
          memStore.updateMemory(activeModule, memory);
        }
        set({ isOpen: false });
      },

      setActiveModule: (module) => set({ activeModule: module }),
      setActiveSegments: (segments) => set({ activeSegments: segments }),

      addUserMessage: (content) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const message: ChatMessage = {
          id,
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        const { activeModule, conversations } = get();
        set({
          conversations: {
            ...conversations,
            [activeModule]: [...(conversations[activeModule] || []), message],
          },
        });
        return id;
      },

      appendStreamChunk: (chunk) => set((state) => ({
        streamingContent: state.streamingContent + chunk,
      })),

      finalizeStreamedMessage: () => {
        const { activeModule, conversations, streamingContent } = get();
        if (!streamingContent) return;

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: streamingContent,
          timestamp: Date.now(),
        };
        set({
          conversations: {
            ...conversations,
            [activeModule]: [...(conversations[activeModule] || []), message],
          },
          streamingContent: '',
          isStreaming: false,
        });
      },

      setStreaming: (streaming) => set({
        isStreaming: streaming,
        ...(streaming ? { streamingContent: '' } : {}),
      }),

      clearConversation: (module) => {
        const { activeModule, conversations, conversationSummaries } = get();
        const target = module || activeModule;
        const msgs = conversations[target] || [];
        // Analyze conversation for memory before clearing
        if (msgs.length >= 4) {
          const memStore = useAIMemoryStore.getState();
          const existing = memStore.getMemory(target);
          const memory = analyzeConversation(msgs, target, existing);
          memStore.updateMemory(target, memory);
        }
        // Clear both messages and summary
        const { [target]: _, ...remainingSummaries } = conversationSummaries;
        set({
          conversations: {
            ...conversations,
            [target]: [],
          },
          conversationSummaries: remainingSummaries,
        });
      },

      setPreferredModel: (model) => set({ preferredModel: model }),

      setSpeakingMessageId: (id) => set({ speakingMessageId: id }),

      setSummary: (module, summary) =>
        set((state) => ({
          conversationSummaries: {
            ...state.conversationSummaries,
            [module]: summary,
          },
        })),

      getSummary: (module) => get().conversationSummaries[module],
    }),
    {
      name: 'iqra-ai-chat',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        preferredModel: state.preferredModel,
        conversationSummaries: state.conversationSummaries,
      }),
    }
  )
);
