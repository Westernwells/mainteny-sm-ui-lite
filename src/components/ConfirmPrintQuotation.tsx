import {ConfirmPrint} from './ConfirmPrint';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmPrintQuotation = ({
  open,
  onConfirm,
  onClose,
  isLoading,
}: Props) => (
  <ConfirmPrint
    title="Print quotation"
    description="This action will set the status of the quotation to sent. You won’t be able to delete it afterwards."
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
    isLoading={isLoading}
  />
);
