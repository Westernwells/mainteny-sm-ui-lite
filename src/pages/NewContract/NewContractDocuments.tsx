import React, {FC} from 'react';
import {FormikProps} from 'formik';
import MyDropzone from 'components/MyDropZone';

interface Props {
  formik: FormikProps<any>;
}

const NewContractDocuments: FC<Props> = ({formik}) => (
  <MyDropzone
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
