import type { ElementType, ReactNode } from 'react';
import classes from './Lists.module.css';

export interface ActivityItem {
  key: string;
  /** The item's name: "Office chairs". */
  title: ReactNode;
  /** Its reference number, shown under the name. */
  reference?: ReactNode;
  /** A status badge at the end. */
  status?: ReactNode;
  /** With an address the row is a link. */
  href?: string;
}

export interface ActivityListProps {
  items: readonly ActivityItem[];
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
}

/**
 * Recent activity (docs/DESIGN_THEME.md, "Phone layout"): each row the item's name with its
 * reference number under it and its status badge at the end, at least 56 px high. Put it in a
 * `BentoCard` with a title. No state, so it renders on the server.
 */
export function ActivityList({ items, linkComponent }: ActivityListProps) {
  const Link = linkComponent ?? 'a';
  return (
    // oxlint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list role of a list drawn without bullets
    <ul role="list" className={classes.activity} data-testid="activity-list">
      {items.map((item) => {
        const body = (
          <>
            <span className={classes.activityText}>
              <span className={classes.activityTitle}>{item.title}</span>
              {item.reference ? (
                <span className={`${classes.activityReference} tabular`}>{item.reference}</span>
              ) : null}
            </span>
            {item.status ? <span className={classes.activityStatus}>{item.status}</span> : null}
          </>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className={classes.activityRow}>
                {body}
              </Link>
            ) : (
              <div className={classes.activityRow}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
