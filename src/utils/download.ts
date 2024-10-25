import JSZip from 'jszip';
import * as Sentry from '@sentry/react';
import {format} from 'date-fns';
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

export const downloadCsv = ({
  csvContent,
  filename,
}: {
  csvContent: string;
  filename: string;
}) => {
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const formattedDate = format(new Date(), 'ddMMyy');
  link.download = `${filename}_${formattedDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
