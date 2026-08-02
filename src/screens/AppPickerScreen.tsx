import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {AppListItem} from '@/components/AppListItem';
import {Screen} from '@/components/Screen';
import type {AppPickerScreenProps} from '@/navigation/types';
import {getInstalledApps} from '@/services/appBlocker';
import {colors, radius, spacing} from '@/theme';
import type {InstalledApp} from '@/types/app';

export function AppPickerScreen({navigation}: AppPickerScreenProps) {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    let mounted = true;
    getInstalledApps()
      .then(result => {
        if (mounted) {
          setApps(result.sort((a, b) => a.label.localeCompare(b.label)));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return apps;
    }
    return apps.filter(
      app =>
        app.label.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q),
    );
  }, [apps, query]);

  const onSelect = useCallback(
    (app: InstalledApp) => {
      navigation.navigate('EndTime', {app});
    },
    [navigation],
  );

  return (
    <Screen loading={loading} subtitle="Choose an app to block" title="Apps">
      <View
        style={[
          styles.searchWrap,
          isDark && styles.searchWrapDark,
        ]}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search apps"
          placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
          style={[styles.search, isDark && styles.searchDark]}
          value={query}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={filtered}
        keyExtractor={item => item.packageName}
        keyboardShouldPersistTaps="handled"
        renderItem={({item}) => (
          <AppListItem app={item} onPress={() => onSelect(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchWrapDark: {
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
  },
  search: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    fontSize: 16,
    color: colors.text,
  },
  searchDark: {
    color: colors.textDark,
  },
  list: {
    paddingBottom: spacing.lg,
  },
});
