import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Typography,
  IconButton,
  Tooltip,
  Box,
  InputAdornment,
  TextField,
  FormControl,
  MenuItem,
  Select,
  Popover,
} from '@mui/material';
import {Controller, Path, UseFormReturn, useWatch} from 'react-hook-form';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {FormSelect} from 'components/form/FormSelect';
import NewArticleAutoComplete from 'components/NewArticleAutocomplete';
import {MeasurementUnit, createMeasurementOptions} from 'models/articleForm';
import {t} from 'i18next';
import {QuotationFormData, EditableQuotationItem} from 'models/quotation';
import {ACTION_CELL_WIDTH} from 'models/table';
import {LanguageContext} from 'context/LanguageProvider';
import TableCell from 'components/Table/TableCell';
import {Receipt, ReceiptOutlined, NoteAltOutlined} from '@mui/icons-material';
import {removeHtmlTags} from 'utils/rich-field-string';
import DOMPurify from 'dompurify';
import {ArticleType, ArticleView} from 'models/article';
import {DiscountType} from 'models/invoice';
import {NumericFormat} from 'react-number-format';
import {
  centsToMoney,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {calculateMargin, getArticleTypesWithLabels} from 'utils/article-utils';
import {Confirm} from 'components/Confirm';
import NewArticleTypeCard from 'components/NewArticleTypeCard';
import {useTheme} from '@mui/material/styles';
import {FormInput} from 'components/form/FormInput';
import {getIconByType} from 'pages/Articles/Tabs/MixedPositions';
import {useCreateArticle} from 'hooks/reactQuery/useArticle';
import {useCompanyNextNumber} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyNumberType} from 'models/service-company';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {VatView} from 'models/vat';
import {useSnackbar} from 'hooks/useSnackbar';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import {getQuotationItemTotalAfterPerItemDiscount} from 'utils/quotation';
import {sanitizedTextStyles} from 'pages/Articles/Tabs/MixedPositions/MixedPosition.styles';
import DragHandle from 'components/DragHandle';
import {ReactComponent as DiscountPercentIcon} from 'assets/icons/DiscountPercentIcon.svg';
import MainPositionActions from './MainPositionActions';
import {EditableRowType} from './PositionTable';

interface Props {
  item: EditableQuotationItem;
  index: number;
  formMethods: UseFormReturn<QuotationFormData>;
  setExpandedRows: React.Dispatch<React.SetStateAction<number[]>>;
  expandedRows: number[];
  onAddSubPosition: (parentIndex: number) => void;
  editableRow: EditableRowType | null;
  setEditableRow: Dispatch<SetStateAction<EditableRowType | null>>;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  serviceCompanyId: string;
  hoveredMainRowIndex: number | null;
  setHoveredMainRowIndex: Dispatch<SetStateAction<number | null>>;
  taxRates?: VatView[];
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
}

const MainPositionRow = ({
  item,
  index,
  formMethods,
  editableRow,
  setEditableRow,
  showRightShadow,
  showLeftShadow,
  serviceCompanyId,
  hoveredMainRowIndex,
  setHoveredMainRowIndex,
  expandedRows,
  setExpandedRows,
  onAddSubPosition,
  taxRates,
  onDescriptionClick,
}: Props) => {
  const theme = useTheme();
  const {enqueueSnackbar} = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const inputRef = useRef(null);

  const {control, setValue, getValues, watch} = formMethods;

  const watchedItem = useWatch({
    control,
    name: `items.${index}`,
  });

  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

  const {data: nextCompanyNumber} = useCompanyNextNumber(
    {type: ServiceCompanyNumberType.ARTICLE},
    serviceCompanyId,
  );

  const {mutateAsync: createArticle} = useCreateArticle(
    t('Article created successfully'),
  );

  const articleTypes = getArticleTypesWithLabels({
    excludeTypes: [],
  });

  const handleDoubleClick = ({
    indexPos,
    fieldName,
    row,
  }: {
    indexPos: number;
    fieldName: string;
    row: EditableQuotationItem;
  }) => {
    setEditableRow({
      index: indexPos,
      field: fieldName,
      values: row,
    });
  };

  const handleEditType = () => {
    setEditableRow({
      index,
      field: `items.${index}.article.type`,
      values: item,
    });
  };

  const handleEditStart = (row: EditableQuotationItem, field: string) => {
    const purchaseNetAmountCents = row?.unitPurchaseAmount?.netAmount ?? 0;
    const sellingNetAmountCents = row?.unitAmount?.netAmount ?? 0;

    if (field === `items.${index}.userSeqNumber`) {
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          userSeqNumber: row.userSeqNumber,
        },
      });
    } else if (field === 'discount') {
      setEditableRow({
        index,
        field,
        values: {
          discount: row.discount || {
            type: DiscountType.PERCENTAGE,
            percentage: 0,
            amount: {
              value: 0,
              currency: currentCurrency.code,
              fractionDigits: currentCurrency.fractionDigits,
            },
          },
        },
      });
    } else if (field === 'margin') {
      const margin = calculateMargin(
        sellingNetAmountCents,
        purchaseNetAmountCents,
      );
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          margin,
        },
      });
    } else if (field === `items.${index}.unitPurchaseAmount`) {
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          unitPurchaseAmount: {
            ...row?.unitPurchaseAmount,
            netAmount: purchaseNetAmountCents / 100,
            currency: currentCurrency.code,
          },
          unitAmount: {
            ...row.unitAmount,
            netAmount: (row.unitAmount?.netAmount ?? 0) / 100,
            currency: currentCurrency.code,
          },
        },
      });
    } else if (field === `items.${index}.unitAmount`) {
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          unitPurchaseAmount: {
            ...row?.unitPurchaseAmount,
            netAmount: (row?.unitPurchaseAmount?.netAmount ?? 0) / 100,
            currency: currentCurrency.code,
          },
          unitAmount: {
            ...row.unitAmount,
            netAmount: sellingNetAmountCents / 100,
            currency: currentCurrency.code,
          },
        },
      });
    } else {
      setEditableRow({
        index,
        field,
        values: {...row, [field]: row[field as keyof EditableQuotationItem]},
      });
    }
  };

  const handleSaveToCatalogue = async (itemData: EditableQuotationItem) => {
    const article = {
      category: '',
      subCategory: '',
      manufacturer: '',
      storageLocation: '',
      model: '',
      stock: {
        currentStock: 1,
        minStock: 1,
        maxStock: 1,
        minOrderQuantity: 1,
      },
      description: itemData.description || '',
      name: itemData.name || itemData.article?.name || '',
      externalId: nextCompanyNumber?.value || '',
      pictureUrls: [],
      serviceCompanyId,
      type: itemData.article?.type!,
      unit: itemData.article?.unit!,
      unitPurchaseAmount: {
        netAmount: Number(itemData.article?.unitPurchaseAmount?.netAmount),
        currency: itemData.article?.unitPurchaseAmount?.currency!,
        percentageVat: itemData.article?.unitPurchaseAmount?.percentageVat ?? 0,
        vatId: itemData.article?.unitPurchaseAmount?.vatId,
        vatName: itemData.article?.unitPurchaseAmount?.vatName,
      },
      unitSellingAmount: {
        netAmount: Number(itemData.unitAmount?.netAmount),
        currency: itemData.unitAmount?.currency!,
        percentageVat: itemData.unitAmount?.percentageVat ?? 0,
        vatId: itemData.unitAmount?.vatId,
        vatName: itemData.unitAmount?.vatName,
      },
    };

    await createArticle(article);
  };

  const handleDeleteConfirm = async () => {
    const items = getValues('items');
    const updatedItems = items.filter((_, i) => i !== index);
    setValue('items', updatedItems);
    enqueueSnackbar(t('Position was deleted'), {variant: 'error'});
  };

  const handleSaveMixedPosition = async (field: string) => {
    if (!editableRow) return;

    const indexPos = editableRow.index;
    const currentItem = getValues(`items.${indexPos}`) as EditableQuotationItem;

    let isDifferent = false;

    if (field === `items.${index}.unitPurchaseAmount`) {
      const amount = editableRow.values?.unitPurchaseAmount?.netAmount ?? 0;
      setValue(`items.${index}.unitPurchaseAmount` as Path<QuotationFormData>, {
        netAmount: Math.round(amount * 100),
        currency: currentCurrency.code,
      });
    } else if (field === `items.${index}.unitAmount`) {
      const amount = editableRow.values?.unitAmount?.netAmount ?? 0;
      setValue(`items.${indexPos}.unitAmount`, {
        netAmount: Math.round(amount * 100),
        currency: currentCurrency.code,
      });
    } else if (field === 'margin') {
      const newMargin =
        (editableRow.values as EditableQuotationItem)?.margin ?? 0;
      const currentMargin = currentItem.margin ?? 0;
      isDifferent = newMargin !== currentMargin;
    } else if (field === `items.${index}.userSeqNumber`) {
      const newSequenceNumber = editableRow.values?.userSeqNumber ?? '';
      const currentSequenceNumber = currentItem?.userSeqNumber ?? '';
      isDifferent = newSequenceNumber !== currentSequenceNumber;
    } else if (field === 'quantity') {
      const newQuantity = editableRow.values?.quantity ?? 0;
      const currentQuantity = currentItem.quantity ?? 0;
      isDifferent = newQuantity !== currentQuantity;
    }

    if (!isDifferent) {
      setEditableRow(null);
      return;
    }

    if (field === `items.${index}.article.unitPurchaseAmount`) {
      const amount = editableRow.values?.unitPurchaseAmount?.netAmount ?? 0;
      setValue(`items.${index}.unitPurchaseAmount` as Path<QuotationFormData>, {
        netAmount: Math.round(amount),
        currency: currentCurrency.code,
      });
    } else if (field === 'margin') {
      const marginValue =
        (editableRow.values as EditableQuotationItem)?.margin ?? 0;

      const newSellingPrice =
        (marginValue / 100) *
          (watchedItem?.unitPurchaseAmount?.netAmount ?? 0) +
        (watchedItem?.unitPurchaseAmount?.netAmount ?? 0);

      setValue(`items.${indexPos}.margin`, marginValue);
      setValue(`items.${indexPos}.unitAmount`, {
        netAmount: Math.round(newSellingPrice),
        currency: currentCurrency.code,
      });
    } else if (field === `items.${index}.unitAmount`) {
      const amount = editableRow.values?.unitAmount?.netAmount ?? 0;
      setValue(`items.${indexPos}.unitAmount`, {
        netAmount: Math.round(amount),
        currency: currentCurrency.code,
      });
    }
  };

  const handleArticleSelection = (selectedArticle: ArticleView | string) => {
    if (typeof selectedArticle === 'string') {
      setValue(`items.${index}.name`, selectedArticle);
      setValue(`items.${index}.article.name`, selectedArticle);
    } else {
      setValue(`items.${index}.name`, selectedArticle.name);

      setValue(`items.${index}.article`, selectedArticle);
      setValue(
        `items.${index}.article.unitPurchaseAmount`,
        selectedArticle.unitPurchaseAmount,
      );
      setValue(`items.${index}.unitAmount`, selectedArticle.unitSellingAmount);
      setValue(`items.${index}.quantity`, 1);
      setValue(`items.${index}.description`, selectedArticle.description ?? '');
      setValue(`items.${index}.discount`, {
        type: DiscountType.PERCENTAGE,
        percentage: 0,
        amount: {
          value: 0,
          currency: currentCurrency.code,
          fractionDigits: 2,
        },
      });
    }
    setEditableRow(null);
  };

  const handleSaveArticleType = (newType?: ArticleType) => {
    setValue(`items.${index}.article.type`, newType);

    if (newType !== ArticleType.PACKAGE) {
      setValue(`items.${index}.article.costPackage`, undefined);
    }

    if (newType === ArticleType.MIX) {
      const currentConfig = getValues(`items.${index}.subItemsConfig`) || {};
      setValue(`items.${index}.subItemsConfig`, {
        ...currentConfig,
        subItemsVisible: true,
        priceVisible: true,
      });
      setExpandedRows((prev) =>
        prev.includes(index) ? prev : [...prev, index],
      );
    } else {
      setValue(`items.${index}.subItems`, []);
    }

    setEditableRow(null);
    setAnchorEl(null);
  };

  const totalPriceExclVatAfterDiscount =
    getQuotationItemTotalAfterPerItemDiscount({
      positionItem: watchedItem,
    });

  const handleToggleExpand = (rowIndex: number) => {
    setExpandedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((id) => id !== rowIndex)
        : [...prev, rowIndex],
    );
  };

  const renderDragCell = useCallback(
    () => (
      <TableCell
        noPadding
        sx={{width: '2px', cursor: 'grab', borderLeft: 'none'}}
        onMouseEnter={() => setHoveredMainRowIndex(index)}
        onMouseLeave={() => setHoveredMainRowIndex(null)}>
        <DragHandle isVisible={hoveredMainRowIndex === index} />
      </TableCell>
    ),
    [index, hoveredMainRowIndex, setHoveredMainRowIndex],
  );

  const renderUserSeqNumberCell = useCallback(
    () => (
      <TableCell
        noPadding
        onDoubleClick={() =>
          handleEditStart(watchedItem, `items.${index}.userSeqNumber`)
        }
        sx={{background: '#f7f9fc', width: '48px'}}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.userSeqNumber` ? (
          <FormInput
            containerStyles={{width: '100%'}}
            fieldProps={{
              autoFocus: true,
              ref: inputRef,
              name: `items.${index}.userSeqNumber`,
              value: editableRow?.values?.userSeqNumber || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setEditableRow((prev) => ({
                  ...prev!,
                  values: {...prev!.values, userSeqNumber: e.target.value},
                })),
              onBlur: () => {
                setValue(
                  `items.${index}.userSeqNumber`,
                  editableRow.values?.userSeqNumber,
                );
                setEditableRow(null);
              },
              sx: {
                '& .Mui-focused': {
                  border: '2px solid #000034',
                  borderRadius: '4px',
                },
              },
            }}
          />
        ) : (
          <Typography
            sx={{fontSize: '14px', fontWeight: '600', padding: '0px 12px'}}>
            {watchedItem.userSeqNumber || index + 1}
          </Typography>
        )}
      </TableCell>
    ),
    [editableRow, index, inputRef, setEditableRow, setValue, watchedItem],
  );

  const renderNameCell = useCallback(
    () => (
      <TableCell
        noPadding
        onDoubleClick={() =>
          handleDoubleClick({
            indexPos: index,
            fieldName: `items.${index}.name`,
            row: item,
          })
        }
        showShadows={showRightShadow ? 'right' : undefined}
        isFirst
        firstSticky
        sx={{background: '#f7f9fc', width: '328px', marginLeft: '-10em'}}
        testId={`article-name-${index}`}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.name` ? (
          <NewArticleAutoComplete
            onArticleSelect={handleArticleSelection}
            initialValue={watch('items')?.[index]}
            excludeTypes={[ArticleType.MIX]}
            showCustomPriceColumn
            openOnFocus={editableRow.index === index}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: watchedItem.name ? 'none' : '2px solid red',
              paddingRight: '16px',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0em 1em',
              }}>
              {watchedItem.article?.type === ArticleType.MIX && (
                <IconButton onClick={() => handleToggleExpand(index)}>
                  {expandedRows.includes(index) ? (
                    <ArrowDropDownIcon sx={{color: '#000034'}} />
                  ) : (
                    <ArrowRightIcon sx={{color: '#000034'}} />
                  )}
                </IconButton>
              )}
              <Typography
                sx={{fontSize: '14px', fontWeight: '600'}}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(watchedItem.name || ''),
                }}
              />
            </Box>
            <IconButton
              onClick={() => onDescriptionClick(item.description || '', index)}
              sx={{
                color: removeHtmlTags(watchedItem.description || '')
                  ? '#000034'
                  : '#828DA3',
              }}>
              {removeHtmlTags(watchedItem.description || '') !== '' ? (
                <Tooltip
                  title={
                    <div>
                      <Typography
                        sx={sanitizedTextStyles}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            watchedItem.description || '',
                          ),
                        }}
                      />
                    </div>
                  }
                  arrow
                  placement="top">
                  <NoteAlt fontSize="small" />
                </Tooltip>
              ) : (
                <NoteAltOutlined fontSize="small" />
              )}
            </IconButton>
          </Box>
        )}
      </TableCell>
    ),
    [
      editableRow,
      expandedRows,
      index,
      onDescriptionClick,
      showRightShadow,
      item,
      watchedItem,
    ],
  );

  const renderArticleTypeCell = useCallback(
    () => (
      <TableCell
        align="center"
        noPadding
        onDoubleClick={(e) => {
          handleEditType();
          setAnchorEl(e.currentTarget);
        }}>
        <Box
          sx={{
            width: '100%',
            borderRadius: '4px',
            height: 41,
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border:
              editableRow?.field === `items.${index}.article.type` &&
              editableRow?.index === index
                ? `2px solid ${theme.palette.primary.main}`
                : 'none',
          }}
          tabIndex={0}>
          {getIconByType(watchedItem.article?.type!)}
        </Box>
        {editableRow?.index === index &&
          editableRow?.field === `items.${index}.article.type` && (
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => {
                setEditableRow(null);
                setAnchorEl(null);
              }}
              anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
              transformOrigin={{vertical: 'top', horizontal: 'left'}}
              sx={{
                '& .MuiPaper-root': {
                  width: '350px',
                  minHeight: '250px',
                  pt: 1,
                  pb: 2,
                  px: 3,
                },
              }}>
              <NewArticleTypeCard
                onClose={() => {
                  setEditableRow(null);
                  setAnchorEl(null);
                }}
                onSave={handleSaveArticleType}
                initialValue={editableRow.values?.article?.type}
                articleTypes={articleTypes}
                unitPrice={centsToMoney(
                  currentCurrency.code,
                  getValues(`items.${index}.unitAmount.netAmount`),
                )}
                packageCost={watchedItem.article?.costPackage}
                onPackageCostChange={(costPackage) => {
                  setValue(`items.${index}.article.costPackage`, costPackage);
                }}
              />
            </Popover>
          )}
      </TableCell>
    ),
    [
      anchorEl,
      articleTypes,
      editableRow,
      getValues,
      handleEditType,
      handleSaveArticleType,
      index,
      setAnchorEl,
      setEditableRow,
      setValue,
      theme.palette.primary.main,
      watchedItem,
    ],
  );

  const renderUnitPurchaseAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onDoubleClick={() =>
          handleEditStart(watchedItem, `items.${index}.unitPurchaseAmount`)
        }>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.unitPurchaseAmount` ? (
          <Controller
            name={
              `items.${index}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>
            }
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                value={editableRow?.values?.unitPurchaseAmount?.netAmount || ''}
                onValueChange={({floatValue}) =>
                  setEditableRow((prev) => ({
                    ...prev!,
                    values: {
                      ...prev!.values,
                      unitPurchaseAmount: {
                        ...prev!.values?.unitPurchaseAmount,
                        netAmount: floatValue,
                        currency:
                          prev!.values?.unitPurchaseAmount?.currency ||
                          currentCurrency.code,
                      },
                    },
                  }))
                }
                customInput={TextField}
                decimalScale={2}
                fixedDecimalScale
                decimalSeparator={getDecimalSeparator(selectedLng)}
                thousandSeparator={getThousandsSeparator(selectedLng)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currentCurrency.symbol}
                    </InputAdornment>
                  ),
                  onBlur: () => {
                    handleSaveMixedPosition(
                      `items.${index}.unitPurchaseAmount`,
                    );
                    setEditableRow(null);
                  },
                }}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {pr: 0},
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    width: '100%',
                  },
                  '& .Mui-focused': {
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                }}
              />
            )}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {formatCurrency(
              centsToMoney(
                currentCurrency.code,
                watchedItem?.unitPurchaseAmount?.netAmount ?? 0,
              ),
              {currency: currentCurrency.code},
            )}
          </Typography>
        )}
      </TableCell>
    ),
    [
      control,
      currentCurrency,
      editableRow,
      getDecimalSeparator,
      getThousandsSeparator,
      handleEditStart,
      handleSaveMixedPosition,
      index,
      selectedLng,
      setEditableRow,
      formatCurrency,
      watchedItem,
    ],
  );

  const renderMarginCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onDoubleClick={() => handleEditStart(watchedItem, 'margin')}>
        {editableRow?.index === index && editableRow?.field === 'margin' ? (
          <NumericFormat
            autoFocus
            value={editableRow.values?.margin || ''}
            onValueChange={({floatValue}) =>
              setEditableRow((prev) => ({
                ...prev!,
                values: {...prev!.values, margin: floatValue},
              }))
            }
            customInput={TextField}
            suffix="%"
            decimalScale={2}
            fixedDecimalScale
            InputProps={{
              onBlur: () => {
                handleSaveMixedPosition('margin');
                setEditableRow(null);
              },
            }}
            size="small"
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {pr: 0},
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
                width: '100%',
              },
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {(() => {
              const purchaseNetAmountCents =
                watchedItem?.unitPurchaseAmount?.netAmount ?? 0;
              const sellingNetAmountCents =
                watchedItem?.unitAmount?.netAmount ?? 0;
              const isEditing =
                editableRow?.index === index &&
                (editableRow?.field === `items.${index}.unitPurchaseAmount` ||
                  editableRow?.field === `items.${index}.unitAmount`);
              const purchaseAmount = isEditing
                ? editableRow?.values?.unitPurchaseAmount?.netAmount ?? 0
                : purchaseNetAmountCents / 100;
              const sellingAmount = isEditing
                ? editableRow?.values?.unitAmount?.netAmount ?? 0
                : sellingNetAmountCents / 100;
              if (purchaseAmount === 0) return '-';
              const margin =
                ((sellingAmount - purchaseAmount) / purchaseAmount) * 100;
              return `${margin.toFixed(2)}%`;
            })()}
          </Typography>
        )}
      </TableCell>
    ),
    [editableRow, handleEditStart, handleSaveMixedPosition, index, watchedItem],
  );

  const renderUnitAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onDoubleClick={() =>
          handleEditStart(watchedItem, `items.${index}.unitAmount`)
        }
        testId={`position-unitAmount-${index}`}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.unitAmount` ? (
          <Controller
            name={`items.${index}.unitAmount.netAmount`}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                value={editableRow?.values?.unitAmount?.netAmount || ''}
                onValueChange={({floatValue}) =>
                  setEditableRow((prev) => ({
                    ...prev!,
                    values: {
                      ...prev!.values,
                      unitAmount: {
                        ...prev!.values?.unitAmount,
                        netAmount: floatValue,
                        currency: currentCurrency.code,
                      },
                    },
                  }))
                }
                customInput={TextField}
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currentCurrency.symbol}
                    </InputAdornment>
                  ),
                  onBlur: () => {
                    handleSaveMixedPosition(`items.${index}.unitAmount`);
                    setEditableRow(null);
                  },
                }}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {pr: 0},
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    width: '100%',
                  },
                  '& .Mui-focused': {
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                }}
              />
            )}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {formatCurrency(
              centsToMoney(
                currentCurrency.code,
                watchedItem?.unitAmount?.netAmount ?? 0,
              ),
              {currency: currentCurrency.code},
            )}
          </Typography>
        )}
      </TableCell>
    ),
    [
      control,
      currentCurrency,
      editableRow,
      formatCurrency,
      handleEditStart,
      handleSaveMixedPosition,
      index,
      watchedItem,
    ],
  );

  const renderQuantityCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onDoubleClick={() => handleEditStart(watchedItem, 'quantity')}>
        {editableRow?.index === index && editableRow?.field === 'quantity' ? (
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                value={field.value || 0}
                onValueChange={({floatValue}) => {
                  setValue(`items.${index}.quantity`, floatValue || 0);
                }}
                customInput={TextField}
                allowLeadingZeros={false}
                decimalScale={2}
                fixedDecimalScale
                size="small"
                InputProps={{onBlur: () => setEditableRow(null)}}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {pr: 0},
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    width: '100%',
                  },
                  '& .Mui-focused': {
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                }}
              />
            )}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {watchedItem.quantity || 0}
          </Typography>
        )}
      </TableCell>
    ),
    [
      editableRow,
      handleEditStart,
      index,
      setEditableRow,
      setValue,
      watchedItem,
      control,
    ],
  );

  const renderVatIdCell = useCallback(
    () => (
      <TableCell
        noPadding
        align="right"
        onDoubleClick={() =>
          setEditableRow({index, field: 'vatId', values: item})
        }>
        {editableRow?.index === index && editableRow?.field === 'vatId' ? (
          <Controller
            name={`items.${index}.unitAmount.vatId`}
            control={control}
            render={({field}) => (
              <FormControl fullWidth>
                <Select
                  {...field}
                  labelId={`select-tax-label-${index}`}
                  size="small"
                  displayEmpty
                  value={field.value || ''}
                  onChange={(event) => {
                    const selectedVatId = event.target.value;
                    field.onChange(selectedVatId);
                    const selectedTaxRate = taxRates?.find(
                      (tax) => tax.id === selectedVatId,
                    );
                    const percentage = selectedTaxRate?.percentage || 0;
                    setValue(
                      `items.${index}.unitAmount.percentageVat`,
                      percentage,
                    );
                    setValue(`items.${index}.unitAmount.vatId`, selectedVatId);
                    setEditableRow(null);
                  }}
                  onBlur={(event) => {
                    const selectedVatId = event.target.value;
                    field.onChange(selectedVatId);
                    const selectedTaxRate = taxRates?.find(
                      (tax) => tax.id === selectedVatId,
                    );
                    const percentage = selectedTaxRate?.percentage || 0;
                    setValue(
                      `items.${index}.unitAmount.percentageVat`,
                      percentage,
                    );
                    setValue(`items.${index}.unitAmount.vatId`, selectedVatId);
                    setEditableRow(null);
                  }}
                  renderValue={(value) => {
                    const taxRate = taxRates?.find((tax) => tax.id === value);
                    return taxRate ? `${taxRate.percentage}%` : t('Select VAT');
                  }}
                  MenuProps={{
                    anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
                    transformOrigin: {vertical: 'top', horizontal: 'right'},
                    slotProps: {paper: {sx: {maxWidth: '20rem'}}},
                  }}
                  sx={{border: '2px solid #000034', borderRadius: '4px'}}>
                  {taxRates?.map((taxRate) => (
                    <MenuItem
                      key={taxRate.id}
                      value={taxRate.id}
                      sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                      <Box display="flex" maxWidth="100%" gap={1}>
                        <Typography variant="body1" noWrap color="primary.dark">
                          {taxRate.name}
                        </Typography>
                        <Tooltip
                          title={taxRate.legalNote}
                          arrow
                          placement="top">
                          {taxRate.legalNote ? (
                            <Receipt fontSize="small" />
                          ) : (
                            <ReceiptOutlined fontSize="small" />
                          )}
                        </Tooltip>
                      </Box>
                      <Typography
                        sx={{fontSize: '14px', fontWeight: '600'}}
                        color="text.secondary">
                        {taxRate.percentage}%
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {watchedItem?.unitAmount?.percentageVat
              ? `${watchedItem.unitAmount.percentageVat}%`
              : '-'}
          </Typography>
        )}
      </TableCell>
    ),
    [
      editableRow,
      index,
      control,
      setEditableRow,
      setValue,
      taxRates,
      t,
      watchedItem,
    ],
  );

  const renderUnitCell = useCallback(
    () => (
      <TableCell
        noPadding
        align="right"
        onDoubleClick={() =>
          handleDoubleClick({indexPos: index, fieldName: 'unit', row: item})
        }>
        {editableRow?.index === index && editableRow?.field === 'unit' ? (
          <Controller
            name={`items.${index}.article.unit`}
            control={control}
            render={({field}) => (
              <FormSelect
                label=""
                resetOption={{label: t('Select Unit')}}
                options={createMeasurementOptions(
                  selectedLng,
                  MeasurementUnit.UE,
                )}
                selectProps={{
                  ...field,
                  placeholder: t('Select Unit'),
                  sx: {
                    width: '100%',
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                  onChange: (event) => {
                    const selectedValue = event.target.value as string;
                    setValue(`items.${index}.article.unit`, selectedValue);
                    setEditableRow(null);
                  },
                  onBlur: () => setEditableRow(null),
                }}
                labelId="mixed-position"
              />
            )}
          />
        ) : (
          <Typography
            sx={{fontSize: '14px', fontWeight: '600', paddingRight: '12px'}}>
            {watchedItem.article?.unit ? t(watchedItem.article.unit) : '-'}
          </Typography>
        )}
      </TableCell>
    ),
    [
      control,
      index,
      editableRow,
      selectedLng,
      setEditableRow,
      setValue,
      t,
      watchedItem,
    ],
  );

  const renderDiscountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onDoubleClick={() => handleEditStart(watchedItem, 'discount')}>
        {editableRow?.index === index && editableRow?.field === 'discount' ? (
          <NumericFormat
            value={
              (editableRow.values as EditableQuotationItem)?.discount?.type ===
              DiscountType.AMOUNT
                ? (editableRow.values as EditableQuotationItem)?.discount
                    ?.amount?.value
                : (editableRow.values as EditableQuotationItem)?.discount
                    ?.percentage
            }
            autoFocus
            isAllowed={(values) => {
              const {floatValue} = values;
              if (!floatValue) return true;
              if (floatValue < 0) return false;
              const maxDiscount =
                (editableRow.values as EditableQuotationItem).discount?.type ===
                DiscountType.AMOUNT
                  ? ((watchedItem?.unitAmount?.netAmount ?? 0) *
                      (watchedItem.quantity || 1)) /
                    100
                  : 100;
              return floatValue <= maxDiscount;
            }}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            fixedDecimalScale
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            size="small"
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {pr: 0},
              '& .MuiOutlinedInput-input': {textAlign: 'right', width: '100%'},
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  component={IconButton}
                  position="end"
                  sx={{
                    py: 2,
                    mr: 1,
                    ml: 1,
                    height: '100%',
                    bgcolor: 'action.hover',
                    borderRadius: 0,
                    '&:hover': {bgcolor: 'action.hover'},
                    width: '20%',
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setEditableRow((prev) => ({
                      ...prev!,
                      values: {
                        ...prev!.values,
                        discount: {
                          ...(prev!.values as EditableQuotationItem)?.discount!,
                          type:
                            (prev!.values as EditableQuotationItem)?.discount
                              ?.type === DiscountType.AMOUNT
                              ? DiscountType.PERCENTAGE
                              : DiscountType.AMOUNT,
                        },
                      },
                    }));
                  }}
                  size="small">
                  {(editableRow.values as EditableQuotationItem)?.discount
                    ?.type === DiscountType.AMOUNT ? (
                    <PaymentsOutlinedIcon />
                  ) : (
                    <DiscountPercentIcon />
                  )}
                </InputAdornment>
              ),
              onBlur: () => {
                const sanitizedDiscount =
                  (editableRow.values as EditableQuotationItem).discount
                    ?.type === DiscountType.AMOUNT
                    ? {
                        type: DiscountType.AMOUNT,
                        amount: (editableRow.values as EditableQuotationItem)
                          ?.discount?.amount,
                        percentage: 0,
                      }
                    : {
                        type: DiscountType.PERCENTAGE,
                        percentage: (
                          editableRow.values as EditableQuotationItem
                        )?.discount?.percentage,
                        amount: {
                          value: 0,
                          currency: currentCurrency.code,
                          fractionDigits: currentCurrency.fractionDigits,
                        },
                      };
                setValue(`items.${index}.discount`, sanitizedDiscount);
                setEditableRow(null);
              },
            }}
            onValueChange={(values) => {
              const {floatValue} = values;
              setEditableRow((prev) => ({
                ...prev!,
                values: {
                  ...prev!.values,
                  discount: {
                    ...(prev!.values as EditableQuotationItem)?.discount!,
                    ...((prev!.values as EditableQuotationItem)?.discount
                      ?.type === DiscountType.AMOUNT
                      ? {
                          amount: {
                            value: floatValue || 0,
                            currency: currentCurrency.code,
                            fractionDigits: currentCurrency.fractionDigits,
                          },
                        }
                      : {percentage: floatValue || 0}),
                  },
                },
              }));
            }}
          />
        ) : (
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {watchedItem.discount?.type === DiscountType.AMOUNT
              ? `${(watchedItem.discount?.amount?.value || 0).toFixed(2)} ${
                  currentCurrency.symbol
                }`
              : `${(watchedItem.discount?.percentage || 0).toFixed(2)}%`}
          </Typography>
        )}
      </TableCell>
    ),
    [
      editableRow,
      getDecimalSeparator,
      getThousandsSeparator,
      index,
      setEditableRow,
      setValue,
      selectedLng,
      watchedItem,
      currentCurrency,
    ],
  );

  const renderTotalPriceCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        isLast
        lastSticky
        showShadows={showLeftShadow ? 'left' : undefined}
        sx={{background: '#f7f9fc'}}>
        <Typography sx={{fontWeight: 600, paddingRight: '12px'}}>
          {formatCurrency(totalPriceExclVatAfterDiscount, {
            currency: currentCurrency.code,
          })}
        </Typography>
      </TableCell>
    ),
    [
      currentCurrency,
      formatCurrency,
      showLeftShadow,
      totalPriceExclVatAfterDiscount,
    ],
  );

  const renderActionsCell = useCallback(
    () => (
      <TableCell
        noPadding
        align="right"
        width={ACTION_CELL_WIDTH}
        isLast
        sx={{background: '#f7f9fc', position: 'sticky'}}>
        <MainPositionActions
          isMixedType={watchedItem.article?.type === ArticleType.MIX}
          onCreateMixedPosition={() => {
            setValue(`items.${index}.article.type`, ArticleType.MIX);
            const currentConfig =
              getValues(`items.${index}.subItemsConfig`) || {};
            setValue(`items.${index}.subItemsConfig`, {
              ...currentConfig,
              subItemsVisible: true,
              priceVisible: true,
            });
            setExpandedRows((prev) =>
              prev.includes(index) ? prev : [...prev, index],
            );
            setEditableRow(null);
            setAnchorEl(null);
          }}
          onAddSubPosition={() => onAddSubPosition(index)}
          onSaveToCatalogue={() => {
            const itemData = getValues(`items.${index}`);
            handleSaveToCatalogue(itemData);
          }}
          onDelete={() => setOpenDeleteConfirm(true)}
        />
      </TableCell>
    ),
    [
      ACTION_CELL_WIDTH,
      getValues,
      index,
      onAddSubPosition,
      setEditableRow,
      setExpandedRows,
      setAnchorEl,
      setOpenDeleteConfirm,
      setValue,
      watchedItem,
      handleSaveToCatalogue,
    ],
  );

  return (
    <>
      {renderDragCell()}
      {renderUserSeqNumberCell()}
      {renderNameCell()}
      {renderArticleTypeCell()}
      {renderUnitPurchaseAmountCell()}
      {renderMarginCell()}
      {renderUnitAmountCell()}
      {renderQuantityCell()}
      {renderVatIdCell()}
      {renderUnitCell()}
      {renderDiscountCell()}
      {renderTotalPriceCell()}
      {renderActionsCell()}

      <Confirm
        maxWidth={400}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteConfirm();
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete position"
        content="You are about to remove this position permanently from this quotation. This action can't be undone. Do you want to proceed?"
      />
    </>
  );
};

export default MainPositionRow;
