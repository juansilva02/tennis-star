import { BrandsPage, CategoriesPage } from "@/features/catalog/components/catalog-pages";
import { CustomersPage } from "@/features/customers/components/customers-page";
import { DiscountsPage } from "@/features/discounts/components/discounts-page";
import { HelpPage } from "@/features/help/components/help-page";
import { LoyaltyPage } from "@/features/loyalty/components/loyalty-page";
import { MembershipsPage } from "@/features/memberships/components/memberships-page";
import { NotificationsPage } from "@/features/notifications/components/notifications-page";
import { ProductsPage } from "@/features/products/components/products-page";
import { SalesPage } from "@/features/sales/components/sales-page";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { StatisticsPage } from "@/features/statistics/components/statistics-page";

const sections = {
  productos: ProductsPage,
  ventas: SalesPage,
  categorias: CategoriesPage,
  marcas: BrandsPage,
  clientes: CustomersPage,
  descuentos: DiscountsPage,
  membresias: MembershipsPage,
  "puntos-lealtad": LoyaltyPage,
  notificaciones: NotificationsPage,
  estadisticas: StatisticsPage,
  configuracion: SettingsPage,
  ayuda: HelpPage,
} satisfies Record<string, React.ComponentType>;

export function SectionPage({ section }: { section: string }) {
  const Page = sections[section as keyof typeof sections] ?? HelpPage;
  return <Page />;
}
