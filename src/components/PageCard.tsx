import {ReactNode} from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {SxProps, Theme} from '@mui/system';
import {Box} from '@mui/material';

export interface Props {
  children: ReactNode;
  headerStyles?: SxProps<Theme>;
  headerTextOverrideStyles?: SxProps<Theme>;
  headerActionIcon?: JSX.Element;
  minHeight?: number | string;
  headerIcon?: JSX.Element;
  headerLabel?: string;
  customHeader?: JSX.Element;
  containerStyles?: {[key: string]: any};
  contentContainerStyles?: SxProps<Theme>;
  handleAction?: () => void;
}

export const PageCard = ({
  children,
  headerIcon,
  headerLabel = '',
  containerStyles,
  headerStyles,
  headerTextOverrideStyles,
  headerActionIcon,
  minHeight,
  customHeader,
  contentContainerStyles,
  handleAction = () => {},
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Card
      sx={{
        minHeight,
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
        ...containerStyles,
      }}>
      {customHeader || headerLabel ? (
        <CardHeader
          sx={{
            minHeight: '2rem',
            mt: '0.5em',
            mx: '0.5em',
            p: '0.75em 0em 0em 1.1em',
            ...headerStyles,
          }}
          action={
            headerActionIcon ? (
              <IconButton onClick={handleAction} aria-label="settings">
                {headerActionIcon}
              </IconButton>
            ) : null
          }
          title={
            customHeader || (
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                {headerIcon && headerIcon}
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    marginLeft: headerIcon ? '0.5em' : '0em',
                    ...headerTextOverrideStyles,
                  }}>
                  {t(headerLabel)}
                </Typography>
              </Box>
            )
          }
        />
      ) : null}

      {children ? (
        <CardContent
          sx={{
            mx: '0.5em',
            ...contentContainerStyles,
          }}>
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
};
