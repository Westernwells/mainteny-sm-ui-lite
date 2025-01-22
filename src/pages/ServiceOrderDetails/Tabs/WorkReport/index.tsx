import {useEffect, useMemo, useState} from 'react';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import {A4Layout} from 'components/A4Layout';
import {SelectCombined} from 'components/SelectCombined';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {
  useCompleteServiceOrder,
  useSendWorkReport,
  useUpdateServiceOrderReport,
} from 'hooks/reactQuery/useServiceOrder';
import {
  CompleteServiceOrder,
  ServiceOrderArticleView,
  ServiceOrderReportView,
  ServiceOrderView,
} from 'models/service-order';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import RichTextField from 'components/RichTextField';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {
  articleViewToArticleRecord,
  calculateTotalBillableHours,
  convertTimeSlotDatesToRestDateTime,
  getJobTypeGivenName,
  getSignatureKeys,
} from 'utils/service-order-utils';
import {convertDigitalMinsToHM} from 'utils/datetime';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useSearchParams} from 'react-router-dom';
import {
  convertToText,
  createFilesFromBlobArray,
  fetchFile,
  formatSearchParams,
  titleCase,
} from 'utils/utils';
import {theme} from 'theme';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {pdf} from '@react-pdf/renderer';
import {
  useCompanyById,
  useCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import useFetchAndConvertImage from 'hooks/useFetchAndConvertImage';
import {EmailRecord, PdfGenerationStatus, ReportStatus} from 'models/misc';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {IconButton, InputAdornment} from '@mui/material';
import {GridCellParams} from '@mui/x-data-grid';
import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {Dialog} from 'components/Dialog';
import TextBlockActions from 'components/text-blocks/TextBlockActions';
import TextBlockSelect from 'components/text-blocks/TextBlockSelect';
import {cleanHtmlContent} from 'utils/text-block';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import useMultiImagesURLToBase64 from 'hooks/useMultiImagesURLToBase64';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {getTechnicianName} from 'utils/employee';
import {companyLanguageContextMap} from 'utils/language';
import {EmailSignature} from 'models/employee';
import {FileResourceRecord} from 'models/media';
import UpdateConfirmationModal from 'pages/ServiceOrderDetails/UpdateConfirmationModal';
import {Confirm} from 'components/Confirm';
import {Maintenance} from './Maintenance';
import {Signature} from './Signature';
import {ReportCard} from './ReportCard';
import {ArticleItemsTable} from './ArticleItemsTable';
import {Pictures} from './Pictures';

interface Props {
  serviceOrder: ServiceOrderView;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

const validationSchema = Yup.object().shape({
  serviceTimeHM: Yup.string()
    .required()
    .matches(/^[0-9]{2}:[0-9]{2}$/, {
      message: 'Total time must be in 00:00 format',
    }),
});

export const WorkReport = ({serviceOrder}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const [queryParams, setQueryParams] = useSearchParams();
  const isEditMode = queryParams.get('edit') === '1';
  const [articles, setArticles] = useState<ServiceOrderArticleView[]>([]);
  const [report, setReport] = useState<ServiceOrderReportView | undefined>(
    serviceOrder?.reports?.[0],
  );
  const [shouldFetchImages, setShouldFetchImages] = useState(false);
  const [isCancelEditConfirmDialogOpen, setIsCancelEditConfirmDialogOpen] =
    useState(false);

  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const schedule = serviceOrder.schedules
    .filter((item) => !!item.technician)
    .find((s) => s.technician!.id === report?.technicianId);

  const {data: fetchedTechnician} = useGetTechniciansByEmployeeId(
    report?.technicianId || '',
  );

  const technicianName = useMemo(
    () => getTechnicianName(schedule, fetchedTechnician),
    [schedule, fetchedTechnician],
  );

  const reportToUpdate = serviceOrder?.reports?.find(
    (r) => r.externalId === report?.externalId,
  );

  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {mutate: sendWorkReport, isLoading: sendingWorkReport} =
    useSendWorkReport();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const signatureKeys = getSignatureKeys(
    serviceOrder,
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

  const technicianSignatureImage = useFetchAndConvertImage(
    downloadUrls[signatureKeys.TECHNICIAN],
  );

  const customerSignatureImage = useFetchAndConvertImage(
    downloadUrls[signatureKeys.CUSTOMER],
  );

  const {convertedImages, isImageLoading} = useMultiImagesURLToBase64(
    imageDownloadUrls,
    {enabled: shouldFetchImages},
  );

  const isReportDisabled =
    report?.additionalInfo.status !== ReportStatus.COMPLETED;

  const [actionType, setActionType] = useState('');
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState('');

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
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

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

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

  const [activeSignature, setActiveSignature] = useState<
    EmailSignature | undefined
  >();

  const {data: signatureUrls = {}} = useDownloadUrl(
    activeSignature?.content?.images || [],
  );

  const {mutate: completeServiceOrder, isLoading: updatingServiceOrder} =
    useCompleteServiceOrder('Work report updated successfully!');
  const {
    mutate: updateServiceOrderReport,
    isLoading: isUpdatingServiceOrderReport,
  } = useUpdateServiceOrderReport('Work report updated successfully!');
  const {mutateAsync: uploadFiles} = useUploadFiles('');

  const generateWorkReportPdf = async () => {
    const blob = await pdf(
      <WorkReportTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={user?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={serviceOrder}
        report={report}
        technicianSignatureImage={technicianSignatureImage}
        customerSignatureImage={customerSignatureImage}
        workReportPictures={convertedImages}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        technicianName={technicianName}
        serviceOrderType={getJobTypeGivenName(serviceOrder.type, jobTypes)}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setPreviewPdfBlobUrl(blobURL);
    return blob;
  };

  const {data: downloadUrl, refetch: refetchDownloadUrl} = useDownloadUrl(
    report && report?.additionalInfo.pdfPath
      ? [report.additionalInfo.pdfPath]
      : [],
    {enabled: false},
  );

  const createEmailAttachments = (
    files: FileWithPreview[],
    path: string,
    fileReport?: ServiceOrderReportView,
    signatureAttachment?: FileWithPreview,
  ) => {
    const attachments = files.reduce<FileWithPreview[]>(
      (newArr, obj, index) => {
        // If file is from server -> uri of file should be report.id
        // If file is from server -> description should be report.externalId || report.number
        const isFileFromServer = !obj.path && index === 0;

        newArr.push({
          ...obj,
          type: obj.type,
          uri: isFileFromServer
            ? `${path}/${fileReport?.id}.pdf`
            : `${path}/${obj.name}`,
          description: isFileFromServer
            ? `${fileReport?.externalId}.pdf` || `${fileReport?.number}.pdf`
            : obj.name.split('.')[0],
        });

        return newArr;
      },
      [],
    );

    // Add signatureAttachment if it exists and is not already in the list
    if (
      signatureAttachment &&
      !attachments.some(
        (attachment) => attachment.uri === signatureAttachment.contentId,
      )
    ) {
      attachments.push(signatureAttachment);
    }

    return attachments;
  };

  const sendEmailReport = async (
    emailServiceOrder: ServiceOrderView,
    values: EmailRecord,
    files: FileWithPreview[],
    pdfPath: string,
    uploadPath: string,
    fileReport?: ServiceOrderReportView,
    signatureAttachment?: FileWithPreview,
  ) => {
    sendWorkReport(
      {
        id: emailServiceOrder.id,
        body: {
          technicianId: fileReport?.technicianId!,
          pdfPath,
          email: {
            email: '',
            emails: values.emails,
            ccEmails: values.ccEmails,
            bccEmails: values.bccEmails,
            subject: values.subject,
            content: values.content,
            attachments: createEmailAttachments(
              files,
              uploadPath,
              fileReport,
              signatureAttachment,
            ),
          },
        },
      },
      {onSuccess: () => setIsSendEmailDialogOpen(false)},
    );
  };

  const getExistingFiles = async (
    fileDownloadUrl:
      | {
          [key: string]: string;
        }
      | undefined,
  ) => {
    const fileNames = [`${report?.id}.pdf`];
    const fileDescriptions = [`${report?.externalId}.pdf`];
    let files: FileWithPreview[] = [];

    if (
      report?.additionalInfo &&
      report?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE
    ) {
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
      const blobFile = await generateWorkReportPdf();
      files = await createFilesFromBlobArray(
        [blobFile!],
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

  const onSubmitHandler = async (values: EmailRecord) => {
    const fileNames: string[] = [`${report?.id}.pdf`];
    const uploadPath = `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report`;
    const isPDFGenerated =
      report?.additionalInfo &&
      report?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE;

    const allAttachments = values.attachments || existingFiles;
    const emailAttachments = (values.attachments || [])?.filter(
      (el) => el.path,
    );
    const hasExistingFileToUpload = allAttachments.some((obj, index) => {
      const isExistingFile = !obj.path && index === 0;
      return isExistingFile;
    });

    if (!isPDFGenerated && hasExistingFileToUpload) {
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

    await sendEmailReport(
      serviceOrder,
      values,
      allAttachments,
      isPDFGenerated
        ? report?.additionalInfo.pdfPath!
        : `${uploadPath}/${fileNames[0]}`,
      uploadPath,
      report,
      signatureAttachment as FileWithPreview,
    );

    setActiveSignature(undefined);
  };

  const handleReportUpdateSuccess = () => {
    setQueryParams(formatSearchParams({edit: '0'}, queryParams));
  };

  const formik = useFormik<CompleteServiceOrder & {serviceTimeHM: string}>({
    initialValues: {
      articles: articleViewToArticleRecord(articles),
      description: report?.description ?? '',
      startTime: serviceOrder?.actualStartTime,
      endTime: serviceOrder?.actualEndTime,
      travelStartTime: serviceOrder?.travelStartTime,
      travelEndTime: serviceOrder?.travelEndTime,
      serviceTimeHM: convertDigitalMinsToHM(report?.actualServiceTime ?? 0),
      onlyShowTotalTime: report?.additionalInfo?.onlyShowTotalTime ?? false,
      workTimeRecord: {
        percentageSurcharge: 0,
        timeSlots: [],
      },
      travelTimeRecord: {
        percentageSurcharge: 0,
        timeSlots: [],
      },
      showTime: report?.additionalInfo.showTime ?? true,
      showHours: report?.additionalInfo.showHours ?? true,
    },
    onSubmit: (values) => {
      const body = {
        technicianId: report?.technicianId,
        description: values.description,
        articles: articleViewToArticleRecord(articles),
        serviceTime: calculateTotalBillableHours([values.workTimeRecord!]),
        travelTime: calculateTotalBillableHours([values.travelTimeRecord!]),
        onlyShowTotalTime: values.onlyShowTotalTime,
        workTimeRecord: convertTimeSlotDatesToRestDateTime(
          values.workTimeRecord,
        ),
        travelTimeRecord: convertTimeSlotDatesToRestDateTime(
          values.travelTimeRecord,
        ),
        showHours: values.showHours,
        showTime: values.showTime,
      };

      const updatedReport: CompleteServiceOrder = {
        ...body,
        attachments: report?.attachments.map((attachment) => ({
          uri: attachment.fileResource.uri,
          description: attachment.fileResource.description,
          type: attachment.fileResource.type,
        })),
      };

      if (report?.additionalInfo.status === ReportStatus.COMPLETED) {
        return completeServiceOrder(
          {
            serviceOrderId: serviceOrder.id ?? '',
            body: updatedReport,
          },
          {
            onSuccess: handleReportUpdateSuccess,
          },
        );
      }

      return updateServiceOrderReport(
        {
          qs: {serviceOrderId: serviceOrder.id!, reportId: report?.id!},
          body: updatedReport,
        },
        {
          onSuccess: handleReportUpdateSuccess,
        },
      );
    },
    validationSchema,
  });

  const [openTextBlockDialog, setOpenTextBlockDialog] =
    useState<boolean>(false);
  const [activeSubDialog, setActiveSubDialog] = useState<
    'edit' | 'preview' | 'delete' | 'create' | undefined
  >(undefined);
  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);

  const onCloseSubDialogs = () => {
    setActiveSubDialog(undefined);
    setOpenTextBlockDialog(true);
  };

  const handleCellClick = (rowParams: GridCellParams<any, any, any>) => {
    const currentDescription = cleanHtmlContent(
      formik.values.description || '',
    );
    const newDescription = cleanHtmlContent(
      `${currentDescription} ${rowParams.row.text}`.trim(),
    );

    formik.setFieldValue('description', newDescription);
    setOpenTextBlockDialog(false);
  };

  const resetForm = () => {
    if (report) {
      let temp: ServiceOrderArticleView[] = [];
      if ('articles' in serviceOrder) {
        temp = serviceOrder.articles;
      }
      setArticles(temp);
      formik.resetForm({
        values: {
          articles: articleViewToArticleRecord(temp),
          description: report?.description ?? '',
          startTime: serviceOrder?.actualStartTime,
          endTime: serviceOrder?.actualEndTime,
          travelStartTime: serviceOrder?.travelStartTime,
          travelEndTime: serviceOrder?.travelEndTime,
          serviceTimeHM: convertDigitalMinsToHM(report?.actualServiceTime ?? 0),
          onlyShowTotalTime: report?.additionalInfo?.onlyShowTotalTime ?? false,
          workTimeRecord: {
            percentageSurcharge:
              report.additionalInfo.workTimeInfo?.percentageSurcharge ?? 0,
            timeSlots: report.additionalInfo.workTimeInfo?.timeSlots ?? [],
          },
          travelTimeRecord: {
            percentageSurcharge:
              report.additionalInfo.travelTimeInfo?.percentageSurcharge ?? 0,
            timeSlots: report.additionalInfo.travelTimeInfo?.timeSlots ?? [],
          },
        },
      });
    }
  };

  const {downloadFile} = useDownloadFileWithCustomName(
    report?.externalId || report?.number || '',
    previewPdfBlobUrl,
  );

  const handleClickDownload = async () => {
    if (
      report?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE
    ) {
      const downloadUrlValue = downloadUrl ? Object.values(downloadUrl)[0] : '';
      if (downloadUrlValue) {
        try {
          const blob = await fetchFile(downloadUrlValue);
          const blobURL = URL.createObjectURL(blob);
          setPreviewPdfBlobUrl(blobURL);
        } catch (error) {
          console.error('Error fetching the file:', error);
        }
      }
    } else {
      await generateWorkReportPdf();
    }
    setActionType('DOWNLOAD');
  };

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmAccept = () => {
    formik.handleSubmit();
    handleConfirmClose();
  };

  useEffect(() => {
    resetForm();
  }, [report]);

  useEffect(() => {
    if (reportToUpdate) {
      setReport(reportToUpdate);
    }
  }, [serviceOrder]);

  useEffect(() => {
    refetchDownloadUrl();
  }, [report]);

  useEffect(() => {
    formik.setFieldValue('workTimeRecord', {
      percentageSurcharge:
        report?.additionalInfo.workTimeInfo?.percentageSurcharge ?? 0,
      timeSlots: report?.additionalInfo.workTimeInfo?.timeSlots ?? [],
    });
    formik.setFieldValue('travelTimeRecord', {
      percentageSurcharge:
        report?.additionalInfo.travelTimeInfo?.percentageSurcharge ?? 0,
      timeSlots: report?.additionalInfo.travelTimeInfo?.timeSlots ?? [],
    });
    formik.setFieldValue('description', report?.description || '');
    formik.setFieldValue('showHours', report?.additionalInfo.showHours ?? true);
    formik.setFieldValue('showTime', report?.additionalInfo.showTime ?? true);
  }, [
    report?.additionalInfo.workTimeInfo,
    report?.additionalInfo.travelTimeInfo,
    report?.description,
    report?.additionalInfo.showHours,
    report?.additionalInfo.showTime,
  ]);

  useEffect(() => {
    if (articles.length) {
      formik.setFieldValue('articles', articleViewToArticleRecord(articles));
    }
  }, [articles]);

  useEffect(() => {
    const hasDownloadUrls = Object.keys(imageDownloadUrls).length > 0;
    const hasAttachmentUris = report?.attachments?.every(
      (attachment) => attachment.fileResource?.uri,
    );
    if (hasDownloadUrls && hasAttachmentUris) {
      setShouldFetchImages(true);
    }
  }, [imageDownloadUrls, report?.attachments]);

  useEffect(() => {
    if (previewPdfBlobUrl && actionType === 'DOWNLOAD') {
      downloadFile();
      setPreviewPdfBlobUrl('');
      setActionType('');
    }
  }, [actionType, previewPdfBlobUrl]);

  if (!report) {
    return (
      <PageCard containerStyles={{py: '3em'}}>
        <EmptySection label="No work report yet. It will appear here once the order is completed." />
      </PageCard>
    );
  }

  return (
    <Box width="min(calc(1240px + 1.25em), 100%)" mx="auto">
      <ReportCard
        date={report.meta.createdAt}
        type={getJobTypeGivenName(serviceOrder?.type, jobTypes)}
        number={serviceOrder.number}
        status={serviceOrder.status}
        order={serviceOrder}
        onReportChange={setReport}
      />
      <A4Layout hideHeader containerStyle={{border: 'unset', padding: 'unset'}}>
        <Box display="flex" gap="7em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <SelectCombined
              selected
              label="Customer Details"
              buttonText=""
              cardHeader={
                <Typography variant="body2">
                  {serviceOrder.elevator.propertyOwner.name}
                </Typography>
              }
              cardBody={
                <>
                  <Typography variant="caption">
                    {serviceOrder.elevator.propertyOwner.billingAddress
                      ?.fullName ?? '-'}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.propertyOwner.contact.phone}
                  </Typography>
                  <Typography variant="subtitle2" component="p">
                    {t('Customer Number')}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.propertyOwner.externalId || '-'}
                  </Typography>
                </>
              }
              modalHeader=""
              modalBody={null}
            />
            <SelectCombined
              selected
              label="Unit Details"
              buttonText=""
              cardHeader={
                <Typography variant="body2">
                  {serviceOrder.elevator.model}
                </Typography>
              }
              cardBody={
                <>
                  <Typography variant="caption">
                    {serviceOrder.elevator.address.fullName}
                  </Typography>
                  <Typography variant="subtitle2" component="p">
                    {t('Unit Number')}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.externalId || '-'}
                  </Typography>
                </>
              }
              modalHeader=""
              modalBody={null}
            />
          </Box>
          <Box
            width="40%"
            display="flex"
            flexDirection="column"
            gap="2em"
            mt="1.5em">
            {report &&
              [
                {
                  label: 'Report ID',
                  value: report.number,
                },
                {
                  label: 'Job ID',
                  value: serviceOrder.number,
                },
                {
                  label: 'Technician',
                  value: technicianName,
                },
                {
                  label: 'Unit Status',
                  value: `${t(
                    titleCase(convertToText(serviceOrder.elevator.status)),
                  )}`,
                },
              ].map((i) => (
                <Box key={i.label}>
                  <FormLabel text={i.label} />
                  <Typography>{i.value || '-'}</Typography>
                </Box>
              ))}
          </Box>
        </Box>
        <Maintenance formik={formik} isEdit={isEditMode || false} />

        <ArticleItemsTable
          items={articles}
          setItems={setArticles}
          isEdit={isEditMode || false}
        />

        <Box mt="1em">
          <Pictures
            report={report}
            attachments={report.attachments}
            serviceCompanyId={serviceCompanyId!}
            serviceOrder={serviceOrder}
            isEditMode={isEditMode}
            setReport={setReport}
          />
        </Box>

        <Box mt="1em">
          <RichTextField
            label="Description of Service"
            html={formik.values.description || ''}
            updateHtml={(h) => formik.setFieldValue('description', h)}
            minRows={4}
            disabled={!isEditMode}
            endAdornment={
              isEditMode && (
                <InputAdornment
                  component={IconButton}
                  disableRipple
                  position="end"
                  sx={{
                    mt: 1,
                    mr: -1,
                    alignSelf: 'flex-start',
                  }}
                  onClick={() => {
                    setOpenTextBlockDialog(true);
                  }}
                  size="small">
                  <TextSnippetIcon />
                </InputAdornment>
              )
            }
          />
        </Box>

        <Box mt="1em" mb="1.5em">
          <FormLabel text="Signature" />
          <Box display="flex" justifyContent="space-between">
            <Signature
              name={serviceOrder.elevator.propertyOwner.name}
              designation="Customer"
              url={downloadUrls[signatureKeys.CUSTOMER]}
            />
            <Signature
              name={technicianName}
              designation="Engineer"
              url={downloadUrls[signatureKeys.TECHNICIAN]}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} pt="3rem">
          <Button
            buttonProps={{
              size: 'large',
              variant: 'outlined',
              disabled: isImageLoading || isReportDisabled,
              sx: {
                background: 'transparent',
              },
              startIcon: <FileDownloadIcon />,
              onClick: () => handleClickDownload(),
            }}>
            <Typography variant="subtitle2">{t('Download')}</Typography>
          </Button>
          <Button
            buttonProps={{
              size: 'large',
              variant: 'contained',
              disabled: isImageLoading || isReportDisabled,
              startIcon: <SendIcon />,
              onClick: handleOpenSendEmail,
            }}>
            <Typography variant="subtitle2">{t('Send Work Report')}</Typography>
          </Button>
        </Box>
      </A4Layout>

      <BottomDrawer
        isOpen
        primaryButtonLabel={isEditMode ? 'Save' : 'Edit'}
        primaryButtonAction={() => {
          if (isEditMode) {
            setOpenConfirmDialog(true);
            return;
          }
          setQueryParams(formatSearchParams({edit: '1'}, queryParams));
        }}
        listItems={[]}
        isSaving={updatingServiceOrder || isUpdatingServiceOrderReport}
        isValid={!isEditMode ? formik.isValid : true}
        buttonWrapperStyles={
          isEditMode
            ? {
                justifyContent: 'space-between',
                paddingLeft: '6em',
              }
            : undefined
        }
        secondaryButton={
          isEditMode && (
            <Button
              label="Cancel"
              buttonProps={{
                variant: 'outlined',
                sx: {bgcolor: theme.palette.inputBackground.main},
                size: 'medium',
                onClick: () => setIsCancelEditConfirmDialogOpen(true),
              }}
            />
          )
        }
      />

      <Confirm
        open={isCancelEditConfirmDialogOpen}
        onConfirm={() => {
          setQueryParams(formatSearchParams({edit: '0'}, queryParams));
          setReport(reportToUpdate);
          setIsCancelEditConfirmDialogOpen(false);
        }}
        onClose={() => setIsCancelEditConfirmDialogOpen(false)}
        title="Cancel editing"
        content="You are about to cancel editing work report."
        secondContent="All your progress will be lost"
        helperText=""
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => {
          setIsSendEmailDialogOpen(false);
          setActiveSignature(undefined);
        }}
        confirmBtnDisabled={sendingWorkReport}
        title="Send work report"
        confirmBtnLabel="Send Work Report"
        existingFiles={existingFiles}
        isLoadingFiles={isLoadingFiles}
        email={
          serviceOrder.elevator.propertyOwner?.additionalInfo.billingEmail ||
          serviceOrder.elevator.propertyOwner?.contact.email
        }
        subject=""
        content={formik.values.description}
        callback={(emailRecord) => onSubmitHandler(emailRecord)}
        activeSignature={activeSignature}
        onSignatureSelect={(signature) => setActiveSignature(signature)}
      />

      <Dialog
        title="Click to apply your block"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => {
          setOpenTextBlockDialog(false);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openTextBlockDialog || false,
        }}
        showCancelButton={false}
        showSaveButton={false}>
        <TextBlockSelect
          textBlockCategories={[
            TextBlockCategory.QUOTATION,
            TextBlockCategory.ARTICLE_ORDER,
            TextBlockCategory.INVOICE,
            TextBlockCategory.SERVICE_ORDER,
            TextBlockCategory.SERVICE_ORDER_REPORT,
            TextBlockCategory.EMAIL,
          ]}
          setOpenTextBlockDialog={setOpenTextBlockDialog}
          setActiveSubDialog={setActiveSubDialog}
          setActiveTextBlock={setActiveTextBlock}
          handleCellClick={handleCellClick}
        />
      </Dialog>

      {activeSubDialog && (
        <TextBlockActions
          textBlockCategory={TextBlockCategory.SERVICE_ORDER_REPORT}
          activeSubDialog={activeSubDialog}
          setActiveSubDialog={setActiveSubDialog}
          openDialog={
            activeSubDialog === 'edit' || activeSubDialog === 'create'
          }
          openPreviewDialog={activeSubDialog === 'preview'}
          openCancelConfirm={activeSubDialog === 'delete'}
          activeTextBlock={activeTextBlock}
          onCloseSubDialogs={onCloseSubDialogs}
        />
      )}

      {openConfirmDialog && (
        <UpdateConfirmationModal
          open={openConfirmDialog}
          order={serviceOrder}
          onConfirm={handleConfirmAccept}
          onCancel={handleConfirmClose}
        />
      )}
    </Box>
  );
};
