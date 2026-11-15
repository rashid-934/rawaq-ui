import { useState } from 'react';
import { render, renderRtl, screen, userEvent } from '../../test-utils';
import { ErrorBoundary } from './ErrorBoundary';

const SECRET = 'connection to db-internal.example:5432 refused for user "app_owner"';

/** A part that fails while it draws, until it is told not to. */
function Broken({ fail }: { fail: () => boolean }) {
  if (fail()) {
    const error = new Error(SECRET);
    error.stack = `Error: ${SECRET}\n    at Broken (/srv/app/src/features/orders/Orders.tsx:42:11)`;
    throw error;
  }
  return <p>Orders</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React reports a caught error on the console; that is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows its children while nothing fails', () => {
    render(
      <ErrorBoundary>
        <Broken fail={() => false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).toBeNull();
  });

  it('replaces only the broken part, and the rest of the page stays', () => {
    render(
      <>
        <p>Header</p>
        <ErrorBoundary>
          <Broken fail={() => true} />
        </ErrorBoundary>
        <p>Footer</p>
      </>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error');
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
  });

  it('shows a reference code and never the message or the stack of the error', () => {
    const { container } = render(
      <ErrorBoundary>
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    const code = screen.getByTestId('reference-code').querySelector('code');
    expect(code).toHaveTextContent(/^[2-9A-HJ-NP-Z]{8}$/);
    const page = container.ownerDocument.body.innerHTML;
    for (const leak of [
      SECRET,
      'db-internal',
      'app_owner',
      'Orders.tsx',
      '/srv/app',
      'at Broken',
    ]) {
      expect(page).not.toContain(leak);
    }
  });

  it('gives the error to the app for its own log, with the same reference code', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const [error, details] = onError.mock.calls[0] as [Error, { reference: string }];
    expect(error.message).toBe(SECRET);
    expect(details.reference).toBe(
      screen.getByTestId('reference-code').querySelector('code')?.textContent
    );
  });

  it('draws the part again on "Try again"', async () => {
    let broken = true;
    render(
      <ErrorBoundary>
        <Broken fail={() => broken} />
      </ErrorBoundary>
    );
    broken = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('gives a new reference code to a new failure', async () => {
    render(
      <ErrorBoundary>
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    const read = () => screen.getByTestId('reference-code').querySelector('code')?.textContent;
    const first = read();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(read()).toMatch(/^[2-9A-HJ-NP-Z]{8}$/);
    expect(read()).not.toBe(first);
  });

  it('tries again by itself when the reset key changes', () => {
    let broken = true;
    const view = render(
      <ErrorBoundary resetKey="/orders">
        <Broken fail={() => broken} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    broken = false;
    view.rerender(
      <ErrorBoundary resetKey="/suppliers">
        <Broken fail={() => broken} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('speaks Arabic, and the words of the app when it gives them', () => {
    const arabic = renderRtl(
      <ErrorBoundary locale="ar">
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading', { name: 'حدث خطأ ما' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حاول مرة أخرى' })).toBeInTheDocument();
    arabic.unmount();

    render(
      <ErrorBoundary locale="ur" labels={{ errorTitle: 'کچھ غلط ہو گیا', tryAgain: 'دوبارہ کوشش' }}>
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading', { name: 'کچھ غلط ہو گیا' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'دوبارہ کوشش' })).toBeInTheDocument();
  });

  it('uses the fallback of the app, which gets the code and a way back but not the error', async () => {
    let broken = true;
    const fallback = vi.fn(({ reference, reset }: { reference: string; reset: () => void }) => (
      <button type="button" onClick={reset}>
        {`Retry ${reference}`}
      </button>
    ));
    render(
      <ErrorBoundary fallback={fallback}>
        <Broken fail={() => broken} />
      </ErrorBoundary>
    );
    expect(Object.keys(fallback.mock.calls[0]![0]).sort()).toEqual(['reference', 'reset']);
    broken = false;
    await userEvent.click(screen.getByRole('button', { name: /^Retry [2-9A-HJ-NP-Z]{8}$/ }));
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('gives the focus to the error when the broken part had it, also when a retry fails', async () => {
    function LoadButton() {
      const [broken, setBroken] = useState(false);
      if (broken) {
        throw new Error(SECRET);
      }
      return (
        <button type="button" onClick={() => setBroken(true)}>
          Load orders
        </button>
      );
    }
    render(
      <ErrorBoundary>
        <LoadButton />
      </ErrorBoundary>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Load orders' }));
    const heading = screen.getByRole('heading', { name: 'Something went wrong' });
    expect(heading).toHaveFocus();

    // "Try again" draws the button again; pressed, it fails again: the new error takes the focus.
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await userEvent.click(screen.getByRole('button', { name: 'Load orders' }));
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toHaveFocus();
  });

  it('never takes the focus from somewhere else', () => {
    const view = render(<input aria-label="Search" />);
    const search = screen.getByRole('textbox', { name: 'Search' });
    search.focus();
    view.rerender(
      <>
        <input aria-label="Search" />
        <ErrorBoundary>
          <Broken fail={() => true} />
        </ErrorBoundary>
      </>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(search).toHaveFocus();
  });

  it('takes the heading level of its place on the page', () => {
    render(
      <ErrorBoundary titleOrder={3}>
        <Broken fail={() => true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Something went wrong' })).toBeVisible();
  });

  it('tells the app when the part is drawn again, so the app can move the focus', async () => {
    let broken = true;
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <Broken fail={() => broken} />
      </ErrorBoundary>
    );
    expect(onReset).not.toHaveBeenCalled();
    broken = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
