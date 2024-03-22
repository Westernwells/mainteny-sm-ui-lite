import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ReactComponent as ToolsWrenchScrewdriverIcon} from 'assets/icons/ToolsWrenchScrewdriverIcon.svg';
import {ElevatorView} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {ContractSimpleView} from 'models/contract';
import {Priority} from 'models/misc';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceFormModel} from '../../../../../models/unitForm';
import {ServiceSchema} from './ServiceSchema';
import {EditServiceForm} from './EditServiceForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
  validContract?: ContractSimpleView;
}

const validationSchema = Yup.object().shape({
  lastVisitDate: Yup.string().nullable().required('Last visit is required'),
  serviceTime: Yup.number().nullable().required('Service time is required'),
  technicianNumber: Yup.number()
    .nullable()
    .required('No. of technicians is required'),
});

export const Service = ({
  containerStyles,
  elevator,
  propertyOwnerId,
  validContract,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Service updated successfully',
  );

  const serviceTime = useRef(new Date()).current;
  serviceTime.setMinutes(elevator.serviceTime);

  const formik = useFormik<ServiceFormModel>({
    initialValues: {
      lastVisitDate: elevator.lastVisitDate
        ? new Date(elevator.lastVisitDate)
        : undefined,
      lastInspectionDate: elevator.additionalInfo.lastInspectionDate
        ? new Date(elevator.additionalInfo.lastInspectionDate)
        : undefined,
      visitsPerYear: validContract?.visitsNumber,
      serviceTime: elevator.serviceTime,
      technicianNumber: elevator.technicianNumber,
      priority: elevator.additionalInfo.priority,
      inspectionCycle: elevator.additionalInfo.inspectionCycle,
    },
    onSubmit: () => {},
    validationSchema,
  });
  const labels = useRef([
    'lastVisit',
    'requiredTime',
    'lastInspection',
    'numOfTechnicians',
    'unitPriority',
    'visitsPerYear',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        lastVisitDate: formatDate(formik.values.lastVisitDate, 'yyyy-MM-dd'),
        lastInspectionDate: formatDate(
          formik.values.lastInspectionDate,
          'yyyy-MM-dd',
        ),
        serviceTime: formik.values.serviceTime,
        technicianNumber: formik.values.technicianNumber,
        priority: formik.values.priority as Priority,
        inspectionCycle: formik.values.inspectionCycle,
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="h5">{t('Service')}</Typography>}
      headerIcon={
        <ToolsWrenchScrewdriverIcon style={{width: '2rem', height: '2rem'}} />
      }
      headerActionIcon={
        <EditOutlinedIcon style={{color: theme.palette.secondary.mainLight}} />
      }>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <ServiceSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Service"
        onCancel={() => setOpenDialog(false)}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditServiceForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
