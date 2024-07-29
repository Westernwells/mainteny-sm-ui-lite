import {useMemo} from 'react';
import {Document, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {InvoiceItem, InvoiceView} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {calculateInvoiceAmount} from 'utils/calculate-total';
import {
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  stripHtmlTags,
} from 'pages/InvoiceDetails/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {ArticleType} from 'models/article';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import TopSectionContainer from './containers/TopSectionContainer';
import {ArticleSection} from './ArticleSection/ArticleSection';

Font.register({
  family: 'Montserrat-Bold',
  format: 'truetype',
  src: MontserratBold,
});

Font.register({
  family: 'Montserrat-Regular',
  format: 'truetype',
  src: MontserratRegular,
});
Font.register({
  family: 'NotoSans-Regular',
  format: 'truetype',
  src: NotoSansGeorgianRegular,
});

Font.register({
  family: 'NotoSans-Bold',
  format: 'truetype',
  src: NotoSansGeorgianBold,
});

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    contentBody: {
      marginTop: 6,
      marginBottom: 16,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: '#212121',
      ...boldFontStyle,
      marginTop: 15,
    },
  });

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  previousInvoices: InvoiceView[];
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  nextCompanyExternalId?: string;
};

const FinalInvoicePdfTemplate = ({
  translate,
  userInfo,
  currentCurrency,
  invoice,
  selectedLng,
  previousInvoices,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  nextCompanyExternalId,
}: Props) => {
  const articleItems = invoice?.items.map((item) => ({
    ...item,
    discount: getDiscoutObj(item?.additionalInfo?.discount),
  }));

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    invoice.additionalInfo.discount,
  );

  const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
  const discountAmount = discount?.amount;
  const discountValue = discountAmount?.value ?? 0;

  const netTotal = (articleItem: InvoiceItem) => {
    const grossTotal =
      (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
    const itemDiscountValue =
      articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

    return (
      (grossTotal - itemDiscountValue) /
        10 ** articleItem.unitAmount.fractionDigits ?? 2
    );
  };

  const allItemsHaveZeroDiscount = articleItems?.every(
    (item) =>
      item?.additionalInfo?.discount?.amount?.value === 0 ||
      item?.additionalInfo?.discount?.percentage === 0,
  );

  const {amountAfterGlobalDiscount, vats, amountAfterGlobalDiscountWithVAT} =
    useMemo(
      () =>
        calculateInvoiceAmount({
          items: articleItems,
          globalDiscount: discount,
        }),
      [articleItems, discount],
    );

  const amountAfterGlobalDiscountFormatted = formatCurrency(
    amountAfterGlobalDiscount,
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const laborCost = useCalculateLaborMaterialCost(
    itemsAfterGlobalDiscount,
    ArticleType.LABOR,
    currentCurrency,
  );
  const materialCost = useCalculateLaborMaterialCost(
    itemsAfterGlobalDiscount,
    ArticleType.MATERIAL,
    currentCurrency,
  );

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return (
    <Document>
      <PdfPageContainer selectedLng={selectedLng}>
        <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

        <PdfBodyContainer>
          <TopSectionContainer>
            <PdfTemplateLeftAddress
              companyName={userInfo?.serviceCompany?.name}
              billingAddressName={
                userInfo?.serviceCompany?.billingAddress?.fullName
              }
              receiverName={
                invoice?.additionalInfo?.billingAddress?.component?.name ||
                invoice?.propertyOwner?.name
              }
              addressComponent={
                invoice?.additionalInfo?.billingAddress?.component
              }
              beneficiaryInfo={
                invoice?.additionalInfo.beneficiaryAddress?.component
              }
              selectedLng={selectedLng}
              translate={translate}
            />

            <PdfTemplateInvoiceDetails
              translate={translate}
              invoice={invoice}
              selectedLng={selectedLng}
              nextCompanyExternalId={nextCompanyExternalId}
            />
          </TopSectionContainer>

          <View>
            <PdfPageTitleHtml
              selectedLng={selectedLng}
              value={invoice?.subject}
            />

            {invoice?.description.trim() !== '' && (
              <HtmlPDF
                html={invoice?.description || ''}
                rootStyle={styles.contentBody}
              />
            )}

            {invoice?.additionalInfo.showArticleSection && (
              <ArticleSection
                invoice={invoice}
                currentCurrency={currentCurrency}
                translate={translate}
                allItemsHaveZeroDiscount={allItemsHaveZeroDiscount}
                discountValue={discountValue}
                subtotalExclVatFormatted={amountAfterGlobalDiscountFormatted}
                percentageVats={vats}
                total={amountAfterGlobalDiscountWithVAT}
                selectedLng={selectedLng}
                netTotal={netTotal}
              />
            )}

            <PdfPartialPaymentSection
              translate={translate}
              selectedLng={selectedLng}
              invoice={invoice}
              currentCurrency={currentCurrency}
              previousInvoices={previousInvoices}
              articleItems={articleItems}
            />

            {invoice?.additionalInfo?.moreInfo &&
              stripHtmlTags(invoice?.additionalInfo?.moreInfo) && (
                <View wrap={false}>
                  <Text style={styles.sectionHeading}>
                    {translate('Notes')}
                  </Text>
                  <HtmlPDF
                    html={formatCostText(
                      invoice?.additionalInfo?.moreInfo,
                      `${formatCurrency(laborCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                      `${formatCurrency(materialCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                    )}
                  />
                </View>
              )}
          </View>
        </PdfBodyContainer>

        <PdfTemplateFooter
          userInfo={userInfo}
          selectedLng={selectedLng}
          translate={translate}
          footerInfo={footerInfo}
          footerPath={footerPath}
        />
      </PdfPageContainer>
    </Document>
  );
};

export default FinalInvoicePdfTemplate;
