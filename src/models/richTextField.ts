import {ReactNode, Ref} from 'react';
import {BaseEditor} from 'slate';
import {HistoryEditor} from 'slate-history';
import {ReactEditor} from 'slate-react';

export const INDENTATION_PIXEL_SIZE = 41;

export enum FONT_SIZE {
  SMALL = '12px',
  NORMAL = '16px',
  LARGE = '20px',
}

export const DEFAULT_FONT_SIZE = FONT_SIZE.NORMAL;

export enum HTML_PDF_FONT_SIZE {
  SMALL = '9px',
  NORMAL = '11px',
  LARGE = '13px',
}

export enum HTML_PDF_FONT_SIZE_DESCRIPTION {
  SMALL = '7px',
  NORMAL = '9px',
  LARGE = '11px',
}

export enum FORMAT {
  'left' = 'left',
  'center' = 'center',
  'right' = 'right',
  'numbered-list' = 'numbered-list',
  'bulleted-list' = 'bulleted-list',
  'color' = 'color',
}

export const FORMAT_TO_ATTRIBUTE: Record<string, string> = {
  'increase-indent': 'text-indent',
  'decrease-indent': 'text-indent',
};

// Some properties need to go to the wrapper component (node), other to the selected component (leaf)
export const ELEMENT_TO_CHANGE: Record<string, 'node' | 'leaf'> = {
  'text-indent': 'node',
};

export const GROUP_TYPES = [FORMAT['numbered-list'], FORMAT['bulleted-list']];
export const ALIGNMENT_TYPES = [FORMAT.left, FORMAT.center, FORMAT.right];
export const BLOCK_TYPES = [...GROUP_TYPES, ...ALIGNMENT_TYPES];
export const PROPERTY_WITH_VALUE = [FORMAT.color];

export const ELEMENT_TAGS: Record<
  string,
  (el: HTMLElement | HTMLDivElement) =>
    | {
        type: string;
        ['text-indent']?: string;
        color?: string;
      }
    | undefined
> = {
  P: (el: HTMLElement) => {
    const style = ['left', 'right', 'center'].includes(el.style?.textAlign)
      ? el.style?.textAlign
      : 'paragraph'; // make 'paragraph' default for anything except align type
    const color = el.style?.color;

    return {
      type: style,
      ...(color ? {color} : {}),
    };
  },
  OL: () => ({type: 'numbered-list'}),
  UL: () => ({type: 'bulleted-list'}),
  LI: () => ({type: 'list-item'}),
  DIV: (el: HTMLDivElement | HTMLElement) => {
    if (el.style?.textAlign && el instanceof HTMLDivElement) {
      switch (el.style.textAlign) {
        case 'left':
          return {type: 'left'};
        case 'center':
          return {type: 'center'};
        case 'right':
          return {type: 'right'};
        default:
          return {type: 'paragraph'};
      }
    }
    return {type: 'paragraph'};
  },
};

export const TEXT_TAGS: Record<
  string,
  (el: HTMLElement) =>
    | {
        fontSize?: string;
        bold?: boolean;
        italic?: boolean;
        underlined?: boolean;
      }
    | undefined
> = {
  STRONG: () => ({bold: true}),
  B: () => ({bold: true}),
  EM: () => ({italic: true}),
  I: () => ({italic: true}),
  U: () => ({underlined: true}),
  SPAN: (el: HTMLElement) => {
    const fontSize = el.style?.fontSize;
    return fontSize ? {fontSize} : undefined;
  },
  DIV: (el: HTMLElement) => {
    const fontSize = el.style?.fontSize;
    return fontSize ? {fontSize} : undefined;
  },
};

export interface BaseText {
  text: string;
  fontSize?: FONT_SIZE;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  left?: boolean;
  center?: boolean;
  right?: boolean;
  bullet?: boolean;
  ordered?: boolean;
  color?: string;
  textIndent?: number;
}

export type BaseElement = {
  children: (BaseText | BaseElement)[];
  type: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: FONT_SIZE;
  color?: string;
  textIndent?: number;
};

export type Marks = Omit<BaseText, 'text'> & {
  [key: string]: boolean | undefined | string | number;
};

export interface RenderElementProps {
  children: string;
  element: BaseElement;
  attributes: {
    'data-slate-node': 'element';
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
    ref: Ref<
      HTMLUListElement | HTMLLIElement | HTMLOListElement | HTMLParagraphElement
    >;
  };
}

export interface RenderLeafProps {
  children: ReactNode;
  leaf: BaseText;
  attributes: {
    'data-slate-leaf': true;
  };
}

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: BaseElement;
    Text: BaseText;
  }
}

export enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
}
