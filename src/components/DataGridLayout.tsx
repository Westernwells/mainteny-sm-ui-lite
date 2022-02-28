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
        height: 'max(400px, 73vh) !important',
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
              border: 'none !important',
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

          '& .MuiDataGrid-columnHeaders': {
            maxHeight: 'initial !important',
            minHeight: 'initial !important',
            lineHeight: 'initial !important',
            alignItems: 'flex-end',

            '& .MuiDataGrid-columnHeadersInner': {
              p: '0 !important',

              '& .MuiDataGrid-columnHeaderTitleContainer': {
                py: '.5em !important',
              },
            },
          },

          '& .MuiDataGrid-row': {
            my: '.5em',
            maxHeight: 'initial !important',
            minHeight: 'initial !important',
            lineHeight: 'initial !important',
            cursor: 'pointer',

            '& .MuiDataGrid-cell': {
              maxHeight: 'initial !important',
              minHeight: 'initial !important',
              lineHeight: 'initial !important',
              py: '.75em !important',
              pl: '1em !important',
            },
          },

          '& .Mui-selected': {
            backgroundColor: `${theme.palette.common.white} !important`,
          },
        },

        '& .MuiDataGrid-footerContainer': {
          display: 'none',
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
