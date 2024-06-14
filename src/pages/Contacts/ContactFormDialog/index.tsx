import {Dispatch, SetStateAction, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {
  ServiceCompanyContactPeronFormModel,
  ServiceCompanyContactPersonRole,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {Dialog} from 'components/Dialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {
  useCreateServiceCompanyContactPerson,
  useUpdateServiceCompanyContactPerson,
} from 'hooks/reactQuery/useContacts';
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
): ServiceCompanyContactPeronFormModel => ({
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
  const {data: uuid} = useUuid();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {mutate: createContact, isLoading: isCreating} =
    useCreateServiceCompanyContactPerson('Contact person created successfully');
  const {mutate: updateContact, isLoading: isUpdating} =
    useUpdateServiceCompanyContactPerson('Contact person updated successfully');
  const {mutateAsync: uploadImages, isLoading: isUploading} = useUploadFiles(
    'Image uploaded successfully',
  );
  const uploadPath = `${serviceCompanyId}/contactPersons/${
    formType === 'edit' ? contactPerson?.id : uuid
  }`;

  const useHookForm = useForm<ServiceCompanyContactPeronFormModel>({
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
    data: ServiceCompanyContactPeronFormModel,
  ) => {
    const file = data.userAccount.photoUrl?.[0] as unknown as FileWithPreview;
    const photoUrl = `${uploadPath}/${file?.name}`;

    // If file type is File object, upload it
    if (!!file && typeof file !== 'string') {
      await uploadImages({
        files: [file] || [],
        uploadPath,
      });
    }

    if (formType === 'create') {
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
            photoUrl,
            serviceCompanyId,
          },
        },
        {
          onSuccess(response) {
            onAfterSubmit?.(response?.value);
          },
        },
      );
    } else {
      await updateContact(
        {
          body: {
            contactPerson: {
              ...data.contactPerson,
              roles: Array.isArray(data.contactPerson.roles)
                ? data.contactPerson.roles
                : [
                    data.contactPerson
                      .roles as unknown as ServiceCompanyContactPersonRole,
                  ],
            },
            userAccount: {
              ...data.userAccount,
              photoUrl:
                typeof data.userAccount.photoUrl === 'string'
                  ? data.userAccount.photoUrl
                  : photoUrl,
              serviceCompanyId,
            },
          },
          contactPersonId: contactPerson?.id || '',
        },
        {
          onSuccess: () => {
            onAfterSubmit?.();
          },
        },
      );
    }

    setOpenDialog(false);
    resetForm();
  };

  return (
    <Dialog
      title={formType === 'edit' ? 'Edit Contact' : 'Add Contact'}
      saveButtonText="Confirm"
      disableSaveBtn={
        isCreating || isUploading || isUpdating || !formState.isValid
      }
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
      <Form
        form={useHookForm}
        initialValues={getDefaultValues(contactPerson, serviceCompanyId)}
      />
    </Dialog>
  );
};

export default ContactFormDialog;
