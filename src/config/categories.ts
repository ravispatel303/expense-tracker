import {
  Baby,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Film,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PawPrint,
  Plane,
  Receipt,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Tag,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryColor } from '../types';

/** Icon keys stored in the database, mapped to Lucide icons. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  'shopping-basket': ShoppingBasket,
  car: Car,
  home: House,
  receipt: Receipt,
  'shopping-bag': ShoppingBag,
  film: Film,
  'heart-pulse': HeartPulse,
  plane: Plane,
  tag: Tag,
  coffee: Coffee,
  gift: Gift,
  'graduation-cap': GraduationCap,
  dumbbell: Dumbbell,
  'paw-print': PawPrint,
  smartphone: Smartphone,
  baby: Baby,
  wallet: Wallet,
  shirt: Shirt,
  bus: Bus,
  fuel: Fuel,
  wifi: Wifi,
  zap: Zap,
};

export function iconFor(key: string | null | undefined): LucideIcon {
  return (key && CATEGORY_ICONS[key]) || Tag;
}

/** Tailwind background class for each pastel. Listed in full so Tailwind can detect them. */
export const COLOR_BG: Record<CategoryColor, string> = {
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  peach: 'bg-peach',
  sky: 'bg-sky',
  rose: 'bg-rose',
  butter: 'bg-butter',
};

export const COLOR_LABEL: Record<CategoryColor, string> = {
  lavender: 'Lavender',
  mint: 'Mint',
  peach: 'Peach',
  sky: 'Sky',
  rose: 'Rose',
  butter: 'Butter',
};
