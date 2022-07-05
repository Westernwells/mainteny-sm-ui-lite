import Typography from '@mui/material/Typography';
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
import {useUpdateServiceOrderArticles} from 'hooks/reactQuery/useArticle';
import {Progress} from 'components/Progress';
import {Confirm} from 'components/Confirm';
import {Dialog} from 'components/Dialog';
import {EditArticleForm} from './EditArticleForm';
import {ActionTypes, columns, makeRows} from './ArticleDataGridProps';
import {EditArticleFormModel} from './models';
import {
  amountRecordForBackend,
  makeAmountRecord,
} from '../../../../../utils/currency';

interface Props {
  serviceOrderArticles?: ServiceOrderArticleView[];
  serviceOrderId?: string;
}

export const Articles = ({
  serviceOrderArticles = [],
  serviceOrderId,
}: Props) => {
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
  const {mutateAsync: updateServiceOrderArticles, isLoading} =
    useUpdateServiceOrderArticles('Article added successfully');

  useEffect(() => {
    setRows(makeRows(serviceOrderArticles));
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

  const getArticleUpdateBody = () =>
    serviceOrderArticles?.map((item) => ({
      articleId: item.article.id,
      description: item.article.description,
      name: item.article.name,
      quantity: item.quantity,
      unitAmount: {
        currency: item.unitAmount.currency,
        netAmount: item.unitAmount.netAmount,
        percentageVat: item.unitAmount.percentageVat,
      },
    }));

  const handleSelectArticle = async (article: ArticleView) => {
    const articleExists = serviceOrderArticles.filter(
      (item) => item.article.id === article.id,
    );
    if (articleExists.length > 0) {
      setOpenSelectModal(false);
      return;
    }
    let body = getArticleUpdateBody();

    body = [
      ...body,
      {
        articleId: article.id,
        description: article.description,
        name: article.name,
        quantity: 1,
        unitAmount: {
          currency: article.unitSellingAmount.currency,
          netAmount: article.unitSellingAmount.netAmount,
          percentageVat: article.unitSellingAmount.percentageVat,
        },
      },
    ];
    await updateServiceOrderArticles({
      body,
      serviceOrderId: serviceOrderId!,
    });
    setOpenSelectModal(false);
  };

  const deleteArticle = async () => {
    const result = serviceOrderArticles.filter(
      (item) => item.id !== currentArticle?.id,
    );
    const body = result?.map((item) => ({
      articleId: item.article.id,
      description: item.article.description,
      name: item.article.name,
      quantity: item.quantity,
      unitAmount: {
        currency: item.unitAmount.currency,
        netAmount: item.unitAmount.netAmount,
        percentageVat: item.unitAmount.percentageVat,
      },
    }));

    await updateServiceOrderArticles({
      body,
      serviceOrderId: serviceOrderId!,
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
    const body = serviceOrderArticles.map((item) => {
      if (item.article.id !== currentArticle?.article.id) {
        return {
          articleId: item.article.id,
          description: item.article.description,
          name: item.article.name,
          quantity: item.quantity,
          unitAmount: {
            currency: item.unitAmount.currency,
            netAmount: item.unitAmount.netAmount,
            percentageVat: item.unitAmount.percentageVat,
          },
        };
      }

      return {
        articleId: currentArticle!.article.id,
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
      };
    });

    await updateServiceOrderArticles({body, serviceOrderId: serviceOrderId!});
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
        header={<Typography variant="subtitle1">Articles</Typography>}
        showHeaderBackground
        handleAction={() => setOpenSelectModal(true)}
        headerActionIcon={<Typography color="info.main">+ Add</Typography>}>
        {serviceOrderArticles.length === 0 ? (
          renderNoRowsSection()
        ) : (
          <DataGridLayout
            fullHeight={false}
            height={getDataGridHeight(rows.length, 3)}
            hideFooter
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
        content="Do you want to delete this note?"
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
