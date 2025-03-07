import {FC, useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {ServiceOrderView} from 'models/service-order';
import JobNotesDrawer from 'pages/ServiceOrderDetails/JobNotesDrawer';
import {useComments} from 'hooks/reactQuery/useComment';
import {CommentCategory, CommentType} from 'models/comment';

interface Props {
  serviceOrder: ServiceOrderView;
}

const JobNotes: FC<Props> = ({serviceOrder}) => {
  const {t} = useTranslation();

  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const {data: commentsData} = useComments({
    refId: serviceOrder.id,
    category: CommentCategory.ALL,
    type: CommentType.SERVICE_ORDER_COMMENT,
    pageIndex: 0,
    pageSize: 1,
  });

  const totalComments = commentsData?.total ?? 0;

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
          label={totalComments}
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
