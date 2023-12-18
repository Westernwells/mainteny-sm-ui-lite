import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Confirm} from 'components/Confirm';
import {ArticleView} from 'models/article';
import {
  useDeleteServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
  useServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {RemoveRedEye} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {amountRecordForBackend, makeAmountRecord} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {EditArticleForm} from './EditArticleForm';
import {EditArticleFormModel} from './models';

interface Props {
  article: ArticleView;
  serviceOrderId: string;
  serviceOrderArticleId: string;
}

export const Actions = ({
  article,
  serviceOrderId,
  serviceOrderArticleId,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentArticle, setCurrentArticle] =
    useState<ServiceOrderArticleView>();
  const [formikErrors, setFormikErrors] = useState({});
  const [formikValues, setFormikValues] = useState<
    EditArticleFormModel | undefined
  >();

  const {mutateAsync: deleteServiceOrderArticle} =
    useDeleteServiceOrderArticle();

  const {mutateAsync: updateServiceOrderArticle, isLoading} =
    useNewUpdateServiceOrderArticles();

  const {data: serviceOrderArticles} = useServiceOrderArticles(serviceOrderId);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actions = useMemo(() => {
    const items = [];

    items.push({
      label: t('Preview'),
      icon: <RemoveRedEye />,
      onClick: () => navigate(`/articles/details/${article.id}/`),
    });

    items.push({
      label: t('Edit'),
      icon: <EditIcon />,
      onClick: () => {
        setOpenEditDialog(true);
        setCurrentArticle({
          article,
          id: serviceOrderArticleId,
          serviceOrderId,
          description: article.description,
          name: article.name,
          quantity: 1,
          unitAmount: {
            fractionDigits: article.unitSellingAmount.fractionDigits,
            grossAmount: article.unitSellingAmount.grossAmount,
            vat: article.unitSellingAmount.vat,
            currency: article.unitSellingAmount.currency,
            netAmount: article.unitSellingAmount.netAmount,
            percentageVat: article.unitSellingAmount.percentageVat,
          },
        });
      },
    });

    items.push({
      label: t('Delete'),
      icon: <DeleteIcon />,
      onClick: () => setIsDeleteDialogOpen(true),
    });

    return items;
  }, []);

  useEffect(() => {
    if (isEditing && currentArticle) {
      setOpenEditDialog(true);
    }
  }, [isEditing, currentArticle]);

  useEffect(() => {
    if (!isLoading) {
      setIsEditing(false);
      setOpenEditDialog(false);
    }
  }, [isLoading]);

  const deleteArticle = async () => {
    await deleteServiceOrderArticle({
      serviceOrder: serviceOrderId!,
      serviceOrderArticleId: serviceOrderArticleId!,
    });
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateArticle = async () => {
    const body = serviceOrderArticles!
      .filter((item) => item.article.id === currentArticle?.article.id)
      .map((item) => ({
        articleId: item.article.id,
        description: formikValues!.description,
        name: formikValues!.name,
        quantity: formikValues!.quantity,
        unitAmount: amountRecordForBackend(
          makeAmountRecord(
            formikValues!.unitPrice,
            currentArticle!.unitAmount.currency,
            currentArticle!.unitAmount.percentageVat,
          ),
        ),
      }))[0];
    await updateServiceOrderArticle({
      data: body!,
      serviceOrder: serviceOrderId!,
      serviceOrderArticleId: currentArticle?.id!,
    });
    setOpenEditDialog(false);
  };

  return (
    <Box>
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
            {index !== actions.length - 1 && <Divider />}
          </Box>
        ))}
      </Menu>

      <Dialog
        title="Edit Article"
        onCancel={() => {
          setOpenEditDialog(false);
          setIsEditing(false);
        }}
        disableSaveBtn={!!Object.keys(formikErrors).length}
        onSave={() => handleUpdateArticle()}
        isSaving={isLoading}
        dialogProps={{
          maxWidth: 'sm',
          open: openEditDialog,
        }}>
        <EditArticleForm
          serviceOrderArticle={
            serviceOrderArticles?.find(
              (item) => article.id === item.article.id,
            )!
          }
          getFormikErrors={(val) => setFormikErrors(val)}
          getFormikValues={(val) => setFormikValues(val)}
        />
      </Dialog>

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          deleteArticle();
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Article"
        content="Do you want to delete this article?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
