import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {getIn, useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {PageCard} from 'components/PageCard';
import {Button} from 'components/Button';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {FormSelect} from 'components/form/FormSelect';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import {IconButton} from '@mui/material';

const createEmptyItem = () => ({technicianId: '', priority: 1});

const technicianSchema = Yup.object({
  technicianId: Yup.string().required('Technician ID is required'),
  priority: Yup.number(),
});

const validationSchema = Yup.object({
  engineers: Yup.array().of(technicianSchema),
});

interface Props {
  getEngineersFormErrors?: (val: any) => void;
  getEngineersFormValues?: (val: any) => void;
  initialValues?: {engineers: PriorityTechnicianFormModel[]};
}

export const PriorityEngineersForm = ({
  getEngineersFormErrors,
  getEngineersFormValues,
  initialValues,
}: Props) => {
  const {t} = useTranslation();

  const [engineerForms, setEngineerForms] = useState<
    PriorityTechnicianFormModel[]
  >(initialValues?.engineers!);

  const formik = useFormik<{engineers: PriorityTechnicianFormModel[]}>({
    initialValues: {
      engineers: engineerForms,
    },
    validationSchema,
    onSubmit: () => {},
  });

  const addEngineerForm = () => {
    setEngineerForms((prevForms) => [...prevForms, createEmptyItem()]);
    formik.setFieldValue(
      'engineers',
      [...formik.values.engineers, createEmptyItem()],
      true,
    );
  };

  const removeEngineerForm = (index: number) => {
    setEngineerForms((prevForms) => prevForms.filter((_, i) => i !== index));
    formik.setFieldValue(
      'engineers',
      formik.values.engineers.filter((_, i) => i !== index),
      true,
    );
  };

  useEffect(() => {
    if (getEngineersFormErrors) {
      getEngineersFormErrors(formik.errors);
    }

    if (getEngineersFormValues) {
      getEngineersFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Priority Technicians"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          {formik.values.engineers.map((engineer, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={5.5} md={5.5}>
                <TechnicianAutoComplete
                  getTechnician={(value) => {
                    formik.setFieldValue(
                      `engineers[${index}].technicianId`,
                      value?.id || '',
                    );
                  }}
                  textFieldProps={{
                    sx: {
                      label: t('Assign To'),
                    },
                    onBlur: formik.handleBlur,
                    error: !!getIn(formik.errors, `engineers[${index}]`),
                    helperText: formik.errors.engineers
                      ? getIn(formik.errors, `engineers[${index}].technicianId`)
                      : '',
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={5.5} md={5.5}>
                <FormSelect
                  labelId="priority-label"
                  label="Priority"
                  options={[1, 2, 3].map((value) => ({
                    label: value.toString(),
                    value: value.toString(),
                  }))}
                  selectProps={{
                    id: `priority-${index}`,
                    name: `engineers[${index}].priority`,
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                    value:
                      formik.values.engineers[index]?.priority?.toString() ||
                      '',
                  }}
                  selectStyles={{
                    '& .MuiSelect-select': {
                      py: 1.2,
                      typography: 'body2',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={1} md={1}>
                <IconButton
                  onClick={() => removeEngineerForm(index)}
                  sx={{
                    padding: '0px !important',
                    width: '25%',
                    verticalAlign: '-webkit-baseline-middle',
                    borderRadius: '0px !important',
                  }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>

        <Button
          label="Add Engineer"
          buttonProps={{
            variant: 'outlined',
            sx: {alignSelf: 'self-start', background: 'inherit', mt: 4},
            startIcon: <AddIcon />,
            onClick: () => addEngineerForm(),
          }}
        />
      </Box>
    </PageCard>
  );
};
