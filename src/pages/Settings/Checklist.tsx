import {MutableRefObject, useEffect, useMemo, useRef, useState} from 'react';
import {t} from 'i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {VariableSizeList} from 'react-window';
import {
  Controller,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import {
  BeforeCapture,
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  CheckBox,
  RadioButtonChecked,
  Subject,
  Title,
} from '@mui/icons-material';
import PhoneAndroid from '@mui/icons-material/PhoneAndroid';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {EmptySection} from 'components/EmptySection';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateChecklist,
  useQueryChecklists,
  useUpdateChecklist,
} from 'hooks/reactQuery/useChecklists';
import {
  CheckList,
  CheckListComponentType,
  CreateCheckListRecord,
  ExtendedCheckListComponentOption,
  ExtendedCheckListComponentRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
  UpdateCheckListRecord,
} from 'models/checklist';

import {
  checkListComponentViewToExtendedCreateCheckListRecord,
  getComponentMock,
} from 'utils/checklist';
import {makePage} from 'utils/paging-utils';
import AutoSizer from 'react-virtualized-auto-sizer';
import {ChecklistComponent} from './ChecklistComponent';
import {ChecklistPreview} from './ChecklistPreview';
import {T} from 'utils/i18n-utils';
import {styles} from './style';

const availableComponents = [
  {
    icon: RadioButtonChecked,
    label: 'Multi-Choice',
    type: CheckListComponentType.SINGLE_CHECK,
  },
  {
    icon: CheckBox,
    label: 'Checkbox',
    type: CheckListComponentType.YES_NO,
  },
  {
    icon: Title,
    label: 'Header',
    type: CheckListComponentType.HEAD,
  },
  {
    icon: Subject,
    label: 'Text Area',
    type: CheckListComponentType.TEXT,
  },
];

interface Props {
  data: {
    listRef: MutableRefObject<any>;
    form: UseFormReturn<
      ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
    >;
    arrayFields: UseFieldArrayReturn<
      ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord,
      'components'
    >;
    draggingComponentId: string;
  };
}

const renderDraggableItem = ({
  provided,
  component,
  index,
  data,
}: {
  index: number;
  component: ExtendedCheckListComponentRecord;
  provided: DraggableProvided;
} & Props) => (
  <Box
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    style={{userSelect: 'none'}}>
    <ChecklistComponent
      listRef={data.listRef}
      index={index}
      component={component}
      form={data.form}
      arrayFields={data.arrayFields}
      draggableProvided={provided}
      isDragging={data.draggingComponentId === component.id}
    />
  </Box>
);

const Row = ({
  style,
  index,
  data,
}: {
  style: any;
  index: number;
} & Props) => {
  const component = data.arrayFields.fields[
    index
  ] as ExtendedCheckListComponentRecord;
  return (
    <Box style={style}>
      <Draggable key={component.id} draggableId={component.id} index={index}>
        {(draggableProvided: DraggableProvided) =>
          renderDraggableItem({
            provided: draggableProvided,
            component,
            index,
            data,
          })
        }
      </Draggable>
    </Box>
  );
};

const isStringEmpty = (str: string) => str.trim() === '';

const isValidSubject = (subject: string) => !isStringEmpty(subject);

const areOptionsValid = (options: ExtendedCheckListComponentOption[]) =>
  options.every((option) => !isStringEmpty(option.text));

export const Checklist = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const checklist = (location.state as {checklist: CheckList})?.checklist;
  const {user} = useUserSession();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [draggingComponentId, setDraggingComponentId] = useState<string>('');
  const listRef = useRef<VariableSizeList>(null);
  const {mutate: createChecklist, isLoading: isCreating} = useCreateChecklist(
    'Checklist saved successfully!',
  );
  const {mutate: updateChecklist, isLoading: isUpdating} = useUpdateChecklist(
    'Checklist updated successfully!',
  );
  const checklistTitle = t('Checklist Title');
  const {refetch: refetchChecklists} = useQueryChecklists(
    makePage(0, 500),
    checklistTitle,
    {enabled: false},
  );

  const initialValues = useMemo(
    () => ({
      name: checklist?.name ?? '',
      components: checklist?.name
        ? checkListComponentViewToExtendedCreateCheckListRecord(
            checklist.components,
          )
        : [],
    }),
    [],
  );

  const handleSubmitData = (
    values: ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord,
  ) => {
    const componentsWithOrderNumber = values.components?.map((c, index) => {
      const {options, ...rest} = c;
      return {
        ...rest,
        ...(c.type !== CheckListComponentType.YES_NO
          ? {
              options,
            }
          : {options: []}),
        orderNumber: index + 1,
      };
    });

    if (checklist?.id) {
      const data: UpdateCheckListRecord = {
        name: values.name,
        externalId: checklist.externalId,
        components: componentsWithOrderNumber,
      };
      updateChecklist(
        {id: checklist.id, checklist: data},
        {onSuccess: () => navigate(-1)},
      );
    } else {
      const data: CreateCheckListRecord = {
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        name: values?.name ?? '',
        components: componentsWithOrderNumber,
      };
      createChecklist(data, {onSuccess: () => navigate(-1)});
    }
  };

  const form = useForm<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >({
    defaultValues: {
      ...initialValues,
    },
  });

  const allFields = form.watch();
  const arrayFields = useFieldArray({
    control: form.control,
    name: 'components',
  });

  const values = form.getValues();

  useEffect(() => {
    const hasEdit = location.search.includes('edit=1');
    setIsPreviewing(hasEdit);

    // When we create a new checklist add title by default 'Checklist Title'.
    // If a duplicate checklist is created with the same name we are doing workaround for it.
    // We add number to the title of the checklist +1.
    (async () => {
      if (initialValues.name) {
        return;
      }

      const {data: refetchedChecklists} = await refetchChecklists();

      if (!refetchedChecklists?.data.length) {
        form.setValue('name', checklistTitle);
        return;
      }

      const filteredChecklists = refetchedChecklists.data.filter((c) =>
        c.name.startsWith(checklistTitle),
      );
      if (filteredChecklists.length) {
        form.setValue(
          'name',
          `${checklistTitle} ${filteredChecklists.length + 1}`,
        );
      }
    })();
    // focus on name input when page is loaded
    document.querySelector<HTMLInputElement>('input[name="name"]')?.focus?.();
  }, []);

  const onDragComponentEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const newComponents = [...values.components];
    const [movedComponent] = newComponents.splice(sourceIndex, 1);
    newComponents.splice(destinationIndex, 0, movedComponent);
    form.setValue('components', newComponents);
    setDraggingComponentId('');
    if (listRef.current) {
      listRef.current?.resetAfterIndex(0);
    }
  };

  const onBeforeCapture = ({draggableId}: BeforeCapture) => {
    setDraggingComponentId(draggableId);
  };

  const addComponent = async (type: CheckListComponentType) => {
    arrayFields.append({
      ...arrayFields,
      ...getComponentMock(type),
    });

    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }

    // workaround because setFieldValue do not recieve callback
    await Promise.resolve();

    if (listRef.current) {
      listRef.current.scrollToItem(arrayFields.fields.length, 'end');
    }
  };

  const isNameInvalid = !form.getValues('name');

  const getSize = (index: number) => {
    const type = arrayFields.fields[index]?.type;
    const moreInfo = arrayFields.fields[index]?.moreInfoInNote ? 1 : 0;
    const length = (arrayFields.fields[index]?.options.length ?? 0) + moreInfo;
    const PADDING_VERTICAL = 48;
    const MARGIN_BOTTOM = 16;
    const calculateHeightOfSingleCheck =
      (PADDING_VERTICAL + MARGIN_BOTTOM) * length;
    // PADDING_VERTICAL and MARGIN_BOTTOM we are getting from block items. Any change there, we should change here
    switch (type) {
      case CheckListComponentType.YES_NO:
        return 40 + PADDING_VERTICAL + MARGIN_BOTTOM;
      case CheckListComponentType.HEAD:
        return 30 + PADDING_VERTICAL + MARGIN_BOTTOM;
      case CheckListComponentType.SINGLE_CHECK:
        return 140 + calculateHeightOfSingleCheck - (length - 1) * 12;
      case CheckListComponentType.TEXT:
        return 174 + PADDING_VERTICAL + MARGIN_BOTTOM;
      default:
        return 65 + PADDING_VERTICAL + MARGIN_BOTTOM;
    }
  };

  const isValidForm = useMemo(() => {
    const components = values?.components;
    if (!values.name) return false;

    if (components?.length) {
      for (const component of components) {
        if (!isValidSubject(component.subject)) {
          return false;
        }
        if (component.type === CheckListComponentType.SINGLE_CHECK) {
          if (!areOptionsValid(component.options)) {
            return false;
          }
        }
      }
      return true;
    }
    return true;
  }, [allFields, allFields.name, allFields.components?.length]);

  return (
    <form>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        mt="1.5rem"
        mb="5rem"
        gap={3}>
        <Box width="100%" maxWidth="47rem" sx={styles.scrollBar}>
          <PageCard
            containerStyles={{
              p: 4,
              pb: arrayFields.fields.length ? 4 : 8,
            }}
            contentContainerStyles={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 0,
              m: 0,
              ':last-child': {
                pb: 0,
                mb: -2,
              },
            }}>
            {!isValidForm && (
              <Typography
                variant="caption"
                pt={3}
                pb={1.5}
                textAlign="center"
                color="error.main">
                {T(
                  'Some required information is missing. Please check the highlighted fields.',
                )}
              </Typography>
            )}
            <Controller
              control={form.control}
              defaultValue={values.name ?? undefined}
              name="name"
              rules={{required: true}}
              render={({field: {onChange, value, onBlur}}) => (
                <FormInput
                  props={{
                    name: 'name',
                    placeholder: t('Enter your checklist name...'),
                    variant: 'standard',
                    value,
                    error: isNameInvalid,
                    onBlur,
                    onChange,
                    required: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        height: '38px',
                        pt: 2,
                        fontSize: '31px',
                      },
                    },
                    inputProps: {
                      sx: {
                        p: 0,
                        '&::placeholder': {
                          color: isNameInvalid ? 'error.main' : 'text.primary',
                        },
                      },
                    },
                    InputProps: {disableUnderline: true},
                  }}
                />
              )}
            />

            {arrayFields.fields?.length ? (
              <DragDropContext
                onDragEnd={onDragComponentEnd}
                onBeforeCapture={onBeforeCapture}>
                <Droppable
                  droppableId="droppable"
                  mode="virtual"
                  renderClone={(provided, snapshot, rubric) =>
                    renderDraggableItem({
                      provided,
                      component: values.components[rubric.source.index],
                      data: {listRef, form, draggingComponentId, arrayFields},
                      index: rubric.source.index,
                    })
                  }>
                  {(provided) => (
                    <Box
                      pt={4}
                      style={{height: '70vh'}}
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                      <AutoSizer>
                        {({height, width}) => (
                          <VariableSizeList
                            ref={listRef}
                            height={height}
                            width={width}
                            itemCount={arrayFields.fields.length}
                            itemData={{
                              listRef,
                              form,
                              draggingComponentId,
                              arrayFields,
                            }}
                            itemSize={getSize}>
                            {Row}
                          </VariableSizeList>
                        )}
                      </AutoSizer>
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </PageCard>

          {arrayFields.fields.length ? null : (
            <EmptySection
              illustration="emptyChecklistComponents"
              label="Start adding components"
              labelVariant="h5"
              subLabel="Choose some of the components from the menu up right"
              subLabelProps={{
                color: theme.palette.text.secondary,
              }}
              containerStyle={{
                maxWidth: '16rem',
                margin: 'auto',
                pt: 16,
                gap: 1,
              }}
            />
          )}
        </Box>

        <PageCard
          containerStyles={{
            width: '100%',
            maxWidth: '5.5rem',
            position: 'sticky',
            top: '2rem',
          }}
          contentContainerStyles={{
            p: 0,
            ':last-child': {
              pb: 0,
            },
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Typography
            variant="caption"
            fontSize="0.625rem"
            pt={3}
            pb={1.5}
            textAlign="center">
            {T('ADD NEW')}
          </Typography>
          {availableComponents.map((component) => (
            <Button
              key={component.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 0,
                py: 1.5,
                borderRadius: 0,
              }}
              buttonProps={{
                fullWidth: true,
                onClick: () => addComponent(component.type),
              }}>
              <component.icon />
              <Typography variant="caption" fontSize="0.625rem">
                {T(component.label)}
              </Typography>
            </Button>
          ))}
        </PageCard>
      </Box>

      <ChecklistPreview
        isPreviewing={isPreviewing}
        onClosePreview={() => setIsPreviewing(false)}
        form={form}
      />

      <BottomDrawer
        isOpen
        isSaving={isCreating || isUpdating}
        primaryButtonLabel={t('Save')}
        primaryButtonAction={form.handleSubmit(handleSubmitData)}
        listItems={[]}
        isValid={isValidForm}
        secondaryButton={
          <Button
            label="Show Preview"
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon: <PhoneAndroid />,
              onClick: () => setIsPreviewing(true),
            }}
          />
        }
      />
    </form>
  );
};

export default Checklist;
