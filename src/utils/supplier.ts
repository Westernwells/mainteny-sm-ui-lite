import {ArticleSupplierView, SupplierTableRow} from '../models/supplier';

export const aggregateSupplierRow = (
  items?: ArticleSupplierView[],
): SupplierTableRow[] => {
  if (!items) return [];

  return items.map(
    (item: ArticleSupplierView): SupplierTableRow => ({
      id: item.id,
      externalId: item.externalId ? item.externalId : '-',
      name: item.name ? item.name : '-',
      category: item.category ? item.category : '-',
      address: item.address?.fullName ? item.address?.fullName : '-',
      phone: item.contact.phone ? item.contact.phone : '-',
      email: item.contact.email ? item.contact.email : '-',
    }),
  );
};
