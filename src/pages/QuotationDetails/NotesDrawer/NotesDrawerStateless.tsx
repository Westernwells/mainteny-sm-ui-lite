import {Chip, Drawer, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {Button} from 'components/Button';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import QuotationNotes from 'pages/QuotationDetails/Notes/QuotationNotes';
import CustomerNotes from 'components/CustomerNotes';
import {QuotationView} from 'models/quotation';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

enum TabIndex {
  Quotation = 0,
  Customer = 1,
}

export type Props = {
  open: boolean;
  quotation: QuotationView;
  totalQuotationNotes: number;
  totalCustomerNotes: number;
  onClose: () => void;
  onChange?: () => void;
};

const NotesDrawerStateless = ({
  open,
  quotation,
  totalQuotationNotes,
  totalCustomerNotes,
  onClose,
  onChange,
}: Props) => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(TabIndex.Quotation);

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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
            onClick: onClose,
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
          <QuotationNotes quotation={quotation} onChange={onChange} />
        </TabsBody>
        <TabsBody value={tabValue} index={TabIndex.Customer}>
          <CustomerNotes
            propertyOwnerId={
              quotation?.propertyOwner?.id ||
              quotation?.elevator?.propertyOwner.id
            }
            onChange={onChange}
          />
        </TabsBody>
      </Tabs>
    </Drawer>
  );
};

export default NotesDrawerStateless;
