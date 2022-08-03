import {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FormikErrors} from 'formik';

import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {useEmployeeAccount} from 'hooks/reactQuery/useUserAccount';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  AdditionalInformationEmployeeFormModel,
  BasicEmployeeFormModel,
  CredentialEmployeeFormModel,
  RoleEmployeeFormModel,
} from 'models/employee';
import {getRoles} from 'utils/work-hours-utils';
import {Role} from 'models/user';
import {EmployeeAccountData} from './model';
import {AdditionalInformationEmployeeForm} from './AdditionalInformationEmployeeForm';
import {BasicEmployeeForm} from './BasicEmployeeForm';
import {CredentialEmployeeForm} from './CredentialEmployeeForm';
import {SelectRoleEmployeeForm} from './SelectRoleEmployeeForm';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const steps = [
  'Add basic info',
  'Select role',
  'Add password',
  'Add work preferences',
];

export const NewEmployee = ({getCurrentPageTitle}: Props) => {
  const navigate = useNavigate();
  const {addEmployeeAccount} = useEmployeeAccount();

  const {user} = useUserSession();

  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const [basicEmployeeFormError, setBasicEmployeeFormError] = useState<
    FormikErrors<BasicEmployeeFormModel>
  >({});
  const [basicEmployeeFormValues, setBasicEmployeeFormValues] =
    useState<BasicEmployeeFormModel>({
      firstName: '',
      lastName: '',
      phone: '',
      address: null,
      email: '',
      employeeId: '',
      team: '',
    });

  const [roleEmployeeFormValues, setRoleEmployeeFormValues] =
    useState<RoleEmployeeFormModel>({
      roles: [],
    });

  const [
    additionalInformationEmployeeFormValues,
    setAdditionalInformationEmployeeFormValues,
  ] = useState<AdditionalInformationEmployeeFormModel>({
    serviceOrderTypes: [],
    shifts: [],
  });

  const [credentialEmployeeFormError, setCredentialEmployeeFormError] =
    useState<FormikErrors<CredentialEmployeeFormModel>>({});
  const [
    credentialEmployeeFormValues,
    setCredentialInformationEmployeeFormValues,
  ] = useState<CredentialEmployeeFormModel>({
    password: '',
    confirmPassword: '',
  });

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('New Employee');
    }
  }, []);

  useEffect(() => {
    if (activeStep === 0 && Object.keys(basicEmployeeFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && roleEmployeeFormValues.roles.length === 0) {
      setDisableNextBtn(true);
      return;
    }

    if (
      activeStep === 2 &&
      (Object.keys(credentialEmployeeFormError).length ||
        credentialEmployeeFormValues.password === '' ||
        credentialEmployeeFormValues.confirmPassword === '')
    ) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 3 &&
      (additionalInformationEmployeeFormValues.shifts.length === 0 ||
        (roleEmployeeFormValues.roles.includes(Role.TECHNICIAN) &&
          additionalInformationEmployeeFormValues.serviceOrderTypes.length ===
            0))
    ) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [
    activeStep,
    basicEmployeeFormError,
    roleEmployeeFormValues,
    additionalInformationEmployeeFormValues,
    credentialEmployeeFormError,
  ]);

  useEffect(() => {
    setActiveStep(0);
  }, []);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const addNewEmployee = async () => {
    const body: EmployeeAccountData = {
      phone: basicEmployeeFormValues.phone,
      roles: getRoles(roleEmployeeFormValues.roles[0]),
      serviceOrderTypes:
        additionalInformationEmployeeFormValues.serviceOrderTypes,
      shifts: additionalInformationEmployeeFormValues.shifts,
      address: basicEmployeeFormValues.address,
      lastName: basicEmployeeFormValues.lastName,
      firstName: basicEmployeeFormValues.firstName,
      contact: {
        email: basicEmployeeFormValues.email,
        phone: basicEmployeeFormValues.phone,
      },
      team: basicEmployeeFormValues.team,
      employeeId: basicEmployeeFormValues.employeeId,
      password: credentialEmployeeFormValues.password,
      serviceCompanyId: user!.userAccount.serviceCompany.id,
    };
    addEmployeeAccount(body, () => {
      navigate('/employees?pageIndex=1&pageSize=25');
    });
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={addNewEmployee}
      disableNextBtn={disableNextBtn}
      initialActiveStep={0}
      stepperStyles={{width: '80%'}}
      getActiveStep={(val) => setActiveStep(val)}
      stepperWidth="70%"
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
            <BasicEmployeeForm
              getBasicEmployeeFormErrors={(errors) =>
                setBasicEmployeeFormError(errors)
              }
              getBasicEmployeeFormValues={(values) =>
                setBasicEmployeeFormValues(values)
              }
              initialValues={basicEmployeeFormValues}
            />
          </FlexContainer>
        ) : null}
        {activeStep === 1 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectRoleEmployeeForm
              getRoleEmployeeFormValues={(values) =>
                setRoleEmployeeFormValues(values)
              }
              initialValues={roleEmployeeFormValues}
            />
          </FlexContainer>
        ) : null}

        {activeStep === 2 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <CredentialEmployeeForm
              getCredentialEmployeeFormErrors={(errors) =>
                setCredentialEmployeeFormError(errors)
              }
              getCredentialEmployeeFormValues={(values) =>
                setCredentialInformationEmployeeFormValues(values)
              }
              initialValues={credentialEmployeeFormValues}
            />
          </FlexContainer>
        ) : null}

        {activeStep === 3 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <AdditionalInformationEmployeeForm
              getAdditionalInformationEmployeeFormValues={(values) =>
                setAdditionalInformationEmployeeFormValues(values)
              }
              initialValues={additionalInformationEmployeeFormValues}
              roles={roleEmployeeFormValues.roles}
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
