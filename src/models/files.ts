import {FileWithPath} from 'react-dropzone';

export interface FileWithPreview extends FileWithPath {
  preview: string;
  description?: string;
  uri?: string;
  contentId?: string;
}

export interface MappedFile extends FileWithPreview {
  uri: string;
  description: string;
}

export type FileErrors = {
  type: boolean;
  size: boolean;
};
