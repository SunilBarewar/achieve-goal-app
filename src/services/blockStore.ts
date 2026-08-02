import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';

import type {BlockSession} from '@/types/block';

const STORAGE_KEY = '@achieve_goal/blocks';

export async function loadBlocks(): Promise<BlockSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as BlockSession[];
  } catch {
    return [];
  }
}

export async function saveBlocks(blocks: BlockSession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

export function createBlockSession(
  partial: Omit<BlockSession, 'id' | 'startedAt' | 'status'>,
): BlockSession {
  return {
    id: uuidv4(),
    startedAt: Date.now(),
    status: 'active',
    ...partial,
  };
}
