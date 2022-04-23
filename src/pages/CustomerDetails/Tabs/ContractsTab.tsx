import {
  useContractElevatorCount,
  useUseQueryCustomerContracts,
} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {Order} from 'models/misc';
import {useEffect, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {DataGridLayout} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';

import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {Widget} from 'components/Widget';
import {costRangeConvertor as crConverter} from 'utils/contract-utils';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
import {columns, makeRows} from './CustomerContractDataGrid';

interface Props {
  customerId?: string;
}

export const ContractsTab = ({customerId}: Props) => {
  const [page, setPage] = useState(makePage(0, 10));
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string[]>([]);
  const [contractor, setContractor] = useState<string[]>([]);
  const [cost, setCost] = useState<number[][]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: {total: totalContract} = createEmptyResource<ContractView>(10)} =
    useUseQueryCustomerContracts(
      {
        query: '',
        orderBy: ContractOrderField.EXPIRY_TIME,
        order: Order.ASC,
        pageIndex: 0,
        pageSize: 11,
      },
      customerId,
    );

  const {
    data: contractResource = createEmptyResource<ContractView>(10),
    isLoading,
    isFetched,
  } = useUseQueryCustomerContracts(
    {
      query: search,
      orderBy: ContractOrderField.EXPIRY_TIME,
      order: Order.ASC,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    customerId,
    {expiryDate, contractor, price: cost},
    {keepPreviousData: true},
  );

  const {data: contractWithUnits} = useContractElevatorCount(
    contractResource.data,
    {keepPreviousData: true},
  );

  useEffect(() => {
    const options: string[] = [];

    if (contractWithUnits) {
      // TODO: Resolve 'any' here
      contractWithUnits?.forEach((item: any) => {
        if (
          !options.includes(item.serviceCompany.name) &&
          !contractorFilterItems.includes(item.serviceCompany.name)
        ) {
          options.push(item.serviceCompany.name);
        }
      });
      setRows(makeRows(contractWithUnits));
    } else {
      setRows([]);
    }
    setContractorFilterItems([...contractorFilterItems, ...options]);
    if (!showFilter) {
      setExpiryDate([]);
      setContractor([]);
      setCost([]);
    }
  }, [contractWithUnits, showFilter]);

  useEffect(() => {
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
  }, [contractResource, page.pageSize]);

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems);
    setCost(range);
  };

  if (isFetched && !totalContract) {
    return (
      <EmptySection
        label="No contracts yet. Create a new one to view here"
        showActionBtn
        btnLabel="Add Contract"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  return (
    <PageOverviewLayout
      label=""
      renderWidget={
        <Widget
          searchPlaceholder="Try 'Astralift BV'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
        />
      }>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Expiry Date"
              options={[
                'Last 14 days', // TODO: Create an enum to handle this
                'Today',
                'Next 7 days',
                'Next 14 days',
              ]}
              getSelectedValue={(item) => setExpiryDate(item)}
              multiple={false}
            />

            <MultipleSelectCheckmarks
              label="Contractor"
              options={contractorFilterItems}
              getSelectedValue={(item) => setContractor(item)}
            />

            <MultipleSelectCheckmarks
              label="Cost/year"
              options={[
                'Below 1000 €',
                '1000 - 3000 €',
                '3000 - 5000 €',
                'Above 5000 €',
              ]}
              getSelectedValue={(item) => costRangeConvertor(item)}
              multiple={false}
            />
          </FilterFields>
        </Box>
      </Fade>
      {isLoading ? (
        <Progress />
      ) : (
        <DataGridLayout
          fullHeight={false}
          height={400}
          hideFooter={pageCount <= 1}
          rows={rows}
          columns={columns}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={contractResource.total}
        />
      )}
    </PageOverviewLayout>
  );
};
