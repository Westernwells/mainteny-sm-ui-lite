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
import {SendEmailDialog} from 'components/SendEmailDialog';
import {ConfirmPrintQuotation} from 'components/ConfirmPrintQuotation';
import {
  useDeleteQuotation,
  usePublishQuotation,
  useReplyQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {useDownloadFileWithCustomName} from 'hooks/reactQuery/useDownloadUrl';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {companyLanguageContextMap} from 'utils/utils';
import QuotationPdfTemplate from 'components/pdf-templates/QuotationPdfTemplate';
import {pdf} from '@react-pdf/renderer';
import {useCurrentCurrency} from 'utils/currency';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [actionType, setActionType] = useState('');
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutate: deleteQuotation} = useDeleteQuotation();
  const {mutateAsync: publishQuotation} = usePublishQuotation();

  const [filePathToDownload, setFilePathToDownload] = useState('');
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
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  useEffect(() => {
    if (imageUrl) {
      generateBlobUrl();
    }
  }, [actionType]);

  const {downloadFile} = useDownloadFileWithCustomName(
    quotation.number,
    filePathToDownload,
  );

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const printQuotation = async (url: string) => {
    if (quotation.status !== QuotationStatus.DRAFT) {
      printJS({
        printable: url,
        type: 'pdf',
        showModal: true,
      });
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
          printJS({
            printable: url,
            type: 'pdf',
            showModal: true,
          });
        },
      },
    );
  };

  const actions = (() => {
    const printAction = {
      label: t('Print'),
      icon: <Print />,
      onClick: () =>
        quotation.status === QuotationStatus.DRAFT
          ? setIsConfirmPrintDialogOpen(true)
          : setActionType('PRINT'),
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
      onClick: () => {
        setActionType('DOWNLOAD');
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
          onClick: () => setIsSendEmailDialogOpen(true),
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
          onClick: () => setIsSendEmailDialogOpen(true),
        },
        'divider',
        ...defaultActions,
        markAcceptedAction,
        markRejectedAction,
      ];
    }

    return defaultActions;
  })();

  useEffect(() => {
    if (filePathToDownload) {
      if (actionType === 'DOWNLOAD') {
        downloadFile();
      }

      if (actionType === 'PRINT') {
        printQuotation(filePathToDownload);
      }

      setFilePathToDownload('');
      setActionType('');
    }
  }, [filePathToDownload]);

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
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={quotation.id}
        submitHook={usePublishQuotation}
        email={
          quotation?.elevator?.propertyOwner?.additionalInfo.billingEmail ||
          quotation?.elevator?.propertyOwner?.contact.email
        }
        subject={quotation.subject}
        content={quotation.description}
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
