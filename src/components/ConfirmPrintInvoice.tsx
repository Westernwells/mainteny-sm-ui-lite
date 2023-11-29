import {ConfirmPrint} from './ConfirmPrint';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmPrintInvoice = ({open, onConfirm, onClose}: Props) => (
  <ConfirmPrint
    title="Print invoice"
    description='This action will set the status of the invoice to "Sent". The invoice can not be edited or deleted after.'
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);
