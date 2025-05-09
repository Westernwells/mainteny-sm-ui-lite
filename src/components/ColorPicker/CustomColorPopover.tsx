import {Box, Popover, Typography} from '@mui/material';
import {Button} from 'components/Button';
import CloseIcon from '@mui/icons-material/Close';
import ColorPicker from 'components/ColorPicker';
import React, {MutableRefObject} from 'react';
import {useTranslation} from 'react-i18next';

type Props = {
  open: boolean;
  value: string;
  anchorEl: MutableRefObject<HTMLElement | null>;
  onSave: (color: string) => void;
  onClose: () => void;
  onChange: (color: string) => void;
};

const CustomColorPopover = ({
  value,
  open,
  anchorEl,
  onClose,
  onSave,
  onChange,
}: Props) => {
  const {t} = useTranslation();

  const handleSave = () => {
    onSave(value);
  };

  const handleClose = (withSave: boolean) => () => {
    if (withSave) handleSave();
    onClose();
  };

  return (
    <Popover
      open={open}
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
        zIndex: 9999,

        '& .MuiPaper-root': {
          width: '240px',
          minHeight: '100px',
        },
      }}>
      {open && (
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

          <ColorPicker value={value} onChange={onChange} />
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
  );
};

export default CustomColorPopover;
