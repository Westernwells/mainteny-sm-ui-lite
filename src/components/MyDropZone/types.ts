import {FileWithPreview} from 'models/files';
import {FileRejection} from 'react-dropzone';

export enum DropzoneVariant {
  INLINE = 'INLINE',
  WRAPPER = 'WRAPPER',
  DIALOG = 'DIALOG',
}

export type WrapperProps = {
  variant?: DropzoneVariant;
  existingFiles?: FileWithPreview[];
  hint?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  cropperTitle?: string;
  isCropped?: boolean;
  isWrapper?: boolean;
  clearFilesAfterSubmit?: boolean;
  bgColor?: string;
  getAcceptedFiles?: (val: FileWithPreview[]) => void;
  getRejectedFileWithErrors?: (val: FileRejection[]) => void;
  onFileDialogCancel?: () => void;
};
