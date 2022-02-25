import {ElevatorsByAddress} from './Models';

export const elevatorResponse = {
  elevator: {
    data: [
      {
        id: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
        number: '7',
        model: 'Thyssenkrupp',
        type: '-',
        capacity: '-',
        category: 'GARAGE_DOOR',
        technicianNumber: 1,
        address: {
          id: 'ae2ebc30-e032-4688-bd04-35c5a8ac37ef',
          fullName: 'Ziegelstraße 4, 10117 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.3892792,
            latitude: 52.52337430000001,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
          meta: {
            createdAt: '2021-06-01T12:09:42.058121Z',
            lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
            state: 'ACTIVE',
          },
        },
        lastVisitDate: '2022-02-21',
        serviceTime: 60,
        status: 'RUNNING',
        labels: [],
        additionalInfo: {
          priority: 'NONE',
          isServiceOrderGenerationEnabled: true,
        },
        search:
          '[address:ziegelstraße 4, 10117 berlin, germany de] [propertyowner:basf] [status:running] [number:7] [model:thyssenkrupp] [type:-] [capacity:-] [category:garage_door]',
        meta: {
          createdAt: '2021-06-01T11:59:58.955582Z',
          lastUpdatedAt: '2021-06-01T11:59:59.329263Z',
          state: 'ACTIVE',
        },
      },
      {
        id: '3e2bc9e9-c795-4ba5-b5b7-613e49420c4e',
        number: '442',
        model: 'Orona',
        type: '-',
        capacity: '-',
        category: 'BOARDING_BRIDGE',
        technicianNumber: 1,
        address: {
          id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
          fullName: 'Weidenweg 53, 10247 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.454064,
            latitude: 52.5188984,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
          meta: {
            createdAt: '2021-06-01T12:09:42.058121Z',
            lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
            state: 'ACTIVE',
          },
        },
        lastVisitDate: '2021-03-02',
        serviceTime: 60,
        status: 'RUNNING',
        labels: [],
        additionalInfo: {
          priority: 'NONE',
          isServiceOrderGenerationEnabled: true,
        },
        search:
          '[address:weidenweg 53, 10247 berlin, germany de] [propertyowner:basf] [status:running] [number:442] [model:orona] [type:-] [capacity:-] [category:boarding_bridge]',
        meta: {
          createdAt: '2021-06-01T12:10:04.892575Z',
          lastUpdatedAt: '2021-06-01T12:10:04.892575Z',
          state: 'ACTIVE',
        },
      },
      {
        id: 'ce046a5d-e4ce-4e87-baa3-572ee0e36c83',
        number: '321',
        model: 'Hitachi',
        type: '-',
        capacity: '-',
        category: 'ROLLER_DOOR',
        technicianNumber: 1,
        address: {
          id: '96e3c8ee-fa5f-4fe5-8db4-d35a0e9b45dc',
          fullName: 'Barfusstraße 14, 13349 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.347501,
            latitude: 52.5554968,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
        search:
          '[address:barfusstraße 14, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:321] [model:hitachi] [type:-] [capacity:-] [category:roller_door]',
        meta: {
          createdAt: '2021-06-01T12:07:00.903824Z',
          lastUpdatedAt: '2021-06-01T12:07:00.903824Z',
          state: 'ACTIVE',
        },
      },
      {
        id: '5b9b08ec-1cc3-4629-ae59-dea17b031ec8',
        number: '427',
        model: 'Kone',
        type: '-',
        capacity: '-',
        category: 'REVOLVING_GATE',
        technicianNumber: 1,
        address: {
          id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
          fullName: 'Weidenweg 53, 10247 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.454064,
            latitude: 52.5188984,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
          meta: {
            createdAt: '2021-06-01T12:09:42.058121Z',
            lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
            state: 'ACTIVE',
          },
        },
        lastVisitDate: '2022-01-17',
        serviceTime: 60,
        status: 'RUNNING',
        labels: [],
        additionalInfo: {
          priority: 'NONE',
          isServiceOrderGenerationEnabled: true,
        },
        search:
          '[address:weidenweg 53, 10247 berlin, germany de] [propertyowner:basf] [status:running] [number:427] [model:kone] [type:-] [capacity:-] [category:revolving_gate]',
        meta: {
          createdAt: '2021-06-01T12:09:42.327049Z',
          lastUpdatedAt: '2021-06-01T12:09:42.327049Z',
          state: 'ACTIVE',
        },
      },
      {
        id: '3501e880-48c7-430b-8627-bf6600c342e2',
        number: '249',
        model: 'Otis',
        type: '-',
        capacity: '-',
        category: 'ELEVATOR',
        technicianNumber: 1,
        address: {
          id: '0c4fa7c1-84a6-4588-bd03-bfdbe7eaa829',
          fullName: 'Nazarethkirchstraße 49, 13347 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.3599439,
            latitude: 52.5481622,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
          meta: {
            createdAt: '2021-06-01T12:09:42.058121Z',
            lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
            state: 'ACTIVE',
          },
        },
        lastVisitDate: '2021-01-25',
        serviceTime: 60,
        status: 'RUNNING',
        labels: [],
        additionalInfo: {
          priority: 'NONE',
          isServiceOrderGenerationEnabled: true,
        },
        search:
          '[address:nazarethkirchstraße 49, 13347 berlin, germany de] [propertyowner:basf] [status:running] [number:249] [model:otis] [type:-] [capacity:-] [category:elevator]',
        meta: {
          createdAt: '2021-06-01T12:05:18.194605Z',
          lastUpdatedAt: '2021-06-01T12:05:18.194606Z',
          state: 'ACTIVE',
        },
      },
      {
        id: 'c56b2c03-4aa1-4fb9-9316-43c6714e0c0f',
        number: '322',
        model: 'Lutz',
        type: '-',
        capacity: '-',
        category: 'REVOLVING_GATE',
        technicianNumber: 1,
        address: {
          id: '70c6ef3f-0f1b-42bb-9ef3-6bfbc1b9ed90',
          fullName: 'Müllerstraße 64, 13349 Berlin, Germany',
          countryCode: 'DE',
          location: {
            longitude: 13.3425078,
            latitude: 52.55588940000001,
          },
        },
        propertyOwner: {
          id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
          name: 'BASF',
          serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
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
          meta: {
            createdAt: '2021-06-01T12:09:42.058121Z',
            lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
            state: 'ACTIVE',
          },
        },
        lastVisitDate: '2022-01-17',
        serviceTime: 60,
        status: 'RUNNING',
        labels: [],
        additionalInfo: {
          priority: 'NONE',
          isServiceOrderGenerationEnabled: true,
        },
        search:
          '[address:müllerstraße 64, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:322] [model:lutz] [type:-] [capacity:-] [category:revolving_gate]',
        meta: {
          createdAt: '2021-06-01T12:07:02.258338Z',
          lastUpdatedAt: '2021-06-01T12:07:02.258338Z',
          state: 'ACTIVE',
        },
      },
    ],
    total: 6,
    page: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
  centerCoord: {
    longitude: 13.391243071398833,
    latitude: 52.53679582850382,
  },
};

export const elevatorsByAddressList = [
  {
    elevators: [
      {
        elevator: {
          id: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
          number: '7',
          model: 'Thyssenkrupp',
          type: '-',
          capacity: '-',
          category: 'GARAGE_DOOR',
          technicianNumber: 1,
          address: {
            id: 'ae2ebc30-e032-4688-bd04-35c5a8ac37ef',
            fullName: 'Ziegelstraße 4, 10117 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.3892792,
              latitude: 52.52337430000001,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
            meta: {
              createdAt: '2021-06-01T12:09:42.058121Z',
              lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
              state: 'ACTIVE',
            },
          },
          lastVisitDate: '2022-02-21',
          serviceTime: 60,
          status: 'RUNNING',
          labels: [],
          additionalInfo: {
            priority: 'NONE',
            isServiceOrderGenerationEnabled: true,
          },
          search:
            '[address:ziegelstraße 4, 10117 berlin, germany de] [propertyowner:basf] [status:running] [number:7] [model:thyssenkrupp] [type:-] [capacity:-] [category:garage_door]',
          meta: {
            createdAt: '2021-06-01T11:59:58.955582Z',
            lastUpdatedAt: '2021-06-01T11:59:59.329263Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
        serviceOrder: {
          id: 'bc8e059e-f092-477b-b733-1fe9281ae741',
          number: 'MT-0003784',
          externalID: 'system',
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
            id: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
            number: '7',
            model: 'Thyssenkrupp',
            type: '-',
            capacity: '-',
            category: 'GARAGE_DOOR',
            address: {
              id: 'ae2ebc30-e032-4688-bd04-35c5a8ac37ef',
              fullName: 'Ziegelstraße 4, 10117 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.3892792,
                latitude: 52.52337430000001,
              },
            },
            propertyOwner: {
              id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
              name: 'BASF',
              serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
              address: {
                id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
                fullName: 'Weidenweg 53, 10247 Berlin, Germany',
                countryCode: 'DE',
                location: {
                  longitude: 13.454064,
                  latitude: 52.5188984,
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
              meta: {
                createdAt: '2021-06-01T12:09:42.058121Z',
                lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
                state: 'ACTIVE',
              },
            },
            lastVisitDate: '2022-02-21',
            serviceTime: 60,
            status: 'RUNNING',
            labels: [],
            additionalInfo: {
              priority: 'NONE',
              isServiceOrderGenerationEnabled: true,
            },
            meta: {
              createdAt: '2021-06-01T11:59:58.955582Z',
              lastUpdatedAt: '2021-06-01T11:59:59.329263Z',
              state: 'ACTIVE',
            },
          },
          contract: {
            id: 'db839b4a-9864-4181-8da1-2b93f59ef1a2',
            number: 'CNT000021',
            type: 'BASIC',
            visitsNumber: 4,
            sla: 0,
            spendingLimit: 0,
            price: 0,
            hourlyRate: 0,
            currency: 'EUR',
            startTime: '2020-12-03T00:00:00Z',
            endTime: '2022-04-01T00:00:00Z',
            status: 'VALID',
            search:
              '[propertyowner:basf] [contracttype:basic] [currency:eur] [status:valid]',
            meta: {
              createdAt: '2021-06-01T11:59:59.477557Z',
              lastUpdatedAt: '2021-06-01T11:59:59.477558Z',
              state: 'ACTIVE',
            },
          },
          description: 'Regular Maintenance',
          type: 'REGULAR',
          status: 'COMPLETED',
          lastVisitDate: '2021-02-12',
          expectedVisitDate: '2021-05-14',
          dueDate: '2021-06-14',
          actualEndTime: '2022-02-21T16:30:18.866829Z',
          serviceTime: 120,
          schedules: [
            {
              id: '8f309fb4-abd6-4ff8-bcc1-87a3d58cc681',
              serviceOrderId: 'bc8e059e-f092-477b-b733-1fe9281ae741',
              technician: {
                id: '3ed3e584-b48c-4e61-98a3-9cbcae7ff7ab',
                address: {
                  id: 'f5962572-9cb4-400b-be0b-753ea6e24c34',
                  fullName: 'Parkstraße 10, 14959 Trebbin, Germany',
                  countryCode: 'DE',
                  location: {
                    longitude: 13.2260946,
                    latitude: 52.21720089999999,
                  },
                },
                userAccount: {
                  id: 'bc369bd1-1a75-4ae4-8d3f-83530d6fa375',
                  username: 'james@bond.com',
                  firstName: 'Felix',
                  lastName: 'Bond',
                  photoUrl: '',
                  contact: {
                    phone: ' +4900000000000',
                    email: 'james@bond.com',
                  },
                  roles: ['TECHNICIAN'],
                  status: 'NORMAL',
                  meta: {
                    createdAt: '2021-05-31T08:56:22.437364Z',
                    lastUpdatedAt: '2021-11-06T08:44:05.152242Z',
                    state: 'ACTIVE',
                  },
                },
                isOnline: true,
                additionalInfo: {
                  leftVacationDays: 30,
                  assignedServiceOrderTypes: [],
                },
                meta: {
                  createdAt: '2021-05-31T08:56:22.492703Z',
                  lastUpdatedAt: '2021-11-06T08:44:05.175156Z',
                  state: 'ACTIVE',
                },
              },
              startTime: '2022-02-26T14:00:00',
              endTime: '2022-02-26T15:00:00',
              type: 'FIXED',
              source: 'NIGHTLY_SHUFFLE',
              createdAt: '2022-02-17T00:08:01.712464Z',
            },
          ],
          additionalInfo: {
            appointmentNotificationSent: true,
            appointmentConfirmed: false,
            appointmentNotificationRequired: true,
            priority: 'A',
          },
          labels: [],
          search:
            '[number:mt-0003784] [externalid:system] [type:regular] [status:completed] [address:ziegelstraße 4, 10117 berlin, germany de] [propertyowner:basf] [status:running] [number:7] [model:thyssenkrupp] [type:-] [capacity:-] [category:garage_door] [propertyowner:basf] [contracttype:basic] [currency:eur] [status:valid]',
          meta: {
            createdAt: '2021-06-01T12:00:05.418852Z',
            lastUpdatedAt: '2022-02-21T16:30:18.883980Z',
            state: 'ACTIVE',
          },
        },
      },
    ],
    address: {
      id: 'ae2ebc30-e032-4688-bd04-35c5a8ac37ef',
      fullName: 'Ziegelstraße 4, 10117 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.3892792,
        latitude: 52.52337430000001,
      },
    },
  },
  {
    elevators: [
      {
        elevator: {
          id: '3e2bc9e9-c795-4ba5-b5b7-613e49420c4e',
          number: '442',
          model: 'Orona',
          type: '-',
          capacity: '-',
          category: 'BOARDING_BRIDGE',
          technicianNumber: 1,
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
            meta: {
              createdAt: '2021-06-01T12:09:42.058121Z',
              lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
              state: 'ACTIVE',
            },
          },
          lastVisitDate: '2021-03-02',
          serviceTime: 60,
          status: 'RUNNING',
          labels: [],
          additionalInfo: {
            priority: 'NONE',
            isServiceOrderGenerationEnabled: true,
          },
          search:
            '[address:weidenweg 53, 10247 berlin, germany de] [propertyowner:basf] [status:running] [number:442] [model:orona] [type:-] [capacity:-] [category:boarding_bridge]',
          meta: {
            createdAt: '2021-06-01T12:10:04.892575Z',
            lastUpdatedAt: '2021-06-01T12:10:04.892575Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
      },
      {
        elevator: {
          id: '5b9b08ec-1cc3-4629-ae59-dea17b031ec8',
          number: '427',
          model: 'Kone',
          type: '-',
          capacity: '-',
          category: 'REVOLVING_GATE',
          technicianNumber: 1,
          address: {
            id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
            fullName: 'Weidenweg 53, 10247 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.454064,
              latitude: 52.5188984,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
            meta: {
              createdAt: '2021-06-01T12:09:42.058121Z',
              lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
              state: 'ACTIVE',
            },
          },
          lastVisitDate: '2022-01-17',
          serviceTime: 60,
          status: 'RUNNING',
          labels: [],
          additionalInfo: {
            priority: 'NONE',
            isServiceOrderGenerationEnabled: true,
          },
          search:
            '[address:weidenweg 53, 10247 berlin, germany de] [propertyowner:basf] [status:running] [number:427] [model:kone] [type:-] [capacity:-] [category:revolving_gate]',
          meta: {
            createdAt: '2021-06-01T12:09:42.327049Z',
            lastUpdatedAt: '2021-06-01T12:09:42.327049Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
      },
    ],
    address: {
      id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
      fullName: 'Weidenweg 53, 10247 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.454064,
        latitude: 52.5188984,
      },
    },
  },
  {
    elevators: [
      {
        elevator: {
          id: 'ce046a5d-e4ce-4e87-baa3-572ee0e36c83',
          number: '321',
          model: 'Hitachi',
          type: '-',
          capacity: '-',
          category: 'ROLLER_DOOR',
          technicianNumber: 1,
          address: {
            id: '96e3c8ee-fa5f-4fe5-8db4-d35a0e9b45dc',
            fullName: 'Barfusstraße 14, 13349 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.347501,
              latitude: 52.5554968,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
          search:
            '[address:barfusstraße 14, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:321] [model:hitachi] [type:-] [capacity:-] [category:roller_door]',
          meta: {
            createdAt: '2021-06-01T12:07:00.903824Z',
            lastUpdatedAt: '2021-06-01T12:07:00.903824Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
      },
    ],
    address: {
      id: '96e3c8ee-fa5f-4fe5-8db4-d35a0e9b45dc',
      fullName: 'Barfusstraße 14, 13349 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.347501,
        latitude: 52.5554968,
      },
    },
  },
  {
    elevators: [
      {
        elevator: {
          id: '3501e880-48c7-430b-8627-bf6600c342e2',
          number: '249',
          model: 'Otis',
          type: '-',
          capacity: '-',
          category: 'ELEVATOR',
          technicianNumber: 1,
          address: {
            id: '0c4fa7c1-84a6-4588-bd03-bfdbe7eaa829',
            fullName: 'Nazarethkirchstraße 49, 13347 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.3599439,
              latitude: 52.5481622,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
            meta: {
              createdAt: '2021-06-01T12:09:42.058121Z',
              lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
              state: 'ACTIVE',
            },
          },
          lastVisitDate: '2021-01-25',
          serviceTime: 60,
          status: 'RUNNING',
          labels: [],
          additionalInfo: {
            priority: 'NONE',
            isServiceOrderGenerationEnabled: true,
          },
          search:
            '[address:nazarethkirchstraße 49, 13347 berlin, germany de] [propertyowner:basf] [status:running] [number:249] [model:otis] [type:-] [capacity:-] [category:elevator]',
          meta: {
            createdAt: '2021-06-01T12:05:18.194605Z',
            lastUpdatedAt: '2021-06-01T12:05:18.194606Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
      },
    ],
    address: {
      id: '0c4fa7c1-84a6-4588-bd03-bfdbe7eaa829',
      fullName: 'Nazarethkirchstraße 49, 13347 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.3599439,
        latitude: 52.5481622,
      },
    },
  },
  {
    elevators: [
      {
        elevator: {
          id: 'c56b2c03-4aa1-4fb9-9316-43c6714e0c0f',
          number: '322',
          model: 'Lutz',
          type: '-',
          capacity: '-',
          category: 'REVOLVING_GATE',
          technicianNumber: 1,
          address: {
            id: '70c6ef3f-0f1b-42bb-9ef3-6bfbc1b9ed90',
            fullName: 'Müllerstraße 64, 13349 Berlin, Germany',
            countryCode: 'DE',
            location: {
              longitude: 13.3425078,
              latitude: 52.55588940000001,
            },
          },
          propertyOwner: {
            id: 'ef1eb196-249b-4697-9876-f67910ca7d1b',
            name: 'BASF',
            serviceCompanyId: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
            address: {
              id: '0c063ee4-f9da-481b-ab7c-da703f342cfc',
              fullName: 'Weidenweg 53, 10247 Berlin, Germany',
              countryCode: 'DE',
              location: {
                longitude: 13.454064,
                latitude: 52.5188984,
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
            meta: {
              createdAt: '2021-06-01T12:09:42.058121Z',
              lastUpdatedAt: '2021-06-01T12:10:04.605910Z',
              state: 'ACTIVE',
            },
          },
          lastVisitDate: '2022-01-17',
          serviceTime: 60,
          status: 'RUNNING',
          labels: [],
          additionalInfo: {
            priority: 'NONE',
            isServiceOrderGenerationEnabled: true,
          },
          search:
            '[address:müllerstraße 64, 13349 berlin, germany de] [propertyowner:basf] [status:running] [number:322] [model:lutz] [type:-] [capacity:-] [category:revolving_gate]',
          meta: {
            createdAt: '2021-06-01T12:07:02.258338Z',
            lastUpdatedAt: '2021-06-01T12:07:02.258338Z',
            state: 'ACTIVE',
          },
          availability: 100,
        },
      },
    ],
    address: {
      id: '70c6ef3f-0f1b-42bb-9ef3-6bfbc1b9ed90',
      fullName: 'Müllerstraße 64, 13349 Berlin, Germany',
      countryCode: 'DE',
      location: {
        longitude: 13.3425078,
        latitude: 52.55588940000001,
      },
    },
  },
];
