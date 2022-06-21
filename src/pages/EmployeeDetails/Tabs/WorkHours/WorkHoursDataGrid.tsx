import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {Box} from '@mui/material';

import {WorkHourIcons} from 'components/WorkHourIcons';
import {WorkHourTypeText} from 'components/WorkHourTypeText';
import {getRangeDate} from 'utils/datetime';
import {WorkHoursItem} from 'models/workHours';
import {Resource} from 'models/misc';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary" component="span">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em" component="span">
      {params.value}
    </Typography>
  ),
};

const defaultAlignment: {
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'orderType',
    headerName: 'TYPE',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'orderNumber',
    headerName: 'ORDER NUMBER',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    flex: 2,
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'time',
    headerName: 'TIME',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'duration',
    headerName: 'DURATION',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
];

const formatTime = (time: number, unit: string) =>
  `${time} ${unit.toLowerCase()}`;

const getAddress = (data: any) => {
  const parsedData = JSON.parse(data);
  return parsedData?.elevator?.address?.fullName || '-';
};

const getOrderNumber = (data: any) => {
  const parsedData = JSON.parse(data);
  const serviceNumber = parsedData?.number;
  return serviceNumber || '-';
};

export const makeRows = (
  workHours: Resource<WorkHoursItem>,
): GridRowModel<{[key: string]: any}[]> =>
  workHours.data.length
    ? workHours.data.map((item: WorkHoursItem) => ({
        id: item.id,
        duration: formatTime(item.duration, item.durationUnit),
        time: getRangeDate(item.startTime, item.endTime, 'dd.MM.yyyy HH:MM'),
        address: getAddress(item.data),
        orderNumber: getOrderNumber(item.data),
        orderType: (
          <Box display="flex" alignItems="center">
            <Box mr="1em">
              <WorkHourIcons workHourType={item.type} size="medium" />
            </Box>
            <Box mt="0.05em">
              <WorkHourTypeText
                variant="body2"
                workHourType={item.type}
                capitalizeText
              />
            </Box>
          </Box>
        ),
      }))
    : [];
