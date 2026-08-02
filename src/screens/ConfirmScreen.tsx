import React, {useState} from 'react';
import {Alert, Image, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {Button, Screen} from '@/components/Screen';
import type {ConfirmScreenProps} from '@/navigation/types';
import {
  getStartBlockErrorMessage,
  startBlock,
} from '@/services/appBlocker';
import {colors, radius, spacing, typography} from '@/theme';
import {formatEndTime} from '@/utils/endTime';

export function ConfirmScreen({navigation, route}: ConfirmScreenProps) {
  const {app, endsAt} = route.params;
  const isDark = useColorScheme() === 'dark';
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = async () => {
    setSubmitting(true);
    try {
      await startBlock(app.packageName, endsAt);
      navigation.popToTop();
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as {code: string}).code)
          : '';
      Alert.alert('Could not start block', getStartBlockErrorMessage(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button
            disabled={submitting}
            label={submitting ? 'Starting…' : 'Start block'}
            onPress={onConfirm}
          />
          <View style={styles.spacer} />
          <Button
            label="Go back"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </>
      }
      title="Confirm block">
      <View style={styles.content}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Image source={{uri: app.icon}} style={styles.icon} />
          <Text style={[styles.appName, isDark && styles.textDark]}>
            {app.label}
          </Text>
          <Text style={[styles.line, isDark && styles.textDark]}>
            will stay blocked until{' '}
            <Text style={styles.emphasis}>{formatEndTime(endsAt)}</Text>.
          </Text>
          <Text style={[styles.warning, isDark && styles.textSecondaryDark]}>
            You cannot unblock early.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  line: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emphasis: {
    fontWeight: '700',
  },
  warning: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
  spacer: {
    height: spacing.sm,
  },
});
