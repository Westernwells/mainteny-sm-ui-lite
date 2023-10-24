import React, {ReactNode, useMemo} from 'react';

import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceCompanyItem} from 'models/service-company';

interface Props {
  children?: ReactNode;
}

interface ContextValue {
  company?: ServiceCompanyItem;
  refreshData: () => void;
}

const initialValue = {
  refreshData: () => {},
};

export const UserCompanyContext =
  React.createContext<ContextValue>(initialValue);

export const UserCompanyProvider = ({children}: Props) => {
  const {user} = useUserSession();
  const {data, refetch} = useCompanyById(user?.userAccount?.serviceCompany?.id);

  const refreshData = () => {
    refetch();
  };

  return (
    <UserCompanyContext.Provider
      value={useMemo(
        () => ({
          company: data,
          refreshData,
        }),
        [data],
      )}>
      {children}
    </UserCompanyContext.Provider>
  );
};
