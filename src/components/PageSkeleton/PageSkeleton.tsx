import type { ReactNode } from 'react';
import { VisuallyHidden } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import classes from './PageSkeleton.module.css';

export const skeletonShapes = ['overview', 'table', 'form', 'card'] as const;
export type SkeletonShape = (typeof skeletonShapes)[number];

const times = (count: number) => Array.from({ length: count }, (_, index) => index);

function Overview() {
  return (
    <div className={classes.overview}>
      <div className={classes.column}>
        <span className={`${classes.block} ${classes.hero}`} />
        <div className={classes.kpis}>
          {times(4).map((index) => (
            <span key={index} className={`${classes.block} ${classes.kpi}`} />
          ))}
        </div>
        <span className={`${classes.block} ${classes.tall}`} />
      </div>
      <div className={classes.column}>
        <span className={`${classes.block} ${classes.kpi}`} />
        <span className={`${classes.block} ${classes.tall}`} />
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className={classes.stack}>
      <div className={classes.head}>
        <span className={`${classes.line} ${classes.title}`} />
        <span className={`${classes.line} ${classes.button}`} />
      </div>
      <div className={classes.sheet}>
        {times(8).map((index) => (
          <div key={index} className={classes.row}>
            <span className={classes.line} />
            <span className={classes.line} />
            <span className={classes.line} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Fields({ count }: { count: number }) {
  return times(count).map((index) => (
    <div key={index} className={classes.field}>
      <span className={`${classes.line} ${classes.label}`} />
      <span className={`${classes.line} ${classes.input}`} />
    </div>
  ));
}

function Form() {
  return (
    <div className={classes.stack}>
      <div className={classes.head}>
        <span className={`${classes.line} ${classes.title}`} />
      </div>
      <div className={`${classes.sheet} ${classes.fields}`}>
        <Fields count={6} />
      </div>
      <span className={`${classes.line} ${classes.button}`} />
    </div>
  );
}

function Card() {
  return (
    <div className={`${classes.sheet} ${classes.card}`}>
      <span className={`${classes.line} ${classes.title}`} />
      <Fields count={2} />
      <span className={`${classes.line} ${classes.button}`} />
    </div>
  );
}

const shapes: Record<SkeletonShape, () => ReactNode> = {
  overview: Overview,
  table: Table,
  form: Form,
  card: Card,
};

export interface PageSkeletonProps {
  /** The rough shape of the page that is loading. */
  shape: SkeletonShape;
  /** The page's locale: picks the built-in word (English or Arabic). */
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'loading'>>;
}

/**
 * Soft placeholder shapes while a page loads (docs/DESIGN_THEME.md section 7), in the theme's
 * own colours. It shows only after 0.15 s, so a fast page never flashes it. Screen readers hear
 * "Loading" once; the shapes are hidden from them. Works in server components.
 */
export function PageSkeleton({ shape, locale, labels }: PageSkeletonProps) {
  const Shape = shapes[shape];
  return (
    <div
      className={classes.root}
      role="status"
      data-page-skeleton
      data-shape={shape}
      data-testid="page-skeleton"
    >
      <VisuallyHidden>{labelsFor(locale, labels).loading}</VisuallyHidden>
      <div aria-hidden>
        <Shape />
      </div>
    </div>
  );
}
