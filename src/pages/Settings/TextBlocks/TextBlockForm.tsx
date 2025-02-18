import {FormikProps} from 'formik';
import {FormControl, FormHelperText, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import RichTextEditor from 'components/RichTextEditor';
import {
  CUSTOM_ERROR_TEXT,
  TEXT_BLOCK_MEMORY_SIZE_UPPER_LIMIT,
  TextBlockFormModel,
} from 'models/text-block';
import {
  convertCategoryToText,
  textBlockCategoryOptions,
} from 'utils/text-block';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {getByteSize} from 'utils/string';

interface Props {
  formik: FormikProps<TextBlockFormModel>;
}

export const TextBlockForm = ({formik}: Props) => {
  const {t} = useTranslation();

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  const currentTextSize = useMemo(
    () => getByteSize(formik.values.text),
    [t, formik],
  );

  return (
    <Box sx={{mt: '0.5em'}}>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'Enter text block name',
              label: 'Name',
              name: 'name',
              value: formik.values.name,
              helperText: formik.touched.name && formik.errors.name,
              error: !!formik.errors.name && formik.touched.name,
              required: true,
              sx: {
                mb: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item md={12}>
          <FormControl fullWidth>
            <MultipleSelectCheckmarks
              label="Category"
              options={textBlockCategoryOptions}
              getSelectedValue={(item: string[]) =>
                formik.setFieldValue('category', item[0])
              }
              initialSelectedItems={
                formik.values.category
                  ? [convertCategoryToText(formik.values.category)]
                  : []
              }
              required
              multiple={false}
              containerStyles={{width: '100%'}}
              formControlStyles={{width: '100%', mb: '1em'}}
              disableClearBtn
            />
          </FormControl>
        </Grid>

        <Grid item md={12}>
          <RichTextEditor
            label="Text"
            name="text"
            hasAttachFileButton={false}
            html={formik.values.text || ''}
            updateHtml={(html) => formik.setFieldValue('text', html)}
          />
          {formik.errors.text === CUSTOM_ERROR_TEXT.text && (
            <FormHelperText error>
              {t(
                'Text block is too big. Supported size {{sizeLimit}} bytes, current size {{currentSize}} bytes',
                {
                  sizeLimit: TEXT_BLOCK_MEMORY_SIZE_UPPER_LIMIT,
                  currentSize: currentTextSize,
                },
              )}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
