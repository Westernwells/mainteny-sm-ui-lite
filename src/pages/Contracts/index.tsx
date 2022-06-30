import {useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {Order} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {costRangeConvertor as crConverter} from 'utils/contract-utils';
import {columns, makeRows} from './ContractsDataGridProps';

const pageSize = 25;

export const Contracts = () => {
  const [search, setSearch] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(makePage(0, pageSize));
  const totalContractRef = useRef(0);
  const [expiryDate, setExpiryDate] = useState<string[]>([]);
  const [contractor, setContractor] = useState<string[]>([]);
  const [cost, setCost] = useState<number[][]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: contractResource = createEmptyResource<ContractView>(10),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
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

  totalContractRef.current = totalContractRef.current || contractResource.total;

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    if (currentParams.pageSize)
      setPage({
        ...page,
        pageSize: Number(currentParams.pageSize),
      });
    if (currentParams.pageIndex)
      setPage({
        ...page,
        pageIndex: Number(currentParams.pageIndex) - 1,
      });
  }, [queryParams]);

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems);
    setCost(range);
  };

  useEffect(() => {
    const options: string[] = [];
    // TODO: Resolve 'any' here
    contractResource.data.forEach((item: any) => {
      if (
        !options.includes(item.serviceCompany.name) &&
        !contractorFilterItems.includes(item.serviceCompany.name)
      ) {
        options.push(item.serviceCompany.name);
      }
    });
    if (!isLoading) {
      setRows(makeRows(contractResource.data));
    }

    setContractorFilterItems([...contractorFilterItems, ...options]);
  }, [contractResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
  }, [contractResource, page.pageSize]);

  if (isFetched && !totalContractRef.current) {
    return (
      <EmptySection
        label="No contracts have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Contract"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setExpiryDate([]);
        setContractor([]);
        setCost([]);
      }}>
      <MultipleSelectCheckmarks
        label="Expiry Date"
        options={['Last 14 days', 'Today', 'Next 7 days', 'Next 14 days']}
        initialSelectedItems={expiryDate}
        getSelectedValue={(item) => setExpiryDate(item)}
        multiple={false}
      />

      <MultipleSelectCheckmarks
        label="Contractor"
        options={contractorFilterItems}
        initialSelectedItems={contractor}
        getSelectedValue={(item) => setContractor(item)}
      />

      <MultipleSelectCheckmarks
        label="Cost/Year"
        options={['Below 1000€', '1000 - 3000€', '3000 - 5000€', 'Above 5000€']}
        initialSelectedItems={cost}
        getSelectedValue={(item) => costRangeConvertor(item)}
        multiple={false}
      />
    </FilterFields>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, customer, contract type etc."
          getSearchValue={(val: string) => setSearch(val)}
          filterItems={renderFilterItems()}
        />
      }>
      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        scrollToTop={search}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={contractResource.total}
      />
    </PageListingLayout>
  );
};
