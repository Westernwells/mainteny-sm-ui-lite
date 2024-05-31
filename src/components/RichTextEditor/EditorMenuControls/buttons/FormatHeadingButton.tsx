import TextFieldsIcon from '@mui/icons-material/TextFields';
import {Box, MenuItem, Select, Typography} from '@mui/material';
import {Editor} from '@tiptap/react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {FONT_SIZE} from 'models/richTextField';

interface Props {
  editor: Editor | null;
}

const headingSizeLabels = {
  [FONT_SIZE.SMALL]: 'Small',
  [FONT_SIZE.NORMAL]: 'Normal',
  [FONT_SIZE.LARGE]: 'Large',
} as const;

const FormatHeadingButton = ({editor}: Props) => {
  const {t} = useTranslation();
  const [openSelectFontSize, setOpenSelectFontSize] = useState(false);

  const handleClose = () => setOpenSelectFontSize(false);
  const handleOpen = () => setOpenSelectFontSize(true);

  const handleChangeFontSize = (value: FONT_SIZE) => {
    editor?.chain().focus().setFontSize(value).run();
  };

  const textSize =
    editor?.getAttributes('textStyle')?.fontSize || FONT_SIZE.NORMAL;

  return (
    <Select
      labelId="select-font-size-label"
      id="select-font-size"
      open={openSelectFontSize}
      onClose={handleClose}
      onOpen={handleOpen}
      value={textSize}
      onChange={(e) =>
        handleChangeFontSize(e.target.value as unknown as FONT_SIZE)
      }
      size="small"
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.20)',
        color: 'white',
        width: '9rem',
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
      renderValue={(value: FONT_SIZE) => (
        <Box display="flex" alignItems="center" gap={1}>
          <TextFieldsIcon
            sx={{
              color: `${theme.palette.text.secondary} !important`,
            }}
          />
          <Typography color="primary.dark" fontWeight={400}>
            {t(headingSizeLabels[value])}
          </Typography>
        </Box>
      )}>
      {[
        {value: FONT_SIZE.SMALL, label: 'Small'},
        {value: FONT_SIZE.NORMAL, label: 'Normal'},
        {value: FONT_SIZE.LARGE, label: 'Large'},
      ].map((i) => (
        <MenuItem value={i.value} key={i.value}>
          {t(i.label)}
        </MenuItem>
      ))}
    </Select>
  );
};
export default FormatHeadingButton;
