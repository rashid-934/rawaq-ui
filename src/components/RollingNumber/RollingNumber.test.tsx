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

  const still = () => [
    ...screen.getByTestId('rolling-number').querySelectorAll<HTMLElement>('[data-still]'),
  ];
  /** The group that always reads left to right: the digits with their separators and signs. */
  const numberGroup = () => windows()[0]!.parentElement!;

  it('keeps separators and units still', () => {
    render(<RollingNumber value={12480} text="12,480 SAR" />);
    expect(windows()).toHaveLength(5);
    expect(still().map((part) => part.textContent)).toEqual([',', ' ', 'SAR']);
    expect(screen.getByText('12,480 SAR')).toBeInTheDocument();
  });

  it('keeps the number in one left-to-right group and the unit after it', () => {
    render(<RollingNumber value={12480} text="12,480 SAR" />);
    const [comma, space, unit] = still();
    for (const digit of windows()) {
      expect(digit.parentElement).toBe(numberGroup());
    }
    expect(numberGroup()).toContainElement(comma!);
    // The unit and its space are outside the group, after it: the page's direction places them
    // (to the right of the number in English, to its left in Arabic or Urdu).
    expect(numberGroup()).not.toContainElement(space!);
    expect(numberGroup()).not.toContainElement(unit!);
    expect(numberGroup().nextElementSibling).toBe(space);
    expect(space!.nextElementSibling).toBe(unit);
  });

  it('keeps the letters of an Arabic unit together, in their own order', () => {
    renderRtl(<RollingNumber value={250} text="250 ر.س" />);
    expect(still().map((part) => part.textContent)).toEqual([' ', 'ر.س']);
    expect(windows().map((digit) => digit.dataset.digit)).toEqual(['2', '5', '0']);
    expect(numberGroup()).not.toContainElement(still()[1]!);
  });

  it('keeps a unit written before the number before it', () => {
    render(<RollingNumber value={250} text="SAR 250" />);
    const [unit, space] = still();
    expect(unit).toHaveTextContent('SAR');
    expect(space!.nextElementSibling).toBe(numberGroup());
    expect(numberGroup()).not.toContainElement(unit!);
  });

  it('keeps a sign and a percent mark with the number', () => {
    render(<RollingNumber value={-5} text="-5.5%" />);
    expect(still().map((part) => part.textContent)).toEqual(['-', '.', '%']);
    for (const part of still()) {
      expect(numberGroup()).toContainElement(part);
    }
  });

  it('shows text that has no digit at all as it is', () => {
    render(<RollingNumber value={0} text="n/a" />);
    expect(windows()).toEqual([]);
    expect(still().map((part) => part.textContent)).toEqual(['n/a']);
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
