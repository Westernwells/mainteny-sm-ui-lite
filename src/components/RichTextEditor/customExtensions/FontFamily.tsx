import {Extension} from '@tiptap/core';

export type GlobalFontFamilyOptions = {
  defaultFontFamily: string;
};

const GlobalFontFamily = Extension.create<GlobalFontFamilyOptions>({
  name: 'globalFontFamily',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: 'Arial',
            parseHTML: (element) =>
              element.style.fontFamily.replace(/['"]/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }

              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },

  onTransaction({editor}) {
    // Set default font family for the entire document
    const {doc, tr} = editor.state;

    // Apply font family to all text nodes that don't have it specified
    doc.descendants((node, pos) => {
      if (
        node.isText &&
        !node.marks.some(
          (mark) => mark.type.name === 'textStyle' && mark.attrs.fontFamily,
        )
      ) {
        const mark = editor.schema.marks.textStyle.create({
          fontFamily: 'Arial',
        });
        tr.addMark(pos, pos + node.nodeSize, mark);
      }
    });

    if (tr.steps.length) {
      editor.view.dispatch(tr);
    }
  },
});

export default GlobalFontFamily;
