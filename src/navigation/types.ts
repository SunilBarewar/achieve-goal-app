import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {InstalledApp} from '@/types/app';

export type RootStackParamList = {
  Permissions: undefined;
  Home: undefined;
  AppPicker: undefined;
  EndTime: {app: InstalledApp};
  Confirm: {app: InstalledApp; endsAt: number};
};

export type PermissionsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Permissions'
>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AppPickerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AppPicker'
>;
export type EndTimeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EndTime'
>;
export type ConfirmScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Confirm'
>;
