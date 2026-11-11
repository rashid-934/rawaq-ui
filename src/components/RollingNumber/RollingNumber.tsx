import type { CSSProperties } from 'react';
import { VisuallyHidden } from '@mantine/core';
import classes from './RollingNumber.module.css';

export interface RollingNumberProps {
  value: number;
  /** The number as it should read, when it has separators or a unit. Default: the plain number. */
  text?: string;
  className?: string;
}

interface Part {
  text: string;
  kind: 'digit' | 'space' | 'text';
}

const kindOf = (char: string): Part['kind'] => {
  if (/^[0-9]$/.test(char)) {
    return 'digit';
  }
  return /^\s$/.test(char) ? 'space' : 'text';
};

/**
 * Every digit on its own; each run of spaces and each run of other characters (a separator, a
 * sign, a unit) as one still piece, so the letters of a unit stay together and in order.
 */
function partsOf(text: string): Part[] {
  const parts: Part[] = [];
  for (const char of Array.from(text)) {
    const kind = kindOf(char);
    const last = parts.at(-1);
    if (last && kind !== 'digit' && last.kind === kind) {
      last.text += char;
    } else {
      parts.push({ text: char, kind });
    }
  }
  return parts;
}

/** A unit or a word: text with a letter in it. A comma, a sign or "%" is part of the number. */
const isWord = (part: Part) => part.kind === 'text' && /\p{L}/u.test(part.text);
const isNumeric = (part: Part) => part.kind === 'digit' || (part.kind === 'text' && !isWord(part));

/**
 * A big number whose digits roll into place once when it first shows (docs/DESIGN_THEME.md
 * section 7). Pure CSS: every digit is a small window over a strip of 0 to 9, so it works without
 * JavaScript and stops at the final number with reduced motion. Separators and signs stay still.
 * Screen readers get the final number only; the rolling digits are hidden from them.
 *
 * The number itself always reads left to right. A unit before or after it sits where the page's
 * direction puts it: "12,480 SAR" in English, and the unit to the left of the number in Arabic
 * or Urdu, as in running text.
 */
export function RollingNumber({ value, text = String(value), className }: RollingNumberProps) {
  const parts = partsOf(text);
  // Each digit starts a little after the one before it (at most 8 steps).
  const order = parts.map(
    (_, index) => parts.slice(0, index).filter((part) => part.kind === 'digit').length
  );
  // The number is everything from its first to its last digit or sign; what is around it (a
  // unit, a word, the space next to it) follows the direction of the page.
  const first = parts.findIndex(isNumeric);
  const last = parts.findLastIndex(isNumeric);
  const numberStart = first === -1 ? parts.length : first;
  const numberEnd = first === -1 ? parts.length : last + 1;

  const piece = (part: Part, index: number) =>
    part.kind === 'digit' ? (
      <span
        // The characters of one number never change places.
        // oxlint-disable-next-line react/no-array-index-key
        key={index}
        className={classes.window}
        data-digit={part.text}
        style={{ '--digit': Number(part.text), '--order': order[index] } as CSSProperties}
      >
        <span className={classes.strip} />
      </span>
    ) : (
      // oxlint-disable-next-line react/no-array-index-key
      <span key={index} className={classes.still} data-still>
        {part.text}
      </span>
    );

  return (
    <span
      className={className ? `${classes.root} ${className}` : classes.root}
      data-testid="rolling-number"
    >
      <span className={classes.digits} aria-hidden>
        {parts.slice(0, numberStart).map(piece)}
        {numberEnd > numberStart ? (
          <span className={classes.number}>
            {parts
              .slice(numberStart, numberEnd)
              .map((part, index) => piece(part, numberStart + index))}
          </span>
        ) : null}
        {parts.slice(numberEnd).map((part, index) => piece(part, numberEnd + index))}
      </span>
      <VisuallyHidden>{text}</VisuallyHidden>
    </span>
  );
}
