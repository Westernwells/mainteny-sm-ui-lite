import {FlexContainer} from 'components/FlexContainer';
import {Progress} from 'components/Progress';
import {useLayoutEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ServiceOrderType} from 'models/service-order';
import {convertToMacro} from 'utils/utils';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {ScheduleServiceOrder} from './ScheduleServiceOrder';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const NewServiceOrder = ({getCurrentPageTitle}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = Object.fromEntries([...queryParams]);
  const type = (
    currentParams.type
      ? convertToMacro(currentParams.type)
      : ServiceOrderType.REGULAR
  ) as ServiceOrderType;

  const {
    data: elevator,
    isLoading,
    isFetched,
  } = currentParams.elevatorId
    ? useElevatorById(currentParams.elevatorId)
    : {data: undefined, isLoading: false, isFetched: true};

  useLayoutEffect(() => {
    if (getCurrentPageTitle && currentParams) {
      getCurrentPageTitle(
        `New ${serviceOrderTypeToString(convertToMacro(type))} Job`,
      );
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
