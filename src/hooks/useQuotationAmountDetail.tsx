import {debounce} from 'lodash';
import {QuotationAmountDetail, EditableQuotationItem} from 'models/quotation';
import {useCallback, useEffect, useState} from 'react';
import {useCurrentCurrency} from 'utils/currency';
import {buildQuotationPayload} from 'utils/quotation';
import {Discount} from 'models/invoice';
import {useCalculateQuotationAmount} from './reactQuery/useQuotation';
import {useSnackbar} from './useSnackbar';

type Props = {
  quotationItems: EditableQuotationItem[];
  quotationDiscount?: Discount;
};

const useQuotationAmountDetail = ({
  quotationItems,
  quotationDiscount,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const {mutateAsync: calculateQuotationAmount} = useCalculateQuotationAmount();
  const {showError} = useSnackbar();

  const [quotationAmountDetail, setQuotationAmountDetail] = useState<
    QuotationAmountDetail | undefined
  >(undefined);

  const recalcQuotation = useCallback(
    debounce(async () => {
      try {
        const payload = buildQuotationPayload(
          quotationItems,
          currentCurrency,
          quotationDiscount,
        );

        const detail = await calculateQuotationAmount({
          data: payload,
        });
        setQuotationAmountDetail(detail);
      } catch (error) {
        showError(error);
      }
    }, 300),
    [
      calculateQuotationAmount,
      currentCurrency,
      quotationItems,
      quotationDiscount,
    ],
  );

  useEffect(() => {
    recalcQuotation();
  }, []);

  return quotationAmountDetail;
};

export default useQuotationAmountDetail;
