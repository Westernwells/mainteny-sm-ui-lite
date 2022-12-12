import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {createEmptyResource} from 'utils/paging-utils';
import {Switch} from 'components/Switch';
import Box from '@mui/material/Box';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';
import {FormikErrors, useFormik} from 'formik';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import * as Yup from 'yup';
import {Button} from 'components/Button';
import {EmployeesView} from 'models/employee';
import {useTranslation} from 'react-i18next';

interface Props {
  open?: boolean;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  datePickerLabel?: string;
  defaultTechnician?: EmployeesView | null;
  defaultStartDate?: Date | null;
  defaultEndDate?: Date | null;
  getFormValues?: (values: ScheduleForm) => void;
  getFormErrors?: (errors: FormikErrors<ScheduleForm>) => void;
  getSwitchState?: (value: boolean) => void;
  disableSaveBtn?: boolean;
  showSwitch?: boolean;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().nullable().required('date is required'),
  startTime: Yup.string().nullable().required('start time is required'),
  endTime: Yup.string().nullable().required('end time is required'),
});

export const ScheduleDialog = ({
  open,
  onSave,
  onCancel,
  title,
  datePickerLabel = 'Reschedule To',
  defaultTechnician,
  defaultStartDate,
  defaultEndDate,
  getFormValues,
  getSwitchState,
  disableSaveBtn,
  getFormErrors,
  showSwitch,
}: Props) => {
  const {t} = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [switchActive, setSwitchActive] = useState(true);

  const formik = useFormik<ScheduleForm>({
    initialValues: {
      date: defaultStartDate || null,
      startTime: defaultStartDate || null,
      endTime: defaultEndDate || null,
      technicianId: defaultTechnician?.id || null,
    },
    onSubmit: () => onSave(),
    validationSchema,
  });

  const {data: techniciansResource = createEmptyResource(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 10,
      query,
    });

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  useEffect(() => {
    if (open && defaultTechnician) {
      setQueryView(
        `${defaultTechnician.userAccount.firstName} ${defaultTechnician.userAccount.firstName}`,
      );
    }
  }, [open]);

  useEffect(() => {
    if (open && getFormValues) {
      getFormValues(formik.values);
    }
  }, [formik, open]);

  useEffect(() => {
    if (open && getFormErrors) {
      getFormErrors(formik.errors);
    }
  }, [formik, open]);

  useEffect(() => {
    if (getSwitchState) {
      getSwitchState(switchActive);
    }
  }, [switchActive]);

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Dialog
        open={open || false}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component="div">
            <Autocomplete
              size="small"
              clearOnBlur={false}
              disablePortal
              id="combo-box-demo"
              sx={{minWidth: 500, mt: '0.5em'}}
              options={techniciansResource.data}
              onChange={(event: any, newValue: EmployeesView | null) =>
                formik.setValues({
                  ...formik.values,
                  technicianId: newValue?.id || null,
                })
              }
              getOptionLabel={(option) =>
                `${option.userAccount.firstName} ${option.userAccount.lastName}`
              }
              onInputChange={onInputChange}
              inputValue={queryView}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Assign To')}
                  name="technicianId"
                  error={!!formik.errors.technicianId}
                  helperText={formik.errors.technicianId}
                />
              )}
            />

            {showSwitch ? (
              <Box sx={{mt: '1.5em', width: '55%'}}>
                <Switch
                  getValue={(value) => setSwitchActive(value)}
                  label="Choose a fixed date and time"
                />
              </Box>
            ) : null}

            {switchActive ? (
              <Box
                sx={{
                  mt: '1.5em',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                <DatePicker
                  defaultDate={defaultStartDate}
                  containerStyles={{mr: '1em'}}
                  getSelectedDate={(date) => {
                    formik.setValues({
                      ...formik.values,
                      date,
                    });
                  }}
                  textFieldProps={{
                    label: t(datePickerLabel),
                    name: 'date',
                    helperText:
                      formik.errors.date && formik.touched.date
                        ? formik.errors.date
                        : '',
                    error: !!(formik.errors.date && formik.touched.date),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={defaultStartDate}
                  containerStyles={{mr: '1em'}}
                  getSelectedTime={(time) => {
                    formik.setValues({
                      ...formik.values,
                      startTime: time,
                    });
                  }}
                  textFieldProps={{
                    label: 'Start Time',
                    name: 'startTime',
                    helperText:
                      formik.errors.startTime && formik.touched.startTime
                        ? formik.errors.startTime
                        : '',
                    error: !!(
                      formik.errors.startTime && formik.touched.startTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={defaultEndDate}
                  getSelectedTime={(time) => {
                    // setSelectedEndTime(time)
                    formik.setValues({
                      ...formik.values,
                      endTime: time,
                    });
                  }}
                  textFieldProps={{
                    label: 'End Time',
                    name: 'endTime',
                    helperText:
                      formik.errors.endTime && formik.touched.endTime
                        ? formik.errors.endTime
                        : '',
                    error: !!(formik.errors.endTime && formik.touched.endTime),
                    onBlur: formik.handleBlur,
                  }}
                />
              </Box>
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mt: '1.5em'}}>
          <Button
            buttonProps={{
              onClick: onCancel,
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('Cancel')}
            </Typography>
          </Button>
          <Button
            buttonProps={{
              onClick: onSave,
              autoFocus: true,
              disabled: disableSaveBtn,
            }}>
            <Typography variant="subtitle2">{t('Save')}</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
