import {useEffect, useMemo, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {createEmptyResource, makePage} from 'utils/paging';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {convertToMacro, convertToText, objectKeyByValue} from 'utils/utils';
import {useNavigate} from 'react-router-dom';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {PriceRangeDropdown} from 'components/PriceRangeDropdown';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {
  costRangeConvertor as crConverter,
  getStartEndPrice,
} from 'utils/contract';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useSearchValues} from 'hooks/useSearchValues';
import {columns, makeRows} from './ContractsDataGridProps';
import {Order, OrderByParams} from '../../models/pagination';

const pageSize = 25;

export const Contracts = () => {
  const currentCurrency = useCurrentCurrency();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchContracts');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const totalContractRef = useRef(0);
  const [status, setStatus] = useQueryState<string[]>('status', {
    defaultValue: [],
  });
  const [cost, setCost] = useQueryState<number[][]>('cost', {defaultValue: []});
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);
  const textInput = useRef<HTMLInputElement>(null);
  const statusMapping: Record<string, string> = {
    Active: 'VALID',
    Inactive: 'EXPIRED',
    Expiring: 'EXPIRING',
  };

  const {values, clearValues} =
    useSearchValues<OrderByParams<ContractOrderField>>();
  const {sortOrder, orderByField} = values;

  const [priceStart, priceEnd] = useMemo(() => getStartEndPrice(cost), [cost]);

  const {
    data: contractResource = createEmptyResource<ContractView>(10),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useQueryContract(
    {
      pageIndex: page.pageIndex || 0,
      pageSize: page.pageSize || 25,
      query: search,
      status,
      order: sortOrder || Order.DESC,
      orderBy: orderByField || ContractOrderField.CREATED_TIME,
      ...(cost.length && {priceStart, priceEnd}),
    },
    {keepPreviousData: true},
  );

  totalContractRef.current = totalContractRef.current || contractResource.total;

  useEffect(() => {
    if (contractResource.total > 0 && contractResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, cost, status, contractResource]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    if (textInput.current) {
      textInput.current.value = search ?? '';
    }
  }, [search]);

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

      const companyCurrencies =
        user?.userAccount.serviceCompany.settings.currencies || [];
      const companyCurrencyCode = companyCurrencies[0]
        ? companyCurrencies[0]?.code
        : 'EUR';

      setRows(
        makeRows(
          contractResource.data,
          companyCurrencyCode,
          currentCurrency.fractionDigits ?? 0,
          formatDate,
        ),
      );
      setContractorFilterItems([...contractorFilterItems, ...options]);
    }
  }, [contractResource, isLoading, isFetching, isIdle]);

  useEffect(() => {
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
  }, [contractResource, pageSize]);

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
    <FilterFields onClear={clearValues} clearText="Clear all">
      <PriceRangeDropdown cost={cost} costRangeConvertor={costRangeConvertor} />
      <MultipleSelectCheckmarks
        label="Status"
        options={['ACTIVE', 'INACTIVE', 'EXPIRING'].map((item) =>
          convertToText(item),
        )}
        initialSelectedItems={status.map((item) =>
          objectKeyByValue(statusMapping, item),
        )}
        getSelectedValue={(item) =>
          setStatus(item.map((val) => convertToMacro(statusMapping[val])))
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
          width="28rem"
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
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={contractResource?.total}
      />
    </PageListingLayout>
  );
};

export default Contracts;
