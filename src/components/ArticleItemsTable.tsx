import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
  getCurrencySymbol,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {LanguageContext} from 'context/LanguageProvider';
import {calculateInvoiceTotal, calculateTotal} from 'utils/calculate-total';
import {getArticleTypes, getItemRecord} from 'utils/article-utils';
import {fixRounding} from 'utils/utils';
import {NumericFormat} from 'react-number-format';
import {TextField} from '@mui/material';
import {ArticleItemRow} from './ArticleItemRow';
import {Button} from './Button';
import {FormLabel} from './form/FormLabel';
import {SelectModal} from './SelectModal';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {CustomPricesDataGrid} from './DataGrid/CustomPricesDataGrid';
import {SelectButton} from './SelectButton';
import {SearchInput} from './SearchInput';

interface Props<T> {
  invoice?: InvoiceView | undefined;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  propertyOwnerId: string;
  isPartial?: boolean;
  isCreditNote?: boolean;
  unitSellingAmount?: Amount;
  formType?: string;
  orderPartialInvoices?: InvoiceView[];
}

export const ArticleItemsTable = ({
  invoice,
  items,
  setItems,
  propertyOwnerId,
  isPartial,
  isCreditNote,
  unitSellingAmount,
  formType,
  orderPartialInvoices,
}: Props<QuotationItemRecord | InvoiceItemRecord>) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const currencyCode =
    unitSellingAmount && isCreditNote
      ? unitSellingAmount.currency
      : currentCurrency.code;

  const {user} = useUserSession();

  const [percentageVat, setPercentageVat] = useState(
    invoice?.totalAmount?.percentageVat ??
      user?.userAccount?.serviceCompany?.settings?.percentageVat ??
      0,
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
      type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
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
      type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
    },
    {},
    true,
  );

  const {mutate: createPartial} = useCreatePartialArticle();

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [partialPrice, setPartialPrice] = useState<number>(0);

  const [newPartialTotal, setNewPartialTotal] = useState(0);

  const [partialInvoiceTotal, setPartialInvoiceTotal] = useState(0);

  const {language: selectedLng} = useContext(LanguageContext);

  const articleViewToItem = (
    article: ArticleView,
  ): QuotationItemRecord | InvoiceItemRecord => {
    const record = {
      article,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
      type: article.type,
      id: article.id || '',
    };
    return getItemRecord(record, percentageVat);
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

  useEffect(() => {
    if (orderPartialInvoices) {
      setPartialInvoiceTotal(calculateInvoiceTotal(orderPartialInvoices));
    }
  }, [orderPartialInvoices]);

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
    if (article[0].article?.id !== invoiceArg.id) {
      const newItems = article.map((articleItem) => ({
        ...articleItem,
        unitAmount: {
          ...articleItem.unitAmount,
          netAmount:
            (invoiceArg.totalAmount?.netAmount ?? 0) >= 0
              ? -1 * (invoiceArg.totalAmount?.netAmount ?? 0)
              : invoiceArg.totalAmount.netAmount,
          grossAmount:
            (invoiceArg.totalAmount?.netAmount ?? 0) >= 0
              ? -1 * (invoiceArg.totalAmount?.grossAmount ?? 0)
              : invoiceArg.totalAmount.netAmount,
        },
      }));
      setItemsAndCalculatePrice(newItems);
    }
  };

  const setFinalAndFullArticles = (invoiceArg: InvoiceView) => {
    const newItems = invoiceArg.items.map(
      (i): InvoiceItemRecord => ({
        article: i.article,
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        unitAmount: i.unitAmount,
      }),
    );
    setItemsAndCalculatePrice(newItems);
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
      } else if (
        !isCreditNote &&
        !isPartial &&
        formType === 'new' &&
        !items.length
      ) {
        setItems([]);
      }
    } else if (invoice) {
      if (
        invoice.type === InvoiceType.FINAL ||
        invoice.type === InvoiceType.FULL
      ) {
        if (!isPartial && !isCreditNote) {
          setFinalAndFullArticles(invoice);
        } else if (isPartial && isFetched) {
          if (!partialArticleResource.data.length || !items.length) {
            createPartial();
          } else {
            const article = [articleViewToItem(partialArticleResource.data[0])];
            if (article[0].article?.id !== invoice.id || !items.length) {
              const newItems = article.map((articleItem) => ({
                ...articleItem,
                unitAmount: {
                  ...articleItem.unitAmount,
                  netAmount:
                    (invoice.totalAmount?.netAmount ?? 0) >= 0
                      ? invoice.totalAmount?.netAmount ?? 0
                      : -1 * (invoice.totalAmount?.netAmount ?? 0),
                  grossAmount:
                    (invoice.totalAmount?.netAmount ?? 0) >= 0
                      ? invoice.totalAmount?.grossAmount ?? 0
                      : -1 * (invoice.totalAmount?.netAmount ?? 0),
                },
              }));
              setItemsAndCalculatePrice(newItems);
              setNewPartialTotal(calculateTotal(newItems));
            }
          }
        } else if (isCreditNote && isFetchedCreditNoteArticle) {
          createCreditArticleResource(invoice);
        }
      } else if (invoice.type === InvoiceType.PARTIAL) {
        if (isPartial && isFetched) {
          if (!partialArticleResource.data.length) {
            createPartial();
          } else {
            const newItems = invoice.items.map(
              (i): InvoiceItemRecord => ({
                article: i.article,
                name: i.name,
                description: i.description,
                quantity: i.quantity,
                unitAmount: i.unitAmount,
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
          setItems(
            invoice?.items.map(
              (i): InvoiceItemRecord => ({
                article: i.article,
                name: i.name,
                description: i.description,
                quantity: i.quantity,
                unitAmount: {
                  ...i.unitAmount,
                  netAmount:
                    (invoice.totalAmount?.netAmount ?? 0) >= 0
                      ? -1 * (invoice.totalAmount?.netAmount ?? 0)
                      : invoice.totalAmount?.netAmount ?? 0,
                },
              }),
            ),
          );
        } else if (isPartial && isFetched) {
          if (!partialArticleResource.data.length || !items.length) {
            createPartial();
          } else {
            const article = [articleViewToItem(partialArticleResource.data[0])];
            if (article[0].article?.id !== invoice.id) {
              const newItems = article.map((articleItem) => ({
                ...articleItem,
                unitAmount: {
                  ...articleItem.unitAmount,
                  netAmount:
                    invoice.type === InvoiceType.CREDIT_NOTE
                      ? 0
                      : invoice.totalAmount?.netAmount ?? 0,
                  grossAmount:
                    invoice.type === InvoiceType.CREDIT_NOTE
                      ? 0
                      : invoice.totalAmount?.netAmount ?? 0,
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
    isFetched,
    isFetchedCreditNoteArticle,
  ]);

  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        unitAmount: {
          ...item.unitAmount,
          percentageVat,
        },
      })),
    );
  }, [percentageVat]);

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
      <FormLabel text="No." textTranslationContext="number" />
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
      <FormLabel text="No." />
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
      <FormLabel text="No." />
      <FormLabel text="Description" sx={{justifySelf: 'start'}} />
      <FormLabel text="Total Amount (Excl VAT)" />
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
              key={index + (item.article?.id || item.name)}
              articleItem={item}
              index={index}
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
              partialInvoiceTotal={partialInvoiceTotal}
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
                        {isPartial
                          ? formatCurrency(newPartialTotal, {
                              currency: currentCurrency.code,
                            })
                          : formatCurrency(totalPrice, {
                              currency: currentCurrency.code,
                            })}
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
                    {isPartial
                      ? formatCurrency(partialPrice, {
                          currency: currentCurrency.code,
                        })
                      : formatCurrency(totalPrice, {
                          currency: currentCurrency.code,
                        })}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: '0.75em',
                    }}>
                    <FormLabel text="VAT" sx={{paddingRight: '1em'}} />
                    <NumericFormat
                      value={percentageVat !== 0 ? percentageVat : ''}
                      customInput={TextField}
                      suffix="%"
                      allowLeadingZeros={false}
                      decimalScale={2}
                      decimalSeparator={getDecimalSeparator(selectedLng)}
                      thousandSeparator={getThousandsSeparator(selectedLng)}
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        min: 0,
                        max: Infinity,
                        step: '0.05',
                        label: 'VAT',
                      }}
                      sx={{
                        width: '120px',
                        letterSpacing: '0.02em',
                        maxWidth: '150px',
                      }}
                      size="small"
                      onValueChange={(values) => {
                        const {floatValue} = values;
                        if (floatValue) {
                          setPercentageVat(floatValue);
                        } else {
                          setPercentageVat(0);
                        }
                      }}
                    />
                  </Box>
                  <Typography sx={{paddingTop: '0.75em'}}>
                    {isPartial
                      ? formatCurrency(
                          fixRounding(partialPrice * (percentageVat / 100), 2),
                          {
                            currency: currentCurrency.code,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            roundingMode: 'floor',
                          },
                        )
                      : formatCurrency(
                          fixRounding(totalPrice * (percentageVat / 100), 2),
                          {
                            currency: currentCurrency.code,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            roundingMode: 'floor',
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
                    {isPartial
                      ? formatCurrency(
                          fixRounding(
                            partialPrice * (1 + percentageVat / 100),
                            2,
                          ),
                          {
                            currency: currentCurrency.code,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            roundingMode: 'floor',
                          },
                        )
                      : formatCurrency(
                          fixRounding(
                            totalPrice * (1 + percentageVat / 100),
                            2,
                          ),
                          {
                            currency: currentCurrency.code,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            roundingMode: 'floor',
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
    </Box>
  );
};
