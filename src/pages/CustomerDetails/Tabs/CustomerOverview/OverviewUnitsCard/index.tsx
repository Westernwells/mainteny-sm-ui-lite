import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {useEffect, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {columns, makeRows} from './UnitCardDataGridProps';

interface Props {
  customerId?: string;
  query: string;
  getTotalUnits?: (val: number) => void;
}

export const OverviewUnitsCard = ({
  customerId,
  query,
  getTotalUnits,
}: Props) => {
  const [page] = useState(makePage(0, 3));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: elevatorResource = createEmptyResource<ElevatorView>(3)} =
    useQueryCustomerElevator(
      {
        query,
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
      },
      {},
      customerId,
    );

  useEffect(() => {
    setRows(makeRows(elevatorResource));
    if (getTotalUnits) {
      getTotalUnits(elevatorResource.total);
    }
  }, [elevatorResource]);

  return (
    <Box>
      <DataGridLayout
        fullHeight={false}
        height={230}
        hideFooter
        rows={rows}
        columns={columns}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
    </Box>
  );
};
