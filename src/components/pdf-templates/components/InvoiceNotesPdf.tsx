// components/pdf-templates/InvoiceNotes.tsx
import {StyleSheet, View} from '@react-pdf/renderer';
import {HtmlPDF} from 'components/HtmlPDF';
import {stripHtmlTags} from 'pages/InvoiceDetails/utils';
import {formatCurrency} from 'utils/currency';
import {formatCostText} from 'utils/utils';
import type {Currency} from 'models/misc';

type InvoiceNotesProps = {
  moreInfo?: string;
  labor: number;
  material: number;
  currentCurrency?: Currency;
  selectedLng?: string;
  fontStyles: any;
};

const styles = StyleSheet.create({
  notesSection: {
    marginTop: 30,
  },
  notesRoot: {
    marginTop: 6,
    marginBottom: 16,
  },
});

export const InvoiceNotesPdf = (props: InvoiceNotesProps) => {
  const {moreInfo, labor, material, currentCurrency, selectedLng, fontStyles} =
    props;

  if (!moreInfo || !stripHtmlTags(moreInfo).trim()) {
    return null;
  }

  const laborText = formatCurrency(labor, {
    currency: currentCurrency?.code,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

  const materialText = formatCurrency(material, {
    currency: currentCurrency?.code,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

  return (
    <View style={styles.notesSection}>
      <HtmlPDF
        html={formatCostText(moreInfo, laborText, materialText)}
        rootStyle={styles.notesRoot}
        fontStyles={fontStyles}
      />
    </View>
  );
};
