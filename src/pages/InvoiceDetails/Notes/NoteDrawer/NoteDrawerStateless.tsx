import {Chip, Drawer, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {Button} from 'components/Button';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import InvoiceNotes from 'pages/InvoiceDetails/Notes/EditNotes/InvoiceNotes';
import {InvoiceView} from 'models/invoice';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import CustomerNotes from 'components/CustomerNotes';

export type Props = {
  invoice: InvoiceView;
  open: boolean;
  totalInvoiceNotes: number;
  totalCustomerNotes: number;
  setOpen: (open: boolean) => void;
  onChange?: () => void;
};

enum TabIndex {
  Invoice = 0,
  Customer = 1,
}

const NoteDrawerStateless = ({
  invoice,
  open,
  totalInvoiceNotes,
  totalCustomerNotes,
  setOpen,
  onChange,
}: Props) => {
  const {t} = useTranslation();

  const [tabValue, setTabValue] = useState(TabIndex.Invoice);

  const tabItems: TabItems[] = [
    {
      label: 'Invoice',
      iconPosition: 'end',
      icon: (
        <Chip
          label={totalInvoiceNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            minWidth: 24,
            opacity: tabValue === TabIndex.Invoice ? 1 : 0.4,
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

  const handleCloseSideDrawer = () => {
    setOpen(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCloseSideDrawer}
      PaperProps={{
        sx: {
          width: '30em',
          color: 'text.primary',
          background: 'white',
          overflow: 'hidden',
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
        <TabsBody value={tabValue} index={TabIndex.Invoice}>
          <InvoiceNotes invoice={invoice} onChange={onChange} />
        </TabsBody>
        <TabsBody value={tabValue} index={TabIndex.Customer}>
          <CustomerNotes
            propertyOwnerId={invoice.propertyOwner.id}
            onChange={onChange}
          />
        </TabsBody>
      </Tabs>
    </Drawer>
  );
};

export default NoteDrawerStateless;
