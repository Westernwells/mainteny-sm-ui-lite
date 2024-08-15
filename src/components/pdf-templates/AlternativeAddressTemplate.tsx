import {AddressRecord, HeaderFooterInfoData} from 'models/misc';
import {UserAccount} from 'models/user';
import {AlternativeServiceCompanyInfo} from 'models/invoice';
import {getServiceCompanyInfo} from 'utils/company-utils';
import PdfTemplateFooter from './PdfTemplateFooter';
import PdfTemplateHeader from './PdfTemplateHeader';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfTemplateLeftAddress from './PdfTemplateLeftAddress';

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  alternativeAddress?: AddressRecord;
};

const AlternativeAddressTemplate = ({
  userInfo,
  selectedLng,
  translate,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  alternativeServiceCompanyInfo,
  alternativeAddress,
}: Props) => {
  const serviceCompanyInfo = getServiceCompanyInfo(
    userInfo,
    alternativeServiceCompanyInfo,
  );

  return (
    <PdfPageContainer selectedLng={selectedLng}>
      <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

      <PdfBodyContainer>
        <TopSectionContainer>
          <PdfTemplateLeftAddress
            serviceCompanyInfo={serviceCompanyInfo}
            receiverName={alternativeAddress?.component?.name}
            addressComponent={alternativeAddress?.component}
            selectedLng={selectedLng}
            translate={translate}
          />
        </TopSectionContainer>
      </PdfBodyContainer>

      <PdfTemplateFooter
        userInfo={userInfo}
        selectedLng={selectedLng}
        translate={translate}
        footerInfo={footerInfo}
        footerPath={footerPath}
      />
    </PdfPageContainer>
  );
};

export default AlternativeAddressTemplate;
