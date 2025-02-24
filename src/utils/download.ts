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

export const downloadExcel = ({
  excelContent,
  filename,
}: {
  excelContent: string;
  filename: string;
}) => {
  const blob = new Blob([excelContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const formattedDate = format(new Date(), 'ddMMyy');
  link.download = `${filename}_${formattedDate}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

type DownloadFileWithCustomNameProps = {
  downloadUrl: string;
  fileName?: string | undefined | number;
  extension?: 'pdf' | 'xml';
};

/**
 * Asynchronous function to download file from given source
 *
 * @param {string} fileName - The file name.
 * @param {string} downloadUrl - The URL to download the file from.
 * @param {string} [extension='pdf'] - The file extension (default is 'pdf')
 */
export const downloadFile = async ({
  fileName,
  downloadUrl,
  extension,
}: DownloadFileWithCustomNameProps) => {
  const fileExtension = extension || 'pdf';
  let finalFileName = fileName || 'Unassigned';
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Set the file name
    const date = new Date();
    const formattedDate = `${date.getFullYear().toString().substr(-2)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const ext = fileExtension;

    finalFileName = fileName
      ? `${fileName}_${formattedDate}.${ext}`
      : `Unassigned_${formattedDate}.${ext}`;

    link.download = finalFileName;

    link.target = '_blank';
    link.click();
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};
