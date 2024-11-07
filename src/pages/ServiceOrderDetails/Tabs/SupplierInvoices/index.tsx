import PurchaseInvoices from 'pages/PurchaseInvoices';

type Props = {
  serviceOrderId: string;
};

const SupplierInvoices = ({serviceOrderId}: Props) => (
  <PurchaseInvoices serviceOrderId={serviceOrderId} hideFilters />
);

export default SupplierInvoices;
