import {useState} from 'react';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Drawer, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteSupplierComments} from 'hooks/reactQuery/useSupplier';
import {SupplierNotes} from 'components/SupplierNotes';

interface Props {
  supplierId: string;
}

export const Notes = ({supplierId}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const totalSupplierNotes = useTotalNotesData(
    useInfiniteSupplierComments,
    supplierId,
  );

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  return (
    <>
      <Button
        buttonProps={{
          onClick: handleOpenSideDrawer,
          size: 'small',
          variant: 'text',
          sx: {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          },
        }}>
        <NoteAlt fontSize="small" />
        <Typography>{t('Notes')}</Typography>
        <Chip
          label={totalSupplierNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            color: 'white',
          }}
        />
      </Button>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          bgcolor="white"
          py="2rem"
          px="1rem"
          zIndex={99}>
          <Typography variant="h5" letterSpacing="normal">
            {t('Notes')}
          </Typography>
          <Button
            label={t('Close')}
            buttonProps={{
              onClick: handleCloseSideDrawer,
              size: 'small',
              variant: 'text',
            }}
          />
        </Box>
        <SupplierNotes supplierId={supplierId} />
      </Drawer>
    </>
  );
};
