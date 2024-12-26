import {Image} from '@tiptap/extension-image';

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return {class: attributes.class};
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return {style: attributes.style};
        },
      },
    };
  },
});
