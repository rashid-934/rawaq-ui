'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { IconCheck, IconSearch } from '@tabler/icons-react';
import { TextInput } from '@mantine/core';
import classes from './Phone.module.css';

export interface FilterChip {
  value: string;
  label: ReactNode;
}

export interface FilterChipsProps {
  /** The name of the group for screen readers: "Status". */
  label: string;
  options: readonly FilterChip[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Quick filters as chips in one row (docs/DESIGN_THEME.md, "Phone layout"). Each chip is 40 px
 * high with a 48 x 48 px touch area; the row scrolls sideways on a phone when it is long.
 */
export function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div className={classes.chips} role="group" aria-label={label} data-testid="filter-chips">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={classes.chip}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {/* The chosen chip has a check mark too: its fill is not the only sign. */}
          {option.value === value ? <IconCheck size={16} stroke={2} aria-hidden /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type SearchFieldProps = Omit<ComponentPropsWithoutRef<typeof TextInput>, 'leftSection'> & {
  /** The name of the field for screen readers, also its placeholder when none is given. */
  label: string;
};

/** The search field of a Work page: a real search icon, 48 px high on a phone. */
export function SearchField({ label, placeholder, ...rest }: SearchFieldProps) {
  return (
    <TextInput
      type="search"
      aria-label={label}
      placeholder={placeholder ?? label}
      leftSection={<IconSearch size={18} stroke={1.75} aria-hidden />}
      className={classes.search}
      {...rest}
    />
  );
}
