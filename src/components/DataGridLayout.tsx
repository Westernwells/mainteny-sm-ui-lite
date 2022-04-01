import {DataGrid, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom';

interface Props {
  rows: GridRowsProp;
  columns: GridColDef[];
  hideFooter?: boolean;
  height?: string;
  containerStyle?: {[key: string]: string | number};
}

export const DataGridLayout = ({
  rows,
  columns,
  hideFooter = false,
  height,
  containerStyle,
}: Props) => {
  const navigate = useNavigate();
  return (
    <DataGrid
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
        height: height || 'max(400px, 60vh) !important',
        maxHeight: '73vh',
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
          background: '#fff',
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
        },
        ...containerStyle,
      }}
    />
  );
};
