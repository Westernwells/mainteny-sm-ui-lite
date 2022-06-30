import {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {FormikErrors} from 'formik';

import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {Priority} from 'models/service-order';
import {useCreateCustomer} from 'hooks/reactQuery/useCustomers';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {BasicCustomerFormModel, NewCustomerBody} from './model';
import {BasicCustomerForm} from './BasicCustomerForm';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const steps = ['Add basic info'];

export const NewCustomer = ({getCurrentPageTitle}: Props) => {
  const navigate = useNavigate();
  const {user} = useUserSession();

  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const {mutateAsync: createCustomer} = useCreateCustomer(
    'Customer created successfully',
  );

  const [basicCustomerFormError, setBasicCustomerFormError] = useState<
    FormikErrors<BasicCustomerFormModel>
  >({});

  const [basicCustomerFormValues, setBasicCustomerFormValues] =
    useState<BasicCustomerFormModel>({
      name: '',
      phone: '',
      url: '',
      email: '',
      postalAddress: null,
      billingAddress: null,
      priority: Priority.NONE,
      externalId: '',
    });

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('New Customer');
    }
  }, []);

  useEffect(() => {
    if (activeStep === 0 && Object.keys(basicCustomerFormError).length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, basicCustomerFormError]);

  useEffect(() => {
    setActiveStep(0);
  }, []);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const addNewEmployee = async () => {
    const body: NewCustomerBody = {
      billingAddress: basicCustomerFormValues.billingAddress,
      businessAddress: null,
      contact: {
        email: basicCustomerFormValues.email,
        phone: `+${basicCustomerFormValues.phone.replaceAll('+', '')}`,
        url: basicCustomerFormValues.url,
      },
      externalId: basicCustomerFormValues.externalId,
      name: basicCustomerFormValues.name,
      postalAddress: basicCustomerFormValues.postalAddress,
      priority: basicCustomerFormValues.priority,
      serviceCompanyId: user!.userAccount.serviceCompany.id,
    };

    const response = await createCustomer(body);

    if (response) {
      navigate(`/customers/details/${response.value}?tab=0`, {replace: true});
    }
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={addNewEmployee}
      disableNextBtn={disableNextBtn}
      initialActiveStep={0}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <BasicCustomerForm
              getBasicCustomerFormErrors={(errors) =>
                setBasicCustomerFormError(errors)
              }
              getBasicCustomerFormValues={(values) =>
                setBasicCustomerFormValues(values)
              }
              initialValues={basicCustomerFormValues}
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
