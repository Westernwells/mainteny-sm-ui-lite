import {useMemo, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import GoogleMapReact from 'google-map-react';
import {MarkerPin} from 'components/MarkerPin';
import RoomIcon from '@mui/icons-material/Room';
import {useCoordsToAddress} from 'hooks/reactQuery/useGeocode';
import {AddressRecord, Coord, GeocodeAddress} from 'models/misc';
import {Button} from '@mui/material';
import {useTheme} from '@mui/system';
import _ from 'lodash';
import {simplifyAddressCoords} from 'utils/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: GeocodeAddress) => void;
  initialAddress?: GeocodeAddress | AddressRecord;
}

export const MapLocationPickerInner = ({
  onClose,
  isOpen,
  onSave,
  initialAddress,
}: Props) => {
  const {t} = useTranslation();
  const mapRef = useRef<any>();
  const initialLocation = simplifyAddressCoords(initialAddress);
  const [clickedCoords, setClickedCoords] = useState<Coord | null>(
    initialLocation
      ? {
          lat: initialLocation.lat,
          lng: initialLocation.lng,
        }
      : null,
  );
  const {data} = useCoordsToAddress(clickedCoords);
  const address = data?.results[0];
  const theme = useTheme();

  const defaultProps = useMemo(() => {
    const ZOOM = 10;
    if (!initialLocation) {
      return {
        center: {
          lat: 52.520008,
          lng: 13.404954,
        },
        zoom: ZOOM,
      };
    }

    return {
      center: {
        lat: initialLocation?.lat,
        lng: initialLocation?.lng,
      },
      zoom: ZOOM + 5,
    };
  }, []);

  const handleConfirm = () => {
    const transformedData = _.groupBy(address?.address_components, 'types[0]');

    const result = _.mapValues(transformedData, (group) =>
      group.map((obj) => ({
        long_name: obj.long_name,
        short_name: obj.short_name,
      })),
    );

    onSave({
      ...address,
      components: result,
      description: address?.formatted_address,
    } as GeocodeAddress);
  };

  return (
    <Fade in={isOpen}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Box
          sx={{
            color: 'text.primary',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'inputBackground.main',
            borderRadius: '20px',
            width: 'min(1024px , 80%)',
            pb: '1em',
            ml: '1.7em',
            overflow: 'hidden',
            '&:focus-visible': {
              outline: 'none',
            },
          }}>
          <Box
            pt="1.25em"
            pb=".75em"
            px="1em"
            bgcolor="white"
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="h5">
              {t('Pick your address location')}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            px="1em"
            pt=".5em"
            display="flex"
            flexDirection="column"
            minHeight="max(70vh, 300px)"
            position="relative"
            flexGrow={1}>
            <GoogleMapReact
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                margin: '0px',
                padding: '0px',
                position: 'relative',
              }}
              bootstrapURLKeys={{
                key: import.meta.env.REACT_APP_GOOGLE_MAPS_KEY!,
                version: 'weekly',
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({map}) => {
                mapRef.current = map;

                map.addListener('click', (e: any) => {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();

                  setClickedCoords({
                    lat,
                    lng,
                  });
                });
              }}
              defaultCenter={{
                lat: defaultProps.center.lat as number,
                lng: defaultProps.center.lng as number,
              }}
              defaultZoom={defaultProps.zoom}>
              {clickedCoords && (
                <MarkerPin
                  style={{transform: 'translate(-50%, -50%)'}}
                  lat={clickedCoords.lat as number}
                  lng={clickedCoords.lng as number}
                />
              )}
            </GoogleMapReact>
            {address && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '2em',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '0.7em 1.5em',
                  backgroundColor: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                }}>
                <RoomIcon
                  htmlColor="white"
                  sx={{width: '1em', height: '1em', marginRight: '0.5em'}}
                />

                <Typography color="white" sx={{margin: 0}}>
                  {address.formatted_address}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: '1em',
              px: '1em',
            }}>
            <Button
              onClick={onClose}
              sx={{mr: '1.5em', color: theme.palette.text.secondary}}
              size="large"
              variant="text">
              {t('Cancel')}
            </Button>
            <Button
              size="large"
              variant="contained"
              disabled={!address}
              onClick={handleConfirm}>
              {t('Confirm Location')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export const MapLocationPicker = (props: Props) => {
  const {isOpen, onClose} = props;

  return (
    <Modal open={isOpen} closeAfterTransition onClose={onClose} disablePortal>
      <MapLocationPickerInner {...props} />
    </Modal>
  );
};
