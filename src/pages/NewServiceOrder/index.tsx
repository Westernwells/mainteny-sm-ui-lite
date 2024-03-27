import {FlexContainer} from 'components/FlexContainer';
import {Progress} from 'components/Progress';
import {useLayoutEffect, useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ServiceOrderType} from 'models/service-order';
import {convertToMacro} from 'utils/utils';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {NewEmergency} from './NewEmergency';
import {ScheduleServiceOrder} from './ScheduleServiceOrder';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const NewServiceOrder = ({getCurrentPageTitle}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
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
        `New ${serviceOrderTypeToString(
          convertToMacro(currentParams.type),
        )} Job`,
      );
    }
  }, []);

  if (isLoading || !isFetched) return <Progress />;

  return (
    <FlexContainer>
      {currentParams.type === 'emergency' ? (
        <NewEmergency elevator={elevator} />
      ) : currentParams.type === 'callout' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.CALLOUT}
          elevator={elevator}
        />
      ) : currentParams.type === 'repair' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REPAIR}
          elevator={elevator}
        />
      ) : currentParams.type === 'regular' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REGULAR}
          elevator={elevator}
        />
      ) : currentParams.type === 'inspection' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.INSPECTION}
          elevator={elevator}
        />
      ) : currentParams.type === 'new_installation' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.NEW_INSTALLATION}
          elevator={elevator}
        />
      ) : currentParams.type === 'modernization' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.MODERNIZATION}
          elevator={elevator}
        />
      ) : currentParams.type === 'general' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.GENERAL}
          elevator={elevator}
        />
      ) : null}
    </FlexContainer>
  );
};

export default NewServiceOrder;
