import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikProps} from 'formik';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  tableCellClasses,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  applyDiscount,
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  articleViewToInvoiceItemRecord,
  getAggregatedItemsVats,
} from 'pages/InvoiceDetails/utils';
import {
  DiscountType,
  DiscountTypeOptions,
  InvoiceFormData,
  InvoiceItemRecord,
} from 'models/invoice';
import {ArticleType, ArticleView} from 'models/article';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {LanguageContext} from 'context/LanguageProvider';
import {
  calculateSameVatTotals,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {fixRounding, getUniqueId} from 'utils/utils';
import {useTheme} from '@mui/material/styles';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {Button} from './Button';
import {SelectButton} from './SelectButton';
import {ArticleItemRowNEW} from './ArticleItemRowNEW';
import {FormSelect} from './form/FormSelect';

interface Props {
  items: InvoiceItemRecord[];
  setItems: (items: InvoiceItemRecord[]) => void;
  propertyOwnerId: string;
  formik: FormikProps<InvoiceFormData>;
  isHovered?: boolean;
}

export const ArticleItemsTableNEW = ({
  items,
  setItems,
  propertyOwnerId,
  formik,
  isHovered,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();

  const subtotalExclVat = calculateTotalWithPerItemDiscount(
    formik.values.items,
  );
  const subtotalExclVatFormatted = formatCurrency(subtotalExclVat, {
    currency: currentCurrency.code,
  });
  const subtotalExclVatAfterDiscount = applyDiscount({
    actualValue: subtotalExclVat,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
  });
  const {company} = useContext(UserCompanyContext);
  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(items);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    formik.values.discount,
  );

  const allItemsHasSameVAT = itemsAfterGlobalDiscount.every(
    (item) =>
      item.unitAmount.percentageVat === items[0].unitAmount.percentageVat,
  );

  const percentageVats = itemsAfterGlobalDiscount.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: itemsAfterGlobalDiscount[0].unitAmount.percentageVat,
            vat:
              subtotalExclVatAfterDiscount *
              (itemsAfterGlobalDiscount[0].unitAmount.percentageVat / 100),
          },
        ]
      : getAggregatedItemsVats(itemsAfterGlobalDiscount)
    : [];

  const {language: selectedLng} = useContext(LanguageContext);

  const deleteItem = (indexPos: number) => {
    const newItems = items.filter((_, index) => indexPos !== index);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView, indexPosition: number) => {
    if (indexPosition >= 0 && indexPosition < items.length) {
      const updatedItems = [...items];
      updatedItems[indexPosition] = articleViewToInvoiceItemRecord(row);
      setItems(updatedItems);
    } else {
      setItems([...items, articleViewToInvoiceItemRecord(row)]);
    }
  };

  const setItemAtIndex = (indexPos: number, item: InvoiceItemRecord) => {
    const prevItems = [...items];
    prevItems[indexPos] = item;
    setItems(prevItems);
  };

  const handleAddDiscount = () =>
    formik.setFieldValue('discount', {
      type: DiscountType.AMOUNT,
      amount: {
        value: 0,
        currency: currentCurrency.code,
      },
      percentage: 0,
    });

  const handleRemoveDiscount = () =>
    formik.setFieldValue('discount', {
      type: DiscountType.NONE,
    });

  const handleDiscountValueChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (formik.values.discount?.type === DiscountType.AMOUNT) {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        percentage: floatValue || 0,
      });
    }
  };

  const discountText = selectedLng === 'DE' ? 'Rabatt' : t('Discount');

  const createEmptyItem = () => {
    const blankItem = {
      article: {
        id: getUniqueId(),
        name: '',
        type: ArticleType.LABOR,
        unitSellingAmount: {
          netAmount: 0,
          fractionDigits: currentCurrency.fractionDigits,
          currency: currentCurrency.code,
          grossAmount: 0,
          percentageVat: company?.settings.percentageVat ?? 0,
          vat: 0,
        },
      },
      name: '',
      description: '',
      quantity: 0,
      unitAmount: {
        netAmount: 0,
        fractionDigits: currentCurrency.fractionDigits,
        currency: currentCurrency.code,
        grossAmount: 0,
        percentageVat: company?.settings.percentageVat ?? 0,
        vat: 0,
      },
      discount: {
        type: DiscountType.PERCENTAGE,
        percentage: 0,
      },
    };
    setItems([...items, blankItem]);
  };

  const columns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: '#', align: 'left', width: '2%'},
    {name: 'Name', width: '32%'},
    {name: 'Type', width: '4%'},
    {name: 'Unit Price', width: '14%'},
    {name: 'Quantity', width: '6%'},
    {name: 'VAT (%)', width: '6%'},
    {name: 'Unit', width: '10%'},
    {name: discountText, width: '9%'},
    {name: 'Total Price (excl. VAT)', width: '15%'},
    {name: '', width: '2%'},
  ];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setItems(items);
  };
  const {user} = useUserSession();

  const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

  return (
    <Box
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="action.focus"
      borderRadius={1}
      px={1.5}
      py={2}>
      <TableContainer sx={{overflowX: 'hidden'}}>
        <Table
          sx={{
            minWidth: 700,
            [`& .${tableCellClasses.root}`]: {
              p: 0,
              px: 0.5,
              borderBottom: 'none',
              borderSpacing: '0 1rem',
            },
            [`& .${tableCellClasses.head}`]: {
              p: 0,
              px: 0.5,
              color: 'text.secondary',
              typography: 'caption',
            },
            [`& .${tableCellClasses.body}`]: {
              p: 0,
              px: 0.5,
            },
            '& .MuiOutlinedInput-root': {
              fieldset: {
                borderColor: '#E4E9F2',
              },
            },
          }}
          aria-label="spanning table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  align={column.align || 'left'}
                  sx={{display: 'inline-block'}}
                  width={column.width}>
                  {t(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="article-items">
              {(providedDrop) => (
                <TableBody
                  ref={providedDrop.innerRef}
                  {...providedDrop.droppableProps}>
                  {items.map((item, index) => (
                    <Draggable
                      key={index + (item.article?.id || item.name)}
                      draggableId={index + (item.article?.id || item.name)}
                      index={index}>
                      {(provided) => (
                        <TableRow
                          sx={{
                            position: 'relative',
                            width: '100%',
                            '& .MuiTableCell-root': {
                              verticalAlign: 'top',
                            },
                            ':hover': {
                              '.drag-indicator': {
                                visibility: 'visible',
                              },
                            },
                          }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
                          <ArticleItemRowNEW
                            key={index + (item.article?.id || item.name)}
                            articleItem={item}
                            index={index}
                            deleteItem={deleteItem}
                            setItemAtIndex={setItemAtIndex}
                            propertyOwnerId={propertyOwnerId}
                            handleSelectItem={handleSelectItem}
                            isHovered={isHovered}
                            defaultPercentageVat={
                              user?.userAccount.serviceCompany.settings
                                .percentageVat
                            }
                          />
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {providedDrop.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>
      <Box
        borderRadius={1}
        display="flex"
        flexDirection="column"
        my={2}
        gap={2}>
        {items.length ? (
          <>
            <Button
              label="Add Article"
              buttonProps={{
                variant: 'contained',
                sx: {alignSelf: 'self-start'},
                startIcon: <AddIcon />,
                onClick: createEmptyItem,
              }}
            />
            <Box px={3} pt={3} borderTop="1px solid" borderColor="grey.300">
              <Box
                pl="20%"
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    pl: '50%',
                  },
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  justifyItems: 'end',
                  alignItems: 'center',
                  gap: 2,
                }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Subtotal (excl. VAT)')}
                </Typography>

                <Typography variant="body2" color="primary.dark">
                  {subtotalExclVatFormatted}
                </Typography>
                {formik.values.discount?.type === DiscountType.AMOUNT ||
                formik.values.discount?.type === DiscountType.PERCENTAGE ? (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {discountText}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormSelect
                        labelId="select-discount-type-label"
                        label=""
                        options={Object.entries(DiscountTypeOptions).map(
                          ([key, val]) => ({
                            label: val,
                            value: key,
                          }),
                        )}
                        selectProps={{
                          id: 'select-discount-type',
                          value: formik.values.discount.type,
                          onChange: formik.handleChange,
                          name: 'discount.type',
                        }}
                        selectStyles={{
                          '& .MuiSelect-select': {
                            py: 0.5,
                            typography: 'body2',
                          },
                        }}
                      />
                      <NumericFormat
                        value={
                          formik.values.discount?.type === DiscountType.AMOUNT
                            ? formik.values.discount?.amount?.value
                            : formik.values.discount?.percentage
                        }
                        isAllowed={(values) => {
                          const {floatValue} = values;
                          if (!floatValue) {
                            return true;
                          }

                          if (floatValue < 0) {
                            return false;
                          }

                          const maxDiscount: number =
                            formik.values.discount?.type === DiscountType.AMOUNT
                              ? subtotalExclVat
                              : 100;

                          return floatValue <= maxDiscount;
                        }}
                        customInput={TextField}
                        allowLeadingZeros={false}
                        decimalScale={2}
                        decimalSeparator={
                          selectedLng === 'DE' || selectedLng === 'SR'
                            ? ','
                            : '.'
                        }
                        thousandSeparator={
                          selectedLng === 'DE' || selectedLng === 'SR'
                            ? '.'
                            : ','
                        }
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            mb: 0.3,
                          },
                          '& .MuiOutlinedInput-input': {
                            py: 0.32,
                            textAlign: 'right',
                          },
                        }}
                        onValueChange={handleDiscountValueChange}
                      />
                      <IconButton
                        onClick={handleRemoveDiscount}
                        sx={{p: '0px', mr: -3.1, color: 'text.disabled'}}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box />
                    <Button
                      label="Add Discount"
                      buttonProps={{
                        size: 'small',
                        variant: 'outlined',
                        sx: {bgcolor: 'transparent'},
                        startIcon: <AddIcon />,
                        onClick: handleAddDiscount,
                      }}
                    />
                  </>
                )}
                {allItemsHasSameVAT ? (
                  <>
                    <Typography color="primary.dark">
                      {t('VAT')} {percentageVats[0].percentageVat}%
                    </Typography>
                    <Typography color="primary.dark">
                      {formatCurrency(totalVAT, {
                        currency: currentCurrency.code,
                      })}
                    </Typography>
                  </>
                ) : (
                  percentageVats.map((v, index) => (
                    <React.Fragment key={`${index}-${v.percentageVat}`}>
                      <Typography color="primary.dark">
                        {t('VAT')} {v.percentageVat}%
                      </Typography>
                      <Typography color="primary.dark">
                        {formatCurrency(fixRounding(v.vat, 2), {
                          currency: currentCurrency.code,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                          roundingMode: 'floor',
                        })}
                      </Typography>
                    </React.Fragment>
                  ))
                )}
                <Typography color="primary.dark">
                  {t('Total amount (incl. VAT)')}
                </Typography>
                <Typography color="primary.dark">
                  {formatCurrency(total, {
                    currency: currentCurrency.code,
                  })}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box display="flex" alignItems="center" my="1em" gap="1em">
            <Typography variant="body2">1</Typography>
            <SelectButton
              text="Add Article"
              onClick={() => createEmptyItem()}
              sxContainer={{flexGrow: 1}}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};
