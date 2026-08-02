import {
  MAX_HORIZON_MS,
  MIN_LEAD_TIME_MS,
  validateStartBlockInput,
} from '@/utils/blockValidation';

describe('blockValidation', () => {
  const now = new Date('2026-08-02T12:00:00').getTime();

  it('accepts end time within valid range', () => {
    expect(validateStartBlockInput(now + 2 * MIN_LEAD_TIME_MS, now)).toEqual({
      valid: true,
    });
  });

  it('rejects end time in the past', () => {
    expect(validateStartBlockInput(now - 1, now)).toEqual({
      valid: false,
      code: 'ENDS_AT_IN_PAST',
    });
  });

  it('rejects end time within minimum lead time', () => {
    expect(validateStartBlockInput(now + 30_000, now)).toEqual({
      valid: false,
      code: 'ENDS_AT_TOO_SOON',
    });
  });

  it('rejects end time beyond maximum horizon', () => {
    expect(validateStartBlockInput(now + MAX_HORIZON_MS + 1, now)).toEqual({
      valid: false,
      code: 'ENDS_AT_TOO_FAR',
    });
  });

  it('rejects duplicate active block for same package', () => {
    expect(
      validateStartBlockInput(now + 2 * MIN_LEAD_TIME_MS, now, {
        packageName: 'com.instagram.android',
        activePackageNames: ['com.instagram.android'],
      }),
    ).toEqual({
      valid: false,
      code: 'DUPLICATE_BLOCK',
    });
  });
});
