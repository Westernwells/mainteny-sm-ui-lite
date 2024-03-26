import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
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
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {useUpdateServiceOrderSchedule} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource} from 'utils/paging-utils';
import {Switch} from 'components/Switch';
import Box from '@mui/material/Box';
import {TimePicker} from 'components/TimePicker';
import {useFormik} from 'formik';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import * as Yup from 'yup';
import {Button} from 'components/Button';
import {EmployeesView} from 'models/employee';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {formatDate, setDateTime, toRestDateTime} from 'utils/datetime';
import {JobScheduleType} from 'models/service-order';
import {useTranslation} from 'react-i18next';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const validationSchema = Yup.object().shape({
  switchActive: Yup.boolean(),
  startDate: Yup.string().nullable().when('switchActive', {
    is: true,
    then: Yup.string().nullable().required(),
    otherwise: Yup.string().nullable(),
  }),
  endDate: Yup.string().nullable().when('switchActive', {
    is: true,
    then: Yup.string().nullable().required(),
    otherwise: Yup.string().nullable(),
  }),
  startTime: Yup.string().nullable().when('switchActive', {
    is: true,
    then: Yup.string().nullable().required(),
    otherwise: Yup.string().nullable(),
  }),
  endTime: Yup.string().nullable().when('switchActive', {
    is: true,
    then: Yup.string().nullable().required(),
    otherwise: Yup.string().nullable(),
  }),
  technicianIds: Yup.array().required().min(1),
});

interface Props {
  serviceOrderId: string;
  open?: boolean;
  onClose: () => void;
  title?: string;
  defaultTechnicians?: EmployeesView[] | null;
  defaultStartDate?: Date | null;
  defaultEndDate?: Date | null;
  onSaveCB?: () => void;
}

export const ScheduleDialog = ({
  serviceOrderId,
  open,
  onClose,
  title = 'Assign Engineer',
  defaultTechnicians,
  defaultStartDate,
  defaultEndDate,
  onSaveCB,
}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const {mutate: scheduleServiceOrder} = useUpdateServiceOrderSchedule(
    t('Service job scheduled successfully'),
  );

  const formik = useFormik<ScheduleForm & {switchActive: boolean}>({
    initialValues: {
      switchActive: false,
      startDate: defaultStartDate || null,
      endDate: defaultEndDate || null,
      startTime: defaultStartDate || null,
      endTime: defaultEndDate || null,
      technicianIds:
        defaultTechnicians?.map((technician) => technician.id) || [],
    },
    onSubmit: (values) => {
      let orderStartTime = null;
      let orderEndTime = null;
      if (values.switchActive) {
        orderStartTime = toRestDateTime(
          setDateTime(
            values.startDate!,
            formatDate(values.startTime!, 'HH:mm')!,
          ),
        );

        orderEndTime = toRestDateTime(
          setDateTime(
            values?.endDate!,
            formatDate(values.endTime as Date, 'HH:mm')!,
          ),
        );
      }

      scheduleServiceOrder(
        {
          body: {
            ...(orderEndTime && {endTime: orderEndTime}),
            ...(orderStartTime && {startTime: orderStartTime}),
            technicianIds: values.technicianIds || [],
            type: JobScheduleType.FIXED,
          },
          serviceOrderId,
        },
        {
          onSuccess: () => onSaveCB?.(),
        },
      );
      onClose();
    },
    validationSchema,
  });

  const {data: techniciansResource = createEmptyResource(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 10,
      query,
    });

  useEffect(() => {
    formik.setValues({
      ...formik.values,
      startDate: defaultStartDate || null,
      endDate: defaultEndDate || null,
      startTime: defaultStartDate || null,
      endTime: defaultEndDate || null,
    });
  }, [defaultStartDate?.getTime(), defaultEndDate?.getTime()]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    debouncedChangeHandler(newValue);
  };

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    formik.setValues({
      ...formik.values,
      startDate: dateValues[0],
      endDate: dateValues[1] || dateValues[0],
    });
  };

  const clearDateSelection = () => {
    formik.setValues({
      ...formik.values,
      startDate: null,
      endDate: null,
    });
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Dialog
        open={open || false}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component="div">
            <Autocomplete
              multiple
              size="small"
              clearOnBlur={false}
              id="combo-box-demo"
              sx={{mt: '0.5em'}}
              options={techniciansResource.data}
              onChange={(_event: any, newValues: EmployeesView[]) =>
                formik.setValues({
                  ...formik.values,
                  technicianIds: newValues.map((value) => value.id),
                })
              }
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
              onInputChange={onInputChange}
              inputValue={query}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label={t('Engineer')}
                  name="technicianIds"
                  error={
                    !!(
                      formik.errors.technicianIds &&
                      formik.touched.technicianIds
                    )
                  }
                  helperText={
                    formik.errors.technicianIds && formik.touched.technicianIds
                      ? formik.errors.technicianIds
                      : ''
                  }
                />
              )}
            />

            <Box sx={{mt: '1.5em'}}>
              <Switch
                value={formik.values.switchActive}
                getValue={(value) =>
                  formik.setFieldValue('switchActive', value)
                }
                label="Choose a fixed date and time"
              />
            </Box>

            <Box sx={{mt: '1.5em'}}>
              <DatePickerRange
                defaultDate={[formik.values.startDate, formik.values.endDate]}
                getSelectedDate={handleDateSelection}
                textFieldProps={{
                  label: t('Start and end date'),
                  required: true,
                  sx: {
                    width: '100%',
                  },
                }}
                onClear={clearDateSelection}
                disabled={!formik.values.switchActive}
              />
            </Box>
            <Box
              sx={{
                mt: '1.5em',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <TimePicker
                required
                defaultTime={formik.values.startTime}
                containerStyles={{mr: '1em'}}
                getSelectedTime={(time) => {
                  if (time && !Number.isNaN(time.getTime())) {
                    const newStartTime = time;
                    formik.setFieldValue('startTime', newStartTime);

                    const {startDate, endDate} = formik.values;
                    if (
                      startDate &&
                      endDate &&
                      startDate.getTime() === endDate.getTime()
                    ) {
                      const newEndTime = new Date(newStartTime);
                      formik.setFieldValue('endTime', newEndTime);
                    }
                  }
                }}
                textFieldProps={{
                  label: 'Start Time',
                  name: 'startTime',
                  error: !!(
                    formik.errors.startTime && formik.touched.startTime
                  ),
                  onBlur: formik.handleBlur,
                }}
                disabled={!formik.values.switchActive}
              />

              <TimePicker
                required
                minTime={formik.values.startTime as Date}
                defaultTime={formik.values.endTime || defaultEndDate}
                getSelectedTime={(time) => {
                  formik.setValues({
                    ...formik.values,
                    endTime: time,
                  });
                }}
                textFieldProps={{
                  label: 'End Time',
                  name: 'endTime',
                  error: !!(formik.errors.endTime && formik.touched.endTime),
                  onBlur: formik.handleBlur,
                }}
                disabled={!formik.values.switchActive}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p: 3, gap: 1}}>
          <Button
            buttonProps={{
              size: 'medium',
              onClick: onClose,
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('Cancel')}
            </Typography>
          </Button>
          <Button
            buttonProps={{
              variant: 'contained',
              size: 'medium',
              onClick: () => formik.handleSubmit(),
              autoFocus: true,
              disabled: !formik.isValid,
            }}>
            <Typography variant="subtitle2">{t('Save')}</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
