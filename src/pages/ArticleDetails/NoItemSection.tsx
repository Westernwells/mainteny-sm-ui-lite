import {EmptySection} from '../../components/EmptySection';

export const NoItemSection = ({
  label,
  buttonLabel,
  action,
}: {
  label: string;
  buttonLabel: string;
  action?: () => void;
}) => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{m: 'auto', width: '60%'}}
    label={label}
    showActionBtn
    btnLabel={buttonLabel}
    btnAction={action}
  />
);
