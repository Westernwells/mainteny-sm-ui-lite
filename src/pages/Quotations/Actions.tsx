import React, {useContext, useMemo, useState} from 'react';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import printJS from 'print-js';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {ConfirmPrintQuotation} from 'components/ConfirmPrintQuotation';
import {
  useDeleteQuotation,
  usePrintQuotation,
  useQuotationAmountDetailQuery,
  useQuotationSubItems,
  useReplyQuotation,
  useSendQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  QuotationStatus,
  QuotationSubItemRecord,
  QuotationView,
} from 'models/quotation';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {createFilesFromBlobArray, fetchFile} from 'utils/utils';
import QuotationPdfTemplate from 'components/pdf-templates/QuotationPdfTemplate';
import {pdf} from '@react-pdf/renderer';
import {useCurrentCurrency} from 'utils/currency';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {stripHtmlTags} from 'utils/text-block';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import TableActionButton from 'components/Table/TableActionButton';
import useQuotationMenuActions from 'hooks/useQuotationMenuActions';
import {companyLanguageContextMap} from 'utils/language';
import {downloadFile as utilDownloadFile} from 'utils/download';
import {quotationItemToQuotationItemRecord} from 'utils/quotation';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import {useVats} from 'hooks/reactQuery/useVats';
import {useSendEmailDialogContent} from 'hooks/useSendEmailDialogContent';

interface Props {
  quotation: QuotationView;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

const Actions = ({quotation}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: taxRates} = useVats();
  const currentCurrency = useCurrentCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);

  const {mutate: markAsAccepted} = useReplyQuotation(true);
  const {mutate: deleteQuotation} = useDeleteQuotation();
  const {mutateAsync: uploadFiles} = useUploadFiles('');
  const {mutateAsync: printQuotation} = usePrintQuotation();
  const {mutateAsync: sendQuotation} = useSendQuotation();

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  const [emailBody] = useSendEmailDialogContent(
    isSendEmailDialogOpen,
    quotation.description,
  );

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);

  const {data: quotationSubItems, refetch: fetchSubItems} =
    useQuotationSubItems(quotation.id, {
      enabled: false,
    });

  const subItemsMap: Record<string, QuotationSubItemRecord[]> = useMemo(
    () =>
      Object.entries(quotationSubItems ?? {}).reduce(
        (acc, [parentId, subItems]) => {
          acc[parentId] = subItems.map((subItem) => ({
            ...subItem,
            parentId,
          }));
          return acc;
        },
        {} as Record<string, QuotationSubItemRecord[]>,
      ),
    [quotationSubItems],
  );

  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });

  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

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

  const {data: clientStorageData, refetch: fetchPdfTemplateConfig} =
    useQueryClientStorageData({
      serviceCompanyId: company?.id!,
      params: {key: 'pdf-template'},
      options: {enabled: false},
    });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}, refetch: fetchHeaderUrl} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    {enabled: false},
    company?.id,
  );

  const {data: footerUrl = {}, refetch: fetchFooterUrl} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    {enabled: false},
    company?.id,
  );

  const {refetch: refetchDownloadUrl} = useDownloadUrl(
    quotation && quotation?.additionalInfo.pdfPath
      ? [quotation.additionalInfo.pdfPath]
      : [],
    {enabled: false},
  );

  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const uploadPath = `${serviceCompanyId}/quotations`;

  const transformedQuotationItems = useMemo(
    () =>
      quotation?.items.map((item) =>
        quotationItemToQuotationItemRecord(item, taxRates, subItemsMap),
      ) || [],
    [quotation?.items, subItemsMap],
  );

  const {data: quotationAmountDetail, refetch: fetchQuotationAmountDetail} =
    useQuotationAmountDetailQuery(quotation.id, {enabled: false});

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
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
        quotationItems={transformedQuotationItems}
        quotationAmountDetail={quotationAmountDetail}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();
    return blob;
  };

  const handleOpenMenu = async (event: any) => {
    setAnchorEl(event.currentTarget);
    await Promise.all([
      fetchQuotationAmountDetail(),
      fetchSubItems(),
      fetchPdfTemplateConfig(),
      fetchHeaderUrl(),
      fetchFooterUrl(),
    ]);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadDraftQuotation = async (filePath: string) => {
    const fileName = `${quotation.number}`;
    utilDownloadFile({fileName, downloadUrl: filePath});
  };

  const handleDownloadAction = async () => {
    if (quotation.status === QuotationStatus.DRAFT) {
      const blob = await generateBlobUrl();
      const blobURL = URL.createObjectURL(blob);
      await handleDownloadDraftQuotation(blobURL);
    } else {
      const {pdfPath} = quotation.additionalInfo;
      if (pdfPath) {
        const downloadUrlData = await refetchDownloadUrl();
        if (downloadUrlData.data?.[pdfPath]) {
          await handleDownloadDraftQuotation(downloadUrlData.data[pdfPath]);
        }
      }
    }
  };

  const handlePrintAction = async () => {
    const handlePrintSuccess = (url: string) => {
      printJS({
        printable: url,
        type: 'pdf',
        showModal: true,
      });
    };

    if (quotation.status === QuotationStatus.DRAFT) {
      const blob = await generateBlobUrl();
      const fileNames = [`${quotation.id}.pdf`];
      const files = await createFilesFromBlobArray([blob], fileNames);
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
            const blobUrl = URL.createObjectURL(blob);
            handlePrintSuccess(blobUrl);
          },
        },
      );
    } else {
      const downloadUrlData = await refetchDownloadUrl();
      const {pdfPath} = quotation.additionalInfo;
      if (pdfPath && downloadUrlData.data?.[pdfPath]) {
        const printUrl = downloadUrlData.data[pdfPath];
        await printQuotation(
          {
            id: quotation.id,
            body: {
              pdfPath,
              sentDate: '',
            },
          },
          {
            onSuccess: () => handlePrintSuccess(printUrl),
          },
        );
      }
    }

    setIsConfirmPrintDialogOpen(false);
  };

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
      argFileNames: string[],
      argFileDescriptions: string[],
    ) => {
      const blob = await fetchFile(url);
      return createFilesFromBlobArray(
        [blob],
        argFileNames,
        argFileDescriptions,
      );
    };

    const generateAndCreateFiles = async (
      argFileNames: string[],
      argFileDescriptions: string[],
    ) => {
      const blob = await generateBlobUrl();
      return createFilesFromBlobArray(
        [blob],
        argFileNames,
        argFileDescriptions,
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

  const {actions} = useQuotationMenuActions({
    quotation,
    onSend: handleOpenSendEmail,
    onDownload: handleDownloadAction,
    onDelete: () => setIsDeleteDialogOpen(true),
    onResend: handleOpenSendEmail,
    onMarkAccepted: () => setIsDialogOpen(true),
    onMarkRejected: () => setIsRejectedDialogOpen(true),
    onPrint: () =>
      quotation.status === QuotationStatus.DRAFT
        ? setIsConfirmPrintDialogOpen(true)
        : handlePrintAction(),
  });

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '40px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <TableActionButton
        testId="quotation-action-menu-button"
        removePadding
        onClick={handleOpenMenu}
      />
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        {actions.map((item, index) =>
          typeof item === 'string' ? (
            <Divider key={`${item}-${index}`} sx={{borderWidth: 1}} />
          ) : (
            <Box key={`${item.label}-${index}`}>
              <MenuItem
                onClick={() => {
                  item.onClick?.();
                  handleClose();
                }}
                sx={{py: '0.5rem'}}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>
                  <Typography variant="body2">{item.label}</Typography>
                </ListItemText>
              </MenuItem>
            </Box>
          ),
        )}
      </Menu>

      <Confirm
        open={isDialogOpen}
        onConfirm={async () => {
          if (quotation.id && user) {
            const fileNames: string[] = [`${quotation.id}.pdf`];

            if (quotation.status === QuotationStatus.DRAFT) {
              const blob = await generateBlobUrl();
              const fileDescriptions = [`${quotation.externalId}.pdf`];

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
                [blob],
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
      <SendEmailDialog
        isLoadingFiles={isLoadingFiles}
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={quotation.id}
        email={
          quotation?.elevator?.propertyOwner?.additionalInfo.billingEmail ||
          quotation?.elevator?.propertyOwner?.contact.email
        }
        subject={stripHtmlTags(quotation.subject)}
        content={emailBody}
        existingFiles={existingFiles}
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

          await sendQuotation({
            id: quotation.id,
            body: {
              pdfPath: `${uploadPath}/${fileNames[0]}`,
              sentDate: '',
              email: {
                email: '',
                subject: emailRecord.subject,
                content: emailRecord.content,
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
                    return [
                      ...newArr,
                      {
                        ...obj,
                        type: obj.type,
                        uri: isFileFromServer
                          ? `${uploadPath}/${quotation.id}.pdf`
                          : `${uploadPath}/${obj.name}`,
                        description: isFileFromServer
                          ? `${quotation.externalId}.pdf`
                          : `${fileNameWithoutExtension}.${fileExtension}`,
                      },
                    ];
                  },
                  [],
                ),
              },
            },
          });

          setIsConfirmPrintDialogOpen(false);
        }}
      />
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
      <ConfirmPrintQuotation
        open={isConfirmPrintDialogOpen}
        onConfirm={handlePrintAction}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};

export default Actions;
