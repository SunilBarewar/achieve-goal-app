import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {colors, radius, spacing, typography} from '@/theme';
import type {PermissionInfo} from '@/types/permissions';

type PermissionCardProps = {
  permission: PermissionInfo;
  granted: boolean;
  onOpenSettings: () => void;
};

export function PermissionCard({
  permission,
  granted,
  onOpenSettings,
}: PermissionCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusDot,
            granted ? styles.statusGranted : styles.statusPending,
          ]}
        />
        <Text style={[styles.title, isDark && styles.textDark]}>
          {permission.title}
          {!permission.required ? (
            <Text style={styles.optional}> · optional</Text>
          ) : null}
        </Text>
      </View>
      <Text style={[styles.description, isDark && styles.textSecondaryDark]}>
        {permission.description}
      </Text>
      {granted ? (
        <Text style={styles.grantedLabel}>Granted</Text>
      ) : (
        <Pressable onPress={onOpenSettings} style={styles.settingsLink}>
          <Text style={styles.settingsLinkText}>Open Settings</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusGranted: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  optional: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  grantedLabel: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },
  settingsLink: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
  },
  settingsLinkText: {
    ...typography.button,
    color: colors.accent,
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
});
