import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import {ReactNode} from 'react';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  containerStyles?: {[key: string]: any};
  minHeight?: string | number;
  header: string | JSX.Element;
  headerActionIcon?: JSX.Element;
  children: ReactNode;
  headerAction?: () => void;
}

export const ContractCard = ({
  bodyContainerStyle,
  headerActionIcon,
  minHeight,
  containerStyles,
  header,
  headerAction = () => {},
  children,
}: Props) => (
  <Card
    sx={{
      border: 'none',
      minHeight,
      ...containerStyles,
    }}>
    <CardHeader
      sx={{pb: '1.5em'}}
      action={
        headerActionIcon ? (
          <IconButton onClick={headerAction}>{headerActionIcon}</IconButton>
        ) : null
      }
      title={header}
    />
    <CardContent sx={{...bodyContainerStyle}}>{children}</CardContent>
  </Card>
);
