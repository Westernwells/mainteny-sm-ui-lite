import {ReactNode, useRef, useEffect, MouseEvent, useState} from 'react';
import ReactDOM from 'react-dom';
import {useTranslation} from 'react-i18next';
import {useSlate, useFocused} from 'slate-react';
import {Editor, Range} from 'slate';
import {css} from '@emotion/css';
import {
  Box,
  Divider,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
  toggleButtonGroupClasses,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TextFields from '@mui/icons-material/TextFields';
import {
  getActiveFontSize,
  toggleBlock,
  toggleMark,
} from 'utils/rich-text-field';
import {FONT_SIZE, FORMAT} from 'models/richTextField';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme: t}) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    border: 0,
    borderRadius: t.shape.borderRadius,
    color: 'white',
    padding: `${t.spacing(0.5)} ${t.spacing(1)}`,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
  },
}));

const Portal = ({children}: {children?: ReactNode}) =>
  typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;

export const HoveringToolbar = () => {
  const {t} = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const inFocus = useFocused();
  const [openSelectFontSize, setOpenSelectFontSize] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const {selection} = editor;
    if (!el) {
      return;
    }

    if (
      !selection ||
      (!inFocus && !openSelectFontSize) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      el.removeAttribute('style');
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect() || {
      top: 0,
      left: 0,
      width: 0,
    };

    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2 + 90
    }px`;
  }, [inFocus, editor.selection, openSelectFontSize]);

  const handleMark = (_event: MouseEvent<HTMLElement>, format: string) =>
    toggleMark(editor, format);

  const handleBlock = (_event: MouseEvent<HTMLElement>, format: FORMAT) =>
    toggleBlock(editor, format);

  const handleClose = () => setOpenSelectFontSize(false);

  const handleOpen = () => setOpenSelectFontSize(true);

  const fontSizeOptions = [
    {value: FONT_SIZE.SMALL, label: 'Small'},
    {value: FONT_SIZE.NORMAL, label: 'Normal'},
    {value: FONT_SIZE.LARGE, label: 'Large'},
  ];

  const renderLabel = (value: string) => {
    const option = fontSizeOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const activeFontSize = getActiveFontSize(editor);
  const textSize =
    activeFontSize === FONT_SIZE.SMALL
      ? '12px'
      : activeFontSize === FONT_SIZE.LARGE
      ? '20px'
      : '16px';

  return (
    <Portal>
      <Box
        ref={ref}
        className={css`
          display: flex;
          padding: 8px;
          position: absolute;
          z-index: 9000;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #000034;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
        onMouseDown={
          (e) => e.preventDefault() // prevent toolbar from taking focus away from editor
        }>
        <Select
          labelId="select-font-size-label"
          id="select-font-size"
          open={openSelectFontSize}
          onClose={handleClose}
          onOpen={handleOpen}
          value={textSize}
          onChange={(e) => toggleMark(editor, 'fontSize', e.target.value)}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.20)',
            color: 'white',
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
          }}
          inputProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: 'primary.dark',
                  color: 'inputBackground.main',
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: 'primary.dark',
                    opacity: 0.8,
                  },
                },
              },
            },
          }}
          displayEmpty
          renderValue={(value: string) => (
            <Box display="flex" alignItems="center" gap={1}>
              <TextFields sx={{color: 'white'}} />
              <Typography>{t(renderLabel(value))}</Typography>
            </Box>
          )}>
          {fontSizeOptions.map((i) => (
            <MenuItem value={i.value} key={i.value}>
              {t(i.label)}
            </MenuItem>
          ))}
        </Select>
        <StyledToggleButtonGroup
          size="small"
          exclusive
          onChange={handleMark}
          aria-label="text formatting">
          <ToggleButton value="bold" aria-label="bold">
            <FormatBoldIcon />
          </ToggleButton>
          <ToggleButton value="italic" aria-label="italic">
            <FormatItalicIcon />
          </ToggleButton>
          <ToggleButton value="underlined" aria-label="underlined">
            <FormatUnderlinedIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Divider
          flexItem
          orientation="vertical"
          sx={{mx: 0.5, my: 1, border: '1px solid #8F9BB380'}}
        />
        <StyledToggleButtonGroup
          size="small"
          exclusive
          onChange={handleBlock}
          aria-label="text alignment">
          <ToggleButton value="left" aria-label="left aligned">
            <FormatAlignLeftIcon />
          </ToggleButton>
          <ToggleButton value="center" aria-label="centered">
            <FormatAlignCenterIcon />
          </ToggleButton>
          <ToggleButton value="right" aria-label="right aligned">
            <FormatAlignRightIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Divider
          flexItem
          orientation="vertical"
          sx={{mx: 0.5, my: 1, border: '1px solid #8F9BB380'}}
        />
        <StyledToggleButtonGroup
          size="small"
          exclusive
          onChange={handleBlock}
          aria-label="text formatting">
          <ToggleButton value="bulleted-list" aria-label="bulleted">
            <FormatListBulletedIcon />
          </ToggleButton>
          <ToggleButton value="numbered-list" aria-label="numbered">
            <FormatListNumberedIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>
    </Portal>
  );
};
