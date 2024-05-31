import {Extension} from '@tiptap/react';

/**
 * FontSize - Custom Extension
 * editor.commands.setFontSize(e.target.value) :set the font-size.
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Sets the font size of the selected text.
       * @param {string} size - Example: '16px'
       */
      setFontSize: (size: string) => ReturnType;

      /**
       * Removes the font size of the selected text.
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({chain}) =>
          chain()
            .setMark('textStyle', {fontSize: `${fontSize}`})
            .run(),
      unsetFontSize:
        () =>
        ({chain}) =>
          chain()
            .setMark('textStyle', {fontSize: null})
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

export default FontSize;
