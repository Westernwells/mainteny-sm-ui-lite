import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator, ElevatorRequestBody} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {ContractView} from 'models/contract';
import {Priority} from 'models/misc';
import {formatDate} from 'utils/datetime';
import {ServiceFormModel} from '../models';
import {ServiceSchema} from './ServiceSchema';
import {EditServiceForm} from './EditServiceForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
  validContract?: ContractView;
}

const validationSchema = Yup.object().shape({
  lastVisitDate: Yup.string().nullable().required('Last visit is required'),
  serviceTime: Yup.string().nullable().required('Service time is required'),
  technicianNumber: Yup.number()
    .nullable()
    .required('No. of technicians is required'),
});

export const Service = ({
  containerStyles,
  elevator,
  elevatorRequestBody,
  validContract,
}: Props) => {
  // const theme = useTheme();
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
    'visitsPerYear',
    'requiredTime',
    'numOfTechnicians',
    'unitPriority',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        ...elevatorRequestBody,
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

  console.log(formik.values, '@@@@<<<<::""""""":::::::');

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">Service</Typography>}
      headerActionIcon={<EditIcon />}
      showHeaderBackground>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={6}>
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
