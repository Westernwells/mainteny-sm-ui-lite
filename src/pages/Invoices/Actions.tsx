import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
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
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {LanguageContext} from 'context/LanguageProvider';
import {
  useCancelInvoice,
  useDeleteInvoice,
  useFetchServiceOrderInvoices,
  useInvoiceDetail,
  usePrintInvoice,
  useSendInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {InvoiceStatus, InvoiceView, InvoiceType} from 'models/invoice';
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
  fetchFile,
} from 'utils/utils';
import {QRCurrencyCode, createQrData, useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {pdf} from '@react-pdf/renderer';
import CreditNotePdfTemplate from 'components/pdf-templates/CreditNotePdfTemplate';
import FinalInvoicePdfTemplate from 'components/pdf-templates/FinalInvoicePdfTemplate';
import FullInvoicePdfTemplate from 'components/pdf-templates/FullInvoicePdfTemplate';
import PartialInvoicePdfTemplate from 'components/pdf-templates/PartialInvoicePdfTemplate';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {formatInvoiceViewToUpdateInvoice} from 'pages/InvoiceDetails/utils';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import useFetchAndConvertMultipleImages from 'hooks/useFetchAndConvertMultipleImages';
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
  isInvoiceList?: boolean;
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
  isInvoiceList = true,
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

  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string) => {
      if (company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView | null>(
    null,
  );

  const {data: updatedInvoice, refetch: refetchInvoiceData} = useInvoiceDetail(
    selectedInvoice?.id!,
  );

  const {data: downloadUrl, refetch: refetchDownloadUrl} = useDownloadUrl(
    selectedInvoice?.additionalInfo.pdfPath
      ? [selectedInvoice?.additionalInfo.pdfPath]
      : [pdfPathToDownload],
    {enabled: false},
  );

  const {mutateAsync: uploadFiles} = useUploadFiles('');
  const {mutateAsync: updateInvoiceAsync} = useUpdateInvoice();
  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: cancelInvoice} = useCancelInvoice();
  const {mutateAsync: printInvoice} = usePrintInvoice({shouldNavigate: false});
  const {mutateAsync: sendInvoice} = useSendInvoice({
    shouldNavigate: true,
  });

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
        qrImageSrc={qrImageSrc}
        nextCompanyExternalId={
          invoiceNumber || translate('Automatically assigned')
        }
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
      return;
    }

    let allFiles: FileWithPreview[] = [];
    const fileNames: string[] = [`${invoiceData?.id}.pdf`];
    const fileDescriptions: string[] = [
      `${FILE_DESCRIPTION_PREFIXES.INVOICE}-${
        invoiceData?.externalId || nextNumber
      }.pdf`,
    ];

    // Helper function to fetch and create files
    const fetchAndCreateFiles = async (
      url: string,
      argfileNames: string[],
      argfileDescriptions: string[],
    ) => {
      const blob = await fetchFile(url);
      return createFilesFromBlobArray(
        [blob],
        argfileNames,
        argfileDescriptions,
      );
    };

    // Base file operations
    const baseFileOperations =
      invoiceData?.status !== InvoiceStatus.DRAFT
        ? fetchAndCreateFiles(
            invoiceDownloadUrlArg
              ? Object.values(invoiceDownloadUrlArg)[0]
              : '',
            fileNames,
            fileDescriptions,
          )
        : await generateBlobUrl({
            invoiceData,
            headerBlockUrl: headerUrl,
            footerBlockUrl: footerUrl,
            invoiceNumber: companyNextNumber?.value,
            setInState: false,
          }).then((blobFile) =>
            createFilesFromBlobArray([blobFile!], fileNames, fileDescriptions),
          );

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

  const checkValidQrCode = useCallback(
    async (qrInvoice: InvoiceView) => {
      if (
        !user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled &&
        invoice.status !== InvoiceStatus.DRAFT
      ) {
        return '';
      }

      try {
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

  const refetchPDFs = async (companyNextId?: string) => {
    // Refetch the download URLs for invoice, work report, and checklist
    const invoiceDownloadUrlResponse = await refetchDownloadUrl();
    const workReportDownloadUrlResponse = await refetchWorkReportDownloadUrl();
    const checklistDownloadUrlResponse = await refetchChecklistDownloadUrl();

    // Ensure all download URLs are fetched before calling getExistingFiles
    await getExistingFiles(
      invoiceDownloadUrlResponse.data,
      invoice,
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

    if (errorMessage) {
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
      navigate(`/invoices/new?invoiceId=${invoice.id}`);
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
        if (
          user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled &&
          !qrImageSrc &&
          invoice.status === InvoiceStatus.DRAFT
        ) {
          await checkValidQrCode(invoice);
          return;
        }

        if (invoice.status === InvoiceStatus.DRAFT) {
          await generateBlobUrl({
            invoiceData: invoice,
            headerBlockUrl: headerUrl,
            footerBlockUrl: footerUrl,
          });
        } else {
          const downloadUrlData = await refetchDownloadUrl();
          setPdfPathToDownload(
            downloadUrlData.data
              ? downloadUrlData.data?.[invoice.additionalInfo.pdfPath!]!
              : '',
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
  };

  const action = useMemo(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      return (
        <Tooltip title={t('Send')} placement="left" arrow>
          <span>
            <IconButton
              disabled={isChecklistImageLoading}
              onClick={handleOpenSendInvoiceModal}
              sx={{color: 'action.active'}}>
              <SendIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      );
    }
    if (invoice.status === InvoiceStatus.NOT_PAID) {
      return (
        <Tooltip title={t('Payment')} placement="left" arrow>
          <IconButton onClick={handleOpenPaymentDialog}>
            <Payments fontSize="small" sx={{color: 'action.active'}} />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={t('Preview')} placement="left" arrow>
        <IconButton onClick={() => navigate(`/invoices/details/${invoice.id}`)}>
          <RemoveRedEye fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
    );
  }, [invoice, downloadUrl, companyNextNumber?.value]);

  const actions = useMemo(() => {
    const items = [];

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
  }, [downloadUrl, invoice.status, t, companyNextNumber?.value, invoice.type]);

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

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setIsConfirmPrintDialogOpen(false);

    if (
      user?.userAccount.serviceCompany.settings.invoiceQRCodeEnabled &&
      !qrImageSrc &&
      invoice.status === InvoiceStatus.DRAFT
    ) {
      await checkValidQrCode(invoice);
      return;
    }

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
              const blob = await generateBlobUrl({
                invoiceData: updatedInvoiceData?.data!,
                headerBlockUrl: headerUrl,
                footerBlockUrl: footerUrl,
                invoiceNumber: updatedInvoiceData?.data?.externalId,
              });

              const uploadPath = `${serviceCompanyId}/invoices`;

              if (blob) {
                const fileNames: string[] = [
                  `${updatedInvoiceData?.data?.id}.pdf`,
                ];
                const files = await createFilesFromBlobArray(
                  [blob!],
                  fileNames,
                );
                await uploadFiles({files, uploadPath});
                const pdfPath = `${uploadPath}/${updatedInvoiceData?.data?.id}.pdf`;

                await printInvoice(
                  {
                    id: updatedInvoiceData?.data?.id!,
                    body: {
                      pdfPath,
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
          invoiceData: invoice,
          headerBlockUrl: headerUrl,
          footerBlockUrl: footerUrl,
          invoiceNumber: invoice.externalId,
        });
        const uploadPath = `${serviceCompanyId}/invoices`;

        if (blob) {
          const fileNames: string[] = [`${invoice.id}.pdf`];
          const files = await createFilesFromBlobArray([blob!], fileNames);
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
            setPdfPathToDownload(
              downloadUrl ? Object.values(downloadUrl)[0] : '',
            );
            setActionType('PRINT');
          },
        },
      );
    }
  };

  useEffect(() => {
    if (actionType === 'PRINT' && pdfPathToDownload) {
      if (pdfPathToDownload) {
        printJS({
          printable: pdfPathToDownload,
          type: 'pdf',
          showModal: true,
        });
      }
      setActionType('');
      setPdfPathToDownload('');
    }
  }, [actionType, pdfPathToDownload]);

  useEffect(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      if (pdfPathToDownload && actionType === 'DOWNLOAD') {
        downloadFile();
        setPdfPathToDownload('');
        setActionType('');
      }
    } else if (
      actionType === 'DOWNLOAD' &&
      downloadUrl?.[invoice.additionalInfo.pdfPath!]
    ) {
      downloadFile();
      setActionType('');
    }

    if (invoice.status !== InvoiceStatus.DRAFT && actionType === 'PRINT') {
      setPdfPathToDownload(downloadUrl?.[invoice.additionalInfo.pdfPath!]!);
    }
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
    <Box>
      {isInvoiceList && action}

      <Tooltip title={t('More')} placement="right" arrow>
        <IconButton onClick={handleClick}>
          <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
      <Menu
        id="actions-menu"
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
          callback={async (emailRecord) => {
            try {
              setIsSendingEmail(true);
              const checkListInfo = selectedChecklist!;
              const isDraftInvoice = invoice.status === InvoiceStatus.DRAFT;
              const invoiceUploadPath = `${serviceCompanyId}/invoices`;
              const workReportUploadPath = `${serviceCompanyId}/serviceOrders/${invoice?.serviceOrder?.id}/report`;
              const checklistUploadPath = `${serviceCompanyId}/serviceOrders/${selectedInvoice?.serviceOrder?.id}/checkLists/${checkListInfo?.technicianId}`;
              const fileNames: string[] = [`${selectedInvoice?.id}.pdf`];
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
                      invoiceData?.externalId! || companyNextNumber?.value!,
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
    </Box>
  );
};
