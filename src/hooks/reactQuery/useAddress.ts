import {useContext} from 'react';
import {useQuery} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';

import {AddressRecord, Language, RestError} from 'models/misc';
import {LanguageContext} from 'context/LanguageProvider';
import {languageContextMap} from 'utils/utils';
import {useUserSession} from './useUserSession';

export interface fetchAddressObjectByNameParam {
  lang: string;
  name: string;
  serviceCompanyId: string;
}

export const fetchAddressObjectByName = async (
  params: fetchAddressObjectByNameParam,
): Promise<AddressRecord> => {
  const response = await axiosClient.get<AddressRecord>(`/api/addresses`, {
    params,
    paramsSerializer,
  });
  return response.data;
};

export function useFetchAddressObjectByName(name: string) {
  const {user} = useUserSession();
  const {language} = useContext(LanguageContext);

  const payload: fetchAddressObjectByNameParam = {
    lang: languageContextMap[language] || Language.EN_US,
    name,
    serviceCompanyId: user?.userAccount.serviceCompany.id as string,
  };

  return useQuery<AddressRecord, RestError>(
    [name],
    () => fetchAddressObjectByName(payload),
    {
      enabled: !!name,
    },
  );
}
