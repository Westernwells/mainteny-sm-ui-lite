import {KeyboardEvent} from 'react';
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Text,
  Transforms,
  Path,
  Range,
} from 'slate';
import escapeHtml from 'escape-html';
import {jsx} from 'slate-hyperscript';
import {
  ALIGNMENT_TYPES,
  BaseElement,
  BaseText,
  CustomEditor,
  DEFAULT_FONT_SIZE,
  ELEMENT_TAGS,
  FONT_SIZE,
  FORMAT,
  GROUP_TYPES,
  HTML_PDF_FONT_SIZE,
  Marks,
  NodeType,
  TEXT_TAGS,
} from 'models/richTextField';

export const isMarkActive = (editor: CustomEditor, format: string) => {
  const marks: Marks = Editor.marks(editor) || {};
  return marks ? marks[format] === true : false;
};

export const isBlockActive = (editor: CustomEditor, format: string) => {
  const {selection} = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

export const getActiveFontSize = (editor: CustomEditor) => {
  const marks = Editor.marks(editor);
  if (marks) {
    return marks.fontSize || DEFAULT_FONT_SIZE;
  }
  return DEFAULT_FONT_SIZE;
};

export const toggleMark = (
  editor: CustomEditor,
  format: string,
  value?: string | boolean,
) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value || true);
  }
};

export const toggleBlock = (editor: CustomEditor, format: FORMAT) => {
  const isActive = isBlockActive(editor, format);
  const isGroup = GROUP_TYPES.includes(format);
  const isAlignment = ALIGNMENT_TYPES.includes(format);

  if (isAlignment) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ALIGNMENT_TYPES.includes(n.type as FORMAT),
      split: true,
    });
  }
  if (isGroup) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        GROUP_TYPES.includes(n.type as FORMAT),
      split: true,
    });
  }
  if (!isAlignment) {
    const newProperties = {
      type: isActive ? 'paragraph' : isGroup ? 'list-item' : format,
    };
    Transforms.setNodes(editor, newProperties);
  }

  if ((!isActive && isGroup) || isAlignment) {
    const block = {type: format, children: []};
    Transforms.wrapNodes(editor, block);
  }
};

const getStyleString = (style: Record<string, string> | {}) =>
  Object.entries(style).reduce((s, [key, value]) => {
    let newValue = value;
    if (key === 'font-size' && !newValue.endsWith('px')) {
      newValue += 'px';
    }
    return `${s}${key}: ${newValue};`;
  }, '');

export const serialize = (node: Descendant): string => {
  const style = node.fontSize
    ? {
        'font-size': node.fontSize,
      }
    : {};

  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underlined) {
      string = `<u>${string}</u>`;
    }

    if (node.fontSize) {
      return `<span style="${getStyleString(style)}">${string}</span>`;
    }
    return string;
  }

  const children = node.children.map((n) => serialize(n)).join('');

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'list-item': {
      return node.fontSize
        ? `<li style="${getStyleString(style)}">${children}</li>`
        : `<li>${children}</li>`;
    }
    case 'left':
      return `<div style="text-align: left;">${children}</div>`;
    case 'center':
      return `<div style="text-align: center;">${children}</div>`;
    case 'right':
      return `<div style="text-align: right;">${children}</div>`;
    default:
      return children;
  }
};

export const deserialize = (el: HTMLElement) => {
  if (el.nodeType === NodeType.TEXT_NODE) {
    return el.textContent;
  }
  if (el.nodeType !== NodeType.ELEMENT_NODE) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return jsx('element', {type: 'paragraph'}, [{text: ''}]);
  }

  let children: (string | Descendant | null)[] = Array.from(el.childNodes)
    .map((n) => deserialize(n as HTMLElement))
    .flat();

  if (children.length === 0) {
    children = [{text: ''}];
  }
  const {nodeName} = el;

  if (nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    if (attrs) {
      return jsx('element', attrs, children);
    }
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => jsx('text', attrs, child));
  }

  return children;
};

const handleEnterOnListItem = (
  editor: CustomEditor,
  event: KeyboardEvent<HTMLDivElement>,
  node: BaseElement,
) => {
  const {selection} = editor;
  if (!selection) return false;

  // Get the current list item based on the selection
  const [listItem, listItemPath] = Editor.node(editor, selection.focus.path, {
    depth: 2,
  }) as [BaseElement, Path];

  if (listItem.type !== 'list-item') {
    return false;
  }

  const isEmpty = (listItem.children[0] as BaseText).text === '';
  const isLastItemInList =
    listItemPath[listItemPath.length - 1] === node.children.length - 1;

  if (isEmpty && isLastItemInList) {
    // If it's the last item and empty, exit the list
    event.preventDefault();
    toggleBlock(editor, node.type as FORMAT);

    // Move cursor to the newly created node
    // Find the path for the next node (which should now be a paragraph)
    const nextPath = Path.next(listItemPath.slice(0, -1));

    // Move the selection to the start of the next node
    Transforms.select(editor, Editor.start(editor, nextPath));
    return true;
  }

  return false;
};

export const handleKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  editor: CustomEditor,
) => {
  if (event.key === 'Enter') {
    const {selection} = editor;

    if (!selection || Range.isExpanded(selection)) {
      return;
    }

    const [node] = Editor.node(editor, selection, {depth: 1}) as [
      BaseElement,
      Path,
    ];

    switch (node.type) {
      case 'numbered-list':
      case 'bulleted-list':
        return handleEnterOnListItem(editor, event, node);

      default:
        break;
    }
  }
};

export const modifyHTMLFontSizeForPDFRendering = (html: string) => {
  // Parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Select all elements with inline style containing font-size
  const elements = doc.querySelectorAll('[style*="font-size"]');

  // Loop through each element and set standard font sizes
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const currentFontSize = htmlElement.style.fontSize;
    htmlElement.style.fontSize =
      currentFontSize === FONT_SIZE.SMALL
        ? HTML_PDF_FONT_SIZE.SMALL
        : currentFontSize === FONT_SIZE.LARGE
        ? HTML_PDF_FONT_SIZE.LARGE
        : HTML_PDF_FONT_SIZE.NORMAL;
  });

  // Serialize the modified DOM back to HTML string
  return doc.documentElement.outerHTML;
};
