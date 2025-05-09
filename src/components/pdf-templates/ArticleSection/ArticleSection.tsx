import {View} from '@react-pdf/renderer';
import {ContextProps} from 'context/PdfStylesProvider';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {centsToMoney, formatCurrency} from '../../../utils/currency';
import {
  EditableInvoiceItem,
  InvoiceAmountDetail,
  InvoiceView,
} from '../../../models/invoice';
import {Currency} from '../../../models/misc';
import {getStyles} from './ArticleSection.styles';
import ArticleTableHeader from './ArticleTableHeader';
import ArticleSectionFooter from './ArticleSectionFooter';
import {ArticleSectionBody} from './ArticleSectionBody';

type Props = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceItems: EditableInvoiceItem[];
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

export const ArticleSection = ({
  invoice,
  invoiceItems,
  invoiceAmountDetail,
  currentCurrency,
  translate,
  selectedLng,
  primaryColor,
  secondaryColor,
  fontStyles,
}: Props) => {
  const styles = getStyles({primaryColor});

  const discount = invoice?.additionalInfo?.discount;
  const discountAmount = discount?.amount;
  const discountValue = centsToMoney(
    currentCurrency?.code!,
    discountAmount?.value ?? 0,
  );

  const amountAfterGlobalDiscount = centsToMoney(
    currentCurrency?.code!,
    invoiceAmountDetail?.amountAfterGlobalDiscount?.netAmount ?? 0,
  );

  const amountAfterGlobalDiscountWithVAT = centsToMoney(
    currentCurrency?.code!,
    invoiceAmountDetail?.amountAfterGlobalDiscount.grossAmount ?? 0,
  );
  const vats = invoiceAmountDetail?.amountAfterGlobalDiscount.vats || [];

  const amountAfterGlobalDiscountFormatted = formatCurrency(
    amountAfterGlobalDiscount,
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const amountAfterGlobalDiscountWithVATFormatted = formatCurrency(
    amountAfterGlobalDiscountWithVAT,
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const showDiscountCol = !allItemsHaveZeroDiscount(invoiceItems);

  return (
    <View
      style={{
        marginVertical: 16,
        paddingRight: 5,
      }}>
      <View>
        <View style={styles.table}>
          <ArticleTableHeader
            translate={translate}
            currentCurrency={currentCurrency}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            showDiscountCol={showDiscountCol}
          />

          <ArticleSectionBody
            items={invoiceItems}
            amountDetail={invoiceAmountDetail}
            currentCurrency={currentCurrency}
            selectedLng={selectedLng}
            translate={translate}
            primaryColor={primaryColor}
            showDiscountCol={showDiscountCol}
            fontStyles={fontStyles}
          />

          <ArticleSectionFooter
            translate={translate}
            discountValue={discountValue}
            currentCurrency={currentCurrency}
            selectedLng={selectedLng}
            amountAfterGlobalDiscountFormatted={
              amountAfterGlobalDiscountFormatted
            }
            vats={vats}
            amountAfterGlobalDiscountWithVATFormatted={
              amountAfterGlobalDiscountWithVATFormatted
            }
            primaryColor={primaryColor}
            fontStyles={fontStyles}
          />
        </View>
      </View>
    </View>
  );
};
