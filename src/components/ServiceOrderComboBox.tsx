import React, {forwardRef, useEffect, useState, SyntheticEvent} from 'react';
import {
  Autocomplete,
  TextFieldProps,
  Popper,
  PopperProps,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {iconMapping} from 'pages/ServiceOrders';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import {FormInput} from './form/FormInput';

interface ServiceOrderOption {
  id: string;
  externalId: string;
  address: string;
  company: string;
  type: string;
}

interface Props {
  options: ServiceOrderOption[];
  getQuery?: (val: string | null) => void;
  getValue?: (val: ServiceOrderOption | null) => void;
  initialValue?: ServiceOrderOption | null;
  textFieldProps?: TextFieldProps;
  containerStyles?: {[key: string]: any};
}

const CustomPopper = ({anchorEl, ...props}: PopperProps) => (
  <Popper
    {...props}
    anchorEl={anchorEl}
    placement="bottom-start"
    style={{
      width: '27%',
      maxHeight: 270,
      overflowY: 'auto',
      borderRadius: '4px',
      marginTop: 0,
      zIndex: 1300,
      boxShadow: `
          0px 9px 46px 8px #0000001F, 
          0px 24px 38px 3px #00000024, 
          0px 11px 15px -7px #00000033
        `,
    }}
    modifiers={[
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ]}
  />
);

export const ServiceOrderComboBox = forwardRef(
  (
    {
      options,
      getQuery,
      getValue,
      initialValue = null,
      textFieldProps,
      containerStyles,
    }: Props,
    ref,
  ) => {
    const [item, setItem] = useState<ServiceOrderOption | null>(initialValue);
    const [query, setQuery] = useState<string>(initialValue?.externalId || '');
    const {user} = useUserSession();
    const {data: jobTypes} = useCompanyJobTypes(
      user?.userAccount.serviceCompany.id!,
    );

    useEffect(() => {
      if (getValue) {
        getValue(item);
      }
      if (item) {
        setQuery(item.externalId);
      }
    }, [item]);

    useEffect(() => {
      if (getQuery) {
        getQuery(query);
      }
      if (!query && getValue) {
        getValue(null);
      }
    }, [query]);

    const onInputChange = (
      event: SyntheticEvent,
      value: string,
      reason: string,
    ) => {
      if (reason === 'input') {
        setQuery(value);
      }
      if (reason === 'clear') {
        setQuery('');
        setItem(null);
      }
    };

    return (
      <Autocomplete
        ref={ref}
        disablePortal
        id="service-order-combo-box"
        size="small"
        inputValue={query}
        onInputChange={onInputChange}
        options={options}
        filterOptions={(x) => x}
        getOptionLabel={(option: ServiceOrderOption) => option.externalId}
        onChange={(
          event: any,
          newValue: string | ServiceOrderOption | null,
        ) => {
          if (typeof newValue !== 'string') {
            setItem(newValue);
          }
        }}
        isOptionEqualToValue={(option, value) =>
          typeof option !== 'string' && typeof value !== 'string'
            ? option.id === value.id
            : option === value
        }
        sx={{
          width: '100%',
          '& .MuiAutocomplete-popupIndicator': {display: 'none'},
          ...containerStyles,
        }}
        PopperComponent={CustomPopper}
        renderOption={(props, option: ServiceOrderOption) => {
          const jobType = jobTypes?.find((job) => job.name === option.type);
          const IconComponent =
            iconMapping[jobType?.icon as keyof typeof iconMapping] ||
            HelpOutlineOutlinedIcon;

          return (
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <IconComponent style={{fontSize: '1.5rem', marginRight: 3}} />
                </Grid>
                <Grid item>
                  <Typography variant="body1" sx={{mt: -1}}>
                    {option.externalId}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container>
                <Typography variant="body2" sx={{color: '#828DA3', mt: -1.5}}>
                  {option.address}
                </Typography>
              </Grid>
              <Grid container>
                <Typography variant="caption" sx={{color: '#828DA3', mt: -1}}>
                  {option.company}
                </Typography>
              </Grid>
            </Box>
          );
        }}
        renderInput={(params) => (
          <FormInput
            fieldProps={{
              ...params,
              ...textFieldProps,
              InputLabelProps: {shrink: true},
            }}
          />
        )}
      />
    );
  },
);
