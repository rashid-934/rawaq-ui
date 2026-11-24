import type { ReactNode } from 'react';
import classes from './PhoneBar.module.css';

export interface PhoneBarProps {
  /** The app's name: its first letter fills the logo tile when there is no `logo`. */
  appName: string;
  /** What sits in the logo tile. */
  logo?: ReactNode;
  /** The page title, already in the person's language. */
  title: ReactNode;
  titleId?: string;
  /** The title is the page's heading on phones: level 1 unless the app says otherwise. */
  titleOrder?: 1 | 2;
  /** One main action at the end, such as "+ New request". */
  action?: ReactNode;
}

/**
 * The one-line bar at the top of a phone page (docs/DESIGN_THEME.md, "Phone layout"): the logo
 * tile, the page title and one main action. Give it to `Frame` as `phoneHeader`; from 768 px up it
 * is not shown and the frame's own header is. No state, so it renders on the server.
 */
export function PhoneBar({ appName, logo, title, titleId, titleOrder = 1, action }: PhoneBarProps) {
  const Heading = titleOrder === 1 ? 'h1' : 'h2';
  return (
    <div className={classes.bar} data-testid="phone-bar">
      <span className={classes.logo} aria-hidden>
        {logo ?? appName.charAt(0)}
      </span>
      <Heading id={titleId} className={classes.title}>
        {title}
      </Heading>
      {action ? <div className={classes.action}>{action}</div> : null}
    </div>
  );
}
