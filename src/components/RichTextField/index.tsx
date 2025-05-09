import React, {
  CSSProperties,
  PropsWithChildren,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  DefaultElement,
  Editable,
  ReactEditor,
  Slate,
  withReact,
} from 'slate-react';
import {BaseEditor, createEditor, Descendant, Editor, Transforms} from 'slate';
import {HistoryEditor, withHistory} from 'slate-history';
import {theme} from 'theme';
import {FormControl, FormHelperText} from '@mui/material';
import {debounce} from 'lodash';
import {
  FONT_SIZE,
  RenderElementProps,
  RenderLeafProps,
} from 'models/richTextField';
import {deserialize, handleKeyDown, serialize} from 'utils/rich-text-field';
import {RTFErrorBoundary} from 'components/ErrorBoundaries/RTFErrorBoundary';
import {HoveringToolbar} from './HoveringToolbar';
import {isPlainString} from '../../utils/rich-field-string';

const CustomElements = ({
  element,
  attributes,
  children,
}: RenderElementProps) => {
  const style = {
    fontSize: element.fontSize,
    color: element.color,
    textIndent: element.textIndent,
  };

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
          style={{
            ...style,
            marginLeft: '20px',
            listStyleType: 'disc',
            listStylePosition: 'inside',
          }}
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
          style={{
            ...style,
            marginLeft: '20px',
            listStyleType: 'decimal',
            listStylePosition: 'inside',
          }}
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
  if (leaf.fontSize) {
    const style = {
      fontSize: String(leaf.fontSize).endsWith('px')
        ? leaf.fontSize
        : (`${String(leaf.fontSize)}px` as FONT_SIZE),
    };
    return (
      <span style={style} {...attributes}>
        {children}
      </span>
    );
  }
  return <span {...attributes}>{children}</span>;
};

const styles: Record<string, CSSProperties> = {
  fieldset: {
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    margin: 0,
    padding: '8.5px 14px',
    width: '100%',
  },
  errorFieldset: {
    border: `1px solid ${theme.palette.error.main}`,
  },
  legend: {
    color: theme.palette.text.secondary,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 2,
    letterSpacing: '0.15px',
  },
  redText: {
    color: theme.palette.error.main,
  },
  editable: {
    flex: 1,
    outline: 'none',
  },
  endAdornment: {
    marginTop: '-10px',
  },
  inputWrapper: {
    display: 'flex',
  },
};

interface Props {
  label?: string;
  placeholder?: string;
  html: string;
  updateHtml: (html: string) => void;
  required?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  error?: boolean;
  helperText?: string;
  minRows?: number;
  containerMinHeight?: number;
  endAdornment?: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: any) => void;
  name?: string;
  fieldsetStyles?: React.CSSProperties;
}

const RichTextField = ({
  label = '',
  placeholder = '',
  html,
  updateHtml,
  required = false,
  onBlur,
  error = false,
  helperText = '',
  minRows = 1,
  containerMinHeight,
  endAdornment,
  disabled = false,
  onClick,
  name,
  fieldsetStyles,
  ...props
}: PropsWithChildren<Props>) => {
  const {t} = useTranslation();
  const editorRef = useRef<(BaseEditor & ReactEditor & HistoryEditor) | null>(
    null,
  );
  if (!editorRef.current)
    editorRef.current = withHistory(withReact(createEditor()));
  const editor = editorRef.current;

  const getValue = (htmlString: string) => {
    const initialValue: Descendant[] = [
      {type: 'paragraph', children: [{text: ''}]},
    ];
    if (!htmlString) return initialValue;
    const parsed = new DOMParser().parseFromString(
      isPlainString(htmlString) ? `<p>${htmlString}</p>` : htmlString,
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
    if (!editor || !html) return;
    const newValue = getValue(html) as Descendant[];
    const {selection} = editor;
    if (JSON.stringify(value) !== JSON.stringify(newValue)) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.delete(editor, {
          at: {anchor: Editor.start(editor, []), focus: Editor.end(editor, [])},
        });
        Transforms.removeNodes(editor, {at: [0], voids: true});
        Transforms.insertNodes(editor, newValue, {at: [0]});
        if (selection && Editor.hasPath(editor, selection.anchor.path)) {
          Transforms.select(editor, selection);
        }
      });
      setValue(newValue);
    }
  }, [html]);

  const debouncedUpdateHtml = useMemo(
    () => debounce((e) => updateHtml(serialize(e)), 700),
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
    <RTFErrorBoundary>
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        {disabled ? null : <HoveringToolbar />}
        <FormControl fullWidth disabled={disabled} {...props}>
          <fieldset
            style={{
              ...styles.fieldset,
              ...(error && styles.errorFieldset),
              ...(containerMinHeight && {minHeight: `${containerMinHeight}px`}),
              ...(fieldsetStyles ?? {}),
            }}>
            <legend
              style={{
                ...styles.legend,
                padding: label ? '2px' : '0',
                ...(error && styles.redText),
              }}>
              {t(label)} {required && <span style={styles.redText}>*</span>}
            </legend>
            <div style={styles.inputWrapper}>
              <Editable
                id={name}
                name={name}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder={t(placeholder)}
                renderPlaceholder={({attributes, children}) => (
                  <span
                    {...attributes}
                    style={{
                      ...attributes.style,
                      top: 'auto',
                      fontSize: '16px',
                    }}>
                    {children}
                  </span>
                )}
                style={{
                  ...styles.editable,
                  marginTop: label ? '-10px' : '0px',
                  minHeight: `${minRows * 24}px`,
                  fontSize: '16px',
                  lineHeight: '1.5',
                }}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                onClick={onClick}
                readOnly={disabled}
              />
              {endAdornment && (
                <div style={styles.endAdornment}>{endAdornment}</div>
              )}
            </div>
          </fieldset>
          {helperText && (
            <FormHelperText error={error}>{t(helperText)}</FormHelperText>
          )}
        </FormControl>
      </Slate>
    </RTFErrorBoundary>
  );
};

export default React.memo(RichTextField);
