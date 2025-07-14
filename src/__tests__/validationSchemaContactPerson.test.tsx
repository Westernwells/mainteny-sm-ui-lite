import {PropertyContactPersonRole} from 'pages/NewCustomer/model';
import * as Yup from 'yup';
import {assert} from 'vitest';

export const phoneValidationRE =
  /^\+?((\d{1,4}[ -]*)|(\([0-9]{2,3}\)[ -]*)|([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$/;

export const validationSchemaContactPerson = Yup.object().shape({
  propertyContactPerson: Yup.object().shape({
    roles: Yup.array().of(Yup.string()).min(1, 'Role is required'),
    secondaryPhone: Yup.string().matches(
      phoneValidationRE,
      'Phone number is not valid',
    ),
  }),
  userAccount: Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    contact: Yup.object().shape({
      email: Yup.string().email('Enter a valid email'),
      phone: Yup.string().matches(
        phoneValidationRE,
        'Phone number is not valid',
      ),
    }),
  }),
});

export const validContactPersonData = {
  propertyContactPerson: {
    roles: [PropertyContactPersonRole.CONTACT_PERSON],
    secondaryPhone: '+4915164103011',
  },
  userAccount: {
    firstName: 'Jane',
    lastName: 'Doe',
    contact: {
      email: 'jane@example.com',
      phone: '4940713761252',
    },
    username: 'jane@example.com',
    photoUrl: '',
    serviceCompanyId: 'svc-123',
  },
};

export const invalidContactPersonData = {
  propertyContactPerson: {
    roles: [PropertyContactPersonRole.CONTACT_PERSON],
    secondaryPhone: 'not-a-phone',
  },
  userAccount: {
    firstName: 'Jane',
    lastName: 'Doe',
    contact: {
      email: 'jane@example.com',
      phone: '123',
    },
    username: 'jane@example.com',
    photoUrl: '',
    serviceCompanyId: 'svc-123',
  },
};

describe('validationSchemaContactPersons', () => {
  it('accepts valid phone numbers', async () => {
    assert(
      await validationSchemaContactPerson.validate(validContactPersonData),
    );
  });

  it('rejects invalid phone numbers', async () => {
    try {
      await validationSchemaContactPerson.validate(invalidContactPersonData);
      throw new Error('Should have thrown');
    } catch (err: any) {
      assert(err.message.match(/Phone number is not valid/));
    }
  });
});
