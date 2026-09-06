import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { font, color, radius } from '../theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    __DEV__ && console.error('[ErrorBoundary] Caught error:', error.message, info.componentStack);
  }

  handleRestart = async () => {
    try {
      if (!__DEV__) {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false });
      }
    } catch {
      this.setState({ hasError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={48} color={color.warning} />
            </View>

            <Text style={styles.title}>{i18n.t('profile.errorBoundaryTitle')}</Text>
            <Text style={styles.titleArabic}>حدث خطأ ما</Text>

            <Text style={styles.message}>
              {i18n.t('profile.errorBoundaryMessage')}
            </Text>

            <Pressable style={styles.button} onPress={this.handleRestart}>
              <Ionicons name="refresh" size={20} color={color.text} />
              <Text style={styles.buttonText}>{i18n.t('profile.restartApp')}</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 38,
    fontSize: 22,
    color: color.sacred,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: color.progress,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: radius.md,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
});
