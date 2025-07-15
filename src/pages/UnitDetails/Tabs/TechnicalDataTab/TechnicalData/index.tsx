import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {
  ElevatorDataSchemaView,
  ElevatorView,
  ElevatorDataItemRecord,
} from 'models/elevator';
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
    const values = getValues();

    const items: Record<string, string | number> = {};

    Object.entries(values as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (!Object.prototype.hasOwnProperty.call(values, key)) return;
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          Object.entries(value as Record<string, unknown>).forEach(
            ([subKey, v]) => {
              let numOrStr: string | number = v as string;
              if (typeof v === 'string') {
                if (v.trim() !== '' && !Number.isNaN(Number(v))) {
                  numOrStr = Number(v);
                }
              }
              items[`${key.trim()} [${subKey}]`] = numOrStr;
            },
          );
        } else if (typeof value === 'string') {
          let numOrStr: string | number = value;
          if (value.trim() !== '' && !Number.isNaN(Number(value))) {
            numOrStr = Number(value);
          }
          items[key] = numOrStr;
        }
      },
    );

    const itemsArray: ElevatorDataItemRecord[] = Object.entries(items).map(
      ([name, value]) => ({
        name,
        value: String(value),
      }),
    );
    await updateElevatorDataItem({
      queryParams: {
        elevatorId: elevator.id,
        schemaId: schema.id,
      },
      body: {
        items: itemsArray,
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
        {dialogState.mode === 'edit' && dialogState.open && (
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
