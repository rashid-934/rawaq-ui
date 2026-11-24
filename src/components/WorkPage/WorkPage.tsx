import type { ReactNode } from 'react';
import { IconArrowsHorizontal } from '@tabler/icons-react';
import { labelsFor, type RawaqLabels } from '../../labels';
import { TableOverflow } from './TableOverflow';
import phone from './Phone.module.css';
import classes from './WorkPage.module.css';

// Work pages (docs/DESIGN_THEME.md section 4.4): every page that is not an Overview. Dense, full
// width, no banner and no entrance motion. Plain layout parts; they work in server components.

export interface WorkPageProps {
  /** The one-line page header (`<PageHeader />`). */
  header?: ReactNode;
  /** The filters bar under the header: search, a few quick filters, "Advanced" for the rest. */
  filters?: ReactNode;
  /**
   * `full` (the default) for lists and tables: the whole width of the frame. `form` for a page
   * that is read like a document: one centred column of 880 px at most.
   */
  width?: 'full' | 'form';
  children: ReactNode;
}

export function WorkPage({ header, filters, width = 'full', children }: WorkPageProps) {
  return (
    <div className={classes.page} data-width={width}>
      {header}
      {filters ? <div className={classes.filters}>{filters}</div> : null}
      {children}
    </div>
  );
}

export interface WorkCardProps {
  className?: string;
  children: ReactNode;
}

/** A card of a Work page: the Card surface, a hairline, 12 px round, no shadow and no lift. */
export function WorkCard({ className, children }: WorkCardProps) {
  return (
    <div className={className ? `${classes.card} ${className}` : classes.card}>{children}</div>
  );
}

export interface FormGridProps {
  /** Always one column: for a narrow panel such as a drawer. */
  compact?: boolean;
  /** Fields, each with its label above it. Wrap one in `<FormGridItem wide>` for a full row. */
  children: ReactNode;
}

/** Form fields in two columns where the window has room, one column where it has not. */
export function FormGrid({ compact = false, children }: FormGridProps) {
  return (
    <div className={classes.grid} data-compact={compact || undefined}>
      {children}
    </div>
  );
}

export interface FormGridItemProps {
  /** Takes the whole row: a long text, a section title, a table of line items. */
  wide?: boolean;
  children: ReactNode;
}

export function FormGridItem({ wide = false, children }: FormGridItemProps) {
  return (
    <div className={classes.item} data-wide={wide || undefined}>
      {children}
    </div>
  );
}

export interface TableWrapProps {
  /**
   * Phones: the first column stays in place while the table scrolls sideways (mirrored in
   * right-to-left pages), and a hint under the table says it scrolls.
   */
  stickyFirstColumn?: boolean;
  /** The hint under a phone table that scrolls sideways. Default: on with `stickyFirstColumn`. */
  hint?: boolean;
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'swipeHint'>>;
  children: ReactNode;
}

/**
 * Wraps the main table of a Work page. Give the table `{...pageTableProps}`: its header row
 * sticks under the app header. On a narrow window the table scrolls sideways on its own, and
 * its header row stays above its rows. On a tablet it scrolls sideways only when it is wider
 * than the frame.
 */
export function TableWrap({
  stickyFirstColumn = false,
  hint = stickyFirstColumn,
  locale,
  labels,
  children,
}: TableWrapProps) {
  const words = labelsFor(locale, labels);
  return (
    <>
      <div className="table-wrap" data-sticky-first={stickyFirstColumn || undefined}>
        {children}
        <TableOverflow />
      </div>
      {hint ? (
        <p className={phone.hint} data-testid="swipe-hint">
          <IconArrowsHorizontal size={16} stroke={1.75} aria-hidden />
          {words.swipeHint}
        </p>
      ) : null}
    </>
  );
}
