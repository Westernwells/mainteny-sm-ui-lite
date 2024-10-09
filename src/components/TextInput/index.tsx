import {useTranslation} from 'react-i18next';
import {Box, InputAdornment, TextField, Typography} from '@mui/material';
import {ChangeEvent} from 'react';

type Props = {
  value?: string;
  labelKey?: string;
  placeholder?: string;
  endPlaceholder?: string;
  onChange: (value: string) => void;
};

const TextInput = ({
  value,
  labelKey,
  placeholder,
  endPlaceholder,
  onChange,
}: Props) => {
  const {t} = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
      {labelKey && <Typography variant="subtitle2">{t(labelKey)}</Typography>}

      <TextField
        id="fixed-tags-demo"
        value={value}
        {...(placeholder && {placeholder: t(placeholder)})}
        onChange={handleChange}
        {...(endPlaceholder && {
          slotProps: {
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Typography>{endPlaceholder}</Typography>
                </InputAdornment>
              ),
            },
          },
        })}
      />
    </Box>
  );
};

export default TextInput;
