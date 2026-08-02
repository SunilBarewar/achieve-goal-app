/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/navigation/AppNavigator', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return function MockNavigator() {
    return React.createElement(Text, null, 'Achieve Goal');
  };
});

jest.mock('@/native/NativeAppBlocker', () => ({
  __esModule: true,
  default: {
    getInstalledApps: jest.fn(() => Promise.resolve([])),
    checkPermissions: jest.fn(() =>
      Promise.resolve({
        usage_access: false,
        accessibility: false,
        overlay: false,
        notifications: false,
        battery_optimization: false,
      }),
    ),
    openPermissionSettings: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
