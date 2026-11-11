'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
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

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const NONE: readonly never[] = [];

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
  const root = useRef<HTMLElement | null>(null);
  const [glow, setGlow] = useState<Box | null>(null);
  // Tooltips open toward the page: to the right in a left-to-right layout, to the left otherwise.
  const side = dir === 'rtl' ? 'left' : 'right';

  const setRoot = useCallback(
    (element: HTMLElement | null) => {
      root.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref]
  );

  // One glow shape sits behind the active item and slides to the next one (CSS transition).
  const measure = useCallback(() => {
    const rail = root.current;
    const active = rail?.querySelector<HTMLElement>('[data-rail-item][aria-current="page"]');
    if (!rail || !active) {
      setGlow(null);
      return;
    }
    const outer = rail.getBoundingClientRect();
    const inner = active.getBoundingClientRect();
    // Scrolled out of the list (a short window): no floating shape over the brand or the footer.
    const list = active.closest<HTMLElement>('[data-rail-scroll]')?.getBoundingClientRect();
    if (list && (inner.top < list.top - 1 || inner.bottom > list.bottom + 1)) {
      setGlow(null);
      return;
    }
    const next = {
      top: inner.top - outer.top,
      left: inner.left - outer.left,
      width: inner.width,
      height: inner.height,
    };
    setGlow((current) =>
      current &&
      current.top === next.top &&
      current.left === next.left &&
      current.width === next.width &&
      current.height === next.height
        ? current
        : next
    );
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname, showLabels, open, items, groups, bottomItems]);

  useLayoutEffect(() => {
    const rail = root.current;
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
  }, [measure]);

  const tip = (label: string, child: ReactElement) => (
    <Tooltip
      label={label}
      position={side}
      offset={14}
      withArrow
      disabled={showLabels || open}
      events={{ hover: true, focus: true, touch: false }}
      transitionProps={{ transition: 'fade', duration: 120 }}
    >
      {child}
    </Tooltip>
  );

  const row = (item: RailItem) => {
    const Icon = item.icon;
    const active = isRailItemActive(item, pathname);
    return (
      <li key={item.key}>
        {tip(
          item.label,
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
        )}
      </li>
    );
  };

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
      data-glow={glow ? true : undefined}
      inert={inert}
    >
      {glow ? (
        <span
          className={classes.glow}
          aria-hidden
          data-testid="rail-glow"
          style={{
            top: glow.top,
            left: glow.left,
            width: glow.width,
            height: glow.height,
          }}
        />
      ) : null}

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
