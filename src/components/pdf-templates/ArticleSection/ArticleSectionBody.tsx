import {Text, View} from '@react-pdf/renderer';
import {HtmlPDF} from 'components/HtmlPDF';
import {ContextProps} from 'context/PdfStylesProvider';
import {
  DiscountType,
  EditableInvoiceItem,
  InvoiceAmountDetail,
} from 'models/invoice';
import {EditableQuotationItem, QuotationAmountDetail} from 'models/quotation';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {formatQuantity, insertNewlines} from 'utils/pdfTemplates';
import {getDiscountDisplay} from 'utils/quotation';
import {Currency} from 'models/misc';
import {
  EditableServiceOrderItem,
  ServiceOrderAmountDetail,
} from 'models/service-order';
import {HTML_PDF_FONT_SIZE_DESCRIPTION} from 'models/richTextField';
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
} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

export const ArticleSectionBody = ({
  items,
  amountDetail,
  currentCurrency,
  selectedLng,
  showDiscountCol,
  translate,
  primaryColor,
  fontStyles,
}: ArticleSectionBodyProps) => {
  const styles = getStyles({primaryColor});

  const priceWidth = showDiscountCol ? styles.col12Right.width : '18.5%';

  return (
    <View style={styles.dataBody}>
      {items?.map((mainPosition, index) => {
        const totalPriceExclVatAfterDiscount = centsToMoney(
          currentCurrency?.code!,
          amountDetail?.items?.[index]?.amountAfterItemDiscount?.netAmount || 0,
        );

        return (
          <View key={`${mainPosition.id}-${index}`}>
            <View style={styles.tableRow} wrap={false}>
              <View style={styles.col6Left}>
                <Text>
                  {insertNewlines(mainPosition.userSeqNumber || '') ||
                    insertNewlines(String(index + 1) || '')}
                </Text>
              </View>

              <View style={styles.col37Left}>
                <Text orphans={1}>
                  {stripHtmlTags(mainPosition.name || '-')}
                </Text>
              </View>

              <View style={styles.col8Right}>
                <Text>
                  {insertNewlines(
                    formatQuantity(mainPosition?.quantity, {
                      currency: currentCurrency?.code!,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol!,
                      companyLang: selectedLng,
                    }),
                    5,
                  )}
                </Text>
              </View>

              <View style={styles.col12Left}>
                <Text>
                  {insertNewlines(
                    translate(mainPosition.article?.unit || '-'),
                    9,
                  )}
                </Text>
              </View>

              <View style={[styles.col12Right, {width: priceWidth}]}>
                <Text>
                  {insertNewlines(
                    formatCurrency(
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
                    ),
                    11,
                  )}
                </Text>
              </View>

              {showDiscountCol && (
                <View style={styles.col12Right}>
                  <Text>
                    {insertNewlines(
                      getDiscountDisplay(
                        mainPosition.discount,
                        currentCurrency,
                        selectedLng,
                      ),
                      8,
                    )}
                  </Text>
                </View>
              )}

              <View style={[styles.col12Right, {width: priceWidth}]}>
                <Text>
                  {insertNewlines(
                    formatCurrency(totalPriceExclVatAfterDiscount || 0, {
                      currency: currentCurrency?.code!,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    }),
                    11,
                  )}
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
                  fontStyles={fontStyles}
                  fontSize={HTML_PDF_FONT_SIZE_DESCRIPTION}
                />
              )}
            </View>

            {mainPosition?.subItemsConfig?.subItemsVisible &&
              mainPosition?.subItems?.map((subItem, subIndex) => {
                const totalSubItemPriceExclVatAfterDiscount =
                  Number(subItem.quantity) *
                  centsToMoney(
                    currentCurrency?.code!,
                    subItem.unitAmount.netAmount ?? 0,
                  );
                return (
                  <>
                    <View
                      style={styles.tableRow}
                      key={`${subItem.id}-${index}-${subIndex}`}
                      wrap={false}>
                      <View style={styles.col6Left}>
                        <Text>
                          {subItem.userSeqNumber
                            ? insertNewlines(subItem.userSeqNumber)
                            : mainPosition.userSeqNumber
                            ? insertNewlines(
                                `${mainPosition.userSeqNumber}.${subIndex + 1}`,
                              )
                            : insertNewlines(`${index + 1}.${subIndex + 1}`)}
                        </Text>
                      </View>

                      <View style={styles.col37Left}>
                        <Text>
                          {stripHtmlTags(
                            subItem.name || subItem.article?.name || '-',
                          )}
                        </Text>
                      </View>

                      <View style={styles.col8Right}>
                        <Text>
                          {insertNewlines(
                            formatQuantity(subItem?.quantity, {
                              currency: currentCurrency?.code!,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol!,
                              companyLang: selectedLng,
                            }),
                            5,
                          )}
                        </Text>
                      </View>

                      <View style={styles.col12Left}>
                        <Text>
                          {insertNewlines(
                            translate(subItem.article?.unit || '-'),
                            9,
                          )}
                        </Text>
                      </View>

                      <View style={[styles.col12Right, {width: priceWidth}]}>
                        {mainPosition.subItemsConfig?.priceVisible ? (
                          <Text>
                            {insertNewlines(
                              formatCurrency(
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
                              ),
                              11,
                            )}
                          </Text>
                        ) : (
                          <Text />
                        )}
                      </View>

                      {showDiscountCol && (
                        <View style={styles.col12Right}>
                          {mainPosition.discount?.type ===
                          DiscountType.PERCENTAGE ? (
                            <Text>
                              {insertNewlines(
                                getDiscountDisplay(
                                  mainPosition.discount,
                                  currentCurrency,
                                  selectedLng,
                                ),
                                6,
                              )}
                            </Text>
                          ) : (
                            ''
                          )}
                        </View>
                      )}

                      <View style={[styles.col12Right, {width: priceWidth}]}>
                        <Text>
                          <Text>
                            {mainPosition.subItemsConfig?.priceVisible
                              ? insertNewlines(
                                  formatCurrency(
                                    totalSubItemPriceExclVatAfterDiscount,
                                    {
                                      currency: currentCurrency!.code,
                                      excludeCurrencySymbol: true,
                                      currencySymbol: currentCurrency?.symbol,
                                      companyLang: selectedLng,
                                    },
                                  ),
                                  11,
                                )
                              : ' '}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {subItem.description?.trim() && (
                      <View>
                        <HtmlPDF
                          html={subItem.description || '-'}
                          rootStyle={{...styles.descriptionText}}
                          fontStyles={fontStyles}
                          fontSize={HTML_PDF_FONT_SIZE_DESCRIPTION}
                        />
                      </View>
                    )}
                  </>
                );
              })}
          </View>
        );
      })}
    </View>
  );
};
