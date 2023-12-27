import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
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
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {InvoiceItemRecord, InvoiceView} from 'models/invoice';
import {Amount} from 'models/misc';
import {ArticleView} from 'models/article';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {LanguageContext} from 'context/LanguageProvider';
import {calculateTotal} from 'utils/calculate-total';
import {getItemRecord} from 'utils/article-utils';
import {fixRounding} from 'utils/utils';
import {NumericFormat} from 'react-number-format';
import {Button} from './Button';
import {FormLabel} from './form/FormLabel';
import {SelectModal} from './SelectModal';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {CustomPricesDataGrid} from './DataGrid/CustomPricesDataGrid';
import {SelectButton} from './SelectButton';
import {SearchInput} from './SearchInput';
import {ArticleItemRowNEW} from './ArticleItemRowNEW';

interface Props<T> {
  invoice?: InvoiceView | undefined;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  propertyOwnerId: string;
  formType?: string;
}

export const ArticleItemsTableNEW = ({
  invoice,
  items,
  setItems,
  propertyOwnerId,
  formType,
}: Props<InvoiceItemRecord<Amount>>) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const {user} = useUserSession();
  const [percentageVat, setPercentageVat] = useState(
    user?.userAccount?.serviceCompany?.settings?.percentageVat ?? 0,
  );
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // const [totalPrice, setTotalPrice] = useState(0);
  const totalPrice = calculateTotal(items);
  console.log('🚀 ~ file: ArticleItemsTableNEW.tsx:76 ~ items:', items);

  const {language: selectedLng} = useContext(LanguageContext);

  const articleViewToItem = (
    article: ArticleView,
  ): InvoiceItemRecord<Amount> => {
    const record: InvoiceItemRecord<Amount> = {
      // articleId: article.id,
      // articleUnit: article.unit,
      article,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
      // type: article.type,
      // costPackage: article.additionalInfo?.costPackage,
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

  // useEffect(() => {
  //   setTotalPrice(calculateTotal(items));
  // }, [items]);

  const setItemsAndCalculatePrice = (invItems: InvoiceItemRecord<Amount>[]) => {
    setItems(invItems);
    // setTotalPrice(calculateTotal(invItems));
  };

  const setFinalArticles = () => {
    const newItems = invoice?.items.map(
      (i): InvoiceItemRecord<Amount> => ({
        // articleId: i.article.id,
        article: i.article,
        description: i.description || i.article.description,
        name: i.name || i.article.name,
        // articleUnit: i.article.unit,
        quantity: i.quantity,
        unitAmount: i.unitAmount,
      }),
    );
    setItemsAndCalculatePrice(newItems || []);
  };

  useEffect(() => {
    if (!invoice) {
      if (formType === 'new' && !items.length) {
        setItems([]);
      }
      return;
    }
    setFinalArticles();
  }, []);

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

  // const renderHeader = () => (
  //   <Box
  //     px=".5em"
  //     sx={{
  //       display: 'grid',
  //       gridTemplateColumns:
  //         '3ch minmax(24ch, 2fr) minmax(10ch, 16ch) repeat(2, minmax(6ch, 10ch)) minmax(12ch, 18ch)',
  //       placeItems: 'center start',
  //       gap: '.5em',
  //     }}>
  //     <FormLabel text="No." textTranslationContext="number" />
  //     <FormLabel text="Article Name" sx={{justifySelf: 'start'}} />
  //     <FormLabel text="Unit Price" sx={{textTransform: 'none'}} />
  //     <FormLabel text="Quantity" />
  //     <FormLabel text="Unit" />
  //     <Box>
  //       <FormLabel text="Total Price" sx={{display: 'block'}} />
  //       <FormLabel text="(excl VAT)" />
  //     </Box>
  //   </Box>
  // );
  // const renderPartialHeader = () => (
  //   <Box
  //     px=".5em"
  //     sx={{
  //       display: 'grid',
  //       gridTemplateColumns:
  //         '3ch minmax(24ch, 2fr) repeat(4, minmax(10ch, 16ch))',
  //       placeItems: 'center start',
  //       gap: '.5em',
  //     }}>
  //     <FormLabel text="No." />
  //     <FormLabel text="Article Name" sx={{justifySelf: 'start'}} />
  //     <Box>
  //       <FormLabel text="Total Payable" sx={{display: 'block'}} />
  //       <FormLabel text="(incl VAT)" />
  //     </Box>
  //     <Box>
  //       <FormLabel text="Total Payable" sx={{display: 'block'}} />
  //       <FormLabel text="(excl VAT)" />
  //     </Box>
  //     <Box>
  //       <FormLabel text="Pending" sx={{display: 'block'}} />
  //       <FormLabel text="(excl VAT)" />
  //     </Box>
  //     <Box>
  //       <FormLabel text="Invoice Amount" sx={{display: 'block'}} />
  //       <FormLabel text="(excl VAT)" />
  //     </Box>
  //   </Box>
  // );
  // const renderCreditNoteHeader = () => (
  //   <Box
  //     px=".5em"
  //     sx={{
  //       display: 'grid',
  //       gridTemplateColumns: '3ch minmax(24ch, 2fr) minmax(16ch, 0.5fr)',
  //       placeItems: 'center start',
  //       gap: '.5em',
  //     }}>
  //     <FormLabel text="No." />
  //     <FormLabel text="Description" sx={{justifySelf: 'start'}} />
  //     <FormLabel text="Total Amount (Excl VAT)" />
  //   </Box>
  // );

  const columns: {name: string; align?: TableCellProps['align']}[] = [
    {name: '#'},
    {name: 'Name'},
    {name: 'Unit Price'},
    {name: 'Quantity', align: 'right'},
    {name: 'VAT (%)', align: 'right'},
    {name: 'Unit'},
    {name: 'Discount'},
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
      p={2}>
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
              // color: 'text.secondary',
              // typography: 'caption',
            },
            // '& .MuiOutlinedInput-notchedOutline': {
            //   // borderColor: '#E4E9F2',
            //   borderColor: '#ff0000',
            // },
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
                // colSpan={column === columns[1] ? 3 : 1}
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
                setItems={setItems}
              />
            ))}
            {/* {rows.map((row) => (
              <TableRow key={row.desc}>
                <TableCell>{row.desc}</TableCell>
                <TableCell align="right">{row.qty}</TableCell>
                <TableCell align="right">{row.unit}</TableCell>
                <TableCell align="right">{ccyFormat(row.price)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>Subtotal</TableCell>
              <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tax</TableCell>
              <TableCell align="right">{`${(TAX_RATE * 100).toFixed(
                0,
              )} %`}</TableCell>
              <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
      {/* {isPartial
        ? renderPartialHeader()
        : isCreditNote
        ? renderCreditNoteHeader()
        : renderHeader()} */}
      {/* <Box
        // px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns:
            '3ch minmax(24ch, 2fr) minmax(10ch, 16ch) repeat(2, minmax(6ch, 10ch)) minmax(12ch, 18ch)',
          placeItems: 'center start',
          gap: '.5em',
        }}>
        <FormLabel text="#" textTranslationContext="number" />
        <FormLabel text="Article Name" sx={{justifySelf: 'start'}} />
        <FormLabel text="Unit Price" sx={{textTransform: 'none'}} />
        <FormLabel text="Quantity" />
        <FormLabel text="Unit" />
        <Box>
          <FormLabel text="Total Price" sx={{display: 'block'}} />
          <FormLabel text="(excl VAT)" />
        </Box>
      </Box> */}
      <Box
        // bgcolor="grey.50"
        borderRadius="4px"
        display="flex"
        flexDirection="column"
        my="1em"
        gap="1em">
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
            <Box borderTop="1px solid" borderColor="grey.300">
              {/* <TableContainer>
                <Table
                  sx={{
                    minWidth: 700,
                    // [`& .${tableCellClasses.root}`]: {
                    //   p: 0,
                    //   px: 0.5,
                    //   borderBottom: 'none',
                    //   borderSpacing: '0 1rem',
                    // },
                    // [`& .${tableCellClasses.head}`]: {
                    //   p: 0,
                    //   px: 0.5,
                    //   color: 'text.secondary',
                    //   typography: 'caption',
                    // },
                    // [`& .${tableCellClasses.body}`]: {
                    //   p: 0,
                    //   px: 0.5,
                    //   // color: 'text.secondary',
                    //   // typography: 'caption',
                    // },
                    // // '& .MuiOutlinedInput-notchedOutline': {
                    // //   // borderColor: '#E4E9F2',
                    // //   borderColor: '#ff0000',
                    // // },
                    // '& .MuiOutlinedInput-root': {
                    //   fieldset: {
                    //     borderColor: '#E4E9F2',
                    //   },
                    // },
                  }}
                  aria-label="spanning table"> */}
              {/* <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        // colSpan={column === columns[1] ? 3 : 1}
                        <TableCell
                          key={column.name}
                          align={column.align || 'left'}>
                          {t(column.name)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead> */}
              {/* <TableBody> */}
              {/* {items.map((item, index) => (
                      <ArticleItemRowNEW
                        key={index + item.articleId}
                        articleItem={item}
                        index={index}
                        deleteItem={deleteItem}
                        setItems={setItems}
                      />
                    ))} */}
              {/* <TableRow>
                      <TableCell rowSpan={3} />
                      <TableCell colSpan={4} />
                      <TableCell colSpan={2}>Subtotal</TableCell>
                      <TableCell align="right">610</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax</TableCell>
                      <TableCell align="right">23%</TableCell>
                      <TableCell align="right">420</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell align="right">9000</TableCell>
                    </TableRow> */}
              {/* {rows.map((row) => (
              <TableRow key={row.desc}>
                <TableCell>{row.desc}</TableCell>
                <TableCell align="right">{row.qty}</TableCell>
                <TableCell align="right">{row.unit}</TableCell>
                <TableCell align="right">{ccyFormat(row.price)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>Subtotal</TableCell>
              <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tax</TableCell>
              <TableCell align="right">{`${(TAX_RATE * 100).toFixed(
                0,
              )} %`}</TableCell>
              <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
            </TableRow> */}
              {/* </TableBody>
                </Table>
              </TableContainer> */}
              <Box
                p={2}
                pt={3}
                pl="50%"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  justifyItems: 'end',
                  gap: 1,
                }}>
                {/* <Typography>
                  {t('Total Price')} */}
                <Typography variant="body2" color="text.secondary">
                  {t('Subtotal (excl. VAT)')}
                </Typography>
                {/* </Typography> */}

                <Typography variant="body2" color="primary.dark">
                  {formatCurrency(totalPrice, {
                    currency: currentCurrency.code,
                  })}
                </Typography>
                <Button
                  label="Add Article"
                  buttonProps={{
                    variant: 'contained',
                    sx: {alignSelf: 'self-start'},
                    startIcon: <AddIcon />,
                    onClick: () => setIsArticleModalOpen(true),
                  }}
                />
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
                    decimalSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                    }
                    thousandSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                    }
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
                  {formatCurrency(
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
                  {t('Total Price')}
                  <Typography variant="caption" component="span" ml="1ch">
                    {t('(incl VAT)')}
                  </Typography>
                </Typography>
                <Typography sx={{color: 'primary.contrastText'}}>
                  {formatCurrency(
                    fixRounding(totalPrice * (1 + percentageVat / 100), 2),
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
  );
};
