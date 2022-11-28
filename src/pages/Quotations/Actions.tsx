import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
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
import {
  useDeleteQuotation,
  usePublishQuotation,
  useReplyQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {PdfGenerationStatus} from 'models/misc';

interface Props {
  quotation: QuotationView;
}

export const Actions = ({quotation}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useUserSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const {data: downloadUrl} = useDownloadUrl(
    quotation ? [quotation!.additionalInfo.pdfPath] : [],
  );
  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutate: deleteQuotation} = useDeleteQuotation();

  const isPDFGenerated =
    quotation.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    downloadUrl;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actions = useMemo(() => {
    const items = [];

    if (quotation.status === QuotationStatus.DRAFT) {
      items.push({
        label: t('Send'),
        icon: <SendIcon />,
        onClick: () => setIsSendEmailDialogOpen(true),
      });
    } else if (quotation.status === QuotationStatus.SENT_TO_CLIENT) {
      items.push({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: () => setIsSendEmailDialogOpen(true),
      });
    }

    items.push(
      ...[
        ...(isPDFGenerated
          ? [
              {
                label: t('Print'),
                icon: <Print />,
                onClick: () =>
                  downloadUrl &&
                  printJS({
                    printable: Object.values(downloadUrl)[0],
                    type: 'pdf',
                    showModal: true,
                  }),
              },
            ]
          : []),
        {
          label: t('Duplicate'),
          icon: <CopyAll />,
          onClick: () => {
            navigate(`/quotations/new?id=${quotation.id}`);
          },
        },
        ...(isPDFGenerated
          ? [
              {
                label: t('Download'),
                icon: <FileDownload />,
                onClick: () =>
                  downloadUrl &&
                  window.open(`${Object.values(downloadUrl)[0]}`, '_blank'),
              },
            ]
          : []),
      ],
    );

    if (
      quotation.status === QuotationStatus.DRAFT ||
      quotation.status === QuotationStatus.SENT_TO_CLIENT
    ) {
      items.push(
        ...[
          {
            label: t('Mark Accepted'),
            icon: <CheckIcon />,
            onClick: () => setIsDialogOpen(true),
          },
          {
            label: t('Mark Rejected'),
            icon: <Close />,
            onClick: () => setIsRejectedDialogOpen(true),
          },
        ],
      );
    }

    if (quotation.status === QuotationStatus.DRAFT) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => setIsDeleteDialogOpen(true),
      });
    }

    return items;
  }, [downloadUrl]);

  return (
    <Box>
      <IconButton
        onClick={() => navigate(`/quotations/details/${quotation.id}/edit`)}
        disabled={quotation.status !== QuotationStatus.DRAFT}
        sx={{color: 'action.active'}}>
        <Edit fontSize="small" />
      </IconButton>

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
        {actions.map((item, index) => (
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
            {index === 0 && actions.length > 1 && <Divider />}
          </Box>
        ))}
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
        confirmBtnDisabled={!isPDFGenerated}
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
    </Box>
  );
};
