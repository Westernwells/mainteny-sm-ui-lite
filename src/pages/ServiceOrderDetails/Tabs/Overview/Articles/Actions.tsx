import {useEffect, useMemo, useState} from 'react';
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
import {ServiceOrderArticleRecord} from 'models/article';
import {
  useDeleteServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
  useServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {Dialog} from 'components/Dialog';
import {ArticleBasicFormModel} from 'models/articleForm';
import {amountRecordForBackend, makeAmountRecord} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {FormikErrors} from 'formik';
import {EditArticleFormModel} from './models';
import {EditArticleForm} from './EditArticleForm';

interface Props {
  serviceOrderId: string;
  serviceOrderArticleId: string;
}

export const Actions = ({serviceOrderId, serviceOrderArticleId}: Props) => {
  const {t} = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentArticle, setCurrentArticle] =
    useState<ServiceOrderArticleView>();
  const [formikErrors, setFormikErrors] = useState<
    FormikErrors<EditArticleFormModel | ArticleBasicFormModel>
  >({});
  const [formikValues, setFormikValues] = useState<
    EditArticleFormModel | ArticleBasicFormModel
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
      label: t('Edit'),
      icon: <EditIcon />,
      onClick: () => {
        setOpenEditDialog(true);
        const current = serviceOrderArticles?.find(
          (item) => item.id === serviceOrderArticleId,
        );
        setCurrentArticle(current);
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
    const body: ServiceOrderArticleRecord = serviceOrderArticles!
      .filter((item) => item.article.id === currentArticle?.article.id)
      .map((item) => ({
        articleId: item.article.id,
        article: {
          id: item.article.id,
          externalId: formikValues?.externalId || item.article.externalId,
          type: formikValues!.type,
          unit: formikValues!.unit,
          costPackage: formikValues!.costPackage!,
        },
        name: formikValues!.name,
        description: formikValues?.description || '',
        quantity: Number(formikValues!.quantity!),
        unitAmount: amountRecordForBackend(
          makeAmountRecord(
            Number(formikValues!.unitSellingAmount),
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
    setCurrentArticle(undefined);
  };

  return (
    <Box>
      <IconButton onClick={handleClick} sx={{py: 0}}>
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
          maxWidth: 'md',
          open: openEditDialog,
        }}>
        <EditArticleForm
          serviceOrderArticle={
            serviceOrderArticles?.find(
              (item) => item.id === serviceOrderArticleId,
            )!
          }
          setFormikValues={setFormikValues}
          getFormErrors={(errors) => setFormikErrors(errors)}
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
