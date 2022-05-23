/* eslint-disable */
import {ReactNode, useEffect, useRef, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import Box from '@mui/material/Box';
import * as _ from 'lodash';
import Typography from '@mui/material/Typography';
import {differenceInMinutes, startOfDay} from 'date-fns';
import {formatDate, getDateObject} from 'utils/datetime';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import {ServiceOrderView} from 'models/service-order';
import CardHeader from '@mui/material/CardHeader';
import {useTheme} from '@mui/material/styles';
import {TechnicianView} from 'models/technician';
import {styles as sx} from 'components/Schedules/styles';
import {ScheduleControls} from 'components/Schedules/ScheduleControls';
import {ScheduleLabel} from 'components/Schedules/ScheduleLabel';
import {TechnicianSchedule} from './TechnicianSchedule';

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
        <CardContent sx={{padding: 0}}>
          {children}
          {
            // !hideSchedule ? (
            //   // <TechnicianSchedule
            //   //   scheduleItems={scheduleItems}
            //   //   renderCellItem={renderCellItem}
            //   //   defaultTypeLabel={defaultTypeLabel}
            //   //   labelWidth={labelWidth}
            //   //   getCheckedValue={getCheckedValue}
            //   //   cellHeight={cellHeight}
            //   //   technicians={technicians}
            //   //   checkedValues = {checkedValues}
            //   // />
            // ) : null
          }
        </CardContent>

        {cardFooter ? (
          <Box sx={[sx.footerContainer, footerContainerStyles || {}]}>
            {cardFooter}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};
