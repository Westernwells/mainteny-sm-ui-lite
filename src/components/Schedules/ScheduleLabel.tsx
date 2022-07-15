import {ChangeEvent, useCallback} from 'react';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {ServiceOrderView} from 'models/service-order';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  scheduleType?: 'date' | 'people' | 'default';
  item?: string;
  scheduleItems: {[key: string]: ServiceOrderView[]};
  makeLabelSelectable?: boolean;
  checkboxValue?: string;
  id: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  checkedValues?: string[];
}

export const ScheduleLabel = ({
  scheduleType = 'default',
  item = '',
  scheduleItems,
  makeLabelSelectable,
  checkboxValue = '',
  getCheckedValue = () => {},
  id,
  checkedValues = [],
}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (getCheckedValue) {
      getCheckedValue(event.target.checked, event.target.value);
    }
  }, []);

  const renderSubLabel = () => (
    <Typography variant="caption" sx={{color: grey[600]}}>
      {scheduleType === 'date'
        ? t(`${formatDate(new Date(item), 'EEEE')}`)
        : scheduleItems[id]
        ? `${scheduleItems[id].length} ${
            scheduleItems[id].length < 2 ? ' Order' : ' Orders'
          }`
        : '0 Order'}
    </Typography>
  );

  const renderSelectableLabel = () => (
    <FormCheckbox
      checked={checkedValues.includes(checkboxValue)}
      value={checkboxValue}
      handleChange={handleChange}
      label={item}
    />
  );

  if (makeLabelSelectable) {
    return renderSelectableLabel();
  }

  return (
    <Typography component="div" variant="subtitle2">
      {item} <br />
      {renderSubLabel()}
    </Typography>
  );
};
