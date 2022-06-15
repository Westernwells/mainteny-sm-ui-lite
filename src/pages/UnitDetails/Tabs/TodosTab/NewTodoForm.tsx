import {useParams} from 'react-router';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {FormInput} from 'components/form/FormInput';
import {useCreateTodo} from 'hooks/reactQuery/useElevator';
import {ElevatorCommentRecord} from 'models/elevator';

export const NewTodoForm = () => {
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
      <FormInput
        props={{
          label: 'Subject *',
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
        props={{
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
        Save
      </Button>
    </Box>
  );
};
