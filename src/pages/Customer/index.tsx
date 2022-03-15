import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {Widget} from '../../components/Widget';
import {data as customers} from './data';
import {columns, makeRows} from './CustomerDataGridProps';

export const Customer = () => {
  const [_search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  console.log(_search);
  useEffect(() => {
    if (customers) {
      setRows(makeRows(customers));
    } else {
      setRows([]);
    }
  }, [customers]);

  return (
    <PageOverviewLayout
      label="Customers"
      renderWidget={
        <Widget
          searchPlaceholder="Try 'Astralift BV'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
          hideViewOption
          hideFilter
        />
      }>
      <DataGridLayout rows={rows} columns={columns} />
    </PageOverviewLayout>
  );
};
