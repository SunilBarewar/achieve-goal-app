export type BlockStatus = 'active' | 'expired';

export type BlockSession = {
  id: string;
  packageName: string;
  appLabel: string;
  startedAt: number;
  endsAt: number;
  status: BlockStatus;
};
