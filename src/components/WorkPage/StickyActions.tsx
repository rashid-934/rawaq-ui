import type { ReactNode } from 'react';
import classes from './Phone.module.css';

export interface StickyActionsProps {
  children: ReactNode;
}

/**
 * The save bar of a form: it sticks to the bottom of the window. On a phone it sits above the
 * bottom bar, and right above the keyboard while one is open (the bar steps aside then).
 * No state, so it renders on the server.
 */
export function StickyActions({ children }: StickyActionsProps) {
  return (
    <div className={classes.stickyActions} data-sticky-actions="" data-testid="sticky-actions">
      {children}
    </div>
  );
}
