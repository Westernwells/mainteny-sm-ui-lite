import {GridRowsProp} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {DataGridLayout} from 'components/DataGridLayout';
import {getCenter} from 'geolib';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {
  ElevatorByAddr,
  ElevatorOrderField,
  ElevatorView,
} from 'models/elevator';
import {Order, OrderByParams, Resource} from 'models/misc';
import {DataGridElevatorView} from 'pages/Units/Models';
import {FC, useCallback, useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging';
import * as _ from 'lodash';
import {FormikProps} from 'formik';
import {useFormatDate} from 'hooks/useFormatDate';
import {SearchInput} from 'components/SearchInput';
import {Button} from 'components/Button';
import {T} from 'utils/i18n-utils';
import CloseIcon from '@mui/icons-material/Close';
import {useSearchValues} from 'hooks/useSearchValues';
import {columns, makeRows} from './NewContractUnitsGridProps';

interface Props {
  formik: FormikProps<{elevators: string[]}>;
  customerId: string;
}

const pageInfo = makePage(0, 10);

const NewContractSelectUnits: FC<Props> = ({formik, customerId}) => {
  const formatDate = useFormatDate();
  const fallback = useRef({
    elevatorByAddress: {} as ElevatorByAddr,
    centerCoord: {longitude: 0, latitude: 0},
  }).current;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(pageInfo);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [elevatorView, setElevatorView] = useState<{
    elevatorByAddress: ElevatorByAddr;
    centerCoord: Location;
  }>(fallback as any);
  const {values} = useSearchValues<OrderByParams<ElevatorOrderField>>();
  const {sortOrder, orderByField} = values;

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isFetching,
    isLoading,
  } = useQueryCustomerElevator(
    {
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      orderBy: orderByField || ElevatorOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
    },
    {status: []},
    customerId,
    {keepPreviousData: true},
  );

  const groupElevatorByAddressList = (elevatorRes?: Resource<ElevatorView>) => {
    const elevatorMap = _.groupBy(
      elevatorRes?.data,
      (elevator: ElevatorView) => elevator.address.fullName,
    );

    return elevatorMap;
  };

  const flatenn = (elevators: {[key: string]: ElevatorView[]}) => {
    let prevAdddressId = '';
    const flatArray: DataGridElevatorView[] = [];

    Object.keys(elevators).forEach((key) => {
      elevators[key].forEach((elevator) => {
        const {address} = elevator;
        const showAddress = address.id !== prevAdddressId;
        flatArray.push({showAddress, ...elevator});
        prevAdddressId = address.id;
      });
    });
    return flatArray;
  };

  useEffect(() => {
    if (elevatorView.elevatorByAddress) {
      const flatArr = flatenn(elevatorView.elevatorByAddress);
      setRows(
        makeRows(
          {
            elevators: flatArr,
          },
          formatDate,
        ),
      );
    } else {
      setRows([]);
    }
  }, [elevatorView]);

  useEffect(() => {
    if (!isLoading) {
      const latLng = elevatorResponse?.data.map((elevator: ElevatorView) => ({
        latitude: elevator.address.location?.latitude ?? 0.0,
        longitude: elevator.address.location?.longitude ?? 0.0,
      }));
      const centerCoord = getCenter(latLng) as unknown as Location;
      const result = groupElevatorByAddressList(elevatorResponse);

      setElevatorView({
        elevatorByAddress: result,
        centerCoord,
      });
    }
    if (elevatorResponse.total) {
      setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
    }
  }, [isLoading, elevatorResponse]);

  const setElevators = useCallback(
    (elevatorId: string) => {
      const isExists = formik.values.elevators.find((id) => id === elevatorId);

      if (isExists)
        return formik.setFieldValue(
          'elevators',
          formik.values.elevators.filter((id) => id !== elevatorId),
        );

      formik.setFieldValue('elevators', [
        ...formik.values.elevators,
        elevatorId,
      ]);
    },
    [formik.values.elevators],
  );

  const handleChangeSearch = (val: string) => {
    setPage({
      ...page,
      pageIndex: 0,
    });
    setSearch(val);
  };

  const clearElevators = () => {
    formik.setFieldValue('elevators', []);
  };

  const renderClearSelectionsButton = () => {
    const numberOfUnits = formik.values.elevators.length;

    if (numberOfUnits === 0) {
      return null;
    }

    return (
      <Button
        buttonProps={{
          variant: 'outlined',
          size: 'medium',
          sx: {
            background: 'transparent',
            marginLeft: '1.5em',
          },
          endIcon: <CloseIcon />,
          onClick: () => clearElevators(),
        }}>
        {numberOfUnits === 1
          ? T('1 Unit Selected')
          : T('{{numberOfUnits}} Units Selected', {
              numberOfUnits,
            })}
      </Button>
    );
  };

  return (
    <Box sx={{height: '56vh'}}>
      <SearchInput
        placeholder="Search"
        onValueChanged={(val) => handleChangeSearch(val)}
        variant="outlined"
      />

      {renderClearSelectionsButton()}

      <DataGridLayout
        height="100%"
        fullHeight={false}
        onRowClick={(row) => setElevators(row.id as string)}
        selectionModel={formik.values.elevators}
        disableSelectionOnClick={false}
        isCellClickable={false}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        checkboxSelection
        isRowSelectable={() => true}
        handlePageChange={(newPage: number) => {
          setPage({...page, pageIndex: newPage - 1});
        }}
        pageCount={pageCount}
        totalRows={elevatorResponse.total}
      />
    </Box>
  );
};

export default NewContractSelectUnits;
