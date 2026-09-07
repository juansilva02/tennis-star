export interface DashboardProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  stock: number;
}

export interface DashboardSale {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  customer: { name: string };
}

export interface TopProduct {
  productName: string;
  _sum: { quantity: number | null; subtotal: string | null };
}

export interface DashboardData {
  productCount: number;
  inventoryValue: string;
  products: DashboardProduct[];
  recentSales: DashboardSale[];
  topProducts: TopProduct[];
}
