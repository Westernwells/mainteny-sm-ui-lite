import React, {FC} from 'react';
import {FormikProps} from 'formik';
import {MyDropZone} from 'components/MyDropzone';

interface Props {
  formik: FormikProps<any>;
}

const NewContractDocuments: FC<Props> = ({formik}) => (
  <MyDropZone
    hints={['PDF, DOCX, XLSX, XLS, CSV, TSV only', 'Max 5 files']}
    acceptedFileTypes="application/pdf"
    getAcceptedFiles={(files) => formik.setFieldValue('documents', files)}
  />
);

export default NewContractDocuments;
