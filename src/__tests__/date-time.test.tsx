import {addDateToTime, addTimeToDate} from 'utils/utils';
import {describe, it, expect} from 'vitest';

describe('addDateToTime', () => {
  it('combines date and time (local) correctly', () => {
    const date = new Date(2024, 5, 10); // June 10, 2024 (month is 0-based)
    const time = new Date(0, 0, 1, 14, 30); // 14:30
    const result = addDateToTime(time, date);
    const expected = new Date(2024, 5, 10, 14, 30).toISOString();
    expect(result).toBe(expected);
  });
});

describe('addTimeToDate', () => {
  it('combines date and time (local) correctly', () => {
    const date = new Date(2024, 5, 10);
    const time = new Date(0, 0, 1, 9, 15);
    const result = addTimeToDate(date, time);
    const expected = new Date(2024, 5, 10, 9, 15).toISOString();
    expect(result).toBe(expected);
  });
});
