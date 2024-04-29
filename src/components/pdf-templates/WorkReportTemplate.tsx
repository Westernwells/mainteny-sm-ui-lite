import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React, {useMemo} from 'react';
import {
  ServiceOrderReportView,
  ServiceOrderScheduleSimpleView,
  ServiceOrderView,
} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {
  calculateSlotTotalWithoutSurcharge,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import capitalize from 'lodash/capitalize';
import {formatAddressFullname} from 'utils/utils';
import {format} from 'date-fns';
import {convertMinutesToHoursAndMinutes} from 'utils/work-hours-utils';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateFooter from './PdfTemplateFooter';
import PdfTemplateHeader from './PdfTemplateHeader';
import PdfTemplateLeftAddress from './PdfTemplateLeftAddress';

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
    page: {
      ...regularFontStyle,
      fontSize: 10,
      paddingTop: 25,
      paddingLeft: 68,
      paddingRight: 45,
      backgroundColor: 'white',
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
      position: 'absolute',
      top: 90,
    },
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
      fontSize: 9,
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 9,
      color: '#616161',
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    statusHeader: {
      marginTop: 200,
      display: 'flex',
      flexDirection: 'row',
      marginBottom: 20,
    },
    unitStatus: {
      ...boldFontStyle,
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      marginBottom: 10,
      ...boldFontStyle,
    },
    contentBody: {
      color: '#616161',
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
      fontSize: 12,
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
      ...boldFontStyle,
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
      width: '30%',
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
  endTime?: string;
  startTime?: string;
  totalFormatted: string;
  percentageSurcharge?: number;
  type: string;
  technicianName?: string;
  selectedLng?: string;
  translate: (key: string) => string;
};

const BookedHoursRow = ({
  endTime,
  startTime,
  totalFormatted,
  percentageSurcharge,
  type,
  technicianName,
  selectedLng,
  translate,
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
        style={{width: '20%', textAlign: 'left', ...styles.tableBodyContent}}>
        {endTime ? formatDate(endTime) : '-'}
      </Text>
      <Text
        style={{width: '15%', textAlign: 'right', ...styles.tableBodyContent}}>
        {startTime ? formatDate(startTime, 'HH:mm') : '-'}
      </Text>
      <Text
        style={{width: '17%', textAlign: 'right', ...styles.tableBodyContent}}>
        {totalFormatted}
      </Text>
      <Text
        style={{width: '15%', textAlign: 'right', ...styles.tableBodyContent}}>
        {percentageSurcharge ? `${percentageSurcharge}%` : '-'}
      </Text>
      <Text
        style={{
          width: '13%',
          textAlign: 'left',
          marginLeft: 40,
          ...styles.tableBodyContent,
        }}>
        {translate(type)}
      </Text>
      <Text
        style={{
          width: '20%',
          textAlign: 'left',
          marginLeft: 10,
          ...styles.tableBodyContent,
        }}>
        {technicianName}
      </Text>
    </View>
  );
};

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  serviceOrder?: ServiceOrderView;
  report?: ServiceOrderReportView;
  schedule?: ServiceOrderScheduleSimpleView;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  selectedLng?: string;
  technicianSignatureImage?: string;
  customerSignatureImage?: string;
  workReportPictures: string[];
};

const WorkReportTemplate = React.memo(
  ({
    userInfo,
    logoSrc,
    serviceOrder,
    report,
    schedule,
    logoDimensions,
    selectedLng,
    translate,
    customerSignatureImage,
    technicianSignatureImage,
    workReportPictures,
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

    const totalWorkFormatted = useMemo(() => {
      const totalWorkWithoutSurcharge = calculateSlotTotalWithoutSurcharge(
        report?.additionalInfo.workTimeInfo,
      );
      return convertMinutesToHoursAndMinutes(
        totalWorkWithoutSurcharge,
        {
          hourUnit: 'h',
        },
        1,
      );
    }, [report?.additionalInfo.workTimeInfo]);

    const totalTravelFormatted = useMemo(() => {
      const totalTravelWithoutSurcharge = calculateSlotTotalWithoutSurcharge(
        report?.additionalInfo.travelTimeInfo,
      );
      return convertMinutesToHoursAndMinutes(
        totalTravelWithoutSurcharge,
        {
          hourUnit: 'h',
        },
        1,
      );
    }, [report?.additionalInfo.travelTimeInfo]);

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
                      {serviceOrderTypeToString(serviceOrder?.type!)}{' '}
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
                      <Text style={styles.tag}>
                        {translate('Unit address')}
                      </Text>
                      <Text style={styles.tagContent}>{`${
                        formatAddressFullname(elevatorAddress)?.fullCityName
                      }`}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

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

              <Text style={styles.contentHeader}>
                {translate('Work Report')} {report?.number}
              </Text>

              {serviceOrder?.description.trim() !== '' && (
                <Text style={styles.contentBody}>
                  {serviceOrder?.description.split('')}
                </Text>
              )}

              <Text style={styles.sectionHeading}>
                {translate('Booked Hours')}{' '}
              </Text>

              <View style={styles.table}>
                <View style={styles.tableBody}>
                  <View style={styles.tableRow}>
                    <Text
                      style={{
                        width: '20%',
                        textAlign: 'left',
                        marginRight: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('Date')}
                    </Text>
                    <Text
                      style={{
                        width: '13%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Start')}
                    </Text>
                    <Text
                      style={{
                        width: '17%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Hours')}
                    </Text>
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
                        width: '13%',
                        textAlign: 'left',
                        marginLeft: 36,
                        ...styles.tableHeading,
                      }}>
                      {translate('Type')}
                    </Text>

                    <Text
                      style={{
                        width: '20%',
                        textAlign: 'left',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('Engineer')}
                    </Text>
                  </View>
                  <BookedHoursRow
                    endTime={report?.additionalInfo.workTimeInfo?.endTime}
                    startTime={
                      report?.additionalInfo.workTimeInfo?.timeSlots[0]
                        ?.startTime
                    }
                    totalFormatted={totalWorkFormatted}
                    percentageSurcharge={
                      report?.additionalInfo.workTimeInfo?.percentageSurcharge
                    }
                    type="Work"
                    technicianName={`${schedule?.technician?.userAccount?.firstName} ${schedule?.technician?.userAccount?.lastName}`}
                    selectedLng={selectedLng}
                    translate={translate}
                  />

                  <BookedHoursRow
                    endTime={report?.additionalInfo.travelTimeInfo?.endTime}
                    startTime={
                      report?.additionalInfo.travelTimeInfo?.timeSlots[0]
                        ?.startTime
                    }
                    totalFormatted={totalTravelFormatted}
                    percentageSurcharge={
                      report?.additionalInfo.travelTimeInfo?.percentageSurcharge
                    }
                    type="Travel"
                    technicianName={`${schedule?.technician?.userAccount?.firstName} ${schedule?.technician?.userAccount?.lastName}`}
                    selectedLng={selectedLng}
                    translate={translate}
                  />
                </View>
              </View>

              {serviceOrder?.articles.length && (
                <View>
                  <Text style={styles.sectionHeading}>
                    {translate('Articles')}{' '}
                  </Text>

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
                        {translate('ARTICLE NAME')}
                      </Text>
                      <Text
                        style={{
                          width: '30%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('ARTICLE NUMBER')}
                      </Text>
                      <Text
                        style={{
                          width: '20%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('QUANTITY')}
                      </Text>
                      <Text
                        style={{
                          width: '10%',
                          textAlign: 'right',
                          marginLeft: 10,
                          ...styles.tableHeading,
                        }}>
                        {translate('UNIT')}
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
                          <Text
                            style={{
                              width: '45%',
                              textAlign: 'left',
                              ...styles.tableBodyContent,
                            }}>
                            {articleItem.name || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '30%',
                              textAlign: 'right',
                              ...styles.tableBodyContent,
                            }}>
                            {articleItem.article.externalId || '-'}
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
                            {articleItem.article.unit || '-'}
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
                            objectFit: 'cover',
                            height: 100,
                            width: 140,
                            marginVertical: 2,
                          }}
                        />

                        <Text style={styles.imageDescription}>
                          {format(
                            new Date(attachment.fileResource.createdAt),
                            'dd.MM.yyyy, HH:mm',
                          )}
                          h
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.signatureWrapper} wrap={false}>
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
                      textAlign: 'center',
                      width: '100%',
                    }}>
                    <Text>{translate('Engineer')}</Text>
                  </View>
                </View>

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
                      textAlign: 'center',
                      width: '100%',
                    }}>
                    <Text>{translate('Customer')}</Text>
                  </View>
                </View>
              </View>
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
  },
);

export default WorkReportTemplate;
