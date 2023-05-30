import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import * as Yup from 'yup';
import {getIn, useFormik} from 'formik';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
} from 'react-beautiful-dnd';
import _ from 'lodash';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import Cancel from '@mui/icons-material/Cancel';
import Edit from '@mui/icons-material/Edit';
import Add from '@mui/icons-material/Add';
import {DragHandle} from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateChecklist,
  useUpdateChecklist,
} from 'hooks/reactQuery/useChecklists';
import {
  CheckList,
  CheckListQuestionOption,
  CheckListQuestionOptionColor,
  CheckListQuestionType,
} from 'models/checklist';
import {getUniqueId} from 'utils/utils';
import {getQuestionsGroupedByCategory, getOptions} from 'utils/checklist';
import ChecklistPreview from './ChecklistPreview';

declare module 'yup' {
  interface ArraySchema<T> {
    unique(propertyPath: string, message: string): ArraySchema<T>;
  }
}

Yup.addMethod(Yup.array, 'unique', function fn(propertyPath, message) {
  return this.test('unique', '', function fn2(list) {
    const errors: string | Yup.ValidationError | Yup.ValidationError[] = [];

    list?.forEach((item, index) => {
      const propertyValue = _.get(item, propertyPath);

      if (
        propertyValue &&
        _.filter(list, [propertyPath, propertyValue]).length > 1
      ) {
        errors.push(
          this.createError({
            path: `${this.path}[${index}].${propertyPath}`,
            message,
          }),
        );
      }
    });

    if (!_.isEmpty(errors)) {
      throw new Yup.ValidationError(errors);
    }

    return true;
  });
});

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string(),
  categories: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required(),
        questions: Yup.array()
          .of(
            Yup.object().shape({
              question: Yup.string().required(),
              type: Yup.string()
                .oneOf(Object.values(CheckListQuestionType))
                .required(),
            }),
          )
          .min(1),
      }),
    )
    .unique('name', 'Category name must be unique')
    .min(1),
  options: Yup.array()
    .of(
      Yup.object().shape({
        text: Yup.string().required(),
        color: Yup.string()
          .oneOf(Object.keys(CheckListQuestionOptionColor))
          .required(),
      }),
    )
    .min(1),
});

const optionMock = {
  id: getUniqueId(),
  text: '',
  color: CheckListQuestionOptionColor.DEFAULT,
};

const questionMock = {
  id: getUniqueId(),
  question: '',
  type: CheckListQuestionType.SINGLE_CHECK,
  additionalInfo: {orderNumber: 0},
};

export const Checklist = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const checklist = (location.state as {checklist: CheckList})?.checklist;
  const {user} = useUserSession();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [editingQuestionCategory, setEditingQuestionCategory] = useState('');
  const {mutate: createChecklist, isLoading: isCreating} = useCreateChecklist(
    'Checklist saved successfully!',
  );
  const {mutate: updateChecklist, isLoading: isUpdating} = useUpdateChecklist(
    'Checklist updated successfully!',
  );

  useEffect(() => {
    const hasEdit = location.search.includes('edit=1');
    setIsPreviewing(hasEdit ? false : !!checklist);
  }, []);

  const categories = getQuestionsGroupedByCategory(checklist?.questions ?? []);
  const options = getOptions(checklist?.questions ?? []).map(
    (option: CheckListQuestionOption) => ({...option, id: getUniqueId()}),
  );

  const initialValues = useMemo(
    () => ({
      name: checklist?.name ?? '',
      category: checklist?.category ?? '',
      categories: categories.length
        ? categories
        : [
            {
              id: getUniqueId(),
              name: 'Service',
              questions: [{...questionMock, id: getUniqueId()}],
            },
          ],
      options: options.length ? options : [{...optionMock, id: getUniqueId()}],
    }),
    [],
  );

  const handleSubmit = (values: typeof initialValues) => {
    const questions = values.categories
      .map((category) =>
        category.questions.map((question) => ({
          category: category.name,
          question: question.question,
          type: question.type,
          options: values.options,
        })),
      )
      .flat();
    const questionsWithOrderNumber = questions.map((q, index) => ({
      ...q,
      orderNumber: index + 1,
    }));

    if (checklist?.id) {
      const data = {
        name: values.name,
        externalId: checklist.externalId,
        category: values.category,
        questions: questionsWithOrderNumber,
      };
      updateChecklist(
        {id: checklist.id, checklist: data},
        {onSuccess: () => navigate(-1)},
      );
    } else {
      const data = {
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        name: values.name,
        category: values.category,
        questions: questionsWithOrderNumber,
      };
      createChecklist(data, {onSuccess: () => navigate(-1)});
    }
  };

  const formik = useFormik({
    validateOnMount: true,
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const onDragQuestionEnd = (result: DropResult, categoryId: string) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const categoryItem = formik.values.categories.find(
      (category) => category.id === categoryId,
    );
    const newQuestions = Array.from(categoryItem?.questions ?? []);
    const [removed] = newQuestions.splice(startIndex, 1);
    newQuestions.splice(endIndex, 0, removed);

    const newCategories = formik.values.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            questions: newQuestions,
          }
        : category,
    );
    formik.setFieldValue('categories', newCategories);
  };

  const onDragOptionEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const newOptions = Array.from(formik.values.options);
    const [removed] = newOptions.splice(startIndex, 1);
    newOptions.splice(endIndex, 0, removed);

    formik.setFieldValue('options', newOptions);
  };

  const addNewCategory = () => {
    formik.setFieldValue('categories', [
      ...formik.values.categories,
      {
        id: getUniqueId(),
        name: 'Service',
        questions: [{...questionMock, id: getUniqueId()}],
      },
    ]);
  };

  const removeCategory = (categoryId: string) => {
    formik.setFieldValue(
      'categories',
      formik.values.categories.filter((category) => category.id !== categoryId),
    );
  };

  const addNewQuestion = (categoryId: string) => {
    const newCategories = formik.values.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            questions: [
              ...category.questions,
              {...questionMock, id: getUniqueId()},
            ],
          }
        : category,
    );
    formik.setFieldValue('categories', newCategories);
  };

  const removeQuestion = (categoryId: string, questionId: string) => {
    const newCategories = formik.values.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            questions: category.questions.filter((q) => q.id !== questionId),
          }
        : category,
    );
    formik.setFieldValue('categories', newCategories);
  };

  const addNewOption = () => {
    formik.setFieldValue('options', [
      ...formik.values.options,
      {...optionMock, id: getUniqueId()},
    ]);
  };

  const removeOption = (optionId: string) => {
    formik.setFieldValue(
      'options',
      formik.values.options.filter((option) => option.id !== optionId),
    );
  };

  const checklistData = useMemo(
    () => ({
      serviceCompanyId: user!.userAccount.serviceCompany.id,
      name: formik.values.name,
      category: formik.values.category,
      questions: formik.values.categories
        .map((category) =>
          category.questions.map((question) => ({
            id: question.id,
            category: category.name,
            question: question.question,
            type: question.type,
            checkListId: '',
            additionalInfo: {
              options: formik.values.options,
              orderNumber: question.additionalInfo.orderNumber,
              note: '',
            },
          })),
        )
        .flat(),
    }),
    [formik.values],
  );

  return (
    <>
      {isPreviewing ? (
        <ChecklistPreview checklist={checklistData} />
      ) : (
        <PageCard
          headerLabel="Basic Information"
          containerStyles={{
            mb: '5rem',
            mt: '1.5rem',
            width: '100%',
            maxWidth: '57rem',
            alignSelf: 'center',
          }}
          headerStyles={{mt: '1rem'}}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <FormInput
                props={{
                  name: 'name',
                  label: t('Checklist name'),
                  variant: 'outlined',
                  value: formik.values.name,
                  error: !!(formik.touched.name && formik.errors.name),
                  onBlur: formik.handleBlur,
                  onChange: formik.handleChange,
                  required: true,
                }}
              />
            </Grid>
          </Grid>

          <Grid
            container
            justifyContent="flex-end"
            alignItems="center"
            pt={2}
            pb={2.75}>
            <Button
              buttonProps={{
                size: 'large',
                variant: 'text',
                onClick: addNewCategory,
                autoFocus: true,
                startIcon: <Add />,
              }}>
              <Typography variant="subtitle2">{t('New Category')}</Typography>
            </Button>
          </Grid>

          {formik.values.categories.map((category, index) => {
            const indexString = index.toString();
            return (
              <Grid
                key={index}
                container
                p={4}
                mb={5}
                bgcolor={theme.palette.inputBackground.main}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center">
                  <Box display="flex">
                    {editingQuestionCategory === indexString ? (
                      <>
                        <FormInput
                          props={{
                            name: `categories[${index}].name`,
                            value: formik.values.categories[index].name,
                            size: 'small',
                            fullWidth: true,
                            type: 'text',
                            onChange: formik.handleChange,
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            setEditingQuestionCategory('');
                          }}
                          edge="start"
                          sx={{mt: '0.7em', ml: '0.2em'}}>
                          <CheckCircleRounded
                            sx={{
                              mt: '-0.8em',
                              color: theme.palette.primary.main,
                            }}
                          />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            setEditingQuestionCategory('');
                          }}
                          edge="start"
                          sx={{mt: '0.7em'}}>
                          <Cancel
                            sx={{
                              mt: '-0.8em',
                              color: theme.palette.primary.main,
                            }}
                          />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6">
                          {formik.values.categories[index].name}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            setEditingQuestionCategory(indexString);
                          }}
                          edge="start"
                          sx={{mt: '-0.2rem', pl: 2.5}}>
                          <Edit sx={{fontSize: '1rem'}} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  {formik.values.categories.length > 1 ? (
                    <Button
                      buttonProps={{
                        size: 'large',
                        variant: 'text',
                        sx: {
                          color: theme.palette.error.main,
                        },
                        onClick: () => removeCategory(category.id),
                      }}>
                      <Typography variant="subtitle2">
                        {t('Delete Category')}
                      </Typography>
                    </Button>
                  ) : null}
                </Grid>

                <DragDropContext
                  onDragEnd={(result) =>
                    onDragQuestionEnd(result, category.id)
                  }>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <Grid
                        container
                        item
                        xs={12}
                        pt={2}
                        rowGap={2}
                        {...provided.droppableProps}
                        ref={provided.innerRef}>
                        {category.questions.map((item, questionIndex) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={questionIndex}>
                            {(draggableProvided: DraggableProvided) => (
                              <Grid
                                container
                                item
                                xs={12}
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}>
                                <Box pr={1.5}>
                                  <IconButton
                                    {...draggableProvided.dragHandleProps}>
                                    <DragHandle />
                                  </IconButton>
                                </Box>
                                <Grid item xs={10}>
                                  <FormInput
                                    props={{
                                      name: `categories[${index}].questions[${questionIndex}].question`,
                                      variant: 'outlined',
                                      value:
                                        formik.values.categories[index]
                                          .questions[questionIndex].question,
                                      error: !!(
                                        formik.touched.categories?.[index]
                                          ?.questions?.[questionIndex] &&
                                        getIn(
                                          formik.errors.categories?.[index],
                                          `questions[${questionIndex}]`,
                                        )
                                      ),
                                      onBlur: formik.handleBlur,
                                      onChange: formik.handleChange,
                                      required: true,
                                      sx: {
                                        bgcolor: 'white',
                                      },
                                    }}
                                  />
                                </Grid>
                                <Grid
                                  container
                                  item
                                  xs={1}
                                  justifyContent="center">
                                  <IconButton
                                    onClick={() =>
                                      removeQuestion(category.id, item.id)
                                    }>
                                    <Close />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <Button
                          buttonProps={{
                            size: 'large',
                            variant: 'text',
                            onClick: () => addNewQuestion(category.id),
                            autoFocus: true,
                            startIcon: <Add />,
                          }}>
                          <Typography variant="subtitle2">
                            {t('New Task')}
                          </Typography>
                        </Button>
                      </Grid>
                    )}
                  </Droppable>
                </DragDropContext>
              </Grid>
            );
          })}

          {/* OPTIONS */}
          <Typography variant="h6">{t('Option per task')}</Typography>
          <DragDropContext onDragEnd={onDragOptionEnd}>
            <Droppable droppableId="droppableOptions">
              {(provided) => (
                <Grid
                  container
                  item
                  xs={12}
                  pt={2}
                  rowGap={2}
                  {...provided.droppableProps}
                  ref={provided.innerRef}>
                  {formik.values.options.map((option, optionIndex) => (
                    <Draggable
                      key={option.id}
                      draggableId={option.id}
                      index={optionIndex}>
                      {(draggableProvided: DraggableProvided) => (
                        <Grid item xs={12}>
                          <Grid
                            container
                            item
                            xs={12}
                            md={7}
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}>
                            <Box pr={1.5}>
                              <IconButton
                                {...draggableProvided.dragHandleProps}>
                                <DragHandle />
                              </IconButton>
                            </Box>
                            <Grid item xs={10} md={9}>
                              <FormInput
                                props={{
                                  name: `options[${optionIndex}].text`,
                                  variant: 'outlined',
                                  value:
                                    formik.values.options[optionIndex].text,
                                  error: !!(
                                    formik.touched?.options?.[optionIndex] &&
                                    formik.errors.options?.[optionIndex]
                                  ),
                                  onBlur: formik.handleBlur,
                                  onChange: formik.handleChange,
                                  required: true,
                                  sx: {
                                    bgcolor: 'white',
                                  },
                                }}
                              />
                            </Grid>
                            <Grid container item xs={1} justifyContent="center">
                              <IconButton
                                onClick={() => removeOption(option.id)}>
                                <Close />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <Button
                    buttonProps={{
                      size: 'large',
                      variant: 'text',
                      onClick: addNewOption,
                      autoFocus: true,
                      startIcon: <Add />,
                    }}>
                    <Typography variant="subtitle2">
                      {t('New Option')}
                    </Typography>
                  </Button>
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
        </PageCard>
      )}

      <BottomDrawer
        isOpen
        isSaving={isCreating || isUpdating}
        primaryButtonLabel={t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={[]}
        isValid={formik.isValid}
        secondaryButton={
          <Button
            label={isPreviewing ? 'Edit' : 'Preview'}
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon: isPreviewing ? <Edit /> : <RemoveRedEye />,
              onClick: () => setIsPreviewing((currState) => !currState),
            }}
          />
        }
      />
    </>
  );
};

export default Checklist;
