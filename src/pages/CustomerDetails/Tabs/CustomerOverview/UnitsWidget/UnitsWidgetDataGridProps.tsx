import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

import {ElevatorView} from 'models/elevator';
import {Resource} from 'models/misc';
import {convertToText} from 'utils/utils';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
    </Typography>
  ),
};

export const columns: GridColDef[] = [
  {
    field: 'address',
    headerName: 'Address',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'unitNumber',
    headerName: 'Unit Number',
    type: 'string',
    flex: 1,
    headerAlign: 'right',
    align: 'right',
    ...defaultProps,
  },
  {
    field: 'category',
    headerName: 'Category',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
];

export const makeRows = (
  units: Resource<ElevatorView>,
): GridRowModel<{[key: string]: any}[]> =>
  units.data.length
    ? units.data.map((item: ElevatorView, index: number) => ({
        id: index,
        address: item.address.fullName || '-',
        unitNumber: item.number || '-',
        category: convertToText(item.category) || '-',
        navigateTo: `/units/details/${item.id}`,
      }))
    : [];
