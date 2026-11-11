'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { labelsFor, type RawaqLabels } from '../../labels';
import classes from './Frame.module.css';

/** Overview: a bento page on the haze (a dashboard). Work: every other page, dense and quiet. */
export type PageKind = 'overview' | 'work';

export interface FrameProps {
  pageKind: PageKind;
  /** The current address. A new address is a new page: it fades in once. */
  pathname: string;
  /** The rail is the labelled panel, so the frame starts further in. */
  showLabels?: boolean;
  /** The rail (`<Rail />`). */
  rail?: ReactNode;
  /** What sits in the sticky header of the frame: search, menus, the person. */
  header?: ReactNode;
  /** Under the page, inside the frame. */
  footer?: ReactNode;
  /** Floating things after the frame: a help button, dialogs, the opening. */
  after?: ReactNode;
  /** Narrow windows only: the rail's drawer is open, so the page behind is out of reach. */
  drawerOpen?: boolean;
  /** The backdrop behind the open drawer was pressed. */
  onCloseDrawer?: () => void;
  /** The id of `<main>`, the target of the skip link. */
  mainId?: string;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'skipToContent'>>;
  children: ReactNode;
}

/**
 * The app frame (docs/DESIGN_THEME.md section 4.1): the rail floats on the haze at the start
 * side, everything else sits in one rounded frame with a sticky header.
 *
 * The window still scrolls the page. The frame looks fixed because its edge paints the haze over
 * whatever scrolls past the rounded border (Frame.module.css), so sticky bars, menus and the
 * browser's own scrolling keep working as usual.
 */
export function Frame({
  pageKind,
  pathname,
  showLabels = false,
  rail,
  header,
  footer,
  after,
  drawerOpen = false,
  onCloseDrawer,
  mainId = 'main',
  locale,
  labels,
  children,
}: FrameProps) {
  const words = labelsFor(locale, labels);

  // Dialogs, menus and popovers render outside the frame (portals). The page kind on <html> lets
  // the Work page rules of the stylesheet (no entrance, no button lift) reach them too.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pageKind = pageKind;
    return () => {
      delete root.dataset.pageKind;
    };
  }, [pageKind]);

  // A new page usually removes the link or button that had the focus. Like after a full page
  // load, the next Tab then starts at the top (the skip link) instead of somewhere in a page
  // that is gone.
  const focusStart = useRef<HTMLSpanElement>(null);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) {
      return;
    }
    lastPath.current = pathname;
    const focused = document.activeElement;
    if (!focused || focused === document.body) {
      focusStart.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div
      className={classes.frame}
      data-page-kind={pageKind}
      data-labels={showLabels || undefined}
      data-testid="app-frame"
    >
      <span ref={focusStart} tabIndex={-1} className={classes.focusStart} />
      <a href={`#${mainId}`} className={classes.skip}>
        {words.skipToContent}
      </a>

      {rail}
      <div
        className={classes.backdrop}
        data-open={drawerOpen || undefined}
        onClick={onCloseDrawer}
        aria-hidden
        data-testid="frame-backdrop"
      />

      {/* The frame's rounded edge: haze over whatever scrolls past it, then the hairline. */}
      <div className={classes.edge} aria-hidden data-testid="frame-edge">
        <span className={classes.edgeTop} />
        <span className={classes.edgeBottom} />
        <span className={classes.corner} data-corner="top-start" />
        <span className={classes.corner} data-corner="top-end" />
        <span className={classes.corner} data-corner="bottom-start" />
        <span className={classes.corner} data-corner="bottom-end" />
        <span className={classes.ring} data-testid="frame-ring" />
      </div>

      {/* Behind an open drawer nothing is reachable. */}
      <div className={classes.body} inert={drawerOpen}>
        <header className={classes.header} data-testid="app-header">
          {header}
        </header>

        <main id={mainId} tabIndex={-1} className={classes.main}>
          {/* This wrapper mounts again for a new address, so the page fade plays once. What
              appears inside a page later, such as a saved message, never plays it again. */}
          <div key={pathname} className={classes.page} data-testid="page-content">
            {children}
          </div>
        </main>

        {footer}
      </div>

      {after}
    </div>
  );
}
