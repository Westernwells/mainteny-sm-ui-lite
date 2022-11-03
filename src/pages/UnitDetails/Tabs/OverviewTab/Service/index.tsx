import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import {ElevatorView} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
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
    },
    onSubmit: () => {},
    validationSchema,
  });
  const labels = useRef([
    'lastVisit',
    'lastInspection',
    'requiredTime',
    'numOfTechnicians',
    'unitPriority',
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
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">{t('Service')}</Typography>}
      headerActionIcon={<EditIcon />}
      showHeaderBackground
      bodyContainerStyle={{
        overflowY: 'auto',
      }}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12}>
            <ServiceSchema
              label={label}
              elevator={elevator}
              visitNumber={validContract?.visitsNumber}
            />
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
