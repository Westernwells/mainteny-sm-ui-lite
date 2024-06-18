import {CompanyStatus} from 'models/company';

export const getCompanyStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'default' | 'primary.light' | 'grey.300';
} => {
  switch (status) {
    case CompanyStatus.ACTIVE:
      return {label: 'Live', color: 'success'};
    case CompanyStatus.DEACTIVATED:
      return {label: 'Inactive', color: 'grey.300'};
    case CompanyStatus.INTERNAL:
      return {label: 'Internal', color: 'primary.light'};
    case CompanyStatus.TRIAL:
      return {label: 'Test', color: 'warning'};
    default:
      return {label: '-', color: 'default'};
  }
};
