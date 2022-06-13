import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {ContractSimpleView} from 'models/contract';
import {getDataGridHeight} from 'utils/utils';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {columns, makeRows} from './UnitsContractDataGridProps';

interface Props {
  containerStyles?: {[key: string]: any};
  contracts: ContractSimpleView[];
}

export const UnitContracts = ({containerStyles, contracts}: Props) => {
  const theme = useTheme();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setRows(makeRows(!showAll ? contracts.slice(0, 3) : contracts));
  }, [contracts]);

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={
        <Typography variant="subtitle1">Related Contracts</Typography>
      }
      headerStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
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
      {contracts.length > 3 ? (
        <Box
          sx={{textAlign: 'center', cursor: 'pointer'}}
          onClick={() => setShowAll(!showAll)}>
          <Typography variant="caption" color={theme.palette.info.main}>
            {showAll ? 'see less' : 'see more'}
          </Typography>
        </Box>
      ) : null}
    </PageCard>
  );
};
