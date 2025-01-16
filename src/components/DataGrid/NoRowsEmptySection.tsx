import {EmptySection} from 'components/EmptySection';
import {useTranslation} from 'react-i18next';

interface Props {
  placeholder: string;
  action?: () => void;
}

export const NoRowsEmptySection = ({placeholder, action}: Props) => {
  const {t} = useTranslation();
  return (
    <EmptySection
      illustration="clipboard"
      size="tiny"
      containerStyle={{m: 'auto', width: '60%'}}
      label={t(
        "Sorry, we couldn't find any {{placeholder}} that matches the search text. If you like to add a new {{placeholder}}, please click the button below.",
        {placeholder: t(placeholder)},
      )}
      showActionBtn
      btnLabel={t('Add New')}
      btnAction={action}
    />
  );
};
