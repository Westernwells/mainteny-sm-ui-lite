import {useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReplayIcon from '@mui/icons-material/Replay';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {FormLabel} from 'components/form/FormLabel';
import {BottomDrawer} from 'components/BottomDrawer';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {ConfirmPrintQuotation} from 'components/ConfirmPrintQuotation';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {
  usePublishQuotation,
  useReplyQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PdfGenerationStatus} from 'models/misc';
import {
  QuotationActivityView,
  QuotationStatus,
  QuotationView,
} from 'models/quotation';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import {useSnackbar} from 'notistack';
import PathImage from 'assets/images/Path.svg';
import {
  companyLanguageContextMap,
  convertToMacro,
  createFilesFromBlobArray,
} from 'utils/utils';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import {useDownloadFileWithCustomName} from 'hooks/reactQuery/useDownloadUrl';
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
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
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
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const ViewQuotation = ({
  downloadUrl,
  quotation,
  quotationActivities,
  isLoadingDownloadUrl,
}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const {search} = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [isCreateForm, setIsCreateForm] = useState(false);
  const {elevatorId = ''} = queryString.parse(search);

  const {data: elevator} =
    typeof elevatorId === 'string'
      ? useElevatorById(elevatorId)
      : {data: undefined};

  const [unit, setUnit] = useState<ElevatorView | null>(elevator || null);
  const [blobFile, setBlobFile] = useState<Blob>();

  const [filePathToDownload, setFilePathToDownload] = useState('');
  const imageUrl = useLogoImage(user);
  const logoDimensions = useLogoDimensions(imageUrl);

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {downloadFile} = useDownloadFileWithCustomName(
    quotation.number,
    filePathToDownload,
  );

  const {mutateAsync: uploadFiles} = useUploadFiles(
    'Documents uploaded successfully',
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

  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutateAsync: publishQuotation} = usePublishQuotation();

  const formik = useFormik({
    initialValues: {
      createServiceOrder: '',
    },
    onSubmit: () => {},
  });

  const handleSelectUnit = (row: ElevatorView) => {
    setUnit(row);
  };

  const isPDFGenerated =
    quotation.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    !isLoadingDownloadUrl;

  const onPrintQuotation = async () => {
    if (quotation.status !== QuotationStatus.DRAFT) {
      if (filePathToDownload) {
        printJS({
          printable: filePathToDownload,
          type: 'pdf',
          showModal: true,
        });
      }
      setIsConfirmPrintDialogOpen(false);
      return;
    }

    await publishQuotation(
      {
        id: quotation.id,
        body: {
          email: '',
          subject: '',
          content: '',
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

  const actions = useMemo(() => {
    const items = [];

    if (quotation.status === QuotationStatus.DRAFT) {
      items.push({
        label: t('Mark Accepted'),
        icon: <Check />,
        onClick: () => setIsDialogOpen(true),
      });
    } else {
      items.push({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: () => setIsSendEmailDialogOpen(true),
      });
    }

    if (isPDFGenerated) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    }

    items.push(
      ...[
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => navigate(`/quotations/details/${quotation.id}/edit`),
        },
        {
          label: t('Mark Rejected'),
          icon: <Close />,
          onClick: () => setIsRejectedDialogOpen(true),
        },
      ],
    );

    if (quotation.status === QuotationStatus.SENT_TO_CLIENT) {
      return items.filter((item) => item.label !== t('Edit'));
    }
    return items;
  }, [downloadUrl]);

  useEffect(() => {
    if (quotation) {
      const quotationElevator = quotation.elevator;
      setUnit(quotationElevator);
    }

    if (
      quotation?.additionalInfo.pdfGenerationStatus ===
      PdfGenerationStatus.RUNNING
    ) {
      enqueueSnackbar(
        <Box display="flex" padding="0em" margin="0em" alignItems="center">
          <img alt={t('Path Image')} src={PathImage} />{' '}
          <Typography margin="0em" paddingLeft="0.5em" variant="body2">
            {t('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: 8000,
        },
      );
    }

    if (
      quotation?.additionalInfo.pdfGenerationStatus !==
      PdfGenerationStatus.RUNNING
    ) {
      closeSnackbar();
    }
  }, [quotation]);

  const generateBlobUrl = async () => {
    const blob = await pdf(
      <QuotationPdfTemplate
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        logoSrc={imageUrl}
        logoDimensions={logoDimensions}
        quotation={quotation}
        selectedLng={company?.language}
        translate={translate}
      />,
    ).toBlob();
    setBlobFile(blob);
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  useEffect(() => {
    generateBlobUrl();
  }, [imageUrl, quotation]);

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
                    onClick: downloadFile,
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
              <Typography variant="subtitle1" fontWeight="600">
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
                  quotation.totalAmount.netAmount /
                    10 ** quotation.totalAmount.fractionDigits!,
                  {currency: quotation.totalAmount.currency},
                )}
              </Typography>
            </Box>
          </PageCard>

          <PageCard>
            <PdfPreview blobUrl={filePathToDownload} />
          </PageCard>
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
                      searchCustomer={quotation?.elevator?.propertyOwner?.name}
                      propertyOwnerId={quotation?.elevator?.propertyOwner?.id}
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
                            `/orders/new?type=${convertToMacro(
                              formik.values.createServiceOrder,
                            ).toLowerCase()}&quotationId=${
                              quotation.id
                            }&elevatorId=${unit?.id || quotation.elevator.id}`,
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
        isOpen={
          quotation.status !== QuotationStatus.ACCEPTED &&
          quotation.status !== QuotationStatus.REJECTED
        }
        primaryButtonLabel={
          quotation.status === QuotationStatus.DRAFT ? 'Send' : 'Mark Accepted'
        }
        primaryButtonAction={() => {
          if (quotation.status === QuotationStatus.DRAFT) {
            setIsSendEmailDialogOpen(true);
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={actions.map((item, index) => ({
          ...item,
          showBorder: actions.length === index + 2,
        }))}
        isValid
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={quotation.id}
        confirmBtnDisabled={!isPDFGenerated}
        email={
          quotation?.elevator?.propertyOwner?.additionalInfo.billingEmail ||
          quotation?.elevator?.propertyOwner?.contact.email
        }
        subject={quotation.subject}
        content={quotation.description}
        callback={async (emailRecord) => {
          setIsSendEmailDialogOpen(false);

          const serviceCompanyId = user?.userAccount.serviceCompany.id;
          const uploadPath = `${serviceCompanyId}/quotations`;

          const fileNames: string[] = [`${quotation.id}.pdf`];

          const files = createFilesFromBlobArray([blobFile!], fileNames);
          await uploadFiles({files, uploadPath});

          publishQuotation({
            id: quotation!.id,
            body: {
              email: emailRecord.email,
              subject: emailRecord.subject,
              content: emailRecord.content,
              emails: [emailRecord.email],
              attachments: files.reduce<FileWithPreview[]>(
                (newArr: FileWithPreview[], obj) => [
                  ...newArr,
                  {
                    ...obj,
                    type: obj.type,
                    uri: `${uploadPath}/${obj.name}`,
                    description: obj.name.split('.')[0],
                  },
                ],
                [],
              ),
            },
          });
        }}
      />
      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (quotation.id && user)
            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: true,
                isAccepted: true,
                comments: ' ',
              },
            });
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as accepted"
        content="Do you want to mark this quotation as accepted?"
        helperText="This action is irreversible."
      />
      <Confirm
        open={isRejectedDialogOpen}
        onConfirm={() => {
          if (quotation.id && user)
            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: false,
                isAccepted: false,
                comments: ' ',
              },
            });
          setIsRejectedDialogOpen(false);
        }}
        onClose={() => setIsRejectedDialogOpen(false)}
        title="Mark as rejected"
        content="Do you want to mark this quotation as rejected?"
        helperText="This action is irreversible."
      />

      <ConfirmPrintQuotation
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintQuotation}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};
