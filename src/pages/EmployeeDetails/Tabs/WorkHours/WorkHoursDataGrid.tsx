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
import {convertToHourAndMinutes} from 'utils/utils';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeRecord} from 'models/service-order';

const defaultProps = {
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary" component="span">
        {params.colDef.headerName && t(params.colDef.headerName)}
      </Typography>
    );
  },
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography
      variant="body2"
      component="span"
      sx={{
        ...(params.field === 'description' && {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          WebkitLineClamp: 2,
          whiteSpace: 'normal',
          lineClamp: 2,
          textOverflow: 'clip',
          textAlign: 'left',
        }),
      }}>
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
    field: 'date',
    headerName: 'DATE',
    type: 'string',
    flex: 0.75,
    ...defaultAlignment,
    ...defaultProps,
    sortable: true,
  },
  {
    field: 'startTime',
    headerName: 'START TIME',
    type: 'string',
    flex: 0.5,
    ...defaultAlignment,
    ...defaultProps,
    headerAlign: 'right',
    align: 'right',
  },
  {
    field: 'orderType',
    headerName: 'TYPE',
    type: 'string',
    flex: 1.5,
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
    field: 'description',
    headerName: 'DESCRIPTION',
    type: 'string',
    flex: 1.5,
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
  {
    field: 'billableHours',
    headerName: 'BILLABLE HOURS',
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

const getOrderId = (data: any) => {
  const parsedData = JSON.parse(data);
  const orderId = parsedData?.id;
  return orderId || '';
};

export const makeRows = (
  workHours: Resource<WorkHoursItem>,
  formatDate: FormatDate,
  allJobTypes?: ServiceOrderTypeRecord[],
): GridRowModel<{[key: string]: any}>[] => {
  const serviceOrderTimeLogTypes = allJobTypes?.map((item) =>
    `SERVICE_ORDER_${item.name}`.toLowerCase(),
  );

  const isNotJobType = (detailType: string) =>
    !serviceOrderTimeLogTypes?.includes(detailType.toLowerCase());

  return workHours.data.length
    ? workHours.data.map((item: WorkHoursItem) => ({
        id: item.id,
        date: formatDate(item.startTime) ?? '-',
        billableHours: convertToHourAndMinutes(
          item.additionalInfo.billableTime,
        ),
        duration: convertToHourAndMinutes(item.additionalInfo.baseTime),
        startTime: `${formatDate(item.startTime, 'HH:mm')}`,
        address: getAddress(item.data) || '-',
        orderNumber: (
          <Typography variant="body2" color="#0092B2" fontWeight="600">
            {getOrderNumber(item.data)}
          </Typography>
        ),
        description: item.description || '-',
        type: item.type,
        orderType: (
          <Box display="flex" alignItems="center">
            <Box mr="1em">
              {isNotJobType(item.type) ? (
                <WorkHourIcons workHourType={item.type} size="medium" />
              ) : (
                <ServiceOrderIcons serviceOrderType={item.type} />
              )}
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
        orderId: getOrderId(item.data),
      }))
    : [];
};
