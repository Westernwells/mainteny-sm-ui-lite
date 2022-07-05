import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';

import {useUseQueryCustomerContracts} from 'hooks/reactQuery/useContract';
import {
  ContractOrderField,
  ContractStatus,
  ContractView,
} from 'models/contract';
import {Order} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {DataGridLayout} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {TabContentContainer} from 'components/TabContentContainer';
import {
  costRangeConvertor as crConverter,
  getStartEndPrice,
} from 'utils/contract-utils';
import {EmptySection} from 'components/EmptySection';
import {convertToMacro, convertToText} from 'utils/utils';
import {Widget} from 'components/Widget';
import {columns, makeRows} from './CustomerContractDataGrid';

interface Props {
  customerId?: string;
}

export const ContractsTab = ({customerId}: Props) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(makePage(0, 10));
  const totalContractsRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cost, setCost] = useState<number[][]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [contractorFilterItems, setContractorFilterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);

  const [priceStart, priceEnd] = useMemo(() => getStartEndPrice(cost), [cost]);

  const {
    data: contractResource = createEmptyResource<ContractView>(10),
    isLoading,
    isFetching,
    isFetched,
  } = useUseQueryCustomerContracts(
    {
      query: searchQuery,
      orderBy: ContractOrderField.EXPIRY_TIME,
      order: Order.ASC,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      priceStart,
      priceEnd,
    },
    customerId,
    {},
    {keepPreviousData: true},
  );

  totalContractsRef.current =
    totalContractsRef.current || contractResource.total;

  useEffect(() => {
    const options: string[] = [];
    if (!isLoading) {
      contractResource.data.forEach((item: any) => {
        if (
          !options.includes(item.serviceCompany.name) &&
          !contractorFilterItems.includes(item.serviceCompany.name)
        ) {
          options.push(item.serviceCompany.name);
        }
      });
      setRows(makeRows(contractResource.data));
    }
    setContractorFilterItems([...contractorFilterItems, ...options]);
  }, [contractResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
  }, [contractResource, page.pageSize]);

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems);
    setCost(range);
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setStatus([]);
        setCost([]);
      }}>
      <MultipleSelectCheckmarks
        label="Price Range"
        options={['0 - €500', '€500 - €1,000', '> €1,000']}
        initialSelectedItems={cost}
        getSelectedValue={(item) => costRangeConvertor(item)}
      />
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.keys(ContractStatus).map((item) => convertToText(item))}
        initialSelectedItems={status}
        getSelectedValue={(item) =>
          setStatus(item.map((val) => convertToMacro(val)))
        }
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box>
      <Widget
        searchPlaceholder="Search by number, customer, contract type etc."
        getSearchValue={(search) => setSearchQuery(search)}
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  if (isFetched && !totalContractsRef.current) {
    return (
      <EmptySection
        label="No contracts yet. Create a new one to view here"
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

  return (
    <TabContentContainer>
      {renderWidget()}
      {isLoading ? (
        <Progress />
      ) : (
        <DataGridLayout
          hideFooter={pageCount <= 1}
          rows={rows}
          columns={columns}
          loading={isFetching}
          scrollToTop={searchQuery}
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
    </TabContentContainer>
  );
};
