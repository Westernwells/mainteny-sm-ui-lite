import {useTranslation} from 'react-i18next';
import React, {useEffect, useRef, useState} from 'react';
import {Box, Popover, Typography} from '@mui/material';
import {Button} from 'components/Button';
import CloseIcon from '@mui/icons-material/Close';
import InvertColorsOutlinedIcon from '@mui/icons-material/InvertColorsOutlined';
import {useTheme} from '@mui/material/styles';
import ColorPicker from './index';

type Props = {
  initialValue: string;
  labelKey: string;
  onChange: (value: string) => void;
};

const ColorPickerPopup = ({initialValue, labelKey, onChange}: Props) => {
  const {t} = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme();

  const [internalColor, setInternalColor] = useState<string>(initialValue);

  const anchorEl = useRef(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSave = () => {
    onChange(internalColor);
  };

  const handleClose = (withSave: boolean) => () => {
    if (withSave) handleSave();
    setOpen(false);
  };

  useEffect(() => {
    setInternalColor(initialValue);
  }, [initialValue]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <Button
        buttonProps={{
          variant: 'text',
          onClick: handleOpen,
          sx: {padding: 0, alignSelf: 'start'},
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
      <Popover
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '240px',
            minHeight: '100px',
          },
        }}>
        {isOpen && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              padding: '8px 0',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 12px',
                width: '100%',
              }}>
              <Typography
                sx={{cursor: 'default'}}
                variant="subtitle2"
                color="text.primary">
                {t('Select custom color')}
              </Typography>

              <Button
                buttonProps={{
                  onClick: handleClose(false),
                  disableRipple: true,
                  disableFocusRipple: true,

                  sx: {
                    mx: 0,
                    p: 1,
                    minWidth: 0,
                  },
                }}>
                <CloseIcon sx={{color: '#828DA3'}} />
              </Button>
            </Box>

            <ColorPicker value={internalColor} onChange={setInternalColor} />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                padding: '0 12px',
              }}>
              <Button
                buttonProps={{variant: 'text', onClick: handleClose(false)}}>
                {t('Cancel')}
              </Button>

              <Button
                buttonProps={{
                  variant: 'contained',
                  color: 'primary',
                  onClick: handleClose(true),
                }}>
                {t('Apply')}
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default ColorPickerPopup;
