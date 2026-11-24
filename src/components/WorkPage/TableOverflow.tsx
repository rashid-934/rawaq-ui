'use client';

import { useLayoutEffect, useRef } from 'react';

export interface TableOverflowProps {
  /** The name of the box for screen readers while it scrolls, when the table has none. */
  label: string;
}

/**
 * Watches the table box of `TableWrap` and draws nothing. While the table is wider than the box
 * it marks the box with `data-scrolls` (tablets scroll it sideways only then, global.css), and
 * otherwise with `data-fits` (the swipe hint hides). A box that really scrolls sideways takes the
 * keyboard focus, as a named region, so the arrow keys can scroll it too (WCAG 2.1.1). With a
 * sticky first column it gives the column's width as `--app-sticky-column`, so a control that
 * gets the focus is not hidden under the column (WCAG 2.4.11).
 */
export function TableOverflow({ label }: TableOverflowProps) {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = marker.current?.parentElement;
    if (!wrap || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    let watched: HTMLTableElement | null = null;
    const check = () => {
      // Every read first, then every write: one layout per check.
      const table = wrap.querySelector('table');
      const wider = !!table && table.scrollWidth > wrap.clientWidth + 1;
      const scrolls =
        getComputedStyle(wrap).overflowX === 'auto' && wrap.scrollWidth > wrap.clientWidth + 1;
      const first = wrap.hasAttribute('data-sticky-first')
        ? table?.querySelector<HTMLElement>('tr > :first-child')
        : null;
      const column = first ? first.getBoundingClientRect().width : 0;
      const named =
        !!table &&
        (table.hasAttribute('aria-label') ||
          table.hasAttribute('aria-labelledby') ||
          !!table.querySelector('caption'));

      wrap.toggleAttribute('data-scrolls', wider);
      wrap.toggleAttribute('data-fits', !!table && !wider);
      if (column > 0) {
        wrap.style.setProperty('--app-sticky-column', `${Math.ceil(column)}px`);
      } else {
        wrap.style.removeProperty('--app-sticky-column');
      }
      if (scrolls) {
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'region');
        if (named && table?.id) {
          wrap.removeAttribute('aria-label');
          wrap.setAttribute('aria-labelledby', table.id);
        } else {
          wrap.removeAttribute('aria-labelledby');
          wrap.setAttribute('aria-label', label);
        }
      } else {
        for (const name of ['tabindex', 'role', 'aria-label', 'aria-labelledby']) {
          wrap.removeAttribute(name);
        }
      }
    };
    const observer = new ResizeObserver(check);
    observer.observe(wrap);
    // A table may arrive later (data that loads), or be swapped for another.
    const watchTable = () => {
      const table = wrap.querySelector('table');
      if (table !== watched) {
        if (watched) {
          observer.unobserve(watched);
        }
        watched = table;
        if (table) {
          observer.observe(table);
        }
        check();
      }
    };
    const children = new MutationObserver(watchTable);
    children.observe(wrap, { childList: true });
    // A web font that arrives late changes the widths.
    const fonts = document.fonts;
    fonts?.addEventListener('loadingdone', check);
    watchTable();
    check();
    return () => {
      observer.disconnect();
      children.disconnect();
      fonts?.removeEventListener('loadingdone', check);
    };
  }, [label]);

  return <span ref={marker} hidden />;
}
