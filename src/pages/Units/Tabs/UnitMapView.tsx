import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import GoogleMapReact from 'google-map-react';
import Box from '@mui/system/Box';
import {DatePicker} from 'components/DatePicker';
import useSupercluster from 'use-supercluster';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {ElevatorOrderField, ElevatorView} from 'models/elevator';
import {getCenter} from 'geolib';
import Supercluster from 'supercluster';
import {Typography} from '@mui/material';
import {LocationPin} from 'components/LocationPin';
import {Location, OrderByParams, Resource} from 'models/misc';
import {FilterFields} from 'components/FilterFields';
import {Widget} from 'components/Widget';
import {FlexContainer} from 'components/FlexContainer';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useTheme} from '@mui/system';
import {useSearchValues} from 'hooks/useSearchValues';

const pageInfo = makePage(0, 50);

export const UnitMapsView = () => {
  const formatDate = useFormatDate();
  const {user} = useUserSession();
  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const fallback = useRef({
    elevator: createEmptyResource<ElevatorView>(10),
    centerCoord: {
      longitude: company?.businessAddress?.location?.longitude ?? 13.390206,
      latitude: company?.businessAddress?.location?.latitude ?? 52.535152,
    },
  }).current;
  const mapRef = useRef<any>();
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
  const {clearValues} = useSearchValues<OrderByParams<ElevatorOrderField>>();
  const [zoom, setZoom] = useState(20);
  const [search, setSearch] = useQueryState('searchUnitsMapView');
  const [points, setPoints] = useState<any>([]);
  const [bounds, setBounds] = useState<any>([]);
  const [page, setPage] = useQueryState('page', {
    defaultValue: pageInfo,
  });
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [elevatorView, setElevatorView] = useState<{
    elevator: Resource<ElevatorView>;
    centerCoord: Location;
  }>(fallback);
  const textInput = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetching,
  } = useAllElevators({
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
  });
  const memorisedElevatorResponse = useMemo(
    () => elevatorResponse,
    [elevatorResponse],
  );
  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, lastVisitStart, lastVisitEnd, nextVisitStart, nextVisitEnd]);

  const newElevatorView = useMemo(() => {
    if (
      !search &&
      !lastVisitStart &&
      !lastVisitEnd &&
      !nextVisitStart &&
      !nextVisitEnd
    ) {
      return {
        ...elevatorView,
        elevator: {
          ...elevatorView.elevator,
          data: [...elevatorView.elevator.data, ...elevatorResponse.data],
        },
      };
    }
    return {...elevatorView, elevator: elevatorResponse};
  }, [
    search,
    lastVisitStart,
    lastVisitEnd,
    nextVisitStart,
    nextVisitEnd,
    elevatorView,
    elevatorResponse,
  ]);

  const updateElevatorView = useCallback(() => {
    if (!isLoading && !isFetching) {
      const currentTotal = (page.pageIndex + 1) * page.pageSize;

      if (currentTotal < memorisedElevatorResponse.total) {
        setElevatorView(newElevatorView);
        setPage({...page, pageIndex: page.pageIndex + 1});
      }
      if (currentTotal >= memorisedElevatorResponse.total) {
        const latLng = elevatorView.elevator.data.map((elevator) => ({
          latitude: elevator.address.location?.latitude ?? 0.0,
          longitude: elevator.address.location?.longitude ?? 0.0,
        }));

        const centerCoord = getCenter(latLng) as unknown as Location;
        const centerCoordIsDifferent =
          elevatorView.centerCoord.latitude !== centerCoord.latitude &&
          elevatorView.centerCoord.longitude !== centerCoord.longitude;

        if (centerCoord && centerCoordIsDifferent) {
          setElevatorView((prevState) => ({
            ...prevState,
            centerCoord,
          }));
        }
      }
    }
  }, [
    isLoading,
    isFetching,
    page,
    setPage,
    memorisedElevatorResponse,
    newElevatorView,
    elevatorView,
  ]);

  useEffect(() => {
    updateElevatorView();
  }, [memorisedElevatorResponse, newElevatorView, updateElevatorView]);

  useEffect(() => {
    const result = elevatorView.elevator.data.map((elevator: ElevatorView) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        category: elevator.address.fullName,
        elevator,
      },
      geometry: {
        type: 'Point',
        coordinates: [
          elevator.address.location?.longitude ?? 0.0,
          elevator.address.location?.latitude ?? 0.0,
        ],
      },
    }));
    setPoints(result);
  }, [elevatorView]);

  const {clusters, supercluster} = useSupercluster({
    points,
    bounds,
    zoom,
    options: {radius: 75, maxZoom: 20},
  });

  const defaultProps = {
    center: {
      lat: 14.5994,
      lng: 28.6731,
    },
    zoom: 20,
  };

  const onClusterClick = (
    superCluster: Supercluster<Supercluster.AnyProps, Supercluster.AnyProps>,
    lat: number,
    lng: number,
    clusterId: number,
  ) => {
    const expansionZoom = Math.min(
      superCluster.getClusterExpansionZoom(clusterId),
      20,
    );
    mapRef?.current?.setZoom(expansionZoom);
    mapRef?.current?.panTo({lat, lng});
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        clearValues();
        setResetDatePicker(true);
        setPage({
          pageSize: 50,
          pageIndex: 0,
        });
        const res = createEmptyResource<ElevatorView>(10);
        const latLng = res.data.map((elevator) => ({
          latitude: elevator.address.location?.latitude ?? 0.0,
          longitude: elevator.address.location?.longitude ?? 0.0,
        }));

        const centerCoord = getCenter(latLng) as unknown as Location;
        setElevatorView({
          elevator: res,
          centerCoord,
        });
      }}
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
        textFieldProps={{
          label: 'Last Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={lastVisitEnd}
        maxDate={new Date()}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        minDate={lastVisitStart || undefined}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitEnd(date)}
        textFieldProps={{
          label: 'Last Visit End',
          sx: {background: '#fff'},
        }}
      />

      <DatePicker
        defaultDate={nextVisitStart}
        minDate={new Date()}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        maxDate={nextVisitEnd || undefined}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitStart(date)}
        textFieldProps={{
          label: 'Next Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={nextVisitEnd}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        minDate={nextVisitStart || new Date()}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitEnd(date)}
        textFieldProps={{
          label: 'Next Visit End',
          sx: {background: '#fff'},
        }}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: '0.5em'}}>
      <Widget
        searchPlaceholder="Search by number, model, customer, address etc."
        getSearchValue={(val) => setSearch(val)}
        defaultSearchValue={search}
        filterItems={renderFilterItems()}
        refInput={textInput}
      />
    </Box>
  );

  return (
    <FlexContainer>
      {renderWidget()}
      <GoogleMapReact
        bootstrapURLKeys={{key: import.meta.env.REACT_APP_GOOGLE_MAPS_KEY!}}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({map}) => {
          mapRef.current = map;
        }}
        onChange={({zoom: mapZoom, bounds: mapBounds}) => {
          setZoom(mapZoom);
          setBounds([
            mapBounds.nw.lng,
            mapBounds.se.lat,
            mapBounds.se.lng,
            mapBounds.nw.lat,
          ]);
        }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        center={
          elevatorView.centerCoord && {
            lat: elevatorView.centerCoord.latitude,
            lng: elevatorView.centerCoord.longitude,
          }
        }
        zoom={10}>
        {clusters.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster, point_count: pointCount} =
            cluster.properties;

          if (isCluster) {
            return (
              <LocationPin
                key={`${cluster.id}-${index}`}
                lat={latitude}
                lng={longitude}>
                <Box
                  onClick={() => {
                    if (supercluster) {
                      onClusterClick(
                        supercluster,
                        latitude,
                        longitude,
                        cluster.id as number,
                      );
                    }
                  }}
                  sx={{
                    width: `${10 + (pointCount / points.length) * 60}px`,
                    height: `${10 + (pointCount / points.length) * 60}px`,
                    p: '2em',
                    borderRadius: '50%',
                    background: theme.palette.action.active,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    border: '2px solid white',
                  }}>
                  <Typography>{pointCount}</Typography>
                </Box>
              </LocationPin>
            );
          }

          return (
            <LocationPin
              key={`${cluster.properties.elevator.address.id}-${index}`}
              elevator={cluster.properties.elevator}
              lat={cluster.properties.elevator.address.location.latitude}
              lng={cluster.properties.elevator.address.location.longitude}
            />
          );
        })}
      </GoogleMapReact>
    </FlexContainer>
  );
};
