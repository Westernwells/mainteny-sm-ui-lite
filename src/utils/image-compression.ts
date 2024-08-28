/* global BlobPart */

import imageCompression from 'browser-image-compression';
import {EImageType, compressAccurately} from 'image-conversion';
import heic2any from 'heic2any';

export const convertHEICToJPEG = async (file: File) => {
  const jpegBlob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.8, // Adjust quality as needed
  });

  // Convert the Blob to a File to maintain consistency with the original file structure
  const jpegFile = new File(
    [jpegBlob as never as BlobPart],
    file.name.replace(/\.heic$/i, '.jpeg'),
    {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    },
  );

  return jpegFile;
};

export const convertWebPToJPEG = async (file: File) => {
  const jpegBlob = await compressAccurately(file, {
    size: file.size / 1024, // target size in KB, can adjust if needed
    type: EImageType.JPEG, // target format
    accuracy: 0.95, // accuracy of the compression
  });

  const jpegFile = new File(
    [jpegBlob],
    file.name.replace(/\.webp$/i, '.jpeg'),
    {
      type: 'image/jpeg',
      lastModified: Date.now(),
    },
  );

  return jpegFile;
};

export const resizeImageToTargetSize = async (
  file: File,
  targetSizeInBytes: number,
) => {
  // Convert HEIC to JPEG (if needed, assuming you have a conversion function)
  if (file.type === 'image/heic') {
    file = await convertHEICToJPEG(file);
  }

  if (file.type === 'image/webp') {
    file = await convertWebPToJPEG(file);
  }

  if (file.size <= targetSizeInBytes) {
    return file;
  }

  const options = {
    maxSizeMB: targetSizeInBytes / 1024 / 1024, // Convert bytes to MB
    maxWidthOrHeight: 1000,
    useWebWorker: true,
  };

  const resizedFile = await imageCompression(file, options);

  return resizedFile;
};
