import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridColumnHeaderParams,
  GridEventListener,
  GridEvents,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import {useNavigate} from 'react-router-dom';
import {olStyles} from 'styles';
import {CustomPagination} from './CustomPagination';
import {EmptySection} from './EmptySection';

interface Props extends DataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  hideFooter?: boolean;
  height?: string | number;
  containerStyle?: {[key: string]: string | number};
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
  isWidget?: boolean;
  headerHeight?: number;
}

interface ColumnProps extends GridColDef {
  field: string;
  headerName: string;
  type?: 'string' | 'number';
  cellClassName?: 'nowrap' | 'truncateText';
}

export const getColumnProps = ({
  field,
  headerName,
  type = 'string',
  cellClassName = 'nowrap',
  renderHeader = (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName && t(params.colDef.headerName.toUpperCase())}
      </Typography>
    );
  },
  renderCell = (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2">{params.value || '-'}</Typography>
  ),
  flex = 1,
  align = 'left',
  editable = false,
  sortable = false,
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
});

export const DataGridLayout = ({
  rows,
  columns,
  hideFooter = false,
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
  isWidget = false,
  headerHeight,
  ...rest
}: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();

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

  const renderFooter = () => (
    <CustomPagination
      pageSize={pageSize}
      pageIndex={pageIndex}
      handlePageSizeChange={handlePageSizeChange}
      handlePageChange={handlePageChange}
      pageCount={pageCount}
      totalRows={totalRows}
    />
  );

  const noRowsOverlay = () => {
    if (noResultsCondition) {
      return (
        noResultsEmptySection || (
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            label="No data entries yet. They will appear here once added!"
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
          label="There are no results for the applied filters!"
        />
      )
    );
  };

  return (
    <Box
      sx={{
        flexGrow: fullHeight ? 1 : 'unset',
        ...(!fullHeight && {height}),
      }}>
      <DataGrid
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
        disableSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        hideFooter={hideFooter}
        sortingMode="server"
        onCellClick={
          onCellClick ||
          ((params, e) => {
            e.preventDefault();
            if (params.field !== 'actions' && isCellClickable) {
              navigate(params.row.navigateTo);
            }
          })
        }
        getRowClassName={(params) =>
          params.row.showHeader
            ? `MuiDataGrid-rowHeading-common MuiDataGrid-rowHeading-${params.row.id}`
            : ''
        }
        sx={{
          ...olStyles.scrollbar,

          width: '100%',
          my: '0.5em',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: '2px solid',
          borderColor: 'background.default',
          '& .MuiDataGrid-virtualScroller': {
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
            borderBottom: '2px solid',
            borderColor: 'background.default',
            ...(isWidget && {
              border: `1px solid ${theme.palette.text.disabled}`,
              borderRadius: '4px',
            }),
          },
          '& .MuiDataGrid-columnHeaderTitleContainer': {
            padding: '0',
            whiteSpace: 'pre-wrap',
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
              WebkitLineClamp: '2 ',
              WebkitBoxOrient: 'vertical',
            },
          },
          ...rowClassNames,
          ...containerStyle,
        }}
        {...rest}
      />
    </Box>
  );
};
