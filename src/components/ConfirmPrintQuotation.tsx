import {ConfirmPrint} from './ConfirmPrint';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmPrintQuotation = ({open, onConfirm, onClose}: Props) => (
  <ConfirmPrint
    title="Print quotation"
    description='This action will set the status of the quotation to "Sent". The quotation can not be edited or deleted after.'
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);
