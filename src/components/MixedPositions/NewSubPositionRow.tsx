import {FieldValues, UseFormReturn} from 'react-hook-form';
import {Dispatch, SetStateAction} from 'react';
import {VatView} from 'models/vat';
import {
  EditableInvoiceItem,
  EditableInvoiceSubItemRecord,
} from 'models/invoice';
import useSubPosition from 'hooks/useSubPosition';
import {EditableRowType} from 'components/MixedPositions/PositionTable';
import {EditableServiceOrderItem} from 'models/service-order';
import {EditableQuotationItem} from 'models/quotation';

interface Props<
  TForm extends {
    items: (
      | EditableQuotationItem
      | EditableInvoiceItem
      | EditableServiceOrderItem
    )[];
  } & FieldValues,
> {
  subItem: EditableInvoiceSubItemRecord;
  editableSubRow: EditableRowType | null;
  setEditableSubRow: Dispatch<SetStateAction<EditableRowType | null>>;
  parentIndex: number;
  subIndex: number;
  formMethods: UseFormReturn<TForm>;
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
  onRecalc: () => void;
  disableInlineEditing?: boolean;
  propertyOwnerId?: string;
}

const NewSubPositionRow = <
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
  formMethods,
  hoveredSubRowIndex,
  setHoveredSubRowIndex,
  editableSubRow,
  setEditableSubRow,
  taxRates,
  onDescriptionClick,
  showRightShadow,
  showLeftShadow,
  onRecalc,
  disableInlineEditing = false,
  propertyOwnerId,
}: Props<TForm>) => {
  const {control, setValue, getValues, watch} = formMethods;

  const {
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
  } = useSubPosition({
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
    disableInlineEditing,
    propertyOwnerId,
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
    </>
  );
};

export default NewSubPositionRow;
