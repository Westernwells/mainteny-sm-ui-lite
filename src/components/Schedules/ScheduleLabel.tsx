import {ChangeEvent, useCallback} from 'react';
import {useNavigate} from 'react-router';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {ServiceOrderView} from 'models/service-order';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  scheduleType?: 'date' | 'people' | 'default';
  item?: any;
  scheduleItems: {[key: string]: ServiceOrderView[]};
  makeLabelSelectable?: boolean;
  checkboxValue?: string;
  id: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  checkedValues?: string[];
  navigateTo?: string;
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
  navigateTo,
}: Props) => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (getCheckedValue) {
      getCheckedValue(event.target.checked, event.target.value);
    }
  }, []);

  const getDayString = (dateString: string) => {
    const date = new Date();
    const day = Number(`${dateString[0]}${dateString[1]}`);
    date.setDate(day);
    return formatDate(date, 'EEEE');
  };

  const renderSubLabel = () => (
    <Typography variant="caption" sx={{color: grey[600]}}>
      {scheduleType === 'date'
        ? getDayString(item[0]) || ''
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
    <Typography component="div">
      <Typography
        component="span"
        variant="subtitle2"
        sx={{cursor: navigateTo ? 'pointer' : 'initial'}}
        onClick={() => {
          if (navigateTo) navigate(navigateTo);
        }}>
        {item}
      </Typography>
      <br />
      {renderSubLabel()}
    </Typography>
  );
};
