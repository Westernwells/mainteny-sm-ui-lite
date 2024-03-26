import {useFormik} from 'formik';
import {Box} from '@mui/material';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ElevatorView} from 'models/elevator';
import {EmployeesView} from 'models/employee';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AssignmentDescriptionOrderModel} from 'models/service-order';
import {TimePicker} from 'components/TimePicker';
import {setDateTime, toRestDateTime} from 'utils/datetime';
import {ReactComponent as LiftIcon} from 'assets/icons/Lift-1.svg';
import {ReactComponent as FieldServiceIcon} from 'assets/icons/FieldService.svg';
import {ReactComponent as CalendarInformationIcon} from 'assets/icons/CalendarInformation.svg';
import {Summary, SummaryItem} from './Summary';

interface Props {
  getDescriptionValues?: (val: AssignmentDescriptionOrderModel) => void;
  initialValues: AssignmentDescriptionOrderModel;
  getDescription?: (val: string) => void;
  initialDescription?: string;
  selectedUnit: ElevatorView;
  selectedTechnicians?: EmployeesView[];
  selectedDateTimeString?: string;
}

export const AddDescription = ({
  getDescriptionValues,
  initialValues,
  getDescription,
  initialDescription = '',
  selectedUnit,
  selectedTechnicians = [],
  selectedDateTimeString,
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
    <Box maxWidth="42rem">
      <Box display="flex" gap={5} pt={3}>
        <Summary
          label="Selected Unit"
          icon={<LiftIcon fontSize="4rem" height="2rem" />}>
          <SummaryItem value={selectedUnit?.externalId || ''} />
          <SummaryItem value={selectedUnit?.externalId || ''} />
          <SummaryItem value={selectedUnit?.model || ''} />
          <SummaryItem value={selectedUnit?.propertyOwner?.name || ''} />
          <SummaryItem value={selectedUnit?.address?.fullName || ''} />
        </Summary>

        {selectedTechnicians.length ? (
          <Summary
            label="Selected Engineer"
            icon={<FieldServiceIcon fontSize="2rem" />}>
            {selectedTechnicians.map((item) => (
              <SummaryItem
                key={item.id}
                value={`${item.userAccount.firstName} ${item.userAccount.lastName}`}
              />
            ))}
          </Summary>
        ) : null}

        {selectedDateTimeString ? (
          <Summary
            label="Selected Date & Time"
            icon={<CalendarInformationIcon fontSize="2rem" />}>
            <SummaryItem
              value={selectedDateTimeString}
              containerStyle={{display: 'inline-block'}}
            />
          </Summary>
        ) : null}
      </Box>
      <Box pt={5}>
        <Grid container alignItems="center" spacing={2} mb={3}>
          <Grid item md={4.5}>
            <FormInput
              props={{
                label: 'Purchase order number',
                value: formik.values.purchaseOrderNumber,
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('purchaseOrderNumber', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={4.5}>
            <FormInput
              props={{
                label: 'Caller',
                value: formik.values.callerName,
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('callerName', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={3}>
            <TimePicker
              defaultTime={
                formik.values.callTime
                  ? setDateTime(new Date(), formik.values.callTime)
                  : undefined
              }
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

        <FormInput
          props={{
            label: 'Description to the engineer',
            value: description,
            multiline: true,
            minRows: 4,
            type: 'text',
            onChange: (e) => setDescription(e.target.value),
          }}
        />
      </Box>
    </Box>
  );
};
