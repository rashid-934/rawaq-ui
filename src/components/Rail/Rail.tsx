'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  memo,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { Tooltip, useDirection } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import { motion, motionMs } from '../../tokens/motion';
import { isRailItemActive, type RailGroup, type RailItem, type RailUser } from './rail-items';
import classes from './Rail.module.css';

export interface RailProps extends Omit<
  ComponentPropsWithoutRef<'nav'>,
  'id' | 'children' | 'inert'
> {
  id: string;
  appName: string;
  /** What sits in the logo tile. Default: the first letter of the app name. */
  logo?: ReactNode;
  /** The main list, in the order of the app's own flow. */
  items: readonly RailItem[];
  /** Labelled groups under the main list. */
  groups?: readonly RailGroup[];
  /** Entries under the divider, above the person. */
  bottomItems?: readonly RailItem[];
  user?: RailUser | null;
  /** The current address, without the locale. It decides the active entry. */
  pathname: string;
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
  /** "Show labels" is on: the rail is the 220 px labelled panel. */
  showLabels: boolean;
  onToggleLabels: () => void;
  /** The last "Show labels" choice could not be saved for the person. */
  labelsNotSaved?: boolean;
  /** Narrow windows only: the rail is a drawer and it is open. */
  open?: boolean;
  /** Narrow windows only: the closed drawer is out of reach of the keyboard. */
  inert?: boolean;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  /** The app's own words, for another language or another wording. */
  labels?: Partial<Pick<RawaqLabels, 'mainNavigation' | 'showLabels' | 'labelsNotSaved'>>;
  /** Extra controls at the top of the drawer on narrow windows only. */
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

/** Where the glow sits inside the rail. */
interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const NONE: readonly never[] = [];

interface GlowProps {
  /** The rail element, once it is in the page. */
  rail: HTMLElement | null;
  // What can move the active entry: the shape is measured again when one of these changes.
  pathname: string;
  showLabels: boolean;
  open: boolean;
  items: readonly RailItem[];
  groups: readonly RailGroup[];
  bottomItems: readonly RailItem[];
}

/**
 * The glow shape behind the active entry. It is put at its new place at once (one layout), and
 * a `transform` then plays it there from where it was. So the slide itself is transform only and
 * costs the browser no layout work, and at rest the shape has no transform: it is painted
 * exactly as a plain positioned element. The slide mirrors by itself in a right-to-left page,
 * because it is measured, not assumed.
 *
 * It is a part of its own so that following the entry, on every frame while "Show labels"
 * slides the rail open, draws this one element again and not the whole rail.
 */
function Glow({ rail, pathname, showLabels, open, items, groups, bottomItems }: GlowProps) {
  const [box, setBox] = useState<Box | null>(null);
  const shape = useRef<HTMLSpanElement | null>(null);
  /** Where the shape was on screen just before it was measured again. */
  const from = useRef<{ left: number; top: number } | null>(null);
  const slide = useRef<Animation | null>(null);

  const measure = useCallback(() => {
    const seen = shape.current?.getBoundingClientRect();
    from.current = seen ? { left: seen.left, top: seen.top } : null;
    const active = rail?.querySelector<HTMLElement>('[data-rail-item][aria-current="page"]');
    if (!rail || !active) {
      setBox(null);
      return;
    }
    const outer = rail.getBoundingClientRect();
    const inner = active.getBoundingClientRect();
    // Scrolled out of the list (a short window): no floating shape over the brand or the footer.
    const list = active.closest<HTMLElement>('[data-rail-scroll]')?.getBoundingClientRect();
    if (list && (inner.top < list.top - 1 || inner.bottom > list.bottom + 1)) {
      setBox(null);
      return;
    }
    const next = {
      top: inner.top - outer.top,
      left: inner.left - outer.left,
      width: inner.width,
      height: inner.height,
    };
    setBox((current) =>
      current &&
      current.top === next.top &&
      current.left === next.left &&
      current.width === next.width &&
      current.height === next.height
        ? current
        : next
    );
  }, [rail]);

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname, showLabels, open, items, groups, bottomItems]);

  // The slide. The shape already sits at its new place; play it there from where it was.
  useLayoutEffect(() => {
    const element = shape.current;
    const start = from.current;
    from.current = null;
    if (!element || !start || typeof element.animate !== 'function') {
      return;
    }
    slide.current?.cancel();
    slide.current = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const now = element.getBoundingClientRect();
    const x = start.left - now.left;
    const y = start.top - now.top;
    // Less than half a pixel is no move: the size alone changed ("Show labels").
    if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
      return;
    }
    slide.current = element.animate(
      [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }],
      { duration: motionMs('base'), easing: motion.ease }
    );
  }, [box]);

  useLayoutEffect(() => {
    if (!rail || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    // The list scrolls inside the rail when the window is short.
    rail.addEventListener('scroll', measure, true);
    return () => {
      observer.disconnect();
      rail.removeEventListener('scroll', measure, true);
    };
  }, [measure, rail]);

  // The rail's own styles need to know that the shape is there (Rail.module.css).
  const shown = box !== null;
  useLayoutEffect(() => {
    rail?.toggleAttribute('data-glow', shown);
  }, [rail, shown]);

  return box ? (
    <span
      ref={shape}
      className={classes.glow}
      aria-hidden
      data-testid="rail-glow"
      style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
    />
  ) : null;
}

const TIP_EVENTS = { hover: true, focus: true, touch: false } as const;

interface TipProps {
  label: string;
  /** Toward the page: right in a left-to-right layout, left otherwise. */
  side: 'left' | 'right';
  off: boolean;
  children: ReactElement;
}

/** The name of an entry, on hover and on keyboard focus. */
function Tip({ label, side, off, children }: TipProps) {
  return (
    <Tooltip
      label={label}
      position={side}
      offset={14}
      withArrow
      disabled={off}
      events={TIP_EVENTS}
      transitionProps={{ transition: 'fade', duration: motionMs('tooltip') }}
    >
      {children}
    </Tooltip>
  );
}

interface EntryProps {
  item: RailItem;
  active: boolean;
  link: ElementType;
  side: 'left' | 'right';
  tipOff: boolean;
}

/** An app often builds its list of entries again on every draw: compare what an entry shows. */
const sameEntry = (before: EntryProps, after: EntryProps) =>
  before.active === after.active &&
  before.link === after.link &&
  before.side === after.side &&
  before.tipOff === after.tipOff &&
  before.item.key === after.item.key &&
  before.item.href === after.item.href &&
  before.item.label === after.item.label &&
  before.item.icon === after.item.icon &&
  before.item.count === after.item.count &&
  before.item.highlight === after.item.highlight;

/**
 * One entry of the rail. It is drawn again only when something it shows has changed: a page
 * change draws the two entries it touches, and an app that builds its list again costs nothing.
 */
const Entry = memo(function Entry({ item, active, link: LinkComponent, side, tipOff }: EntryProps) {
  const Icon = item.icon;
  return (
    <li>
      <Tip label={item.label} side={side} off={tipOff}>
        <LinkComponent
          href={item.href}
          className={classes.item}
          data-rail-item
          data-active={active || undefined}
          data-highlight={item.highlight || undefined}
          aria-current={active ? 'page' : undefined}
          data-testid={`nav-${item.key}`}
        >
          <span className={classes.icon} aria-hidden>
            <Icon size={20} stroke={1.7} />
          </span>
          <span className={classes.label}>{item.label}</span>
          {item.count === undefined ? null : (
            <span className={`${classes.label} ${classes.count} tabular`}>{item.count}</span>
          )}
        </LinkComponent>
      </Tip>
    </li>
  );
}, sameEntry);

/**
 * The floating icon rail (docs/DESIGN_THEME.md section 4.2): icons only, the page name in a
 * tooltip on hover and on keyboard focus, a glow circle that slides to the active page, and a
 * "Show labels" toggle that widens it into a labelled panel. On narrow windows it is a drawer.
 */
export function Rail({
  id,
  appName,
  logo,
  items,
  groups = NONE,
  bottomItems = NONE,
  user,
  pathname,
  linkComponent: LinkComponent = 'a',
  showLabels,
  onToggleLabels,
  labelsNotSaved = false,
  open = false,
  inert = false,
  locale,
  labels,
  children,
  ref,
  ...others
}: RailProps) {
  const words = labelsFor(locale, labels);
  const { dir } = useDirection();
  const groupId = useId();
  // The rail element as state, so the glow shape measures as soon as the rail is in the page.
  const [rail, setRail] = useState<HTMLElement | null>(null);
  // Tooltips open toward the page: to the right in a left-to-right layout, to the left otherwise.
  const side = dir === 'rtl' ? 'left' : 'right';

  const setRoot = useCallback(
    (element: HTMLElement | null) => {
      setRail(element);
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref]
  );

  // With the names on screen, or in the drawer, a tooltip would only repeat them.
  const tipsOff = showLabels || open;

  const tip = (label: string, child: ReactElement) => (
    <Tip label={label} side={side} off={tipsOff}>
      {child}
    </Tip>
  );

  const row = (item: RailItem) => (
    <Entry
      key={item.key}
      item={item}
      active={isRailItemActive(item, pathname)}
      link={LinkComponent}
      side={side}
      tipOff={tipsOff}
    />
  );

  const ToggleIcon = showLabels ? IconLayoutSidebarLeftCollapse : IconLayoutSidebarLeftExpand;

  return (
    <nav
      {...others}
      ref={setRoot}
      id={id}
      aria-label={words.mainNavigation}
      className={classes.rail}
      data-labels={showLabels || undefined}
      data-open={open || undefined}
      inert={inert}
    >
      <Glow
        rail={rail}
        pathname={pathname}
        showLabels={showLabels}
        open={open}
        items={items}
        groups={groups}
        bottomItems={bottomItems}
      />

      <div className={classes.brand}>
        <span className={classes.logo} aria-hidden>
          {logo ?? Array.from(appName)[0]}
        </span>
        <span className={`${classes.label} ${classes.brandName}`}>{appName}</span>
      </div>
      {children ? <div className={classes.drawerOnly}>{children}</div> : null}

      <div className={classes.scroll} data-rail-scroll>
        <ul className={classes.list}>{items.map(row)}</ul>

        {groups.map((group) => {
          const labelId = `${groupId}-${group.key}`;
          return group.items.length > 0 ? (
            <div key={group.key} role="group" aria-labelledby={labelId} className={classes.group}>
              <p id={labelId} className={`${classes.label} ${classes.groupLabel}`}>
                {group.label}
              </p>
              <ul className={classes.list}>{group.items.map(row)}</ul>
            </div>
          ) : null;
        })}
      </div>

      <div className={classes.bottom}>
        <hr className={classes.divider} />
        {bottomItems.length > 0 ? <ul className={classes.list}>{bottomItems.map(row)}</ul> : null}
        {/* Not a control, so the keyboard does not stop here: a screen reader reads the name and
            role in place. An account menu, when the app has one, lives in the header. */}
        {user
          ? tip(
              user.role ? `${user.name}, ${user.role}` : user.name,
              <div className={classes.user} data-testid="sidebar-user">
                <span className={classes.avatar} aria-hidden>
                  {user.initials}
                </span>
                <span className={`${classes.label} ${classes.userText}`}>
                  <span className={classes.userName}>{user.name}</span>
                  {user.role ? <span className={classes.userRole}>{user.role}</span> : null}
                </span>
              </div>
            )
          : null}
        {tip(
          labelsNotSaved ? words.labelsNotSaved : words.showLabels,
          <button
            type="button"
            className={`${classes.item} ${classes.toggle}`}
            aria-pressed={showLabels}
            aria-controls={id}
            onClick={onToggleLabels}
            data-testid="rail-labels"
          >
            <span className={`${classes.icon} mirror-rtl`} aria-hidden>
              <ToggleIcon size={20} stroke={1.7} />
            </span>
            <span className={classes.label}>{words.showLabels}</span>
          </button>
        )}
        {/* Always rendered, empty until there is something to say (Rail.module.css). */}
        <p className={classes.notSaved} role="status" data-testid="rail-labels-not-saved">
          {labelsNotSaved ? words.labelsNotSaved : null}
        </p>
      </div>
    </nav>
  );
}
