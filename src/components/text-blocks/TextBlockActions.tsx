import {Box, Typography} from '@mui/material';
import {Confirm} from 'components/Confirm';
import {Dialog} from 'components/Dialog';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {useFormik} from 'formik';
import {
  useCreateTextBlock,
  useUpdateTextBlock,
  useDeleteTextBlock,
} from 'hooks/reactQuery/useTextBlock';
import {
  TextBlockFormModel,
  TextBlockCategory,
  TextBlockView,
} from 'models/text-block';
import {TextBlockForm} from 'pages/Settings/TextBlocks/TextBlockForm';
import React, {useContext, Dispatch, SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {convertCategoryToMacro, convertCategoryToText} from 'utils/text-block';
import * as Yup from 'yup';

type Props = {
  textBlockCategory: TextBlockCategory;
  activeSubDialog: 'edit' | 'preview' | 'delete' | 'create' | undefined;
  setActiveSubDialog: Dispatch<
    SetStateAction<'edit' | 'preview' | 'delete' | 'create' | undefined>
  >;
  openDialog: boolean;
  openPreviewDialog: boolean;
  openCancelConfirm: boolean;
  activeTextBlock: TextBlockView | undefined;
  onCloseSubDialogs: () => void;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  text: Yup.string().required('Text is required'),
});

const TextBlockActions = ({
  textBlockCategory,
  activeSubDialog,
  setActiveSubDialog,
  openDialog,
  openPreviewDialog,
  openCancelConfirm,
  activeTextBlock,
  onCloseSubDialogs,
}: Props) => {
  const {t} = useTranslation();
  const {company} = useContext(UserCompanyContext);

  const formik = useFormik<TextBlockFormModel>({
    initialValues: {
      name: activeTextBlock?.name || '',
      category: textBlockCategory,
      text: activeTextBlock?.text || '',
    },
    onSubmit: (_, {resetForm}) => {
      resetForm();
    },
    validationSchema,
  });

  const {mutate: createTextBlock} = useCreateTextBlock(
    'Text Block created successfully',
  );

  const {mutateAsync: updateTextBlock} = useUpdateTextBlock(
    'Text Block updated successfully',
  );

  const {mutateAsync: deleteTextBlock} = useDeleteTextBlock(
    'Text Block deleted successfully',
  );

  const onDelete = async () => {
    await deleteTextBlock({
      textBlockId: activeTextBlock?.id!,
    });

    setActiveSubDialog(undefined);
  };

  const updateCurrentTextBlock = async () => {
    await updateTextBlock({
      textBlockId: activeTextBlock?.id!,
      textBlock: {
        name: formik.values.name,
        category: convertCategoryToMacro(formik.values.category),
        text: formik.values.text,
      },
    });

    setActiveSubDialog(undefined);
  };

  const saveNewTextBlock = async () => {
    createTextBlock({
      serviceCompanyId: company?.id!,
      category: convertCategoryToMacro(formik.values.category),
      name: formik.values.name,
      text: formik.values.text,
    });

    setActiveSubDialog(undefined);
  };

  const handleEditOnSave = () => {
    if (activeSubDialog === 'edit') {
      updateCurrentTextBlock();
    } else {
      saveNewTextBlock();
    }
  };

  const infoItems = [
    {label: t('Name'), value: activeTextBlock?.name || ''},
    {
      label: t('Category'),
      value: activeTextBlock?.category
        ? convertCategoryToText(activeTextBlock?.category)
        : '',
    },
    {label: t('Text'), value: activeTextBlock?.text || ''},
  ];

  return (
    <Box>
      <Dialog
        title={
          activeSubDialog === 'edit' ? 'Edit text block' : 'New text block'
        }
        saveButtonText={activeSubDialog === 'edit' ? 'Save' : 'Create Block'}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => onCloseSubDialogs()}
        onSave={handleEditOnSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <TextBlockForm formik={formik} />
      </Dialog>

      <Dialog
        title={activeTextBlock?.name || ''}
        saveButtonText="Edit Block"
        onCancel={() => onCloseSubDialogs()}
        onSave={() => {
          setActiveSubDialog(undefined);
          formik.setValues({
            name: activeTextBlock?.name || '',
            text: activeTextBlock?.text || '',
            category: convertCategoryToMacro(activeTextBlock?.category!) || '',
          });
          setActiveSubDialog('edit');
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openPreviewDialog || false,
        }}>
        <Box>
          {infoItems.map((item, index) => (
            <Box key={index} sx={{mb: '1.5em'}}>
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}>
                {item.label.toUpperCase()}
              </Typography>
              {item.label === t('Text') ? (
                <Box
                  dangerouslySetInnerHTML={{__html: item.value}}
                  sx={{
                    margin: '0em',
                    padding: '0em',
                    '& p': {
                      marginBottom: '0em',
                      lineHeight: '1em',
                    },
                  }}
                />
              ) : item.label === t('Category') ? (
                <Typography
                  color={theme.palette.text.primary}
                  sx={{mt: '0.3em'}}>
                  {t(item.value)}
                </Typography>
              ) : (
                <Typography
                  color={theme.palette.text.primary}
                  sx={{mt: '0.3em'}}>
                  {item.value}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Dialog>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => onDelete()}
        onClose={() => onCloseSubDialogs()}
        title="Delete"
        content={t(
          'Do you want to delete "{{textBlockName}}" from this list?',
          {
            textBlockName: `${activeTextBlock?.name}`,
          },
        )}
      />
    </Box>
  );
};

export default TextBlockActions;
