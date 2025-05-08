import {View, Text} from '@react-pdf/renderer';
import {HtmlPDF} from 'components/HtmlPDF';
import {ContextProps} from 'context/PdfStylesProvider';
import {EditableInvoiceItem, InvoiceAmountDetail} from 'models/invoice';
import {EditableQuotationItem, QuotationAmountDetail} from 'models/quotation';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {insertNewlines} from 'utils/pdfTemplates';
import {getDiscountDisplay} from 'utils/quotation';
import {Currency} from 'models/misc';
import {
  EditableServiceOrderItem,
  ServiceOrderAmountDetail,
} from 'models/service-order';
import {stripHtmlTags} from 'utils/text-block';
import {getStyles} from './ArticleSection.styles';

type ArticleSectionBodyProps = {
  items: (
    | EditableInvoiceItem
    | EditableQuotationItem
    | EditableServiceOrderItem
  )[];
  amountDetail?:
    | InvoiceAmountDetail
    | QuotationAmountDetail
    | ServiceOrderAmountDetail;
  currentCurrency?: Currency;
  selectedLng?: string;
  showDiscountCol?: boolean;
  translate: (key: string) => string;
} & Pick<ContextProps, 'primaryColor'>;

export const ArticleSectionBody = ({
  items,
  amountDetail,
  currentCurrency,
  selectedLng,
  showDiscountCol,
  translate,
  primaryColor,
}: ArticleSectionBodyProps) => {
  const styles = getStyles({primaryColor});

  const priceWidth = showDiscountCol ? styles.col15Right.width : '18%';

  return (
    <View style={styles.dataBody}>
      {items?.map((mainPosition, index) => {
        const totalPriceExclVatAfterDiscount = centsToMoney(
          currentCurrency?.code!,
          amountDetail?.items?.[index]?.amountAfterItemDiscount?.netAmount || 0,
        );

        return (
          <View key={`${mainPosition.id}-${index}`}>
            <View style={styles.tableRow}>
              <View style={styles.col2Left}>
                <Text>
                  {insertNewlines(mainPosition.userSeqNumber || '') ||
                    index + 1}
                </Text>
              </View>

              <View style={styles.col40Left}>
                <Text orphans={1}>
                  {stripHtmlTags(mainPosition.name || '-')}
                </Text>
              </View>

              <View style={styles.col10Right}>
                <Text>{mainPosition.quantity || '-'}</Text>
              </View>

              <View style={styles.col8Center}>
                <Text>{translate(mainPosition.article?.unit || '-')}</Text>
              </View>

              <View style={[styles.col15Right, {width: priceWidth}]}>
                <Text>
                  {formatCurrency(
                    centsToMoney(
                      currentCurrency?.code!,
                      mainPosition?.unitAmount?.netAmount || 0,
                    ),
                    {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    },
                  )}
                </Text>
              </View>

              {showDiscountCol && (
                <View style={styles.col10Right}>
                  <Text>
                    {getDiscountDisplay(
                      mainPosition.discount,
                      currentCurrency,
                      selectedLng,
                    )}
                  </Text>
                </View>
              )}

              <View style={[styles.col15Right, {width: priceWidth}]}>
                <Text>
                  {formatCurrency(totalPriceExclVatAfterDiscount || 0, {
                    currency: currentCurrency?.code!,
                    excludeCurrencySymbol: true,
                    currencySymbol: currentCurrency?.symbol,
                    companyLang: selectedLng,
                  })}
                </Text>
              </View>
            </View>

            <View>
              {!!mainPosition.description?.trim() && (
                <HtmlPDF
                  html={mainPosition.description || '-'}
                  rootStyle={{
                    ...styles.descriptionText,
                  }}
                  selectedLng={selectedLng}
                />
              )}
            </View>

            {mainPosition?.subItemsConfig?.subItemsVisible &&
              mainPosition?.subItems?.map((subItem, subIndex) => {
                const totalSubItemPriceExclVatAfterDiscount = centsToMoney(
                  currentCurrency?.code!,
                  amountDetail?.items?.[index]?.subItems?.[subIndex]
                    .amountAfterItemDiscount?.netAmount || 0,
                );
                return (
                  <View key={`${subItem.id}-${index}-${subIndex}`}>
                    <View style={styles.tableRow}>
                      <View style={styles.col2Left}>
                        <Text>
                          {insertNewlines(subItem.userSeqNumber || '') ||
                            `${index + 1}.${subIndex + 1}`}
                        </Text>
                      </View>

                      <View style={styles.col40Left}>
                        <Text>
                          {stripHtmlTags(
                            subItem.name || subItem.article?.name || '-',
                          )}
                        </Text>
                      </View>

                      <View style={styles.col10Right}>
                        <Text>{subItem.quantity || '-'}</Text>
                      </View>

                      <View style={styles.col8Center}>
                        <Text>{translate(subItem.article?.unit || '-')}</Text>
                      </View>

                      <View style={[styles.col15Right, {width: priceWidth}]}>
                        {mainPosition.subItemsConfig?.priceVisible ? (
                          <Text>
                            {formatCurrency(
                              centsToMoney(
                                currentCurrency?.code!,
                                subItem?.unitAmount?.netAmount || 0,
                              ),
                              {
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
                              },
                            )}
                          </Text>
                        ) : (
                          <Text />
                        )}
                      </View>

                      {showDiscountCol && (
                        <View style={styles.col10Right}>
                          <Text>
                            {getDiscountDisplay(
                              mainPosition.discount,
                              currentCurrency,
                              selectedLng,
                            )}
                          </Text>
                        </View>
                      )}

                      <View style={[styles.col15Right, {width: priceWidth}]}>
                        <Text>
                          {mainPosition.subItemsConfig?.priceVisible ? (
                            <Text>
                              {formatCurrency(
                                totalSubItemPriceExclVatAfterDiscount || 0,
                                {
                                  currency: currentCurrency?.code!,
                                  excludeCurrencySymbol: true,
                                  currencySymbol: currentCurrency?.symbol,
                                  companyLang: selectedLng,
                                },
                              )}
                            </Text>
                          ) : (
                            <Text />
                          )}
                        </Text>
                      </View>
                    </View>

                    {subItem.description?.trim() && (
                      <View>
                        <HtmlPDF
                          html={subItem.description || '-'}
                          rootStyle={{...styles.descriptionText}}
                          selectedLng={selectedLng}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        );
      })}
    </View>
  );
};
