export const MIN_LEAD_TIME_MS = 60_000;
export const MAX_HORIZON_MS = 7 * 24 * 60 * 60 * 1000;

export type BlockValidationErrorCode =
  | 'ENDS_AT_IN_PAST'
  | 'ENDS_AT_TOO_SOON'
  | 'ENDS_AT_TOO_FAR'
  | 'DUPLICATE_BLOCK';

export type BlockValidationResult =
  | {valid: true}
  | {valid: false; code: BlockValidationErrorCode};

export function validateStartBlockInput(
  endsAtMs: number,
  now = Date.now(),
  options?: {activePackageNames?: string[]; packageName?: string},
): BlockValidationResult {
  if (endsAtMs <= now) {
    return {valid: false, code: 'ENDS_AT_IN_PAST'};
  }
  if (endsAtMs < now + MIN_LEAD_TIME_MS) {
    return {valid: false, code: 'ENDS_AT_TOO_SOON'};
  }
  if (endsAtMs > now + MAX_HORIZON_MS) {
    return {valid: false, code: 'ENDS_AT_TOO_FAR'};
  }
  if (
    options?.packageName &&
    options.activePackageNames?.includes(options.packageName)
  ) {
    return {valid: false, code: 'DUPLICATE_BLOCK'};
  }
  return {valid: true};
}
