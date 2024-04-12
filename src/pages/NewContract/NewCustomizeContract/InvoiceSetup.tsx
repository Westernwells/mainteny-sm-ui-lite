import React, {useEffect, useState} from 'react';
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
} from '@mui/material';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {ReactComponent as AccountingInvoiceMail} from 'assets/icons/InvoiceIcon.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {theme} from 'theme';
import {
  ExtendedContractComponentRecord,
  calculateContractInvoicePriceGrandTotal,
  calculateContractInvoicePriceTotal,
} from 'models/contract';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {Button} from 'components/Button';
import {CallSplit, CallMerge, DragIndicator} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {useTranslation} from 'react-i18next';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {
  canGroupServices,
  convertExtendedRecordsToContractComponentRecords,
} from 'utils/contract-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {getListViewFrequency} from 'utils/elevator-utils';

type InvoiceGroup = {
  groupNumber: number;
  services: ExtendedContractComponentRecord[];
};

type Props = {
  formikContractComponents: FormikProps<{
    components: ExtendedContractComponentRecord[];
  }>;
};

const InvoiceSetup = ({formikContractComponents}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const currentCurrency = useCurrentCurrency();
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
    {name: 'Invoice Price (Excl. VAT)', align: 'left', width: '20%'},
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

      const componentsToSave = updatedComponents.map((item) =>
        item.isChecked
          ? {...item, groupNumber: newGroupNumber, isChecked: false}
          : item,
      );

      const canGroup = canGroupServices(
        convertExtendedRecordsToContractComponentRecords(
          checkedItems as ExtendedContractComponentRecord[],
        ),
        enqueueSnackbar,
      );

      if (canGroup) {
        setInvoiceGroups((prevGroups) => [
          ...prevGroups,
          {groupNumber: newGroupNumber, services: checkedItems},
        ]);

        setCollapsedGroups((prevCollapsed) => [
          ...prevCollapsed,
          newGroupNumber,
        ]);

        formikContractComponents.setFieldValue('components', componentsToSave);
      }
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

    const canBeGrouped = canGroupServices(
      invoiceGroups[existingGroupIndex].services,
      enqueueSnackbar,
    );

    if (!canBeGrouped) {
      invoiceGroups[existingGroupIndex].services.pop();
    } else {
      setCollapsedGroups((prevCollapsed) => [...prevCollapsed]);

      const updatedComponents = formikContractComponents.values.components.map(
        (item) =>
          item.id === activeServiceId
            ? {...item, groupNumber: Number(selectedGroup), isChecked: false}
            : item,
      );

      formikContractComponents.setFieldValue('components', updatedComponents);
    }
  };

  const handleDisbandGroup = (groupNumber: number) => {
    const groupIndex = invoiceGroups.findIndex(
      (group) => group.groupNumber === groupNumber,
    );

    const servicesToDisband = invoiceGroups[groupIndex].services;

    const updatedGroups = [...invoiceGroups];
    updatedGroups.splice(groupIndex, 1);
    setInvoiceGroups(updatedGroups);

    const updatedComponents = formikContractComponents.values.components.map(
      (item) =>
        servicesToDisband.includes(item)
          ? item
          : {...item, groupNumber: null, isChecked: false},
    );
    formikContractComponents.setFieldValue('components', updatedComponents);
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
    const resetComponents = formikContractComponents.values.components.map(
      (item) => ({
        ...item,
        groupNumber: null,
        isChecked: false,
      }),
    );
    formikContractComponents.setFieldValue('components', resetComponents);
  }, []);

  const findGroupIndexByServiceId = (
    groups: InvoiceGroup[],
    serviceId: string,
  ) =>
    groups.findIndex((group) =>
      group.services.some((service) => service.id === serviceId),
    );

  const removeServiceFromGroup = (
    groups: InvoiceGroup[],
    groupIndex: number,
    serviceIndex: number,
  ) => groups[groupIndex].services.splice(serviceIndex, 1);

  const updateComponentInArray = (
    components: ExtendedContractComponentRecord[],
    componentId: string,
    updates: any,
  ) =>
    components.map((item) =>
      item.id === componentId ? {...item, ...updates} : item,
    );

  const findComponentById = (
    components: ExtendedContractComponentRecord[],
    componentId: string,
  ) => components.find((item) => item.id === componentId);

  const onDragEnd = (result: any) => {
    const {destination, source, draggableId} = result;
    const {droppableId: destinationDroppableId} = destination;
    const {droppableId: sourceDroppableId} = source;

    const componentId: string = draggableId;
    const componentToBeAdded = findComponentById(
      formikContractComponents.values.components,
      componentId,
    );

    if (destinationDroppableId === 'ungroupedItems') {
      const componentToBeRemovedIndex = findGroupIndexByServiceId(
        invoiceGroups,
        componentId,
      );

      if (componentToBeRemovedIndex !== -1) {
        const componentIndexInGroup = invoiceGroups[
          componentToBeRemovedIndex
        ].services.findIndex((service) => service.id === componentId);
        removeServiceFromGroup(
          invoiceGroups,
          componentToBeRemovedIndex,
          componentIndexInGroup,
        );
      }

      setCollapsedGroups((prevCollapsed) => [...prevCollapsed]);

      const updatedComponents = updateComponentInArray(
        formikContractComponents.values.components,
        componentId,
        {groupNumber: null, isChecked: false},
      );

      formikContractComponents.setFieldValue('components', updatedComponents);
    } else {
      const existingGroupIndex = invoiceGroups.findIndex(
        (group) => group.groupNumber === Number(destinationDroppableId),
      );

      if (sourceDroppableId === 'ungroupedItems') {
        invoiceGroups[existingGroupIndex].services.push(componentToBeAdded!);
      } else {
        const componentToBeRemovedIndex = findGroupIndexByServiceId(
          invoiceGroups,
          componentId,
        );
        if (componentToBeRemovedIndex !== -1) {
          const componentIndexInGroup = invoiceGroups[
            componentToBeRemovedIndex
          ].services.findIndex((service) => service.id === componentId);
          removeServiceFromGroup(
            invoiceGroups,
            componentToBeRemovedIndex,
            componentIndexInGroup,
          );
        }
        invoiceGroups[existingGroupIndex].services.push(componentToBeAdded!);
      }

      setCollapsedGroups((prevCollapsed) => [...prevCollapsed]);

      const updatedComponents = updateComponentInArray(
        formikContractComponents.values.components,
        componentId,
        {
          groupNumber:
            sourceDroppableId === 'ungroupedItems'
              ? Number(destinationDroppableId)
              : null,
          isChecked: false,
        },
      );

      formikContractComponents.setFieldValue('components', updatedComponents);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '0em 0em 0.5em 0em',
        }}>
        <AccountingInvoiceMail fontSize="2rem" />
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          sx={{paddingLeft: '1em'}}>
          {t('Invoice Setup')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5em 0em 0em 0em',
          height: '30px',
        }}>
        <Typography variant="body2" color={theme.palette.text.secondary}>
          {t('Select and group services to be invoiced together')}
        </Typography>

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

      <DragDropContext onDragEnd={onDragEnd}>
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
                    sx={{color: theme.palette.text.primary, fontWeight: '600'}}
                    variant="body2">
                    {formatCurrency(
                      calculateContractInvoicePriceGrandTotal(group.services) /
                        10 ** (currentCurrency.fractionDigits ?? 0) ?? 0,
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
                <Droppable droppableId={`${group.groupNumber}`}>
                  {(providedDroppable) => (
                    <TableBody
                      sx={{display: 'block'}}
                      {...providedDroppable.droppableProps}
                      ref={providedDroppable.innerRef}>
                      {group.services?.map((item, itemIndex) => (
                        <Draggable
                          key={`${item.id}-${itemIndex}`}
                          draggableId={item.id!}
                          index={itemIndex}>
                          {(providedDraggableItem) => (
                            <TableRow
                              ref={providedDraggableItem.innerRef}
                              {...providedDraggableItem.draggableProps}
                              {...providedDraggableItem.dragHandleProps}
                              sx={{
                                width: '100%',
                                display: 'block',
                                cursor: 'pointer',
                                padding: '0.3em 0em',
                                position: 'relative',
                                '&:hover': {
                                  background: '#00D1FF14',
                                  '.drag-indicator': {
                                    visibility: 'visible',
                                  },
                                },
                              }}
                              key={`${item.id}-${itemIndex}`}>
                              <TableCell
                                sx={{
                                  width: '30%',
                                  display: 'inline-block',
                                  padding: '0em 0.5em 0em 2.5em',
                                  borderBottom: 'none',
                                }}>
                                <IconButton
                                  className="drag-indicator"
                                  size="large"
                                  sx={{
                                    visibility: 'hidden',
                                    position: 'absolute',
                                    left: '1%',
                                    top: '50%',
                                    transform: 'translate(-50%,-50%)',
                                  }}>
                                  <DragIndicator sx={{fontSize: '1.25rem'}} />
                                </IconButton>
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
                                  {getListViewFrequency(
                                    'orderGenerationJob',
                                    item.elevators.filter(
                                      (elevator) => elevator.isSelected,
                                    ),
                                  )}
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
                                  {getListViewFrequency(
                                    'invoiceJob',
                                    item.elevators.filter(
                                      (elevator) => elevator.isSelected,
                                    ),
                                  )}
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
                                      item.elevators.filter(
                                        (elevatorItem) =>
                                          elevatorItem.isSelected,
                                      ),
                                    ) /
                                      10 **
                                        (currentCurrency.fractionDigits ?? 0) ??
                                      0,
                                    {
                                      currency: currentCurrency.code,
                                    },
                                  )}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {providedDroppable.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              )}
            </Box>
          ))}

          <Droppable droppableId="ungroupedItems">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{display: 'block'}}>
                {ungroupedItems?.map((item, index) => (
                  <Draggable
                    key={`${item.id}-${index}`}
                    draggableId={item.id!}
                    index={index}>
                    {(providedDraggable) => (
                      <TableRow
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        sx={{
                          width: '100%',
                          display: 'block',
                          cursor: 'pointer',
                          padding: '0.1em 0em',
                          position: 'relative',
                          overflowY: 'hidden',
                          pl: '1.2em',
                          '&:hover': {
                            background: !item.isChecked
                              ? '#F2F6F8'
                              : '#00D1FF14',
                            '.drag-indicator': {
                              visibility: 'visible',
                            },
                          },
                        }}
                        key={`${item.id}-${index}`}>
                        <TableCell
                          sx={{
                            width: '30%',
                            display: 'inline-block',
                            padding: '0em 0.5em',
                            borderBottom: 'none',
                            alignItems: 'center',
                          }}>
                          <IconButton
                            className="drag-indicator"
                            size="large"
                            sx={{
                              visibility: 'hidden',
                              position: 'absolute',
                              left: '1%',
                              top: '50%',
                              transform: 'translate(-50%,-50%)',
                            }}>
                            <DragIndicator sx={{fontSize: '1.25rem'}} />
                          </IconButton>
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
                            {getListViewFrequency(
                              'orderGenerationJob',
                              item.elevators.filter(
                                (elevator) => elevator.isSelected,
                              ),
                            )}
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
                            {getListViewFrequency(
                              'invoiceJob',
                              item.elevators.filter(
                                (elevator) => elevator.isSelected,
                              ),
                            )}
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
                              calculateContractInvoicePriceTotal(
                                item.elevators.filter(
                                  (elevator) => elevator.isSelected,
                                ),
                              ) /
                                10 ** (currentCurrency.fractionDigits ?? 0) ??
                                0,
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </TableContainer>
      </DragDropContext>

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
    </>
  );
};

export default InvoiceSetup;
