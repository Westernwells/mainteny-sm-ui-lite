import {
  Control,
  Controller,
  Path,
  UseFormReturn,
  UseFormSetValue,
} from 'react-hook-form';
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {FormSelect} from 'components/form/FormSelect';
import {NumericFormat} from 'react-number-format';
import {
  QuotationFormData,
  EditableQuotationSubItemRecord,
} from 'models/quotation';
import {
  centsToMoney,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  moneyToCents,
  useCurrentCurrency,
} from 'utils/currency';
import {createMeasurementOptions, MeasurementUnit} from 'models/articleForm';
import {ArticleType, ArticleView} from 'models/article';
import Popover from '@mui/material/Popover';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import TableCell from 'components/Table/TableCell';
import NewArticleTypeCard from 'components/NewArticleTypeCard';
import NewArticleAutoComplete, {
  getIconByType,
} from 'components/NewArticleAutocomplete';
import {calculateMargin, getArticleTypesWithLabels} from 'utils/article-utils';
import {VatView} from 'models/vat';
import {
  Receipt,
  ReceiptOutlined,
  NoteAltOutlined,
  NoteAlt,
} from '@mui/icons-material';
import {removeHtmlTags} from 'utils/rich-field-string';
import DOMPurify from 'dompurify';
import {LanguageContext} from 'context/LanguageProvider';
import {FormInput} from 'components/form/FormInput';
import {useTheme} from '@mui/material/styles';
import {sanitizedTextStyles} from 'pages/Articles/Tabs/MixedPositions/MixedPosition.styles';
import DragHandle from 'components/DragHandle';
import {DiscountType} from 'models/invoice';
import {debounce, isEqual} from 'lodash';
import {getQuotationItemTotalAfterPerItemDiscount} from 'utils/quotation';
import {useCalculateQuotationAmount} from 'hooks/reactQuery/useQuotation';
import {EditableRowType} from './PositionTable';
import SubPositionActions from './SubPositionActions';

interface Props {
  subItem: EditableQuotationSubItemRecord;
  control: Control<QuotationFormData, any>;
  setValue: UseFormSetValue<QuotationFormData>;
  editableSubRow: EditableRowType | null;
  setEditableSubRow: Dispatch<SetStateAction<EditableRowType | null>>;
  parentIndex: number;
  subIndex: number;
  formMethods: UseFormReturn<QuotationFormData>;
  hoveredSubRowIndex: number | null;
  setHoveredSubRowIndex: Dispatch<SetStateAction<number | null>>;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  taxRates?: VatView[];
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
}

const SubPositionRow = ({
  parentIndex,
  subIndex,
  subItem,
  control,
  setValue,
  formMethods,
  hoveredSubRowIndex,
  setHoveredSubRowIndex,
  editableSubRow,
  setEditableSubRow,
  taxRates,
  onDescriptionClick,
  showRightShadow,
  showLeftShadow,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {getValues, watch} = formMethods;

  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [isActionOpen, setIsActionOpen] = useState(false);

  const {mutateAsync: calculateQuotationAmount} = useCalculateQuotationAmount();

  const inputRef = useRef(null);
  const unitPurchaseInputRef = useRef<HTMLInputElement>(null);
  const marginInputRef = useRef<HTMLInputElement>(null);
  const unitAmountInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);

  const pathBase = `items.${parentIndex}.subItems.${subIndex}`;

  const articleTypes = getArticleTypesWithLabels({
    excludeTypes: [ArticleType.PACKAGE, ArticleType.MIX],
  });

  const handleEditStart = (field: string) => {
    setEditableSubRow({
      index: subIndex,
      parentIndex,
      subIndex,
      field,
      values: subItem,
    });
  };

  const handleSubPositionEditStart = (
    row: EditableQuotationSubItemRecord,
    field: string,
    pIndex: number,
    sIndex: number,
  ) => {
    const purchaseNetAmountCents =
      watch(
        `items.${pIndex}.subItems.${sIndex}.unitPurchaseAmount.netAmount`,
      ) ?? 0;

    const sellingNetAmountCents =
      watch(`items.${pIndex}.subItems.${sIndex}.unitAmount.netAmount`) ?? 0;

    if (field === 'margin') {
      const margin = calculateMargin(
        sellingNetAmountCents,
        purchaseNetAmountCents,
      );

      setEditableSubRow({
        index: sIndex,
        parentIndex: pIndex,
        subIndex: sIndex,
        field,
        values: {
          ...row,
          margin,
        },
      });
    } else if (field === `${pathBase}.unitPurchaseAmount.netAmount`) {
      const displayValue = {
        ...row.unitPurchaseAmount,
        netAmount: (purchaseNetAmountCents ?? 0) / 100,
        currency: row.unitPurchaseAmount?.currency || currentCurrency.code,
      };

      setEditableSubRow({
        index: sIndex,
        parentIndex: pIndex,
        subIndex: sIndex,
        field,
        values: {
          ...row,
          unitPurchaseAmount: displayValue,
          unitAmount: {
            ...row.unitAmount,
            netAmount: (row.unitAmount?.netAmount ?? 0) / 100,
            currency: row.unitAmount?.currency || currentCurrency.code,
          },
        },
      });
    } else if (field === `${pathBase}.unitAmount.netAmount`) {
      const displayValue = {
        ...row.unitAmount,
        netAmount: sellingNetAmountCents / 100,
      };
      setEditableSubRow({
        index: sIndex,
        parentIndex: pIndex,
        subIndex: sIndex,
        field,
        values: {
          ...row,
          unitAmount: displayValue,
          unitPurchaseAmount: {
            ...row.unitPurchaseAmount,
            netAmount: (row.unitPurchaseAmount?.netAmount ?? 0) / 100,
            currency: row.unitAmount?.currency || currentCurrency.code,
          },
        },
      });
    }
  };

  const totalPriceExclVatAfterDiscount =
    getQuotationItemTotalAfterPerItemDiscount({
      positionItem: {
        ...subItem,
        discount:
          getValues(`items.${parentIndex}.discount.type`) ===
          DiscountType.PERCENTAGE
            ? watch(`items.${parentIndex}.discount`)
            : {
                type: DiscountType.PERCENTAGE,
                percentage:
                  (moneyToCents(
                    currentCurrency.code,
                    watch(`items.${parentIndex}.discount.amount.value`),
                  ) /
                    (watch(`items.${parentIndex}.unitAmount.netAmount`) ?? 0)) *
                  100,
              },
      },
    });

  const recalcInvoice = useCallback(
    debounce(async () => {
      try {
        const invoiceDetail = await calculateQuotationAmount({
          data: {
            currency: currentCurrency.code,
            items: watch('items').map((item) => ({
              id: undefined,
              article: {
                id: undefined,
                name: item.article?.name,
                externalId: item.article?.externalId,
                type: item.article?.type,
                unit: item.article?.unit,
                unitSellingAmount: item.article?.unitSellingAmount,
                unitPurchaseAmount: item.article?.unitPurchaseAmount,
                costPackage: item.article?.costPackage,
              },
              name: item.name,
              description: item.description,
              unitAmount: {
                currency: item.unitAmount?.currency || currentCurrency.code,
                netAmount: item.unitAmount?.netAmount || 0,
                percentageVat: item.unitAmount?.percentageVat || 0,
                vatId: item.unitAmount?.vatId || '',
                vatName: item.unitAmount?.vatName || '',
              },
              quantity: item.quantity || 0,
              discount: {
                ...item.discount,
                type: item.discount?.type!,
                amount: {
                  ...item.discount?.amount,
                  value: (item.discount?.amount?.value ?? 0) * 100,
                  currency:
                    item.discount?.amount?.currency || currentCurrency.code,
                },
              },
              payment: undefined,
              subItemsConfig: item.subItemsConfig,
              subItems: item?.subItems?.map((sub) => ({
                article: {
                  id: undefined,
                  name: sub.article?.name,
                  externalId: sub.article?.externalId,
                  type: sub.article?.type,
                  unit: sub.article?.unit,
                  unitSellingAmount: sub.article?.unitSellingAmount,
                  unitPurchaseAmount: sub.article?.unitPurchaseAmount,
                  costPackage: sub.article?.costPackage,
                },
                id: undefined,
                name: sub.name,
                unitPurchaseAmount: sub.unitPurchaseAmount,
                unitAmount: sub.unitAmount,
                quantity: sub.quantity,
                description: sub.description,
                userSeqNumber: sub.userSeqNumber,
              })),
              userSeqNumber: item.userSeqNumber,
            })),
            globalDiscount: watch('discount') || {
              type: DiscountType.AMOUNT,
              amount: {
                value: 0,
                currency: currentCurrency.code,
                fractionDigits: currentCurrency.fractionDigits,
              },
              percentage: 0,
            },
          },
        });

        invoiceDetail.items.forEach((itemDetail, index) => {
          const newAmount = itemDetail.amountBeforeItemDiscount;
          const currentAmount = watch(`items.${index}.unitAmount`);
          if (!isEqual(newAmount, currentAmount)) {
            setValue(`items.${index}.unitAmount`, newAmount);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }, 300),
    [calculateQuotationAmount, currentCurrency, setValue, watch],
  );

  const updateMainUnitPurchaseAmount = () => {
    const parentPath = `items.${parentIndex}`;

    const subItemsPath = `${parentPath}.subItems` as Path<QuotationFormData>;

    const subItems =
      (getValues(subItemsPath) as EditableQuotationSubItemRecord[]) || [];

    const totalNetAmount = subItems.reduce(
      (sum, sub) => sum + (sub.unitPurchaseAmount?.netAmount || 0),
      0,
    );

    setValue(
      `${parentPath}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>,
      totalNetAmount,
    );
  };

  const handleSubPositionMarginChange = (
    margin: number,
    pIndex: number,
    sIndex: number,
  ) => {
    const subItemPath = `items.${pIndex}.subItems.${sIndex}`;
    const buyingPriceCents =
      (getValues(
        `${subItemPath}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>,
      ) as number) ?? 0;
    const buyingPrice = buyingPriceCents / 100;

    const newSellingPrice = buyingPrice * (1 + margin / 100);

    setEditableSubRow((prev: EditableRowType | null) => ({
      ...prev!,
      index: sIndex,
      parentIndex: pIndex,
      subIndex: sIndex,
      values: {
        ...prev!.values,
        margin,
        unitAmount: {
          ...prev!.values?.unitAmount,
          netAmount: newSellingPrice,
          currency: prev?.values?.unitAmount?.currency || currentCurrency.code,
        },
      },
    }));

    setValue(
      `${subItemPath}.unitAmount.netAmount` as Path<QuotationFormData>,
      Math.round(newSellingPrice * 100),
    );

    setValue(`${subItemPath}.margin` as Path<QuotationFormData>, margin);
  };

  const handleSubPositionSave = async (field: string) => {
    if (!editableSubRow) return;
    const {parentIndex: pIndex, subIndex: sIndex} = editableSubRow;
    const path =
      `items.${pIndex}.subItems.${sIndex}` as Path<QuotationFormData>;

    if (field === `${path}.unitPurchaseAmount.netAmount`) {
      const newAmount =
        editableSubRow.values?.unitPurchaseAmount?.netAmount ?? 0;
      setValue(
        `${path}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>,
        Math.round(newAmount * 100),
      );
      recalcInvoice();
      updateMainUnitPurchaseAmount();
    } else if (field === `${path}.unitAmount.netAmount`) {
      const newAmount = editableSubRow.values?.unitAmount?.netAmount ?? 0;
      setValue(
        `${path}.unitAmount.netAmount` as Path<QuotationFormData>,
        Math.round(newAmount * 100),
      );

      recalcInvoice();
    } else if (field === 'margin') {
      const marginValue = editableSubRow.values?.margin ?? 0;
      const purchaseNetAmount = Number(
        getValues(
          `${path}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>,
        ) ?? 0,
      );

      const newSellingPrice =
        (marginValue / 100) * purchaseNetAmount + purchaseNetAmount;

      setValue(`${path}.margin` as Path<QuotationFormData>, marginValue);
      setValue(
        `${path}.unitAmount.netAmount` as Path<QuotationFormData>,
        Math.round(newSellingPrice),
      );
      recalcInvoice();
    } else if (field === `${path}.quantity`) {
      setValue(
        `${pathBase}.quantity` as Path<QuotationFormData>,
        editableSubRow.values?.quantity || 0,
      );
      recalcInvoice();
    }

    setEditableSubRow(null);
  };

  const handleArticleSelection = (selectedArticle: ArticleView | string) => {
    const isFreeText = typeof selectedArticle === 'string';
    const name = isFreeText ? selectedArticle : selectedArticle.name;

    setValue(`${pathBase}.name` as Path<QuotationFormData>, name);

    if (isFreeText) {
      setValue(`${pathBase}.article.name` as Path<QuotationFormData>, name);
    } else {
      // Override the VAT fields so that the new sub position inherits the main position's VAT

      const selectedUnitAmount = selectedArticle.unitSellingAmount;
      const mainVatId = getValues(`items.${parentIndex}.unitAmount.vatId`);
      const mainVatPercentage = getValues(
        `items.${parentIndex}.unitAmount.percentageVat`,
      );

      setValue(`${pathBase}.article` as Path<QuotationFormData>, {
        ...selectedArticle,
        costPackage: selectedArticle.additionalInfo?.costPackage,
      });
      setValue(
        `${pathBase}.unitPurchaseAmount` as Path<QuotationFormData>,
        selectedArticle.unitPurchaseAmount,
      );
      setValue(`${pathBase}.unitAmount` as Path<QuotationFormData>, {
        ...selectedUnitAmount,
        vatId: mainVatId,
        percentageVat: mainVatPercentage,
      });
      setValue(`${pathBase}.quantity` as Path<QuotationFormData>, 1);
      setValue(
        `${pathBase}.description` as Path<QuotationFormData>,
        selectedArticle.description,
      );
    }

    setEditableSubRow(null);
    updateMainUnitPurchaseAmount();
    recalcInvoice();
  };

  const updateVatForAllRelatedRows = useCallback(
    (vatId: string, percentage: number) => {
      const parentPath = `items.${parentIndex}`;
      const subItemsPath = `${parentPath}.subItems` as Path<QuotationFormData>;
      setValue(
        `${parentPath}.unitAmount.vatId` as Path<QuotationFormData>,
        vatId,
      );
      setValue(
        `${parentPath}.unitAmount.percentageVat` as Path<QuotationFormData>,
        percentage,
      );
      const subItems =
        (getValues(subItemsPath) as EditableQuotationSubItemRecord[]) || [];
      subItems.forEach((_, idx) => {
        setValue(
          `${subItemsPath}.${idx}.unitAmount.vatId` as Path<QuotationFormData>,
          vatId,
        );
        setValue(
          `${subItemsPath}.${idx}.unitAmount.percentageVat` as Path<QuotationFormData>,
          percentage,
        );
      });
    },
    [getValues, parentIndex, setValue],
  );

  const onRemoveSubPosition = (pIndex: number, sIndex: number) => {
    const subItemsPath = `items.${pIndex}.subItems` as Path<QuotationFormData>;

    const currentSubItems =
      (getValues(subItemsPath) as EditableQuotationSubItemRecord[]) || [];

    const updatedSubPositions = currentSubItems.filter(
      (_item, idx) => idx !== sIndex,
    );

    setValue(subItemsPath, structuredClone(updatedSubPositions), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleArticleTypeClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (
      editableSubRow?.parentIndex === parentIndex &&
      editableSubRow?.subIndex === subIndex &&
      editableSubRow?.field === `${pathBase}.article.type`
    ) {
      setEditableSubRow(null);
      setAnchorEl(null);
    } else {
      handleEditStart(`${pathBase}.article.type`);
      setAnchorEl(e.currentTarget);
    }
  };

  const renderDragCell = useCallback(
    () => (
      <TableCell
        noPadding
        sx={{width: '2px', cursor: 'grab', borderLeft: 'none'}}
        onMouseEnter={() => setHoveredSubRowIndex(subIndex)}
        onMouseLeave={() => setHoveredSubRowIndex(null)}>
        <DragHandle isVisible={hoveredSubRowIndex === subIndex} />
      </TableCell>
    ),
    [hoveredSubRowIndex, setHoveredSubRowIndex, subIndex],
  );

  const renderUserSeqNumberCell = useCallback(
    () => (
      <TableCell
        align="left"
        noPadding
        onClick={() => handleEditStart('userSeqNumber')}
        sx={{maxWidth: '58px'}}>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === 'userSeqNumber' ? (
          <FormInput
            containerStyles={{width: '100%'}}
            fieldProps={{
              autoFocus: true,
              onFocus: (e) => {
                e.target.setSelectionRange(0, 0);
              },
              ref: inputRef,
              value: editableSubRow?.values?.userSeqNumber || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setEditableSubRow((prev) => ({
                  ...prev!,
                  values: {...prev!.values, userSeqNumber: e.target.value},
                })),
              onBlur: () => {
                setEditableSubRow(null);
              },
              onKeyDown: (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  setValue(
                    `${pathBase}.userSeqNumber` as Path<QuotationFormData>,
                    editableSubRow.values?.userSeqNumber,
                  );
                  handleEditStart(`${pathBase}.name`);
                }
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
          <Tooltip
            title={
              subItem?.userSeqNumber || `${parentIndex + 1}.${subIndex + 1}`
            }
            arrow
            placement="top">
            <Typography
              sx={{
                paddingLeft: '12px',
                fontSize: '14px',
                textWrap: 'wrap',
                textOverflow: 'ellipsis',
                overflow: 'auto',
              }}>
              {subItem?.userSeqNumber || `${parentIndex + 1}.${subIndex + 1}`}
            </Typography>
          </Tooltip>
        )}
      </TableCell>
    ),
    [
      editableSubRow,
      parentIndex,
      setEditableSubRow,
      setValue,
      pathBase,
      subIndex,
      subItem,
    ],
  );

  const renderNameCell = useCallback(
    () => (
      <TableCell
        noPadding
        onClick={() => handleEditStart(`${pathBase}.name`)}
        showShadows={showRightShadow ? 'right' : undefined}
        isFirst
        sx={{width: '328px', marginLeft: '-10em'}}>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === `${pathBase}.name` ? (
          <NewArticleAutoComplete
            onArticleSelect={handleArticleSelection}
            initialValue={subItem}
            excludeTypes={[ArticleType.MIX, ArticleType.PACKAGE]}
            showCustomPriceColumn
            openOnFocus={editableSubRow.subIndex === subIndex}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: subItem?.name ? 'none' : '2px solid red',
              paddingRight: '16px',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0em 1em',
                flex: '0 0 88%',
              }}>
              <Typography
                sx={{fontSize: '14px', flex: '0 0 90%'}}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(subItem?.name || ''),
                }}
              />
            </Box>
            <IconButton
              onClick={() =>
                onDescriptionClick(
                  subItem?.description || '',
                  parentIndex,
                  subIndex,
                )
              }
              sx={{
                color: removeHtmlTags(subItem?.description || '')
                  ? '#000034'
                  : '#828DA3',
              }}>
              {removeHtmlTags(subItem?.description || '') !== '' ? (
                <Tooltip
                  title={
                    <div>
                      <Typography
                        sx={{...sanitizedTextStyles}}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            subItem?.description || '',
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
    [editableSubRow, parentIndex, showRightShadow, subIndex, subItem, pathBase],
  );

  const renderArticleTypeCell = useCallback(
    () => (
      <TableCell align="center" noPadding onClick={handleArticleTypeClick}>
        <Box
          sx={{
            width: '100%',
            height: 41,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border:
              editableSubRow?.parentIndex === parentIndex &&
              editableSubRow?.subIndex === subIndex &&
              editableSubRow?.field === `${pathBase}.article.type`
                ? `2px solid ${theme.palette.primary.main}`
                : 'none',
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              handleSubPositionEditStart(
                subItem,
                'unitPurchaseAmount',
                parentIndex,
                subIndex,
              );
              unitPurchaseInputRef.current?.focus();
            }
          }}>
          {getIconByType(subItem?.article?.type!)}
        </Box>
        {editableSubRow?.parentIndex === parentIndex &&
          editableSubRow?.subIndex === subIndex &&
          editableSubRow?.field === `${pathBase}.article.type` && (
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={(e) => {
                (e as React.SyntheticEvent).stopPropagation();
                setEditableSubRow(null);
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
              {/* Wrap popover content to stop propagation */}
              <Box onClick={(e) => e.stopPropagation()}>
                <NewArticleTypeCard
                  onClose={() => {
                    setEditableSubRow(null);
                    setAnchorEl(null);
                  }}
                  onSave={(newType) => {
                    setValue(
                      `${pathBase}.article.type` as Path<QuotationFormData>,
                      newType,
                      {shouldValidate: true, shouldDirty: true},
                    );
                    setEditableSubRow(null);
                    setAnchorEl(null);
                  }}
                  initialValue={
                    editableSubRow?.values?.article?.type || ArticleType.LABOR
                  }
                  articleTypes={articleTypes}
                />
              </Box>
            </Popover>
          )}
      </TableCell>
    ),
    [
      anchorEl,
      articleTypes,
      editableSubRow,
      parentIndex,
      subItem,
      pathBase,
      subIndex,
    ],
  );

  const renderUnitPurchaseAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() =>
          handleSubPositionEditStart(
            subItem,
            `${pathBase}.unitPurchaseAmount.netAmount`,
            parentIndex,
            subIndex,
          )
        }>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === `${pathBase}.unitPurchaseAmount.netAmount` ? (
          <Controller
            name={
              `${pathBase}.unitPurchaseAmount.netAmount` as Path<QuotationFormData>
            }
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                getInputRef={unitPurchaseInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
                value={
                  editableSubRow?.values?.unitPurchaseAmount?.netAmount || 0
                }
                onValueChange={({floatValue}) =>
                  setEditableSubRow((prev) => ({
                    ...prev!,
                    values: {
                      ...prev!.values,
                      unitPurchaseAmount: {
                        ...prev!.values?.unitPurchaseAmount,
                        netAmount: floatValue,
                        currency: currentCurrency.code,
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
                    handleSubPositionSave(
                      `${pathBase}.unitPurchaseAmount.netAmount`,
                    );
                    setEditableSubRow(null);
                  },
                  onKeyDown: (
                    e: React.KeyboardEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubPositionSave(
                        `${pathBase}.unitPurchaseAmount.netAmount`,
                      );
                      handleSubPositionEditStart(
                        subItem,
                        `margin`,
                        parentIndex,
                        subIndex,
                      );
                      marginInputRef.current?.focus();
                    }
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
          <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>
            {formatCurrency(
              centsToMoney(
                currentCurrency.code,
                subItem?.unitPurchaseAmount?.netAmount ?? 0,
              ),
              {currency: currentCurrency.code},
            )}
          </Typography>
        )}
      </TableCell>
    ),
    [control, currentCurrency, editableSubRow, selectedLng, subItem, pathBase],
  );

  const renderMarginCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() =>
          handleSubPositionEditStart(subItem, 'margin', parentIndex, subIndex)
        }>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === 'margin' ? (
          <NumericFormat
            autoFocus
            getInputRef={marginInputRef}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.setSelectionRange(0, 0);
              }, 0);
            }}
            value={editableSubRow.values?.margin || 0}
            onValueChange={({floatValue}) =>
              handleSubPositionMarginChange(
                floatValue ?? 0,
                parentIndex,
                subIndex,
              )
            }
            customInput={TextField}
            suffix="%"
            decimalScale={2}
            fixedDecimalScale
            InputProps={{
              onBlur: () => {
                handleSubPositionSave('margin');
                setEditableSubRow(null);
              },
              onKeyDown: (
                e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubPositionSave('margin');
                  handleSubPositionEditStart(
                    subItem,
                    `${pathBase}.unitAmount.netAmount`,
                    parentIndex,
                    subIndex,
                  );
                  unitAmountInputRef.current?.focus();
                }
              },
            }}
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
          />
        ) : (
          <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>
            {(() => {
              const purchaseNetAmountCents =
                subItem?.unitPurchaseAmount?.netAmount ?? 0;
              const sellingNetAmountCents = subItem?.unitAmount?.netAmount ?? 0;
              const isEditing =
                editableSubRow?.parentIndex === parentIndex &&
                editableSubRow?.subIndex === subIndex &&
                (editableSubRow?.field ===
                  `${pathBase}.unitPurchaseAmount.netAmount` ||
                  editableSubRow?.field === `${pathBase}.unitAmount.netAmount`);
              const purchaseAmount = isEditing
                ? editableSubRow?.values?.unitPurchaseAmount?.netAmount || 0
                : purchaseNetAmountCents / 100;
              const sellingAmount = isEditing
                ? editableSubRow?.values?.unitAmount?.netAmount || 0
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
    [editableSubRow, currentCurrency, parentIndex, subIndex, subItem],
  );

  const renderUnitSellingAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() =>
          handleSubPositionEditStart(
            subItem,
            `${pathBase}.unitAmount.netAmount`,
            parentIndex,
            subIndex,
          )
        }>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === `${pathBase}.unitAmount.netAmount` ? (
          <Controller
            name={`${pathBase}.unitAmount.netAmount` as Path<QuotationFormData>}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                getInputRef={unitAmountInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
                value={editableSubRow?.values?.unitAmount?.netAmount || 0}
                onValueChange={({floatValue}) =>
                  setEditableSubRow((prev) => ({
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
                    handleSubPositionSave(`${pathBase}.unitAmount.netAmount`);
                    setEditableSubRow(null);
                  },
                  onKeyDown: (
                    e: React.KeyboardEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubPositionSave(`${pathBase}.unitAmount.netAmount`);
                      handleEditStart('quantity');
                      quantityInputRef.current?.focus();
                    }
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
          <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>
            {formatCurrency(
              centsToMoney(
                currentCurrency.code,
                subItem?.unitAmount?.netAmount ?? 0,
              ),
              {currency: currentCurrency.code},
            )}
          </Typography>
        )}
      </TableCell>
    ),
    [editableSubRow, pathBase, subItem],
  );

  const renderQuantityCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() => handleEditStart('quantity')}>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === 'quantity' ? (
          <NumericFormat
            autoFocus
            getInputRef={quantityInputRef}
            onFocus={(e) => {
              e.target.setSelectionRange(0, 0);
            }}
            value={editableSubRow.values?.quantity || 0}
            onValueChange={({floatValue}) =>
              setEditableSubRow((prev) => ({
                ...prev!,
                values: {...prev!.values, quantity: floatValue || 0},
              }))
            }
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            fixedDecimalScale
            size="small"
            InputProps={{
              onBlur: () => {
                handleSubPositionSave(`${pathBase}.quantity`);
                setEditableSubRow(null);
              },
              onKeyDown: (
                e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubPositionSave(`${pathBase}.quantity`);
                  handleEditStart('vatId');
                  vatRef.current?.focus();
                }
              },
            }}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {pr: 0},
              '& .MuiOutlinedInput-input': {textAlign: 'right', width: '100%'},
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
          />
        ) : (
          <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>
            {subItem?.quantity || 0}
          </Typography>
        )}
      </TableCell>
    ),
    [editableSubRow, parentIndex, subItem, pathBase, subIndex],
  );

  const renderVatIdCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() => {
          if (
            !(
              editableSubRow?.parentIndex === parentIndex &&
              editableSubRow?.subIndex === subIndex &&
              editableSubRow?.field === 'vatId'
            )
          ) {
            handleEditStart('vatId');
            vatRef.current?.focus();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            handleEditStart('unit');
            unitRef.current?.focus();
          }
        }}>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === 'vatId' ? (
          <Controller
            name={`${pathBase}.unitAmount.vatId` as Path<QuotationFormData>}
            control={control}
            render={({field}) => (
              <FormControl fullWidth>
                <Select
                  {...field}
                  labelId={`select-tax-label-${parentIndex}-${subIndex}`}
                  size="small"
                  displayEmpty
                  value={field.value || ''}
                  open={
                    editableSubRow?.parentIndex === parentIndex &&
                    editableSubRow?.subIndex === subIndex &&
                    editableSubRow?.field === 'vatId'
                  }
                  onClose={() => setEditableSubRow(null)}
                  onChange={(event) => {
                    const selectedVatId = event.target.value;
                    field.onChange(selectedVatId);
                    const selectedTaxRate = taxRates?.find(
                      (tax) => tax.id === selectedVatId,
                    );
                    const percentage = selectedTaxRate?.percentage || 0;
                    updateVatForAllRelatedRows(
                      String(selectedVatId),
                      percentage,
                    );
                    setEditableSubRow(null);
                  }}
                  onBlur={() => setEditableSubRow(null)}
                  ref={vatRef}
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
                        sx={{fontSize: '14px'}}
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
          <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>
            {subItem?.unitAmount?.percentageVat
              ? `${subItem.unitAmount.percentageVat}%`
              : '-'}
          </Typography>
        )}
      </TableCell>
    ),
    [
      parentIndex,
      subIndex,
      taxRates,
      updateVatForAllRelatedRows,
      editableSubRow,
      subItem,
      pathBase,
    ],
  );

  const renderUnitCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={() => {
          if (
            !(
              editableSubRow?.parentIndex === parentIndex &&
              editableSubRow?.subIndex === subIndex &&
              editableSubRow?.field === 'unit'
            )
          ) {
            handleEditStart('unit');
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            setIsActionOpen(true);
          }
        }}>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === 'unit' ? (
          <Controller
            name={`${pathBase}.article.unit` as Path<QuotationFormData>}
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
                  value: Array.isArray(field.value)
                    ? field.value.map((item) =>
                        typeof item === 'string' ? item : item.name || '',
                      )
                    : typeof field.value === 'string'
                    ? field.value
                    : '',
                  placeholder: t('Select Unit'),
                  open:
                    editableSubRow?.parentIndex === parentIndex &&
                    editableSubRow?.subIndex === subIndex &&
                    editableSubRow?.field === 'unit',
                  sx: {
                    width: '100%',
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                  onChange: (event) => {
                    const selectedValue = event.target.value as string;
                    setValue(
                      `${pathBase}.article.unit` as Path<QuotationFormData>,
                      selectedValue,
                    );
                    setEditableSubRow(null);
                  },
                  onBlur: () => setEditableSubRow(null),
                  onClose: () => setEditableSubRow(null),
                }}
                labelId={`subposition-unit-${parentIndex}-${subIndex}`}
              />
            )}
          />
        ) : (
          <Typography sx={{fontSize: '14px', paddingRight: '12px'}}>
            {subItem?.article?.unit ? t(subItem.article.unit) : '-'}
          </Typography>
        )}
      </TableCell>
    ),
    [parentIndex, subItem, pathBase, subIndex, editableSubRow],
  );

  const renderTotalPriceCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        isLast
        lastSticky
        sx={{
          paddingLeft: '12px',
          '& > div': {
            alignItems: 'center',
          },
        }}
        showShadows={showLeftShadow ? 'left' : undefined}>
        <Typography sx={{padding: '0px 12px', position: 'sticky'}}>
          {formatCurrency(
            editableSubRow?.parentIndex === parentIndex &&
              editableSubRow?.subIndex === subIndex &&
              editableSubRow.field === `${pathBase}.unitAmount.netAmount`
              ? totalPriceExclVatAfterDiscount * 100
              : totalPriceExclVatAfterDiscount,
            {
              currency: currentCurrency.code,
            },
          )}
        </Typography>
        <Box
          sx={{borderLeft: '1px solid #e4e5e8'}}
          onClick={() => {
            setIsActionOpen(!isActionOpen);
          }}>
          <SubPositionActions
            onDelete={() => {
              onRemoveSubPosition(parentIndex, subIndex);
              setIsActionOpen(false);
              recalcInvoice();
              updateMainUnitPurchaseAmount();
            }}
            isOpen={isActionOpen}
          />
        </Box>
      </TableCell>
    ),
    [
      currentCurrency,
      formatCurrency,
      subItem,
      showLeftShadow,
      watch,
      onRemoveSubPosition,
      isActionOpen,
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
      {renderUnitSellingAmountCell()}
      {renderQuantityCell()}
      {renderVatIdCell()}
      {renderUnitCell()}
      <TableCell align="right" noPadding>
        <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>-</Typography>
      </TableCell>
      {renderTotalPriceCell()}
    </>
  );
};

export default SubPositionRow;
