import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord, InvoiceType, InvoiceView} from 'models/invoice';
import {Amount} from 'models/misc';
import {ArticleType, ArticleView} from 'models/article';
import {
  useArticles,
  useCreatePartialArticle,
} from 'hooks/reactQuery/useArticle';
import {
  formatCurrency,
  useCurrentCurrency,
  getCurrencySymbol,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging-utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {calculateTotal} from 'utils/calculate-total';
import {ArticleItemRow} from './ArticleItemRow';
import {Button} from './Button';
import {FormLabel} from './form/FormLabel';
import {SelectModal} from './SelectModal';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {CustomPricesDataGrid} from './DataGrid/CustomPricesDataGrid';
import {SelectButton} from './SelectButton';
import {FormInput} from './form/FormInput';
import {SearchInput} from './SearchInput';

interface Props<T> {
  invoice?: InvoiceView | undefined;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  propertyOwnerId: string;
  isPartial?: boolean;
  isCreditNote?: boolean;
  unitSellingAmount?: Amount;
}

export const ArticleItemsTable = ({
  invoice,
  items,
  setItems,
  propertyOwnerId,
  isPartial,
  isCreditNote,
  unitSellingAmount,
}: Props<QuotationItemRecord | InvoiceItemRecord<Amount>>) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const currencyCode =
    unitSellingAmount && isCreditNote
      ? unitSellingAmount.currency
      : currentCurrency.code;

  const {user} = useUserSession();
  const [percentageVat, setPercentageVat] = useState(
    user?.userAccount?.serviceCompany?.settings?.percentageVat ?? 0,
  );
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const {
    data: partialArticleResource = createEmptyResource<ArticleView>(1),
    isFetched,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 1,
      query: '[internallabel:partial]',
      type: [ArticleType.SYSTEM],
    },
    {},
    true,
  );
  const {
    data: creditNoteArticleResource = createEmptyResource<ArticleView>(1),
    isFetched: isFetchedCreditNoteArticle,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 1,
      query: '[internallabel:credit_note]',
      type: [ArticleType.SYSTEM],
    },
    {},
    true,
  );

  const {mutate: createPartial} = useCreatePartialArticle();

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [partialPrice, setPartialPrice] = useState<number>(0);

  const [newPartialTotal, setNewPartialTotal] = useState(0);

  const getItemRecord = (
    record: QuotationItemRecord | InvoiceItemRecord<Amount>,
  ) => {
    const {netAmount} = record.unitAmount;
    const vat =
      (percentageVat * netAmount) / 10 ** record.unitAmount.fractionDigits;
    return {
      ...record,
      unitAmount: {
        ...record.unitAmount,
        netAmount,
        percentageVat,
        vat,
        grossAmount: netAmount + vat,
      },
    };
  };

  const articleViewToItem = (
    article: ArticleView,
  ): QuotationItemRecord | InvoiceItemRecord<Amount> => {
    const record = {
      articleId: article.id,
      articleUnit: article.unit,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
    };
    return getItemRecord(record);
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

  const deleteItem = (
    item: QuotationItemRecord | InvoiceItemRecord<Amount>,
  ) => {
    const newItems = items.filter((i) => i !== item);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView) => {
    if (items.filter((item) => item.articleId === row.id).length === 0) {
      setItems([...items, articleViewToItem(row)]);
    }
    setIsArticleModalOpen(false);
  };

  useEffect(() => {
    setTotalPrice(calculateTotal(items));
  }, [items]);

  const setArticleResourceAndPrice = (resourceItem: any) => {
    const article = resourceItem;
    setNewPartialTotal(calculateTotal([articleViewToItem(article)]));
    setItems([articleViewToItem(article)]);
    setTotalPrice(calculateTotal([articleViewToItem(article)]));
  };

  const setItemsAndCalculatePrice = (invItems: any) => {
    setItems(invItems);
    setTotalPrice(calculateTotal(invItems));
  };

  const createCreditArticleResource = (invoiceArg: InvoiceView) => {
    const article = [articleViewToItem(creditNoteArticleResource.data[0])];
    if (article[0].articleId !== invoiceArg.id) {
      const newItems = article.map((articleItem) => ({
        ...articleItem,
        unitAmount: {
          ...articleItem.unitAmount,
          netAmount:
            invoiceArg.totalAmount.netAmount >= 0
              ? -1 * invoiceArg.totalAmount.netAmount
              : invoiceArg.totalAmount.netAmount,
          grossAmount:
            invoiceArg.totalAmount.netAmount >= 0
              ? -1 * invoiceArg.totalAmount.grossAmount
              : invoiceArg.totalAmount.netAmount,
        },
      }));
      setItemsAndCalculatePrice(newItems);
    }
  };
  useEffect(() => {
    if (!invoice) {
      if (isPartial && isFetched) {
        if (!partialArticleResource.data.length) {
          createPartial();
        }
        setArticleResourceAndPrice(partialArticleResource.data[0]);
      } else if (isCreditNote && isFetchedCreditNoteArticle) {
        setArticleResourceAndPrice(creditNoteArticleResource.data[0]);
      } else if (!isPartial && !isCreditNote) {
        setItems([]);
      }
    } else if (invoice) {
      if (invoice.type === InvoiceType.FULL) {
        if (!isPartial && !isCreditNote) {
          const newItems = invoice.items.map(
            (i): InvoiceItemRecord<Amount> => ({
              articleId: i.article.id,
              description: i.description || i.article.description,
              name: i.name || i.article.name,
              articleUnit: i.article.unit,
              quantity: i.quantity,
              unitAmount: i.unitAmount,
            }),
          );
          setItemsAndCalculatePrice(newItems);
        } else if (isPartial && isFetched) {
          if (!partialArticleResource.data.length || !items.length) {
            createPartial();
          } else {
            const article = [articleViewToItem(partialArticleResource.data[0])];
            if (article[0].articleId !== invoice.id || !items.length) {
              const newItems = article.map((articleItem) => ({
                ...articleItem,
                unitAmount: {
                  ...articleItem.unitAmount,
                  netAmount:
                    invoice.totalAmount.netAmount >= 0
                      ? invoice.totalAmount.netAmount
                      : -1 * invoice.totalAmount.netAmount,
                  grossAmount:
                    invoice.totalAmount.netAmount >= 0
                      ? invoice.totalAmount.grossAmount
                      : -1 * invoice.totalAmount.netAmount,
                },
              }));
              setItemsAndCalculatePrice(newItems);
              if (invoice.partialInvoices && invoice.partialInvoices.length) {
                setNewPartialTotal(
                  invoice.totalAmount.netAmount /
                    10 ** invoice.totalAmount.fractionDigits!,
                );
              } else {
                setNewPartialTotal(calculateTotal(newItems));
              }
            }
          }
        } else if (
          (isCreditNote && isFetchedCreditNoteArticle) ||
          !items.length
        ) {
          createCreditArticleResource(invoice);
        }
      } else if (invoice.type === InvoiceType.PARTIAL) {
        if (isPartial && isFetched) {
          if (!partialArticleResource.data.length) {
            createPartial();
          } else {
            const newItems = invoice.items.map(
              (i): InvoiceItemRecord<Amount> => ({
                articleId: i.article.id,
                description: i.description || i.article.description,
                name: i.name || i.article.name,
                articleUnit: i.article.unit,
                quantity: i.quantity,
                unitAmount: invoice.totalAmount,
              }),
            );
            setNewPartialTotal(calculateTotal(newItems));
            setItemsAndCalculatePrice(newItems);
          }
        } else if (isCreditNote && isFetchedCreditNoteArticle) {
          createCreditArticleResource(invoice);
        } else if (!isPartial && !isCreditNote) {
          setItems([]);
        }
      } else if (invoice.type === InvoiceType.CREDIT_NOTE) {
        if (isCreditNote && isFetchedCreditNoteArticle) {
          createCreditArticleResource(invoice);
        } else if ((isPartial && isFetched) || !items.length) {
          if (!partialArticleResource.data.length) {
            createPartial();
          } else {
            const article = [articleViewToItem(partialArticleResource.data[0])];
            if (article[0].articleId !== invoice.id) {
              const newItems = article.map((articleItem) => ({
                ...articleItem,
                unitAmount: {
                  ...articleItem.unitAmount,
                  netAmount:
                    invoice.type === InvoiceType.CREDIT_NOTE
                      ? 0
                      : invoice.totalAmount.netAmount,
                  grossAmount:
                    invoice.type === InvoiceType.CREDIT_NOTE
                      ? 0
                      : invoice.totalAmount.netAmount,
                },
              }));
              setNewPartialTotal(calculateTotal(newItems));
              setItemsAndCalculatePrice(newItems);
            }
          }
        } else if (!isPartial && !isCreditNote) {
          setItems([]);
        }
      }
    }
  }, [
    isPartial,
    isCreditNote,
    createPartial,
    invoice?.type,
    isFetched,
    isFetchedCreditNoteArticle,
  ]);
  const renderHeader = () => (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '3ch minmax(24ch, 2fr) minmax(10ch, 16ch) repeat(2, minmax(6ch, 10ch)) minmax(12ch, 18ch)',
        placeItems: 'center start',
        gap: '.5em',
      }}>
      <FormLabel text="No" textTranslationContext="number" />
      <FormLabel text="Article Name" sx={{justifySelf: 'start'}} />
      <FormLabel text="Unit Price" sx={{textTransform: 'none'}} />
      <FormLabel text="Quantity" />
      <FormLabel text="Unit" />
      <Box>
        <FormLabel text="Total Price" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
    </Box>
  );
  const renderPartialHeader = () => (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '3ch minmax(24ch, 2fr) repeat(4, minmax(10ch, 16ch))',
        placeItems: 'center start',
        gap: '.5em',
      }}>
      <FormLabel text="No" />
      <FormLabel text="Article Name" sx={{justifySelf: 'start'}} />
      <Box>
        <FormLabel text="Total Payable" sx={{display: 'block'}} />
        <FormLabel text="(incl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Total Payable" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Pending" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Invoice Amount" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
    </Box>
  );
  const renderCreditNoteHeader = () => (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns: '3ch minmax(24ch, 2fr) minmax(16ch, 0.5fr)',
        placeItems: 'center start',
        gap: '.5em',
      }}>
      <FormLabel text="No" />
      <FormLabel text="Note name" sx={{justifySelf: 'start'}} />
      <FormLabel text="Total amount (excl VAT)" />
    </Box>
  );

  return (
    <Box mt="1em">
      <FormLabel text="Articles" />
      <Box
        bgcolor="grey.50"
        border="1px solid"
        borderColor="grey.300"
        borderRadius="4px"
        p=".5em">
        {isPartial
          ? renderPartialHeader()
          : isCreditNote
          ? renderCreditNoteHeader()
          : renderHeader()}
        <Box
          bgcolor="grey.50"
          borderRadius="4px"
          display="flex"
          flexDirection="column"
          my="1em"
          gap="1em">
          {items.map((item, index) => (
            <ArticleItemRow
              key={item.articleId}
              articleItem={item}
              index={index + 1}
              deleteItem={deleteItem}
              setItems={setItems}
              isPartial={isPartial}
              isCreditNote={isCreditNote}
              totalPrice={totalPrice}
              setTotalPrice={setTotalPrice}
              currencySymbol={
                isCreditNote ? getCurrencySymbol[currencyCode] : ''
              }
              partialPrice={partialPrice}
              setPartialPrice={setPartialPrice}
              newPartialTotal={newPartialTotal}
              setNewPartialTotal={setNewPartialTotal}
            />
          ))}
          {items.length ? (
            <>
              {!isPartial && !isCreditNote && (
                <Button
                  label="Article"
                  buttonProps={{
                    variant: 'contained',
                    sx: {alignSelf: 'self-start'},
                    startIcon: <AddIcon />,
                    onClick: () => setIsArticleModalOpen(true),
                  }}
                />
              )}
              <Box borderTop="1px solid" borderColor="grey.300">
                <Box
                  p="1em"
                  pl="50%"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    justifyItems: 'end',
                  }}>
                  {isPartial && (
                    <>
                      <Typography mb=".5em">
                        {t('Total Amount')}
                        <Typography
                          variant="caption"
                          component="span"
                          ml="1ch"
                          sx={{color: 'text.secondary'}}>
                          {t('(excl VAT)')}
                        </Typography>
                      </Typography>

                      <Typography sx={{justifySelf: 'end'}}>
                        {formatCurrency(
                          isPartial ? newPartialTotal : totalPrice,
                          {
                            currency: currencyCode,
                          },
                        )}
                      </Typography>
                    </>
                  )}

                  <Typography>
                    {isPartial ? t('Partial Payment') : t('Total Price')}
                    <Typography
                      variant="caption"
                      component="span"
                      ml="1ch"
                      sx={{color: 'text.secondary'}}>
                      {t('(excl VAT)')}
                    </Typography>
                  </Typography>

                  <Typography>
                    {formatCurrency(isPartial ? partialPrice : totalPrice, {
                      currency: currencyCode,
                    })}
                  </Typography>
                  <Box>
                    <FormInput
                      props={{
                        label: 'VAT',
                        value: percentageVat,
                        sx: {mt: '0.5em', width: '5rem'},
                        onChange: (e) =>
                          setPercentageVat(Number(e.target.value)),
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Typography>
                    {formatCurrency(
                      isPartial
                        ? partialPrice * (percentageVat / 100)
                        : totalPrice * (percentageVat / 100),
                      {
                        currency: currencyCode,
                      },
                    )}
                  </Typography>
                </Box>
                <Box
                  bgcolor="grey.700"
                  borderRadius="4px"
                  p="1em"
                  pl="50%"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    justifyItems: 'end',
                  }}>
                  <Typography sx={{color: 'primary.contrastText'}}>
                    {isPartial ? t('Invoice Amount') : t('Total Price')}
                    <Typography variant="caption" component="span" ml="1ch">
                      {t('(incl VAT)')}
                    </Typography>
                  </Typography>
                  <Typography sx={{color: 'primary.contrastText'}}>
                    {formatCurrency(
                      isPartial
                        ? partialPrice * (1 + percentageVat / 100)
                        : totalPrice * (1 + percentageVat / 100),
                      {
                        currency: currencyCode,
                      },
                    )}
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
              <ArticlesDataGrid search={search} setRowItem={handleSelectItem} />
            </TabsBody>
            <TabsBody value={tabValue} index={1}>
              <CustomPricesDataGrid
                search={search}
                setRowItem={handleSelectItem}
                propertyOwnerId={propertyOwnerId}
              />
            </TabsBody>
          </Tabs>
        </SelectModal>
      </Box>
    </Box>
  );
};
