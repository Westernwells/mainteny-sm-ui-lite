/* eslint-disable */
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {ContractSimpleView} from 'models/contract';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import {ServiceOrderArticleView} from 'models/service-order';
import {columns, makeRows} from './ArticleDataGridProps';
import {EmptySection} from 'components/EmptySection';
import Box from '@mui/material/Box';
import {SelectModal} from 'components/SelectModal';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {ArticleView} from 'models/article';
import {useUpdateServiceOrderArticles} from 'hooks/reactQuery/useArticle';
import {Progress} from 'components/Progress';

interface Props {
  containerStyles?: {[key: string]: any};
  serviceOrderArticles?: ServiceOrderArticleView[];
  serviceOrderId?: string;
}

export const Articles = ({
  serviceOrderArticles = [],
  serviceOrderId,
}: Props) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openModal, setOpenModal] = useState(false);
  const {mutateAsync: updateServiceOrderArticles, isLoading} =
    useUpdateServiceOrderArticles('Article added successfully');
  // const [articles, setArticles] = useState<ServiceOrderArticleView[]>(
  //   serviceOrderArticles ? serviceOrderArticles : [],
  // );

  const loading = true;

  useEffect(() => {
    setRows(makeRows(serviceOrderArticles));
  }, [serviceOrderArticles]);

  const handleSelectArticle = async (article: ArticleView) => {
    let body = serviceOrderArticles?.map((item) => ({
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
    setOpenModal(false);
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
        handleAction={() => setOpenModal(true)}
        headerActionIcon={<Typography color="info.main">+ Add</Typography>}>
        {serviceOrderArticles.length === 0 ? (
          renderNoRowsSection()
        ) : (
          <DataGridLayout
            fullHeight={false}
            height={getDataGridHeight(rows.length, 3)}
            hideFooter
            rows={rows}
            columns={columns}
            containerStyle={{
              borderBottom: 'none',
            }}
          />
        )}
      </InfoCard>

      <SelectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
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
