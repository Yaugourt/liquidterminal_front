import { OrdersSection } from "./orders/OrdersSection";

interface OrdersTableProps {
  address: string;
}

export function OrdersTable({ address }: OrdersTableProps) {
  return <OrdersSection address={address} />;
} 