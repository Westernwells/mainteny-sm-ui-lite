import {Grid} from '@mui/material';
import {ArticleItemsTableNEW} from 'components/ArticleItemsTableNEW';
import {ReactComponent as WrenchScrewdriverIllustration} from 'assets/illustrations/invoice/wrench-screwdriver.svg';
import {InvoiceFormData, InvoiceItemRecord} from 'models/invoice';
import {ServiceOrderArticleView} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';
import {FormikProps} from 'formik';
import {useEffect, useState} from 'react';
import {debounce} from 'lodash';
import InvoiceShowOnPDFSwitch from 'components/Switch/InvoiceShowOnPDFSwitch';
import {SectionTitle} from './SectionTitle';

interface Props {
  setItems: (items: InvoiceItemRecord[]) => void;
  propertyOwner?: PropertyOwnerView;
  formik: FormikProps<InvoiceFormData>;
  enableCollapse?: boolean;
  showArticleSection?: boolean;
  jobArticles?: ServiceOrderArticleView[];
}

const InvoiceFormArticleSection = ({
  setItems,
  formik,
  propertyOwner,
  enableCollapse = false,
  showArticleSection = true,
  jobArticles,
}: Props) => {
  const [shouldShow, setShouldShow] = useState(showArticleSection);

  const [isHovered, setIsHovered] = useState<boolean>(true);

  const debouncedSetIsHovered = debounce((value) => setIsHovered(value), 300);

  useEffect(() => {
    setShouldShow(showArticleSection);
  }, [showArticleSection]);

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
      <SectionTitle
        actionComponent={
          <InvoiceShowOnPDFSwitch
            shouldShow={shouldShow}
            onToggle={onToggle}
            enableCollapse={enableCollapse}
          />
        }
        Icon={WrenchScrewdriverIllustration}
        title="Articles"
        containerSx={{width: '100%'}}
      />

      <ArticleItemsTableNEW
        items={formik.values.items}
        setItems={setItems}
        formik={formik}
        propertyOwner={propertyOwner}
        isHovered={isHovered}
        jobArticles={jobArticles}
      />
    </Grid>
  );
};

export default InvoiceFormArticleSection;
