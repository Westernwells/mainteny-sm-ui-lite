import {Box, Grid, MenuItem, Select, Typography} from '@mui/material';
import AsyncSelect, {QueryProps} from 'components/AsyncSelect';
import FormInputLabel from 'components/FormInputLabel';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {fetchElevator, fetchElevators} from 'hooks/reactQuery/useElevator';
import {
  getServiceOrderDetails,
  queryServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ElevatorView} from 'models/elevator';
import {Order} from 'models/pagination';
import {
  ServiceOrderOrderField,
  ServiceOrderQueryParams,
  ServiceOrderView,
} from 'models/service-order';
import {
  TaskRefEntity,
  TaskRefEntityType,
  taskRefEntityTypeToLabel,
} from 'models/tasks';
import React, {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {
  getJobTypeGivenName,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';

interface FormData {
  refType?: TaskRefEntityType;
  refId?: string;
}

interface Props {
  onDone: (data: TaskRefEntity) => void;
  onClear: () => void;
  label?: string;
  fullWidthInputs?: boolean;
  value?: {
    refId?: string | undefined;
    refType?: TaskRefEntityType | undefined;
  };
  refTypeTestId?: string;
  elevatorRefTestId?: string;
  serviceOrderRefTestId?: string;
}

const INITIAL_STATE = {
  refId: undefined,
  refType: undefined,
};

const TaskAssociationSelect = ({
  onDone,
  onClear,
  label,
  value,
  refTypeTestId,
  elevatorRefTestId,
  serviceOrderRefTestId,
  fullWidthInputs = false,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  const {
    register,
    watch,
    control,
    reset,
    formState: {errors},
  } = useForm<FormData>({
    defaultValues: INITIAL_STATE,
  });
  const {data: jobTypes} = useCompanyJobTypes(serviceCompanyId!);

  const refTypeWatched = watch('refType');
  const refIdWatched = watch('refId');
  const showElevatorField = refTypeWatched === TaskRefEntityType.ELEVATOR;
  const showServiceOrderField =
    refTypeWatched === TaskRefEntityType.SERVICE_ORDER;

  const showEntityDropdown = showElevatorField || showServiceOrderField;

  useEffect(() => {
    if (!value) {
      reset(INITIAL_STATE);
    } else {
      reset({
        refId: value?.refId,
        refType: value?.refType,
      });
    }
  }, [value]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      {label && <FormInputLabel required={false} label={label} />}
      <Grid columnSpacing={2} rowSpacing={2} container>
        <Grid item xs={fullWidthInputs ? 12 : 6}>
          <Controller
            name="refType"
            control={control}
            render={({field}) => (
              <Select
                size="small"
                data-testId={refTypeTestId}
                sx={{width: '100%'}}
                defaultValue={refTypeWatched}
                required
                placeholder={t('Select type')}
                notched
                {...register('refType', {required: true})}
                onChange={(e) => {
                  if (!e.target.value) {
                    return onClear();
                  }

                  field.onChange(e);
                }}
                value={refTypeWatched ?? ''}>
                <MenuItem sx={{color: theme.palette.grey[500]}} value="">
                  {t('Select type')}
                </MenuItem>
                {Object.values(TaskRefEntityType).map((type, index) => (
                  <MenuItem value={type} key={index}>
                    {t(taskRefEntityTypeToLabel[type])}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>
        {showEntityDropdown && (
          <Grid item xs={fullWidthInputs ? 12 : 6}>
            {showElevatorField && (
              <AsyncSelect<ElevatorView>
                queryFn={(params: QueryProps) =>
                  fetchElevators(params, serviceCompanyId)
                }
                testId={elevatorRefTestId}
                value={refIdWatched}
                prefetchFn={(elevatorId: string) => fetchElevator(elevatorId)}
                allowPrefill
                keys={{label: 'externalId', value: 'id'}}
                name="refId"
                control={control}
                textFieldProps={{
                  placeholder: t('Select unit'),
                  required: true,
                  error: !!errors.refId,
                  helperText: errors.refId?.message || '',
                }}
                onChange={(_, newValue) => {
                  if (newValue) {
                    onDone({
                      type: refTypeWatched,
                      id: (newValue as ElevatorView).id,
                    });
                  }
                }}
                renderOption={(props, option) => {
                  const elevator = option;
                  return (
                    <li
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderBottom: '1px solid #EDF1F7',
                        alignItems: 'flex-start',
                      }}
                      {...props}>
                      <Typography>{elevator.externalId || '-'}</Typography>
                      <Typography color="text.secondary">
                        {elevator.address?.fullName || '-'}
                      </Typography>
                      <Typography color="text.secondary">
                        {elevator.additionalInfo?.buildingLocation || '-'}
                      </Typography>
                    </li>
                  );
                }}
              />
            )}
            {showServiceOrderField && (
              <AsyncSelect<ServiceOrderView>
                queryFn={(fnParams: QueryProps) => {
                  const params: ServiceOrderQueryParams = {
                    ...fnParams,
                    serviceCompanyId,
                    order: Order.DESC,
                    orderBy: ServiceOrderOrderField.CREATED_TIME,
                  };

                  return queryServiceOrders(params);
                }}
                testId={serviceOrderRefTestId}
                value={refIdWatched}
                prefetchFn={(serviceOrderId: string) =>
                  getServiceOrderDetails(serviceOrderId)
                }
                allowPrefill
                keys={{label: 'externalId', value: 'id'}}
                name="refId"
                control={control}
                textFieldProps={{
                  placeholder: t('Select job'),
                  required: true,
                  error: !!errors.refId,
                  helperText: errors.refId?.message || '',
                }}
                onChange={(_, newValue) => {
                  if (newValue) {
                    onDone({
                      type: refTypeWatched,
                      id: (newValue as ServiceOrderView).id,
                    });
                  }
                }}
                renderOption={(props, option) => {
                  const serviceOrder = option;
                  const orderGivenName = getJobTypeGivenName(
                    serviceOrder?.type,
                    jobTypes,
                  );
                  const orderType = serviceOrderTypeToString(orderGivenName);

                  return (
                    <li
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderBottom: '1px solid #EDF1F7',
                        alignItems: 'flex-start',
                      }}
                      {...props}>
                      <Typography>{serviceOrder.externalId || '-'}</Typography>
                      <Typography color="text.secondary">
                        {serviceOrder.elevator.address.fullName || '-'}
                      </Typography>
                      <Typography color="text.secondary">
                        {orderType === '-' ? t(orderGivenName) : t(orderType)}
                      </Typography>
                    </li>
                  );
                }}
              />
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TaskAssociationSelect;
