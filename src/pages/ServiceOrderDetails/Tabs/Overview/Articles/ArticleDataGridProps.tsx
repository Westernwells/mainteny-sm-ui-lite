import {formatCurrency} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {ArticleSectionTableRow} from 'models/article';

export enum ActionTypes {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export const makeRows = (
  articles: ServiceOrderArticleView[],
): ArticleSectionTableRow[] =>
  articles?.map((item, index) => ({
    id: item.id,
    no: index + 1,
    number: item.article?.externalId || '-',
    name: item.name,
    description: item.description,
    unit: item.article?.unit || '-',
    total: formatCurrency(
      ((item.unitAmount.netAmount ?? 0) * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
      {currency: item.unitAmount.currency},
    ),
    unitPrice: formatCurrency(
      (item.unitAmount.netAmount ?? 0) / 10 ** item.unitAmount.fractionDigits!,
      {currency: item.unitAmount.currency},
    ),
    quantity: item.quantity,
    percent: String(item.unitAmount.percentageVat) || '',
    navigateTo: `/articles/details/${item.article?.id}`,
    article: item,
    ownerName: item.additionalInfo?.owner?.name || '',
    ownerType: item?.ownerType!,
  }));
