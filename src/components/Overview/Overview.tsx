import { type CSSProperties, type ElementType, type ReactNode, useId } from 'react';
import { Title } from '@mantine/core';
import type { KpiTint } from '../../tokens/kpi';
import type { IconComponent } from '../Rail/rail-items';
import { RollingNumber } from '../RollingNumber/RollingNumber';
import classes from './Overview.module.css';

// The Overview page (docs/DESIGN_THEME.md section 4.3): a bento grid on the haze. Plain layout
// parts with no words of their own; they work in server components.

/**
 * Entrance order: the part fades and rises after the ones before it (40 ms apart, at most 8).
 * Left out, the part is simply there.
 */
type Order = number | undefined;

const riseClass = (base: string | undefined, order: Order) =>
  [base, order === undefined ? undefined : 'rise'].filter(Boolean).join(' ') || undefined;

const vars = (values: Record<string, number | undefined>) =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined)
  ) as CSSProperties;

export interface OverviewPageProps {
  /** The narrow column on the end side (320 px): a calendar, notifications. */
  side?: ReactNode;
  /** The main column, a grid of 12 columns: a hero banner, number cards, bento cards. */
  children: ReactNode;
}

export function OverviewPage({ side, children }: OverviewPageProps) {
  return (
    <div className={classes.page} data-side={side ? true : undefined}>
      <div className={classes.main}>{children}</div>
      {side ? <div className={classes.side}>{side}</div> : null}
    </div>
  );
}

export interface HeroBannerProps {
  /** The headline: the page's one `h1`. Wrap one phrase in `<Emphasis>`. */
  title: ReactNode;
  titleId?: string;
  /** One pill button on the end side. */
  action?: ReactNode;
  order?: number;
  /** Under the headline, the full width of the banner: the "Needs you" list (`NeedsYouList`). */
  children?: ReactNode;
}

/** The dark banner at the top: the rail colour, white text, one emphasised phrase, one button. */
export function HeroBanner({ title, titleId, action, order, children }: HeroBannerProps) {
  const fallbackId = useId();
  const id = titleId ?? fallbackId;
  return (
    <section
      className={riseClass(classes.hero, order)}
      style={vars({ '--stagger': order })}
      aria-labelledby={id}
      data-extra={children ? true : undefined}
    >
      <Title order={1} id={id} className={classes.heroTitle}>
        {title}
      </Title>
      {action ? <div className={classes.heroAction}>{action}</div> : null}
      {children ? <div className={classes.heroExtra}>{children}</div> : null}
    </section>
  );
}

/** The emphasised phrase of the banner: the highlight colour, italic where the script has one. */
export function Emphasis({ children }: { children: ReactNode }) {
  return <em className={classes.emphasis}>{children}</em>;
}

export interface BentoCardProps {
  /** How many of the 12 columns the card takes: 3, 4, 6, 8 or 12. */
  span?: 3 | 4 | 6 | 8 | 12;
  /** The card's heading (an `h2`). */
  title?: ReactNode;
  titleId?: string;
  /** Beside the heading, on the end side: a count, small tabs. */
  aside?: ReactNode;
  order?: number;
  className?: string;
  children: ReactNode;
}

/** One card of the grid: the Card surface, 16 px round, a soft shadow, a 2 px lift on hover. */
export function BentoCard({
  span = 12,
  title,
  titleId,
  aside,
  order,
  className,
  children,
}: BentoCardProps) {
  const fallbackId = useId();
  const id = titleId ?? fallbackId;
  return (
    <section
      className={riseClass([classes.card, className].filter(Boolean).join(' '), order)}
      style={vars({ '--span': span, '--stagger': order })}
      data-span={span}
      aria-labelledby={title ? id : undefined}
    >
      {title ? (
        <div className={classes.cardHead}>
          <Title order={2} id={id} className={classes.cardTitle}>
            {title}
          </Title>
          {aside}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export interface StatGridProps {
  /** Cards per row on a wide window (two per row on a narrow one). */
  columns?: 2 | 3 | 4;
  /** `<StatCard>` items. */
  children: ReactNode;
}

/** The row of number cards. A list, so a screen reader says how many there are. */
export function StatGrid({ columns = 4, children }: StatGridProps) {
  return (
    <ul className={classes.stats} style={vars({ '--columns': columns })}>
      {children}
    </ul>
  );
}

export interface StatCardProps {
  /** What the number counts, in words. The tint and the icon are decoration only. */
  label: ReactNode;
  value: number;
  /** The number as it should read, when it has separators or a unit. */
  text?: string;
  /** One small line under the number: a trend, a date. */
  hint?: ReactNode;
  icon?: IconComponent;
  tint?: KpiTint;
  /** With an address the whole card is a link. */
  href?: string;
  /** The app's link component (it receives `href`). Default: a plain `<a>`. */
  linkComponent?: ElementType;
  order?: number;
  /**
   * Money: the ISO code of the currency (`SAR`). It is shown beside the number, on the side and
   * in the form the page's language uses: "SAR 48,250" in English, "48,250 ر.س." in Arabic.
   */
  currency?: string;
  /** The page's locale, for the currency's form and side. */
  locale?: string;
}

/** The currency's sign for a locale, and whether it goes before the number. */
export function currencySign(currency: string, locale = 'en') {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).formatToParts(1);
  const at = (type: string) => parts.findIndex((part) => part.type === type);
  return {
    // Without the invisible direction marks some languages wrap around it.
    sign: (parts[at('currency')]?.value ?? currency).replace(/[‎‏؜]/g, '').trim(),
    before: at('currency') < at('integer'),
  };
}

/** A number card: label, a big number whose digits roll into place once, a small hint. */
export function StatCard({
  label,
  value,
  text,
  hint,
  icon: Icon,
  tint,
  href,
  linkComponent = 'a',
  order,
  currency,
  locale,
}: StatCardProps) {
  const Root: ElementType = href === undefined ? 'div' : linkComponent;
  const number = (
    <RollingNumber value={value} text={text} className={`${classes.statValue} tabular`} />
  );
  const money = currency ? currencySign(currency, locale) : undefined;
  const sign = money ? <span className={classes.statCurrency}>{money.sign}</span> : null;
  return (
    <li className={riseClass(undefined, order)} style={vars({ '--stagger': order })}>
      <Root
        className={classes.stat}
        data-tint={tint}
        data-testid="stat-card"
        {...(href === undefined ? {} : { href })}
      >
        <span className={classes.statTop}>
          <span className={classes.statLabel}>{label}</span>
          {Icon ? (
            <span className={classes.statIcon} aria-hidden>
              <Icon size={18} stroke={1.7} />
            </span>
          ) : null}
        </span>
        {money ? (
          <span className={classes.statMoney}>
            {money.before ? sign : null}
            {number}
            {money.before ? null : sign}
          </span>
        ) : (
          number
        )}
        {hint ? <span className={classes.statHint}>{hint}</span> : null}
      </Root>
    </li>
  );
}
