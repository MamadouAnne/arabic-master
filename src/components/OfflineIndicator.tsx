import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { color, radius } from '../theme/tokens';
import { withAlpha } from './ui/Primitives';

interface OfflineIndicatorProps {
  compact?: boolean;
}

export function OfflineIndicator({ compact = false }: OfflineIndicatorProps) {
  const { t } = useTranslation();
  const { isConnected, isLoading } = useNetworkStatus();

  if (isLoading || isConnected) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="cloud-offline" size={16} color={color.danger} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={18} color={color.danger} />
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.danger, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  compactContainer: {
    backgroundColor: withAlpha(color.danger, 0.13),
    padding: 6,
    borderRadius: radius.md,
  },
  text: {
    color: color.danger,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
});
