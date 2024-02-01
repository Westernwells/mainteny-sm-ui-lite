// @ts-nocheck
import React from 'react';
import {FormikProps, getIn} from 'formik';
import {theme} from 'theme';
import {t} from 'i18next';
import {
  Box,
  Checkbox,
  IconButton,
  Radio,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Close,
  ContentCopy,
  DeleteOutline,
  DragIndicator,
  Info,
} from '@mui/icons-material';
import {DraggableProvided} from 'react-beautiful-dnd';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {Switch} from 'components/Switch';
import {
  CheckListComponentType,
  ExtendedCheckListComponentRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
} from 'models/checklist';
import {getUniqueId} from 'utils/utils';
import {getOptionMock} from 'utils/checklist';

interface ComponentActionsProps {
  duplicateComponent: () => void;
  deleteComponent: () => void;
}

const ComponentActions: React.FC<
  ComponentActionsProps & React.ComponentProps<typeof Box>
> = ({duplicateComponent, deleteComponent, ...boxProps}) => (
  <Box display="flex" gap={1} sx={{opacity: 0.5}} {...boxProps}>
    <IconButton onClick={duplicateComponent} size="small">
      <ContentCopy sx={{fontSize: '1.25rem'}} />
    </IconButton>
    <IconButton onClick={deleteComponent} size="small">
      <DeleteOutline sx={{fontSize: '1.25rem'}} />
    </IconButton>
  </Box>
);

interface DraggableContainerProps {
  draggableProvided: DraggableProvided;
  children: React.ReactNode;
  isDragging: Boolean;
}

const DraggableContainer: React.FC<
  DraggableContainerProps & React.ComponentProps<typeof Box>
> = ({draggableProvided, children, isDragging, ...boxProps}) => (
  <Box
    p={3}
    mb={2}
    bgcolor={theme.palette.inputBackground.main}
    sx={{
      position: 'relative',
      ':hover': {
        '.drag-indicator': {
          visibility: 'visible',
        },
      },
      ...(isDragging && {
        '.drag-indicator': {
          visibility: 'visible',
        },
      }),
    }}
    ref={draggableProvided.innerRef}
    {...boxProps}
    {...draggableProvided.draggableProps}>
    <IconButton
      className="drag-indicator"
      size="large"
      sx={{
        visibility: 'hidden',
        position: 'absolute',
        left: '2%',
        top: '50%',
        transform: 'translate(-50%,-50%)',
      }}
      {...draggableProvided.dragHandleProps}>
      <DragIndicator sx={{fontSize: '1.25rem'}} />
    </IconButton>
    {children}
  </Box>
);

interface ComponentProps {
  index: number;
  formik: FormikProps<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
  component: ExtendedCheckListComponentRecord;
  duplicateComponent: () => void;
  deleteComponent: () => void;
}

interface MultiChoiceComponentProps extends ComponentProps {
  handleCheckOption: (id: string) => void;
  removeOption: (id: string) => void;
  addOption: () => void;
  handleMoreInfoInNote: (value: Boolean) => void;
  isDragging: Boolean;
}

export const MultiChoiceComponent = ({
  index,
  formik,
  component,
  duplicateComponent,
  deleteComponent,
  handleCheckOption,
  removeOption,
  addOption,
  handleMoreInfoInNote,
  isDragging,
}: MultiChoiceComponentProps) => {
  const isSubjectInvalid = !!(
    getIn(formik.touched, `components[${index}].subject`) &&
    getIn(formik.errors, `components[${index}].subject`)
  );
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}>
        <FormInput
          props={{
            name: `components[${index}].subject`,
            placeholder: t('Enter multi-choice name...'),
            variant: 'standard',
            value: component.subject,
            error: isSubjectInvalid,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
            inputProps: {
              sx: {
                p: 0,
                '&::placeholder': {
                  color: isSubjectInvalid ? 'error.main' : 'text.primary',
                },
              },
            },
            InputProps: {disableUnderline: true},
          }}
        />
        <ComponentActions
          duplicateComponent={duplicateComponent}
          deleteComponent={deleteComponent}
        />
      </Box>

      {!isDragging ? (
        <>
          <Box display="flex" flexDirection="column" rowGap={1.5} pt={3} pb={2}>
            {component.options.map((option, optionIndex) => {
              const isOptionInvalid = !!(
                getIn(
                  formik.touched,
                  `components[${index}].options[${optionIndex}].text`,
                ) &&
                getIn(
                  formik.errors,
                  `components[${index}].options[${optionIndex}].text`,
                )
              );
              return (
                <Box
                  key={option.id}
                  display="flex"
                  justifyContent="space-between"
                  ml={-1}>
                  <Radio
                    size="small"
                    checked={!!option.isDefault}
                    disabled
                    name={`components[${index}].options[${optionIndex}].isDefault`}
                    onChange={() => handleCheckOption(option.id)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#4CAF50',
                      },
                    }}
                  />
                  <FormInput
                    props={{
                      name: `components[${index}].options[${optionIndex}].text`,
                      placeholder: 'Choice one',
                      variant: 'outlined',
                      value: option.text,
                      error: isOptionInvalid,
                      onBlur: formik.handleBlur,
                      onChange: formik.handleChange,
                      required: true,
                      sx: {
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': {
                          fieldset: {
                            borderColor: '#E4E9F2',
                          },
                        },
                      },
                      inputProps: {
                        sx: {
                          '&::placeholder': {
                            color: isOptionInvalid
                              ? 'error.main'
                              : 'text.primary',
                          },
                        },
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{opacity: 0.5}}
                    onClick={() => removeOption(option.id)}>
                    <Close sx={{fontSize: '1.25rem'}} />
                  </IconButton>
                </Box>
              );
            })}
            {component.moreInfoInNote ? (
              <Box display="flex" justifyContent="space-between" ml={-1}>
                <Radio size="small" checked={false} disabled />
                <FormInput
                  props={{
                    variant: 'outlined',
                    value: t('Your Choice'),
                    sx: {
                      bgcolor: 'white',
                    },
                    disabled: true,
                  }}
                />
                <IconButton size="small" sx={{opacity: 0.5}} disabled>
                  <Close sx={{fontSize: '1.25rem'}} />
                </IconButton>
              </Box>
            ) : null}
          </Box>

          <Box display="flex" justifyContent="space-between" ml={-1}>
            <Button
              buttonProps={{
                size: 'small',
                variant: 'text',
                onClick: addOption,
                autoFocus: true,
                startIcon: <Add />,
              }}>
              <Typography variant="subtitle2">{t('New Choice')}</Typography>
            </Button>

            <Box display="flex" alignItems="center">
              <Switch
                value={!!component.moreInfoInNote}
                getValue={handleMoreInfoInNote}
                label="Enter Your Choice"
              />
              <Tooltip
                title={
                  t(
                    "Enable 'Enter Your Choice' to add a custom text input field to your mobile checklist. This allows for personalized responses in the multi-choice form.",
                  ) ?? ''
                }
                placement="top"
                arrow>
                <IconButton size="small" sx={{ml: -1}}>
                  <Info sx={{fontSize: '1.25rem'}} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      ) : null}
    </>
  );
};

interface CheckboxComponentProps extends ComponentProps {
  handleCheckCheckbox: () => void;
}

export const CheckboxComponent = ({
  index,
  formik,
  component,
  duplicateComponent,
  deleteComponent,
  handleCheckCheckbox,
}: CheckboxComponentProps) => (
  <>
    <Checkbox
      name={`components[${index}].checked`}
      checked={!!component.checked}
      onChange={handleCheckCheckbox}
      disabled
      size="small"
      sx={{
        ml: -1,
        '&.Mui-checked': {
          color: '#4CAF50',
        },
      }}
    />
    <FormInput
      props={{
        name: `components[${index}].subject`,
        value: component.subject,
        variant: 'outlined',
        error: !!(
          getIn(formik.touched, `components[${index}].subject`) &&
          getIn(formik.errors, `components[${index}].subject`)
        ),
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        required: true,
        sx: {
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': {
            fieldset: {
              borderColor: '#E4E9F2',
            },
          },
        },
      }}
    />
    <ComponentActions
      duplicateComponent={duplicateComponent}
      deleteComponent={deleteComponent}
      pl={1}
    />
  </>
);

export const HeaderComponent = ({
  index,
  formik,
  component,
  duplicateComponent,
  deleteComponent,
}: ComponentProps) => {
  const isSubjectInvalid = !!(
    getIn(formik.touched, `components[${index}].subject`) &&
    getIn(formik.errors, `components[${index}].subject`)
  );
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flex={1}>
      <FormInput
        props={{
          name: `components[${index}].subject`,
          placeholder: t('Enter header name...'),
          variant: 'standard',
          value: component.subject,
          error: isSubjectInvalid,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
          required: true,
          sx: {
            '& .MuiInputBase-input': {
              p: 0,
            },
            '& .MuiInputBase-root': {
              fontSize: '1.25rem',
            },
          },
          InputProps: {disableUnderline: true},
          inputProps: {
            sx: {
              '&::placeholder': {
                color: isSubjectInvalid ? 'error.main' : 'text.primary',
              },
            },
          },
        }}
      />
      <ComponentActions
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
      />
    </Box>
  );
};

interface TextareaComponentProps extends ComponentProps {
  isDragging: Boolean;
}

export const TextComponent = ({
  index,
  formik,
  component,
  duplicateComponent,
  deleteComponent,
  isDragging,
}: TextareaComponentProps) => {
  const isSubjectInvalid = !!(
    getIn(formik.touched, `components[${index}].subject`) &&
    getIn(formik.errors, `components[${index}].subject`)
  );
  return (
    <>
      <Box display="flex" alignItems="center">
        <FormInput
          props={{
            name: `components[${index}].subject`,
            placeholder: t('Enter text area name...'),
            variant: 'standard',
            value: component.subject,
            error: isSubjectInvalid,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
            inputProps: {
              sx: {
                p: 0,
                '&::placeholder': {
                  color: isSubjectInvalid ? 'error.main' : 'text.primary',
                },
              },
            },
            InputProps: {disableUnderline: true},
          }}
        />
        <ComponentActions
          duplicateComponent={duplicateComponent}
          deleteComponent={deleteComponent}
        />
      </Box>

      {!isDragging ? (
        <TextField
          name={`components[${index}].note`}
          variant="outlined"
          size="small"
          placeholder={t('Enter your text here...')}
          multiline
          disabled
          fullWidth
          value={component.note}
          minRows={5}
          error={
            !!(
              getIn(formik.touched, `components[${index}].note`) &&
              getIn(formik.errors, `components[${index}].note`)
            )
          }
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          sx={{
            mt: 1.5,
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': {
              fieldset: {
                borderColor: '#E4E9F2',
              },
            },
          }}
          required
        />
      ) : null}
    </>
  );
};

export const ChecklistComponent = ({
  index,
  component,
  formik,
  draggableProvided,
  isDragging,
}: {
  index: number;
  component: ExtendedCheckListComponentRecord;
  formik: FormikProps<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
  draggableProvided: DraggableProvided;
  isDragging: Boolean;
}) => {
  const duplicateComponent = () => {
    formik.setFieldValue('components', [
      ...formik.values.components.slice(0, index + 1),
      {
        ...component,
        id: getUniqueId(),
      },
      ...formik.values.components.slice(index + 1),
    ]);
  };

  const deleteComponent = () => {
    formik.setFieldValue(
      'components',
      formik.values.components.filter((c) => c.id !== component.id),
    );
  };

  const handleCheckOption = (id: string) => {
    formik.setFieldValue(
      `components[${index}].options`,
      formik.values.components[index].options.map((o) => ({
        ...o,
        isDefault: o.id === id,
      })),
    );
  };

  const addOption = () => {
    formik.setFieldValue(`components[${index}].options`, [
      ...formik.values.components[index].options,
      getOptionMock(),
    ]);
  };

  const removeOption = (id: string) => {
    formik.setFieldValue(
      `components[${index}].options`,
      formik.values.components[index].options.filter((o) => o.id !== id),
    );
  };

  const handleMoreInfoInNote = (value: Boolean) => {
    formik.setFieldValue(`components[${index}].moreInfoInNote`, value);
  };

  const handleCheckCheckbox = () => {
    formik.setFieldValue(`components[${index}].checked`, !component.checked);
  };

  return component.type === CheckListComponentType.SINGLE_CHECK ? (
    <DraggableContainer
      isDragging={isDragging}
      draggableProvided={draggableProvided}>
      <MultiChoiceComponent
        index={index}
        formik={formik}
        component={component}
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
        handleCheckOption={handleCheckOption}
        removeOption={removeOption}
        addOption={addOption}
        handleMoreInfoInNote={handleMoreInfoInNote}
        isDragging={isDragging}
      />
    </DraggableContainer>
  ) : component.type === CheckListComponentType.YES_NO ? (
    <DraggableContainer
      isDragging={isDragging}
      draggableProvided={draggableProvided}
      display="flex"
      justifyContent="space-between">
      <CheckboxComponent
        index={index}
        formik={formik}
        component={component}
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
        handleCheckCheckbox={handleCheckCheckbox}
      />
    </DraggableContainer>
  ) : component.type === CheckListComponentType.HEAD ? (
    <DraggableContainer
      isDragging={isDragging}
      draggableProvided={draggableProvided}>
      <HeaderComponent
        index={index}
        formik={formik}
        component={component}
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
      />
    </DraggableContainer>
  ) : component.type === CheckListComponentType.TEXT ? (
    <DraggableContainer
      isDragging={isDragging}
      draggableProvided={draggableProvided}>
      <TextComponent
        index={index}
        formik={formik}
        component={component}
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
        isDragging={isDragging}
      />
    </DraggableContainer>
  ) : null;
};
