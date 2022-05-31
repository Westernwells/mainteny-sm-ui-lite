import {ReactNode} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  containerStyles?: {[key: string]: string | number};
  headerStyles?: {[key: string]: string | number};
  minHeight?: string | number;
  header?: string | ReactNode;
  headerActionIcon?: JSX.Element;
  children: ReactNode;
  showHeaderBackground?: boolean;
}

export const BasicDetailsCard = ({
  bodyContainerStyle,
  headerActionIcon,
  minHeight,
  containerStyles,
  header,
  children,
  headerStyles,
  showHeaderBackground,
}: Props) => {
  const theme = useTheme();
  console.log(showHeaderBackground);
  return (
    <Card
      sx={{
        border: 'none',
        minHeight: minHeight || '5rem',
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
        px: '1em',
        ...containerStyles,
      }}>
      <CardHeader
        sx={{
          py: header ? '0.5em' : '0',
          my: '0.5em',
          px: !showHeaderBackground ? '0' : 'default',
          background: showHeaderBackground
            ? theme.palette.inputBackground.main
            : null,
          ...headerStyles,
        }}
        action={
          headerActionIcon ? <IconButton>{headerActionIcon}</IconButton> : null
        }
        title={header || undefined}
      />
      <CardContent
        sx={{py: '0', minHeight: '5rem', px: '0', ...bodyContainerStyle}}>
        {children}
      </CardContent>
    </Card>
  );
};
