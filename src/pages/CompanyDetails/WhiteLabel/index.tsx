import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {Box} from '@mui/material';

import {InfoCard} from 'components/InfoCard';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyItem} from 'models/service-company';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {Progress} from 'components/Progress';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {Button} from 'components/Button';
import {useUuid} from 'hooks/reactQuery/useUuid';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

export const WhiteLabel = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const {mutateAsync: uploadImages, isLoading} = useUploadFiles(
    'Image uploaded successfully',
    company?.id,
  );

  const logoCompany = company?.settings?.whiteLabel?.logoPath;

  const {data: logoUrl = {}} = useDownloadUrl(
    logoCompany ? [logoCompany] : [],
    undefined,
    company.id,
  );

  const {data: uuid} = useUuid();

  const uploadPath = `${company.id}/whiteLabel/${uuid}`;

  const updateImages = async (files: FileWithPreview[]) => {
    if (files.length) {
      await uploadImages({files, uploadPath});
    }
  };

  const saveImage = async (files: FileWithPreview[]) => {
    await updateImages(files);

    await updateCompany({
      body: {
        whiteLabel: {
          logoPath: uploadPath.concat('/').concat(files[0].name),
        },
      },

      companyId: company?.id || '',
    });
    setShowUploadForm(false);
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      header={
        <Typography variant="subtitle1">
          {t('Whitelabel Information')}
        </Typography>
      }
      showHeaderBackground>
      <>
        {(!logoCompany || showUploadForm) && (
          <Box>
            <MyDropZone
              hints={[
                t('JPG, PNG or BMP only'),
                t('File size less than 5MB only'),
              ]}
              getAcceptedFiles={(files) => {
                saveImage(files);
              }}
              getRejectedFileWithErrors={(file) => {
                console.log(file);
              }}
              acceptedFileTypes="image/*"
              maxFiles={1}
              isCropped
              cropperTitle="Upload Whitelabel Information"
            />
            {logoCompany && (
              <Box display="flex" alignItems="center" flexDirection="column">
                <Button
                  label="Cancel upload image"
                  buttonProps={{
                    variant: 'outlined',
                    onClick: () => setShowUploadForm(false),
                    sx: {
                      mt: '1em',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        )}
        {logoCompany && !showUploadForm && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column">
            <Box
              sx={{
                border: `1px solid ${theme.palette.text.disabled}`,
                padding: '0.5em',
                height: '12.5em',
                width: '12.5em',
                display: 'flex',
                flexDirection: 'column',
              }}>
              <Box
                sx={{flexGrow: 1, height: 0, cursor: 'pointer'}}
                onClick={() =>
                  window.open(
                    logoUrl[company?.settings?.whiteLabel?.logoPath],
                    '_blank',
                  )
                }>
                <img
                  alt=""
                  src={logoUrl[company?.settings?.whiteLabel?.logoPath]}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'top',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>
            </Box>
            <Button
              label="Replace Image"
              buttonProps={{
                variant: 'outlined',
                onClick: () => setShowUploadForm(true),
                sx: {
                  mt: '1em',
                },
              }}
            />
          </Box>
        )}
      </>
    </InfoCard>
  );
};
