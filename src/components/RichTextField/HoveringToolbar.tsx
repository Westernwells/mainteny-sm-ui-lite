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
import {useAuth} from 'hooks/useAuth';
import {Role} from 'models/user';

const AI_ENABLED_SERVICE_COMPANY_IDS = [
  '9e4e3049-0f41-4a21-ab0e-7932b7f54005',
  'b270952a-7d58-458f-8259-4fd4091612fd',
  'f9ab7e6e-339c-46e3-a484-10092637ec43',
  '7c9e6bf9-c488-4d8f-9bf9-a9d4439ec655',
];

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme: t}) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    border: 0,
    borderRadius: t.shape.borderRadius,
    color: 'white',
    padding: `${t.spacing(0.5)} ${t.spacing(1)}`,
    '&:hover': {backgroundColor: 'rgba(255, 255, 255, 0.20)'},
  },
}));

const StyledButtonContainer = styled('div')(({theme: t}) => ({
  display: 'inline-flex',
  '& .MuiIconButton-root': {
    border: 0,
    height: '41px',
    borderRadius: t.shape.borderRadius,
    color: 'white',
    padding: `${t.spacing(0.5)} ${t.spacing(1)}`,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
  },
}));

const Portal = ({children}: {children?: ReactNode}) =>
  typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;

export const HoveringToolbar = ({
  container,
}: {
  container: HTMLElement | null;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const inFocus = useFocused();
  const {secondaryColor} = useContext(PdfStylesContext);
  const {user} = useAuth();

  const [openSelectFontSize, setOpenSelectFontSize] = useState(false);
  const [color, setColor] = useState(secondaryColor);
  const [usedAI, setUsedAI] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [offset, setOffset] = useState('0px');

  const roles = user?.roles || [];
  const serviceCompanyId = user?.serviceCompany?.id ?? '';

  const canUseAI =
    roles.includes(Role.SERVICE_MANAGER) &&
    AI_ENABLED_SERVICE_COMPANY_IDS.includes(serviceCompanyId);

  const handleRewriteWithAI = async () => {
    const {selection} = editor;
    if (!selection || Range.isCollapsed(selection)) return;
    const text = Editor.string(editor, selection).trim();
    if (!text) return;
    setLoadingAI(true);
    try {
      const res = await fetch(
        'https://applications-mainteny-openai-api.vercel.app/api/rewrite-description',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({text}),
        },
      );
      const data = await res.json();
      if (res.ok && data.rewritten) {
        Transforms.insertText(editor, data.rewritten, {at: selection});
        setUsedAI(true);
      } else {
        console.error('AI rewrite failed', data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleMark = (_: MouseEvent<HTMLElement>, format: string) =>
    toggleMark(editor, format);
  const handleBlock = (_: MouseEvent<HTMLElement>, format: FORMAT) =>
    toggleBlock(editor, format);
  const handleAddAttribute = (fmt: FORMAT) => () =>
    addAttributeToBlock(editor, fmt);
  const handleRemoveAttribute = (fmt: FORMAT) => () =>
    removeAttributeToBlock(editor, fmt);
  const handleOpen = () => setOpenSelectFontSize(true);
  const handleClose = () => setOpenSelectFontSize(false);
  const handleColorChange = (value: string) => {
    setColor(value);
    toggleBlock(editor, FORMAT.color, value);
    handleClose();
  };
  const handleClearStyle = () => {
    removeMarks(editor, ['bold', 'italic', 'underline', 'fontSize']);
    removeBlocks(editor, [FORMAT.color]);
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

  useEffect(() => {
    const onClick: (this: Document, e: Event) => void = (e) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || container?.contains(target)) return;
      if (!openSelectFontSize) {
        setOpenSelectFontSize(false);
        if (ref.current) ref.current.removeAttribute('style');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [container, openSelectFontSize]);

  useEffect(() => {
    if (!inFocus && !openSelectFontSize && ref.current) {
      ref.current.removeAttribute('style');
    }
  }, [inFocus, openSelectFontSize]);

  useEffect(() => {
    const el = ref.current;
    const {selection} = editor;
    if (
      !el ||
      !selection ||
      (!inFocus && !openSelectFontSize) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el?.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      el.removeAttribute('style');
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rects = domRange.getClientRects();
    const rect = rects.length > 0 ? rects[0] : domRange.getBoundingClientRect();
    const toolbarWidth = el.offsetWidth;
    const scrollX = window.pageXOffset;
    const viewportWidth = window.innerWidth;

    let left = rect.left + scrollX;
    if (rect.left + toolbarWidth > viewportWidth) {
      left = rect.right + scrollX - toolbarWidth;
    }
    left = Math.max(0, left);

    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${left}px`;
    setOffset(`${rect.top}px`);
  }, [inFocus, editor.selection, openSelectFontSize]);

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
          opacity: 0;
          background-color: #000034;
          border-radius: 4px;
          transition: opacity 0.2s;
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
            '& .MuiSvgIcon-root': {color: 'white'},
          }}
          MenuProps={{
            disablePortal: true,
            anchorOrigin: {vertical: 'bottom', horizontal: 'left'},
            transformOrigin: {vertical: 'top', horizontal: 'left'},
            sx: {
              '& .MuiPaper-root': {
                marginLeft: '-8px',
                marginTop: {offset},
              },
            },
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
              anchor={ref}
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
          <IconButton onClick={handleAddAttribute(FORMAT['text-indent'])}>
            <FormatIndentIncreaseIcon />
          </IconButton>
          <IconButton onClick={handleRemoveAttribute(FORMAT['text-indent'])}>
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

        {canUseAI && (
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
        )}
      </Box>
    </Portal>
  );
};
