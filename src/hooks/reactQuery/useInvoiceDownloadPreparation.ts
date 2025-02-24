import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCallback, useMemo} from 'react';
import {InvoiceView} from 'models/invoice';
import {formatDate} from 'utils/datetime';
import {useFetchXInvoiceByInvoiceId} from 'hooks/reactQuery/useInvoice';
import {StringValueResponse} from 'models/misc';
import {CLIENT_STORAGE_PDF_TEMPLATE_KEY} from 'utils/constants';

/*
 * hook that return invoice functions to fetch or aggregate data needed for the pdf generation, downloading or printing
 * */
const useInvoiceDownloadPreparation = () => {
  const {user} = useUserSession();

  const {mutateAsync: getXInvoiceByInvoiceId} = useFetchXInvoiceByInvoiceId();

  const {data: clientStorageDataTemplate} = useQueryClientStorageData({
    serviceCompanyId: user?.userAccount.serviceCompany.id!,
    params: {key: CLIENT_STORAGE_PDF_TEMPLATE_KEY},
  });

  const {headerInfo, footerInfo} = useMemo(() => {
    const parsedData = JSON.parse(clientStorageDataTemplate?.value || '{}');
    return {
      headerInfo: parsedData.header,
      footerInfo: parsedData.footer,
    };
  }, [clientStorageDataTemplate?.value]);

  const {refetch: refetchHeader} = useDownloadUrl(
    headerInfo?.path ? [headerInfo?.path] : [],
    undefined,
    user?.userAccount.serviceCompany.id,
  );

  const {refetch: refetchFooter} = useDownloadUrl(
    footerInfo?.path ? [footerInfo?.path] : [],
    undefined,
    user?.userAccount.serviceCompany.id,
  );

  const generateXML = async (
    invoice: InvoiceView,
    companyNextNumber: StringValueResponse | undefined,
  ) => {
    const response = await getXInvoiceByInvoiceId({
      invoiceId: invoice.id,
      params: {
        dueDate: invoice.dueDate!,
        sentDate: invoice.sentDate ?? formatDate(new Date(), 'yyyy-MM-dd')!,
        externalId: invoice.externalId ?? companyNextNumber?.value!,
      },
    });

    const xmlBlob = new Blob([response], {type: 'application/xml'});

    return URL.createObjectURL(xmlBlob!);
  };

  const fetchInvoiceInfo = useCallback(async () => {
    const {data: headerUrl = {}, isLoading: isHeaderUrlLoading} =
      await refetchHeader();
    const {data: footerUrl = {}, isLoading: isFooterUrlLoading} =
      await refetchFooter();

    return {
      headerUrl,
      headerInfo,
      isHeaderUrlLoading,
      footerUrl,
      footerInfo,
      isFooterUrlLoading,
    };
  }, [
    clientStorageDataTemplate,
    headerInfo,
    refetchHeader,
    footerInfo,
    refetchFooter,
  ]);

  return {fetchInvoiceInfo, generateXML};
};

export default useInvoiceDownloadPreparation;
