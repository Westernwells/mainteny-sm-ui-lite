import {Extension} from '@tiptap/core';
import {GlobalFontFamilyOptions} from 'components/RichTextEditor/customExtensions/FontFamily';
import {Plugin, PluginKey} from '@tiptap/pm/state';
import {EditorView} from '@tiptap/pm/view';
import {Slice} from '@tiptap/pm/model';

const PasteHandler = Extension.create<GlobalFontFamilyOptions>({
  name: 'pasteHandler',

  addOptions() {
    return {
      defaultFontFamily: 'Arial',
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('pasteHandler');

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handlePaste: (
            view: EditorView,
            event: ClipboardEvent,
            slice: Slice,
          ) => {
            // Get transaction and font family
            const {tr} = view.state;
            const {defaultFontFamily} = this.options;

            // Check if textStyle mark exists
            const textStyleMark = view.state.schema.marks.textStyle;
            if (!textStyleMark) {
              return false; // Let default paste handler take over
            }

            try {
              // Create a new transaction for inserting content with the mark
              const mark = textStyleMark.create({
                fontFamily: defaultFontFamily,
              });

              // Insert the slice at the current selection, but apply our mark
              const {from} = tr.selection;

              // First insert the content
              tr.replaceSelection(slice);

              // Then apply our mark to the newly inserted content
              // The newly inserted content spans from the original selection's 'from'
              // to the new position after insertion
              const newTo = tr.selection.from;

              if (from !== newTo) {
                tr.addMark(from, newTo, mark);
              }

              view.dispatch(tr);
              return true; // Indicates we've handled the paste
            } catch (error) {
              return false; // Let default paste handler take over
            }
          },
        },
      }),
    ];
  },
});

export default PasteHandler;
