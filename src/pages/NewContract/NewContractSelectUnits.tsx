import {GridRowsProp} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import {Box, Typography} from '@mui/material';
import {DataGridLayout} from 'components/DataGridLayout';
import {getCenter} from 'geolib';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {ElevatorByAddr, ElevatorView} from 'models/elevator';
import {Resource} from 'models/misc';
import {DataGridElevatorView} from 'pages/Units/Models';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import * as _ from 'lodash';
import {FormikProps} from 'formik';
import {useFormatDate} from 'hooks/useFormatDate';
import {SearchInput} from 'components/SearchInput';
import {columns, makeRows} from './NewContractUnitsGridProps';

interface Props {
  formik: FormikProps<{elevators: string[]}>;
  customerId: string;
}

const pageInfo = makePage(0, 10);

const NewContractSelectUnits: FC<Props> = ({formik, customerId}) => {
  const {t} = useTranslation();
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

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isFetching,
    isLoading,
  } = useQueryCustomerElevator(
    {
      query: search,
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

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" component="div">
          {t('Select units')}
        </Typography>
        <SearchInput
          placeholder="Search"
          onValueChanged={(val) => handleChangeSearch(val)}
        />
      </Box>
      <DataGridLayout
        hideFooter={pageCount <= 1 || elevatorResponse.total === 0}
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
    </>
  );
};

export default NewContractSelectUnits;
