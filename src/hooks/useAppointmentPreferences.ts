import {useForm} from 'react-hook-form';
import {useEffect} from 'react';
import {ElevatorSimpleView, ElevatorView} from 'models/elevator';
import {AppointmentFormModel} from 'models/unitForm';
import {parseTimeRulesData} from 'utils/elevator-utils';
import {titleCase} from 'utils/utils';

export const useAppointmentPreferences = (
  elevator: ElevatorView | ElevatorSimpleView,
) => {
  const parsedTimeRulesData = parseTimeRulesData(elevator.timeRules);

  const getDefaultValues = () => ({
    appointmentDaysOfWeek:
      parsedTimeRulesData?.daysOfWeek.map((val) => titleCase(val)) ?? [],
    openingHour: parsedTimeRulesData?.timeRange?.start ?? '',
    closingHour: parsedTimeRulesData?.timeRange?.end ?? '',
    shouldNotifyCustomer:
      elevator.additionalInfo?.customerAppointment?.shouldNotifyCustomer ??
      false,
    appointmentNotificationDue:
      elevator.additionalInfo?.customerAppointment
        ?.appointmentNotificationDue ?? 0,
    requiresAppointment:
      elevator.additionalInfo?.customerAppointment?.requiresAppointment ??
      false,
    description: elevator.additionalInfo.customerAppointment?.description ?? '',
    contactPersonId:
      elevator.additionalInfo.customerAppointment?.contactPerson?.id ?? '',
    contactPersonName: `${
      elevator.additionalInfo.customerAppointment?.contactPerson?.userAccount
        .firstName || ''
    } ${
      elevator.additionalInfo.customerAppointment?.contactPerson?.userAccount
        .lastName || ''
    }`,
  });

  const {watch, register, handleSubmit, setValue, reset} =
    useForm<AppointmentFormModel>({
      defaultValues: getDefaultValues(),
      mode: 'all',
    });

  useEffect(() => {
    reset(getDefaultValues());
  }, [elevator]);

  const disableSaveBtn = !!(
    (watch('openingHour') && !watch('closingHour')) ||
    (!watch('openingHour') && watch('closingHour')) ||
    (watch('openingHour') &&
      watch('closingHour') &&
      new Date(`1970-01-01T${watch('closingHour')}`) <=
        new Date(`1970-01-01T${watch('openingHour')}`))
  );

  return {
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    disableSaveBtn,
    getDefaultValues,
    parsedTimeRulesData,
  };
};
