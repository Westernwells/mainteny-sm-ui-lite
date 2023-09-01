import {
  MessageType,
  NonTechnicianAssignmentData,
  ServiceOrderAssignedData,
  TechnicianJobScheduleUpdatedData,
} from 'models/notification';
import {useTranslation} from 'react-i18next';

export const convertEmergencyOrderAccepted = (
  data: string,
): ServiceOrderAssignedData => <ServiceOrderAssignedData>JSON.parse(data);

export const convertNonTechnicianAssignement = (
  data: string,
): NonTechnicianAssignmentData => <NonTechnicianAssignmentData>JSON.parse(data);

export const convertTechnicianUpdated = (
  data: string,
): TechnicianJobScheduleUpdatedData =>
  <TechnicianJobScheduleUpdatedData>JSON.parse(data);

export const notificationJSONDataToObject = (
  messageType: MessageType | string,
  data: string,
) => {
  switch (messageType) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED:
      return convertEmergencyOrderAccepted(data);
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
      return convertNonTechnicianAssignement(data);
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED:
      return convertTechnicianUpdated(data);
    default:
      return convertNonTechnicianAssignement(data);
  }
};

export const notificationTypeToString = (type: MessageType | string) => {
  const {t} = useTranslation();

  switch (type) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED:
      return t('Service Job Accepted');
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
      return t('Service Job Unassigned');
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED:
      return t('Schedule Updated');
    default:
      return '-';
  }
};

export const notificationTitle = (
  type: MessageType | string,
  notificationData:
    | NonTechnicianAssignmentData
    | ServiceOrderAssignedData
    | TechnicianJobScheduleUpdatedData,
) => {
  switch (type) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED:
      return (notificationData as ServiceOrderAssignedData).serviceOrder
        .elevator.propertyOwner.name;
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
      return (notificationData as NonTechnicianAssignmentData).serviceOrder
        .elevator.propertyOwner.name;
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED: {
      const technician = (notificationData as TechnicianJobScheduleUpdatedData)
        .technician.userAccount;
      return `${technician.firstName} ${technician.lastName}`;
    }
    default:
      return '-';
  }
};

export const notificationSubtitle = (
  type: MessageType | string,
  notificationData:
    | NonTechnicianAssignmentData
    | ServiceOrderAssignedData
    | TechnicianJobScheduleUpdatedData,
) => {
  const {t} = useTranslation();

  switch (type) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED: {
      const technician = (notificationData as ServiceOrderAssignedData)
        .serviceOrder.technician.userAccount;
      return t(
        '{{firstName}} {{lastName}} accepted the service job request at {{address}}',
        {
          firstName: technician.firstName,
          lastName: technician.lastName,
          address: (notificationData as ServiceOrderAssignedData).serviceOrder
            .elevator.address.fullName,
        },
      );
    }
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER: {
      return t(
        'No technicians accepted the service job request at {{address}}',
        {
          address: (notificationData as NonTechnicianAssignmentData)
            .serviceOrder.elevator.address.fullName,
        },
      );
    }
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED: {
      const technician = (notificationData as TechnicianJobScheduleUpdatedData)
        .technician.userAccount;
      return t("{{firstName}} {{lastName}}'s schedule has been updated.", {
        firstName: technician.firstName,
        lastName: technician.lastName,
      });
    }
    default:
      return '-';
  }
};

export const notificationButtonLabel = (type: MessageType | string) => {
  switch (type) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED:
      return 'View Order';
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
      return 'Assign Technician';
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED: {
      return 'View Schedule';
    }
    default:
      return '-';
  }
};
