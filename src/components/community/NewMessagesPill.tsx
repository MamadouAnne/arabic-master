import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  count: number;
  groupColor: string;
  onPress: () => void;
}

export const NewMessagesPill = React.memo(function NewMessagesPill({ count, groupColor, onPress }: Props) {
  return (
    <Pressable style={[styles.pill, { backgroundColor: groupColor }]} onPress={onPress}>
      <Ionicons name="arrow-down" size={15} color="#ffffff" />
      <Text style={styles.text}>
        {count > 0 ? `${count} new message${count > 1 ? 's' : ''}` : 'Jump to latest'}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  text: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
});
