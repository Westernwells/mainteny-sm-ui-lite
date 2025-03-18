import React from 'react';
import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import useHighlightText from 'hooks/useHighlightText';

describe('useHighlightText', () => {
  it('should return original text when no highlight is provided', () => {
    const {result} = renderHook(() =>
      useHighlightText({
        text: 'Sample text',
        highlight: '',
      }),
    );
    expect(result.current).toBe('Sample text');
  });

  it('should highlight exact matches case-insensitively', () => {
    const {result} = renderHook(() =>
      useHighlightText({
        text: 'Sample Text with SAMPLE variations',
        highlight: 'sample',
      }),
    );
    const spans = result.current as React.ReactElement;
    const children = spans.props.children as React.ReactElement[];

    // The text is split into parts, where odd indices are highlighted
    expect(children[0]).toBe('');
    expect(children[1].props.children).toBe('Sample');
    expect(children[2]).toBe(' Text with ');
    expect(children[3].props.children).toBe('SAMPLE');
    expect(children[4]).toBe(' variations');
  });

  it('should handle special characters correctly', () => {
    const specialChars = '.[]{}()*+?^$|';
    const {result} = renderHook(() =>
      useHighlightText({
        text: `Text with ${specialChars} special chars`,
        highlight: specialChars,
      }),
    );
    const spans = result.current as React.ReactElement;
    const children = spans.props.children as React.ReactElement[];

    expect(children[0]).toBe('Text with ');
    expect(children[1].props.children).toBe(specialChars);
    expect(children[2]).toBe(' special chars');
  });

  it('should handle Dutch characters correctly', () => {
    const dutchText = 'café crème';
    const {result} = renderHook(() =>
      useHighlightText({
        text: dutchText,
        highlight: 'crème',
      }),
    );
    const spans = result.current as React.ReactElement;
    const children = spans.props.children as React.ReactElement[];

    expect(children[0]).toBe('café ');
    expect(children[1].props.children).toBe('crème');
    expect(children[2]).toBe('');
  });

  it('should apply custom highlight styles when provided', () => {
    const customStyle = {
      backgroundColor: '#FF0000',
      color: 'white',
    };

    const {result} = renderHook(() =>
      useHighlightText({
        text: 'Custom styled highlight',
        highlight: 'styled',
        highlightStyle: customStyle,
      }),
    );
    const spans = result.current as React.ReactElement;
    const children = spans.props.children as React.ReactElement[];

    expect(children[1].props.style).toEqual({
      ...customStyle,
      fontWeight: '600',
    });
  });
});
