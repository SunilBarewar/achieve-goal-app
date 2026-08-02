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

export type BlockSessionNative = {
  id: string;
  packageName: string;
  appLabel: string;
  startedAt: number;
  endsAt: number;
  status: 'active' | 'expired';
};

export interface Spec extends TurboModule {
  getInstalledApps(): Promise<InstalledAppNative[]>;
  checkPermissions(): Promise<PermissionStatusNative>;
  openPermissionSettings(permission: string): Promise<void>;
  startBlock(packageName: string, endsAtMs: number): Promise<BlockSessionNative>;
  getActiveBlocks(): Promise<BlockSessionNative[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AppBlocker');
