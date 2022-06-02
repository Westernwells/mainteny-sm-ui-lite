import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator, ElevatorRequestBody} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {convertToMacro} from 'utils/utils';
import {
  ContractRequestBody,
  ContractStatus,
  ContractView,
} from 'models/contract';
import {useUpdateContract} from 'hooks/reactQuery/useContract';
import {useSnackbar} from 'notistack';
import {UnitDetailsSchema} from './UnitDetailsSchema';
import {EditUnitDetailsForm} from './EditUnitDetailsForm';
import {UnitDetailsFormModel} from '../models';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
  validContract?: ContractView;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
  contractRequestBody?: Partial<ContractRequestBody>;
}

const validationSchema = Yup.object().shape({
  unitNumber: Yup.string().nullable().required('Unit number is required'),
});

export const UnitDetails = ({
  containerStyles,
  elevator,
  elevatorRequestBody,
  contractRequestBody,
  validContract,
}: Props) => {
  const {enqueueSnackbar} = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );
  const {mutateAsync: updateContract} = useUpdateContract();
  const formik = useFormik<UnitDetailsFormModel>({
    initialValues: {
      category: elevator.category,
      manufacturer: elevator.additionalInfo.manufacturer,
      unitNumber: elevator.number,
      numberOfStops: elevator.additionalInfo.numberOfStops,
      cabinType: elevator.additionalInfo.cabinType,
      emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
      unitType: elevator.type,
      model: elevator.model,
      serialNumber: elevator.serialNumber,
      unitCapacity: elevator.capacity,
      spendingLimit: contractRequestBody?.spendingLimit,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const labels = useRef([
    'category',
    'unitType',
    'manufacturer',
    'model',
    'unitId',
    'serialNumber',
    'stops',
    'unitCapacity',
    'cabinType',
    'spendingLimit',
    'phone',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        ...elevatorRequestBody,
        category: formik.values.category
          ? convertToMacro(formik.values.category)
          : '',
        manufacturer: formik.values.manufacturer,
        number: elevator.number,
        numberOfStops: formik.values.numberOfStops,
        cabinType: formik.values.cabinType,
        emergencyPhoneProvider: formik.values.emergencyPhoneProvider,
        type: formik.values.unitType,
        model: formik.values.model,
        serialNumber: formik.values.serialNumber,
        capacity: formik.values.unitCapacity,
      },
      elevatorId: elevator.id,
    });

    if (validContract) {
      if (validContract.status === ContractStatus.EXPIRED) {
        return enqueueSnackbar(
          'Spending limit could not be updated because contract has expired',
          {
            variant: 'error',
          },
        );
      }
      await updateContract({
        body: {
          ...contractRequestBody,
          spendingLimit: formik.values.spendingLimit,
        },
        contractId: validContract.id,
      });
    }
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">Unit Details</Typography>}
      showHeaderBackground
      headerActionIcon={<EditIcon />}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={6}>
            <UnitDetailsSchema
              label={label}
              elevator={elevator}
              spendingLimit={validContract?.spendingLimit}
              currency={validContract?.currency}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Location"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <EditUnitDetailsForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
