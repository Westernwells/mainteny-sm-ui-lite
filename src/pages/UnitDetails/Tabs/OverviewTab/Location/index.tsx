import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ReactComponent as MapsPinIcon} from 'assets/icons/MapsPinIcon.svg';
import {ElevatorView} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {LocationFormModel} from 'models/unitForm';
import {formatAddressFullname} from 'utils/utils';
import {AddressRecord} from 'models/misc';
import {getCurrencySymbol, useCurrentCurrency} from 'utils/currency';
import {LocationSchema} from './LocationSchema';
import {EditLocationForm} from './EditLocationForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const validationSchema = Yup.object().shape({
  propertyOwnerId: Yup.string()
    .nullable()
    .required(
      "Please select an existing customer. To add a new one, go to the 'Customers' section",
    ),
  address: Yup.object()
    .nullable()
    .shape({
      fullName: Yup.string().nullable().required('Address is required'),
      component: Yup.object().shape({
        country: Yup.string().required(),
        postalCode: Yup.string().optional(),
        state: Yup.string().optional(),
        city: Yup.string().required(),
      }),
    }),
});

export const Location = ({
  containerStyles,
  elevator,
  propertyOwnerId = '',
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();

  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Location updated successfully',
  );
  const formik = useFormik<LocationFormModel>({
    initialValues: {
      address: elevator.address || {
        fullName: '',
      },
      building: elevator.additionalInfo.buildingLocation,
      propertySegment: elevator.additionalInfo.propertySegment,
      keyLocation: elevator.additionalInfo.keyLocation,
      parking: elevator.additionalInfo.parking,
      propertyOwnerId,
      distance: elevator.additionalInfo?.distance,
      travelTime: elevator.additionalInfo?.travelTime,
      travelFee: elevator.additionalInfo?.travelFee,
    },
    onSubmit: () => {},
    validationSchema,
  });
  const labels = useRef([
    'customer',
    'customerNumber',
    'address',
    'building',
    'propertySegment',
    'keyLocation',
    'parking',
    'distance',
    'travelTime',
    'travelFee',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);

    await updateElevator({
      body: {
        propertyOwnerId: formik.values.propertyOwnerId,
        address: formatAddressFullname(formik.values.address) as
          | AddressRecord
          | undefined,
        buildingLocation: formik.values.building || '',
        propertySegment: formik.values.propertySegment!,
        keyLocation: formik.values.keyLocation!,
        parking: formik.values.parking!,
        distance: formik.values.distance!,
        travelTime: formik.values.travelTime!,
        travelFee: formik.values.travelFee!,
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="h5">{t('Location')}</Typography>}
      headerIcon={<MapsPinIcon style={{width: '2rem', height: '2rem'}} />}
      headerActionIcon={
        <EditOutlinedIcon style={{color: theme.palette.secondary.mainLight}} />
      }>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <LocationSchema
              label={label}
              elevator={elevator}
              currency={getCurrencySymbol[currentCurrency.code]}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Location"
        onCancel={() => {
          setOpenDialog(false);
        }}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
          sx: {height: '100%'},
        }}>
        <EditLocationForm
          formik={formik}
          initialCustomer={elevator?.propertyOwner}
        />
      </Dialog>
    </InfoCard>
  );
};
