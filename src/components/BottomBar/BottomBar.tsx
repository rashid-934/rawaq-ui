'use client';

import {
  type ElementType,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { IconDots } from '@tabler/icons-react';
import { labelsFor, type RawaqLabels } from '../../labels';
import { type IconComponent, isRailItemActive, type RailItem } from '../Rail/rail-items';
import classes from './BottomBar.module.css';

/** The bottom bar has room for four pages and "More". */
export const BOTTOM_BAR_MAX_ITEMS = 4;

export interface BottomBarProps {
  /** The four pages people open most, in the order of the rail. More than four are cut. */
  items: readonly RailItem[];
  /** The current address, without the locale. It decides the active entry. */
  pathname: string;
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
  /** "More" was pressed: the app opens its More sheet. */
  onMore: () => void;
  /** The More sheet is open. */
  moreOpen?: boolean;
  /** The id of the More sheet, for screen readers. */
  moreControls?: string;
  /** The current page is one of the pages inside the More sheet: "More" is the active entry. */
  moreActive?: boolean;
  /** The icon of "More". Default: three dots. */
  moreIcon?: IconComponent;
  id?: string;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'mainNavigation' | 'more'>>;
  ref?: Ref<HTMLElement>;
}

/**
 * What is wrong with an app's list of bottom bar pages: more than four, or two entries that look
 * the same (the same icon). An empty list means nothing is wrong. The bar itself shows the first
 * four and says nothing, so an app checks its list with this in its own tests.
 */
export function bottomBarProblems(
  items: readonly RailItem[],
  moreIcon: IconComponent = IconDots
): string[] {
  const problems: string[] = [];
  if (items.length > BOTTOM_BAR_MAX_ITEMS) {
    problems.push(
      `The bottom bar shows ${BOTTOM_BAR_MAX_ITEMS} pages and "More"; ${items.length} were given.`
    );
  }
  const seen = new Map<IconComponent, string>([[moreIcon, 'more']]);
  for (const item of items) {
    const owner = seen.get(item.icon);
    if (owner) {
      problems.push(`"${item.key}" has the same icon as "${owner}": every entry needs its own.`);
    } else {
      seen.set(item.icon, item.key);
    }
  }
  return problems;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The floating bottom bar of a phone (below 768 px; docs/DESIGN_THEME.md, "Phone layout"): a pill
 * in the rail colour with up to four pages and "More". The Glow pill sits behind the active icon
 * and slides to the next one by `transform`; its place is measured, so it mirrors by itself in a
 * right-to-left page. From 768 px up the bar is not shown: the rail is the navigation.
 */
export function BottomBar({
  items,
  pathname,
  linkComponent,
  onMore,
  moreOpen = false,
  moreControls,
  moreActive = false,
  moreIcon: MoreIcon = IconDots,
  id,
  locale,
  labels,
  ref,
}: BottomBarProps) {
  const words = labelsFor(locale, labels);
  const Link = linkComponent ?? 'a';
  const shown = items.slice(0, BOTTOM_BAR_MAX_ITEMS);
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  const measure = useCallback(() => {
    const icon = list?.querySelector<HTMLElement>('[data-bar-active] [data-bar-icon]');
    if (!list || !icon) {
      setBox(null);
      return;
    }
    const outer = list.getBoundingClientRect();
    const inner = icon.getBoundingClientRect();
    const next = {
      left: inner.left - outer.left,
      top: inner.top - outer.top,
      width: inner.width,
      height: inner.height,
    };
    setBox((current) =>
      current &&
      current.left === next.left &&
      current.top === next.top &&
      current.width === next.width &&
      current.height === next.height
        ? current
        : next
    );
  }, [list]);

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname, moreActive, items]);

  // On a touch screen a focused text field means the keyboard is open: the bar steps aside and
  // a save bar sits right above the keyboard (`html[data-keyboard-open]`, the stylesheets).
  useEffect(() => {
    const touch = window.matchMedia?.('(pointer: coarse)');
    const root = document.documentElement;
    const update = () => {
      const field = document.activeElement;
      const typing =
        field instanceof HTMLElement &&
        (field.isContentEditable ||
          field.matches(
            'textarea, select, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"])'
          ));
      root.toggleAttribute('data-keyboard-open', Boolean(touch?.matches) && typing);
    };
    // How much of the window the keyboard covers: the save bar sits right above it.
    const viewport = window.visualViewport;
    const inset = () => {
      const covered = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      root.style.setProperty('--app-keyboard-inset', `${Math.round(covered)}px`);
    };
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    viewport?.addEventListener('resize', inset);
    viewport?.addEventListener('scroll', inset);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      viewport?.removeEventListener('resize', inset);
      viewport?.removeEventListener('scroll', inset);
      root.removeAttribute('data-keyboard-open');
      root.style.removeProperty('--app-keyboard-inset');
    };
  }, []);

  useLayoutEffect(() => {
    if (!list || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    // The bar is hidden from 768 px up: it is measured again once it shows (a turned phone).
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    const fonts = typeof document === 'undefined' ? undefined : document.fonts;
    fonts?.addEventListener('loadingdone', measure);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener('loadingdone', measure);
    };
  }, [list, measure]);

  return (
    <nav
      ref={ref}
      id={id}
      className={classes.bar}
      aria-label={words.mainNavigation}
      data-testid="bottom-bar"
    >
      <div ref={setList} className={classes.track}>
        {box ? (
          <span
            className={classes.glow}
            aria-hidden
            data-testid="bottom-bar-glow"
            style={{
              top: 0,
              left: 0,
              transform: `translate(${box.left}px, ${box.top}px)`,
              width: box.width,
              height: box.height,
            }}
          />
        ) : null}
        <ul className={classes.list}>
          {shown.map((item) => {
            const active = !moreActive && isRailItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.key} className={classes.item} data-bar-active={active || undefined}>
                <Link
                  href={item.href}
                  className={classes.entry}
                  aria-current={active ? 'page' : undefined}
                  data-testid={`bar-${item.key}`}
                >
                  <span className={classes.icon} data-bar-icon aria-hidden>
                    <Icon size={24} stroke={1.75} />
                  </span>
                  <span className={classes.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className={classes.item} data-bar-active={moreActive || undefined}>
            <button
              type="button"
              className={classes.entry}
              onClick={onMore}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-controls={moreControls}
              aria-current={moreActive ? 'page' : undefined}
              data-testid="bar-more"
            >
              <span className={classes.icon} data-bar-icon aria-hidden>
                <MoreIcon size={24} stroke={1.75} />
              </span>
              <span className={classes.label}>{words.more}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
