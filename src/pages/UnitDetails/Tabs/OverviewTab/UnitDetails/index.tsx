import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {ElevatorRequestBody, ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {convertToMacro} from 'utils/utils';
import {UnitDetailsFormModel} from 'models/unitForm';
import {ContractSimpleView} from 'models/contract';
import {UnitDetailsSchema} from './UnitDetailsSchema';
import {EditUnitDetailsForm} from './EditUnitDetailsForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  validContract?: ContractSimpleView;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
}

const validationSchema = Yup.object().shape({
  category: Yup.string().nullable().required('Category is required'),
});

export const UnitDetails = ({
  containerStyles,
  elevator,
  elevatorRequestBody,
  validContract,
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );
  const formik = useFormik<UnitDetailsFormModel>({
    initialValues: {
      category: elevator.category,
      manufacturer: elevator.additionalInfo.manufacturer,
      externalId: elevator.externalId,
      numberOfStops: elevator.additionalInfo.numberOfStops,
      cabinType: elevator.additionalInfo.cabinType,
      emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
      unitType: elevator.type,
      model: elevator.model,
      serialNumber: elevator.serialNumber,
      unitCapacity: elevator.capacity,
      spendingLimit: validContract?.spendingLimit,
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
        externalId: formik.values.externalId,
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
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">{t('Unit Details')}</Typography>}
      showHeaderBackground
      headerActionIcon={<EditIcon />}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={6}>
            <UnitDetailsSchema
              label={label}
              elevator={elevator}
              currency={validContract?.currency}
              spendingLimit={validContract?.spendingLimit}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Unit Details"
        onCancel={() => setOpenDialog(false)}
        disableSaveBtn={!!Object.keys(formik.errors).length}
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
