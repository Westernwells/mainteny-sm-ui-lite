import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ElevatorView} from 'models/elevator';

import {Widget} from 'components/Widget';
import {useFetchServiceOrdersByElevators} from 'hooks/reactQuery/useServiceOrder';
import Fade from '@mui/material/Fade';
import {TablePagination} from '@mui/material';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import useTheme from '@mui/material/styles/useTheme';
import {UnitSection} from './UnitSection';
import {UnitsMapsView} from './UnitsMapsView';
import {UnitColumns} from './UnitColumns';

export const MyUnits = () => {
  const fallback = useRef({
    elevator: createEmptyResource<ElevatorView>(10),
    centerCoord: {longitude: 0, latitude: 0},
  }).current;
  const [search, setSearch] = useState('');
  const [page] = useState(makePage(0, 50)); // TODO: implement paging
  const [showFilter, setShowFilter] = useState(false);
  const [availability, setAvailability] = useState<number[][]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [nextVisit, setNextVisit] = useState<string[]>([]);
  const [showMapview, setShowMapview] = useState(false);
  const theme = useTheme();

  const {data: elevatorResponse = fallback} = useAllElevators(search, page, {
    status,
  });
  const {data: elevatorsByAddressList} = useFetchServiceOrdersByElevators(
    elevatorResponse.elevator,
    {nextVisit, availabilityRange: availability},
  );

  const availabilityRangeConvertor = (selectedItems: string[]) => {
    const range: number[][] = [];
    selectedItems.forEach((item) => {
      switch (item) {
        case 'Under 40%':
          range.push([0, 40]);
          // '40 - 60%', '60 - 80%', 'Above 80%'
          break;
        case '40 - 60%':
          range.push([40, 60]);

          break;
        case '60 - 80%':
          range.push([60, 80]);

          break;
        case 'Above 80%':
          range.push([80, 100]);

          break;
        default:
          break;
      }
    });
    setAvailability(range);
  };

  const openMapView = () => {
    setShowMapview(true);
  };

  const closeMapView = () => {
    setShowMapview(false);
  };

  useEffect(() => {
    if (!showFilter) {
      setStatus([]);
      setNextVisit([]);
      setAvailability([]);
    }
  }, [showFilter]);
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" maxWidth="100%">
        <Box sx={{mb: 4, mt: 1}}>
          <Typography variant="h4">Units</Typography>
        </Box>
        <Box>
          <Widget
            searchPlaceholder="Try ‘Schindler’ or ‘Mitsubishi’"
            getSearchValue={(val: string) => setSearch(val)}
            openMapView={openMapView}
            closeMapView={closeMapView}
            mapViewActive={showMapview}
            setShowFilter={setShowFilter}
            showFilter={showFilter}
          />
        </Box>
      </Box>

      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Availability"
              options={['Under 40%', '40 - 60%', '60 - 80%', 'Above 80%']}
              getSelectedValue={(item) => availabilityRangeConvertor(item)}
              multiple={false}
            />

            <MultipleSelectCheckmarks
              label="Status"
              options={['RUNNING', 'STOPPED']}
              getSelectedValue={(item) => setStatus(item)}
            />

            <MultipleSelectCheckmarks
              label="Upcoming visits"
              options={['This week', 'Next week', 'Next month']}
              getSelectedValue={(item) => setNextVisit(item)}
              multiple={false}
            />
          </FilterFields>
        </Box>
      </Fade>

      {!showMapview ? (
        <>
          <UnitColumns />
          <Box
            sx={{height: '69vh', overflowY: 'scroll', paddingBottom: '1rem'}}>
            {elevatorsByAddressList?.map((elevatorsByAddress) => (
              <UnitSection
                key={elevatorsByAddress.address.id}
                elevatorsByAddress={elevatorsByAddress}
              />
            ))}
          </Box>
          <TablePagination
            sx={{
              '& .MuiTablePagination-selectLabel': {
                color: theme.palette.text.secondary,
              },
            }}
            component="div"
            count={elevatorResponse.elevator.total}
            page={elevatorResponse.elevator.page.pageIndex}
            // TODO: Implement paging
            onPageChange={() => console.log('page change')}
            rowsPerPage={elevatorResponse.elevator.page.pageSize}
            //  onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <UnitsMapsView
          elevatorsByAddressList={elevatorsByAddressList}
          centerCoord={elevatorResponse?.centerCoord}
        />
      )}
    </Box>
  );
};
