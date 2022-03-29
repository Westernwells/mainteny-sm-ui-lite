import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {useUserSession} from './useUserSession';

const staticData = {
  id: 'f1db7536-45b9-4657-b09b-201302bd7863',
  serviceManager: {
    id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
    name: 'Bruce',
    address: {
      id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
      fullName: 'Weidenweg 53, 10247 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.454064,
        latitude: 52.5188984,
      },
    },
    serviceCompany: {
      id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
      name: 'Maintenance Experts GmbH',
      contact: {
        phone: '+4791924282',
        email: 'prasad@mainteny.com',
        url: 'https://maintenance-experts.de',
      },
      language: 'en-us',
      settings: {
        nightlyShuffleEnabled: true,
        companyDispatchStrategy: 'BIG_BANG',
        totalYearlyVacationDaysAllowed: 30,
        dateFormat: 'dd/MM/yyyy',
        emailAddresses: [],
        emailBasedServiceOrderProvider: 'NONE',
        serviceOrderAssignmentContactChannels: {
          EMERGENCY: ['PHONE_CALL'],
        },
        whiteLabel: {
          logoPath: 'public/9d85be2d-ceb9-4b19-a350-9f512b4b57e4/logo.png',
        },
      },
      search:
        '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
      meta: {
        createdAt: '2021-05-31T08:32:55.193896Z',
        lastUpdatedAt: '2022-03-02T14:57:06.401381Z',
        state: 'ACTIVE',
      },
    },
    contact: {
      phone: '50957289',
      email: 'email@company.com',
    },
    labels: [],
    additionalInfo: {
      priority: 'NONE',
    },
    search:
      '[name:basf] [address:weidenweg 53, 10247 berlin, germany de] [email:email@company.com] [phone:50957289]',
    meta: {
      createdAt: '2021-06-01T12:09:42.058121Z',
      lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
      state: 'ACTIVE',
    },
  },
  userAccount: {
    id: 'ccc42cd8-1b46-46a1-8d2e-5b6d4a579385',
    username: 'admin@mainteny.com',
    firstName: 'Admin',
    lastName: 'User',
    photoUrl: '',
    contact: {
      phone: '+4900000000000',
    },
    roles: ['ADMIN'],
    serviceCompany: {
      id: 'd6aa11ab-bdec-40ed-85fc-e69a32d61fcc',
      name: 'Mainteny',
      contact: {
        phone: '12345678',
        email: 'admin@mainteny.com',
        url: 'www.mainteny.com',
      },
      language: 'en-us',
      settings: {
        nightlyShuffleEnabled: false,
        companyDispatchStrategy: 'BIG_BANG',
        totalYearlyVacationDaysAllowed: 30,
        dateFormat: 'dd/MM/yyyy',
        emailAddresses: [],
        emailBasedServiceOrderProvider: 'NONE',
        serviceOrderAssignmentContactChannels: {},
      },
      search:
        '[name:mainteny] [email:admin@mainteny.com] [phone:12345678] [url:www.mainteny.com]',
      meta: {
        createdAt: '2020-12-26T13:42:11.888867Z',
        lastUpdatedAt: '2020-12-26T13:42:11.888876Z',
        state: 'ACTIVE',
      },
    },
    status: 'NORMAL',
    meta: {
      createdAt: '2020-12-26T13:44:05.127607Z',
      lastUpdatedAt: '2020-12-26T13:44:05.127608Z',
      state: 'ACTIVE',
    },
  },
  meta: {
    creator: 'ccc42cd8-1b46-46a1-8d2e-5b6d4a579385',
    createdAt: '2022-01-17T15:16:00.874257Z',
    lastUpdatedAt: '2022-01-17T15:16:00.874259Z',
    state: 'ACTIVE',
  },
};
const fetchServiceManager = async (username: string) => {
  // TODO: Fetch API data
  console.log(username);
  //   const response: AxiosResponse<ServiceManager> = await axiosClient({
  //     method: 'GET',
  //     url: `/api/users/propertyManager/${username}`,
  //   });
  return staticData;
};
export const useServiceManager = () => {
  const {user} = useUserSession();
  return useQuery(
    [queryKeys.serviceManager, user?.userAccount.username],
    () => fetchServiceManager(user!.userAccount.username),
    {
      enabled: !!user,
    },
  );
};
