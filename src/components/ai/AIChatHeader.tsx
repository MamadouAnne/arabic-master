import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AIModuleContext, AIModelChoice } from '../../types/aiChat';
import { CreditDisplayInfo } from '../../types/credits';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface Props {
  module: AIModuleContext;
  model: AIModelChoice;
  creditInfo: CreditDisplayInfo;
  onClear: () => void;
  onClose: () => void;
  onCreditPress?: () => void;
  onTeacherSwitch?: () => void;
}

const MODULE_I18N_KEYS: Record<AIModuleContext, string> = {
  alphabet: 'ai.moduleAlphabet',
  vocabulary: 'ai.moduleVocabulary',
  grammar: 'ai.moduleGrammar',
  verbs: 'ai.moduleVerbs',
  reading: 'ai.moduleReading',
  practice: 'ai.modulePractice',
  quran: 'ai.moduleQuran',
  prayer: 'ai.modulePrayer',
  duas: 'ai.moduleDuas',
  general: 'ai.moduleGeneral',
};

// ── Teacher identity per model ────────────────────────────────────
const TEACHER_CONFIG: Record<AIModelChoice, {
  name: string;
  arabicName: string;
  avatarLetter: string;
  avatarColor: string;
  avatarImage?: ImageSourcePropType;
  traits: { icon: string; labelKey: string }[];
}> = {
  haiku: {
    name: 'Ustadh Ali',
    arabicName: 'أُسْتَاذ عَلِي',
    avatarLetter: 'ع',
    avatarColor: color.progress,
    avatarImage: require('../../../assets/images/teachers/ustadh-ali.png'),
    traits: [
      { icon: 'flash-outline', labelKey: 'ai.traitFast' },
      { icon: 'chatbubble-ellipses-outline', labelKey: 'ai.traitFriendly' },
      { icon: 'bulb-outline', labelKey: 'ai.traitConcise' },
      { icon: 'wallet-outline', labelKey: 'ai.traitCheap' },
    ],
  },
  sonnet: {
    name: 'Ustadh Ibrahim',
    arabicName: 'أُسْتَاذ إِبْرَاهِيم',
    avatarLetter: 'إ',
    avatarColor: color.sacred,
    avatarImage: require('../../../assets/images/teachers/ustadh-ibrahim.png'),
    traits: [
      { icon: 'school-outline', labelKey: 'ai.traitScholarly' },
      { icon: 'book-outline', labelKey: 'ai.traitDetailed' },
      { icon: 'diamond-outline', labelKey: 'ai.traitAdvanced' },
      { icon: 'sparkles-outline', labelKey: 'ai.traitPremium' },
    ],
  },
};

export function AIChatHeader({ module, model, creditInfo, onClear, onClose, onCreditPress, onTeacherSwitch }: Props) {
  const { t } = useTranslation();
  const teacher = TEACHER_CONFIG[model];
  const otherModel: AIModelChoice = model === 'haiku' ? 'sonnet' : 'haiku';
  const otherTeacher = TEACHER_CONFIG[otherModel];
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleConfirmSwitch = () => {
    setShowSwitchModal(false);
    onTeacherSwitch?.();
  };

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      {/* Top row: avatar + name + close */}
      <View style={styles.topRow}>
        <View style={styles.teacherInfo}>
          {teacher.avatarImage ? (
            <Image source={teacher.avatarImage} style={[styles.avatarImage, { borderColor: teacher.avatarColor }]} />
          ) : (
            <View style={[styles.avatarCircle, { backgroundColor: teacher.avatarColor }]}>
              <Text style={styles.avatarText}>{teacher.avatarLetter}</Text>
            </View>
          )}
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{teacher.name}</Text>
            <Text style={[styles.arabicName, { color: teacher.avatarColor }]}>{teacher.arabicName}</Text>
          </View>
        </View>

        {/* Close button */}
        <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={color.textMuted} />
        </Pressable>
      </View>

      {/* Bottom row: module badge + switch teacher + credits + clear */}
      <View style={styles.bottomRow}>
        <View style={styles.moduleBadge}>
          <Text style={styles.moduleBadgeText}>{t(MODULE_I18N_KEYS[module])}</Text>
        </View>

        <View style={styles.actions}>
          {/* Switch teacher chip */}
          <Pressable
            onPress={() => setShowSwitchModal(true)}
            style={styles.switchChip}
            hitSlop={4}
          >
            {otherTeacher.avatarImage ? (
              <Image source={otherTeacher.avatarImage} style={styles.switchAvatar} />
            ) : (
              <View style={[styles.switchAvatarFallback, { backgroundColor: otherTeacher.avatarColor }]}>
                <Text style={styles.switchAvatarText}>{otherTeacher.avatarLetter}</Text>
              </View>
            )}
            <Text style={styles.switchChipText}>{t('ai.switchTo', { name: otherTeacher.name.split(' ')[1] })}</Text>
          </Pressable>

          {/* Credits / Premium */}
          {creditInfo.isPremium ? (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color={color.progress} />
              <Text style={styles.premiumText}>{t('ai.premium')}</Text>
            </View>
          ) : (
            <Pressable
              onPress={onCreditPress}
              style={[
                styles.buyBtn,
                creditInfo.source === 'empty' && styles.buyBtnUrgent,
              ]}
              hitSlop={4}
            >
              <Text style={[
                styles.creditsText,
                creditInfo.source === 'empty' && styles.creditsTextEmpty,
              ]}>
                {creditInfo.remaining}
              </Text>
              <Ionicons
                name="wallet-outline"
                size={13}
                color={creditInfo.source === 'empty' ? '#fff' : '#f59e0b'}
              />
            </Pressable>
          )}

          {/* Clear conversation */}
          <Pressable onPress={onClear} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={color.textFaint} />
          </Pressable>
        </View>
      </View>

      {/* ── Switch Teacher Modal ──────────────────────────────────── */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSwitchModal(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSwitchModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('ai.chooseTeacher')}</Text>
            <Text style={styles.modalSubtitle}>{t('ai.chooseTeacherDesc')}</Text>

            {/* Teacher comparison cards */}
            <View style={styles.teacherCards}>
              {/* Current teacher */}
              <View style={[styles.teacherCard, { borderColor: teacher.avatarColor + '50' }]}>
                <View style={[styles.currentTag, { backgroundColor: teacher.avatarColor + '20' }]}>
                  <Text style={[styles.currentTagText, { color: teacher.avatarColor }]}>{t('ai.current')}</Text>
                </View>
                {teacher.avatarImage ? (
                  <Image source={teacher.avatarImage} style={styles.modalAvatar} />
                ) : (
                  <View style={[styles.modalAvatarCircle, { backgroundColor: teacher.avatarColor }]}>
                    <Text style={styles.modalAvatarText}>{teacher.avatarLetter}</Text>
                  </View>
                )}
                <Text style={styles.teacherCardName}>{teacher.name}</Text>
                <Text style={[styles.teacherCardArabic, { color: teacher.avatarColor }]}>{teacher.arabicName}</Text>
                <View style={styles.traitsList}>
                  {teacher.traits.map((trait, i) => (
                    <View key={i} style={styles.traitRow}>
                      <Ionicons name={trait.icon as any} size={14} color={teacher.avatarColor} />
                      <Text style={styles.traitLabel}>{t(trait.labelKey)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Other teacher */}
              <View style={[styles.teacherCard, styles.teacherCardOther, { borderColor: otherTeacher.avatarColor + '50' }]}>
                {otherTeacher.avatarImage ? (
                  <Image source={otherTeacher.avatarImage} style={styles.modalAvatar} />
                ) : (
                  <View style={[styles.modalAvatarCircle, { backgroundColor: otherTeacher.avatarColor }]}>
                    <Text style={styles.modalAvatarText}>{otherTeacher.avatarLetter}</Text>
                  </View>
                )}
                <Text style={styles.teacherCardName}>{otherTeacher.name}</Text>
                <Text style={[styles.teacherCardArabic, { color: otherTeacher.avatarColor }]}>{otherTeacher.arabicName}</Text>
                <View style={styles.traitsList}>
                  {otherTeacher.traits.map((trait, i) => (
                    <View key={i} style={styles.traitRow}>
                      <Ionicons name={trait.icon as any} size={14} color={otherTeacher.avatarColor} />
                      <Text style={styles.traitLabel}>{t(trait.labelKey)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <Pressable
              style={[styles.switchBtn, { backgroundColor: otherTeacher.avatarColor }]}
              onPress={handleConfirmSwitch}
            >
              <Ionicons name="swap-horizontal" size={18} color={color.text} />
              <Text style={styles.switchBtnText}>{t('ai.switchTo', { name: otherTeacher.name })}</Text>
            </Pressable>

            <Pressable onPress={() => setShowSwitchModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>{t('ai.keepCurrent', { name: teacher.name.split(' ')[1] })}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    backgroundColor: color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.borderStrong,
    alignSelf: 'center',
    marginBottom: 12,
  },

  // ── Top row ───────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: color.text,
    fontSize: 20,
    fontWeight: '700',
  },
  nameBlock: {
    gap: 1,
  },
  name: {
    color: color.text,
    fontSize: 16,
    fontWeight: '700',
  },
  arabicName: {
    fontFamily: font.arabic,
    lineHeight: 22,
    fontSize: 13,
  },

  // ── Bottom row ────────────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  moduleBadge: {
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moduleBadgeText: {
    color: color.textMuted,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ── Switch teacher chip ───────────────────────────────────────
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.bg,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: color.border,
  },
  switchAvatar: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
  },
  switchAvatarFallback: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAvatarText: {
    color: color.text,
    fontSize: 9,
    fontWeight: '700',
  },
  switchChipText: {
    color: color.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Credits / Premium ─────────────────────────────────────────
  creditsText: {
    color: color.warning,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  creditsTextEmpty: {
    color: color.text,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.bg,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: withAlpha(color.warning, 0.19),
  },
  buyBtnUrgent: {
    backgroundColor: color.warning,
    borderColor: color.warning,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withAlpha(color.progress, 0.09),
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  premiumText: {
    color: color.progress,
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
  },

  // ── Modal ─────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: color.border,
  },
  modalTitle: {
    color: color.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: color.textFaint,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // ── Teacher comparison cards ──────────────────────────────────
  teacherCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  teacherCard: {
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  teacherCardOther: {
    backgroundColor: color.surface,
  },
  currentTag: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  currentTagText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
  },
  modalAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalAvatarText: {
    color: color.text,
    fontSize: 24,
    fontWeight: '700',
  },
  teacherCardName: {
    color: color.text,
    fontSize: 13,
    fontWeight: '700',
  },
  teacherCardArabic: {
    fontFamily: font.arabic,
    lineHeight: 19,
    fontSize: 11,
    marginTop: 1,
    marginBottom: 10,
  },
  traitsList: {
    gap: 6,
    width: '100%',
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  traitLabel: {
    color: color.textMuted,
    fontSize: 11,
    flex: 1,
  },

  // ── Action buttons ────────────────────────────────────────────
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  switchBtnText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelBtnText: {
    color: color.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
});
