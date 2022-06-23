import React, {FC} from 'react';
import {FormikProps} from 'formik';
import {MyDropZone} from 'components/MyDropzone';

interface Props {
  formik: FormikProps<any>;
}

const NewContractDocuments: FC<Props> = ({formik}) => (
    <MyDropZone
      hints={[
        'JPEG, PNG, BMP, GIF, WEBP, SVG only',
        'File size less than 5MB only',
        'Max 5 files',
      ]}
      acceptedFileTypes="*"
      getAcceptedFiles={(files) => formik.setFieldValue('documents', files)}
    />
  );

export default NewContractDocuments;
