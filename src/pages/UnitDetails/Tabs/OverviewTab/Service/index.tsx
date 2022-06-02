/* eslitnt-disable */
import Typography from '@mui/material/Typography';
// import useTheme from '@mui/material/styles/useTheme';
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
import {getMinutes} from 'date-fns';
import {convertMinsToHM, formatDate, setDateTime} from 'utils/datetime';
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
  address: Yup.object().nullable().required('Address is required'),
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
    'Location updated successfully',
  );
  const formik = useFormik<ServiceFormModel>({
    initialValues: {
      lastVisitDate: new Date(elevator.lastVisitDate),
      lastInspectionDate: new Date(elevator.additionalInfo.lastInspectionDate),
      visitsPerYear: validContract?.visitsNumber,
      serviceTime: setDateTime(
        new Date(),
        convertMinsToHM(elevator.serviceTime),
      ),
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
        serviceTime:
          formik.values.serviceTime && getMinutes(formik.values.serviceTime),
        technicianNumber: formik.values.technicianNumber,
        priority: formik.values.priority,
      },
      elevatorId: elevator.id,
    });
  };

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
            <ServiceSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Service"
        onCancel={() => setOpenDialog(false)}
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
