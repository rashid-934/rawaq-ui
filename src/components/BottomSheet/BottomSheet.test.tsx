import { act, StrictMode, useState } from 'react';
import { fireEvent, render, screen, userEvent, waitFor } from '../../test-utils';
import { motionMs } from '../../tokens/motion';
import { BottomSheet, SHEET_CLOSE_DISTANCE, SHEET_TAP_SLOP, useBottomSheet } from './BottomSheet';

function Link() {
  const { followLink } = useBottomSheet();
  return (
    <a href="#next" onClick={followLink}>
      Next page
    </a>
  );
}

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpened(true)}>
        Open
      </button>
      <BottomSheet
        opened={opened}
        onClose={() => {
          onClose();
          setOpened(false);
        }}
        title="Sheet title"
      >
        <p>Inside</p>
        <Link />
      </BottomSheet>
    </>
  );
}

async function open() {
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  return screen.findByRole('dialog', { name: 'Sheet title' });
}

describe('BottomSheet', () => {
  it('opens as a named dialog with a grab handle that closes it', async () => {
    render(<Harness />);
    await open();
    expect(screen.getByText('Inside')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes on Esc', async () => {
    render(<Harness />);
    await open();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('adds one step to the history, so Back closes the sheet and stays on the page', async () => {
    render(<Harness />);
    await open();
    expect(window.history.state).toMatchObject({ rawaqSheet: expect.any(Number) });
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(window.history.state?.rawaqSheet).toBeUndefined();
  });

  it('takes its step back out when it closes another way', async () => {
    render(<Harness />);
    await open();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(window.history.state?.rawaqSheet).toBeUndefined());
  });

  it('closes when pulled down far enough, and stays when let go early', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await open();
    const handle = screen.getByTestId('sheet-handle');
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerMove(handle, { clientY: 110, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 110, pointerId: 1, timeStamp: 1000 });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerMove(handle, { clientY: 100 + SHEET_CLOSE_DISTANCE, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1, timeStamp: 1000 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes first, then follows a link inside, so Back returns to the page', async () => {
    render(<Harness />);
    await open();
    await userEvent.click(screen.getByRole('link', { name: 'Next page' }));
    await waitFor(() => expect(window.location.hash).toBe('#next'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('adds one step in strict mode too, and one Back closes it', async () => {
    const before = window.history.length;
    render(
      <StrictMode>
        <Harness />
      </StrictMode>
    );
    await open();
    await settle();
    expect(window.history.length).toBe(before + 1);
    expect(screen.getByRole('dialog')).toBeVisible();
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(window.history.state?.rawaqSheet).toBeUndefined();
  });

  it('stays open when it opens again before its old step has gone out', async () => {
    render(<Harness />);
    await open();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // At once, before the browser reports the step taken out.
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await settle();
    expect(screen.getByRole('dialog', { name: 'Sheet title' })).toBeVisible();
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('leaves an address the app moved to while it was open', async () => {
    const back = vi.spyOn(window.history, 'back');
    render(<Harness />);
    await open();
    window.history.pushState({}, '', '#moved');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await settle();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#moved');
    back.mockRestore();
  });

  it.each([
    ['a new tab', { target: '_blank' }, {}],
    ['a download', { download: '' }, {}],
    ['an Alt-click', {}, { altKey: true }],
  ])('lets %s through without closing', async (_name, attributes, click) => {
    render(<Harness />);
    await open();
    const link = screen.getByRole('link', { name: 'Next page' });
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...click });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('follows the link after a while when the browser never reports the step gone', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<Harness />);
    await open();
    await userEvent.click(screen.getByRole('link', { name: 'Next page' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    await waitFor(() => expect(window.location.hash).toBe('#next'), {
      timeout: motionMs('sheetSafety') * 4,
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    back.mockRestore();
  });

  it('does not close on the click that follows a drag, nor on a cancelled one', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await open();
    const handle = screen.getByTestId('sheet-handle');
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerMove(handle, { clientY: 100 + SHEET_TAP_SLOP + 4, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1, timeStamp: 1000 });
    fireEvent.click(handle);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerMove(handle, { clientY: 100 + SHEET_CLOSE_DISTANCE, pointerId: 1 });
    fireEvent.pointerCancel(handle, { pointerId: 1 });
    expect(onClose).not.toHaveBeenCalled();
    // A plain tap still closes it.
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerUp(handle, { pointerId: 1, timeStamp: 50 });
    fireEvent.click(handle);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

/** Lets queued tasks and history events run. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0);
    });
  });
}
