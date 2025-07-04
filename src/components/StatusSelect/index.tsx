import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Typography,
  Grid,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import {t} from 'i18next';
import {resolveStatusInputChipColor} from 'utils/utils';

interface StatusOption {
  label: string;
  value: string;
  color: string;
  textColor: string;
}

interface StatusSelectProps {
  labelId: string;
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  error?: boolean;
  errorText?: string;
  options: StatusOption[];
  selectProps?: SelectProps<string>;
  required?: boolean;
  testId?: string;
}

const StatusSelect = ({
  labelId,
  label,
  value,
  onChange,
  error,
  errorText,
  options,
  selectProps,
  testId,
  required = false,
}: StatusSelectProps) => (
  <FormControl data-testid={testId} fullWidth required={required} error={error}>
    <InputLabel id={labelId}>{t(label)}</InputLabel>
    <Select
      size="small"
      labelId={labelId}
      value={value}
      onChange={onChange}
      label={label}
      {...selectProps}
      renderValue={() => {
        const selectedOption = options.find((option) => option.value === value);
        return selectedOption ? (
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    resolveStatusInputChipColor(theme, selectedOption.color),
                  px: 1,
                  py: 0.2,
                  borderRadius: 3,
                }}>
                <Typography
                  color={selectedOption.textColor}
                  fontSize="0.8em">{`${t(selectedOption.label)}`}</Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          ''
        );
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 48 * 4.5 + 8,
            width: 250,
          },
        },
      }}>
      {options.map(({label: currencyLabel, value: currencyValue}) => (
        <MenuItem key={currencyValue} value={currencyValue}>
          {t(currencyLabel)}
        </MenuItem>
      ))}
    </Select>
    {errorText && <Typography color="error">{errorText}</Typography>}
  </FormControl>
);

export default StatusSelect;
