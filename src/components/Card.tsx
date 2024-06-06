import {PropsWithChildren} from 'react';
import {t} from 'i18next';
import {Box, Typography, IconButton, BoxProps} from '@mui/material';
import {EditOutlined, SvgIconComponent} from '@mui/icons-material';

export interface Props extends PropsWithChildren {
  title: string;
  ActionIcon?: SvgIconComponent;
  actionHandler?: () => void;
  containerProps?: BoxProps;
}

export const Card = ({
  title,
  ActionIcon = EditOutlined,
  actionHandler = () => {},
  containerProps,
  children,
}: Props) => (
  <Box bgcolor="white" p={3} borderRadius={1} {...containerProps}>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      pb={3}>
      <Typography variant="h5" color="primary.dark">
        {t(title)}
      </Typography>
      {ActionIcon && (
        <IconButton size="small" sx={{p: 0}} onClick={actionHandler}>
          <ActionIcon sx={{color: 'text.secondary', fontSize: '1.5rem'}} />
        </IconButton>
      )}
    </Box>
    {children}
  </Box>
);
