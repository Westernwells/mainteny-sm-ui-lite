import {useEffect, useMemo, useState} from 'react';
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
import {formatGrossAmount, useCurrentCurrency} from 'utils/currency';
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
import {SendEmailDialog} from 'components/SendEmailDialog';
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
import {validateDueDate} from 'utils/invoice-utils';
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
import {FileWithPreview, MappedFile} from 'components/MyDropZone/MyDropzone';
import {ServiceCompanyNumberType} from 'models/service-company';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import ChecklistPdf from 'pages/ServiceOrderDetails/Tabs/Checklist/ChecklistPdf';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import useFetchAndConvertMultipleImages from 'hooks/useFetchAndConvertMultipleImages';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
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

export const ViewInvoice = ({invoice, invoiceActivities}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const {
    data: updatedInvoice,
    isFetched,
    refetch: refetchInvoiceData,
  } = useInvoiceDetail(invoice.id);

  const {
    data: downloadUrl,
    isLoading: isLoadingDownloadUrl,
    refetch: refetchDownloadUrl,
  } = useDownloadUrl(isFetched ? [updatedInvoice!.additionalInfo.pdfPath] : []);

  const {data: customer} = useGetCustomer(updatedInvoice?.propertyOwner.id!);

  const [filePathToDownload, setFilePathToDownload] = useState('');

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {data: companyNextNumber} = useCompanyNextNumber(
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

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [reportToUpdate]);

  const generateBlobUrl = async (invoiceData: InvoiceView) => {
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

    if (
      invoice.type === InvoiceType.CREDIT_NOTE ||
      invoice.type === InvoiceType.FULL ||
      invoice.type === InvoiceType.AGGREGATE ||
      invoice.type === InvoiceType.PARTIAL ||
      invoice.type === InvoiceType.UPFRONT ||
      invoice.type === InvoiceType.FINAL
    ) {
      // TODO: will remove when all invoice types PDFs are ready
      const blob = await pdf(
        <PdfTemplate
          userInfo={user?.userAccount}
          currentCurrency={currentCurrency}
          invoice={invoiceData}
          selectedLng={company?.language}
          translate={translate}
          previousInvoices={previousInvoicesProp}
          headerPath={headerUrl[headerInfo?.path]}
          headerInfo={headerInfo}
          footerPath={footerUrl[footerInfo?.path]}
          footerInfo={footerInfo}
          customer={customer}
        />,
      ).toBlob();
      const blobURL = URL.createObjectURL(blob);
      setFilePathToDownload(blobURL);
      return blob;
    }
  };

  const handleDownload = async () => {
    setActionType('DOWNLOAD');
    if (invoice.status === InvoiceStatus.DRAFT) {
      await generateBlobUrl(invoice);
    } else {
      await refetchDownloadUrl();
      setFilePathToDownload(
        downloadUrl ? downloadUrl?.[invoice.additionalInfo.pdfPath!]! : '',
      );
    }
  };

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
          setIsSendEmailDialogOpen(true);
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
      ![InvoiceStatus.CANCELLED, InvoiceStatus.PARTIALLY_PAID].includes(
        invoice.status,
      )
    ) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    }

    return items;
  }, [downloadUrl, invoice.status, t]);

  useEffect(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      if (filePathToDownload && actionType === 'DOWNLOAD') {
        downloadFile();
        setFilePathToDownload('');
        setActionType('');
      }
    } else if (
      actionType === 'DOWNLOAD' &&
      downloadUrl?.[invoice.additionalInfo.pdfPath!]
    ) {
      downloadFile();
      setActionType('');
    }
  }, [actionType]);

  useEffect(() => {
    if (updatedInvoice?.status === InvoiceStatus.DRAFT) {
      generateBlobUrl(updatedInvoice);
    }
  }, [
    updatedInvoice,
    headerUrl[headerInfo?.path],
    footerUrl[footerInfo?.path],
    updatedInvoice?.type === InvoiceType.CREDIT_NOTE ||
    updatedInvoice?.type === InvoiceType.FULL ||
    updatedInvoice?.type === InvoiceType.AGGREGATE
      ? null
      : previousInvoices,
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
              const blobFile = await generateBlobUrl(updatedInvoiceData?.data!);

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
        const blobFile = await generateBlobUrl(invoice);

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

  const onInvoiceSend = () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setIsSendEmailDialogOpen(true);
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
                <Typography variant="caption">
                  {serviceOrder?.description}
                </Typography>
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
        primaryButtonAction={() => {
          if (
            invoice.status === InvoiceStatus.DRAFT ||
            invoice.status === InvoiceStatus.EXPIRED
          ) {
            onInvoiceSend();
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={downloadUrl ? !!Object.values(downloadUrl)[0].length : !!''}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={invoice.id}
        email={
          invoice.propertyOwner?.additionalInfo.billingEmail ||
          invoice.propertyOwner?.contact.email
        }
        subject={generateEmailSubject()}
        content={invoice.description}
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
              description: `${description}.pdf`,
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
              const workReportUploadPath = `${serviceCompanyId}/reports`;
              const workReportFiles = await generateAndUploadFiles(
                workReportBlob,
                [`${report?.id}.pdf`],
                workReportUploadPath,
                report?.externalId || report?.number || '',
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
                selectedChecklist?.checkList.number || '',
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
                          `${updatedInvoiceData.data?.id}.pdf`,
                        ];
                        const files = await createFilesFromBlobArray(
                          [blobFile!],
                          fileNames,
                        );
                        await uploadFiles({files, uploadPath});
                        const pdfPath = `${uploadPath}/${updatedInvoiceData.data?.id}.pdf`;

                        const allFiles = await generateAdditionalFiles(
                          files.map((file) => ({
                            ...file,
                            uri: `${uploadPath}/${file.name}`,
                            description:
                              `${updatedInvoiceData.data?.externalId}.pdf` ||
                              '',
                            name: file.name,
                            type: file.type,
                          })),
                          updatedInvoiceData?.data!,
                        );

                        await sendInvoice({
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
