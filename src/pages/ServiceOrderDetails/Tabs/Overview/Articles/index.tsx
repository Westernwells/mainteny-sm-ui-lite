import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import {ServiceOrderArticleView} from 'models/service-order';
import {EmptySection} from 'components/EmptySection';
import Box from '@mui/material/Box';
import {SelectModal} from 'components/SelectModal';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {ArticleView} from 'models/article';
import {Progress} from 'components/Progress';
import {Confirm} from 'components/Confirm';
import {Dialog} from 'components/Dialog';
import {
  useCreateServiceOrderArticle,
  useDeleteServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {EditArticleForm} from './EditArticleForm';
import {ActionTypes, columns, makeRows} from './ArticleDataGridProps';
import {EditArticleFormModel} from './models';
import {
  amountRecordForBackend,
  makeAmountRecord,
} from '../../../../../utils/currency';

interface Props {
  serviceOrderArticles: ServiceOrderArticleView[] | undefined;
  serviceOrderId?: string;
}

export const Articles = ({serviceOrderArticles, serviceOrderId}: Props) => {
  const {t} = useTranslation();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formikErrors, setFormikErrors] = useState({});
  const [formikValues, setFormikValues] = useState<
    EditArticleFormModel | undefined
  >();
  const [openSelectModal, setOpenSelectModal] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentArticle, setCurrentArticle] =
    useState<ServiceOrderArticleView>();

  const {mutateAsync: createServiceOrderArticle} =
    useCreateServiceOrderArticle();

  const {mutateAsync: updateServiceOrderArticle, isLoading} =
    useNewUpdateServiceOrderArticles();

  const {mutateAsync: deleteServiceOrderArticle} =
    useDeleteServiceOrderArticle();

  useEffect(() => {
    setRows(makeRows(serviceOrderArticles || []));
  }, [serviceOrderArticles]);

  useEffect(() => {
    if (isEditing && currentArticle) {
      setOpenEditDialog(true);
    }
  }, [isEditing, currentArticle]);

  useEffect(() => {
    if (!isLoading) {
      setIsEditing(false);
      setOpenEditDialog(false);
    }
  }, [isLoading]);

  const handleSelectArticle = async (article: ArticleView) => {
    const articleExists = serviceOrderArticles?.filter(
      (item) => item.article.id === article.id,
    );

    if (articleExists!.length > 0) {
      setOpenSelectModal(false);
      return;
    }
    const body = {
      articleId: article.id,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: {
        currency: article.unitSellingAmount.currency,
        netAmount: article.unitSellingAmount.netAmount,
        percentageVat: article.unitSellingAmount.percentageVat,
      },
    };

    await createServiceOrderArticle({
      serviceOrder: serviceOrderId!,
      body,
    });
    setOpenSelectModal(false);
  };

  const deleteArticle = async () => {
    await deleteServiceOrderArticle({
      serviceOrder: serviceOrderId!,
      serviceOrderArticleId: currentArticle?.id!,
    });
    setOpenConfirm(false);
  };

  const handleAction = async (
    serviceOrderArticle: ServiceOrderArticleView,
    action: ActionTypes,
  ) => {
    setCurrentArticle(serviceOrderArticle);
    if (action === ActionTypes.EDIT) {
      setIsEditing(true);
    }

    if (action === ActionTypes.DELETE) {
      setOpenConfirm(true);
    }
  };

  const handleUpdateArticle = async () => {
    const body = serviceOrderArticles!
      .filter((item) => item.article.id === currentArticle?.article.id)
      .map((item) => ({
        articleId: item.article.id,
        description: formikValues!.description,
        name: formikValues!.name,
        quantity: formikValues!.quantity,
        unitAmount: amountRecordForBackend(
          makeAmountRecord(
            formikValues!.unitPrice,
            currentArticle!.unitAmount.currency,
            currentArticle!.unitAmount.percentageVat,
          ),
        ),
      }))[0];
    await updateServiceOrderArticle({
      data: body!,
      serviceOrder: serviceOrderId!,
      serviceOrderArticleId: currentArticle?.id!,
    });
    setOpenEditDialog(false);
  };
  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        illustration="clipboard"
        size="tiny"
        containerStyle={{m: 'auto', width: '60%'}}
        label="No articles yet. Please click the button above to add new"
      />
    </Box>
  );

  return (
    <>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Articles')}</Typography>}
        showHeaderBackground
        handleAction={() => setOpenSelectModal(true)}
        headerActionIcon={
          <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
        }>
        {!serviceOrderArticles?.length ? (
          renderNoRowsSection()
        ) : (
          <DataGridLayout
            fullHeight={false}
            height={getDataGridHeight(rows.length, 3)}
            rows={rows}
            columns={columns((item, actionType) =>
              handleAction(item, actionType),
            )}
            containerStyle={{
              borderBottom: 'none',
            }}
          />
        )}
      </InfoCard>

      <SelectModal
        isOpen={openSelectModal}
        onClose={() => setOpenSelectModal(false)}
        header="Select Article">
        {isLoading ? (
          <Progress label="Adding article" />
        ) : (
          <ArticlesModalDataGrid setRowItem={handleSelectArticle} />
        )}
      </SelectModal>
      <Confirm
        open={openConfirm}
        onConfirm={() => deleteArticle()}
        onClose={() => setOpenConfirm(false)}
        title="Confirm"
        content="Do you want to delete this article?"
      />

      <Dialog
        title="Edit Article"
        onCancel={() => {
          setOpenEditDialog(false);
          setIsEditing(false);
        }}
        disableSaveBtn={!!Object.keys(formikErrors).length}
        onSave={() => handleUpdateArticle()}
        isSaving={isLoading}
        dialogProps={{
          maxWidth: 'sm',
          open: openEditDialog,
        }}>
        <EditArticleForm
          serviceOrderArticle={currentArticle!}
          getFormikErrors={(val) => setFormikErrors(val)}
          getFormikValues={(val) => setFormikValues(val)}
        />
      </Dialog>
    </>
  );
};
