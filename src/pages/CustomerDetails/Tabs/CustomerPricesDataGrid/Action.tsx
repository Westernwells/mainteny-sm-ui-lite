import {useState} from 'react';
import {FormikHelpers} from 'formik';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {Confirm} from 'components/Confirm';
import {
  useDeleteTravelWork,
  useUpdateTravelWork,
} from 'hooks/reactQuery/useTravelWork';
import {TravelWorkFormValues, TravelWorkView} from 'models/service-company';
import {ServiceOrderType} from 'models/service-order';
import {CustomerPricesForm} from './CustomerPricesForm';

interface Props {
  travelWork: TravelWorkView;
}

export const Actions = ({travelWork}: Props) => {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const {mutate: deleteTravelWork, isLoading: isDeleting} = useDeleteTravelWork(
    'Article deleted successfully',
  );
  const {mutate: updateTravelWork} = useUpdateTravelWork(
    'Article updated successfully.',
  );

  const onClose = () => {
    setOpenUpdateDialog(false);
  };

  const onSubmit = async (
    values: TravelWorkFormValues,
    {resetForm}: FormikHelpers<TravelWorkFormValues>,
  ) => {
    await updateTravelWork({
      id: travelWork.id,
      articleId: values.articleId,
      calculationType: values.calculationType,
      serviceOrderType: ServiceOrderType.GENERAL,
      articleSellingPrice: values.articleSellingPrice,
    });

    resetForm();
    onClose();
  };

  return (
    <>
      <Edit
        fontSize="small"
        sx={{color: 'action.active'}}
        onClick={() => setOpenUpdateDialog(true)}
      />
      <Delete
        fontSize="small"
        sx={{color: 'action.active', ml: '1rem'}}
        onClick={() => setOpenDeleteConfirm(true)}
      />

      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteTravelWork(travelWork.id);
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this article?"
      />

      <CustomerPricesForm
        title="Edit customer specific article"
        openDialog={openUpdateDialog}
        onClose={onClose}
        onSubmit={onSubmit}
        travelWork={travelWork}
      />
    </>
  );
};
