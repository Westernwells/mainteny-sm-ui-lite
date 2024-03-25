import {grey} from '@mui/material/colors';
import {useFormik} from 'formik';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
import {PageCard} from 'components/PageCard';
import {ElevatorView} from 'models/elevator';
import {EmployeesView} from 'models/employee';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormLabel} from 'components/form/FormLabel';
import {AssignmentDescriptionOrderModel} from 'models/service-order';
import {TimePicker} from 'components/TimePicker';
import {setDateTime, toRestDateTime} from 'utils/datetime';
import {RadioOptions} from './models';
import {Summary, SummaryItem} from './Summary';

interface Props {
  getDescriptionValues?: (val: AssignmentDescriptionOrderModel) => void;
  initialValues: AssignmentDescriptionOrderModel;
  getDescription?: (val: string) => void;
  initialDescription?: string;
  selectedUnit?: ElevatorView;
  selectedTechnicians?: EmployeesView[];
  selectedDateString?: string;
  selectedTimeString?: string;
  selectedRadioOption?: string;
}

export const AddDescription = ({
  getDescriptionValues,
  initialValues,
  getDescription,
  initialDescription = '',
  selectedUnit,
  selectedTechnicians = [],
  selectedDateString,
  selectedTimeString,
  selectedRadioOption,
}: Props) => {
  const {t} = useTranslation();
  const [description, setDescription] = useState(initialDescription);

  const formik = useFormik<AssignmentDescriptionOrderModel>({
    initialValues: {
      callTime: initialValues?.callTime || '',
      callerName: initialValues?.callerName || '',
      purchaseOrderNumber: initialValues?.purchaseOrderNumber || '',
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getDescription) {
      getDescription(description);
    }
  }, [description]);

  useEffect(() => {
    if (getDescriptionValues) {
      getDescriptionValues(formik.values);
    }
  }, [formik]);

  return (
    <>
      <Typography variant="h6" pb={2}>
        {t('Description')}
      </Typography>

      {selectedUnit ? (
        <Summary label="Selected Unit">
          <SummaryItem value={selectedUnit?.model || ''} />
          <SummaryItem value={selectedUnit?.propertyOwner?.name || ''} />
          <SummaryItem value={selectedUnit?.address?.fullName || ''} />
        </Summary>
      ) : null}

      {selectedTechnicians.length ? (
        <Summary label="Selected Technician" containerStyle={{mt: '1em'}}>
          {selectedTechnicians.map((item) => (
            <SummaryItem
              key={item.id}
              value={`${item.userAccount.firstName} ${item.userAccount.lastName}`}
            />
          ))}
        </Summary>
      ) : null}

      {(selectedDateString || selectedTimeString) &&
      selectedRadioOption !== RadioOptions.IMMEDIATE ? (
        <Summary label="Selected Date & Time" containerStyle={{mt: '1em'}}>
          {selectedDateString ? (
            <SummaryItem
              value={`${selectedDateString} ${
                selectedTimeString ? ` at ${selectedTimeString}` : ''
              }`}
              containerStyle={{display: 'inline-block'}}
            />
          ) : null}
        </Summary>
      ) : null}

      <PageCard containerStyles={{mt: '2em'}}>
        <Grid container spacing={2} mb={3} sx={{alignItems: 'center'}}>
          <Grid item md={3}>
            <FormLabel text="Purchase order number" />
            <FormInput
              props={{
                value: formik.values.purchaseOrderNumber,
                placeholder: t('123456789'),
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('purchaseOrderNumber', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={3}>
            <FormLabel text="Caller" />
            <FormInput
              props={{
                value: formik.values.callerName,
                placeholder: t('Name Surname'),
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('callerName', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={1.5} mb={-3}>
            <TimePicker
              defaultTime={
                formik.values.callTime
                  ? setDateTime(new Date(), formik.values.callTime)
                  : undefined
              }
              containerStyles={{mr: '1em'}}
              getSelectedTime={(time) => {
                if (time && !Number.isNaN(time.getTime())) {
                  const today = new Date();

                  const hours = time.getHours();
                  const minutes = time.getMinutes();
                  const seconds = time.getSeconds();

                  today.setHours(hours, minutes, seconds);

                  formik.setFieldValue('callTime', toRestDateTime(today));
                }
              }}
              textFieldProps={{
                label: t('Call Time'),
                name: 'callTime',
                helperText:
                  formik.errors.callTime && formik.touched.callTime
                    ? formik.errors.callTime
                    : '',
                error: !!(formik.errors.callTime && formik.touched.callTime),
                onBlur: formik.handleBlur,
              }}
            />
          </Grid>
        </Grid>

        <Grid container mb={1}>
          <FormLabel text="Description" />
          <FormInput
            props={{
              sx: {background: grey[50], border: 'none'},
              value: description,
              multiline: true,
              maxRows: 8,
              placeholder: t('Please describe what happened'),
              size: 'medium',
              fullWidth: true,
              type: 'text',
              onChange: (e) => setDescription(e.target.value),
            }}
          />
        </Grid>
      </PageCard>
    </>
  );
};
