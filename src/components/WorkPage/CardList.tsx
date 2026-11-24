import type { ElementType, ReactNode } from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { labelsFor, type RawaqLabels } from '../../labels';
import classes from './Phone.module.css';

export interface WorkCardItem {
  key: string;
  /** The reference number, on top: "WQ-REQ-2611-0012". */
  reference?: ReactNode;
  /** A status badge, on top at the end. */
  status?: ReactNode;
  /** The item's name, in bold. */
  title: ReactNode;
  /** Small facts under the name: "IT · 24 Nov". */
  meta?: ReactNode;
  /** How many items: "1 item", "12 items" in the page's language, at the end. */
  quantity?: number;
  /** With an address the card is a link, and a chevron shows that it opens. */
  href?: string;
}

export interface CardListProps {
  items: readonly WorkCardItem[];
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'itemCount'>>;
}

/**
 * The rows of a Work page as cards, for phones (docs/DESIGN_THEME.md, "Phone layout"): reference
 * and status on top, the name in bold, then the facts and the quantity, and a chevron that
 * mirrors in right-to-left pages. No state, so it renders on the server.
 */
export function CardList({ items, linkComponent, locale, labels }: CardListProps) {
  const words = labelsFor(locale, labels);
  const Link = linkComponent ?? 'a';
  return (
    <ul className={classes.cards} data-testid="card-list">
      {items.map((item) => {
        const body = (
          <>
            <span className={classes.cardBody}>
              {item.reference || item.status ? (
                <span className={classes.cardTop}>
                  <span className={`${classes.cardReference} tabular`}>{item.reference}</span>
                  {item.status ? <span className={classes.cardStatus}>{item.status}</span> : null}
                </span>
              ) : null}
              <span className={classes.cardTitle}>{item.title}</span>
              {item.meta || item.quantity !== undefined ? (
                <span className={classes.cardFoot}>
                  <span className={classes.cardMeta}>{item.meta}</span>
                  {item.quantity === undefined ? null : (
                    <span className={classes.cardQuantity}>{words.itemCount(item.quantity)}</span>
                  )}
                </span>
              ) : null}
            </span>
            {item.href ? (
              <IconChevronRight
                size={20}
                stroke={1.75}
                aria-hidden
                className={`${classes.cardChevron} mirror-rtl`}
              />
            ) : null}
          </>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className={classes.card}>
                {body}
              </Link>
            ) : (
              <div className={classes.card}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface WorkListProps {
  /** The rows as cards (`<CardList />`). */
  cards: ReactNode;
  /** The same rows as a table (`<TableWrap>` with the page's table). */
  table: ReactNode;
  /**
   * What a phone shows: `cards` (the default) or `table`, for a table that must stay a table
   * (a quotation comparison). From 768 px up the table always shows.
   */
  phoneView?: 'cards' | 'table';
}

/**
 * The main list of a Work page in both shapes. Both are drawn on the server and the one a window
 * does not need is hidden by the stylesheet, so nothing flashes or changes once scripts run.
 */
export function WorkList({ cards, table, phoneView = 'cards' }: WorkListProps) {
  return (
    <div className={classes.workList} data-phone-view={phoneView}>
      <div className={classes.cardsView}>{cards}</div>
      <div className={classes.tableView}>{table}</div>
    </div>
  );
}
