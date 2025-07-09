import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {BottomDrawer} from 'components/BottomDrawer';
import {PurchaseInvoiceView} from 'models/purchaseInvoice';
import {PDFContainer} from 'components/PDFContainer';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import MyDropzone from 'components/MyDropZone';
import {useMemo, useState} from 'react';
import NewPurchaseInvoice from 'pages/NewPurchaseInvoice';
import {FileResourceRecord} from 'models/media';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ChangePurchaseInvoiceStatusDialog from 'pages/PurchaseInvoices/ChangePurchaseInvoiceStatusDialog';
import CustomSnackbar from 'components/CustomSnackbar';
import {useDeletePurchaseInvoice} from 'hooks/reactQuery/usePurchaseInvoice';
import {Confirm} from 'components/Confirm';
import {useSnackbar} from 'hooks/useSnackbar';
import {FileWithPreview, MappedFile} from 'models/files';
import {PurchaseInvoiceInfo} from './PurchaseInvoiceInfo';

interface Props {
  purchaseInvoice: PurchaseInvoiceView;
}

export const PurchaseInvoiceDetails = ({purchaseInvoice}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const {mutateAsync: deletePurchaseInvoice, isLoading: isDeleting} =
    useDeletePurchaseInvoice();

  const documents: FileResourceRecord[] =
    purchaseInvoice?.additionalInfo?.documents.map((doc) => ({
      ...doc,
      uri: doc.uri,
      description: doc.description || '',
    })) || [];

  const documentUris = documents.map((doc) => doc.uri);

  const {data: downloadUrls} = useDownloadUrl(documentUris);

  const [isEditMode, setIsEditMode] = useState(false);
  const [newDocuments, setNewDocuments] = useState<MappedFile[]>([]);

  const handleFilesUpdate = (files: FileWithPreview[]) => {
    setNewDocuments(files as MappedFile[]);
    setIsEditMode(true);
  };

  const handleOpenDeleteConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleClose = () => {
    setOpenPaymentStatusChange(false);
  };

  const handleDeleteInvoice = () => {
    if (purchaseInvoice.id)
      deletePurchaseInvoice(
        {invoiceId: purchaseInvoice.id, shouldNavigate: true},
        {
          onSuccess: () => {
            enqueueSnackbar(
              <CustomSnackbar message="Invoice deleted" snackIcon="delete" />,
              {
                variant: 'info',
                anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
              },
            );
          },
        },
      );
  };

  const actions = useMemo(() => {
    const items = [];

    items.push({
      label: t('Change Payment Status'),
      icon: <CompareArrowsOutlinedIcon />,
      onClick: handleOpenDeleteConfirm,
    });

    items.push({
      label: t('Delete'),
      icon: <DeleteIcon />,
      onClick: () => setOpenDeleteConfirm(true),
    });

    return items;
  }, []);

  if (isEditMode) {
    return (
      <NewPurchaseInvoice
        purchaseInvoice={purchaseInvoice}
        initialDocuments={newDocuments}
        handleFilesUpload={handleFilesUpdate}
      />
    );
  }

  return (
    <Grid
      container
      columnGap={3}
      justifyContent="space-between"
      alignItems="flex-start"
      wrap="nowrap"
      mb={12}>
      {documents?.length ? (
        <Grid item xs={8} rowGap={2} borderRadius={1}>
          <Box>
            {documents?.map((document, index) => (
              <Box key={`${document.uri}-${index}`} mb={4}>
                <PDFContainer
                  url={downloadUrls ? downloadUrls[document.uri] : ''}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      ) : (
        <Grid
          container
          item
          xs={8}
          xl={8}
          rowGap={2}
          borderRadius={1}
          sx={{
            background: '#00D1FF0A',
            display: 'flex',
            alignItems: 'center',
            height: '100vh',
            justifyContent: 'center',
          }}>
          <Box>
            <MyDropzone
              getAcceptedFiles={handleFilesUpdate}
              hint={t('PDF, PNG or JPG (max. 5MB)')}
              acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
              maxFiles={5}
              bgColor="#ebf4f9"
            />
          </Box>
        </Grid>
      )}

      <PurchaseInvoiceInfo purchaseInvoice={purchaseInvoice} />

      <BottomDrawer
        isOpen
        isSaving={false}
        primaryButtonLabel={t('Edit')}
        primaryButtonAction={() =>
          navigate(`/purchase-invoices/details/${purchaseInvoice.id}/edit`)
        }
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid
      />

      <ChangePurchaseInvoiceStatusDialog
        open={openPaymentStatusChange}
        id={purchaseInvoice.id}
        onClose={handleClose}
      />

      <Confirm
        maxWidth={400}
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteInvoice();
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete Invoice"
        content="You are about to delete this invoice. Are you sure about it?"
      />
    </Grid>
  );
};
