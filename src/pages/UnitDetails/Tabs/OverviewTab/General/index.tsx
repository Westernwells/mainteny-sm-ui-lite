import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ElevatorStatus, ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import {useEffect, useRef, useState} from 'react';
import {Dialog} from 'components/Dialog';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {convertToMacro, convertToText} from 'utils/utils';
import useTheme from '@mui/material/styles/useTheme';
import {GeneralFormModel} from 'models/unitForm';
import {ReactComponent as PinInformationIcon} from 'assets/icons/PinInformationIcon.svg';
import {useForm} from 'react-hook-form';
import Chip from '@mui/material/Chip';
import capitalize from 'lodash/capitalize';
import {UnitDetailsSchema} from './GeneralSchema';
import {EditUnitDetailsForm} from './GeneralForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const General = ({containerStyles, elevator, propertyOwnerId}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );

  const statusColors = useRef({
    [ElevatorStatus.BROKEN]: theme.palette.error.main,
    [ElevatorStatus.STOPPED]: theme.palette.grey[400],
    [ElevatorStatus.RUNNING]: theme.palette.success.darkSuccess,
  }).current;

  const getDefaultValues = (elevatorData: ElevatorView) => ({
    category: convertToText(elevatorData.category),
    manufacturer: elevatorData?.additionalInfo?.manufacturer,
    model: elevatorData.model,
    externalId: elevator.externalId,
    number: elevator.externalId,
    unitType: elevatorData.type,
    serialNumber: elevatorData.serialNumber,
    yearBuilt: elevatorData.additionalInfo.builtYear,
    status: elevatorData.status,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors},
  } = useForm<GeneralFormModel>({
    defaultValues: getDefaultValues(elevator),
    mode: 'all',
  });

  useEffect(() => {
    reset(getDefaultValues(elevator));
  }, []);

  const onSubmit = async (data: GeneralFormModel) => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        category: data.category ? convertToMacro(data.category) : '',
        manufacturer: data.manufacturer,
        externalId: data.externalId || '',
        model: data.model || '',
        serialNumber: data.serialNumber,
        builtYear: data.yearBuilt,
        status: data.status,
      },
      elevatorId: elevator.id,
    });
  };

  const labels = useRef([
    'category',
    'manufacturer',
    'model',
    'serialNumber',
    'unitId',
    'spendingLimit',
    'builtYear',
  ]).current;

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={
        <Typography variant="h5">
          {t('General')}{' '}
          <Chip
            label={elevator.status && capitalize(elevator.status)}
            size="small"
            sx={{
              color: theme.palette.primary.contrastText,
              bgcolor: statusColors[elevator.status],
              marginLeft: '0.5rem',
              padding: '0 0.5rem',
            }}
          />
        </Typography>
      }
      headerIcon={
        <PinInformationIcon style={{width: '2rem', height: '2rem'}} />
      }
      headerActionIcon={
        <EditOutlinedIcon style={{color: theme.palette.secondary.mainLight}} />
      }>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <UnitDetailsSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit General"
        onCancel={() => {
          reset(getDefaultValues(elevator));
          setOpenDialog(false);
        }}
        disableSaveBtn={!!Object.keys(errors).length || !watch('category')}
        onSave={handleSubmit(onSubmit)}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <EditUnitDetailsForm
          register={register}
          watch={watch}
          setValue={setValue}
        />
      </Dialog>
    </InfoCard>
  );
};

export default General;
