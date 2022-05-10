import {ReactNode} from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';

export interface Props {
  children: ReactNode;
  headerContainerOverrideStyles?: {[key: string]: string | number};
  headerTextOverrideStyles?: {[key: string]: string | number};
  headerActionIcon?: JSX.Element;
  minHeight?: number | string;
  // contentPadding?: string | number;
  headerLabel?: string;
  customHeader?: JSX.Element;
  containerStyles?: {[key: string]: string | number};
  contentContainerStyles?: {[key: string]: string | number};
}

export const PageCard = ({
  children,
  headerLabel = '',
  containerStyles,
  headerContainerOverrideStyles,
  headerTextOverrideStyles,
  headerActionIcon,
  minHeight,
  // contentPadding,
  customHeader,
  contentContainerStyles,
}: Props) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        minHeight,
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
        ...containerStyles,
      }}>
      <CardHeader
        sx={{
          height: '2rem',
          mt: '1em',
          mx: '0.5em',
          ...headerContainerOverrideStyles,
        }}
        action={
          headerActionIcon ? (
            <IconButton aria-label="settings">{headerActionIcon}</IconButton>
          ) : null
        }
        title={
          customHeader || (
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.primary,
                ...headerTextOverrideStyles,
              }}>
              {headerLabel}
            </Typography>
          )
        }
      />
      <CardContent
        sx={{
          mx: '0.5em',
          ...contentContainerStyles,
        }}>
        {children}
      </CardContent>
    </Card>
  );
};
