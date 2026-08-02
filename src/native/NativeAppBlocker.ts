import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export type InstalledAppNative = {
  packageName: string;
  label: string;
  icon: string;
};

export type PermissionStatusNative = {
  usage_access: boolean;
  accessibility: boolean;
  overlay: boolean;
  notifications: boolean;
  battery_optimization: boolean;
};

export interface Spec extends TurboModule {
  getInstalledApps(): Promise<InstalledAppNative[]>;
  checkPermissions(): Promise<PermissionStatusNative>;
  openPermissionSettings(permission: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AppBlocker');
