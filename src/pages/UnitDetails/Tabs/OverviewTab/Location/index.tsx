import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ReactComponent as MapsPinIcon} from 'assets/icons/MapsPinIcon.svg';
import {ElevatorRequestBody, ElevatorView} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useContext, useEffect, useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {LocationFormModel, SeparateAddressFormModal} from 'models/unitForm';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {companyLanguageContextMap, formatAddressFullname} from 'utils/utils';
import {AddressRecord, Language} from 'models/misc';
import {centsToMoney, moneyToCents, useCurrentCurrency} from 'utils/currency';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
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
  const {company} = useContext(UserCompanyContext);
  const language =
    companyLanguageContextMap[company?.language || Language.EN_US];
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: language,
  } as CustomTranslationOptions);
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
      travelFee: centsToMoney(
        currentCurrency.code,
        elevator.additionalInfo?.travelFee,
      ),
    },
    onSubmit: () => {},
    validationSchema,
  });

  const separateAddressFormik = useFormik<SeparateAddressFormModal>({
    initialValues: {
      billingAddress: elevator.additionalInfo.billingAddress ?? {
        fullName: '',
      },
      beneficiaryAddress: elevator.additionalInfo.beneficiaryAddress ?? {
        fullName: '',
      },
    },
    onSubmit: () => {},
  });

  const doesSeparateAddressExist =
    !!separateAddressFormik.values.beneficiaryAddress?.fullName ||
    !!separateAddressFormik.values.billingAddress?.fullName;
  const [isSeparateAddressEnabled, setIsSeparateAddressEnabled] = useState(
    doesSeparateAddressExist,
  );

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

  const onCloseDialog = () => {
    setOpenDialog(false);
  };

  const onSave = async () => {
    const body: Partial<ElevatorRequestBody> = {
      propertyOwnerId: formik.values.propertyOwnerId,
      address: formatAddressFullname(
        formik.values.address,
        translateCompanyLanguage,
      ) as AddressRecord | undefined,
      buildingLocation: formik.values.building || '',
      propertySegment: formik.values.propertySegment!,
      keyLocation: formik.values.keyLocation!,
      parking: formik.values.parking!,
      distance: formik.values.distance!,
      travelTime: formik.values.travelTime!,
      travelFee: moneyToCents(currentCurrency.code, formik.values.travelFee!),
      billingAddress: undefined,
      beneficiaryAddress: undefined,
    };

    if (isSeparateAddressEnabled) {
      body.billingAddress = formatAddressFullname(
        separateAddressFormik.values.billingAddress,
        translateCompanyLanguage,
      ) as AddressRecord | undefined;
      body.beneficiaryAddress = formatAddressFullname(
        separateAddressFormik.values.beneficiaryAddress,
        translateCompanyLanguage,
      ) as AddressRecord | undefined;
    }

    await updateElevator({
      body,
      elevatorId: elevator.id,
    });

    onCloseDialog();
  };

  useEffect(() => {
    if (!isSeparateAddressEnabled && doesSeparateAddressExist) {
      setIsSeparateAddressEnabled(true);
    }
  }, [
    separateAddressFormik.values.beneficiaryAddress,
    separateAddressFormik.values.billingAddress,
  ]);

  useEffect(() => {
    separateAddressFormik.setValues({
      billingAddress: elevator.additionalInfo.billingAddress ?? {
        fullName: '',
      },
      beneficiaryAddress: elevator.additionalInfo.beneficiaryAddress ?? {
        fullName: '',
      },
    });
  }, [
    elevator.additionalInfo.billingAddress,
    elevator.additionalInfo.beneficiaryAddress,
  ]);

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
            <LocationSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Location"
        onCancel={onCloseDialog}
        disableSaveBtn={
          !!Object.keys(formik.errors).length ||
          !!Object.keys(separateAddressFormik.errors).length
        }
        onSave={onSave}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
          sx: {height: '100%'},
        }}>
        <EditLocationForm
          formik={formik}
          separateAddressFormik={separateAddressFormik}
          initialCustomer={elevator?.propertyOwner}
          isSeparateAddressEnabled={isSeparateAddressEnabled}
          setIsSeparateAddressEnabled={(newBol: boolean) =>
            setIsSeparateAddressEnabled(newBol)
          }
        />
      </Dialog>
    </InfoCard>
  );
};
