import {useTranslation} from 'react-i18next';
import {Box, TextField, Typography} from '@mui/material';
import {ChangeEvent} from 'react';
import {SxProps, Theme} from '@mui/system';

type Props = {
  value?: string;
  labelKey?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  styles?: SxProps<Theme>;
};

const TextInput = ({value, labelKey, placeholder, styles, onChange}: Props) => {
  const {t} = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
      {labelKey && <Typography variant="subtitle2">{t(labelKey)}</Typography>}

      <TextField
        id="fixed-tags-demo"
        sx={styles}
        value={value}
        {...(placeholder && {placeholder: t(placeholder)})}
        onChange={handleChange}
      />
    </Box>
  );
};

export default TextInput;
