import React, {useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import {PageCard} from 'components/PageCard';
import {FormRadio} from 'components/form/FormRadio';
import {FlexContainer} from 'components/FlexContainer';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {EmptySection} from 'components/EmptySection';
import {convertToText} from 'utils/utils';
// import {useServiceOrderReport} from 'hooks/reactQuery/useServiceOrder';

interface Props {
  serviceOrder: ServiceOrderView;
}

export interface RadioOptions {
  value: string;
  label: string;
  subText: string;
}

// TODO: Create Enum to handle invoice types

const paymentOptions: RadioOptions[] = [
  {
    value: 'FULL',
    label: 'Full Amount',
    subText: `Select this to create invoice for full order value`,
  },
  {
    value: 'PARTIAL',
    label: 'Partial Amount',
    subText: `Select this to create invoice for the partial order value`,
  },
];

export const InvoiceType = ({serviceOrder}: Props) => {
  const options = useRef(paymentOptions).current;
  const [selectedOption, setSelectedOption] = useState<RadioOptions>(
    paymentOptions[0],
  );

  // const {data} = useServiceOrderReport({serviceOrderId: serviceOrder.id});

  return (
    <FlexContainer containerStyle={{mt: '2em'}}>
      <PageCard containerStyles={{flexGrow: 1}}>
        {[ServiceOrderStatus.CANCELLED, ServiceOrderStatus.EXPIRED].includes(
          serviceOrder.status,
        ) ? (
          <EmptySection
            size="small"
            label={`Unable to create Invoice for ${convertToText(
              serviceOrder.status,
            )} orders`}
            containerStyle={{mt: '8em'}}
          />
        ) : (
          <>
            <Typography variant="subtitle2" mt="1em" sx={{color: 'grey.700'}}>
              Selected Order
            </Typography>
            <Typography>{serviceOrder.number}</Typography>
            <Typography variant="subtitle2" mt="1em" sx={{color: 'grey.700'}}>
              Customer
            </Typography>
            <Typography>{serviceOrder.elevator.propertyOwner.name}</Typography>
            <Typography variant="subtitle2" mt="1em" sx={{color: 'grey.700'}}>
              Unit Number & Address
            </Typography>
            <Typography>{`${serviceOrder.elevator.number}, ${serviceOrder.elevator.address.fullName}`}</Typography>

            <RadioGroup name="radio-buttons-group" sx={{mt: '2em'}}>
              <Box sx={{display: 'flex'}}>
                {options.map((option) => (
                  <Box
                    key={option.label}
                    sx={{
                      width: '49%',
                      mr: '1em',
                      px: '1em',
                      border: `1px solid`,
                      borderColor: 'primary.outlinedHoverBg',
                      borderRadius: 2,
                    }}>
                    <FormRadio
                      value={option.value}
                      checked={selectedOption.value === option.value}
                      disabled={option.value === 'PARTIAL'}
                      handleChange={(e) => {
                        setSelectedOption(
                          e.target.value === 'FULL'
                            ? paymentOptions[0]
                            : paymentOptions[1],
                        );
                      }}
                      label={option.label}
                      radioProps={{
                        sx: {color: 'textSecondary'},
                      }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      {option.subText}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </RadioGroup>
            <Divider sx={{mt: '1.5em'}} />
          </>
        )}

        {selectedOption.value === 'FULL' && (
          <>
            <Typography variant="subtitle2" mt="1em" sx={{color: 'grey.700'}}>
              Total (excl VAT)
            </Typography>
            <Typography>€61,600</Typography>
          </>
        )}
        {selectedOption.value === 'PARTIAL' && <>PARTIAL AMOUNT</>}
      </PageCard>
    </FlexContainer>
  );
};
