import {ReactNode, useEffect, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {formatDate, getDateObject} from 'utils/datetime';
import CardHeader from '@mui/material/CardHeader';
import {useTheme} from '@mui/material/styles';
import {styles as sx} from 'components/Schedules/styles';

interface Props {
  containerStyles?: {[key: string]: any};
  footerContainerStyles?: {[key: string]: any};
  contentContainerStyle?: {[key: string]: any};
  cardFooter?: ReactNode;
  cardHeaderLabel?: string;
  customCardHeader?: JSX.Element;
  children?: ReactNode;
}

const gridWidth = 120;

export const ContainerCard = ({
  containerStyles,
  cardFooter,
  cardHeaderLabel,
  customCardHeader,
  footerContainerStyles,
  contentContainerStyle,
  children,
}: Props) => {
  const theme = useTheme();
  const elementRef = useRef<HTMLInputElement | undefined>();

  useEffect(() => {
    const date = getDateObject(new Date());
    const h = formatDate(date, 'H');
    const m = formatDate(date, 'm');
    const scrollWidth = gridWidth * (Number(h) + Number(m) / 60);

    const timeout = window.setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.scroll({
          left: scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Card sx={[sx.card, {...containerStyles}]}>
      {customCardHeader || cardHeaderLabel ? (
        <CardHeader
          sx={{
            minHeight: '0',
          }}
          title={
            customCardHeader || (
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.text.primary,
                }}>
                {cardHeaderLabel}
              </Typography>
            )
          }
        />
      ) : null}

      <Box ref={elementRef} sx={[sx.mainContainer, {...contentContainerStyle}]}>
        <CardContent sx={{padding: 0}}>{children}</CardContent>

        {cardFooter ? (
          <Box sx={[sx.footerContainer, footerContainerStyles || {}]}>
            {cardFooter}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};
