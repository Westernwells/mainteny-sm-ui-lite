import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Drawer, Typography} from '@mui/material';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {InvoiceFormData} from 'models/invoice';
import {FormikProps} from 'formik';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import NotesToForm from 'components/NotesToForm';
import CustomerNotes from './CustomerNotes';

interface Props {
  formik: FormikProps<InvoiceFormData>;
  customer?: PropertyOwnerView | PropertyOwnerSimpleView;
}

enum TabIndex {
  Invoice = 0,
  Customer = 1,
}

export const CreateNotes = ({formik, customer}: Props) => {
  const {t} = useTranslation();
  const customerId = customer?.id;
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [tabValue, setTabValue] = useState(TabIndex.Invoice);
  const [totalCustomerNotes, setCustomerTotalNumbers] = useState(0);

  useEffect(() => {
    if (!customerId) {
      setTabValue(TabIndex.Invoice);
    }
  }, [customerId]);

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  const tabItems: TabItems[] = [
    {
      label: 'Invoice',
      iconPosition: 'end',
      icon: (
        <Chip
          label={formik.values.notes?.length || 0}
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
  ];

  if (customerId) {
    tabItems.push({
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
    });
  }

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
          label={formik.values.notes?.length || 0}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
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
            <NotesToForm form={formik} />
          </TabsBody>
          {customerId && (
            <TabsBody value={tabValue} index={TabIndex.Customer}>
              <CustomerNotes
                customerId={customerId}
                setTotal={setCustomerTotalNumbers}
              />
            </TabsBody>
          )}
        </Tabs>
      </Drawer>
    </>
  );
};
