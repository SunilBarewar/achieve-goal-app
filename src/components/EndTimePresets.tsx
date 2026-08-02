import React from 'react';
import {Pressable, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {colors, radius, spacing, typography} from '@/theme';
import type {EndTimePreset} from '@/utils/endTime';
import {formatEndTime} from '@/utils/endTime';

type EndTimePresetsProps = {
  presets: EndTimePreset[];
  selectedEndsAt: number | null;
  onSelect: (endsAtMs: number) => void;
};

export function EndTimePresets({
  presets,
  selectedEndsAt,
  onSelect,
}: EndTimePresetsProps) {
  const isDark = useColorScheme() === 'dark';
  const now = new Date();

  return (
    <View style={styles.container}>
      {presets.map(preset => {
        const endsAt = preset.getEndsAt(now);
        const selected = selectedEndsAt === endsAt;

        return (
          <Pressable
            key={preset.id}
            accessibilityRole="button"
            onPress={() => onSelect(endsAt)}
            style={[
              styles.chip,
              isDark && styles.chipDark,
              selected && styles.chipSelected,
            ]}>
            <Text
              style={[
                styles.chipLabel,
                isDark && styles.textDark,
                selected && styles.chipLabelSelected,
              ]}>
              {preset.label}
            </Text>
            <Text
              style={[
                styles.chipSub,
                isDark && styles.textSecondaryDark,
                selected && styles.chipSubSelected,
              ]}>
              {formatEndTime(endsAt, now)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  chipDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: '#EFF6FF',
  },
  chipLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.accent,
  },
  chipSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chipSubSelected: {
    color: colors.accent,
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
});
