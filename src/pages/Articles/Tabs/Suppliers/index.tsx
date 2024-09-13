import {Box} from '@mui/system';
import {useNavigate} from 'react-router-dom';
import React, {useEffect, useMemo, useRef} from 'react';
import SearchInput from '../../../../components/SearchInput/index';
import AddButton from '../../../../components/AddButton';
import {useQueryState} from '../../../../hooks/useQueryState';
import {
  calculateTotalPages,
  createEmptyResource,
  makePage,
  toggleOrder,
} from '../../../../utils/paging';
import {
  ELEMENTS_PER_PAGE_OPTIONS,
  OrderByParams,
} from '../../../../models/pagination';
import Pagination from '../../../../components/Pagination';
import TableContainer from '../../../../components/Table/TableContainer';
import TableHeader from '../../../../components/Table/TableHeader';
import {useQueryArticleSuppliers} from '../../../../hooks/reactQuery/useArticle';
import {
  ACTION_CELL_WIDTH,
  TableColumnWithRender,
} from '../../../../models/table';
import {aggregateSupplierRow} from '../../../../utils/supplier';
import {useSearchValues} from '../../../../hooks/useSearchValues';
import {
  ArticleSupplierView,
  SUPPLIER_ORDER_FIELD,
  SupplierTableRow,
} from '../../../../models/supplier';
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
      fieldName: SUPPLIER_ORDER_FIELD.EXTERNAL_ID,
      width: '15%',
      isFirst: true, // remove when checkbox are present with bulk action
      renderCell: (supplier, cellProps) => (
        <Cell isFirst width="15%" onClick={cellProps.onClick}>
          <TableCellText>{supplier.externalId}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Name',
      width: '10%',
      fieldName: SUPPLIER_ORDER_FIELD.NAME,
      renderCell: (supplier, cellProps) => (
        <Cell width="10%" onClick={cellProps.onClick}>
          <TableCellText capitalize>{supplier.name}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Category',
      width: '20%',
      fieldName: SUPPLIER_ORDER_FIELD.CATEGORY,
      renderCell: (supplier, cellProps) => (
        <Cell width="20%" onClick={cellProps.onClick}>
          <TableCellText>{supplier.category}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'ADDRESS',
      width: '20%',
      fieldName: SUPPLIER_ORDER_FIELD.ADDRESS,
      renderCell: (supplier, cellProps) => (
        <Cell width="20%" onClick={cellProps.onClick}>
          <TableCellText>{supplier.address}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'PHONE',
      width: '10%',
      fieldName: SUPPLIER_ORDER_FIELD.PHONE,
      renderCell: (supplier, cellProps) => (
        <Cell width="10%" onClick={cellProps.onClick}>
          <TableCellText>{supplier.phone}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Email',
      width: '10%',
      fieldName: SUPPLIER_ORDER_FIELD.EMAIL,
      renderCell: (supplier, cellProps) => (
        <Cell width="10%" onClick={cellProps.onClick}>
          <TableCellText>{supplier.email}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'action',
      isHeaderNameHidden: true,
      width: ACTION_CELL_WIDTH,
      renderCell: (supplier) => (
        <Cell isLast width={ACTION_CELL_WIDTH}>
          <Actions email={supplier.email} />
        </Cell>
      ),
    },
  ]);

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      page.pageSize,
    ),
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

  // navigateTo: `/articles/supplier/${item.id}`,

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
          onChanged={(val: string) => setSearch(val)}
          refInput={textInput}
          defaultValue={search}
        />

        <AddButton label="New Supplier" onClick={handleNewSupplierClick} />
      </PageHeaderContainer>

      <TableContainer>
        <TableHeader
          columns={COLUMNS.current}
          sortState={{columnName: orderByField, order: sortOrder}}
          onSort={handleSortField}
        />
        {/* Row */}
        {rows.map((entry) => (
          <TableRow
            key={`supplier-row-${entry.id}`}
            testId="supplier-row-container">
            {COLUMNS.current.map((column) =>
              column.renderCell(entry, {
                onClick: handleRowClick(entry.id),
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
