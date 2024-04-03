import {useState} from 'react';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Drawer, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {QuotationView} from 'models/quotation';
import {useInfiniteQuotationComments} from 'hooks/reactQuery/useQuotation';
import {useInfiniteCustomerNotes} from 'hooks/reactQuery/useCustomers';
import useTotalNotesData from 'hooks/useTotalNotesData';
import CustomerNotes from 'components/CustomerNotes';
import QuotationNotes from './QuotationNotes';

interface Props {
  quotation: QuotationView;
}

enum TabIndex {
  Quotation = 0,
  Customer = 1,
}

export const Notes = ({quotation}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [tabValue, setTabValue] = useState(TabIndex.Quotation);

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

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  const tabItems: TabItems[] = [
    {
      label: 'Quotation',
      iconPosition: 'end',
      icon: (
        <Chip
          label={totalQuotationNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            minWidth: 24,
            opacity: tabValue === TabIndex.Quotation ? 1 : 0.4,
          }}
        />
      ),
    },
    {
      label: 'Customer',
      iconPosition: 'end',
      icon: (
        <Chip
          label={totalCustomerNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            minWidth: 24,
            opacity: tabValue === TabIndex.Customer ? 1 : 0.4,
          }}
        />
      ),
    },
  ];

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
          label={totalQuotationNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            color: 'white',
          }}
        />
      </Button>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          bgcolor="white"
          py="2rem"
          px="1rem"
          zIndex={99}>
          <Typography variant="h5" letterSpacing="normal">
            {t('Notes')}
          </Typography>
          <Button
            label={t('Close')}
            buttonProps={{
              onClick: handleCloseSideDrawer,
              size: 'small',
              variant: 'text',
            }}
          />
        </Box>

        <Tabs
          hideDivider
          tabItems={tabItems}
          currentIndex={tabValue}
          onChange={(index) => setTabValue(index)}
          tabStyle={{
            '& div[role="tablist"]': {
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
              gap: '0',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              '& button': {
                width: '50%',
                '& > div': {
                  width: '100%',
                  justifyContent: 'center',
                },
              },
            },
          }}
          containerStyles={{
            height: '80vh',
            overflowY: 'scroll',
            paddingBottom: 0,
            '& > div:first-of-type': {
              position: 'sticky',
              top: 0,
              zIndex: 1,
            },
          }}>
          <TabsBody value={tabValue} index={TabIndex.Quotation}>
            <QuotationNotes quotation={quotation} />
          </TabsBody>
          <TabsBody value={tabValue} index={TabIndex.Customer}>
            <CustomerNotes
              propertyOwnerId={
                quotation?.propertyOwner?.id ||
                quotation?.elevator?.propertyOwner.id
              }
            />
          </TabsBody>
        </Tabs>
      </Drawer>
    </>
  );
};
