import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Alert, ActivityIndicator, Image, TextInput, Linking, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProgressStore } from '../../src/stores/progressStore';
import { ACHIEVEMENTS, Achievement } from '../../src/data/achievements';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { signOut, deleteAccount } from '../../src/services/authService';
import { getProfile, upsertProfile } from '../../src/services/profileService';
import { useRouter, Href } from 'expo-router';
import { useAdStore } from '../../src/stores/adStore';
import { iapService } from '../../src/services/iapService';
import { ENABLE_ADS } from '../../src/services/adService';
import { useCreditStore, getCreditDisplayInfo } from '../../src/stores/creditStore';
import { CreditPurchaseSheet } from '../../src/components/ai/CreditPurchaseSheet';
import { revenueCatService } from '../../src/services/revenueCatService';
import { useCommunityStore } from '../../src/stores/communityStore';
import * as communityService from '../../src/services/communityService';
import { LeaderboardType } from '../../src/types/community';
import { LeaderboardPreview } from '../../src/components/community/LeaderboardPreview';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { language, setLanguage, isAuthenticated } = useSettingsStore();

  const {
    progress,
    getAccuracy,
    resetProgress,
    unlockedAchievements,
    newAchievement,
    clearNewAchievement,
    getUnlockedAchievements,
  } = useProgressStore();

  const unlockedList = getUnlockedAchievements();
  const lockedList = ACHIEVEMENTS.filter((a) => !unlockedAchievements.includes(a.id));

  // ── Community / Gamification data ──────────────────────────────
  const [lbType, setLbType] = useState<LeaderboardType>('allTime');
  const [refreshing, setRefreshing] = useState(false);
  const userId = useSettingsStore((s) => s.user?.id);

  const {
    dailyChallenge,
    initializeChallenges,
    fetchCommunityStats,
    fetchLeaderboard,
    leaderboardEntries,
    isLoadingLeaderboard,
  } = useCommunityStore();

  useEffect(() => {
    initializeChallenges();
    if (userId && progress.totalXp > 0) {
      communityService.syncProgress(userId, progress.totalXp, progress.currentStreak, progress.longestStreak);
    }
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    fetchLeaderboard(lbType, userId);
  }, [lbType, userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    initializeChallenges();
    await Promise.all([
      fetchCommunityStats(true),
      fetchLeaderboard(lbType, userId, true),
    ]);
    setRefreshing(false);
  }, [initializeChallenges, fetchCommunityStats, fetchLeaderboard, lbType, userId]);

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleLogOut = () => {
    Alert.alert(
      t('profile.logOutConfirmTitle'),
      t('profile.logOutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to permanently delete your profile and all associated data? This action cannot be undone.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Delete Profile',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your profile, progress, and all data. Are you absolutely sure?',
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    try {
                      await deleteAccount();
                    } catch (e: any) {
                      Alert.alert(t('common.error') || 'Error', e.message || 'Could not delete account. Please try again.');
                      setIsDeletingAccount(false);
                      return;
                    }
                    try {
                      resetProgress();
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Remove Ads / Premium
  const isPremium = useAdStore((s) => s.isPremium);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [removeAdsPrice, setRemoveAdsPrice] = useState<string | null>(null);

  useEffect(() => {
    if (ENABLE_ADS && !isPremium) {
      let isMounted = true;
      iapService.getRemoveAdsProduct().then((product) => {
        if (isMounted && product) setRemoveAdsPrice(product.displayPrice);
      }).catch(() => {});
      return () => { isMounted = false; };
    }
  }, [isPremium]);

  const handlePurchaseRemoveAds = async () => {
    setIsPurchasing(true);
    try {
      await iapService.purchaseRemoveAds();
    } catch (e: any) {
      Alert.alert(t('ads.purchaseError'), e.message || t('ads.purchaseErrorDesc'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const restored = await iapService.restorePurchases();
      if (restored) {
        Alert.alert(t('ads.restoreSuccess'), t('ads.restoreSuccessDesc'));
      } else {
        Alert.alert(t('ads.restoreNone'), t('ads.restoreNoneDesc'));
      }
    } catch (e: any) {
      Alert.alert(t('ads.restoreError'), e.message || t('ads.restoreErrorDesc'));
    } finally {
      setIsRestoring(false);
    }
  };

  // Profile info
  const user = useSettingsStore((s) => s.user);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (user?.id) {
      let isMounted = true;
      getProfile(user.id)
        .then((profile) => {
          if (isMounted && profile?.display_name) setDisplayName(profile.display_name);
        })
        .catch(() => {});
      return () => { isMounted = false; };
    }
  }, [user?.id]);

  const handleEditName = () => {
    setEditNameValue(displayName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || !user?.id) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await upsertProfile(user.id, { display_name: trimmed });
      setDisplayName(trimmed);
      setIsEditingName(false);
    } catch {
      Alert.alert(t('common.error') || 'Error', t('profile.saveNameError') || 'Could not save name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditNameValue('');
  };

  // ── Subscription & Credits ──────────────────────────────────────
  const creditBalance = useCreditStore((s) => s.creditBalance);
  const subStatus = useCreditStore((s) => s.subscriptionStatus);
  const subPlan = useCreditStore((s) => s.subscriptionPlan);
  const subExpires = useCreditStore((s) => s.subscriptionExpiresAt);
  const freeUsed = useCreditStore((s) => s.freeMessagesUsed);
  const freeDate = useCreditStore((s) => s.freeMessagesDate);
  const creditInfo = getCreditDisplayInfo({
    creditBalance, subscriptionStatus: subStatus,
    subscriptionExpiresAt: subExpires, freeMessagesUsed: freeUsed,
    freeMessagesDate: freeDate,
  });

  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  const formatExpiryDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { return dateStr; }
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleRestoreCreditPurchases = async () => {
    setIsRestoringPurchases(true);
    try {
      await revenueCatService.restorePurchases();
      Alert.alert(t('ads.restoreSuccess'), t('ads.restoreSuccessDesc'));
    } catch {
      Alert.alert(t('ads.restoreError'), t('ads.restoreErrorDesc'));
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  const getAchievementProgress = (achievement: Achievement): number => {
    const { type, value } = achievement.condition;
    let current = 0;

    switch (type) {
      case 'letters_learned':
        current = progress.alphabetProgress.lettersLearned.length;
        break;
      case 'words_learned':
        current = progress.vocabularyProgress.wordsLearned.length;
        break;
      case 'lessons_completed':
        current = progress.grammarProgress.lessonsCompleted.length;
        break;
      case 'streak_days':
        current = Math.max(progress.currentStreak, progress.longestStreak);
        break;
      case 'total_xp':
        current = progress.totalXp;
        break;
      case 'exercises_completed':
        current = progress.exerciseResults.totalCompleted;
        break;
      case 'accuracy':
        current = progress.exerciseResults.totalCompleted > 0
          ? Math.round((progress.exerciseResults.totalCorrect / progress.exerciseResults.totalCompleted) * 100)
          : 0;
        break;
      case 'verbs_learned':
        current = progress.verbProgress.verbsLearned.length;
        break;
      default:
        current = 0;
    }

    return Math.min(Math.round((current / value) * 100), 100);
  };

  const categoryColors: Record<string, string> = {
    learning: '#6366f1',
    streak: '#f59e0b',
    mastery: '#22c55e',
    special: '#D4AF37',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            colors={['#f97316']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <Text style={styles.titleArabic}>الْمَلَفُّ الشَّخْصِي</Text>
          </View>
          <Image
            source={require('../../assets/images/adaptive-icon.png')}
            style={styles.appIcon}
          />
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-circle" size={56} color="#818cf8" />
          </View>
          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  ref={nameInputRef}
                  style={styles.editNameInput}
                  value={editNameValue}
                  onChangeText={setEditNameValue}
                  placeholder={t('profile.enterName') || 'Enter your name'}
                  placeholderTextColor="#64748b"
                  maxLength={50}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <View style={styles.editNameActions}>
                  {isSavingName ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <>
                      <Pressable onPress={handleSaveName} style={styles.editNameBtn} accessibilityRole="button" accessibilityLabel="Save">
                        <Ionicons name="checkmark" size={20} color="#10b981" />
                      </Pressable>
                      <Pressable onPress={handleCancelEditName} style={styles.editNameBtn} accessibilityRole="button" accessibilityLabel="Cancel">
                        <Ionicons name="close" size={20} color="#ef4444" />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {displayName || user?.email?.split('@')[0] || t('profile.learner') || 'Learner'}
                </Text>
                <Pressable onPress={handleEditName} style={styles.editNameBtn} accessibilityRole="button" accessibilityLabel={t('profile.editName') || 'Edit name'}>
                  <Ionicons name="pencil" size={16} color="#64748b" />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardMain}>
            <Ionicons name="star" size={28} color="#f59e0b" />
            <Text style={styles.xpCardValue}>{progress.totalXp}</Text>
            <Text style={styles.xpCardLabel}>XP</Text>
          </View>
          <View style={styles.xpCardDivider} />
          <View style={styles.xpCardStats}>
            <View style={styles.xpCardStat}>
              <Ionicons name="flame" size={18} color="#f59e0b" />
              <Text style={styles.xpCardStatValue}>{progress.currentStreak}</Text>
              <Text style={styles.xpCardStatLabel}>{t('profile.dayStreak')}</Text>
            </View>
            <View style={styles.xpCardStat}>
              <Ionicons name="trophy" size={18} color="#D4AF37" />
              <Text style={styles.xpCardStatValue}>{progress.longestStreak}</Text>
              <Text style={styles.xpCardStatLabel}>{t('profile.bestStreak')}</Text>
            </View>
            <View style={styles.xpCardStat}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.xpCardStatValue}>{progress.exerciseResults.totalCompleted}</Text>
              <Text style={styles.xpCardStatLabel}>{t('profile.exercises')}</Text>
            </View>
            <View style={styles.xpCardStat}>
              <Ionicons name="analytics" size={18} color="#6366f1" />
              <Text style={styles.xpCardStatValue}>{getAccuracy()}%</Text>
              <Text style={styles.xpCardStatLabel}>{t('profile.accuracy')}</Text>
            </View>
          </View>
        </View>

        {/* Shortcut Cards — Leaderboard + Challenges */}
        <View style={styles.shortcutCardsRow}>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/community/leaderboard' as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('community.leaderboard')}
          >
            <View style={[styles.shortcutIconContainer, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
              <Ionicons name="trophy" size={26} color="#D4AF37" />
            </View>
            <Text style={styles.shortcutTitle}>{t('community.leaderboard')}</Text>
            <Text style={styles.shortcutTitleArabic}>الترتيب</Text>
          </Pressable>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/community/challenges' as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('community.challenges')}
          >
            <View style={[styles.shortcutIconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Ionicons name="flag" size={26} color="#f97316" />
            </View>
            <Text style={styles.shortcutTitle}>{t('community.challenges')}</Text>
            <Text style={styles.shortcutTitleArabic}>التحديات</Text>
            {dailyChallenge && (
              <Text style={styles.shortcutSubtitle} numberOfLines={1}>
                {dailyChallenge.currentValue}/{dailyChallenge.targetValue}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Embedded Leaderboard Preview */}
        <LeaderboardPreview
          entries={leaderboardEntries}
          isLoading={isLoadingLeaderboard}
          currentType={lbType}
          onTypeChange={setLbType}
        />

        {/* Subscription & Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('purchase.subscriptionAndCredits')}</Text>
          <View style={styles.subCard}>
            {/* ── Current Plan Row ──────────────────────────── */}
            <View style={styles.subPlanRow}>
              <View style={[
                styles.subPlanIcon,
                creditInfo.isPremium ? styles.subPlanIconPremium : styles.subPlanIconFree,
              ]}>
                <Ionicons
                  name={creditInfo.isPremium ? 'diamond' : 'person-outline'}
                  size={20}
                  color={creditInfo.isPremium ? '#10b981' : '#94a3b8'}
                />
              </View>
              <View style={styles.subPlanInfo}>
                <Text style={styles.subPlanName}>
                  {creditInfo.isPremium
                    ? (subPlan === 'monthly' ? t('purchase.premiumMonthly') : t('purchase.premiumYearly'))
                    : t('purchase.freePlan')}
                </Text>
                <Text style={styles.subPlanStatus}>
                  {creditInfo.isPremium && subStatus === 'active' && subExpires
                    ? t('purchase.renewsOn', { date: formatExpiryDate(subExpires) })
                    : subStatus === 'cancelled' && subExpires
                    ? t('purchase.cancelledExpires', { date: formatExpiryDate(subExpires) })
                    : subStatus === 'expired' && subExpires
                    ? t('purchase.expiredOn', { date: formatExpiryDate(subExpires) })
                    : !creditInfo.isPremium
                    ? t('purchase.freePlanDesc')
                    : ''}
                </Text>
              </View>
              {creditInfo.isPremium && (
                <View style={styles.subActiveBadge}>
                  <Text style={styles.subActiveBadgeText}>{t('purchase.premiumActive')}</Text>
                </View>
              )}
            </View>

            <View style={styles.subDivider} />

            {/* ── Credit Balance Row ─────────────────────────── */}
            <View style={styles.subCreditsRow}>
              <View style={styles.subCreditsLeft}>
                <View style={styles.subCreditsIcon}>
                  <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.subCreditsLabel}>{t('purchase.creditBalance')}</Text>
                  <Text style={styles.subCreditsValue}>
                    {creditBalance > 0
                      ? t('purchase.creditsRemaining', { count: creditBalance })
                      : t('purchase.noCreditsYet')}
                  </Text>
                </View>
              </View>
              <Text style={styles.subCreditsNumber}>{creditBalance}</Text>
            </View>

            <View style={styles.subDivider} />

            {/* ── Action Buttons ──────────────────────────────── */}
            <View style={styles.subActions}>
              {creditInfo.isPremium ? (
                <Pressable style={styles.subManageBtn} onPress={handleManageSubscription}>
                  <Ionicons name="settings-outline" size={16} color="#f5f5f0" />
                  <Text style={styles.subManageBtnText}>{t('purchase.manageSub')}</Text>
                  <Ionicons name="open-outline" size={14} color="#94a3b8" />
                </Pressable>
              ) : (
                <Pressable
                  style={styles.subUpgradeBtn}
                  onPress={() => setShowPurchaseSheet(true)}
                >
                  <Ionicons name="diamond-outline" size={16} color="#fff" />
                  <Text style={styles.subUpgradeBtnText}>{t('purchase.upgradeToPremium')}</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.subGetCreditsBtn}
                onPress={() => setShowPurchaseSheet(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#f59e0b" />
                <Text style={styles.subGetCreditsBtnText}>{t('purchase.getCredits')}</Text>
              </Pressable>
            </View>

            {/* ── Restore Purchases ──────────────────────────── */}
            <Pressable
              style={styles.subRestoreBtn}
              onPress={handleRestoreCreditPurchases}
              disabled={isRestoringPurchases}
            >
              {isRestoringPurchases ? (
                <ActivityIndicator size="small" color="#6b6b60" />
              ) : (
                <Text style={styles.subRestoreText}>{t('purchase.restorePurchases')}</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.achievementHeader}>
            <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
            <View style={styles.achievementCount}>
              <Ionicons name="trophy" size={14} color="#D4AF37" />
              <Text style={styles.achievementCountText}>
                {unlockedList.length}/{ACHIEVEMENTS.length}
              </Text>
            </View>
          </View>

          {/* Unlocked Achievements */}
          {unlockedList.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.achievementSubtitle}>{t('profile.unlocked')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.achievementScroll}
              >
                {unlockedList.map((achievement) => (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      { borderColor: categoryColors[achievement.category] + '60' }
                    ]}
                  >
                    <View style={[
                      styles.achievementIcon,
                      { backgroundColor: categoryColors[achievement.category] + '20' }
                    ]}>
                      <Ionicons
                        name={achievement.icon as any}
                        size={24}
                        color={categoryColors[achievement.category]}
                      />
                    </View>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementTitleArabic}>{achievement.titleArabic}</Text>
                    <View style={styles.achievementXp}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.achievementXpText}>+{achievement.xpReward} XP</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Locked Achievements (show next 4) */}
          {lockedList.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.achievementSubtitle}>{t('profile.nextUp')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.achievementScroll}
              >
                {lockedList.slice(0, 6).map((achievement) => {
                  const progressPercent = getAchievementProgress(achievement);
                  return (
                    <View
                      key={achievement.id}
                      style={[styles.achievementCard, styles.achievementCardLocked]}
                    >
                      <View style={[styles.achievementIcon, styles.achievementIconLocked]}>
                        <Ionicons
                          name={achievement.icon as any}
                          size={24}
                          color="#64748b"
                        />
                      </View>
                      <Text style={[styles.achievementTitle, styles.achievementTitleLocked]}>
                        {achievement.title}
                      </Text>
                      <Text style={styles.achievementDesc} numberOfLines={2}>
                        {achievement.description}
                      </Text>
                      <View style={styles.achievementProgressBar}>
                        <View
                          style={[
                            styles.achievementProgressFill,
                            { width: `${progressPercent}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.achievementProgressText}>{progressPercent}%</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.settingsCard}>
            {/* Language Selector */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={22} color="#94a3b8" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{t('profile.language')}</Text>
                  <Text style={styles.settingDesc}>{t('profile.languageDesc')}</Text>
                </View>
              </View>
            </View>
            <View style={styles.languageOptions}>
              <Pressable
                style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
                onPress={() => handleLanguageChange('en')}
                accessibilityRole="button"
                accessibilityLabel={t('profile.english')}
                accessibilityState={{ selected: language === 'en' }}
              >
                <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextActive]}>
                  {t('profile.english')}
                </Text>
                {language === 'en' && <Ionicons name="checkmark" size={18} color="#818cf8" />}
              </Pressable>
              <Pressable
                style={[styles.languageOption, language === 'fr' && styles.languageOptionActive]}
                onPress={() => handleLanguageChange('fr')}
                accessibilityRole="button"
                accessibilityLabel={t('profile.french')}
                accessibilityState={{ selected: language === 'fr' }}
              >
                <Text style={[styles.languageOptionText, language === 'fr' && styles.languageOptionTextActive]}>
                  {t('profile.french')}
                </Text>
                {language === 'fr' && <Ionicons name="checkmark" size={18} color="#818cf8" />}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('legal.legal')}</Text>
          <View style={styles.settingsCard}>
            <Pressable
              style={styles.legalRow}
              onPress={() => router.push('/privacy-policy' as Href)}
              accessibilityRole="link"
              accessibilityLabel={t('legal.privacyPolicy')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#94a3b8" />
                <Text style={styles.settingTitle}>{t('legal.privacyPolicy')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </Pressable>
            <View style={styles.settingDivider} />
            <Pressable
              style={styles.legalRow}
              onPress={() => router.push('/terms-of-service' as Href)}
              accessibilityRole="link"
              accessibilityLabel={t('legal.termsOfService')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={22} color="#94a3b8" />
                <Text style={styles.settingTitle}>{t('legal.termsOfService')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </Pressable>
          </View>
        </View>

        {/* Remove Ads */}
        {ENABLE_ADS && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('ads.removeAds')}</Text>
            <View style={styles.storageCard}>
              {isPremium ? (
                <View style={styles.premiumBadgeRow}>
                  <View style={styles.premiumBadgeIcon}>
                    <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                  </View>
                  <View style={styles.premiumBadgeInfo}>
                    <Text style={styles.premiumBadgeTitle}>{t('ads.premiumActive')}</Text>
                    <Text style={styles.premiumBadgeDesc}>{t('ads.premiumActiveDesc')}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.removeAdsHeader}>
                    <View style={styles.removeAdsIcon}>
                      <Ionicons name="shield-checkmark" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.removeAdsInfo}>
                      <Text style={styles.storageTitle}>{t('ads.removeAdsTitle')}</Text>
                      <Text style={styles.storageSize}>{t('ads.removeAdsDesc')}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.purchaseButton}
                    onPress={handlePurchaseRemoveAds}
                    disabled={isPurchasing}
                    accessibilityRole="button"
                    accessibilityLabel={t('ads.removeAds')}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="cart" size={18} color="#ffffff" />
                        <Text style={styles.purchaseButtonText}>
                          {removeAdsPrice ? t('ads.purchaseFor', { price: removeAdsPrice }) : t('ads.removeAds')}
                        </Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.restoreButton}
                    onPress={handleRestorePurchases}
                    disabled={isRestoring}
                    accessibilityRole="button"
                    accessibilityLabel={t('ads.restorePurchases')}
                  >
                    {isRestoring ? (
                      <ActivityIndicator size="small" color="#94a3b8" />
                    ) : (
                      <Text style={styles.restoreButtonText}>{t('ads.restorePurchases')}</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        {/* Log Out */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Pressable style={styles.logOutButton} onPress={handleLogOut} accessibilityRole="button" accessibilityLabel={t('profile.logOut')}>
              <Ionicons name="log-out-outline" size={20} color="#f59e0b" />
              <Text style={styles.logOutButtonText}>{t('profile.logOut')}</Text>
            </Pressable>
          </View>
        )}

        {/* Reset Progress */}
        <View style={styles.section}>
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                t('profile.resetAllProgress'),
                t('profile.resetConfirmMessage'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('profile.resetAllProgress'), style: 'destructive', onPress: resetProgress },
                ]
              );
            }}
            accessibilityRole="button"
            accessibilityLabel={t('profile.resetAllProgress')}
          >
            <Ionicons name="refresh" size={20} color="#ef4444" />
            <Text style={styles.resetButtonText}>{t('profile.resetAllProgress')}</Text>
          </Pressable>
        </View>

        {/* Delete Profile */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Pressable
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
              accessibilityRole="button"
              accessibilityLabel="Delete Profile"
            >
              {isDeletingAccount ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={styles.deleteAccountButtonText}>Delete Profile</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Achievement Popup Modal */}
      <Modal
        visible={newAchievement !== null}
        transparent
        animationType="fade"
        onRequestClose={clearNewAchievement}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.achievementPopup}>
            <View style={styles.popupGlow} />
            <Text style={styles.popupTitle}>{t('profile.achievementUnlocked')}</Text>
            <Text style={styles.popupTitleArabic}>إنجاز جديد!</Text>
            {newAchievement && (
              <>
                <View style={[
                  styles.popupIcon,
                  { backgroundColor: categoryColors[newAchievement.category] + '20' }
                ]}>
                  <Ionicons
                    name={newAchievement.icon as any}
                    size={48}
                    color={categoryColors[newAchievement.category]}
                  />
                </View>
                <Text style={styles.popupAchievementTitle}>{newAchievement.title}</Text>
                <Text style={styles.popupAchievementArabic}>{newAchievement.titleArabic}</Text>
                <Text style={styles.popupDesc}>{newAchievement.description}</Text>
                <View style={styles.popupXpBadge}>
                  <Ionicons name="star" size={18} color="#f59e0b" />
                  <Text style={styles.popupXpText}>+{newAchievement.xpReward} XP</Text>
                </View>
              </>
            )}
            <Pressable style={styles.popupButton} onPress={clearNewAchievement} accessibilityRole="button" accessibilityLabel={t('common.continue')}>
              <Text style={styles.popupButtonText}>{t('common.continue')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <CreditPurchaseSheet
        visible={showPurchaseSheet}
        onClose={() => setShowPurchaseSheet(false)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  appIcon: {
    width: 68,
    height: 68,
    borderRadius: 16,
    marginTop: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 22,
    color: '#D4AF37',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editNameInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#ffffff',
    fontSize: 15,
  },
  editNameActions: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 4,
  },
  editNameBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f59e0b25',
  },
  xpCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  xpCardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f5f5f0',
  },
  xpCardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f59e0b',
  },
  xpCardDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  xpCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  xpCardStat: {
    alignItems: 'center',
    gap: 4,
  },
  xpCardStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5f0',
  },
  xpCardStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingLeft: 34,
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    gap: 6,
  },
  languageOptionActive: {
    backgroundColor: '#818cf820',
    borderWidth: 1,
    borderColor: '#818cf840',
  },
  languageOptionText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: '#818cf8',
    fontWeight: '600',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  logOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b40',
    gap: 8,
  },
  logOutButtonText: {
    color: '#f59e0b',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ef444440',
    gap: 8,
  },
  deleteAccountButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Achievement styles
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF3720',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementCountText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementsContainer: {
    marginBottom: 16,
  },
  achievementSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },
  achievementScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    width: 140,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  achievementIconLocked: {
    backgroundColor: '#334155',
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: '#94a3b8',
  },
  achievementTitleArabic: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  achievementDesc: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  achievementXp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementXpText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  achievementProgressText: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementPopup: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  popupGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 200,
    backgroundColor: '#D4AF37',
    borderRadius: 100,
    opacity: 0.15,
  },
  popupTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  popupTitleArabic: {
    color: '#D4AF37',
    fontSize: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  popupIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  popupAchievementTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  popupAchievementArabic: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 4,
  },
  popupDesc: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  popupXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  popupXpText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  popupButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  popupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // ── Subscription & Credits card ────────────────────────────────
  subCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subPlanIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subPlanIconPremium: {
    backgroundColor: '#10b98118',
  },
  subPlanIconFree: {
    backgroundColor: '#94a3b815',
  },
  subPlanInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subPlanName: {
    color: '#f5f5f0',
    fontSize: 15,
    fontWeight: '700',
  },
  subPlanStatus: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  subActiveBadge: {
    backgroundColor: '#10b98118',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subActiveBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  subDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  subCreditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subCreditsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCreditsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f59e0b15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCreditsLabel: {
    color: '#f5f5f0',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  subCreditsValue: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 12,
  },
  subCreditsNumber: {
    color: '#f59e0b',
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  subActions: {
    gap: 10,
  },
  subUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 8,
  },
  subUpgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  subManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 8,
  },
  subManageBtnText: {
    color: '#f5f5f0',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  subGetCreditsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b15',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#f59e0b30',
    gap: 8,
  },
  subGetCreditsBtnText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
  },
  subRestoreBtn: {
    alignItems: 'center',
    paddingTop: 14,
  },
  subRestoreText: {
    color: '#6b6b60',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  // ── Community gamification sections ──────────────────────────────
  shortcutCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  shortcutCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  shortcutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  shortcutTitleArabic: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
    textAlign: 'center',
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },

  // Storage styles
  storageCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  storageTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  storageSize: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  // Remove Ads styles
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  premiumBadgeTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumBadgeDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  removeAdsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeAdsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f59e0b20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAdsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  restoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  restoreButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
});
