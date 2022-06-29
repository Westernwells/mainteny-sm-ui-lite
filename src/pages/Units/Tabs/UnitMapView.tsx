import {useEffect, useRef, useState} from 'react';
import GoogleMapReact from 'google-map-react';
import Box from '@mui/system/Box';
import {DatePicker} from 'components/DatePicker';
import useSupercluster from 'use-supercluster';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {ElevatorView} from 'models/elevator';
import {getCenter} from 'geolib';
import Supercluster from 'supercluster';
import {Typography} from '@mui/material';
import {LocationPin} from 'components/LocationPin';
import {Location, Resource} from 'models/misc';
import {FilterFields} from 'components/FilterFields';
import {Widget} from 'components/Widget';
import {FlexContainer} from 'components/FlexContainer';
import {formatDate} from 'utils/datetime';

export const UnitMapsView = () => {
  const fallback = useRef({
    elevator: createEmptyResource<ElevatorView>(10),
    centerCoord: {longitude: 13.390206, latitude: 52.535152},
  }).current;
  const mapRef = useRef<any>();
  const [lastVisitStart, setLastVisitStart] = useState<Date | null>(null);
  const [lastVisitEnd, setLastVisitEnd] = useState<Date | null>(null);
  const [nextVisitStart, setNextVisitStart] = useState<Date | null>(null);
  const [nextVisitEnd, setNextVisitEnd] = useState<Date | null>(null);
  const [zoom, setZoom] = useState(20);
  const [search, setSearch] = useState('');
  const [points, setPoints] = useState<any>([]);
  const [bounds, setBounds] = useState<any>([]);
  const [page, setPage] = useState(makePage(0, 100));
  const [elevatorView, setElevatorView] = useState<{
    elevator: Resource<ElevatorView>;
    centerCoord: Location;
  }>(fallback);
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

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
  }, [search, lastVisitStart, lastVisitEnd, nextVisitStart, nextVisitEnd]);

  const newElevatorView = () =>
    !search &&
    !lastVisitStart &&
    !lastVisitEnd &&
    !nextVisitStart &&
    !nextVisitEnd
      ? {
          ...elevatorView,
          elevator: {
            ...elevatorView.elevator,
            data: [...elevatorView.elevator.data, ...elevatorResponse.data],
          },
        }
      : {...elevatorView, elevator: elevatorResponse};

  useEffect(() => {
    if (!isLoading) {
      const currentTotal = (page.pageIndex + 1) * page.pageSize;

      setElevatorView(newElevatorView());

      if (currentTotal < elevatorResponse.total) {
        setPage({...page, pageIndex: page.pageIndex + 1});
      }
    }
  }, [elevatorResponse, isLoading]);

  console.log(elevatorView, '!!!!@@##');

  useEffect(() => {
    if (!isLoading && !isFetching) {
      const currentTotal = (page.pageIndex + 1) * page.pageSize;
      if (currentTotal >= elevatorResponse.total) {
        const latLng = elevatorView.elevator.data.map(
          (elevator: ElevatorView) => ({
            latitude: elevator.address.location.latitude,
            longitude: elevator.address.location.longitude,
          }),
        );

        const centerCoord = getCenter(latLng) as unknown as Location;
        const centerCoordIsDifferent =
          elevatorView.centerCoord.latitude !== centerCoord.latitude &&
          elevatorView.centerCoord.longitude !== centerCoord.longitude;

        if (centerCoord && centerCoordIsDifferent) {
          setElevatorView({
            ...elevatorView,
            centerCoord,
          });
        }
      }
    }
  }, [elevatorView]);

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
          elevator.address.location.longitude,
          elevator.address.location.latitude,
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
    mapRef.current.setZoom(expansionZoom);
    mapRef.current.panTo({lat, lng});
  };

  const clearFilters = () => {
    setLastVisitStart(null);
    setLastVisitEnd(null);
    setNextVisitStart(null);
    setNextVisitEnd(null);
  };

  const renderFilterItems = () => (
    <FilterFields onClear={() => clearFilters()} wrapperStyle={{width: '90%'}}>
      <DatePicker
        defaultDate={lastVisitStart}
        containerStyles={{mr: '1em'}}
        maxDate={lastVisitEnd || new Date()}
        getSelectedDate={(date) => setLastVisitStart(date)}
        textFieldProps={{
          label: 'Last Visit Start',
        }}
      />
      <DatePicker
        defaultDate={lastVisitEnd}
        maxDate={new Date()}
        minDate={lastVisitStart || undefined}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitEnd(date)}
        textFieldProps={{
          label: 'Last Visit End',
        }}
      />

      <DatePicker
        defaultDate={nextVisitStart}
        minDate={new Date()}
        maxDate={nextVisitEnd || undefined}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitStart(date)}
        textFieldProps={{
          label: 'Next Visit Start',
        }}
      />
      <DatePicker
        defaultDate={nextVisitEnd}
        minDate={nextVisitStart || new Date()}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitEnd(date)}
        textFieldProps={{
          label: 'Next Visit End',
        }}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: '0.5em'}}>
      <Widget
        searchPlaceholder="Search by number, model, customer, address etc."
        getSearchValue={(val) => setSearch(val)}
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  return (
    <FlexContainer>
      {renderWidget()}
      <GoogleMapReact
        bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAPS_KEY!}}
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
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster, point_count: pointCount} =
            cluster.properties;

          if (isCluster) {
            return (
              <LocationPin key={cluster.id} lat={latitude} lng={longitude}>
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
                    p: '1.5em',
                    borderRadius: '50%',
                    background:
                      pointCount > 0 && pointCount <= 10
                        ? '#007bff'
                        : pointCount > 10 && pointCount <= 100
                        ? '#ffc107'
                        : pointCount > 100 && pointCount <= 1000
                        ? '#dc3545'
                        : '#e83e8c',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Typography>{pointCount}</Typography>
                </Box>
              </LocationPin>
            );
          }

          return (
            <LocationPin
              key={cluster.properties.elevator.address.id}
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
