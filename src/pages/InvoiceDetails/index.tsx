import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus} from 'models/invoice';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {Invoice} from './Invoice';
import {EditInvoice} from './EditInvoice';

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
    return <EditInvoice invoice={invoice} />;
  }

  return isFetched && invoice && invoice.status !== InvoiceStatus.DRAFT ? (
    <Invoice
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      invoice={invoice}
    />
  ) : (
    <EmptySection label="Invoice not found!" />
  );
};
