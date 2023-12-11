import {ChangeEvent} from 'react';
import {FormRadio} from 'components/form/FormRadio';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {ContractTypes} from 'models/contract';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import useTheme from '@mui/material/styles/useTheme';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

interface Props {
  label?: string;
  name?: string;
  value: ContractTypes;
  checked?: boolean;
  helperTexts?: string[];
  handleChange: (value: ChangeEvent<any>) => void;
}

export const ContractTypeRadio = ({
  label,
  name,
  value,
  checked,
  handleChange,
  helperTexts,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  return (
    <RadioGroup name="radio-buttons-group">
      <Box sx={{display: 'flex'}}>
        <Box
          component="label"
          sx={{
            width: '100%',
            background: checked ? 'rgba(0, 209, 255, 0.08)' : null,
            mr: '1em',
            px: '1.2em',
            py: '1.125rem',
            cursor: 'pointer',
            border: checked
              ? `2px solid ${theme.palette.primary.mainLight}`
              : `2px solid ${theme.palette.eden.light}`,
            borderRadius: 2,
          }}>
          <FormRadio
            formControlLabelStyles={{
              width: '100%',
            }}
            label={
              <Typography
                variant="h6"
                component="span"
                fontSize="1.125rem"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.text.secondary,
                }}>
                {t(label!)}
              </Typography>
            }
            radioProps={{
              sx: {color: theme.palette.text.secondary},
            }}
            name={name}
            value={value}
            checked={checked}
            handleChange={handleChange}
          />

          <List>
            {helperTexts
              ? helperTexts.map((text) => (
                  <ListItem key={text}>
                    <ListItemText primary={t(text)} />
                  </ListItem>
                ))
              : null}
          </List>
        </Box>
      </Box>
    </RadioGroup>
  );
};
