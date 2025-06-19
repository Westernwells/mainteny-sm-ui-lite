import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useSendEmailDialogContent} from 'hooks/useSendEmailDialogContent';

describe('useSendEmailDialogContent', () => {
  it('initializes body when dialog is closed', () => {
    const initialText = 'Hello world';
    const {result} = renderHook(
      ({isOpen, text}: {isOpen: boolean; text: string}) =>
        useSendEmailDialogContent(isOpen, text),
      {initialProps: {isOpen: false, text: initialText}},
    );

    expect(result.current[0]).toBe(`${initialText}\n`);
  });

  it('does not update body when initialText changes while open', () => {
    const {result, rerender} = renderHook(
      ({isOpen, text}: {isOpen: boolean; text: string}) =>
        useSendEmailDialogContent(isOpen, text),
      {initialProps: {isOpen: false, text: 'foo'}},
    );

    expect(result.current[0]).toBe('foo\n');

    rerender({isOpen: true, text: 'foo'});
    expect(result.current[0]).toBe('foo\n');

    rerender({isOpen: true, text: 'bar'});
    expect(result.current[0]).toBe('foo\n');
  });

  it('resets body when dialog is closed again after being open', () => {
    const {result, rerender} = renderHook(
      ({isOpen, text}: {isOpen: boolean; text: string}) =>
        useSendEmailDialogContent(isOpen, text),
      {initialProps: {isOpen: true, text: 'initial'}},
    );

    expect(result.current[0]).toBe('');

    rerender({isOpen: false, text: 'updated'});
    expect(result.current[0]).toBe('updated\n');
  });
});
