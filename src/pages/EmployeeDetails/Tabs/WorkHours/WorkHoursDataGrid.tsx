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
import {WorkHoursItem} from 'models/workHours';
import {FormatDate, Resource} from 'models/misc';
import {useTranslation} from 'react-i18next';
import {DateDuration, DateDurationOptions} from 'hooks/useFormatDuration';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary" component="span">
        {params.colDef.headerName && t(params.colDef.headerName)}
      </Typography>
    );
  },
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
    field: 'startDate',
    headerName: 'START DATE',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'endDate',
    headerName: 'END DATE',
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

export const columnsWidget: GridColDef[] = [
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
    field: 'duration',
    headerName: 'DURATION',
    type: 'string',
    flex: 1,
    ...defaultAlignment,
    ...defaultProps,
  },
];

// const formatTime = (time: number, unit: string) =>
//   `${time} ${unit.toLowerCase()}`;

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
  formatDate: FormatDate = () => '',
  formatDateDuration: (
    input: DateDuration,
    dateFormat?: string,
    options?: DateDurationOptions,
  ) => any = () => '',
): GridRowModel<{[key: string]: any}[]> =>
  workHours.data.length
    ? workHours.data.map((item: WorkHoursItem) => ({
        id: item.id,
        duration: formatDateDuration({
          [item.durationUnit.toLowerCase()]:
            item.durationUnit === 'DAYS' && item.duration === 0
              ? 1
              : item.duration,
        }),
        startDate: `${formatDate(item.startTime)} ${formatDate(
          item.startTime,
          'HH:mm',
        )}`,
        endDate: `${formatDate(item.endTime)} ${formatDate(
          item.endTime,
          'HH:mm',
        )}`,
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

// let duration = '-';
// const startDate =
// if(item.type === WorkHoursType.HOLIDAY) {

// } else {
//   `${formatDate(item.startTime)} ${formatDate(
//     item.startTime,
//     'HH:mm',
//   )}`

// }
