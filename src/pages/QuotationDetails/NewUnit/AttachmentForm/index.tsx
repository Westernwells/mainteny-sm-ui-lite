import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikValues, useFormik} from 'formik';
import {AttachmentFormModel} from 'models/unitForm';
import {PageCard} from 'components/PageCard';
import {MyDropZone} from 'components/MyDropZone/MyDropzone';
import {useEffect} from 'react';

interface Props {
  getAttachmentFormErrors?: (val: FormikErrors<AttachmentFormModel>) => void;
  getAttachmentFormValues?: (val: FormikValues) => void;
  initialValues?: AttachmentFormModel;
}

export const AttachmentForm = ({
  getAttachmentFormErrors,
  getAttachmentFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<AttachmentFormModel>({
    initialValues: {
      documents: initialValues?.documents || [],
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getAttachmentFormErrors) {
      getAttachmentFormErrors(formik.errors);
    }

    if (getAttachmentFormValues) {
      getAttachmentFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Notes, Pictures and Attachments"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} width="100%">
            <MyDropZone
              hint="PDF, DOCX, XLSX, XLS, CSV, TSV, JPEG, PNG, BMP, GIF, WEBP or SVG"
              acceptedFileTypes={[
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/tab-separated-values',
                'text/csv',
                'image/png',
                'image/jpeg',
                'image/bmp',
                'image/gif',
                'image/webp',
                'image/svg+xml',
              ]}
              getAcceptedFiles={(files) => {
                formik.setFieldValue('documents', files);
              }}
              maxFiles={4}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
