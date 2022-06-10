/* eslint-disable */
import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikProps, FormikValues, useFormik} from 'formik';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect, useState} from 'react';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {Button} from 'components/Button';
import {TechnicianView} from 'models/technician';

export interface AddPriorityTechnicianFormModel {
  [key: string]: string;
}

interface Props {
  getPriorityTechnicianFormErrors?: (
    val: FormikErrors<AddPriorityTechnicianFormModel>,
  ) => void;
  getPriorityTechnicianFormValues?: (val: FormikValues) => void;
  initialValues?: AddPriorityTechnicianFormModel;
  initialTechniciansValueMap?: {[key: string]: TechnicianView | null};
  getTechnicianMapValue?: (val?: {
    [key: string]: TechnicianView | null;
  }) => void;
}

export const PriorityTechnicianForm = ({
  getPriorityTechnicianFormErrors,
  getPriorityTechnicianFormValues,
  initialValues,
  initialTechniciansValueMap,
  getTechnicianMapValue,
}: Props) => {
  const theme = useTheme();
  const [techniciansValueMap, setTechnicianValueMap] = useState(
    initialTechniciansValueMap,
  );
  const [numOfTechnicians, setNumOfTechnicians] = useState(
    initialValues
      ? Array.from(
          {length: Object.keys(initialValues).length / 2},
          (_, i) => i + 1,
        )
      : [1],
  );
  const formik = useFormik<AddPriorityTechnicianFormModel>({
    initialValues: initialValues || {
      technicianId_1: '',
      priority_1: '',
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getPriorityTechnicianFormErrors) {
      getPriorityTechnicianFormErrors(formik.errors);
    }

    if (getPriorityTechnicianFormValues) {
      getPriorityTechnicianFormValues(formik.values);
    }
  }, [formik]);

  useEffect(() => {
    if (getTechnicianMapValue) {
      getTechnicianMapValue(techniciansValueMap);
    }
  }, [techniciansValueMap]);

  return (
    <PageCard
      headerLabel="Priority Technicians"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        {numOfTechnicians.map((item) => (
          <Grid container columnSpacing={2} key={item}>
            <Grid item md={4}>
              <TechnicianAutoComplete
                getTechnician={(value) => {
                  formik.setValues({
                    ...formik.values,
                    [`technicianId_${item}`]: value ? value.id : '',
                  });
                  if (value) {
                    setTechnicianValueMap({
                      ...techniciansValueMap,
                      [`technicianId_${item}`]: value,
                    });
                  }
                }}
                initialValue={
                  (initialTechniciansValueMap &&
                    initialTechniciansValueMap[`technicianId_${item}`]) ||
                  null
                }
                // initialValue={formik.values.technician}
                textFieldProps={{
                  error: !!(
                    formik.errors.technicianId && formik.touched.technicianId
                  ),
                  helperText:
                    formik.errors.technicianId && formik.touched.technicianId
                      ? formik.errors.technicianId
                      : '',
                  label: 'Technicians Name',
                  name: `technicianId_${item}`,
                  onBlur: formik.handleBlur,
                }}
              />
            </Grid>

            <Grid item md={4}>
              <FormInput
                props={{
                  size: 'small',
                  placeholder: 'e.g 1',
                  label: 'Priority',
                  name: `priority_${item}`,
                  value: formik.values[`priority_${item}`],
                  onChange: formik.handleChange,
                  helperText: formik.errors.priority,
                  error: !!formik.errors.priority,
                  onBlur: formik.handleBlur,
                  required: true,
                }}
              />
            </Grid>
          </Grid>
        ))}

        <Button
          label="+ Add"
          buttonProps={{
            variant: 'outlined',
            onClick: () => {
              setNumOfTechnicians([
                ...numOfTechnicians,
                numOfTechnicians.length + 1,
              ]);
              formik.setValues({
                ...formik.values,
                [`technicianId_${numOfTechnicians.length + 1}`]: '',
                [`priority_${numOfTechnicians.length + 1}`]: '',
              });
            },
            sx: {
              color: theme.palette.info.dark,
            },
          }}
        />
      </Box>
    </PageCard>
  );
};
