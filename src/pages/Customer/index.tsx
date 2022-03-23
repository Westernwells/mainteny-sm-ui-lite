import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PropertyOwner} from 'models/propertyManager';
import {
  useQueryCustomers,
  useQueryCustomertElevatorNumbers,
} from 'hooks/reactQuery/useCustomers';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

export const Customer = () => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [page] = useState(makePage(0, 10));
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {data: customerResource = createEmptyResource<PropertyOwner>(10)} =
    useQueryCustomers({
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    });

  const {data: customersWithUnits} = useQueryCustomertElevatorNumbers(
    customerResource.data,
  );

  useEffect(() => {
    if (customersWithUnits) {
      setRows(makeRows(customersWithUnits));
    } else {
      setRows([]);
    }
  }, [customersWithUnits]);

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
