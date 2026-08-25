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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCreditStore, getCreditDisplayInfo } from '../../src/stores/creditStore';
import { useCommunityStore } from '../../src/stores/communityStore';
import { GROUP_TEMPLATES } from '../../src/data/community/groupTemplates';
import { GroupTemplate } from '../../src/types/community';

const GROUP_ICONS = ['book', 'school', 'mic', 'language', 'moon', 'star', 'people', 'flag'];
const GROUP_COLORS = ['#10b981', '#f59e0b', '#f97316', '#818cf8', '#14b8a6', '#fb923c', '#f43e5e', '#34d399'];

export default function StudyGroupsScreen() {
  const { t } = useTranslation();
  const creditState = useCreditStore();
  const isPremium = getCreditDisplayInfo(creditState).isPremium;

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book');
  const [selectedColor, setSelectedColor] = useState('#10b981');
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
    setSelectedColor('#10b981');
    setShowCreateModal(false);
  };

  // Filter by search, then sort
  const filtered = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()))
    : groups;
  const sorted = [...filtered].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.memberCount - a.memberCount;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="people" size={20} color="#818cf8" />
          <Text style={styles.headerTitle}>{t('community.studyGroups')}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('community.searchGroups', { defaultValue: 'Search groups...' })}
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#64748b" />
          </Pressable>
        )}
      </View>

      {isLoadingGroups ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#818cf8" size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
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
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
                    </View>
                  </View>

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={14} color="#64748b" />
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
                    <Ionicons name="flag-outline" size={14} color="#94a3b8" />
                    <Text style={styles.goalText}>{t('community.groupGoal', { goal: group.goal })}</Text>
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
                      <Ionicons name="add" size={16} color="#ffffff" />
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
        <Ionicons name="add" size={24} color="#ffffff" />
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
                <Ionicons name="close" size={24} color="#94a3b8" />
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
                          setSelectedColor('#14b8a6');
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
                placeholderTextColor="#64748b"
                value={newName}
                onChangeText={setNewName}
                maxLength={60}
              />
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder={t('community.groupDescription')}
                placeholderTextColor="#64748b"
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <TextInput
                style={styles.input}
                placeholder={t('community.groupTopic')}
                placeholderTextColor="#64748b"
                value={newTopic}
                onChangeText={setNewTopic}
                maxLength={60}
              />
              <TextInput
                style={styles.input}
                placeholder={t('community.groupGoalInput')}
                placeholderTextColor="#64748b"
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
                    <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor : '#64748b'} />
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
    color: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  desc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 13,
    color: '#94a3b8',
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
    color: '#64748b',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  activeLabel: {
    fontSize: 12,
    color: '#10b981',
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
    color: '#94a3b8',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#0f172a',
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
    backgroundColor: '#818cf8',
    paddingVertical: 10,
    borderRadius: 10,
  },
  fullBtn: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#818cf8',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
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
    color: '#ffffff',
  },
  createBtn: {
    backgroundColor: '#818cf8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
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
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#ffffff',
  },
  templateCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#334155',
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});
