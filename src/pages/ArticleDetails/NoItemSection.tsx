import {EmptySection} from '../../components/EmptySection';

export const NoItemSection = ({
  placeholder,
  action,
}: {
  placeholder: string;
  action?: () => void;
}) => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{m: 'auto', width: '60%'}}
    label={`No ${placeholder} yet. Please click the button below to add!`}
    showActionBtn
    btnLabel={`+ Add ${placeholder}`}
    btnAction={action}
  />
);
