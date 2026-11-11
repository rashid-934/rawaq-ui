import type { CSSProperties } from 'react';
import { VisuallyHidden } from '@mantine/core';
import classes from './RollingNumber.module.css';

export interface RollingNumberProps {
  value: number;
  /** The number as it should read, when it has separators or a unit. Default: the plain number. */
  text?: string;
  className?: string;
}

const isDigit = (part: string) => /^[0-9]$/.test(part);

/**
 * Every digit on its own, and each run of other characters (a separator, a sign, a unit) as one
 * still piece, so a unit written in Arabic letters keeps them together and in order.
 */
function partsOf(text: string): string[] {
  const parts: string[] = [];
  for (const char of Array.from(text)) {
    const last = parts.at(-1);
    if (last === undefined || isDigit(char) || isDigit(last)) {
      parts.push(char);
    } else {
      parts[parts.length - 1] = last + char;
    }
  }
  return parts;
}

/**
 * A big number whose digits roll into place once when it first shows (docs/DESIGN_THEME.md
 * section 7). Pure CSS: every digit is a small window over a strip of 0 to 9, so it works without
 * JavaScript and stops at the final number with reduced motion. Separators and signs stay still.
 * Screen readers get the final number only; the rolling digits are hidden from them.
 */
export function RollingNumber({ value, text = String(value), className }: RollingNumberProps) {
  const chars = partsOf(text);
  // Each digit starts a little after the one before it (at most 8 steps).
  const order = chars.map((_, index) => chars.slice(0, index).filter(isDigit).length);

  return (
    <span
      className={className ? `${classes.root} ${className}` : classes.root}
      data-testid="rolling-number"
    >
      <span className={classes.digits} aria-hidden>
        {chars.map((char, index) =>
          isDigit(char) ? (
            <span
              // The characters of one number never change places.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              className={classes.window}
              data-digit={char}
              style={{ '--digit': Number(char), '--order': order[index] } as CSSProperties}
            >
              <span className={classes.strip} />
            </span>
          ) : (
            // oxlint-disable-next-line react/no-array-index-key
            <span key={index} className={classes.still}>
              {char}
            </span>
          )
        )}
      </span>
      <VisuallyHidden>{text}</VisuallyHidden>
    </span>
  );
}
