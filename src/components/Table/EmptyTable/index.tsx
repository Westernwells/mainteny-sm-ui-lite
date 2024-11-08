import Box from '@mui/material/Box';
import {EmptySection} from 'components/EmptySection';
import React, {ReactNode} from 'react';

type Props = {
  label: string;
  subLabel: string;
  btnLabel: string;
  illustration:
    | 'jobs'
    | 'supplier'
    | 'employee'
    | 'purchase-invoice'
    | 'invoice';
  actionButton?: ReactNode;
  onClick?: () => void;
};

const EmptyTable = ({
  illustration,
  label,
  subLabel,
  btnLabel,
  actionButton,
  onClick,
}: Props) => (
  <Box
    flex={1}
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap={2}>
    <EmptySection
      label={label}
      size="tiny"
      showActionBtn={!actionButton}
      subLabel={subLabel}
      btnLabel={btnLabel}
      containerStyle={{mb: 0, mt: 1}}
      illustration={illustration}
      subLabelProps={{sx: {color: '#828DA3', mt: 1, width: '420px'}}}
      illustrationColor="#828DA3"
      btnAction={onClick}
    />

    {actionButton}
  </Box>
);

export default EmptyTable;
