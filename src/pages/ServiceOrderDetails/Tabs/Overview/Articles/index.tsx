/* eslint-disable */
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useState} from 'react';
import {ContractSimpleView} from 'models/contract';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import {columns, makeRows} from './ArticleDataGridProps';

interface Props {
  containerStyles?: {[key: string]: any};
  contracts: ContractSimpleView[];
}

export const Articles = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showAll, setShowAll] = useState(false);

  // useEffect(() => {
  //   setRows(makeRows(!showAll ? contracts.slice(0, 3) : contracts));
  // }, [contracts]);

  return (
    <InfoCard
      header={<Typography variant="subtitle1">Articles</Typography>}
      showHeaderBackground>
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
      {/* {contracts.length > 3 ? (
        <Box
          sx={{textAlign: 'center', cursor: 'pointer'}}
          onClick={() => setShowAll(!showAll)}>
          <Typography variant="caption" color={theme.palette.info.main}>
            {showAll ? 'see less' : 'see more'}
          </Typography>
        </Box>
      ) : null} */}
    </InfoCard>
  );
};
