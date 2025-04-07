import {useEffect, Fragment, useMemo, useRef, useState} from 'react';
import {Box} from '@mui/material';
import {
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import {
  PositionRowQuotation,
  QuotationFormData,
  EditableQuotationItem,
  EditableQuotationSubItemRecord,
} from 'models/quotation';
import {Add} from '@mui/icons-material';
import TableContainer from 'components/Table/TableContainer';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import TableHeader from 'components/Table/TableHeader';
import TableCell from 'components/Table/TableCell';
import {TableColumnWithRender} from 'models/table';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useVats} from 'hooks/reactQuery/useVats';
import RichTextEditor from 'components/RichTextEditor';
import {Dialog} from 'components/Dialog';
import {calculateArticlesAmount} from 'utils/calculate-total';
import {ArticleType} from 'models/article';
import {getUniqueId} from 'utils/utils';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {extractClosestEdge} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SubPositionRow from './SubPositionRow';
import MainPositionRow from './MainPositionRow';
import MarginDetails from './MarginDetails';
import SubPositionFooter from './SubPositionFooter';
import DiscountPanel from './DiscountPanel';

export interface EditableRowType {
  index: number;
  parentIndex?: number;
  subIndex?: number;
  field: string;
  values:
    | Partial<EditableQuotationItem>
    | EditableQuotationSubItemRecord
    | null;
}

interface Props {
  formMethods: UseFormReturn<QuotationFormData>;
}

type DragData = {
  id: string;
  index: number;
  type: 'main' | 'sub';
  parentIndex?: number;
};

const PositionTable = ({formMethods}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const {data: taxRates} = useVats();

  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const {control, setValue, watch} = formMethods;
  const {fields, append, update, move} = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({control, name: 'items'});

  const currentCurrency = useCurrentCurrency();

  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredMainRowIndex, setHoveredMainRowIndex] = useState<number | null>(
    null,
  );
  const [hoveredSubRowIndex, setHoveredSubRowIndex] = useState<number | null>(
    null,
  );

  const [editableMixedRow, setEditableMixedRow] =
    useState<EditableRowType | null>(null);

  const [editableSubRow, setEditableSubRow] = useState<EditableRowType | null>(
    null,
  );

  const [descriptionDialog, setDescriptionDialog] = useState<{
    description: string;
    parentIndex: number;
    subIndex?: number;
  } | null>(null);

  const {control: descriptionControl, setValue: setDescriptionValue} = useForm<{
    description: string;
  }>({
    defaultValues: {description: ''},
  });

  const watchDescription = useWatch({
    control: descriptionControl,
    name: 'description',
  });

  const prevSeqNumbersRef = useRef<Record<number, string>>({});

  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const COLUMNS = useMemo<TableColumnWithRender<PositionRowQuotation>[]>(
    () => [
      {
        headerName: '',
        key: 'drag-cell-number',
        width: '1px',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: '#',
        width: '58px',
        key: 'position-cell-number',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Name',
        key: 'position-cell-name',
        width: '328px',
        isFirst: true,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Type',
        key: 'position-cell-type',
        width: '80px',
        align: 'center',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Buying price',
        key: 'position-cell-buying-price',
        width: '112px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Margin',
        key: 'position-cell-margin',
        width: '80px',
        align: 'right',
        noPadding: true,
        headerIcon: <InfoOutlinedIcon fontSize="small" />,
        headerIconTooltip:
          'Margin calculates the buying price against the unit price. Discount is currently not factored into the margin.',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Unit price',
        key: 'position-cell-unit-price',
        width: '98px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Qty',
        key: 'position-cell-quantity',
        width: '64px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'VAT (%)',
        key: 'position-cell-vat',
        width: '88px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Unit',
        key: 'position-cell-unit',
        align: 'right',
        width: '90px',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Discount',
        key: 'position-cell-discount',
        align: 'right',
        width: '100px',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Price (Net)',
        key: 'position-cell-net-price',
        width: '108px',
        align: 'right',
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const handleOpenDescriptionDialog = (
    parentIndex: number,
    subIndex?: number,
  ) => {
    const path =
      subIndex !== undefined
        ? `items.${parentIndex}.subItems.${subIndex}.description`
        : `items.${parentIndex}.description`;

    const existingDescription = watch(path as Path<QuotationFormData>) || '';

    setDescriptionValue(
      'description',
      existingDescription as Path<QuotationFormData>,
    );
    setDescriptionDialog({
      description: existingDescription as Path<QuotationFormData>,
      parentIndex,
      subIndex,
    });
  };

  const handleSaveDescription = () => {
    if (!descriptionDialog) return;

    const {parentIndex, subIndex} = descriptionDialog;

    const path =
      subIndex !== undefined
        ? `items.${parentIndex}.subItems.${subIndex}.description`
        : `items.${parentIndex}.description`;

    setValue(path as Path<QuotationFormData>, watchDescription);
    setDescriptionDialog(null);
  };

  const handleAddNewPosition = () => {
    const newIndex = fields.length;
    const defaultSeqNumber = (newIndex + 1).toString();

    const newItem: EditableQuotationItem = {
      id: getUniqueId(),
      userSeqNumber: defaultSeqNumber,
      name: '',
      quantity: 1,
      unitAmount: {
        netAmount: 0,
        percentageVat: 0,
        currency: currentCurrency.code,
      },
      unitPurchaseAmount: {
        netAmount: 0,
        percentageVat: 0,
        currency: currentCurrency.code,
      },
      article: undefined,
      subItems: [],
      description: '',
      discount: undefined,
      subItemsConfig: {subItemsVisible: false, priceVisible: false},
    };

    append(newItem);
    setEditableMixedRow({
      index: newIndex,
      field: `items.${newIndex}.name`,
      values: newItem,
    });
  };

  const handleAddSubPosition = (parentIndex: number) => {
    const itemsCopy = [...watch('items')];
    const parentItem = itemsCopy[parentIndex];
    if (!parentItem) return;

    if (!parentItem.subItems) {
      parentItem.subItems = [];
    }

    const parentSeq = parentItem.userSeqNumber || (parentIndex + 1).toString();
    const subIndex = parentItem.subItems.length;
    const defaultSubSeq = `${parentSeq}.${subIndex + 1}`;

    const newSub: EditableQuotationSubItemRecord = {
      id: getUniqueId(),
      userSeqNumber: defaultSubSeq,
      name: '',
      quantity: 1,
      unitAmount: {
        netAmount: 0,
        percentageVat: 0,
        currency: currentCurrency.code,
      },
      article: {},
    };

    parentItem.subItems.push(newSub);
    update(parentIndex, parentItem);

    if (!expandedRows.includes(parentIndex)) {
      setExpandedRows((prev) => [...prev, parentIndex]);
    }

    const newSubIndex = parentItem.subItems.length - 1;

    setEditableSubRow({
      index: parentIndex,
      parentIndex,
      subIndex: newSubIndex,
      field: `items.${parentIndex}.subItems.${newSubIndex}.name`,
      values: newSub,
    });
  };

  const {
    amountBeforeGlobalDiscount,
    amountAfterGlobalDiscount,
    amountAfterGlobalDiscountWithVAT,
  } = useMemo(
    () =>
      calculateArticlesAmount({
        items: watchedItems,
        globalDiscount: watch('discount'),
      }),
    [watchedItems, watch('discount')],
  );

  const amountBeforeGlobalDiscountFormatted = formatCurrency(
    amountBeforeGlobalDiscount,
    {currency: currentCurrency.code},
  );

  const amountAfterGlobalDiscountFormatted = formatCurrency(
    amountAfterGlobalDiscount,
    {currency: currentCurrency.code},
  );

  const amountAfterGlobalDiscountWithVATFormatted = formatCurrency(
    amountAfterGlobalDiscountWithVAT,
    {currency: currentCurrency.code},
  );

  useEffect(() => {
    const cleanup: Array<() => void> = [];

    fields.forEach((item, index) => {
      const mainRow = document.querySelector(
        `[data-testid="main-row-${index}"]`,
      ) as HTMLElement;
      if (!mainRow) return;

      cleanup.push(
        draggable({
          element: mainRow,
          dragHandle: mainRow.querySelector('.drag-handle') as HTMLElement,
          getInitialData: () =>
            ({
              id: item.id,
              index,
              type: 'main',
            } as DragData),
        }),
      );

      cleanup.push(
        dropTargetForElements({
          element: mainRow,
          onDragEnter: (args) => {
            const edge = extractClosestEdge(args);
            if (edge) {
              mainRow.setAttribute('data-edge', edge);
              mainRow.style.borderTop =
                edge === 'top' ? '2px solid #0052CC' : '';
              mainRow.style.borderBottom =
                edge === 'bottom' ? '2px solid #0052CC' : '';
            }
          },
          onDragLeave: () => {
            mainRow.removeAttribute('data-edge');
            mainRow.style.borderTop = '';
            mainRow.style.borderBottom = '';
          },
          onDrop: (args) => {
            const dragData = args.source.data as DragData;
            if (dragData?.type === 'main') {
              move(dragData.index, index);
            }
          },
        }),
      );

      if (expandedRows.includes(index) && item.subItems?.length) {
        item.subItems.forEach((subItem, subIndex) => {
          const subRow = document.querySelector(
            `[data-testid="sub-row-${index}-${subIndex}"]`,
          ) as HTMLElement;
          if (!subRow) return;

          cleanup.push(
            draggable({
              element: subRow,
              dragHandle: subRow.querySelector('.drag-handle') as HTMLElement,
              getInitialData: () =>
                ({
                  id: subItem.id,
                  parentIndex: index,
                  index: subIndex,
                  type: 'sub',
                } as DragData),
            }),
          );

          cleanup.push(
            dropTargetForElements({
              element: subRow,
              onDragEnter: (args) => {
                const edge = extractClosestEdge(args);
                if (edge) {
                  subRow.setAttribute('data-edge', edge);
                  subRow.style.borderTop =
                    edge === 'top' ? '2px solid #0052CC' : '';
                  subRow.style.borderBottom =
                    edge === 'bottom' ? '2px solid #0052CC' : '';
                }
              },
              onDragLeave: () => {
                subRow.removeAttribute('data-edge');
                subRow.style.borderTop = '';
                subRow.style.borderBottom = '';
              },
              onDrop: (args) => {
                const dragData = args.source.data as DragData;
                if (
                  dragData?.type === 'sub' &&
                  dragData.parentIndex === index
                ) {
                  const itemsCopy = [...watch('items')];
                  const subItems = [...(itemsCopy[index].subItems || [])];
                  const [movedItem] = subItems.splice(dragData.index, 1);
                  subItems.splice(subIndex, 0, movedItem);
                  itemsCopy[index].subItems = subItems;
                  update(index, itemsCopy[index]);
                }
              },
            }),
          );
        });
      }
    });

    return () => cleanup.forEach((fn) => fn());
  }, [fields, expandedRows, watch('items')]);

  useEffect(() => {
    watch('items')?.forEach(
      (mainItem: EditableQuotationItem, mainIndex: number) => {
        const prevSeq = prevSeqNumbersRef.current[mainIndex];

        if (prevSeq && prevSeq !== mainItem.userSeqNumber) {
          mainItem.subItems?.forEach((subItem, subIndex) => {
            const defaultOldSubSeq = `${prevSeq}.${subIndex + 1}`;
            if (subItem.userSeqNumber === defaultOldSubSeq) {
              const newSubSeq = `${mainItem.userSeqNumber}.${subIndex + 1}`;
              setValue(
                `items.${mainIndex}.subItems.${subIndex}.userSeqNumber`,
                newSubSeq,
              );
            }
          });
        }
        prevSeqNumbersRef.current[mainIndex] = mainItem.userSeqNumber ?? '';
      },
    );
  }, [watch('items'), setValue]);

  return (
    <>
      <Box
        sx={{
          border: '1px solid #222B451F',
          p: 2,
          my: 2,
          borderRadius: '4px',
        }}>
        <TableContainer
          containerRef={containerRef}
          setShowLeftShadow={setShowLeftShadow}
          setShowRightShadow={setShowRightShadow}>
          <TableHeader columns={COLUMNS} />

          <TableBody>
            {fields.map((item, index) => (
              <Fragment key={`${item.id}-${index}`}>
                <TableRow
                  testId={`main-row-${index}`}
                  sx={{
                    padding: '0px',
                    background: '#f7f9fc',
                  }}>
                  <MainPositionRow
                    item={item}
                    index={index}
                    formMethods={formMethods}
                    onAddSubPosition={() => handleAddSubPosition(index)}
                    setExpandedRows={setExpandedRows}
                    expandedRows={expandedRows}
                    editableRow={editableMixedRow}
                    setEditableRow={setEditableMixedRow}
                    showRightShadow={showRightShadow}
                    showLeftShadow={showLeftShadow}
                    serviceCompanyId={serviceCompanyId!}
                    taxRates={taxRates}
                    onDescriptionClick={() =>
                      handleOpenDescriptionDialog(index)
                    }
                    hoveredMainRowIndex={hoveredMainRowIndex}
                    setHoveredMainRowIndex={setHoveredMainRowIndex}
                  />
                </TableRow>

                {expandedRows.includes(index) &&
                  watchedItems[index]?.article?.type === ArticleType.MIX && (
                    <>
                      {watchedItems[index]?.subItems?.map(
                        (subItem, subIndex) => (
                          <TableRow
                            key={`${item.id}-${index}-${subIndex}`}
                            testId={`sub-row-${index}-${subIndex}`}>
                            <SubPositionRow
                              parentIndex={index}
                              subIndex={subIndex}
                              subItem={subItem}
                              control={control}
                              setValue={setValue}
                              formMethods={formMethods}
                              editableSubRow={editableSubRow}
                              setEditableSubRow={setEditableSubRow}
                              taxRates={taxRates}
                              onDescriptionClick={() =>
                                handleOpenDescriptionDialog(index, subIndex)
                              }
                              showRightShadow={showRightShadow}
                              showLeftShadow={showLeftShadow}
                              hoveredSubRowIndex={hoveredSubRowIndex}
                              setHoveredSubRowIndex={setHoveredSubRowIndex}
                            />
                          </TableRow>
                        ),
                      )}

                      <SubPositionFooter
                        index={index}
                        control={control}
                        setValue={setValue}
                        onAddSubPosition={() => handleAddSubPosition(index)}
                        isSubPositionVisible={watch(
                          `items.${index}.subItemsConfig.subItemsVisible`,
                        )}
                        isPriceVisible={watch(
                          `items.${index}.subItemsConfig.priceVisible`,
                        )}
                      />
                    </>
                  )}
              </Fragment>
            ))}
          </TableBody>
        </TableContainer>
      </Box>

      <Button
        label="Add Position"
        buttonProps={{
          variant: 'contained',
          size: 'small',
          onClick: handleAddNewPosition,
          sx: {
            fontWeight: 600,
            p: 1,
            my: 3,
          },
          startIcon: <Add />,
        }}
        testId="AddPosition"
      />

      <DiscountPanel
        formMethods={formMethods}
        amountBeforeGlobalDiscountFormatted={
          amountBeforeGlobalDiscountFormatted
        }
        amountBeforeGlobalDiscount={amountBeforeGlobalDiscount}
      />

      <MarginDetails
        mixedPositionItems={watchedItems}
        amountAfterGlobalDiscountFormatted={amountAfterGlobalDiscountFormatted}
        amountAfterGlobalDiscountWithVATFormatted={
          amountAfterGlobalDiscountWithVATFormatted
        }
      />

      <Dialog
        title={t('Description')}
        onCancel={() => setDescriptionDialog(null)}
        onSave={handleSaveDescription}
        dialogProps={{
          open: !!descriptionDialog,
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '750px',
            maxWidth: 'none',
            padding: '0em',
          },
        }}
        leftButton={
          <Button
            label="Cancel"
            buttonProps={{
              onClick: () => setDescriptionDialog(null),
              variant: 'outlined',
              size: 'medium',
              sx: {background: 'white'},
            }}
          />
        }
        showCancelButton={false}>
        <RichTextEditor
          label={t('Description')}
          name="description"
          control={descriptionControl}
          html={watchDescription}
          hasSignatureButton={false}
          hasAttachFileButton={false}
        />
      </Dialog>
    </>
  );
};

export default PositionTable;
