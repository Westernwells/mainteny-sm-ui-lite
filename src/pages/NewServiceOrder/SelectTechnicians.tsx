import React, {useCallback, useEffect, useState} from 'react';
import {t} from 'i18next';
import * as _ from 'lodash';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {ContactChannel, ServiceOrderView} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging';
import {
  useFetchRecommendedTechnician,
  useQueryServiceCompanyTechnicians,
} from 'hooks/reactQuery/useTechnician';
import {useQueryServiceOrderScheduled} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay} from 'date-fns';
import {toRestDateTime} from 'utils/datetime';
import {NewJobScheduleItem} from 'components/Schedules/NewJobScheduleItem';
import {NewJobOrderDetails} from 'components/NewJobOrderDetails';
import {Switch} from 'components/Switch';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {EmployeesView} from 'models/employee';
import {sortOrderByTime} from 'utils/service-order-utils';
import {TechnicianSchedule} from './TechnicianSchedule';
import {ScheduleForm} from './ScheduleForm';
import {DueDateFormProps, ScheduleTechnicianForm} from './models';
import {DueDateForm} from './DueDateForm';

interface Props {
  elevatorId?: string;
  initialSelectedTechnicians?: EmployeesView[];
  getSelectedTechnicians?: (val: EmployeesView[]) => void;
  getRecommendedTechnicianView?: (val: EmployeesView[]) => void;
  initialRecommendedTechnicians?: EmployeesView[];
  scheduleFormValue: ScheduleTechnicianForm | null;
  getScheduleFormValue?: (form: ScheduleTechnicianForm) => void;
  dueDateFormValue: DueDateFormProps | null;
  getDueDateFormValues?: (form: DueDateFormProps) => void;
  dueDateFormIsErrored?: (value: boolean) => void;
  requireTechnicianNotification: boolean;
  setRequireTechnicianNotification: (value: boolean) => void;
  notificationChannels: ContactChannel[];
  setNotificationChannels: (value: ContactChannel[]) => void;
  selectedUnitChange: boolean;
}

interface CheckBoxState {
  checked: boolean;
  value: string;
}

export const SelectTechnicians = ({
  elevatorId,
  getSelectedTechnicians,
  getRecommendedTechnicianView,
  initialRecommendedTechnicians,
  initialSelectedTechnicians,
  scheduleFormValue,
  getScheduleFormValue = () => {},
  dueDateFormValue,
  getDueDateFormValues = () => {},
  dueDateFormIsErrored,
  requireTechnicianNotification,
  setRequireTechnicianNotification,
  notificationChannels,
  setNotificationChannels,
  selectedUnitChange,
}: Props) => {
  const [checkboxState, setCheckboxState] = useState<CheckBoxState>(
    {} as CheckBoxState,
  );
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>(
    initialSelectedTechnicians
      ? initialSelectedTechnicians.map((item) => item.id)
      : [],
  );

  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 500));
  const scheduledStartDateTime = scheduleFormValue?.startDate
    ? new Date(
        scheduleFormValue.startDate.getFullYear(),
        scheduleFormValue.startDate.getMonth(),
        scheduleFormValue.startDate.getDate(),
        scheduleFormValue.startTime?.getHours() || new Date().getHours(),
        scheduleFormValue.startTime?.getMinutes() || new Date().getMinutes(),
      )
    : null;
  const queryDate =
    scheduledStartDateTime || dueDateFormValue?.date || new Date();
  const [recommendedTechniciansView, setRecommendedTechniciansView] = useState<
    EmployeesView[]
  >(initialRecommendedTechnicians || []);
  const {
    data: recommendedTechniciansData = [],
    isLoading: isLoadingRecommendedTechnicians,
  } = useFetchRecommendedTechnician(
    {
      time: toRestDateTime(queryDate),
      count: 10,
    },
    elevatorId,
  );
  const [technicianSearch, setTechnicianSearch] = useState<string>('');
  const {
    data: technicianResource = createEmptyResource<EmployeesView>(
      page.pageSize,
    ),
  } = useQueryServiceCompanyTechnicians({
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: technicianSearch,
  });
  const recommendedTechnicians = technicianSearch
    ? technicianResource.data
    : recommendedTechniciansData;
  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(5),
    isLoading: isLoadingOrderSchedules,
  } = useQueryServiceOrderScheduled({
    start: toRestDateTime(startOfDay(queryDate)),
    end: toRestDateTime(endOfDay(queryDate)),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: '',
    status: [],
  });

  useEffect(() => {
    if (getRecommendedTechnicianView) {
      getRecommendedTechnicianView(recommendedTechniciansView);
    }
  }, [recommendedTechniciansView]);

  useEffect(() => {
    if (selectedUnitChange) {
      setSelectedTechnicianIds([]);
    }
  }, [selectedUnitChange]);

  useEffect(() => {
    if (getSelectedTechnicians) {
      const result = recommendedTechniciansView.filter((item) =>
        selectedTechnicianIds.includes(item.id),
      );

      getSelectedTechnicians(result);
    }
  }, [selectedTechnicianIds]);

  useEffect(() => {
    if (!isLoadingOrderSchedules) {
      const sortedOrder = sortOrderByTime(serviceOrders.data);
      const groupByTechnicianId = _.groupBy(
        sortedOrder,
        (serviceOrder) => serviceOrder.schedules[0].technician.id,
      );
      setOrders(groupByTechnicianId);
    }
  }, [serviceOrders, isLoadingOrderSchedules]);

  useEffect(() => {
    if (!isLoadingRecommendedTechnicians) {
      const ids = recommendedTechnicians.map((item) => item.id);
      const result = recommendedTechniciansView.filter(
        (item) => !ids.includes(item.id),
      );
      setRecommendedTechniciansView([...recommendedTechnicians, ...result]);
    }
  }, [recommendedTechnicians, isLoadingRecommendedTechnicians]);

  useEffect(() => {
    if (
      !Object.keys(checkboxState).length ||
      selectedTechnicianIds.length >= 10
    )
      return;
    if (!selectedTechnicianIds.includes(checkboxState.value)) {
      setSelectedTechnicianIds([...selectedTechnicianIds, checkboxState.value]);
    } else {
      setSelectedTechnicianIds(
        selectedTechnicianIds.filter((item) => item !== checkboxState.value),
      );
    }
  }, [checkboxState]);

  const clearSelectedTechnicians = () => {
    setSelectedTechnicianIds([]);
  };

  const getCheckedValue = useCallback(
    (checked: boolean, value: string) => setCheckboxState({checked, value}),
    [],
  );

  const getSchedulePeriod = (period: 'start' | 'end' | 'now') => {
    const now = new Date();
    if (period === 'start') {
      now.setMinutes(now.getMinutes());
      return now;
    }
    if (period === 'end') {
      now.setMinutes(now.getMinutes() + 60);
      return now;
    }
    // retuns current time
    return now;
  };

  const handleChangeNotificationChannels = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const {value, checked} = event.target;
    if (checked) {
      setNotificationChannels([
        ...notificationChannels,
        value as ContactChannel,
      ]);
    } else {
      setNotificationChannels(
        notificationChannels.filter((item) => item !== value),
      );
    }
  };

  const renderCellItem = (
    order: ServiceOrderView,
    width: string,
    position: {x: string; y: string},
  ) => (
    <NewJobScheduleItem
      key={order.id}
      width={width}
      tooltip={NewJobOrderDetails}
      order={order}
      position={position}
    />
  );

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <DueDateForm
        defaultStartDate={getSchedulePeriod('start')}
        getDueDateFormValues={(form: DueDateFormProps) =>
          getDueDateFormValues(form)
        }
        dueDateFormIsErrored={(val: boolean) =>
          dueDateFormIsErrored && dueDateFormIsErrored(val)
        }
        containerStyles={{maxWidth: '20rem', py: 3}}
      />

      <ScheduleForm
        getScheduleFormValues={getScheduleFormValue}
        defaultValues={scheduleFormValue || undefined}
      />

      <Box>
        <TechnicianSchedule
          scheduleItems={orders}
          renderCellItem={renderCellItem}
          labelWidth="15rem"
          getCheckedValue={getCheckedValue}
          cellHeight="50px"
          technicians={recommendedTechniciansView}
          checkedValues={selectedTechnicianIds}
          clearSelectedTechnicians={clearSelectedTechnicians}
          setTechnicianSearch={setTechnicianSearch}
          viewDate={queryDate}
          selectedTechnicianIds={selectedTechnicianIds}
          selectedUnitChange={selectedUnitChange}
        />
      </Box>

      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="subtitle2">
          {t('Engineer confirmation required')}
        </Typography>
        <Tooltip
          title={t(
            'If this option is selected the engineer has to confirm the job either via mobile app or phone call. If the job is not confirmed it will not be scheduled.',
          )}
          placement="top"
          arrow>
          <IconButton sx={{color: 'action.active', p: 0}}>
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Switch
          value={requireTechnicianNotification}
          onChanged={setRequireTechnicianNotification}
        />
      </Box>

      <Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="subtitle2">
            {t('Inform the enginer(s) via:')}
          </Typography>
          <Tooltip
            title={t(
              'SMS and phone calls are automatically generated by the system. The engineer will always get a notification in the mobile app.',
            )}
            placement="top"
            arrow>
            <IconButton sx={{color: 'action.active', p: 0}}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <FormCheckbox
          value={ContactChannel.PUSH_NOTIFICATION}
          label="App"
          checked={notificationChannels.includes(
            ContactChannel.PUSH_NOTIFICATION,
          )}
          disabled
          typographyProps={{variant: 'body2'}}
          checkboxProps={{
            size: 'small',
            sx: {pt: 1},
          }}
        />
        <FormCheckbox
          value={ContactChannel.SMS}
          label="SMS"
          checked={notificationChannels.includes(ContactChannel.SMS)}
          handleChange={handleChangeNotificationChannels}
          typographyProps={{variant: 'body2'}}
          checkboxProps={{
            size: 'small',
            sx: {pt: 1},
          }}
        />
        {requireTechnicianNotification ? (
          <FormCheckbox
            value={ContactChannel.PHONE_CALL}
            label="Phone Call"
            checked={notificationChannels.includes(ContactChannel.PHONE_CALL)}
            handleChange={handleChangeNotificationChannels}
            typographyProps={{variant: 'body2'}}
            checkboxProps={{
              size: 'small',
              sx: {pt: 1},
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
};
