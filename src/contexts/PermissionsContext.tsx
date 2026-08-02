import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {checkPermissions} from '@/services/appBlocker';
import type {PermissionStatus} from '@/types/permissions';
import {allRequiredGranted} from '@/types/permissions';

const DEFAULT_STATUS: PermissionStatus = {
  usage_access: false,
  accessibility: false,
  overlay: false,
  notifications: false,
  battery_optimization: false,
};

type PermissionsContextValue = {
  status: PermissionStatus;
  loading: boolean;
  refresh: () => Promise<void>;
  allRequiredGranted: boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({children}: {children: React.ReactNode}) {
  const [status, setStatus] = useState<PermissionStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await checkPermissions();
      setStatus(result);
    } catch {
      setStatus(DEFAULT_STATUS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        refresh();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      loading,
      refresh,
      allRequiredGranted: allRequiredGranted(status),
    }),
    [status, loading, refresh],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
}
