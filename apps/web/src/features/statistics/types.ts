export interface StatisticsData {
  availableYears: number[];
  revenue: string;
  orders: number;
  paidOrders: number;
  refundedOrders: number;
  refundedTotal: string;
  cancelledOrders: number;
  averageTicket: string;
  trend: { date: string; revenue: string }[];
  topProducts: { id: string; name: string; quantity: number }[];
}
