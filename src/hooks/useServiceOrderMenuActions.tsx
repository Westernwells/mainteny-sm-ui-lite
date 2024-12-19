import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {MenuAction} from 'models/action';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import UndoIcon from '@mui/icons-material/Undo';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import {
  canMarkCompleted,
  getIsNotPendingStatus,
} from 'utils/service-order-utils';
import {Check} from '@mui/icons-material';
import FileDownload from '@mui/icons-material/FileDownload';

type Props = {
  serviceOrder: ServiceOrderView;
  onChangeStatus: () => void;
  onReopen: () => void;
  onCancel: () => void;
  onUndoCancel: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onSchedule: () => void;
  onReschedule: () => void;
  onUnschedule: () => void;
  onMarkCompleted: () => void;
  onDownload: () => void;
};

const useServiceOrderMenuActions = ({
  serviceOrder,
  onChangeStatus,
  onReopen,
  onCancel,
  onUndoCancel,
  onArchive,
  onUnarchive,
  onSchedule,
  onReschedule,
  onUnschedule,
  onMarkCompleted,
  onDownload,
}: Props) => {
  const {t} = useTranslation();

  const actions = useMemo(() => {
    const {status} = serviceOrder;
    const items: MenuAction[] = [];

    const isNotPending = getIsNotPendingStatus(status);

    items.push({
      icon: <CompareArrowsOutlinedIcon />,
      label: t('Change payment status'),
      onClick: onChangeStatus,
    });

    if (isNotPending) {
      items.push({
        icon: <ScheduleOutlinedIcon />,
        label: t('Schedule'),
        onClick: onSchedule,
      });
    }

    if (canMarkCompleted(status, serviceOrder?.schedules?.length || 0)) {
      items.push({
        icon: <Check />,
        label: t('Mark Completed'),
        onClick: onMarkCompleted,
      });
    }
    if (
      ![ServiceOrderStatus.ARCHIVED, ServiceOrderStatus.CANCELLED].includes(
        status,
      )
    ) {
      items.push({
        icon: <CancelOutlinedIcon />,
        label: t('table_action_option.cancel'), // Cancel
        onClick: onCancel,
      });
    }

    if (
      [
        ServiceOrderStatus.SCHEDULED,
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.TECHNICIAN_ASSIGNED,
        ServiceOrderStatus.ARTICLES_ORDERED,
        ServiceOrderStatus.PAUSED,
      ].includes(status)
    ) {
      items.push({
        icon: <ScheduleOutlinedIcon />,
        label: t('Reschedule'),
        onClick: onReschedule,
      });
    }

    if (
      [ServiceOrderStatus.OVERDUE, ServiceOrderStatus.SCHEDULED].includes(
        status,
      )
    ) {
      items.push({
        icon: <ScheduleOutlinedIcon />,
        label: t('Unschedule'),
        onClick: onUnschedule,
      });
    }

    if (status === ServiceOrderStatus.CANCELLED) {
      items.push({
        icon: <CancelOutlinedIcon />,
        label: t('Undo cancellation'),
        onClick: onUndoCancel,
      });
    }

    if (status !== ServiceOrderStatus.ARCHIVED) {
      items.push({
        icon: <Inventory2OutlinedIcon />,
        label: t('Archive'),
        onClick: onArchive,
      });
    }

    if (status === ServiceOrderStatus.ARCHIVED) {
      items.push({
        icon: <Inventory2OutlinedIcon />,
        label: t('Unarchive'),
        onClick: onUnarchive,
      });
    }

    if (status === ServiceOrderStatus.COMPLETED) {
      items.push({
        icon: <UndoIcon />,
        label: t('Reopen'),
        onClick: onReopen,
      });
    }

    items.push({
      label: t('Download'),
      icon: <FileDownload />,
      onClick: onDownload,
    });

    return items;
  }, [serviceOrder, t]);

  return {actions};
};
export default useServiceOrderMenuActions;
