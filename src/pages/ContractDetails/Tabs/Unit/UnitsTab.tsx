import {Dispatch, FC, SetStateAction, useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';

import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {EmptySection} from 'components/EmptySection';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  ElevatorOrderField,
  ElevatorView,
  UnitAppointment,
  UnitAppointmentView,
} from 'models/elevator';
import {Typography} from '@mui/material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {Button} from 'components/Button';
import {Widget} from 'components/Widget';
import {PageListingLayout} from 'components/PageListingLayout';
import {useQueryState} from 'hooks/useQueryState';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/misc';
import {useContractElevators} from 'hooks/reactQuery/useContacts';
import {FilterFields} from 'components/FilterFields';
import {DatePicker} from 'components/DatePicker';
import {Progress} from 'components/Progress';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {mapAppointment} from 'utils/elevator-utils';
import {ContractElevatorView} from 'models/contract';
import {columns, makeRows} from './UnitsDataGridProps';

interface Props {
  contractId?: string;
  setOpenSelectUnitModal: Dispatch<SetStateAction<boolean>>;
  elevatorsLength?: number;
}

const pageSize = 25;

export const UnitsTab: FC<Props> = ({
  contractId,
  setOpenSelectUnitModal,
  elevatorsLength,
}) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const theme = useTheme();

  const {values, clearValues} =
    useSearchValues<OrderByParams<ElevatorOrderField>>();
  const {sortOrder, orderByField} = values;

  const totalUnitsRef = useRef(0);

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [pageCount, setPageCount] = useState(0);

  const [search, setSearch] = useQueryState('searchUnits');
  const textInput = useRef<HTMLInputElement>(null);
  const [lastVisitStart, setLastVisitStart] = useQueryState<Date | null>(
    'lastVisitStart',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [lastVisitEnd, setLastVisitEnd] = useQueryState<Date | null>(
    'lastVisitEnd',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [nextVisitStart, setNextVisitStart] = useQueryState<Date | null>(
    'nextVisitStart',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [nextVisitEnd, setNextVisitEnd] = useQueryState<Date | null>(
    'nextVisitEnd',
    {
      defaultValue: null,
      isDate: true,
    },
  );

  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [requireAppointment, setRequireAppointment] =
    useQueryState<UnitAppointment>('appointment');
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
    isFetching,
    isIdle,
    refetch,
  } = useContractElevators(
    contractId ?? '',
    {
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      ...(lastVisitStart && {
        lastVisitDateStart: formatDate(lastVisitStart, 'yyyy-MM-dd'),
      }),
      ...(lastVisitEnd && {
        lastVisitDateEnd: formatDate(lastVisitEnd, 'yyyy-MM-dd'),
      }),
      ...(nextVisitStart && {
        nextVisitDateStart: formatDate(nextVisitStart, 'yyyy-MM-dd'),
      }),
      ...(nextVisitEnd && {
        nextVisitDateEnd: formatDate(nextVisitEnd, 'yyyy-MM-dd'),
      }),
      orderBy: orderByField || ElevatorOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
      ...(requireAppointment && {
        requireAppointment: requireAppointment === UnitAppointment.YES,
      }),
    },
    {keepPreviousData: true},
  );

  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  useEffect(() => {
    refetch();
  }, [elevatorsLength]);

  useEffect(() => {
    if (elevatorResponse.data.length) {
      setRows(
        makeRows(
          {
            elevators: elevatorResponse.data.map(
              (elevator) =>
                ({
                  ...elevator,
                } as ContractElevatorView),
            ),
          },
          formatDate,
          contractId,
        ),
      );
    } else {
      setRows([]);
    }
  }, [isFetching]);

  useEffect(() => {
    if (elevatorResponse.total > 0 && elevatorResponse.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, elevatorResponse]);

  useEffect(() => {
    if (elevatorResponse.data.length) {
      setPageCount(Math.ceil(elevatorResponse.data.length / page.pageSize));
    }
  }, [elevatorResponse.data.length, page]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        clearValues();
        setResetDatePicker(true);
      }}
      clearText="Clear all"
      textStyles={{color: theme.palette.primary.dark, fontWeight: 600}}
      wrapperStyle={{width: '90%'}}>
      <DatePicker
        defaultDate={lastVisitStart}
        containerStyles={{mr: '1em'}}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        maxDate={lastVisitEnd || new Date()}
        getSelectedDate={(date) => setLastVisitStart(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Last Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={lastVisitEnd}
        maxDate={new Date()}
        minDate={lastVisitStart || undefined}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitEnd(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Last Visit End',
          sx: {background: '#fff'},
        }}
      />

      <DatePicker
        defaultDate={nextVisitStart}
        minDate={new Date()}
        maxDate={nextVisitEnd || undefined}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitStart(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Next Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={nextVisitEnd}
        minDate={nextVisitStart || new Date()}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitEnd(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Next Visit End',
          sx: {background: '#fff'},
        }}
      />
      <MultipleSelectCheckmarks
        label="Required Appointment"
        options={Object.values(UnitAppointmentView).map((value) => value)}
        getSelectedValue={(items) => {
          if (items.length > 0) {
            setRequireAppointment(
              mapAppointment(items[0] as UnitAppointmentView),
            );
          }
        }}
        multiple={false}
        initialSelectedItems={
          requireAppointment && [UnitAppointment[requireAppointment]]
        }
        containerStyles={{width: '30%'}}
        formControlStyles={{width: '90%'}}
        disableClearBtn
      />
    </FilterFields>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalUnitsRef.current) {
    return (
      <EmptySection
        label="No units yet. They will appear here once added!"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
        illustration="clipboard"
        size="tiny"
      />
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          containerStyles={{mt: 2}}
          searchPlaceholder="Search by number, customer, service type etc."
          getSearchValue={(val: string) => setSearch(val)}
          refInput={textInput}
          btnLabel="New Invoice"
          filterItems={renderFilterItems()}
        />
      }>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{pt: 3, pb: 3, backgroundColor: '#FFFFFF', mt: 3}}>
        <Typography
          sx={{pl: 2}}
          variant="h6"
          color={theme.palette.info.infoAlert}>
          {t('Units under the Contract')}
        </Typography>
        <Button
          label="Add Unit"
          buttonProps={{
            onClick: () => setOpenSelectUnitModal(true),
            sx: {
              height: '100%',
              color: theme.palette.primary.dark,
              border: `1px solid ${theme.palette.primary.dark}`,
              mr: 2,
            },
            startIcon: <AddIcon />,
          }}
        />
      </Box>
      <DataGridLayout
        isCellClickable={false}
        containerStyle={{margin: 'unset'}}
        rows={rows || []}
        isEvenRowDifferentColor
        columns={columns(contractId)}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={elevatorResponse?.total}
      />
    </PageListingLayout>
  );
};
