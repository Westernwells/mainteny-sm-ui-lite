import React, {FC} from 'react';
import {FormikProps} from 'formik';
import {MyDropZone} from 'components/MyDropZone/MyDropzone';

interface Props {
  formik: FormikProps<any>;
}

const NewContractDocuments: FC<Props> = ({formik}) => (
  <MyDropZone
    hint="PDF, DOCX, XLSX, XLS, CSV or TSV"
    acceptedFileTypes={[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/tab-separated-values',
      'text/csv',
    ]}
    getAcceptedFiles={(files) => formik.setFieldValue('documents', files)}
    maxFiles={1}
  />
);

export default NewContractDocuments;
