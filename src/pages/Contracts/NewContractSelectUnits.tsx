import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {getCenter} from 'geolib';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {ElevatorByAddr, ElevatorView} from 'models/elevator';
import {Resource} from 'models/misc';
import {DataGridElevatorView} from 'pages/Units/Models';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import * as _ from 'lodash';
import {useSearchParams} from 'react-router-dom';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {FormikProps} from 'formik';
import {columns, makeRows} from './NewContractUnitsGridProps';

interface Props {
  formik: FormikProps<{elevators: string[]}>;
  customerId: string;
}

const pageInfo = makePage(0, 25);

const NewContractSelectUnits: FC<Props> = ({formik, customerId}) => {
  const fallback = useRef({
    elevatorByAddress: {} as ElevatorByAddr,
    centerCoord: {longitude: 0, latitude: 0},
  }).current;

  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(pageInfo);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [elevatorView, setElevatorView] = useState<{
    elevatorByAddress: ElevatorByAddr;
    centerCoord: Location;
  }>(fallback as any);

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isFetching,
    isLoading,
  } = useQueryCustomerElevator(
    {
      query: '',
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
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
        makeRows({
          elevators: flatArr,
        }),
      );
    } else {
      setRows([]);
    }
  }, [elevatorView]);

  useEffect(() => {
    if (!isLoading) {
      const latLng = elevatorResponse?.data.map((elevator: ElevatorView) => ({
        latitude: elevator.address.location.latitude,
        longitude: elevator.address.location.longitude,
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

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize) || page.pageSize,
      pageIndex:
        Number(currentParams.pageIndex) - 1 >= 0
          ? Number(currentParams.pageIndex) - 1
          : page.pageIndex,
    });
  }, [queryParams]);

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

  return (
    <DataGridLayout
      hideFooter={pageCount <= 1}
      onRowClick={(row) => setElevators(row.id as string)}
      selectionModel={formik.values.elevators}
      disableSelectionOnClick={false}
      rows={rows}
      columns={columns}
      loading={isFetching}
      pageSize={page.pageSize}
      pageIndex={page.pageIndex + 1}
      height="90%"
      fullHeight={false}
      checkboxSelection
      isRowSelectable={() => true}
      handlePageSizeChange={(newPageSize: number) => {
        setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams));
      }}
      handlePageChange={(newPage: number) =>
        setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
      }
      pageCount={pageCount}
      totalRows={elevatorResponse.total}
      containerStyle={{height: '100%'}}
    />
  );
};

export default NewContractSelectUnits;
