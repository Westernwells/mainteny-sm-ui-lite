import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReplayIcon from '@mui/icons-material/Replay';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {PDFContainer} from 'components/PDFContainer';
import {FormLabel} from 'components/form/FormLabel';
import {EmptySection} from 'components/EmptySection';
import {
  InvoiceActivityView,
  InvoiceStatus,
  InvoiceType,
  InvoiceTypeMap,
  InvoiceView,
} from 'models/invoice';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {
  QRCurrencyCode,
  createQrData,
  formatGrossAmount,
  useCurrentCurrency,
} from 'utils/currency';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {
  useDeleteInvoice,
  useFetchServiceOrderInvoices,
  useInvoiceDetail,
  useInvoicePaymentStatus,
  usePrintInvoice,
  useSendInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  getServiceOrderStatusColor,
  getSignatureKeys,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {useFormatDate} from 'hooks/useFormatDate';
import {useSnackbar} from 'notistack';
import CustomSnackbar from 'components/CustomSnackbar';
import {LinearProgress, linearProgressClasses} from '@mui/material';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import {CheckListComponentType} from 'models/checklist';
import {ChecklistStatus, ServiceOrderReportView} from 'models/service-order';
import {
  getQrErrorMessage,
  svgToJpegPng,
  validateDueDate,
} from 'utils/invoice-utils';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {pdf} from '@react-pdf/renderer';
import {
  useCompanyById,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  dateToString,
  fetchFile,
} from 'utils/utils';
import CreditNotePdfTemplate from 'components/pdf-templates/CreditNotePdfTemplate';
import PdfPreview from 'pages/OrderArticle/PDFPreview';
import FullInvoicePdfTemplate from 'components/pdf-templates/FullInvoicePdfTemplate';
import PartialInvoicePdfTemplate from 'components/pdf-templates/PartialInvoicePdfTemplate';
import FinalInvoicePdfTemplate from 'components/pdf-templates/FinalInvoicePdfTemplate';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {ServiceCompanyNumberType} from 'models/service-company';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import ChecklistPdf from 'pages/ServiceOrderDetails/Tabs/Checklist/ChecklistPdf';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import useFetchAndConvertMultipleImages from 'hooks/useFetchAndConvertMultipleImages';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useEffectAfterMount} from 'hooks/useEffectAfterMount';
import DOMPurify from 'dompurify';
// eslint-disable-next-line import/no-unresolved
import {SwissQRBill} from 'swissqrbill/svg';
import _, {debounce} from 'lodash';
import {Notes} from './Notes/EditNotes';
import {InvoiceActivities} from './InvoiceActivities';
import {formatInvoiceViewToUpdateInvoice, stripHtmlTags} from './utils';

interface Props {
  invoice: InvoiceView;
  invoiceActivities: InvoiceActivityView[];
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

enum FILE_DESCRIPTION_PREFIXES {
  INVOICE = 'INV',
  WORK_REPORT = 'WR',
  CHECKLIST = 'CHK',
}

export const ViewInvoice = ({invoice, invoiceActivities}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [qrImageSrc, setQrImageSrc] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);

  const {data: updatedInvoice, refetch: refetchInvoiceData} = useInvoiceDetail(
    invoice.id,
  );
  const memorizedUpdateInvoiceData = useMemo(
    () =>
      updatedInvoice
        ? {
            ...updatedInvoice,
            subject:
              updatedInvoice?.subject === 'Regular'
                ? 'Invoice'
                : updatedInvoice?.subject,
          }
        : undefined,
    [updatedInvoice, invoice],
  );
  const {
    data: downloadUrl,
    isLoading: isLoadingDownloadUrl,
    refetch: refetchDownloadUrl,
  } = useDownloadUrl(
    invoice?.additionalInfo.pdfPath ? [invoice?.additionalInfo.pdfPath] : [],
  );

  const [filePathToDownload, setFilePathToDownload] = useState('');

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {data: companyNextNumber, refetch: refetchCompanyNextNumber} =
    useCompanyNextNumber(
      {
        type: ServiceCompanyNumberType.INVOICE,
      },
      user?.userAccount.serviceCompany.id,
    );

  const translate = useMemo(
    () => (key: string) => {
      if (company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}, isLoading: isHeaderUrlLoading} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}, isLoading: isFooterUrlLoading} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {mutateAsync: uploadFiles} = useUploadFiles('');

  const {downloadFile} = useDownloadFileWithCustomName(
    invoice.externalId || invoice.number,
    filePathToDownload ||
      (downloadUrl ? downloadUrl[invoice?.additionalInfo.pdfPath] : ''),
  );

  const [actionType, setActionType] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const {mutate: markAsPaid} = useInvoicePaymentStatus();
  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: printInvoice} = usePrintInvoice({
    shouldNavigate: false,
  });
  const {mutateAsync: sendInvoice} = useSendInvoice({
    shouldNavigate: false,
  });

  const {mutateAsync: updateInvoiceAsync} = useUpdateInvoice();

  const {data: previousInvoices = []} = useFetchServiceOrderInvoices(
    invoice.serviceOrder?.id,
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

  const {data: serviceOrderCheckLists} = useQueryServiceOrderChecklists({
    serviceOrderId: serviceOrder?.id || '',
    options: {
      enabled: !!serviceOrder?.id,
    },
  });

  const completedChecklists = serviceOrderCheckLists?.filter(
    (c) => c.additionalInfo.status === ChecklistStatus.COMPLETED,
  );

  const checklistSummaries = useMemo(() => {
    const data = completedChecklists?.map((checklist) => {
      const componentsWithoutHead =
        checklist?.checkList.components.filter(
          (c) => c.type !== CheckListComponentType.HEAD,
        ) ?? [];
      const doneList = componentsWithoutHead.filter((item) => {
        if (item.type === CheckListComponentType.TEXT) {
          return !!item.additionalInfo.note;
        }

        if (item.additionalInfo.moreInfoInNote && !!item.additionalInfo.note) {
          return true;
        }

        return (item.additionalInfo.answer?.length || 0) > 0;
      });

      return {
        name: checklist?.checkList.name,
        all: componentsWithoutHead.length,
        done: doneList.length,
        percentComplete:
          componentsWithoutHead.length === 0
            ? 0
            : Math.round(
                (doneList.length / componentsWithoutHead.length) * 100,
              ),
      };
    });
    return data;
  }, [serviceOrderCheckLists]);

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

  const technicianUserAccount = invoice?.serviceOrder?.schedules.find(
    (s) => s.technician.id === selectedOption.technicianId,
  )?.technician.userAccount;

  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

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

    const blob = await pdf(
      <ChecklistPdf
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        selectedChecklist={selectedChecklist}
        sortedChecklistComponents={sortedChecklistComponentsCloned}
        signaturePath={signatureImageUrl}
        technicianName={technicianName}
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

  const [report, setReport] = useState<ServiceOrderReportView | undefined>(
    serviceOrder?.reports?.[0],
  );

  const reportToUpdate = serviceOrder?.reports?.find(
    (r) => r.externalId === report?.externalId,
  );

  const signatureKeys = getSignatureKeys(
    serviceOrder!,
    report,
    serviceCompanyId,
  );

  const {data: downloadUrls = {}} = useDownloadUrl(
    report?.signatures?.map((item) => item.fileResource.uri) ?? [],
    {enabled: !!report?.signatures?.length},
  );

  const {data: imageDownloadUrls = {}} = useDownloadUrl(
    report?.attachments?.map((item) => item.fileResource.uri) ?? [],
    {enabled: true},
  );

  const schedule = invoice?.serviceOrder?.schedules.find(
    (s) => s.technician.id === report?.technicianId,
  );

  const technicianSignatureImage = useFetchAndConvertImage(
    downloadUrls[signatureKeys.TECHNICIAN],
  );

  const customerSignatureImage = useFetchAndConvertImage(
    downloadUrls[signatureKeys.CUSTOMER],
  );

  const {convertedImages} = useFetchAndConvertMultipleImages(
    imageDownloadUrls,
    report?.attachments,
  );

  const {refetch: refetchWorkReportDownloadUrl} = useDownloadUrl(
    report?.additionalInfo.pdfPath ? [report?.additionalInfo.pdfPath] : [],
    {enabled: false},
  );

  const generateWorkReportBlob = async () => {
    const blob = await pdf(
      <WorkReportTemplate
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        report={report}
        schedule={schedule}
        technicianSignatureImage={technicianSignatureImage}
        customerSignatureImage={customerSignatureImage}
        workReportPictures={convertedImages}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
      />,
    ).toBlob();
    return blob;
  };

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [reportToUpdate]);

  const generateBlobUrl = async ({
    invoiceData,
    headerBlockUrl,
    footerBlockUrl,
    invoiceNumber,
    setInState = true,
  }: {
    invoiceData: InvoiceView;
    headerBlockUrl: {[key: string]: string};
    footerBlockUrl: {[key: string]: string};
    invoiceNumber?: string;
    setInState?: boolean;
  }) => {
    let PdfTemplate;

    if (
      invoice.type === InvoiceType.FULL ||
      invoice.type === InvoiceType.AGGREGATE
    ) {
      PdfTemplate = FullInvoicePdfTemplate;
    } else if (invoice.type === InvoiceType.CREDIT_NOTE) {
      PdfTemplate = CreditNotePdfTemplate;
    } else if (
      invoice.type === InvoiceType.PARTIAL ||
      invoice.type === InvoiceType.UPFRONT
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
      ? sortedPreviousInvoices.slice(
          0,
          sortedPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
        )
      : [];

    const blob = await pdf(
      <PdfTemplate
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        invoice={invoiceData}
        selectedLng={company?.language}
        translate={translate}
        previousInvoices={previousInvoicesProp}
        headerPath={headerBlockUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerBlockUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        nextCompanyExternalId={
          invoiceNumber || translate('Automatically assigned')
        }
        qrImageSrc={qrImageSrc}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    if (setInState) setFilePathToDownload(blobURL);
    return blob;
  };

  const handleDownload = async () => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      const blob = await generateBlobUrl({
        invoiceData: invoice,
        headerBlockUrl: headerUrl,
        footerBlockUrl: footerUrl,
        setInState: false,
      });
      const blobURL = URL.createObjectURL(blob);
      downloadFile(blobURL);
    } else {
      const downloadUrlData = await refetchDownloadUrl();
      downloadFile(downloadUrlData.data?.[invoice.additionalInfo.pdfPath]);
    }
  };

  // Helper function to fetch and create files
  const fetchAndCreateFiles = async (
    url: string,
    argfileNames: string[],
    argfileDescriptions: string[],
  ) => {
    const blob = await fetchFile(url);
    const filesFromBlob = await createFilesFromBlobArray(
      [blob],
      argfileNames,
      argfileDescriptions,
    );
    return filesFromBlob;
  };

  const getExistingFiles = async (
    invoiceDownloadUrl:
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
      return;
    }

    let allFiles: FileWithPreview[] = [];
    const fileNames: string[] = [`${invoiceData?.id}.pdf`];
    const fileDescriptions: string[] = [
      `${FILE_DESCRIPTION_PREFIXES.INVOICE}-${
        invoiceData?.externalId || nextNumber
      }.pdf`,
    ];

    // Base file operations
    const baseFileOperations =
      invoiceData?.status !== InvoiceStatus.DRAFT
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
          }).then((blobFile) =>
            createFilesFromBlobArray([blobFile!], fileNames, fileDescriptions),
          )) || Promise.resolve([]);

    // Work report operations
    const workReportOperations = invoiceData?.additionalInfo.includeWorkReport
      ? report?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE
        ? fetchAndCreateFiles(
            workReportDownloadUrlArg
              ? Object.values(workReportDownloadUrlArg)[0]
              : '',
            [`${report?.id}.pdf`],
            [
              `${FILE_DESCRIPTION_PREFIXES.WORK_REPORT}-${
                report?.externalId || invoice?.serviceOrder?.externalId
              }.pdf`,
            ],
          )
        : generateWorkReportBlob().then((workReportBlob) =>
            createFilesFromBlobArray(
              [workReportBlob],
              [`${report?.id}.pdf`],
              [
                `${FILE_DESCRIPTION_PREFIXES.WORK_REPORT}-${
                  report?.externalId || invoice?.serviceOrder?.externalId
                }.pdf`,
              ],
            ),
          )
      : Promise.resolve([]);

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
    const [baseFiles, workReportFiles, checklistFiles] = await Promise.all([
      baseFileOperations,
      workReportOperations,
      checklistOperations,
    ]);

    // Combine all files
    allFiles = [...baseFiles, ...workReportFiles, ...checklistFiles];

    // Set existing files
    setExistingFiles(allFiles);
  };

  const qrCurrency: QRCurrencyCode =
    currentCurrency?.code === 'EUR' || currentCurrency?.code === 'CHF'
      ? currentCurrency.code
      : 'EUR';

  const checkValidQrCode = useCallback(
    debounce(async (qrInvoice: InvoiceView) => {
      if (user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled) {
        try {
          const qrBillData = createQrData(
            qrCurrency,
            qrInvoice,
            currentCurrency,
            user?.userAccount,
          );

          const qrBillSvg = new SwissQRBill(qrBillData);

          svgToJpegPng(
            qrBillSvg.element as unknown as SVGSVGElement,
            (result) => {
              setQrImageSrc(result);
            },
            {format: 'jpeg', quality: 1},
          );
          setQrError(null);
          return '';
        } catch (error) {
          if (error instanceof Error) {
            setQrError(error.message);
            return error.message;
          }
        }
      }
    }, 500),
    [user, currentCurrency, qrCurrency],
  );

  useEffect(() => {
    if (
      invoice &&
      user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled
    ) {
      checkValidQrCode(invoice);
    }
  }, [invoice]);

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

  const refetchPDFs = async (companyNextId?: string) => {
    // Refetch the download URLs for invoice, work report, and checklist
    const workReportDownloadUrlResponse = await refetchWorkReportDownloadUrl();
    const checklistDownloadUrlResponse = await refetchChecklistDownloadUrl();

    // Ensure all download URLs are fetched before calling getExistingFiles
    await refetchDownloadUrl().then(async (res) => {
      await getExistingFiles(
        res.data,
        invoice,
        companyNextId,
        workReportDownloadUrlResponse.data,
        checklistDownloadUrlResponse.data,
      );
    });
  };

  const handleOpenSendEmail = async (companyNextId?: string) => {
    const error = await checkValidQrCode(invoice);

    if (!error) {
      setIsLoadingFiles(true);
      setIsSendEmailDialogOpen(true);
      try {
        await refetchPDFs(companyNextId);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  const handleOpenSendInvoiceModal = useCallback(async () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    if (companyNextNumber) {
      handleOpenSendEmail(companyNextNumber.value);
    }
  }, [invoice, companyNextNumber, generateBlobUrl]);

  const actions = useMemo(() => {
    const items = [];

    if (invoice.status === InvoiceStatus.EXPIRED) {
      items.push({
        label: t('Send Overdue Notice'),
        icon: <SendIcon />,
        onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
      });
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.push({
        label: t('Resend'),

        icon: <ReplayIcon />,
        onClick: () => {
          handleOpenSendInvoiceModal();
        },
      });
    }

    if (
      ![InvoiceStatus.NOT_PAID, InvoiceStatus.EXPIRED].includes(invoice.status)
    ) {
      items.push({
        label: t('Edit'),
        icon: <Edit />,
        onClick: () => {
          navigate(`/invoices/details/${invoice.id}/edit`);
        },
      });
    }

    if (
      ![InvoiceStatus.NOT_PAID, InvoiceStatus.EXPIRED].includes(invoice.status)
    ) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      });
    } else if (invoice.sentDate || invoice.status === InvoiceStatus.CANCELLED) {
      return items.filter((item) => item.label !== t('Edit'));
    }

    if (
      ![
        InvoiceStatus.CANCELLED,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.CREDITED,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    }

    return items;
  }, [downloadUrl, invoice.status, t, companyNextNumber?.value]);

  useEffect(() => {
    if (
      memorizedUpdateInvoiceData?.status === InvoiceStatus.DRAFT &&
      !qrError
    ) {
      generateBlobUrl({
        invoiceData: memorizedUpdateInvoiceData,
        headerBlockUrl: headerUrl,
        footerBlockUrl: footerUrl,
      });
    }
  }, [
    memorizedUpdateInvoiceData,
    headerUrl[headerInfo?.path],
    footerUrl[footerInfo?.path],
    memorizedUpdateInvoiceData?.type === InvoiceType.CREDIT_NOTE ||
    memorizedUpdateInvoiceData?.type === InvoiceType.FULL ||
    memorizedUpdateInvoiceData?.type === InvoiceType.AGGREGATE
      ? null
      : previousInvoices,
    qrError,
    qrImageSrc,
  ]);

  useEffect(() => {
    if (actionType === 'PRINT' && filePathToDownload) {
      if (filePathToDownload) {
        printJS({
          printable: filePathToDownload,
          type: 'pdf',
          showModal: true,
        });
      }
      setActionType('');
      setFilePathToDownload('');
    }
  }, [actionType, filePathToDownload]);

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
    setIsConfirmPrintDialogOpen(false);

    if (invoice.status === InvoiceStatus.DRAFT) {
      if (invoice.externalId.trim() === '') {
        await updateInvoiceAsync(
          {
            data: formatInvoiceViewToUpdateInvoice({
              ...invoice,
              externalId: companyNextNumber?.value!,
            }),
            invoiceId: invoice.id,
          },
          {
            onSuccess: async () => {
              const updatedInvoiceData = await refetchInvoiceData();
              const blobFile = await generateBlobUrl({
                invoiceData: updatedInvoiceData?.data!,
                headerBlockUrl: headerUrl,
                footerBlockUrl: footerUrl,
                invoiceNumber: updatedInvoiceData?.data?.externalId,
              });

              const uploadPath = `${serviceCompanyId}/invoices`;

              if (blobFile) {
                const fileNames: string[] = [
                  `${updatedInvoiceData.data?.id}.pdf`,
                ];
                const files = await createFilesFromBlobArray(
                  [blobFile!],
                  fileNames,
                );
                await uploadFiles({files, uploadPath});
                const pdfPath = `${uploadPath}/${updatedInvoiceData.data?.id}.pdf`;

                await printInvoice(
                  {
                    id: updatedInvoiceData.data?.id!,
                    body: {
                      pdfPath,
                      externalId: updatedInvoiceData.data?.externalId!,
                      dueDate:
                        updatedInvoiceData.data?.dueDate ||
                        dateToString(new Date()),
                      sentDate:
                        updatedInvoiceData.data?.sentDate ||
                        dateToString(new Date()),
                    },
                  },
                  {
                    onSuccess: async () => {
                      await refetchDownloadUrl();
                      setActionType('PRINT');
                    },
                  },
                );
              }
            },
          },
        );
      } else {
        const blobFile = await generateBlobUrl({
          invoiceData: invoice,
          headerBlockUrl: headerUrl,
          footerBlockUrl: footerUrl,
          invoiceNumber: invoice.externalId,
        });

        const uploadPath = `${serviceCompanyId}/invoices`;

        if (blobFile) {
          const fileNames: string[] = [`${invoice.id}.pdf`];
          const files = await createFilesFromBlobArray([blobFile!], fileNames);
          await uploadFiles({files, uploadPath});
          const pdfPath = `${uploadPath}/${invoice.id}.pdf`;

          await printInvoice(
            {
              id: invoice.id!,
              body: {
                pdfPath,
                externalId: invoice.externalId!,
                dueDate: invoice.dueDate || dateToString(new Date()),
                sentDate: invoice.sentDate || dateToString(new Date()),
              },
            },
            {
              onSuccess: async () => {
                await refetchDownloadUrl();
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
            externalId: invoice.externalId!,
            dueDate: invoice.dueDate || dateToString(new Date()),
            sentDate: invoice.sentDate || dateToString(new Date()),
          },
        },
        {
          onSuccess: async () => {
            await refetchDownloadUrl();
            setFilePathToDownload(
              downloadUrl ? Object.values(downloadUrl)[0] : '',
            );
            setActionType('PRINT');
          },
        },
      );
    }
  };

  const generateEmailSubject = () => {
    const name =
      invoice?.type === InvoiceType.CREDIT_NOTE
        ? invoice.serviceCompany?.name
        : invoice.propertyOwner?.name;
    const type =
      invoice?.type === InvoiceType.CREDIT_NOTE ? 'Credit Note' : 'Invoice';

    return t(`${name} - ${t(type)} {{invoiceNumber}}`, {
      invoiceNumber: invoice?.number ?? '',
    });
  };

  return (
    <Box>
      <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
        <Grid item xs={12}>
          <Grid container flexDirection="row">
            <Grid item xs={4}>
              <StatusChip
                label={getInvoiceStatusStyles(invoice.status).label}
                color={getInvoiceStatusStyles(invoice.status).color}
                size="small"
                variant="filled"
              />
            </Grid>

            <Grid
              item
              xs={4}
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              gap={0.5}>
              <Notes invoice={invoice!} />
            </Grid>

            <Grid item xs={4} textAlign="end">
              {downloadUrl && (
                <Button
                  label="Download Invoice"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'medium',
                    sx: {
                      background: 'transparent',
                    },
                    onClick: handleDownload,
                    startIcon: <FileDownloadIcon />,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={8}>
          <PageCard
            containerStyles={{mb: '1.5em'}}
            contentContainerStyles={{display: 'flex', gap: '4em'}}>
            <Box>
              <FormLabel text="Invoice Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1" fontWeight="600">
                {invoice.externalId || t('Automatically assigned')}
              </Typography>
            </Box>

            <Box>
              <FormLabel text="Invoice Type" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1" fontWeight="600">
                {t(`${InvoiceTypeMap[invoice.type]} invoice`)}
              </Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1" fontWeight="600">
                {formatGrossAmount(invoice.totalAmount)}
              </Typography>
            </Box>
          </PageCard>

          {invoice.status === InvoiceStatus.DRAFT &&
            (invoice.type === InvoiceType.CREDIT_NOTE ||
              invoice.type === InvoiceType.FULL ||
              invoice.type === InvoiceType.AGGREGATE ||
              invoice.type === InvoiceType.PARTIAL ||
              invoice.type === InvoiceType.UPFRONT ||
              invoice.type === InvoiceType.FINAL) && (
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <PdfPreview blobUrl={filePathToDownload} />
              </Box>
            )}

          {invoice.status !== InvoiceStatus.DRAFT && (
            <Box>
              {invoice &&
              invoice.additionalInfo &&
              invoice.additionalInfo.pdfGenerationStatus ===
                PdfGenerationStatus.DONE &&
              !isLoadingDownloadUrl ? (
                <PDFContainer
                  url={downloadUrl ? Object.values(downloadUrl)[0] : ''}
                />
              ) : (
                <PageCard>
                  <EmptySection
                    label="The PDF generation is in progress, please try again after sometime. We apologize for the inconvenience."
                    size="small"
                  />
                </PageCard>
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          {/* SERVICE ORDER CARD */}

          {!!serviceOrder && (
            <PageCard
              headerLabel="Service Job"
              headerIcon={
                <ManageSearchOutlinedIcon sx={{color: '#8F9BB380'}} />
              }
              contentContainerStyles={{
                display: 'flex',
                gap: '1em',
                flexDirection: 'column',
                mx: 0,
                pt: '0.5rem',
              }}
              headerActionIcon={
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              }
              headerStyles={{
                mx: 0,
                px: '1rem',
              }}
              handleAction={() =>
                navigate(`/orders/details/${serviceOrder?.id}`)
              }>
              <Box>
                <Box sx={{float: 'right'}}>
                  {serviceOrder && (
                    <StatusChip
                      color={getServiceOrderStatusColor(serviceOrder.status)}
                      label={serviceOrderStatusToString(serviceOrder.status)}
                      size="small"
                    />
                  )}
                </Box>
                <FormLabel text="Job Number" sx={{color: 'text.main'}} />
                <Typography
                  variant="caption"
                  component="div"
                  color={theme.palette.primary.mainLight}
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    p: '0.2em 0em 0.5em 0em',
                  }}>
                  {serviceOrder?.number}
                </Typography>
                {serviceOrder && (
                  <Typography
                    variant="caption"
                    sx={{color: 'text.secondary', fontSize: '0.7rem'}}
                    display="block"
                    mt="-0.25rem">
                    {t('Created on {{creationDate}}', {
                      creationDate: formatDate(serviceOrder.meta.createdAt),
                    })}
                  </Typography>
                )}
                <Box display="flex" alignItems="center" gap=".2em" mt="1em">
                  <ServiceOrderIcons
                    serviceOrderType={serviceOrder?.type}
                    size="small"
                  />
                  <ServiceOrderTypeText
                    serviceOrderType={serviceOrder?.type}
                    capitalizeText
                  />
                </Box>
                <Typography
                  variant="caption"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(serviceOrder?.description),
                  }}
                />
              </Box>
            </PageCard>
          )}

          {/* WORK REPORT CARD */}
          {serviceOrder?.report && (
            <PageCard
              headerLabel={t('Work Report')}
              headerIcon={<GradingOutlinedIcon sx={{color: '#8F9BB380'}} />}
              headerStyles={{
                mx: 0,
                mt: 0,
                px: '1rem',
              }}
              headerActionIcon={
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              }
              handleAction={() =>
                navigate(`/orders/details/${serviceOrder?.id}?tab=1`)
              }>
              {serviceOrder.actualStartTime &&
              serviceOrder.report?.description ? (
                <Typography variant="body1">
                  {formatDate(serviceOrder.actualStartTime)}:
                  {stripHtmlTags(serviceOrder.report.description)}
                </Typography>
              ) : null}
            </PageCard>
          )}

          {/* CHECKLIST CARD */}
          {(completedChecklists?.length ?? 0) > 0 && (
            <PageCard
              headerLabel={t('Checklist')}
              headerIcon={<FactCheckOutlinedIcon sx={{color: '#8F9BB380'}} />}
              headerStyles={{
                pt: '11px',
                mx: 0,
                px: '1rem',
              }}
              headerActionIcon={
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              }
              handleAction={() =>
                navigate(`/orders/details/${serviceOrder?.id}?tab=2`)
              }
              contentContainerStyles={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}>
              {checklistSummaries?.map((c, idx) => (
                <Box key={`${c.name}-${idx}`}>
                  <Typography variant="body1" sx={{m: '0em 0em 0.8em 0em'}}>
                    {c.name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" sx={{fontWeight: '600'}}>
                      {c.done}/{c.all} {t('options')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.percentComplete}% {t('complete')}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={c.percentComplete}
                    sx={{
                      backgroundColor: `${theme.palette.text.secondary}`,
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: '#4CAF50',
                      },
                    }}
                  />
                </Box>
              ))}
            </PageCard>
          )}

          {/* INVOICE ACTIVITY CARD */}

          {invoiceActivities?.length ? (
            <InvoiceActivities
              activities={invoiceActivities}
              invoice={invoice}
            />
          ) : null}
        </Grid>
      </Grid>

      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (invoice.id) markAsPaid(invoice.id);
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as paid"
        content="Do you want to mark this invoice as paid?"
        helperText="This action is irreversible."
      />

      <BottomDrawer
        isOpen={invoice.status !== InvoiceStatus.PAID}
        primaryButtonLabel={
          invoice.status === InvoiceStatus.DRAFT ||
          invoice.status === InvoiceStatus.EXPIRED
            ? 'Send'
            : 'Payment'
        }
        primaryButtonAction={async () => {
          if (
            invoice.status === InvoiceStatus.DRAFT ||
            invoice.status === InvoiceStatus.EXPIRED
          ) {
            handleOpenSendInvoiceModal();
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={!isChecklistImageLoading}
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => {
          setIsSendEmailDialogOpen(false);
          setExistingFiles([]);
        }}
        onClose={() => {
          setIsSendEmailDialogOpen(false);
          setExistingFiles([]);
        }}
        id={invoice.id}
        existingFiles={existingFiles}
        isLoadingFiles={isLoadingFiles}
        callback={async (emailRecord) => {
          try {
            setIsSendingEmail(true);
            const checkListInfo = selectedChecklist!;
            const isDraftInvoice = invoice.status === InvoiceStatus.DRAFT;
            const invoiceUploadPath = `${serviceCompanyId}/invoices`;
            const workReportUploadPath = `${serviceCompanyId}/serviceOrders/${invoice?.serviceOrder?.id}/report`;
            const checklistUploadPath = `${serviceCompanyId}/serviceOrders/${invoice?.serviceOrder?.id}/checkLists/${checkListInfo?.technicianId}`;
            const fileNames: string[] = [`${invoice?.id}.pdf`];
            const allAttachments = emailRecord.attachments || [];

            // 1. Upload work report files
            const workReportFiles = emailRecord.attachments?.filter((el) =>
              el.description?.includes(FILE_DESCRIPTION_PREFIXES.WORK_REPORT),
            );
            if (
              workReportFiles?.length &&
              report?.additionalInfo.pdfGenerationStatus !==
                PdfGenerationStatus.DONE
            ) {
              await uploadFiles({
                files: workReportFiles,
                uploadPath: workReportUploadPath,
              });
            }

            // 2. Upload checklist files
            const checklistFiles = emailRecord.attachments?.filter((el) =>
              el.description?.includes(FILE_DESCRIPTION_PREFIXES.CHECKLIST),
            );
            if (
              checklistFiles?.length &&
              selectedChecklist?.additionalInfo.pdfGenerationStatus !==
                PdfGenerationStatus.DONE
            ) {
              await uploadFiles({
                files: checklistFiles,
                uploadPath: checklistUploadPath,
              });
            }

            // 3. Upload invoice files if 'DRAFT' invoice
            if (isDraftInvoice) {
              const invoiceFiles = emailRecord.attachments?.filter((el) =>
                el.description?.includes(FILE_DESCRIPTION_PREFIXES.INVOICE),
              );
              if (invoiceFiles?.length) {
                await uploadFiles({
                  files: invoiceFiles,
                  uploadPath: invoiceUploadPath,
                });
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

            const sendEmail = async (invoiceData: InvoiceView) => {
              await sendInvoice({
                id: invoiceData?.id!,
                body: {
                  pdfPath: isDraftInvoice
                    ? `${invoiceUploadPath}/${fileNames[0]}`
                    : invoiceData?.additionalInfo?.pdfPath!,
                  externalId:
                    invoiceData?.externalId || companyNextNumber?.value || '',
                  dueDate: invoiceData?.dueDate || dateToString(new Date()),
                  sentDate: invoiceData?.sentDate || dateToString(new Date()),
                  email: {
                    email: '',
                    subject: emailRecord.subject,
                    content: emailRecord.content,
                    emails: emailRecord.emails,
                    ccEmails: emailRecord.ccEmails,
                    bccEmails: emailRecord.bccEmails,
                    attachments: allAttachments.reduce<FileWithPreview[]>(
                      (newArr: FileWithPreview[], obj) => {
                        const isInvoiceFile = obj.description?.includes(
                          FILE_DESCRIPTION_PREFIXES.INVOICE,
                        );
                        const isWorkReportFile = obj.description?.includes(
                          FILE_DESCRIPTION_PREFIXES.WORK_REPORT,
                        );
                        const isChecklistFile = obj.description?.includes(
                          FILE_DESCRIPTION_PREFIXES.CHECKLIST,
                        );
                        const isAttachedFile = obj.path && !obj.description;

                        let uploadPath = '';

                        if (isAttachedFile || isInvoiceFile) {
                          uploadPath = invoiceUploadPath;
                        } else if (isWorkReportFile) {
                          uploadPath = workReportUploadPath;
                        } else if (isChecklistFile) {
                          uploadPath = checklistUploadPath;
                        }

                        return [
                          ...newArr,
                          {
                            ...obj,
                            type: obj.type,
                            uri: isInvoiceFile
                              ? isDraftInvoice
                                ? `${invoiceUploadPath}/${fileNames[0]}`
                                : invoice?.additionalInfo.pdfPath!
                              : `${uploadPath}/${obj.name}`,
                            description: isAttachedFile
                              ? obj.name.split('.')[0]
                              : obj?.description,
                          },
                        ];
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
      />

      <MarkAsPaidDialog
        invoice={invoice}
        open={isDialogOpen}
        onConfirm={() => setIsDialogOpen(false)}
        onClose={() => setIsDialogOpen(false)}
      />

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            deleteInvoice(
              {invoiceId: invoice.id, shouldNavigate: true},
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
                },
              },
            );
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
      <ConfirmPrintInvoice
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintInvoice}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};
