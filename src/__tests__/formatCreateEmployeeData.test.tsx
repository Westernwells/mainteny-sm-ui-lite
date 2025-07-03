import {describe, it, expect} from 'vitest';
import {formatCreateEmployeeAccountData} from 'utils/account-utils';
import {TimeWindowType} from 'models/employee';
import {mockEmployeeData} from './mocks/employee';

describe('formatCreateEmployeeAccountData', () => {
  it('should generate workingHours from shifts', () => {
    const result = formatCreateEmployeeAccountData(mockEmployeeData);

    expect(result.employee.workingHours).toBeDefined();
    expect(result.employee.workingHours.length).toBeGreaterThan(0);
    expect(result.employee.workingHours[0]).toMatchObject({
      type: TimeWindowType.MONDAY,
      fromTime: '08:00',
      toTime: '12:00',
    });
  });
});
