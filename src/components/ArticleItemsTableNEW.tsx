import React, {useContext, useMemo, useState} from 'react';
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
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import {
  applyDiscount,
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  getAggregatedItemsVats,
} from 'pages/InvoiceDetails/utils';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {
  DiscountType,
  DiscountTypeOptions,
  InvoiceFormData,
  InvoiceItemRecord,
} from 'models/invoice';
import {Amount} from 'models/misc';
import {ArticleView} from 'models/article';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {LanguageContext} from 'context/LanguageProvider';
import {
  calculateTotalAmountInclVats,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {getItemRecord} from 'utils/article-utils';
import {fixRounding} from 'utils/utils';
import {Button} from './Button';
import {SelectModal} from './SelectModal';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {CustomPricesDataGrid} from './DataGrid/CustomPricesDataGrid';
import {SelectButton} from './SelectButton';
import {SearchInput} from './SearchInput';
import {ArticleItemRowNEW} from './ArticleItemRowNEW';
import {FormSelect} from './form/FormSelect';

interface Props {
  items: InvoiceItemRecord<Amount>[];
  setItems: (items: InvoiceItemRecord<Amount>[]) => void;
  propertyOwnerId: string;
  formik: FormikProps<InvoiceFormData>;
}

export const ArticleItemsTableNEW = ({
  items,
  setItems,
  propertyOwnerId,
  formik,
}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const subtotalExclVat = calculateTotalWithPerItemDiscount(formik.values);
  const subtotalExclVatFormatted = formatCurrency(subtotalExclVat, {
    currency: currentCurrency.code,
  });
  const subtotalExclVatAfterDiscount = applyDiscount({
    actualValue: subtotalExclVat,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
  });

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

  const totalAmountInclVats = calculateTotalAmountInclVats({
    subtotalExclVatAfterDiscount,
    percentageVats,
  });

  const totalAmountInclVatsFormatted = formatCurrency(
    fixRounding(totalAmountInclVats, 2),
    {
      currency: currentCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
    },
  );

  const {language: selectedLng} = useContext(LanguageContext);

  const articleViewToItem = (
    article: ArticleView,
  ): InvoiceItemRecord<Amount> => {
    const record: InvoiceItemRecord<Amount> = {
      article,
      name: article.name,
      description: article.description,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
    };
    return getItemRecord(record, record.unitAmount.percentageVat);
  };
  const tabItems: TabItems[] = useMemo(() => {
    const tItems = [
      {
        label: 'Articles & Spare parts',
        icon: <HomeRepairServiceIcon />,
      },
    ];
    if (propertyOwnerId) {
      tItems.push({
        label: 'Custom prices',
        icon: <ReceiptLongIcon />,
      });
    }
    return tItems;
  }, [propertyOwnerId]);

  const deleteItem = (indexPos: number) => {
    const newItems = items.filter((_, index) => indexPos !== index);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView) => {
    setItems([...items, articleViewToItem(row)]);
    setIsArticleModalOpen(false);
  };

  const setItemAtIndex = (
    indexPos: number,
    item: InvoiceItemRecord<Amount>,
  ) => {
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

  const columns: {name: string; align?: TableCellProps['align']}[] = [
    {name: '#', align: 'right'},
    {name: 'Name'},
    {name: 'Unit Price'},
    {name: 'Quantity'},
    {name: 'VAT (%)'},
    {name: 'Unit'},
    {name: discountText},
    {name: 'Total Price (excl. VAT)'},
    {name: ''},
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="action.focus"
      borderRadius={1}
      px={1.5}
      py={2}>
      <TableContainer>
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
                <TableCell key={column.name} align={column.align || 'left'}>
                  {t(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <ArticleItemRowNEW
                key={index + (item.article?.id || item.name)}
                articleItem={item}
                index={index}
                deleteItem={deleteItem}
                setItemAtIndex={setItemAtIndex}
              />
            ))}
          </TableBody>
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
                onClick: () => setIsArticleModalOpen(true),
              }}
            />
            <Box px={3} pt={3} borderTop="1px solid" borderColor="grey.300">
              <Box
                pl="20%"
                sx={{
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
                          },
                        }}
                        onValueChange={handleDiscountValueChange}
                      />
                      <IconButton
                        onClick={handleRemoveDiscount}
                        sx={{p: '0px', mr: -3.3, color: 'text.disabled'}}>
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
                      {formatCurrency(fixRounding(percentageVats[0].vat, 2), {
                        currency: currentCurrency.code,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                        roundingMode: 'floor',
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
                  {totalAmountInclVatsFormatted}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box display="flex" alignItems="center" my="1em" gap="1em">
            <Typography variant="body2">1</Typography>
            <SelectButton
              text="Select Articles & Custom Prices"
              onClick={() => setIsArticleModalOpen(true)}
              sxContainer={{flexGrow: 1}}
            />
          </Box>
        )}
      </Box>
      <SelectModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        header="Select Articles & Custom Prices">
        <Box
          sx={{
            position: 'absolute',
            right: 10,
            zIndex: 9999,
          }}>
          <SearchInput
            variant="outlined"
            label="Search"
            onValueChanged={(value) => setSearch(value)}
          />
        </Box>
        <Tabs
          tabItems={tabItems}
          currentIndex={tabValue}
          onChange={(index) => setTabValue(index)}>
          <TabsBody value={tabValue} index={0}>
            <ArticlesDataGrid
              search={search}
              setRowItem={handleSelectItem}
              setSearch={() => setSearch('')}
            />
          </TabsBody>
          <TabsBody value={tabValue} index={1}>
            <CustomPricesDataGrid
              search={search}
              setSearch={() => setSearch('')}
              setRowItem={handleSelectItem}
              propertyOwnerId={propertyOwnerId}
            />
          </TabsBody>
        </Tabs>
      </SelectModal>
    </Box>
  );
};
