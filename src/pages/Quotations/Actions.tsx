import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import printJS from 'print-js';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import Edit from '@mui/icons-material/Edit';
import CopyAll from '@mui/icons-material/CopyAll';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import Print from '@mui/icons-material/Print';
import Close from '@mui/icons-material/Close';
import FileDownload from '@mui/icons-material/FileDownload';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {ConfirmPrintQuotation} from 'components/ConfirmPrintQuotation';
import {
  useDeleteQuotation,
  usePrintQuotation,
  useReplyQuotation,
  useSendQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  fetchFile,
} from 'utils/utils';
import QuotationPdfTemplate from 'components/pdf-templates/QuotationPdfTemplate';
import {pdf} from '@react-pdf/renderer';
import {useCurrentCurrency} from 'utils/currency';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useQueryClientStorageData} from 'hooks/useClientStorage';

interface Props {
  quotation: QuotationView;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const Actions = ({quotation}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [actionType, setActionType] = useState('');
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [blobFile, setBlobFile] = useState<Blob>();
  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutate: deleteQuotation} = useDeleteQuotation();
  const {mutateAsync: uploadFiles} = useUploadFiles('');
  const {mutateAsync: printQuotation} = usePrintQuotation();
  const {mutateAsync: sendQuotation} = useSendQuotation();

  const [filePathToDownload, setFilePathToDownload] = useState('');

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

  const {data: downloadUrl, refetch: refetchDownloadUrl} = useDownloadUrl(
    quotation && quotation?.additionalInfo.pdfPath
      ? [quotation.additionalInfo.pdfPath]
      : [],
    {enabled: false},
  );

  const generateBlobUrl = async () => {
    const blob = await pdf(
      <QuotationPdfTemplate
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        quotation={quotation}
        selectedLng={company?.language}
        translate={translate}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
      />,
    ).toBlob();
    setBlobFile(blob);
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
    return blob;
  };

  const {downloadFile} = useDownloadFileWithCustomName(
    quotation.number,
    downloadUrl?.[quotation.additionalInfo.pdfPath!] || '',
  );

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onPrintQuotation = async (url: string) => {
    const handlePrintSuccess = () => {
      setIsConfirmPrintDialogOpen(false);
      if (url) {
        printJS({
          printable: url,
          type: 'pdf',
          showModal: true,
        });
      }
    };

    if (quotation.status !== QuotationStatus.DRAFT) {
      await printQuotation(
        {
          id: quotation.id,
          body: {
            pdfPath: quotation.additionalInfo.pdfPath ?? '',
            sentDate: '',
          },
        },
        {onSuccess: handlePrintSuccess},
      );
    } else {
      const serviceCompanyId = user?.userAccount.serviceCompany.id;
      const uploadPath = `${serviceCompanyId}/quotations`;
      const fileNames = [`${quotation.id}.pdf`];
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
        {onSuccess: handlePrintSuccess},
      );
    }
  };

  const handlePrintAction = () => {
    setActionType('PRINT');
    if (quotation.status !== QuotationStatus.DRAFT) {
      refetchDownloadUrl();
    }
  };

  useEffect(() => {
    if (filePathToDownload && actionType === 'PRINT') {
      onPrintQuotation(filePathToDownload);
      setFilePathToDownload('');
      setActionType('');
    }
  }, [filePathToDownload, actionType]);

  useEffect(() => {
    if (downloadUrl?.[filePathToDownload] && actionType === 'DOWNLOAD') {
      downloadFile();
      setFilePathToDownload('');
    }

    if (quotation.status !== QuotationStatus.DRAFT && actionType === 'PRINT') {
      setFilePathToDownload(downloadUrl?.[quotation.additionalInfo.pdfPath!]!);
    }
  }, [downloadUrl]);

  const getExistingFiles = async (
    fileDownloadUrl:
      | {
          [key: string]: string;
        }
      | undefined,
  ) => {
    // if quotation is not DRAFT -> download file from server
    if (quotation.status !== QuotationStatus.DRAFT) {
      const blob = await fetchFile(
        fileDownloadUrl ? Object.values(fileDownloadUrl)[0] : '',
      );
      const fileNames: string[] = [`${quotation.externalId}.pdf`];
      const files = await createFilesFromBlobArray([blob], fileNames);
      setExistingFiles(files);

      // if quotation is DRAFT -> generate file on client
    } else {
      const blob = await generateBlobUrl();
      const fileNames: string[] = [`${quotation.externalId}.pdf`];
      const files = await createFilesFromBlobArray([blob], fileNames);
      setExistingFiles(files);
    }
  };

  const handleOpenSendEmail = async () => {
    setIsLoadingFiles(true);
    setIsSendEmailDialogOpen(true);
    // using then to wait for refetch and get download url
    await refetchDownloadUrl().then(async (res) => {
      await getExistingFiles(res.data);
    });
    setIsLoadingFiles(false);
  };

  const actions = (() => {
    const printAction = {
      label: t('Print'),
      icon: <Print />,
      onClick: () =>
        quotation.status === QuotationStatus.DRAFT
          ? setIsConfirmPrintDialogOpen(true)
          : handlePrintAction(),
    };
    const duplicateAction = {
      label: t('Duplicate'),
      icon: <CopyAll />,
      onClick: () => {
        navigate(`/quotations/new?id=${quotation.id}`);
      },
    };
    const downloadAction = {
      label: t('Download'),
      icon: <FileDownload />,
      onClick: async () => {
        setActionType('DOWNLOAD');
        refetchDownloadUrl();
        setFilePathToDownload(quotation.additionalInfo.pdfPath!);
      },
    };
    const markAcceptedAction = {
      label: t('Mark Accepted'),
      icon: <CheckIcon />,
      onClick: () => setIsDialogOpen(true),
    };
    const markRejectedAction = {
      label: t('Mark Rejected'),
      icon: <Close />,
      onClick: () => setIsRejectedDialogOpen(true),
    };

    const defaultActions = [printAction, duplicateAction, downloadAction];

    if (quotation.status === QuotationStatus.DRAFT) {
      return [
        {
          label: t('Send'),
          icon: <SendIcon />,
          onClick: handleOpenSendEmail,
        },
        'divider',
        printAction,
        duplicateAction,
        markAcceptedAction,
        markRejectedAction,
        'divider',
        {
          label: t('Delete'),
          icon: <DeleteIcon />,
          onClick: () => setIsDeleteDialogOpen(true),
        },
      ];
    }

    if (quotation.status === QuotationStatus.SENT_TO_CLIENT) {
      return [
        {
          label: t('Resend'),
          icon: <ReplayIcon />,
          onClick: handleOpenSendEmail,
        },
        'divider',
        ...defaultActions,
        markAcceptedAction,
        markRejectedAction,
      ];
    }

    return defaultActions;
  })();

  return (
    <Box>
      {quotation.status !== QuotationStatus.ACCEPTED && (
        <IconButton
          onClick={() => navigate(`/quotations/details/${quotation.id}/edit`)}
          sx={{color: 'action.active'}}>
          <Edit fontSize="small" />
        </IconButton>
      )}

      <IconButton onClick={handleClick}>
        <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
      </IconButton>
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
                  item.onClick();
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
        subject={quotation.subject}
        content={quotation.description}
        existingFiles={existingFiles}
        callback={async (emailRecord) => {
          setIsSendEmailDialogOpen(false);

          const serviceCompanyId = user?.userAccount.serviceCompany.id;
          const uploadPath = `${serviceCompanyId}/quotations`;
          const fileNames: string[] = [`${quotation.id}.pdf`];
          const isDraft = quotation.status === QuotationStatus.DRAFT;

          const allAttachments = emailRecord.attachments || existingFiles;
          const emailAttachments = (emailRecord.attachments || [])?.filter(
            (emailAttachedFile) =>
              !existingFiles.find(
                (existingFile) => existingFile.name === emailAttachedFile.name,
              ),
          );

          if (isDraft) {
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
                    return [
                      ...newArr,
                      {
                        ...obj,
                        type: obj.type,
                        uri: isFileFromServer
                          ? `${uploadPath}/${quotation.id}.pdf`
                          : `${uploadPath}/${obj.name}`,
                        description: isFileFromServer
                          ? quotation.externalId
                          : obj.name.split('.')[0],
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
        onConfirm={() => {
          setActionType('PRINT');
        }}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};
