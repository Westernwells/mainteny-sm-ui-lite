import JSZip from 'jszip';
import * as Sentry from '@sentry/react';
import {download} from 'hooks/reactQuery/useAnalytics';
import {fetchInvoice} from 'hooks/reactQuery/useInvoice';

export const downloadAndZipFiles = async (
  filesToDownload: {url: string; invoiceId: string}[],
  zipFileName: string,
): Promise<void> => {
  try {
    const zip = new JSZip();

    if (filesToDownload.length) {
      await Promise.all(
        filesToDownload.map(async (file) => {
          // Extract the invoice ID from the file name
          const {invoiceId} = file;

          const invoiceDetails = await fetchInvoice(invoiceId);

          const finalFileName = invoiceDetails?.externalId
            ? `${invoiceDetails.externalId}.pdf`
            : `${invoiceId}.pdf`;

          const pdfBlob = await fetch(file.url).then((res) => res.blob());

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
