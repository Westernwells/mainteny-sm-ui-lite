import {useContext, useEffect, useMemo, useState} from 'react';
import {Box} from '@mui/system';
import {ServiceCompanyItem} from 'models/service-company';
import {Alert, SelectChangeEvent, Switch, Typography} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import OfficeFilePDF from 'assets/icons/OfficeFilePDF.svg';
import {useTranslation} from 'react-i18next';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {
  ClientReportForPDFConfig,
  ClientStorageKeys,
} from 'models/client-storage';
import {
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
  PDF_FONTS,
} from 'utils/constants';
import {FormSelect} from 'components/form/FormSelect';
import useTheme from '@mui/material/styles/useTheme';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import ColorPickerPopup from 'components/ColorPicker/ColorPickerPopover';
import ColorPickerPredefined from 'components/ColorPicker/ColorPickerPredefined';
import PdfSettings from '.';

const PDF_FONT_OPTIONS = PDF_FONTS.map((option) => ({
  label: option,
  value: option,
}));

interface Props {
  company?: ServiceCompanyItem;
}

const PDFSettingLayout = ({company}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: ClientStorageKeys.PDF_CONFIG},
  });

  const {
    primaryColor,
    secondaryColor,
    currentPdfFont,
    disableFontSelection,
    setPdfFont,
    setPdfColors,
  } = useContext(PdfStylesContext);

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
      ...DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
      ...parsedValue,
    };
  }, [clientStorageData]);

  const updatePdfConfig = async (newState: ClientReportForPDFConfig) => {
    await updateClientStorage({
      body: {
        key: ClientStorageKeys.PDF_CONFIG,
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

  const onFontChange = async (e: SelectChangeEvent<string | string[]>) => {
    const newValue =
      typeof e.target.value === 'string' ? e.target.value : e.target.value[0];

    await setPdfFont(newValue);
  };

  const onColorChange =
    (field: 'primaryColor' | 'secondaryColor') => (value: string) => {
      setPdfColors(field, value);
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
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              <Typography
                variant="secondary"
                sx={{
                  color: theme.palette.text.secondary,
                }}>
                {t('Included data')}
              </Typography>
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
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
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
                      onCheckChange(
                        'includeSerialNumber',
                        event.target.checked,
                      );
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
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="primary.main">
                    {t('Show customer VAT')}
                  </Typography>
                  <Switch
                    onChange={(event) => {
                      onCheckChange('includeCustomerVAT', event.target.checked);
                    }}
                    checked={pdfConfigFormState.includeCustomerVAT}
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
                    {t('Show unit building')}
                  </Typography>
                  <Switch
                    onChange={(event) => {
                      onCheckChange(
                        'includeUnitBuilding',
                        event.target.checked,
                      );
                    }}
                    checked={pdfConfigFormState.includeUnitBuilding}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
              <Typography
                variant="secondary"
                sx={{
                  color: theme.palette.text.secondary,
                }}>
                {t('Typography and color')}
              </Typography>
              {!disableFontSelection && (
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                  <Typography variant="subtitle2">{t('Typeface')}</Typography>

                  <FormSelect
                    label=""
                    labelId=""
                    options={PDF_FONT_OPTIONS}
                    selectProps={{
                      id: `id`,
                      value: currentPdfFont,
                      multiple: false,
                      onChange: onFontChange,
                      notched: true,
                    }}
                    isCompanyTranslation
                  />
                </Box>
              )}

              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant="subtitle2">
                  {t('Primary text color')}
                </Typography>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  <ColorPickerPredefined
                    selectedColor={primaryColor}
                    onClick={onColorChange('primaryColor')}
                  />

                  <ColorPickerPopup
                    labelKey="Custom color"
                    initialValue={primaryColor}
                    onChange={onColorChange('primaryColor')}
                  />
                </Box>
              </Box>

              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant="subtitle2">
                  {t('Secondary text color')}
                </Typography>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  <ColorPickerPredefined
                    selectedColor={secondaryColor}
                    onClick={onColorChange('secondaryColor')}
                  />

                  <ColorPickerPopup
                    labelKey="Custom color"
                    initialValue={secondaryColor}
                    onChange={onColorChange('primaryColor')}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </InfoCard>
      )}
    </Box>
  );
};

export default PDFSettingLayout;
