import {useState} from 'react';
import _ from 'lodash';
import {
  FileWithPreview,
  MyDropZone,
} from '../../../components/MyDropZone/MyDropzone';
import {Dialog} from '../../../components/Dialog';
import {useUploadFiles} from '../../../hooks/reactQuery/useUploadSignedUrl';
import {FileResourceRecord} from '../../../models/media';

export interface Props {
  title: string;
  successMessage: string;
  hints?: string[];
  uploadPath: string;
  onClose: (files: FileResourceRecord[]) => void;
  onCancel: () => void;
}

export const ArticleImageUploadForm = ({
  title,
  successMessage,
  hints,
  uploadPath,
  onClose,
  onCancel,
}: Props) => {
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const {mutateAsync: uploadImages, isLoading} = useUploadFiles(successMessage);

  const updateImages = async (files: FileWithPreview[]) => {
    if (files.length) {
      await uploadImages({files, uploadPath});
    }
  };

  const save = async () => {
    await updateImages(acceptedFiles);
    const files = _.map(acceptedFiles, (file) => ({
      description: file.name,
      type: file.type,
      uri: uploadPath.concat('/').concat(file.name),
    }));
    onClose(files);
  };

  const cancel = () => {
    onCancel();
  };

  return (
    <Dialog
      title={title}
      isSaving={isLoading}
      disableSaveBtn={!acceptedFiles.length}
      onCancel={() => cancel()}
      onSave={() => save()}
      dialogProps={{
        maxWidth: 'md',
        open: true,
      }}>
      <MyDropZone
        hints={hints}
        acceptedFileTypes="image/*"
        getAcceptedFiles={(files) => {
          setAcceptedFiles(files);
        }}
        getRejectedFileWithErrors={(file) => {
          console.log(file);
        }}
      />
    </Dialog>
  );
};
