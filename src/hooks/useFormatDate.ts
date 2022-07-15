import {formatDate} from 'utils/datetime';
import {useCompanyById} from './reactQuery/useCompanies';
import {useUserSession} from './reactQuery/useUserSession';

export const useFormatDate = () => {
  const {user} = useUserSession();
  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  return (input?: string | Date, dateFormat?: string) =>
    formatDate(input, dateFormat || company?.settings.dateFormat);
};
