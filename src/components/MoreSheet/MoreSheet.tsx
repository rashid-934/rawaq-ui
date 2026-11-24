'use client';

import type { ElementType, ReactNode } from 'react';
import { IconArrowsUpDown, IconLogout } from '@tabler/icons-react';
import { SegmentedControl } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import { BottomSheet, useBottomSheet } from '../BottomSheet/BottomSheet';
import { isRailItemActive, type RailItem, type RailUser } from '../Rail/rail-items';
import classes from './MoreSheet.module.css';

export interface MoreSheetLanguage {
  value: string;
  /** The language's own name: English, العربية, اردو. */
  label: string;
  /** Its language code, so a screen reader says the name in that language. */
  lang?: string;
}

export interface MoreSheetProps {
  opened: boolean;
  onClose: () => void;
  id?: string;
  user?: RailUser | null;
  /** The company the person works in now. With `onSwitchCompany`, the row is a button. */
  company?: string;
  onSwitchCompany?: () => void;
  /** The pages that are not in the bottom bar. An item with `highlight` (Customize) stands out. */
  items: readonly RailItem[];
  pathname: string;
  linkComponent?: ElementType;
  /** The Light, Dark and System switch (`ColorSchemeSwitch`), when the app offers it. */
  themeSwitch?: ReactNode;
  languages?: readonly MoreSheetLanguage[];
  language?: string;
  onLanguage?: (value: string) => void;
  onSignOut?: () => void;
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'more' | 'close' | 'switchCompany' | 'language' | 'signOut'>>;
}

function Tiles({
  items,
  pathname,
  linkComponent,
}: Pick<MoreSheetProps, 'items' | 'pathname' | 'linkComponent'>) {
  const { followLink } = useBottomSheet();
  const Link = linkComponent ?? 'a';
  return (
    <ul className={classes.tiles}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isRailItemActive(item, pathname);
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              className={classes.tile}
              aria-current={active ? 'page' : undefined}
              data-highlight={item.highlight || undefined}
              data-testid={`more-${item.key}`}
              onClick={followLink}
            >
              <span className={classes.tileIcon} aria-hidden>
                <Icon size={24} stroke={1.75} />
              </span>
              <span className={classes.tileLabel}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The language choice. Another language is another address, so the sheet closes first and the
 * new language replaces the page once the sheet's step is out of the history (Back still leaves
 * the page, it does not reopen the sheet).
 */
function LanguageSwitch({
  label,
  languages,
  value,
  onChange,
}: {
  label: string;
  languages: readonly MoreSheetLanguage[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const { runAfterClose } = useBottomSheet();
  return (
    <SegmentedControl
      className={classes.segments}
      aria-label={label}
      value={value}
      onChange={(next) => runAfterClose(() => onChange(next))}
      data={languages.map((entry) => ({
        value: entry.value,
        label: <span lang={entry.lang}>{entry.label}</span>,
      }))}
    />
  );
}

/**
 * The More sheet of a phone (docs/DESIGN_THEME.md, "Phone layout"), opened by "More" in the bottom
 * bar. Top to bottom: the person, the company switcher, the other pages as tiles (four per row),
 * the theme switch, the language switch and Sign out.
 */
export function MoreSheet({
  opened,
  onClose,
  id,
  user,
  company,
  onSwitchCompany,
  items,
  pathname,
  linkComponent,
  themeSwitch,
  languages,
  language,
  onLanguage,
  onSignOut,
  locale,
  labels,
}: MoreSheetProps) {
  const words = labelsFor(locale, labels);
  return (
    <BottomSheet
      opened={opened}
      onClose={onClose}
      title={words.more}
      hideTitle
      id={id}
      locale={locale}
      labels={labels}
    >
      {user ? (
        <div className={classes.user} data-testid="more-user">
          <span className={classes.initials} aria-hidden>
            {user.initials}
          </span>
          <span className={classes.who}>
            <span className={classes.name}>{user.name}</span>
            {user.role ? <span className={classes.role}>{user.role}</span> : null}
          </span>
        </div>
      ) : null}

      {company ? (
        onSwitchCompany ? (
          <button
            type="button"
            className={classes.company}
            onClick={onSwitchCompany}
            aria-label={`${words.switchCompany}: ${company}`}
            data-testid="more-company"
          >
            <span className={classes.companyName}>{company}</span>
            <IconArrowsUpDown size={20} stroke={1.75} aria-hidden />
          </button>
        ) : (
          <p className={classes.company} data-testid="more-company">
            <span className={classes.companyName}>{company}</span>
          </p>
        )
      ) : null}

      {items.length > 0 ? (
        <nav aria-label={words.more}>
          <Tiles items={items} pathname={pathname} linkComponent={linkComponent} />
        </nav>
      ) : null}

      {themeSwitch ? <div className={classes.row}>{themeSwitch}</div> : null}

      {languages && languages.length > 1 && onLanguage ? (
        <div className={classes.row}>
          <span className={classes.rowLabel} id={id ? `${id}-language` : undefined}>
            {words.language}
          </span>
          <LanguageSwitch
            label={words.language}
            languages={languages}
            value={language ?? languages[0]?.value}
            onChange={onLanguage}
          />
        </div>
      ) : null}

      {onSignOut ? (
        <button
          type="button"
          className={classes.signOut}
          onClick={onSignOut}
          data-testid="more-sign-out"
        >
          <IconLogout size={20} stroke={1.75} aria-hidden className="mirror-rtl" />
          <span>{words.signOut}</span>
        </button>
      ) : null}
    </BottomSheet>
  );
}
