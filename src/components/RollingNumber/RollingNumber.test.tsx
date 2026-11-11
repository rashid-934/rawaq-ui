import { render, renderRtl, screen } from '../../test-utils';
import { RollingNumber } from './RollingNumber';

const windows = () => [
  ...screen.getByTestId('rolling-number').querySelectorAll<HTMLElement>('[data-digit]'),
];

describe('RollingNumber', () => {
  it('gives the page text the final number only', () => {
    render(<RollingNumber value={128} />);
    // The rolling digits are drawn by CSS, so the only text is the real number.
    expect(screen.getByTestId('rolling-number')).toHaveTextContent(/^128$/);
    expect(screen.getByText('128')).not.toHaveAttribute('aria-hidden');
  });

  it('hides the rolling digits from screen readers', () => {
    render(<RollingNumber value={128} />);
    for (const digit of windows()) {
      expect(digit.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('gives every digit its own window that rests on that digit', () => {
    render(<RollingNumber value={407} />);
    expect(windows().map((digit) => digit.dataset.digit)).toEqual(['4', '0', '7']);
    expect(windows().map((digit) => digit.style.getPropertyValue('--digit'))).toEqual([
      '4',
      '0',
      '7',
    ]);
    // Each digit starts a little after the one before it.
    expect(windows().map((digit) => digit.style.getPropertyValue('--order'))).toEqual([
      '0',
      '1',
      '2',
    ]);
  });

  it('keeps separators and units still', () => {
    render(<RollingNumber value={12480} text="12,480 SAR" />);
    expect(windows()).toHaveLength(5);
    const root = screen.getByTestId('rolling-number');
    const still = [...root.querySelectorAll('[aria-hidden="true"] > :not([data-digit])')];
    expect(still.map((part) => part.textContent)).toEqual([',', ' SAR']);
    expect(screen.getByText('12,480 SAR')).toBeInTheDocument();
  });

  it('keeps the letters of an Arabic unit together, in their own order', () => {
    renderRtl(<RollingNumber value={250} text="250 ر.س" />);
    const root = screen.getByTestId('rolling-number');
    const still = [...root.querySelectorAll('[aria-hidden="true"] > :not([data-digit])')];
    expect(still.map((part) => part.textContent)).toEqual([' ر.س']);
    expect(windows().map((digit) => digit.dataset.digit)).toEqual(['2', '5', '0']);
  });

  it('shows a true zero', () => {
    render(<RollingNumber value={0} />);
    expect(windows().map((digit) => digit.dataset.digit)).toEqual(['0']);
    expect(screen.getByTestId('rolling-number')).toHaveTextContent(/^0$/);
  });

  it('keeps the caller class and works right to left', () => {
    renderRtl(<RollingNumber value={35} className="tabular" />);
    expect(screen.getByTestId('rolling-number')).toHaveClass('tabular');
    expect(windows().map((digit) => digit.dataset.digit)).toEqual(['3', '5']);
  });
});
