import {DataGrid, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import {Box} from '@mui/system';
import {useNavigate} from 'react-router-dom';

interface Props {
  rows: GridRowsProp;
  columns: GridColDef[];
}

export const DataGridLayout = ({rows, columns}: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        height: 'max(400px, 73vh)',
        py: '1em',
        maxHeight: '73vh',
        width: '100%',

        '& > *': {
          border: 'none !important',
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
        },

        '& .MuiDataGrid-main': {
          '& *': {
            borderBottomColor: 'transparent !important',
          },

          '& *:focus, & *:focus-within': {
            '& *': {
              outline: 'none !important',
            },
          },

          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },

          '& .MuiDataGrid-sortIcon': {
            color: theme.palette.secondary.main,
          },

          '& .MuiDataGrid-virtualScroller': {
            mt: '3em !important',
          },

          '& .MuiDataGrid-row, & .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.common.white,
            borderRadius: '4px',
          },
          '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-row, & .MuiDataGrid-cell':
            {
              maxHeight: 'initial !important',
              minHeight: 'initial !important',
              lineHeight: 'initial !important',
            },

          '& .MuiDataGrid-columnHeaderTitleContainer': {
            py: '.5em',
          },

          '& .MuiDataGrid-row': {
            my: '.5em',
            cursor: 'pointer',

            '& .MuiDataGrid-cell': {
              py: '.75em ',
              pl: '1em ',
            },
          },

          '.MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.secondary.outlinedHoverBg,
          },
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableSelectionOnClick
        disableColumnFilter
        hideFooter
        onCellClick={(params, e) => {
          e.preventDefault();
          if (params.field !== 'actions') {
            navigate(params.row.navigateTo);
          }
        }}
      />
    </Box>
  );
};
