import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

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
        <Ionicons name="cloud-offline" size={16} color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={18} color="#ef4444" />
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444420',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  compactContainer: {
    backgroundColor: '#ef444420',
    padding: 6,
    borderRadius: 12,
  },
  text: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
});
