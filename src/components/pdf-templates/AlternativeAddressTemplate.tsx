import {AddressRecord, HeaderFooterInfoData} from 'models/misc';
import {UserAccount} from 'models/user';
import {AlternativeServiceCompanyInfo} from 'models/invoice';
import {getServiceCompanyInfo} from 'utils/company-utils';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {ContextProps} from 'context/PdfStylesProvider';
import PdfTemplateFooter from './PdfTemplateFooter';
import PdfTemplateHeader from './PdfTemplateHeader';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import TopSectionContainer from './containers/TopSectionContainer';

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  alternativeAddress?: AddressRecord;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const AlternativeAddressTemplate = ({
  userInfo,
  translate,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  alternativeServiceCompanyInfo,
  alternativeAddress,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const serviceCompanyInfo = getServiceCompanyInfo(
    userInfo,
    alternativeServiceCompanyInfo,
  );

  return (
    <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
      <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

      <PdfBodyContainer>
        <TopSectionContainer>
          <PdfTemplateLeftAddress
            serviceCompanyInfo={serviceCompanyInfo}
            fallbackReceiverName={alternativeAddress?.component?.name}
            addressComponent={alternativeAddress?.component}
            fontStyles={fontStyles}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            translate={translate}
          />
        </TopSectionContainer>
      </PdfBodyContainer>

      <PdfTemplateFooter
        userInfo={userInfo}
        translate={translate}
        footerInfo={footerInfo}
        footerPath={footerPath}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </PdfPageContainer>
  );
};

export default AlternativeAddressTemplate;
