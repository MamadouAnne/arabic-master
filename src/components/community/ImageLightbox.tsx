import React from 'react';
import { View, StyleSheet, Pressable, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, radius } from '../../theme/tokens';

interface Props {
  uri: string | null;
  onClose: () => void;
}

export function ImageLightbox({ uri, onClose }: Props) {
  const { width, height } = Dimensions.get('window');
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={28} color={color.text} />
        </Pressable>
        <Pressable style={styles.imageWrap} onPress={onClose}>
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width: width, height: height * 0.8 }}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, width: 44, height: 44, borderRadius: radius.xl, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  imageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
