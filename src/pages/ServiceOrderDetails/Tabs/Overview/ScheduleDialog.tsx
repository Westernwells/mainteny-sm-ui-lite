import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {t} from 'i18next';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import * as _ from 'lodash';
import {useUpdateServiceOrderSchedule} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource} from 'utils/paging';
import {Switch} from 'components/Switch';
import Box from '@mui/material/Box';
import {TimePicker} from 'components/TimePicker';
import {Button} from 'components/Button';
import {EmployeesSimpleView} from 'models/employee';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {
  formatDate,
  setDateTime,
  toRestDate,
  toRestDateTime,
} from 'utils/datetime';
import {useForm} from 'react-hook-form';
import {queryKeys} from 'reactQuery/constants';
import {useQueryClient} from 'react-query';
import {useQueryServiceCompanyEmployees} from 'hooks/reactQuery/useEmployee';
import isValid from 'date-fns/isValid';
import {DatePicker} from '../../../../components/DatePicker';
import {FormInput} from '../../../../components/form/FormInput';
import {ScheduleForm} from '../../models';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface FormData extends ScheduleForm {
  switchActive: boolean;
}

interface Props {
  serviceOrderId: string;
  serviceOrderType?: string;
  open?: boolean;
  onClose: () => void;
  title?: string;
  defaultTechnicians?: EmployeesSimpleView[] | null;
  defaultStartDate?: Date | null;
  defaultEndDate?: Date | null;
  defaultDueDate?: Date | null;
  defaultPurchaseOrderNumber?: string | null;
  defaultCallerName?: string | null;
  defaultCallerPhoneNumber?: string | null;
  defaultCallTime?: Date | null;
  onSaveCB?: () => void;
}

export const ScheduleDialog = ({
  serviceOrderId,
  serviceOrderType,
  open,
  onClose,
  title = t('Assign Engineer'),
  defaultTechnicians = null,
  defaultStartDate = null,
  defaultEndDate = null,
  defaultDueDate = null,
  defaultPurchaseOrderNumber = null,
  defaultCallerName = null,
  defaultCallerPhoneNumber = null,
  defaultCallTime = null,
  onSaveCB,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const queryClient = useQueryClient();
  const {mutate: scheduleServiceOrder} = useUpdateServiceOrderSchedule(
    t('Service job scheduled successfully'),
    () => {
      queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      queryClient.invalidateQueries([queryKeys.queryDueServiceOrders]);
    },
  );

  const defaultValues = useMemo(
    () => ({
      switchActive: Boolean(defaultStartDate && defaultEndDate),
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      startTime: defaultStartDate,
      endTime: defaultEndDate,
      dueDate: defaultDueDate,
      purchaseOrderNumber: defaultPurchaseOrderNumber,
      callerName: defaultCallerName,
      callerPhoneNumber: defaultCallerPhoneNumber,
      callTime: defaultCallTime,
      technicianIds:
        defaultTechnicians?.map((technician) => technician.id) || [],
    }),
    [
      defaultStartDate,
      defaultEndDate,
      defaultStartDate,
      defaultEndDate,
      defaultDueDate,
      defaultPurchaseOrderNumber,
      defaultCallerName,
      defaultCallerPhoneNumber,
      defaultCallTime,
      defaultTechnicians,
    ],
  );

  const form = useForm<FormData>({
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: {errors, touchedFields, isValid: isFormValid},
    trigger,
    reset,
  } = form;

  const [
    watchTechnicianIdsField,
    watchSwitchActive,
    watchStartDate,
    watchStartTime,
    watchEndDate,
    watchEndTime,
    watchDueDate,
  ] = watch([
    'technicianIds',
    'switchActive',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'dueDate',
  ]);

  const validStartDate =
    watchSwitchActive &&
    watchStartDate &&
    isValid(watchStartDate) &&
    watchStartTime &&
    isValid(watchStartTime);

  const validEndDate =
    watchSwitchActive &&
    watchEndDate &&
    isValid(watchEndDate) &&
    watchEndTime &&
    isValid(watchEndTime);

  const onFormSubmit = handleSubmit((values) => {
    const {...rest} = values;
    const {orderStartTime, orderEndTime} =
      validStartDate && validEndDate
        ? {
            orderStartTime: toRestDateTime(
              setDateTime(watchStartDate, formatDate(watchStartTime, 'HH:mm')!),
            ),
            orderEndTime: toRestDateTime(
              setDateTime(
                watchEndDate,
                formatDate(watchEndTime as Date, 'HH:mm')!,
              ),
            ),
          }
        : {orderStartTime: null, orderEndTime: null};

    const callerInfo = {
      ...(rest.callerName && {name: rest.callerName}),
      ...(rest.callerPhoneNumber && {phoneNumber: rest.callerPhoneNumber}),
      ...(rest.callTime && {calledAt: toRestDateTime(new Date(rest.callTime))}),
    };

    scheduleServiceOrder(
      {
        body: {
          endTime: orderEndTime ?? undefined,
          startTime: orderStartTime ?? undefined,
          technicianIds: values.technicianIds ?? undefined,
          dueDate: values.dueDate
            ? toRestDate(new Date(values.dueDate))
            : undefined,
          callerInfo: Object.keys(callerInfo).length ? callerInfo : undefined,
          purchaseOrderNumber: values.purchaseOrderNumber ?? undefined,
        },
        serviceOrderId,
      },
      {
        onSuccess: () => onSaveCB?.(),
      },
    );
    onClose();
    reset();
  });

  const {data: techniciansResource = createEmptyResource(10)} =
    useQueryServiceCompanyEmployees({
      pageIndex: 0,
      pageSize: 10,
      query,
      serviceOrderType,
    });

  useEffect(() => {
    setValue('startDate', defaultStartDate || null);
    setValue('endDate', defaultEndDate || null);
    setValue('startTime', defaultStartDate || null);
    setValue('endTime', defaultEndDate || null);
  }, [defaultStartDate?.getTime(), defaultEndDate?.getTime()]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  // temporary solution until making Yup resolver work with react-hook-form
  const formNotValidCustomValidation = useMemo(() => {
    // If there is no dueDate, also invalid
    if (!watchDueDate || !isValid(watchDueDate)) return true;

    // If switch is on, ensure all 4 date/time values are valid
    if (watchSwitchActive) {
      return (
        !watchStartDate ||
        !watchEndDate ||
        !watchStartTime ||
        !watchEndTime ||
        !isValid(watchStartDate) ||
        !isValid(watchEndDate) ||
        !isValid(watchStartTime) ||
        !isValid(watchEndTime)
      );
    }

    return false;
  }, [
    watchStartDate,
    watchEndDate,
    watchStartTime,
    watchEndTime,
    watchDueDate,
    watchSwitchActive,
  ]);

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    debouncedChangeHandler(newValue);
  };

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    setValue('startDate', dateValues[0]);
    setValue('endDate', dateValues[1] || dateValues[0]);
  };

  const clearDateSelection = () => {
    setValue('startDate', null);
    setValue('endDate', null);
  };

  // to update value on mount
  useEffect(() => {
    setValue('technicianIds', defaultValues.technicianIds);
  }, []);

  return (
    <Box component="form" onSubmit={onFormSubmit}>
      <Dialog
        open={open || false}
        onClose={() => {
          onClose();
          reset();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component="div">
            <Autocomplete
              multiple
              size="small"
              clearOnBlur={false}
              id="combo-box-demo"
              sx={{mt: '0.5em'}}
              noOptionsText={t('No options')}
              options={techniciansResource.data}
              onChange={(_event: any, newValues: EmployeesSimpleView[]) => {
                setValue(
                  'technicianIds',
                  newValues.map((value) => value.id),
                );
              }}
              getOptionLabel={(option) =>
                `${option.userAccount.firstName} ${option.userAccount.lastName}`
              }
              defaultValue={defaultTechnicians || []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, {selected}) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    checked={selected}
                  />
                  {`${option.userAccount.firstName} ${option.userAccount.lastName}`}
                </li>
              )}
              filterOptions={(x) => x}
              onInputChange={onInputChange}
              inputValue={query}
              onBlur={register('technicianIds').onBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Engineer')}
                  name="technicianIds"
                  error={
                    !!(errors.technicianIds && touchedFields.technicianIds)
                  }
                  helperText={
                    errors.technicianIds && touchedFields.technicianIds
                      ? errors.technicianIds.message
                      : ''
                  }
                />
              )}
              getOptionDisabled={(option) =>
                (watchTechnicianIdsField?.length || 0) >= 10 &&
                !watchTechnicianIdsField?.includes(option.id)
              }
            />

            <Box sx={{mt: '1.5em'}}>
              <Switch
                value={watchSwitchActive}
                testId="schedule-dialog-fixed-date-switch"
                getValue={(value) => setValue('switchActive', value)}
                label="Choose a fixed date and time"
              />
            </Box>

            {watchSwitchActive && (
              <Box
                gap={2}
                sx={{
                  mt: '1.5em',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'space-between',
                }}>
                <DatePickerRange
                  defaultDate={[watchStartDate, watchEndDate]}
                  getSelectedDate={handleDateSelection}
                  textFieldProps={{
                    label: t('Start and end date'),
                    required: true,
                  }}
                  onClear={clearDateSelection}
                  disabled={!watchSwitchActive}
                  sx={{width: '300px'}}
                  inputTestId="start-end-date"
                  popupTestId="start-end-date-popup"
                />

                <TimePicker
                  required
                  defaultTime={watchStartTime}
                  getSelectedTime={(time) => {
                    if (time && !Number.isNaN(time.getTime())) {
                      const newStartTime = time;
                      setValue('startTime', newStartTime);

                      if (
                        watchStartDate &&
                        watchEndDate &&
                        watchStartDate.getTime() === watchEndDate.getTime()
                      ) {
                        const newEndTime = new Date(newStartTime);
                        setValue('endTime', newEndTime);
                      }
                    }
                  }}
                  textFieldProps={{
                    label: 'Start Time',
                    name: 'startTime',
                    error: !!(errors.startTime && touchedFields.startTime),
                    onBlur: register('startTime').onBlur,
                  }}
                  inputTestId="start-time"
                  popupTestId="start-time-popup"
                />

                <TimePicker
                  required
                  minTime={watchStartTime as Date}
                  defaultTime={watchEndTime || watchEndDate}
                  getSelectedTime={(time) => {
                    setValue('endTime', time);
                  }}
                  textFieldProps={{
                    label: 'End Time',
                    name: 'endTime',
                    error: !!(errors.endTime && touchedFields.endTime),
                    onBlur: register('endTime').onBlur,
                  }}
                  disabled={!watchSwitchActive}
                  inputTestId="end-time"
                  popupTestId="end-time-popup"
                />
              </Box>
            )}

            <Box sx={{mt: '1.5em', width: '300px'}}>
              <DatePicker
                required
                defaultDate={watchDueDate}
                getSelectedDate={(date: Date | null) =>
                  setValue('dueDate', date)
                }
                confirm={() => trigger()}
                textFieldProps={{
                  label: t('Due date'),
                  required: true,
                }}
                inputTestId="due-date"
                popupTestId="due-date-popup"
              />
            </Box>

            <Box sx={{mt: '2em'}}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '1.12px',
                }}>
                {t('Additional Information')}
              </Typography>
            </Box>

            <Box sx={{mt: '2em', display: 'flex'}}>
              <FormInput
                fieldProps={{
                  label: t('Purchase Order Number'),
                  ...register('purchaseOrderNumber'),
                }}
              />
            </Box>

            <Box sx={{mt: '2em', display: 'flex'}} gap={2}>
              <Box sx={{width: '50%'}}>
                <FormInput
                  fieldProps={{
                    label: t('Caller'),
                    ...register('callerName'),
                  }}
                />
              </Box>

              <Box sx={{width: '50%'}}>
                <FormInput
                  fieldProps={{
                    label: t('Caller phone no.'),
                    ...register('callerPhoneNumber'),
                  }}
                />
              </Box>

              <TimePicker
                defaultTime={defaultCallTime}
                getSelectedTime={(date) => {
                  setValue('callTime', date);
                }}
                textFieldProps={{
                  label: t('Call Time'),
                }}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p: 3, gap: 1}}>
          <Button
            buttonProps={{
              size: 'medium',
              onClick: () => {
                onClose();
                reset();
              },
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('Cancel')}
            </Typography>
          </Button>
          <Button
            buttonProps={{
              variant: 'contained',
              size: 'medium',
              onClick: () => onFormSubmit(),
              autoFocus: true,
              disabled: !isFormValid || formNotValidCustomValidation,
            }}
            testId="saveButton">
            <Typography variant="subtitle2">{t('Save')}</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
