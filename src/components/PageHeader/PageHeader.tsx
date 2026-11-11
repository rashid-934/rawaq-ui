import type { ReactNode } from 'react';
import { Title, VisuallyHidden } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import classes from './PageHeader.module.css';

export interface PageHeaderProps {
  /** The page name, shown as the page's one `h1`. */
  title: ReactNode;
  titleId?: string;
  /** One short line beside the title: what the page is for, or a detail such as a version. */
  description?: ReactNode;
  /** How many rows a list page has. Shown as a small count beside the title. */
  count?: number;
  /** Shown on the end side: the page's primary action, a back link. */
  actions?: ReactNode;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'itemCount'>>;
}

/**
 * The one-line header of a Work page (docs/DESIGN_THEME.md section 4.4): title, count and the
 * primary action on the end side. No banner, no decoration. Works in server components.
 */
export function PageHeader({
  title,
  titleId,
  description,
  count,
  actions,
  locale,
  labels,
}: PageHeaderProps) {
  return (
    <header className={classes.header}>
      <Title order={1} id={titleId} className={classes.title}>
        {title}
      </Title>
      {count === undefined ? null : (
        // A bare number means nothing when read aloud: screen readers get "16 items".
        <span className={classes.count} data-testid="page-count">
          <span aria-hidden>{count}</span>
          <VisuallyHidden>{labelsFor(locale, labels).itemCount(count)}</VisuallyHidden>
        </span>
      )}
      {description ? <div className={classes.description}>{description}</div> : null}
      {actions ? <div className={classes.actions}>{actions}</div> : null}
    </header>
  );
}
