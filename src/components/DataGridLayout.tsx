import Box from '@mui/material/Box';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom';

interface Props extends DataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  hideFooter?: boolean;
  height?: string;
  containerStyle?: {[key: string]: string | number};
  loading?: boolean;
}

export const DataGridLayout = ({
  rows,
  columns,
  hideFooter = false,
  height,
  containerStyle,
  loading,
  ...rest
}: Props) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}>
      <DataGrid
        loading={loading}
        headerHeight={50}
        rows={rows}
        columns={columns}
        disableSelectionOnClick
        disableColumnFilter
        hideFooter={hideFooter}
        onCellClick={(params, e) => {
          e.preventDefault();
          if (params.field !== 'actions') {
            navigate(params.row.navigateTo);
          }
        }}
        sx={{
          height,
          width: '100%',
          my: '0.5em',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: '2px solid #F0F4F5',
          '& .MuiDataGrid-row': {
            background: '#fff',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: '#fff',
            borderBottom: '2px solid #F0F4F5',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-main': {
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
            borderBottom: '2px solid #F0F4F5',
            whiteSpace: 'normal',
          },
          ...containerStyle,
          ...rest,
        }}
      />
    </Box>
  );
};
