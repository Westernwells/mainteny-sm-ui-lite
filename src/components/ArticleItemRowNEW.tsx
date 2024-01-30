import React, {useContext, useEffect, useMemo, useState} from 'react';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {isEqual} from 'lodash';
import {
  IconButton,
  TableCell,
  TableRow,
  TextField,
  InputAdornment,
  Box,
  Popover,
  Typography,
  Paper,
  Popper,
  Table,
  TableBody,
  TableContainer,
  ClickAwayListener,
  TableCellProps,
  TableHead,
  tableCellClasses,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {useFormik} from 'formik';
import {DiscountType, InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {MeasurementUnit} from 'models/articleForm';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {ArticleType, ArticleView} from 'models/article';
import {ReactComponent as PackageIcon} from 'assets/icons/PackageIcon.svg';
import {ReactComponent as MaterialIcon} from 'assets/icons/MaterialIcon.svg';
import {ReactComponent as LaborIcon} from 'assets/icons/LaborIcon.svg';
import * as Yup from 'yup';
import {
  useArticles,
  usePropertyOwnerArticles,
} from 'hooks/reactQuery/useArticle';
import {createEmptyResource} from 'utils/paging-utils';
import useHighlightText from 'hooks/useHighlightText';
import {getArticleTypeText} from 'utils/article-utils';
import {FormSelect} from './form/FormSelect';
import {TabItems, Tabs} from './Tab';
import {TabsBody} from './TabsBody';
import {EmptySection} from './EmptySection';
import ArticleTypeCard from './ArticleTypeCard';

interface Props {
  articleItem: InvoiceItemRecord<Amount>;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItemAtIndex: (indexPos: number, item: InvoiceItemRecord<Amount>) => void;
  propertyOwnerId: string;
  handleSelectItem: (row: ArticleView, indexPosition: number) => void;
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
  const highlightedName = createHighlightedText(item.name, searchText);

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
        <Typography variant="subtitle1">{highlightedExternalId}</Typography>
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
  name: Yup.string().required('Article cannot be empty'),
});

export const ArticleItemRowNEW = ({
  articleItem,
  index,
  deleteItem,
  setItemAtIndex,
  propertyOwnerId,
  handleSelectItem,
}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );

  const {language: selectedLng} = useContext(LanguageContext);

  const formik = useFormik<InvoiceItemRecord<Amount>>({
    initialValues: articleItem,
    onSubmit: () => {},
    validationSchema,
  });

  const price =
    formik.values.unitAmount.netAmount /
    10 ** formik.values.unitAmount.fractionDigits!;

  const totalPriceExclVat = price * formik.values.quantity;
  const totalPriceExclVatAfterDiscount = applyDiscount({
    actualValue: price * formik.values.quantity,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
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
            price * 10 ** formik.values.unitAmount.fractionDigits,
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.currentTarget.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const {name, value} = event.target;
    formik.handleChange(event);
    formik.setFieldTouched(name, true, false);
    setSearchText(value);
  };

  const handleTextFieldClick = () => {
    setFocusedIndex(index);
    setPopperOpen((prevState) => !prevState);
  };

  const {
    data: articleResource = createEmptyResource<ArticleView>(30),
    isLoading: isArticleLoading,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 30,
      query: searchText,
    },
    {keepPreviousData: true, enabled: popperOpen && tabValue === 0},
  );

  const {
    data: customArticleResource = createEmptyResource<ArticleView>(30),
    isLoading: isCustomPriceLoading,
  } = usePropertyOwnerArticles(
    propertyOwnerId,
    {
      pageIndex: 0,
      pageSize: 100,
      query: searchText,
    },
    {
      keepPreviousData: true,
      enabled: popperOpen && tabValue === 1 && !!propertyOwnerId,
    },
  );

  useEffect(() => {
    const defaultPackageValues = {
      laborPercentage:
        formik.values.article?.type === ArticleType.PACKAGE
          ? articleItem.article?.costPackage?.laborPercentage || 50
          : 0,
      materialPercentage:
        formik.values.article?.type === ArticleType.PACKAGE
          ? articleItem.article?.costPackage?.materialPercentage! || 50
          : 0,
    };
    formik.setFieldValue('article.costPackage', {
      ...formik.values.article?.costPackage,
      ...defaultPackageValues,
    });
  }, [formik.values.article?.type]);

  useEffect(() => {
    if (focusedIndex !== null && focusedIndex === index) {
      setSearchText(formik.values.name);
    }
  }, [formik.values.name, focusedIndex, index]);

  const handlePopperClose = () => {
    setPopperOpen(false);
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
          aria-label="spanning table">
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
                  handleSelectItem(item, index);
                  setPopperOpen(false);
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
      <TableRow sx={{verticalAlign: 'top'}}>
        <TableCell sx={{width: '1%'}}>{index + 1}</TableCell>

        <TableCell sx={{width: '35%'}}>
          <ClickAwayListener onClickAway={handlePopperClose}>
            <Box>
              <TextField
                name="name"
                id={`name-${index}`}
                value={formik.values.name}
                onChange={handleTextFieldChange}
                onBlur={formik.handleBlur}
                size="small"
                fullWidth
                sx={{width: '100%'}}
                required
                helperText={
                  formik.errors.name && formik.touched.name
                    ? formik.errors.name
                    : ''
                }
                error={!!(formik.errors.name && formik.touched.name)}
                autoComplete="off"
                onClick={handleTextFieldClick}
              />
              <Box>
                <Popper
                  open={popperOpen}
                  placement="bottom-start"
                  anchorEl={
                    popperOpen ? document.getElementById(`name-${index}`) : null
                  }
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
                          {renderTable(articleResource.data, isArticleLoading)}
                        </TabsBody>
                        <TabsBody value={tabValue} index={1}>
                          {renderTable(
                            customArticleResource.data,
                            isCustomPriceLoading,
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

        <TableCell sx={{width: '4%'}}>
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
                ) : (
                  <LaborIcon fontSize="2rem" />
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

        <TableCell sx={{width: '14%', '& .MuiTextField-root': {width: '100%'}}}>
          <NumericFormat
            value={price !== 0 ? price : 0}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
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
                  floatValue * 10 ** formik.values.unitAmount.fractionDigits,
                );
              } else {
                formik.setFieldValue('unitAmount.netAmount', 0);
              }
            }}
          />
        </TableCell>

        <TableCell sx={{width: '6%'}}>
          <NumericFormat
            value={formik.values.quantity !== 0 ? formik.values.quantity : 0}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
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

        <TableCell sx={{width: '6%'}}>
          <NumericFormat
            value={
              formik.values.unitAmount.percentageVat !== 0
                ? formik.values.unitAmount.percentageVat
                : 0
            }
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
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
              },
            }}
            isAllowed={(values) => {
              const {floatValue} = values;
              if (!floatValue) {
                return true;
              }

              if (floatValue < 0) {
                return false;
              }

              const maxValue = 100;

              return floatValue <= maxValue;
            }}
            InputProps={{
              name: 'unitAmount.percentageVat',
              id: `unitAmount.percentageVat-${index}`,
              inputMode: 'numeric',
            }}
            onValueChange={(values) => {
              const {floatValue} = values;
              formik.setFieldValue('unitAmount.percentageVat', floatValue || 0);
            }}
            size="small"
          />
        </TableCell>

        <TableCell sx={{width: '10%'}}>
          <FormSelect
            labelId={`select-unit-label-${index}`}
            label=""
            options={Object.keys(MeasurementUnit).map((item) => ({
              label: item,
              value: item,
            }))}
            selectProps={{
              value: formik.values.article?.unit ?? '',
              onChange: formik.handleChange,
              placeholder: t('Select Unit'),
              name: 'article.unit',
              sx: {width: '100%'},
              required: true,
              error:
                !formik.values.article?.unit ||
                !MeasurementUnit[
                  formik.values.article?.unit as MeasurementUnit
                ],
            }}
          />
        </TableCell>

        {/* DISCOUNT */}
        <TableCell sx={{width: '9%'}}>
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
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
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

        <TableCell sx={{width: '15%'}}>
          <NumericFormat
            value={totalPriceExclVatAfterDiscount}
            customInput={TextField}
            decimalScale={2}
            fixedDecimalScale
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
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
            display: 'flex !important',
            paddingTop: '0.5em !important',
          }}>
          <IconButton
            onClick={() => deleteItem(index)}
            sx={{
              padding: '0px !important',
            }}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {showDescription ? (
        <>
          <TableRow>
            <TableCell />
            <TableCell colSpan={12}>
              <TextField
                name="description"
                id={`description-${index}`}
                size="small"
                placeholder={t('Description')}
                multiline
                fullWidth
                value={formik.values.description}
                minRows={1}
                maxRows={10}
                onChange={formik.handleChange}
                sx={{mt: 0.5}}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell colSpan={7}>
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
          </TableRow>
        </>
      ) : (
        <TableRow>
          <TableCell />
          <TableCell colSpan={7}>
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
        </TableRow>
      )}
    </>
  );
};
