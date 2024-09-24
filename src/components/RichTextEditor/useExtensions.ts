import type {EditorOptions} from '@tiptap/core';
import {Bold} from '@tiptap/extension-bold';
import {BulletList} from '@tiptap/extension-bullet-list';
import {Document} from '@tiptap/extension-document';
import {Italic} from '@tiptap/extension-italic';
import {ListItem} from '@tiptap/extension-list-item';
import {Paragraph} from '@tiptap/extension-paragraph';
import {Text} from '@tiptap/extension-text';
import {TextAlign} from '@tiptap/extension-text-align';
import {TextStyle} from '@tiptap/extension-text-style';
import {Underline} from '@tiptap/extension-underline';
import {useMemo} from 'react';
import History from '@tiptap/extension-history';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';

// custom extensions
import ShiftEnterExtension from './customExtensions/ShiftEnterExtension';
import FontSize from './customExtensions/FontSizeExtension';

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
  return useMemo(
    () => [
      History,
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
      Paragraph,
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
    ],
    [placeholder],
  );
}
