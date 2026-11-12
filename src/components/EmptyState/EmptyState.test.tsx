import { render, renderRtl, screen, userEvent } from '../../test-utils';
import { EmptyState, emptyStateVariants } from './EmptyState';
import { isReferenceCode, makeReference } from './reference';

describe('EmptyState', () => {
  it('is an icon tile, a one-line title, one line of help and one button', () => {
    render(
      <EmptyState
        title="No suppliers yet"
        description="Add the first one to start."
        action={<button type="button">Add supplier</button>}
      />
    );
    const state = screen.getByTestId('empty-state');
    expect(state).toHaveAttribute('data-variant', 'empty');
    expect(screen.getByRole('heading', { level: 2, name: 'No suppliers yet' })).toBeInTheDocument();
    expect(state).toHaveTextContent('Add the first one to start.');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    // The icon is decoration: the words say everything.
    expect(state.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
    // An empty list is not an alert.
    expect(state).not.toHaveAttribute('role');
  });

  it.each(emptyStateVariants)('has the same parts in the same order for %s', (variant) => {
    render(<EmptyState variant={variant} description="One line." action={<a href="/">Go</a>} />);
    const state = screen.getByTestId('empty-state');
    expect(state).toHaveAttribute('data-variant', variant);
    expect([...state.children].map((child) => child.tagName)).toEqual(['SPAN', 'H2', 'P', 'DIV']);
  });

  it('has built-in words for each variant, in English and in Arabic', () => {
    const { unmount } = render(<EmptyState />);
    expect(screen.getByRole('heading')).toHaveTextContent('Nothing here yet');
    unmount();

    const error = render(<EmptyState variant="error" />);
    expect(screen.getByRole('heading')).toHaveTextContent('Something went wrong');
    expect(screen.getByTestId('empty-state')).toHaveTextContent('Please try again.');
    error.unmount();

    renderRtl(<EmptyState variant="not-found" locale="ar" />);
    expect(screen.getByRole('heading')).toHaveTextContent('الصفحة غير موجودة');
    expect(screen.getByTestId('empty-state')).toHaveTextContent('هذه الصفحة غير موجودة');
  });

  it('takes the words of the app for another language', () => {
    render(
      <EmptyState
        variant="not-found"
        locale="ur"
        labels={{ notFoundTitle: 'صفحہ نہیں ملا', notFoundHelp: 'یہ صفحہ موجود نہیں۔' }}
      />
    );
    expect(screen.getByRole('heading')).toHaveTextContent('صفحہ نہیں ملا');
    expect(screen.getByTestId('empty-state')).toHaveTextContent('یہ صفحہ موجود نہیں۔');
  });

  it('is a whole page with a first-level title when asked', () => {
    render(<EmptyState variant="not-found" fullPage />);
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-full-page');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });

  it('reads an error out at once and shows its reference code', () => {
    render(<EmptyState variant="error" reference="K7QM2XWD" />);
    expect(screen.getByRole('alert')).toBe(screen.getByTestId('empty-state'));
    const code = screen.getByTestId('reference-code');
    expect(code).toHaveTextContent('Reference');
    expect(code.querySelector('code')).toHaveTextContent(/^K7QM2XWD$/);
    // A code reads left to right, also in a right-to-left page.
    expect(code.querySelector('code')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('button', { name: 'Copy the reference code' })).toBeInTheDocument();
  });

  it('copies the reference code and says so', async () => {
    // The test user brings its own clipboard, so nothing of this computer is touched.
    const user = userEvent.setup();
    renderRtl(<EmptyState variant="error" reference="K7QM2XWD" locale="ar" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'نسخ الرمز المرجعي' }));
    expect(await navigator.clipboard.readText()).toBe('K7QM2XWD');
    expect(await screen.findByText('تم النسخ')).toBe(screen.getByRole('status'));
  });

  it.each([
    'TypeError: Cannot read properties of undefined',
    'duplicate key value violates unique constraint "suppliers_pkey"',
    'at render (/srv/app/src/page.tsx:12:3)',
    'C:\\app\\server.js',
    'abc',
  ])('never shows a text that is not a reference code: %s', (text) => {
    render(<EmptyState variant="error" reference={text} />);
    expect(screen.queryByTestId('reference-code')).toBeNull();
    expect(screen.getByTestId('empty-state')).not.toHaveTextContent(text);
  });

  it.each(['', null, undefined])('shows no code line when there is no code: %s', (nothing) => {
    render(<EmptyState variant="error" reference={nothing} />);
    expect(screen.queryByTestId('reference-code')).toBeNull();
  });

  it('shows a reference code only on the error variant', () => {
    render(<EmptyState variant="not-found" reference="K7QM2XWD" />);
    expect(screen.queryByTestId('reference-code')).toBeNull();
  });
});

describe('reference codes', () => {
  it('accepts short plain codes, such as the digest a framework gives an error', () => {
    expect(isReferenceCode('K7QM2XWD')).toBe(true);
    expect(isReferenceCode('2732486547')).toBe(true);
    expect(isReferenceCode('a1b2-c3d4_e5')).toBe(true);
  });

  it('refuses everything that could be an error message', () => {
    expect(isReferenceCode('not found')).toBe(false);
    expect(isReferenceCode('Error: boom')).toBe(false);
    expect(isReferenceCode('a/b')).toBe(false);
    expect(isReferenceCode('x'.repeat(65))).toBe(false);
    expect(isReferenceCode(undefined)).toBe(false);
    expect(isReferenceCode(null)).toBe(false);
    expect(isReferenceCode(new Error('boom'))).toBe(false);
  });

  it('makes a new code every time, of characters that are easy to read out', () => {
    const codes = Array.from({ length: 200 }, () => makeReference());
    for (const code of codes) {
      expect(code).toMatch(/^[2-9A-HJ-NP-Z]{8}$/);
      expect(isReferenceCode(code)).toBe(true);
    }
    expect(new Set(codes).size).toBe(200);
    expect(makeReference(12)).toHaveLength(12);
  });
});
