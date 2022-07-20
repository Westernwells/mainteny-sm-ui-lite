import {useEffect, useRef, useState} from 'react';
import {twentyFourHourTime} from 'utils/utils';
import * as _ from 'lodash';
import {getDateObject} from 'utils/datetime';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import {ServiceOrderView} from 'models/service-order';
import {ScheduleControls} from 'components/Schedules/ScheduleControls';
import {ScheduleLabel} from 'components/Schedules/ScheduleLabel';
import {ScheduledItemGroup} from 'components/Schedules/model';
import {getItemPosition, getItemWidth} from 'components/Schedules/utils';
import {isBefore} from 'date-fns';
import {EmployeesView} from 'models/employee';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  technicians?: EmployeesView[];
  scheduleItems: {[key: string]: ServiceOrderView[]};
  renderCellItem: (
    cellItem: any,
    width: string,
    position: {x: string; y: string},
  ) => void;
  defaultTypeLabel?: string;
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
  const formatDate = useFormatDate();
  const [scheduleItemGroup, setScheduleItemGroup] =
    useState<ScheduledItemGroup>({});
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);

  const [lookupTechnician, setLookupTechnician] = useState<{
    [key: string]: EmployeesView[];
  }>({});

  useEffect(() => {
    const result: ScheduledItemGroup = {};
    Object.keys(scheduleItems).forEach((key) => {
      const items = scheduleItems[key];
      result[key] = {};
      let previousOrder: ServiceOrderView | null = null;

      items.forEach((item) => {
        if (previousOrder) {
          const previousEndTime = new Date(previousOrder.schedules[0].endTime);
          const currentOrderStartTime = new Date(item.schedules[0].startTime);
          if (isBefore(currentOrderStartTime, previousEndTime)) {
            const previousOrderNextLevel = result[key][previousOrder.id];
            result[key][item.id] = previousOrderNextLevel + 1;
          } else {
            result[key][item.id] = 1;
          }
        } else {
          result[key][item.id] = 1;
        }
        previousOrder = item;
      });
    });

    setScheduleItemGroup(result);
  }, [scheduleItems]);

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
                                getItemWidth({
                                  startDateTime:
                                    scheduleItem.schedules[0].startTime,
                                  endDateTime:
                                    scheduleItem.schedules[0].endTime,
                                  gridWidth,
                                }),
                                getItemPosition({
                                  scheduleItemGroup,
                                  startDateTime:
                                    scheduleItem.schedules[0].startTime,
                                  rowKey: xKey,
                                  orderId: scheduleItem.id,
                                  gridWidth,
                                }),
                                // calculatePosition,
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
