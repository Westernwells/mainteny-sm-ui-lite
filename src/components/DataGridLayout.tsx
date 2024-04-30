import {useCallback, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridEventListener,
  GridEvents,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridSortDirection,
  GridSortModel,
} from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import {SxProps, Theme} from '@mui/system';
import {useNavigate} from 'react-router-dom';
import {olStyles} from 'styles';
import {convertToText} from 'utils/utils';
import {useQueryState} from 'hooks/useQueryState';
import {Order} from 'models/misc';
import {CustomPagination} from './CustomPagination';
import {EmptySection} from './EmptySection';

interface Props extends DataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  height?: string | number;
  containerStyle?: SxProps<Theme>;
  loading?: boolean;
  onCellClick?: GridEventListener<GridEvents.cellClick>;
  pageSize?: number;
  pageIndex?: number;
  handlePageSizeChange?: (pageSize: number) => any;
  handlePageChange?: (pageSize: number) => any;
  pageCount?: number;
  totalRows?: number;
  fullHeight?: boolean;
  noRowsEmptySection?: JSX.Element;
  noResultsEmptySection?: JSX.Element;
  noResultsCondition?: boolean;
  isRowSelectable?: (params: GridRowParams) => boolean;
  isCellClickable?: boolean;
  checkboxSelection?: boolean;
  isWidget?: boolean;
  headerHeight?: number;
  scrollToTop?: any;
  isEvenRowDifferentColor?: boolean;
  lastSyncedText?: string;
}

interface ColumnProps extends GridColDef {
  field: string;
  headerName: string;
  type?: 'string' | 'number';
  cellClassName?: 'nowrap' | 'truncateText';
  variant?: 'uppercase' | 'titleCase' | 'noFormat';
}

export const getColumnProps = ({
  field,
  headerName,
  type = 'string',
  cellClassName = 'nowrap',
  variant = 'uppercase',
  flex = 1,
  align = 'left',
  editable = false,
  sortable = false,
  renderHeader = () => {
    const {t} = useTranslation();
    return (
      <Typography
        variant="subtitle2"
        color="textSecondary"
        sx={
          align === 'right'
            ? {
                width: '100% !important',
                display: 'flex',
                justifyContent: 'flex-end',
              }
            : {}
        }>
        {variant === 'noFormat'
          ? t(headerName)
          : variant === 'titleCase'
          ? t(convertToText(headerName))
          : t(headerName).toUpperCase()}
      </Typography>
    );
  },
  renderCell = (params: GridRenderCellParams<any, any, any>) => {
    const {t} = useTranslation();
    return (
      <Typography variant="body2">
        {params.value
          ? typeof params.value === 'string'
            ? t(params.value)
            : params.value
          : '-'}
      </Typography>
    );
  },
  ...rest
}: ColumnProps): GridColDef => ({
  field,
  type,
  headerName,
  cellClassName,
  renderHeader,
  renderCell,
  flex,
  headerAlign: align,
  align,
  editable,
  sortable,
  ...rest,
});

export const DataGridLayout = ({
  rows,
  columns,
  height,
  containerStyle,
  loading,
  onCellClick,
  pageSize,
  pageIndex,
  handlePageSizeChange = (n: number) => n,
  handlePageChange = (n: number) => n,
  pageCount,
  totalRows,
  fullHeight = true,
  noRowsEmptySection,
  isRowSelectable,
  noResultsEmptySection,
  noResultsCondition = false,
  isCellClickable = true,
  checkboxSelection = false,
  disableSelectionOnClick = true,
  onRowClick = () => {},
  selectionModel,
  isWidget = false,
  headerHeight,
  scrollToTop,
  lastSyncedText,
  isEvenRowDifferentColor,
  ...rest
}: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const gridRef = useRef<any>();

  const [sortOrder, setSortOrder] = useQueryState<Order | undefined | null>(
    'sortOrder',
  );
  const [orderByField, setOrderByField] = useQueryState<string>('orderByField');

  const rowClassNames: any[string] = [];
  rows.forEach((item) => {
    if (item.showHeader) {
      rowClassNames[`& .MuiDataGrid-rowHeading-${item.id}`] = {
        '&::before': {
          content: `"${item.headerText}"`,
        },
      };
    }
  });

  const handleSortModelChange = useCallback(
    (sortingFields: GridSortModel) => {
      if (!sortingFields.length) {
        setSortOrder(undefined);
        setOrderByField('');
        return;
      }
      const {sort, field} = sortingFields[0];
      setSortOrder(sort?.toUpperCase() as Order);
      setOrderByField(field);
    },
    [setSortOrder, setOrderByField],
  );

  useEffect(() => {
    if (gridRef.current) {
      const ele = gridRef.current.querySelector('.MuiDataGrid-virtualScroller');
      if (ele) {
        ele.scrollTop = 0;
      }
    }
  }, [scrollToTop]);
  const renderFooter = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}>
      <CustomPagination
        pageSize={pageSize}
        pageIndex={pageIndex}
        handlePageSizeChange={handlePageSizeChange}
        handlePageChange={handlePageChange}
        pageCount={pageCount}
        totalRows={totalRows}
        lastSyncedText={lastSyncedText}
      />
    </Box>
  );

  const noRowsOverlay = () => {
    if (noResultsCondition) {
      return (
        noResultsEmptySection || (
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            label="No data entries yet. They will appear here once added."
          />
        )
      );
    }
    return (
      noRowsEmptySection || (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{my: 'auto'}}
          label="There are no entries for the applied filters."
        />
      )
    );
  };
  return (
    <Box
      sx={{
        flexGrow: fullHeight ? 1 : 'unset',
        display: 'flex',
        ...(!fullHeight && {height}),
      }}>
      <DataGrid
        ref={gridRef}
        components={{
          LoadingOverlay: LinearProgress,
          Footer: renderFooter,
          NoRowsOverlay: noRowsOverlay,
        }}
        loading={loading}
        headerHeight={headerHeight || 50}
        rows={rows}
        columns={columns}
        isRowSelectable={isRowSelectable}
        disableSelectionOnClick={disableSelectionOnClick}
        disableColumnFilter
        disableColumnMenu
        selectionModel={selectionModel}
        sortingMode="server"
        initialState={{
          sorting: {
            sortModel: [
              {
                field: orderByField,
                sort: sortOrder?.toLowerCase() as GridSortDirection,
              },
            ],
          },
        }}
        onSortModelChange={handleSortModelChange}
        onCellClick={
          onCellClick ||
          ((params, e) => {
            if (params.field === '__check__') {
              return;
            }
            e.preventDefault();
            if (params.field !== 'actions' && isCellClickable) {
              navigate(
                params.row.navigateTo,
                params.row?.navigateOptions ?? {},
              );
            }
          })
        }
        getRowClassName={(params) =>
          params.row.showHeader
            ? `MuiDataGrid-rowHeading-common MuiDataGrid-rowHeading-${params.row.id}`
            : ''
        }
        onRowClick={onRowClick}
        checkboxSelection={checkboxSelection}
        sx={{
          ...olStyles.scrollbar,
          '&.MuiDataGrid-root': {
            height: isEvenRowDifferentColor ? '91%' : '95%',
          },
          ...(isEvenRowDifferentColor && {
            '& .MuiDataGrid-row:nth-of-type(even)': {
              background: isEvenRowDifferentColor ? '#F2F6F8' : '#FFF',
            },
          }),
          height: '95%',
          width: '100%',
          my: '0.5em',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          '& > div:nth-of-type(3)': {
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
          },
          '& .MuiDataGrid-virtualScroller': {
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '& .Mui-selected': {
              background: '#ebfcff',
            },
            '&::-webkit-scrollbar': {
              display: 'none',
            },

            '&:hover': {
              ...olStyles.verticlaScrollBar,
            },
          },
          '& .MuiDataGrid-row': {
            background: 'white',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: 'white',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: '2px solid',
            borderColor: 'background.default',
            ...(isWidget && {
              borderBottom: `1px solid`,
              borderColor: `${theme.palette.text.disabled}`,
            }),
          },
          '& .MuiDataGrid-columnHeaderTitleContainer': {
            padding: '0',
            whiteSpace: 'pre-wrap',
            '& .MuiTypography-subtitle2': {
              wordWrap: 'break-word',
              overflow: 'auto',
              width: 'fit-content',
            },
            '&: has(.MuiDataGrid-iconButtonContainer)': {
              flexDirection: 'row',
            },
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-main': {
            '.MuiLinearProgress-root': {
              top: 50,
              zIndex: 1,
              position: 'absolute',
              width: '100%',
            },
            '& *:focus, & *:focus-within': {
              '& *': {
                outline: 'none',
                cursor: 'pointer',
              },
            },
          },
          '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus ':
            {
              outline: 'none',
              border: 'none',
            },
          '& .MuiDataGrid-cell': {
            borderBottom: '2px solid ',
            borderColor: 'background.default',
            whiteSpace: 'normal',
          },

          '.MuiDataGrid-rowHeading-common': {
            marginTop: 'calc(2em + 4px)',
            position: 'relative',
            '&::before': {
              position: 'absolute',
              width: '100%',
              top: '-2em',
              paddingLeft: '.75em',
              borderTop: '2px solid',
              borderColor: 'background.default',
              borderBottom: '2px solid white',
              background: 'white',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9375rem',
              lineHeight: 1.73,
              letterSpacing: '0.15px',
            },
          },
          '.nowrap': {
            whiteSpace: 'nowrap',
          },
          '.truncateText': {
            '& p': {
              overflow: 'hidden',
              textOverflow: 'ellipsis ',
              display: '-webkit-box',
              maxWidth: '100%',
              // Limit to number of lines
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
            },
          },
          '& .MuiDataGrid-columnHeaderCheckbox': {
            opacity: 0,
          },
          ...rowClassNames,
          ...containerStyle,
        }}
        {...rest}
      />
    </Box>
  );
};
