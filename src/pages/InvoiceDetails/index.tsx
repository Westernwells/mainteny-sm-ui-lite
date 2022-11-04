import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useServiceOrderWorkReport} from 'hooks/reactQuery/useServiceOrder';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {ViewInvoice} from './ViewInvoice';

export const InvoiceDetails = () => {
  const {id: invoiceId} = useParams();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);
  const {data: workReport, isLoading: isLoadingWorkReport} =
    useServiceOrderWorkReport(invoice?.serviceOrder?.id ?? '', {
      useErrorBoundary: false,
      retry: false,
      enabled: !!invoice?.serviceOrder?.id,
    });

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [invoice!.additionalInfo.pdfPath] : [],
  );

  if (isLoading || isLoadingWorkReport) {
    return <Progress />;
  }

  return isFetched && invoice ? (
    <ViewInvoice
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      invoice={invoice}
      workReport={workReport!}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};
