import {useParams} from 'react-router-dom';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {FormInput} from 'components/form/FormInput';
import {useCreateTodo} from 'hooks/reactQuery/useElevator';
import {ElevatorCommentRecord} from 'models/elevator';
import {useTranslation} from 'react-i18next';

export const NewTodoForm = () => {
  const {t} = useTranslation();
  const {id: elevatorId} = useParams();

  const {mutate: createTodo} = useCreateTodo();

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
  });
  const formik = useFormik<ElevatorCommentRecord>({
    initialValues: {
      subject: '',
      content: '',
    },
    onSubmit: (values, {resetForm}) => {
      if (elevatorId) {
        createTodo({elevatorId, data: values});
        resetForm();
      }
    },
    validationSchema,
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack gap="1em">
        <FormInput
          fieldProps={{
            label: 'Subject',
            id: 'subject',
            name: 'subject',
            value: formik.values.subject,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            error: !!(formik.touched.subject && formik.errors.subject),
            helperText: formik.touched.subject && formik.errors.subject,
            required: true,
          }}
        />
        <FormInput
          fieldProps={{
            label: 'Description',
            id: 'content',
            name: 'content',
            value: formik.values.content,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            error: !!(formik.touched.content && formik.errors.content),
            helperText: formik.touched.content && formik.errors.content,
            multiline: true,
            minRows: 4,
            maxRows: 6,
          }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={!formik.values.subject.length || !formik.isValid}
          fullWidth>
          {t('Save')}
        </Button>
      </Stack>
    </Box>
  );
};
