import {escapeRegExp} from 'lodash';
import React from 'react';

interface HighlightTextOptions {
  text: string;
  highlight: string;
  highlightStyle?: React.CSSProperties;
}

const useHighlightText = (options: HighlightTextOptions): React.ReactNode => {
  const {text, highlight, highlightStyle} = options;

  if (!highlight) {
    return text;
  }

  const escapedHighlight = escapeRegExp(highlight);
  const parts = text?.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  const defaultStyle = {
    backgroundColor: '#222B451F',
    color: 'black',
    fontWeight: '600',
  };

  return (
    <span>
      {parts?.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={index}
            style={{
              ...defaultStyle,
              ...highlightStyle,
            }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export default useHighlightText;
