import {Alert, Typography, IconButton} from '@mui/material';
import {Box} from '@mui/system';
import {ArticleType} from 'models/article';
import {EditableQuotationItem} from 'models/quotation';
import {useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useCurrentCurrency, formatCurrency, centsToMoney} from 'utils/currency';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {VatAmount} from 'models/invoice';

type MarginProps = {
  mixedPositionItems: EditableQuotationItem[];
  amountAfterGlobalDiscountFormatted: string;
  amountAfterGlobalDiscountWithVATFormatted: string;
  vats?: VatAmount[];
};

const MarginDetails = ({
  mixedPositionItems,
  amountAfterGlobalDiscountFormatted,
  amountAfterGlobalDiscountWithVATFormatted,
  vats = [],
}: MarginProps) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const [showMargins, setShowMargins] = useState(false);

  const {materialMargin, laborMargin, otherMargin, totalPurchaseAmount} =
    useMemo(() => {
      let matMargin = 0;
      let labMargin = 0;
      let othMargin = 0;
      let totalPurchase = 0;

      mixedPositionItems?.forEach((item) => {
        if (item.article?.type === ArticleType.MIX) {
          if (item.subItems && item.subItems.length > 0) {
            item.subItems.forEach((sub) => {
              const subNetAmount =
                Number(sub.unitAmount?.netAmount ?? 0) *
                Number(sub.quantity ?? 0);
              const subPurchaseAmount =
                Number(sub.unitPurchaseAmount?.netAmount ?? 0) *
                Number(sub.quantity ?? 0);
              const subMargin = subNetAmount - subPurchaseAmount;
              totalPurchase += subPurchaseAmount;
              if (sub.article?.type === ArticleType.MATERIAL) {
                matMargin += subMargin;
              } else if (sub.article?.type === ArticleType.LABOR) {
                labMargin += subMargin;
              } else {
                othMargin += subMargin;
              }
            });
          }
        } else {
          const netAmount =
            Number(item.unitAmount?.netAmount ?? 0) *
            Number(item.quantity ?? 0);
          const purchaseAmount =
            Number(item.unitPurchaseAmount?.netAmount ?? 0) *
            Number(item.quantity ?? 0);
          const margin = netAmount - purchaseAmount;
          totalPurchase += purchaseAmount;
          if (item.article?.type === ArticleType.PACKAGE) {
            const laborPercentage = Number(
              item.article?.costPackage?.laborPercentage ?? 0,
            );
            const materialPercentage = Number(
              item.article?.costPackage?.materialPercentage ?? 0,
            );
            labMargin += margin * (laborPercentage / 100);
            matMargin += margin * (materialPercentage / 100);
          } else if (item.article?.type === ArticleType.MATERIAL) {
            matMargin += margin;
          } else if (item.article?.type === ArticleType.LABOR) {
            labMargin += margin;
          } else {
            othMargin += margin;
          }
        }
      });

      return {
        materialMargin: matMargin,
        laborMargin: labMargin,
        otherMargin: othMargin,
        totalPurchaseAmount: totalPurchase,
      };
    }, [mixedPositionItems]);

  const marginItems = [
    {label: 'Material margin', value: materialMargin},
    {label: 'Labor margin', value: laborMargin},
    {label: 'Other margin', value: otherMargin},
  ];

  const totalMargin = materialMargin + laborMargin + otherMargin;

  const totalMarginPercentage =
    totalPurchaseAmount !== 0 ? (totalMargin / totalPurchaseAmount) * 100 : 0;

  return (
    <Box display="flex" justifyContent="flex-end" py={1} pr={6}>
      <Box width={448}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="small" />}
          sx={{mb: 2, py: 0.5}}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t(`The margin(s) won't be visible to the customers.`)}
          </Typography>
        </Alert>

        <Box display="flex" flexDirection="column" gap={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{cursor: 'pointer'}}
            onClick={() => setShowMargins(!showMargins)}>
            <Box display="flex" alignItems="center">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary">
                {t('Total margin')}
              </Typography>
              <IconButton size="small">
                {showMargins ? (
                  <ArrowDropUpIcon color="primary" />
                ) : (
                  <ArrowDropDownIcon color="primary" />
                )}
              </IconButton>
            </Box>
            <Box sx={{display: 'flex'}}>
              <Typography
                variant="subtitle2"
                fontWeight={400}
                color="text.secondary"
                pr={1}>
                ({`${totalMarginPercentage.toFixed(0)}%`})
              </Typography>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary">
                {formatCurrency(
                  centsToMoney(currentCurrency?.code, totalMargin),
                  {
                    currency: currentCurrency?.code,
                  },
                )}
              </Typography>
            </Box>
          </Box>

          {showMargins &&
            marginItems.map((item, idx) => (
              <Box
                key={`${item.label} - ${idx}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="subtitle2"
                  fontWeight={400}
                  color="text.secondary">
                  {t(item.label)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={400}
                  color="text.primary">
                  {formatCurrency(
                    centsToMoney(currentCurrency?.code, item.value),
                    {
                      currency: currentCurrency?.code,
                    },
                  )}
                </Typography>
              </Box>
            ))}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary">
              {t('Subtotal (excl. VAT)')}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary">
              {amountAfterGlobalDiscountFormatted}
            </Typography>
          </Box>

          {vats?.map((vat) => (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary">
                {`${t('VAT')} ${vat.percentageVat}%`}
              </Typography>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary">
                {formatCurrency(
                  centsToMoney(currentCurrency.code, vat.vat ?? 0),
                  {currency: currentCurrency.code},
                )}
              </Typography>
            </Box>
          ))}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary">
              {t('Total amount (incl. VAT)')}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary">
              {amountAfterGlobalDiscountWithVATFormatted}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MarginDetails;
