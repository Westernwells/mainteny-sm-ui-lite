import React, {useContext, useMemo} from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {articleViewToInvoiceItemRecord} from 'pages/InvoiceDetails/utils';
import {
  DiscountType,
  DiscountTypeOptions,
  InvoiceFormData,
  InvoiceItemRecord,
  InvoiceType,
} from 'models/invoice';
import {ArticleType, ArticleView} from 'models/article';
import {PropertyOwnerView} from 'models/propertyManager';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {LanguageContext} from 'context/LanguageProvider';
import {
  calculateArticlesAmount,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {getUniqueId} from 'utils/utils';
import {useTheme} from '@mui/material/styles';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {ServiceOrderArticleView} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useVats} from 'hooks/reactQuery/useVats';
import {Button} from './Button';
import {SelectButton} from './SelectButton';
import {ArticleItemRowNEW} from './ArticleItemRowNEW';
import {FormSelect} from './form/FormSelect';
import {Progress} from './Progress';

interface Props {
  items: InvoiceItemRecord[];
  setItems: (items: InvoiceItemRecord[]) => void;
  propertyOwner?: PropertyOwnerView;
  formik: FormikProps<InvoiceFormData>;
  isHovered?: boolean;
  jobArticles?: ServiceOrderArticleView[];
}

export const ArticleItemsTableNEW = ({
  items,
  setItems,
  propertyOwner,
  formik,
  isHovered,
  jobArticles,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();
  const {data: taxRates, isLoading: isLoadingTaxRates} = useVats();

  const subtotalExclVat = calculateTotalWithPerItemDiscount(
    formik.values.items,
  );
  const {user} = useUserSession();

  const {language: selectedLng} = useContext(LanguageContext);

  const deleteItem = (indexPos: number) => {
    const newItems = items.filter((_, index) => indexPos !== index);
    setItems(newItems);
  };

  const defaultVat =
    propertyOwner?.additionalInfo.vat || taxRates?.find((tR) => tR.isDefault);

  const defaultPercentageVat =
    typeof defaultVat?.percentage === 'number'
      ? defaultVat.percentage
      : user?.userAccount.serviceCompany.settings.percentageVat || 0;

  const handleSelectItem = (row: ArticleView, indexPosition: number) => {
    if (indexPosition >= 0 && indexPosition < items.length) {
      const updatedItems = [...items];
      updatedItems[indexPosition] = articleViewToInvoiceItemRecord(row, {
        percentageVat: defaultPercentageVat,
        vatId: defaultVat?.id || '',
        vatName: defaultVat?.name || '',
      });
      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        articleViewToInvoiceItemRecord(row, {
          percentageVat: defaultPercentageVat,
          vatId: defaultVat?.id || '',
          vatName: defaultVat?.name || '',
        }),
      ]);
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

    if (!formik.values.discount?.type) {
      formik.setFieldValue('discount', {
        type: DiscountType.PERCENTAGE,
        percentage: floatValue || 0,
      });
    } else if (formik.values.discount?.type === DiscountType.AMOUNT) {
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
          percentageVat: defaultPercentageVat,
          vatId: defaultVat?.id || '',
          vatName: defaultVat?.name || '',
          vat: 0,
        },
      },
      name: '',
      description: '',
      quantity: 0,
      unitAmount: {
        netAmount: 0,
        percentageVat: defaultPercentageVat,
        currency: currentCurrency.code,
        vatId: defaultVat?.id || '',
        vatName: defaultVat?.name || '',
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

  const {
    amountBeforeGlobalDiscount,
    amountAfterGlobalDiscount,
    vats,
    amountAfterGlobalDiscountWithVAT,
  } = useMemo(
    () =>
      calculateArticlesAmount({
        items: formik.values.items,
        globalDiscount: formik.values.discount,
      }),
    [formik.values.items, formik.values.discount],
  );

  const amountBeforeGlobalDiscountFormatted = formatCurrency(
    amountBeforeGlobalDiscount,
    {currency: currentCurrency.code},
  );

  const amountAfterGlobalDiscountFormatted = formatCurrency(
    amountAfterGlobalDiscount,
    {currency: currentCurrency.code},
  );

  const vatsFormatted = vats.map((vat) => ({
    ...vat,
    vat: formatCurrency(vat.vat, {currency: currentCurrency.code}),
  }));

  const amountAfterGlobalDiscountWithVATFormatted = formatCurrency(
    amountAfterGlobalDiscountWithVAT,
    {currency: currentCurrency.code},
  );

  if (isLoadingTaxRates) return <Progress height="100%" />;

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
          aria-label="articles section table">
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
                  {items.map((item, index) => {
                    const key = index + (item.article?.id || item.id || '');
                    return (
                      <Draggable key={key} draggableId={key} index={index}>
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
                              key={key}
                              articleItem={item}
                              index={index}
                              deleteItem={deleteItem}
                              setItemAtIndex={setItemAtIndex}
                              propertyOwner={propertyOwner}
                              handleSelectItem={handleSelectItem}
                              isHovered={isHovered}
                              defaultPercentageVat={defaultPercentageVat}
                              taxRates={taxRates!}
                              invoiceType={formik.values.type}
                              jobArticleVat={
                                jobArticles?.find(
                                  (ja) => ja.article.id === item.article?.id,
                                )?.unitAmount.percentageVat
                              }
                            />
                          </TableRow>
                        )}
                      </Draggable>
                    );
                  })}
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
                {formik.values.discount?.type === DiscountType.AMOUNT ||
                formik.values.discount?.type === DiscountType.PERCENTAGE ? (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Sum')}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.dark">
                      {amountBeforeGlobalDiscountFormatted}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
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
                        name="globalDiscount"
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

                          if (formik.values.type === InvoiceType.CREDIT_NOTE) {
                            if (
                              formik.values.discount?.type ===
                              DiscountType.PERCENTAGE
                            ) {
                              return floatValue <= 100;
                            }

                            if (floatValue > 0) {
                              return false;
                            }

                            return floatValue >= subtotalExclVat;
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
                    </Box>
                    <Box />
                    <Button
                      label="Remove Discount"
                      buttonProps={{
                        variant: 'text',
                        size: 'small',
                        onClick: handleRemoveDiscount,
                        sx: {
                          color: 'error.main',
                          fontWeight: 400,
                          p: 0,
                        },
                      }}
                    />
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
                <Typography variant="subtitle2" color="text.secondary">
                  {t('Subtotal (excl. VAT)')}
                </Typography>
                <Typography variant="subtitle2" color="primary.dark">
                  {amountAfterGlobalDiscountFormatted}
                </Typography>
                {vatsFormatted.map((v, index) => (
                  <React.Fragment key={`${index}-${v.percentageVat}`}>
                    <Typography color="text.primary">
                      {t('VAT')} {v.percentageVat}%
                    </Typography>
                    <Typography color="text.primary">{v.vat}</Typography>
                  </React.Fragment>
                ))}
                <Typography
                  variant="subtitle1"
                  color="primary.dark"
                  fontWeight={600}>
                  {t('Total amount (incl. VAT)')}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="primary.dark"
                  fontWeight={600}>
                  {amountAfterGlobalDiscountWithVATFormatted}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box display="flex" alignItems="center" my="1em" gap="1em">
            <Typography variant="body2">1</Typography>
            <SelectButton
              text="Add Article"
              onClick={createEmptyItem}
              sxContainer={{flexGrow: 1}}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};
