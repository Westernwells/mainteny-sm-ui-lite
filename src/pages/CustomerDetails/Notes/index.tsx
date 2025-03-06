import {useState} from 'react';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Drawer, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import CustomerNotes from 'components/CustomerNotes';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';
import useTotalNotesData from 'hooks/useTotalNotesData';
import Skeleton from '@mui/material/Skeleton';

interface Props {
  customerId: string;
}

const Notes = ({customerId}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const infiniteCustomerNotes = useInfiniteCustomerNotes(customerId, {
    pageIndex: 0,
    pageSize: 10,
  });

  const totalCustomerNotes = useTotalNotesData(
    useInfiniteCustomerNotes,
    customerId,
  );

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  if (infiniteCustomerNotes.isLoading) {
    return (
      <Skeleton
        data-testid="noteButton"
        variant="text"
        sx={{width: '5rem', height: '3rem'}}
      />
    );
  }

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
          label={totalCustomerNotes}
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
        <CustomerNotes
          customerNotes={infiniteCustomerNotes}
          propertyOwnerId={customerId}
        />
      </Drawer>
    </>
  );
};

export default Notes;
