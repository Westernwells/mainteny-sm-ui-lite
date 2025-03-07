import {AddressComponent} from 'models/misc';
import {Text, View} from '@react-pdf/renderer';
import PdfTemplateBeneficiaryAddress from 'components/pdf-templates/PdfTemplateBeneficiaryAddress';
import {getStyles} from 'components/pdf-templates/PdfTemplateLeftAddress/PdfTemplateLeftAddress.styles';
import {useMemo} from 'react';

type Props = {
  serviceCompanyInfo?: string;
  fallbackReceiverName?: string;
  addressComponent?: AddressComponent | null;
  selectedLng?: string;
  translate: (key: string) => string;
  beneficiaryInfo?: AddressComponent | null;
  customerVATId?: string;
  eanValue?: string;
};

const PdfTemplateLeftAddress = ({
  serviceCompanyInfo,
  fallbackReceiverName,
  addressComponent,
  selectedLng,
  translate,
  beneficiaryInfo,
  customerVATId,
  eanValue,
}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  const displayName = useMemo(() => {
    if (!addressComponent && !fallbackReceiverName) return;

    if (!addressComponent || !addressComponent?.name)
      return (
        <Text style={styles.partialAddressText}>{fallbackReceiverName}</Text>
      );

    return (
      <>
        <Text style={styles.partialAddressText}>{addressComponent.name}</Text>
        {addressComponent.name2 && (
          <Text style={styles.partialAddressText}>
            {addressComponent.name2}
          </Text>
        )}
        {addressComponent.name3 && (
          <Text style={styles.partialAddressText}>
            {addressComponent.name3}
          </Text>
        )}
      </>
    );
  }, [fallbackReceiverName, addressComponent]);

  return (
    <View style={styles.leftAddress}>
      <View style={styles.addressTextWrapper}>
        <Text style={styles.addressText}>{serviceCompanyInfo}</Text>
      </View>

      <View style={styles.partAddress}>
        {!!displayName && displayName}

        {!!addressComponent?.street && (
          <Text style={styles.partialAddressText}>
            {addressComponent?.street}
          </Text>
        )}

        {!!addressComponent?.street2 && (
          <Text style={styles.partialAddressText}>
            {addressComponent?.street2}
          </Text>
        )}

        <Text style={styles.partialAddressText}>
          {!!addressComponent?.postalCode &&
            `${addressComponent.postalCode}`.trim()}
          {!!addressComponent?.postalCode &&
            (addressComponent.city || addressComponent.country) &&
            ' '}
          {!!addressComponent?.city && `${addressComponent.city}`.trim()}
          {!!addressComponent?.city && !!addressComponent?.country && ', '}
          {!!addressComponent?.country && `${addressComponent.country}`.trim()}
        </Text>

        <Text style={styles.partialAddressText}>
          {!!addressComponent?.moreInfo &&
            `${addressComponent.moreInfo}`.trim()}
        </Text>
      </View>

      {!!customerVATId && (
        <Text style={styles.partialAddressText}>
          {translate('VAT ID')}: {customerVATId}
        </Text>
      )}

      {!!eanValue && (
        <Text style={styles.partialAddressText}>
          {translate('EAN')}: {eanValue}
        </Text>
      )}

      {!!(
        beneficiaryInfo?.name ||
        beneficiaryInfo?.city ||
        beneficiaryInfo?.street
      ) && (
        <PdfTemplateBeneficiaryAddress
          selectedLng={selectedLng}
          translate={translate}
          beneficiaryInfo={beneficiaryInfo}
        />
      )}
    </View>
  );
};

export default PdfTemplateLeftAddress;
