import React, {useEffect, useMemo, useState} from 'react';
import {
  Box,
  IconButton,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {useTranslation} from 'react-i18next';
import {ReactComponent as AccountingInvoiceMail} from 'assets/icons/InvoiceIcon.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {theme} from 'theme';
import {useFormik} from 'formik';
import {
  calculateContractInvoicePriceGrandTotalForm,
  convertExtendedRecordsToContractComponentRecords,
  getUniqueInvoiceJobTimeNumbers,
} from 'utils/contract-utils';
import {
  calculateContractInvoicePriceTotal,
  ContractComponentView,
  ExtendedContractComponentRecord,
} from 'models/contract';
import {monthNames} from 'utils/elevator-utils';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {Button} from 'components/Button';
import {CallSplit, CallMerge} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {FormSelect} from 'components/form/FormSelect';
import Grid from '@mui/material/Grid';
import {olStyles} from 'styles';
import {EmptySection} from 'components/EmptySection';
import {SectionTitle} from '../../../../InvoiceDetails/SectionTitle';
import {ContractCard} from '../ContractCard';

interface Props {
  components: ContractComponentView[];
  updateContract: (obj: any) => void;
  contractId?: string;
}

interface InvoiceGroup {
  groupNumber: number;
  services: ExtendedContractComponentRecord[];
}

const InvoiceSetup = ({components, updateContract, contractId}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formikContractComponents = useFormik<{
    components: ExtendedContractComponentRecord[];
  }>({
    initialValues: {
      components: components?.map((c) => ({
        id: c.id,
        name: c.name,
        group: c.group as string,
        elevators: c.additionalInfo.elevators,
        firstInvoiceDate: c.additionalInfo.firstInvoiceDate,
        firstOrderDate: c.additionalInfo.firstOrderDate,
        costType: c.additionalInfo.costType,
        costPackage: c.additionalInfo.costPackage,
        isAutomaticJobCycle: false,
      })) as ExtendedContractComponentRecord[],
    },
    onSubmit: () => {},
    validateOnMount: true,
  });

  const [selectedGroup, setSelectedGroup] = useState('');
  const [activeServiceId, setActiveServiceId] = useState('');
  const [activeGroupNumber, setActiveGroupNumber] = useState(0);

  const [isAddToGroupOpen, setIsAddToGroupOpen] = useState(false);
  const [isDisbandDialogOpen, setIsDisbandDialogOpen] = useState(false);
  const [invoiceGroups, setInvoiceGroups] = useState<InvoiceGroup[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<number[]>([]);
  const [ungroupedItems, setUngroupedItems] = useState<
    ExtendedContractComponentRecord[]
  >([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  const columns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: 'Service Name', align: 'left', width: '30%'},
    {name: 'Job Frequency', width: '25%'},
    {name: 'Invoice Cycle', width: '25%'},
    {name: 'Invoice Price (EXCL. VAT)', align: 'left', width: '20%'},
  ];

  const handleGroupChange = (event: any) => {
    setSelectedGroup(event.target.value);
  };

  const handleCheckboxChange = (itemId: string, isChecked: boolean) => {
    const updatedComponents = [...formikContractComponents.values.components];
    const ungroupedIndex = updatedComponents.findIndex(
      (component) => component.id === itemId,
    );

    if (ungroupedIndex !== -1) {
      updatedComponents[ungroupedIndex] = {
        ...updatedComponents[ungroupedIndex],
        isChecked,
      };

      formikContractComponents.setFieldValue('components', updatedComponents);
    }
  };

  const handleAddToGroup = () => {
    const componentToBeAdded = formikContractComponents.values.components.find(
      (item) => item.id === activeServiceId,
    );

    componentToBeAdded!.isChecked = true;

    const existingGroupIndex = invoiceGroups.findIndex(
      (group) => group.groupNumber === Number(selectedGroup),
    );

    invoiceGroups[existingGroupIndex].services.push(componentToBeAdded!);

    setCollapsedGroups((prevCollapsed) => [...prevCollapsed]);

    const updatedComponents = formikContractComponents.values.components.map(
      (item) =>
        item.id === activeServiceId
          ? {...item, groupNumber: Number(selectedGroup), isChecked: false}
          : item,
    );

    formikContractComponents.setFieldValue('components', updatedComponents);

    updateContract({
      body: {
        components:
          convertExtendedRecordsToContractComponentRecords(updatedComponents),
      },
      contractId,
    });
  };

  const handleDisbandGroup = (groupNumber: number) => {
    const groupIndex = invoiceGroups.findIndex(
      (group) => group.groupNumber === groupNumber,
    );

    const servicesToDisband = invoiceGroups[groupIndex].services;

    const updatedGroups = [...invoiceGroups];
    updatedGroups.splice(groupIndex, 1);
    setInvoiceGroups(updatedGroups);
    setExpandedGroups(expandedGroups.filter((g) => g !== groupNumber));

    const updatedComponents = formikContractComponents.values.components.map(
      (item) =>
        servicesToDisband.includes(item)
          ? item
          : {...item, groupNumber: null, isChecked: false},
    );
    formikContractComponents.setFieldValue('components', updatedComponents);

    updateContract({
      body: {
        components: convertExtendedRecordsToContractComponentRecords(
          updatedComponents as ExtendedContractComponentRecord[],
        ),
      },
      contractId,
    });
  };

  const handleCollapseToggle = (groupNumber: number) => {
    setCollapsedGroups((prevCollapsed) =>
      prevCollapsed.includes(groupNumber)
        ? prevCollapsed.filter((num) => num !== groupNumber)
        : [...prevCollapsed, groupNumber],
    );

    setExpandedGroups((prevExpanded) =>
      prevExpanded.includes(groupNumber)
        ? prevExpanded.filter((num) => num !== groupNumber)
        : [...prevExpanded, groupNumber],
    );
  };

  useEffect(() => {
    const groupedItemIds = invoiceGroups.flatMap((group) =>
      group.services.map((service) => service.id),
    );
    const ungrouped = formikContractComponents.values.components.filter(
      (component) => !groupedItemIds.includes(component.id),
    );
    setUngroupedItems(ungrouped);
  }, [invoiceGroups, formikContractComponents.values.components]);

  useEffect(() => {
    const newGroupNumber = invoiceGroups.length
      ? invoiceGroups[invoiceGroups.length - 1].groupNumber + 1
      : 1;

    const map = new Map();

    formikContractComponents.values.components?.forEach((item) => {
      if (item.group) {
        const key = item.group;
        if (!map.has(key)) {
          map.set(key, [item]);
        } else {
          map.get(key).push(item);
        }
      }
    });
    const groupedData = Array.from(map.values());

    groupedData?.forEach((grouped) => {
      setInvoiceGroups((prevGroups) => [
        ...prevGroups,
        {groupNumber: newGroupNumber, services: grouped},
      ]);
    });
    setCollapsedGroups((prevCollapsed) => [...prevCollapsed, newGroupNumber]);
  }, []);

  useEffect(() => {
    const resetComponents = formikContractComponents.values.components.map(
      (item) => ({
        ...item,
        groupNumber: null,
        isChecked: false,
      }),
    );
    formikContractComponents.setFieldValue('components', resetComponents);
  }, []);

  const handleInvoicingTogether = () => {
    const updatedComponents = formikContractComponents.values.components.map(
      (item) =>
        item.isChecked
          ? {
              ...item,
              groupNumber: null,
            }
          : item,
    );

    const checkedItems = formikContractComponents.values.components.filter(
      (component) => component.isChecked && !component.groupNumber,
    );

    if (checkedItems.length > 1) {
      const newGroupNumber = invoiceGroups.length
        ? invoiceGroups[invoiceGroups.length - 1].groupNumber + 1
        : 1;

      setInvoiceGroups((prevGroups) => [
        ...prevGroups,
        {groupNumber: newGroupNumber, services: checkedItems},
      ]);

      setCollapsedGroups((prevCollapsed) => [...prevCollapsed, newGroupNumber]);

      const componentsToSave = updatedComponents.map((item) =>
        item.isChecked
          ? {...item, groupNumber: newGroupNumber, isChecked: false}
          : item,
      );
      formikContractComponents.setFieldValue('components', componentsToSave);

      updateContract({
        body: {
          components: convertExtendedRecordsToContractComponentRecords(
            componentsToSave as ExtendedContractComponentRecord[],
          ),
        },
        contractId,
      });
    }
  };

  const headerStyles = useMemo(
    () => ({
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      borderRadius: '4px',
      paddingY: 0.5,
      paddingX: 1,
      fontWeight: '600',
      gap: '10px',
      alignItems: 'center',
    }),
    [],
  );

  return (
    <Grid item xs={12} md={8}>
      <ContractCard
        containerStyles={{
          ...olStyles.scrollbar,
          overflowY: 'scroll',
          mt: !isMobile ? '0em' : 0,
          py: 2,
          px: 2,
          height: '100%',
          '& .MuiCardHeader-root': {
            ...headerStyles,
            py: 0,
          },
        }}
        header={
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between">
              <SectionTitle
                Icon={AccountingInvoiceMail}
                title={t('Invoice Setup')}
                containerSx={{backgroundColor: 'unset'}}
              />
              {formikContractComponents.values.components?.filter(
                (component) => component.isChecked && !component.groupNumber,
              ).length > 1 && (
                <Button
                  label="Invoice Together"
                  buttonProps={{
                    onClick: handleInvoicingTogether,
                    variant: 'outlined',
                    size: 'small',
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              {t('Select and group services to be invoiced together')}
            </Typography>
          </Box>
        }>
        <TableContainer sx={{margin: '1em 0em 0em 0em'}}>
          <TableHead
            sx={{display: 'block', borderBottom: '1px solid #8F9BB380'}}>
            <TableRow sx={{display: 'block'}}>
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  align={column.align || 'left'}
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
          {invoiceGroups?.length || ungroupedItems?.length ? (
            <Box>
              {invoiceGroups.map((group) => (
                <Box
                  key={group.groupNumber}
                  sx={{
                    padding: '1em 0em 0em 0em',
                  }}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Box sx={{width: '75%'}}>
                      <Typography
                        variant="subtitle2"
                        color={theme.palette.text.primary}
                        sx={{
                          cursor: 'pointer',
                          alignItems: 'center',
                          display: 'flex',
                        }}
                        onClick={() => handleCollapseToggle(group.groupNumber)}>
                        {expandedGroups.includes(group.groupNumber) ? (
                          <ExpandMoreIcon sx={{mr: 1}} />
                        ) : (
                          <ChevronRightIcon sx={{mr: 1}} />
                        )}
                        {t('Invoice group {{groupNumber}}', {
                          groupNumber: group.groupNumber,
                        })}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '20%',
                        justifyContent: 'space-between',
                      }}>
                      <Typography
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: '600',
                        }}
                        variant="body2">
                        {formatCurrency(
                          calculateContractInvoicePriceGrandTotalForm(
                            group.services,
                          ) ?? 0 / 10 ** (currentCurrency.fractionDigits ?? 0),
                          {
                            currency: currentCurrency.code,
                          },
                        )}
                      </Typography>
                      <Tooltip
                        title={t('Disband invoice group')}
                        placement="top"
                        arrow>
                        <IconButton
                          sx={{mr: '30%'}}
                          onClick={() => {
                            setActiveGroupNumber(group.groupNumber);
                            setIsDisbandDialogOpen(true);
                          }}>
                          <CallSplit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {!collapsedGroups.includes(group.groupNumber) && (
                    <TableBody sx={{display: 'block'}}>
                      {group.services?.map((item, index) => (
                        <TableRow
                          sx={{
                            width: '100%',
                            display: 'block',
                            cursor: 'pointer',
                            padding: '0.3em 0em',
                            '&:hover': {
                              background: '#00D1FF14',
                            },
                          }}
                          key={`${item.id}-${index}}`}>
                          <TableCell
                            sx={{
                              width: '30%',
                              display: 'inline-block',
                              padding: '0em 0.5em 0em 2.5em',
                              borderBottom: 'none',
                            }}>
                            <Typography
                              sx={{color: '#0092B2', fontWeight: '600'}}
                              variant="body2">
                              {item.name}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              width: '25%',
                              display: 'inline-block',
                              borderBottom: 'none',
                              padding: '0.5em 0em',
                            }}>
                            <Typography
                              color={theme.palette.text.primary}
                              variant="body2">
                              {getUniqueInvoiceJobTimeNumbers(item.elevators)
                                .map(
                                  (monthNumber) => monthNames[monthNumber - 1],
                                )
                                .join(', ') || '-'}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              width: '25%',
                              display: 'inline-block',
                              borderBottom: 'none',
                              padding: '0.5em 0em',
                            }}>
                            <Typography
                              color={theme.palette.text.primary}
                              variant="body2">
                              {getUniqueInvoiceJobTimeNumbers(item.elevators)
                                .map(
                                  (monthNumber) => monthNames[monthNumber - 1],
                                )
                                .join(', ') || '-'}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              width: '20%',
                              display: 'inline-block',
                              textAlign: 'left',
                              borderBottom: 'none',
                              padding: '0.5em 0.5em 0.5em 0em',
                            }}>
                            <Typography
                              color={theme.palette.text.primary}
                              variant="body2">
                              {formatCurrency(
                                calculateContractInvoicePriceTotal(
                                  item.elevators || [],
                                ) ??
                                  0 /
                                    10 ** (currentCurrency.fractionDigits ?? 0),
                                {
                                  currency: currentCurrency.code,
                                },
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Box>
              ))}

              <TableBody sx={{display: 'block'}}>
                {ungroupedItems?.map((item, index) => (
                  <TableRow
                    sx={{
                      width: '100%',
                      display: 'block',
                      cursor: 'pointer',
                      padding: '0.1em 0em',
                      '&:hover': {
                        background: !item.isChecked ? '#F2F6F8' : '#00D1FF14',
                      },
                    }}
                    key={`${item.id}-${index}`}>
                    <TableCell
                      sx={{
                        width: '30%',
                        display: 'inline-block',
                        padding: '0em 0.5em',
                        borderBottom: 'none',
                      }}>
                      <FormCheckbox
                        checked={item.isChecked}
                        name={`isChecked-${index}`}
                        handleChange={() =>
                          handleCheckboxChange(item.id!, !item.isChecked)
                        }
                        label={item.name}
                        typographyProps={{
                          color: '#0092B2',
                          fontWeight: '600',
                          variant: 'body2',
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        width: '25%',
                        display: 'inline-block',
                        borderBottom: 'none',
                        padding: '0.5em 0em',
                      }}>
                      <Typography
                        color={theme.palette.text.primary}
                        variant="body2">
                        {getUniqueInvoiceJobTimeNumbers(item.elevators)
                          .map((monthNumber) => monthNames[monthNumber - 1])
                          .join(', ') || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        width: '25%',
                        display: 'inline-block',
                        borderBottom: 'none',
                        padding: '0.5em 0em',
                      }}>
                      <Typography
                        color={theme.palette.text.primary}
                        variant="body2">
                        {getUniqueInvoiceJobTimeNumbers(item.elevators)
                          .map((monthNumber) => monthNames[monthNumber - 1])
                          .join(', ') || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        width: '20%',
                        display: 'inline-block',
                        textAlign: 'left',
                        borderBottom: 'none',
                        padding: '0.5em 0.5em 0.5em 0em',
                      }}>
                      <Typography
                        color={theme.palette.text.primary}
                        variant="body2"
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        {formatCurrency(
                          calculateContractInvoicePriceTotal(item.elevators) ??
                            0 / 10 ** (currentCurrency.fractionDigits ?? 0),
                          {
                            currency: currentCurrency.code,
                          },
                        )}
                        {ungroupedItems.length >= 1 &&
                          invoiceGroups.length >= 1 && (
                            <Tooltip
                              title={t('Add to invoice group')}
                              placement="top"
                              arrow>
                              <IconButton
                                sx={{mr: '30%'}}
                                onClick={() => {
                                  setIsAddToGroupOpen(true);
                                  setActiveServiceId(item.id!);
                                }}>
                                <CallMerge />
                              </IconButton>
                            </Tooltip>
                          )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Box>
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
        </TableContainer>

        <Dialog
          title={t('Add to invoice group')}
          onCancel={() => {
            setIsAddToGroupOpen(false);
          }}
          dialogProps={{
            open: isAddToGroupOpen || false,
            maxWidth: 'xs',
          }}
          saveButtonText={t('Add to group')}
          onSave={() => {
            handleAddToGroup();
            setIsAddToGroupOpen(false);
          }}
          leftButton={
            <Button
              label="Cancel"
              buttonProps={{
                onClick: () => setIsAddToGroupOpen(false),
                variant: 'text',
                size: 'large',
                sx: {background: 'white'},
              }}
            />
          }
          saveButtonVariant="contained"
          showCancelButton={false}>
          <FormSelect
            labelId="invoice-groups"
            label=""
            options={invoiceGroups
              .filter((groupNumber) => groupNumber !== null)
              .map((group) => ({
                label: `Invoice group ${group.groupNumber}`,
                value: `${group.groupNumber}`,
              }))}
            selectProps={{
              id: 'invoice-group',
              value: selectedGroup,
              onChange: handleGroupChange,
              name: 'invoice-group',
            }}
            selectStyles={{
              '& .MuiSelect-select': {
                py: 0.5,
                typography: 'body2',
              },
            }}
          />
        </Dialog>

        <Dialog
          title={t('Disband invoice group')}
          onCancel={() => {
            setIsDisbandDialogOpen(false);
          }}
          dialogProps={{
            open: isDisbandDialogOpen || false,
            maxWidth: 'xs',
          }}
          saveButtonText={t('Disband')}
          onSave={() => {
            handleDisbandGroup(activeGroupNumber);
            setIsDisbandDialogOpen(false);
          }}
          showCancelButton
          saveButtonProps={{
            sx: {
              backgroundColor: 'error.light',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'primary.contrastText',
              },
            },
          }}>
          <Typography>
            {t('You are about to disband the invoice group.')}
          </Typography>
        </Dialog>
      </ContractCard>
    </Grid>
  );
};

export default InvoiceSetup;
