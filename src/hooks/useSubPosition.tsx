import {EditableRowType} from 'components/MixedPositions/PositionTable';
import {LanguageContext} from 'context/LanguageProvider';
import {
  DiscountType,
  EditableInvoiceItem,
  EditableInvoiceSubItemRecord,
} from 'models/invoice';
import {
  EditableQuotationItem,
  EditableQuotationSubItemRecord,
} from 'models/quotation';
import {VatView} from 'models/vat';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {
  centsToMoney,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  moneyToCents,
  useCurrentCurrency,
} from 'utils/currency';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {calculateMargin, getArticleTypesWithLabels} from 'utils/article-utils';
import TableCell from 'components/Table/TableCell';
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
  Popover,
} from '@mui/material';
import {
  NoteAlt,
  NoteAltOutlined,
  Receipt,
  ReceiptOutlined,
} from '@mui/icons-material';
import SubPositionActions from 'components/MixedPositions/SubPositionActions';
import NewArticleAutoComplete, {
  getIconByType,
} from 'components/NewArticleAutocomplete';
import NewArticleTypeCard from 'components/NewArticleTypeCard';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import DOMPurify from 'dompurify';
import {ArticleType, CostPackage, ExtendedArticleView} from 'models/article';
import {createMeasurementOptions, MeasurementUnit} from 'models/articleForm';
import {sanitizedTextStyles} from 'pages/Articles/Tabs/MixedPositions/MixedPosition.styles';
import {NumericFormat} from 'react-number-format';
import {removeHtmlTags} from 'utils/rich-field-string';
import DragHandle from 'components/DragHandle';
import {
  EditableServiceOrderItem,
  EditableServiceOrderSubArticleRecord,
} from 'models/service-order';
import {formatQuantity} from 'utils/pdfTemplates';
import {resolveVatFromBackend} from 'utils/utils';

interface SubPositionProps<
  TForm extends {
    items: (
      | EditableQuotationItem
      | EditableInvoiceItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
> {
  subItem:
    | EditableInvoiceSubItemRecord
    | EditableQuotationSubItemRecord
    | EditableServiceOrderSubArticleRecord;
  control: Control<TForm | any>;
  watch: UseFormWatch<TForm>;
  setValue: UseFormSetValue<TForm>;
  getValues: UseFormGetValues<TForm>;
  editableSubRow: EditableRowType | null;
  setEditableSubRow: Dispatch<SetStateAction<EditableRowType | null>>;
  parentIndex: number;
  subIndex: number;
  hoveredSubRowIndex: number | null;
  setHoveredSubRowIndex: Dispatch<SetStateAction<number | null>>;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
  onRecalc: () => void;
  taxRates?: VatView[];
  disableInlineEditing?: boolean;
  propertyOwnerId?: string;
}

const useSubPosition = <
  TForm extends {
    items: (
      | EditableQuotationItem
      | EditableInvoiceItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
>({
  parentIndex,
  subIndex,
  subItem,
  control,
  setValue,
  getValues,
  watch,
  showRightShadow,
  showLeftShadow,
  hoveredSubRowIndex,
  setHoveredSubRowIndex,
  editableSubRow,
  setEditableSubRow,
  onDescriptionClick,
  onRecalc,
  taxRates,
  disableInlineEditing = false,
  propertyOwnerId,
}: SubPositionProps<TForm>) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

  const pathBase = `items.${parentIndex}.subItems.${subIndex}`;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [isActionOpen, setIsActionOpen] = useState(false);

  const inputRef = useRef(null);
  const unitPurchaseInputRef = useRef<HTMLInputElement>(null);
  const marginInputRef = useRef<HTMLInputElement>(null);
  const unitAmountInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);

  const articleTypes = getArticleTypesWithLabels({
    excludeTypes: [ArticleType.PACKAGE, ArticleType.MIX],
  });

  const updateMainUnitPurchaseAmount = () => {
    const parentPath = `items.${parentIndex}`;

    const subItemsPath = `${parentPath}.subItems` as Path<TForm>;

    const subItems =
      (getValues(subItemsPath) as (
        | EditableInvoiceSubItemRecord
        | EditableQuotationSubItemRecord
        | EditableServiceOrderSubArticleRecord
      )[]) || [];

    const totalNetAmount = subItems.reduce(
      (sum, sub) =>
        sum + (sub.unitPurchaseAmount?.netAmount ?? 0) * sub.quantity,
      0,
    );

    setValue(
      `${parentPath}.unitPurchaseAmount.netAmount` as Path<TForm>,
      totalNetAmount as PathValue<TForm, Path<TForm>>,
    );
  };

  const updateMainUnitAmount = () => {
    const parentPath = `items.${parentIndex}`;

    const subItemsPath = `${parentPath}.subItems` as Path<TForm>;

    const subItems =
      (getValues(subItemsPath) as (
        | EditableInvoiceSubItemRecord
        | EditableQuotationSubItemRecord
        | EditableServiceOrderSubArticleRecord
      )[]) || [];

    const totalNetAmount = subItems.reduce(
      (sum, sub) => sum + (sub.unitAmount?.netAmount ?? 0) * sub.quantity,
      0,
    );

    setValue(
      `${parentPath}.unitAmount.netAmount` as Path<TForm>,
      totalNetAmount as PathValue<TForm, Path<TForm>>,
    );
  };

  const handleEditStart = useCallback(
    (field: string) => {
      setEditableSubRow({
        index: subIndex,
        parentIndex,
        subIndex,
        field,
        values: subItem,
      });
    },
    [parentIndex, subIndex, subItem, setEditableSubRow],
  );

  const handleSubPositionEditStart = useCallback(
    (
      row:
        | EditableInvoiceSubItemRecord
        | EditableQuotationSubItemRecord
        | EditableServiceOrderSubArticleRecord,
      field: string,
      pIndex: number,
      sIndex: number,
    ) => {
      const purchaseNetAmountCents =
        watch(`${pathBase}.unitPurchaseAmount.netAmount` as Path<TForm>) ?? 0;

      const sellingNetAmountCents =
        watch(`${pathBase}.unitAmount.netAmount` as Path<TForm>) ?? 0;

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
          values: {...row, margin},
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
    },
    [watch, currentCurrency, setEditableSubRow, pathBase],
  );

  const handleSubPositionMarginChange = (
    margin: number,
    pIndex: number,
    sIndex: number,
  ) => {
    const subItemPath = `items.${pIndex}.subItems.${sIndex}`;
    const buyingPriceCents =
      (getValues(
        `${subItemPath}.unitPurchaseAmount.netAmount` as Path<TForm>,
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
      `${subItemPath}.unitAmount.netAmount` as Path<TForm>,
      Math.round(newSellingPrice * 100) as PathValue<TForm, Path<TForm>>,
    );

    setValue(
      `${subItemPath}.margin` as Path<TForm>,
      margin as PathValue<TForm, Path<TForm>>,
    );
  };

  const handleSubPositionSave = async (field: string) => {
    if (!editableSubRow) return;

    const {parentIndex: pIndex, subIndex: sIndex} = editableSubRow;
    const path = `items.${pIndex}.subItems.${sIndex}` as Path<TForm>;

    if (field === `${path}.unitPurchaseAmount.netAmount`) {
      const newAmount =
        editableSubRow.values?.unitPurchaseAmount?.netAmount ?? 0;
      setValue(
        `${path}.unitPurchaseAmount` as Path<TForm>,
        {
          netAmount: Math.round(newAmount * 100),
          currency:
            editableSubRow.values?.unitPurchaseAmount?.currency ||
            currentCurrency.code,
          vatId: editableSubRow.values?.unitPurchaseAmount?.vatId || '',
          vatName: editableSubRow.values?.unitPurchaseAmount?.vatName || '',
          percentageVat:
            editableSubRow.values?.unitPurchaseAmount?.percentageVat || 0,
        } as PathValue<TForm, Path<TForm>>,
      );
      onRecalc();
      updateMainUnitPurchaseAmount();
    } else if (field === `${path}.unitAmount.netAmount`) {
      const newAmount = editableSubRow.values?.unitAmount?.netAmount ?? 0;
      setValue(
        `${path}.unitAmount` as Path<TForm>,
        {
          netAmount: Math.round(newAmount * 100),
          currency:
            editableSubRow.values?.unitAmount?.currency || currentCurrency.code,
          vatId: editableSubRow.values?.unitAmount?.vatId || '',
          vatName: editableSubRow.values?.unitAmount?.vatName || '',
          percentageVat: editableSubRow.values?.unitAmount?.percentageVat || 0,
        } as PathValue<TForm, Path<TForm>>,
      );
      onRecalc();
      updateMainUnitAmount();
    } else if (field === 'margin') {
      const marginValue = editableSubRow.values?.margin ?? 0;
      const purchaseNetAmount = Number(
        getValues(`${path}.unitPurchaseAmount.netAmount` as Path<TForm>) ?? 0,
      );
      const newSellingPrice =
        (marginValue / 100) * purchaseNetAmount + purchaseNetAmount;

      setValue(
        `${path}.margin` as Path<TForm>,
        marginValue as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `${path}.unitAmount.netAmount` as Path<TForm>,
        Math.round(newSellingPrice) as PathValue<TForm, Path<TForm>>,
      );
      onRecalc();
    } else if (field === `${path}.quantity`) {
      setValue(
        `${path}.quantity` as Path<TForm>,
        (editableSubRow.values?.quantity || 0) as PathValue<TForm, Path<TForm>>,
      );
      updateMainUnitPurchaseAmount();
      updateMainUnitAmount();
      onRecalc();
    }
    setEditableSubRow(null);
  };

  const updateVatForAllRelatedRows = useCallback(
    (vatId: string, percentage: number, vatName: string) => {
      const setVatFields = (basePath: string) => {
        const fieldNames = [
          'vatId',
          'percentageVat',
          'vatName',
          'vatInfos',
          'vats',
          'vat',
        ] as const;

        const values: (string | number | readonly unknown[])[] = [
          vatId,
          percentage,
          vatName,
          [],
          [],
          0,
        ];

        fieldNames.forEach((field, i) => {
          setValue(
            `${basePath}.unitAmount.${field}` as Path<TForm>,
            values[i] as PathValue<TForm, Path<TForm>>,
          );
        });
      };

      const parentPath = `items.${parentIndex}`;
      const subItemsPath = `${parentPath}.subItems` as Path<TForm>;

      // 2) update the main row:
      setVatFields(parentPath);

      // 3) update every sub-item under that same row:
      const subItems =
        (getValues(subItemsPath) as
          | readonly {
              unitAmount: {
                vatId?: string;
                percentageVat?: number;
                vatName?: string;
              };
            }[]
          | undefined) || [];

      subItems.forEach((_, idx) => {
        setVatFields(`${subItemsPath}.${idx}`);
      });

      onRecalc();
    },
    [getValues, parentIndex, setValue, onRecalc],
  );

  const onRemoveSubPosition = (pIndex: number, sIndex: number) => {
    const subItemsPath = `items.${pIndex}.subItems` as Path<TForm>;

    const currentSubItems =
      (getValues(subItemsPath) as (
        | EditableInvoiceSubItemRecord
        | EditableQuotationSubItemRecord
        | EditableServiceOrderSubArticleRecord
      )[]) || [];

    const updatedSubPositions = currentSubItems.filter(
      (_item, idx) => idx !== sIndex,
    );

    setValue(
      subItemsPath,
      structuredClone(updatedSubPositions as PathValue<TForm, Path<TForm>>),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );

    if (updatedSubPositions.length === 0) {
      setValue(
        `items.${pIndex}.article.type` as Path<TForm>,
        ArticleType.OTHER as PathValue<TForm, Path<TForm>>,
      );
    }
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

  const handleArticleSelection = (
    selectedArticle: ExtendedArticleView | string,
  ) => {
    const isFreeText = typeof selectedArticle === 'string';
    const name = isFreeText ? selectedArticle : selectedArticle.name;
    const articleType = isFreeText ? null : selectedArticle.type;

    setValue(
      `${pathBase}.name` as Path<TForm>,
      name as PathValue<TForm, Path<TForm>>,
    );

    if (isFreeText) {
      setValue(
        `${pathBase}.article.name` as Path<TForm>,
        name as PathValue<TForm, Path<TForm>>,
      );
    } else {
      const defaultCostPackage: CostPackage | undefined =
        articleType === ArticleType.PACKAGE
          ? selectedArticle?.additionalInfo?.costPackage ?? {
              laborPercentage: 50,
              materialPercentage: 50,
            }
          : undefined;

      // Override the VAT fields so that the new sub position inherits the main position's VAT

      const selectedUnitAmount = selectedArticle?.isCustom
        ? selectedArticle.customSellingAmount
        : selectedArticle.unitSellingAmount;

      const mainVatId = getValues(
        `items.${parentIndex}.unitAmount.vatId` as Path<TForm>,
      );
      const mainVatPercentage = getValues(
        `items.${parentIndex}.unitAmount.percentageVat` as Path<TForm>,
      );

      setValue(
        `${pathBase}.article` as Path<TForm>,
        {
          ...selectedArticle,
          costPackage: defaultCostPackage,
        } as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `${pathBase}.unitPurchaseAmount` as Path<TForm>,
        selectedArticle.unitPurchaseAmount as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `${pathBase}.unitAmount` as Path<TForm>,
        {
          ...selectedUnitAmount,
          vatId: mainVatId,
          percentageVat: mainVatPercentage,
        } as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `${pathBase}.description` as Path<TForm>,
        selectedArticle.description as PathValue<TForm, Path<TForm>>,
      );
    }

    setEditableSubRow(null);
    updateMainUnitPurchaseAmount();
    updateMainUnitAmount();
    onRecalc();
  };

  const netPriceDisplay = useMemo(() => {
    const [watchedQty, watchedUnitCents] = watch([
      `${pathBase}.quantity` as Path<TForm>,
      `${pathBase}.unitAmount.netAmount` as Path<TForm>,
    ]);

    let qty: number;
    let unitCents: number;

    const editingThisRow =
      editableSubRow?.parentIndex === parentIndex &&
      editableSubRow?.subIndex === subIndex;

    if (editingThisRow && editableSubRow.field === 'quantity') {
      qty = editableSubRow.values?.quantity ?? 0;
    } else {
      qty = Number.isFinite(watchedQty!) ? watchedQty! : subItem.quantity;
    }

    if (
      editingThisRow &&
      editableSubRow.field === `${pathBase}.unitAmount.netAmount`
    ) {
      unitCents = Math.round(
        moneyToCents(
          currentCurrency.code,
          editableSubRow.values?.unitAmount?.netAmount ?? 0,
        ),
      );
    } else {
      unitCents = Number.isFinite(watchedUnitCents!)
        ? watchedUnitCents!
        : subItem.unitAmount?.netAmount ?? 0;
    }

    const totalCents = Math.round(
      moneyToCents(
        currentCurrency.code,
        qty * centsToMoney(currentCurrency.code, unitCents),
      ),
    );

    return formatCurrency(centsToMoney(currentCurrency.code, totalCents), {
      currency: currentCurrency.code,
    });
  }, [
    watch,
    editableSubRow,
    pathBase,
    parentIndex,
    subItem,
    currentCurrency.code,
  ]);

  const parentDiscount = watch(`items.${parentIndex}.discount` as Path<TForm>);

  const renderDragCell = useCallback(
    () => (
      <TableCell
        noPadding
        sx={{
          width: '2px',
          cursor: !disableInlineEditing ? 'grab' : 'inherit',
          borderLeft: 'none',
        }}
        onMouseEnter={() => setHoveredSubRowIndex(subIndex)}
        onMouseLeave={() => setHoveredSubRowIndex(null)}>
        {!disableInlineEditing && (
          <DragHandle
            isVisible={hoveredSubRowIndex === subIndex}
            disableInlineEditing={disableInlineEditing}
          />
        )}
      </TableCell>
    ),
    [hoveredSubRowIndex, setHoveredSubRowIndex, subIndex],
  );

  const renderUserSeqNumberCell = useCallback(() => {
    const mainSeqOverride = watch(
      `items.${parentIndex}.userSeqNumber` as Path<TForm>,
    );

    const computedPrefix = mainSeqOverride
      ? `${mainSeqOverride}.${subIndex + 1}`
      : `${parentIndex + 1}.${subIndex + 1}`;

    const subOverride = subItem.userSeqNumber;

    return (
      <TableCell
        align="left"
        noPadding
        onClick={
          !disableInlineEditing
            ? () => handleEditStart('userSeqNumber')
            : undefined
        }
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
                setValue(
                  `${pathBase}.userSeqNumber` as Path<TForm>,
                  editableSubRow.values?.userSeqNumber as PathValue<
                    TForm,
                    Path<TForm>
                  >,
                );
              },
              onKeyDown: (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  setValue(
                    `${pathBase}.userSeqNumber` as Path<TForm>,
                    editableSubRow.values?.userSeqNumber as PathValue<
                      TForm,
                      Path<TForm>
                    >,
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
              {subOverride || computedPrefix}
            </Typography>
          </Tooltip>
        )}
      </TableCell>
    );
  }, [
    editableSubRow,
    parentIndex,
    setEditableSubRow,
    setValue,
    pathBase,
    subIndex,
    subItem,
  ]);

  const renderNameCell = useCallback(
    () => (
      <TableCell
        noPadding
        onClick={
          !disableInlineEditing
            ? () => handleEditStart(`${pathBase}.name`)
            : undefined
        }
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
            propertyOwnerId={propertyOwnerId}
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
              onClick={
                !disableInlineEditing
                  ? () =>
                      onDescriptionClick(
                        subItem?.description || '',
                        parentIndex,
                        subIndex,
                      )
                  : undefined
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
    [
      editableSubRow,
      parentIndex,
      showRightShadow,
      subIndex,
      subItem,
      pathBase,
      disableInlineEditing,
    ],
  );

  const renderArticleTypeCell = useCallback(
    () => (
      <TableCell
        align="center"
        noPadding
        onClick={!disableInlineEditing ? handleArticleTypeClick : undefined}>
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
            '&:focus-visible': {
              outline: 'none',
              border: `2px solid ${theme.palette.primary.main}`,
            },
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              handleSubPositionEditStart(
                subItem,
                `${pathBase}.unitPurchaseAmount.netAmount`,
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
                      `${pathBase}.article.type` as Path<TForm>,
                      newType as PathValue<TForm, Path<TForm>>,
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
        onClick={
          !disableInlineEditing
            ? () =>
                handleSubPositionEditStart(
                  subItem,
                  `${pathBase}.unitPurchaseAmount.netAmount`,
                  parentIndex,
                  subIndex,
                )
            : undefined
        }>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === `${pathBase}.unitPurchaseAmount.netAmount` ? (
          <Controller
            name={`${pathBase}.unitPurchaseAmount.netAmount` as Path<TForm>}
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
                  editableSubRow?.values?.unitPurchaseAmount?.netAmount || ''
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
        onClick={
          !disableInlineEditing
            ? () =>
                handleSubPositionEditStart(
                  subItem,
                  'margin',
                  parentIndex,
                  subIndex,
                )
            : undefined
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
            value={editableSubRow.values?.margin || ''}
            onValueChange={({floatValue}) =>
              handleSubPositionMarginChange(
                floatValue ?? 0,
                parentIndex,
                subIndex,
              )
            }
            customInput={TextField}
            suffix="%"
            decimalScale={0}
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
              return `${margin.toFixed(0)}%`;
            })()}
          </Typography>
        )}
      </TableCell>
    ),
    [editableSubRow, currentCurrency, parentIndex, subIndex, subItem],
  );

  const renderUnitAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={
          !disableInlineEditing
            ? () =>
                handleSubPositionEditStart(
                  subItem,
                  `${pathBase}.unitAmount.netAmount`,
                  parentIndex,
                  subIndex,
                )
            : undefined
        }>
        {editableSubRow?.parentIndex === parentIndex &&
        editableSubRow?.subIndex === subIndex &&
        editableSubRow?.field === `${pathBase}.unitAmount.netAmount` ? (
          <Controller
            name={`${pathBase}.unitAmount.netAmount` as Path<TForm>}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                getInputRef={unitAmountInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
                value={editableSubRow?.values?.unitAmount?.netAmount || ''}
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
        onClick={
          !disableInlineEditing ? () => handleEditStart('quantity') : undefined
        }>
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
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
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
            {formatQuantity(subItem?.quantity, {
              currency: currentCurrency?.code!,
              excludeCurrencySymbol: true,
              currencySymbol: currentCurrency?.symbol!,
              companyLang: selectedLng,
            })}
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
            if (!disableInlineEditing) {
              handleEditStart('vatId');
              vatRef.current?.focus();
            }
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
            name={`${pathBase}.unitAmount.vatId` as Path<TForm>}
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
                    const vatName = selectedTaxRate?.name || '';

                    updateVatForAllRelatedRows(
                      String(selectedVatId),
                      percentage,
                      vatName,
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
            {(() => {
              const {percentageVat} = resolveVatFromBackend(
                subItem.unitAmount?.vatId,
                subItem.unitAmount?.percentageVat,
                subItem.unitAmount?.vatName,
                taxRates ?? [],
              );
              return `${percentageVat}%`;
            })()}
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
            if (!disableInlineEditing) {
              handleEditStart('unit');
            }
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
            name={`${pathBase}.article.unit` as Path<TForm>}
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
                  value: (field.value as string) || '',
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
                      `${pathBase}.article.unit` as Path<TForm>,
                      selectedValue as PathValue<TForm, Path<TForm>>,
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

  const renderDiscountCell = useCallback(
    () => (
      <TableCell align="right" noPadding>
        <Typography
          sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
          {parentDiscount?.type === DiscountType.PERCENTAGE
            ? `${(parentDiscount?.percentage || 0).toFixed(2)}%`
            : ``}
        </Typography>
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
      netPriceDisplay,
      setValue,
    ],
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
          {netPriceDisplay}
        </Typography>
        {!disableInlineEditing ? (
          <Box
            sx={{borderLeft: '1px solid #e4e5e8'}}
            onClick={() => {
              setIsActionOpen(!isActionOpen);
            }}>
            <SubPositionActions
              onDelete={() => {
                onRemoveSubPosition(parentIndex, subIndex);
                setIsActionOpen(false);
                onRecalc();
                updateMainUnitPurchaseAmount();
              }}
              isOpen={isActionOpen}
            />
          </Box>
        ) : undefined}
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
      netPriceDisplay,
      setValue,
    ],
  );

  return {
    handleEditStart,
    handleSubPositionEditStart,
    renderDragCell,
    renderUserSeqNumberCell,
    renderNameCell,
    renderArticleTypeCell,
    renderUnitPurchaseAmountCell,
    renderMarginCell,
    renderUnitAmountCell,
    renderQuantityCell,
    renderVatIdCell,
    renderUnitCell,
    renderDiscountCell,
    renderTotalPriceCell,
  };
};

export default useSubPosition;
