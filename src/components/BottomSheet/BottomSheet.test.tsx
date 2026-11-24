import { useState } from 'react';
import { fireEvent, render, screen, userEvent, waitFor } from '../../test-utils';
import { BottomSheet, SHEET_CLOSE_DISTANCE, useBottomSheet } from './BottomSheet';

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
    expect(window.history.state).toMatchObject({ rawaqSheet: true });
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
});
