import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Typography,
  Grid,
  SelectChangeEvent,
} from '@mui/material';

interface CurrencyOption {
  label: string;
  value: string;
  symbol: string;
  flagUrl: string;
}

interface CurrencySelectProps {
  labelId: string;
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  error?: boolean;
  errorText?: string;
  options: CurrencyOption[];
  selectProps?: SelectProps<string>;
}

const CurrencySelect = ({
  labelId,
  label,
  value,
  onChange,
  error,
  errorText,
  options,
  selectProps,
}: CurrencySelectProps) => (
  <FormControl fullWidth required error={error}>
    <InputLabel id={labelId}>{label}</InputLabel>
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
              <img
                src={selectedOption.flagUrl}
                alt={`${selectedOption.label} flag`}
                style={{
                  width: '24px',
                  height: '16px',
                  marginTop: '0.2em',
                  marginBottom: '-0.4em',
                }}
              />
            </Grid>
            <Grid item>
              <Typography
                sx={{
                  marginTop: '0.2em',
                  marginBottom: '-0.2em',
                }}>{`${selectedOption.label} - ${selectedOption.symbol}`}</Typography>
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
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <img
            src={option.flagUrl}
            alt={`${option.label} flag`}
            style={{width: '24px', height: '16px'}}
          />
          <Typography>{`${option.label} - ${option.symbol}`}</Typography>
        </MenuItem>
      ))}
    </Select>
    {errorText && <Typography color="error">{errorText}</Typography>}
  </FormControl>
);

export default CurrencySelect;
