import {FormikProps} from 'formik';
import Stack from '@mui/material/Stack';
import {FormInput} from 'components/form/FormInput';
import {ElevatorCommentRecord} from 'models/elevator';

interface Props {
  formik: FormikProps<ElevatorCommentRecord>;
}

export const EditTodoForm = ({formik}: Props) => (
  <Stack gap="2em" py="1em">
    <FormInput
      props={{
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
  </Stack>
);
