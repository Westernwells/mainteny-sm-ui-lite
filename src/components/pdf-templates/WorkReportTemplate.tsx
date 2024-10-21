import {
  Document,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {
  ServiceOrderReportView,
  ServiceOrderScheduleSimpleView,
  ServiceOrderView,
} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import capitalize from 'lodash/capitalize';
import {convertMinutesWithRounding} from 'utils/work-hours-utils';
import {HtmlPDF} from 'components/HtmlPDF';
import {HeaderFooterInfoData} from 'models/misc';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {MinToStep} from 'models/service-company';
import {ClientReportForPDFConfig} from 'models/client-storage';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateFooter from './PdfTemplateFooter';
import PdfTemplateHeader from './PdfTemplateHeader';
import PdfTemplateLeftAddress from './PdfTemplateLeftAddress';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfPageTitle from './containers/PdfPageTitle';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfUnitAddress from './containers/PdfUnitAddress';

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

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    rightAddress: {
      minWidth: 200,
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
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    statusHeader: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: 25,
      marginTop: 5,
    },
    unitStatus: {
      ...boldFontStyle,
    },
    contentBody: {
      color: '#212121',
      fontSize: 10,
      marginBottom: 10,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    notesSection: {
      paddingBottom: 6,
      marginTop: 5,
    },
    deliverySection: {
      paddingBottom: 6,
      marginTop: 10,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginTop: 20,
      color: '#212121',
      ...boldFontStyle,
    },
    sectionBody: {
      fontSize: 10,
      ...regularFontStyle,
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
    table: {
      width: '100%',
      display: 'flex',
      marginTop: 10,
      borderBottom: '1px solid #212121',
    },
    tableBody: {
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 4,
      width: '100%',
    },
    tableHeading: {
      color: '#616161',
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
      marginRight: -4,
    },
    tableBodyContent: {
      color: '#212121',
      fontSize: 10,
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      marginVertical: 3,
      width: '100%',
      justifyContent: 'space-between',
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
    imageWrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      width: '100%',
      flexWrap: 'wrap',
    },
    imageContainer: {
      marginVertical: 5,
      marginHorizontal: 5,
    },
    imageDescription: {
      color: '#616161',
      marginTop: 10,
    },
    signatureWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
  });

type BookedHoursProps = {
  startTime?: string;
  totalFormatted: string;
  percentageSurcharge?: number;
  type: string;
  technicianName?: string;
  selectedLng?: string;
  translate: (key: string) => string;
  showTime: boolean;
  showHours: boolean;
};

const BookedHoursRow = ({
  startTime,
  totalFormatted,
  percentageSurcharge,
  type,
  technicianName,
  selectedLng,
  translate,
  showTime,
  showHours,
}: BookedHoursProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  return (
    <View style={styles.tableRow}>
      <Text
        style={{width: '15%', textAlign: 'left', ...styles.tableBodyContent}}>
        {startTime ? formatDate(startTime) : '-'}
      </Text>
      {showTime && (
        <Text
          style={{
            width: '10%',
            textAlign: 'right',
            ...styles.tableBodyContent,
          }}>
          {startTime ? formatDate(startTime, 'HH:mm') : '-'}
        </Text>
      )}
      {showHours && (
        <Text
          style={{
            width: '13%',
            textAlign: 'right',
            ...styles.tableBodyContent,
          }}>
          {totalFormatted}
        </Text>
      )}
      <Text
        style={{width: '15%', textAlign: 'right', ...styles.tableBodyContent}}>
        {percentageSurcharge ? `${percentageSurcharge}%` : '-'}
      </Text>
      <Text
        style={{
          width: '17%',
          textAlign: 'right',
          ...styles.tableBodyContent,
        }}>
        {translate(type)}
      </Text>
      <Text
        style={{
          width: '30%',
          textAlign: 'left',
          marginLeft: 36,
          ...styles.tableBodyContent,
        }}>
        {technicianName}
      </Text>
    </View>
  );
};

type Props = {
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount | undefined;
  serviceOrder?: ServiceOrderView;
  report?: ServiceOrderReportView;
  schedule?: ServiceOrderScheduleSimpleView;
  selectedLng?: string;
  technicianSignatureImage?: string;
  customerSignatureImage?: string;
  workReportPictures: string[];
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
};

const WorkReportTemplate = React.memo(
  ({
    userInfo,
    serviceOrder,
    report,
    schedule,
    selectedLng,
    translate,
    customerSignatureImage,
    technicianSignatureImage,
    workReportPictures,
    headerInfo,
    headerPath,
    footerInfo,
    footerPath,
    pdfConfigClientStorage,
  }: Props) => {
    const serviceCompanyInfo = getServiceCompanyInfo(userInfo);
    const company = userInfo?.serviceCompany;

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
                  serviceOrder?.elevator?.propertyOwner.billingAddress
                    ?.component
                }
                selectedLng={selectedLng}
                translate={translate}
              />

              <View style={styles.rightAddress}>
                {report?.number && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Report no.')}</Text>
                    <Text style={styles.tagContent}>{report?.number}</Text>
                  </View>
                )}

                {serviceOrder?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Job no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.type && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Job type')}</Text>
                    <Text style={styles.tagContent}>
                      {translate(serviceOrderTypeToString(serviceOrder?.type!))}{' '}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>
                    {translate('Work report date')}
                  </Text>
                  <Text style={styles.tagContent}>
                    {formatDate(report?.meta.createdAt)}
                  </Text>
                </View>

                {serviceOrder?.elevator?.propertyOwner?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Customer no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator?.propertyOwner?.externalId}
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
                {(schedule?.technician?.userAccount?.firstName ||
                  schedule?.technician?.userAccount?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Engineer')}</Text>
                    <Text style={styles.tagContent}>
                      {schedule?.technician?.userAccount?.firstName}{' '}
                      {schedule?.technician?.userAccount?.lastName}
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
                        {serviceOrder?.elevator?.serialNumber || '-'}
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
              <View style={styles.statusHeader}>
                <Text style={styles.unitStatus}>
                  {translate('Unit Status: ')}
                </Text>
                <Text>
                  {translate(
                    `${
                      serviceOrder?.elevator.status &&
                      capitalize(serviceOrder?.elevator.status).replace(
                        /_/g,
                        ' ',
                      )
                    }`,
                  )}
                </Text>
              </View>

              <PdfPageTitle selectedLng={selectedLng}>
                {translate('Work Report')} {report?.number}
              </PdfPageTitle>

              {report?.description.trim() !== '' && (
                <HtmlPDF
                  html={report?.description || ''}
                  selectedLng={selectedLng}
                  rootStyle={{
                    ...styles.contentBody,
                  }}
                />
              )}

              <Text style={styles.sectionHeading}>{translate('Hours')} </Text>

              <View style={styles.table}>
                <View style={styles.tableBody}>
                  <View style={styles.tableRow}>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {translate('Date')}
                    </Text>
                    {report?.additionalInfo.showTime && (
                      <Text
                        style={{
                          width: '10%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Start')}
                      </Text>
                    )}

                    {report?.additionalInfo.showHours && (
                      <Text
                        style={{
                          width: '13%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Hours')}
                      </Text>
                    )}
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Surcharge')}
                    </Text>
                    <Text
                      style={{
                        width: '17%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Type')}
                    </Text>

                    <Text
                      style={{
                        width: '30%',
                        textAlign: 'left',
                        marginLeft: 40,
                        ...styles.tableHeading,
                      }}>
                      {translate('Engineer')}
                    </Text>
                  </View>
                  {report?.additionalInfo.workTimeInfo?.timeSlots.map(
                    (s, index) => (
                      <BookedHoursRow
                        key={`${index} - ${s.startTime}`}
                        startTime={s?.startTime}
                        showHours={report.additionalInfo.showHours!}
                        showTime={report.additionalInfo.showTime!}
                        totalFormatted={convertMinutesWithRounding(
                          s?.minutes!,
                          {
                            hourUnit: 'h',
                          },
                          1,
                          company?.settings.minToHourStep || MinToStep.STEP_0,
                        )}
                        percentageSurcharge={
                          report?.additionalInfo.workTimeInfo
                            ?.percentageSurcharge
                        }
                        type="Work"
                        technicianName={`${schedule?.technician?.userAccount?.firstName} ${schedule?.technician?.userAccount?.lastName}`}
                        selectedLng={selectedLng}
                        translate={translate}
                      />
                    ),
                  )}

                  {report?.additionalInfo.travelTimeInfo?.timeSlots.map(
                    (s, index) => (
                      <BookedHoursRow
                        key={`${index} - ${s.startTime}`}
                        startTime={s?.startTime}
                        showHours={report.additionalInfo.showHours!}
                        showTime={report.additionalInfo.showTime!}
                        totalFormatted={convertMinutesWithRounding(
                          s?.minutes!,
                          {
                            hourUnit: 'h',
                          },
                          1,
                          company?.settings.minToHourStep || MinToStep.STEP_0,
                        )}
                        percentageSurcharge={
                          report?.additionalInfo.travelTimeInfo
                            ?.percentageSurcharge
                        }
                        type="Travel"
                        technicianName={`${schedule?.technician?.userAccount?.firstName} ${schedule?.technician?.userAccount?.lastName}`}
                        selectedLng={selectedLng}
                        translate={translate}
                      />
                    ),
                  )}
                </View>
              </View>

              {serviceOrder?.articles.length && (
                <Text style={styles.sectionHeading}>
                  {translate('Articles')}{' '}
                </Text>
              )}

              {serviceOrder?.articles.length && (
                <View style={styles.tableBody}>
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text
                        style={{
                          width: '5%',
                          textAlign: 'left',
                          ...styles.tableHeading,
                        }}>
                        #
                      </Text>
                      <Text
                        style={{
                          width: '45%',
                          textAlign: 'left',
                          ...styles.tableHeading,
                        }}>
                        {translate('Article Name')}
                      </Text>
                      <Text
                        style={{
                          width: '30%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Article Number')}
                      </Text>
                      <Text
                        style={{
                          width: '20%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Quantity')}
                      </Text>
                      <Text
                        style={{
                          width: '10%',
                          textAlign: 'right',
                          marginLeft: 10,
                          ...styles.tableHeading,
                        }}>
                        {translate('Unit')}
                      </Text>
                    </View>
                    <View style={styles.tableBody}>
                      {serviceOrder?.articles.map((articleItem, index) => (
                        <View style={styles.tableRow} key={articleItem.id}>
                          <Text
                            style={{
                              width: '5%',
                              textAlign: 'left',
                              ...styles.tableBodyContent,
                            }}>
                            {index + 1}
                          </Text>
                          <HtmlPDF
                            rootStyle={{
                              width: '45%',
                              textAlign: 'left',
                              ...styles.tableBodyContent,
                            }}
                            html={articleItem.name || '-'}
                          />
                          <Text
                            style={{
                              width: '30%',
                              textAlign: 'right',
                              ...styles.tableBodyContent,
                            }}>
                            {articleItem.article?.externalId || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '20%',
                              textAlign: 'right',
                              ...styles.tableBodyContent,
                            }}>
                            {articleItem.quantity || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '10%',
                              textAlign: 'right',
                              marginLeft: 10,
                              ...styles.tableBodyContent,
                            }}>
                            {translate(articleItem.article?.unit) || '-'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {report?.attachments.length && workReportPictures.length && (
                <View>
                  <Text style={styles.sectionHeading}>
                    {translate('Images')}{' '}
                  </Text>

                  <View style={styles.imageWrapper}>
                    {report?.attachments?.map((attachment, index) => (
                      <View
                        style={styles.imageContainer}
                        key={attachment.id}
                        wrap={false}>
                        <Image
                          src={workReportPictures && workReportPictures[index]}
                          style={{
                            height: 100,
                            borderRadius: 5,
                            flexShrink: 0,
                            marginVertical: 5,
                          }}
                        />
                        {attachment.fileResource.description && (
                          <Text style={styles.imageDescription}>
                            {attachment.fileResource.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.signatureWrapper} wrap={false}>
                {technicianSignatureImage && (
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #E4E9F2',
                      borderRadius: '8px',
                      marginTop: 20,
                      width: 150,
                      height: 56,
                      textAlign: 'center',
                      justifyContent: 'space-around',
                      position: 'relative',
                    }}>
                    <View>
                      {technicianSignatureImage ? (
                        <Image
                          src={technicianSignatureImage}
                          style={{width: 120, height: 40}}
                        />
                      ) : (
                        <Text>{translate('No Signature')}</Text>
                      )}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        left: '30%',
                        width: '40%',
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text>{translate('Engineer')}</Text>
                    </View>
                  </View>
                )}

                {customerSignatureImage && (
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #E4E9F2',
                      borderRadius: '8px',
                      marginTop: 20,
                      width: 150,
                      height: 56,
                      textAlign: 'center',
                      justifyContent: 'space-around',
                      position: 'relative',
                    }}>
                    <View>
                      {customerSignatureImage ? (
                        <Image
                          src={customerSignatureImage}
                          style={{width: 120, height: 40}}
                        />
                      ) : (
                        <Text>{translate('No Signature')}</Text>
                      )}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        left: '30%',
                        width: '40%',
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text>{translate('Customer')}</Text>
                    </View>
                  </View>
                )}
              </View>
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
  },
);

export default WorkReportTemplate;
