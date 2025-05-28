import {EditableRowType} from 'components/MixedPositions/PositionTable';
import TableCell from 'components/Table/TableCell';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useVats} from 'hooks/reactQuery/useVats';
import {Discount, DiscountType, PositionRowInvoice} from 'models/invoice';
import {
  EditableServiceOrderItem,
  EditableServiceOrderSubArticleRecord,
  ServiceOrderAmountDetail,
  ServiceOrderView,
} from 'models/service-order';
import {DragData, TableColumnWithRender} from 'models/table';
import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {
  Path,
  UseFormReturn,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {getUniqueId} from 'utils/utils';
import {ArticleType} from 'models/article';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {extractClosestEdge} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {useCurrentCurrency, formatCurrency, centsToMoney} from 'utils/currency';
import {Dialog} from 'components/Dialog';
import RichTextEditor from 'components/RichTextEditor';
import {Button} from 'components/Button';
import MarginDetails from 'components/MixedPositions/MarginDetails';
import DiscountPanel from 'components/MixedPositions/DiscountPanel';
import {Add} from '@mui/icons-material';
import {Box} from '@mui/material';
import TableHeader from 'components/Table/TableHeader';
import TableContainer from 'components/Table/TableContainer';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import SubPositionFooter from 'components/MixedPositions/SubPositionFooter';
import {dialogPaperStyles} from 'components/MixedPositions/MixedPositions.styles';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import NewSubPositionRow from '../../../../../components/MixedPositions/NewSubPositionRow';
import NewMainPositionRow from '../../../../../components/MixedPositions/NewMainPosition';

type Props = {
  formMethods: UseFormReturn<{
    items: EditableServiceOrderItem[];
    discount?: Discount;
  }>;
  onRecalcServiceOrder: () => void;
  serviceOrderAmountDetail?: ServiceOrderAmountDetail;
  onAddPosition: () => void;
  disableInlineEditing?: boolean;
  autoOpenAdd?: boolean;
  onEditDiscount?: () => void;
  serviceOrder?: ServiceOrderView;
};

const ServiceOrderPositionTable = ({
  formMethods,
  onRecalcServiceOrder,
  serviceOrderAmountDetail,
  disableInlineEditing = false,
  onAddPosition,
  autoOpenAdd = false,
  onEditDiscount,
  serviceOrder,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const {data: taxRates} = useVats();

  const defaultVat = taxRates?.find((tR) => tR.isDefault);

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

  const {data: customerData} = useGetCustomer(
    serviceOrder?.elevator?.propertyOwner?.id,
  );

  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const COLUMNS = useMemo<TableColumnWithRender<PositionRowInvoice>[]>(
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

    const existingDescription =
      watch(
        path as Path<{items: EditableServiceOrderItem[]; discount?: Discount}>,
      ) || '';

    setDescriptionValue(
      'description',
      existingDescription as Path<{
        items: EditableServiceOrderItem[];
        discount?: Discount;
      }>,
    );
    setDescriptionDialog({
      description: existingDescription as Path<{
        items: EditableServiceOrderItem[];
        discount?: Discount;
      }>,
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

    setValue(
      path as Path<{items: EditableServiceOrderItem[]; discount?: Discount}>,
      watchDescription,
    );
    setDescriptionDialog(null);
  };

  const handleAddNewPosition = () => {
    const customerVatProps = customerData?.additionalInfo?.vat
      ? {
          percentageVat: customerData.additionalInfo.vat.percentage,
          vatId: customerData.additionalInfo.vat.id,
          vatName: customerData.additionalInfo.vat.name,
        }
      : {
          percentageVat: defaultVat?.percentage,
          vatId: defaultVat?.id,
          vatName: defaultVat?.name,
        };

    const defaultProps = {
      netAmount: 0,
      currency: currentCurrency.code,
      ...customerVatProps,
    };

    const newItem: EditableServiceOrderItem = {
      id: getUniqueId(),
      name: '',
      quantity: 1,
      unitAmount: defaultProps,
      unitPurchaseAmount: defaultProps,
      article: {
        type: ArticleType.OTHER,
        unit: 'kg',
        unitSellingAmount: defaultProps,
        unitPurchaseAmount: defaultProps,
        name: '',
        externalId: '',
      },
      subItems: [],
      description: '',
      discount: {
        type: DiscountType.PERCENTAGE,
        percentage: 0,
      },
      subItemsConfig: {subItemsVisible: false, priceVisible: false},
    };

    append(newItem);
  };

  const handleAddSubPosition = (parentIndex: number) => {
    const itemsCopy = [...watchedItems];
    const parentItem = itemsCopy[parentIndex];
    if (!parentItem) return;

    if (!parentItem.subItems) {
      parentItem.subItems = [];
    }

    const parentSeq = parentItem.userSeqNumber || (parentIndex + 1).toString();
    const subIndex = parentItem.subItems.length;
    const defaultSubSeq = `${parentSeq}.${subIndex + 1}`;

    const customerVatProps = customerData?.additionalInfo?.vat
      ? {
          percentageVat: customerData.additionalInfo.vat.percentage,
          vatId: customerData.additionalInfo.vat.id,
          vatName: customerData.additionalInfo.vat.name,
        }
      : {
          percentageVat: defaultVat?.percentage,
          vatId: defaultVat?.id,
          vatName: defaultVat?.name,
        };

    const defaultProps = {
      netAmount: 0,
      currency: currentCurrency.code,
      ...customerVatProps,
    };

    const newSub: EditableServiceOrderSubArticleRecord = {
      id: getUniqueId(),
      userSeqNumber: defaultSubSeq,
      name: '',
      quantity: 1,
      unitAmount: defaultProps,
      unitPurchaseAmount: defaultProps,
      article: {
        type: ArticleType.OTHER,
        unit: 'kg',
      },
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
    amountBeforeGlobalDiscountFormatted,
    amountBeforeGlobalDiscountInMoney,
    amountAfterGlobalDiscountFormatted,
    amountAfterGlobalDiscountWithVATFormatted,
    vats,
  } = useMemo(() => {
    const before = serviceOrderAmountDetail?.amountBeforeGlobalDiscount;
    const after = serviceOrderAmountDetail?.amountAfterGlobalDiscount;
    const afterVats = serviceOrderAmountDetail?.amountAfterGlobalDiscount.vats;

    return {
      amountBeforeGlobalDiscountFormatted: formatCurrency(
        centsToMoney(currentCurrency.code, before?.netAmount ?? 0),
        {currency: currentCurrency.code},
      ),
      amountBeforeGlobalDiscountInMoney: centsToMoney(
        currentCurrency.code,
        before?.netAmount ?? 0,
      ),
      amountAfterGlobalDiscountFormatted: formatCurrency(
        centsToMoney(currentCurrency.code, after?.netAmount ?? 0),
        {currency: currentCurrency.code},
      ),
      amountAfterGlobalDiscountWithVATFormatted: formatCurrency(
        centsToMoney(currentCurrency.code, after?.grossAmount ?? 0),
        {currency: currentCurrency.code},
      ),
      vats: afterVats,
    };
  }, [serviceOrderAmountDetail, currentCurrency]);

  useEffect(() => {
    if (disableInlineEditing) return;

    const root = containerRef.current;
    if (!root) return;

    const cleanup: Array<() => void> = [];

    fields.forEach((item, index) => {
      const mainRow = root.querySelector(
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
          const subRow = root.querySelector(
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
                  const itemsCopy = [...watchedItems];
                  const subItems = [...(itemsCopy[index].subItems || [])];
                  const [movedItem] = subItems.splice(dragData.index, 1);
                  subItems.splice(subIndex, 0, movedItem);
                  itemsCopy[index].subItems = subItems;
                  update(index, itemsCopy[index]);
                  itemsCopy[index].subItems?.forEach((_, j) => {
                    setValue(
                      `items.${index}.subItems.${j}.userSeqNumber`,
                      `${index + 1}.${j + 1}` as any,
                    );
                  });
                }
              },
            }),
          );
        });
      }
    });

    return () => cleanup.forEach((fn) => fn());
  }, [fields, expandedRows, watchedItems, disableInlineEditing, autoOpenAdd]);

  useEffect(() => {
    if (autoOpenAdd) {
      handleAddNewPosition();
    }
  }, [autoOpenAdd]);

  return (
    <>
      {' '}
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
            {watchedItems?.map((item, index) => (
              <Fragment key={`${item.id}-${index}`}>
                <TableRow
                  testId={`main-row-${index}`}
                  sx={{
                    padding: '0px',
                    background: '#f7f9fc',
                  }}>
                  <NewMainPositionRow<{
                    items: EditableServiceOrderItem[];
                    discount?: Discount;
                  }>
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
                    onRecalc={onRecalcServiceOrder}
                    amountDetail={serviceOrderAmountDetail}
                    disableInlineEditing={disableInlineEditing}
                    propertyOwnerId={serviceOrder?.elevator?.propertyOwner?.id}
                    customerData={customerData}
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
                            <NewSubPositionRow<{
                              items: EditableServiceOrderItem[];
                              discount?: Discount;
                            }>
                              parentIndex={index}
                              subIndex={subIndex}
                              subItem={subItem}
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
                              onRecalc={onRecalcServiceOrder}
                              disableInlineEditing={disableInlineEditing}
                              propertyOwnerId={
                                serviceOrder?.elevator?.propertyOwner?.id
                              }
                            />
                          </TableRow>
                        ),
                      )}

                      <SubPositionFooter<{
                        items: EditableServiceOrderItem[];
                        discount?: Discount;
                      }>
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
                        disableInlineEditing={disableInlineEditing}
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
          onClick: disableInlineEditing ? onAddPosition : handleAddNewPosition,
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
        amountBeforeGlobalDiscount={amountBeforeGlobalDiscountInMoney}
        onRecalc={onRecalcServiceOrder}
        disableInlineEditing={disableInlineEditing}
        onEditDiscount={onEditDiscount}
      />
      <MarginDetails
        mixedPositionItems={watchedItems}
        amountAfterGlobalDiscountFormatted={amountAfterGlobalDiscountFormatted}
        amountAfterGlobalDiscountWithVATFormatted={
          amountAfterGlobalDiscountWithVATFormatted
        }
        vats={vats}
      />
      <Dialog
        title={t('Description')}
        onCancel={() => setDescriptionDialog(null)}
        onSave={handleSaveDescription}
        dialogProps={{
          open: !!descriptionDialog,
          maxWidth: 'lg',
          disableEscapeKeyDown: true,
          onClose: (event, reason) => {
            if (reason === 'backdropClick') {
              return;
            }
            setDescriptionDialog(null);
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            ...dialogPaperStyles,
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

export default ServiceOrderPositionTable;
