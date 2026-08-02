import {useCallback, useEffect, useState} from 'react';

import {syncBlocksFromNative} from '@/services/blockStore';
import type {BlockSession} from '@/types/block';

export function useActiveBlocks() {
  const [blocks, setBlocks] = useState<BlockSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const sessions = await syncBlocksFromNative();
      setBlocks(sessions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {blocks, loading, refresh};
}
