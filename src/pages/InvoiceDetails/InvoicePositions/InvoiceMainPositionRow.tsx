import React, {Dispatch, SetStateAction, useState} from 'react';
import {UseFormReturn, useWatch} from 'react-hook-form';
import {
  InvoiceFormData,
  EditableInvoiceItem,
  InvoiceAmountDetail,
} from 'models/invoice';
import {Confirm} from 'components/Confirm';
import {VatView} from 'models/vat';
import useMainPosition from 'hooks/useMainPosition';
import {EditableRowType} from 'components/MixedPositions/PositionTable';

interface Props {
  item: EditableInvoiceItem;
  index: number;
  formMethods: UseFormReturn<InvoiceFormData>;
  setExpandedRows: React.Dispatch<React.SetStateAction<number[]>>;
  expandedRows: number[];
  onAddSubPosition: (parentIndex: number) => void;
  showRightShadow: boolean;
  showLeftShadow: boolean;
  serviceCompanyId: string;
  hoveredMainRowIndex: number | null;
  setHoveredMainRowIndex: Dispatch<SetStateAction<number | null>>;
  editableRow: EditableRowType | null;
  setEditableRow: React.Dispatch<React.SetStateAction<EditableRowType | null>>;
  taxRates?: VatView[];
  onDescriptionClick: (
    description: string,
    parentIndex: number,
    subIndex?: number,
  ) => void;
  onRecalcInvoice: () => void;
  invoiceAmountDetail?: InvoiceAmountDetail;
}

const MainPositionRow = ({
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
  onRecalcInvoice,
  invoiceAmountDetail,
}: Props) => {
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
    name: `items.${index}`,
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
  } = useMainPosition({
    index,
    item,
    serviceCompanyId,
    onRecalc: onRecalcInvoice,
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
    amountDetail: invoiceAmountDetail,
    setHoveredMainRowIndex,
    setExpandedRows,
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

      <Confirm
        maxWidth={400}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteConfirm();
          onRecalcInvoice();
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete position"
        content="You are about to remove this position permanently from this invoice. This action can't be undone. Do you want to proceed?"
      />
    </>
  );
};

export default MainPositionRow;
