import {END_TIME_PRESETS, formatEndTime, resolveEndTime} from '@/utils/endTime';

describe('endTime utils', () => {
  it('rolls custom time to tomorrow when already past today', () => {
    const now = new Date('2026-08-02T21:00:00');
    const endsAt = resolveEndTime(20, 0, now);
    const target = new Date(endsAt);

    expect(target.getDate()).toBe(3);
    expect(target.getHours()).toBe(20);
  });

  it('keeps same-day end time when still in the future', () => {
    const now = new Date('2026-08-02T10:00:00');
    const endsAt = resolveEndTime(20, 0, now);
    const target = new Date(endsAt);

    expect(target.getDate()).toBe(2);
    expect(target.getHours()).toBe(20);
  });

  it('formats tomorrow label explicitly', () => {
    const now = new Date('2026-08-02T21:00:00');
    const endsAt = END_TIME_PRESETS[1].getEndsAt(now);
    expect(formatEndTime(endsAt, now)).toMatch(/^Tomorrow,/);
  });
});
