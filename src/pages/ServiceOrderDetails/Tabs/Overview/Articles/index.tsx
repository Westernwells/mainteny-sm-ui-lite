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
import {ArticleView, ServiceOrderArticleRecord} from 'models/article';
import {Progress} from 'components/Progress';
import {
  useCreateServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {calculateOrderArticlesTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
import {columns, makeRows} from './ArticleDataGridProps';

interface Props {
  serviceOrderArticles: ServiceOrderArticleView[] | undefined;
  serviceOrderId?: string;
}

export const Articles = ({serviceOrderArticles, serviceOrderId}: Props) => {
  const {t} = useTranslation();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openSelectModal, setOpenSelectModal] = useState(false);

  const {mutateAsync: createServiceOrderArticle} =
    useCreateServiceOrderArticle();

  const {isLoading} = useNewUpdateServiceOrderArticles();

  useEffect(() => {
    setRows(makeRows(serviceOrderArticles || []));
  }, [serviceOrderArticles]);

  const handleSelectArticle = async (article: ArticleView) => {
    const body: ServiceOrderArticleRecord = {
      articleId: article.id,
      article: {
        id: article.id,
        name: article.name,
        externalId: article.externalId,
        type: article.type,
        unit: article.unit,
        costPackage: article.costPackage!,
        unitSellingAmount: article.unitSellingAmount,
      },
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
        footer={
          serviceOrderArticles &&
          serviceOrderArticles?.length !== 0 && (
            <InfoCardTotalSumFooter
              label={t('Total Sum (excl. VAT)')}
              amount={
                serviceOrderArticles &&
                calculateOrderArticlesTotal(serviceOrderArticles)
              }
            />
          )
        }
        header={
          <Typography variant="subtitle1">
            {t('Articles & Spare parts')}
          </Typography>
        }
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
            height={getDataGridHeight(rows.length, rows.length, 70)}
            rows={rows}
            columns={columns}
            containerStyle={{
              borderBottom: 'none',
            }}
            isWidget
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
    </>
  );
};
