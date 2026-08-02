import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {ActiveBlockCard} from '@/components/ActiveBlockCard';
import {Button, Screen} from '@/components/Screen';
import {useActiveBlocks} from '@/hooks/useActiveBlocks';
import {usePermissions} from '@/hooks/usePermissions';
import type {HomeScreenProps} from '@/navigation/types';
import {colors, spacing, typography} from '@/theme';

export function HomeScreen({navigation}: HomeScreenProps) {
  const {blocks, loading, refresh} = useActiveBlocks();
  const {allRequiredGranted: ready, loading: permissionsLoading} =
    usePermissions();
  const isDark = useColorScheme() === 'dark';

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  React.useEffect(() => {
    if (!permissionsLoading && !ready) {
      navigation.replace('Permissions');
    }
  }, [permissionsLoading, ready, navigation]);

  const hasBlocks = blocks.length > 0;

  return (
    <Screen
      footer={
        <Button
          label="Block an app"
          onPress={() => navigation.navigate('AppPicker')}
        />
      }
      loading={loading}
      title="Achieve Goal">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {hasBlocks ? (
          blocks.map(block => (
            <ActiveBlockCard key={block.id} block={block} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              No active blocks. Pick an app and choose when it should unblock.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textDark: {
    color: colors.textSecondaryDark,
  },
});
