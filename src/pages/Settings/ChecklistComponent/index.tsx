// @ts-nocheck
import React, {MutableRefObject} from 'react';
import {get} from 'lodash';
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
import {Switch} from 'components/Settings/Switch';
import {
  CheckListComponentType,
  ExtendedCheckListComponentRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
} from 'models/checklist';
import {getUniqueId} from 'utils/utils';
import {getOptionMock} from 'utils/checklist';
import {Controller, UseFieldArrayReturn, UseFormReturn} from 'react-hook-form';

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
  form: UseFormReturn<
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
  form,
  component,
  duplicateComponent,
  deleteComponent,
  handleCheckOption,
  removeOption,
  addOption,
  handleMoreInfoInNote,
  isDragging,
}: MultiChoiceComponentProps) => {
  const watchToItem = form.watch(`components.${index}.subject`);

  const inputRef = form.register(`components.${index}.subject`, {
    required: true,
  });

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}>
        <FormInput
          props={{
            ...inputRef,
            name: `components.${index}.subject`,
            placeholder: t('Enter multi-choice name...'),
            variant: 'standard',
            error: !watchToItem,
            required: true,
            inputProps: {
              sx: {
                p: 0,
                '&::placeholder': {
                  color: !watchToItem ? 'error.main' : 'text.primary',
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
              const textRef = form.register(
                `components.${index}.options.${optionIndex}.text`,
                {
                  required: true,
                },
              );
              const watchToOption = form.watch(
                `components.${index}.options.${optionIndex}.text`,
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
                    onChange={() => handleCheckOption(option.id)}
                    name={`components.${index}.options.${optionIndex}.isDefault`}
                    sx={{
                      '&.Mui-checked': {
                        color: '#4CAF50',
                      },
                    }}
                  />

                  <FormInput
                    props={{
                      ...textRef,
                      name: `components.${index}.options.${optionIndex}.text`,
                      placeholder: 'Choice one',
                      variant: 'outlined',
                      error: !watchToOption,
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
                            color: !watchToOption
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
                startIcon: <Add />,
              }}>
              <Typography variant="subtitle2">{t('New Choice')}</Typography>
            </Button>

            <Box display="flex" alignItems="center">
              <Switch
                value={!!component.moreInfoInNote}
                onValueChange={handleMoreInfoInNote}
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

export const CheckboxComponent = ({
  index,
  form,
  component,
  duplicateComponent,
  deleteComponent,
}: ComponentProps) => {
  const watchToItem = form.watch(`components.${index}.subject`);
  const inputRef = form.register(`components.${index}.subject`, {
    required: true,
  });
  return (
    <>
      <Controller
        control={form.control}
        defaultValue={!!component.checked}
        name={`components.${index}.checked`}
        render={({field: {onChange, value}}) => (
          <Checkbox
            name={`components.${index}.checked`}
            checked={!!value}
            onChange={onChange}
            size="small"
            sx={{
              ml: 1,
              '&.Mui-checked': {
                color: '#4CAF50',
              },
            }}
          />
        )}
      />

      <FormInput
        props={{
          ...inputRef,
          name: `components.${index}.subject`,
          variant: 'outlined',
          error: !watchToItem,
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
};

export const HeaderComponent = ({
  index,
  form,
  component,
  duplicateComponent,
  deleteComponent,
}: ComponentProps) => {
  const watchToItem = form.watch(`components.${index}.subject`);
  const inputRef = form.register(`components.${index}.subject`, {
    required: true,
  });

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flex={1}>
      <FormInput
        props={{
          ...inputRef,
          key: component.id,
          name: `components.${index}.subject`,
          placeholder: t('Enter header name...'),
          variant: 'standard',
          error: !watchToItem,
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
                color: !watchToItem ? 'error.main' : 'text.primary',
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
  form,
  component,
  duplicateComponent,
  deleteComponent,
  isDragging,
}: TextareaComponentProps) => {
  const watchToItem = form.watch(`components.${index}.subject`);

  const titleRef = form.register(`components.${index}.subject`, {
    required: true,
  });

  return (
    <>
      <Box display="flex" alignItems="center">
        <FormInput
          props={{
            ...titleRef,
            name: `components.${index}.subject`,
            placeholder: t('Enter text area name...'),
            variant: 'standard',
            error: !watchToItem,
            required: true,
            inputProps: {
              sx: {
                p: 0,
                '&::placeholder': {
                  color: !watchToItem ? 'error.main' : 'text.primary',
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
        <Controller
          control={form.control}
          defaultValue={component.note ?? undefined}
          name={`components.${index}.note`}
          render={({field: {onChange, value, onBlur}}) => (
            <TextField
              name={`components.${index}.note`}
              variant="outlined"
              size="small"
              placeholder={t('Enter your text here...')}
              multiline
              fullWidth
              value={value}
              minRows={5}
              error={
                !!(
                  get(
                    form.formState.touchedFields,
                    `components[${index}].note`,
                  ) && get(form.formState.errors, `components[${index}].note`)
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
};

export const ChecklistComponent = ({
  index,
  component,
  form,
  draggableProvided,
  isDragging,
  listRef,
  arrayFields,
}: {
  index: number;
  component: ExtendedCheckListComponentRecord;
  form: UseFormReturn<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
  draggableProvided: DraggableProvided;
  isDragging: Boolean;
  listRef: MutableRefObject<any>;
  arrayFields: UseFieldArrayReturn<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord,
    'components'
  >;
}) => {
  const duplicateComponent = () => {
    const note = form.watch(`components.${index}.note`);
    const checked = form.watch(`components.${index}.checked`);
    const yesNo = component.type === CheckListComponentType.YES_NO;
    const textAreaType = component.type === CheckListComponentType.TEXT;
    arrayFields.insert(index, {
      ...component,
      subject: form.watch(`components.${index}.subject`),
      ...(yesNo ? {checked} : {}),
      ...(textAreaType ? {note} : {}),
      id: getUniqueId(),
    });
    if (listRef.current) {
      listRef.current.resetAfterIndex(index, true);
    }
  };

  const deleteComponent = () => {
    arrayFields.remove(index);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  };

  const handleCheckOption = (id: string) => {
    const newData = {...form.getValues()};
    newData.components[index].options = newData.components[index].options.map(
      (o) => ({
        ...o,
        isDefault: o.id === id,
      }),
    );
    form.reset(newData);
  };

  const addOption = () => {
    const newData = {...form.getValues()};
    newData.components[index].options.push(getOptionMock());
    form.reset(newData);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  };

  const removeOption = (id: string) => {
    const data = {...form.getValues()};
    const foundIndex = data.components[index].options.findIndex(
      (o) => o.id === id,
    );
    data.components[index].options.splice(foundIndex, 1);
    form.reset(data);
    if (listRef.current) {
      listRef.current.resetAfterIndex(index, true);
    }
  };

  const handleMoreInfoInNote = (value: Boolean) => {
    const data = {...form.getValues()};
    data.components[index].moreInfoInNote = value;
    form.reset(data);
    if (listRef.current) {
      listRef.current.resetAfterIndex(index, true);
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
            form={form}
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
            form={form}
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
            form={form}
            component={component}
            duplicateComponent={duplicateComponent}
            deleteComponent={deleteComponent}
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
            form={form}
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
