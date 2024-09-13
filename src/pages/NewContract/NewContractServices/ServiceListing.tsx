import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {formatDate} from 'utils/datetime';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Confirm} from 'components/Confirm';
import {useState} from 'react';
import {FormikProps} from 'formik';
import {
  calculateContractInvoicePriceGrandTotal,
  calculateContractInvoicePriceTotal,
  ContractServiceForm,
  ExtendedContractComponentRecord,
} from 'models/contract';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {theme} from 'theme';
import {StatusChip} from 'components/StatusChip';
import {getListViewFrequency} from 'utils/elevator-utils';

type Props = {
  formik: FormikProps<{components: ExtendedContractComponentRecord[]}>;
  formikContractServiceComponent: FormikProps<ContractServiceForm>;
  isDeleteDialogOpen: boolean;
  handleDeleteDialogOpen: () => void;
  handleDeleteDialogClose: () => void;
  handleEditDialog: () => void;
  handleReviewDialog: () => void;
};

const ServiceListing = ({
  formik,
  formikContractServiceComponent,
  isDeleteDialogOpen,
  handleDeleteDialogOpen,
  handleDeleteDialogClose,
  handleEditDialog,
  handleReviewDialog,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const serviceListingColumns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: 'Service Name', align: 'left', width: '10%'},
    {name: 'Units', align: 'right', width: '5%'},
    {name: 'Start Date', align: 'right', width: '10%'},
    {name: 'Auto Job Creation', align: 'center', width: '15%'},
    {name: 'Job Frequency', align: 'left', width: '20%'},
    {name: 'Invoice frequency', align: 'left', width: '20%'},
    {name: 'Service Price', align: 'right', width: '10%'},
    {name: '', align: 'right', width: '5%'},
  ];

  const handleDelete = () => {
    const newArray = formik.values.components.filter(
      (_, index) => index !== activeIndex,
    );
    formik.setFieldValue('components', newArray);
    handleDeleteDialogClose();
  };

  return (
    <>
      <TableContainer sx={{my: 3}}>
        <Table>
          <TableHead
            sx={{display: 'block', borderBottom: '1px solid #8F9BB380'}}>
            <TableRow sx={{display: 'block'}}>
              {serviceListingColumns.map((column) => (
                <TableCell
                  key={column.name}
                  align={column.align || 'right'}
                  sx={{display: 'inline-block', padding: '1em 0em'}}
                  width={column.width}>
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.secondary}>
                    {t(column.name).toUpperCase()}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{display: 'block'}}>
            {formik.values.components.map((item, index) => (
              <TableRow
                sx={{
                  width: '100%',
                  display: 'block',
                  cursor: 'pointer',
                  '&:hover': {
                    background: '#F2F6F8',
                  },
                  borderBottom: '1px solid #8F9BB380',
                }}
                key={item.id}>
                <TableCell
                  sx={{
                    width: '10%',
                    display: 'inline-block',
                    padding: '0.5em',
                    borderBottom: 'none',
                  }}
                  onClick={() => {
                    handleReviewDialog();
                    const activeComponent = formik.values.components.find(
                      (componentItem) => componentItem.id === item.id,
                    );

                    if (activeComponent) {
                      formikContractServiceComponent.setValues(activeComponent);
                    }
                  }}>
                  <Typography color="#0092B2" variant="body2" fontWeight="600">
                    {item.name}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '5%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 0em',
                    textAlign: 'right',
                  }}>
                  <Typography variant="body2">
                    {
                      item.elevators.filter((elevator) => elevator.isSelected)
                        .length
                    }
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '10%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 0em',
                    textAlign: 'right',
                  }}>
                  <Typography variant="body2">
                    {item.firstInvoiceDate
                      ? formatDate(item.firstInvoiceDate)
                      : '-'}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '15%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 0em',
                    textAlign: 'center',
                  }}>
                  <Typography variant="body2">
                    {item.isAutomaticJobCycle ? (
                      <StatusChip
                        label={t('Yes')}
                        color="success"
                        variant="filled"
                      />
                    ) : (
                      <StatusChip
                        label={t('No')}
                        color="warning"
                        variant="filled"
                      />
                    )}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '20%',
                    display: 'inline-block',
                    textAlign: 'left',
                    borderBottom: 'none',
                    padding: '0em 1em 0em 0em',
                  }}>
                  <Typography variant="body2">
                    {getListViewFrequency(
                      'orderGenerationJob',
                      item.elevators.filter((elevator) => elevator.isSelected),
                    )}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '20%',
                    display: 'inline-block',
                    textAlign: 'left',
                    borderBottom: 'none',
                    padding: '0em 1em 0em 0em',
                  }}>
                  <Typography variant="body2">
                    {getListViewFrequency(
                      'invoiceJob',
                      item.elevators.filter((elevator) => elevator.isSelected),
                    )}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '10%',
                    display: 'inline-block',
                    textAlign: 'right',
                    borderBottom: 'none',
                    padding: '0em',
                  }}>
                  <Typography variant="body2">
                    {formatCurrency(
                      calculateContractInvoicePriceTotal(
                        item.elevators.filter(
                          (elevator) => elevator.isSelected,
                        ),
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
                    padding: '0.5em 0em 0.5em 1em',
                  }}>
                  <Box sx={{display: 'flex'}}>
                    <IconButton
                      onClick={() => {
                        handleEditDialog();
                        setActiveIndex(index);
                        const activeComponent = formik.values.components[index];
                        if (activeComponent) {
                          formikContractServiceComponent.setValues(
                            activeComponent,
                          );
                        }
                      }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        handleDeleteDialogOpen();
                        setActiveIndex(index);
                      }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <TableRow
              sx={{
                width: '100%',
                display: 'block',
                padding: '0.5em 0em',
              }}>
              <TableCell sx={{width: '50%', display: 'inline-block'}} />

              <TableCell
                sx={{
                  display: 'inline-block',
                  borderBottom: 'none',
                  width: '30%',
                }}>
                <Typography variant="h6">
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
                      formik.values.components,
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
        </Table>
      </TableContainer>
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => handleDelete()}
        onClose={() => handleDeleteDialogClose()}
        title="Delete Service"
        content={t(`You are about to delete the {{serviceName}} service.`, {
          serviceName: formik.values.components.find(
            (_, index) => index === activeIndex,
          )?.name,
        })}
        helperText="Are you sure about it?"
        closeBtnLabel="Cancel"
        confirmBtnLabel="Delete"
      />
    </>
  );
};

export default ServiceListing;
