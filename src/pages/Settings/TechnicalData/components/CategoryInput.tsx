import {EditOutlined} from '@mui/icons-material';
import {Box} from '@mui/material';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getTechnicalFieldCategory} from 'utils/utils';

export type EventTargetWithValue = {
  target: {value: string};
};
interface Props {
  value?: string;
  onChange?: (e: EventTargetWithValue) => void;
}

export const CategoryInput = ({onChange, value}: Props) => {
  const {t} = useTranslation();

  const [stopTranslating, setStopTranslating] = useState(false);

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignContent: 'center'}}>
      <Box
        component="input"
        placeholder={`${t('Enter your category name')}...`}
        value={
          stopTranslating
            ? value
            : getTechnicalFieldCategory({name: value ?? ''}, t)
        }
        onChange={(e) => {
          onChange?.(e as never as EventTargetWithValue);
          setStopTranslating(true);
        }}
        sx={{
          border: 'none',
          width: 300,
          outline: 'none',
          fontSize: '1.3em',
          fontFamily: 'Aventa',
          fontWeight: 'bold',
          '&::placeholder': {
            color: '#8F9BB380',
          },
        }}
      />
      <EditOutlined htmlColor="#8F9BB380" />
    </Box>
  );
};
