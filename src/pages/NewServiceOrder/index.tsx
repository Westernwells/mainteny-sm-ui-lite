import {FlexContainer} from 'components/FlexContainer';
import {Progress} from 'components/Progress';
import {useLayoutEffect, useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ServiceOrderType} from 'models/service-order';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {convertToMacro} from 'utils/utils';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {NewEmergency} from './NewEmergency';
import {ScheduleServiceOrder} from './ScheduleServiceOrder';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const NewServiceOrder = ({getCurrentPageTitle}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
  const {
    data: quotation,
    isLoading,
    isFetched,
  } = currentParams.quotationId
    ? useQuotationDetails(currentParams.quotationId)
    : {data: undefined, isLoading: false, isFetched: true};
  console.log(quotation, isLoading, isFetched);

  useLayoutEffect(() => {
    if (getCurrentPageTitle && currentParams) {
      getCurrentPageTitle(
        `New ${serviceOrderTypeToString(
          convertToMacro(currentParams.type),
        )} Order`,
      );
    }
  }, []);

  if (isLoading || !isFetched) return <Progress />;

  return (
    <FlexContainer>
      {currentParams.type === 'emergency' ? (
        <NewEmergency quotation={quotation} />
      ) : null}
      {currentParams.type === 'callout' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.CALLOUT}
          quotation={quotation}
        />
      ) : null}
      {currentParams.type === 'repair' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REPAIR}
          quotation={quotation}
        />
      ) : null}

      {currentParams.type === 'regular' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REGULAR}
          quotation={quotation}
        />
      ) : null}
    </FlexContainer>
  );
};
