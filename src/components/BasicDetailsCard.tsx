import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import {ReactNode} from 'react';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  containerStyles?: {[key: string]: string | number};
  headerStyles?: {[key: string]: string | number};
  minHeight?: string | number;
  header: string | JSX.Element;
  headerActionIcon?: JSX.Element;
  children: ReactNode;
}

export const BasicDetailsCard = ({
  bodyContainerStyle,
  headerActionIcon,
  minHeight,
  containerStyles,
  header,
  children,
  headerStyles,
}: Props) => (
  <Card
    sx={{
      border: 'none',
      minHeight,
      ...containerStyles,
    }}>
    <CardHeader
      sx={{pb: '1.5em', ...headerStyles}}
      action={
        headerActionIcon ? <IconButton>{headerActionIcon}</IconButton> : null
      }
      title={header}
    />
    <CardContent sx={{...bodyContainerStyle}}>{children}</CardContent>
  </Card>
);
