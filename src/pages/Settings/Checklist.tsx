import {useEffect, useMemo, useState} from 'react';
import {t} from 'i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  BeforeCapture,
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
  CheckListComponentOptionColor,
  CheckListComponentType,
  CreateCheckListRecord,
  UpdateCheckListRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
} from 'models/checklist';
import {
  checkListComponentViewToExtendedCreateCheckListRecord,
  getComponentMock,
} from 'utils/checklist';
import {makePage} from 'utils/paging-utils';
import {ChecklistComponent} from './ChecklistComponent';
import {ChecklistPreview} from './ChecklistPreview';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  components: Yup.array().of(
    Yup.object().shape({
      subject: Yup.string().required(),
      type: Yup.string()
        .oneOf(Object.values(CheckListComponentType))
        .required(),
      options: Yup.array().when('type', {
        is: (v: string) => v === CheckListComponentType.SINGLE_CHECK,
        then: Yup.array()
          .of(
            Yup.object().shape({
              text: Yup.string().required(),
              color: Yup.string()
                .oneOf(Object.keys(CheckListComponentOptionColor))
                .required(),
            }),
          )
          .min(1)
          .required(),
      }),
      orderNumber: Yup.number().required(),
      moreInfoInNote: Yup.boolean(),
    }),
  ),
});

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

export const Checklist = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const checklist = (location.state as {checklist: CheckList})?.checklist;
  const {user} = useUserSession();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [draggingComponentId, setDraggingComponentId] = useState<string>('');
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
        : [getComponentMock(CheckListComponentType.SINGLE_CHECK)],
    }),
    [],
  );

  const handleSubmit = (
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

  const formik = useFormik<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >({
    validateOnMount: true,
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

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
        formik.setFieldValue('name', checklistTitle);
        return;
      }

      const filteredChecklists = refetchedChecklists.data.filter((c) =>
        c.name.startsWith(checklistTitle),
      );
      if (filteredChecklists.length) {
        formik.setFieldValue(
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
    const newComponents = [...formik.values.components];
    const [movedComponent] = newComponents.splice(sourceIndex, 1);
    newComponents.splice(destinationIndex, 0, movedComponent);
    formik.setFieldValue('components', newComponents);
    setDraggingComponentId('');
  };

  const onBeforeCapture = ({draggableId}: BeforeCapture) => {
    setDraggingComponentId(draggableId);
  };

  const addComponent = async (type: CheckListComponentType) => {
    formik.setFieldValue('components', [
      ...formik.values.components,
      getComponentMock(type),
    ]);

    // workaround because setFieldValue do not recieve callback
    await Promise.resolve();

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const isNameInvalid = !!(formik.touched.name && formik.errors.name);

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        mt="1.5rem"
        mb="5rem"
        gap={3}>
        <Box width="100%" maxWidth="47rem">
          <PageCard
            containerStyles={{
              p: 4,
              pb: formik.values.components.length ? 4 : 8,
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
            <FormInput
              props={{
                name: 'name',
                placeholder: t('Enter your checklist name...'),
                variant: 'standard',
                value: formik.values.name,
                error: isNameInvalid,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
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

            {formik.values.components.length ? (
              <DragDropContext
                onDragEnd={onDragComponentEnd}
                onBeforeCapture={onBeforeCapture}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <Box
                      pt={4}
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                      {formik.values.components?.map((component, index) => (
                        <Draggable
                          key={component.id}
                          draggableId={component.id}
                          index={index}>
                          {(draggableProvided: DraggableProvided) => (
                            <ChecklistComponent
                              index={index}
                              component={component}
                              formik={formik}
                              draggableProvided={draggableProvided}
                              isDragging={draggingComponentId === component.id}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </PageCard>

          {formik.values.components.length ? null : (
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
            {t('ADD NEW')}
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
                {t(component.label)}
              </Typography>
            </Button>
          ))}
        </PageCard>
      </Box>

      <ChecklistPreview
        isPreviewing={isPreviewing}
        onClosePreview={() => setIsPreviewing(false)}
        formik={formik}
      />

      <BottomDrawer
        isOpen
        isSaving={isCreating || isUpdating}
        primaryButtonLabel={t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={[]}
        isValid
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
    </>
  );
};

export default Checklist;
