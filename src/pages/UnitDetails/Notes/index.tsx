import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';

interface Props {
  customerId: string;
}

const Notes = ({customerId}: Props) => {
  const {t} = useTranslation();

  const handleOpenSideDrawer = () => {
    console.log('Close drawer', customerId);
  };

  return (
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
        label="999"
        color="primary"
        size="small"
        sx={{
          marginLeft: '0.5rem',
          color: 'white',
        }}
      />
    </Button>
  );
};

export default Notes;
