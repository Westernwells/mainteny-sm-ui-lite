import {Typography, Grid2 as Grid, Switch} from '@mui/material';
import {CardAlert} from 'components/CardAlert';
import {EmptySection} from 'components/EmptySection';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {Button} from 'components/Button';
import {useForm} from 'react-hook-form';
import {Dialog} from 'components/Dialog';
import {Confirm} from 'components/Confirm';
import {
  useDeleteEmployeeEmailSignature,
  usePostEmployeeEmailSignature,
  useQueryEmployeeSignature,
  useUpdateEmployeeEmailSignature,
} from 'hooks/reactQuery/useEmployee';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import {EmailSignature} from 'models/employee';
import {Progress} from 'components/Progress';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import SignatureContent from './SignatureContent';
import PreviewSignature from './PreviewSignature';
import NewSignatureForm from './NewSignatureForm';
import EditSignatureForm from './EditSignatureForm';

type FormValues = {
  text: string;
  logoUrl: string;
  logoFile: File | null;
  name: string;
};

const SignatureEmail = () => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {data: userAccount} = useGetUserAccount(user?.userAccount.id);

  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [activeEmailSignature, setActiveSignature] = useState<EmailSignature>();

  const [isEditMode, setIsEditMode] = useState(false);

  const {data: logoUrl = {}, refetch} = useDownloadUrl(
    activeEmailSignature?.content.images || [],
    undefined,
    serviceCompanyId,
  );

  const {mutateAsync: uploadImages, isLoading: isUploadingLogo} =
    useUploadFiles('Image uploaded successfully');

  const {
    mutateAsync: postEmployeeEmailSignature,
    isLoading: isCreatingSignature,
  } = usePostEmployeeEmailSignature();

  const {mutateAsync: updateEmployeeSignature, isLoading: isUpdatingSignature} =
    useUpdateEmployeeEmailSignature();

  const {mutateAsync: deleteEmployeeSignature, isLoading: isDeleting} =
    useDeleteEmployeeEmailSignature();

  const {data: employeeSignatures, isLoading} = useQueryEmployeeSignature();

  const handleToggle = async (employeeSignature: EmailSignature) => {
    await updateEmployeeSignature({
      data: {
        ...employeeSignature,
        enabled: !employeeSignature.enabled,
      },
      employeeId: userAccount?.userData.employeeId!,
      signatureId: employeeSignature.id,
    });
  };

  const {control, handleSubmit, setValue, watch, reset} = useForm<FormValues>({
    defaultValues: {
      text: '',
      logoUrl: '',
      logoFile: null,
      name:
        `${user?.userAccount.firstName} ${user?.userAccount.lastName}` || '',
    },
  });

  const preview = watch('logoUrl');
  const name = watch('name');

  const handleUploadedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const urlImage = URL.createObjectURL(file);
        setValue('logoUrl', '');
        setValue('logoUrl', urlImage);
        setValue('logoFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onUpload = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }
  };

  const onRemove = () => {
    setValue('logoFile', null);
    setValue('logoUrl', '');
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  };

  const handleSetEditMode = () => {
    setIsEditMode(true);
    reset();
  };

  const onSubmit = async (data: FormValues) => {
    const file = watch('logoFile') as unknown as FileWithPreview;
    const uploadPath = `${serviceCompanyId}/employees/${userAccount?.userData
      .employeeId!}`;

    const trimmedFileName = file?.name.replace(/\s+/g, '');

    const fileWithTrimmedName = new File([file], trimmedFileName, {
      type: file.type,
    });

    const photoUrl = `${uploadPath}/${trimmedFileName}`;

    if (file && typeof file !== 'string') {
      await uploadImages({
        files: [fileWithTrimmedName],
        uploadPath,
      });
    }

    await postEmployeeEmailSignature({
      employeeId: userAccount?.userData.employeeId!,
      body: {
        name: `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
        content: {images: [watch('logoFile') ? photoUrl : ''], html: data.text},
      },
    });
    setOpenEditDialog(false);
    setIsEditMode(false);
    reset();
    setActiveSignature(undefined);
  };

  const onSubmitEdit = async (data: FormValues) => {
    const logoFile = watch('logoFile');
    const uploadPath = `${serviceCompanyId}/employees/${userAccount?.userData.employeeId}`;

    let imagesToUpload: (File | FileWithPreview)[] = [];
    let finalLogoUrl: string[] = [];

    if (logoFile) {
      const trimmedFileName = logoFile.name.replace(/\s+/g, '');
      const fileWithTrimmedName = new File([logoFile], trimmedFileName, {
        type: logoFile.type,
      });

      finalLogoUrl = [`${uploadPath}/${trimmedFileName}`];

      imagesToUpload = [fileWithTrimmedName];

      await uploadImages({
        files: imagesToUpload,
        uploadPath,
      });
    } else if (!watch('logoUrl')) {
      finalLogoUrl = [];
    } else {
      finalLogoUrl = activeEmailSignature?.content.images || [];
    }

    await updateEmployeeSignature({
      data: {
        name: `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
        content: {
          images: finalLogoUrl,
          html: data.text,
        },
        enabled: activeEmailSignature?.enabled,
      },
      employeeId: userAccount?.userData.employeeId!,
      signatureId: activeEmailSignature?.id!,
    });

    setOpenEditDialog(false);
    setIsEditMode(false);
    reset();
    setActiveSignature(undefined);
  };

  const onPreviewSubmit = () => {
    setOpenPreviewDialog(false);
  };

  const handleActionPreview = (employeeSignature: EmailSignature) => {
    setActiveSignature(employeeSignature);
    setOpenPreviewDialog(true);
  };

  const handleActionEdit = (employeeSignature: EmailSignature) => {
    setActiveSignature(employeeSignature);
    setValue('name', employeeSignature.name);
    setValue('text', employeeSignature.content.html);
    setOpenEditDialog(true);
  };

  useEffect(() => {
    refetch();
    setValue('logoUrl', logoUrl[activeEmailSignature?.content.images[0]!]);
  }, [activeEmailSignature]);

  const handleActionDelete = (employeeSignature: EmailSignature) => {
    setActiveSignature(employeeSignature);
    setOpenDeleteConfirm(true);
  };

  const handleClosePreview = () => {
    setOpenPreviewDialog(false);
    setActiveSignature(undefined);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setActiveSignature(undefined);
    setValue('logoFile', null);
    setValue('logoUrl', '');
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteConfirm(false);
    setActiveSignature(undefined);
  };

  const handleDeleteConfirmation = async () => {
    await deleteEmployeeSignature({
      employeeId: userAccount?.userData.employeeId!,
      signatureId: activeEmailSignature?.id!,
    });
    setOpenDeleteConfirm(false);
    setIsEditMode(false);
    setActiveSignature(undefined);
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Grid
      container
      direction="column"
      gap={3}
      sx={{background: theme.palette.background.paper, padding: '1.5em'}}>
      <Typography variant="subtitle2">{t('Email Signature')}</Typography>

      <>
        <CardAlert
          alertIcon={<AlertInfoIcon />}
          message={t(
            'Add a signature to be appended at the end of your outgoing emails.',
          )}
          status="info"
        />

        {!employeeSignatures?.length && !isEditMode && (
          <EmptySection
            showActionBtn
            illustration="emailSignature"
            size="tiny"
            containerStyle={{
              my: 4,
            }}
            label="No email signatures"
            labelStyle={{
              typography: 'h6',
              color: theme.palette.primary.dark,
            }}
            subLabel="Create a customised email signature"
            subLabelProps={{
              color: theme.palette.text.secondary,
            }}
            btnLabel="New Signature"
            btnSize="medium"
            btnAction={handleSetEditMode}
          />
        )}

        {!openEditDialog && !employeeSignatures?.length && isEditMode && (
          <NewSignatureForm
            control={control}
            hiddenInputRef={hiddenInputRef}
            handleUploadedFile={handleUploadedFile}
            onRemove={onRemove}
            onUpload={onUpload}
            logoSrc={preview}
            logoAltName={name}
            handleSubmit={handleSubmit(onSubmit)}
            handleCancel={() => {
              setIsEditMode(false);
            }}
            handlePreview={() => {
              setOpenPreviewDialog(true);
            }}
            isCreatingSignature={isCreatingSignature || isUploadingLogo}
          />
        )}

        {!!employeeSignatures?.length && (
          <Grid>
            {employeeSignatures?.map((employeeSignature) => (
              <>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{marginTop: 2}}>
                  <Typography variant="body2">
                    {t('Use this signature on all outgoing emails')}
                  </Typography>
                  <Switch
                    checked={employeeSignature.enabled}
                    onChange={() => handleToggle(employeeSignature)}
                  />
                </Grid>

                <Grid
                  sx={{
                    padding: 3,
                    backgroundColor: '#F7F9FC',
                    borderRadius: 2,
                    mt: 3,
                  }}
                  key={employeeSignature.id}>
                  <SignatureContent
                    hasActionMenu
                    onPreview={handleActionPreview}
                    onEdit={handleActionEdit}
                    onDelete={handleActionDelete}
                    previewHtml={activeEmailSignature?.content.html}
                    logoSrc={
                      activeEmailSignature?.content.images[0] ||
                      watch('logoUrl')
                    }
                    employeeSignature={employeeSignature}
                  />
                </Grid>
              </>
            ))}
          </Grid>
        )}

        <Dialog
          title="Signature Preview"
          leftButton={
            <Button
              buttonProps={{
                size: 'large',
                variant: 'outlined',
                onClick: handleClosePreview,
              }}>
              <Typography variant="subtitle2">{t('Close Preview')}</Typography>
            </Button>
          }
          saveBtnType="submit"
          onCancel={handleClosePreview}
          showCancelButton={false}
          onSave={handleSubmit(onPreviewSubmit)}
          saveButtonText="Save Signature"
          dialogProps={{
            maxWidth: 'md',
            open: openPreviewDialog || false,
          }}
          dialogContentStyles={{
            mx: 0,
            mt: 0,
            px: 3,
          }}>
          <PreviewSignature
            previewHtml={activeEmailSignature?.content.html || watch('text')}
            logoSrc={
              logoUrl[activeEmailSignature?.content.images[0]!] ||
              watch('logoUrl')
            }
          />
        </Dialog>

        <Dialog
          title="Edit Email Signature"
          leftButton={
            <Button
              buttonProps={{
                size: 'large',
                variant: 'outlined',
                onClick: handleCloseEditDialog,
              }}>
              <Typography variant="subtitle2">{t('Cancel')}</Typography>
            </Button>
          }
          disableSaveBtn={
            watch('text') === '<p></p>' ||
            !watch('text') ||
            isUpdatingSignature ||
            isUploadingLogo
          }
          saveBtnType="submit"
          onCancel={handleCloseEditDialog}
          showCancelButton={false}
          onSave={handleSubmit(onSubmitEdit)}
          saveButtonText="Save Signature"
          dialogProps={{
            maxWidth: 'md',
            open: openEditDialog || false,
          }}
          dialogContentStyles={{
            mx: 0,
            mt: 0,
            px: 3,
          }}>
          <EditSignatureForm
            control={control}
            hiddenInputRef={hiddenInputRef}
            handleUploadedFile={handleUploadedFile}
            onRemove={onRemove}
            onUpload={onUpload}
            logoSrc={preview}
            logoAltName={name}
            handleSubmit={handleSubmit(onSubmitEdit)}
          />
        </Dialog>

        <Confirm
          maxWidth={400}
          disableActions={isDeleting}
          open={openDeleteConfirm}
          onConfirm={handleDeleteConfirmation}
          onClose={handleCloseDeleteDialog}
          title="Delete Signature"
          content="You are about to delete this email signature. Are you sure about it?"
          confirmBtnLabel="Delete Signature"
          closeBtnLabel="Cancel"
        />
      </>
    </Grid>
  );
};

export default SignatureEmail;
