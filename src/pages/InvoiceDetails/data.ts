import {ElevatorCategory, ElevatorStatus} from 'models/elevator';
import {Address, Meta, Priority, State} from 'models/misc';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';

const meta: Meta = {
  createdAt: '2021-01-12',
  creator: 'mainteny-admin',
  lastUpdatedAt: '2021-01-12',
  state: State.ACTIVE,
};
const address: Address = {
  id: 'add-001',
  fullName: 'McDonald',
  countryCode: 'DE',
  location: {
    longitude: 0,
    latitude: 0,
  },
};

export const invoiceDetail = {
  id: 'c986b9b9-da45-4ff9-8675-4ea0491fac8b',
  number: 'INV000006',
  description: 'some invoice',
  propertyOwner: {
    id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
    name: 'BASF',
    serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
    address: {
      id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
      fullName: 'Weidenweg 53, 10247 Berlin, Germany',
      countryCode: 'DE',
      location: {longitude: 13.454064, latitude: 52.5188984},
    },
    contact: {phone: '50957289', email: 'email@company.com'},
    labels: [],
    additionalInfo: {priority: 'NONE'},
    meta: {
      createdAt: '2021-06-01T12:09:42.058121Z',
      lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
      state: 'ACTIVE',
    },
  },
  serviceCompany: {
    id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
    name: 'Maintenance Experts GmbH',
    meta: {
      createdAt: '2021-05-31T08:32:55.193896Z',
      lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
      state: 'ACTIVE',
    },
  },
  issuedDate: '2022-02-10',
  status: 'NOT_PAID',
  serviceOrder: {
    id: '18981d1d-98f7-49f9-ab32-884c0c16a989',
    number: 'MT-0004329',
    externalID: '',
    serviceCompany: {
      id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
      name: 'Maintenance Experts GmbH',
      meta: {
        createdAt: '2021-05-31T08:32:55.193896Z',
        lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
        state: 'ACTIVE',
      },
    },
    elevator: {
      id: 'ce046a5d-e4ce-4e87-baa3-572ee0e36c83',
      number: '321',
      model: 'Hitachi',
      type: '-',
      capacity: '-',
      category: 'ROLLER_DOOR',
      address: {
        id: '96e3c8ee-fa5f-4fe5-8db4-d35a0e9b45dc',
        fullName: 'Barfusstraße 14, 13349 Berlin, Germany',
        countryCode: 'DE',
        location: {longitude: 13.347501, latitude: 52.5554968},
      },
      propertyOwner: {
        id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
        name: 'BASF',
        serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
        address: {
          id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
          fullName: 'Weidenweg 53, 10247 Berlin, Germany',
          countryCode: 'DE',
          location: {longitude: 13.454064, latitude: 52.5188984},
        },
        contact: {phone: '50957289', email: 'email@company.com'},
        labels: [],
        additionalInfo: {priority: 'NONE'},
        meta: {
          createdAt: '2021-06-01T12:09:42.058121Z',
          lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
          state: 'ACTIVE',
        },
      },
      lastVisitDate: '2022-02-11',
      serviceTime: 60,
      status: 'RUNNING',
      labels: [],
      additionalInfo: {
        priority: 'NONE',
        isServiceOrderGenerationEnabled: true,
      },
      meta: {
        createdAt: '2021-06-01T12:07:00.903824Z',
        lastUpdatedAt: '2021-06-01T12:07:00.903824Z',
        state: 'ACTIVE',
      },
    },
    contract: {
      id: '9b34b8f6-9da0-4928-8a14-71f7229a5ffc',
      number: 'CNT000214',
      type: 'BASIC',
      visitsNumber: 4,
      sla: 0,
      spendingLimit: 0,
      price: 0,
      hourlyRate: 0,
      currency: 'EUR',
      startTime: '2020-12-03T00:00:00Z',
      endTime: '2023-01-01T00:00:00Z',
      status: 'VALID',
      search:
        '[propertyowner:basf] [contracttype:basic] [currency:eur] [status:valid]',
      meta: {
        createdAt: '2021-06-01T12:07:01.193205Z',
        lastUpdatedAt: '2021-06-01T12:07:01.193206Z',
        state: 'ACTIVE',
      },
    },
    description: 'Quarterly Regular Maintenance Q1 2022',
    type: 'REGULAR',
    status: 'COMPLETED',
    lastVisitDate: '2021-03-18',
    expectedVisitDate: '2022-01-28',
    dueDate: '2022-01-28',
    actualEndTime: '2022-02-11T11:36:21.235689Z',
    serviceTime: 120,
    schedules: [
      {
        id: 'e54bbe46-ef36-48c4-b036-d794309a76e8',
        serviceOrderId: '18981d1d-98f7-49f9-ab32-884c0c16a989',
        technician: {
          id: '72e227b4-9271-44f2-a8a1-febd31c306f8',
          address: {
            id: '6377e534-6140-4692-8cf9-24bb620e0642',
            fullName: 'Parkstraße 5, Trebbin, Germany',
            countryCode: 'DE',
            location: {longitude: 13.2244631, latitude: 52.2173497},
          },
          userAccount: {
            id: '39d96a97-80f6-44a9-84a3-9bef6251ef41',
            username: 'otto@haun.com',
            firstName: 'Otto',
            lastName: 'Haun',
            photoUrl: '',
            contact: {phone: ' +4900000000000', email: 'otto@haun.com'},
            roles: ['TECHNICIAN'],
            status: 'RESET_PASSWORD',
            meta: {
              createdAt: '2021-05-31T21:58:35.871299Z',
              lastUpdatedAt: '2021-11-06T08:45:42.928184Z',
              state: 'ACTIVE',
            },
          },
          isOnline: true,
          additionalInfo: {
            leftVacationDays: 30.0,
            assignedServiceOrderTypes: [],
          },
          meta: {
            createdAt: '2021-05-31T21:58:36.047312Z',
            lastUpdatedAt: '2021-11-06T08:45:42.935390Z',
            state: 'ACTIVE',
          },
        },
        startTime: '2022-02-11T09:01:00',
        endTime: '2022-02-11T10:01:00',
        type: 'AUTO',
        source: 'NIGHTLY_SHUFFLE',
        createdAt: '2022-02-11T00:05:04.168813Z',
      },
    ],
    additionalInfo: {
      appointmentNotificationSent: false,
      appointmentConfirmed: false,
      appointmentNotificationRequired: false,
      priority: 'A',
    },
    labels: [],
    search:
      '[number:mt-0004329] [externalid:] [type:regular] [status:completed] [address:barfusstraße 14, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:321] [model:hitachi] [type:-] [capacity:-] [category:roller_door] [propertyowner:basf] [contracttype:basic] [currency:eur] [status:valid]',
    meta: {
      creator: 'd47616e7-f51f-42f3-a832-b228324d02c9',
      createdAt: '2022-01-17T17:35:13.787545Z',
      lastUpdatedAt: '2022-02-11T11:36:21.440748Z',
      state: 'ACTIVE',
    },
  },
  items: [
    {
      id: '8765d136-912c-4167-a030-12de7ba22bcb',
      invoiceId: 'c986b9b9-da45-4ff9-8675-4ea0491fac8b',
      name: 'our invoice',
      unitPrice: {amount: 1500, currency: 'EUR', fractionDigits: 2},
      quantity: 3,
      vat: 10,
      totalAmount: {amount: 4950, currency: 'EUR', fractionDigits: 2},
      totalAmountWithoutVat: {
        amount: 4500,
        currency: 'EUR',
        fractionDigits: 2,
      },
      vatAmount: {amount: 450, currency: 'EUR', fractionDigits: 2},
    },
  ],
  totalAmount: {amount: 4950, currency: 'EUR', fractionDigits: 2},
  additionalInfo: {
    pdfPath:
      '9d85be2d-ceb9-4b19-a350-9f512b4b57e4/invoices/c986b9b9-da45-4ff9-8675-4ea0491fac8b.pdf',
    pdfGenerationStatus: 'DONE',
    dueDate: '2022-02-15',
  },
  search:
    '[number:inv000006] [issueddate:2022-02-10] [name:basf] [address:weidenweg 53, 10247 berlin, germany de] [email:email@company.com] [phone:50957289] [name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de] [number:mt-0004329] [externalid:] [type:regular] [status:completed] [address:barfusstraße 14, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:321] [model:hitachi] [type:-] [capacity:-] [category:roller_door] [propertyowner:basf] [contracttype:basic] [currency:eur] [status:valid]',
  meta: {
    creator: 'ccc42cd8-1b46-46a1-8d2e-5b6d4a579385',
    createdAt: '2022-02-11T11:36:39.760600Z',
    lastUpdatedAt: '2022-02-11T11:36:39.760602Z',
    state: 'ACTIVE',
  },
  totalAmountWithoutVat: {amount: 4500, currency: 'EUR', fractionDigits: 2},
  vatAmount: {amount: 450, currency: 'EUR', fractionDigits: 2},
};

export const workReportText = `Secured lift and counterweight for disconnection of engine and brake. Disassembled engine with brake and
delivered it to a workshop in Råde.

Picked up engine at workshop. Mounted motor with brake and removed securing of lift and counterweight. Refilled oil on the gear unit between the hoist and the shaft for chains. Controlled brake, ok. Controlled stop length in the
event of a breakdown of photocells. Average stop length: 7.5 cm. Max stop length: 16.5 cm. Elevator put into operation`;
export const invoiceUrl = '/pm/INV000128.pdf';
