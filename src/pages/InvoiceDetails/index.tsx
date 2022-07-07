import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus} from 'models/invoice';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {ViewInvoice} from './ViewInvoice';
import {DraftInvoice} from './DraftInvoice';

export const InvoiceDetails = () => {
  const {id: invoiceId} = useParams();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [invoice!.additionalInfo.pdfPath] : [],
  );

  if (isLoading) {
    return <Progress />;
  }

  if (isFetched && invoice && invoice.status === InvoiceStatus.DRAFT) {
    return <DraftInvoice invoice={invoice} />;
  }

  return isFetched && invoice && invoice.status !== InvoiceStatus.DRAFT ? (
    <ViewInvoice
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      invoice={invoice}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};
