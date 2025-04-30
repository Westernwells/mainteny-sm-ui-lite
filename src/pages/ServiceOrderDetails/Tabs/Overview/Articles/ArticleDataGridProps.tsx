import {NewServiceOrderItemRecord} from 'models/service-order';
import {ArticleSectionTableRow} from 'models/article';

export enum ActionTypes {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export const makeRows = (
  articles: NewServiceOrderItemRecord[],
): ArticleSectionTableRow[] =>
  articles?.map((item, index) => ({
    id: item.id || '',
    no: index + 1,
    number: item.article?.externalId || '-',
    name: item.name || '',
    description: item.description || '',
    unit: item.article?.unit || '-',
    total: '',
    navigateTo: `/articles/details/${item.article?.id}`,
    // total: formatCurrency(
    //   ((item.unitAmount.netAmount ?? 0) * item.quantity) /
    //     10 ** item.unitAmount.fractionDigits!,
    //   {currency: item.unitAmount.currency},
    // ),
    // unitPrice: formatCurrency(
    //   (item.unitAmount.netAmount ?? 0) / 10 ** item.unitAmount.fractionDigits!,
    //   {currency: item.unitAmount.currency},
    // ),
    quantity: item.quantity,
    article: {...item!, id: item.id!, description: item.description!}!,
    userSeqNumber: item.userSeqNumber || '',
    type: item.article?.type!,
    unitAmount: '',
    unitPurchaseAmount: '',
    ownerName: item.ownerName || '',
    ownerType: item.ownerType!,
  }));
