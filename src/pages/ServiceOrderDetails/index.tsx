import {useEffect, useMemo, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Progress} from 'components/Progress';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useParams, useSearchParams} from 'react-router-dom';
import {formatSearchParams} from 'utils/utils';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {companyLanguageContextMap} from 'utils/language';
import {useCreateAndSetPdfBlobUrl} from 'hooks/useCreateAndSetPdfBlobUrl';
import {useSnackbar} from 'hooks/useSnackbar';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import {CheckList} from './Tabs/Checklist';
import {WorkReport} from './Tabs/WorkReport';
import {Overview} from './Tabs/Overview';
import SupplierInvoices from './Tabs/SupplierInvoices';
import Tasks from './Tabs/Tasks';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Work Report',
    icon: <GradingIcon />,
  },
  {
    label: 'Checklist',
    icon: <FactCheck />,
  },
  {
    label: 'Supplier Invoices',
    icon: <ReceiptLongIcon />,
  },
  {
    label: 'Tasks',
    icon: <RuleOutlinedIcon />,
  },
];

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const ServiceOrderDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: serviceOrderId} = useParams();
  const [queryParams, setQueryParams] = useSearchParams();
  const {data: serviceOrder, isLoading} =
    useServiceOrderDetails(serviceOrderId);
  const {showError} = useSnackbar();
  const {t} = useTranslation();
  const {user} = useUserSession();

  const currentCurrency = useCurrentCurrency();

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const {createAndSetPdfBlobUrl} = useCreateAndSetPdfBlobUrl({
    serviceOrder: serviceOrder!,
    userInfo: user?.userAccount,
    currentCurrency,
    translate,
    fileName: serviceOrder?.number || '',
    selectedLng: company?.language,
  });

  const generatePreviewPdfBlobUrl = async () => {
    createAndSetPdfBlobUrl();
  };

  const generateWorkOverview = async () => {
    try {
      await generatePreviewPdfBlobUrl();
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Tabs
      showActionBtn={tabValue === 0}
      btnLabel="Download Job Overview"
      actionBtnVariant="outlined"
      hideDivider
      actionButtonIcon={<FileDownloadIcon />}
      btnOnClick={generateWorkOverview}
      actionButtonStyles={{background: 'transparent'}}
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}>
      <TabsBody
        value={tabValue}
        index={0}
        containerStyle={{height: 2, marginTop: 3}}>
        <Overview serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody value={tabValue} index={1} containerStyle={{marginTop: 3}}>
        <WorkReport serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={2}
        containerStyle={{height: '1px', overflow: 'auto', marginTop: 3}}>
        <CheckList serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={3}
        containerStyle={{height: '1px', overflow: 'auto', marginTop: 3}}>
        <SupplierInvoices serviceOrderId={serviceOrder?.id!} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={4}
        containerStyle={{
          height: '1px',
          overflow: 'auto',
          marginTop: 1,
          backgroundColor: 'white',
          padding: 3,
        }}>
        <Tasks serviceOrderId={serviceOrder?.id!} />
      </TabsBody>
    </Tabs>
  );
};

export default ServiceOrderDetails;
