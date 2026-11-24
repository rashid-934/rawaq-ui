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

const HISTORY_KEY = 'rawaqSheet';

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
}

const SheetContext = createContext<SheetControls>({ followLink: () => {} });

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
  onCloseRef.current = onClose;
  // Our own step in the browser's history is there while the sheet is open.
  const stepAdded = useRef(false);
  // A link to follow once the sheet's step is gone.
  const pending = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }
    window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, '');
    stepAdded.current = true;
    const onPop = () => {
      if (!stepAdded.current) {
        return;
      }
      stepAdded.current = false;
      onCloseRef.current();
      const link = pending.current;
      pending.current = null;
      if (link) {
        // The link is followed from the page the sheet was opened on, as a click would.
        link.dataset.sheetFollow = '';
        link.click();
        delete link.dataset.sheetFollow;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed some other way (Esc, a tap outside, a swipe, the app): take our step back out.
      if (stepAdded.current) {
        stepAdded.current = false;
        window.history.back();
      }
    };
  }, [opened]);

  const followLink = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const link = event.currentTarget;
    const plain = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey;
    if (link.dataset.sheetFollow !== undefined || !plain || !stepAdded.current) {
      return;
    }
    event.preventDefault();
    pending.current = link;
    window.history.back();
  }, []);

  // Swipe down to close: the sheet follows the finger, and closes when let go far or fast.
  const content = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; time: number; distance: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    drag.current = { start: event.clientY, time: event.timeStamp, distance: 0 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || !content.current) {
      return;
    }
    current.distance = Math.max(0, event.clientY - current.start);
    content.current.style.transform = `translateY(${current.distance}px)`;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current) {
      return;
    }
    if (content.current) {
      content.current.style.transform = '';
    }
    const speed = current.distance / Math.max(1, event.timeStamp - current.time);
    const flick = current.distance >= SHEET_FLICK_DISTANCE && speed >= SHEET_CLOSE_SPEED;
    if (current.distance >= SHEET_CLOSE_DISTANCE || flick) {
      onClose();
    }
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
          onClick={onClose}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          data-testid="sheet-handle"
        >
          <span className={classes.grip} aria-hidden />
        </button>
        <SheetContext.Provider value={{ followLink }}>{children}</SheetContext.Provider>
      </div>
    </Modal>
  );
}
