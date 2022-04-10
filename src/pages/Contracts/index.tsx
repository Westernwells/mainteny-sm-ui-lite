import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {
  useContractElevatorCount,
  useQueryContract,
} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {Order} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {Widget} from 'components/Widget';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {CustomPagination} from 'components/CustomPagination';
import {costRangeConvertor as crConverter} from 'utils/contract-utils';
import {columns, makeRows} from './ContractsDataGridProps';

const pageSize = 25;

export const Contracts = () => {
  const [search, setSearch] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [showFilter, setShowFilter] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string[]>([]);
  const [contractor, setContractor] = useState<string[]>([]);
  const [cost, setCost] = useState<number[][]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: contractResource = createEmptyResource<ContractView>(page.pageSize),
  } = useQueryContract(
    {
      order: Order.DESC,
      orderBy: ContractOrderField.CREATED_TIME,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: [],
    },
    {expiryDate, contractor, price: cost},
    {keepPreviousData: true},
  );
  const {data: contractWithUnits} = useContractElevatorCount(
    contractResource.data,
  );

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems);
    setCost(range);
  };

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

  return (
    <PageOverviewLayout
      label="Contracts"
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
      <>
        <DataGridLayout hideFooter rows={rows} columns={columns} />
        {pageCount && page.pageSize < contractResource.total ? (
          <CustomPagination
            pageSize={page.pageSize}
            pageIndex={page.pageIndex}
            handlePageSizeChange={(newPageSize: number) =>
              setQueryParams(
                formatSearchParamsPageSize(newPageSize, queryParams),
              )
            }
            handlePageChange={(newPage: number) =>
              setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
            }
            pageCount={pageCount}
            totalRows={contractResource.total}
          />
        ) : null}
      </>
    </PageOverviewLayout>
  );
};
