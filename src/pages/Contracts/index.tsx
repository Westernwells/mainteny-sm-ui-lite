import {useEffect, useMemo, useRef, useState} from 'react';
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
  convertToMacro,
  convertToText,
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {PriceRangeDropdown} from 'components/PriceRangeDropdown';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {
  costRangeConvertor as crConverter,
  getStartEndPrice,
} from 'utils/contract-utils';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {columns, makeRows} from './ContractsDataGridProps';

const pageSize = 25;

export const Contracts = () => {
  const currentCurrency = useCurrentCurrency();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchContracts');
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(makePage(0, pageSize));
  const totalContractRef = useRef(0);
  const [status, setStatus] = useState<string[]>([]);
  const [cost, setCost] = useState<number[][]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);
  const textInput = useRef<HTMLInputElement>(null);

  const [priceStart, priceEnd] = useMemo(() => getStartEndPrice(cost), [cost]);

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
      pageIndex: page.pageIndex || 0,
      pageSize: page.pageSize || 25,
      query: search,
      status,
      priceStart,
      priceEnd,
    },
    {keepPreviousData: true},
  );

  totalContractRef.current = totalContractRef.current || contractResource.total;

  useEffect(() => {
    if (page.pageIndex) {
      setQueryParams(formatSearchParamsPageIndex(1, queryParams));
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, cost, status]);

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
    const range = crConverter(selectedItems, currentCurrency.symbol);
    setCost(range);
  };

  useEffect(() => {
    const options: string[] = [];

    if (!isLoading && !isFetching && !isIdle) {
      contractResource.data.forEach(() => {
        if (
          !options.includes(user?.userAccount.serviceCompany.name!) &&
          !contractorFilterItems.includes(
            user?.userAccount.serviceCompany.name!,
          )
        ) {
          options.push(user?.userAccount.serviceCompany.name!);
        }
      });
      setRows(makeRows(contractResource.data, formatDate));
      setContractorFilterItems([...contractorFilterItems, ...options]);
    }
  }, [contractResource, isLoading, isFetching, isIdle]);

  useEffect(() => {
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
  }, [contractResource, page.pageSize]);

  if (isFetched && !totalContractRef.current) {
    return (
      <EmptySection
        label="No contracts yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Contract"
        btnAction={() => navigate('/contracts/new')}
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
        setStatus([]);
        setCost([]);
        setSearch('');
        if (textInput.current) {
          textInput.current.value = '';
        }
      }}>
      <PriceRangeDropdown cost={cost} costRangeConvertor={costRangeConvertor} />
      <MultipleSelectCheckmarks
        label="Status"
        options={['VALID', 'EXPIRED'].map((item) => convertToText(item))}
        initialSelectedItems={status}
        getSelectedValue={(item) =>
          setStatus(item.map((val) => convertToMacro(val)))
        }
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
          refInput={textInput}
          btnLabel="New Contract"
          btnOnClick={() => navigate('/contracts/new')}
          showActionBtn
        />
      }>
      <DataGridLayout
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

export default Contracts;
