import {Box} from '@mui/system';
import {useNavigate} from 'react-router-dom';
import React, {useEffect, useMemo, useRef} from 'react';
import {useQueryState} from 'hooks/useQueryState';
import {
  calculateTotalPages,
  createEmptyResource,
  makePage,
  toggleOrder,
} from 'utils/paging';
import {ELEMENTS_PER_PAGE_OPTIONS, OrderByParams} from 'models/pagination';
import {useQueryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import {aggregateSupplierRow} from 'utils/supplier';
import {useSearchValues} from 'hooks/useSearchValues';
import {
  ArticleSupplierView,
  SUPPLIER_ORDER_FIELD,
  SupplierTableRow,
} from 'models/supplier';
import EmptyTable from 'components/Table/EmptyTable';
import TableHeader from '../../../../components/Table/TableHeader';
import TableContainer from '../../../../components/Table/TableContainer';
import Pagination from '../../../../components/Pagination';
import SearchInput from '../../../../components/SearchInput/index';
import AddButton from '../../../../components/AddButton';
import Cell from '../../../../components/Table/TableCell';
import {Actions} from './Actions';
import TableRow from '../../../../components/Table/TableRow';
import PageHeaderContainer from '../../../../components/PageHeaderContainer';
import TableCellText from '../../../../components/Table/TableCellText';

const Suppliers = () => {
  const navigate = useNavigate();

  const [page, setPage] = useQueryState('employeePage', {
    defaultValue: makePage(0, ELEMENTS_PER_PAGE_OPTIONS[1]),
  });
  const [search, setSearch] = useQueryState('searchSuppliers');
  const textInput = useRef<HTMLInputElement>(null);

  const {values, updateValues} =
    useSearchValues<OrderByParams<SUPPLIER_ORDER_FIELD>>();
  const {sortOrder, orderByField} = values;

  const COLUMNS = useRef<TableColumnWithRender<SupplierTableRow>[]>([
    {
      headerName: 'Number',
      key: 'supplier-cell-number',
      fieldName: SUPPLIER_ORDER_FIELD.EXTERNAL_ID,
      width: '156px',
      isFirst: true, // remove when checkbox are present with bulk action
      renderCell: (supplier, cellProps) => (
        <Cell isFirst {...cellProps}>
          <TableCellText>{supplier.externalId}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Name',
      key: 'supplier-cell-name',
      fieldName: SUPPLIER_ORDER_FIELD.NAME,
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText capitalize>{supplier.name}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Category',
      key: 'supplier-cell-category',
      fieldName: SUPPLIER_ORDER_FIELD.CATEGORY,
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{supplier.category}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'ADDRESS',
      key: 'supplier-cell-address',
      fieldName: SUPPLIER_ORDER_FIELD.ADDRESS,
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{supplier.address}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'PHONE',
      key: 'supplier-cell-phone',
      fieldName: SUPPLIER_ORDER_FIELD.PHONE,
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{supplier.phone}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Email',
      key: 'supplier-cell-email',
      fieldName: SUPPLIER_ORDER_FIELD.EMAIL,
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{supplier.email}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'action',
      key: 'supplier-cell-action',
      isHeaderNameHidden: true,
      width: ACTION_CELL_WIDTH,
      isLast: true,
      align: 'center',
      renderCell: (supplier, cellProps) => (
        <Cell {...cellProps} onClick={undefined}>
          <Actions email={supplier.email} />
        </Cell>
      ),
    },
  ]);

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      page.pageSize,
    ),
    isFetched,
  } = useQueryArticleSuppliers(
    {
      query: search,
      ...page,
      ...(sortOrder && {order: sortOrder}),
      ...(orderByField && {orderBy: orderByField}),
    },
    {keepPreviousData: true},
  );

  const totalPages = useMemo(
    () =>
      calculateTotalPages(
        articleSupplierResource.total,
        articleSupplierResource.page.pageSize,
      ),
    [articleSupplierResource],
  );

  useEffect(() => {
    if (
      articleSupplierResource.total > 0 &&
      articleSupplierResource.data.length === 0
    ) {
      setPage({...page, pageIndex: 0});
    }
  }, [search]);

  const rows = useMemo(
    () => aggregateSupplierRow(articleSupplierResource.data),
    [articleSupplierResource],
  );

  const handleNewSupplierClick = () => {
    navigate('/articles/newSupplier');
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/articles/supplier/${id}`);
  };

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as SUPPLIER_ORDER_FIELD) : undefined,
      sortOrder: order,
    });
  };

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};
    // when the user does not have filters applied and there are no entries for the table
    if (search && articleSupplierResource.total === 0) {
      return {emptyTable: false, noMatchingData: true};
    }

    if (articleSupplierResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [isFetched, articleSupplierResource]);

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="jobs"
        label="No Suppliers"
        subLabel="Add suppliers to process fast article purchases and keep track of your orders"
        btnLabel="New Supplier"
        onClick={handleNewSupplierClick}
      />
    );
  }

  return (
    <Box
      gap={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}>
      <PageHeaderContainer>
        <SearchInput
          refInput={textInput}
          defaultValue={search}
          onChange={(val: string) => setSearch(val)}
        />

        <AddButton label="New Supplier" onClick={handleNewSupplierClick} />
      </PageHeaderContainer>

      <TableContainer showNoMatchWarning={noMatchingData}>
        <TableHeader
          columns={COLUMNS.current}
          sortState={{columnName: orderByField, order: sortOrder}}
          onSort={handleSortField}
        />
        {/* Row */}
        {rows.map((entry) => (
          <TableRow
            key={`supplier-row-${entry.id}`}
            testId={`supplier-row-${entry.id}`}>
            {COLUMNS.current.map(({renderCell, ...rest}) =>
              renderCell(entry, {
                onClick: handleRowClick(entry.id),
                ...rest,
              }),
            )}
          </TableRow>
        ))}
      </TableContainer>

      <Pagination
        currentIndex={articleSupplierResource.page.pageIndex}
        numberOfElementsPerPage={articleSupplierResource.page.pageSize}
        totalEntries={articleSupplierResource.total}
        totalPages={totalPages}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </Box>
  );
};

export default Suppliers;
