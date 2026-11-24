'use client';

import {
  createContext,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { Modal } from '@mantine/core';
import { labelsFor, type RawaqLabels } from '../../labels';
import { motionMs } from '../../tokens/motion';
import classes from './BottomSheet.module.css';

/** How far the sheet must be pulled down before letting go closes it. */
export const SHEET_CLOSE_DISTANCE = 96;
/** A quick flick closes it too: pixels per millisecond, over at least `SHEET_FLICK_DISTANCE`. */
export const SHEET_CLOSE_SPEED = 0.5;
/** A touch that moves less than this is a tap, however fast. */
export const SHEET_FLICK_DISTANCE = 24;

/** A press on the handle that moves this far is a drag, and the click after it does nothing. */
export const SHEET_TAP_SLOP = 8;

const HISTORY_KEY = 'rawaqSheet';

// Each open sheet marks its own step in the browser's history with a number of its own.
let lastStep = 0;
// Back presses the sheets made themselves to take a step out after a close; the popstate each
// one causes is not a press of the person's, and must not close a sheet opened again meanwhile.
let ownPops = 0;
let popIsOwn = false;
let counting = false;

function countOwnPop() {
  popIsOwn = ownPops > 0;
  if (popIsOwn) {
    ownPops -= 1;
  }
}

function startCounting() {
  if (!counting) {
    counting = true;
    // Capture runs before every other popstate listener of the page, the sheets' own included.
    window.addEventListener('popstate', countOwnPop, true);
  }
}

function currentStep(): unknown {
  const state: unknown = window.history.state;
  return state && typeof state === 'object'
    ? (state as Record<string, unknown>)[HISTORY_KEY]
    : undefined;
}

/** A plain click on a link that stays in this tab: one the sheet may hold back. */
function staysInTab(event: ReactMouseEvent<HTMLElement>) {
  const link = event.currentTarget;
  const target = link.getAttribute('target');
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !link.hasAttribute('download') &&
    (!target || target === '_self')
  );
}

export interface BottomSheetProps {
  opened: boolean;
  onClose: () => void;
  /** The sheet's name: shown at the top and read out when it opens. */
  title: ReactNode;
  /** Keep the title for screen readers only (the More sheet starts with the person). */
  hideTitle?: boolean;
  id?: string;
  /** The page's locale: picks the built-in words (English or Arabic). */
  locale?: string;
  labels?: Partial<Pick<RawaqLabels, 'close'>>;
  children: ReactNode;
}

interface SheetControls {
  /**
   * For a link inside the sheet: closes the sheet first (taking its own step out of the
   * browser's history), then follows the link, so Back from the new page goes to the page the
   * sheet was opened on.
   */
  followLink: (event: ReactMouseEvent<HTMLElement>) => void;
  /**
   * Closes the sheet, then runs `action` once the sheet's step is out of the browser's history:
   * for a choice that moves to another address (another language), so it replaces the page and
   * not the sheet's step.
   */
  runAfterClose: (action: () => void) => void;
}

const SheetContext = createContext<SheetControls>({
  followLink: () => {},
  runAfterClose: (action) => action(),
});

/** The controls of the sheet a part sits in. */
export function useBottomSheet() {
  return useContext(SheetContext);
}

/**
 * A bottom sheet (docs/DESIGN_THEME.md, "Phone layout"): it slides up from the bottom with a grab
 * handle over a dimmed page. It closes on a swipe down, a tap outside, Esc and the Back button:
 * opening adds one step to the browser's history, so Back (in the browser or on Android) closes
 * the sheet before it leaves the page. The focus stays inside while it is open and goes back to
 * the button that opened it. Built on Mantine's Modal.
 */
export function BottomSheet({
  opened,
  onClose,
  title,
  hideTitle = false,
  id,
  locale,
  labels,
  children,
}: BottomSheetProps) {
  const words = labelsFor(locale, labels);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  // The number of our step in the browser's history while it is there (0: none).
  const step = useRef(0);
  // The sheet just closed and its step goes out at the end of this task, unless it opens again
  // first (React's strict mode runs every effect twice): then the same step is used again.
  const leaving = useRef(false);
  // A link to follow, or an action to run, once the sheet's step is gone.
  const pending = useRef<HTMLElement | (() => void) | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onStep = useCallback(() => step.current !== 0 && currentStep() === step.current, []);

  /** The sheet's step is gone: close, then follow the link or run the action that waited. */
  const finish = useCallback(() => {
    clearTimeout(safety.current);
    step.current = 0;
    onCloseRef.current();
    const next = pending.current;
    pending.current = null;
    if (typeof next === 'function') {
      next();
    } else if (next) {
      // The link is followed from the page the sheet was opened on, as a click would.
      next.dataset.sheetFollow = '';
      next.click();
      delete next.dataset.sheetFollow;
    }
  }, []);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }
    startCounting();
    if (leaving.current && onStep()) {
      leaving.current = false;
    } else {
      leaving.current = false;
      lastStep += 1;
      step.current = lastStep;
      window.history.pushState({ ...window.history.state, [HISTORY_KEY]: step.current }, '');
    }
    const onPop = () => {
      // Our own Back after an earlier close, or a move that still ends on our step.
      if (popIsOwn || step.current === 0 || onStep()) {
        return;
      }
      finish();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (step.current === 0) {
        return;
      }
      // Closed some other way (Esc, a tap outside, a swipe, the app): take our step back out,
      // only while it is still the current one, so an address the app moved to stays.
      leaving.current = true;
      queueMicrotask(() => {
        if (!leaving.current) {
          return;
        }
        leaving.current = false;
        if (onStep()) {
          ownPops += 1;
          window.history.back();
        }
        step.current = 0;
      });
    };
  }, [opened, onStep, finish]);

  useEffect(() => () => clearTimeout(safety.current), []);

  /** Takes the sheet's step out, then runs what waits in `pending`. */
  const leaveThen = useCallback(
    (next: HTMLElement | (() => void)) => {
      pending.current = next;
      window.history.back();
      clearTimeout(safety.current);
      safety.current = setTimeout(() => {
        if (pending.current === next) {
          finish();
        }
      }, motionMs('sheetSafety'));
    },
    [finish]
  );

  const followLink = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const link = event.currentTarget;
      if (link.dataset.sheetFollow !== undefined || !staysInTab(event) || !onStep()) {
        return;
      }
      event.preventDefault();
      leaveThen(link);
    },
    [leaveThen, onStep]
  );

  const runAfterClose = useCallback(
    (action: () => void) => {
      if (!onStep()) {
        action();
        return;
      }
      leaveThen(action);
    },
    [leaveThen, onStep]
  );

  // Swipe down to close: the sheet follows the finger, and closes when let go far or fast.
  const content = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; time: number; distance: number; moved: boolean } | null>(
    null
  );
  // A drag ended on the handle: the click the browser sends after it is not a tap.
  const dragged = useRef(false);

  const resetDrag = () => {
    drag.current = null;
    if (content.current) {
      content.current.style.transform = '';
    }
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragged.current = false;
    drag.current = { start: event.clientY, time: event.timeStamp, distance: 0, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || !content.current) {
      return;
    }
    if (Math.abs(event.clientY - current.start) >= SHEET_TAP_SLOP) {
      current.moved = true;
    }
    current.distance = Math.max(0, event.clientY - current.start);
    content.current.style.transform = `translateY(${current.distance}px)`;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    resetDrag();
    if (!current) {
      return;
    }
    dragged.current = current.moved;
    const speed = current.distance / Math.max(1, event.timeStamp - current.time);
    const flick = current.distance >= SHEET_FLICK_DISTANCE && speed >= SHEET_CLOSE_SPEED;
    if (current.distance >= SHEET_CLOSE_DISTANCE || flick) {
      onClose();
    }
  };
  const onHandleClick = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      id={id}
      title={title}
      size="100%"
      radius={0}
      withCloseButton={false}
      classNames={{
        root: classes.root,
        inner: classes.inner,
        content: classes.content,
        header: hideTitle ? classes.hiddenHeader : classes.header,
        title: classes.title,
        body: classes.body,
      }}
      transitionProps={{ transition: 'slide-up', duration: motionMs('drawer') }}
      // The phone rule that makes every dialog a full-screen sheet leaves this one alone.
      attributes={{ inner: { 'data-rawaq-sheet': '' }, content: { 'data-rawaq-sheet': '' } }}
      data-testid="bottom-sheet"
    >
      {/* The sheet itself takes the focus when it opens, so no ring jumps onto the handle; the
          next Tab reaches the first control. */}
      <div ref={content} className={classes.sheet} tabIndex={-1} data-autofocus>
        <button
          type="button"
          className={classes.handle}
          aria-label={words.close}
          onClick={onHandleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={resetDrag}
          data-testid="sheet-handle"
        >
          <span className={classes.grip} aria-hidden />
        </button>
        <SheetContext.Provider value={{ followLink, runAfterClose }}>
          {children}
        </SheetContext.Provider>
      </div>
    </Modal>
  );
}
