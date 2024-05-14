import {ReactNode, Ref} from 'react';
import {BaseEditor} from 'slate';
import {HistoryEditor} from 'slate-history';
import {ReactEditor} from 'slate-react';

export enum FONT_SIZE {
  SMALL = '12px',
  NORMAL = '16px',
  LARGE = '20px',
}

export const DEFAULT_FONT_SIZE = FONT_SIZE.NORMAL;

export enum FORMAT {
  'left' = 'left',
  'center' = 'center',
  'right' = 'right',
  'numbered-list' = 'numbered-list',
  'bulleted-list' = 'bulleted-list',
}
export const GROUP_TYPES = [FORMAT['numbered-list'], FORMAT['bulleted-list']];
export const ALIGNMENT_TYPES = [FORMAT.left, FORMAT.center, FORMAT.right];
export const BLOCK_TYPES = [...GROUP_TYPES, ...ALIGNMENT_TYPES];

export const ELEMENT_TAGS: Record<
  string,
  (el: HTMLElement | HTMLDivElement) => {type: string} | undefined
> = {
  P: () => ({type: 'paragraph'}),
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
  EM: () => ({italic: true}),
  U: () => ({underlined: true}),
  DIV: (el: HTMLElement) => ({
    fontSize: el.style?.fontSize ? el.style?.fontSize : DEFAULT_FONT_SIZE,
  }),
  SPAN: (el: HTMLElement) => ({
    fontSize: el.style?.fontSize ? el.style?.fontSize : DEFAULT_FONT_SIZE,
  }),
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
}

export type BaseElement = {
  children: (BaseText | BaseElement)[];
  type: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: FONT_SIZE;
};

export type Marks = Omit<BaseText, 'text'> & {
  [key: string]: boolean | undefined | string;
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
