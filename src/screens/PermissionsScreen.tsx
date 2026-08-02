import React from 'react';
import {ScrollView, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {PermissionCard} from '@/components/PermissionCard';
import {Button, Screen} from '@/components/Screen';
import {usePermissions} from '@/hooks/usePermissions';
import type {PermissionsScreenProps} from '@/navigation/types';
import {openPermissionSettings} from '@/services/appBlocker';
import {spacing, typography, colors} from '@/theme';
import {PERMISSIONS} from '@/types/permissions';

export function PermissionsScreen({navigation}: PermissionsScreenProps) {
  const {status, loading, allRequiredGranted: ready} = usePermissions();
  const isDark = useColorScheme() === 'dark';

  React.useEffect(() => {
    if (!loading && ready) {
      navigation.replace('Home');
    }
  }, [loading, ready, navigation]);

  return (
    <Screen
      loading={loading}
      subtitle="Achieve Goal needs a few Android permissions to block apps. Enable each one in Settings."
      title="Setup">
      <ScrollView showsVerticalScrollIndicator={false}>
        {PERMISSIONS.map(permission => (
          <PermissionCard
            key={permission.key}
            granted={status[permission.key]}
            onOpenSettings={() => openPermissionSettings(permission.key)}
            permission={permission}
          />
        ))}
        <Text style={[styles.note, isDark && styles.noteDark]}>
          Return here after granting each permission. Required permissions must
          all be enabled before you can block apps.
        </Text>
      </ScrollView>
      {ready ? (
        <View style={styles.footer}>
          <Button label="Continue" onPress={() => navigation.replace('Home')} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  noteDark: {
    color: colors.textSecondaryDark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
