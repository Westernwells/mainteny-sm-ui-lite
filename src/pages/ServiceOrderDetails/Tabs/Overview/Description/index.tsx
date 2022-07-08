import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {InfoCard} from 'components/InfoCard';
import EditIcon from '@mui/icons-material/Edit';
import {Dialog} from 'components/Dialog';
import {useState} from 'react';
import Box from '@mui/material/Box';
import * as Yup from 'yup';
import {EmptySection} from 'components/EmptySection';
import {useFormik} from 'formik';
import {useUpdateServiceOrder} from 'hooks/reactQuery/useServiceOrder';
import {DescriptionFormModel} from './model';
import {DescriptionForm} from './DescriptionForm';

interface Props {
  content?: string;
  serviceOrderId?: string;
}

const validationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
});

export const Description = ({content = '', serviceOrderId = ''}: Props) => {
  const {t} = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const formik = useFormik<DescriptionFormModel>({
    initialValues: {
      description: content,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const {mutate: updateServiceOrder, isLoading: updatingOrder} =
    useUpdateServiceOrder('Description updated successfully');

  const handleSave = async () => {
    await updateServiceOrder({
      body: {description: formik.values.description},
      serviceOrderId,
    });
    setOpenDialog(false);
    setIsEditing(false);
  };

  return (
    <>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Description')}</Typography>}
        showHeaderBackground
        headerActionIcon={<EditIcon />}
        handleAction={() => {
          formik.setFieldValue('description', content);
          setIsEditing(true);
          setOpenDialog(true);
        }}>
        {content ? (
          <Typography variant="body1" color="text.secondary">
            {content}
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
            <EmptySection
              btnAction={() => {
                formik.setFieldValue('description', content);
                setOpenDialog(true);
              }}
              showActionBtn
              btnLabel="+ Add Description"
              label="No description yet. It will appear here once added!"
              illustration="clipboard"
              size="tiny"
              containerStyle={{
                height: '100%',
              }}
            />
          </Box>
        )}
      </InfoCard>
      <Dialog
        title={isEditing ? 'Edit Description' : 'Add Description'}
        isSaving={updatingOrder}
        onCancel={() => {
          setOpenDialog(false);
          setIsEditing(false);
        }}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={handleSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <DescriptionForm formik={formik} />
      </Dialog>
    </>
  );
};
