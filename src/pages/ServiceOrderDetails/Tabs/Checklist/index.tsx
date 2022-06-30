import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';

const EmptyChecklist = () => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{width: '60%'}}
    label="No checklist yet."
  />
);

export const Checklist = () => (
  <InfoCard
    disabledHeader
    containerStyles={{
      mb: '1.2rem',
      padding: '11rem 0 11rem 0',
    }}
    bodyContainerStyle={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <EmptyChecklist />
  </InfoCard>
);
