import {FlexContainer} from 'components/FlexContainer';
import {Progress} from 'components/Progress';
import {useLayoutEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {t} from 'i18next';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {getJobTypeGivenName} from 'utils/service-order-utils';
import {ScheduleServiceOrder} from './ScheduleServiceOrder';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const NewServiceOrder = ({getCurrentPageTitle}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = Object.fromEntries([...queryParams]);
  const {user} = useUserSession();

  const type = decodeURIComponent(currentParams.type || '');
  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const {
    data: elevator,
    isLoading,
    isFetched,
  } = currentParams.elevatorId
    ? useElevatorById(currentParams.elevatorId)
    : {data: undefined, isLoading: false, isFetched: true};

  useLayoutEffect(() => {
    if (getCurrentPageTitle && currentParams) {
      const givenName = getJobTypeGivenName(type, jobTypes);
      getCurrentPageTitle(t(`New {{jobType}} Job`, {jobType: givenName}));
    }
  }, []);

  if (isLoading || !isFetched) return <Progress />;

  return (
    <FlexContainer>
      <ScheduleServiceOrder type={type} elevator={elevator} />
    </FlexContainer>
  );
};

export default NewServiceOrder;
