import { BarChart3, Bell, Boxes, CircleHelp, Home, Medal, Package, Percent, Settings, ShoppingCart, Star, Tag, Users } from "lucide-react";

export const navigationItems = [
  ["/home", "Inicio", Home],
  ["/ventas", "Ventas", ShoppingCart],
  ["/categorias", "Categorías", Boxes],
  ["/marcas", "Marcas", Tag],
  ["/productos", "Productos", Package],
  ["/clientes", "Clientes", Users],
  ["/estadisticas", "Estadísticas", BarChart3],
  ["/descuentos", "Descuentos", Percent],
  ["/puntos-lealtad", "Puntos de lealtad", Medal],
  ["/membresias", "Membresías", Star],
  ["/notificaciones", "Notificaciones", Bell],
  ["/configuracion", "Configuración", Settings],
  ["/ayuda", "Ayuda", CircleHelp],
] as const;
