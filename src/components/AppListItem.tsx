import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {colors, radius, spacing, typography} from '@/theme';
import type {InstalledApp} from '@/types/app';

type AppListItemProps = {
  app: InstalledApp;
  onPress: () => void;
};

export function AppListItem({app, onPress}: AppListItemProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        isDark && styles.rowDark,
        pressed && styles.rowPressed,
      ]}>
      <Image source={{uri: app.icon}} style={styles.icon} />
      <Text
        numberOfLines={1}
        style={[styles.label, isDark && styles.labelDark]}>
        {app.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 64,
    borderRadius: radius.md,
  },
  rowDark: {
    backgroundColor: 'transparent',
  },
  rowPressed: {
    backgroundColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  labelDark: {
    color: colors.textDark,
  },
});
