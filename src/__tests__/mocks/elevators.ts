import {
  ElevatorCategory,
  ElevatorStatus,
  ElevatorTimeRuleType,
  ElevatorView,
} from 'models/elevator';
import {InspectionCycle, Priority, State} from 'models/misc';
import {Role, UserAccountStatus} from 'models/user';
import {vi} from 'vitest';
import {
  ContractServiceFormElevator,
  ContractSimpleView,
  ContractStatus,
  ContractTimeUnit,
  ContractTypes,
} from '../../models/contract';
import {ArticleType} from '../../models/article';
import {ServiceOrderType} from '../../models/service-order';

const elevatorOne: ContractServiceFormElevator = {
  elevatorId: '369ea946-df3b-47b8-a3b9-eddfdbfb805e',
  invoiceJob: {
    timeUnit: ContractTimeUnit.NONE,
    timeNumbers: [],
  },
  orderGenerationJob: {
    timeUnit: ContractTimeUnit.TRIWEEKLY,
    timeNumbers: [],
  },
  price: 1000,
  externalId: 'UNIT00000091',
  address: 'Kehinde Owolabi Street 33, 102213, Lagos, Lagos, Nigeria',
  buildingLocation: '-',
  isChecked: true,
};

const elevatorTwo: ContractServiceFormElevator = {
  elevatorId: '4696ec59-93a1-4228-8ad3-cf5ccdd18982',
  invoiceJob: {
    timeUnit: ContractTimeUnit.NONE,
    timeNumbers: [],
  },
  orderGenerationJob: {
    timeUnit: ContractTimeUnit.MONTHLY,
    timeNumbers: [2, 5],
  },
  price: 1500,
  externalId: 'UNIT00000076',
  address: '10178, Berlin, Berlin, Germany',
  buildingLocation: '-',
  isChecked: true,
};

export const SERVICE_ELEVATORS: ContractServiceFormElevator[] = [
  elevatorOne,
  elevatorTwo,
];

export const mockValidElevatorContracts: ContractSimpleView = {
  id: 'fec39a78-eaad-43ec-8e63-1b16354e523b',
  name: 'normal invoice cycle',
  number: 'CTA000030',
  externalId: 'CTA000030',
  type: ContractTypes.SERVICE,
  visitsNumber: 0,
  sla: 0,
  spendingLimit: 0,
  currency: 'EUR',
  start: '2024-08-04',
  end: '2024-08-30',
  status: ContractStatus.VALID,
  components: [
    {
      id: 'e83130d9-d9d1-47e0-907b-84657f3c0df8',
      name: 'Test with unit',
      group: '',
      additionalInfo: {
        elevators: [
          {
            elevatorId: 'd3cea6f8-6170-497e-9937-2d0bb97bfad7',
            invoiceJob: {
              timeUnit: ContractTimeUnit.ANNUALLY,
              timeNumbers: [],
            },
            orderGenerationJob: {
              timeUnit: ContractTimeUnit.MONTHLY,
              timeNumbers: [],
            },
            price: 2000,
          },
          {
            elevatorId: 'dea7464c-6a50-4ef9-8115-ffc35ceae340',
            invoiceJob: {
              timeUnit: ContractTimeUnit.ANNUALLY,
              timeNumbers: [],
            },
            orderGenerationJob: {
              timeUnit: ContractTimeUnit.MONTHLY,
              timeNumbers: [],
            },
            price: 2000,
          },
        ],
        costType: ArticleType.LABOR,
        costPackage: {
          laborPercentage: 50,
          materialPercentage: 50,
        },
        yearlyPrice: 4000,
      },
    },
    {
      id: '3b6dd1d9-f17d-4d2b-9afe-6a1a7f2e7e7d',
      name: 'test',
      group: '',
      additionalInfo: {
        firstInvoiceDate: new Date('2024-08-05'),
        elevators: [
          {
            elevatorId: '4fd5afc6-af64-4f15-944e-996e3f15da4e',
            invoiceJob: {
              timeUnit: ContractTimeUnit.ANNUALLY,
              timeNumbers: [],
            },
            orderGenerationJob: {
              timeUnit: ContractTimeUnit.MONTHLY,
              timeNumbers: [],
            },
            price: 3000,
          },
          {
            elevatorId: 'dea7464c-6a50-4ef9-8115-ffc35ceae340',
            invoiceJob: {
              timeUnit: ContractTimeUnit.ANNUALLY,
              timeNumbers: [],
            },
            orderGenerationJob: {
              timeUnit: ContractTimeUnit.MONTHLY,
              timeNumbers: [],
            },
            price: 3000,
          },
        ],
        costType: ArticleType.LABOR,
        costPackage: {
          laborPercentage: 0,
          materialPercentage: 0,
        },
        yearlyPrice: 6000,
        orderType: ServiceOrderType.CALLOUT,
      },
    },
  ],
  search:
    '[externalid:cta000030] [name:normal_invoice_cycle] [number:cta000030] [propertyowner:ca] [type:service] [currency:eur] [status:valid]',
  meta: {
    creator: {
      id: '68ee2518-25d6-42e4-baaa-ea7e0bbc322b',
      username: 'test3@abcd.com',
      firstName: '123',
      lastName: '123',
      photoUrl: '',
      contact: {
        phone: '+4900000000',
        email: 'test3@abcd.com',
      },
      category: '',
      title: '',
      serviceCompanyId: '8cc48198-7011-4f95-9150-7e31eca3098f',
      roles: [Role.SERVICE_MANAGER],
      status: UserAccountStatus.RESET_PASSWORD,
    },
    createdAt: '2024-08-04T21:44:17.325797Z',
    lastUpdatedAt: '2024-08-21T09:45:44.944967Z',
    state: State.ACTIVE,
  },
  additionalInfo: {},
  endTime: '',
  startTime: '',
};

export const mockExpiredElevatorContracts = {
  id: '43a25d45-cc5b-4bcf-a03e-f4b874bb91ad',
  name: 'MEDIUM',
  number: 'CN00000002',
  externalId: 'CTA000014',
  type: ContractTypes.SERVICE,
  visitsNumber: 5,
  sla: 0,
  spendingLimit: 0,
  currency: 'EUR',
  start: '2023-09-15',
  end: '2023-09-16',
  status: ContractStatus.EXPIRED,
  components: [],
  search:
    '[externalid:cta000014] [name:medium] [number:cn00000002] [propertyowner:x_ero_tester] [type:service] [currency:eur] [status:expired]',
  meta: {
    creator: {
      id: 'de2f01cb-fbe2-4187-ab50-6d677bc5d6b8',
      username: 'pur@gmail.com',
      firstName: 'Arya',
      lastName: 'Stark',
      photoUrl: '',
      contact: {
        phone: '+4992639928',
        email: 'pur@gmail.com',
      },
      category: '',
      title: '',
      serviceCompanyId: '8cc48198-7011-4f95-9150-7e31eca3098f',
      roles: [Role.SERVICE_MANAGER, Role.TECHNICIAN],
      status: UserAccountStatus.RESET_PASSWORD,
    },
    createdAt: '2023-09-15T19:20:36.732463Z',
    lastUpdatedAt: '2024-04-30T12:32:07.902798Z',
    state: State.ACTIVE,
  },
};

// made it partial because fields are not present from api return data
export const mockElevatorContracts: Partial<ContractSimpleView>[] = [
  mockValidElevatorContracts,
  mockExpiredElevatorContracts,
];

export const mockElevator: ElevatorView = {
  id: 'd3cea6f8-6170-497e-9937-2d0bb97bfad7',
  number: 'U00015',
  externalId: 'U00015',
  serialNumber: '',
  model: '',
  type: '',
  capacity: '',
  category: ElevatorCategory.ELEVATOR,
  technicianNumber: 2,
  address: {
    id: '454832d1-593f-41ef-9d30-b876010b682a',
    fullName: 'gehsfaveh2, 28372, gaheb, Germany',
    countryCode: '',
    location: {
      longitude: 0,
      latitude: 0,
    },
    component: {
      name: '',
      street: 'gehsfaveh2',
      street2: '',
      city: 'gaheb',
      postalCode: '28372',
      state: '',
      country: 'Germany',
    },
  },
  propertyOwner: {
    id: '96288f9d-c8c6-44b1-82b2-666d67ce63a3',
    name: 'Wohnungsbaugesellschaft Königs Wusterhausen',
    number: 'CU0007',
    externalId: 'CU0007',
    billingAddress: {
      id: '32be24f2-6fc2-48eb-9b44-105ef5d2cd40',
      fullName:
        'Abteilung Sicherheit und Brandschutz z.H. Herr Schmitt und Frau Klecks, Strasse am grossen und kleinen Teich 4, 15712, Königs Wusterhausen OT Zernsdorf, Bremen, Germany',
      countryCode: '',
      location: {
        longitude: 0,
        latitude: 0,
      },
      component: {
        name: 'Abteilung Sicherheit und Brandschutz z.H. Herr Schmitt und Frau Klecks',
        street: 'Strasse am grossen und kleinen Teich 4',
        street2: '',
        city: 'Königs Wusterhausen OT Zernsdorf',
        postalCode: '15712',
        state: 'Bremen',
        country: 'Germany',
      },
    },
    contact: {
      phone: '',
      email: '',
      url: '',
    },
    labels: [],
    additionalInfo: {
      priority: Priority.NONE,
      billingEmail: '',
      registrationDate: '2024-05-16',
      costCenter: '',
      secondaryPhoneNumber: '',
      vatId: '',
      offsettingAccount: '',
      customerPortalEnabled: true,
    },
    meta: {
      creator: {
        id: '880abb83-79a8-4219-afe5-dd9dbd29eed0',
        username: 'peikereva@gmail.com',
        firstName: 'Eva',
        lastName: 'Peikereva',
        photoUrl: '',
        contact: {
          phone: '+4917647150761',
          email: 'peikereva@gmail.com',
        },
        category: '',
        title: '',
        serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
        roles: [Role.SERVICE_MANAGER, Role.CONTRACTOR, Role.TECHNICIAN],
        status: UserAccountStatus.RESET_PASSWORD,
      },
      createdAt: '2024-05-16T07:01:30.814988Z',
      lastUpdatedAt: '2024-07-18T07:01:06.919760Z',
      state: State.ACTIVE,
    },
    search: '',
  },
  lastVisitDate: '2024-04-03',
  serviceTime: 60,
  status: ElevatorStatus.RUNNING,
  properties: [
    {
      id: '6a67aaae-48ae-4c36-b307-2ce10e637075',
      elevatorId: '8cfd0618-feb4-4386-95be-260e90579fda',
      key: 'Response time',
      value: '120.0',
    },
    {
      id: 'f39a70ba-38b3-485d-911b-d7bdad0361db',
      elevatorId: '8cfd0618-feb4-4386-95be-260e90579fda',
      key: 'Availability',
      value: '0.9997716894977169',
    },
    {
      id: '1103699d-34db-426e-9aaa-ad5c8267d26e',
      elevatorId: '8cfd0618-feb4-4386-95be-260e90579fda',
      key: 'Statistics last updated',
      value: '2024-07-21',
    },
  ],
  timeRules: [
    {
      type: ElevatorTimeRuleType.DAYS_OF_WEEK_AND_TIME_RANGE,
      data: JSON.stringify([{daysOfWeek: [], timeRange: {start: '', end: ''}}]),
      id: '',
      elevator_id: '',
    },
  ],
  labels: [],
  additionalInfo: {
    priority: Priority.NONE,
    isServiceOrderGenerationEnabled: true,
    manufacturer: '',
    keyLocation: '',
    lastInspectionDate: '2024-04-03',
    buildingLocation: '',
    cabinType: '',
    propertySegment: '',
    documents: [],
    pictures: [
      {
        id: 'ad8df315-de3e-48e2-b5c8-3a37deb5cb02',
        uri: 'b270952a-7d58-458f-8259-4fd4091612fd/elevators/8cfd0618-feb4-4386-95be-260e90579fda/images/Bildschirmfoto 2024-05-16 um 09.29.58.png',
        type: 'image/png',
        description: 'Bildschirmfoto 2024-05-16 um 09',
        serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
        createdAt: '2024-05-16T07:30:21.432089Z',
      },
      {
        id: '33d1a569-cccb-45c7-bc25-0156eff7c644',
        uri: 'b270952a-7d58-458f-8259-4fd4091612fd/elevators/8cfd0618-feb4-4386-95be-260e90579fda/images/Untitled document.pdf',
        type: 'application/pdf',
        description: 'Untitled document',
        serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
        createdAt: '2024-05-16T07:30:40.593099Z',
      },
    ],
    parking: '',
    controllerModel: '',
    controllerManufacturer: '',
    customerAppointment: {
      shouldNotifyCustomer: true,
      appointmentNotificationDue: 1,
      requiresAppointment: true,
    },
    travelFee: 0,
    emergencyPhoneProvider: '',
    numberOfStops: 5,
    drive: '',
    speed: '',
    controller: '',
    iotDevice: '',
    cageWeight: '',
    counterWeight: '',
    hoistingHeight: '',
    shaftHeight: '',
    spendingLimit: 0,
    distance: 0,
    travelTime: 0,
    inspectionCycle: InspectionCycle.NONE,
    numberOfPeople: 0,
    deviceIds: [],
    dueDate: '',
    serviceOrderGenerationEnabled: false,
    builtYear: 0,
    emergencyContactNumber: '',
  },
  assignments: [],
  contracts: [],
  search:
    '[address:gehsfaveh2,_28372,_gaheb,_germany_] [status:running] [externalid:u00015] [number:u00015] [serialnumber:] [model:] [type:] [capacity:] [category:elevator] [po:name:customername] [po:number:cu0007] [po:externalid:cu0007] [po:ct:email:] [po:ct:phone:] [po:ct:url:] [po:billingaddress:kunde3,_this_is_a_suuuuuuuuuuuuuuuuuuper_long_street_name_34,_33333,_anda_suuuuuuper_looooooooong_city_name,_bremen,_germany_] [buildinglocation:]',
  availability: 0,
  nextVisitDate: '',
  meta: {
    creator: {
      id: '880abb83-79a8-4219-afe5-dd9dbd29eed0',
      username: 'peikereva@gmail.com',
      firstName: 'Eva',
      lastName: 'Peikereva',
      photoUrl: '',
      contact: {
        phone: '+4917647150761',
        email: 'peikereva@gmail.com',
      },
      category: '',
      title: '',
      serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
      roles: [Role.SERVICE_MANAGER, Role.CONTRACTOR, Role.TECHNICIAN],
      status: UserAccountStatus.RESET_PASSWORD,
    },
    createdAt: '2024-05-16T07:01:30.814988Z',
    lastUpdatedAt: '2024-07-18T07:01:06.919760Z',
    state: State.ACTIVE,
  },
};

export const mockI18n = () => {
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }),
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  }));
};
