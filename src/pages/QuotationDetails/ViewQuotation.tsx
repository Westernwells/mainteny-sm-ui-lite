import {useContext, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {FormLabel} from 'components/form/FormLabel';
import {BottomDrawer} from 'components/BottomDrawer';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {ConfirmPrintQuotation} from 'components/ConfirmPrintQuotation';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {
  useDeleteQuotation,
  usePrintQuotation,
  useReplyQuotation,
  useSendQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  QuotationActivityView,
  QuotationStatus,
  QuotationSubItemRecord,
  QuotationView,
} from 'models/quotation';
import {centsToMoney, formatCurrency, useCurrentCurrency} from 'utils/currency';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {createFilesFromBlobArray, fetchFile} from 'utils/utils';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {ElevatorView} from 'models/elevator';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import queryString from 'query-string';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOn from '@mui/icons-material/LocationOn';
import {Business, Tag} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import {Dialog} from 'components/Dialog';
import PdfPreview from 'pages/OrderArticle/PDFPreview';
import QuotationPdfTemplate from 'components/pdf-templates/QuotationPdfTemplate';
import {pdf} from '@react-pdf/renderer';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {EmptySection} from 'components/EmptySection';
import {PDFContainer} from 'components/PDFContainer';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from 'react-query';
import {stripHtmlTags} from 'utils/text-block';
import useQuotationMenuActions from 'hooks/useQuotationMenuActions';
import {companyLanguageContextMap} from 'utils/language';
import {EmailSignature} from 'models/employee';
import {FileResourceRecord} from 'models/media';
import {HeaderFooterInfoData} from 'models/misc';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {handleSignatureSmartly} from 'utils/rich-field-string';
import {quotationItemToQuotationItemRecord} from 'utils/quotation';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import useQuotationAmountDetail from 'hooks/useQuotationAmountDetail';
import {CreateServiceOrder} from './CreateServiceOrder';
import {ServiceOrderDetails} from './ServiceOrderDetails';
import {Notes} from './Notes';
import {QuotationActivities} from './QuotationActivities';
import {QuotationUnitsDataGrid} from './QuotationUnitsDataGrid';

interface Props {
  downloadUrl: string;
  quotation: QuotationView;
  quotationActivities: QuotationActivityView[];
  isLoadingDownloadUrl: boolean;
  refetchDownloadUrl: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<
    QueryObserverResult<
      {
        [key: string]: string;
      },
      unknown
    >
  >;
  pdfConfig: ClientReportForPDFConfig;
  headerInfo: HeaderFooterInfoData;
  footerInfo: HeaderFooterInfoData;
  headerUrl: string;
  footerUrl: string;
  quotationSubItems?: Record<string, QuotationSubItemRecord[]>;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const ViewQuotation = ({
  downloadUrl,
  quotation,
  quotationActivities,
  isLoadingDownloadUrl,
  refetchDownloadUrl,
  pdfConfig,
  headerInfo,
  footerInfo,
  headerUrl,
  footerUrl,
  quotationSubItems,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const {search} = useLocation();

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [isCreateForm, setIsCreateForm] = useState(false);
  const {elevatorId = ''} = queryString.parse(search);
  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {mutate: deleteQuotation} = useDeleteQuotation();

  const subItemsMap: Record<string, QuotationSubItemRecord[]> = Object.entries(
    quotationSubItems ?? {},
  ).reduce((acc, [parentId, subItems]) => {
    acc[parentId] = subItems.map((subItem) => ({
      ...subItem,
      parentId,
    }));
    return acc;
  }, {} as Record<string, QuotationSubItemRecord[]>);

  const {data: elevator} =
    typeof elevatorId === 'string'
      ? useElevatorById(elevatorId)
      : {data: undefined};

  const [unit, setUnit] = useState<ElevatorView | null>(elevator || null);
  const [blobFile, setBlobFile] = useState<Blob>();

  const [filePathToDownload, setFilePathToDownload] = useState('');

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {downloadFile} = useDownloadFileWithCustomName(
    quotation.number,
    filePathToDownload,
  );

  const [activeSignature, setActiveSignature] = useState<
    EmailSignature | undefined
  >();

  const {data: signatureUrls = {}} = useDownloadUrl(
    activeSignature?.content?.images || [],
  );

  const {mutateAsync: uploadFiles} = useUploadFiles('');

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const uploadPath = `${serviceCompanyId}/quotations`;

  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutateAsync: printQuotation} = usePrintQuotation();
  const {mutateAsync: sendQuotation, isLoading: sendingQuotation} =
    useSendQuotation({
      shouldNavigate: false,
    });

  const formik = useFormik({
    initialValues: {
      createServiceOrder: '',
    },
    onSubmit: () => {},
  });

  const handleSelectUnit = (row: ElevatorView) => {
    setUnit(row);
  };

  const onPrintQuotation = async () => {
    if (quotation.status !== QuotationStatus.DRAFT) {
      await printQuotation(
        {
          id: quotation.id,
          body: {
            pdfPath: quotation.additionalInfo.pdfPath ?? '',
            sentDate: '',
          },
        },
        {
          onSuccess: () => {
            setIsConfirmPrintDialogOpen(false);
            if (downloadUrl) {
              printJS({
                printable: downloadUrl,
                type: 'pdf',
                showModal: true,
              });
            }
          },
        },
      );

      setIsConfirmPrintDialogOpen(false);
      return;
    }

    const fileNames: string[] = [`${quotation.id}.pdf`];

    const files = await createFilesFromBlobArray([blobFile!], fileNames);
    await uploadFiles({files, uploadPath});

    await printQuotation(
      {
        id: quotation.id,
        body: {
          pdfPath: `${uploadPath}/${fileNames[0]}`,
          sentDate: '',
        },
      },
      {
        onSuccess: () => {
          setIsConfirmPrintDialogOpen(false);
          if (filePathToDownload) {
            printJS({
              printable: filePathToDownload,
              type: 'pdf',
              showModal: true,
            });
          }
        },
      },
    );
  };

  useEffect(() => {
    if (quotation) {
      const quotationElevator = quotation.elevator;
      setUnit(quotationElevator);
    }
  }, [quotation]);

  const transformedQuotationItems = useMemo(
    () =>
      quotation?.items.map((item) =>
        quotationItemToQuotationItemRecord(item, subItemsMap),
      ) || [],
    [quotation?.items, subItemsMap],
  );

  const quotationAmountDetail = useQuotationAmountDetail({
    quotationItems: transformedQuotationItems,
    quotationDiscount: quotation.additionalInfo.discount,
  });

  const generateBlobUrl = async () => {
    const blob = await pdf(
      <QuotationPdfTemplate
        serviceCompany={company}
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        quotation={quotation}
        selectedLng={company?.language}
        translate={translate}
        headerPath={headerUrl}
        headerInfo={headerInfo}
        footerPath={footerUrl}
        footerInfo={footerInfo}
        quotationItems={transformedQuotationItems}
        quotationAmountDetail={quotationAmountDetail}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();
    setBlobFile(blob);
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
    return blob;
  };

  useEffect(() => {
    generateBlobUrl();
  }, [
    quotation,
    headerUrl,
    footerUrl,
    quotationSubItems,
    quotationAmountDetail,
    fontStyles,
    primaryColor,
    secondaryColor,
    company,
  ]);

  const getExistingFiles = async (
    fileDownloadUrl:
      | {
          [key: string]: string;
        }
      | undefined,
  ) => {
    const fileNames = [`${quotation.id}.pdf`];
    const fileDescriptions = [`${quotation.externalId}.pdf`];

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

    const generateAndCreateFiles = async (
      argfileNames: string[],
      argfileDescriptions: string[],
    ) => {
      const blob = await generateBlobUrl();
      return createFilesFromBlobArray(
        [blob],
        argfileNames,
        argfileDescriptions,
      );
    };

    const files =
      quotation.status !== QuotationStatus.DRAFT
        ? await fetchAndCreateFiles(
            fileDownloadUrl ? Object.values(fileDownloadUrl)[0] : '',
            fileNames,
            fileDescriptions,
          )
        : await generateAndCreateFiles(fileNames, fileDescriptions);

    setExistingFiles(files);
  };

  const handleOpenSendEmail = async () => {
    setIsLoadingFiles(true);
    setIsSendEmailDialogOpen(true);
    // using then to wait for refetch and get download url
    try {
      await refetchDownloadUrl().then(async (res) => {
        await getExistingFiles(res.data);
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handlePrint = () => {
    if (quotation.status !== QuotationStatus.DRAFT && !isLoadingDownloadUrl)
      return onPrintQuotation;
    if (!isLoadingDownloadUrl) return () => setIsConfirmPrintDialogOpen(true);
  };

  const handleDownload = async () => {
    downloadFile();
  };

  const shouldShowDownloadAsPrimaryAction = [
    QuotationStatus.ACCEPTED,
    QuotationStatus.REJECTED,
  ].includes(quotation.status);

  const {actions} = useQuotationMenuActions({
    quotation,
    onDownload: !shouldShowDownloadAsPrimaryAction ? handleDownload : undefined,
    onDelete: () => setIsDeleteDialogOpen(true),
    onResend: handleOpenSendEmail,
    onMarkAccepted: () => setIsDialogOpen(true),
    onMarkRejected: () => setIsRejectedDialogOpen(true),
    onPrint: handlePrint(),
  });

  const {
    bottomDrawerPrimaryLabel,
    bottomDrawerPrimaryAction,
    disabled: disablePrimaryAction,
  }: {
    bottomDrawerPrimaryLabel: string;
    bottomDrawerPrimaryAction?: () => void;
    disabled?: boolean;
  } = useMemo(() => {
    if (shouldShowDownloadAsPrimaryAction)
      return {
        bottomDrawerPrimaryLabel: 'Download',
        bottomDrawerPrimaryAction: handleDownload,
        disabled: !filePathToDownload,
      };
    if (quotation.status === QuotationStatus.DRAFT)
      return {
        bottomDrawerPrimaryLabel: 'Send',
        bottomDrawerPrimaryAction: handleOpenSendEmail,
      };
    return {
      bottomDrawerPrimaryLabel: 'Mark Accepted',
      bottomDrawerPrimaryAction: () => setIsDialogOpen(true),
    };
  }, [quotation, filePathToDownload]);

  return (
    <Box>
      <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
        <Grid item xs={12}>
          <Grid container flexDirection="row">
            <Grid item xs={4}>
              <StatusChip
                label={getQuotationStatusStyles(quotation.status).label}
                color={getQuotationStatusStyles(quotation.status).color}
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
              <Notes quotation={quotation!} />
            </Grid>

            <Grid item xs={4} textAlign="end">
              {filePathToDownload && (
                <Button
                  label="Download Quotation"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'medium',
                    sx: {
                      background: 'transparent',
                    },
                    onClick: handleDownload,
                    disabled: !filePathToDownload,
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
            contentContainerStyles={{display: 'flex', gap: '1.5em'}}>
            <Box>
              <FormLabel text="Quotation Number" sx={{color: 'text.main'}} />
              <Typography
                data-testid="quotation-number"
                variant="subtitle1"
                fontWeight="600">
                {quotation.externalId || t('Unassigned')}
              </Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1" fontWeight="600">
                {formatCurrency(
                  centsToMoney(
                    currentCurrency.code,
                    quotation.totalAmount.netAmount,
                  ),
                  {currency: quotation.totalAmount.currency},
                )}
              </Typography>
            </Box>
          </PageCard>

          {quotation.status === QuotationStatus.DRAFT && (
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
              <PdfPreview blobUrl={filePathToDownload} />
            </Box>
          )}

          {quotation.status !== QuotationStatus.DRAFT && (
            <Box>
              {quotation &&
              quotation.additionalInfo &&
              quotation.additionalInfo.pdfPath &&
              !isLoadingDownloadUrl ? (
                <PDFContainer url={downloadUrl} />
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
          <PageCard
            headerLabel="Job"
            headerIcon={<ManageSearchOutlinedIcon sx={{color: '#8F9BB380'}} />}
            contentContainerStyles={{
              gap: '1em',
              mx: 0,
              pt: '1em',
              pb: '1.5em !important',
            }}
            headerStyles={{
              mx: 0,
              px: '1rem',
            }}
            headerActionIcon={
              quotation.additionalInfo &&
              'serviceOrderIds' in quotation.additionalInfo ? (
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              ) : undefined
            }
            handleAction={() =>
              navigate(
                `/orders/details/${
                  quotation?.additionalInfo?.serviceOrderIds?.[0] ?? ''
                }`,
              )
            }>
            {isCreateForm && (
              <Box mt=".5em" mb="0em">
                <Box>
                  {!!unit && (
                    <Box
                      sx={{
                        borderRadius: '4px',
                        mb: '2em',
                        padding: '0.75em 0.5em 1.5em 1em',
                        background:
                          'linear-gradient(0deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.1)),linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingLeft: '0.3em',
                        }}>
                        <Typography
                          variant="h6"
                          color="linear-gradient(0deg, #2196F3, #2196F3), linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))">
                          {unit?.model || quotation?.elevator?.model || '-'}
                        </Typography>
                        <IconButton onClick={() => setIsModalOpen(true)}>
                          <EditOutlinedIcon
                            sx={{
                              fontSize: '1em',
                              color: theme.palette.text.secondary,
                            }}
                          />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{display: 'flex', alignItems: 'center', mt: 1.5}}>
                        <LocationOn
                          sx={{
                            fontSize: '1.2em',
                            mr: '0.594em',
                            color: '#0092B2',
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontSize="0.8rem"
                          color="#000034">
                          {unit?.address.fullName ||
                            quotation?.elevator?.address?.fullName ||
                            '-'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{display: 'flex', alignItems: 'center', mt: 2.5}}>
                        <Business
                          sx={{
                            fontSize: '1.2em',
                            mr: '0.594em',
                            color: '#0092B2',
                          }}
                        />

                        <Typography
                          variant="body2"
                          fontSize="0.8rem"
                          color="#000034">
                          {unit?.additionalInfo.buildingLocation ||
                            quotation?.elevator?.additionalInfo
                              .buildingLocation ||
                            '-'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{display: 'flex', alignItems: 'center', mt: 2.5}}>
                        <Tag
                          sx={{
                            fontSize: '1.2em',
                            mr: '0.594em',
                            color: '#0092B2',
                          }}
                        />

                        <Typography
                          variant="body2"
                          fontSize="0.8rem"
                          color="#000034">
                          {unit?.externalId ||
                            quotation?.elevator?.externalId ||
                            '-'}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {!unit?.id && (
                    <Box sx={{mb: 3}}>
                      <Box
                        sx={{
                          backgroundColor: '#F7F9FC',
                          border: '1px dashed #8F9BB380',
                          padding: '3em 1em',
                          textAlign: 'center',
                          borderRadius: '4px',
                        }}>
                        <Button
                          label="Select Unit"
                          buttonProps={{
                            variant: 'outlined',
                            size: 'small',
                            onClick: () => {
                              setIsModalOpen(true);
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Dialog
                    title={t('Select unit')}
                    onCancel={() => setIsModalOpen(false)}
                    saveButtonText="Select"
                    showCancelButton
                    onSave={() => {
                      formik.setFieldValue('elevatorId', unit?.id);
                      setIsModalOpen(false);
                    }}
                    dialogContentStyles={{padding: '0.5em 0em 0.5em 0.5em'}}
                    disableSaveBtn={!unit}
                    dialogProps={{
                      maxWidth: 'lg',
                      open: isModalOpen || false,
                    }}>
                    <QuotationUnitsDataGrid
                      setRowItem={handleSelectUnit}
                      searchCustomer={quotation?.propertyOwner?.name}
                      propertyOwnerId={quotation?.propertyOwner?.id}
                    />
                  </Dialog>

                  <CreateServiceOrder
                    value={formik.values.createServiceOrder}
                    onChange={formik.handleChange}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: '1em 0em',
                    }}>
                    <Button
                      label="Cancel"
                      buttonProps={{
                        variant: 'text',
                        size: 'small',
                        sx: {
                          color: theme.palette.text.disabled,
                        },
                        onClick: () => {
                          setUnit(null);
                          setIsCreateForm(false);
                          formik.setFieldValue('createServiceOrder', '');
                        },
                      }}
                    />
                    <Button
                      label="Create"
                      buttonProps={{
                        variant: 'contained',
                        size: 'small',
                        disabled: !(formik.values.createServiceOrder && unit),
                        sx: {
                          background: theme.palette.text.primary,
                          color: 'white',
                        },
                        onClick: () => {
                          navigate(
                            `/orders/new?type=${
                              formik.values.createServiceOrder
                            }&quotationId=${quotation.id}&elevatorId=${
                              unit?.id || quotation.elevator.id
                            }`,
                          );
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {quotation.additionalInfo &&
            'serviceOrderIds' in quotation.additionalInfo ? (
              <ServiceOrderDetails
                serviceOrderId={
                  quotation.additionalInfo.serviceOrderIds?.length
                    ? quotation.additionalInfo.serviceOrderIds[0]
                    : ''
                }
              />
            ) : (
              !isCreateForm && (
                <Box sx={{textAlign: 'center'}}>
                  <Typography variant="subtitle2" textAlign="center" py={2}>
                    {t('No job has been created for this quotation yet!')}
                  </Typography>
                  <Button
                    label="Create Job"
                    buttonProps={{
                      variant: 'contained',
                      size: 'small',

                      sx: {
                        background: theme.palette.text.primary,
                        color: 'white',
                      },
                      onClick: () => setIsCreateForm(true),
                    }}
                  />
                </Box>
              )
            )}
          </PageCard>
          {quotationActivities?.length ? (
            <QuotationActivities activities={quotationActivities} />
          ) : null}
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen
        primaryButtonLabel={bottomDrawerPrimaryLabel}
        primaryButtonAction={bottomDrawerPrimaryAction}
        listItems={actions}
        isValid={!disablePrimaryAction}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => {
          setIsSendEmailDialogOpen(false);
          setActiveSignature(undefined);
        }}
        id={quotation.id}
        confirmBtnDisabled={sendingQuotation}
        email={
          quotation?.elevator?.propertyOwner?.additionalInfo.billingEmail ||
          quotation?.elevator?.propertyOwner?.contact.email
        }
        subject={stripHtmlTags(quotation.subject)}
        content={quotation.description}
        existingFiles={existingFiles}
        isLoadingFiles={isLoadingFiles}
        callback={async (emailRecord) => {
          setIsSendEmailDialogOpen(false);

          const fileNames: string[] = [`${quotation.id}.pdf`];
          const isDraft = quotation.status === QuotationStatus.DRAFT;

          const allAttachments = emailRecord.attachments || existingFiles;
          const emailAttachments = (emailRecord.attachments || [])?.filter(
            (el) => el.path,
          );
          const hasExistingFileToUpload = allAttachments.some((obj, index) => {
            const isExistingFile = !obj.path && index === 0;
            return isExistingFile;
          });

          if (isDraft && hasExistingFileToUpload) {
            await uploadFiles({files: existingFiles, uploadPath});
          }

          if (emailAttachments.length) {
            await uploadFiles({files: emailAttachments, uploadPath});
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

          await sendQuotation({
            id: quotation.id,
            body: {
              pdfPath: `${uploadPath}/${fileNames[0]}`,
              sentDate: '',
              email: {
                email: '',
                subject: stripHtmlTags(emailRecord.subject),
                content: processedContent,
                emails: emailRecord.emails,
                ccEmails: emailRecord.ccEmails,
                bccEmails: emailRecord.bccEmails,
                attachments: allAttachments.reduce<FileWithPreview[]>(
                  (newArr: FileWithPreview[], obj, index) => {
                    // If file is from server -> uri of file should be quotation.id
                    // If file is from server -> description should be quotation.externalId
                    const isFileFromServer = !obj.path && index === 0;
                    const fileName = obj.name;
                    const fileExtension = fileName?.split('.')?.pop() || '';
                    const fileNameWithoutExtension = fileName.substring(
                      0,
                      fileName.lastIndexOf('.'),
                    );
                    newArr.push({
                      ...obj,
                      type: obj.type,
                      uri: isFileFromServer
                        ? `${uploadPath}/${quotation.id}.pdf`
                        : `${uploadPath}/${obj.name}`,
                      description: isFileFromServer
                        ? `${quotation.externalId}.pdf`
                        : `${fileNameWithoutExtension}.${fileExtension}`,
                    });

                    // Add signatureAttachment if it doesn't already exist
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
          });

          setActiveSignature(undefined);
        }}
        activeSignature={activeSignature}
        onSignatureSelect={(signature) => setActiveSignature(signature)}
      />
      <Confirm
        open={isDialogOpen}
        onConfirm={async () => {
          if (quotation.id && user) {
            const fileNames: string[] = [`${quotation.id}.pdf`];

            if (quotation.status === QuotationStatus.DRAFT) {
              const fileDescriptions = [`${quotation.externalId}.pdf`];
              const blob = await generateBlobUrl();

              const files = await createFilesFromBlobArray(
                [blob!],
                fileNames,
                fileDescriptions,
              );

              await uploadFiles({files, uploadPath});
            }

            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: true,
                isAccepted: true,
                comments: ' ',
                pdfPath: `${uploadPath}/${fileNames[0]}`,
                sentDate: '',
              },
            });
            setIsDialogOpen(false);
          }
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as accepted"
        content="Do you want to mark this quotation as accepted?"
        helperText="This action is irreversible."
      />
      <Confirm
        open={isRejectedDialogOpen}
        onConfirm={async () => {
          if (quotation.id && user) {
            const fileNames: string[] = [`${quotation.id}.pdf`];

            if (quotation.status === QuotationStatus.DRAFT) {
              const fileDescriptions = [`${quotation.externalId}.pdf`];
              const blob = await generateBlobUrl();

              const files = await createFilesFromBlobArray(
                [blob!],
                fileNames,
                fileDescriptions,
              );

              await uploadFiles({files, uploadPath});
            }

            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: false,
                isAccepted: false,
                comments: ' ',
                pdfPath: `${uploadPath}/${fileNames[0]}`,
                sentDate: '',
              },
            });
            setIsRejectedDialogOpen(false);
          }
        }}
        onClose={() => setIsRejectedDialogOpen(false)}
        title="Mark as rejected"
        content="Do you want to mark this quotation as rejected?"
        helperText="This action is irreversible."
      />

      {isDeleteDialogOpen && (
        <Confirm
          open={isDeleteDialogOpen}
          onConfirm={() => {
            if (quotation.id)
              deleteQuotation({
                quotationId: quotation.id,
                shouldNavigate: false,
              });
            setIsDeleteDialogOpen(false);
          }}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Delete Quotation"
          content="Do you want to delete this Quotation?"
          helperText="This action is irreversible."
        />
      )}

      <ConfirmPrintQuotation
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintQuotation}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};
