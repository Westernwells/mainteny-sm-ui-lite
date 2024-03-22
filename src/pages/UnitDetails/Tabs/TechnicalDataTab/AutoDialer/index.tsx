import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DialpadIcon from '@mui/icons-material/Dialpad';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import {AutoDialerFormModel} from 'models/unitForm';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useForm} from 'react-hook-form';
import AutoDialerSchema from './AutoDialerSchema';
import EditAutoDialerForm from './EditAutoDialerForm';

interface Props {
  elevator: ElevatorView;
}

const AutoDialer = ({elevator}: Props) => {
  const propertyOwnerId = elevator?.propertyOwner?.id;
  const {t} = useTranslation();
  const theme = useTheme();
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );

  const [openDialog, setOpenDialog] = useState(false);

  const getDefaultValues = (elevatorData: ElevatorView) => ({
    emergencyPhoneProvider: elevatorData.additionalInfo?.emergencyPhoneProvider,
    systemId: elevatorData.additionalInfo?.elevatorPhone?.systemId,
    phoneConnection: elevatorData.additionalInfo?.elevatorPhone?.connectionType,
    phoneNumber: elevatorData.additionalInfo?.elevatorPhone?.phoneNumber,
    simCardNumber: elevatorData.additionalInfo?.elevatorPhone?.simCardNumber,
    simPin: elevatorData.additionalInfo?.elevatorPhone?.simPin,
    callCenter: elevatorData.additionalInfo?.elevatorPhone?.callCenter,
    placeOfInstallation: elevatorData.additionalInfo?.elevatorPhone?.location,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<AutoDialerFormModel>({
    defaultValues: getDefaultValues(elevator),
  });

  useEffect(() => {
    reset(getDefaultValues(elevator));
  }, [elevator]);

  const onSubmit = async (data: AutoDialerFormModel) => {
    await updateElevator({
      body: {
        propertyOwnerId,
        emergencyPhoneProvider: data.emergencyPhoneProvider,
        elevatorPhone: {
          systemId: data.systemId,
          connectionType: data.phoneConnection,
          phoneNumber: data.phoneNumber,
          simCardNumber: data.simCardNumber,
          simPin: data.simPin,
          callCenter: data.callCenter,
          location: data.placeOfInstallation,
        },
      },
      elevatorId: elevator.id,
    });
    setOpenDialog(false);
  };

  const labels = useRef([
    'manufacturer',
    'systemId',
    'phoneConnection',
    'phoneNumber',
    'simCardNumber',
    'simPin',
    'callCenter',
    'placeOfInstallation',
  ]).current;

  return (
    <InfoCard
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <EditOutlined style={{color: theme.palette.secondary.mainLight}} />
      }
      header={
        <Grid container wrap="nowrap" gap={1}>
          <DialpadIcon
            style={{
              color: theme.palette.text.secondary,
            }}
          />
          <Typography variant="h5" fontWeight={600}>
            {t('Auto Dialer')}
          </Typography>
        </Grid>
      }>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <AutoDialerSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Auto Dialer"
        onCancel={() => {
          reset();
          setOpenDialog(false);
        }}
        disableSaveBtn={!!Object.keys(errors).length}
        onSave={handleSubmit(onSubmit)}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <EditAutoDialerForm register={register} />
      </Dialog>
    </InfoCard>
  );
};

export default AutoDialer;
