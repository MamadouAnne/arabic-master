import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useArabicTextsStore } from '../../../src/stores/arabicTextsStore';
import { playArabicLines, stopArabic } from '../../../src/services/speech/arabicTTS';

const BRAND = '#10b981';
const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1.0 },
];

export default function ArabicPlayerScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const text = useArabicTextsStore((s) => s.texts.find((item) => item.id === id));

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [speed, setSpeed] = useState(1.0);

  const scrollRef = useRef<ScrollView>(null);
  const lineOffsets = useRef<Record<number, number>>({});

  // Split into display lines — each non-empty line is a spoken verse.
  const lines = useMemo(() => (text ? text.content.split('\n') : []), [text]);

  // Stop audio when leaving the screen.
  useEffect(() => () => stopArabic(), []);

  const scrollToLine = useCallback((index: number) => {
    const y = lineOffsets.current[index];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(y - 140, 0), animated: true });
    }
  }, []);

  const startFrom = useCallback(
    (fromIndex: number, speedValue: number) => {
      setIsPlaying(true);
      setActiveLine(fromIndex);
      scrollToLine(fromIndex);
      playArabicLines(lines, {
        speed: speedValue,
        startIndex: fromIndex,
        onLineStart: (i) => {
          setActiveLine(i);
          scrollToLine(i);
        },
        onDone: () => {
          setIsPlaying(false);
          setActiveLine(-1);
        },
        onError: () => {
          setIsPlaying(false);
          Alert.alert(t('reading.memo.playErrorTitle'), t('reading.memo.playErrorMsg'));
        },
      });
    },
    [lines, scrollToLine, t]
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopArabic();
      setIsPlaying(false); // keep activeLine so play resumes from here
    } else {
      const start = activeLine >= 0 ? activeLine : 0;
      startFrom(start, speed);
    }
  }, [isPlaying, activeLine, speed, startFrom]);

  const handleRestart = useCallback(() => {
    stopArabic();
    startFrom(0, speed);
  }, [speed, startFrom]);

  const handleSpeedChange = useCallback(
    (value: number) => {
      setSpeed(value);
      if (isPlaying) {
        // Re-start current line so the new speed applies immediately.
        stopArabic();
        startFrom(activeLine >= 0 ? activeLine : 0, value);
      }
    },
    [isPlaying, activeLine, startFrom]
  );

  const handleLineTap = useCallback(
    (index: number) => {
      if (!lines[index]?.trim()) return;
      stopArabic();
      startFrom(index, speed);
    },
    [lines, speed, startFrom]
  );

  const handleBack = useCallback(() => {
    stopArabic();
    router.back();
  }, []);

  if (!text) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('reading.memo.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentVerse = lines.slice(0, activeLine + 1).filter((l) => l.trim()).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {text.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeLine >= 0
              ? t('reading.memo.verse', { n: currentVerse })
              : t('reading.memo.pressPlay')}
          </Text>
        </View>
      </View>

      {/* Verses */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.versesContent}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, index) => {
          const isBlank = line.trim().length === 0;
          if (isBlank) return <View key={index} style={styles.stanzaGap} />;
          const isActive = index === activeLine;
          return (
            <Pressable
              key={index}
              onPress={() => handleLineTap(index)}
              onLayout={(e) => {
                lineOffsets.current[index] = e.nativeEvent.layout.y;
              }}
              style={[styles.verseRow, isActive && styles.verseRowActive]}
            >
              <Text style={[styles.verseText, isActive && styles.verseTextActive]}>
                {line.trim()}
              </Text>
            </Pressable>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.speedRow}>
          <Ionicons name="speedometer-outline" size={16} color="#94a3b8" />
          <View style={styles.speedSegment}>
            {SPEEDS.map((s) => {
              const selected = s.value === speed;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => handleSpeedChange(s.value)}
                  style={[styles.speedPill, selected && styles.speedPillActive]}
                >
                  <Text style={[styles.speedText, selected && styles.speedTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.playRow}>
          <Pressable style={styles.secondaryBtn} onPress={handleRestart}>
            <Ionicons name="play-skip-back" size={22} color="#94a3b8" />
          </Pressable>

          <Pressable onPress={handlePlayPause} style={styles.playBtnWrap}>
            <LinearGradient
              colors={['#10b981', '#0d9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playBtn}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="#fff"
                style={isPlaying ? undefined : { marginLeft: 3 }}
              />
            </LinearGradient>
          </Pressable>

          <View style={styles.secondaryBtn} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 12.5, color: BRAND, marginTop: 2 },

  versesContent: { paddingHorizontal: 20, paddingTop: 18 },
  stanzaGap: { height: 18 },
  verseRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
  },
  verseRowActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.55)',
  },
  verseText: {
    fontSize: 26,
    lineHeight: 46,
    color: '#cbd5e1',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  verseTextActive: { color: '#ffffff', fontWeight: '600' },

  controls: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  speedSegment: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 3,
  },
  speedPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9,
  },
  speedPillActive: {
    backgroundColor: '#334155',
  },
  speedText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  speedTextActive: { color: BRAND },

  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnWrap: {
    borderRadius: 36,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
