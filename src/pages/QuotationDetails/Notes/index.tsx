import {useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {QuotationView} from 'models/quotation';
import useTotalNotesData from 'hooks/useTotalNotesData';
import {useInfiniteQuotationComments} from 'hooks/reactQuery/useQuotation';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';
import NotesDrawerStateless from 'pages/QuotationDetails/NotesDrawer/NotesDrawerStateless';

interface Props {
  quotation: QuotationView;
}

export const Notes = ({quotation}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

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
        <Typography>{t('Notes')}</Typography>
        <Chip
          label={totalQuotationNotes + (totalCustomerNotes || 0)}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            color: 'white',
          }}
        />
      </Button>
      <NotesDrawerStateless
        open={showSideDrawer}
        quotation={quotation}
        totalQuotationNotes={totalQuotationNotes}
        totalCustomerNotes={totalCustomerNotes || 0}
        onClose={handleCloseSideDrawer}
      />
    </>
  );
};
