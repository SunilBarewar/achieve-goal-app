import React from 'react';
import {useColorScheme} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {colors} from '@/theme';
import type {RootStackParamList} from '@/navigation/types';
import {PermissionsScreen} from '@/screens/PermissionsScreen';
import {HomeScreen} from '@/screens/HomeScreen';
import {AppPickerScreen} from '@/screens/AppPickerScreen';
import {EndTimeScreen} from '@/screens/EndTimeScreen';
import {ConfirmScreen} from '@/screens/ConfirmScreen';
import {usePermissions} from '@/hooks/usePermissions';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const {allRequiredGranted: ready, loading} = usePermissions();
  const isDark = useColorScheme() === 'dark';

  const theme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.backgroundDark,
          card: colors.backgroundDark,
          text: colors.textDark,
          border: colors.borderDark,
          primary: colors.accent,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.border,
          primary: colors.accent,
        },
      };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName={ready ? 'Home' : 'Permissions'}
        screenOptions={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontWeight: '600',
            color: isDark ? colors.textDark : colors.text,
          },
        }}>
        <Stack.Screen
          component={PermissionsScreen}
          name="Permissions"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={HomeScreen}
          name="Home"
          options={{headerShown: false}}
        />
        <Stack.Screen component={AppPickerScreen} name="AppPicker" />
        <Stack.Screen component={EndTimeScreen} name="EndTime" />
        <Stack.Screen component={ConfirmScreen} name="Confirm" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
