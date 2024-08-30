import {useState} from 'react';
import {Delete, Edit} from '@mui/icons-material';
import {Box, Grid, IconButton, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

import {Confirm} from 'components/Confirm';
import {useDeleteAbsence} from 'hooks/reactQuery/useAbsence';
import {useAbsencedate} from 'hooks/useAbsenceDate';
import {useTranslation} from 'react-i18next';
import {convertToText} from 'utils/utils';

type Props = {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  isLast: boolean;
  onEdit: () => void;
};

const AbsenceTimeLine = ({
  id,
  type,
  startDate,
  endDate,
  duration,
  isLast,
  onEdit,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const getAbsenceDate = useAbsencedate();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {mutateAsync: deleteAbsence} = useDeleteAbsence(
    'Absence deleted successfully',
  );

  const onDelete = async () => {
    await deleteAbsence({
      eventId: id || '',
    });

    setOpenDeleteDialog(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            mr: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '.75rem',
            height: '.75rem',
            borderRadius: '50%',
            backgroundColor: theme.palette.info.main,
          }}
        />
        <Grid container alignItems="center">
          <Grid item sm={2} md={3} lg={4}>
            <Typography
              variant="subtitle1"
              sx={{fontSize: '16px', mr: '0.625em'}}>
              {t(convertToText(type))}
            </Typography>
          </Grid>
          <Grid item sm={2} md={5} lg={4} sx={{justifyContent: 'left'}}>
            <Box
              display="flex"
              sx={{
                height: '2.5rem',
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
                [theme.breakpoints.down('md')]: {
                  flexWrap: 'wrap',
                  justifyContent: 'left',
                },
              }}>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  fontSize: '13px',
                  lineHeight: '1.125em',
                  letterSpacing: '0.16px',
                  color: '#0F4C6480',
                  border: '1px solid #0F4C6480',
                  borderRadius: '16px',
                  padding: '0.18em 0.5em',
                }}>
                {duration} {t('days')}
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={8} md={4} lg={4}>
            <Box display="flex" sx={{justifyContent: 'flex-end'}}>
              <IconButton onClick={onEdit}>
                <Edit sx={{width: '1em', height: '1em'}} />
              </IconButton>
              <IconButton onClick={() => setOpenDeleteDialog(true)}>
                <Delete sx={{width: '1em', height: '1em'}} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box position="relative">
        {!isLast && (
          <Box
            sx={{
              height: '2.8rem',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '0.125em',
              marginLeft: '.375rem',
              transform: 'translateX(-50%)',
              position: 'relative',
              backgroundColor: theme.palette.text.secondary,
            }}
          />
        )}
        <Typography
          variant="body1"
          sx={{position: 'absolute', top: '0', left: '1.68em'}}>
          {getAbsenceDate(startDate, endDate)}
        </Typography>
      </Box>

      <Confirm
        open={openDeleteDialog}
        onConfirm={() => onDelete()}
        onClose={() => setOpenDeleteDialog(false)}
        title="Delete"
        content={t('Do you want to delete the event from the absence list?')}
      />
    </>
  );
};

export default AbsenceTimeLine;
