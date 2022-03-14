import {ReactNode} from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';

export interface Props {
  children: ReactNode;
  headerLabel: string;
  headerContainerOverrideStyles?: {[key: string]: string | number};
  headerTextOverrideStyles?: {[key: string]: string | number};
  headerActionIcon?: JSX.Element;
  minHeight?: number | string;
  contentPadding?: string | number;
}

export const PageCard = ({
  children,
  headerLabel,
  headerContainerOverrideStyles,
  headerTextOverrideStyles,
  headerActionIcon,
  minHeight,
  contentPadding,
}: Props) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        minHeight: minHeight || '26rem',
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
      }}>
      <CardHeader
        sx={{
          background: theme.palette.inputBackground.main,
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
          <Typography
            variant="subtitle2"
            sx={{
              color: theme.palette.action.active,
              ...headerTextOverrideStyles,
            }}>
            {headerLabel}
          </Typography>
        }
      />
      <CardContent
        sx={{
          px: contentPadding || 'default',
        }}>
        {children}
      </CardContent>
    </Card>
  );
};
