import Box from '@mui/material/Box';
import {FormikProps} from 'formik';
import {IconButton, InputAdornment} from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {GridCellParams} from '@mui/x-data-grid';
import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {useState} from 'react';
import TextBlockActions from 'components/text-blocks/TextBlockActions';
import {Dialog} from 'components/Dialog';
import TextBlockSelect from 'components/text-blocks/TextBlockSelect';
import RichTextField from 'components/RichTextField';
import {DescriptionFormModel} from './model';

interface Props {
  formik: FormikProps<DescriptionFormModel>;
}

export const DescriptionForm = ({formik}: Props) => {
  const [openTextBlockDialog, setOpenTextBlockDialog] =
    useState<boolean>(false);
  const [activeSubDialog, setActiveSubDialog] = useState<
    'edit' | 'preview' | 'delete' | 'create' | undefined
  >(undefined);
  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);

  const onCloseSubDialogs = () => {
    setActiveSubDialog(undefined);
    setOpenTextBlockDialog(true);
  };

  const handleCellClick = (rowParams: GridCellParams<any, any, any>) => {
    formik.setFieldValue('description', rowParams.row.text);
    setOpenTextBlockDialog(false);
  };

  return (
    <Box>
      <RichTextField
        label="Description"
        html={formik.values.description || ''}
        updateHtml={(h) => formik.setFieldValue('description', h)}
        minRows={3}
        required
        placeholder="Enter description"
        error={!!(formik.touched.description && formik.errors.description)}
        helperText={
          formik.touched.description ? formik.errors.description : undefined
        }
        endAdornment={
          <InputAdornment
            component={IconButton}
            disableRipple
            position="end"
            sx={{
              mt: 1,
              mr: -1,
              alignSelf: 'flex-start',
            }}
            onClick={() => {
              setOpenTextBlockDialog(true);
            }}
            size="small">
            <TextSnippetIcon />
          </InputAdornment>
        }
      />

      <Dialog
        title="Click to apply your block"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => {
          setOpenTextBlockDialog(false);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openTextBlockDialog || false,
        }}
        showCancelButton={false}
        showSaveButton={false}>
        <TextBlockSelect
          textBlockCategory={TextBlockCategory.SERVICE_ORDER}
          setOpenTextBlockDialog={setOpenTextBlockDialog}
          setActiveSubDialog={setActiveSubDialog}
          setActiveTextBlock={setActiveTextBlock}
          handleCellClick={handleCellClick}
        />
      </Dialog>

      {activeSubDialog && (
        <TextBlockActions
          textBlockCategory={TextBlockCategory.SERVICE_ORDER}
          activeSubDialog={activeSubDialog}
          setActiveSubDialog={setActiveSubDialog}
          openDialog={
            activeSubDialog === 'edit' || activeSubDialog === 'create'
          }
          openPreviewDialog={activeSubDialog === 'preview'}
          openCancelConfirm={activeSubDialog === 'delete'}
          activeTextBlock={activeTextBlock}
          onCloseSubDialogs={onCloseSubDialogs}
        />
      )}
    </Box>
  );
};
