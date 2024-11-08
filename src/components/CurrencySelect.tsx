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
import {SVGProps} from 'react';

interface CurrencyOption {
  label: string;
  value: string;
  symbol: string;
  FlagComponent: (props: SVGProps<SVGSVGElement>) => JSX.Element;
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
              {selectedOption.FlagComponent && (
                <selectedOption.FlagComponent
                  style={{
                    width: '24px',
                    height: '16px',
                    marginTop: '0.2em',
                    marginBottom: '-0.4em',
                  }}
                />
              )}
            </Grid>
            <Grid item>
              <Typography
                sx={{
                  marginTop: '0.2em',
                  marginBottom: '-0.2em',
                }}>
                {`${selectedOption.label} - ${selectedOption.symbol}`}
              </Typography>
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
      {options.map(
        ({
          label: currencyLabel,
          symbol,
          FlagComponent,
          value: currencyValue,
        }) => (
          <MenuItem key={currencyValue} value={currencyValue}>
            {FlagComponent && (
              <FlagComponent style={{width: 24, height: 24, marginRight: 8}} />
            )}
            {symbol} - {currencyLabel}
          </MenuItem>
        ),
      )}
    </Select>
    {errorText && <Typography color="error">{errorText}</Typography>}
  </FormControl>
);

export default CurrencySelect;
