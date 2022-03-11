export const elevator = {
  id: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
  number: '7',
  model: 'Thyssenkrupp',
  type: '-',
  capacity: '-',
  category: 'GARAGE_DOOR',
  technicianNumber: 1,
  availability: 98,
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
      },
      search:
        '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
      meta: {
        createdAt: '2021-05-31T08:32:55.193896Z',
        lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
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
  lastVisitDate: '2022-02-21',
  serviceTime: 60,
  status: 'RUNNING',
  properties: [
    {
      id: '9a403508-71f3-4f83-afba-45f892831ade',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Appointment Notification Due',
      value: '7',
    },
    {
      id: '7a879a5d-bc38-4346-9837-f7152d69c752',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Appointment Day of the Week',
      value: 'Mo,Tu,We',
    },
    {
      id: '3b8dde34-0916-4be0-890c-276eb573a51f',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Notify Customer',
      value: 'Yes',
    },
    {
      id: 'd5870aef-21a5-4fe8-aec0-8ecc046eff97',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Number of Technicians',
      value: '1',
    },
    {
      id: 'e51e02bd-43bb-49cd-ad7b-9852ca668aaa',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Team',
      value: '1',
    },
    {
      id: 'b2745be7-8bf8-49d9-8d14-66cdaf8890d7',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Category',
      value: 'Garagentor',
    },
    {
      id: '09ade179-95de-4822-9a80-2e57a8fe2434',
      elevatorId: '67567e04-2e2b-4987-bf44-2ff81ecd5421',
      key: 'Appointment Time',
      value: '07:00:00 - 10:30:00',
    },
  ],
  timeRules: [],
  labels: [],
  requiredSkills: [],
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
};

export const maintainers = [
  {
    technician: {
      id: 'a034eb55-18ac-4b90-a76e-9a7d8016b307',
      address: {
        id: '3bd7cfa6-058d-4d80-a198-757a6ff17b2e',
        fullName: 'Parkstraße 8, 14959 Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.2255,
          latitude: 52.21726,
        },
      },
      userAccount: {
        id: 'e8ec6044-f42e-4f85-9642-4ab553cd8fee',
        username: 'mathias@breil.com',
        firstName: 'Mathias',
        lastName: 'Breil',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'mathias@breil.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 8, 14959 trebbin, germany de] [username:mathias@breil.com] [firstname:mathias] [lastname:breil] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:mathias@breil.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T08:52:21.977948Z',
          lastUpdatedAt: '2021-11-06T08:45:18.338875Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T08:52:22.041742Z',
        lastUpdatedAt: '2021-11-06T08:45:18.343932Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: 'ffddf0fa-23cd-4f7c-ade1-84678557a3b9',
      address: {
        id: '863a7aec-3b01-478d-868e-483922282fd2',
        fullName: 'Am Bahnhof, 14974 Ludwigsfelde, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.2667874,
          latitude: 52.2987454,
        },
      },
      userAccount: {
        id: '5479c301-cc08-4833-9e8a-b452f858706f',
        username: 'max@mustermann.com',
        firstName: 'Max',
        lastName: 'Mustermann',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'max@mustermann.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:am bahnhof, 14974 ludwigsfelde, germany de] [username:max@mustermann.com] [firstname:max] [lastname:mustermann] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:max@mustermann.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T08:53:18.663413Z',
          lastUpdatedAt: '2021-11-06T08:45:31.773327Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T08:53:18.761648Z',
        lastUpdatedAt: '2021-11-06T08:45:31.782414Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: '6015264e-d1e3-4dd4-b659-8ae729c0dfa3',
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
        id: 'e69218dd-8d95-4dcb-84ab-76c854b5d90c',
        username: 'bruce@wayne.com',
        firstName: 'Paulus',
        lastName: 'Wayne',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'bruce@wayne.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 10, 14959 trebbin, germany de] [username:bruce@wayne.com] [firstname:paulus] [lastname:wayne] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:bruce@wayne.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T08:55:05.937138Z',
          lastUpdatedAt: '2021-11-06T08:45:54.443348Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T08:55:05.971930Z',
        lastUpdatedAt: '2021-11-06T08:45:54.452776Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
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
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'NORMAL',
        search:
          '[address:parkstraße 10, 14959 trebbin, germany de] [username:james@bond.com] [firstname:felix] [lastname:bond] [servicecompany:maintenance experts gmbh] [status:normal] [email:james@bond.com] [phone: +4900000000000] [role:technician]',
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
    weight: 3,
  },
  {
    technician: {
      id: 'dd27698d-bcf4-41b5-a48d-bf62d090727a',
      address: {
        id: '206602e3-d2a9-426d-9b16-274e8fcefeeb',
        fullName: 'Parkstraße 1, 14959 Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.222078,
          latitude: 52.2170649,
        },
      },
      userAccount: {
        id: '108ccd46-b0fd-4d15-9812-e3df934a7a05',
        username: 'naval@ravikant.com',
        firstName: 'Prasad',
        lastName: 'Subrahmanya',
        photoUrl: '',
        contact: {
          phone: '+918553160792',
          email: 'naval@ravikant.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'NORMAL',
        search:
          '[address:parkstraße 1, 14959 trebbin, germany de] [username:naval@ravikant.com] [firstname:prasad] [lastname:subrahmanya] [servicecompany:maintenance experts gmbh] [status:normal] [email:naval@ravikant.com] [phone:+918553160792] [role:technician]',
        meta: {
          createdAt: '2021-05-31T08:58:55.157935Z',
          lastUpdatedAt: '2021-11-22T11:18:27.840773Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 27.5,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T08:58:55.190865Z',
        lastUpdatedAt: '2021-11-22T11:18:27.912123Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: 'acaa68c3-9403-45e5-a146-f69851b8ec09',
      address: {
        id: 'c9ed46ad-c952-4962-9519-5df5b49c5c02',
        fullName: 'Ebelstraße 15, 14959 Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.2267597,
          latitude: 52.2197393,
        },
      },
      userAccount: {
        id: 'a89cf02d-6e0e-49b4-9137-a3e06faed296',
        username: 'patrick@collison.com',
        firstName: 'Tom',
        lastName: 'Chenna',
        photoUrl: '',
        contact: {
          phone: ' +491734608122',
          email: 'patrick@collison.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'NORMAL',
        search:
          '[address:ebelstraße 15, 14959 trebbin, germany de] [username:patrick@collison.com] [firstname:tom] [lastname:chenna] [servicecompany:maintenance experts gmbh] [status:normal] [email:patrick@collison.com] [phone: +491734608122] [role:technician]',
        meta: {
          createdAt: '2021-05-31T08:57:53.981100Z',
          lastUpdatedAt: '2022-02-09T09:46:04.035971Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T08:57:54.064062Z',
        lastUpdatedAt: '2022-02-09T09:46:04.050809Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: 'e43adbcb-9870-47b3-a4b0-f606101edcaa',
      address: {
        id: 'f3c6d121-277a-4014-827d-6d603e873317',
        fullName: 'Parkstraße 18, Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.2282204,
          latitude: 52.2170277,
        },
      },
      userAccount: {
        id: 'b0b0b938-5a14-4427-9ea3-1217ff750006',
        username: 'sondre@magnusson.com',
        firstName: 'Sondre',
        lastName: 'Magnusson',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'sondre@magnusson.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 18, trebbin, germany de] [username:sondre@magnusson.com] [firstname:sondre] [lastname:magnusson] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:sondre@magnusson.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T21:56:06.601775Z',
          lastUpdatedAt: '2021-11-06T08:47:10.632140Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T21:56:06.732561Z',
        lastUpdatedAt: '2021-11-06T08:47:10.637793Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: '69e3348a-0bc1-4e38-a6dd-614d7f7c6715',
      address: {
        id: '247d0978-bfa8-4c17-ac7a-9a68fac8cb5f',
        fullName: 'Parkstraße 24, Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.22624,
          latitude: 52.21742,
        },
      },
      userAccount: {
        id: '78d843b4-382b-49cb-8e33-c21c714da7d3',
        username: 'robert@maintenance.com',
        firstName: 'Robert',
        lastName: 'Muller',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'robert@maintenance.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 24, trebbin, germany de] [username:robert@maintenance.com] [firstname:robert] [lastname:muller] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:robert@maintenance.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T21:57:27.948955Z',
          lastUpdatedAt: '2021-11-06T08:46:47.922103Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T21:57:28.005282Z',
        lastUpdatedAt: '2021-11-06T08:46:47.927659Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: '72e227b4-9271-44f2-a8a1-febd31c306f8',
      address: {
        id: '6377e534-6140-4692-8cf9-24bb620e0642',
        fullName: 'Parkstraße 5, Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.2244631,
          latitude: 52.2173497,
        },
      },
      userAccount: {
        id: '39d96a97-80f6-44a9-84a3-9bef6251ef41',
        username: 'otto@haun.com',
        firstName: 'Otto',
        lastName: 'Haun',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'otto@haun.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 5, trebbin, germany de] [username:otto@haun.com] [firstname:otto] [lastname:haun] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:otto@haun.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T21:58:35.871299Z',
          lastUpdatedAt: '2021-11-06T08:45:42.928184Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T21:58:36.047312Z',
        lastUpdatedAt: '2021-11-06T08:45:42.935390Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: '69d26617-9b3d-4c15-b0e1-175570d02bf7',
      address: {
        id: '2061de69-4af5-4838-902e-192b20c21a3e',
        fullName: 'Andreasstraße 10, Berlin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.4312722,
          latitude: 52.512482,
        },
      },
      userAccount: {
        id: '5609c612-69fa-474a-a74d-69947106d00c',
        username: 'andreas@finch.com',
        firstName: 'Andreas',
        lastName: 'Finch',
        photoUrl: '',
        contact: {
          phone: '+2347067752509',
          email: 'andreas@finch.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'NORMAL',
        search:
          '[address:andreasstraße 10, berlin, germany de] [username:andreas@finch.com] [firstname:andreas] [lastname:finch] [servicecompany:maintenance experts gmbh] [status:normal] [email:andreas@finch.com] [phone:+2347067752509] [role:technician]',
        meta: {
          createdAt: '2021-05-31T21:59:26.960601Z',
          lastUpdatedAt: '2021-11-06T08:43:37.305367Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [
          'CALLOUT',
          'REGULAR',
          'EMERGENCY',
          'REPAIR',
        ],
      },
      meta: {
        createdAt: '2021-05-31T21:59:27.013154Z',
        lastUpdatedAt: '2021-11-06T08:43:37.329613Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: '1b0ce491-6cb8-4ca6-b9a4-8895c3c1c467',
      address: {
        id: '2061de69-4af5-4838-902e-192b20c21a3e',
        fullName: 'Andreasstraße 10, Berlin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.4312722,
          latitude: 52.512482,
        },
      },
      userAccount: {
        id: 'c84d05f7-d08b-4aba-9b78-bf0f260f9e78',
        username: 'juergen@ardal.com',
        firstName: 'Juergen',
        lastName: 'Ardal',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'juergen@ardal.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:andreasstraße 10, berlin, germany de] [username:juergen@ardal.com] [firstname:juergen] [lastname:ardal] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:juergen@ardal.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T22:00:35.209083Z',
          lastUpdatedAt: '2021-11-06T08:44:38.845345Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T22:00:35.241368Z',
        lastUpdatedAt: '2021-11-06T08:44:38.868622Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: 'c9f4c03d-fe10-4a31-b8cf-10de99a568b9',
      address: {
        id: '1da409b0-0c52-4a58-8d49-f3526b1c9427',
        fullName: 'Parkstraße 26, Berlin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.457503,
          latitude: 52.5536048,
        },
      },
      userAccount: {
        id: 'e8230f8f-1975-4aa0-84bc-113d9d6097bd',
        username: 'peter@parker.com',
        firstName: 'Peter',
        lastName: 'Parker',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'peter@parker.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'RESET_PASSWORD',
        search:
          '[address:parkstraße 26, berlin, germany de] [username:peter@parker.com] [firstname:peter] [lastname:parker] [servicecompany:maintenance experts gmbh] [status:reset_password] [email:peter@parker.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T22:01:26.339415Z',
          lastUpdatedAt: '2021-11-06T08:46:14.414184Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T22:01:26.394534Z',
        lastUpdatedAt: '2021-11-06T08:46:14.423118Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
  {
    technician: {
      id: 'd861d168-c508-473a-9085-a07d249a9ea4',
      address: {
        id: '6c9b9ae4-2a58-4238-8372-4391060c0858',
        fullName: 'Parkstraße 30, Trebbin, Germany',
        countryCode: 'DE',
        location: {
          longitude: 13.22216,
          latitude: 52.21791,
        },
      },
      userAccount: {
        id: '89e05506-7456-4835-aba3-ed0c30e90e05',
        username: 'herman@gunther.com',
        firstName: 'Herman',
        lastName: 'Gunther',
        photoUrl: '',
        contact: {
          phone: ' +4900000000000',
          email: 'herman@gunther.com',
        },
        roles: ['TECHNICIAN'],
        serviceCompany: {
          id: '9d85be2d-ceb9-4b19-a350-9f512b4b57e4',
          name: 'Maintenance Experts GmbH',
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
          },
          search:
            '[name:maintenance experts gmbh] [email:prasad@mainteny.com] [phone:+4791924282] [url:https://maintenance-experts.de]',
          meta: {
            createdAt: '2021-05-31T08:32:55.193896Z',
            lastUpdatedAt: '2021-05-31T08:32:55.193897Z',
            state: 'ACTIVE',
          },
        },
        status: 'NORMAL',
        search:
          '[address:parkstraße 30, trebbin, germany de] [username:herman@gunther.com] [firstname:herman] [lastname:gunther] [servicecompany:maintenance experts gmbh] [status:normal] [email:herman@gunther.com] [phone: +4900000000000] [role:technician]',
        meta: {
          createdAt: '2021-05-31T22:02:19.425181Z',
          lastUpdatedAt: '2021-11-06T08:44:27.431991Z',
          state: 'ACTIVE',
        },
      },
      isOnline: true,
      additionalInfo: {
        leftVacationDays: 30,
        assignedServiceOrderTypes: [],
      },
      meta: {
        createdAt: '2021-05-31T22:02:19.462518Z',
        lastUpdatedAt: '2021-11-06T08:44:27.453031Z',
        state: 'ACTIVE',
      },
    },
    weight: 3,
  },
];
