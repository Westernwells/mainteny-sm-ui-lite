import Box from '@mui/material/Box';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridEventListener,
  GridEvents,
  GridRowParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import {useNavigate} from 'react-router-dom';
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
  isRowSelectable?: (params: GridRowParams) => boolean;
}

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
  ...rest
}: Props) => {
  const navigate = useNavigate();

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

  const noRowsOverlay = () =>
    noRowsEmptySection || (
      <EmptySection
        illustration="clipboard"
        size="tiny"
        containerStyle={{my: 'auto'}}
        label="There are no rows for the applied filters!"
      />
    );

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
        headerHeight={50}
        rows={rows}
        columns={columns}
        isRowSelectable={isRowSelectable}
        disableSelectionOnClick
        disableColumnFilter
        hideFooter={hideFooter}
        onCellClick={
          onCellClick ||
          ((params, e) => {
            e.preventDefault();
            if (params.field !== 'actions') {
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
          width: '100%',
          my: '0.5em',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: '2px solid',
          borderColor: 'background.default',
          '& .MuiDataGrid-row': {
            background: 'white',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: 'white',
            borderBottom: '2px solid',
            borderColor: 'background.default',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-main': {
            '.MuiLinearProgress-root': {
              top: 50,
              zIndex: 1,
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
          ...rest,
        }}
      />
    </Box>
  );
};
