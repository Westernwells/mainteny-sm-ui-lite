import React from 'react';
import {Box, SxProps, Typography} from '@mui/material';
import {T} from 'utils/i18n-utils';

export const SectionTitle = ({
  Icon,
  title,
  actionComponent,
  containerSx,
}: {
  Icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {title?: string | undefined}
  >;
  title: string;
  actionComponent?: React.ReactNode;
  containerSx?: SxProps;
}) => (
  <Box
    sx={containerSx}
    display="flex"
    alignItems="center"
    justifyContent="space-between">
    <Box display="flex" alignItems="center" gap={1.5}>
      <Icon width="2rem" height="2rem" style={{marginBottom: '4px'}} />
      <Typography variant="h5">{T(title)}</Typography>
    </Box>
    {actionComponent}
  </Box>
);
