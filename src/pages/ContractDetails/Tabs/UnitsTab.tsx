import {useCallback, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';
import {Widget} from 'components/Widget';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  columns,
  makeRows,
} from 'pages/CustomerDetails/Tabs/CustomerUnitDataGrid';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {TabContentContainer} from 'components/TabContentContainer';
import {FilterFields} from 'components/FilterFields';
import {DatePicker} from 'components/DatePicker';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {EmptySection} from 'components/EmptySection';
import {useNavigate} from 'react-router';

export const UnitsTab = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [page] = useState(makePage(0, 25)); // TODO: implement paging
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: elevator = createEmptyResource<ElevatorView>(10)} =
    useAllElevators(search, page, {
      status: [],
    });

  useEffect(() => {
    if (elevator.data) {
      setRows(makeRows(elevator));
    } else {
      setRows([]);
    }
  }, [elevator]);

  const renderFilterItems = useCallback(
    () => (
      <FilterFields
        onClear={() => {}}
        containerStyle={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <DatePicker
          minDate={undefined}
          maxDate={undefined}
          getSelectedDate={() => {}}
          textFieldProps={{
            label: 'Last Visit',
          }}
          containerStyles={{
            '& .MuiFormControl-root': {
              backgroundColor: '#fff',
              marginBlock: 0,
            },
          }}
        />
        <DatePicker
          minDate={undefined}
          maxDate={undefined}
          getSelectedDate={() => {}}
          textFieldProps={{
            label: 'Next Visit',
          }}
          containerStyles={{
            marginX: 2,
            '& .MuiFormControl-root': {
              backgroundColor: '#fff',
              marginBlock: 0,
            },
          }}
        />
        <MultipleSelectCheckmarks
          label="Requires Appointment"
          options={['Yes', 'No']}
          multiple={false}
          containerStyles={{
            minWidth: '263px',
            '& .MuiFormControl-root': {
              width: '100%',
            },
          }}
        />
      </FilterFields>
    ),
    [],
  );

  const renderWidget = () => (
    <Box>
      <Widget
        searchPlaceholder="Search order type, customer, address"
        getSearchValue={(val: string) => setSearch(val)}
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      <DataGridLayout
        noRowsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        noResultsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        rows={rows}
        columns={columns}
        pageSize={page.pageSize}
      />
    </TabContentContainer>
  );
};
