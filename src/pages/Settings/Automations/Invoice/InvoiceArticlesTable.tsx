import {Box, Button} from '@mui/material';
import {EmptySection} from 'components/EmptySection';
import {
  useCreateTravelWork,
  useQueryTravelWorks,
  useUpdateTravelWork,
} from 'hooks/reactQuery/useTravelWork';
import {
  TravelWorkCalculationType,
  TravelWorkView,
} from 'models/service-company';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {CreateEditViewMode, StringValue} from 'models/misc';
import AddIcon from '@mui/icons-material/Add';
import {UseFieldArrayReturn, UseFormReset} from 'react-hook-form';
import useTheme from '@mui/material/styles/useTheme';
import DataList, {FormState} from './DataList';
import {ArticleForm} from './InvoiceArticles';

interface Props {
  serviceOrderTypeName: string;
  dataListMode: CreateEditViewMode;
  setDataListMode: (newValue: CreateEditViewMode) => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editingEvent: {
    event?: TravelWorkView;
    index?: number;
  };
  setEditingEvent: Dispatch<
    SetStateAction<{
      event?: TravelWorkView;
      index?: number;
    }>
  >;
  isUpdating?: boolean;
  fields: UseFieldArrayReturn<ArticleForm, 'articleList'>['fields'];
  reset: UseFormReset<ArticleForm>;
  openDialog: boolean;
  setOpenDialog: Dispatch<React.SetStateAction<boolean>>;
  isListingView: boolean;
  onDeleteStart?: (event: TravelWorkView, index: number) => void;
}

const InvoiceArticlesTable = ({
  serviceOrderTypeName,
  dataListMode,
  setDataListMode,
  form,
  setForm,
  editingEvent,
  setEditingEvent,
  isUpdating = false,
  fields,
  reset,
  openDialog,
  setOpenDialog,
  isListingView,
  onDeleteStart,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const [newlyAddedArticle, setNewlyAddedArticle] = useState<{id: string}>();

  const handleSuccessResponse = (response: StringValue) => {
    setNewlyAddedArticle({id: response.value});
  };

  const {mutate: createTravelWork} = useCreateTravelWork(
    'Article added successfully',
    handleSuccessResponse,
  );
  const {mutate: updateTravelWork} = useUpdateTravelWork(
    'Article updated successfully',
  );
  const {data: articles, isFetching} = useQueryTravelWorks({
    serviceOrderType: serviceOrderTypeName,
  });

  const handleCalculationTypeChange = async (data: {
    articleId: string;
    calculationType: TravelWorkCalculationType;
    id: string;
  }) => {
    updateTravelWork({
      id: data.id,
      articleId: data.articleId,
      calculationType: data.calculationType,
      serviceOrderType: serviceOrderTypeName,
    });
    if (data.id === newlyAddedArticle?.id) {
      setNewlyAddedArticle(undefined);
    }
  };

  const handleOnCancel = () => {
    setForm({
      name: '',
      articleNumber: '',
      unit: '',
      automate: '',
      sellingPrice: 0,
    });
    setDataListMode('view');
  };

  const handleOnCreate = async () => {
    if (dataListMode === 'create') {
      createTravelWork({
        articleId: form?.article?.id!,
        calculationType: form.calculationType!,
        serviceOrderType: serviceOrderTypeName,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      });
    } else if (dataListMode === 'edit' && editingEvent.index !== undefined) {
      handleCalculationTypeChange({
        articleId: form?.article?.id!,
        calculationType: form.calculationType!,
        id: form.realId!,
      });
    }

    handleOnCancel();
  };

  const handleOnEditStart = (event: TravelWorkView, index: number) => {
    setDataListMode('edit');
    setEditingEvent({event, index});

    if (articles?.[index]) {
      const {article} = articles[index];

      setForm((prevForm) => ({
        ...prevForm,
        realId: articles[index].id,
        name: article.name,
        calculationType: event.calculationType,
        article: event.article,
      }));
    }
  };

  const handleAddNewType = () => {
    setDataListMode('create');
    setForm({
      name: '',
      articleNumber: '',
      unit: '',
      automate: '',
      sellingPrice: 0,
    });
  };

  useEffect(() => {
    if (articles && !isFetching) {
      reset({
        articleList: articles?.map(
          (item) => ({
            id: item.id,
            realId: item.id,
            name: item.article.name,
            articleNumber: item.article.externalId,
            calculationType: item.calculationType,
            unit: item.article.unit,
            sellingPrice: item.article.unitSellingAmount?.netAmount || 0,
            article: item.article,
          }),
          {keepDirtyValues: true, keepValues: true},
        ),
      });
    }
  }, [articles, reset, isFetching]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <Box mt={2}>
        <DataList
          onCancel={handleOnCancel}
          onCreate={handleOnCreate}
          onEditStart={handleOnEditStart}
          onDeleteStart={onDeleteStart}
          loading={isUpdating || isFetching}
          mode={dataListMode}
          data={fields}
          editingEvent={editingEvent}
          form={form}
          setForm={setForm}
          isListingView={isListingView}
        />
      </Box>

      {dataListMode === 'view' && !isListingView && fields.length > 0 && (
        <Box mt={2}>
          <Button
            disabled={dataListMode !== 'view'}
            onClick={handleAddNewType}
            startIcon={
              <AddIcon
                htmlColor={
                  dataListMode === 'view'
                    ? theme.palette.primary.light
                    : theme.palette.secondary.mainLight
                }
              />
            }
            sx={{color: theme.palette.primary.light}}
            variant="text">
            {t('New Article')}
          </Button>
        </Box>
      )}

      {fields.length < 1 && dataListMode === 'view' && (
        <EmptySection
          showActionBtn
          illustration="articles"
          size="tiny"
          label="No articles"
          subLabel="Add your default articles to be included in every invoice"
          containerStyle={{
            height: '100%',
            marginTop: '10%',
          }}
          btnAction={
            openDialog ? () => handleAddNewType() : () => setOpenDialog(true)
          }
          btnLabel="Add Article"
        />
      )}
    </Box>
  );
};

export default InvoiceArticlesTable;
