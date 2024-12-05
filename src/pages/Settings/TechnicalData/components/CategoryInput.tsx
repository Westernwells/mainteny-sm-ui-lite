import {EditOutlined} from '@mui/icons-material';
import {Box} from '@mui/material';
import {ChangeEventHandler} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const CategoryInput = ({onChange, value}: Props) => {
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignContent: 'center'}}>
      <Box
        component="input"
        placeholder={`${t('Enter your category name')}...`}
        value={value}
        onChange={onChange}
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
