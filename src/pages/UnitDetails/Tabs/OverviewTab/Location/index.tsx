import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator, ElevatorRequestBody} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {LocationFormModel} from 'models/unitForm';
import {LocationSchema} from './LocationSchema';
import {EditLocationForm} from './EditLocationForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
}

const validationSchema = Yup.object().shape({
  address: Yup.object().nullable().required('Address is required'),
});

export const Location = ({
  containerStyles,
  elevator,
  elevatorRequestBody,
}: Props) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Location updated successfully',
  );
  const formik = useFormik<LocationFormModel>({
    initialValues: {
      address: elevator.address,
      building: elevator.additionalInfo.buildingLocation,
      propertySegment: elevator.additionalInfo.propertySegment,
      keyLocation: elevator.additionalInfo.keyLocation,
      parking: elevator.additionalInfo.parking,
    },
    onSubmit: () => {},
    validationSchema,
  });
  const labels = useRef([
    'address',
    'building',
    'propertySegment',
    'keyLocation',
    'parking',
  ]).current;

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        ...elevatorRequestBody,
        propertyOwnerId: elevatorRequestBody?.propertyOwnerId,
        address: formik.values.address,
        buildingLocation: formik.values.building || '',
        propertySegment: formik.values.propertySegment!,
        keyLocation: formik.values.keyLocation!,
        parking: formik.values.parking!,
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">Location</Typography>}
      showHeaderBackground
      headerActionIcon={<EditIcon />}>
      <Box
        sx={{
          display: 'flex',
          background: theme.palette.secondary.outlinedHoverBg,
          py: '1em',
          px: '0.5em',
          mb: '0.5em',
        }}>
        <Avatar alt="Tech" sx={{mr: '0.5em'}} />
        <Box>
          <Typography variant="subtitle2" component="div">
            {elevator.propertyOwner.name}
          </Typography>
          <Typography variant="caption" component="div">
            Property Manager
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={12}>
            <LocationSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Location"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditLocationForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
