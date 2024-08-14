import {CompanyStatus} from 'models/company';
import {UserAccount} from 'models/user';
import {AlternativeServiceCompanyInfo} from 'models/invoice';
import {formatAddressFullname} from './utils';

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

export const getServiceCompanyInfo = (
  userInfo?: UserAccount,
  altServiceCompanyInfo?: AlternativeServiceCompanyInfo,
) => {
  const address = altServiceCompanyInfo
    ? altServiceCompanyInfo.address
    : userInfo?.serviceCompany?.billingAddress;

  const fullCityName = formatAddressFullname(address)?.fullCityName;

  const companyName = altServiceCompanyInfo
    ? altServiceCompanyInfo.name
    : userInfo?.serviceCompany?.name;

  return companyName && fullCityName
    ? `${companyName}, ${fullCityName}`
    : fullCityName || '';
};
