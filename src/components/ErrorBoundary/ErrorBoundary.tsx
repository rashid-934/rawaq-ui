'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import { EmptyState, type EmptyStateLabels } from '../EmptyState/EmptyState';
import { makeReference } from '../EmptyState/reference';

export interface ErrorBoundaryDetails {
  /** The code the person sees. Log it next to the error, so support can find the fault. */
  reference: string;
  /** Which parts were on screen when it failed. */
  componentStack?: string | null;
}

export interface ErrorBoundaryFallbackProps {
  reference: string;
  /** Draws the broken part again. */
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * For the app's own log. The error goes here and nowhere else: the screen shows a reference
   * code, never a message or a stack.
   */
  onError?: (error: unknown, details: ErrorBoundaryDetails) => void;
  /** The app's own fallback. It gets the reference code and a way to try again, not the error. */
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  /** When this value changes (the address of the page, an id) the boundary tries again itself. */
  resetKey?: unknown;
  /** The built-in fallback is the whole page, not a card. */
  fullPage?: boolean;
  title?: string;
  description?: string;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  /** The app's own words, for another language or another wording. */
  labels?: EmptyStateLabels & Partial<Pick<RawaqLabels, 'tryAgain'>>;
}

interface ErrorBoundaryState {
  /** The code of the failure on screen, or null while everything works. */
  reference: string | null;
}

/**
 * Keeps one broken part from blanking the whole app: when something inside it throws while it
 * draws, that part alone is replaced by the error state (`EmptyState variant="error"`) with a
 * reference code and "Try again". The error itself goes to `onError`, never to the screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { reference: null };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { reference: makeReference() };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, {
      reference: this.state.reference ?? '',
      componentStack: info.componentStack,
    });
  }

  override componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.reference !== null && !Object.is(previous.resetKey, this.props.resetKey)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ reference: null });
  };

  override render() {
    const { reference } = this.state;
    const { children, fallback, fullPage, title, description, locale, labels } = this.props;
    if (reference === null) {
      return children;
    }
    if (fallback) {
      return fallback({ reference, reset: this.reset });
    }
    return (
      <EmptyState
        variant="error"
        title={title}
        description={description}
        reference={reference}
        fullPage={fullPage}
        locale={locale}
        labels={labels}
        action={
          <Button variant="default" onClick={this.reset} data-testid="error-retry">
            {labelsFor(locale, labels).tryAgain}
          </Button>
        }
      />
    );
  }
}
