import type { ElementType, ReactNode } from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { labelsFor, type RawaqLabels } from '../../labels';
import classes from './Lists.module.css';

/** The "Needs you" list shows three rows at most. */
export const NEEDS_YOU_MAX = 3;

export interface NeedsYouItem {
  key: string;
  /** What to do, in a few words: "Approve request". */
  action: ReactNode;
  /** What it is about: "Parking barrier repair", or a reference number. */
  subject?: ReactNode;
  href: string;
}

export interface NeedsYouListProps {
  /** The most urgent first. More than three are cut. */
  items: readonly NeedsYouItem[];
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'doNext' | 'needsYou'>>;
}

/**
 * The "Needs you" list inside the hero banner (docs/DESIGN_THEME.md, "Phone layout"): up to three
 * things to do, each row at least 48 px and a link to the item. The first is marked "Do next".
 * No state, so it renders on the server.
 */
export function NeedsYouList({ items, linkComponent, locale, labels }: NeedsYouListProps) {
  const words = labelsFor(locale, labels);
  const Link = linkComponent ?? 'a';
  return (
    <ul className={classes.needs} aria-label={words.needsYou} data-testid="needs-you">
      {items.slice(0, NEEDS_YOU_MAX).map((item, index) => (
        <li key={item.key}>
          <Link href={item.href} className={classes.needsRow} data-first={index === 0 || undefined}>
            <span className={classes.dot} aria-hidden />
            <span className={classes.needsText}>
              <strong className={classes.needsAction}>{item.action}</strong>
              {item.subject ? (
                <>
                  <span aria-hidden> · </span>
                  <span className={classes.needsSubject}>{item.subject}</span>
                </>
              ) : null}
            </span>
            {index === 0 ? (
              <span className={classes.doNext}>{words.doNext}</span>
            ) : (
              <IconChevronRight size={16} stroke={2} aria-hidden className="mirror-rtl" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
