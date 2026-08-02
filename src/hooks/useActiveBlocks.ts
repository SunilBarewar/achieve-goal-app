import {useCallback, useEffect, useState} from 'react';

import {loadBlocks} from '@/services/blockStore';
import type {BlockSession} from '@/types/block';

export function useActiveBlocks() {
  const [blocks, setBlocks] = useState<BlockSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const sessions = await loadBlocks();
      setBlocks(sessions.filter(b => b.status === 'active'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {blocks, loading, refresh};
}
