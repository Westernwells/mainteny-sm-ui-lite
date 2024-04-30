import React, {FC, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useUpdateContract} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {TableCellProps, useMediaQuery} from '@mui/material';
import {
  ContractComponentView,
  ContractServiceForm,
  ContractView,
  calculateContractInvoicePriceTotal,
} from 'models/contract';
import {EmptySection} from 'components/EmptySection';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import {olStyles} from 'styles';
import {ReactComponent as UnionIcon} from 'assets/icons/union.svg';
import AddIcon from '@mui/icons-material/Add';
import {useFormatDate} from 'hooks/useFormatDate';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {StatusChip} from 'components/StatusChip';
import {Button} from 'components/Button';
import {getListViewFrequency} from 'utils/elevator-utils';
import {DeleteOutline} from '@mui/icons-material';
import {Confirm} from 'components/Confirm';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {
  componentsToMutate,
  calculateContractInvoicePriceGrandTotal,
  parsElevatorRecourses,
  mergeElevators,
} from 'utils/contract-utils';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import {ArticleType, CostPackage} from 'models/article';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {createEmptyResource} from 'utils/paging-utils';
import {ElevatorOrderField, ElevatorView} from 'models/elevator';
import {useContractElevators} from 'hooks/reactQuery/useContacts';
import {useQueryState} from 'hooks/useQueryState';
import {Order} from 'models/misc';
import {useSnackbar} from 'hooks/useSnackbar';
import {ContractCard} from '../ContractCard';
import {SectionTitle} from '../../../../InvoiceDetails/SectionTitle';
import ServiceInformationReview from './ServiceInfo';
import {MutationService} from './MutationService';

interface Props {
  contractDetails: ContractView;
}

const serviceListingColumns: {
  name: string;
  align?: TableCellProps['align'];
  width?: TableCellProps['width'];
}[] = [
  {name: 'SERVICE NAME', align: 'left', width: '10%'},
  {
    name: 'UNITS_elevator',
    align: 'right',
    width: '5%',
  },
  {name: 'DATE', align: 'right', width: '10%'},
  {name: 'AUTO JOB', align: 'center', width: '15%'},
  {name: 'JOB FREQUENCY', align: 'left', width: '20%'},
  {name: 'INVOICE FREQUENCY', align: 'left', width: '20%'},
  {name: 'PRICE', align: 'center', width: '10%'},
  {name: '', align: 'right', width: '5%'},
];

export const getAutoJobStatus = (
  firstInvoiceDate: Date | null,
): {
  label: string;
  color: 'default' | 'darkSuccess';
} => {
  if (firstInvoiceDate) {
    return {label: 'Yes', color: 'darkSuccess'};
  }
  return {label: 'No', color: 'default'};
};

const validationSchemaContractServices = Yup.object().shape({
  name: Yup.string().required('Service name cannot be empty'),
});

export const Services: FC<Props> = ({contractDetails}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDate = useFormatDate();
  const currentCurrency = useCurrentCurrency();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {enqueueSnackbar} = useSnackbar();

  const {mutateAsync: updateContract, isLoading: isUpdateLoading} =
    useUpdateContract('Contract updated');

  const [search, setSearch] = useQueryState('UnitsSearch');
  const [isEditForm, setIsEditForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const {data: uuid, refetch: refetchUniqueId} = useUuid();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ContractComponentView>();

  useEffect(() => {
    refetchUniqueId();
  }, [isDialogOpen]);

  const formikContractServiceInitialValues = useMemo(
    () => ({
      isChecked: false,
      id: uuid,
      name: '',
      group: '',
      firstInvoiceDate: null,
      firstOrderDate: null,
      costType: ArticleType.LABOR,
      costPackage: {
        laborPercentage: 50,
        materialPercentage: 50,
      },
      isAutomaticJobCycle: false,
      elevators: [],
    }),
    [],
  );

  const formikContractServiceComponent = useFormik<ContractServiceForm>({
    initialValues: formikContractServiceInitialValues,
    onSubmit: () => {},
    validationSchema: validationSchemaContractServices,
    validateOnMount: true,
  });

  const deleteComponent = async () => {
    const itemToSave = contractDetails.components?.filter(
      (c) => c.id !== currentService?.id,
    );
    const updatedContract = {
      components: componentsToMutate(itemToSave),
    };
    await updateContract({
      body: updatedContract as any,
      contractId: contractDetails?.id,
    });
  };

  const {data: elevatorResource = createEmptyResource<ElevatorView>(500)} =
    useContractElevators(
      contractDetails?.id ?? '',
      {
        query: search,
        orderBy: ElevatorOrderField.CREATED_TIME,
        order: Order.DESC,
        pageIndex: 0,
        pageSize: 500,
      },
      {keepPreviousData: true},
    );

  const setAddFormData = () => {
    formikContractServiceComponent.setValues({
      ...formikContractServiceComponent.values,
      elevators: parsElevatorRecourses(elevatorResource?.data || []),
    });
  };

  const setEditFormData = (row: ContractComponentView) => {
    const allItems = mergeElevators(elevatorResource?.data || [], row);
    formikContractServiceComponent.setValues({
      ...formikContractServiceComponent.values,
      id: row.id,
      name: row?.name,
      group: row?.group,
      firstInvoiceDate: row?.additionalInfo?.firstInvoiceDate,
      firstOrderDate: row?.additionalInfo?.firstOrderDate,
      costType: row?.additionalInfo?.costType,
      costPackage: row?.additionalInfo?.costPackage as CostPackage,
      isAutomaticJobCycle: !!row?.additionalInfo?.firstOrderDate,
      elevators: allItems,
    });
  };

  useEffect(() => {
    if (isEditForm) {
      setEditFormData(currentService as ContractComponentView);
    } else {
      setAddFormData();
    }
  }, [elevatorResource.data.length]);

  const openViewDialog = (row: ContractComponentView) => {
    setCurrentService(row);
    setEditFormData(row);
    setIsReviewDialogOpen(true);
  };

  const handleEditButtonClick = (row: ContractComponentView) => {
    if (row.group !== '') {
      enqueueSnackbar(
        'Services in an invoice group can not be edited. Please disband them in order to edit the services.',
        {variant: 'error'},
      );
    } else {
      setCurrentService(row);
      setEditFormData(row);
      setIsDialogOpen(true);
      setIsEditForm(true);
    }
  };

  return (
    <Grid item xs={12} md={8} sx={{padding: 'unset'}}>
      <ContractCard
        containerStyles={{
          ...olStyles.scrollbar,
          overflowY: 'scroll',
          mt: !isMobile ? '0em' : 0,
          py: 2,
          px: 2,
          height: '100%',
          '& .MuiCardHeader-root': {
            py: 0,
          },
        }}
        header={
          <Box>
            <SectionTitle
              Icon={UnionIcon}
              title="Services"
              containerSx={{backgroundColor: 'unset'}}
            />
          </Box>
        }
        headerActionIcon={
          <IconButton
            onClick={() => {
              setAddFormData();
              setIsDialogOpen(true);
              setIsEditForm(false);
            }}>
            <AddIcon
              sx={{
                fontSize: '2rem',
                color: theme.palette.primary.main,
              }}
            />
          </IconButton>
        }>
        {contractDetails.components?.length ? (
          <TableContainer sx={{...olStyles.scrollbar}}>
            <TableHead
              sx={{display: 'block', borderBottom: '1px solid #8F9BB380'}}>
              <TableRow sx={{display: 'block'}}>
                {serviceListingColumns.map((col) => (
                  <TableCell
                    key={col.name}
                    align={col.align || 'right'}
                    sx={{
                      display: 'inline-block',
                      padding: '1em 0em',
                      fontWeight: '600',
                      color: 'text.secondary',
                    }}
                    width={col.width}>
                    {t(col.name)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{display: 'block'}}>
              {contractDetails.components.map((row) => (
                <TableRow
                  sx={{
                    width: '100%',
                    display: 'block',
                    cursor: 'pointer',
                    padding: '0.1em 0em',
                    '&:hover': {
                      background: '#F2F6F8',
                    },
                  }}
                  key={row.id}>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '10%',
                      display: 'inline-block',
                      padding: '0.5em',
                      borderBottom: 'none',
                    }}>
                    <Typography
                      sx={{color: '#0092B2', fontWeight: '600'}}
                      variant="body2">
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '5%',
                      borderBottom: 'none',
                      textAlign: 'right',
                      display: 'inline-block',
                      padding: '0.5em 0em',
                    }}>
                    <Typography
                      color={theme.palette.text.primary}
                      variant="body2">
                      {row.additionalInfo.elevators?.length}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '10%',
                      display: 'inline-block',
                      borderBottom: 'none',
                      padding: '0.5em 0em',
                      textAlign: 'right',
                    }}>
                    <Typography
                      color={theme.palette.text.primary}
                      variant="body2">
                      {row.additionalInfo.firstInvoiceDate
                        ? formatDate(row.additionalInfo.firstInvoiceDate)
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '15%',
                      display: 'inline-block',
                      borderBottom: 'none',
                      padding: '0.5em 0em',
                      textAlign: 'center',
                    }}>
                    <StatusChip
                      label={
                        getAutoJobStatus(
                          row.additionalInfo.firstOrderDate as Date,
                        ).label
                      }
                      color={
                        getAutoJobStatus(
                          row.additionalInfo.firstOrderDate as Date,
                        ).color
                      }
                      maxChars={8}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '20%',
                      display: 'inline-block',
                      textAlign: 'left',
                      borderBottom: 'none',
                      padding: '0em 1em 0em 0em',
                    }}>
                    <Typography
                      color={theme.palette.text.primary}
                      variant="body2">
                      {getListViewFrequency(
                        'orderGenerationJob',
                        row.additionalInfo.elevators,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '20%',
                      display: 'inline-block',
                      textAlign: 'left',
                      borderBottom: 'none',
                      padding: '0em 1em 0em 0em',
                    }}>
                    <Typography
                      color={theme.palette.text.primary}
                      variant="body2">
                      {getListViewFrequency(
                        'invoiceJob',
                        row.additionalInfo.elevators,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => openViewDialog(row)}
                    sx={{
                      width: '10%',
                      display: 'inline-block',
                      textAlign: 'right',
                      borderBottom: 'none',
                    }}>
                    <Typography
                      color={theme.palette.text.primary}
                      variant="body2">
                      {' '}
                      {formatCurrency(
                        calculateContractInvoicePriceTotal(
                          row.additionalInfo.elevators || [],
                        ) /
                          10 ** (currentCurrency.fractionDigits ?? 0) ?? 0,
                        {
                          currency: currentCurrency.code,
                        },
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '5%',
                      display: 'inline-block',
                      textAlign: 'right',
                      borderBottom: 'none',
                      padding: '0.5em 0em 0.5em 2em',
                    }}>
                    <Box sx={{display: 'flex'}}>
                      <IconButton onClick={() => handleEditButtonClick(row)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setCurrentService(row);
                          setIsDeleteDialogOpen(true);
                        }}>
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              <Divider
                sx={{width: '100%', borderColor: '#8F9BB380', padding: '0.2em'}}
              />
              <TableRow
                sx={{
                  width: '100%',
                  display: 'block',
                  padding: '0em',
                }}>
                <TableCell sx={{width: '40%', display: 'inline-block'}} />
                <TableCell
                  sx={{
                    display: 'inline-block',
                    borderBottom: 'none',
                    width: '40%',
                  }}>
                  <Typography variant="h6" align="right">
                    {t('Total contract value per year (excl. VAT)')}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    display: 'inline-block',
                    textAlign: 'right',
                    borderBottom: 'none',
                    padding: '0em',
                    width: '10%',
                  }}>
                  <Typography variant="h6">
                    {formatCurrency(
                      calculateContractInvoicePriceGrandTotal(
                        contractDetails.components,
                      ) /
                        10 ** (currentCurrency.fractionDigits ?? 0) ?? 0,
                      {
                        currency: currentCurrency.code,
                      },
                    )}
                  </Typography>
                </TableCell>
                <TableCell sx={{width: '10%', display: 'inline-block'}} />
              </TableRow>
            </TableBody>
          </TableContainer>
        ) : (
          <EmptySection
            label="No services yet."
            illustration="clipboard"
            size="tiny"
            containerStyle={{
              height: '100%',
            }}
          />
        )}
      </ContractCard>
      <Confirm
        open={isDeleteDialogOpen}
        disableActions={isUpdateLoading}
        onConfirm={async () => {
          await deleteComponent();
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Service"
        content={`You are about to delete the ${currentService?.name} service.`}
        helperText=" Are you sure about it?"
      />
      <MutationService
        formikContractServiceComponent={formikContractServiceComponent}
        formikContractServiceInitialValues={formikContractServiceInitialValues}
        components={contractDetails?.components}
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
        updateContract={updateContract}
        isEditForm={isEditForm}
        contractId={contractDetails.id}
        loading={isUpdateLoading}
        search={setSearch}
      />

      <Dialog
        title={t('Service Information')}
        onCancel={() => {
          setIsReviewDialogOpen(false);
          formikContractServiceComponent.resetForm({
            values: formikContractServiceInitialValues,
          });
        }}
        dialogProps={{
          open: isReviewDialogOpen || false,
          maxWidth: 'lg',
        }}
        saveButtonText={t('Edit Service')}
        onSave={() => {
          setIsReviewDialogOpen(false);
          setIsDialogOpen(true);
          setIsEditForm(true);
        }}
        leftButton={
          <Button
            label="Close"
            buttonProps={{
              onClick: () => setIsReviewDialogOpen(false),
              variant: 'text',
              size: 'large',
              sx: {background: 'white'},
            }}
          />
        }
        saveButtonVariant="outlined"
        showCancelButton={false}>
        <ServiceInformationReview
          service={currentService}
          elevators={elevatorResource.data}
        />
      </Dialog>
    </Grid>
  );
};
