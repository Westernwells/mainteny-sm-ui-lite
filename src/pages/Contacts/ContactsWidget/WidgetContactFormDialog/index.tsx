import {Dispatch, SetStateAction, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {
  ServiceCompanyContactPersonFormModel,
  ServiceCompanyContactPersonRole,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {Dialog} from 'components/Dialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useCreateServiceCompanyContactPerson} from 'hooks/reactQuery/useContacts';
import {FileWithPreview} from 'models/files';
import Form from './Form';

interface Props {
  contactPerson?: ServiceCompanyContactPersonView;
  formType: 'create' | 'edit';
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  onAfterSubmit?: (newContactPersonId?: string) => void;
}

const getDefaultValues = (
  contactPerson: ServiceCompanyContactPersonView | undefined,
  serviceCompanyId: string,
): ServiceCompanyContactPersonFormModel => ({
  contactPerson: {
    roles:
      (contactPerson?.userAccount
        .roles as unknown as ServiceCompanyContactPersonRole[]) || [],
    companyName: contactPerson?.companyName || '',
    secondaryPhone: contactPerson?.additionalInfo?.secondaryPhone || '',
    contactPersonId: contactPerson?.id || '',
  },
  userAccount: {
    firstName: contactPerson?.userAccount?.firstName || '',
    lastName: contactPerson?.userAccount?.lastName || '',
    photoUrl: contactPerson?.userAccount?.photoUrl || '',
    contact: {
      email: contactPerson?.userAccount?.contact.email || '',
      phone: contactPerson?.userAccount?.contact.phone || '',
    },
    serviceCompanyId,
    title: contactPerson?.userAccount?.title || '',
  },
});

const ContactFormDialog = ({
  contactPerson,
  formType,
  openDialog,
  setOpenDialog,
  onAfterSubmit,
}: Props) => {
  const {user} = useUserSession();
  const {data: uuid, refetch} = useUuid();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {mutate: createContact, isLoading: isCreating} =
    useCreateServiceCompanyContactPerson('Contact person created successfully');
  const {mutateAsync: uploadImages, isLoading: isUploading} = useUploadFiles(
    'Image uploaded successfully',
  );
  const uploadPath = `${serviceCompanyId}/contactPersons/${
    formType === 'edit' ? contactPerson?.id : uuid
  }`;

  const useHookForm = useForm<
    ServiceCompanyContactPersonFormModel,
    any,
    ServiceCompanyContactPersonFormModel
  >({
    defaultValues: getDefaultValues(contactPerson, serviceCompanyId),
    mode: 'all',
  });
  const {handleSubmit, formState, reset} = useHookForm;
  useEffect(() => {
    if (formType === 'edit') {
      reset(getDefaultValues(contactPerson, serviceCompanyId));
    }
  }, [contactPerson, formType, reset, serviceCompanyId]);

  const resetForm = () => {
    reset(getDefaultValues(undefined, serviceCompanyId));
  };

  const handleContactFormSubmit = async (
    data: ServiceCompanyContactPersonFormModel,
  ) => {
    const file = data.userAccount.photoUrl?.[0] as unknown as FileWithPreview;
    const photoUrl = `${uploadPath}/${file?.name}`;
    const existingContactPerson = !!data.contactPerson.contactPersonId;

    if (existingContactPerson && onAfterSubmit) {
      onAfterSubmit(data.contactPerson.contactPersonId);
    } else {
      // If file type is File object, upload it
      if (!!file && typeof file !== 'string') {
        await uploadImages({
          files: [file],
          uploadPath,
        });
      }

      await createContact(
        {
          contactPerson: {
            ...data.contactPerson,
            roles: [
              data.contactPerson
                .roles as unknown as ServiceCompanyContactPersonRole,
            ],
            contactPersonId: uuid,
          },
          userAccount: {
            ...data.userAccount,
            serviceCompanyId,
            photoUrl: file?.name ? photoUrl : '',
          },
        },
        {
          onSuccess(response) {
            if (onAfterSubmit) {
              const newlyCreatedContactPersonId = response?.value;
              onAfterSubmit(newlyCreatedContactPersonId);
            }
          },
        },
      );
    }

    setOpenDialog(false);
    resetForm();
  };

  useEffect(() => {
    refetch();
  }, [openDialog]);

  return (
    <Dialog
      title={formType === 'edit' ? 'Edit Contact' : 'Add Contact'}
      saveButtonText="Confirm"
      disableSaveBtn={isCreating || isUploading || !formState.isValid}
      isSaving={isCreating}
      onCancel={() => {
        setOpenDialog(false);
        resetForm();
      }}
      onSave={handleSubmit(handleContactFormSubmit)}
      dialogProps={{
        maxWidth: 'sm',
        open: openDialog,
      }}>
      <Form form={useHookForm} />
    </Dialog>
  );
};

export default ContactFormDialog;
