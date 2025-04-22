import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorDataSchemaView, ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {Dialog} from 'components/Dialog';
import {useForm} from 'react-hook-form';
import {
  useFetchElevatorDataItems,
  useUpdateElevatorDataItems,
} from 'hooks/reactQuery/useElevator';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import {
  escapeDotInString,
  getTechnicalFieldCategory,
  getTechnicalFieldName,
  restoreDotInString,
} from 'utils/utils';
import EditTechnicalDataForm from './EditTechnicalDataForm';
import TechnicalDataView from './TechnicalDataView';

interface Props {
  elevator: ElevatorView;
  schema: ElevatorDataSchemaView;
}

const NO_OF_ITEMS_TO_SHOW = 10;

type DialogState = {
  open: boolean;
  mode: 'view' | 'edit';
};

const INITIAL_DIALOG_STATE: DialogState = {
  open: false,
  mode: 'view',
};

const TechnicalData = ({elevator, schema}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {mutateAsync: updateElevatorDataItem, isLoading: isUpdating} =
    useUpdateElevatorDataItems();

  const {data: elevatorDataItemsResponse} = useFetchElevatorDataItems(
    elevator.id,
    {
      schemaId: schema.id,
    },
  );

  const elevatorDataItems = elevatorDataItemsResponse?.[schema.id] ?? [];

  const elevatorDataItemMapping = useMemo(
    () =>
      elevatorDataItems.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as {[key: string]: string}),
    [elevatorDataItemsResponse],
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState(INITIAL_DIALOG_STATE);

  const {register, reset, getValues} = useForm<{
    [key: string]: string;
  }>({
    defaultValues: {},
  });

  useEffect(() => {
    if (!openDialog) {
      reset({});
    }
  }, [elevator, openDialog]);

  const onSubmit = async () => {
    // Restore dot character in the names. It was escaped before
    const values = Object.keys(getValues()).reduce((acc, item) => {
      acc[restoreDotInString(item)] = getValues()[item];
      return acc;
    }, {} as {[key: string]: string});

    const items = elevatorDataItems.map((item) => ({
      name: item.name,
      value: values[item.name] || '',
    }));

    await updateElevatorDataItem({
      queryParams: {
        elevatorId: elevator.id,
        schemaId: schema.id,
      },
      body: {
        items,
      },
    });

    setDialogState(INITIAL_DIALOG_STATE);
  };

  const showShowMore = schema.additionalInfo.items.length > NO_OF_ITEMS_TO_SHOW;

  const openEditDialog = () => {
    setDialogState({...dialogState, open: true, mode: 'edit'});
    reset(
      elevatorDataItems.reduce((acc, dataItem) => {
        // Escaping dot is important otherwise react-hook-form won't work
        acc[escapeDotInString(dataItem.name)] = dataItem.value;
        return acc;
      }, {} as {[key: string]: string}),
    );
  };

  return (
    <InfoCard
      containerStyles={{height: '100%', paddingBottom: 0}}
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <EditOutlined
          onClick={openEditDialog}
          style={{color: theme.palette.secondary.mainLight}}
        />
      }
      header={
        <Grid container wrap="nowrap" gap={1}>
          <Typography variant="h5" fontWeight={600}>
            {getTechnicalFieldCategory({name: schema.name}, t)}
          </Typography>
        </Grid>
      }>
      <Box>
        {schema.additionalInfo.items
          .slice(0, NO_OF_ITEMS_TO_SHOW)
          .map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                my: 1,
              }}>
              <Typography fontWeight={400} color="#828DA3">
                {getTechnicalFieldName({name: item.name}, t)}
              </Typography>
              {elevatorDataItemMapping[item.name] && (
                <Typography fontWeight={400} color="#000034">
                  {elevatorDataItemMapping[item.name]} {t(item.unit)}
                </Typography>
              )}
            </Box>
          ))}
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          {showShowMore && (
            <Button
              style={{color: '#0092B2', px: 2}}
              buttonProps={{
                onClick: () => {
                  setDialogState({open: true, mode: 'view'});
                },
              }}
              enableRipple
              variant="text"
              label={t('See {{count}} more', {
                count: schema.additionalInfo.items.length - NO_OF_ITEMS_TO_SHOW,
              })}
            />
          )}
        </Box>
      </Box>
      <Dialog
        title={`${schema.name}`}
        dialogContentTextStyles={dialogState.mode === 'view' ? {pt: 0} : {}}
        dialogTitleStyles={dialogState.mode === 'view' ? {pb: 0} : {}}
        saveButtonText={dialogState.mode === 'view' ? 'Edit' : 'Save'}
        isSaving={isUpdating}
        onSave={() => {
          if (dialogState.mode === 'view') {
            openEditDialog();
          }

          if (dialogState.mode === 'edit') {
            onSubmit();
          }
        }}
        onCancel={() => {
          reset({});
          setDialogState(INITIAL_DIALOG_STATE);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: dialogState.open || false,
        }}>
        {dialogState.mode === 'view' && (
          <TechnicalDataView elevatorDataItems={elevatorDataItems} />
        )}
        {dialogState.mode === 'edit' && (
          <EditTechnicalDataForm
            elevatorDataItems={elevatorDataItems}
            register={register}
          />
        )}
      </Dialog>
    </InfoCard>
  );
};

export default TechnicalData;
