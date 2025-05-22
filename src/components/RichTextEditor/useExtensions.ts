import type {EditorOptions} from '@tiptap/core';
import {Bold} from '@tiptap/extension-bold';
import {BulletList} from '@tiptap/extension-bullet-list';
import {Document} from '@tiptap/extension-document';
import FontFamily from '@tiptap/extension-font-family';
import {Italic} from '@tiptap/extension-italic';
import {ListItem} from '@tiptap/extension-list-item';
import {Text} from '@tiptap/extension-text';
import {TextAlign} from '@tiptap/extension-text-align';
import {TextStyle} from '@tiptap/extension-text-style';
import {Underline} from '@tiptap/extension-underline';
import {useContext, useMemo} from 'react';
import History from '@tiptap/extension-history';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import {Link} from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

// custom extensions
import {PdfStylesContext} from 'context/PdfStylesProvider';
import ShiftEnterExtension from './customExtensions/ShiftEnterExtension';
import FontSize from './customExtensions/FontSizeExtension';
import {ImageExtension} from './customExtensions/ImageExtension';
import CustomParagraph from './customExtensions/CustomParagraph';
import GlobalFontFamily from './customExtensions/FontFamily';
import PasteHandler from './customExtensions/PasteHandler';

export type UseExtensionsOptions = {
  /** Placeholder hint to show in the text input area before a user types a message. */
  placeholder?: string;
};

/**
 * A hook for providing a default set of useful extensions for the MUI-Tiptap
 * editor.
 */
export default function useExtensions({
  placeholder,
}: UseExtensionsOptions = {}): EditorOptions['extensions'] {
  const {fontStyles} = useContext(PdfStylesContext);

  return useMemo(
    () => [
      History,
      FontFamily,
      BulletList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      Document,
      Placeholder.configure({
        placeholder,
      }),
      FontSize,
      ListItem,
      OrderedList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      CustomParagraph,
      Text,
      Bold,
      Italic,
      Underline,

      // Extensions
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
      }),
      TextStyle,
      ShiftEnterExtension,
      Link.configure({
        openOnClick: false,
      }),
      ImageExtension.configure({inline: true, allowBase64: true}),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      FontFamily,
      GlobalFontFamily.configure({
        defaultFontFamily: fontStyles.name,
      }),
      PasteHandler.configure({
        defaultFontFamily: fontStyles.name,
      }),
    ],
    [placeholder],
  );
}
