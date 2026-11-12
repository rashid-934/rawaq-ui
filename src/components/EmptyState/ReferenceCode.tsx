'use client';

import { IconCheck, IconCopy } from '@tabler/icons-react';
import { CopyButton, VisuallyHidden } from '@mantine/core';
import classes from './EmptyState.module.css';

export interface ReferenceCodeProps {
  /** The short code. Never an error message. */
  code: string;
  /** The word before the code: "Reference". */
  label: string;
  /** The name of the copy button. */
  copyLabel: string;
  /** Said once the code is copied. */
  copiedLabel: string;
}

/** The small reference code of an error, with a button that copies it. */
export function ReferenceCode({ code, label, copyLabel, copiedLabel }: ReferenceCodeProps) {
  return (
    <p className={classes.reference} data-testid="reference-code">
      <span>{label}</span>
      {/* A code always reads left to right, also in a right-to-left page. */}
      <code className={classes.code} dir="ltr">
        {code}
      </code>
      <CopyButton value={code}>
        {({ copied, copy }) => (
          <>
            <button
              type="button"
              className={classes.copy}
              onClick={copy}
              aria-label={copyLabel}
              data-copied={copied || undefined}
            >
              {copied ? (
                <IconCheck size={16} stroke={1.7} aria-hidden />
              ) : (
                <IconCopy size={16} stroke={1.7} aria-hidden />
              )}
            </button>
            {/* Always in the page, so a screen reader already watches it when the word arrives. */}
            <VisuallyHidden role="status">{copied ? copiedLabel : null}</VisuallyHidden>
          </>
        )}
      </CopyButton>
    </p>
  );
}
