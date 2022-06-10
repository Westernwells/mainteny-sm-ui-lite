/* eslint-disable */
import {useState} from 'react';
import {PageCard} from 'components/PageCard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {NotesFormModel} from 'models/unitForm';
import Divider from '@mui/material/Divider';
import {FileWithPreview, MyDropZone} from 'components/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {NotesForm} from './NotesForm';

interface Props {
  getAcceptedPictureFiles?: (val: FileWithPreview[]) => void;
  getAcceptedDocumentFiles?: (val: FileWithPreview[]) => void;
}

const validationSchema = Yup.object().shape({
  note: Yup.object().nullable().required('Address is required'),
});

export const Attachments = ({
  getAcceptedPictureFiles,
  getAcceptedDocumentFiles,
}: Props) => {
  const [acceptedPictureFiles, setAcceptedPictureFiles] = useState<
    FileWithPreview[]
  >([]);
  const [acceptedDocumentFiles, setAcceptedDocumentFiles] = useState<
    FileWithPreview[]
  >([]);
  const {user} = useUserSession();
  const {mutateAsync: uploadImages} = useUploadFiles(
    'Image uploaded successfully',
  );
  const formik = useFormik<NotesFormModel>({
    initialValues: {
      note: '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    // const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/images`;
    // await uploadImages({files: acceptedFiles, uploadPath});
    // if (elevatorRequestBody) {
    //   await updateElevator({
    //     body: {
    //       ...elevatorRequestBody,
    //       pictures: [
    //         ...(elevatorRequestBody.pictures as FileResourceRecord[]),
    //         ...acceptedFiles.map((item) => ({
    //           description: '',
    //           type: item.type,
    //           uri: `${uploadPath}/${item.name}`,
    //         })),
    //       ],
    //     },
    //     elevatorId: elevator.id,
    //   });
    // }

    // setOpenDialog(false);
  };

  return (
    <PageCard
      containerStyles={{
        flexGrow: 1,
        pt: '1em',
        display: 'flex',
        flexDirection: 'column',
      }}
      contentContainerStyles={{flexGrow: 1, overflowY: 'scroll', height: 0}}>
      <Box sx={{width: '70%'}}>
        <Typography variant="h6" mb="0.5em">
          Notes
        </Typography>
        <NotesForm formik={formik} />
      </Box>
      <Divider light sx={{mt: '1.5em', mb: '1em'}} />

      <Box sx={{width: '80%'}}>
        <Box>
          <Typography variant="h6" sx={{my: '1em'}}>
            Pictures
          </Typography>
          <MyDropZone
            getAcceptedFiles={(files) => {
              if (getAcceptedPictureFiles) {
                getAcceptedPictureFiles(files);
              }
              // setAcceptedFiles(files);
            }}
          />
        </Box>

        <Divider light sx={{mt: '1.5em', mb: '1em'}} />

        <Box>
          <Typography variant="h6" sx={{my: '1em'}}>
            Documents
          </Typography>
          <MyDropZone
            getAcceptedFiles={(files) => {
              if (getAcceptedDocumentFiles) {
                getAcceptedDocumentFiles(files);
              }
            }}
            // acceptedFileTypes='text/*'
            // mimeTypes="application/pdf"
          />
        </Box>
      </Box>
    </PageCard>
  );
};
