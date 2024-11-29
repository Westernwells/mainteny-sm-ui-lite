import NotesDrawerStateless, {
  Props as StatelessProps,
} from 'pages/QuotationDetails/NotesDrawer/NotesDrawerStateless';
import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteQuotationComments} from 'hooks/reactQuery/useQuotation';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';

/**
 * NoteDrawer prop defines all the NoteDrawerStateless props to be passed through
 *
 * Fields that are not included are totalQuotationNotes and totalCustomerNotes
 */
type Props = Omit<StatelessProps, 'totalQuotationNotes' | 'totalCustomerNotes'>;

/**
 * NoteDrawer component is a wrapper that implicitly fetches totalQuotationNotes and totalCustomerNotes
 *
 * Used for quotation notes
 */

const NotesDrawer = ({quotation, ...props}: Props) => {
  const totalQuotationNotes = useTotalNotesData(
    useInfiniteQuotationComments,
    quotation.id,
  );
  const totalCustomerNotes =
    quotation?.propertyOwner?.id || quotation?.elevator?.propertyOwner.id
      ? useTotalNotesData(
          useInfiniteCustomerNotes,
          quotation?.propertyOwner?.id || quotation.elevator.propertyOwner.id,
        )
      : null;

  return (
    <NotesDrawerStateless
      {...props}
      quotation={quotation}
      totalQuotationNotes={totalQuotationNotes}
      totalCustomerNotes={totalCustomerNotes || 0}
    />
  );
};

export default NotesDrawer;
