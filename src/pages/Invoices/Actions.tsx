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
import {SendEmailDialog} from 'components/SendEmailDialog';
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
import {validateDueDate} from 'utils/invoice-utils';
import {
  useCompanyById,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  dateToString,
  fetchFile,
} from 'utils/utils';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceCompanyNumberType} from 'models/service-company';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {pdf} from '@react-pdf/renderer';
import CreditNotePdfTemplate from 'components/pdf-templates/CreditNotePdfTemplate';
import FinalInvoicePdfTemplate from 'components/pdf-templates/FinalInvoicePdfTemplate';
import FullInvoicePdfTemplate from 'components/pdf-templates/FullInvoicePdfTemplate';
import PartialInvoicePdfTemplate from 'components/pdf-templates/PartialInvoicePdfTemplate';
import {FileWithPreview, MappedFile} from 'components/MyDropZone/MyDropzone';
import {formatInvoiceViewToUpdateInvoice} from 'pages/InvoiceDetails/utils';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import useFetchAndConvertMultipleImages from 'hooks/useFetchAndConvertMultipleImages';
import {ChecklistStatus, ServiceOrderReportView} from 'models/service-order';
import ChecklistPdf from 'pages/ServiceOrderDetails/Tabs/Checklist/ChecklistPdf';
import {getSignatureKeys} from 'utils/service-order-utils';
import {useQueryClientStorageData} from 'hooks/useClientStorage';

interface Props {
  invoice: InvoiceView;
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

export const Actions = ({invoice, isInvoiceList = true}: Props) => {
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

  const [actionType, setActionType] = useState('');
  const [pdfPathToDownload, setPdfPathToDownload] = useState('');

  const [shouldFetchNextNumber, setShouldFetchNextNumber] = useState(false);

  const {data: company} = useCompanyById(
    user?.userAccount.serviceCompany.id,
    shouldFetchNextNumber,
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

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: companyNextNumber} = useCompanyNextNumber(
    {
      type: ServiceCompanyNumberType.INVOICE,
    },
    user?.userAccount.serviceCompany.id,
    shouldFetchNextNumber,
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
  const {mutateAsync: sendInvoice} = useSendInvoice();

  const {data: previousInvoices = []} = useFetchServiceOrderInvoices(
    invoice?.serviceOrder?.id,
    {
      enabled: false,
    },
  );

  const sortedPreviousInvoices = useMemo(
    () =>
      [...previousInvoices]
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
    );

  const signaturePath =
    signatureDownloadUrls[
      selectedChecklist?.additionalInfo.technicianSignature || ''
    ];

  const signatureImageUrl = useFetchAndConvertImage(signaturePath);

  const generateChecklistBlob = async () => {
    const blob = await pdf(
      <ChecklistPdf
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={invoice?.serviceOrder}
        selectedChecklist={selectedChecklist}
        sortedChecklistComponents={sortedChecklistComponents}
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

  const generateBlobUrl = async (invoiceData: InvoiceView) => {
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

    const blob = await pdf(
      <PdfTemplate
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        invoice={invoiceData}
        selectedLng={company?.language}
        translate={translate}
        previousInvoices={sortedPreviousInvoices.slice(
          0,
          sortedPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
        )}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setPdfPathToDownload(blobURL);
    return blob;
  };

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [reportToUpdate]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSendInvoiceModal = useCallback(() => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setIsSendEmailDialogOpen(true);
    setShouldFetchNextNumber(true);
    setSelectedInvoice(invoice);
  }, [invoice]);

  const cancelText = selectedLng === 'DE' ? 'Stornieren' : t('Cancel');
  const cancelItem = {
    label: cancelText,
    icon: <CancelIcon />,
    onClick: () => {
      setIsCancelledDialogOpen(true);
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
      if (invoice.status === InvoiceStatus.DRAFT) {
        await generateBlobUrl(invoice);
      } else {
        await refetchDownloadUrl();
        setPdfPathToDownload(
          downloadUrl ? downloadUrl?.[invoice.additionalInfo.pdfPath!]! : '',
        );
      }
    },
  };

  const action = useMemo(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      return (
        <Tooltip title={t('Send')} placement="left" arrow>
          <span>
            <IconButton
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
          <IconButton onClick={() => setIsDialogOpen(true)}>
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
  }, [invoice.status, downloadUrl]);

  const actions = useMemo(() => {
    const items = [];

    if (invoice.status === InvoiceStatus.CANCELLED) {
      items.push(
        previewItem,
        {
          label: t('Send'),
          icon: <SendIcon />,
          onClick: () => {
            setIsSendEmailDialogOpen(true);
            setShouldFetchNextNumber(true);
            setSelectedInvoice(invoice);
          },
        },
        ...[downloadItem],
      );
    } else if (invoice.status === InvoiceStatus.DRAFT) {
      items.push(
        previewItem,
        {
          label: t('Print'),
          icon: <Print />,
          onClick: async () => {
            setIsConfirmPrintDialogOpen(true);
            setSelectedInvoice(invoice);
            setShouldFetchNextNumber(true);
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
          onClick: () => setIsDialogOpen(true),
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
          onClick: () => setIsDialogOpen(true),
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
          onClick: () => setIsDialogOpen(true),
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
          onClick: () => setIsDialogOpen(true),
        },
        {
          label: t('Print'),
          icon: <Print />,
          onClick: async () => {
            setIsConfirmPrintDialogOpen(true);
            setSelectedInvoice(invoice);
            setShouldFetchNextNumber(true);
            refetchDownloadUrl();
          },
        },
        ...[downloadItem],
        cancelItem,
      );
    }

    if (invoice.sentDate && invoice.status !== InvoiceStatus.DRAFT) {
      return items.filter(
        (item) => item.label !== t('Edit') && item.label !== t('Delete'),
      );
    }

    return items;
  }, [downloadUrl, invoice.status, t]);

  const onPrintInvoice = async () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

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
              const blob = await generateBlobUrl(updatedInvoiceData?.data!);

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
        const blob = await generateBlobUrl(invoice);
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

      <MarkAsPaidDialog
        invoice={invoice}
        open={isDialogOpen}
        onConfirm={() => setIsDialogOpen(false)}
        onClose={() => setIsDialogOpen(false)}
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={invoice.id}
        callback={async (emailRecord) => {
          setIsSendEmailDialogOpen(false);

          const generateAndUploadFiles = async (
            blob: Blob,
            fileNames: string[],
            uploadPath: string,
            description: string,
          ): Promise<MappedFile[]> => {
            const files = await createFilesFromBlobArray(
              blob ? [blob] : [],
              fileNames,
            );
            await uploadFiles({files, uploadPath});

            return files.map((file) => ({
              ...file,
              uri: `${uploadPath}/${file.name}`,
              description,
              name: file.name,
              type: file.type,
            }));
          };

          const generateAdditionalFiles = async (
            baseFiles: MappedFile[],
            invoiceData: InvoiceView,
          ): Promise<FileWithPreview[]> => {
            let allFiles: MappedFile[] = baseFiles;
            const checkListInfo = invoiceData?.serviceOrder?.checkLists![0];

            if (invoiceData.additionalInfo.includeWorkReport) {
              const workReportBlob = await generateWorkReportBlob();
              const workReportUploadPath = `${serviceCompanyId}/serviceOrders/${invoiceData.serviceOrder?.id}/report`;
              const workReportFiles = await generateAndUploadFiles(
                workReportBlob,
                [`${report?.id}.pdf`],
                workReportUploadPath,
                `${report?.externalId}.pdf` || `${report?.number}.pdf` || '',
              );
              allFiles = allFiles.concat(workReportFiles);
            }

            if (invoiceData.additionalInfo.includeCheckList) {
              const checklistBlob = await generateChecklistBlob();
              const checklistUploadPath = `${serviceCompanyId}/serviceOrders/${invoiceData?.serviceOrder?.id}/checkLists/${checkListInfo?.technicianId}`;
              const checklistFiles = await generateAndUploadFiles(
                checklistBlob,
                [`${checkListInfo?.checkListId}.pdf`],
                checklistUploadPath,
                `${selectedChecklist?.checkList.number}.pdf` || '',
              );
              allFiles = allFiles.concat(checklistFiles);
            }

            return allFiles.reduce<FileWithPreview[]>(
              (newArr, obj) => [
                ...newArr,
                {
                  ...obj,
                  type: obj.type,
                  uri: `${obj.uri}`,
                  description: obj.description,
                },
              ],
              [],
            );
          };

          const handleInvoiceUpdateAndSend = async () => {
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

                      const blobFile = await generateBlobUrl(
                        updatedInvoiceData?.data!,
                      );

                      const uploadPath = `${serviceCompanyId}/invoices`;

                      if (blobFile) {
                        const fileNames: string[] = [
                          `${updatedInvoiceData?.data?.id}.pdf`,
                        ];
                        const files = await createFilesFromBlobArray(
                          [blobFile!],
                          fileNames,
                        );
                        await uploadFiles({files, uploadPath});
                        const pdfPath = `${uploadPath}/${updatedInvoiceData?.data?.id}.pdf`;

                        const allFiles = await generateAdditionalFiles(
                          files.map((file) => ({
                            ...file,
                            uri: `${uploadPath}/${file.name}`,
                            description:
                              `${updatedInvoiceData?.data?.externalId}.pdf` ||
                              '',
                            name: file.name,
                            type: file.type,
                          })),
                          updatedInvoiceData?.data!,
                        );

                        await sendInvoice({
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
                            email: {
                              email: '',
                              subject: emailRecord.subject,
                              content: emailRecord.content,
                              emails: [emailRecord.email],
                              attachments: allFiles,
                            },
                          },
                        });
                      }
                    },
                  },
                );
              } else {
                const blobFile = await generateBlobUrl(invoice);

                const uploadPath = `${serviceCompanyId}/invoices`;

                if (blobFile) {
                  const fileNames: string[] = [`${invoice.id}.pdf`];
                  const files = await createFilesFromBlobArray(
                    [blobFile!],
                    fileNames,
                  );
                  await uploadFiles({files, uploadPath});
                  const pdfPath = `${uploadPath}/${invoice.id}.pdf`;

                  const allFiles = await generateAdditionalFiles(
                    files.map((file) => ({
                      ...file,
                      uri: `${uploadPath}/${file.name}`,
                      description: `${invoice.externalId}.pdf` || '',
                      name: file.name,
                      type: file.type,
                    })),
                    invoice,
                  );

                  await sendInvoice({
                    id: invoice.id!,
                    body: {
                      pdfPath,
                      externalId: invoice.externalId!,
                      dueDate: invoice.dueDate || dateToString(new Date()),
                      sentDate: invoice.sentDate || dateToString(new Date()),
                      email: {
                        email: '',
                        subject: emailRecord.subject,
                        content: emailRecord.content,
                        emails: [emailRecord.email],
                        attachments: allFiles,
                      },
                    },
                  });
                }
              }
            } else {
              const uploadPath = `${serviceCompanyId}/invoices`;
              const blob = await fetchFile(
                downloadUrl ? Object.values(downloadUrl)[0] : '',
              );
              const fileNames: string[] = [`${invoice.id}.pdf`];
              const files = await createFilesFromBlobArray([blob], fileNames);

              const allFiles = await generateAdditionalFiles(
                files.map((file) => ({
                  ...file,
                  uri: `${uploadPath}/${file.name}`,
                  description: `${invoice.externalId}.pdf` || '',
                  name: file.name,
                  type: file.type,
                })),
                invoice,
              );

              await sendInvoice({
                id: invoice.id!,
                body: {
                  pdfPath: invoice.additionalInfo.pdfPath,
                  externalId: invoice.externalId!,
                  dueDate: invoice.dueDate || dateToString(new Date()),
                  sentDate: invoice.sentDate || dateToString(new Date()),
                  email: {
                    email: '',
                    subject: emailRecord.subject,
                    content: emailRecord.content,
                    emails: [emailRecord.email],
                    attachments: allFiles,
                  },
                },
              });
            }
          };

          handleInvoiceUpdateAndSend();
        }}
        email={
          invoice.propertyOwner?.additionalInfo.billingEmail ||
          invoice.propertyOwner?.contact.email
        }
        subject={generateEmailSubject()}
        content={invoice.description}
      />

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
