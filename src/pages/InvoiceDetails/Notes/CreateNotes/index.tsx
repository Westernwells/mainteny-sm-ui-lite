import {useEffect, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Drawer, Typography} from '@mui/material';
import {TabItems, Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {InvoiceFormData} from 'models/invoice';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import NotesToForm from 'components/NotesToForm';
import {UseFormReturn} from 'react-hook-form';
import CustomerNotes from './CustomerNotes';
import {useInfiniteCustomerNotes} from '../../../../hooks/reactQuery/useCustomers';

interface Props {
  formMethods: UseFormReturn<InvoiceFormData>;
  customer?: PropertyOwnerView | PropertyOwnerSimpleView;
}

enum TabIndex {
  Invoice = 0,
  Customer = 1,
}

export const CreateNotes = ({formMethods, customer}: Props) => {
  const {t} = useTranslation();
  const customerId = customer?.id;
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [tabValue, setTabValue] = useState(TabIndex.Invoice);

  const {watch} = formMethods;

  const watchedNotes = watch('notes');

  const {
    data: customerNotes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCustomerNotes(
    customerId || '',
    {
      pageIndex: 0,
      pageSize: 10,
    },
    {
      enabled: !!customerId,
    },
  );

  const totalCustomerNotes = useMemo(
    () => customerNotes?.pages?.[0]?.total || 0,
    [customerNotes],
  );

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
          label={watchedNotes?.length || 0}
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
          label={(watchedNotes?.length || 0) + totalCustomerNotes}
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
            <NotesToForm form={formMethods} />
          </TabsBody>
          {customerId && (
            <TabsBody value={tabValue} index={TabIndex.Customer}>
              <CustomerNotes
                customerId={customerId}
                notes={customerNotes}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage || false}
                fetchNextPage={fetchNextPage}
              />
            </TabsBody>
          )}
        </Tabs>
      </Drawer>
    </>
  );
};
