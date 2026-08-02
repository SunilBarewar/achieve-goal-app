import React from 'react';
import {Image, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {colors, radius, spacing, typography} from '@/theme';
import type {BlockSession} from '@/types/block';
import {formatCountdown, formatUnblocksAt} from '@/utils/endTime';

type ActiveBlockCardProps = {
  block: BlockSession;
  icon?: string;
};

export function ActiveBlockCard({block, icon}: ActiveBlockCardProps) {
  const isDark = useColorScheme() === 'dark';
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.row}>
        {icon ? (
          <Image source={{uri: icon}} style={styles.icon} />
        ) : (
          <View style={[styles.iconPlaceholder, isDark && styles.iconPlaceholderDark]} />
        )}
        <View style={styles.textBlock}>
          <Text style={[styles.label, isDark && styles.textDark]}>
            {block.appLabel}
          </Text>
          <Text style={[styles.primary, isDark && styles.textDark]}>
            Unblocks at {formatUnblocksAt(block.endsAt)}
          </Text>
          <Text style={[styles.secondary, isDark && styles.textSecondaryDark]}>
            {formatCountdown(block.endsAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDark: {
    backgroundColor: colors.cardDark,
    borderColor: colors.borderDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    backgroundColor: colors.border,
  },
  iconPlaceholderDark: {
    backgroundColor: colors.borderDark,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  primary: {
    ...typography.heading,
    color: colors.text,
    fontSize: 17,
  },
  secondary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
});
