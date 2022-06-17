import {useEffect, useState} from 'react';
import {Stepper} from 'components/Stepper';
import {FlexContainer} from 'components/FlexContainer';
import {useCreateInvoice} from 'hooks/reactQuery/useInvoice';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {ServiceOrderView} from 'models/service-order';
import {ServiceOrder} from './ServiceOrder';
import {InvoiceType} from './InvoiceType';

const steps = ['Select order', 'Select invoice type'];

export const NewInvoice = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrderView | null>(
    null,
  );
  const [isDisabled, setIsDisabled] = useState(true);
  const {mutate: createNewInvoice} = useCreateInvoice();
  const {data: articleResource} = useArticles(
    {
      pageIndex: 0,
      pageSize: 1,
      query: '',
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    if (selectedOrder) {
      setIsDisabled(false);
    }
  }, [selectedOrder]);

  const handleCancel = () => {
    setActiveStep(0);
    setSelectedOrder(null);
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => {
        if (selectedOrder && articleResource && articleResource.data.length) {
          createNewInvoice({
            description: selectedOrder.description,
            dueDate: selectedOrder.dueDate,
            issuedDate: new Date().toISOString().split('T')[0],
            items: [
              {
                articleId: articleResource.data[0].id,
                description: articleResource.data[0].description,
                name: articleResource.data[0].name,
                quantity: 1,
                unitAmount: articleResource.data[0].unitSellingAmount,
              },
            ],
            paymentInfo: {
              accountNumber: ' ',
              bic: ' ',
              iban: ' ',
            },
            paymentTerms: 'FULL',
            propertyOwnerId: selectedOrder.elevator.propertyOwner.id,
            serviceCompanyId:
              selectedOrder.elevator.propertyOwner.serviceCompanyId,
            serviceOrderId: selectedOrder.id,
            shouldSendOut: false,
          });
        } else {
          console.error('NO ARTICLES FOUND');
        }
      }}
      disableNextBtn={isDisabled}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        mt: '3em',
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 && (
          <ServiceOrder
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {activeStep === 1 && selectedOrder && (
          <InvoiceType serviceOrder={selectedOrder} />
        )}
      </FlexContainer>
    </Stepper>
  );
};
