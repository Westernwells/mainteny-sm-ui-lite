import React, {Dispatch, SetStateAction, useState} from 'react';
import {UseFormReturn, useWatch} from 'react-hook-form';
import {
  QuotationFormData,
  EditableQuotationItem,
  QuotationAmountDetail,
} from 'models/quotation';
import {Confirm} from 'components/Confirm';
import {VatView} from 'models/vat';
import useMainPosition from 'hooks/useMainPosition';
import {EditableRowType} from './PositionTable';

interface Props {
  item: EditableQuotationItem;
  index: number;
  formMethods: UseFormReturn<QuotationFormData>;
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
  onRecalcQuotation: () => void;
  quotationAmountDetail?: QuotationAmountDetail;
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
  editableRow,
  setEditableRow,
  expandedRows,
  setExpandedRows,
  onAddSubPosition,
  taxRates,
  onDescriptionClick,
  onRecalcQuotation,
  quotationAmountDetail,
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
    onRecalc: onRecalcQuotation,
    watch,
    setValue,
    getValues,
    watchedItem,
    control,
    showRightShadow,
    showLeftShadow,
    expandedRows,
    hoveredMainRowIndex,
    editableRow,
    setEditableRow,
    onDescriptionClick,
    setOpenDeleteConfirm,
    onAddSubPosition,
    dirtyFields,
    taxRates,
    amountDetail: quotationAmountDetail,
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
          onRecalcQuotation();
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete position"
        content="You are about to remove this position permanently from this quotation. This action can't be undone. Do you want to proceed?"
      />
    </>
  );
};

export default MainPositionRow;
