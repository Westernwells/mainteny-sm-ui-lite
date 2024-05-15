import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  Ref,
  CSSProperties,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  DefaultElement,
} from 'slate-react';
import {createEditor, BaseEditor, Descendant} from 'slate';
import {HistoryEditor, withHistory} from 'slate-history';
import {theme} from 'theme';
import {debounce} from 'lodash';
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE,
  RenderElementProps,
  RenderLeafProps,
} from 'models/richTextField';
import {
  deserialize,
  handleKeyDown,
  serialize,
} from 'utils/rich-text-field-utils';
import {HoveringToolbar} from './HoveringToolbar';

const CustomElements = ({
  element,
  attributes,
  children,
}: RenderElementProps) => {
  const style = {fontSize: element.fontSize};

  switch (element.type) {
    case 'paragraph':
      return (
        <p
          style={{...style, margin: 0}}
          {...attributes}
          ref={attributes.ref as Ref<HTMLParagraphElement>}>
          {children}
        </p>
      );
    case 'bulleted-list':
      return (
        <ul
          style={style}
          {...attributes}
          ref={attributes.ref as Ref<HTMLUListElement>}>
          {children}
        </ul>
      );
    case 'list-item':
      return (
        <li
          style={style}
          {...attributes}
          ref={attributes.ref as Ref<HTMLLIElement>}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol
          style={style}
          {...attributes}
          ref={attributes.ref as Ref<HTMLOListElement>}>
          {children}
        </ol>
      );
    case 'left':
      return (
        <div
          style={{textAlign: 'left'}}
          {...attributes}
          ref={attributes.ref as Ref<HTMLDivElement>}>
          {children}
        </div>
      );
    case 'center':
      return (
        <div
          style={{textAlign: 'center'}}
          {...attributes}
          ref={attributes.ref as Ref<HTMLDivElement>}>
          {children}
        </div>
      );
    case 'right':
      return (
        <div
          style={{textAlign: 'right'}}
          {...attributes}
          ref={attributes.ref as Ref<HTMLDivElement>}>
          {children}
        </div>
      );
    default:
      // For the default case, we delegate to Slate's default rendering.
      return <DefaultElement {...{element, children, attributes}} />;
  }
};

const Leaf = ({attributes, children, leaf}: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  const style = {
    fontSize: DEFAULT_FONT_SIZE,
  };

  if (leaf.fontSize) {
    style.fontSize = String(leaf.fontSize).endsWith('px')
      ? leaf.fontSize
      : (`${String(leaf.fontSize)}px` as FONT_SIZE);
  }

  return (
    <span style={style} {...attributes}>
      {children}
    </span>
  );
};

const styles: Record<string, CSSProperties> = {
  fieldset: {
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    margin: 0,
    padding: '8.5px 14px',
    width: '100%',
  },
  legend: {
    color: theme.palette.text.secondary,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 2,
    letterSpacing: '0.15px',
  },
  editable: {
    outline: 'none',
  },
};

const RichTextField = ({
  label = '',
  placeholder = '',
  html,
  updateHtml,
}: {
  label?: string;
  placeholder?: string;
  html: string;
  updateHtml: (html: string) => void;
}) => {
  const {t} = useTranslation();
  const editorRef = useRef<(BaseEditor & ReactEditor & HistoryEditor) | null>(
    null,
  );
  if (!editorRef.current)
    editorRef.current = withHistory(withReact(createEditor()));
  const editor = editorRef.current;

  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{text: ''}],
    },
  ];
  const getValue = (htmlString: string) => {
    if (!htmlString) return initialValue;
    // check if htmlString is plain string
    const isPlainString = !/<[^>]+>/.test(htmlString);
    const parsed = new DOMParser().parseFromString(
      isPlainString ? `<p>${htmlString}</p>` : htmlString,
      'text/html',
    );
    return deserialize(parsed.body);
  };
  const [value, setValue] = useState(() => getValue(html) as Descendant[]);

  const renderElement = useCallback(
    (p: RenderElementProps) => <CustomElements {...p} />,
    [],
  );

  const renderLeaf = useCallback((p: RenderLeafProps) => <Leaf {...p} />, []);

  useEffect(() => {
    const newValue = getValue(html) as Descendant[];
    editor.children = newValue;
    setValue(newValue);
  }, [html]);

  const debouncedUpdateHtml = useMemo(
    () =>
      debounce((e) => {
        const newHTML = serialize(e);
        updateHtml(newHTML);
      }, 700),
    [updateHtml],
  );

  const handleChange = (v: Descendant[]) => {
    setValue(v);
    debouncedUpdateHtml(editor);
  };

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) =>
      handleKeyDown(event, editor),
    [editor],
  );

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <HoveringToolbar />
      <fieldset style={styles.fieldset}>
        <legend style={{...styles.legend, padding: label ? '2px' : '0'}}>
          {t(label)}
        </legend>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={t(placeholder)}
          renderPlaceholder={({attributes, children}) => (
            <span
              {...attributes}
              style={{...attributes.style, top: 'auto', fontSize: '16px'}}>
              {children}
            </span>
          )}
          style={{...styles.editable, marginTop: label ? '-10px' : '0px'}}
          onKeyDown={onKeyDown}
        />
      </fieldset>
    </Slate>
  );
};

export default React.memo(RichTextField);
