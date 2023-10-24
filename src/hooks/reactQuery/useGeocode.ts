import {useQuery} from 'react-query';
import axios from 'axios';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';

import {Coord, GeocodeAddressView} from 'models/misc';
import {useContext} from 'react';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {companyLanguageContextMap} from 'utils/utils';

const BASE_URL = 'https://maps.googleapis.com/maps/api';

interface CoordsToAddressPayload extends Coord {
  language?: string;
}

export const coordsToAddress = async (
  payload: CoordsToAddressPayload | null,
) => {
  const latlng = `${payload!?.lat},${payload!?.lng}`;

  const url = `${BASE_URL}/geocode/json`;
  const queryString = {
    latlng,
    key: import.meta.env.REACT_APP_GOOGLE_MAPS_KEY,
    language: payload?.language,
  };

  const response = await axios.get<GeocodeAddressView>(url, {
    params: queryString,
  });
  return response.data;
};

export const useCoordsToAddress = (payload: CoordsToAddressPayload | null) => {
  const {showError} = useSnackbar();
  const {company} = useContext(UserCompanyContext);
  const language = companyLanguageContextMap[company?.language || 'en-us'];

  if (payload) {
    payload.language = language;
  }

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
