import {useEffect, useMemo, useRef, useState} from 'react';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import {
  Grid,
  LinearProgress,
  Typography,
  linearProgressClasses,
  Chip,
  FormControl,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Send from '@mui/icons-material/Send';
import {HandymanOutlined, InfoOutlined} from '@mui/icons-material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {usePublishChecklist} from 'hooks/reactQuery/useServiceOrder';
import {
  useDeleteServiceOrderChecklist,
  useQueryServiceOrderChecklists,
} from 'hooks/reactQuery/useChecklists';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {ChecklistStatus, ServiceOrderView} from 'models/service-order';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useFormatDate} from 'hooks/useFormatDate';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {CardProps} from 'components/CardProps';
import {Confirm} from 'components/Confirm';
import {CheckListComponentType} from 'models/checklist';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {
  companyLanguageContextMap,
  convertBase64ToPNG,
  createFilesFromBlobArray,
  getBase64FromUrl,
} from 'utils/utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {pdf} from '@react-pdf/renderer';
import {useSnackbar} from 'hooks/useSnackbar';
import PathImage from 'assets/images/Path.svg';
import {SnackbarKey} from 'notistack';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ChecklistComponent} from './ChecklistComponent';
import ChecklistPdf from './ChecklistPdf';

const EmptyCheckList = () => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{width: '60%'}}
    label="No checklist yet."
  />
);

interface Props {
  serviceOrder: ServiceOrderView;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const CheckList = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {user} = useUserSession();
  const {t} = useTranslation();
  const {enqueueSnackbar, showError} = useSnackbar();
  const overviewPdfSnackBarRef = useRef<SnackbarKey | null>(null);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [deleteChecklistConfirm, setDeleteChecklistConfirm] = useState(false);
  const [blobFile, setBlobFile] = useState<Blob>();

  const {mutateAsync: uploadFiles} = useUploadFiles(
    'The document was sent successfully.',
  );
  const {mutateAsync: publishCheckList, isLoading: publishingCheckList} =
    usePublishChecklist();
  const {mutateAsync: deleteServiceOrderChecklist, isLoading: isDeleting} =
    useDeleteServiceOrderChecklist();

  const {data: serviceOrderCheckLists, isLoading: isLoadingCheckList} =
    useQueryServiceOrderChecklists({serviceOrderId: serviceOrder.id});

  const completedChecklists = serviceOrderCheckLists?.filter(
    (c) => c.additionalInfo.status === ChecklistStatus.COMPLETED,
  );

  const [pdfPathToDownload, setPdfPathToDownload] = useState('');

  const {data: signatureDownloadUrls = {}} = useDownloadUrl(
    completedChecklists?.length
      ? completedChecklists.map(
          (c) => c.additionalInfo.technicianSignature || '',
        )
      : [],
  );
  const labels =
    completedChecklists?.map((c) => {
      const schedule = serviceOrder.schedules.find(
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

  const {downloadFile} = useDownloadFileWithCustomName(
    selectedChecklist?.checkList.number,
    pdfPathToDownload,
  );

  const technicianUserAccount = serviceOrder.schedules.find(
    (s) => s.technician.id === selectedOption.technicianId,
  )?.technician.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedOption(JSON.parse(event.target.value));
  };

  const deleteChecklist = async () => {
    await deleteServiceOrderChecklist(
      {
        id: serviceOrder.id,
        params: {
          checkListId: selectedOption.checklistId,
          technicianId: selectedOption.technicianId,
        },
      },
      {
        onSuccess: () => {
          setDeleteChecklistConfirm(false);
          setSelectedOption(labels[0]?.value || '');
        },
      },
    );
  };

  const signaturePath =
    signatureDownloadUrls[
      selectedChecklist?.additionalInfo.technicianSignature || ''
    ];

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead =
      selectedChecklist?.checkList.components.filter(
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

    return {all: componentsWithoutHead.length, done: doneList.length};
  }, [selectedChecklist]);

  useEffect(() => {
    if (completedChecklists?.length && !selectedOption) {
      setSelectedOption(labels[0].value);
    }
  }, [completedChecklists]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );
  const [signatureImage, setSignatureImage] = useState('');
  const imageUrl = useLogoImage(user);
  const logoDimensions = useLogoDimensions(imageUrl);

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
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

  const generatePdfUrl = async () => {
    const blob = await pdf(
      <ChecklistPdf
        userInfo={user?.userAccount}
        logoSrc={imageUrl}
        logoDimensions={logoDimensions}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={serviceOrder}
        selectedChecklist={selectedChecklist}
        sortedChecklistComponents={sortedChecklistComponents}
        signaturePath={signatureImage}
        technicianName={technicianName}
      />,
    ).toBlob();
    setBlobFile(blob);
    const blobURL = URL.createObjectURL(blob);
    setPdfPathToDownload(blobURL);
  };

  const handleDownload = () => {
    try {
      const snackbarKey = enqueueSnackbar(
        <Box display="flex" padding="0em" margin="0em" alignItems="center">
          <img alt={t('Path Image')} src={PathImage} />{' '}
          <Typography margin="0em" paddingLeft="0.5em" variant="body2">
            {t('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: 3000,
        },
      );
      overviewPdfSnackBarRef.current = snackbarKey;
      downloadFile();
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      const technicianSignatureUrl =
        signatureDownloadUrls[
          selectedChecklist?.additionalInfo.technicianSignature!
        ];

      if (!signatureImage.trim() && technicianSignatureUrl) {
        const fetchedImageUrl = await getBase64FromUrl(technicianSignatureUrl);
        if (isMounted && fetchedImageUrl) {
          let finalImageUrl = fetchedImageUrl;
          if (fetchedImageUrl.startsWith('data:image/jpeg')) {
            try {
              finalImageUrl = await convertBase64ToPNG(fetchedImageUrl);
            } catch (error) {
              console.error('Error converting JPEG to PNG:', error);
            }
          }
          setSignatureImage(finalImageUrl);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [
    signatureDownloadUrls[
      selectedChecklist?.additionalInfo.technicianSignature!
    ],
  ]);

  useEffect(() => {
    generatePdfUrl();
  }, [signatureImage, imageUrl, selectedChecklist]);

  if (isLoadingCheckList) {
    return <Progress />;
  }

  if (!completedChecklists?.length) {
    return (
      <InfoCard
        disabledHeader
        containerStyles={{
          mb: '1.2rem',
          padding: '11rem 0 11rem 0',
        }}
        bodyContainerStyle={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <EmptyCheckList />
      </InfoCard>
    );
  }

  return (
    <Grid container alignItems="center" justifyContent="center" rowGap="27px">
      <Grid item lg={8} flexBasis="100%">
        <Grid container spacing={2}>
          <Grid
            item
            md={8}
            sx={{
              py: '0em',
            }}>
            <PageCard
              headerLabel="General Information"
              headerIcon={
                <InfoOutlined sx={{color: theme.palette.text.disabled}} />
              }
              containerStyles={{
                borderRadius: '0.5rem',
              }}
              contentContainerStyles={{
                display: 'grid',
                gridAutoColumns: 'minmax(0, 1fr)',
                gridAutoFlow: 'column',
                padding: 1.25,
                '&:last-child': {
                  pb: 1.25,
                },
              }}>
              <CardProps
                label="Date"
                containerStyles={{alignItems: 'center'}}
                bodyTextVariant="subtitle1"
                bodyText={formatDate(serviceOrder.dueDate)}
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Type"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ServiceOrderIcons
                      serviceOrderType={serviceOrder.type}
                      size="small"
                    />
                    <ServiceOrderTypeText
                      serviceOrderType={serviceOrder.type}
                      capitalizeText
                      variant="subtitle1"
                      style={{fontWeight: '600'}}
                    />
                  </Box>
                }
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Job ID"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={serviceOrder.number}
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Status"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <StatusChip
                    color={getServiceOrderStatusColor(serviceOrder.status)}
                    label={serviceOrderStatusToString(serviceOrder.status)}
                  />
                }
                bodyStyle={{fontWeight: '600'}}
              />
            </PageCard>
          </Grid>
          <Grid
            item
            md={4}
            sx={{
              py: '0em',
            }}>
            <PageCard
              customHeader={
                <Box display="flex" gap={1}>
                  <HandymanOutlined sx={{color: theme.palette.text.disabled}} />
                  <Typography sx={{fontWeight: '600'}}>
                    {t('Engineer(s)')}
                  </Typography>
                  <Chip
                    label={completedChecklists?.length || 0}
                    size="small"
                    sx={{
                      color: theme.palette.primary.dark,
                      bgcolor: 'rgba(143, 155, 179, 0.25)',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      '& .MuiChip-label': {
                        overflow: 'visible',
                      },
                    }}
                  />
                </Box>
              }
              contentContainerStyles={{
                display: 'flex',
                flex: 'wrap',
                justifyContent: 'space-between',
                pb: '0.5em !important',
              }}>
              <Grid
                sx={{
                  minHeight: '60px',
                }}
                container>
                <Grid item sm={12} md={12}>
                  <FormControl fullWidth sx={{marginBlock: '0.5em'}}>
                    <Select
                      labelId="technicianSelect-label"
                      id="technicianSelect"
                      value={JSON.stringify(selectedOption)}
                      size="small"
                      onChange={handleChange}>
                      {labels.map((item) => (
                        <MenuItem
                          value={JSON.stringify(item.value)}
                          key={item.label}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </PageCard>
          </Grid>
        </Grid>
      </Grid>

      <Grid item lg={8} flexBasis="100%" pb="5rem">
        <Box
          bgcolor="white"
          border="2px solid #eee"
          borderRadius="10px"
          sx={{px: 1, py: 3}}>
          <Box p={2} pt={0}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1" color="text.secondary">
                {t('Checklist overview')}
              </Typography>
              <Box minWidth="250px">
                <Box display="flex" justifyContent="space-between" pb={0.5}>
                  <Typography variant="caption">
                    {checklistSummary.done}/{checklistSummary.all}{' '}
                    {t('options')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {percentComplete}% {t('complete')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentComplete}
                  sx={{
                    backgroundColor: `${theme.palette.text.secondary}66`,
                    [`& .${linearProgressClasses.bar}`]: {
                      backgroundColor: '#4CAF50',
                    },
                  }}
                />
              </Box>
            </Box>

            <Box
              bgcolor="grey.100"
              borderRadius="4px"
              mt={2}
              p={1}
              display="flex"
              flexDirection="column"
              gap="1rem">
              <Box
                bgcolor="white"
                p={4}
                display="flex"
                flexDirection="column"
                rowGap={2}>
                <Typography
                  variant="h5"
                  color={theme.palette.primary.dark}
                  fontSize="31px"
                  py={2}>
                  {selectedChecklist?.checkList.name ?? ''}
                </Typography>

                <Box display="flex" flexDirection="column" rowGap={3}>
                  {sortedChecklistComponents?.map((component) => (
                    <ChecklistComponent
                      key={component.id}
                      component={component}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box bgcolor="white" px="1rem" py={4}>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              {t('Signature')}
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              mt="0.5rem"
              mb="2.3rem"
              py="2.5rem"
              border="1px solid"
              borderColor="grey.300"
              borderRadius="0.5rem"
              position="relative"
              maxWidth="15rem"
              maxHeight="7rem">
              <Box>
                {signaturePath ? (
                  <img
                    alt=""
                    src={signaturePath}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'top',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                ) : (
                  t('No Signature')
                )}
              </Box>
              {technicianName && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  top="6rem"
                  bgcolor="white"
                  px="0.625rem"
                  position="absolute"
                  maxWidth="17.5rem">
                  <Typography
                    variant="subtitle1"
                    color={theme.palette.text.primary}>
                    {technicianName}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.secondary}>
                    {t('Technician')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" p={2}>
            <Button
              label="Delete"
              buttonProps={{
                color: 'error',
                variant: 'text',
                size: 'medium',
                onClick: () => setDeleteChecklistConfirm(true),
                sx: {background: 'transparent'},
                startIcon: <DeleteIcon />,
              }}
            />
            <Box>
              <Button
                label="Download"
                buttonProps={{
                  variant: 'outlined',
                  size: 'medium',
                  onClick: handleDownload,
                  sx: {
                    background: 'transparent',
                  },

                  startIcon: <FileDownloadIcon />,
                }}
              />

              <Button
                label={t('Send Checklist')}
                buttonProps={{
                  variant: 'contained',
                  size: 'medium',
                  onClick: () => setIsSendEmailDialogOpen(true),
                  sx: {
                    ml: '1em',
                  },

                  startIcon: <Send />,
                }}
              />
            </Box>

            <SendEmailDialog
              open={isSendEmailDialogOpen}
              onClose={() => setIsSendEmailDialogOpen(false)}
              confirmBtnDisabled={publishingCheckList}
              email={
                serviceOrder.elevator.propertyOwner?.additionalInfo
                  .billingEmail ||
                serviceOrder.elevator.propertyOwner?.contact.email
              }
              content={serviceOrder.description}
              callback={async (emailRecord) => {
                setIsSendEmailDialogOpen(false);
                const serviceCompanyId = user?.userAccount.serviceCompany.id;
                const checkListInfo = serviceOrder?.checkLists![0];
                const uploadPath = `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/checkLists/${checkListInfo.technicianId}`;

                const fileNames: string[] = [
                  `${checkListInfo.checkListId}.pdf`,
                ];

                const files = createFilesFromBlobArray([blobFile!], fileNames);
                await uploadFiles({files, uploadPath});

                publishCheckList({
                  id: serviceOrder!.id,
                  params: {
                    checkListId: selectedChecklist?.checkListId || '',
                    technicianId: selectedChecklist?.technicianId || '',
                  },
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
          </Box>
        </Box>
      </Grid>
      <Confirm
        open={deleteChecklistConfirm}
        onConfirm={deleteChecklist}
        onClose={() => setDeleteChecklistConfirm(false)}
        title={t('Delete')}
        content={t('Do you want to delete this checklist?')}
        disableActions={isDeleting}
      />
    </Grid>
  );
};
