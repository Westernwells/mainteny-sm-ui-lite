import {
  MouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import {useTranslation} from 'react-i18next';
import {useFocused, useSlate} from 'slate-react';
import {Editor, Range, Transforms} from 'slate';
import {css} from '@emotion/css';
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  toggleButtonGroupClasses,
  Typography,
  useTheme,
  CircularProgress,
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
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  addAttributeToBlock,
  getActiveFontSize,
  removeAttributeToBlock,
  removeBlocks,
  removeMarks,
  toggleBlock,
  toggleMark,
} from 'utils/rich-text-field';
import {FONT_SIZE, FORMAT} from 'models/richTextField';
import ColorPickerPredefined from 'components/ColorPicker/ColorPickerPredefined';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import CustomColorPicker from 'components/ColorPicker/CustomColorPicker';

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

const StyledButtonContainer = styled('div')(({theme: t}) => ({
  display: 'inline-flex',

  [`& .MuiIconButton-root`]: {
    border: 0,
    height: '41px',
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
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const inFocus = useFocused();
  const [openSelectFontSize, setOpenSelectFontSize] = useState(false);
  const {secondaryColor} = useContext(PdfStylesContext);
  const [color, setColor] = useState(secondaryColor);
  const [usedAI, setUsedAI] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const {selection} = editor;
    if (!el) return;

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
    const rect = domRange.getBoundingClientRect();
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

  const handleAddAttribute = (format: FORMAT) => () =>
    addAttributeToBlock(editor, format);

  const handleRemoveAttribute = (format: FORMAT) => () =>
    removeAttributeToBlock(editor, format);

  const handleClose = () => setOpenSelectFontSize(false);
  const handleOpen = () => setOpenSelectFontSize(true);

  const handleColorChange = (value: string) => {
    setColor(value);
    toggleBlock(editor, FORMAT.color, value);
  };

  const handleClearStyle = () => {
    removeMarks(editor, ['bold', 'italic', 'underline', 'fontSize']);
    removeBlocks(editor, [FORMAT.color]);
  };

  const handleRewriteWithAI = async () => {
    const {selection} = editor;
    if (!selection || Range.isCollapsed(selection)) return;

    const text = Editor.string(editor, selection);
    if (!text.trim()) return;

    setLoadingAI(true);
    try {
      const response = await fetch(
        'https://applications-mainteny-openai-api.vercel.app/api/rewrite-description',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({text}),
        },
      );

      const data = await response.json();
      if (response.ok && data.rewritten) {
        Transforms.insertText(editor, data.rewritten, {at: selection});
        setUsedAI(true);
      } else {
        console.error('Rewrite failed', data.error);
      }
    } catch (error) {
      console.error('Error calling rewrite API:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fontSizeOptions = [
    {value: FONT_SIZE.SMALL, label: 'Small'},
    {value: FONT_SIZE.NORMAL, label: 'Normal'},
    {value: FONT_SIZE.LARGE, label: 'Large'},
  ];

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
        onMouseDown={(e) => e.preventDefault()}>
        <Select
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
          renderValue={() => (
            <Box display="flex" alignItems="center" gap={1}>
              <TextFields sx={{color: 'white'}} />
            </Box>
          )}>
          {fontSizeOptions.map((i) => (
            <MenuItem value={i.value} key={i.value}>
              <Box
                sx={{
                  padding: '0px 12px',
                  ...(activeFontSize === i.value && {
                    border: `2px solid #fff`,
                  }),
                }}>
                {t(i.label)}
              </Box>
            </MenuItem>
          ))}
          <Box
            sx={{
              width: '228px',
              display: 'flex',
              flexDirection: 'column',
              padding: '8px 12px',
              borderTop: '1px solid #222B45',
              gap: theme.spacing(1),
            }}>
            <ColorPickerPredefined
              selectedColor={color}
              onClick={handleColorChange}
              size="small"
            />
            <CustomColorPicker
              initialValue={color}
              onChange={handleColorChange}
              backgroundTheme="dark"
            />
          </Box>
          <Box
            sx={{
              width: '228px',
              display: 'flex',
              padding: '8px 12px 4px',
              borderTop: '1px solid #222B45',
            }}>
            <Button
              variant="text"
              sx={{display: 'flex', gap: theme.spacing(0.5), color: '#fff'}}
              startIcon={<EditOffOutlinedIcon />}
              disableRipple
              onClick={handleClearStyle}>
              <Typography variant="body2" component="div">
                {t('Clear formatting')}
              </Typography>
            </Button>
          </Box>
        </Select>

        <StyledToggleButtonGroup size="small" exclusive onChange={handleMark}>
          <ToggleButton value="bold">
            <FormatBoldIcon />
          </ToggleButton>
          <ToggleButton value="italic">
            <FormatItalicIcon />
          </ToggleButton>
          <ToggleButton value="underlined">
            <FormatUnderlinedIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>
        <StyledButtonContainer>
          <IconButton
            onClick={handleAddAttribute(FORMAT['text-indent'])}
            aria-label="increase indent">
            <FormatIndentIncreaseIcon />
          </IconButton>
          <IconButton
            onClick={handleRemoveAttribute(FORMAT['text-indent'])}
            aria-label="decrease indent">
            <FormatIndentDecreaseIcon />
          </IconButton>
        </StyledButtonContainer>

        <Divider flexItem orientation="vertical" sx={{mx: 0.5, my: 1}} />

        <StyledToggleButtonGroup size="small" exclusive onChange={handleBlock}>
          <ToggleButton value="left">
            <FormatAlignLeftIcon />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenterIcon />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRightIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{mx: 0.5, my: 1}} />

        <StyledToggleButtonGroup size="small" exclusive onChange={handleBlock}>
          <ToggleButton value="bulleted-list">
            <FormatListBulletedIcon />
          </ToggleButton>
          <ToggleButton value="numbered-list">
            <FormatListNumberedIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{mx: 0.5, my: 1}} />

        <Button
          variant="text"
          sx={{color: 'white', display: 'flex', gap: 1, ml: 1}}
          disabled={loadingAI}
          onClick={handleRewriteWithAI}
          startIcon={
            loadingAI ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }>
          {usedAI ? t('Rewrite with AI') : t('Write with AI')}
        </Button>
      </Box>
    </Portal>
  );
};
