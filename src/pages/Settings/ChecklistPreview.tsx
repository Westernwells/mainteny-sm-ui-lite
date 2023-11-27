import React, {useMemo} from 'react';
import {FormikProps} from 'formik';
import {t} from 'i18next';
import {theme} from 'theme';
import {
  Box,
  Typography,
  Checkbox,
  Dialog,
  Divider,
  LinearProgress,
  Radio,
  TextField,
  linearProgressClasses,
} from '@mui/material';
import {KeyboardArrowDown} from '@mui/icons-material';
import {
  CheckListComponentType,
  ExtendedCheckListComponentRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
} from 'models/checklist';
import MobileHeader1 from 'assets/images/mobile-header-1.png';
import MobileHeader2 from 'assets/images/mobile-header-2.png';
import {Button} from 'components/Button';

interface Props {
  isPreviewing: boolean;
  onClosePreview: () => void;
  formik: FormikProps<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
}

export const ChecklistPreview = ({
  isPreviewing,
  onClosePreview,
  formik,
}: Props) => {
  const handleClose = () => {
    onClosePreview();
  };

  const handleCheckOption = (componentIndex: number, id: string) => {
    formik.setFieldValue(
      `components[${componentIndex}].options`,
      formik.values.components[componentIndex].options.map((o) => ({
        ...o,
        isDefault: o.id === id,
      })),
    );
  };

  const handleCheckCheckbox = (
    componentIndex: number,
    component: ExtendedCheckListComponentRecord,
  ) => {
    formik.setFieldValue(
      `components[${componentIndex}].checked`,
      !component.checked,
    );
  };

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead = formik.values.components.filter(
      (c) => c.type !== CheckListComponentType.HEAD,
    );
    const doneList = componentsWithoutHead.filter((item) => {
      if (item.type === CheckListComponentType.TEXT) {
        return !!item.subject;
      }

      if (item.moreInfoInNote && !!item.subject) {
        return true;
      }

      if (item.type === CheckListComponentType.YES_NO) {
        return item.checked;
      }

      return item.options.filter((o) => o.isDefault).length > 0;
    });

    return {all: componentsWithoutHead.length, done: doneList.length};
  }, [formik.values.components]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );

  return (
    <Dialog
      onClose={handleClose}
      open={isPreviewing}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.default,
        },
      }}>
      <img
        src={MobileHeader1}
        alt="mobile header 1"
        width="100%"
        style={{
          maxWidth: '23.5rem',
        }}
      />

      <Box
        display="flex"
        flexDirection="column"
        boxShadow="0px 4px 10px 0px #E6EEFB"
        maxWidth="21.5rem"
        bgcolor="white"
        mt={2}
        mx="auto"
        mb={2.5}
        borderRadius={1.25}>
        <img
          src={MobileHeader2}
          alt="mobile header 2"
          width="100%"
          style={{
            marginTop: '-4px',
            transform: 'scale(1.03)',
          }}
        />

        <Box sx={{px: 2, py: 3}}>
          <Typography variant="caption" color="text.secondary">
            {t('Select Checklist')}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={1.25}
            py={1}
            mt={1}
            mb={2}
            bgcolor={theme.palette.inputBackground.main}
            borderRadius={1}
            border="1px solid #E4E9F2">
            <Typography variant="subtitle2">{formik.values.name}</Typography>
            <KeyboardArrowDown />
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption">
              {checklistSummary.done}/{checklistSummary.all} {t('options')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentComplete}% {t('complete')}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentComplete}
            sx={{
              backgroundColor: `${theme.palette.text.secondary}66`,
              [`& .${linearProgressClasses.bar}`]: {
                backgroundColor: '#4CAF50',
              },
            }}
          />
        </Box>

        <Divider />

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          px={2}
          pt={3}
          pb={2.5}>
          {formik.values.components.map((component, index) => (
            <React.Fragment key={component.id}>
              {component.type === CheckListComponentType.SINGLE_CHECK ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  p={1.5}
                  boxShadow="0px 4px 10px 0px #E6EEFB"
                  borderRadius={2.5}
                  border="1px solid #E4E9F2">
                  <Typography variant="subtitle2" fontSize="13px">
                    {component.subject}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1} pt={1}>
                    {component.options.map((option, optionIndex) => (
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{cursor: 'pointer'}}
                        onClick={() => handleCheckOption(index, option.id)}
                        key={option.id}>
                        <Radio
                          checked={!!option.isDefault}
                          size="small"
                          name={`components[${index}].options[${optionIndex}].isDefault`}
                          onChange={() => handleCheckOption(index, option.id)}
                          sx={{
                            ml: -0.5,
                            '&.MuiRadio-root': {
                              padding: 0.5,
                            },
                            '&.Mui-checked': {
                              color: '#4CAF50',
                            },
                          }}
                        />
                        <Typography variant="body2">{option.text}</Typography>
                      </Box>
                    ))}
                    {component.moreInfoInNote ? (
                      <Box display="flex" alignItems="center">
                        <Radio
                          checked={false}
                          size="small"
                          sx={{
                            ml: -0.5,
                            '&.MuiRadio-root': {
                              padding: 0.5,
                            },
                            '&.Mui-checked': {
                              color: '#4CAF50',
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{textDecoration: 'underline'}}>
                          {t('Enter Your Choice')}
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ) : component.type === CheckListComponentType.YES_NO ? (
                <Box
                  display="flex"
                  alignItems="center"
                  px={1.5}
                  py={1.1}
                  boxShadow="0px 4px 10px 0px #E6EEFB"
                  borderRadius={2.5}
                  border="1px solid #E4E9F2"
                  sx={{cursor: 'pointer'}}
                  onClick={() => handleCheckCheckbox(index, component)}>
                  <Checkbox
                    name={`components[${index}].checked`}
                    checked={!!component.checked}
                    onChange={() => handleCheckCheckbox(index, component)}
                    size="medium"
                    sx={{
                      ml: -1,
                      '&.Mui-checked': {
                        color: '#4CAF50',
                      },
                    }}
                  />

                  <Typography
                    variant="body2"
                    color={
                      component.checked ? 'text.secondary' : 'text.primary'
                    }
                    sx={
                      component.checked ? {textDecoration: 'line-through'} : {}
                    }>
                    {component.subject}
                  </Typography>
                </Box>
              ) : component.type === CheckListComponentType.TEXT ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  p={1.5}
                  boxShadow="0px 4px 10px 0px #E6EEFB"
                  borderRadius={2.5}
                  border="1px solid #E4E9F2">
                  <Typography variant="subtitle2" fontSize="13px">
                    {component.subject}
                  </Typography>
                  <TextField
                    name={`components[${index}].note`}
                    variant="outlined"
                    size="small"
                    placeholder={t('Enter your text here...')}
                    multiline
                    fullWidth
                    minRows={5}
                    value={component.note}
                    onChange={formik.handleChange}
                    sx={{
                      bgcolor: theme.palette.inputBackground.main,
                      mt: 1.5,
                      '& .MuiOutlinedInput-root': {
                        p: 1,
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        lineHeight: 1.43,
                        letterSpacing: '0.15px',
                        fieldset: {
                          border: '1px solid #E4E9F2',
                        },
                      },
                    }}
                  />
                </Box>
              ) : component.type === CheckListComponentType.HEAD ? (
                <Typography variant="subtitle2" py={0.5}>
                  {component.subject}
                </Typography>
              ) : null}
            </React.Fragment>
          ))}

          <Box>
            <Typography
              component="div"
              variant="caption"
              color="text.secondary"
              pb={1}>
              {t("Engineer's Signature")}
              <Typography variant="caption" sx={{color: '#DB2C66'}}>
                *
              </Typography>
            </Typography>
            <Box
              minHeight="7.5rem"
              bgcolor={theme.palette.inputBackground.main}
              borderRadius={1}
              border="1px solid #E4E9F2"
            />
          </Box>

          <Button
            buttonProps={{
              variant: 'contained',
              fullWidth: true,
              size: 'large',
              onClick: handleClose,
            }}>
            {t('Complete')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
