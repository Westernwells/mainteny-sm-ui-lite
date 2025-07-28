import {FileWithPreview} from 'models/files';

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // 'PB', 'EB', 'ZB', 'YB'

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

// If uploaded file is in a folder will return the virtual path, if it is just a file will return undefined
export const getVirtualPath = (
  file: FileWithPreview,
  compressedFile: File,
): string | undefined => {
  const filePath = file.relativePath || file.path || file.name;

  const pathParts = filePath.split('/').filter((part) => part.length > 0);

  if (pathParts.length === 0) return undefined;

  const removedPrefixFolder = filePath.startsWith('/')
    ? filePath.substring(1)
    : filePath;
  const updatedName = removedPrefixFolder.split('/');

  if (compressedFile) {
    updatedName.splice(updatedName.length - 1, 1, compressedFile.name);
  }

  return updatedName.join('/');
};

export const isFileWithoutFolders = (file: FileWithPreview): boolean => {
  const filePath = file.relativePath || file.path || file.name;

  if (filePath.startsWith('./')) {
    return true;
  }

  const pathParts = filePath.split('/').filter((part) => part.length > 0);

  return pathParts.length === 1;
};
