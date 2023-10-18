import {useQuery} from 'react-query';
import axios from 'axios';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';

import {Coord, GeocodeAddressView} from 'models/misc';

const BASE_URL = 'https://maps.googleapis.com/maps/api';

export const coordsToAddress = async (payload: Coord | null) => {
  const latlng = `${payload!?.lat},${payload!?.lng}`;

  const url = `${BASE_URL}/geocode/json`;
  const queryString = {
    latlng,
    key: import.meta.env.REACT_APP_GOOGLE_MAPS_KEY,
  };

  const response = await axios.get<GeocodeAddressView>(url, {
    params: queryString,
  });
  return response.data;
};

export const useCoordsToAddress = (payload: Coord | null) => {
  const {showError} = useSnackbar();

  return useQuery(
    [queryKeys.coordsToAddress, payload!?.lat, payload!?.lng],
    () => coordsToAddress(payload),
    {
      enabled: !!(payload?.lat && payload?.lng),
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};
