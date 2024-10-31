import {FC, useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteServiceOrderComments} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import JobNotesDrawer from 'pages/ServiceOrderDetails/JobNotesDrawer';

interface Props {
  serviceOrder: ServiceOrderView;
}

const JobNotes: FC<Props> = ({serviceOrder}) => {
  const {t} = useTranslation();

  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const totalServiceOrderNotes = useTotalNotesData(
    useInfiniteServiceOrderComments,
    serviceOrder.id,
  );

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
          label={totalServiceOrderNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            color: 'white',
          }}
        />
      </Button>
      <JobNotesDrawer
        open={showSideDrawer}
        setOpen={setShowSideDrawer}
        serviceOrder={serviceOrder}
      />
    </>
  );
};

export default JobNotes;
