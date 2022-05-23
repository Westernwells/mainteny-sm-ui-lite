import {BreadCrumbs} from 'components/Breadcrumbs';
import {FlexContainer} from 'components/FlexContainer';
import {useRef} from 'react';
import {useNavigate} from 'react-router';
import {useSearchParams} from 'react-router-dom';
import {convertToText} from 'utils/utils';
import {NewCallout} from './NewCallout';
import {NewEmergency} from './NewEmergency';

export const NewServiceOrder = () => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
  const navigate = useNavigate();
  return (
    <FlexContainer>
      <BreadCrumbs
        activeIndex={1}
        links={[
          {
            label: 'Service Orders',
            action: () => navigate('/orders?pageIndex=1&pageSize=25&tab=0'),
          },
          {label: `New ${convertToText(currentParams.type)}`, action: () => {}},
        ]}
      />
      {currentParams.type === 'emergency' ? <NewEmergency /> : null}
      {currentParams.type === 'callout' ? <NewCallout /> : null}
    </FlexContainer>
  );
};
