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
      ) : currentParams.type === 'callout' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.CALLOUT}
          quotation={quotation}
        />
      ) : currentParams.type === 'repair' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REPAIR}
          quotation={quotation}
        />
      ) : currentParams.type === 'regular' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.REGULAR}
          quotation={quotation}
        />
      ) : currentParams.type === 'inspection' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.INSPECTION}
          quotation={quotation}
        />
      ) : currentParams.type === 'new_installation' ? (
        <ScheduleServiceOrder
          type={ServiceOrderType.NEW_INSTALLATION}
          quotation={quotation}
        />
      ) : null}
    </FlexContainer>
  );
};

export default NewServiceOrder;
