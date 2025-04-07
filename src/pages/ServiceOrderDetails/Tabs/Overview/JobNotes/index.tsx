import {ServiceOrderView} from 'models/service-order';

import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import {Box, Button, Grid, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ReactComponent as NotesEditIcon} from 'assets/icons/NotesEdit.svg';
import JobNotesDrawer from 'pages/ServiceOrderDetails/JobNotesDrawer';
import {useState} from 'react';
import {useComments} from 'hooks/reactQuery/useComment';
import {CommentCategory, CommentType} from 'models/comment';
import {EmptySection} from 'components/EmptySection';
import {Note} from './Note';

interface Props {
  order: ServiceOrderView;
}

const NO_OF_NOTES_FOR_PREVIEW = 2;

export const JobNotes = ({order}: Props) => {
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const {t} = useTranslation();
  const theme = useTheme();
  const {data: notes} = useComments({
    type: CommentType.SERVICE_ORDER_COMMENT,
    category: CommentCategory.ALL,
    refId: order.id,
    pageIndex: 0,
    pageSize: NO_OF_NOTES_FOR_PREVIEW,
  });
  // Only used to get all number of office notes
  const {data: officeNotes} = useComments({
    type: CommentType.SERVICE_ORDER_COMMENT,
    category: CommentCategory.OFFICE,
    refId: order.id,
    pageIndex: 0,
    pageSize: NO_OF_NOTES_FOR_PREVIEW,
  });

  const totalAllNotes = notes?.total ?? 0;
  const totalOfficeNotes = officeNotes?.total ?? 0;

  const totalNotes = totalAllNotes + totalOfficeNotes;
  const allNotes = [...(notes?.data ?? []), ...(officeNotes?.data ?? [])];

  return (
    <>
      <InfoCard
        containerStyles={{
          [theme.breakpoints.up('md')]: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '& .MuiCardHeader-root': {
              marginBottom: 0.5,
            },
          },
        }}
        headerActionIcon={
          <ModeEditOutlineOutlinedIcon
            onClick={() => {
              setShowSideDrawer(true);
            }}
            style={{color: theme.palette.text.primary}}
          />
        }
        handleAction={() => {}}
        showHeaderBackground={false}
        headerIcon={
          <NotesEditIcon
            style={{
              color: theme.palette.text.secondary,
              width: '1.8rem',
              height: '1.8rem',
            }}
          />
        }
        footer={
          totalNotes > NO_OF_NOTES_FOR_PREVIEW ? (
            <Box
              width="100%"
              display="flex"
              flexDirection="row"
              justifyContent="center"
              mt={1.5}>
              <Button
                onClick={() => {
                  setShowSideDrawer(true);
                }}
                sx={{
                  color: theme.palette.primary.light,
                }}>
                {t('Show {{totalCount}} more', {
                  totalCount: totalNotes - NO_OF_NOTES_FOR_PREVIEW,
                })}
              </Button>
            </Box>
          ) : null
        }
        header={
          <Typography variant="h5" fontWeight={600}>
            {t('Notes')}
          </Typography>
        }>
        <Grid rowSpacing={1.5} container mt={1}>
          {allNotes.length === 0 ? (
            <Grid item xs={12}>
              <EmptySection
                btnAction={() => {
                  setShowSideDrawer(true);
                }}
                showActionBtn
                btnLabel="Add Note"
                label="No notes yet. They will appear here once added."
                illustration="clipboard"
                size="tiny"
                containerStyle={{
                  height: '100%',
                  marginTop: 0,
                }}
              />
            </Grid>
          ) : (
            allNotes.slice(0, NO_OF_NOTES_FOR_PREVIEW).map((note) => (
              <Grid item xs={12}>
                <Note data={note} />
              </Grid>
            ))
          )}
        </Grid>
      </InfoCard>
      <JobNotesDrawer
        open={showSideDrawer}
        setOpen={setShowSideDrawer}
        serviceOrder={order}
      />
    </>
  );
};
