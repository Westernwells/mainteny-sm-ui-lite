import {Dialog} from 'components/Dialog';
import {Button} from 'components/Button';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Typography from '@mui/material/Typography';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PAYMENT_STATUS_OPTIONS} from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/index';
import {ServiceOrderPaymentStatus} from 'models/service-order';
import Alert from 'components/Alert';
import useTheme from '@mui/material/styles/useTheme';
import {useUpdateServiceOrderSchedule} from 'hooks/reactQuery/useServiceOrder';
import {useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';

type Props = {
  open: boolean;
  id: string;
  onClose: () => void;
};

const ChangePaymentStatusDialog = ({open, id, onClose}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {mutate: scheduleServiceOrder} = useUpdateServiceOrderSchedule(
    undefined,
    () => {
      queryClient.invalidateQueries([queryKeys.queryServiceOrders]);
    },
  );

  const [selectedStatus, setSelectedStatus] =
    useState<ServiceOrderPaymentStatus>();

  const handleChange = (e: SelectChangeEvent<ServiceOrderPaymentStatus>) => {
    setSelectedStatus(e.target.value as ServiceOrderPaymentStatus);
  };

  const handleConfirm = async () => {
    scheduleServiceOrder({
      body: {paymentStatus: selectedStatus},
      serviceOrderId: id,
    });
    onClose();
  };

  return (
    <Dialog
      title="Change payment status"
      dialogProps={{
        maxWidth: 'sm',
        open,
      }}
      leftButton={
        <Button
          testId="saveButton"
          buttonProps={{
            size: 'large',
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
      }
      renderRightFooterButton={() => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: theme.spacing(1.5),
          }}>
          <Button
            testId="saveButton"
            buttonProps={{
              size: 'large',
              onClick: handleConfirm,
              color: 'primary',
              variant: 'contained',
            }}>
            <Typography variant="subtitle2">{t('Confirm Change')}</Typography>
          </Button>
        </Box>
      )}
      onCancel={onClose}
      showCancelButton={false}>
      <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1.5}>
        <Alert
          Icon={
            <ReportProblemOutlinedIcon
              sx={{
                width: '22px',
                height: '22px',
                color: theme.palette.warning.main,
              }}
              fill={theme.palette.warning.main}
            />
          }
          textKey="If you manually update the Job Payment Status, the system will no longer make automatic changes. From this point forward, the status will be controlled by you."
          sx={{
            background: theme.palette.warning.infoAlert,
            color: theme.palette.text.primary,
          }}
        />
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            {t('Job Payment Status')}
          </InputLabel>
          <Select
            labelId="change-payment-status-select-label"
            id="change-payment-status-select"
            data-testid="change-payment-status-select"
            value={selectedStatus}
            fullWidth
            label={t('Job Payment Status')}
            onChange={handleChange}>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <MenuItem
                key={`change-payment-status-select-option-${option.value}`}
                value={option.value}>
                {t(option.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Dialog>
  );
};

export default ChangePaymentStatusDialog;
