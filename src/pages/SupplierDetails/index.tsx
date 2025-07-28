import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
  useArticleSupplier,
  useDeleteSupplier,
} from 'hooks/reactQuery/useArticle';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {Confirm} from 'components/Confirm';
import ContactsWidget from 'pages/Contacts/ContactsWidget';
import {ContactPersonAssociationType} from 'models/contacts';
import AttachmentsCard from 'components/Attachments/AttachmentsCard';
import {AttachmentEntityType} from 'models/attachment';
import {SupplierBasicInfoCard} from './BasicInfo/SupplierBasicInfoCard';
import {Notes} from './Notes';

export const SupplierDetails = () => {
  const {id: supplierId} = useParams();
  const {data: supplierDetail, isLoading} = useArticleSupplier(supplierId);
  const [deleteSupplierConfirm, setDeleteSupplierConfirm] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {mutateAsync: deleteSupplier} = useDeleteSupplier(
    'Supplier deleted successfully',
  );

  const deleteSupplierDialog = () => {
    setDeleteSupplierConfirm(true);
  };

  const onDelete = async () => {
    await deleteSupplier({id: supplierDetail!.id});
    setDeleteSupplierConfirm(false);
    navigate('/articles');
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Box display="flex" justifyContent="flex-end" gap={3} mb="1.5rem">
        <Notes supplierId={supplierId!} />
        <Button
          label={t('Delete')}
          buttonProps={{
            onClick: () => deleteSupplierDialog(),
            variant: 'outlined',
            size: 'large',
            sx: {
              bgcolor: 'transparent',
            },
            startIcon: <DeleteIcon />,
          }}
        />
      </Box>
      <SupplierBasicInfoCard supplier={supplierDetail!} />

      <ContactsWidget
        refId={supplierId!}
        refType={ContactPersonAssociationType.ARTICLE_SUPPLIER}
      />

      <Box mt="1em" flexGrow={1}>
        <AttachmentsCard
          entityId={supplierId!}
          entityType={AttachmentEntityType.ARTICLE_SUPPLIER}
        />
      </Box>

      <Confirm
        open={deleteSupplierConfirm}
        onConfirm={() => onDelete()}
        onClose={() => setDeleteSupplierConfirm(false)}
        title={t('Delete')}
        content={t('Do you want to delete this supplier?')}
      />
    </>
  );
};

export default SupplierDetails;
