import {UseFormReturn} from 'react-hook-form';
import {Typography} from '@mui/material';
import {Dispatch, SetStateAction} from 'react';
import TableCell from 'components/Table/TableCell';
import {VatView} from 'models/vat';
import {
  InvoiceFormData,
  EditableInvoiceSubItemRecord,
  InvoiceAmountDetail,
} from 'models/invoice';
import useSubPosition from 'hooks/useSubPosition';
import {EditableRowType} from './InvoicePositionTable';

interface Props {
  subItem: EditableInvoiceSubItemRecord;
  editableSubRow: EditableRowType | null;
  setEditableSubRow: Dispatch<SetStateAction<EditableRowType | null>>;
  parentIndex: number;
  subIndex: number;
  formMethods: UseFormReturn<InvoiceFormData>;
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
  onRecalcInvoice: () => void;
  invoiceAmountDetail?: InvoiceAmountDetail;
}

const InvoiceSubPositionRow = ({
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
  onRecalcInvoice,
  invoiceAmountDetail,
}: Props) => {
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
    onRecalc: onRecalcInvoice,
    taxRates,
    amountDetail: invoiceAmountDetail,
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
      <TableCell align="right" noPadding>
        <Typography sx={{paddingRight: '12px', fontSize: '14px'}}>-</Typography>
      </TableCell>
      {renderTotalPriceCell()}
    </>
  );
};

export default InvoiceSubPositionRow;
