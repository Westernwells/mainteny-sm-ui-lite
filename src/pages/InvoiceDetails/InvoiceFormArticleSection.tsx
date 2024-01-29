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

import {Dispatch, SetStateAction, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useCurrentCurrency} from 'utils/currency';
import {calculateArticleTotalWithVatFormatted} from 'utils/calculate-total';
import {SectionTitle} from './SectionTitle';

export const ArticleSectionTitleAction = ({
  shouldShow,
  setShouldShow,
  amount,
  enableCollapse,
}: {
  shouldShow: boolean;
  setShouldShow: Dispatch<SetStateAction<boolean>>;
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
            Total amount:
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
              `Click to hide this section from the invoice. Hidden section will appear in the invoice or any exported versions`,
            )}>
            <VisibilityIcon
              onClick={() => setShouldShow(false)}
              sx={{width: 25, height: 25, cursor: 'pointer'}}
            />
          </Tooltip>
        ) : (
          <VisibilityOffIcon
            onClick={() => setShouldShow(true)}
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
}

const InvoiceFormArticleSection = ({
  setItems,
  formik,
  propertyOwnerId,
  enableCollapse = false,
}: Props) => {
  const [shouldShow, setShouldShow] = useState(!enableCollapse);
  const currentCurrency = useCurrentCurrency();

  const totalAmountInclVatsFormatted = useMemo(
    () => calculateArticleTotalWithVatFormatted(formik.values, currentCurrency),
    [formik.values, currentCurrency],
  );

  return (
    <Grid item xs={12} bgcolor="white" p={3}>
      <Accordion
        TransitionProps={{unmountOnExit: true}}
        expanded={shouldShow}
        sx={{border: 'none', boxShadow: 'none', cursor: 'auto'}}>
        <SectionTitle
          actionComponent={
            <ArticleSectionTitleAction
              shouldShow={shouldShow}
              amount={totalAmountInclVatsFormatted}
              setShouldShow={setShouldShow}
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
          />
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default InvoiceFormArticleSection;
