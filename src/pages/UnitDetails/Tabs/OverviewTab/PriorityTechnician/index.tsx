import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {technicians} from './data';
import {columns, makeRows} from './PriorityTechnicianDataGridProps';

interface Props {
  containerStyles?: {[key: string]: any};
}

export const PriorityTechnician = ({containerStyles}: Props) => {
  const theme = useTheme();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setRows(makeRows(!showAll ? technicians.slice(0, 3) : technicians));
  }, [technicians]);

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={
        <Typography variant="subtitle1">Priority Technicians</Typography>
      }
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
      <DataGridLayout
        fullHeight={false}
        height={200}
        hideFooter
        rows={rows}
        columns={columns}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
      {technicians.length > 3 ? (
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
