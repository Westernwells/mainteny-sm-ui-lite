import {
  Accordion,
  AccordionDetails,
  Box,
  Fade,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import {ArticleItemsTableNEW} from 'components/ArticleItemsTableNEW';
import {ReactComponent as WrenchScrewdriverIllustration} from 'assets/illustrations/invoice/wrench-screwdriver.svg';
import {InvoiceFormData, InvoiceItemRecord} from 'models/invoice';
import {FormikProps} from 'formik';
import {Amount} from 'models/misc';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useCurrentCurrency} from 'utils/currency';
import {calculateArticleTotalWithVatFormatted} from 'utils/calculate-total';
import {debounce} from 'lodash';
import {SectionTitle} from './SectionTitle';

export const ArticleSectionTitleAction = ({
  shouldShow,
  amount,
  enableCollapse,
  onToggle,
}: {
  shouldShow: boolean;
  onToggle: (newState: boolean) => void;
  amount: string;
  enableCollapse?: boolean;
}) => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
      <Fade timeout={300} in={!shouldShow}>
        <Box
          display="flex"
          flexDirection="row"
          flex={1}
          justifyContent="flex-end"
          mr={2}>
          <Typography color="text.secondary" mr={2}>
            {t('Total amount (incl. VAT)')}:
          </Typography>
          <Typography color="primary.dark">{amount}</Typography>
        </Box>
      </Fade>

      {enableCollapse &&
        (shouldShow ? (
          <Tooltip
            arrow
            placement="top"
            title={t(
              `Click to hide this section from the invoice. Hidden sections won't appear in the final document or any exported versions`,
            )}>
            <VisibilityIcon
              onClick={() => onToggle(false)}
              sx={{width: 25, height: 25, cursor: 'pointer'}}
            />
          </Tooltip>
        ) : (
          <VisibilityOffIcon
            onClick={() => onToggle(true)}
            sx={{width: 25, height: 25, cursor: 'pointer'}}
          />
        ))}
    </Box>
  );
};

interface Props {
  setItems: (items: InvoiceItemRecord<Amount>[]) => void;
  propertyOwnerId: string;
  formik: FormikProps<InvoiceFormData>;
  enableCollapse?: boolean;
  showArticleSection?: boolean;
}

const InvoiceFormArticleSection = ({
  setItems,
  formik,
  propertyOwnerId,
  enableCollapse = false,
  showArticleSection = true,
}: Props) => {
  const [shouldShow, setShouldShow] = useState(showArticleSection);
  const currentCurrency = useCurrentCurrency();

  const [isHovered, setIsHovered] = useState<boolean>(true);

  const debouncedSetIsHovered = debounce((value) => setIsHovered(value), 300);

  useEffect(() => {
    setShouldShow(showArticleSection);
  }, [showArticleSection]);

  const totalAmountInclVatsFormatted = useMemo(
    () => calculateArticleTotalWithVatFormatted(formik.values, currentCurrency),
    [formik.values, currentCurrency],
  );

  const onToggle = (newState: boolean) => {
    setShouldShow(newState);
    formik.setFieldValue('showArticleSection', newState);
  };

  return (
    <Grid
      item
      xs={12}
      bgcolor="white"
      p={3}
      onMouseEnter={() => debouncedSetIsHovered(true)}
      onMouseLeave={() => debouncedSetIsHovered(false)}>
      <Accordion
        TransitionProps={{unmountOnExit: true}}
        expanded={shouldShow}
        sx={{border: 'none', boxShadow: 'none', cursor: 'auto'}}>
        <SectionTitle
          actionComponent={
            <ArticleSectionTitleAction
              shouldShow={shouldShow}
              amount={totalAmountInclVatsFormatted}
              onToggle={onToggle}
              enableCollapse={enableCollapse}
            />
          }
          Icon={WrenchScrewdriverIllustration}
          title="Articles"
          containerSx={{width: '100%'}}
        />

        <AccordionDetails
          sx={{
            '&.MuiAccordionDetails-root': {
              marginTop: 2,
            },
          }}>
          <ArticleItemsTableNEW
            items={formik.values.items}
            setItems={setItems}
            formik={formik}
            propertyOwnerId={propertyOwnerId}
            isHovered={isHovered}
          />
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default InvoiceFormArticleSection;
