import {Box, Button, Chip, Dialog, IconButton, Typography} from '@mui/material';
import {PropsWithChildren, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FilterListIcon from '@mui/icons-material/FilterList';
import {useTheme} from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import capitalize from 'lodash/capitalize';

type Props = {
  activeFilters?: number;
  onOpen?: () => void;
  onSave: () => void;
  onReset: () => void;
};

const Filters = ({
  activeFilters,
  children,
  onOpen,
  onSave,
  onReset,
}: PropsWithChildren<Props>) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    if (!isOpened) {
      setIsOpened(true);
      onOpen?.();
    }
  };

  const handleClose = () => {
    setIsOpened(false);
  };

  const handleSave = () => {
    onSave();
    setIsOpened(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      gap={1}
      onClick={handleOpen}>
      <FilterListIcon />
      <Typography variant="subtitle1">{capitalize(t('Filters'))}</Typography>
      {!!activeFilters && (
        <Chip
          sx={{height: '20px', backgroundColor: theme.palette.primary.light}}
          label={activeFilters}
          color="primary"
        />
      )}
      <Dialog open={isOpened} onClose={handleClose}>
        <Box
          sx={{
            display: 'flex',
            width: '480px',
            padding: '16px 24px',
            flexDirection: 'column',
            overflow: 'auto',
          }}
          gap={2}>
          {/* Header Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Typography>{capitalize(t('Filters'))}</Typography>
            <IconButton onClick={handleClose} disableRipple disableTouchRipple>
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Body Section */}
          {children}
          {/* Footer Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Button onClick={onReset} variant="text">
              <Typography>{t('Reset All')}</Typography>
            </Button>
            <Box sx={{display: 'flex'}} gap={1.5}>
              <Button onClick={handleClose} color="primary" variant="outlined">
                <Typography>{t('Cancel')}</Typography>
              </Button>
              <Button onClick={handleSave} color="primary" variant="contained">
                <Typography>{t('Show Results')}</Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Filters;
