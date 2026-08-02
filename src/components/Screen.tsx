import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, spacing, typography} from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  title,
  subtitle,
  loading,
  footer,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? (
            <Text style={[styles.title, isDark && styles.textDark]}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={[styles.subtitle, isDark && styles.textSecondaryDark]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: ButtonProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        isDark && variant === 'secondary' && styles.buttonSecondaryDark,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      <Text
        style={[
          styles.buttonLabel,
          variant === 'secondary' && styles.buttonLabelSecondary,
          isDark && variant === 'secondary' && styles.textDark,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    ...typography.button,
    color: '#FFFFFF',
  },
  buttonLabelSecondary: {
    color: colors.text,
  },
});
