import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useUpdateContract} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {Table, TableCellProps, useMediaQuery} from '@mui/material';
import {
  calculateContractInvoicePriceTotal,
  ContractComponentView,
  ContractServiceForm,
  ContractSimpleView,
  ContractStatus,
} from 'models/contract';
import {EmptySection} from 'components/EmptySection';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import {olStyles} from 'styles';
import {ReactComponent as UnionIcon} from 'assets/icons/union.svg';
import {useFormatDate} from 'hooks/useFormatDate';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {StatusChip} from 'components/StatusChip';
import {Button} from 'components/Button';
import {getListViewFrequency} from 'utils/elevator-utils';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {Confirm} from 'components/Confirm';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {
  calculateContractInvoicePriceGrandTotal,
  componentsToMutate,
  mergeElevators,
  parsElevatorRecourses,
} from 'utils/contract';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import {ArticleType, CostPackage} from 'models/article';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {ElevatorView} from 'models/elevator';
import {Link} from 'react-router-dom';
import {SxProps} from '@mui/system';
import {InfoCard} from 'components/InfoCard';
import {State} from 'models/misc';
import ServiceInformationReview from './ServiceInfo';
import {MutationService} from './MutationService';

interface Props {
  elevator: ElevatorView;
  containerStyles?: SxProps;
}

export interface Service extends ContractComponentView {
  contractNumber: string;
  contractId: string;
}

const serviceListingColumns: {
  name: string;
  align?: TableCellProps['align'];
  width?: TableCellProps['width'];
}[] = [
  {name: 'SERVICE NAME', align: 'left', width: '15%'},
  {name: 'CONTRACT NUMBER', align: 'left', width: '17%'},
  {name: 'DATE', align: 'left', width: '9%'},
  {name: 'AUTO JOB', align: 'left', width: '9%'},
  {name: 'JOB FREQUENCY', align: 'left', width: '15%'},
  {name: 'INVOICE FREQUENCY', align: 'left', width: '21%'},
  {name: 'PRICE', align: 'left', width: '5%'},
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

const ContractServices = ({elevator, containerStyles}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDate = useFormatDate();
  const currentCurrency = useCurrentCurrency();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    mutateAsync: updateContract,
    isLoading: isUpdateLoading,
    isSuccess,
  } = useUpdateContract('Contract updated');

  const [isEditForm, setIsEditForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const {data: uuid, refetch: refetchUniqueId} = useUuid();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<Service>();

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

  const services = useMemo(() => {
    const elevatorId = elevator?.id;

    return elevator.contracts.reduce(
      (acc: Service[], contract: ContractSimpleView) => {
        if (
          contract.meta?.state !== State.ACTIVE ||
          ![ContractStatus.VALID, ContractStatus.EXPIRING].includes(
            contract.status,
          )
        )
          return acc;

        const components = (contract.components || []).reduce(
          (componentAcc, component) => {
            if (
              !component.additionalInfo?.elevators?.some(
                (contractElevator) =>
                  contractElevator.elevatorId === elevatorId,
              )
            )
              return componentAcc;
            return [
              ...componentAcc,
              {
                ...component,
                contractNumber: contract.externalId,
                contractId: contract.id,
              },
            ];
          },
          [] as Service[],
        );

        return [...acc, ...components];
      },
      [] as Service[],
    );
  }, [elevator?.contracts, isSuccess, isUpdateLoading]);

  const deleteComponent = async () => {
    const remainingServices = services
      ?.filter((service) => service.contractId === currentService?.contractId)
      ?.filter((c) => c.id !== currentService?.id);

    const updatedContract = {
      components: componentsToMutate(remainingServices),
    };
    await updateContract({
      body: updatedContract as any,
      contractId: currentService?.contractId as string,
    });
  };

  const setAddFormData = () => {
    formikContractServiceComponent.setValues({
      ...formikContractServiceComponent.values,
      elevators: parsElevatorRecourses([elevator] || []),
    });
  };

  const setEditFormData = (row: ContractComponentView) => {
    const allItems = mergeElevators([elevator] || [], row);
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
      orderType: row?.additionalInfo?.orderType,
    });
  };

  useEffect(() => {
    if (isEditForm) {
      setEditFormData(currentService as ContractComponentView);
    } else {
      setAddFormData();
    }
  }, [elevator]);

  const openViewDialog = (row: Service) => {
    setCurrentService(row);
    setEditFormData(row);
    setIsReviewDialogOpen(true);
  };

  return (
    <Grid item xs={12} md={8} sx={{padding: 'unset', ...containerStyles}}>
      <InfoCard
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
        headerIcon={<UnionIcon style={{width: '2rem', height: '2rem'}} />}
        header={<Typography variant="h5">{t('Contract Services')}</Typography>}>
        {services.length ? (
          <TableContainer sx={{...olStyles.scrollbar}}>
            <Table>
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
                {services.map((row) => (
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
                        width: '15%',
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
                        width: '17%',
                        borderBottom: 'none',
                        textAlign: 'left',
                        display: 'inline-block',
                        padding: '0.5em 0em',
                      }}>
                      <Link
                        to={`/contracts/details/${row.contractId}`}
                        style={{
                          textDecoration: 'none',
                          width: 'fit-content',
                          display: 'inline-block',
                        }}>
                        <Typography
                          sx={{color: '#0092B2', fontWeight: '600'}}
                          variant="body2">
                          {row?.contractNumber || '-'}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell
                      onClick={() => openViewDialog(row)}
                      sx={{
                        width: '5%',
                        display: 'inline-block',
                        borderBottom: 'none',
                        padding: '0.5em 0em',
                        textAlign: 'left',
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
                        width: '13%',
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
                        width: '15%',
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
                        width: '6%',
                        display: 'inline-block',
                        textAlign: 'left',
                        borderBottom: 'none',
                      }}>
                      <Typography
                        color={theme.palette.text.primary}
                        variant="body2">
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
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentService(row);
                            setEditFormData(row);
                            setIsDialogOpen(true);
                            setIsEditForm(true);
                          }}>
                          <EditOutlinedIcon
                            sx={{color: theme.palette.secondary.mainLight}}
                          />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentService(row);
                            setIsDeleteDialogOpen(true);
                          }}>
                          <DeleteOutlineIcon
                            sx={{color: theme.palette.secondary.mainLight}}
                          />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                <Divider
                  sx={{
                    width: '100%',
                    borderColor: '#8F9BB380',
                    padding: '0.2em',
                  }}
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
                        calculateContractInvoicePriceGrandTotal(services) /
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
            </Table>
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
      </InfoCard>
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
        components={services}
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
        updateContract={updateContract}
        isEditForm={isEditForm}
        contractId={currentService?.contractId as string}
        loading={isUpdateLoading}
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
          elevators={[elevator]}
        />
      </Dialog>
    </Grid>
  );
};

export default ContractServices;
