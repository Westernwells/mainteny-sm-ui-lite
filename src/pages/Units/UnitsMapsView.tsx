import React, {useState} from 'react';
import GoogleMapReact from 'google-map-react';
import Box from '@mui/system/Box';
import {LocationPin} from '../../components/LocationPin';
import {Location} from '../../models/misc';
import {ElevatorsByAddress} from './Models';

interface Props {
  centerCoord?: Location;
  // TODO: Resolve 'any' type here
  elevatorsByAddressList?: ElevatorsByAddress[] | any;
}

export const UnitsMapsView = ({centerCoord, elevatorsByAddressList}: Props) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>();
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  };
  return (
    <Box height="100vh" width="99%">
      <GoogleMapReact
        bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAPS_KEY!}}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        center={
          centerCoord && {lat: centerCoord.latitude, lng: centerCoord.longitude}
        }
        zoom={12}
      >
        {/* TODO: Resolve 'any' type here */}
        {elevatorsByAddressList?.map((elevatorsByAddress: any) => (
          <LocationPin
            key={elevatorsByAddress.address.id}
            elevatorsByAddress={elevatorsByAddress}
            lat={
              elevatorsByAddress.elevators[0].elevator.address.location.latitude
            }
            lng={
              elevatorsByAddress.elevators[0].elevator.address.location
                .longitude
            }
            onPinClick={() =>
              setSelectedLocation({
                latitude:
                  elevatorsByAddress.elevators[0].elevator.address.location
                    .latitude,
                longitude:
                  elevatorsByAddress.elevators[0].elevator.address.location
                    .longitude,
              })
            }
            selectedLocation={selectedLocation}
          />
        ))}
      </GoogleMapReact>
    </Box>
  );
};
