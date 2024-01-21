import React, {MutableRefObject} from 'react';
import {getIn} from 'formik';
import {theme} from 'theme';
import {t} from 'i18next';
import {
  Box,
  Checkbox,
  IconButton,
  Radio,
  TextField,
  Tooltip,
  Typography,
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
import {Controller, UseFormReturn} from 'react-hook-form';

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
  formik: UseFormReturn<
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
    getIn(formik.formState.touchedFields, `components.${index}.subject`) &&
    getIn(formik.formState.errors, `components.${index}.subject`)
  );

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}>
        <Controller
          control={formik.control}
          defaultValue={component.subject ?? undefined}
          name={`components.${index}.subject`}
          render={({field: {onChange, value, onBlur}}) => (
            <FormInput
              props={{
                name: `components.${index}.subject`,
                placeholder: t('Enter multi-choice name...'),
                variant: 'standard',
                value,
                error: isSubjectInvalid,
                onBlur,
                onChange,
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
          )}
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
              console.log('component', component);
              const isOptionInvalid = !!(
                getIn(
                  formik.formState.touchedFields,
                  `components[${index}].options[${optionIndex}].text`,
                ) &&
                getIn(
                  formik.formState.errors,
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
                    name={`components.${index}.options.${optionIndex}.isDefault`}
                    onChange={() => handleCheckOption(option.id)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#4CAF50',
                      },
                    }}
                  />
                  <Controller
                    control={formik.control}
                    defaultValue={option.text ?? undefined}
                    name={`components.${index}.options.${optionIndex}.text`}
                    render={({field: {onChange, value, onBlur}}) => (
                      <FormInput
                        props={{
                          name: `components[${index}].options[${optionIndex}].text`,
                          placeholder: 'Choice one',
                          variant: 'outlined',
                          value,
                          error: isOptionInvalid,
                          onBlur,
                          onChange,
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
                    )}
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

export const CheckboxComponent = React.memo(
  ({
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
        size="small"
        sx={{
          ml: -1,
          '&.Mui-checked': {
            color: '#4CAF50',
          },
        }}
      />
      <Controller
        control={formik.control}
        defaultValue={component.subject ?? undefined}
        name={`components.${index}.subject`}
        render={({field: {onChange, value, onBlur}}) => (
          <FormInput
            props={{
              name: `components[${index}].subject`,
              value,
              variant: 'outlined',
              error: !!(
                getIn(
                  formik.formState.touchedFields,
                  `components[${index}].subject`,
                ) &&
                getIn(formik.formState.errors, `components[${index}].subject`)
              ),
              onBlur,
              onChange,
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
        )}
      />
      <ComponentActions
        duplicateComponent={duplicateComponent}
        deleteComponent={deleteComponent}
        pl={1}
      />
    </>
  ),
);

export const HeaderComponent = React.memo(
  ({
    index,
    formik,
    component,
    duplicateComponent,
    deleteComponent,
  }: ComponentProps) => {
    const isSubjectInvalid = !!(
      getIn(formik.formState.touchedFields, `components[${index}].subject`) &&
      getIn(formik.formState.errors, `components[${index}].subject`)
    );
    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}>
        <Controller
          control={formik.control}
          defaultValue={component.subject ?? undefined}
          name={`components.${index}.subject`}
          render={({field: {onChange, value, onBlur}}) => (
            <FormInput
              props={{
                name: `components[${index}].subject`,
                placeholder: t('Enter header name...'),
                variant: 'standard',
                value,
                error: isSubjectInvalid,
                onBlur,
                onChange,
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
          )}
        />
        <ComponentActions
          duplicateComponent={duplicateComponent}
          deleteComponent={deleteComponent}
        />
      </Box>
    );
  },
);

interface TextareaComponentProps extends ComponentProps {
  isDragging: Boolean;
}

export const TextComponent = React.memo(
  ({
    index,
    formik,
    component,
    duplicateComponent,
    deleteComponent,
    isDragging,
  }: TextareaComponentProps) => {
    const isSubjectInvalid = !!(
      getIn(formik.formState.touchedFields, `components[${index}].subject`) &&
      getIn(formik.formState.errors, `components[${index}].subject`)
    );
    return (
      <>
        <Box display="flex" alignItems="center">
          <Controller
            control={formik.control}
            defaultValue={component.subject ?? undefined}
            name={`components.${index}.subject`}
            render={({field: {onChange, value, onBlur}}) => (
              <FormInput
                props={{
                  name: `components[${index}].subject`,
                  placeholder: t('Enter text area name...'),
                  variant: 'standard',
                  value,
                  error: isSubjectInvalid,
                  onBlur,
                  onChange,
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
            )}
          />
          <ComponentActions
            duplicateComponent={duplicateComponent}
            deleteComponent={deleteComponent}
          />
        </Box>

        {!isDragging ? (
          <Controller
            control={formik.control}
            defaultValue={component.note ?? undefined}
            name={`components.${index}.note`}
            render={({field: {onChange, value, onBlur}}) => (
              <TextField
                name={`components[${index}].note`}
                variant="outlined"
                size="small"
                placeholder={t('Enter your text here...')}
                multiline
                fullWidth
                value={value}
                minRows={5}
                error={
                  !!(
                    getIn(
                      formik.formState.touchedFields,
                      `components[${index}].note`,
                    ) &&
                    getIn(formik.formState.errors, `components[${index}].note`)
                  )
                }
                onChange={onChange}
                onBlur={onBlur}
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
            )}
          />
        ) : null}
      </>
    );
  },
);

export const ChecklistComponent = ({
  index,
  component,
  formik,
  draggableProvided,
  isDragging,
  listRef,
}: {
  index: number;
  component: ExtendedCheckListComponentRecord;
  formik: UseFormReturn<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
  draggableProvided: DraggableProvided;
  isDragging: Boolean;
  listRef: MutableRefObject<any>;
}) => {
  const values = formik.getValues();
  const duplicateComponent = () => {
    formik.setValue('components', [
      ...values.components.slice(0, index + 1),
      {
        ...component,
        id: getUniqueId(),
      },
      ...values.components.slice(index + 1),
    ]);
  };

  const deleteComponent = () => {
    const removedItem = values.components.filter((c) => c.id !== component.id);
    formik.setValue('components', removedItem);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const handleCheckOption = (id: string) => {
    formik.setValue(
      `components.${index}.options`,
      values.components[index].options.map((o) => ({
        ...o,
        isDefault: o.id === id,
      })),
    );
  };

  const addOption = () => {
    formik.setValue(`components.${index}.options`, [
      ...values.components[index].options,
      getOptionMock(),
    ]);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  };

  const removeOption = (id: string) => {
    formik.setValue(
      `components.${index}.options`,
      values.components[index].options.filter((o) => o.id !== id),
    );
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const handleMoreInfoInNote = (value: Boolean) => {
    formik.setValue(`components.${index}.moreInfoInNote`, value);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  };

  const handleCheckCheckbox = () => {
    formik.setValue(`components.${index}.checked`, !component.checked);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  };

  const renderContent = () => {
    if (component.type === CheckListComponentType.SINGLE_CHECK) {
      return (
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
      );
    }

    if (component.type === CheckListComponentType.HEAD) {
      return (
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
      );
    }

    if (component.type === CheckListComponentType.YES_NO) {
      return (
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
      );
    }

    if (component.type === CheckListComponentType.TEXT) {
      return (
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
      );
    }
  };

  return renderContent() ?? null;
};
