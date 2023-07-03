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
        "Sorry, we couldn't find any {{placeholderText}} that matches the search text. For adding a new {{placeholderText}}, please click the button below",
        {placeholderText: t(placeholder)},
      )}
      showActionBtn
      btnLabel={t('Add New')}
      btnAction={action}
    />
  );
};
