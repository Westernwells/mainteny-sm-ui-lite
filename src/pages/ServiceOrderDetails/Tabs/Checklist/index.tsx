import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {
  Alert,
  Grid,
  LinearProgress,
  linearProgressClasses,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Send from '@mui/icons-material/Send';
import {InfoOutlined} from '@mui/icons-material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {useSendChecklist} from 'hooks/reactQuery/useServiceOrder';
import {
  useDeleteServiceOrderChecklist,
  useQueryServiceOrderChecklists,
  useUploadChecklistAnswer,
} from 'hooks/reactQuery/useChecklists';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {
  CheckListAnswerRecord,
  ChecklistStatus,
  ServiceOrderView,
} from 'models/service-order';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useFormatDate} from 'hooks/useFormatDate';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {CardProps} from 'components/CardProps';
import {Confirm} from 'components/Confirm';
import {
  CheckListComponentType,
  CheckListComponentView,
  ServiceOrderCheckListView,
} from 'models/checklist';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  fetchFile,
} from 'utils/utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {pdf} from '@react-pdf/renderer';
import {useSnackbar} from 'hooks/useSnackbar';
import PathImage from 'assets/images/Path.svg';
import {SnackbarKey} from 'notistack';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {CreateEditMode, PdfGenerationStatus} from 'models/misc';
import {BottomDrawer} from 'components/BottomDrawer';
import _ from 'lodash';
import {FileResourceRecord} from 'models/media';
import {resizeImageToTargetSize} from 'utils/image-compression';
import {IMAGE_SIZE_IN_MB} from 'utils/constants';
import useMultiImagesURLToBase64 from 'hooks/useMultiImagesURLToBase64';
import ChecklistPdf from './ChecklistPdf';
import {AddChecklistCard} from './AddChecklistCard';
import AddChecklistDialog from './AddChecklistDialog';
import {ChecklistPreviewSection} from './ChecklistPreviewSection';

interface Props {
  serviceOrder: ServiceOrderView;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

interface ChecklistDialogState {
  isOpen: boolean;
  mode: CreateEditMode;
}

export const CheckList = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {user} = useUserSession();
  const {t} = useTranslation();
  const {enqueueSnackbar, showError} = useSnackbar();
  const overviewPdfSnackBarRef = useRef<SnackbarKey | null>(null);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [deleteChecklistConfirm, setDeleteChecklistConfirm] = useState(false);
  const [actionType, setActionType] = useState('');
  const [checklistDialog, setChecklistDialog] = useState<ChecklistDialogState>({
    isOpen: false,
    mode: 'create',
  });
  const [isCancelEditConfirmDialogOpen, setIsCancelEditConfirmDialogOpen] =
    useState(false);
  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {mutateAsync: uploadFiles} = useUploadFiles(
    '',
    serviceOrder.serviceCompany.id,
  );
  const {mutateAsync: sendCheckList, isLoading: sendingCheckList} =
    useSendChecklist();
  const {mutateAsync: deleteServiceOrderChecklist, isLoading: isDeleting} =
    useDeleteServiceOrderChecklist();
  const {mutateAsync: uploadChecklistAnswer, isLoading: isUploadingAnswers} =
    useUploadChecklistAnswer('Checklist saved successfully');

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

  const [selectedOption, setSelectedOption] = useState<
    | {
        checklistId: string;
        technicianId: string;
      }
    | undefined
  >(labels[0]?.value);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ServiceOrderCheckListView>();

  const sortedChecklistComponents =
    selectedChecklist?.checkList?.components.sort(
      (a, b) =>
        (a.additionalInfo?.orderNumber ?? 0) -
        (b.additionalInfo?.orderNumber ?? 0),
    );

  const {data: downloadUrl, refetch: refetchDownloadUrl} = useDownloadUrl(
    selectedChecklist && selectedChecklist?.additionalInfo.pdfPath
      ? [selectedChecklist.additionalInfo.pdfPath]
      : [],
    {enabled: false},
  );

  const checklistImages = useMemo(
    () =>
      (
        selectedChecklist?.checkList.components.map(
          (component) =>
            component.additionalInfo.pictures?.map((pic) => ({
              fileResource: pic,
            })) ?? [],
        ) ?? []
      ).flat(),
    [selectedChecklist],
  );

  const checklistImagesPath = useMemo(
    () => checklistImages.map((pic) => pic.fileResource.uri) ?? [],
    [checklistImages],
  );

  const {data: checklistImagesDownloadUrl, isLoading: isChecklistImageLoading} =
    useDownloadUrl(
      checklistImagesPath,
      undefined,
      serviceOrder.serviceCompany.id,
    );

  const {
    convertedImages: checklistConvertedImages,
    isImageLoading: isChecklistConverting,
  } = useMultiImagesURLToBase64(checklistImagesDownloadUrl ?? {});

  const {downloadFile} = useDownloadFileWithCustomName(
    selectedChecklist?.checkList.number,
    pdfPathToDownload,
  );

  const technicianUserAccount = serviceOrder.schedules.find(
    (s) => s.technician.id === selectedOption?.technicianId,
  )?.technician.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  const deleteChecklist = async () => {
    await deleteServiceOrderChecklist(
      {
        id: serviceOrder.id,
        params: {
          checkListId: selectedOption?.checklistId!,
          technicianId: selectedOption?.technicianId!,
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

  useEffect(() => {
    if (!serviceOrderCheckLists?.length) {
      if (selectedChecklist) {
        setSelectedChecklist(undefined);
      }

      return;
    }

    if (!selectedChecklist) {
      setSelectedChecklist(_.cloneDeep(serviceOrderCheckLists[0]));
      return;
    }

    const isFound = serviceOrderCheckLists.some(
      (item) =>
        item.checkListId === selectedChecklist.checkListId &&
        item.technicianId === selectedChecklist.technicianId,
    );

    if (!isFound) {
      setSelectedChecklist(_.cloneDeep(serviceOrderCheckLists[0]));
    }
  }, [serviceOrderCheckLists]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );

  const signatureImageUrl = useFetchAndConvertImage(signaturePath);

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

  const generatePdfUrl = async () => {
    const sortedChecklistComponentsCloned = _.cloneDeep(
      sortedChecklistComponents ?? [],
    );

    sortedChecklistComponentsCloned.forEach((component) => {
      component.additionalInfo.pictures?.forEach((pic) => {
        pic.uri = checklistConvertedImages[pic.uri];
      });
    });

    const blob = await pdf(
      <ChecklistPdf
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={serviceOrder}
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
    const blobURL = URL.createObjectURL(blob);
    setPdfPathToDownload(blobURL);
    return blob;
  };

  const handleDownload = async () => {
    if (
      selectedChecklist?.additionalInfo.pdfGenerationStatus ===
      PdfGenerationStatus.DONE
    ) {
      const downloadUrlValue = downloadUrl ? Object.values(downloadUrl)[0] : '';
      if (downloadUrlValue) {
        try {
          const blob = await fetchFile(downloadUrlValue);
          const blobURL = URL.createObjectURL(blob);
          setPdfPathToDownload(blobURL);
        } catch (error) {
          console.error('Error fetching the file:', error);
        }
      }
    } else {
      await generatePdfUrl();
    }
    setActionType('DOWNLOAD');
  };

  const getExistingFiles = async (
    fileDownloadUrl:
      | {
          [key: string]: string;
        }
      | undefined,
  ) => {
    let files: FileWithPreview[] = [];

    const checkListInfo = selectedChecklist!;
    const fileNames = [`${checkListInfo.checkListId}.pdf`];
    const fileDescriptions = [`${selectedChecklist?.checkList.externalId}.pdf`];

    const isPDFGenerated =
      checkListInfo?.additionalInfo.pdfGenerationStatus ===
      PdfGenerationStatus.DONE;

    if (isPDFGenerated) {
      const blob = await fetchFile(
        fileDownloadUrl ? Object.values(fileDownloadUrl)[0] : '',
      );
      files = await createFilesFromBlobArray(
        [blob],
        fileNames,
        fileDescriptions,
      );
      setExistingFiles(files);
    } else {
      const blobFile = await generatePdfUrl();
      files = await createFilesFromBlobArray(
        [blobFile],
        fileNames,
        fileDescriptions,
      );
      setExistingFiles(files);
    }
  };

  const handleOpenSendEmail = async () => {
    setIsLoadingFiles(true);
    setIsSendEmailDialogOpen(true);
    // using 'then' to wait for refetch and get download url
    try {
      await refetchDownloadUrl().then(async (res) => {
        await getExistingFiles(res.data);
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const saveChecklistAnswers = async () => {
    const params = {
      serviceOrder: serviceOrder.id,
    };
    const {technicianId, checkListId} = selectedChecklist!;
    const queryParams = {
      technicianId,
      checkListId,
    };

    const body: CheckListAnswerRecord[] =
      selectedChecklist?.checkList.components.map((item) => ({
        componentId: item.id,
        values: item.additionalInfo.answer ?? [],
        note: item.additionalInfo.note ?? '',
        pictures: item.additionalInfo.pictures ?? [],
      })) ?? [];

    const payload = {
      params,
      queryParams,
      body,
    };

    uploadChecklistAnswer(payload, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  useEffect(() => {
    if (pdfPathToDownload && actionType === 'DOWNLOAD') {
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
        setPdfPathToDownload('');
        setActionType('');
      } catch (e) {
        showError(e);
      }
    }
  }, [pdfPathToDownload, actionType]);

  useEffect(() => {
    refetchDownloadUrl();
  }, [selectedChecklist]);

  if (isLoadingCheckList) {
    return <Progress />;
  }

  const handleChecklistAddPress = () => {
    setChecklistDialog({...checklistDialog, isOpen: true, mode: 'create'});
  };

  const handleChecklistEditPress = (
    newSelectedChecklist: ServiceOrderCheckListView,
  ) => {
    setIsEditing(true);
    setSelectedChecklist(_.cloneWith(newSelectedChecklist));
  };

  const onChecklistChange = (
    newChecklistComponent: CheckListComponentView,
    index: number,
  ) => {
    const selectedChecklistCloned = _.cloneDeep(selectedChecklist);

    selectedChecklistCloned!.checkList.components[index] =
      newChecklistComponent;

    setSelectedChecklist(selectedChecklistCloned);
  };

  const onChecklistImageChange = async (
    _component: CheckListComponentView,
    files: File[],
    index: number,
  ) => {
    const selectedChecklistCloned = _.cloneDeep(selectedChecklist);
    const component = selectedChecklistCloned!.checkList.components[index];
    const {pictures = []} = component.additionalInfo;

    const {technicianId, checkListId} = selectedChecklist!;
    const serviceCompanyId = serviceOrder.serviceCompany.id;
    const basePath = `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/checkLists`;
    const uploadPath = `${basePath}/${technicianId}/${checkListId}/images`;

    const reducedSizePromises = files.map((item) =>
      resizeImageToTargetSize(item, IMAGE_SIZE_IN_MB),
    );
    const reducedSizeFiles = await Promise.all(reducedSizePromises);

    // Image upload is configured to show loading if the uri equal 'loading'. It's here to show user a visual clue of whats happening
    const newPicturesLocal: FileResourceRecord[] = reducedSizeFiles.map(
      (item) => ({
        uri: 'loading',
        description: item.name,
        type: item.type,
      }),
    );
    component.additionalInfo.pictures = [...pictures, ...newPicturesLocal];
    selectedChecklistCloned!.checkList.components[index] = {...component};

    setSelectedChecklist(selectedChecklistCloned);

    await uploadFiles({files: reducedSizeFiles, uploadPath});

    const newPictures: FileResourceRecord[] = reducedSizeFiles.map((item) => ({
      uri: `${uploadPath}/${item.name}`,
      description: item.name,
      type: item.type,
    }));
    component.additionalInfo.pictures = [...pictures, ...newPictures];
    selectedChecklistCloned!.checkList.components[index] = {...component};

    // It is necessary to spread here. Otherwise useMemo will not run since the reference is not changed
    setSelectedChecklist({...selectedChecklistCloned!});
  };

  const scheduled = serviceOrder.schedules ?? [];
  const candidates = serviceOrder.additionalInfo.candidateTechnicians ?? [];

  const technicianNotAssigned =
    scheduled.length === 0 && candidates.length === 0;

  return (
    <>
      <Grid container alignItems="center" justifyContent="center" rowGap="27px">
        <Grid item lg={12} flexBasis="100%">
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
                  paddingBottom: '16px !important',
                  paddingLeft: 1,
                  paddingRight: 1,
                }}>
                <Box
                  sx={{
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
                </Box>
                {technicianNotAssigned && (
                  <Alert severity="warning">
                    <Typography
                      fontWeight="bold"
                      color={theme.palette.info.infoAlert}>
                      {t('Assign technician to add checklists')}
                    </Typography>
                    <Typography color={theme.palette.info.infoAlert}>
                      {t(
                        'Checklists can only be added once a technician is assigned to the job.',
                      )}
                    </Typography>
                  </Alert>
                )}
              </PageCard>
              {selectedChecklist && (
                <Box
                  bgcolor="white"
                  border="2px solid #eee"
                  borderRadius="10px"
                  sx={{px: 1, py: 3, mt: 2}}>
                  <Box p={2} pt={0}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" color="text.secondary">
                        {t('Checklist overview')}
                      </Typography>
                      <Box minWidth="250px">
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          pb={0.5}>
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

                    <ChecklistPreviewSection
                      sx={{ml: 0, mt: 3}}
                      onChecklistChange={onChecklistChange}
                      onChecklistImageChange={onChecklistImageChange}
                      isEditing={isEditing}
                      checklist={selectedChecklist?.checkList}
                    />
                  </Box>

                  <Box bgcolor="white" px="1rem" py={4}>
                    <Typography
                      variant="caption"
                      color={theme.palette.text.secondary}>
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
                          onClick: () => handleDownload(),
                          sx: {
                            background: 'transparent',
                          },
                          disabled:
                            isEditing ||
                            isChecklistImageLoading ||
                            isChecklistConverting,
                          startIcon: <FileDownloadIcon />,
                        }}
                      />

                      <Button
                        label={t('Send Checklist')}
                        buttonProps={{
                          variant: 'contained',
                          size: 'medium',
                          onClick: handleOpenSendEmail,
                          sx: {
                            ml: '1em',
                          },
                          disabled:
                            isEditing ||
                            isChecklistImageLoading ||
                            isChecklistConverting,
                          startIcon: <Send />,
                        }}
                      />
                    </Box>

                    <SendEmailDialog
                      open={isSendEmailDialogOpen}
                      onClose={() => setIsSendEmailDialogOpen(false)}
                      confirmBtnDisabled={sendingCheckList}
                      email={
                        serviceOrder.elevator.propertyOwner?.additionalInfo
                          .billingEmail ||
                        serviceOrder.elevator.propertyOwner?.contact.email
                      }
                      content={serviceOrder.description}
                      existingFiles={existingFiles}
                      isLoadingFiles={isLoadingFiles}
                      callback={async (emailRecord) => {
                        setIsSendEmailDialogOpen(false);

                        const serviceCompanyId =
                          user?.userAccount.serviceCompany.id;
                        const checkListInfo = selectedChecklist!;
                        const uploadPath = `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/checkLists/${checkListInfo.technicianId}`;
                        const fileNames = [`${checkListInfo.checkListId}.pdf`];
                        const isPDFGenerated =
                          checkListInfo?.additionalInfo.pdfGenerationStatus ===
                          PdfGenerationStatus.DONE;

                        const allAttachments = emailRecord.attachments || [];
                        const emailAttachments = (
                          emailRecord.attachments || []
                        )?.filter((el) => el.path);
                        const hasExistingFileToUpload = allAttachments.some(
                          (obj, index) => {
                            const isExistingFile = !obj.path && index === 0;
                            return isExistingFile;
                          },
                        );

                        if (!isPDFGenerated && hasExistingFileToUpload) {
                          await uploadFiles({files: existingFiles, uploadPath});
                        }

                        if (emailAttachments.length) {
                          await uploadFiles({
                            files: emailAttachments,
                            uploadPath,
                          });
                        }

                        await sendCheckList({
                          id: serviceOrder!.id,
                          body: {
                            checkListId: checkListInfo.checkListId || '',
                            technicianId: checkListInfo.technicianId || '',
                            pdfPath: isPDFGenerated
                              ? checkListInfo?.additionalInfo.pdfPath!
                              : `${uploadPath}/${fileNames[0]}`,
                            email: {
                              email: '',
                              subject: emailRecord.subject,
                              content: emailRecord.content,
                              emails: emailRecord.emails,
                              ccEmails: emailRecord.ccEmails,
                              bccEmails: emailRecord.bccEmails,
                              attachments: allAttachments.reduce<
                                FileWithPreview[]
                              >((newArr: FileWithPreview[], obj, index) => {
                                const isFileFromServer =
                                  !obj.path && index === 0;
                                return [
                                  ...newArr,
                                  {
                                    ...obj,
                                    type: obj.type,
                                    uri: isFileFromServer
                                      ? isPDFGenerated
                                        ? checkListInfo?.additionalInfo.pdfPath!
                                        : `${uploadPath}/${checkListInfo.checkListId}.pdf`
                                      : `${uploadPath}/${obj.name}`,
                                    description: isFileFromServer
                                      ? `${checkListInfo.checkList?.externalId}.pdf` ||
                                        `${checkListInfo.checkList?.number}.pdf`
                                      : obj.name.split('.')[0],
                                  },
                                ];
                              }, []),
                            },
                          },
                        });
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid
              item
              md={4}
              sx={{
                py: '0em',
              }}>
              <AddChecklistCard
                checklists={serviceOrderCheckLists}
                onSelect={(newChecklist) => {
                  setSelectedChecklist(_.cloneDeep(newChecklist));
                }}
                isEditing={isEditing}
                selectedChecklist={selectedChecklist}
                serviceOrder={serviceOrder}
                onAddPress={handleChecklistAddPress}
                onEditPress={handleChecklistEditPress}
              />
            </Grid>
          </Grid>
        </Grid>

        <AddChecklistDialog
          isOpen={checklistDialog.isOpen}
          serviceOrderCheckLists={serviceOrderCheckLists}
          serviceOrder={serviceOrder}
          formType={checklistDialog.mode}
          onClose={() => {
            setChecklistDialog({...checklistDialog, isOpen: false});
          }}
        />
        <Confirm
          open={deleteChecklistConfirm}
          onConfirm={deleteChecklist}
          onClose={() => setDeleteChecklistConfirm(false)}
          title={t('Delete')}
          content={t('Do you want to delete this checklist?')}
          disableActions={isDeleting}
        />
      </Grid>
      <BottomDrawer
        isOpen={isEditing}
        primaryButtonLabel="Save"
        primaryButtonAction={() => {
          saveChecklistAnswers();
        }}
        listItems={[]}
        isSaving={isUploadingAnswers}
        isValid
        buttonWrapperStyles={{
          justifyContent: 'space-between',
          paddingLeft: '6em',
        }}
        secondaryButton={
          <Button
            label="Cancel"
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              size: 'medium',
              onClick: () => {
                setIsCancelEditConfirmDialogOpen(true);
              },
            }}
          />
        }
      />
      <Confirm
        open={isCancelEditConfirmDialogOpen}
        onConfirm={() => {
          setIsEditing(false);

          const freshCopy = serviceOrderCheckLists?.find(
            (item) =>
              item.checkListId === selectedChecklist?.checkListId &&
              item.technicianId === selectedChecklist.technicianId,
          );

          setSelectedChecklist(freshCopy);
          setIsCancelEditConfirmDialogOpen(false);
        }}
        onClose={() => setIsCancelEditConfirmDialogOpen(false)}
        title="Cancel editing"
        content="You are about to cancel editing checklist."
        secondContent="All your progress will be lost"
        helperText=""
      />
    </>
  );
};
