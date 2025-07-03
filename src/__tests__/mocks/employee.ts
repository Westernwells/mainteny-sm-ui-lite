import {
  CreateEmployeeAccountData,
  ShiftForm,
  TimeWindowType,
} from 'models/employee';

const createMockShifts = (): ShiftForm => {
  const allDays = Object.values(TimeWindowType);
  return allDays.reduce((acc, day) => {
    if (day === TimeWindowType.MONDAY) {
      acc[day] = {
        firstShift: {
          fromTime: '08:00',
          toTime: '12:00',
        },
      };
    }
    return acc;
  }, {} as ShiftForm);
};

export const mockEmployeeData: CreateEmployeeAccountData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '49123123123',
  password: 'Test@1234',
  contact: {
    email: 'john.doe@example.com',
    phone: '49123123123',
  },
  employeeId: 'EMP001',
  roles: ['SERVICE_MANAGER'],
  serviceCompanyId: 'company-123',
  shifts: createMockShifts(),
  address: {
    fullName: 'Berlin, Germany',
    countryCode: 'DE',
    location: {
      latitude: 52.52,
      longitude: 13.405,
    },
  },
};
