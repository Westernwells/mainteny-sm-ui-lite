import {useTranslation} from 'react-i18next';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Box, Typography} from '@mui/material';
import {Button} from 'components/Button';
import InvertColorsOutlinedIcon from '@mui/icons-material/InvertColorsOutlined';
import {useTheme} from '@mui/material/styles';
import {CUSTOM_COLORS} from 'models/pdfs';
import {convertRGBtoHex} from 'utils/color';
import CustomColorPopover from 'components/ColorPicker/CustomColorPopover';

const COLOR_THEME = {
  light: '#000034',
  dark: '#fff',
};

type Props = {
  initialValue: string;
  labelKey?: string;
  backgroundTheme?: 'light' | 'dark';
  onChange: (value: string) => void;
  anchor?: React.RefObject<HTMLElement> | null;
};

const CustomColorPicker = ({
  initialValue,
  labelKey = 'Custom color',
  backgroundTheme = 'light',
  onChange,
  anchor,
}: Props) => {
  const {t} = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme();

  const [internalColor, setInternalColor] = useState<string>(initialValue);

  const anchorEl = useRef(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const handleSave = () => {
    onChange(internalColor);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isActive = useMemo(() => {
    const colorToCheck = convertRGBtoHex(initialValue) ?? initialValue;

    return !CUSTOM_COLORS.includes(colorToCheck);
  }, [initialValue]);

  useEffect(() => {
    setInternalColor(initialValue);
  }, [initialValue]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <Button
        buttonProps={{
          variant: 'text',
          onClick: handleOpen,
          sx: {
            padding: '0 6px 0 2px',
            border: '2px solid transparent',
            alignSelf: 'start',
            ...(isActive && {
              border: `2px solid ${COLOR_THEME[backgroundTheme]}`,
            }),
          },
        }}>
        <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center'}}>
          <InvertColorsOutlinedIcon sx={{color: theme.palette.primary.light}} />
          <Typography
            sx={{color: theme.palette.primary.light}}
            ref={anchorEl}
            variant="subtitle2"
            color="text.secondary">
            {t(labelKey)}
          </Typography>
        </Box>
      </Button>

      <CustomColorPopover
        open={isOpen}
        anchorEl={isOpen && anchor ? anchor : anchorEl}
        value={internalColor}
        onChange={setInternalColor}
        onSave={handleSave}
        onClose={handleClose}
      />
    </Box>
  );
};

export default CustomColorPicker;
