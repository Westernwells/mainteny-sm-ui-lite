import JSZip from 'jszip';
import * as Sentry from '@sentry/react';
import {download} from 'hooks/reactQuery/useAnalytics';

export const downloadAndZipFiles = async (
  pdfUrlsArray: [string, string][],
  zipFileName: string,
): Promise<void> => {
  try {
    const zip = new JSZip();

    if (pdfUrlsArray.length) {
      await Promise.all(
        pdfUrlsArray.map(async ([fileName, pdfUrl]) => {
          const pdfBlob = await fetch(pdfUrl).then((res) => res.blob());
          const finalFileName =
            fileName.split('/').pop() || `file_${Date.now()}.pdf`;
          zip.file(finalFileName, pdfBlob);
        }),
      );

      const zipBlob = await zip.generateAsync({type: 'blob'});
      download(zipBlob, zipFileName, '.zip');
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};
