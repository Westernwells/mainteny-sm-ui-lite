import {BreadCrumbs} from 'components/Breadcrumbs';
import {FlexContainer} from 'components/FlexContainer';
import {useNavigate} from 'react-router';
import {NewEmergency} from './NewEmergency';

export const NewServiceOrder = () => {
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
          {label: 'New Emergency', action: () => {}},
        ]}
      />

      <NewEmergency />
    </FlexContainer>
  );
};
