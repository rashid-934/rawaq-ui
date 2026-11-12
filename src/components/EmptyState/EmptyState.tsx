import { createElement, type ReactNode } from 'react';
import { IconAlertTriangle, IconInbox, IconMapSearch } from '@tabler/icons-react';
import { labelsFor, type RawaqLabels } from '../../labels';
import type { IconComponent } from '../Rail/rail-items';
import { isReferenceCode } from './reference';
import { ReferenceCode } from './ReferenceCode';
import classes from './EmptyState.module.css';

export const emptyStateVariants = ['empty', 'error', 'not-found'] as const;
export type EmptyStateVariant = (typeof emptyStateVariants)[number];

const icons: Record<EmptyStateVariant, IconComponent> = {
  empty: IconInbox,
  error: IconAlertTriangle,
  'not-found': IconMapSearch,
};

/** The built-in title and help line of a variant. An empty list has no help line of its own. */
function wordsOf(variant: EmptyStateVariant, words: RawaqLabels) {
  if (variant === 'error') {
    return { title: words.errorTitle, description: words.errorHelp };
  }
  if (variant === 'not-found') {
    return { title: words.notFoundTitle, description: words.notFoundHelp };
  }
  return { title: words.emptyTitle, description: undefined };
}

export type EmptyStateLabels = Partial<
  Pick<
    RawaqLabels,
    | 'emptyTitle'
    | 'errorTitle'
    | 'errorHelp'
    | 'notFoundTitle'
    | 'notFoundHelp'
    | 'reference'
    | 'copyReference'
    | 'referenceCopied'
  >
>;

export interface EmptyStateProps {
  /**
   * What happened: `empty` (nothing to show yet, the default), `error` (something failed) or
   * `not-found` (no such page). The shape is the same for all three; the variant picks the icon,
   * the built-in words and the colour of the icon.
   */
  variant?: EmptyStateVariant;
  /** One line. Default: the built-in words of the variant. */
  title?: string;
  /** One line of help under the title. Default: the built-in words of the variant. */
  description?: string;
  /** The icon in the tile. Default: the icon of the variant. */
  icon?: IconComponent;
  /** One button, or a link that looks like one. */
  action?: ReactNode;
  /**
   * `error` only: a short code the person can pass on to support. There is no prop for an error,
   * a message or a stack on purpose: an error screen never shows them. A text that does not look
   * like a code (see `isReferenceCode`) is not shown either.
   */
  reference?: string | null;
  /** The state is the whole page: tall, centred, with a page-size title. Default: it sits in a card. */
  fullPage?: boolean;
  /** The heading level of the title. Default: 1 for a whole page, 2 otherwise. */
  titleOrder?: 1 | 2 | 3 | 4;
  className?: string;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  /** The app's own words, for another language or another wording. */
  labels?: EmptyStateLabels;
}

/**
 * The empty state (docs/DESIGN_THEME.md section 5): an icon tile, a one-line title, one line of
 * help and one button. The same shape also says "something went wrong" (`variant="error"`, with
 * a small reference code and never the error itself) and "page not found"
 * (`variant="not-found"`). Works in server components.
 */
export function EmptyState({
  variant = 'empty',
  title,
  description,
  icon,
  action,
  reference,
  fullPage = false,
  titleOrder = fullPage ? 1 : 2,
  className,
  locale,
  labels,
}: EmptyStateProps) {
  const words = labelsFor(locale, labels);
  const builtIn = wordsOf(variant, words);
  const Icon = icon ?? icons[variant];
  const help = description ?? builtIn.description;

  return (
    <div
      className={className ? `${classes.root} ${className}` : classes.root}
      data-variant={variant}
      data-full-page={fullPage || undefined}
      data-testid="empty-state"
      // A failure that replaces what was on screen is read out at once.
      role={variant === 'error' ? 'alert' : undefined}
    >
      <span className={classes.tile} aria-hidden>
        <Icon size={24} stroke={1.7} />
      </span>
      {createElement(`h${titleOrder}`, { className: classes.title }, title ?? builtIn.title)}
      {help ? <p className={classes.help}>{help}</p> : null}
      {variant === 'error' && isReferenceCode(reference) ? (
        <ReferenceCode
          code={reference}
          label={words.reference}
          copyLabel={words.copyReference}
          copiedLabel={words.referenceCopied}
        />
      ) : null}
      {action ? <div className={classes.action}>{action}</div> : null}
    </div>
  );
}
