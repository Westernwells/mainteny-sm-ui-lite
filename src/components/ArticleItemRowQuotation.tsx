import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {isEqual} from 'lodash';
import {
  Box,
  ClickAwayListener,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popover,
  Popper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {getIn, useFormik} from 'formik';
import {DiscountType} from 'models/invoice';
import {MeasurementUnit} from 'models/articleForm';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import {
  Currencies,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {ArticleType, ArticleView} from 'models/article';
import {ReactComponent as PackageIcon} from 'assets/icons/PackageIcon.svg';
import {ReactComponent as MaterialIcon} from 'assets/icons/MaterialIcon.svg';
import {ReactComponent as LaborIcon} from 'assets/icons/LaborIcon.svg';
import {ReactComponent as OtherIcon} from 'assets/icons/OtherIcon.svg';
import * as Yup from 'yup';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {createEmptyResource} from 'utils/paging';
import useHighlightText from 'hooks/useHighlightText';
import {
  calculatePackageMaterialLaborPercentages,
  getArticleTypeText,
  getArticleTypes,
} from 'utils/article-utils';
import {getItemTotalAfterPerItemDiscount} from 'utils/calculate-total';
import {QuotationItemRecord} from 'models/quotation';
import {DragIndicator, Receipt, ReceiptOutlined} from '@mui/icons-material';
import {useDebounce} from 'hooks/useDebounce';
import {usePropertyOwnerQueryTravelWorks} from 'hooks/reactQuery/useTravelWork';
import {ServiceOrderType} from 'models/service-order';
import {VatView} from 'models/vat';
import {PropertyOwnerView} from 'models/propertyManager';
import {stripHtmlTags} from 'models/text-block';
import {FormSelect} from './form/FormSelect';
import {TabItems, Tabs} from './Tab';
import {TabsBody} from './TabsBody';
import {EmptySection} from './EmptySection';
import ArticleTypeCard from './ArticleTypeCard';
import RichTextField from './RichTextField';
import {
  getPlainStringFromHtml,
  isPlainString,
} from '../utils/rich-field-string';

interface Props {
  articleItem: QuotationItemRecord;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItemAtIndex: (indexPos: number, item: QuotationItemRecord) => void;
  propertyOwner?: PropertyOwnerView | null;
  handleSelectItem: (row: ArticleView, indexPosition: number) => void;
  isHovered?: boolean;
  defaultPercentageVat?: number;
  taxRates: VatView[];
}

interface TableRowProps {
  index: number;
  item: ArticleView;
  searchText: string;
  handleSelectItem: (row: ArticleView, index: number) => void;
}

const createHighlightedText = (text: string, searchText: string) =>
  useHighlightText({
    text: text !== '' ? text : '-',
    highlight: searchText,
  });

const TableRowComponent = ({
  index,
  item,
  searchText,
  handleSelectItem,
}: TableRowProps) => {
  const itemName = isPlainString(item.name)
    ? item.name
    : getPlainStringFromHtml(item.name);
  const highlightedName = createHighlightedText(itemName, searchText);

  const highlightedExternalId = createHighlightedText(
    item.externalId,
    searchText,
  );

  const highlightedCategory = createHighlightedText(item.category, searchText);

  return (
    <TableRow
      key={item.id}
      sx={{width: '100%', cursor: 'pointer'}}
      onClick={() => {
        handleSelectItem(item, index);
      }}>
      <TableCell sx={{padding: '0.8em 0em !important', width: '30%'}}>
        <Typography variant="subtitle1">{highlightedName}</Typography>
      </TableCell>
      <TableCell sx={{width: '25%'}}>
        <Typography variant="subtitle1">
          <Typography variant="subtitle1">{highlightedExternalId}</Typography>
        </Typography>
      </TableCell>
      <TableCell sx={{width: '15%'}}>
        <Typography variant="subtitle1">{highlightedCategory}</Typography>
      </TableCell>
      <TableCell
        sx={{
          textAlign: 'right',
          padding: '2em 0em',
          width: '35%',
        }}>
        <Typography variant="subtitle1">
          {formatCurrency(
            (item.unitSellingAmount.netAmount ?? 0) /
              10 ** (item.unitSellingAmount.fractionDigits ?? 0),
            {
              currency: item.unitSellingAmount.currency,
            },
          )}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .test(
      'is-not-empty',
      'Article cannot be empty',
      (value) => !!stripHtmlTags(value || ''),
    )
    .required('Article cannot be empty'),
  article: Yup.object().shape({
    type: Yup.string().required('Article type is required'),
  }),
});

export const ArticleItemRowQuotation = ({
  articleItem,
  index,
  deleteItem,
  setItemAtIndex,
  propertyOwner,
  handleSelectItem,
  isHovered,
  defaultPercentageVat,
  taxRates,
}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );

  const {language: selectedLng} = useContext(LanguageContext);

  const formik = useFormik<QuotationItemRecord>({
    initialValues: {
      ...articleItem,
      quantity: articleItem.quantity !== 0 ? articleItem.quantity : 0,
      unitAmount: {
        ...articleItem.unitAmount,
        percentageVat:
          defaultPercentageVat !== undefined
            ? defaultPercentageVat
            : articleItem.unitAmount.percentageVat,
      },
    },
    onSubmit: () => {},
    validationSchema,
  });

  const price =
    (formik.values.unitAmount.netAmount ?? 0) /
    10 ** Currencies[formik.values.unitAmount.currency];

  const totalPriceExclVat = price * formik.values.quantity;
  const totalPriceExclVatAfterDiscount = getItemTotalAfterPerItemDiscount({
    item: {
      unitAmount: {
        netAmount: price,
      },
      quantity: formik.values.quantity,
      discount: formik.values.discount,
    },
  });

  useEffect(() => {
    if (!isEqual(articleItem, formik.values)) {
      setItemAtIndex(index, {
        ...formik.values,
        article: {
          ...formik.values.article,
          name: formik.values.name,
          type: formik.values.article?.type,
          unit: formik.values.article?.unit,
          unitSellingAmount: formik.values.unitAmount,
        },
        unitAmount: {
          ...formik.values.unitAmount,
          netAmount: fixRounding(
            price * 10 ** Currencies[formik.values.unitAmount.currency],
            2,
          ),
        },
      });
    }
  }, [formik.values]);

  const handleDiscountTypeChange = () => {
    formik.setFieldValue('discount', {
      ...formik.values.discount,
      type:
        formik.values?.discount?.type === DiscountType.AMOUNT
          ? DiscountType.PERCENTAGE
          : DiscountType.AMOUNT,
      amount: {
        value: 0,
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
      },
      percentage: 0,
    });
  };

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

  const [popperOpen, setPopperOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedText = useDebounce(searchText);
  const [tabValue, setTabValue] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [showArticleSearch, setShowArticleSearch] = useState<boolean>(false);
  const articleAnchorEl = useRef<HTMLDivElement>();
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.currentTarget.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTextFieldChange = (fieldName: string) => (value: string) => {
    formik.setFieldValue(fieldName, value);
    formik.setFieldTouched(fieldName, true, false);
    const plainText = getPlainStringFromHtml(value);
    if (isPlainString(plainText)) setSearchText(plainText);
  };

  const handleArticleTextFieldClick = () => {
    setShowArticleSearch(true);
    setPopperOpen(true);
  };

  const {
    data: articleResource = createEmptyResource<ArticleView>(30),
    isLoading: isArticleLoading,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 30,
      query: debouncedText,
      type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
    },
    {keepPreviousData: true, enabled: popperOpen && tabValue === 0},
  );

  // this is the api used on the custom prices tab
  const {
    data: travelWorksResource = [],
    isLoading: isTravelWorksResourceLoading,
  } = usePropertyOwnerQueryTravelWorks(
    propertyOwner?.id || '',
    {
      serviceOrderType: ServiceOrderType.GENERAL,
    },
    {
      keepPreviousData: true,
      enabled: popperOpen && tabValue === 1 && !!propertyOwner?.id,
    },
  );

  useEffect(() => {
    if (formik.values.article?.type === ArticleType.PACKAGE) {
      const {laborPercentage, materialPercentage} =
        calculatePackageMaterialLaborPercentages(
          articleItem.article?.costPackage ||
            articleItem.article?.additionalInfo?.costPackage,
        );

      formik.setFieldValue('article.costPackage', {
        ...formik.values.article?.costPackage,
        laborPercentage,
        materialPercentage,
      });
    }
  }, [formik.values.article?.type]);

  const handlePopperClose = () => {
    setShowArticleSearch(false);
  };

  const onChangePercentageVat = (event: SelectChangeEvent<string>) => {
    const vatId = event.target.value;
    const taxRate = taxRates.find((rate) => rate.id === vatId);
    formik.setFieldValue('unitAmount', {
      ...formik.values.unitAmount,
      vatId: taxRate?.id || '',
      vatName: taxRate?.name || '',
      percentageVat: taxRate?.percentage || 0,
    });
  };

  const tabItems: TabItems[] = useMemo(() => {
    const tItems = [
      {
        label: 'Articles & Spare parts',
        icon: <HomeRepairServiceIcon />,
      },
    ];
    if (propertyOwner?.id) {
      tItems.push({
        label: 'Custom prices',
        icon: <ReceiptLongIcon />,
      });
    }
    return tItems;
  }, [propertyOwner]);

  const columns: {name: string; align?: TableCellProps['align']}[] = [
    {name: 'Name'},
    {name: 'Article #'},
    {name: 'Category'},
    {name: 'Selling Price (excl. VAT)', align: 'right'},
  ];

  const renderTable = (data: ArticleView[], isDataLoading: boolean) => {
    if (data.length <= 0 || isDataLoading) {
      return (
        <EmptySection
          label="We couldn't find any articles & spare parts."
          containerStyle={{height: '100%', my: '2em'}}
          illustration="articles"
          labelStyle={{fontSize: '1.2rem', fontWeight: 400, color: '#8F9BB3'}}
        />
      );
    }

    return (
      <TableContainer
        sx={{
          overflowY: 'scroll',
          maxHeight: '290px',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#8F9BB380',
            borderRadius: '10px',
          },
        }}>
        <Table
          sx={{
            width: '100%',
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
          aria-label="articles table">
          <TableHead sx={{position: 'sticky', top: 0, background: '#FFFFFF'}}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  align={column.align || 'left'}
                  sx={{padding: '0.5em 0em!important'}}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.8rem"
                    py={1}>
                    {t(column.name)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRowComponent
                index={index}
                item={item}
                searchText={searchText}
                key={item.id}
                handleSelectItem={() => {
                  // if articleItem is the same as item it will not trigger a rerender and we need to set the fields manually
                  if (articleItem.article?.id === item.id) {
                    formik.setFieldValue('name', item.name);
                    formik.setFieldValue('description', item.description);
                  }
                  handleSelectItem(item, index);
                  setShowArticleSearch(false);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <TableCell
        sx={{width: '2%', display: 'inline-block', verticalAlign: 'top'}}>
        {index + 1}

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
      </TableCell>

      <TableCell sx={{width: '32%', display: 'inline-block'}}>
        <ClickAwayListener onClickAway={handlePopperClose}>
          <Box ref={articleAnchorEl}>
            <RichTextField
              test-id={`name-${index}`}
              html={formik.values.name || ''}
              updateHtml={handleTextFieldChange(`name`)}
              onBlur={(event) => {
                formik.setFieldTouched(`name`, true, false);
                formik.handleBlur(event);
              }}
              helperText={
                !isHovered &&
                getIn(formik.touched, `name`) &&
                getIn(formik.errors, `name`)
                  ? getIn(formik.errors, `name`)
                  : ''
              }
              error={
                !isHovered &&
                !!getIn(formik.touched, `name`) &&
                !!getIn(formik.errors, `name`)
              }
              onClick={handleArticleTextFieldClick}
            />

            <Box>
              <Popper
                open={showArticleSearch}
                placement="bottom-start"
                anchorEl={articleAnchorEl.current}
                sx={{width: '800px', zIndex: 10}}>
                <Paper
                  sx={{
                    maxHeight: '380px',
                    pl: 2,
                    pr: 0.7,
                    py: 2,
                    boxShadow: '0px 4px 15px 0px #90909033',
                  }}>
                  <div>
                    <Tabs
                      hideDivider
                      tabItems={tabItems}
                      currentIndex={tabValue}
                      onChange={(indexValue) => setTabValue(indexValue)}
                      isTextCap>
                      <TabsBody value={tabValue} index={0}>
                        {/* note filtering is done her b'cos the articleView ruturns all articles, including custom prices */}
                        {renderTable(
                          articleResource.data.filter(
                            (item) =>
                              !travelWorksResource.some(
                                (tw) => tw.article.id === item.id,
                              ),
                          ),
                          isArticleLoading || isTravelWorksResourceLoading,
                        )}
                      </TabsBody>
                      <TabsBody value={tabValue} index={1}>
                        {renderTable(
                          travelWorksResource.map((item) => item.article),
                          isTravelWorksResourceLoading,
                        )}
                      </TabsBody>
                    </Tabs>
                  </div>
                </Paper>
              </Popper>
            </Box>
          </Box>
        </ClickAwayListener>
      </TableCell>

      <TableCell sx={{width: '4%', display: 'inline-block'}}>
        <>
          <Tooltip
            title={t(getArticleTypeText(formik.values.article?.type!))}
            arrow
            placement="top">
            <Box
              onClick={handleClick}
              sx={{
                width: '100%',
                borderRadius: '4px',
                height: 41,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#00D1FF0A',
              }}
              tabIndex={0}>
              {formik.values.article?.type === ArticleType.PACKAGE ? (
                <PackageIcon fontSize="2rem" />
              ) : formik.values.article?.type === ArticleType.MATERIAL ? (
                <MaterialIcon fontSize="2rem" />
              ) : formik.values.article?.type === ArticleType.LABOR ? (
                <LaborIcon fontSize="2rem" />
              ) : (
                <OtherIcon fontSize="2rem" />
              )}
            </Box>
          </Tooltip>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{
              '& .MuiPaper-root': {
                width: '350px',
                minHeight: '250px',
                pt: 1,
                pb: 2,
                px: 3,
              },
            }}>
            <ArticleTypeCard
              formik={formik}
              unitPrice={price}
              handleClose={handleClose}
            />
          </Popover>
        </>
      </TableCell>

      <TableCell
        sx={{
          width: '14%',
          display: 'inline-block',
          '& .MuiTextField-root': {width: '100%'},
        }}>
        <NumericFormat
          name="unitAmount.netAmount"
          value={price !== 0 ? price : 0}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
              width: '100%',
            },
          }}
          min={0}
          max={Infinity}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currentCurrency.symbol}
              </InputAdornment>
            ),
          }}
          onValueChange={(values) => {
            const {floatValue} = values;
            if (floatValue) {
              formik.setFieldValue(
                'unitAmount.netAmount',
                floatValue *
                  10 ** Currencies[formik.values.unitAmount.currency],
              );
            } else {
              formik.setFieldValue('unitAmount.netAmount', 0);
            }
          }}
        />
      </TableCell>

      <TableCell sx={{width: '6%', display: 'inline-block'}}>
        <NumericFormat
          value={formik.values.quantity !== 0 ? formik.values.quantity : 0}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          onValueChange={(values) => {
            const {floatValue} = values;
            formik.setFieldValue('quantity', floatValue || 0);
          }}
          isAllowed={(values) => /^\d*\.?\d*$/g.test(values.value)}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 0,
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
              width: '100%',
            },
          }}
          InputProps={{
            name: 'quantity',
            id: `quantity-${index}`,
            inputMode: 'numeric',
          }}
        />
      </TableCell>

      <TableCell sx={{width: '6%', display: 'inline-block'}}>
        <FormControl fullWidth required={false}>
          <Select
            labelId={`select-tax-label-${index}`}
            size="small"
            value={
              formik.values.unitAmount.vatId ||
              String(
                formik.values.unitAmount.percentageVat !== 0
                  ? formik.values.unitAmount.percentageVat
                  : 0,
              ) ||
              ''
            }
            renderValue={(value) => {
              const taxRatePercentage = taxRates?.find(
                (item) => item.id === value,
              )?.percentage;

              return `${
                typeof taxRatePercentage === 'number'
                  ? taxRatePercentage
                  : value || 0
              }%`;
            }}
            name="unitAmount.vatId"
            id={`unitAmount.vatId-${index}`}
            notched
            onChange={onChangePercentageVat}
            onBlur={formik.handleBlur}
            IconComponent={() => null}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              slotProps: {
                paper: {
                  sx: {
                    maxWidth: '20rem',
                  },
                },
              },
            }}
            sx={{
              '& .MuiSelect-select': {
                textAlign: 'right',
                px: '5px !important',
              },
            }}>
            {taxRates?.map((taxRate) => (
              <MenuItem
                value={taxRate.id}
                key={taxRate.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}>
                <Box display="flex" maxWidth="100%" gap={1}>
                  <Typography variant="body1" noWrap color="primary.dark">
                    {taxRate.name}
                  </Typography>
                  <Tooltip title={taxRate.legalNote} arrow placement="top">
                    {taxRate.legalNote ? (
                      <Receipt fontSize="small" />
                    ) : (
                      <ReceiptOutlined fontSize="small" />
                    )}
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {taxRate.percentage}%
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      <TableCell sx={{width: '10%', display: 'inline-block'}}>
        <FormSelect
          labelId={`select-unit-label-${index}`}
          label=""
          options={Object.keys(MeasurementUnit).map((item) => ({
            label: item,
            value: item,
          }))}
          resetOption={{label: t('Select Unit')}}
          selectProps={{
            value: formik.values.article?.unit ?? '',
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            placeholder: t('Select Unit'),
            name: 'article.unit',
            sx: {width: '100%'},
            error: !!(
              formik.values.name !== '' && getIn(formik.errors, 'article.unit')
            ),
          }}
          errorText={
            formik.values.name !== '' ||
            (getIn(formik.touched, `article.unit`) &&
              getIn(formik.errors, `article.unit`))
              ? getIn(formik.errors, `article.unit`)
              : undefined
          }
        />
      </TableCell>

      {/* DISCOUNT */}
      <TableCell sx={{width: '9%', display: 'inline-block'}}>
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
                ? totalPriceExclVat
                : 100;

            return floatValue <= maxDiscount;
          }}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 0,
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment
                component={IconButton}
                position="end"
                sx={{
                  py: 2,
                  height: '100%',
                  bgcolor: 'action.hover',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  width: '20%',
                }}
                onClick={handleDiscountTypeChange}
                size="small">
                {formik.values.discount?.type === DiscountType.AMOUNT
                  ? currentCurrency.symbol
                  : '%'}
              </InputAdornment>
            ),
          }}
          onValueChange={handleDiscountValueChange}
        />
      </TableCell>

      <TableCell sx={{width: '15%', display: 'inline-block'}}>
        <NumericFormat
          value={totalPriceExclVatAfterDiscount}
          customInput={TextField}
          decimalScale={2}
          fixedDecimalScale
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          disabled
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
            },
          }}
        />
      </TableCell>

      <TableCell
        sx={{
          paddingLeft: '0px !important',
          paddingRight: '0px !important',
          display: 'inline-block',
          paddingTop: '0.5em !important',
          width: '2%',
        }}>
        <IconButton
          onClick={() => deleteItem(index)}
          sx={{
            padding: '0px !important',
          }}>
          <DeleteIcon />
        </IconButton>
      </TableCell>

      {showDescription ? (
        <>
          <TableCell colSpan={12} sx={{display: 'inline-block', ml: '2%'}}>
            <RichTextField
              label="Description"
              test-id={`description-${index}`}
              placeholder="Description"
              html={formik.values.description || ''}
              minRows={1}
              updateHtml={(h) => formik.setFieldValue('description', h)}
              fieldsetStyles={{
                maxWidth: '63.5%',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            />
          </TableCell>

          <TableCell
            colSpan={12}
            sx={{width: '98%', display: 'inline-block', ml: '2%'}}>
            <Button
              label="Remove Description"
              buttonProps={{
                variant: 'text',
                size: 'small',
                onClick: () => {
                  formik.setFieldValue('description', '');
                  setShowDescription(false);
                },
                sx: {
                  color: 'error.main',
                  fontWeight: 300,
                  px: 0,
                },
              }}
            />
          </TableCell>
        </>
      ) : (
        <TableCell
          colSpan={12}
          sx={{width: '98%', display: 'inline-block', ml: '2%'}}>
          <Button
            label="Add Description"
            buttonProps={{
              variant: 'text',
              size: 'small',
              onClick: () => setShowDescription(true),
              sx: {
                color: 'text.secondary',
                fontWeight: 300,
                px: 0,
              },
            }}
          />
        </TableCell>
      )}
    </>
  );
};
