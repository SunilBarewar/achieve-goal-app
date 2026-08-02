export type PermissionKey =
  | 'usage_access'
  | 'accessibility'
  | 'overlay'
  | 'notifications'
  | 'battery_optimization';

export type PermissionStatus = Record<PermissionKey, boolean>;

export type PermissionInfo = {
  key: PermissionKey;
  title: string;
  description: string;
  required: boolean;
};

export const PERMISSIONS: PermissionInfo[] = [
  {
    key: 'usage_access',
    title: 'Usage access',
    description: 'Detect which app is currently open on your device.',
    required: true,
  },
  {
    key: 'accessibility',
    title: 'Accessibility service',
    description:
      'Intercept blocked apps quickly and return you to the home screen.',
    required: true,
  },
  {
    key: 'overlay',
    title: 'Display over other apps',
    description: 'Show the full-screen block overlay when a blocked app opens.',
    required: true,
  },
  {
    key: 'notifications',
    title: 'Notifications',
    description: 'Show an ongoing notification while blocks are active.',
    required: true,
  },
  {
    key: 'battery_optimization',
    title: 'Battery optimization',
    description: 'Reduce the chance Android stops the block monitor.',
    required: false,
  },
];

export function allRequiredGranted(status: PermissionStatus): boolean {
  return PERMISSIONS.filter(p => p.required).every(p => status[p.key]);
}
