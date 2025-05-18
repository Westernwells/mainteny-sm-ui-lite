import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MUITooltip, {TooltipProps} from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import {addDays} from 'date-fns';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {
  useCancelInvoice,
  useDeleteInvoice,
  useFetchServiceOrderInvoices,
  useFetchXInvoiceByInvoiceId,
  useInvoiceAmountDetailQuery,
  useInvoiceDetail,
  useInvoiceSubItems,
  usePrintInvoice,
  useSendInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  InvoiceStatus,
  InvoiceSubItemRecord,
  InvoiceType,
  InvoiceView,
} from 'models/invoice';
import {
  fetchDownloadUrls as fetchDownloadUrlsUtil,
  useDownloadUrl,
  useFetchFromUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useSnackbar} from 'hooks/useSnackbar';
import CustomSnackbar from 'components/CustomSnackbar';
import {
  getQrErrorMessage,
  svgToJpegPng,
  validateDueDate,
} from 'utils/invoice-utils';
import {
  useCompanyById,
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {
  createFilesFromBlobArray,
  dateToString,
  decideAttachmentDescriptionForInvoiceEmail,
  decideAttachmentURIForInvoiceEmail,
  fetchFile,
  getUserFullName,
} from 'utils/utils';
import {createQrData, QRCurrencyCode, useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {pdf} from '@react-pdf/renderer';
import CreditNotePdfTemplate from 'components/pdf-templates/CreditNotePdfTemplate';
import FinalInvoicePdfTemplate from 'components/pdf-templates/FinalInvoicePdfTemplate';
import FullInvoicePdfTemplate from 'components/pdf-templates/FullInvoicePdfTemplate';
import PartialInvoicePdfTemplate from 'components/pdf-templates/PartialInvoicePdfTemplate';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {
  correctCreditNoteInvoicesPercentages,
  formatInvoiceViewToUpdateInvoice,
} from 'pages/InvoiceDetails/utils';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import {fetchAndConvertImageToBase64} from 'hooks/useFetchAndConvertImage';
import {useEffectAfterMount} from 'hooks/useEffectAfterMount';
import {ServiceOrderReportView} from 'models/service-order';
import ChecklistPdf from 'pages/ServiceOrderDetails/Tabs/Checklist/ChecklistPdf';
import {getJobTypeGivenName, getSignatureKeys} from 'utils/service-order-utils';
import {
  EmailRecord,
  PdfGenerationStatus,
  StringValueResponse,
} from 'models/misc';
// eslint-disable-next-line import/no-unresolved
import {SwissQRBill} from 'swissqrbill/svg';
import {QueryObserverResult} from 'react-query';
import _ from 'lodash';
import useMultiImagesURLToBase64 from 'hooks/useMultiImagesURLToBase64';
import {InvoiceFormat} from 'models/propertyManager';
import {formatDate} from 'utils/datetime';
import {getTechnicianByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {getTechnicianName} from 'utils/employee';
import useInvoiceMenuActions from 'hooks/useInvoiceMenuActions';
import {companyLanguageContextMap} from 'utils/language';
import {EmailSignature, EmployeesView} from 'models/employee';
import {FileResourceRecord} from 'models/media';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {CANCEL_ACTION} from 'models/status';
import {
  CheckListComponentView,
  ServiceOrderCheckListView,
} from 'models/checklist';
import {useVats} from 'hooks/reactQuery/useVats';
import useInvoiceDownloadPreparation from 'hooks/reactQuery/useInvoiceDownloadPreparation';
import {downloadFile} from 'utils/download';
import printJS from 'print-js';
import {invoiceItemToInvoiceItemRecord, isXMLNeeded} from 'utils/invoice';
import {handleSignatureSmartly} from 'utils/rich-field-string';
import {PdfStylesContext} from 'context/PdfStylesProvider';

interface Props {
  invoice: InvoiceView;
  companyNextNumber: StringValueResponse | undefined;
  removePadding?: boolean;
  pdfConfig: ClientReportForPDFConfig;
  refetchCompanyNextNumber: () => Promise<
    QueryObserverResult<StringValueResponse>
  >;
  onXmlHtmlContentChange: (value: string) => void;
  onFetchInvoiceInfo: () => Promise<{
    headerUrl: {[p: string]: string};
    headerInfo: any;
    isHeaderUrlLoading: boolean;
    footerUrl: {[p: string]: string};
    footerInfo: any;
    isFooterUrlLoading: boolean;
  }>;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

const Tooltip = ({children, ...props}: TooltipProps) => (
  <MUITooltip
    PopperProps={{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, -10],
          },
        },
      ],
    }}
    {...props}>
    {children}
  </MUITooltip>
);

enum FILE_DESCRIPTION_PREFIXES {
  INVOICE = 'INV',
  WORK_REPORT = 'WR',
  CHECKLIST = 'CHK',
}

export const Actions = ({
  invoice,
  companyNextNumber,
  removePadding = false,
  pdfConfig,
  refetchCompanyNextNumber,
  onXmlHtmlContentChange,
  onFetchInvoiceInfo,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const {data: taxRates} = useVats();
  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes?.filter(
    (oldJobType) =>
      !jobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelledDialogOpen, setIsCancelledDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [isCreateCreditNoteDialogOpen, setIsCreateCreditNoteDialogOpen] =
    useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [qrImageSrc, setQrImageSrc] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);

  const {generateXML} = useInvoiceDownloadPreparation();

  const qrCurrency: QRCurrencyCode =
    currentCurrency?.code === 'EUR' || currentCurrency?.code === 'CHF'
      ? currentCurrency.code
      : 'EUR';

  const {data: company} = useCompanyById(
    user?.userAccount.serviceCompany.id,
    true,
  );
  const {mutateAsync: getXInvoiceByInvoiceId} = useFetchXInvoiceByInvoiceId();

  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView | null>(
    null,
  );

  const {data: updatedInvoice, refetch: refetchInvoiceData} = useInvoiceDetail(
    selectedInvoice?.id!,
  );

  const {data: invoiceAmountDetail, refetch: fetchInvoiceAmountDetail} =
    useInvoiceAmountDetailQuery(invoice?.id, {enabled: false});

  const {refetch: refetchDownloadUrl} = useDownloadUrl(
    invoice?.additionalInfo.pdfPath ? [invoice?.additionalInfo.pdfPath] : [],
    {enabled: false},
  );

  const {refetch: refetchXMLDownloadUrl} = useDownloadUrl(
    invoice?.additionalInfo.xmlPath ? [invoice?.additionalInfo.xmlPath] : [],
    {enabled: false},
  );

  const {data: invoiceSubItems, refetch: fetchSubItems} = useInvoiceSubItems(
    invoice?.id,
    {
      enabled: false,
    },
  );

  const subItemsMap: Record<string, InvoiceSubItemRecord[]> = useMemo(
    () =>
      Object.entries(invoiceSubItems ?? {}).reduce(
        (acc, [parentId, subItems]) => {
          acc[parentId] = subItems.map((subItem) => ({
            ...subItem,
            parentId,
          }));
          return acc;
        },
        {} as Record<string, InvoiceSubItemRecord[]>,
      ),
    [invoiceSubItems],
  );

  const fetchUpdatedPdfDownloadUrl = useFetchFromUrl();

  const fetchUpdatedXmlDownloadUrl = useFetchFromUrl();

  const {mutateAsync: uploadFiles} = useUploadFiles('');
  const {mutateAsync: updateInvoiceAsync} = useUpdateInvoice();
  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: cancelInvoice} = useCancelInvoice({
    disableNavigate: true,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutateAsync: undoCancelInvoice} = useCancelInvoice({
    disableNavigate: true,
    action: CANCEL_ACTION.UNCANCEL,
  });
  const {mutateAsync: printInvoice} = usePrintInvoice({shouldNavigate: false});
  const {mutateAsync: sendInvoice} = useSendInvoice({
    shouldNavigate: true,
  });

  const [activeSignature, setActiveSignature] = useState<
    EmailSignature | undefined
  >();

  const {data: signatureUrls = {}} = useDownloadUrl(
    activeSignature?.content?.images || [],
  );

  const {data: previousInvoices = []} = useFetchServiceOrderInvoices(
    invoice?.serviceOrder?.id,
    {
      enabled: false,
    },
  );

  const sortedPreviousInvoices = useMemo(
    () =>
      [...previousInvoices]
        .filter((item) => item.status !== InvoiceStatus.CANCELLED)
        .sort(
          (a, b) =>
            new Date(a.meta.createdAt).getTime() -
            new Date(b.meta.createdAt).getTime(),
        )
        .map((i) => ({
          ...i,
          totalAmount: {
            ...i.totalAmount,
            vats: [...i.totalAmount.vats].sort(
              (a, b) => b.percentageVat - a.percentageVat,
            ),
          },
        })),
    [previousInvoices],
  );

  const serviceOrder = invoice?.serviceOrder;
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {refetch: refetchChecklists} = useQueryServiceOrderChecklists({
    serviceOrderId: serviceOrder?.id || '',
    options: {
      enabled: false,
    },
  });

  const [report, setReport] = useState<ServiceOrderReportView | undefined>(
    serviceOrder?.reports?.[0],
  );

  const reportToUpdate = serviceOrder?.reports?.find(
    (r) => r.externalId === report?.externalId,
  );

  const generateChecklistBlob = async ({
    checklistData,
  }: {
    checklistData: {
      signatureImageUrl: string;
      selectedChecklist?: ServiceOrderCheckListView;
      sortedChecklistComponents: CheckListComponentView[];
      checklistImagesDownloadUrl: {
        [key: string]: string;
      };
    };
  }) => {
    const sortedChecklistComponentsCloned = _.cloneDeep(
      checklistData.sortedChecklistComponents ?? [],
    );

    sortedChecklistComponentsCloned.forEach((component) => {
      component.additionalInfo.pictures?.forEach((pic) => {
        pic.uri =
          checklistData.checklistImagesDownloadUrl?.[pic.uri] ?? pic.uri;
      });
    });

    const technicianSchedule = invoice?.serviceOrder?.schedules
      .filter((item) => !!item.technician)
      .find(
        (s) =>
          s.technician!.id === checklistData.selectedChecklist?.technicianId,
      );

    let technicianData: EmployeesView | undefined;

    if (checklistData.selectedChecklist?.technicianId) {
      try {
        technicianData = await getTechnicianByEmployeeId(
          checklistData.selectedChecklist?.technicianId,
        );
      } catch (error) {
        enqueueSnackbar(t('Failed to fetch technician data'), {
          variant: 'error',
        });
      }
    }

    const technicianNameForChecklist = getTechnicianName(
      technicianSchedule,
      technicianData,
    );

    const {headerUrl, headerInfo, footerUrl, footerInfo} =
      await onFetchInvoiceInfo();

    const blob = await pdf(
      <ChecklistPdf
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        selectedChecklist={checklistData.selectedChecklist}
        sortedChecklistComponents={sortedChecklistComponentsCloned}
        signaturePath={checklistData.signatureImageUrl}
        technicianName={technicianNameForChecklist}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();

    return blob;
  };

  // Handle Work report

  const allReportSignature =
    invoice.serviceOrder?.reports?.map((item) => item.signatures).flat() ?? [];
  const {data: downloadUrls = {}, refetch: fetchDownloadUrls} = useDownloadUrl(
    allReportSignature.map((item) => item.fileResource.uri) ?? [],
    {enabled: false},
  );

  const allReportsAttachments =
    invoice.serviceOrder?.reports
      ?.map((item) => item.attachments.flat())
      .flat() ?? [];

  const {data: imageDownloadUrls = {}, refetch: refetchImageDownloadUrls} =
    useDownloadUrl(
      allReportsAttachments.map((item) => item.fileResource.uri),
      {enabled: false},
    );

  const {refetch: refetchConvertedImages} = useMultiImagesURLToBase64(
    imageDownloadUrls,
    {enabled: false},
  );
  const {refetch: refetchSignatureConvertedImages} = useMultiImagesURLToBase64(
    downloadUrls,
    {enabled: false},
  );

  const reportsWithPath =
    serviceOrder?.reports?.filter((item) => !!item.additionalInfo.pdfPath) ??
    [];

  const {refetch: refetchWorkReportDownloadUrl} = useDownloadUrl(
    reportsWithPath.map((item) => item.additionalInfo.pdfPath),
    {enabled: false},
  );

  const generateWorkReportBlob = async (workReport: ServiceOrderReportView) => {
    const technicianSchedule = invoice?.serviceOrder?.schedules
      .filter((item) => !!item.technician)
      .find((s) => s.technician!.id === workReport.technicianId);

    let technicianData: EmployeesView | undefined;

    if (workReport.technicianId) {
      try {
        technicianData = await getTechnicianByEmployeeId(
          workReport.technicianId,
        );
      } catch (error) {
        enqueueSnackbar(t('Failed to fetch technician data'), {
          variant: 'error',
        });
      }
    }

    const technicianNameForReport = getTechnicianName(
      technicianSchedule,
      technicianData,
    );

    const reportImageDownloadUrls =
      (await refetchImageDownloadUrls()).data ?? {};
    const convertedImages = await refetchConvertedImages(
      reportImageDownloadUrls,
    );
    const reportSignatureDownloadUrl = (await fetchDownloadUrls()).data;
    const signatureConvertedImages = await refetchSignatureConvertedImages(
      reportSignatureDownloadUrl,
    );

    const workReportPictures = Object.keys(convertedImages)
      .filter((item) => {
        const technicianId = item.split('report/')[1].split('/')[0];
        return workReport.technicianId === technicianId;
      })
      .reduce((acc, path) => {
        acc[path] = convertedImages[path];
        return acc;
      }, {} as {[key: string]: string});

    const signatureKeys = getSignatureKeys(
      invoice?.serviceOrder!,
      workReport,
      serviceCompanyId,
    );

    const technicianSignatureImage =
      signatureConvertedImages[signatureKeys.TECHNICIAN];
    const customerSignatureImage =
      signatureConvertedImages[signatureKeys.CUSTOMER];

    const {headerUrl, headerInfo, footerUrl, footerInfo} =
      await onFetchInvoiceInfo();

    const blob = await pdf(
      <WorkReportTemplate
        serviceCompany={company}
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        report={workReport}
        technicianSignatureImage={technicianSignatureImage}
        customerSignatureImage={customerSignatureImage}
        workReportPictures={workReportPictures}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        technicianName={technicianNameForReport}
        serviceOrderType={getJobTypeGivenName(serviceOrder?.type, allJobTypes)}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();

    return blob;
  };

  const generateBlobUrl = async ({
    invoiceData,
    headerBlockUrl,
    footerBlockUrl,
    invoiceNumber,
    qrImageSrcProp,
  }: {
    invoiceData: InvoiceView;
    headerBlockUrl: {[key: string]: string};
    footerBlockUrl: {[key: string]: string};
    invoiceNumber?: string;
    qrImageSrcProp?: string;
  }) => {
    let PdfTemplate;

    if (
      invoiceData.type === InvoiceType.FULL ||
      invoiceData.type === InvoiceType.AGGREGATE
    ) {
      PdfTemplate = FullInvoicePdfTemplate;
    } else if (invoiceData.type === InvoiceType.CREDIT_NOTE) {
      PdfTemplate = CreditNotePdfTemplate;
    } else if (
      invoiceData.type === InvoiceType.PARTIAL ||
      invoiceData.type === InvoiceType.UPFRONT
    ) {
      PdfTemplate = PartialInvoicePdfTemplate;
    } else {
      PdfTemplate = FinalInvoicePdfTemplate;
    }

    const shouldIncludePreviousInvoices = !(
      invoice.type === InvoiceType.CREDIT_NOTE ||
      invoice.type === InvoiceType.FULL ||
      invoice.type === InvoiceType.AGGREGATE
    );

    const previousInvoicesProp = shouldIncludePreviousInvoices
      ? correctCreditNoteInvoicesPercentages(
          sortedPreviousInvoices.slice(
            0,
            sortedPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
          ),
        )
      : [];

    const {headerInfo, footerInfo} = await onFetchInvoiceInfo();

    const transformedInvoiceItems =
      invoice?.items.map((item) =>
        invoiceItemToInvoiceItemRecord(
          item,
          invoice.type,
          currentCurrency,
          taxRates,
          subItemsMap,
        ),
      ) || [];

    const blob = await pdf(
      <PdfTemplate
        serviceCompany={company}
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        invoice={invoiceData}
        invoiceAmountDetail={invoiceAmountDetail}
        invoiceItems={transformedInvoiceItems}
        selectedLng={company?.language}
        translate={translate}
        previousInvoices={previousInvoicesProp}
        headerPath={headerBlockUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerBlockUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        qrImageSrc={qrImageSrcProp || qrImageSrc}
        nextCompanyExternalId={
          invoiceNumber || translate('Automatically assigned')
        }
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    return {blob, blobURL};
  };

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [reportToUpdate]);

  const handleClick = async (event: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
    await Promise.all([fetchSubItems(), fetchInvoiceAmountDetail()]);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(invoice);
  };

  // Helper function to fetch and create files
  const fetchAndCreateFiles = async (
    url: string,
    argfileNames: string[],
    argfileDescriptions: string[],
  ) => {
    const blob = await fetchFile(url);
    return createFilesFromBlobArray([blob], argfileNames, argfileDescriptions);
  };

  const getWorkReportOperations = async (
    invoiceData: InvoiceView,
    workReportDownloadUrlArg?: {
      [key: string]: string;
    },
  ) => {
    if (!invoiceData?.additionalInfo.includeWorkReport) {
      return Promise.resolve([]);
    }

    const reports = invoiceData.serviceOrder?.reports ?? [];

    const promises = reports.map(async (reportItem) => {
      const reportId = reportItem?.id;
      const fileName = `${reportId}.pdf`;
      const description = `${FILE_DESCRIPTION_PREFIXES.WORK_REPORT}-${
        reportItem?.externalId || invoice?.serviceOrder?.externalId
      }.pdf`;

      if (
        reportItem?.additionalInfo.pdfGenerationStatus ===
        PdfGenerationStatus.DONE
      ) {
        const workReportDownloadUrl =
          workReportDownloadUrlArg![reportItem.additionalInfo.pdfPath];
        return fetchAndCreateFiles(
          workReportDownloadUrl,
          [fileName],
          [description],
        );
      }

      const workReportBlob = await generateWorkReportBlob(reportItem);
      return createFilesFromBlobArray(
        [workReportBlob],
        [fileName],
        [description],
      );
    });

    return (await Promise.all(promises)).flat();
  };

  const getBaseFileOperations = async (
    invoiceData: InvoiceView,
    {
      invoiceDownloadUrl,
      nextNumber,
    }: {
      invoiceDownloadUrl?: {
        [key: string]: string;
      };
      nextNumber?: string;
    },
  ) => {
    const fileNames: string[] = [`${invoiceData?.id}.pdf`];
    const fileDescriptions: string[] = [
      `${FILE_DESCRIPTION_PREFIXES.INVOICE}-${
        invoiceData?.externalId || nextNumber
      }.pdf`,
    ];

    const {headerUrl, footerUrl} = await onFetchInvoiceInfo();

    return invoiceData?.status !== InvoiceStatus.DRAFT
      ? fetchAndCreateFiles(
          invoiceDownloadUrl ? Object.values(invoiceDownloadUrl)[0] : '',
          fileNames,
          fileDescriptions,
        )
      : (await generateBlobUrl({
          invoiceData,
          headerBlockUrl: headerUrl,
          footerBlockUrl: footerUrl,
          invoiceNumber: companyNextNumber?.value,
        }).then(({blob: blobFile}) =>
          createFilesFromBlobArray([blobFile!], fileNames, fileDescriptions),
        )) || Promise.resolve([]);
  };

  const getXInvoiceOperation = async (
    invoiceData: InvoiceView,
    options?: {forceGet?: boolean; invoiceNumber?: string},
  ) => {
    const {forceGet = false, invoiceNumber} = options ?? {};

    // If XML is not opted then do nothing
    if (
      invoiceData?.propertyOwner.additionalInfo.invoiceFormat !==
        InvoiceFormat.XML &&
      invoiceData?.propertyOwner.additionalInfo.invoiceFormat !==
        InvoiceFormat.PDF_AND_XML &&
      !forceGet
    ) {
      return Promise.resolve([]);
    }

    if (!invoiceData.dueDate) {
      return Promise.resolve([]);
    }

    const response = await getXInvoiceByInvoiceId({
      invoiceId: invoiceData.id,
      params: {
        dueDate: invoiceData.dueDate!,
        sentDate: invoiceData.sentDate ?? formatDate(new Date(), 'yyyy-MM-dd')!,
        externalId: invoiceNumber ?? companyNextNumber?.value!,
      },
    });

    const blob = new Blob([response], {type: 'application/xml'});

    const fileNames: string[] = [`${invoiceData?.id}.xml`];
    const fileDescriptions: string[] = [
      `${FILE_DESCRIPTION_PREFIXES.INVOICE}-${
        invoiceData?.externalId || companyNextNumber?.value!
      }.xml`,
    ];

    return createFilesFromBlobArray([blob], fileNames, fileDescriptions);
  };

  const getChecklistData = async () => {
    if (!invoice?.serviceOrder?.id)
      return {
        checklists: [],
        selectedChecklist: undefined,
        sortedChecklistComponents: [],
      };

    const {data: checklists} = await refetchChecklists();

    const labels =
      checklists?.map((c) => {
        const schedule = invoice?.serviceOrder?.schedules
          .filter((item) => !!item.technician)
          .find((s) => s.technician!.id === c.technicianId);
        const checklistNumber = c.checkList.number || 'Unassigned';
        return {
          value: {
            checklistId: c.checkListId,
            technicianId: c.technicianId,
          },
          label: `${checklistNumber}-${getUserFullName(
            schedule?.technician?.userAccount,
          )}`,
        };
      }) || [];

    const selectedOption = labels?.[0]?.value;

    const selectedChecklist = checklists?.find(
      (c) =>
        c.checkListId === selectedOption?.checklistId &&
        c.technicianId === selectedOption?.technicianId,
    );

    const sortedChecklistComponents =
      selectedChecklist?.checkList?.components.sort(
        (a, b) =>
          (a.additionalInfo?.orderNumber ?? 0) -
          (b.additionalInfo?.orderNumber ?? 0),
      ) ?? [];

    const checklistImagesPath = (
      sortedChecklistComponents.map(
        (component) =>
          component.additionalInfo.pictures?.map((pic) => pic.uri) ?? [],
      ) ?? []
    ).flat();

    return {
      selectedChecklist,
      checklistImagesPath,
      checklists,
      sortedChecklistComponents,
    };
  };

  const getChecklistOperations = async (invoiceData: InvoiceView) => {
    const {
      checklistImagesPath,
      checklists,
      selectedChecklist,
      sortedChecklistComponents,
    } = await getChecklistData();

    const checklistImagesDownloadUrl = await fetchDownloadUrlsUtil(
      checklistImagesPath as string[],
      user?.userAccount.serviceCompany.id!,
    );

    const signatureDownloadUrls = await fetchDownloadUrlsUtil(
      checklists?.length
        ? checklists.map((c) => c.additionalInfo.technicianSignature || '')
        : [],
      user?.userAccount.serviceCompany.id!,
    );

    const signaturePath =
      signatureDownloadUrls?.[
        selectedChecklist?.additionalInfo?.technicianSignature || ''
      ] || '';

    const signatureImageUrl = await fetchAndConvertImageToBase64(signaturePath);

    // Checklist operations
    let checklistOperations;
    if (invoiceData?.additionalInfo.includeCheckList) {
      if (
        selectedChecklist?.additionalInfo.pdfGenerationStatus ===
          PdfGenerationStatus.DONE &&
        selectedChecklist?.additionalInfo.pdfPath
      ) {
        const checklistDownloadUrl = await fetchDownloadUrlsUtil(
          [selectedChecklist?.additionalInfo.pdfPath],
          user?.userAccount.serviceCompany.id!,
        );
        checklistOperations = await fetchAndCreateFiles(
          checklistDownloadUrl ? Object.values(checklistDownloadUrl)[0] : '',
          [`${selectedChecklist?.checkListId}.pdf`],
          [
            `${FILE_DESCRIPTION_PREFIXES.CHECKLIST}-${
              selectedChecklist?.checkList.externalId ||
              invoiceData?.serviceOrder?.externalId
            }.pdf`,
          ],
        );
      } else {
        const checklistBlob = await generateChecklistBlob({
          checklistData: {
            sortedChecklistComponents,
            selectedChecklist,
            signatureImageUrl,
            checklistImagesDownloadUrl,
          },
        });
        checklistOperations = await createFilesFromBlobArray(
          [checklistBlob],
          [`${selectedChecklist?.checkListId}.pdf`],
          [
            `${FILE_DESCRIPTION_PREFIXES.CHECKLIST}-${
              selectedChecklist?.checkList.externalId ||
              invoiceData?.serviceOrder?.externalId
            }.pdf`,
          ],
        );
      }
    }

    if (!checklistOperations) {
      checklistOperations = Promise.resolve([]);
    }

    return checklistOperations;
  };

  const getExistingFiles = async (
    invoiceDownloadUrlArg:
      | {
          [key: string]: string;
        }
      | undefined,
    invoiceData: InvoiceView,
    nextNumber?: string,
    workReportDownloadUrlArg?: {
      [key: string]: string;
    },
  ) => {
    let allFiles: FileWithPreview[] = [];

    // Base file operations
    const baseFileOperations = getBaseFileOperations(invoiceData, {
      nextNumber,
      invoiceDownloadUrl: invoiceDownloadUrlArg,
    });

    // // Work report operations
    const workReportOperations = await getWorkReportOperations(
      invoiceData,
      workReportDownloadUrlArg,
    );

    const xInvoiceOperation = await getXInvoiceOperation(invoiceData);

    const checklistOperations = await getChecklistOperations(invoiceData);

    // Wait for all file operations to complete
    const [baseFiles, workReportFiles, checklistFiles, xInvoiceFiles] =
      await Promise.all([
        baseFileOperations,
        workReportOperations,
        checklistOperations,
        xInvoiceOperation,
      ]);

    // Combine all files
    allFiles = [
      ...baseFiles,
      ...workReportFiles,
      ...checklistFiles,
      ...xInvoiceFiles,
    ];

    // Set existing files
    setExistingFiles(allFiles);
  };

  const getQrImageSrc = async (qrInvoice: InvoiceView) => {
    const qrBillData = createQrData(
      qrCurrency,
      qrInvoice,
      currentCurrency,
      user?.userAccount,
    );

    const qrBillSvg = new SwissQRBill(qrBillData);

    const result = await new Promise<string>((resolve, reject) => {
      svgToJpegPng(
        qrBillSvg.element as unknown as SVGSVGElement,
        (imageResult) => {
          if (imageResult) {
            resolve(imageResult); // Resolve on success
          } else {
            reject(new Error('Failed to generate QR code image')); // Reject on failure
          }
        },
        {format: 'jpeg', quality: 1},
      );
    });

    return result;
  };

  const checkValidQrCode = useCallback(
    async (qrInvoice: InvoiceView) => {
      if (!user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled) {
        return '';
      }

      try {
        const result = await getQrImageSrc(qrInvoice);
        setQrImageSrc(result);

        setQrError(null);
        return '';
      } catch (error) {
        if (error instanceof Error) {
          setQrError(error.message);
          return error.message;
        }
        return 'Unknown error occurred'; // Fallback error message
      }
    },
    [user, currentCurrency, qrCurrency],
  );

  useEffect(() => {
    if (qrError) {
      const errorMessage = getQrErrorMessage(qrError);
      if (errorMessage) {
        enqueueSnackbar(t(`${errorMessage}`), {
          variant: 'error',
        });
        setQrError(null);
      }
    }
  }, [qrError]);

  const paymentTerm = invoice?.additionalInfo?.paymentTerm;
  const hasPaymentTerm = typeof paymentTerm?.id === 'string';
  const paymentTermDueDays = paymentTerm?.data?.dueDays || 0;
  const dueDate = hasPaymentTerm
    ? dateToString(addDays(new Date(), paymentTermDueDays))
    : invoice?.dueDate || dateToString(new Date());
  const invoiceWithUpdatedDueDate = {
    ...invoice,
    dueDate,
  };

  const refetchPDFs = async (companyNextId?: string) => {
    // Refetch the download URLs for invoice, work report, and checklist
    const invoiceDownloadUrlResponse = await refetchDownloadUrl();
    const workReportDownloadUrlResponse = await refetchWorkReportDownloadUrl();

    // Ensure all download URLs are fetched before calling getExistingFiles
    await getExistingFiles(
      invoiceDownloadUrlResponse.data,
      invoiceWithUpdatedDueDate,
      companyNextId,
      workReportDownloadUrlResponse.data,
    );
  };

  const handleOpenSendEmail = async (companyNextId?: string) => {
    const error = await checkValidQrCode(invoice);

    if (!error) {
      try {
        setIsLoadingFiles(true);
        setIsSendEmailDialogOpen(true);
        await refetchPDFs(companyNextId);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  const handleOpenPaymentDialog = () => {
    setIsDialogOpen(true);
    setSelectedInvoice(invoice);
  };

  const handleOpenSendInvoiceModal = useCallback(() => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage && !hasPaymentTerm) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setSelectedInvoice(invoice);

    if (companyNextNumber) {
      handleOpenSendEmail(companyNextNumber.value);
    }
  }, [invoice, companyNextNumber, generateBlobUrl]);

  const handleOpenPrintDialog = () => {
    setIsConfirmPrintDialogOpen(true);
  };

  const handleDownload = useCallback(async () => {
    try {
      const {invoiceFormat} = invoice.propertyOwner.additionalInfo;

      const shouldDownloadXML =
        invoiceFormat === InvoiceFormat.XML ||
        invoiceFormat === InvoiceFormat.PDF_AND_XML;

      let qrImageSrcProp = qrImageSrc;
      if (
        user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled &&
        !qrImageSrcProp &&
        invoice.status === InvoiceStatus.DRAFT
      ) {
        const error = await checkValidQrCode(invoice);
        if (error) {
          return;
        }
        qrImageSrcProp = await getQrImageSrc(invoice);
      }

      // generate files for draft
      if (invoice.status === InvoiceStatus.DRAFT) {
        const {headerUrl, footerUrl} = await onFetchInvoiceInfo();

        // generate pdf
        const {blobURL} = await generateBlobUrl({
          invoiceData: invoice,
          headerBlockUrl: headerUrl,
          footerBlockUrl: footerUrl,
          qrImageSrcProp,
        });

        // download pdf
        downloadFile({downloadUrl: blobURL});

        // generate and download XML if needed
        if (shouldDownloadXML) {
          const xmlBlobURL = await generateXML(invoice, companyNextNumber);

          downloadFile({
            downloadUrl: xmlBlobURL,
            extension: 'xml',
          });
        }
      } else {
        // fetch download urls
        const {data: downloadUrl} = await refetchDownloadUrl();
        if (
          invoice.additionalInfo.pdfPath &&
          downloadUrl?.[invoice.additionalInfo.pdfPath]
        ) {
          await downloadFile({
            fileName: invoice.externalId,
            downloadUrl: downloadUrl?.[invoice.additionalInfo.pdfPath],
          });
        }

        if (shouldDownloadXML && invoice.additionalInfo.xmlPath) {
          const [xmlDownloadUrlData] = await Promise.all([
            refetchXMLDownloadUrl(),
          ]);

          await downloadFile({
            fileName: invoice.externalId,
            downloadUrl:
              xmlDownloadUrlData.data?.[invoice.additionalInfo.xmlPath] || '',
            extension: 'xml',
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [invoice, qrImageSrc, refetchDownloadUrl, onFetchInvoiceInfo]);

  const {actions} = useInvoiceMenuActions({
    invoice,
    onSend: handleOpenSendInvoiceModal,
    onPrint: handleOpenPrintDialog,
    onCreateCreditNote: () => setIsCreateCreditNoteDialogOpen(true),
    onDownload: handleDownload,
    onDelete: () => {
      setIsDeleteDialogOpen(true);
    },
    onCancel: () => {
      setIsCancelledDialogOpen(true);
    },
    onUndoCancel: () => {
      undoCancelInvoice(invoice.id, {
        onSuccess: () => {
          enqueueSnackbar(t('Invoice has been restored'), {
            variant: 'success',
          });
        },
      });
    },
    onResend: handleOpenSendInvoiceModal,
    onPayment: handleOpenPaymentDialog,
  });

  useEffectAfterMount(() => {
    (async () => {
      if (companyNextNumber?.value) {
        try {
          setIsLoadingFiles(true);
          await refetchPDFs(companyNextNumber.value);
        } finally {
          setIsLoadingFiles(false);
        }
      }
    })();
  }, [companyNextNumber?.value]);

  const handlePrint = async (
    invoiceToPrint: InvoiceView,
    pdfPath: string,
    xmlPath: string,
  ) => {
    const PDFDownloadURLResponse = await fetchUpdatedPdfDownloadUrl(pdfPath);
    const PDFDownloadURL = PDFDownloadURLResponse[pdfPath];

    printJS({
      printable: PDFDownloadURL,
      type: 'pdf',
      showModal: true,
      onPrintDialogClose: async () => {
        const XMLDownloadURLResponse = await fetchUpdatedXmlDownloadUrl(
          xmlPath,
        );
        const XMLDownloadURL = XMLDownloadURLResponse[xmlPath];

        // after pdf print is closed check if xml is needed and start print logic
        if (isXMLNeeded(invoiceToPrint)) {
          // Fetch XML file
          const response = await fetch(XMLDownloadURL!);
          const xmlText = await response.text();

          onXmlHtmlContentChange(xmlText); // xml print needs to update tag component to keep the XML format and print from there
        }
      },
    });
  };

  const preparePrint = async (
    invoiceToPrint: InvoiceView,
    data: InvoiceView,
    printDueDate: string,
  ) => {
    let qrImageSrcProp = qrImageSrc;
    if (
      user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled &&
      !qrImageSrcProp &&
      invoice.status === InvoiceStatus.DRAFT
    ) {
      const error = await checkValidQrCode(invoice);
      if (error) {
        return;
      }
      qrImageSrcProp = await getQrImageSrc(invoice);
    }

    const {headerUrl, footerUrl} = await onFetchInvoiceInfo();
    const {blob} = await generateBlobUrl({
      invoiceData: data,
      headerBlockUrl: headerUrl,
      footerBlockUrl: footerUrl,
      invoiceNumber: invoiceToPrint.externalId,
      qrImageSrcProp,
    });

    const uploadPath = `${serviceCompanyId}/invoices`;

    const foundInvoiceXML = await getXInvoiceOperation(data, {
      forceGet: true,
      invoiceNumber: invoiceToPrint.externalId,
    });

    if (blob) {
      const fileNames: string[] = [`${invoiceToPrint.id}.pdf`];
      const files = await createFilesFromBlobArray([blob!], fileNames);
      // upload generated files
      await uploadFiles({
        files: [...files, ...foundInvoiceXML],
        uploadPath,
      });
      const pdfPath = `${uploadPath}/${invoiceToPrint.id}.pdf`;
      const xmlPath = `${uploadPath}/${invoiceToPrint.id}.xml`;

      // update files path
      await printInvoice(
        {
          id: invoiceToPrint.id,
          body: {
            pdfPath,
            xmlPath,
            externalId: invoiceToPrint.externalId,
            dueDate: printDueDate,
            sentDate: invoiceToPrint.sentDate || dateToString(new Date()),
          },
        },
        {
          onSuccess: () => {
            handlePrint(invoiceToPrint, pdfPath, xmlPath);
          },
        },
      );
    }
  };

  const handlePrintInvoice = async () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage && !hasPaymentTerm) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    // Guard clause
    if (invoice.status !== InvoiceStatus.DRAFT) {
      enqueueSnackbar(t('Can not print invoice that is not in DRAFT'), {
        variant: 'error',
      });

      return;
    }

    setIsConfirmPrintDialogOpen(false);

    if (invoice.externalId.trim() === '') {
      // mark invoice as send and assign external id
      await updateInvoiceAsync(
        {
          data: formatInvoiceViewToUpdateInvoice(
            {
              ...invoice,
              externalId: companyNextNumber?.value!,
              dueDate,
            },
            currentCurrency,
            taxRates,
          ),
          invoiceId: invoice.id,
        },
        {
          onSuccess: async () => {
            const updatedInvoiceData = await refetchInvoiceData();

            if (updatedInvoiceData.data)
              await preparePrint(
                updatedInvoiceData.data,
                updatedInvoiceData.data,
                invoice.dueDate || dateToString(new Date()),
              );
          },
        },
      );
    } else {
      await preparePrint(invoice, invoiceWithUpdatedDueDate, dueDate);
    }
  };

  const generateEmailSubject = () => {
    const name =
      invoice.type === InvoiceType.CREDIT_NOTE
        ? invoice.serviceCompany.name
        : invoice.propertyOwner?.name;
    const type =
      invoice.type === InvoiceType.CREDIT_NOTE ? 'Credit Note' : 'Invoice';

    return t(`${name} - ${t(type)} {{invoiceNumber}}`, {
      invoiceNumber: invoice?.number ?? '',
    });
  };

  const handleSentEmail = async (emailRecord: EmailRecord) => {
    try {
      setIsSendingEmail(true);
      const {selectedChecklist} = await getChecklistData();
      const isDraftInvoice = invoice.status === InvoiceStatus.DRAFT;
      const invoiceUploadPath = `${serviceCompanyId}/invoices`;
      const workReportUploadPath = `${serviceCompanyId}/serviceOrders/${invoice?.serviceOrder?.id}/report`;
      const checklistUploadPath = `${serviceCompanyId}/serviceOrders/${selectedInvoice?.serviceOrder?.id}/checkLists/${selectedChecklist?.technicianId}`;
      const fileNames: string[] = [
        `${selectedInvoice?.id}.pdf`,
        `${selectedInvoice?.id}.xml`,
      ];
      const allAttachments = emailRecord.attachments || [];

      // 1. Upload work report files
      const workReportFiles = emailRecord.attachments?.filter((el) =>
        el.description?.includes(FILE_DESCRIPTION_PREFIXES.WORK_REPORT),
      );
      if (workReportFiles?.length) {
        await uploadFiles({
          files: workReportFiles,
          uploadPath: workReportUploadPath,
        });
      }

      // 2. Upload checklist files
      const checklistFiles = emailRecord.attachments?.filter((el) =>
        el.description?.includes(FILE_DESCRIPTION_PREFIXES.CHECKLIST),
      );
      if (checklistFiles?.length) {
        await uploadFiles({
          files: checklistFiles,
          uploadPath: checklistUploadPath,
        });
      }

      // 3. Upload invoice files if 'DRAFT' invoice
      if (isDraftInvoice) {
        const invoiceDownloadResponse = await refetchDownloadUrl();
        const invoiceDownloadUrl = invoiceDownloadResponse.data;

        const [invoicePDF, invoiceXML] = await Promise.all([
          getBaseFileOperations(invoiceWithUpdatedDueDate, {
            invoiceDownloadUrl,
            nextNumber: companyNextNumber?.value,
          }),
          getXInvoiceOperation(invoiceWithUpdatedDueDate, {
            forceGet: true,
          }),
        ]);

        await uploadFiles({
          files: [...invoicePDF, ...invoiceXML],
          uploadPath: invoiceUploadPath,
        });

        const xmlAttachmentIndex = allAttachments.findIndex(
          (item) => item.name === fileNames[1],
        );

        // Re-set XML just in case the invoice number is changed
        if (invoiceXML[0] && xmlAttachmentIndex !== -1) {
          allAttachments.splice(xmlAttachmentIndex, 1, invoiceXML[0]);
        }
      }

      // 4. Upload email attachments
      const emailAttachments = (emailRecord.attachments || [])?.filter(
        (el) => el.path && !el.description,
      );
      if (emailAttachments?.length) {
        await uploadFiles({
          files: emailAttachments,
          uploadPath: invoiceUploadPath,
        });
      }

      let file: File | undefined;

      if (activeSignature && activeSignature.content.images.length > 0) {
        const response = await fetch(
          signatureUrls[activeSignature.content.images[0]!],
        );

        const blob = await response.blob();
        file = new File([blob], activeSignature.name, {
          type: blob.type,
        });
      }

      let signatureAttachment: FileResourceRecord | undefined;

      if (file && activeSignature) {
        signatureAttachment = {
          type: file.type,
          uri: activeSignature.content.images[0]!,
          description: activeSignature.name,
          contentId: activeSignature.content.images[0]!,
        };
      }

      const processedContent = handleSignatureSmartly(
        emailRecord.content,
        activeSignature?.content.images[0] || '',
      );

      const sendEmail = async (invoiceData: InvoiceView) => {
        await sendInvoice({
          id: invoiceData?.id!,
          body: {
            pdfPath: isDraftInvoice
              ? `${invoiceUploadPath}/${fileNames[0]}`
              : invoiceData?.additionalInfo?.pdfPath!,
            xmlPath: isDraftInvoice
              ? `${invoiceUploadPath}/${fileNames[1]}`
              : invoiceData?.additionalInfo?.xmlPath!,
            externalId: invoiceData?.externalId! || companyNextNumber?.value!,
            dueDate,
            sentDate: invoiceData?.sentDate || dateToString(new Date()),
            email: {
              email: '',
              subject: emailRecord.subject,
              content: processedContent,
              emails: emailRecord.emails,
              ccEmails: emailRecord.ccEmails,
              bccEmails: emailRecord.bccEmails,
              attachments: allAttachments.reduce<FileWithPreview[]>(
                (newArr: FileWithPreview[], obj) => {
                  newArr.push({
                    ...obj,
                    type: obj.type,
                    uri: decideAttachmentURIForInvoiceEmail({
                      invoice,
                      invoiceUploadPath,
                      workReportUploadPath,
                      checklistUploadPath,
                      attachment: obj,
                    }),
                    description:
                      decideAttachmentDescriptionForInvoiceEmail(obj),
                  });

                  // Add signatureAttachment if it exists and is not already in the list
                  if (
                    signatureAttachment &&
                    !newArr.some(
                      (attachment) =>
                        attachment.uri === signatureAttachment.contentId,
                    )
                  ) {
                    newArr.push(signatureAttachment as FileWithPreview);
                  }

                  return newArr;
                },
                [],
              ),
            },
          },
        }).catch(async (error) => {
          if (error.message === 'Regenerate PDF') {
            await refetchCompanyNextNumber();
          }
          throw error;
        });
      };

      // 5. Send email
      await sendEmail(updatedInvoice!);
      setIsSendingEmail(false);
      setIsSendEmailDialogOpen(false);
      setActiveSignature(undefined);
    } catch (error) {
      setIsSendingEmail(false);
      throw error;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '40px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Tooltip title={t('More')} placement="right" arrow>
        <IconButton
          data-testid="invoice-action-menu-button"
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',

            ...(removePadding && {
              padding: 0,
            }),
          }}
          onClick={handleClick}>
          <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
      <Menu
        id="actions-menu"
        data-testid="invoice-action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
          sx: {width: '210px'},
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        {actions.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            {(actions.length > 3 && actions.length - 3 < index) ||
            (actions.length <= 3 && actions.length - 1 === index) ? (
              <Divider />
            ) : null}
            <MenuItem
              data-testid={`invoice-action-menu-item-${item.label}`}
              disabled={item.disabled ?? false}
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              sx={{py: '0.7rem'}}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>

      {selectedInvoice && (
        <MarkAsPaidDialog
          invoice={selectedInvoice}
          open={isDialogOpen}
          onConfirm={() => setIsDialogOpen(false)}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedInvoice(null);
          }}
          disableNavigate
        />
      )}

      {isSendEmailDialogOpen ? (
        <SendEmailDialog
          open={isSendEmailDialogOpen}
          onConfirm={() => setIsSendEmailDialogOpen(false)}
          onClose={() => {
            setIsSendEmailDialogOpen(false);
            setSelectedInvoice(null);
            setActiveSignature(undefined);
          }}
          id={invoice.id}
          existingFiles={existingFiles}
          isLoadingFiles={isLoadingFiles}
          onOpen={() => {
            if (
              invoice.propertyOwner.additionalInfo.invoiceFormat ===
              InvoiceFormat.POST
            )
              enqueueSnackbar(t('Customer wants to receive invoice via post'), {
                variant: 'warning',
              });
          }}
          callback={handleSentEmail}
          isSending={isSendingEmail}
          email={
            invoice.propertyOwner?.additionalInfo.billingEmail ||
            invoice.propertyOwner?.contact.email
          }
          subject={generateEmailSubject()}
          content={invoice.description}
          activeSignature={activeSignature}
          onSignatureSelect={(signature) => setActiveSignature(signature)}
        />
      ) : null}

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            deleteInvoice(
              {invoiceId: invoice.id, shouldNavigate: false},
              {
                onSuccess: () => {
                  enqueueSnackbar(
                    <CustomSnackbar
                      message="Invoice deleted"
                      snackIcon="delete"
                    />,
                    {
                      variant: 'info',
                      anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                    },
                  );
                  setSelectedInvoice(null);
                },
              },
            );
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="You are about to permanently delete this invoice."
        secondContent="This action is irreversible."
        helperText="Are you sure you want to proceed?"
      />

      <Confirm
        open={isCancelledDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            cancelInvoice(invoice.id, {
              onSuccess: () => {
                enqueueSnackbar(
                  <CustomSnackbar
                    message="Invoice cancelled"
                    snackIcon="cancel"
                  />,
                  {
                    variant: 'info',
                    anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                  },
                );
              },
            });

          setIsCancelledDialogOpen(false);
        }}
        onClose={() => setIsCancelledDialogOpen(false)}
        title="Cancel Invoice"
        content="You are about to cancel this invoice."
        helperText="Are you sure you want to proceed?"
      />

      <ConfirmPrintInvoice
        open={isConfirmPrintDialogOpen}
        onConfirm={handlePrintInvoice}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />

      <Confirm
        open={isCreateCreditNoteDialogOpen}
        onConfirm={() => {
          setIsCreateCreditNoteDialogOpen(false);
          navigate(
            `/invoices/new?invoiceId=${invoice.id}&invoiceType=${InvoiceType.CREDIT_NOTE}`,
          );
        }}
        onClose={() => setIsCreateCreditNoteDialogOpen(false)}
        title="Create Credit note"
        content="This action will create a credit note from this invoice details."
        helperText="Do you want to proceed?"
      />
    </Box>
  );
};
