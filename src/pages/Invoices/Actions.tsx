import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {useNavigate} from 'react-router';
import printJS from 'print-js';
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
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import Print from '@mui/icons-material/Print';
import Payments from '@mui/icons-material/Payments';
import FileDownload from '@mui/icons-material/FileDownload';
import Edit from '@mui/icons-material/Edit';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import {addDays} from 'date-fns';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {LanguageContext} from 'context/LanguageProvider';
import {
  useCancelInvoice,
  useDeleteInvoice,
  useFetchServiceOrderInvoices,
  useFetchXInvoiceByInvoiceId,
  useInvoiceAmountDetail,
  useInvoiceDetail,
  usePrintInvoice,
  useSendInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {InvoiceStatus, InvoiceType, InvoiceView} from 'models/invoice';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useSnackbar} from 'hooks/useSnackbar';
import CustomSnackbar from 'components/CustomSnackbar';
import {
  getQrErrorMessage,
  svgToJpegPng,
  validateDueDate,
} from 'utils/invoice-utils';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  dateToString,
  decideAttachmentDescriptionForInvoiceEmail,
  decideAttachmentURIForInvoiceEmail,
  fetchFile,
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
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import {useEffectAfterMount} from 'hooks/useEffectAfterMount';
import {ChecklistStatus, ServiceOrderReportView} from 'models/service-order';
import ChecklistPdf from 'pages/ServiceOrderDetails/Tabs/Checklist/ChecklistPdf';
import {getSignatureKeys} from 'utils/service-order-utils';
import {
  HeaderFooterInfoData,
  PdfGenerationStatus,
  StringValueResponse,
} from 'models/misc';
// eslint-disable-next-line import/no-unresolved
import {SwissQRBill} from 'swissqrbill/svg';
import {QueryObserverResult} from 'react-query';
import _ from 'lodash';
import CopyAll from '@mui/icons-material/CopyAll';
import useMultiImagesURLToBase64 from 'hooks/useMultiImagesURLToBase64';
import {InvoiceFormat} from 'models/propertyManager';
import {formatDate} from 'utils/datetime';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import XMLViewer from 'react-xml-viewer';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {getTechnicianName} from 'utils/employee';
import {EmailSignature} from 'models/employee';
import {FileResourceRecord} from 'models/media';

interface Props {
  invoice: InvoiceView;
  headerInfo: HeaderFooterInfoData;
  footerInfo: HeaderFooterInfoData;
  headerUrl: {
    [key: string]: string;
  };
  footerUrl: {
    [key: string]: string;
  };
  companyNextNumber: StringValueResponse | undefined;
  refetchCompanyNextNumber: () => Promise<
    QueryObserverResult<StringValueResponse>
  >;
  isHeaderUrlLoading: boolean;
  isFooterUrlLoading: boolean;
  removePadding?: boolean;
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
  headerInfo,
  footerInfo,
  headerUrl,
  footerUrl,
  companyNextNumber,
  refetchCompanyNextNumber,
  isHeaderUrlLoading,
  isFooterUrlLoading,
  removePadding = false,
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
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

  const [actionType, setActionType] = useState('');
  const [pdfPathToDownload, setPdfPathToDownload] = useState('');

  const [qrImageSrc, setQrImageSrc] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);

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
  const [xmlHtmlContent, setXmlHtmlContent] = useState('');

  const {data: updatedInvoice, refetch: refetchInvoiceData} = useInvoiceDetail(
    selectedInvoice?.id!,
  );

  const {data: invoiceAmountDetail} = useInvoiceAmountDetail(
    selectedInvoice?.id,
  );

  const {data: downloadUrl, refetch: refetchDownloadUrl} = useDownloadUrl(
    invoice?.additionalInfo.pdfPath
      ? [invoice?.additionalInfo.pdfPath]
      : pdfPathToDownload
      ? [pdfPathToDownload]
      : [],
    {enabled: false},
  );
  const {refetch: refetchXMLDownloadUrl} = useDownloadUrl(
    invoice?.additionalInfo.xmlPath ? [invoice?.additionalInfo.xmlPath] : [],
  );

  const {mutateAsync: uploadFiles} = useUploadFiles('');
  const {mutateAsync: updateInvoiceAsync} = useUpdateInvoice();
  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: cancelInvoice} = useCancelInvoice();
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

  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

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

  const {downloadFile} = useDownloadFileWithCustomName(
    invoice.externalId || invoice.number,
    pdfPathToDownload ||
      (downloadUrl ? downloadUrl[invoice?.additionalInfo.pdfPath] : ''),
  );

  const serviceOrder = selectedInvoice?.serviceOrder;
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {data: serviceOrderCheckLists} = useQueryServiceOrderChecklists({
    serviceOrderId: serviceOrder?.id || '',
    options: {
      enabled: !!serviceOrder?.id,
    },
  });

  const completedChecklists = serviceOrderCheckLists?.filter(
    (c) => c.additionalInfo.status === ChecklistStatus.COMPLETED,
  );

  const labels =
    completedChecklists?.map((c) => {
      const schedule = invoice?.serviceOrder?.schedules.find(
        (s) => s.technician.id === c.technicianId,
      );
      const checklistNumber = c.checkList.number || 'Unassigned';
      return {
        value: {
          checklistId: c.checkListId,
          technicianId: c.technicianId,
        },
        label: `${checklistNumber}-${schedule?.technician.userAccount.firstName} ${schedule?.technician.userAccount.lastName}`,
      };
    }) || [];

  const [selectedOption, setSelectedOption] = useState(labels[0]?.value || '');

  const [report, setReport] = useState<ServiceOrderReportView | undefined>(
    serviceOrder?.reports?.[0],
  );

  const reportToUpdate = serviceOrder?.reports?.find(
    (r) => r.externalId === report?.externalId,
  );

  const {data: fetchedTechnician} = useGetTechniciansByEmployeeId(
    report?.technicianId || '',
  );

  const {data: signatureDownloadUrls = {}} = useDownloadUrl(
    completedChecklists?.length
      ? completedChecklists.map(
          (c) => c.additionalInfo.technicianSignature || '',
        )
      : [],
  );

  const selectedChecklist = completedChecklists?.find(
    (c) =>
      c.checkListId === selectedOption.checklistId &&
      c.technicianId === selectedOption.technicianId,
  );
  const sortedChecklistComponents =
    selectedChecklist?.checkList?.components.sort(
      (a, b) =>
        (a.additionalInfo?.orderNumber ?? 0) -
        (b.additionalInfo?.orderNumber ?? 0),
    ) ?? [];

  const checklistImagesPath = useMemo(
    () =>
      (
        sortedChecklistComponents.map(
          (component) =>
            component.additionalInfo.pictures?.map((pic) => pic.uri) ?? [],
        ) ?? []
      ).flat(),
    [sortedChecklistComponents],
  );

  const {data: checklistImagesDownloadUrl, isLoading: isChecklistImageLoading} =
    useDownloadUrl(checklistImagesPath);

  const signaturePath =
    signatureDownloadUrls[
      selectedChecklist?.additionalInfo.technicianSignature || ''
    ];

  const signatureImageUrl = useFetchAndConvertImage(signaturePath);

  const {refetch: refetchChecklistDownloadUrl} = useDownloadUrl(
    selectedChecklist?.additionalInfo.pdfPath
      ? [selectedChecklist?.additionalInfo.pdfPath]
      : [],
    {enabled: false},
  );

  const generateChecklistBlob = async () => {
    const sortedChecklistComponentsCloned = _.cloneDeep(
      sortedChecklistComponents ?? [],
    );

    sortedChecklistComponentsCloned.forEach((component) => {
      component.additionalInfo.pictures?.forEach((pic) => {
        pic.uri = checklistImagesDownloadUrl?.[pic.uri] ?? pic.uri;
      });
    });

    const technicianSchedule = invoice?.serviceOrder?.schedules.find(
      (s) => s.technician.id === selectedChecklist?.technicianId,
    );

    const technicianNameForChecklist = getTechnicianName(
      technicianSchedule,
      fetchedTechnician,
    );

    const blob = await pdf(
      <ChecklistPdf
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        selectedChecklist={selectedChecklist}
        sortedChecklistComponents={sortedChecklistComponentsCloned}
        signaturePath={signatureImageUrl}
        technicianName={technicianNameForChecklist}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
      />,
    ).toBlob();

    return blob;
  };

  useEffect(() => {
    if (completedChecklists?.length && !selectedOption) {
      setSelectedOption(labels[0].value);
    }
  }, [completedChecklists]);

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
    const technicianSchedule = invoice?.serviceOrder?.schedules.find(
      (s) => s.technician.id === workReport.technicianId,
    );

    const technicianNameForReport = getTechnicianName(
      technicianSchedule,
      fetchedTechnician,
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

    const blob = await pdf(
      <WorkReportTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        selectedLng={company?.language}
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
      />,
    ).toBlob();

    return blob;
  };

  const generateBlobUrl = async ({
    invoiceData,
    headerBlockUrl,
    footerBlockUrl,
    invoiceNumber,
    setInState = true,
    showCurrentDateAsInvoiceDate = false,
    qrImageSrcProp,
  }: {
    invoiceData: InvoiceView;
    headerBlockUrl: {[key: string]: string};
    footerBlockUrl: {[key: string]: string};
    invoiceNumber?: string;
    setInState?: boolean;
    showCurrentDateAsInvoiceDate?: boolean;
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

    const blob = await pdf(
      <PdfTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        invoice={invoiceData}
        invoiceAmountDetail={invoiceAmountDetail}
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
        showCurrentDateAsInvoiceDate={showCurrentDateAsInvoiceDate}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    if (setInState) setPdfPathToDownload(blobURL);
    return blob;
  };

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [reportToUpdate]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(invoice);
  };

  const waitForHeaderAndFooter = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isHeaderUrlLoading && !isFooterUrlLoading) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100); // Check every 100ms
    });

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
      forceGet = false,
    }: {
      invoiceDownloadUrl?: {
        [key: string]: string;
      };
      nextNumber?: string;
      forceGet?: boolean;
    },
  ) => {
    if (
      invoiceData?.propertyOwner.additionalInfo.invoiceFormat !==
        InvoiceFormat.PDF &&
      invoiceData?.propertyOwner.additionalInfo.invoiceFormat !==
        InvoiceFormat.PDF_AND_XML &&
      !forceGet
    ) {
      return Promise.resolve([]);
    }

    const fileNames: string[] = [`${invoiceData?.id}.pdf`];
    const fileDescriptions: string[] = [
      `${FILE_DESCRIPTION_PREFIXES.INVOICE}-${
        invoiceData?.externalId || nextNumber
      }.pdf`,
    ];

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
          setInState: false,
          showCurrentDateAsInvoiceDate: true,
        }).then((blobFile) =>
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
    checklistDownloadUrlArg?: {
      [key: string]: string;
    },
  ) => {
    if (isHeaderUrlLoading || isFooterUrlLoading) {
      // wait for header and footer to load
      await waitForHeaderAndFooter();
    }

    let allFiles: FileWithPreview[] = [];

    // Base file operations
    const baseFileOperations = getBaseFileOperations(invoiceData, {
      nextNumber,
      invoiceDownloadUrl: invoiceDownloadUrlArg,
    });

    // // Work report operations
    const workReportOperations = getWorkReportOperations(
      invoiceData,
      workReportDownloadUrlArg,
    );

    const xInvoiceOperation = getXInvoiceOperation(invoiceData);

    // Checklist operations
    const checklistOperations = invoiceData?.additionalInfo.includeCheckList
      ? selectedChecklist?.additionalInfo.pdfGenerationStatus ===
        PdfGenerationStatus.DONE
        ? fetchAndCreateFiles(
            checklistDownloadUrlArg
              ? Object.values(checklistDownloadUrlArg)[0]
              : '',
            [`${selectedChecklist?.checkListId}.pdf`],
            [
              `${FILE_DESCRIPTION_PREFIXES.CHECKLIST}-${
                selectedChecklist?.checkList.externalId ||
                invoiceData?.serviceOrder?.externalId
              }.pdf`,
            ],
          )
        : generateChecklistBlob().then((checklistBlob) =>
            createFilesFromBlobArray(
              [checklistBlob],
              [`${selectedChecklist?.checkListId}.pdf`],
              [
                `${FILE_DESCRIPTION_PREFIXES.CHECKLIST}-${
                  selectedChecklist?.checkList.externalId ||
                  invoiceData?.serviceOrder?.externalId
                }.pdf`,
              ],
            ),
          )
      : Promise.resolve([]);

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

  const paymentTermDueDays =
    invoice?.additionalInfo?.paymentTerm?.data?.dueDays;
  const hasPaymentTermDueDays = typeof paymentTermDueDays === 'number';
  const dueDate = hasPaymentTermDueDays
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
    const checklistDownloadUrlResponse = await refetchChecklistDownloadUrl();

    // Ensure all download URLs are fetched before calling getExistingFiles
    await getExistingFiles(
      invoiceDownloadUrlResponse.data,
      invoiceWithUpdatedDueDate,
      companyNextId,
      workReportDownloadUrlResponse.data,
      checklistDownloadUrlResponse.data,
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

    if (errorMessage && !hasPaymentTermDueDays) {
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

  const cancelText = selectedLng === 'DE' ? 'Stornieren' : t('Cancel');
  const cancelItem = {
    label: cancelText,
    icon: <CancelIcon />,
    onClick: () => {
      setIsCancelledDialogOpen(true);
    },
  };

  const duplicateItem = {
    label: t('Duplicate'),
    icon: <CopyAll />,
    onClick: () => {
      navigate(`/invoices/new?invoiceId=${invoice.id}&isDuplicate=true`);
    },
  };

  const previewItem = {
    label: t('Preview'),
    icon: <RemoveRedEye />,
    onClick: () => {
      navigate(`/invoices/details/${invoice.id}`);
    },
  };

  const downloadItem = {
    label: t('Download'),
    icon: <FileDownload />,
    onClick: async () => {
      setSelectedInvoice(invoice);
      setActionType('DOWNLOAD');

      try {
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

        if (invoice.status === InvoiceStatus.DRAFT) {
          await generateBlobUrl({
            invoiceData: invoice,
            headerBlockUrl: headerUrl,
            footerBlockUrl: footerUrl,
            qrImageSrcProp,
          });
        } else {
          await refetchDownloadUrl();
        }
      } catch (err) {
        console.error(err);
      }
    },
  };

  const actions = useMemo(() => {
    const items: {
      label: string;
      icon: JSX.Element;
      onClick: () => void;
      disabled?: boolean;
    }[] = [];

    if (invoice.status === InvoiceStatus.DRAFT) {
      items.push({
        label: t('Send'),
        icon: <SendIcon />,
        onClick: handleOpenSendInvoiceModal,
        disabled: isChecklistImageLoading,
      });
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      items.push(previewItem, ...[downloadItem]);
    } else if (invoice.status === InvoiceStatus.DRAFT) {
      items.push(
        previewItem,
        {
          label: t('Print'),
          icon: <Print />,
          onClick: async () => {
            setIsConfirmPrintDialogOpen(true);
            setSelectedInvoice(invoice);

            refetchDownloadUrl();
          },
        },
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}/edit`);
          },
        },
        {
          label: t('Delete'),
          icon: <DeleteIcon />,
          onClick: () => {
            setIsDeleteDialogOpen(true);
          },
        },
        ...[downloadItem],
      );
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => handleOpenPaymentDialog(),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...[downloadItem],
        cancelItem,
      );
    } else if (invoice.status === InvoiceStatus.EXPIRED) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Send Overdue Notice'),
          icon: <SendIcon />,
          onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => handleOpenPaymentDialog(),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...[downloadItem],
        cancelItem,
      );
    } else if (invoice.status === InvoiceStatus.PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...[downloadItem],
      );
    } else if (invoice.status === InvoiceStatus.PARTIALLY_PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => handleOpenPaymentDialog(),
        },
        {
          label: t('Send Overdue Notice'),
          icon: <SendIcon />,
          onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...[downloadItem],
      );
    } else if (invoice.status === InvoiceStatus.CREDITED) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => handleOpenPaymentDialog(),
        },
        {
          label: t('Print'),
          icon: <Print />,
          onClick: async () => {
            setIsConfirmPrintDialogOpen(true);
            setSelectedInvoice(invoice);

            refetchDownloadUrl();
          },
        },
        ...[downloadItem],
        cancelItem,
      );
    }

    if (invoice.type === InvoiceType.FULL) {
      items.push(duplicateItem);
    }

    if (invoice.sentDate && invoice.status !== InvoiceStatus.DRAFT) {
      return items.filter(
        (item) => item.label !== t('Edit') && item.label !== t('Delete'),
      );
    }

    return items;
  }, [downloadUrl, invoice, t, companyNextNumber?.value]);

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

  const onPrintInvoice = async () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage && !hasPaymentTermDueDays) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setIsConfirmPrintDialogOpen(false);

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

    if (invoice.status === InvoiceStatus.DRAFT) {
      if (invoice.externalId.trim() === '') {
        await updateInvoiceAsync(
          {
            data: formatInvoiceViewToUpdateInvoice({
              ...invoice,
              externalId: companyNextNumber?.value!,
              dueDate,
            }),
            invoiceId: invoice.id,
          },
          {
            onSuccess: async () => {
              const updatedInvoiceData = await refetchInvoiceData();
              const blob = await generateBlobUrl({
                invoiceData: updatedInvoiceData?.data!,
                headerBlockUrl: headerUrl,
                footerBlockUrl: footerUrl,
                invoiceNumber: updatedInvoiceData?.data?.externalId,
                qrImageSrcProp,
              });

              const uploadPath = `${serviceCompanyId}/invoices`;

              const invoiceXML = await getXInvoiceOperation(
                updatedInvoiceData?.data!,
                {
                  forceGet: true,
                  invoiceNumber: updatedInvoiceData?.data?.externalId,
                },
              );

              if (blob) {
                const fileNames: string[] = [
                  `${updatedInvoiceData?.data?.id}.pdf`,
                ];
                const files = await createFilesFromBlobArray(
                  [blob!],
                  fileNames,
                );
                await uploadFiles({
                  files: [...files, ...invoiceXML],
                  uploadPath,
                });
                const pdfPath = `${uploadPath}/${updatedInvoiceData?.data?.id}.pdf`;
                const xmlPath = `${uploadPath}/${updatedInvoiceData?.data?.id}.xml`;

                await printInvoice(
                  {
                    id: updatedInvoiceData?.data?.id!,
                    body: {
                      pdfPath,
                      xmlPath,
                      externalId: updatedInvoiceData?.data?.externalId!,
                      dueDate:
                        updatedInvoiceData?.data?.dueDate ||
                        dateToString(new Date()),
                      sentDate:
                        updatedInvoiceData?.data?.sentDate ||
                        dateToString(new Date()),
                    },
                  },
                  {
                    onSuccess: async () => {
                      setActionType('PRINT');
                    },
                  },
                );
              }
            },
          },
        );
      } else {
        const blob = await generateBlobUrl({
          invoiceData: invoiceWithUpdatedDueDate,
          headerBlockUrl: headerUrl,
          footerBlockUrl: footerUrl,
          invoiceNumber: invoice.externalId,
          qrImageSrcProp,
        });

        const invoiceXML = await getXInvoiceOperation(
          invoiceWithUpdatedDueDate,
          {
            forceGet: true,
            invoiceNumber: invoice.externalId,
          },
        );

        const uploadPath = `${serviceCompanyId}/invoices`;

        if (blob) {
          const fileNames: string[] = [`${invoice.id}.pdf`];
          const files = await createFilesFromBlobArray([blob!], fileNames);
          await uploadFiles({files: [...files, ...invoiceXML], uploadPath});
          const pdfPath = `${uploadPath}/${invoice.id}.pdf`;
          const xmlPath = `${uploadPath}/${invoice.id}.xml`;

          await printInvoice(
            {
              id: invoice.id!,
              body: {
                pdfPath,
                xmlPath,
                externalId: invoice.externalId!,
                dueDate,
                sentDate: invoice.sentDate || dateToString(new Date()),
              },
            },
            {
              onSuccess: async () => {
                setActionType('PRINT');
              },
            },
          );
        }
      }
    } else {
      await printInvoice(
        {
          id: invoice.id!,
          body: {
            pdfPath: invoice.additionalInfo.pdfPath,
            xmlPath: invoice.additionalInfo.xmlPath,
            externalId: invoice.externalId!,
            dueDate: invoice.dueDate || dateToString(new Date()),
            sentDate: invoice.sentDate || dateToString(new Date()),
          },
        },
        {
          onSuccess: async () => {
            await refetchDownloadUrl();
            setPdfPathToDownload(
              downloadUrl ? Object.values(downloadUrl)[0] : '',
            );
            setActionType('PRINT');
          },
        },
      );
    }
  };

  const doPrint = async () => {
    const PDFDownloadURLResponse = await refetchDownloadUrl();
    const XMLDownloadURLResponse = await refetchXMLDownloadUrl();

    const PDFDownloadURL =
      PDFDownloadURLResponse.data?.[invoice.additionalInfo.pdfPath];
    const XMLDownloadURL =
      XMLDownloadURLResponse.data?.[invoice.additionalInfo.xmlPath!];

    // Fetch XML file
    const response = await fetch(XMLDownloadURL!);
    const xmlText = await response.text();

    printJS({
      printable: PDFDownloadURL,
      type: 'pdf',
      showModal: true,
      onPrintDialogClose: () => {
        const {invoiceFormat} = invoice.propertyOwner.additionalInfo;
        if (
          invoiceFormat === InvoiceFormat.PDF_AND_XML ||
          invoiceFormat === InvoiceFormat.XML
        ) {
          setXmlHtmlContent(xmlText);
        }
      },
    });

    setActionType('');
    setPdfPathToDownload('');
  };

  const doDownload = async () => {
    const {invoiceFormat} = invoice.propertyOwner.additionalInfo;

    const shouldDownloadXML =
      invoiceFormat === InvoiceFormat.XML ||
      invoiceFormat === InvoiceFormat.PDF_AND_XML;

    if (invoice.status === InvoiceStatus.DRAFT) {
      if (pdfPathToDownload && actionType === 'DOWNLOAD') {
        if (shouldDownloadXML) {
          const response = await getXInvoiceByInvoiceId({
            invoiceId: invoice.id,
            params: {
              dueDate: invoice.dueDate!,
              sentDate:
                invoice.sentDate ?? formatDate(new Date(), 'yyyy-MM-dd')!,
              externalId: invoice.externalId ?? companyNextNumber?.value!,
            },
          });

          const xmlBlob = new Blob([response], {type: 'application/xml'});

          const xmlBlobURL = URL.createObjectURL(xmlBlob!);
          downloadFile(xmlBlobURL, {extensionArg: '.xml'});
        }

        downloadFile(); // pdf
        setPdfPathToDownload('');
        setActionType('');
      }
    } else if (
      actionType === 'DOWNLOAD' &&
      downloadUrl?.[invoice.additionalInfo.pdfPath!]
    ) {
      const [xmlDownloadUrlData] = await Promise.all([refetchXMLDownloadUrl()]);

      downloadFile(downloadUrl?.[invoice.additionalInfo.pdfPath]); // pdf

      if (shouldDownloadXML && invoice.additionalInfo.xmlPath) {
        downloadFile(
          xmlDownloadUrlData.data?.[invoice.additionalInfo.xmlPath],
          {extensionArg: '.xml'},
        );
      }

      setActionType('');
    }

    if (invoice.status !== InvoiceStatus.DRAFT && actionType === 'PRINT') {
      setPdfPathToDownload(downloadUrl?.[invoice.additionalInfo.pdfPath!]!);
    }
  };

  useEffect(() => {
    if (xmlHtmlContent) {
      printJS({
        printable: 'xml-content',
        type: 'html',
        showModal: true,
        style: `
          #xml-content {
            white-space: break-spaces;
          }
        `,
      });

      setXmlHtmlContent('');
    }
  }, [xmlHtmlContent]);

  useEffect(() => {
    const isSent = invoice?.status === InvoiceStatus.NOT_PAID;

    if (actionType === 'PRINT' && isSent) {
      doPrint();
    }
  }, [actionType, invoice]);

  useEffect(() => {
    doDownload();
  }, [downloadUrl]);

  useEffect(() => {
    refetchDownloadUrl();
  }, [updatedInvoice]);

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
        />
      )}

      {isSendEmailDialogOpen ? (
        <SendEmailDialog
          open={isSendEmailDialogOpen}
          onConfirm={() => setIsSendEmailDialogOpen(false)}
          onClose={() => {
            setIsSendEmailDialogOpen(false);
            setSelectedInvoice(null);
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
          callback={async (emailRecord) => {
            try {
              setIsSendingEmail(true);
              const checkListInfo = selectedChecklist!;
              const isDraftInvoice = invoice.status === InvoiceStatus.DRAFT;
              const invoiceUploadPath = `${serviceCompanyId}/invoices`;
              const workReportUploadPath = `${serviceCompanyId}/serviceOrders/${invoice?.serviceOrder?.id}/report`;
              const checklistUploadPath = `${serviceCompanyId}/serviceOrders/${selectedInvoice?.serviceOrder?.id}/checkLists/${checkListInfo?.technicianId}`;
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
                    forceGet: true,
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

              if (activeSignature && activeSignature.content.images) {
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
                    externalId:
                      invoiceData?.externalId! || companyNextNumber?.value!,
                    dueDate,
                    sentDate: dateToString(new Date()), // Updating the invoice send date to reflect when it was actually send
                    email: {
                      email: '',
                      subject: emailRecord.subject,
                      content: emailRecord.content,
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
                                attachment.uri ===
                                signatureAttachment.contentId,
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
            } catch (error) {
              setIsSendingEmail(false);
              throw error;
            }
          }}
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
        onConfirm={onPrintInvoice}
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
      {/* Hidden container for XML content to be printed */}
      <div id="xml-content">
        <XMLViewer
          indentSize={4}
          theme={{fontFamily: 'Montserrat'}}
          xml={xmlHtmlContent}
        />
      </div>
    </Box>
  );
};
