import {useEffect, useMemo, useState} from 'react';
import {Box} from '@mui/system';
import {ServiceCompanyItem} from 'models/service-company';
import {Alert, Switch, Typography} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import OfficeFilePDF from 'assets/icons/OfficeFilePDF.svg';
import {useTranslation} from 'react-i18next';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import PdfSettings from '.';

interface Props {
  company?: ServiceCompanyItem;
}

const PDFSettingLayout = ({company}: Props) => {
  const {t} = useTranslation();
  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const [pdfConfigFormState, setPdfConfigFormState] =
    useState<ClientReportForPDFConfig>(DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE);
  const {mutateAsync: updateClientStorage} =
    useUpdateServiceCompanyClientStorage('PDF config updated successfully');
  const [isPDFShowingBig, setIsPDFShowingBig] = useState(false);

  const pdfConfig = useMemo(() => {
    const parsedValue: ClientReportForPDFConfig = JSON.parse(
      clientStorageData?.value || '{}',
    );

    return {
      includeUnitNumber: parsedValue.includeUnitNumber ?? false,
      includeSerialNumber: parsedValue.includeSerialNumber ?? false,
      includeUsername: parsedValue.includeUsername ?? false,
      includeUserEmail: parsedValue.includeUserEmail ?? false,
      includeUserPhone: parsedValue.includeUserPhone ?? false,
    };
  }, [clientStorageData]);

  const updatePdfConfig = async (newState: ClientReportForPDFConfig) => {
    await updateClientStorage({
      body: {
        key: CLIENT_STORAGE_PDF_CONFIG_KEY,
        value: JSON.stringify(newState),
      },
      serviceCompanyId: company?.id || '',
    });
  };

  const onCheckChange = (label: string, value: boolean) => {
    const newState = {
      ...pdfConfigFormState,
      [label]: value,
    };
    setPdfConfigFormState(newState);

    updatePdfConfig(newState);
  };

  const handleBigVariantToggle = (isBig: boolean) => {
    setIsPDFShowingBig(isBig);
  };

  useEffect(() => {
    setPdfConfigFormState(pdfConfig);
  }, [pdfConfig]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'row'}}>
      <PdfSettings
        onBigVariantToggle={handleBigVariantToggle}
        company={company!}
      />
      {!isPDFShowingBig && (
        <InfoCard
          header={
            <Typography variant="h6">{t('PDF configuration')}</Typography>
          }
          showHeaderBackground={false}
          containerStyles={{
            height: 'fit-content',
            width: '100%',
            maxWidth: 300,
          }}
          headerIcon={
            <img
              style={{width: '23px', height: '23px'}}
              alt="office-file-pdf"
              src={OfficeFilePDF}
            />
          }>
          <Box>
            <Box display="flex">
              <Alert severity="info">
                <Typography fontWeight="bold" variant="body2">
                  {t('Included data')}
                </Typography>
                <Typography variant="body2">
                  {t(
                    'Select data to auto-include in PDFs, like invoices and quotes.',
                  )}
                </Typography>
              </Alert>
            </Box>
            <Box mt={3}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main">
                  {t('Unit number')}
                </Typography>
                <Switch
                  onChange={(event) => {
                    onCheckChange('includeUnitNumber', event.target.checked);
                  }}
                  checked={pdfConfigFormState.includeUnitNumber}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main">
                  {t('Serial number')}
                </Typography>
                <Switch
                  onChange={(event) => {
                    onCheckChange('includeSerialNumber', event.target.checked);
                  }}
                  checked={pdfConfigFormState.includeSerialNumber}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main">
                  {t('User name')}
                </Typography>
                <Switch
                  onChange={(event) => {
                    onCheckChange('includeUsername', event.target.checked);
                  }}
                  checked={pdfConfigFormState.includeUsername}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main">
                  {t('User email address')}
                </Typography>
                <Switch
                  onChange={(event) => {
                    onCheckChange('includeUserEmail', event.target.checked);
                  }}
                  checked={pdfConfigFormState.includeUserEmail}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main">
                  {t('User phone number')}
                </Typography>
                <Switch
                  onChange={(event) => {
                    onCheckChange('includeUserPhone', event.target.checked);
                  }}
                  checked={pdfConfigFormState.includeUserPhone}
                />
              </Box>
            </Box>
          </Box>
        </InfoCard>
      )}
    </Box>
  );
};

export default PDFSettingLayout;
