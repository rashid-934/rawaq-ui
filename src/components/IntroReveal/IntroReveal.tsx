'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { motionMs } from '../../tokens/motion';
import classes from './IntroReveal.module.css';

/** The CSS ends the opening in under 1 s. This timer removes the layer even if no event comes. */
export const INTRO_SAFETY_MS = motionMs('introSafety');

export interface IntroLayerProps {
  appName: string;
  /** What sits in the logo tile. Default: the first letter of the app name. */
  logo?: ReactNode;
  /** The sweep has finished. */
  onDone?: () => void;
}

/**
 * What the opening looks like: the rail colour over the whole window with the logo tile and the
 * app name, then a curved sweep toward the bottom end corner that reveals the app. All of it is
 * CSS (IntroReveal.module.css): it never takes a click or a key, and it ends on its own.
 */
export function IntroLayer({ appName, logo, onDone }: IntroLayerProps) {
  return (
    <div
      className={classes.layer}
      aria-hidden
      data-intro
      data-testid="intro-reveal"
      onAnimationEnd={(event) => {
        // The logo's own entrance ends earlier and bubbles up to here.
        if (event.target === event.currentTarget) {
          onDone?.();
        }
      }}
    >
      <span className={classes.mark}>
        <span className={classes.logo}>{logo ?? Array.from(appName)[0]}</span>
        <span className={classes.name}>{appName}</span>
      </span>
    </div>
  );
}

export interface IntroRevealProps {
  appName: string;
  logo?: ReactNode;
  /**
   * Called once, as soon as the opening is on screen. The app clears its "just signed in" marker
   * here, so a reload does not play the opening again.
   */
  onShown?: () => void;
}

/**
 * The opening (docs/DESIGN_THEME.md section 7). The app decides when: render it once per
 * sign-in. It takes itself out of the page when the sweep ends. With reduced motion, and below
 * the `sm` width, the layer is never shown (CSS) and the timer removes it.
 */
export function IntroReveal({ appName, logo, onShown }: IntroRevealProps) {
  const [done, setDone] = useState(false);
  // The latest callback, without playing the effect again when the app passes a new function.
  const shown = useRef(onShown);
  shown.current = onShown;

  useEffect(() => {
    shown.current?.();
    const timer = window.setTimeout(() => setDone(true), INTRO_SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return done ? null : <IntroLayer appName={appName} logo={logo} onDone={() => setDone(true)} />;
}
