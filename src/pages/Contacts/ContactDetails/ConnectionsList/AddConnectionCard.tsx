import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {
  ConnectionTypeLabels,
  ContactPersonAssociationType,
  CreateContactPersonAssociationRecord,
} from 'models/contacts';
import {PropertyOwnerView} from 'models/propertyManager';
import AsyncSelect, {QueryProps} from 'components/AsyncSelect';
import {queryCustomers} from 'hooks/reactQuery/useCustomers';
import {ElevatorView} from 'models/elevator';
import {
  fetchElevators,
  queryCustomerElevator,
} from 'hooks/reactQuery/useElevator';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  ContractOrderField,
  ContractStatus,
  ContractView,
} from 'models/contract';
import {
  queryContracts,
  queryCustomerContract,
} from 'hooks/reactQuery/useContract';
import {Order} from 'models/misc';
import {ArticleSupplierView} from 'models/article';
import {queryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {ServiceOrderOrderField, ServiceOrderView} from 'models/service-order';
import {
  queryPropertyOwnerServiceOrders,
  queryServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {Button} from 'components/Button';

interface Props {
  onAddConnection: (
    data: CreateContactPersonAssociationRecord,
  ) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  refType: ContactPersonAssociationType;
  refId: string;
  customerId: string;
}

const AddConnectionCard = ({onAddConnection, onCancel}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {
    register,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<FormData>();
  const isCustomerSelected = !!watch('customerId');

  const showCustomerField =
    watch('refType') !== ContactPersonAssociationType.ARTICLE_SUPPLIER &&
    !!watch('refType');
  const showElevatorField =
    watch('refType') === ContactPersonAssociationType.ELEVATOR;
  const showContractField =
    watch('refType') === ContactPersonAssociationType.CONTRACT;
  const showSupplierField =
    watch('refType') === ContactPersonAssociationType.ARTICLE_SUPPLIER;
  const showJobField =
    watch('refType') === ContactPersonAssociationType.SERVICE_ORDER;

  const handleAddConnection = async (data: FormData) => {
    await onAddConnection({
      refType: data.refType,
      refId:
        watch('refType') === ContactPersonAssociationType.PROPERTY_OWNER
          ? data.customerId
          : data.refId,
    });

    onCancel();
  };

  return (
    <Box
      component="form"
      sx={{
        boxShadow: '0 4px 15px 0 #90909033',
        padding: '1.5rem',
        gap: '1rem',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'primary.mainLight',
        borderRadius: '4px',
      }}>
      <Typography color="text.secondary" fontWeight={600} letterSpacing={1.1}>
        {t('CONNECT TO')}
      </Typography>
      <FormControl fullWidth required>
        <InputLabel
          size="small"
          shrink
          variant="outlined"
          id="demo-simple-select-label">
          {t('Connection type')}
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          label={t('Connection type')}
          size="small"
          defaultValue={watch('refType')}
          required
          notched
          {...register('refType', {required: true})}>
          {Object.values(ContactPersonAssociationType).map((type, index) => (
            <MenuItem value={type} key={index}>
              {t(ConnectionTypeLabels[type])}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showCustomerField && (
        <AsyncSelect<PropertyOwnerView>
          queryFn={(params) => queryCustomers({...params, serviceCompanyId})}
          keys={{label: 'name', value: 'id'}}
          textFieldProps={{
            label: t('Customer name'),
            placeholder: t('Select customer'),
            required:
              watch('refType') === ContactPersonAssociationType.PROPERTY_OWNER,
            error: !!errors.customerId,
            helperText: errors.customerId?.message || '',
          }}
          name="customerId"
          control={control}
          onChange={(e, v, reason) => {
            e.preventDefault();
            if (reason === 'clear' || reason === 'selectOption') {
              setValue('refId', '');
            }
          }}
        />
      )}

      {showElevatorField && (
        <AsyncSelect<ElevatorView>
          queryFn={(params: QueryProps) =>
            isCustomerSelected
              ? queryCustomerElevator(params, watch('customerId'))
              : fetchElevators(params, serviceCompanyId)
          }
          keys={{label: 'address.fullName', value: 'id'}}
          name="refId"
          control={control}
          textFieldProps={{
            label: t('Unit_elevator'),
            placeholder: t('Select unit'),
            required: true,
            error: !!errors.refId,
            helperText: errors.refId?.message || '',
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
                <Typography>{elevator.address?.fullName || '-'}</Typography>
                <Typography color="text.secondary">
                  {elevator.additionalInfo?.buildingLocation || '-'}
                </Typography>
                <Typography color="text.secondary">
                  {elevator.externalId || '-'}
                </Typography>
              </li>
            );
          }}
        />
      )}

      {showContractField && (
        <AsyncSelect<ContractView>
          queryFn={(params: QueryProps) =>
            isCustomerSelected
              ? queryCustomerContract(
                  {
                    ...params,
                    serviceCompanyId,
                    status: [
                      ContractStatus.VALID,
                      ContractStatus.EXPIRED,
                      ContractStatus.EXPIRING,
                      ContractStatus.PENDING,
                    ],
                    order: Order.DESC,
                    orderBy: ContractOrderField.CREATED_TIME,
                  },
                  watch('customerId'),
                )
              : queryContracts({
                  ...params,
                  serviceCompanyId,
                  order: Order.DESC,
                  orderBy: ContractOrderField.CREATED_TIME,
                })
          }
          keys={{label: 'name', value: 'id'}}
          name="refId"
          control={control}
          textFieldProps={{
            label: t('Contract'),
            placeholder: t('Select contract'),
            required: true,
            error: !!errors.refId,
            helperText: errors.refId?.message || '',
          }}
          renderOption={(props, option) => {
            const contract = option;
            return (
              <li
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #EDF1F7',
                  alignItems: 'flex-start',
                }}
                {...props}>
                <Typography>{contract.name || '-'}</Typography>
                <Typography color="text.secondary">
                  {contract?.externalId || '-'}
                </Typography>
              </li>
            );
          }}
        />
      )}

      {showSupplierField && (
        <AsyncSelect<ArticleSupplierView>
          queryFn={(params: QueryProps) =>
            queryArticleSuppliers({
              ...params,
              serviceCompanyId,
            })
          }
          keys={{label: 'name', value: 'id'}}
          name="refId"
          control={control}
          textFieldProps={{
            label: t('Supplier name'),
            placeholder: t('Select supplier'),
            required: true,
            error: !!errors.refId,
            helperText: errors.refId?.message || '',
          }}
          renderOption={(props, option) => {
            const supplier = option;
            return (
              <li
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #EDF1F7',
                  alignItems: 'flex-start',
                }}
                {...props}>
                <Typography>{supplier.name || '-'}</Typography>
                <Typography color="text.secondary">
                  {supplier?.externalId || '-'}
                </Typography>
              </li>
            );
          }}
        />
      )}

      {showJobField && (
        <AsyncSelect<ServiceOrderView>
          queryFn={(params: QueryProps) =>
            isCustomerSelected
              ? queryPropertyOwnerServiceOrders(
                  {
                    ...params,
                    order: Order.DESC,
                    orderBy: ServiceOrderOrderField.CREATED_TIME,
                    end: '',
                    start: '',
                  },
                  watch('customerId'),
                )
              : queryServiceOrders({
                  ...params,
                  order: Order.DESC,
                  orderBy: ServiceOrderOrderField.CREATED_TIME,
                  end: '',
                  start: '',
                  serviceCompanyId,
                })
          }
          keys={{label: 'externalId', value: 'id'}}
          name="refId"
          control={control}
          textFieldProps={{
            label: t('Job ID'),
            placeholder: t('Select job'),
            required: true,
            error: !!errors.refId,
            helperText: errors.refId?.message || '',
          }}
          renderOption={(props, option) => {
            const job = option;
            return (
              <li
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #EDF1F7',
                  alignItems: 'flex-start',
                }}
                {...props}>
                <Typography>{job.externalId || '-'}</Typography>
                <Typography color="text.secondary">
                  {job?.elevator?.propertyOwner?.name || '-'}
                </Typography>
                <Typography color="text.secondary">
                  {job?.elevator?.address?.fullName || '-'}
                </Typography>
              </li>
            );
          }}
        />
      )}

      <Box
        display="flex"
        flexWrap="nowrap"
        justifyContent="flex-end"
        gap="0.5rem">
        <Button
          buttonProps={{
            size: 'medium',
            onClick: onCancel,
          }}>
          {t('Cancel')}
        </Button>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            onClick: handleSubmit(handleAddConnection),
            autoFocus: true,
            disabled:
              (watch('refType') !==
                ContactPersonAssociationType.PROPERTY_OWNER &&
                (!watch('refType') || !watch('refId'))) ||
              (watch('refType') ===
                ContactPersonAssociationType.PROPERTY_OWNER &&
                !isCustomerSelected),
          }}>
          {t('Confirm')}
        </Button>
      </Box>
    </Box>
  );
};
export default AddConnectionCard;
