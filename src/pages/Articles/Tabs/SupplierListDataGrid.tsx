import React, {useEffect, useRef, useState} from 'react';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {IconButton} from '@mui/material';
import Email from '@mui/icons-material/Email';
import {useNavigate} from 'react-router-dom';
import _ from 'lodash';
import {ArticleSupplierView, SupplierOrderField} from 'models/article';
import {createEmptyResource, makePage} from 'utils/paging';
import {useQueryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {useQueryState} from 'hooks/useQueryState';
import {Progress} from 'components/Progress';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Widget} from 'components/Widget';
import {PageListingLayout} from 'components/PageListingLayout';
import {useSearchValues} from 'hooks/useSearchValues';
import {OrderByParams} from 'models/misc';

export const columns: GridColDef[] = [
  getColumnProps({
    field: SupplierOrderField.EXTERNAL_ID,
    sortable: true,
    headerName: 'supplier id',
  }),
  getColumnProps({
    field: SupplierOrderField.NAME,
    sortable: true,
    headerName: 'name',
  }),
  getColumnProps({
    field: SupplierOrderField.CATEGORY,
    sortable: true,
    headerName: 'category',
  }),
  getColumnProps({
    field: SupplierOrderField.ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: SupplierOrderField.PHONE,
    sortable: true,
    headerName: 'phone number',
    flex: 1.5,
  }),
  getColumnProps({
    field: SupplierOrderField.EMAIL,
    sortable: true,
    headerName: 'email address',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'item',
    headerName: '',
    align: 'center',
    renderCell: (params) => (
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${params.value.contact.email}`, '_blank');
        }}>
        <Email sx={{color: 'action.active'}} />
      </IconButton>
    ),
    flex: 0,
  }),
];

export const makeRows = (
  articleSuppliers: ArticleSupplierView[],
): GridRowsProp =>
  _.map(articleSuppliers, (item, index) => ({
    id: index,
    [SupplierOrderField.EXTERNAL_ID]: item.externalId,
    [SupplierOrderField.NAME]: item.name,
    [SupplierOrderField.CATEGORY]: item.category,
    [SupplierOrderField.ADDRESS]: item.address?.fullName ?? '',
    [SupplierOrderField.PHONE]: item.contact.phone,
    [SupplierOrderField.EMAIL]: item.contact.email,
    navigateTo: `/articles/supplier/${item.id}`,
    item,
  }));

const pageSize = 25;

export const SupplierListDataGrid = () => {
  const navigate = useNavigate();
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useQueryState('query');
  const textInput = useRef<HTMLInputElement>(null);

  const {values} = useSearchValues<OrderByParams<SupplierOrderField>>();
  const {sortOrder, orderByField} = values;

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      pageSize,
    ),
    isIdle,
    isLoading,
    isFetching,
  } = useQueryArticleSuppliers(
    {
      query,
      ...page,
      ...(sortOrder && {order: sortOrder}),
      ...(orderByField && {orderBy: orderByField}),
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    if (
      articleSupplierResource.total > 0 &&
      articleSupplierResource.data.length === 0
    ) {
      setPage({...page, pageIndex: 0});
    }
  }, [query]);

  useEffect(() => {
    setPageCount(Math.ceil(articleSupplierResource.total / page.pageSize));
  }, [page.pageSize, articleSupplierResource]);

  useEffect(() => {
    if (!isIdle && !isLoading) {
      setRows(makeRows(articleSupplierResource.data));
    }
  }, [articleSupplierResource]);

  if (isIdle || isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress />
      </Box>
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search"
          getSearchValue={setQuery}
          refInput={textInput}
          defaultSearchValue={query}
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        noRowsEmptySection={
          <EmptySection
            label="No suppliers yet. Please click the button below to add!"
            showActionBtn
            btnLabel="Add Supplier"
            containerStyle={{
              height: '100%',
              mb: '10em',
            }}
            btnAction={() => navigate('/articles/newSupplier')}
          />
        }
        loading={isFetching}
        scrollToTop={query}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        pageCount={pageCount}
        handlePageChange={(value) =>
          setPage({
            ...page,
            pageIndex: value - 1,
          })
        }
        containerStyle={{
          py: 1.5,
        }}
      />
    </PageListingLayout>
  );
};
