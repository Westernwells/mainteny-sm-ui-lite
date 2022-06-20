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

interface Props {
  containerStyles?: {[key: string]: any};
  serviceOrderArticles?: ServiceOrderArticleView[];
}

export const Articles = ({serviceOrderArticles}: Props) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [articles, setArticles] = useState<ServiceOrderArticleView[]>(
    serviceOrderArticles ? serviceOrderArticles : [],
  );
  const [showAll, setShowAll] = useState(false);

  // useEffect(() => {
  //   setArticles(serviceOrderArticles || []);
  // }, [serviceOrderArticles]);

  useEffect(() => {
    setRows(makeRows(articles));
  }, [articles]);

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
    <InfoCard
      header={<Typography variant="subtitle1">Articles</Typography>}
      showHeaderBackground
      handleAction={() => {}}
      headerActionIcon={<Typography color="info.main">+ Add</Typography>}>
      {articles.length === 0 ? (
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
  );
};
