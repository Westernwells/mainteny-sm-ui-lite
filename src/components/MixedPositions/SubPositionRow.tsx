import {UseFormReturn} from 'react-hook-form';
import {Typography} from '@mui/material';
import {
  QuotationFormData,
  EditableQuotationSubItemRecord,
  QuotationAmountDetail,
} from 'models/quotation';
import {Dispatch, SetStateAction} from 'react';
import TableCell from 'components/Table/TableCell';
import {VatView} from 'models/vat';
import useSubPosition from 'hooks/useSubPosition';
import {EditableRowType} from './PositionTable';

interface Props {
  subItem: EditableQuotationSubItemRecord;
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
  onRecalcQuotation: () => void;
  quotationAmountDetail?: QuotationAmountDetail;
}

const SubPositionRow = ({
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
  onRecalcQuotation,
  quotationAmountDetail,
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
    onRecalc: onRecalcQuotation,
    taxRates,
    amountDetail: quotationAmountDetail,
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

export default SubPositionRow;
