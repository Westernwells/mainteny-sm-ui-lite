/* eslint-disable */
import {useEffect, useRef, useState} from 'react';

import {twentyFourHourTime} from 'utils/utils';

import * as _ from 'lodash';

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
import {useTheme} from '@mui/material/styles';
import {TechnicianView} from 'models/technician';
import {ScheduleControls} from 'components/Schedules/ScheduleControls';
import {ScheduleLabel} from 'components/Schedules/ScheduleLabel';

interface Props {
  technicians?: TechnicianView[];
  scheduleItems: {[key: string]: ServiceOrderView[]};
  renderCellItem: (
    cellItem: any,
    calcWidth: (startDateTime: string, endDateTime: string) => string,
    calcPosition: (startDateTime: string) => string,
  ) => void;
  defaultTypeLabel?: string;
  // makeLabelSelectable?: boolean;
  labelWidth?: string;
  cellHeight?: string;
  getCheckedValue?: (checked: boolean, value: string) => void;

  checkedValues?: string[];
}

const gridWidth = 120;

export const TechnicianSchedule = ({
  scheduleItems,
  renderCellItem,
  defaultTypeLabel = '',
  labelWidth,
  getCheckedValue,
  cellHeight,
  technicians,
  checkedValues = [],
}: Props) => {
  // const theme = useTheme();
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);

  const [lookupTechnician, setLookupTechnician] = useState<{
    [key: string]: TechnicianView[];
  }>({});

  useEffect(() => {
    setLookupTechnician(_.groupBy(technicians, (technician) => technician.id));
  }, [technicians]);

  useEffect(() => {
    setTableHeader([defaultTypeLabel, ...twentyFourHourTime]);
  }, []);

  useEffect(() => {
    if (tableHeader.length) {
      const result = Object.keys(lookupTechnician)?.map((key) => ({
        [key]: tableHeader,
      }));
      setBodyRow(result);
    }
  }, [tableHeader, lookupTechnician]);

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

  const calculatePosition = (startDateTime: string) => {
    const morningTime = startOfDay(new Date(startDateTime));
    const orderStartTime = getDateObject(startDateTime);
    const result =
      gridWidth * (differenceInMinutes(orderStartTime, morningTime) / 60);
    return `${result}px`;
  };

  const calculateWidth = (startDateTime: string, endDateTime: string) => {
    const width =
      (differenceInMinutes(
        getDateObject(endDateTime),
        getDateObject(startDateTime),
      ) /
        60) *
      gridWidth;

    return `${width}px`;
  };

  return (
    <ScheduleContainer>
      <ScheduleHeader>
        <ScheduleRow>
          {tableHeader.map((item, index) => {
            if (index === 0) {
              return (
                <ScheduleHeaderCell key={index} labelWidth={labelWidth}>
                  <ScheduleControls item={item} />
                </ScheduleHeaderCell>
              );
            }
            return (
              <ScheduleHeaderCell
                cellWidth={gridWidth}
                key={index}
                label={item}
              />
            );
          })}
        </ScheduleRow>
      </ScheduleHeader>

      <ScheduleBody>
        {bodyRow.map((dayRow, rowIndex) => (
          <ScheduleRow key={rowIndex}>
            {Object.keys(dayRow).map((key) =>
              dayRow[key].map((item, index) => {
                if (index === 0) {
                  const label = `${lookupTechnician[key][0].userAccount.firstName} ${lookupTechnician[key][0].userAccount.lastName}`;
                  return (
                    <ScheduleBodyCell
                      cellWidth={gridWidth}
                      cellHeight={cellHeight}
                      key={`${rowIndex}-${index}`}>
                      <ScheduleLabel
                        id={key}
                        checkboxValue={key}
                        makeLabelSelectable
                        getCheckedValue={getCheckedValue}
                        scheduleItems={scheduleItems}
                        item={label || ''}
                        checkedValues={checkedValues}
                      />
                    </ScheduleBodyCell>
                  );
                }

                if (index === 1) {
                  return Object.keys(scheduleItems).map((xKey) => {
                    if (xKey === key) {
                      return (
                        <ScheduleBodyCell
                          cellHeight={cellHeight}
                          key={`${rowIndex}-${index}`}
                          cellWidth={gridWidth}>
                          <ScheduleItemContainer>
                            {scheduleItems[xKey].map((scheduleItem) =>
                              renderCellItem(
                                scheduleItem,
                                calculateWidth,
                                calculatePosition,
                              ),
                            )}
                          </ScheduleItemContainer>
                        </ScheduleBodyCell>
                      );
                    }
                    return null;
                  });
                }
                return (
                  <ScheduleBodyCell
                    cellHeight={cellHeight}
                    key={`${rowIndex}-${index}`}
                  />
                );
              }),
            )}
          </ScheduleRow>
        ))}
      </ScheduleBody>
    </ScheduleContainer>
  );
};
