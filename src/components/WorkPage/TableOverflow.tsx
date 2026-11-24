'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Tablets (768 to 1279 px): marks the table box with `data-scrolls` while its table is wider than
 * the box, so only then it scrolls sideways on its own (global.css). It draws nothing.
 */
export function TableOverflow() {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = marker.current?.parentElement;
    if (!wrap || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const check = () => {
      const table = wrap.querySelector('table');
      wrap.toggleAttribute('data-scrolls', !!table && table.scrollWidth > wrap.clientWidth + 1);
      // A box that really scrolls sideways (a phone, or a tablet with a wide table) takes the
      // keyboard focus, so the arrow keys can scroll it too (WCAG 2.1.1).
      const scrolls =
        getComputedStyle(wrap).overflowX === 'auto' && wrap.scrollWidth > wrap.clientWidth + 1;
      if (scrolls) {
        wrap.tabIndex = 0;
      } else {
        wrap.removeAttribute('tabindex');
      }
    };
    const observer = new ResizeObserver(check);
    observer.observe(wrap);
    const table = wrap.querySelector('table');
    if (table) {
      observer.observe(table);
    }
    check();
    return () => observer.disconnect();
  }, []);

  return <span ref={marker} hidden />;
}
