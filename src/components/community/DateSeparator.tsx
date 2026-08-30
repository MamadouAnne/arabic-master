import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color } from '../../theme/tokens';

interface Props {
  label: string;
}

export const DateSeparator = React.memo(function DateSeparator({ label }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12, paddingHorizontal: 8 },
  line: { flex: 1, height: 1, backgroundColor: color.surface },
  label: { fontSize: 11, fontWeight: '600', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 },
});
