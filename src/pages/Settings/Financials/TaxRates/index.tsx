import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {t} from 'i18next';
import {theme} from 'theme';
import {Typography, Box, Tooltip, Chip} from '@mui/material';
import {AddOutlined, Receipt, ReceiptOutlined} from '@mui/icons-material';
import {VatView} from 'models/vat';
import {TableColumnWithRender} from 'models/table';
import {Button} from 'components/Button';
import {EmptySection} from 'components/EmptySection';
import {Dialog} from 'components/Dialog';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {useVats, useCreateVat} from 'hooks/reactQuery/useVats';
import {TaxRatesModal} from './TaxRatesModal';
import Actions from './Actions';

const COLUMNS: TableColumnWithRender<VatView>[] = [
  {
    headerName: 'Name',
    key: 'tax-rate-cell-name',
    fieldName: 'name',
    width: '70%',
    isFirst: true,
    renderCell: (taxRate, cellProps) => (
      <Cell {...cellProps}>
        <TableCellText component="div">
          {taxRate.name}{' '}
          {taxRate.isDefault && (
            <Chip
              label={t('Default')}
              size="small"
              sx={{
                color: 'primary.dark',
                bgcolor: '#8F9BB326',
                typography: 'subtitle2',
                px: 1,
                py: 0.5,
                ml: 1,
              }}
            />
          )}
        </TableCellText>
      </Cell>
    ),
  },
  {
    headerName: 'Percentage',
    key: 'tax-rate-cell-percentage',
    fieldName: 'percentage',
    align: 'right',
    renderCell: (taxRate, cellProps) => (
      <Cell {...cellProps}>
        <TableCellText>{taxRate.percentage || 0}%</TableCellText>
      </Cell>
    ),
  },
  {
    headerName: 'Legal note',
    key: 'tax-rate-cell-legal-note',
    fieldName: 'legalNote',
    align: 'center',
    textTransform: false,
    renderCell: (taxRate, cellProps) => (
      <Cell {...cellProps}>
        <TableCellText>
          <Tooltip title={taxRate.legalNote} arrow placement="top">
            {taxRate.legalNote ? (
              <Receipt fontSize="small" />
            ) : (
              <ReceiptOutlined fontSize="small" />
            )}
          </Tooltip>
        </TableCellText>
      </Cell>
    ),
  },
  {
    headerName: 'action',
    key: 'tax-rate-cell-action',
    isHeaderNameHidden: true,
    align: 'center',
    isLast: true,
    renderCell: (taxRate, cellProps) => (
      <Cell {...cellProps} onClick={undefined}>
        <Actions taxRate={taxRate} />
      </Cell>
    ),
  },
];

const TaxRates = () => {
  const {data: taxRates} = useVats();
  const {mutate: createTaxRate} = useCreateVat();
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<VatView>({
    mode: 'all',
    defaultValues: {
      name: '',
      percentage: 0,
      legalNote: '',
      isDefault: false,
    },
  });

  const resetForm = () => {
    form.reset({
      name: '',
      percentage: 0,
      legalNote: '',
      isDefault: false,
    });
  };

  const handleSave = (data: VatView) => {
    createTaxRate(data, {
      onSuccess: () => {
        setOpenDialog(false);
        resetForm();
      },
    });
  };

  const handleOpenModal = () => {
    setOpenDialog(true);
  };

  const onCancel = () => {
    setOpenDialog(false);
    resetForm();
  };

  const hasTaxRates = taxRates && taxRates.length > 0;

  return (
    <>
      <Box bgcolor="white" p={3} borderRadius={1}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" color="primary.dark">
            {t('Tax rate')}
          </Typography>
          {hasTaxRates ? (
            <Button
              buttonProps={{
                size: 'large',
                variant: 'text',
                onClick: () => handleOpenModal(),
              }}>
              <AddOutlined />
              <Typography variant="subtitle1" fontWeight="bold" pl={1} pt={0.5}>
                {t('New Tax Rate')}
              </Typography>
            </Button>
          ) : null}
        </Box>

        {hasTaxRates ? (
          <Box sx={{pt: 3}}>
            <TableContainer>
              <TableHeader columns={COLUMNS} />
              <TableBody>
                {taxRates.map((entry) => (
                  <TableRow
                    key={`tax-rate-row-${entry.id}`}
                    testId={`tax-rate-row-${entry.id}`}>
                    {COLUMNS.map(({renderCell, ...rest}) =>
                      renderCell(entry, {
                        ...rest,
                      }),
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          </Box>
        ) : (
          <EmptySection
            showActionBtn
            illustration="percentage"
            size="tiny"
            containerStyle={{
              my: 4,
            }}
            label="No tax rate"
            labelStyle={{
              typography: 'h6',
              color: theme.palette.primary.dark,
            }}
            subLabel="Add tax rate(s) to be used through the platform"
            subLabelProps={{
              color: theme.palette.text.secondary,
            }}
            btnLabel="New Tax Rate"
            btnSize="medium"
            btnAction={handleOpenModal}
          />
        )}
      </Box>
      <Dialog
        title="New tax rate"
        onCancel={onCancel}
        onSave={form.handleSubmit(handleSave)}
        saveButtonText="Add tax rate"
        saveButtonContainerStyles={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{
          border: `1px solid ${theme.palette.primary.dark}`,
        }}
        cancelButtonTextColor={theme.palette.primary.dark}
        disableSaveBtn={!form.formState.isValid}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <TaxRatesModal form={form} />
      </Dialog>
    </>
  );
};

export default TaxRates;
