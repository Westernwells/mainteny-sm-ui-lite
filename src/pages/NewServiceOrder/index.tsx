import {FlexContainer} from 'components/FlexContainer';
import {useLayoutEffect, useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ServiceOrderType} from 'models/service-order';
import {convertToText} from 'utils/utils';
import {NewEmergency} from './NewEmergency';
import {ScheduleServiceOrder} from './ScheduleServiceOrder';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const NewServiceOrder = ({getCurrentPageTitle}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;

  useLayoutEffect(() => {
    if (getCurrentPageTitle && currentParams) {
      getCurrentPageTitle(`New ${convertToText(currentParams.type)} Order`);
    }
  }, []);

  return (
    <FlexContainer>
      {currentParams.type === 'emergency' ? <NewEmergency /> : null}
      {currentParams.type === 'callout' ? (
        <ScheduleServiceOrder type={ServiceOrderType.CALLOUT} />
      ) : null}
      {currentParams.type === 'repair' ? (
        <ScheduleServiceOrder type={ServiceOrderType.REPAIR} />
      ) : null}

      {currentParams.type === 'regular' ? (
        <ScheduleServiceOrder type={ServiceOrderType.REGULAR} />
      ) : null}
    </FlexContainer>
  );
};
