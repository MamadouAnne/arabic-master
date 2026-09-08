import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useCommunityStore } from '../../stores/communityStore';
import { GROUP_TEMPLATES } from '../../data/community/groupTemplates';
import { localizeGoal } from '../../data/community/goalLocalization';
import { GroupTemplate } from '../../types/community';
import { color, radius } from '../../theme/tokens';

const GROUP_ICONS = ['book', 'school', 'mic', 'language', 'moon', 'star', 'people', 'flag'];
const GROUP_COLORS = [color.progress, color.warning, color.warning, color.accent, color.accent, color.warning, color.danger, color.progress];

export function GroupsTab() {
  const { t } = useTranslation();
  const { lc, language } = useLocalizedContent();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book');
  const [selectedColor, setSelectedColor] = useState<string>(color.progress);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');

  const {
    groups,
    isLoadingGroups,
    loadGroups,
    joinGroup,
    leaveGroup,
    createGroup,
  } = useCommunityStore();

  useEffect(() => {
    loadGroups();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, [loadGroups]);

  const handleJoin = async (groupId: string, isJoined: boolean) => {
    if (isJoined) {
      await leaveGroup(groupId);
    } else {
      await joinGroup(groupId);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newDesc.trim() || !newTopic.trim() || !newGoal.trim()) return;
    setIsCreating(true);
    await createGroup(newName.trim(), newDesc.trim(), newTopic.trim(), newGoal.trim(), selectedIcon, selectedColor);
    setIsCreating(false);
    setNewName('');
    setNewDesc('');
    setNewTopic('');
    setNewGoal('');
    setSelectedIcon('book');
    setSelectedColor(color.progress);
    setShowCreateModal(false);
  };

  // Filter by search, then sort
  const filtered = search.trim()
    ? groups.filter((g) => lc(g.name, g.nameFr).toLowerCase().includes(search.trim().toLowerCase()))
    : groups;
  const sorted = [...filtered].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.memberCount - a.memberCount;
  });

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={color.textFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('community.searchGroups', { defaultValue: 'Search groups...' })}
          placeholderTextColor={color.textFaint}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={color.textFaint} />
          </Pressable>
        )}
      </View>

      {isLoadingGroups ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={color.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.accent} />
          }
        >
          {/* Description */}
          <Text style={styles.desc}>{t('community.studyGroupsDesc')}</Text>

          {sorted.length === 0 ? (
            <Text style={styles.emptyText}>{t('community.noGroups')}</Text>
          ) : (
            sorted.map((group) => {
              const isJoined = group.isJoined;
              const isFull = group.memberCount >= group.maxMembers;

              return (
                <Pressable key={group.id} style={styles.card} onPress={() => router.push(`/community/groups/${group.id}` as any)}>
                  <View style={styles.cardTop}>
                    <View style={[styles.iconCircle, { backgroundColor: `${group.color}20` }]}>
                      <Ionicons name={group.icon as any} size={26} color={group.color} />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.groupName}>{lc(group.name, group.nameFr)}</Text>
                      <Text style={styles.groupDesc} numberOfLines={2}>{lc(group.description, group.descriptionFr)}</Text>
                    </View>
                  </View>

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={14} color={color.textFaint} />
                      <Text style={styles.metaText}>
                        {t('community.members', { count: group.memberCount })}/{group.maxMembers}
                      </Text>
                    </View>
                    {group.isActive && (
                      <View style={styles.metaItem}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeLabel}>{t('community.activeNow')}</Text>
                      </View>
                    )}
                  </View>

                  {/* Goal */}
                  <View style={styles.goalRow}>
                    <Ionicons name="flag-outline" size={14} color={color.textMuted} />
                    <Text style={styles.goalText}>{t('community.groupGoal', { goal: localizeGoal(lc(group.goal, group.goalFr), language) })}</Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((group.memberCount / group.maxMembers) * 100, 100)}%`,
                          backgroundColor: group.color,
                        },
                      ]}
                    />
                  </View>

                  {/* Join button — hidden once already a member */}
                  {!isJoined && (
                    <Pressable
                      style={[styles.joinBtn, isFull && styles.fullBtn]}
                      onPress={() => handleJoin(group.id, isJoined)}
                      disabled={isFull}
                    >
                      <Ionicons name="add" size={16} color={color.text} />
                      <Text style={styles.joinText}>{t('community.joinGroup')}</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB — Create Group */}
      <Pressable style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={24} color={color.text} />
      </Pressable>

      {/* ── Create Group Modal ─────────────────────────────── */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={color.textMuted} />
              </Pressable>
              <Text style={styles.modalTitle}>{t('community.createGroup')}</Text>
              <Pressable
                style={[styles.createBtn, (!newName.trim() || !newDesc.trim() || !newTopic.trim() || !newGoal.trim() || isCreating) && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim() || !newDesc.trim() || !newTopic.trim() || !newGoal.trim() || isCreating}
              >
                <Text style={styles.createBtnText}>
                  {isCreating ? t('community.creating') : t('community.create')}
                </Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Template picker */}
              <Text style={styles.pickerLabel}>{t('community.startFromTemplate', { defaultValue: 'Start from a template' })}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 10, paddingRight: 12 }}>
                  {GROUP_TEMPLATES.map((tpl: GroupTemplate) => (
                    <Pressable
                      key={tpl.id}
                      style={[styles.templateCard, selectedIcon === tpl.icon && selectedColor === tpl.color && newName === tpl.name && { borderColor: tpl.color }]}
                      onPress={() => {
                        if (tpl.id === 'tpl-custom') {
                          setNewName('');
                          setNewDesc('');
                          setNewTopic('');
                          setNewGoal('');
                          setSelectedIcon('sparkles');
                          setSelectedColor(color.accent);
                        } else {
                          setNewName(t(tpl.nameKey, { defaultValue: tpl.name }));
                          setNewDesc(t(tpl.descriptionKey, { defaultValue: tpl.description }));
                          setNewTopic(tpl.topic);
                          setNewGoal(t(tpl.goalKey, { defaultValue: tpl.goal }));
                          setSelectedIcon(tpl.icon);
                          setSelectedColor(tpl.color);
                        }
                      }}
                    >
                      <View style={[styles.templateIcon, { backgroundColor: `${tpl.color}20` }]}>
                        <Ionicons name={tpl.icon as any} size={22} color={tpl.color} />
                      </View>
                      <Text style={styles.templateName} numberOfLines={1}>{t(tpl.nameKey, { defaultValue: tpl.name })}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.pickerLabel}>{t('community.orCreateCustom', { defaultValue: 'or create your own' })}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('community.groupName')}
                placeholderTextColor={color.textFaint}
                value={newName}
                onChangeText={setNewName}
                maxLength={60}
              />
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder={t('community.groupDescription')}
                placeholderTextColor={color.textFaint}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <TextInput
                style={styles.input}
                placeholder={t('community.groupTopic')}
                placeholderTextColor={color.textFaint}
                value={newTopic}
                onChangeText={setNewTopic}
                maxLength={60}
              />
              <TextInput
                style={styles.input}
                placeholder={t('community.groupGoalInput')}
                placeholderTextColor={color.textFaint}
                value={newGoal}
                onChangeText={setNewGoal}
                maxLength={60}
              />

              {/* Icon picker */}
              <Text style={styles.pickerLabel}>{t('community.icon')}</Text>
              <View style={styles.pickerRow}>
                {GROUP_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[styles.pickerItem, selectedIcon === icon && { borderColor: selectedColor }]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor: color.textFaint} />
                  </Pressable>
                ))}
              </View>

              {/* Color picker */}
              <Text style={styles.pickerLabel}>{t('community.color')}</Text>
              <View style={styles.pickerRow}>
                {GROUP_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: color.text,
    padding: 0,
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
    paddingBottom: 100,
  },
  desc: {
    fontSize: 14,
    color: color.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: color.textFaint,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.progress,
  },
  activeLabel: {
    fontSize: 12,
    color: color.progress,
    fontWeight: '600',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  goalText: {
    fontSize: 13,
    color: color.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: color.bg,
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: color.accent,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  fullBtn: {
    backgroundColor: color.surfaceRaised,
    opacity: 0.6,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.text,
  },
  createBtn: {
    backgroundColor: color.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.text,
  },
  input: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 15,
    color: color.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  pickerItem: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.border,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: color.text,
  },
  templateCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    borderColor: color.border,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: color.text,
    textAlign: 'center',
  },
});
