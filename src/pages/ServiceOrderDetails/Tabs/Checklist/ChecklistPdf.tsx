import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
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
import {formatAddressFullname} from 'utils/utils';
import {PdfChecklistComponent} from './PdfChecklistComponent';

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    page: {
      ...regularFontStyle,
      fontSize: 10,
      paddingTop: 25,
      paddingLeft: 68,
      paddingRight: 45,
      backgroundColor: 'white',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      justifyContent: 'space-between',
      paddingBottom: 95,
      color: '#212121',
    },
    topSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
      alignItems: 'flex-start',
      marginTop: 5,
    },
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
      fontSize: 10,
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 10,
      color: '#616161',
      width: '57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      ...boldFontStyle,
      marginBottom: 10,
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
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  selectedLng?: string;
  selectedChecklist?: ServiceOrderCheckListView;
  serviceOrder?: ServiceOrderView;
  sortedChecklistComponents?: CheckListComponentView[];
  technicianName?: string;
  signaturePath?: string;
};

const ChecklistPdf = ({
  userInfo,
  logoSrc,
  logoDimensions,
  selectedLng,
  translate,
  selectedChecklist,
  serviceOrder,
  sortedChecklistComponents,
  technicianName,
  signaturePath,
}: Props) => {
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
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTemplateHeader
            logoSrc={logoSrc}
            logoDimensions={logoDimensions}
          />

          <View style={styles.topSection}>
            <PdfTemplateLeftAddress
              companyName={userInfo?.serviceCompany?.name}
              billingAddressName={
                userInfo?.serviceCompany?.billingAddress?.fullName
              }
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
                    selectedChecklist?.checkList?.meta.createdAt || new Date(),
                  )}
                </Text>
              </View>

              {(userInfo?.firstName || userInfo?.lastName) && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Generated by')}</Text>
                  <Text style={styles.tagContent}>
                    {userInfo?.firstName} {userInfo?.lastName}
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
                {serviceOrder?.elevator?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Unit no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator?.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.elevator?.address?.fullName && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Unit address')}</Text>
                    <Text style={styles.tagContent}>{`${
                      formatAddressFullname(elevatorAddress)?.fullCityName
                    }`}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.contentHeader}>
              {selectedChecklist?.checkList.name}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderIndex}>#</Text>
                <Text style={styles.tableHeaderContent}>
                  {translate('Item')}
                </Text>
              </View>

              <View>
                {sortedChecklistComponents?.map((component, index) => (
                  <PdfChecklistComponent
                    key={component.id}
                    component={component}
                    selectedLng={selectedLng}
                    index={index}
                  />
                ))}
              </View>
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
        </View>

        <PdfTemplateFooter
          userInfo={userInfo}
          selectedLng={selectedLng}
          translate={translate}
        />
      </Page>
    </Document>
  );
};

export default ChecklistPdf;
