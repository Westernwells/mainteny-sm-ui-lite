import {Box, Button, Chip, Drawer, IconButton, Typography} from '@mui/material';
import {PropsWithChildren, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FilterListIcon from '@mui/icons-material/FilterList';
import {useTheme} from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import capitalize from 'lodash/capitalize';
import {useScrollVerticalPosition} from 'hooks/useScrollPosition';

type Props = {
  activeFilters?: number;
  onOpen?: () => void;
  onSave: () => void;
  onReset: () => void;
  filterButtonTestId?: string;
  filterDrawerMainTestId?: string;
};

const Filters = ({
  activeFilters,
  children,
  onOpen,
  onSave,
  onReset,
  filterButtonTestId,
  filterDrawerMainTestId,
}: PropsWithChildren<Props>) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [isOpened, setIsOpened] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scroller = useScrollVerticalPosition(containerRef?.current ?? null);

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
        pt: 1,
      }}
      gap={1}
      data-testid={filterButtonTestId}
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
      <Drawer
        anchor="right"
        open={isOpened}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
            display: 'flex',
          },
        }}>
        <Box
          display="flex"
          position="sticky"
          top={0}
          bgcolor="white"
          zIndex={99}
          data-testid={filterDrawerMainTestId}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'inherit',
            boxShadow:
              'box-shadow: 0px 4px 15px 0px rgba(144, 144, 144, 0.20);',
          }}>
          {/* Header Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '16px 24px',
            }}>
            <Typography variant="h5">
              {capitalize(t('Apply Filters'))}
            </Typography>
            <IconButton onClick={handleClose} disableRipple disableTouchRipple>
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Body Section */}
          <Box
            ref={containerRef}
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              overflow: 'auto',
              padding: '16px 24px',

              ...(!scroller.isAtStart &&
                !scroller.isAtEnd && {
                  borderRight: 0,
                  borderLeft: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(-14px 0 -14px 0)',
                }),

              ...(!scroller.isAtStart &&
                scroller.isAtEnd && {
                  borderRight: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(-14px 0 0 0)',
                }),

              ...(!scroller.isAtEnd &&
                scroller.isAtStart && {
                  borderLeft: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(0 0 -14px 0)',
                }),
            }}>
            {children}
          </Box>
          {/* Footer Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
            }}>
            <Button
              onClick={() => {
                onReset();
                handleClose();
              }}
              variant="text">
              <Typography
                sx={{
                  fontSize: '14px',
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
                  textTransform: 'capitalize',
                }}>
                {t('Reset All')}
              </Typography>
            </Button>
            <Box sx={{display: 'flex'}} gap={1.5}>
              <Button
                sx={{
                  fontSize: '14px',
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
                  textTransform: 'capitalize',
                }}
                onClick={handleClose}
                color="primary"
                variant="outlined">
                <Typography>{t('Cancel')}</Typography>
              </Button>
              <Button
                sx={{
                  fontSize: '14px',
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
                  textTransform: 'capitalize',
                }}
                onClick={handleSave}
                color="primary"
                variant="contained">
                <Typography>{t('Show Results')}</Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Filters;
