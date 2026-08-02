import NativeAppBlocker from '@/native/NativeAppBlocker';
import type {InstalledApp} from '@/types/app';
import type {BlockSession} from '@/types/block';
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

export async function startBlock(
  packageName: string,
  endsAtMs: number,
): Promise<BlockSession> {
  return NativeAppBlocker.startBlock(packageName, endsAtMs);
}

export async function getActiveBlocks(): Promise<BlockSession[]> {
  return NativeAppBlocker.getActiveBlocks();
}

export type StartBlockErrorCode =
  | 'ENDS_AT_IN_PAST'
  | 'ENDS_AT_TOO_SOON'
  | 'ENDS_AT_TOO_FAR'
  | 'DUPLICATE_BLOCK';

export function getStartBlockErrorMessage(code: string): string {
  switch (code) {
    case 'ENDS_AT_IN_PAST':
      return 'That end time is already in the past.';
    case 'ENDS_AT_TOO_SOON':
      return 'Choose an end time at least 1 minute from now.';
    case 'ENDS_AT_TOO_FAR':
      return 'End time cannot be more than 7 days away.';
    case 'DUPLICATE_BLOCK':
      return 'This app is already blocked.';
    default:
      return 'Could not start block. Please try again.';
  }
}
