import {
  IconChartBar,
  IconFileText,
  IconLayoutDashboard,
  IconMessages,
  IconUsers,
} from '@tabler/icons-react';
import { render, renderRtl, screen, userEvent } from '../../test-utils';
import type { RailItem } from '../Rail/rail-items';
import { BottomBar, bottomBarProblems } from './BottomBar';

const items: RailItem[] = [
  { key: 'dashboard', href: '/', label: 'Dashboard', icon: IconLayoutDashboard, exact: true },
  { key: 'requests', href: '/requests', label: 'Requests', icon: IconFileText },
  { key: 'suppliers', href: '/suppliers', label: 'Suppliers', icon: IconUsers },
  { key: 'rfqs', href: '/rfqs', label: 'RFQs', icon: IconMessages },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BottomBar', () => {
  it('shows four pages and "More", and marks the current page', () => {
    render(<BottomBar items={items} pathname="/requests/12" onMore={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'Requests' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the More sheet through the app, and says when it is open', async () => {
    const onMore = vi.fn();
    const view = render(
      <BottomBar items={items} pathname="/" onMore={onMore} moreControls="more-sheet" />
    );
    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toHaveAttribute('aria-haspopup', 'dialog');
    expect(more).toHaveAttribute('aria-controls', 'more-sheet');
    await userEvent.click(more);
    expect(onMore).toHaveBeenCalledTimes(1);
    view.rerender(<BottomBar items={items} pathname="/" onMore={onMore} moreOpen />);
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('makes "More" the current entry for a page that lives in the More sheet', () => {
    render(<BottomBar items={items} pathname="/reports" onMore={() => {}} moreActive />);
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-current', 'page');
    for (const link of screen.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('cuts a longer list to four, and the check names the mistake', () => {
    const five = [
      ...items,
      { key: 'reports', href: '/reports', label: 'Reports', icon: IconChartBar },
    ];
    render(<BottomBar items={five} pathname="/" onMore={() => {}} />);
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.queryByRole('link', { name: 'Reports' })).toBeNull();
    expect(bottomBarProblems(five)).toEqual([
      'The bottom bar shows 4 pages and "More"; 5 were given.',
    ]);
  });

  it('finds two entries with the same icon, including the icon of "More"', () => {
    const twice = [items[0]!, { ...items[1]!, icon: IconLayoutDashboard }];
    expect(bottomBarProblems(twice)).toEqual([
      '"requests" has the same icon as "dashboard": every entry needs its own.',
    ]);
    expect(bottomBarProblems(items)).toEqual([]);
    expect(bottomBarProblems(items, IconUsers)).toEqual([
      '"suppliers" has the same icon as "more": every entry needs its own.',
    ]);
  });

  it('puts the glow pill on the active icon by measuring it, so it mirrors by itself', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      if (this.hasAttribute('data-bar-icon')) {
        // In a right-to-left page the first entry sits at the right end of the bar.
        return DOMRect.fromRect({ x: 290, y: 8, width: 56, height: 32 });
      }
      return DOMRect.fromRect({ x: 10, y: 0, width: 360, height: 64 });
    });
    renderRtl(<BottomBar items={items} pathname="/" onMore={() => {}} locale="ar" />);
    const glow = screen.getByTestId('bottom-bar-glow');
    expect(glow.style.transform).toBe('translate(280px, 8px)');
    expect(glow.style.width).toBe('56px');
    expect(glow).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'المزيد' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'القائمة الرئيسية' })).toBeInTheDocument();
  });

  it('draws no glow when no entry is current', () => {
    render(<BottomBar items={items} pathname="/nowhere" onMore={() => {}} />);
    expect(screen.queryByTestId('bottom-bar-glow')).toBeNull();
  });
});
