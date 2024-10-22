import {Document, Text, View, StyleSheet, Image} from '@react-pdf/renderer';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import {
  CheckListComponentView,
  ServiceOrderCheckListView,
} from 'models/checklist';
import {ServiceOrderView} from 'models/service-order';
import {UserAccount} from 'models/user';
import {formatDate} from 'utils/datetime';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {HeaderFooterInfoData} from 'models/misc';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {PdfChecklistComponent} from './PdfChecklistComponent';

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    rightAddress: {
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
    },
    rightAddressContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 6,
    },
    tag: {
      ...boldFontStyle,
      fontSize: 8.5,
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: '#616161',
      width: '57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentBody: {
      color: '#212121',
      fontSize: 10,
      marginBottom: 10,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: '#212121',
      fontWeight: 'extrabold',
    },
    sectionBody: {
      fontSize: 10,
      fontWeight: 'light',
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
    table: {
      width: '100%',
      display: 'flex',
      marginTop: 10,
      border: '1px solid rgb(143, 155, 179)',
      paddingTop: 8,
      paddingBottom: 10,
      paddingHorizontal: 10,
      borderRadius: 4,
    },
    tableHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 8,
      alignItems: 'center',
      borderBottom: '1px solid rgb(143, 155, 179)',
    },
    tableHeaderIndex: {
      flex: '0 0 5%',
      color: 'rgb(143, 155, 179)',
    },
    tableHeaderContent: {
      flex: '0 0 95%',
      textTransform: 'uppercase',
      color: 'rgb(143, 155, 179)',
      fontSize: 7,
    },
    descriptionText: {
      width: '45%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.3,
    },
  });

type Props = {
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount | undefined;
  selectedLng?: string;
  selectedChecklist?: ServiceOrderCheckListView;
  serviceOrder?: ServiceOrderView;
  sortedChecklistComponents?: CheckListComponentView[];
  technicianName?: string;
  signaturePath?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
};

const ChecklistPdf = ({
  userInfo,
  selectedLng,
  translate,
  selectedChecklist,
  serviceOrder,
  sortedChecklistComponents,
  technicianName,
  signaturePath,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  pdfConfigClientStorage,
}: Props) => {
  const serviceCompanyInfo = getServiceCompanyInfo(userInfo);

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  const elevatorAddress = serviceOrder?.elevator?.address;

  return (
    <Document>
      <PdfPageContainer selectedLng={selectedLng}>
        <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

        <PdfBodyContainer>
          <TopSectionContainer>
            <PdfTemplateLeftAddress
              serviceCompanyInfo={serviceCompanyInfo}
              receiverName={serviceOrder?.elevator?.propertyOwner?.name}
              addressComponent={
                serviceOrder?.elevator.propertyOwner.billingAddress?.component
              }
              selectedLng={selectedLng}
              translate={translate}
            />

            <View style={styles.rightAddress}>
              {selectedChecklist?.checkList?.externalId && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Checklist no.')}</Text>
                  <Text style={styles.tagContent}>
                    {selectedChecklist?.checkList?.externalId || '-'}
                  </Text>
                </View>
              )}

              <View style={styles.rightAddressContent}>
                <Text style={styles.tag}>{translate('Checklist date')}</Text>
                <Text style={styles.tagContent}>
                  {formatDate(
                    selectedChecklist?.additionalInfo.completedAt || new Date(),
                  )}
                </Text>
              </View>

              {pdfConfigClientStorage.includeUsername &&
                (userInfo?.firstName || userInfo?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.firstName} {userInfo?.lastName}
                    </Text>
                  </View>
                )}

              {pdfConfigClientStorage.includeUserPhone && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Phone number')}</Text>
                  <Text style={styles.tagContent}>
                    {serviceOrder?.elevator?.propertyOwner?.contact.phone ||
                      '-'}
                  </Text>
                </View>
              )}
              {pdfConfigClientStorage.includeUserEmail && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Email address')}</Text>
                  <Text style={styles.tagContent}>
                    {serviceOrder?.elevator?.propertyOwner?.contact.email ||
                      '-'}
                  </Text>
                </View>
              )}
              {serviceOrder?.elevator?.propertyOwner?.externalId && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Customer no.')}</Text>
                  <Text style={styles.tagContent}>
                    {serviceOrder?.elevator?.propertyOwner?.externalId}{' '}
                  </Text>
                </View>
              )}

              {serviceOrder?.externalId && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Job no.')}</Text>
                  <Text style={styles.tagContent}>
                    {serviceOrder?.externalId || '-'}{' '}
                  </Text>
                </View>
              )}
              <View style={{marginTop: 20}}>
                {pdfConfigClientStorage.includeUnitNumber &&
                  serviceOrder?.elevator?.externalId && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Unit no.', {context: 'elevator'})}
                      </Text>
                      <Text style={styles.tagContent}>
                        {serviceOrder?.elevator?.externalId}
                      </Text>
                    </View>
                  )}
                {pdfConfigClientStorage.includeSerialNumber && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>
                      {translate('Serial number')}.
                    </Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator?.serialNumber}
                    </Text>
                  </View>
                )}

                <PdfUnitAddress
                  address={elevatorAddress}
                  translate={translate}
                  selectedLng={selectedLng}
                />
              </View>
            </View>
          </TopSectionContainer>

          <View>
            <PdfPageTitle selectedLng={selectedLng}>
              {selectedChecklist?.checkList.name}
            </PdfPageTitle>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderIndex}>#</Text>
                <Text style={styles.tableHeaderContent}>
                  {translate('Item')}
                </Text>
              </View>

              <PdfChecklistComponent
                components={sortedChecklistComponents!}
                selectedLng={selectedLng}
              />
            </View>

            {signaturePath && (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #E4E9F2',
                  borderRadius: '8px',
                  marginTop: 20,
                  maxWidth: 150,
                  height: 56,
                  textAlign: 'center',
                  justifyContent: 'space-around',
                  position: 'relative',
                }}
                wrap={false}>
                <View>
                  {signaturePath ? (
                    <Image
                      src={signaturePath}
                      style={{width: 120, height: 40}}
                    />
                  ) : (
                    <Text>{translate('No Signature')}</Text>
                  )}
                </View>
                {technicianName && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      textAlign: 'center',
                      width: '100%',
                    }}>
                    <Text>{technicianName}</Text>
                  </View>
                )}
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

export default ChecklistPdf;
