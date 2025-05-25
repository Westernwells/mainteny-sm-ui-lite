import {Document, Image, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {ServiceOrderReportView, ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import capitalize from 'lodash/capitalize';
import {convertMinutesWithRounding} from 'utils/work-hours-utils';
import {HtmlPDF} from 'components/HtmlPDF';
import {HeaderFooterInfoData} from 'models/misc';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {MinToStep, ServiceCompanyItem} from 'models/service-company';
import {ClientReportForPDFConfig} from 'models/client-storage';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {getAddressComponentFromServiceOrder} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {isSwissAddress} from 'utils/address';
import PdfTemplateFooter from './PdfTemplateFooter';
import PdfTemplateHeader from './PdfTemplateHeader';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfPageTitle from './containers/PdfPageTitle';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfUnitAddress from './containers/PdfUnitAddress';

type StyleProps = {
  isSwissOffset?: boolean;
} & PdfConfigurationStyles;

const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
  isSwissOffset = false,
}: StyleProps) =>
  StyleSheet.create({
    rightAddress: {
      minWidth: 200,
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '20px',
      ...(isSwissOffset && {
        paddingTop: '50px', // make offset be about 55mm
        paddingLeft: '6px', // make offset be about 22mm
      }),
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
      color: primaryColor,
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: secondaryColor,
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
      color: primaryColor,
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
      color: primaryColor,
      ...boldFontStyle,
    },
    sectionBody: {
      fontSize: 10,
      ...regularFontStyle,
      color: secondaryColor,
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
      color: secondaryColor,
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
      marginRight: -4,
    },
    tableBodyContent: {
      color: primaryColor,
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
      color: primaryColor,
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
      color: secondaryColor,
      marginTop: 10,
    },
    signatureWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginTop: 20,
    },
  });

type BookedHoursProps = {
  startTime?: string;
  totalFormatted: string;
  percentageSurcharge?: number;
  type: string;
  technicianName?: string;
  translate: (key: string) => string;
  showTime: boolean;
  showHours: boolean;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const BookedHoursRow = ({
  startTime,
  totalFormatted,
  percentageSurcharge,
  type,
  technicianName,
  translate,
  showTime,
  showHours,
  fontStyles,
  primaryColor,
  secondaryColor,
}: BookedHoursProps) => {
  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    regularFontStyle: fontStyles.regular,
    primaryColor,
    secondaryColor,
  });

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
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount | undefined;
  serviceOrder?: ServiceOrderView;
  report?: ServiceOrderReportView;
  technicianSignatureImage?: string;
  customerSignatureImage?: string;
  workReportPictures: {
    [key: string]: string;
  };
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
  technicianName: string;
  serviceOrderType: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const WorkReportTemplate = React.memo(
  ({
    serviceCompany,
    userInfo,
    serviceOrder,
    report,
    translate,
    customerSignatureImage,
    technicianSignatureImage,
    workReportPictures,
    headerInfo,
    headerPath,
    footerInfo,
    footerPath,
    pdfConfigClientStorage,
    technicianName,
    serviceOrderType,
    fontStyles,
    primaryColor,
    secondaryColor,
  }: Props) => {
    const serviceCompanyInfo = getServiceCompanyInfo(userInfo);
    const company = userInfo?.serviceCompany;
    const filteredPictures =
      report?.attachments?.filter(
        (item) => !!workReportPictures[item.fileResource.uri],
      ) ?? [];

    const styles = getStyles({
      boldFontStyle: fontStyles.bold,
      regularFontStyle: fontStyles.regular,
      primaryColor,
      secondaryColor,
      isSwissOffset: isSwissAddress(serviceCompany?.businessAddress),
    });

    const elevatorAddress = serviceOrder?.elevator?.address;

    const customerVATId =
      (pdfConfigClientStorage.includeCustomerVAT &&
        serviceOrder?.elevator?.propertyOwner?.additionalInfo?.vatId) ||
      '';

    const eanValue =
      serviceOrder?.elevator?.propertyOwner?.additionalInfo?.ean || '';

    const unitBuilding =
      (pdfConfigClientStorage.includeUnitBuilding &&
        serviceOrder?.elevator?.additionalInfo?.buildingLocation) ||
      '';

    return (
      <Document>
        <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompany={serviceCompany}
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={
                  serviceOrder?.elevator?.propertyOwner?.name
                }
                addressComponent={getAddressComponentFromServiceOrder(
                  serviceOrder,
                )}
                translate={translate}
                customerVATId={customerVATId}
                eanValue={eanValue}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
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
                      {serviceOrderType === '-'
                        ? serviceOrder?.type!
                        : translate(serviceOrderType)}
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

                {userInfo?.contact?.phone &&
                  pdfConfigClientStorage.includeUserPhone && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Phone number')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {userInfo?.contact?.phone}
                      </Text>
                    </View>
                  )}
                {userInfo?.contact?.email &&
                  pdfConfigClientStorage.includeUserEmail && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Email address')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {userInfo?.contact?.email}
                      </Text>
                    </View>
                  )}
                {technicianName && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Engineer')}</Text>
                    <Text style={styles.tagContent}>{technicianName}</Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {serviceOrder?.elevator?.externalId &&
                    pdfConfigClientStorage.includeUnitNumber &&
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
                  {serviceOrder?.elevator?.serialNumber &&
                    pdfConfigClientStorage.includeSerialNumber && (
                      <View style={styles.rightAddressContent}>
                        <Text style={styles.tag}>
                          {translate('Serial number')}
                        </Text>
                        <Text style={styles.tagContent}>
                          {serviceOrder?.elevator?.serialNumber || '-'}
                        </Text>
                      </View>
                    )}

                  <PdfUnitAddress
                    address={elevatorAddress}
                    translate={translate}
                    building={unitBuilding}
                    fontStyles={fontStyles}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
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

              <PdfPageTitle fontStyles={fontStyles} primaryColor={primaryColor}>
                {translate('Work Report')} {report?.number}
              </PdfPageTitle>

              {report?.description.trim() !== '' && (
                <HtmlPDF
                  html={report?.description || ''}
                  rootStyle={{
                    ...styles.contentBody,
                  }}
                  fontStyles={fontStyles}
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
                        technicianName={technicianName}
                        translate={translate}
                        fontStyles={fontStyles}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
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
                        technicianName={technicianName}
                        translate={translate}
                        fontStyles={fontStyles}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
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
                            fontStyles={fontStyles}
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
                            {translate(articleItem.article?.unit!) || '-'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {filteredPictures.length &&
                Object.keys(workReportPictures).length && (
                  <View>
                    <Text style={styles.sectionHeading}>
                      {translate('Images')}{' '}
                    </Text>

                    <View style={styles.imageWrapper}>
                      {filteredPictures.map((attachment) => (
                        <View
                          style={styles.imageContainer}
                          key={attachment.id}
                          wrap={false}>
                          <Image
                            src={
                              workReportPictures?.[attachment.fileResource.uri]
                            }
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
                <View>
                  {technicianSignatureImage && (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #E4E9F2',
                        borderRadius: '8px',
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
                </View>
                <View>
                  {customerSignatureImage && (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #E4E9F2',
                        borderRadius: '8px',

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
              {!!report?.additionalInfo.customerName && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}>
                  <View style={{width: 150}}>
                    <Text style={{marginTop: 10, textAlign: 'center'}}>
                      {report?.additionalInfo.customerName}
                    </Text>
                  </View>
                </View>
              )}
            </View>
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
      </Document>
    );
  },
);

export default WorkReportTemplate;
