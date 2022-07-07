import {EmptySection} from '../../components/EmptySection';

export const NoItemSection = ({
  label,
  buttonLabel,
  illustration,
  action,
}: {
  label: string;
  buttonLabel: string;
  illustration: 'attachment' | 'clipboard' | 'qrcode' | 'stock' | 'supplier';
  action?: () => void;
}) => (
  <EmptySection
    illustration={illustration}
    size="tiny"
    containerStyle={{m: 'auto', width: '60%'}}
    label={label}
    showActionBtn
    btnLabel={buttonLabel}
    btnAction={action}
  />
);
