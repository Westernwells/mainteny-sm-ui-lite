import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';
import {Widget} from 'components/Widget';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  columns,
  makeRows,
} from 'pages/CustomerDetails/Tabs/CustomerUnitDataGrid';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';

export const UnitsTab = () => {
  const [search, setSearch] = useState('');
  const [page] = useState(makePage(0, 25)); // TODO: implement paging
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: elevator = createEmptyResource<ElevatorView>(10)} =
    useAllElevators(search, page, {
      status: [],
    });

  useEffect(() => {
    if (elevator.data) {
      setRows(makeRows(elevator));
    } else {
      setRows([]);
    }
  }, [elevator]);

  return (
    <>
      <Box display="flex" justifyContent="end" maxWidth="100%">
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Widget
            searchPlaceholder="Search order type, customer, address"
            getSearchValue={(val: string) => setSearch(val)}
            filterItems={null}
          />
        </Box>
      </Box>

      <DataGridLayout rows={rows} columns={columns} pageSize={page.pageSize} />
    </>
  );
};
