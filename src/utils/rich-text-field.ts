import {KeyboardEvent} from 'react';
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Path,
  Range,
  Text,
  Transforms,
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
  ELEMENT_TO_CHANGE,
  FONT_SIZE,
  FORMAT,
  FORMAT_TO_ATTRIBUTE,
  GROUP_TYPES,
  HTML_PDF_FONT_SIZE,
  INDENTATION_PIXEL_SIZE,
  Marks,
  NodeType,
  PROPERTY_WITH_VALUE,
  TEXT_TAGS,
} from 'models/richTextField';

export const DEFAULT_RICH_TEXT_HTML = '<p></p>'; // fallback for empty Slate values

const getNodeType = (isActive: boolean, isGroup: boolean) => {
  if (isActive) return 'paragraph';
  if (isGroup) return 'list-item';
};

const recursiveNodeHasText = (node: BaseElement | BaseText): boolean => {
  // If it's a direct text node
  if (Text.isText(node)) {
    return node.text !== undefined && node.text.trim() !== '';
  }

  // If it's an element without children
  if (
    SlateElement.isElement(node) &&
    (!node.children || node.children.length === 0)
  ) {
    return false;
  }

  // Recursive case for node children
  if (node.children && Array.isArray(node.children)) {
    return node.children.some((child) =>
      // Recursively check each child
      recursiveNodeHasText(child),
    );
  }

  return false;
};

const isAtFirstLineStart = (editor: Editor) => {
  const {selection} = editor;

  if (!selection || !Range.isCollapsed(selection)) return false; // isCollapsed means no text selected

  const [_, path] = Editor.node(editor, selection);

  const isFirstBlock = path[0] === 0;

  if (!isFirstBlock) return false;

  const start = Editor.start(editor, path);

  return (
    selection.anchor.offset === start.offset &&
    Path.equals(selection.anchor.path, start.path)
  );
};

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
  try {
    const marks = Editor.marks(editor);
    if (marks && marks.fontSize) {
      return marks.fontSize;
    }
    return DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
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

export const removeMarks = (editor: CustomEditor, formats: string[]) => {
  formats.forEach((format) => {
    Editor.removeMark(editor, format);
  });
};

const removeBlock = (editor: CustomEditor, format: FORMAT) => {
  const isAlignment = ALIGNMENT_TYPES.includes(format);
  const isGroup = GROUP_TYPES.includes(format);

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

  // keep node but remove format property
  Transforms.unsetNodes(editor, format);
};

export const removeBlocks = (editor: CustomEditor, formats: FORMAT[]) => {
  formats.forEach((format) => removeBlock(editor, format));
};

export const toggleBlock = (
  editor: CustomEditor,
  format: FORMAT,
  value?: string,
) => {
  const isActive = format !== FORMAT.color && isBlockActive(editor, format);
  const isGroup = GROUP_TYPES.includes(format);
  const isAlignment = ALIGNMENT_TYPES.includes(format);
  const isProperty = PROPERTY_WITH_VALUE.includes(format);

  if (isProperty && value === undefined) return;

  const propertiesToAdd = {
    [format]: value,
  };

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
    const type = getNodeType(isActive || isProperty, isGroup) ?? format;

    Transforms.setNodes(editor, {type, ...propertiesToAdd});
  }

  if ((!isActive && isGroup) || isAlignment) {
    const block = {type: format, children: [{text: ''}]};
    Transforms.wrapNodes(editor, block, {split: true});

    const selectedNodes = Array.from(
      Editor.nodes(editor, {match: (n) => SlateElement.isElement(n)}),
    );

    if (selectedNodes.length === 0) {
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{text: ''}],
      });
    }
  }

  if (editor.children.length === 0 || Editor.string(editor, []) === '') {
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{text: ''}],
    });
  }
};

const convertNumberToPixelStringValue = (value: number) => `${value}px`;

const convertPixelStringToNumber = (value: string) =>
  Number(value.slice(0, -2));

export const addAttributeToBlock = (editor: CustomEditor, format: FORMAT) => {
  const {selection} = editor;
  if (!selection) return false;

  const markToUpdate = FORMAT_TO_ATTRIBUTE[format];
  if (!markToUpdate) return;

  const shouldChangeNode =
    ELEMENT_TO_CHANGE[markToUpdate].type === 'node' || false;

  if (shouldChangeNode) {
    // Get all nodes in the selection as an array and iterate
    const nodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === ELEMENT_TO_CHANGE[markToUpdate].target,
      }),
    );

    // update each node
    nodes.forEach((nodeEntry) => {
      const [node, path] = nodeEntry;

      // @ts-ignore
      const currentMarkValue = node[markToUpdate];
      // currently uses only indentation logic
      const newMarkValue = currentMarkValue
        ? convertPixelStringToNumber(currentMarkValue as string) +
          INDENTATION_PIXEL_SIZE
        : INDENTATION_PIXEL_SIZE;

      Transforms.setNodes(
        editor,
        {
          [markToUpdate]: convertNumberToPixelStringValue(newMarkValue),
        },
        {at: path}, // This location of the current node to update
      );
    });
  } else {
    // implemented without use case. MAY NEED WORK before its production ready
    const foundMarks: Marks = Editor.marks(editor) || {};
    const currentMarkValue = foundMarks[markToUpdate];

    // currently uses only indentation logic
    const newMarkValue = currentMarkValue
      ? convertPixelStringToNumber(currentMarkValue as string) +
        INDENTATION_PIXEL_SIZE
      : INDENTATION_PIXEL_SIZE;

    Editor.addMark(
      editor,
      markToUpdate,
      convertNumberToPixelStringValue(newMarkValue),
    );
  }
};

export const removeAttributeToBlock = (
  editor: CustomEditor,
  format: FORMAT,
) => {
  const {selection} = editor;
  if (!selection) return false;

  const markToUpdate = FORMAT_TO_ATTRIBUTE[format];
  if (!markToUpdate) return;

  const shouldChangeNode =
    ELEMENT_TO_CHANGE[markToUpdate].type === 'node' || false;

  if (shouldChangeNode) {
    // Get all nodes in the selection as an array and iterate
    const nodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === ELEMENT_TO_CHANGE[markToUpdate].target,
      }),
    );

    // update each node
    nodes.forEach((nodeEntry) => {
      const [node, path] = nodeEntry;

      // @ts-ignore
      const {[markToUpdate]: currentMarkValue, ...rest} = node;

      // currently uses only indentation logic
      const newMarkValue = currentMarkValue
        ? convertPixelStringToNumber(currentMarkValue as string) -
          INDENTATION_PIXEL_SIZE
        : 0;

      const isMarkValid = newMarkValue && newMarkValue > 0;

      const updatedProps = {
        ...rest, // keep not related fields
        ...(isMarkValid
          ? {[markToUpdate]: convertNumberToPixelStringValue(newMarkValue)}
          : {[markToUpdate]: undefined}), // reset field needs to be passed with undefined
      };

      Transforms.setNodes(
        editor,
        updatedProps,
        {at: path}, // This location of the current node to update
      );
    });

    // currently uses only indentation logic
  } else {
    const foundMarks: Marks = Editor.marks(editor) || {};
    const currentMarkValue = foundMarks[markToUpdate];

    // currently uses only indentation logic
    const newMarkValue = currentMarkValue
      ? convertPixelStringToNumber(currentMarkValue as string) -
        INDENTATION_PIXEL_SIZE
      : INDENTATION_PIXEL_SIZE;

    const isMarkValid = newMarkValue > 0;

    if (isMarkValid) {
      Editor.addMark(
        editor,
        markToUpdate,
        convertNumberToPixelStringValue(newMarkValue),
      );
    } else {
      Editor.removeMark(editor, markToUpdate);
    }
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

  const pStyle = {
    ...(node.color ? {color: node.color} : undefined),
    ...(node.textIndent ? {'text-indent': node.textIndent} : undefined),
  };

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
      return pStyle
        ? `<p style="${getStyleString(pStyle)}">${children}</p>`
        : `<p>${children}</p>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'list-item': {
      return node.fontSize
        ? `<li style="${
            Object.entries(style).length ? getStyleString(style) : undefined
          }">${children}</li>`
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

    return children.map((child) =>
      jsx('text', attrs, typeof child === 'string' ? {text: child} : child),
    );
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
  const {selection} = editor;

  if (!selection || Range.isExpanded(selection)) {
    return;
  }

  const [node] = Editor.node(editor, selection, {depth: 1}) as [
    BaseElement,
    Path,
  ];

  switch (event.key) {
    case 'Enter':
      if (
        node.type === FORMAT['numbered-list'] ||
        node.type === FORMAT['bulleted-list']
      ) {
        return handleEnterOnListItem(editor, event, node);
      }
      break;
    case 'Tab':
      {
        const format = FORMAT['text-indent'];
        const attribute = FORMAT_TO_ATTRIBUTE[format];
        if (node.type === ELEMENT_TO_CHANGE[attribute].target) {
          event.preventDefault();
          return addAttributeToBlock(editor, format);
        }
      }
      break;
    case 'Backspace':
      {
        const format = FORMAT['text-indent'];
        const hasText = recursiveNodeHasText(node);
        if (!hasText || isAtFirstLineStart(editor)) {
          return removeAttributeToBlock(editor, format);
        }
      }
      break;
    case ' ': {
      const {anchor} = selection;
      const start = Editor.start(editor, anchor.path);
      const range = {anchor, focus: start};
      const text = Editor.string(editor, range);

      // Check for list shortcuts
      if (text === '-') {
        // Create bulleted list
        event.preventDefault();
        Transforms.delete(editor, {
          at: range,
        });
        toggleBlock(editor, FORMAT['bulleted-list']);
      } else if (text === '1.') {
        // Create ordered list
        event.preventDefault();
        Transforms.delete(editor, {
          at: range,
        });
        toggleBlock(editor, FORMAT['numbered-list']);
      }
      break;
    }
    default:
      break;
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

export const generateTextIndent = (html: string) => {
  // Parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Select all elements with inline style containing text-indent
  const elements = doc.querySelectorAll('[style*="text-indent"]');

  // Loop through each element and set standard font sizes
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.marginLeft = htmlElement.style.textIndent;
  });

  // Serialize the modified DOM back to HTML string
  return doc.documentElement.outerHTML;
};

export const hasMultipleParagraphs = (value: string) =>
  value.split('<p>').length > 2;

export const returnFirstParagraph = (value: string) => {
  const firstString = value
    .split('<p>')
    .slice(1) // remove opening p tag
    [0] // take first line
    .split('</p>')[0]; // take before closing p tag

  return `<p>${firstString} ...</p>`; // encapsulate in single paragraph
};
