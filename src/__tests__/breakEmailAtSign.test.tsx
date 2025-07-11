import {breakEmailAtSign} from 'utils/string';
import {describe, it, expect} from 'vitest';

describe('breakEmailAtSign', () => {
  it('splits email at @ with newline if length exceeds maxChars', () => {
    const email = 'john.doe@example.com';
    const result = breakEmailAtSign(email, 10);
    expect(result).toBe('john.doe@\nexample.com');
  });

  it('returns input if no @ is found', () => {
    const email = 'notanemail';
    const result = breakEmailAtSign(email);
    expect(result).toBe('notanemail');
  });

  it('handles empty string', () => {
    expect(breakEmailAtSign('')).toBe('');
  });

  it('handles missing domain', () => {
    expect(breakEmailAtSign('user@', 1)).toBe('user@\n');
  });

  it('splits long email with + correctly', () => {
    const email1 = 'eva+22345678345676543@mainteny.com';
    const email2 = 'christian@aufzugdienst-rottal.de';
    const expected1 = 'eva+22345678345676543@\nmainteny.com';
    const expected2 = 'christian@\naufzugdienst-rottal.de';
    expect(breakEmailAtSign(email1)).toBe(expected1);
    expect(breakEmailAtSign(email2)).toBe(expected2);
  });
});
