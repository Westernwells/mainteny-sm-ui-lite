import {useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {InvoiceView} from 'models/invoice';
import {useInfiniteInvoiceComments} from 'hooks/reactQuery/useInvoice';
import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';
import NoteDrawerStateless from 'pages/InvoiceDetails/Notes/NoteDrawer/NoteDrawerStateless';

interface Props {
  invoice: InvoiceView;
}

export const Notes = ({invoice}: Props) => {
  const {t} = useTranslation();

  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const totalInvoiceNotes = useTotalNotesData(
    useInfiniteInvoiceComments,
    invoice.id,
  );

  const totalCustomerNotes = useTotalNotesData(
    useInfiniteCustomerNotes,
    invoice?.propertyOwner?.id,
  );

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  return (
    <>
      <Button
        buttonProps={{
          onClick: handleOpenSideDrawer,
          size: 'small',
          variant: 'text',
          sx: {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          },
        }}>
        <NoteAlt fontSize="small" />
        <Typography variant="subtitle2">{t('Notes')}</Typography>
        <Chip
          label={totalInvoiceNotes + totalCustomerNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
          }}
        />
      </Button>
      <NoteDrawerStateless
        invoice={invoice}
        open={showSideDrawer}
        setOpen={setShowSideDrawer}
        totalInvoiceNotes={totalInvoiceNotes}
        totalCustomerNotes={totalCustomerNotes}
      />
    </>
  );
};
