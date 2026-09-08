import { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet, useWindowDimensions,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PurchasesPackage } from 'react-native-purchases';
import { revenueCatService } from '../../services/revenueCatService';
import { useCreditStore, getCreditDisplayInfo } from '../../stores/creditStore';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

const SHEET_HEIGHT_RATIO = 0.92;

// ── Product metadata for fallback display ─────────────────────────
const CREDIT_PACKS = [
  { productId: 'iqra_credits_10', credits: 10, fallbackPrice: '$2.99', priceNum: 2.99, icon: 'sparkles' as const },
  { productId: 'iqra_credits_50', credits: 50, fallbackPrice: '$9.99', priceNum: 9.99, icon: 'diamond' as const, popular: true },
  { productId: 'iqra_credits_200', credits: 200, fallbackPrice: '$29.99', priceNum: 29.99, icon: 'rocket' as const },
];

const CUSTOM_QUICK_AMOUNTS = [5, 15, 25, 75, 100, 150];

/** Given a desired credit amount, compute the cheapest combination of packs. */
function computePackCombo(desired: number): { packId: string; qty: number; credits: number; unitPrice: number }[] {
  if (desired <= 0) return [];
  const combo: { packId: string; qty: number; credits: number; unitPrice: number }[] = [];
  let remaining = desired;

  // Greedy from largest (best $/credit) to smallest
  const sorted = [...CREDIT_PACKS].sort((a, b) => b.credits - a.credits);
  for (const pack of sorted) {
    if (remaining >= pack.credits) {
      const qty = Math.floor(remaining / pack.credits);
      combo.push({ packId: pack.productId, qty, credits: pack.credits, unitPrice: pack.priceNum });
      remaining -= qty * pack.credits;
    }
  }
  // If there's still a remainder, buy one more of the smallest pack
  if (remaining > 0) {
    const smallest = sorted[sorted.length - 1];
    const existing = combo.find((c) => c.packId === smallest.productId);
    if (existing) {
      existing.qty += 1;
    } else {
      combo.push({ packId: smallest.productId, qty: 1, credits: smallest.credits, unitPrice: smallest.priceNum });
    }
  }
  return combo;
}

const PREMIUM_FEATURES = [
  { icon: 'infinite-outline' as const, labelKey: 'purchase.featureUnlimited' },
  { icon: 'flash-outline' as const, labelKey: 'purchase.featurePriority' },
  { icon: 'diamond-outline' as const, labelKey: 'purchase.featurePremiumModels' },
  { icon: 'heart-outline' as const, labelKey: 'purchase.featureSupport' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CreditPurchaseSheet({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Live height: a sheet sized at import slides to the wrong offset after a
  // rotation.
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Credit store values
  const creditBalance = useCreditStore((s) => s.creditBalance);
  const subStatus = useCreditStore((s) => s.subscriptionStatus);
  const subExpires = useCreditStore((s) => s.subscriptionExpiresAt);
  const freeUsed = useCreditStore((s) => s.freeMessagesUsed);
  const freeDate = useCreditStore((s) => s.freeMessagesDate);
  const creditInfo = getCreditDisplayInfo({
    creditBalance, subscriptionStatus: subStatus,
    subscriptionExpiresAt: subExpires, freeMessagesUsed: freeUsed,
    freeMessagesDate: freeDate,
  });

  // ── Load offerings on mount ──────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    loadOfferings();
  }, [visible]);

  async function loadOfferings() {
    setLoading(true);
    try {
      const offerings = await revenueCatService.getOfferings();
      if (offerings?.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch {
      // Fall back to static display
    } finally {
      setLoading(false);
    }
  }

  // ── Animations ───────────────────────────────────────────────────
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

  const handleClose = useCallback(() => {
    animateOut(() => onClose());
  }, [onClose]);

  // ── Find a package by product ID ─────────────────────────────────
  function findPackage(productId: string): PurchasesPackage | undefined {
    return packages.find((p) => p.product.identifier === productId);
  }

  // ── Purchase handler ─────────────────────────────────────────────
  async function handlePurchase(productId: string) {
    const pkg = findPackage(productId);

    // Dev mode: simulate purchase when real packages aren't available (e.g. Expo Go)
    if (!pkg && __DEV__) {
      setPurchasing(productId);
      try {
        const success = await revenueCatService.devPurchase(productId);
        if (success) handleClose();
      } finally {
        setPurchasing(null);
      }
      return;
    }

    if (!pkg) {
      Alert.alert(t('purchase.error'), t('purchase.notAvailable'));
      return;
    }

    setPurchasing(productId);
    try {
      const success = await revenueCatService.purchasePackage(pkg);
      if (success) {
        await useCreditStore.getState().syncCredits();
        handleClose();
      }
    } catch {
      Alert.alert(t('purchase.error'), t('purchase.errorDesc'));
    } finally {
      setPurchasing(null);
    }
  }

  // ── Restore handler ──────────────────────────────────────────────
  async function handleRestore() {
    setPurchasing('restore');
    try {
      await revenueCatService.restorePurchases();
      Alert.alert(t('ads.restoreSuccess'), t('ads.restoreSuccessDesc'));
    } catch {
      Alert.alert(t('ads.restoreError'), t('ads.restoreErrorDesc'));
    } finally {
      setPurchasing(null);
    }
  }

  // ── Custom amount purchase (sequential pack purchases) ──────────
  async function handleCustomPurchase() {
    const desired = parseInt(customAmount, 10);
    if (!desired || desired <= 0) return;

    const combo = computePackCombo(desired);
    setPurchasing('custom');

    try {
      // Dev mode: simulate all pack purchases at once
      if (__DEV__ && !packages.length) {
        for (const item of combo) {
          for (let i = 0; i < item.qty; i++) {
            await revenueCatService.devPurchase(item.packId);
          }
        }
        setCustomAmount('');
        setShowCustom(false);
        handleClose();
        return;
      }

      for (const item of combo) {
        const pkg = findPackage(item.packId);
        if (!pkg) {
          Alert.alert(t('purchase.error'), t('purchase.notAvailable'));
          return;
        }
        for (let i = 0; i < item.qty; i++) {
          const success = await revenueCatService.purchasePackage(pkg);
          if (!success) {
            // User cancelled
            await useCreditStore.getState().syncCredits();
            return;
          }
        }
      }
      await useCreditStore.getState().syncCredits();
      setCustomAmount('');
      setShowCustom(false);
      handleClose();
    } catch {
      Alert.alert(t('purchase.error'), t('purchase.errorDesc'));
    } finally {
      setPurchasing(null);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────
  function getPrice(productId: string, fallback: string): string {
    const pkg = findPackage(productId);
    return pkg?.product.priceString ?? fallback;
  }

  const premiumProductId = billingPeriod === 'monthly'
    ? 'iqra_premium_monthly'
    : 'iqra_premium_yearly';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={animateIn}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          style={[
            styles.sheet,
            {
              height: SCREEN_HEIGHT * SHEET_HEIGHT_RATIO,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* ── Drag handle ─────────────────────────────────────── */}
          <View style={styles.dragHandle} />

          {/* ── Header ──────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="wallet" size={20} color={color.warning} />
              <Text style={styles.headerTitle}>{t('purchase.title')}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={color.textMuted} />
            </Pressable>
          </View>

          {/* ── Balance display ──────────────────────────────────── */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>{t('purchase.currentBalance')}</Text>
            <View style={styles.balanceValue}>
              {creditInfo.isPremium ? (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={14} color={color.progress} />
                  <Text style={styles.premiumBadgeText}>{t('purchase.premiumActive')}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.balanceNumber}>{creditBalance}</Text>
                  <Text style={styles.balanceUnit}>{t('purchase.credits')}</Text>
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color={color.warning} style={{ marginTop: 40 }} />
            ) : (
              <>
                {/* ── Credit Packs ────────────────────────────────── */}
                <Text style={styles.sectionTitle}>{t('purchase.creditPacks')}</Text>
                <View style={styles.packsRow}>
                  {CREDIT_PACKS.map((pack) => {
                    const isActive = purchasing === pack.productId;
                    return (
                      <Pressable
                        key={pack.productId}
                        style={[styles.packCard, pack.popular && styles.packCardPopular]}
                        onPress={() => handlePurchase(pack.productId)}
                        disabled={!!purchasing}
                      >
                        {pack.popular && (
                          <View style={styles.popularTag}>
                            <Text style={styles.popularTagText}>{t('purchase.popular')}</Text>
                          </View>
                        )}
                        <Ionicons
                          name={pack.icon}
                          size={24}
                          color={pack.popular ? '#f59e0b' : '#94a3b8'}
                        />
                        <Text style={styles.packCredits}>{pack.credits}</Text>
                        <Text style={styles.packCreditsLabel}>{t('purchase.credits')}</Text>
                        {isActive ? (
                          <ActivityIndicator size="small" color={color.warning} style={{ marginTop: 8 }} />
                        ) : (
                          <Text style={[styles.packPrice, pack.popular && styles.packPricePopular]}>
                            {getPrice(pack.productId, pack.fallbackPrice)}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* ── Custom Amount ──────────────────────────────── */}
                {!showCustom ? (
                  <Pressable
                    style={styles.customToggle}
                    onPress={() => setShowCustom(true)}
                  >
                    <Ionicons name="options-outline" size={14} color={color.textMuted} />
                    <Text style={styles.customToggleText}>{t('purchase.customAmount')}</Text>
                  </Pressable>
                ) : (
                  <View style={styles.customSection}>
                    <Text style={styles.customTitle}>{t('purchase.customAmount')}</Text>

                    {/* Quick amount chips */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.quickChipsScroll}
                      contentContainerStyle={styles.quickChipsContent}
                    >
                      {CUSTOM_QUICK_AMOUNTS.map((amt) => {
                        const isSelected = customAmount === String(amt);
                        return (
                          <Pressable
                            key={amt}
                            style={[styles.quickChip, isSelected && styles.quickChipActive]}
                            onPress={() => setCustomAmount(String(amt))}
                          >
                            <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                              {amt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    {/* Input + buy */}
                    <View style={styles.customInputRow}>
                      <View style={styles.customInputWrap}>
                        <TextInput
                          style={styles.customInput}
                          value={customAmount}
                          onChangeText={(v) => setCustomAmount(v.replace(/[^0-9]/g, ''))}
                          keyboardType="number-pad"
                          placeholder={t('purchase.enterAmount')}
                          placeholderTextColor={color.textFaint}
                          maxLength={4}
                        />
                        <Text style={styles.customInputUnit}>{t('purchase.credits')}</Text>
                      </View>

                      <Pressable
                        style={[
                          styles.customBuyBtn,
                          (!customAmount || parseInt(customAmount, 10) <= 0) && styles.customBuyBtnDisabled,
                        ]}
                        onPress={handleCustomPurchase}
                        disabled={!!purchasing || !customAmount || parseInt(customAmount, 10) <= 0}
                      >
                        {purchasing === 'custom' ? (
                          <ActivityIndicator size="small" color={color.text} />
                        ) : (
                          <Text style={styles.customBuyBtnText}>{t('purchase.buy')}</Text>
                        )}
                      </Pressable>
                    </View>

                    {/* Price breakdown */}
                    {(() => {
                      const desired = parseInt(customAmount, 10);
                      if (!desired || desired <= 0) return null;
                      const combo = computePackCombo(desired);
                      const totalCredits = combo.reduce((sum, c) => sum + c.qty * c.credits, 0);
                      const totalPrice = combo.reduce((sum, c) => sum + c.qty * c.unitPrice, 0);
                      const bonus = totalCredits - desired;

                      return (
                        <View style={styles.breakdownCard}>
                          {combo.map((c) => (
                            <View key={c.packId} style={styles.breakdownRow}>
                              <Text style={styles.breakdownLabel}>
                                {c.qty}× {c.credits} {t('purchase.credits')}
                              </Text>
                              <Text style={styles.breakdownPrice}>
                                ${(c.qty * c.unitPrice).toFixed(2)}
                              </Text>
                            </View>
                          ))}
                          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                            <Text style={styles.breakdownTotalLabel}>
                              {totalCredits} {t('purchase.credits')}
                              {bonus > 0 ? ` (+${bonus} ${t('purchase.bonus')})` : ''}
                            </Text>
                            <Text style={styles.breakdownTotalPrice}>
                              ${totalPrice.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* ── Premium Subscription ────────────────────────── */}
                {!creditInfo.isPremium && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                      {t('purchase.premiumTitle')}
                    </Text>

                    {/* Billing toggle */}
                    <View style={styles.toggleRow}>
                      <Pressable
                        style={[styles.toggleBtn, billingPeriod === 'monthly' && styles.toggleBtnActive]}
                        onPress={() => setBillingPeriod('monthly')}
                      >
                        <Text style={[
                          styles.toggleText,
                          billingPeriod === 'monthly' && styles.toggleTextActive,
                        ]}>
                          {t('purchase.monthly')}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.toggleBtn, billingPeriod === 'yearly' && styles.toggleBtnActive]}
                        onPress={() => setBillingPeriod('yearly')}
                      >
                        <Text style={[
                          styles.toggleText,
                          billingPeriod === 'yearly' && styles.toggleTextActive,
                        ]}>
                          {t('purchase.yearly')}
                        </Text>
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>{t('purchase.save')}</Text>
                        </View>
                      </Pressable>
                    </View>

                    {/* Feature list */}
                    <View style={styles.premiumCard}>
                      {PREMIUM_FEATURES.map((feat, i) => (
                        <View key={i} style={styles.featureRow}>
                          <View style={styles.featureIconCircle}>
                            <Ionicons name={feat.icon} size={16} color={color.progress} />
                          </View>
                          <Text style={styles.featureText}>{t(feat.labelKey)}</Text>
                        </View>
                      ))}

                      <Pressable
                        style={styles.subscribeCta}
                        onPress={() => handlePurchase(premiumProductId)}
                        disabled={!!purchasing}
                      >
                        {purchasing === premiumProductId ? (
                          <ActivityIndicator size="small" color={color.text} />
                        ) : (
                          <Text style={styles.subscribeCtaText}>
                            {t('purchase.subscribeCta', {
                              price: getPrice(
                                premiumProductId,
                                billingPeriod === 'monthly' ? '$19.99/mo' : '$149.99/yr',
                              ),
                            })}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </>
                )}

                {/* ── Restore purchases ──────────────────────────── */}
                <Pressable
                  style={styles.restoreBtn}
                  onPress={handleRestore}
                  disabled={!!purchasing}
                >
                  {purchasing === 'restore' ? (
                    <ActivityIndicator size="small" color={color.textMuted} />
                  ) : (
                    <Text style={styles.restoreText}>{t('ads.restorePurchases')}</Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.borderStrong,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: color.text,
    fontSize: 17,
    fontWeight: '700',
  },

  // ── Balance ─────────────────────────────────────────────────────
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: color.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  balanceLabel: {
    color: color.textMuted,
    fontSize: 13,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  balanceNumber: {
    color: color.warning,
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  balanceUnit: {
    color: color.textMuted,
    fontSize: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withAlpha(color.progress, 0.13),
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: {
    color: color.progress,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Scroll area ─────────────────────────────────────────────────
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ── Section ─────────────────────────────────────────────────────
  sectionTitle: {
    color: color.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },

  // ── Credit pack cards ───────────────────────────────────────────
  packsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  packCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  packCardPopular: {
    borderColor: withAlpha(color.warning, 0.31),
    backgroundColor: color.surface,
  },
  popularTag: {
    position: 'absolute',
    top: -8,
    backgroundColor: color.warning,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  popularTagText: {
    color: color.textOnAccent,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packCredits: {
    color: color.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  packCreditsLabel: {
    color: color.textFaint,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packPrice: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  packPricePopular: {
    color: color.warning,
  },

  // ── Custom amount ──────────────────────────────────────────────
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: 'dashed',
  },
  customToggleText: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  customSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  customTitle: {
    color: color.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  quickChipsScroll: {
    marginBottom: 12,
  },
  quickChipsContent: {
    gap: 8,
  },
  quickChip: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: color.border,
  },
  quickChipActive: {
    backgroundColor: withAlpha(color.warning, 0.13),
    borderColor: color.warning,
  },
  quickChipText: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: color.warning,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  customInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 14,
    height: 44,
  },
  customInput: {
    flex: 1,
    color: color.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  customInputUnit: {
    color: color.textFaint,
    fontSize: 12,
    marginLeft: 4,
  },
  customBuyBtn: {
    backgroundColor: color.warning,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBuyBtnDisabled: {
    opacity: 0.4,
  },
  customBuyBtnText: {
    color: color.text,
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownCard: {
    marginTop: 10,
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  breakdownLabel: {
    color: color.textMuted,
    fontSize: 12,
  },
  breakdownPrice: {
    color: color.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: color.border,
    marginTop: 6,
    paddingTop: 6,
  },
  breakdownTotalLabel: {
    color: color.text,
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownTotalPrice: {
    color: color.warning,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // ── Billing toggle ──────────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: color.surfaceRaised,
  },
  toggleText: {
    color: color.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: color.text,
  },
  saveBadge: {
    backgroundColor: withAlpha(color.progress, 0.19),
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  saveBadgeText: {
    color: color.progress,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // ── Premium card ────────────────────────────────────────────────
  premiumCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureIconCircle: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.progress, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: color.textMuted,
    fontSize: 13,
    flex: 1,
  },
  subscribeCta: {
    backgroundColor: color.progress,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  subscribeCtaText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Restore ─────────────────────────────────────────────────────
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  restoreText: {
    color: color.textFaint,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
