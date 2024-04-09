import {ReactNode, useEffect, useRef, useState} from 'react';
import {theme} from 'theme';
import {Box, IconButton, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Expand from '@mui/icons-material/Expand';
import {t} from 'i18next';
import {twentyFourHourTime} from 'utils/utils';
import * as _ from 'lodash';
import {getDateObject} from 'utils/datetime';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import {ServiceOrderView} from 'models/service-order';
import {ScheduleLabel} from 'components/Schedules/ScheduleLabel';
import {ScheduledItemGroup} from 'components/Schedules/model';
import {
  getItemPosition,
  getItemWidth,
  getPxFromString,
} from 'components/Schedules/utils';
import {isBefore} from 'date-fns';
import {EmployeesView} from 'models/employee';
import {useFormatDate} from 'hooks/useFormatDate';
import {SearchInput} from 'components/SearchInput';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog';

interface Props {
  technicians?: EmployeesView[];
  scheduleItems: {[key: string]: ServiceOrderView[]};
  renderCellItem: (
    cellItem: any,
    width: string,
    position: {x: string; y: string},
  ) => void;
  labelWidth?: string;
  cellHeight?: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  checkedValues?: string[];
  clearSelectedTechnicians: () => void;
  setTechnicianSearch: (value: string) => void;
  maxHeight?: string;
  viewDate: Date;
}

const gridWidth = 120;

export const TechnicianSchedule = ({
  scheduleItems,
  renderCellItem,
  labelWidth,
  getCheckedValue,
  cellHeight,
  technicians,
  checkedValues = [],
  clearSelectedTechnicians,
  setTechnicianSearch,
  maxHeight = '20rem',
  viewDate,
}: Props) => {
  const formatDate = useFormatDate();
  const [scheduleItemGroup, setScheduleItemGroup] =
    useState<ScheduledItemGroup>({});
  const tableHeader = ['RECOMMENDED ENGINEERS', ...twentyFourHourTime];
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);
  const [openViewInModal, setOpenViewInModal] = useState(false);

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
    const result = Object.keys(lookupTechnician)?.map((key) => ({
      [key]: tableHeader,
    }));
    setBodyRow(result);
  }, [lookupTechnician]);

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

  const numberOfSelectedEngineers = checkedValues.length;

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={1.5}>
        <Typography variant="subtitle2">{t('Select engineer(s)')}</Typography>
        <Box display="flex" gap={1.5}>
          {numberOfSelectedEngineers > 0 ? (
            <Button
              buttonProps={{
                variant: 'outlined',
                size: 'small',
                sx: {
                  background: 'transparent',
                },
                endIcon: <CloseIcon />,
                onClick: clearSelectedTechnicians,
              }}>
              {t('{{numberOfSelectedEngineers}} Engineer(s) Selected', {
                numberOfSelectedEngineers,
              })}
            </Button>
          ) : null}
          <SearchInput
            variant="outlined"
            label="Search"
            placeholder="Search engineer(s)"
            onValueChanged={(value) => setTechnicianSearch(value)}
          />
        </Box>
      </Box>
      <Box
        maxHeight={maxHeight}
        overflow="auto"
        sx={{
          '&::-webkit-scrollbar': {
            height: '0.2rem',
            width: '0.2rem',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '100vw',
            marginInline: '0.5rem',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '100vw',
            height: '1rem',
          },
        }}>
        <Box
          component="table"
          width="100%"
          sx={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            position: 'relative',
          }}>
          <ScheduleHeader>
            <ScheduleRow>
              {tableHeader.map((item, index) => {
                if (index === 0) {
                  return (
                    <ScheduleHeaderCell
                      containerStyles={{
                        color: theme.palette.text.secondary,
                        border: '1px solid #F1F5F9',
                        borderTop: '1px solid #F1F5F9',
                        px: 2,
                        py: 1.25,
                        ':first-of-type': {
                          left: 0,
                          zIndex: 3,
                          minWidth: '20rem',
                          color: theme.palette.text.secondary,
                        },
                      }}
                      key={index}
                      labelWidth={labelWidth}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Typography variant="caption" fontWeight={600}>
                          {t(item)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setOpenViewInModal(true)}>
                          <Expand />
                        </IconButton>
                      </Box>
                    </ScheduleHeaderCell>
                  );
                }
                return (
                  <ScheduleHeaderCell
                    cellWidth={gridWidth}
                    key={index}
                    label={item}
                    containerStyles={{
                      border: '1px solid #F1F5F9',
                      borderTop: '1px solid #F1F5F9',
                      pl: 1,
                      py: 1.25,
                    }}
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
                      const isChecked = checkedValues.includes(key);
                      return (
                        <ScheduleBodyCell
                          cellWidth={gridWidth}
                          cellHeight={cellHeight}
                          key={`${rowIndex}-${index}`}
                          containerStyles={{
                            border: isChecked
                              ? `1px solid ${theme.palette.primary.dark}`
                              : '1px solid #F1F5F9',
                            ':first-of-type': {
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              color: isChecked
                                ? theme.palette.inputBackground.main
                                : theme.palette.text.primary,
                              background: isChecked
                                ? theme.palette.primary.dark
                                : 'white',
                              pl: '1rem',
                            },
                          }}>
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
                                {
                                  scheduleItems[xKey].map((scheduleItem) => {
                                    const itemPosition = getItemPosition({
                                      scheduleItemGroup,
                                      startDateTime:
                                        scheduleItem.schedules[0].startTime,
                                      viewDate,
                                      rowKey: xKey,
                                      orderId: scheduleItem.id,
                                      gridWidth,
                                    });
                                    return renderCellItem(
                                      scheduleItem,
                                      getItemWidth({
                                        startDateTime:
                                          scheduleItem.schedules[0].startTime,
                                        endDateTime:
                                          scheduleItem.schedules[0].endTime,
                                        viewDate,
                                        gridWidth,
                                        horizontalPosition: getPxFromString(
                                          itemPosition.x,
                                        ),
                                      }),
                                      itemPosition,
                                    );
                                  }) as ReactNode
                                }
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
        </Box>
      </Box>
      <Dialog
        title="Select recommended engineers"
        onCancel={() => setOpenViewInModal(false)}
        onSave={() => setOpenViewInModal(false)}
        dialogProps={{
          maxWidth: 'xl',
          open: openViewInModal,
        }}
        dialogContentStyles={{
          mx: 0,
        }}
        showCancelButton={false}
        leftButton={
          <Button
            label="Close"
            buttonProps={{
              onClick: () => {
                setOpenViewInModal(false);
                clearSelectedTechnicians();
              },
              variant: 'text',
              size: 'large',
            }}
          />
        }
        saveButtonText={t('Select {{numberOfSelectedEngineers}} Engineer(s)', {
          numberOfSelectedEngineers,
        })}
        saveButtonVariant="outlined"
        disableSaveBtn={!numberOfSelectedEngineers}>
        <TechnicianSchedule
          scheduleItems={scheduleItems}
          renderCellItem={renderCellItem}
          labelWidth="15rem"
          getCheckedValue={getCheckedValue}
          cellHeight="50px"
          technicians={technicians}
          checkedValues={checkedValues}
          clearSelectedTechnicians={clearSelectedTechnicians}
          setTechnicianSearch={setTechnicianSearch}
          maxHeight="40rem"
          viewDate={viewDate}
        />
      </Dialog>
    </>
  );
};
