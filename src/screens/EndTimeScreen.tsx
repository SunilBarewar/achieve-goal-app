import React, {useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';

import {EndTimePresets} from '@/components/EndTimePresets';
import {Button, Screen} from '@/components/Screen';
import type {EndTimeScreenProps} from '@/navigation/types';
import {colors, spacing, typography} from '@/theme';
import {
  END_TIME_PRESETS,
  formatEndTime,
  resolveEndTime,
} from '@/utils/endTime';

type NativeTimePickerProps = {
  display: 'default' | 'spinner';
  mode: 'time';
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  value: Date;
};

function NativeTimePicker(props: NativeTimePickerProps) {
  const DateTimePicker =
    require('@react-native-community/datetimepicker').default;
  return <DateTimePicker {...props} />;
}

export function EndTimeScreen({navigation, route}: EndTimeScreenProps) {
  const {app} = route.params;
  const isDark = useColorScheme() === 'dark';
  const now = new Date();

  const [selectedEndsAt, setSelectedEndsAt] = useState<number | null>(
    END_TIME_PRESETS[1].getEndsAt(now),
  );
  const [customTime, setCustomTime] = useState(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const previewEndsAt =
    selectedEndsAt ??
    resolveEndTime(customTime.getHours(), customTime.getMinutes(), now);

  const onCustomChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) {
      setCustomTime(date);
      setSelectedEndsAt(
        resolveEndTime(date.getHours(), date.getMinutes(), new Date()),
      );
    }
  };

  return (
    <Screen
      footer={
        <Button
          label="Continue"
          onPress={() =>
            navigation.navigate('Confirm', {app, endsAt: previewEndsAt})
          }
        />
      }
      subtitle={`When should ${app.label} unblock?`}
      title="Block until">
      <ScrollView showsVerticalScrollIndicator={false}>
        <EndTimePresets
          onSelect={setSelectedEndsAt}
          presets={END_TIME_PRESETS}
          selectedEndsAt={selectedEndsAt}
        />

        <View style={styles.customSection}>
          <Text style={[styles.sectionLabel, isDark && styles.textDark]}>
            Custom time
          </Text>
          {Platform.OS === 'android' && !showPicker ? (
            <Button
              label={customTime.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
              onPress={() => setShowPicker(true)}
              variant="secondary"
            />
          ) : null}
          {showPicker ? (
            <NativeTimePicker
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              mode="time"
              onChange={onCustomChange}
              value={customTime}
            />
          ) : null}
        </View>

        <View style={[styles.preview, isDark && styles.previewDark]}>
          <Text style={[styles.previewLabel, isDark && styles.textSecondaryDark]}>
            Unblocks at
          </Text>
          <Text style={[styles.previewValue, isDark && styles.textDark]}>
            {formatEndTime(previewEndsAt, now)}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  customSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  preview: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  previewLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  previewValue: {
    ...typography.heading,
    color: colors.text,
  },
  textDark: {
    color: colors.textDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
});
