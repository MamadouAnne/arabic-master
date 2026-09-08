import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCreditStore, getCreditDisplayInfo } from '../../src/stores/creditStore';
import { useCommunityStore } from '../../src/stores/communityStore';
import { StudyPartner } from '../../src/types/community';
import { color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const LEVEL_COLORS: Record<string, string> = {
  beginner: color.progress,
  intermediate: color.warning,
  advanced: color.warning,
};

export default function StudyPartnersScreen() {
  const { t } = useTranslation();
  const creditState = useCreditStore();
  const isPremium = getCreditDisplayInfo(creditState).isPremium;
  const [refreshing, setRefreshing] = useState(false);

  const {
    partners,
    isLoadingPartners,
    loadPartners,
    connectPartner,
    disconnectPartner,
  } = useCommunityStore();

  useEffect(() => {
    loadPartners();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPartners();
    setRefreshing(false);
  }, [loadPartners]);

  const handleConnect = async (partnerId: string, isConnected: boolean) => {
    if (!isPremium) return;
    if (isConnected) {
      await disconnectPartner(partnerId);
    } else {
      await connectPartner(partnerId);
    }
  };

  // Sort by match score desc
  const sorted = [...partners].sort((a, b) => b.matchScore - a.matchScore);

  const connectedPartners = sorted.filter((p) => p.isConnected);
  const availablePartners = sorted.filter((p) => !p.isConnected);

  const getLastActive = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 5) return t('community.activeNow');
    if (mins < 60) return t('community.minutesAgo', { count: mins });
    return t('community.hoursAgo', { count: Math.floor(mins / 60) });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="hand-left" size={20} color={color.warning} />
          <Text style={styles.headerTitle}>{t('community.studyPartners')}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {isLoadingPartners ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={color.warning} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.warning} />
          }
        >
          {/* Description */}
          <Text style={styles.desc}>{t('community.studyPartnersDesc')}</Text>

          {partners.length === 0 ? (
            <Text style={styles.emptyText}>{t('community.noPartners')}</Text>
          ) : (
            <>
              {/* Connected partner (if any) */}
              {connectedPartners.length > 0 && (
                <View style={styles.connectedSection}>
                  <Text style={styles.connectedTitle}>{t('community.yourPartner')}</Text>
                  {connectedPartners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      isConnected
                      isPremium={isPremium}
                      onConnect={() => handleConnect(partner.id, true)}
                      getLastActive={getLastActive}
                      t={t}
                    />
                  ))}
                </View>
              )}

              {/* Available partners */}
              <Text style={styles.sectionLabel}>{t('community.findPartner')}</Text>
              {availablePartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  isConnected={false}
                  isPremium={isPremium}
                  onConnect={() => handleConnect(partner.id, false)}
                  getLastActive={getLastActive}
                  t={t}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PartnerCard({
  partner,
  isConnected,
  isPremium,
  onConnect,
  getLastActive,
  t,
}: {
  partner: StudyPartner;
  isConnected: boolean;
  isPremium: boolean;
  onConnect: () => void;
  getLastActive: (d: string) => string;
  t: any;
}) {
  const levelColor = LEVEL_COLORS[partner.level] || color.textFaint;

  return (
    <View style={[styles.card, isConnected && styles.cardConnected]}>
      <View style={styles.cardTop}>
        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{partner.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.partnerName}>{partner.name}</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{t('community.matchScore', { score: partner.matchScore })}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>
                {t(`common.${partner.level}`)}
              </Text>
            </View>
            <Ionicons name="flame" size={13} color={color.warning} />
            <Text style={styles.statText}>{partner.streak}d</Text>
            <Ionicons name="star" size={13} color={color.warning} />
            <Text style={styles.statText}>{partner.xp.toLocaleString()} XP</Text>
          </View>
        </View>
      </View>

      {/* Interests */}
      <View style={styles.interestRow}>
        {partner.interests.map((interest) => (
          <View key={interest} style={styles.interestChip}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
        <Text style={styles.lastActive}>{getLastActive(partner.lastActive)}</Text>
      </View>

      {/* Connect button */}
      <Pressable
        style={[
          styles.connectBtn,
          isConnected && styles.connectedBtn,
          !isPremium && styles.lockedBtn,
        ]}
        onPress={onConnect}
        disabled={!isPremium}
      >
        <Ionicons
          name={isConnected ? 'checkmark-circle' : isPremium ? 'hand-left' : 'lock-closed'}
          size={16}
          color={isConnected ? color.progress : color.surface}
        />
        <Text style={[styles.connectText, isConnected && styles.connectedText]}>
          {isConnected
            ? t('community.connected')
            : isPremium
              ? t('community.connect')
              : t('community.unlockToConnect')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: color.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: color.textFaint,
    textAlign: 'center',
    paddingVertical: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  desc: {
    fontSize: 14,
    color: color.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  connectedSection: {
    marginBottom: 24,
  },
  connectedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: color.progress,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginBottom: 12,
  },

  // Partner card
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardConnected: {
    borderColor: color.progress,
    backgroundColor: withAlpha(color.progress, 0.03),
  },
  cardTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: color.text,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
  },
  matchBadge: {
    backgroundColor: withAlpha(color.progress, 0.13),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
    color: color.progress,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statText: {
    fontSize: 12,
    color: color.textFaint,
    marginRight: 4,
  },

  // Interests
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 14,
  },
  interestChip: {
    backgroundColor: color.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  interestText: {
    fontSize: 12,
    color: color.textMuted,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 11,
    color: color.textFaint,
    marginLeft: 'auto',
  },

  // Connect button
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: color.warning,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  connectedBtn: {
    backgroundColor: withAlpha(color.progress, 0.13),
    borderWidth: 1,
    borderColor: color.progress,
  },
  lockedBtn: {
    backgroundColor: color.borderStrong,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
  },
  connectedText: {
    color: color.progress,
  },
});
