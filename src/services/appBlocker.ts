import NativeAppBlocker from '@/native/NativeAppBlocker';
import type {InstalledApp} from '@/types/app';
import type {PermissionKey, PermissionStatus} from '@/types/permissions';

export async function getInstalledApps(): Promise<InstalledApp[]> {
  return NativeAppBlocker.getInstalledApps();
}

export async function checkPermissions(): Promise<PermissionStatus> {
  return NativeAppBlocker.checkPermissions();
}

export async function openPermissionSettings(
  permission: PermissionKey,
): Promise<void> {
  await NativeAppBlocker.openPermissionSettings(permission);
}
