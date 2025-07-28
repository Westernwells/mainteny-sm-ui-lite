import React, {Dispatch, SetStateAction, useState} from 'react';
import {FieldValues, Path, UseFormReturn, useWatch} from 'react-hook-form';
import {EditableInvoiceItem, InvoiceAmountDetail} from 'models/invoice';
import {Confirm} from 'components/Confirm';
import {VatView} from 'models/vat';
import useMainPosition from 'hooks/useMainPosition';
import {EditableRowType} from 'components/MixedPositions/PositionTable';
import {EditableQuotationItem, QuotationAmountDetail} from 'models/quotation';
import {
  EditableServiceOrderItem,
  ServiceOrderAmountDetail,
} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';

type AnyItem =
  | EditableInvoiceItem
  | EditableQuotationItem
  | EditableServiceOrderItem;

interface Props<TForm extends {items: AnyItem[]} & FieldValues> {
  index: number;
  item: TForm['items'][number];
  formMethods: UseFormReturn<TForm>;
  setExpandedRows: Dispatch<SetStateAction<number[]>>;
  expandedRows: number[];
  onAddSubPosition: (parentIndex: number) => void;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  serviceCompanyId: string;
  hoveredMainRowIndex: number | null;
  setHoveredMainRowIndex: Dispatch<SetStateAction<number | null>>;
  editableRow: EditableRowType | null;
  setEditableRow: Dispatch<SetStateAction<EditableRowType | null>>;
  taxRates?: VatView[];
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
  onRecalc: () => void;
  amountDetail?:
    | InvoiceAmountDetail
    | QuotationAmountDetail
    | ServiceOrderAmountDetail;
  disableInlineEditing?: boolean;
  propertyOwnerId?: string;
  customerData?: PropertyOwnerView;
}

const NewMainPositionRow = <
  TForm extends {
    items: (
      | EditableInvoiceItem
      | EditableQuotationItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
>({
  item,
  index,
  formMethods,
  showRightShadow,
  showLeftShadow,
  serviceCompanyId,
  hoveredMainRowIndex,
  setHoveredMainRowIndex,
  expandedRows,
  setExpandedRows,
  onAddSubPosition,
  editableRow,
  setEditableRow,
  taxRates,
  onDescriptionClick,
  onRecalc,
  amountDetail,
  disableInlineEditing = false,
  propertyOwnerId,
  customerData,
}: Props<TForm>) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const {
    control,
    setValue,
    getValues,
    watch,
    formState: {dirtyFields},
  } = formMethods;

  const watchedItem = useWatch({
    control,
    name: `items.${index}` as Path<TForm>,
  });

  const {
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
    confirmDialog,
  } = useMainPosition({
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
    propertyOwnerId,
    customerData,
  });

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
      {confirmDialog}

      <Confirm
        maxWidth={400}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteConfirm();
          onRecalc();
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete position"
        content="You are about to remove this position permanently from this invoice. This action can't be undone. Do you want to proceed?"
      />
    </>
  );
};

export default NewMainPositionRow;
