import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {ElevatorCategory, ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import {useEffect, useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import {useAllElevators, useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {convertToMacro, convertToText} from 'utils/utils';
import {UnitDetailsFormModel} from 'models/unitForm';
import {createEmptyResource} from 'utils/paging-utils';
import {UnitDetailsSchema} from './UnitDetailsSchema';
import {EditUnitDetailsForm} from './EditUnitDetailsForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const isExternalIdUnique = async (resource: ElevatorView[], value?: string) => {
  if (!value) {
    return true;
  }
  try {
    return !(resource && resource.some((item) => item.externalId === value));
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

export const UnitDetails = ({
  containerStyles,
  elevator,
  propertyOwnerId,
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );
  const [initValue, setInitValue] = useState('');
  const [externalIdValue, setExternalIdValue] = useState('');

  const {data: elevatorResponse = createEmptyResource<ElevatorView>(10)} =
    useAllElevators(
      {
        query: externalIdValue,
        pageIndex: 0,
        pageSize: 50,
      },
      {keepPreviousData: true},
    );

  const validationSchema = Yup.object().shape({
    category: Yup.string()
      .nullable()
      .oneOf(
        Object.values(ElevatorCategory).map((c) => convertToText(c)),
        'Invalid unit category',
      )
      .required('Category is required'),
    externalId: Yup.string().test(
      'checkExternalId',
      'This ID is already taken. Please enter a different one.',
      async (value) => {
        if (value !== initValue) {
          return isExternalIdUnique(elevatorResponse.data, value);
        }
        return true;
      },
    ),
  });

  const formik = useFormik<UnitDetailsFormModel>({
    initialValues: {
      category: convertToText(elevator.category),
      manufacturer: elevator.additionalInfo.manufacturer,
      externalId: elevator.number,
      number: elevator.number,
      numberOfStops: elevator.additionalInfo.numberOfStops,
      cabinType: elevator.additionalInfo.cabinType,
      emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
      unitType: elevator.type,
      model: elevator.model,
      serialNumber: elevator.serialNumber,
      unitCapacity: elevator.capacity,
      yearBuilt: elevator.additionalInfo.builtYear,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    setInitValue(elevator.externalId);
  }, [elevator.externalId, openDialog]);

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
    'builtYear',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        category: formik.values.category
          ? convertToMacro(formik.values.category)
          : '',
        manufacturer: formik.values.manufacturer,
        externalId: formik.values.externalId || '',
        number: formik.values.number || '',
        numberOfStops: formik.values.numberOfStops,
        cabinType: formik.values.cabinType,
        emergencyPhoneProvider: formik.values.emergencyPhoneProvider,
        type: formik.values.unitType,
        model: formik.values.model || '',
        serialNumber: formik.values.serialNumber,
        capacity: formik.values.unitCapacity || '',
        builtYear: formik.values.yearBuilt,
      },
      elevatorId: elevator.id,
    });
  };

  useEffect(() => {
    formik.setValues({
      category: convertToText(elevator.category),
      manufacturer: elevator.additionalInfo.manufacturer,
      numberOfStops: elevator.additionalInfo.numberOfStops,
      cabinType: elevator.additionalInfo.cabinType,
      emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
      unitType: elevator.type,
      model: elevator.model,
      serialNumber: elevator.serialNumber,
      unitCapacity: elevator.capacity,
      yearBuilt: elevator.additionalInfo.builtYear,
      externalId: elevator.number,
      number: elevator.number,
    });
  }, [openDialog]);

  useEffect(() => {
    setExternalIdValue(formik.values.externalId!);
  }, [formik]);

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
            <UnitDetailsSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Unit Details"
        onCancel={() => {
          formik.resetForm();
          setOpenDialog(false);
        }}
        disableSaveBtn={!!Object.keys(formik.errors).length || !formik.dirty}
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
