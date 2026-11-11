import type { ComponentType } from 'react';

// What the rail shows. The app builds these lists (addresses, translated names, icons); the rail
// knows nothing about the app's pages. Kept apart from Rail.tsx so server code can use it too.

/** Any icon component that takes a size and a stroke width, such as the Tabler icons. */
export type IconComponent = ComponentType<{ size?: number | string; stroke?: number | string }>;
export type RailIcon = IconComponent;

export interface RailItem {
  /** Stable name of the entry; also its test id (`nav-<key>`). */
  key: string;
  href: string;
  /** The page name, already in the person's language. */
  label: string;
  icon: RailIcon;
  /** Shown beside the label once the page counts something; never a made-up number. */
  count?: number;
  /** Active only on its own address, not on the pages under it (a Dashboard at the root). */
  exact?: boolean;
  /** The icon takes the highlight colour: one "make it yours" entry, at most. */
  highlight?: boolean;
}

/** A labelled group of entries under the main list. */
export interface RailGroup {
  key: string;
  label: string;
  items: RailItem[];
}

export interface RailUser {
  name: string;
  initials: string;
  /** The person's role, already translated; leave out when there is none. */
  role?: string | null;
}

/** An entry is active on its own address and, unless `exact`, on the pages under it. */
export function isRailItemActive(item: Pick<RailItem, 'href' | 'exact'>, pathname: string) {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
