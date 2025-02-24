import {useTranslation} from 'react-i18next';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import Typography from '@mui/material/Typography';
import {useFetchServiceOrderInvoices} from 'hooks/reactQuery/useInvoice';
import {InfoCard} from 'components/InfoCard';
import Box from '@mui/material/Box';
import {getDataGridHeight} from 'utils/utils';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {useFormatDate} from 'hooks/useFormatDate';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {StatusChip} from 'components/StatusChip';
import {
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
} from 'models/service-order';
import {InvoiceStatus, InvoiceType} from 'models/invoice';
import {calculateGrossInvoiceTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
import {useCompanyNextNumber} from 'hooks/reactQuery/useCompanies';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {ServiceCompanyNumberType} from 'models/service-company';
import {getServiceOrderPaymentStatusStyles} from 'utils/service-order-utils';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import XMLViewer from 'react-xml-viewer';
import useInvoiceDownloadPreparation from 'hooks/reactQuery/useInvoiceDownloadPreparation';
import CreateNewInvoiceModal from './CreateNewInvoiceModal';
import {columns, makeRows} from './InvoicesDataGridProps';

interface Props {
  serviceOrderId: string;
  paymentStatus?:
    | ServiceOrderPaymentStatus
    | ServiceOrderPaymentWithIndicationStatus;
}

export const Invoices = ({serviceOrderId, paymentStatus}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [xmlHtmlContent, setXmlHtmlContent] = useState(''); // to insure that the xml container element will not disappear when entry is update on print
  const memorizedRows = useMemo(
    () => rows.filter((item) => item.status !== InvoiceStatus.CANCELLED),
    [rows],
  );

  let totalInvoiceRef = useRef(0).current;

  const {fetchInvoiceInfo} = useInvoiceDownloadPreparation(); // make fetching info singleton to remove multiple calls

  const paymentStatusStyles = getServiceOrderPaymentStatusStyles(
    paymentStatus!,
  );
  const hasValidPaymentStatus = paymentStatusStyles.label !== '-';

  const {
    data: jobInvoices = [],
    isLoading,
    isIdle,
  } = useFetchServiceOrderInvoices(serviceOrderId);

  totalInvoiceRef = totalInvoiceRef || jobInvoices.length;

  const {data: companyNextNumber, refetch: refetchCompanyNextNumber} =
    useCompanyNextNumber(
      {
        type: ServiceCompanyNumberType.INVOICE,
      },
      user?.userAccount.serviceCompany.id,
      true,
    );

  const {
    data: clientStorageDataPdfConfig,
    isLoading: isLoadingClientStorageDataPdfConfig,
  } = useQueryClientStorageData({
    serviceCompanyId: user?.userAccount.serviceCompany.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });

  const pdfConfig = useMemo(
    () =>
      clientStorageDataPdfConfig?.value
        ? JSON.parse(clientStorageDataPdfConfig.value)
        : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
    [clientStorageDataPdfConfig?.value],
  );

  const invoiceTypesToShow = useMemo(() => {
    const defaultTypes = [
      InvoiceType.FULL,
      InvoiceType.PARTIAL,
      InvoiceType.UPFRONT,
    ];

    const allJobsAreCancelled = jobInvoices.every(
      (i) => i.status === InvoiceStatus.CANCELLED,
    );
    if (allJobsAreCancelled) {
      return defaultTypes;
    }

    const jobHasFullInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.FULL,
    );
    if (jobHasFullInvoice) {
      return [InvoiceType.FULL];
    }

    const jobHasPartialInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.PARTIAL,
    );
    if (jobHasPartialInvoice) {
      return [InvoiceType.FINAL, InvoiceType.PARTIAL];
    }

    const jobHasUpfrontInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.UPFRONT,
    );
    if (jobHasUpfrontInvoice) {
      return [InvoiceType.FINAL, InvoiceType.PARTIAL, InvoiceType.UPFRONT];
    }

    return defaultTypes;
  }, [jobInvoices]);

  useEffect(() => {
    if (!isLoading) {
      setRows(
        makeRows(
          jobInvoices || [],
          user?.userAccount.serviceCompany.id,
          formatDate,
        ),
      );
    }
  }, [jobInvoices, isLoading]);

  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        illustration="clipboard"
        size="tiny"
        containerStyle={{m: 'auto', width: '60%'}}
        label="No invoices yet. They will appear here once added."
      />
    </Box>
  );

  if (isIdle || isLoading || isLoadingClientStorageDataPdfConfig) {
    return <Progress />;
  }

  return (
    <InfoCard
      footer={
        jobInvoices &&
        jobInvoices?.filter((item) => item.status !== InvoiceStatus.CANCELLED)
          ?.length !== 0 && (
          <InfoCardTotalSumFooter
            amount={
              jobInvoices &&
              calculateGrossInvoiceTotal(
                jobInvoices.filter(
                  (item) => item.status !== InvoiceStatus.CANCELLED,
                ),
              )
            }
            label={t('Invoiced Sum (incl. VAT)')}
          />
        )
      }
      header={
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="subtitle1" sx={{marginRight: '1em'}}>
            {t('Invoices')}
          </Typography>
          {hasValidPaymentStatus && (
            <StatusChip
              label={paymentStatusStyles.label}
              color={paymentStatusStyles.color}
              maxChars={8}
            />
          )}
        </Box>
      }
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <Typography color="info.main" data-testid="add-invoice">{`+ ${t(
          'Add',
        )}`}</Typography>
      }
      showHeaderBackground>
      {!totalInvoiceRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          rows={memorizedRows}
          height={getDataGridHeight(
            memorizedRows.length,
            memorizedRows.length,
            70,
          )}
          columns={columns(
            companyNextNumber,
            refetchCompanyNextNumber,
            pdfConfig,
            setXmlHtmlContent,
            fetchInvoiceInfo,
          )}
          fullHeight={false}
          containerStyle={{
            borderBottom: 'none',
          }}
          isWidget
        />
      )}
      <CreateNewInvoiceModal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        orderId={serviceOrderId}
        invoiceTypesToShow={invoiceTypesToShow}
      />
      {/* Hidden container for XML content to be printed */}
      <div id="xml-content">
        <XMLViewer
          indentSize={4}
          theme={{fontFamily: 'Montserrat'}}
          xml={xmlHtmlContent}
        />
      </div>
    </InfoCard>
  );
};
