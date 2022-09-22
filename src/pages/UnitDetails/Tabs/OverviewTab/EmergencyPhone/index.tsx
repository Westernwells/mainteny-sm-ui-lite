import {useRef, useState} from 'react';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import {ElevatorView} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {EmergencyPhoneFormModel} from 'models/unitForm';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {EmergencyPhoneSchema} from './EmergencyPhoneSchema';
import {EditEmergencyPhoneForm} from './EditEmergencyPhoneForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

export const EmergencyPhone = ({
  containerStyles,
  elevator,
  propertyOwnerId,
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Service updated successfully',
  );

  const formik = useFormik<EmergencyPhoneFormModel>({
    initialValues: {
      manufacturer: elevator.additionalInfo?.manufacturer ?? '',
      systemId: elevator.additionalInfo?.elevatorPhone?.systemId ?? '',
      phoneConnection:
        elevator.additionalInfo?.elevatorPhone?.connectionType ?? '',
      phoneNumber: elevator.additionalInfo?.elevatorPhone?.phoneNumber ?? '',
      simCardNumber:
        elevator.additionalInfo?.elevatorPhone?.simCardNumber ?? '',
      callCenter: elevator.additionalInfo?.elevatorPhone?.callCenter ?? '',
      placeOfInstallation:
        elevator.additionalInfo?.elevatorPhone?.location ?? '',
    },
    onSubmit: async (values) => {
      setOpenDialog(false);
      await updateElevator({
        body: {
          propertyOwnerId,
          manufacturer: values.manufacturer,
          elevatorPhone: {
            systemId: values.systemId,
            connectionType: values.phoneConnection,
            phoneNumber: values.phoneNumber,
            simCardNumber: values.simCardNumber,
            callCenter: values.callCenter,
            location: values.placeOfInstallation,
          },
        },
        elevatorId: elevator.id,
      });
    },
  });

  const labels = useRef([
    'manufacturer',
    'systemId',
    'phoneConnection',
    'phoneNumber',
    'simCardNumber',
    'callCenter',
    'placeOfInstallation',
  ]).current;

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={
        <Typography variant="subtitle1">{t('Emergency Phone')}</Typography>
      }
      headerActionIcon={<EditIcon />}
      showHeaderBackground
      bodyContainerStyle={{
        overflowY: 'auto',
      }}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12}>
            <EmergencyPhoneSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Emergency Phone"
        onCancel={() => setOpenDialog(false)}
        onSave={formik.handleSubmit}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditEmergencyPhoneForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
