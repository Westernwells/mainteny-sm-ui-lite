import {Paragraph} from '@tiptap/extension-paragraph';
import {mergeAttributes} from '@tiptap/core';

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: 'margin: 0; padding: 0; line-height: 1.5;', // Default inline styles
        parseHTML: (element) => element.style.cssText || '',
        renderHTML: (attributes) => ({
          style: attributes.style,
        }),
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (attributes.textAlign) {
            return {style: `text-align: ${attributes.textAlign};`};
          }
          return {};
        },
      },
    };
  },
  renderHTML({HTMLAttributes}) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default CustomParagraph;
