import {render, fireEvent} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import React from 'react';
import {SearchInput} from 'components/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces onValueChanged by default (300ms)', async () => {
    const onValueChanged = vi.fn();
    const {getByRole} = render(<SearchInput onValueChanged={onValueChanged} />);
    const input = getByRole('textbox');

    fireEvent.change(input, {target: {value: 'a'}});
    fireEvent.change(input, {target: {value: 'ab'}});
    fireEvent.change(input, {target: {value: 'abc'}});

    expect(onValueChanged).not.toHaveBeenCalled();

    // advance by just under 300ms:
    vi.advanceTimersByTime(299);
    expect(onValueChanged).not.toHaveBeenCalled();

    // once we hit 300ms, only last value fires:
    vi.advanceTimersByTime(1);
    expect(onValueChanged).toHaveBeenCalledTimes(1);
    expect(onValueChanged).toHaveBeenCalledWith('abc');
  });

  it('fires immediately when debounceMs=0', () => {
    const onValueChanged = vi.fn();
    const {getByRole} = render(
      <SearchInput onValueChanged={onValueChanged} debounceMs={0} />,
    );
    const input = getByRole('textbox');

    fireEvent.change(input, {target: {value: 'x'}});
    expect(onValueChanged).toHaveBeenCalledTimes(1);
    expect(onValueChanged).toHaveBeenCalledWith('x');

    fireEvent.change(input, {target: {value: 'xy'}});
    expect(onValueChanged).toHaveBeenCalledTimes(2);
    expect(onValueChanged).toHaveBeenLastCalledWith('xy');
  });

  it('cancels pending debounce on unmount', () => {
    const onValueChanged = vi.fn();
    const {getByRole, unmount} = render(
      <SearchInput onValueChanged={onValueChanged} debounceMs={200} />,
    );
    const input = getByRole('textbox');

    fireEvent.change(input, {target: {value: 'test'}});
    unmount();

    // if we advance timers, nothing fires after unmount
    vi.advanceTimersByTime(200);
    expect(onValueChanged).not.toHaveBeenCalled();
  });
});
