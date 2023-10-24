import {useContext} from 'react';
import {useQuery} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';

import {AddressRecord, RestError} from 'models/misc';
import {companyLanguageToUppercaseMap} from 'utils/utils';
import {UserCompanyContext} from 'context/UserCompanyProvider';
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
  const {company} = useContext(UserCompanyContext);

  const payload: fetchAddressObjectByNameParam = {
    lang: companyLanguageToUppercaseMap[company?.language || 'en-us'],
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
