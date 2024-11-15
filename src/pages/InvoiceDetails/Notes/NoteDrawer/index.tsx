import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteInvoiceComments} from 'hooks/reactQuery/useInvoice';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';
import NoteDrawerStateless, {
  Props as StatelessProps,
} from './NoteDrawerStateless';

/**
 * NoteDrawer prop defines all the NoteDrawerStateless props to be passed through
 *
 * Fields that are not included are totalInvoiceNotes and totalCustomerNotes
 */
type Props = Omit<StatelessProps, 'totalInvoiceNotes' | 'totalCustomerNotes'>;

/**
 * NoteDrawer component is a wrapper that implicitly fetches totalInvoiceNotes and totalCustomerNotes
 *
 * Used for invoice notes
 */
const NoteDrawer = ({invoice, ...props}: Props) => {
  const totalInvoiceNotes = useTotalNotesData(
    useInfiniteInvoiceComments,
    invoice.id,
  );

  const totalCustomerNotes = useTotalNotesData(
    useInfiniteCustomerNotes,
    invoice.propertyOwner.id,
  );

  return (
    <NoteDrawerStateless
      {...props}
      invoice={invoice}
      totalInvoiceNotes={totalInvoiceNotes}
      totalCustomerNotes={totalCustomerNotes}
    />
  );
};

export default NoteDrawer;
