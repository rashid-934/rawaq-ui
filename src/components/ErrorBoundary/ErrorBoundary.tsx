'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import { EmptyState, type EmptyStateLabels, type EmptyStateProps } from '../EmptyState/EmptyState';
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
  /** The heading level of the built-in fallback: 1 for a whole page, else 2 unless given. */
  titleOrder?: EmptyStateProps['titleOrder'];
  /**
   * Called once the part is drawn again after "Try again" or a new `resetKey`. The button is gone
   * by then, so this is the moment for the app to move the keyboard focus (to its heading, say).
   */
  onReset?: () => void;
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

/** Each boundary's built-in fallback gets a class of its own, to find its heading. */
let boundaries = 0;

/**
 * Keeps one broken part from blanking the whole app: when something inside it throws while it
 * draws, that part alone is replaced by the error state (`EmptyState variant="error"`) with a
 * reference code and "Try again". The error itself goes to `onError`, never to the screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { reference: null };

  /** The element that had the keyboard focus last, to know if the failure took it away. */
  private lastFocused: Element | null = null;

  private readonly marker = `rq-error-boundary-${(boundaries += 1)}`;

  private remember = (event: FocusEvent) => {
    this.lastFocused = event.target instanceof Element ? event.target : null;
  };

  override componentDidMount() {
    document.addEventListener('focusin', this.remember);
  }

  override componentWillUnmount() {
    document.removeEventListener('focusin', this.remember);
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { reference: makeReference() };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, {
      reference: this.state.reference ?? '',
      componentStack: info.componentStack,
    });
    this.takeLostFocus();
  }

  override componentDidUpdate(previous: ErrorBoundaryProps, previousState: ErrorBoundaryState) {
    if (previousState.reference !== null && this.state.reference === null) {
      this.props.onReset?.();
    }
    if (this.state.reference !== null && !Object.is(previous.resetKey, this.props.resetKey)) {
      this.reset();
    }
  }

  /**
   * When the focused element went away with the broken part (or with "Try again" when it fails
   * again), the focus would fall to the page itself and a keyboard user would start from the top.
   * Then the error's heading takes it. Focus elsewhere, or none yet, is never moved.
   */
  private takeLostFocus() {
    const last = this.lastFocused;
    const active = document.activeElement;
    if (!last || last.isConnected || (active && active !== document.body)) {
      return;
    }
    const heading = document.querySelector<HTMLElement>(
      `.${this.marker} :is(h1, h2, h3, h4, h5, h6)`
    );
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }

  reset = () => {
    this.setState({ reference: null });
  };

  override render() {
    const { reference } = this.state;
    const { children, fallback, fullPage, titleOrder, title, description, locale, labels } =
      this.props;
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
        titleOrder={titleOrder}
        className={this.marker}
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
