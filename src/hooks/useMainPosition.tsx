import {
  CreateArticleRecord,
  ArticleType,
  CreateArticleSubAssociationRecord,
  ArticleView,
  CostPackage,
} from 'models/article';
import {
  DiscountType,
  EditableInvoiceItem,
  EditableInvoiceSubItemRecord,
  InvoiceAmountDetail,
} from 'models/invoice';
import {
  EditableQuotationItem,
  EditableQuotationSubItemRecord,
  QuotationAmountDetail,
} from 'models/quotation';
import {ServiceCompanyNumberType} from 'models/service-company';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  centsToMoney,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {
  UseFormSetValue,
  UseFormGetValues,
  FieldValues,
  Path,
  PathValue,
  UseFormWatch,
  FormState,
  Controller,
  Control,
} from 'react-hook-form';
import {
  calculateMargin,
  getArticleTypesWithLabels,
  transformToSubPositionRow,
} from 'utils/article-utils';
import {VatView} from 'models/vat';
import TableCell from 'components/Table/TableCell';
import DragHandle from 'components/DragHandle';
import {FormInput} from 'components/form/FormInput';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NewArticleAutoComplete from 'components/NewArticleAutocomplete';
import {Receipt, ReceiptOutlined, NoteAltOutlined} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import {FormSelect} from 'components/form/FormSelect';
import {LanguageContext} from 'context/LanguageProvider';
import {removeHtmlTags} from 'utils/rich-field-string';
import {sanitizedTextStyles} from 'pages/Articles/Tabs/MixedPositions/MixedPosition.styles';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {useTheme} from '@mui/material/styles';
import {getIconByType} from 'pages/Articles/Tabs/MixedPositions';
import {NumericFormat} from 'react-number-format';
import {ReactComponent as DiscountPercentIcon} from 'assets/icons/DiscountPercentIcon.svg';
import NewArticleTypeCard from 'components/NewArticleTypeCard';
import {MeasurementUnit, createMeasurementOptions} from 'models/articleForm';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import MainPositionActions from 'components/MixedPositions/MainPositionActions';
import {EditableRowType} from 'components/MixedPositions/PositionTable';
import {
  EditableServiceOrderItem,
  EditableServiceOrderSubArticleRecord,
  ServiceOrderAmountDetail,
  ServiceOrderArticleOwnerType,
} from 'models/service-order';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import HdrAutoOutlinedIcon from '@mui/icons-material/HdrAutoOutlined';
import {
  fetchArticleSubAssociations,
  useCreateArticle,
  useCreateArticleMix,
} from './reactQuery/useArticle';
import {useCompanyNextNumber} from './reactQuery/useCompanies';
import {useSnackbar} from './useSnackbar';

interface MainPositionProps<
  TForm extends {
    items: (
      | EditableInvoiceItem
      | EditableQuotationItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
> {
  index: number;
  item: EditableQuotationItem | EditableInvoiceItem | EditableServiceOrderItem;
  serviceCompanyId: string;
  onRecalc: () => void;
  watch: UseFormWatch<TForm>;
  setValue: UseFormSetValue<TForm>;
  getValues: UseFormGetValues<TForm>;
  watchedItem:
    | EditableQuotationItem
    | EditableInvoiceItem
    | EditableServiceOrderItem;
  control: Control<TForm | any>;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  expandedRows: number[];
  hoveredMainRowIndex: number | null;
  editableRow: EditableRowType | null;
  setEditableRow: React.Dispatch<React.SetStateAction<EditableRowType | null>>;
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
  onAddSubPosition: (parentIndex: number) => void;
  setOpenDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  dirtyFields: FormState<TForm>['dirtyFields'];
  amountDetail?:
    | InvoiceAmountDetail
    | QuotationAmountDetail
    | ServiceOrderAmountDetail;
  taxRates?: VatView[];
  setHoveredMainRowIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setExpandedRows?: React.Dispatch<React.SetStateAction<number[]>>;
  disableInlineEditing?: boolean;
}

const useMainPosition = <
  TForm extends {
    items: (
      | EditableInvoiceItem
      | EditableQuotationItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
>({
  index,
  item,
  serviceCompanyId,
  onRecalc,
  watch,
  setValue,
  getValues,
  watchedItem,
  control,
  showRightShadow,
  showLeftShadow,
  expandedRows,
  hoveredMainRowIndex,
  onDescriptionClick,
  editableRow,
  setEditableRow,
  setOpenDeleteConfirm,
  onAddSubPosition,
  dirtyFields,
  taxRates,
  amountDetail,
  setHoveredMainRowIndex,
  setExpandedRows,
  disableInlineEditing,
}: MainPositionProps<TForm>) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const {enqueueSnackbar, showError} = useSnackbar();

  const {language: selectedLng} = useContext(LanguageContext);

  const defaultVat = taxRates?.find((tR) => tR.isDefault);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const inputRef = useRef(null);
  const unitPurchaseInputRef = useRef<HTMLInputElement>(null);
  const marginInputRef = useRef<HTMLInputElement>(null);
  const unitAmountInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);

  const isMixed = watchedItem.article?.type === ArticleType.MIX;

  const articleTypes = getArticleTypesWithLabels({
    excludeTypes: [],
  });

  const {data: nextCompanyNumber} = useCompanyNextNumber(
    {type: ServiceCompanyNumberType.ARTICLE},
    serviceCompanyId,
  );

  const {mutateAsync: createArticle} = useCreateArticle(
    t('Article created successfully'),
  );

  const {mutateAsync: createArticleMix} = useCreateArticleMix(
    'Mixed Position created successfully',
  );

  const handleEditType = () => {
    setEditableRow({
      index,
      field: `items.${index}.article.type`,
      values: item,
    });
  };

  const handleEditStart = (
    row: EditableQuotationItem | EditableInvoiceItem | EditableServiceOrderItem,
    field: string,
  ) => {
    const purchaseNetAmountCents =
      watch(`items.${index}.unitPurchaseAmount.netAmount` as Path<TForm>) ?? 0;

    const sellingNetAmountCents =
      watch(`items.${index}.unitAmount.netAmount` as Path<TForm>) ?? 0;

    const defaultVatProps = {vatId: defaultVat?.id, vatName: defaultVat?.name};

    if (field === `items.${index}.userSeqNumber`) {
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          userSeqNumber: row.userSeqNumber,
        },
      });
    } else if (field === `items.${index}.discount`) {
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
    } else if (field === `items.${index}.margin`) {
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
            currency: row?.unitPurchaseAmount?.currency || currentCurrency.code,
            ...defaultVatProps,
          },
          unitAmount: {
            ...row.unitAmount,
            netAmount: (row.unitAmount?.netAmount ?? 0) / 100,
            currency: row?.unitAmount?.currency || currentCurrency.code,
            ...defaultVatProps,
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
            currency: row?.unitPurchaseAmount?.currency || currentCurrency.code,
            ...defaultVatProps,
          },
          unitAmount: {
            ...row.unitAmount,
            netAmount: sellingNetAmountCents / 100,
            currency: row?.unitAmount?.currency || currentCurrency.code,
            ...defaultVatProps,
          },
        },
      });
    } else {
      setEditableRow({
        index,
        field,
        values: {
          ...row,
          [field]:
            row[
              field as keyof (
                | EditableQuotationItem
                | EditableInvoiceItem
                | EditableServiceOrderItem
              )
            ],
        },
      });
    }
  };

  const handleCellClick = ({
    indexPos,
    fieldName,
    row,
  }: {
    indexPos: number;
    fieldName: string;
    row: EditableQuotationItem | EditableInvoiceItem | EditableServiceOrderItem;
  }) => {
    setEditableRow({
      index: indexPos,
      field: fieldName,
      values: row,
    });
  };

  const handleToggleExpand = (rowIndex: number) => {
    if (setExpandedRows) {
      setExpandedRows((prev) =>
        prev.includes(rowIndex)
          ? prev.filter((id) => id !== rowIndex)
          : [...prev, rowIndex],
      );
    }
  };

  const handleDeleteConfirm = async () => {
    const items = getValues('items' as Path<TForm>);
    const updatedItems = items.filter(
      (_: PathValue<TForm, Path<TForm>>, i: number) => i !== index,
    );
    setValue('items' as Path<TForm>, updatedItems);
    enqueueSnackbar(t('Position was deleted'), {variant: 'error'});
  };

  const handleArticleSelection = async (
    selectedArticle: ArticleView | string,
  ) => {
    const isFreeText = typeof selectedArticle === 'string';
    const articleType = isFreeText ? null : selectedArticle.type;

    const name = isFreeText
      ? (selectedArticle as string)
      : selectedArticle.name;
    setValue(
      `items.${index}.name` as Path<TForm>,
      name as PathValue<TForm, Path<TForm>>,
    );
    setValue(
      `items.${index}.article.name` as Path<TForm>,
      name as PathValue<TForm, Path<TForm>>,
    );

    if (!isFreeText) {
      const defaultCostPackage: CostPackage | undefined =
        articleType === ArticleType.PACKAGE
          ? selectedArticle?.additionalInfo?.costPackage ?? {
              laborPercentage: 50,
              materialPercentage: 50,
            }
          : undefined;

      setValue(
        `items.${index}.article` as Path<TForm>,
        {
          ...selectedArticle,
          costPackage: defaultCostPackage,
        } as PathValue<TForm, Path<TForm>>,
      );

      setValue(
        `items.${index}.unitPurchaseAmount` as Path<TForm>,
        selectedArticle.unitPurchaseAmount as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `items.${index}.unitAmount` as Path<TForm>,
        selectedArticle.unitSellingAmount as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `items.${index}.description` as Path<TForm>,
        selectedArticle.description as PathValue<TForm, Path<TForm>>,
      );
    }

    if (articleType === ArticleType.MIX && !isFreeText) {
      try {
        const subs = await fetchArticleSubAssociations(selectedArticle.id);
        const subRows = subs.map(transformToSubPositionRow);
        setValue(
          `items.${index}.subItems` as Path<TForm>,
          subRows as PathValue<TForm, Path<TForm>>,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );

        setValue(
          `items.${index}.subItemsConfig.subItemsVisible` as Path<TForm>,
          true as PathValue<TForm, Path<TForm>>,
        );
        setValue(
          `items.${index}.subItemsConfig.priceVisible` as Path<TForm>,
          true as PathValue<TForm, Path<TForm>>,
        );

        if (setExpandedRows) {
          setExpandedRows((prev) =>
            prev.includes(index) ? prev : [...prev, index],
          );
        }
      } catch (err) {
        showError(err);
      }
    } else {
      setValue(
        `items.${index}.subItems` as Path<TForm>,
        [] as PathValue<TForm, Path<TForm>>,
      );
    }

    onRecalc();
    setEditableRow(null);
  };

  const handleSaveArticleType = (newType?: ArticleType) => {
    setValue(
      `items.${index}.article.type` as Path<TForm>,
      newType as PathValue<TForm, Path<TForm>>,
    );

    if (newType !== ArticleType.PACKAGE) {
      setValue(
        `items.${index}.article.costPackage` as Path<TForm>,
        undefined as PathValue<TForm, Path<TForm>>,
      );
    }

    if (newType === ArticleType.MIX) {
      const currentConfig =
        getValues(`items.${index}.subItemsConfig` as Path<TForm>) || {};

      setValue(
        `items.${index}.subItemsConfig` as Path<TForm>,
        {
          ...currentConfig,
          subItemsVisible: true,
          priceVisible: true,
        } as PathValue<TForm, Path<TForm>>,
      );
      if (setExpandedRows) {
        setExpandedRows((prev) =>
          prev.includes(index) ? prev : [...prev, index],
        );
      }
    } else {
      setValue(
        `items.${index}.subItems` as Path<TForm>,
        [] as PathValue<TForm, Path<TForm>>,
      );
    }

    setEditableRow(null);

    setAnchorEl(null);
  };

  const handleSaveToCatalogue = async (
    itemData:
      | EditableQuotationItem
      | EditableInvoiceItem
      | EditableServiceOrderItem,
  ) => {
    const baseStock = {
      currentStock: 1,
      minStock: 1,
      maxStock: 1,
      minOrderQuantity: 1,
    };

    const baseArticle: CreateArticleRecord = {
      serviceCompanyId,
      name: itemData.name || itemData.article?.name || '',
      description: itemData.description || '',
      externalId: nextCompanyNumber?.value || '',
      type: itemData.article!.type || ArticleType.OTHER,
      unit: itemData.article?.unit || '',
      unitPurchaseAmount: {
        netAmount: Number(itemData.unitPurchaseAmount?.netAmount),
        currency: itemData.unitPurchaseAmount?.currency || currentCurrency.code,
        percentageVat: itemData.unitPurchaseAmount?.percentageVat || 0,
        vatId: itemData.unitPurchaseAmount?.vatId,
        vatName: itemData.unitPurchaseAmount?.vatName,
      },
      unitSellingAmount: {
        netAmount: Number(itemData.unitAmount?.netAmount),
        currency: itemData.unitAmount?.currency || currentCurrency.code,
        percentageVat: itemData.unitAmount?.percentageVat || 0,
        vatId: itemData.unitAmount?.vatId,
        vatName: itemData.unitAmount?.vatName,
      },
      costPackage: itemData.article?.costPackage,
      model: '',
      category: '',
      subCategory: '',
      manufacturer: '',
      storageLocation: '',
      pictureUrls: [],
      stock: baseStock,
    };

    // If the article type is MIX we need to extract the sub items and format sub associations…
    if (itemData.article?.type === ArticleType.MIX) {
      const subAssociations: CreateArticleSubAssociationRecord[] = (
        itemData.subItems || []
      ).map((subItem) => ({
        quantity: subItem.quantity,
        article: {
          serviceCompanyId,
          name: subItem.article?.name || '',
          description: subItem.description || '',
          externalId: '',
          type: subItem.article?.type || ArticleType.OTHER,
          unit: subItem.article?.unit || '',
          unitPurchaseAmount: subItem.unitPurchaseAmount,
          unitSellingAmount: subItem.unitAmount,
          costPackage: subItem.article?.costPackage,
          model: '',
          category: '',
          subCategory: '',
          manufacturer: '',
          storageLocation: '',
          stock: baseStock,
        },
      }));

      await createArticleMix({article: baseArticle, subAssociations});
    } else {
      await createArticle(baseArticle);
    }

    onRecalc();
  };

  const handleSaveMixedPosition = async (field: string) => {
    if (!editableRow) return;

    const indexPos = editableRow.index;
    const currentItem = getValues(`items.${indexPos}` as Path<TForm>);
    const values = editableRow.values as
      | EditableQuotationItem
      | EditableInvoiceItem
      | EditableServiceOrderItem;
    let isDifferent = false;

    const updateAndMarkRecalc = () => {
      onRecalc();
      setEditableRow(null);
    };

    switch (field) {
      case `items.${index}.unitPurchaseAmount`: {
        const newEditableValue = values?.unitPurchaseAmount?.netAmount ?? 0;
        const currentValue = currentItem.unitPurchaseAmount?.netAmount ?? 0;

        if (
          typeof currentValue === 'number' &&
          currentValue === Math.round(newEditableValue * 100)
        ) {
          setEditableRow(null);
          break;
        }

        const netAmount = values?.unitPurchaseAmount?.netAmount ?? 0;
        setValue(
          `items.${index}.unitPurchaseAmount` as Path<TForm>,
          {
            netAmount: Math.round(netAmount * 100),
            currency:
              values?.unitPurchaseAmount?.currency || currentCurrency.code,
            vatId: values?.unitPurchaseAmount?.vatId || '',
            vatName: values?.unitPurchaseAmount?.vatName || '',
            percentageVat: values?.unitPurchaseAmount?.percentageVat || 0,
          } as PathValue<TForm, Path<TForm>>,
        );
        updateAndMarkRecalc();
        break;
      }

      case `items.${index}.unitAmount`: {
        const newEditableValue = values?.unitAmount?.netAmount ?? 0;
        const currentValue = currentItem.unitAmount?.netAmount ?? 0;

        if (
          typeof currentValue === 'number' &&
          currentValue === Math.round(newEditableValue * 100)
        ) {
          setEditableRow(null);
          break;
        }

        const netAmount = values?.unitAmount?.netAmount ?? 0;
        setValue(
          `items.${index}.unitAmount` as Path<TForm>,
          {
            netAmount: Math.round(netAmount * 100),
            currency: values?.unitAmount?.currency || currentCurrency.code,
            vatId: values?.unitAmount?.vatId || '',
            vatName: values?.unitAmount?.vatName || '',
            percentageVat: values?.unitAmount?.percentageVat || 0,
          } as PathValue<TForm, Path<TForm>>,
        );
        updateAndMarkRecalc();
        break;
      }

      case `items.${index}.margin`: {
        const marginValue = values?.margin ?? 0;
        const currentMargin = currentItem.margin ?? 0;
        const dirtyFieldsCast = dirtyFields as {items?: Array<TForm>};

        const isFieldDirty = dirtyFieldsCast.items?.[index]?.margin;

        isDifferent = marginValue !== currentMargin;

        if (isFieldDirty && isDifferent) {
          const purchaseAmount = currentItem.unitPurchaseAmount?.netAmount ?? 0;
          const newSellingPrice =
            (marginValue / 100) * purchaseAmount + purchaseAmount;

          setValue(
            `items.${index}.margin` as Path<TForm>,
            marginValue as PathValue<TForm, Path<TForm>>,
          );
          setValue(
            `items.${index}.unitAmount` as Path<TForm>,
            {
              netAmount: Math.round(newSellingPrice),
              currency: values?.unitAmount?.currency || currentCurrency.code,
              vatId: values?.unitAmount?.vatId || '',
              vatName: values?.unitAmount?.vatName || '',
              percentageVat: values?.unitAmount?.percentageVat || 0,
            } as PathValue<TForm, Path<TForm>>,
          );
          updateAndMarkRecalc();
        } else {
          setEditableRow(null);
        }

        break;
      }

      case `items.${index}.userSeqNumber`: {
        const newSeq = values?.userSeqNumber ?? '';
        const oldSeq = currentItem.userSeqNumber ?? '';
        const dirtyFieldsCast = dirtyFields as {items?: Array<TForm>};

        const isFieldDirty = dirtyFieldsCast?.items?.[index]?.userSeqNumber;

        if (isFieldDirty && isDifferent) {
          setValue(
            `items.${index}.userSeqNumber` as Path<TForm>,
            newSeq as PathValue<TForm, Path<TForm>>,
          );
        }
        isDifferent = newSeq !== oldSeq;

        if (isDifferent) {
          setValue(
            `items.${index}.userSeqNumber` as Path<TForm>,
            newSeq as PathValue<TForm, Path<TForm>>,
          );
          setEditableRow(null);
        } else {
          setEditableRow(null);
        }

        break;
      }

      default:
        setEditableRow(null);
        break;
    }
  };

  const handleVatChangeForMainRow = (selectedVatId: string) => {
    const selectedTaxRate = taxRates?.find((tax) => tax.id === selectedVatId);
    const percentage = selectedTaxRate?.percentage || 0;
    const parentPath = `items.${index}`;

    // Update main position's VAT fields
    setValue(
      `${parentPath}.unitAmount.vatId` as Path<TForm>,
      selectedVatId as PathValue<TForm, Path<TForm>>,
    );
    setValue(
      `${parentPath}.unitAmount.percentageVat` as Path<TForm>,
      percentage as PathValue<TForm, Path<TForm>>,
    );

    // Get the current subItems for this main row
    const subItemsPath = `${parentPath}.subItems` as Path<TForm>;

    const subItems =
      (getValues(subItemsPath) as (
        | EditableQuotationSubItemRecord
        | EditableInvoiceSubItemRecord
        | EditableServiceOrderSubArticleRecord
      )[]) || [];

    // Update VAT for each sub item
    subItems.forEach((_, subIdx) => {
      setValue(
        `${subItemsPath}.${subIdx}.unitAmount.vatId` as Path<TForm>,
        selectedVatId as PathValue<TForm, Path<TForm>>,
      );
      setValue(
        `${subItemsPath}.${subIdx}.unitAmount.percentageVat` as Path<TForm>,
        percentage as PathValue<TForm, Path<TForm>>,
      );
    });
  };

  const netPriceDisplay = useMemo(() => {
    const itemDetail = amountDetail?.items?.[index];
    if (!itemDetail) {
      return formatCurrency(centsToMoney(currentCurrency.code, 0), {
        currency: currentCurrency.code,
      });
    }

    const totalCents = itemDetail.amountAfterItemDiscount?.netAmount ?? 0;

    return formatCurrency(centsToMoney(currentCurrency.code, totalCents), {
      currency: currentCurrency.code,
    });
  }, [amountDetail, index, watchedItem.quantity, currentCurrency]);

  const renderDragCell = useCallback(
    () => (
      <TableCell
        noPadding
        sx={{
          width: '2px',
          cursor: !disableInlineEditing ? 'grab' : 'inherit',
          borderLeft: 'none',
        }}
        onMouseEnter={() => setHoveredMainRowIndex(index)}
        onMouseLeave={() => setHoveredMainRowIndex(null)}>
        {!disableInlineEditing && (
          <DragHandle
            isVisible={hoveredMainRowIndex === index}
            disableInlineEditing={disableInlineEditing}
          />
        )}
      </TableCell>
    ),
    [index, hoveredMainRowIndex, setHoveredMainRowIndex],
  );

  const renderUserSeqNumberCell = useCallback(
    () => (
      <TableCell
        noPadding
        onClick={
          !disableInlineEditing
            ? () => handleEditStart(watchedItem, `items.${index}.userSeqNumber`)
            : undefined
        }
        sx={{background: '#f7f9fc', maxWidth: '58px'}}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.userSeqNumber` ? (
          <FormInput
            containerStyles={{width: '100%'}}
            fieldProps={{
              autoFocus: true,
              onFocus: (e) => {
                e.target.setSelectionRange(0, 0);
              },
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
                  `items.${index}.userSeqNumber` as Path<TForm>,
                  editableRow.values?.userSeqNumber as PathValue<
                    TForm,
                    Path<TForm>
                  >,
                );
                setEditableRow(null);
              },
              onKeyDown: (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  setValue(
                    `items.${index}.userSeqNumber` as Path<TForm>,
                    editableRow.values?.userSeqNumber as PathValue<
                      TForm,
                      Path<TForm>
                    >,
                  );
                  handleCellClick({
                    indexPos: index,
                    fieldName: `items.${index}.name`,
                    row: item,
                  });
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
            title={watchedItem.userSeqNumber || index + 1}
            arrow
            placement="top">
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: '600',
                padding: '0px 12px',
                textWrap: 'wrap',
                textOverflow: 'ellipsis',
                overflow: 'auto',
              }}>
              {watchedItem.userSeqNumber || index + 1}
            </Typography>
          </Tooltip>
        )}
      </TableCell>
    ),
    [editableRow, index, inputRef, setEditableRow, setValue, watchedItem],
  );

  const renderNameCell = useCallback(
    () => (
      <TableCell
        noPadding
        onClick={
          !disableInlineEditing
            ? () =>
                handleCellClick({
                  indexPos: index,
                  fieldName: `items.${index}.name`,
                  row: item,
                })
            : undefined
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
            initialValue={watch('items' as Path<TForm>)?.[index]}
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
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(index);
                  }}>
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

            <Box sx={{display: 'flex'}}>
              {'ownerType' in watchedItem && (
                <IconButton sx={{py: 0}}>
                  {watchedItem?.ownerType ===
                    ServiceOrderArticleOwnerType.USER ||
                  watchedItem?.ownerType ===
                    ServiceOrderArticleOwnerType.CONTRACT ||
                  watchedItem?.ownerType ===
                    ServiceOrderArticleOwnerType.TRAVEL_WORK ? (
                    <Tooltip
                      title={
                        watchedItem?.ownerType ===
                          ServiceOrderArticleOwnerType.USER &&
                        watchedItem.ownerName?.trim()
                          ? `${t('Added by')} ${watchedItem.ownerName}`
                          : watchedItem?.ownerType ===
                              ServiceOrderArticleOwnerType.CONTRACT &&
                            watchedItem?.ownerName?.trim()
                          ? `${t('Added by contract')} ${
                              watchedItem?.ownerName
                            }`
                          : `${t('Added by Automation')}`
                      }
                      arrow
                      placement="top">
                      {watchedItem?.ownerType ===
                      ServiceOrderArticleOwnerType.USER ? (
                        <PersonOutlinedIcon />
                      ) : watchedItem?.ownerType ===
                        ServiceOrderArticleOwnerType.CONTRACT ? (
                        <TextSnippetOutlinedIcon />
                      ) : (
                        <HdrAutoOutlinedIcon />
                      )}
                    </Tooltip>
                  ) : null}
                </IconButton>
              )}

              <IconButton
                onClick={
                  !disableInlineEditing
                    ? (e) => {
                        e.stopPropagation();
                        onDescriptionClick(item.description || '', index);
                      }
                    : undefined
                }
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
      disableInlineEditing,
    ],
  );

  const renderArticleTypeCell = useCallback(
    () => (
      <TableCell
        align="center"
        noPadding
        testId={`article-type-${index}`}
        onClick={
          !disableInlineEditing
            ? (e) => {
                e.stopPropagation();
                if (
                  editableRow?.index === index &&
                  editableRow?.field === `items.${index}.article.type`
                ) {
                  setEditableRow(null);
                  setAnchorEl(null);
                } else {
                  handleEditType();
                  setAnchorEl(e.currentTarget);
                }
              }
            : undefined
        }>
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
            '&:focus-visible': {
              outline: 'none',
              border: `2px solid ${theme.palette.primary.main}`,
            },
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              handleEditStart(watchedItem, `items.${index}.unitPurchaseAmount`);
              unitPurchaseInputRef.current?.focus();
            }
          }}>
          {getIconByType(watchedItem.article?.type!)}
        </Box>
        {editableRow?.index === index &&
          editableRow?.field === `items.${index}.article.type` && (
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={(e) => {
                (e as React.SyntheticEvent).stopPropagation();
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
              <Box onClick={(e) => e.stopPropagation()}>
                <NewArticleTypeCard
                  onClose={() => {
                    if (setEditableRow) {
                      setEditableRow(null);
                    }
                    setAnchorEl(null);
                  }}
                  onSave={handleSaveArticleType}
                  initialValue={watchedItem?.article?.type}
                  articleTypes={articleTypes}
                  unitPrice={centsToMoney(
                    currentCurrency.code,
                    getValues(
                      `items.${index}.unitAmount.netAmount` as Path<TForm>,
                    ),
                  )}
                  packageCost={watchedItem.article?.costPackage}
                  onPackageCostChange={(costPackage) => {
                    setValue(
                      `items.${index}.article.costPackage` as Path<TForm>,
                      costPackage as PathValue<TForm, Path<TForm>>,
                    );
                  }}
                />
              </Box>
            </Popover>
          )}
      </TableCell>
    ),
    [anchorEl, articleTypes, editableRow, index, watchedItem],
  );

  const renderUnitPurchaseAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={
          !isMixed && !disableInlineEditing
            ? () =>
                handleEditStart(
                  watchedItem,
                  `items.${index}.unitPurchaseAmount`,
                )
            : undefined
        }>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.unitPurchaseAmount` ? (
          <Controller
            name={`items.${index}.unitPurchaseAmount.netAmount` as Path<TForm>}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                getInputRef={unitPurchaseInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
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
                    setEditableRow(null);
                    handleSaveMixedPosition(
                      `items.${index}.unitPurchaseAmount`,
                    );
                  },
                  onKeyDown: (
                    e: React.KeyboardEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveMixedPosition(
                        `items.${index}.unitPurchaseAmount`,
                      );
                      handleEditStart(watchedItem, `items.${index}.margin`);
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
    [editableRow, index, watchedItem, isMixed],
  );

  const renderMarginCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={
          !isMixed && !disableInlineEditing
            ? () => handleEditStart(watchedItem, `items.${index}.margin`)
            : undefined
        }>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.margin` ? (
          <NumericFormat
            autoFocus
            getInputRef={marginInputRef}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.setSelectionRange(0, 0);
              }, 0);
            }}
            value={editableRow.values?.margin || ''}
            onValueChange={({floatValue}) => {
              const marginValue = floatValue ?? 0;

              const purchaseCents =
                watchedItem?.unitPurchaseAmount?.netAmount || 0;

              const newSellingPriceCents = Math.round(
                purchaseCents * (1 + marginValue / 100),
              );

              setEditableRow((prev) => ({
                ...prev!,
                values: {
                  ...prev!.values,
                  margin: marginValue,
                  unitAmount: {
                    ...prev!.values?.unitAmount,
                    netAmount: newSellingPriceCents,
                    currency: currentCurrency.code,
                  },
                },
              }));

              setValue(
                `items.${index}.unitAmount.netAmount` as Path<TForm>,
                newSellingPriceCents as PathValue<TForm, Path<TForm>>,
              );
              setValue(
                `items.${index}.margin` as Path<TForm>,
                marginValue as PathValue<TForm, Path<TForm>>,
              );
            }}
            customInput={TextField}
            suffix="%"
            decimalScale={0}
            fixedDecimalScale
            InputProps={{
              onBlur: () => {
                setEditableRow(null);
                handleSaveMixedPosition(`items.${index}.margin`);
              },
              onKeyDown: (
                e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveMixedPosition(`items.${index}.margin`);
                  handleEditStart(watchedItem, `items.${index}.unitAmount`);
                  unitAmountInputRef.current?.focus();
                }
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
              return `${margin.toFixed(0)}%`;
            })()}
          </Typography>
        )}
      </TableCell>
    ),
    [editableRow, index, watchedItem, isMixed],
  );

  const renderUnitAmountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        onClick={
          !isMixed && !disableInlineEditing
            ? () => handleEditStart(watchedItem, `items.${index}.unitAmount`)
            : undefined
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
                getInputRef={unitAmountInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
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
                    setEditableRow(null);
                    handleSaveMixedPosition(`items.${index}.unitAmount`);
                  },
                  onKeyDown: (
                    e: React.KeyboardEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveMixedPosition(`items.${index}.unitAmount`);
                      handleEditStart(watchedItem, `items.${index}.quantity`);
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
    [editableRow, index, watchedItem, isMixed],
  );

  const renderQuantityCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        testId={`position-quantity-${index}`}
        onClick={() => handleEditStart(watchedItem, `items.${index}.quantity`)}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.quantity` ? (
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({field}) => (
              <NumericFormat
                {...field}
                autoFocus
                getInputRef={quantityInputRef}
                onFocus={(e) => {
                  e.target.setSelectionRange(0, 0);
                }}
                value={field.value || 0}
                onValueChange={({floatValue}) => {
                  setValue(
                    `items.${index}.quantity` as Path<TForm>,
                    (floatValue || 0) as PathValue<TForm, Path<TForm>>,
                  );
                }}
                customInput={TextField}
                allowLeadingZeros={false}
                decimalScale={2}
                fixedDecimalScale
                size="small"
                InputProps={{
                  onBlur: () => {
                    setEditableRow(null);
                    onRecalc();
                  },
                  onKeyDown: (
                    e: React.KeyboardEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      onRecalc();
                      setEditableRow({
                        index,
                        field: `items.${index}.unitAmount.vatId`,
                        values: item,
                      });
                      vatRef.current?.focus();
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
          <Typography
            sx={{paddingRight: '12px', fontSize: '14px', fontWeight: '600'}}>
            {watchedItem.quantity || 0}
          </Typography>
        )}
      </TableCell>
    ),
    [editableRow, index, watchedItem, isMixed],
  );

  const renderVatIdCell = useCallback(
    () => (
      <TableCell
        noPadding
        align="right"
        testId={`vat-dropdown-table-cell-${index}`}
        onClick={() => {
          if (
            !(
              editableRow?.index === index &&
              editableRow?.field === `items.${index}.unitAmount.vatId`
            )
          ) {
            if (!disableInlineEditing) {
              setEditableRow({
                index,
                field: `items.${index}.unitAmount.vatId`,
                values: item,
              });
              vatRef.current?.focus();
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            handleCellClick({
              indexPos: index,
              fieldName: `items.${index}.unitAmount.vatId`,
              row: item,
            });
            onRecalc();
            vatRef.current?.focus();
          }
        }}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.unitAmount.vatId` ? (
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
                  open={
                    editableRow?.index === index &&
                    editableRow?.field === `items.${index}.unitAmount.vatId`
                  }
                  onClose={() => setEditableRow(null)}
                  onChange={(event) => {
                    const selectedVatId = event.target.value;
                    handleVatChangeForMainRow(selectedVatId);
                    onRecalc();
                    setEditableRow(null);
                  }}
                  onBlur={(event) => {
                    const selectedVatId = event.target.value;
                    handleVatChangeForMainRow(selectedVatId);
                    setEditableRow(null);
                  }}
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
    [editableRow, index, taxRates, watchedItem],
  );

  const renderUnitCell = useCallback(
    () => (
      <TableCell
        noPadding
        align="right"
        onClick={() => {
          if (
            !(
              editableRow?.index === index &&
              editableRow?.field === `items.${index}.article.unit`
            )
          ) {
            if (!disableInlineEditing) {
              handleCellClick({
                indexPos: index,
                fieldName: `items.${index}.article.unit`,
                row: item,
              });
              unitRef.current?.focus();
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            handleEditStart(watchedItem, `items.${index}.discount`);
            discountRef.current?.focus();
          }
        }}>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.article.unit` ? (
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
                  open:
                    editableRow?.index === index &&
                    editableRow?.field === `items.${index}.article.unit`,
                  sx: {
                    width: '100%',
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                  onChange: (event) => {
                    const selectedValue = event.target.value as string;
                    setValue(
                      `items.${index}.article.unit` as Path<TForm>,
                      selectedValue as PathValue<TForm, Path<TForm>>,
                    );
                    setEditableRow(null);
                  },
                  onBlur: () => setEditableRow(null),
                  onClose: () => {
                    setEditableRow(null);
                  },
                }}
                labelId="unit-field"
              />
            )}
          />
        ) : (
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: '600',
              paddingRight: '12px',
            }}>
            {watchedItem.article?.unit ? t(watchedItem.article.unit) : '-'}
          </Typography>
        )}
      </TableCell>
    ),
    [index, editableRow, watchedItem, item],
  );

  const renderDiscountCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        testId={`discount-${index}`}
        onClick={
          !disableInlineEditing
            ? () => handleEditStart(watchedItem, `items.${index}.discount`)
            : undefined
        }>
        {editableRow?.index === index &&
        editableRow?.field === `items.${index}.discount` ? (
          <NumericFormat
            name={`items.${index}.discount`}
            value={
              (
                editableRow.values as
                  | EditableQuotationItem
                  | EditableInvoiceItem
                  | EditableServiceOrderItem
              )?.discount?.type === DiscountType.AMOUNT
                ? (
                    editableRow.values as
                      | EditableQuotationItem
                      | EditableInvoiceItem
                      | EditableServiceOrderItem
                  )?.discount?.amount?.value
                : (
                    editableRow.values as
                      | EditableQuotationItem
                      | EditableInvoiceItem
                      | EditableServiceOrderItem
                  )?.discount?.percentage
            }
            getInputRef={discountRef}
            autoFocus
            onFocus={(e) => {
              e.target.setSelectionRange(0, 0);
            }}
            isAllowed={(values) => {
              const {floatValue} = values;
              if (!floatValue) return true;
              if (floatValue < 0) return false;
              const maxDiscount =
                (
                  editableRow.values as
                    | EditableQuotationItem
                    | EditableInvoiceItem
                    | EditableServiceOrderItem
                ).discount?.type === DiscountType.AMOUNT
                  ? ((watchedItem?.unitAmount?.netAmount ?? 0) *
                      Number(watchedItem.quantity)) /
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
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentDiscount = (
                      editableRow?.values as
                        | EditableQuotationItem
                        | EditableInvoiceItem
                        | EditableServiceOrderItem
                    )?.discount;
                    const newType =
                      currentDiscount?.type === DiscountType.AMOUNT
                        ? DiscountType.PERCENTAGE
                        : DiscountType.AMOUNT;

                    const newDiscount =
                      newType === DiscountType.AMOUNT
                        ? {
                            type: DiscountType.AMOUNT,
                            amount: currentDiscount?.amount || {
                              value: 0,
                              currency: currentCurrency.code,
                              fractionDigits: currentCurrency.fractionDigits,
                            },
                            percentage: 0,
                          }
                        : {
                            type: DiscountType.PERCENTAGE,
                            percentage: currentDiscount?.percentage || 0,
                          };

                    setValue(
                      `items.${index}.discount` as Path<TForm>,
                      newDiscount as PathValue<TForm, Path<TForm>>,
                    );
                    setEditableRow((prev) =>
                      prev
                        ? {
                            ...prev,
                            values: {...prev.values, discount: newDiscount},
                          }
                        : null,
                    );
                  }}
                  size="small">
                  {watch(`items.${index}.discount.type` as Path<TForm>) ===
                  DiscountType.AMOUNT ? (
                    <PaymentsOutlinedIcon />
                  ) : (
                    <DiscountPercentIcon
                      style={{width: '20px', height: '20px'}}
                    />
                  )}
                </InputAdornment>
              ),
              onBlur: () => {
                const sanitizedDiscount =
                  (
                    editableRow.values as
                      | EditableQuotationItem
                      | EditableInvoiceItem
                      | EditableServiceOrderItem
                  ).discount?.type === DiscountType.AMOUNT
                    ? {
                        type: DiscountType.AMOUNT,
                        amount: (
                          editableRow.values as
                            | EditableQuotationItem
                            | EditableInvoiceItem
                            | EditableServiceOrderItem
                        )?.discount?.amount,
                        percentage: 0,
                      }
                    : {
                        type: DiscountType.PERCENTAGE,
                        percentage: (
                          editableRow.values as
                            | EditableQuotationItem
                            | EditableInvoiceItem
                            | EditableServiceOrderItem
                        )?.discount?.percentage,
                      };
                setValue(
                  `items.${index}.discount` as Path<TForm>,
                  sanitizedDiscount as PathValue<TForm, Path<TForm>>,
                );
                onRecalc();
                setEditableRow(null);
              },
              onKeyDown: (
                e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  setIsActionOpen(true);
                }
              },
            }}
            onValueChange={(values) => {
              const {floatValue} = values;
              setEditableRow((prev) => ({
                ...prev!,
                values: {
                  ...prev!.values,
                  discount: {
                    ...(
                      prev!.values as
                        | EditableQuotationItem
                        | EditableInvoiceItem
                        | EditableServiceOrderItem
                    )?.discount!,
                    ...((
                      prev!.values as
                        | EditableQuotationItem
                        | EditableInvoiceItem
                        | EditableServiceOrderItem
                    )?.discount?.type === DiscountType.AMOUNT
                      ? {
                          type: DiscountType.AMOUNT,
                          amount: {
                            value: floatValue || 0,
                            currency: currentCurrency.code,
                            fractionDigits: currentCurrency.fractionDigits,
                          },
                        }
                      : {
                          type: DiscountType.PERCENTAGE,
                          percentage: floatValue || 0,
                        }),
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
    [editableRow, index, watchedItem, currentCurrency],
  );

  const renderTotalPriceCell = useCallback(
    () => (
      <TableCell
        align="right"
        noPadding
        isLast
        lastSticky
        showShadows={showLeftShadow ? 'left' : undefined}
        sx={{
          background: '#f7f9fc',
          paddingLeft: '12px',
          minWidth: '180px',
          '& > div': {
            alignItems: 'center',
          },
        }}>
        <Typography sx={{fontWeight: 600, padding: '0px 12px'}}>
          {netPriceDisplay}
        </Typography>
        {!disableInlineEditing && (
          <Box
            sx={{borderLeft: '1px solid #e4e5e8'}}
            onClick={() => {
              setIsActionOpen(!isActionOpen);
            }}>
            <MainPositionActions
              isMixedType={watchedItem.article?.type === ArticleType.MIX}
              onCreateMixedPosition={() => {
                setValue(
                  `items.${index}.article.type` as Path<TForm>,
                  ArticleType.MIX as PathValue<TForm, Path<TForm>>,
                );
                const currentConfig =
                  getValues(`items.${index}.subItemsConfig` as Path<TForm>) ||
                  {};
                setValue(
                  `items.${index}.subItemsConfig` as Path<TForm>,
                  {
                    ...currentConfig,
                    subItemsVisible: true,
                    priceVisible: true,
                  } as PathValue<TForm, Path<TForm>>,
                );
                if (setExpandedRows) {
                  setExpandedRows((prev) =>
                    prev.includes(index) ? prev : [...prev, index],
                  );
                }
                onRecalc();
                setEditableRow(null);
                setAnchorEl(null);
                setIsActionOpen(false);
              }}
              onAddSubPosition={() => {
                onAddSubPosition(index);
                setIsActionOpen(false);
              }}
              onSaveToCatalogue={() => {
                const itemData = getValues(`items.${index}` as Path<TForm>);
                handleSaveToCatalogue(itemData);
                setIsActionOpen(false);
              }}
              onDelete={() => {
                setOpenDeleteConfirm(true);
                setIsActionOpen(false);
              }}
              isOpen={isActionOpen}
            />
          </Box>
        )}
      </TableCell>
    ),
    [
      editableRow,
      expandedRows,
      index,
      showLeftShadow,
      isActionOpen,
      netPriceDisplay,
      watchedItem.quantity,
    ],
  );

  return {
    handleDeleteConfirm,
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

export default useMainPosition;
