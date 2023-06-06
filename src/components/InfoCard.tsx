import {ReactNode} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';

export interface Props {
  bodyContainerStyle?: {[key: string]: any};
  containerStyles?: {[key: string]: any};
  headerStyles?: {[key: string]: string | number};
  minHeight?: string | number;
  header?: string | ReactNode;
  headerActionIcon?: JSX.Element;
  children: ReactNode;
  showHeaderBackground?: boolean;
  disabledHeader?: boolean;
  handleAction?: () => void;
}

export const InfoCard = ({
  bodyContainerStyle,
  headerActionIcon,
  minHeight,
  containerStyles,
  header,
  children,
  headerStyles,
  showHeaderBackground,
  disabledHeader = false,
  handleAction,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  return (
    <Card
      sx={{
        border: 'none',
        minHeight: minHeight || '5rem',
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
        px: '1em',
        ...containerStyles,
      }}>
      {!disabledHeader && (
        <CardHeader
          sx={{
            py: header ? '0.25rem' : '0',
            my: '1em',
            px: !showHeaderBackground ? '0' : '0.5rem',
            background: showHeaderBackground
              ? theme.palette.inputBackground.main
              : null,
            ...headerStyles,
          }}
          action={
            headerActionIcon ? (
              <IconButton onClick={handleAction}>{headerActionIcon}</IconButton>
            ) : null
          }
          title={typeof header === 'string' ? t(header) : header || undefined}
        />
      )}
      <CardContent
        sx={{py: '0', minHeight: '5rem', px: '0', ...bodyContainerStyle}}>
        {children}
      </CardContent>
    </Card>
  );
};
