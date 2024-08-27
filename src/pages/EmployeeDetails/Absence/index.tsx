import {useState} from 'react';
import {Box, Grid, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {endOfYear, startOfYear} from 'date-fns';
import useTheme from '@mui/material/styles/useTheme';

import {InfoCard} from 'components/InfoCard';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {Dialog} from 'components/Dialog';
import {
  useAbsence,
  useGetAbsence,
  useUpdateAbsence,
} from 'hooks/reactQuery/useAbsence';
import {convertAbsenceToNormal, formatUpdateAbsence} from 'utils/absence-utils';
import {
  getDatesInRange,
  getDifferenceInInterval,
  toDate,
  toRestDateTime,
} from 'utils/datetime';
import {createEmptyResource} from 'utils/paging';
import {olStyles} from 'styles';
import {UserView} from 'models/user';
import {AbsenceItem} from 'models/absence';
import AbsenceStatistic from './AbsenceStatistic';
import {AbsenceForm} from './model';
import AbsenceTimeLine from './AbsenceTimeLine';
import FormAbsence from './FormAbsence';

type Props = {
  employee: UserView | undefined;
};

const initialValues: AbsenceForm = {
  duration: '1 day',
  typeAbsence: 'sick',
  date: undefined,
  dateStart: undefined,
  dateEnd: undefined,
  notes: '',
};

const validationSchema = Yup.object().shape({
  duration: Yup.string().nullable(),
  date: Yup.string().when('duration', {
    is: (duration: string) => duration === '1 day',
    then: Yup.string().required('Date is required'),
  }),
  dateStart: Yup.string().when('duration', {
    is: (duration: string) => duration === 'Multiple days',
    then: Yup.string().required('Date start is required'),
  }),
  dateEnd: Yup.string().when('duration', {
    is: (duration: string) => duration === 'Multiple days',
    then: Yup.string().required('Date end is required'),
  }),
});

const pageSize = 2;

const EmployeeAbsence = ({employee}: Props) => {
  const {t} = useTranslation();
  const {createAbsence} = useAbsence();
  const theme = useTheme();

  const [typeAction, setTypeAction] = useState<'edit' | 'create' | undefined>(
    undefined,
  );
  const [activeAbsence, setActiveAbsence] = useState<AbsenceItem | undefined>(
    undefined,
  );

  const [openDialog, setOpenDialog] = useState(false);

  const employeeId = employee?.userData.employeeId;
  const employeeRoles = employee?.userAccount.roles;
  const employeeName = `${employee?.userAccount.firstName} ${employee?.userAccount.lastName}`;
  const totalHolidays =
    employee?.userData.additionalInfo?.totalYearlyVacationDaysAllowed ||
    employee?.userAccount.serviceCompany.settings
      .totalYearlyVacationDaysAllowed ||
    0;
  const leftVacationDays =
    employee?.userData.additionalInfo.leftVacationDays || 0;

  const getTakenDays = () => {
    let takenDays = totalHolidays - leftVacationDays;
    if (takenDays < 0) {
      takenDays = 0;
    }
    return takenDays;
  };

  const {
    data: {data: absences} = createEmptyResource<AbsenceItem>(pageSize),
    isLoading,
  } = useGetAbsence(
    {
      end: toRestDateTime(endOfYear(new Date())),
      start: toRestDateTime(startOfYear(new Date())),
      pageIndex: 0,
      pageSize: 100,
    },
    employeeId || '',
  );

  const {mutateAsync: updateAbsence} = useUpdateAbsence(
    'Absence updated successfully',
  );

  const formik = useFormik<AbsenceForm>({
    initialValues,
    onSubmit: async (values, {resetForm}) => {
      createAbsence(values, employeeId || '', () => {
        setOpenDialog(false);
        resetForm();
      });
    },
    validationSchema,
  });

  const onCreateAbsence = () => {
    setActiveAbsence(undefined);

    formik.setValues({
      duration: '1 day',
      typeAbsence: 'sick',
      date: undefined,
      dateStart: undefined,
      dateEnd: undefined,
      notes: '',
    });

    setTypeAction('create');
    setOpenDialog(true);
  };

  const onEditAbsence = (absence: AbsenceItem) => {
    setActiveAbsence(absence);

    const numberOfDays = getDifferenceInInterval(
      absence.startTime,
      absence.endTime,
    );

    formik.setValues({
      duration: numberOfDays.days === 0 ? '1 day' : 'Multiple days',
      typeAbsence: convertAbsenceToNormal(absence.eventType),
      date: absence.startTime ? toDate(absence.startTime) : undefined,
      dateStart: absence.startTime ? toDate(absence.startTime) : undefined,
      dateEnd: absence.endTime ? toDate(absence.endTime) : undefined,
      notes: absence.notes,
    });
    setTypeAction('edit');
    setOpenDialog(true);
  };

  const saveNewAbsence = async () => {
    await createAbsence(formik.values, employeeId || '', () => {
      setOpenDialog(false);
      formik.resetForm();
    });
    setOpenDialog(false);
  };

  const editAbsence = async () => {
    await updateAbsence({
      body: formatUpdateAbsence(formik.values),
      eventId: activeAbsence?.id || '',
    });

    setOpenDialog(false);
  };

  const takenDates = absences?.flatMap((absence) =>
    absence.durationInDays === 0
      ? absence.startTime
      : getDatesInRange(toDate(absence.startTime), toDate(absence.endTime)),
  );

  const renderAbsence = () => {
    if (absences?.length === 0) {
      return (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{mt: '4.5em'}}
          label={t('No holiday entries yet. They will appear here once added!')}
        />
      );
    }
    return (
      <Box
        sx={{
          mt: '1.68em',
          minHeight: '10em',
          [theme.breakpoints.up('md')]: {
            height: '13em',
            overflowY: 'hidden',

            '&:hover': {
              overflowY: 'auto',
              ...olStyles.verticlaScrollBar,
            },
          },
          [theme.breakpoints.down('md')]: {
            height: '100%',
            overflowY: 'visible',
          },
        }}>
        {absences?.map((absence: AbsenceItem, index: number) => (
          <AbsenceTimeLine
            id={absence.id}
            type={absence.eventType}
            startDate={absence.startTime}
            endDate={absence.endTime}
            duration={absence.durationInDays}
            key={absence.id}
            isLast={absences.length === index + 1}
            onEdit={() => onEditAbsence(absence)}
          />
        ))}
      </Box>
    );
  };

  return (
    <Grid item sm={12} md={6} lg={3}>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Absence')}</Typography>}
        containerStyles={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        headerStyles={{mt: '0.5em'}}
        handleAction={onCreateAbsence}
        headerActionIcon={<AddIcon />}
        showHeaderBackground>
        <Box sx={{marginTop: '0.5em'}}>
          <Typography sx={{fontSize: '14px'}}>
            {t('Yearly Holidays')}
          </Typography>
          <AbsenceStatistic
            total={totalHolidays}
            taken={getTakenDays()}
            left={leftVacationDays >= 0 ? leftVacationDays : 0}
          />
          <Box sx={{height: '100%'}}>
            {isLoading ? (
              <Box sx={{mt: '6.250em'}}>
                <Progress height="3.125em" />
              </Box>
            ) : (
              <>{renderAbsence()}</>
            )}
          </Box>
        </Box>
      </InfoCard>
      <Dialog
        title={typeAction === 'edit' ? t('Edit Absence') : t('Add Absence')}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => setOpenDialog(false)}
        onSave={typeAction === 'edit' ? editAbsence : saveNewAbsence}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <FormAbsence
          name={employeeName}
          roles={employeeRoles || []}
          formik={formik}
          takenDates={takenDates}
        />
      </Dialog>
    </Grid>
  );
};

export default EmployeeAbsence;
