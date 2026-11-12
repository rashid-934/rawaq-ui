import type { ComponentPropsWithoutRef } from 'react';
import { IconCircle } from '@tabler/icons-react';
import { act, render, renderRtl, screen, userEvent, within } from '../../test-utils';
import { motionMs } from '../../tokens/motion';
import { Rail, type RailProps } from './Rail';
import { isRailItemActive, type RailGroup, type RailItem } from './rail-items';

const icon = IconCircle;
const base = '/c/acme';

const items: RailItem[] = [
  { key: 'dashboard', href: base, label: 'لوحة التحكم', icon, exact: true },
  { key: 'requests', href: `${base}/requests`, label: 'الطلبات', icon },
  { key: 'suppliers', href: `${base}/suppliers`, label: 'الموردون', icon },
  { key: 'reports', href: `${base}/reports`, label: 'التقارير', icon },
];
const bottomItems: RailItem[] = [
  { key: 'customize', href: `${base}/customize`, label: 'التخصيص', icon, highlight: true },
];
const platform: RailGroup = {
  key: 'platform',
  label: 'المنصة',
  items: [
    { key: 'companies', href: '/platform/companies', label: 'الشركات', icon },
    { key: 'plans', href: '/platform/plans', label: 'الباقات', icon },
  ],
};
const user = { name: 'Sara Example', initials: 'SE', role: 'مسؤول الشركة' };

function railWith(props: Partial<RailProps> = {}) {
  return (
    <Rail
      id="nav"
      appName="Hub"
      items={items}
      bottomItems={bottomItems}
      user={user}
      pathname={`${base}/requests`}
      showLabels={false}
      onToggleLabels={() => {}}
      locale="ar"
      {...props}
    />
  );
}

function renderRail(props: Partial<RailProps> = {}) {
  const view = renderRtl(railWith(props));
  return { rerender: (next: Partial<RailProps> = {}) => view.rerender(railWith(next)) };
}

/**
 * jsdom has no layout, so every menu item gets its own place: 42 px apart, from 60 px down.
 * Everything else (the rail, its scrolling list) is one tall box that holds them all.
 */
function mockLayout(shift: () => number = () => 0) {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function place(
    this: HTMLElement
  ) {
    const index = [...document.querySelectorAll('[data-rail-item]')].indexOf(this);
    const place = { top: 0, left: 0, width: 64, height: 2000 };
    if (index >= 0) {
      Object.assign(place, { top: 60 + index * 42 + shift(), left: 12, width: 40, height: 40 });
    } else if (this.dataset.testid === 'rail-glow') {
      // The glow shape is where its style puts it.
      const { top, left } = this.style;
      Object.assign(place, { top: parseFloat(top), left: parseFloat(left), width: 40, height: 40 });
    }
    const box = place;
    return {
      ...box,
      x: box.left,
      y: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
      toJSON: () => box,
    };
  });
}

describe('Rail', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps one glow shape and only moves it when the page changes', () => {
    mockLayout();
    const { rerender } = renderRail();
    const glow = screen.getByTestId('rail-glow');
    // Requests is the second item.
    expect(glow).toHaveStyle({ top: '102px', left: '12px', width: '40px', height: '40px' });
    // At rest it has no transform: it is painted as a plain positioned element.
    expect(glow.style.transform).toBe('');

    rerender({ pathname: `${base}/suppliers` });
    expect(screen.getByRole('link', { name: 'الموردون' })).toHaveAttribute('aria-current', 'page');
    // The same element, so it can slide; a new element would jump. Only its position changed.
    expect(screen.getByTestId('rail-glow')).toBe(glow);
    expect(glow).toHaveStyle({ top: '144px', left: '12px', width: '40px', height: '40px' });

    rerender({ pathname: base });
    expect(screen.getByTestId('rail-glow')).toBe(glow);
    expect(glow).toHaveStyle({ top: '60px' });
  });

  describe('the slide of the glow shape', () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    const reducedMotion = (on: boolean) =>
      vi
        .spyOn(window, 'matchMedia')
        .mockImplementation(
          (query) => ({ matches: on && query.includes('reduce'), media: query }) as MediaQueryList
        );

    beforeEach(() => {
      animate.mockClear();
      // jsdom has no animations: the shape gets a stand-in that records what it is asked to play.
      Object.defineProperty(HTMLElement.prototype, 'animate', {
        configurable: true,
        value: animate,
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    });

    it('is a transform from the old place to the new one, for the time of the motion token', () => {
      reducedMotion(false);
      mockLayout();
      const { rerender } = renderRail();
      // It appears in place: nothing slides in on the first draw.
      expect(animate).not.toHaveBeenCalled();

      rerender({ pathname: `${base}/suppliers` });
      // One entry down: it starts 42 px above its new place and ends with no transform at all.
      expect(animate).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenLastCalledWith(
        [{ transform: 'translate(0px, -42px)' }, { transform: 'none' }],
        { duration: motionMs('base'), easing: 'ease' }
      );

      rerender({ pathname: base });
      expect(animate).toHaveBeenLastCalledWith(
        [{ transform: 'translate(0px, 84px)' }, { transform: 'none' }],
        { duration: 200, easing: 'ease' }
      );
    });

    it('does not play when only the size changes, as with "Show labels"', () => {
      reducedMotion(false);
      mockLayout();
      const { rerender } = renderRail();
      rerender({ showLabels: true });
      expect(animate).not.toHaveBeenCalled();
    });

    it('does not play at all with reduced motion: the shape is simply at its new place', () => {
      reducedMotion(true);
      mockLayout();
      const { rerender } = renderRail();
      rerender({ pathname: `${base}/suppliers` });
      expect(animate).not.toHaveBeenCalled();
      expect(screen.getByTestId('rail-glow')).toHaveStyle({ top: '144px' });
    });
  });

  it('follows the active entry without drawing the entries of the rail again', () => {
    // While "Show labels" slides the rail open, the browser reports a new size on every frame.
    const sizeChanged: (() => void)[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          sizeChanged.push(callback);
        }

        observe() {}

        unobserve() {}

        disconnect() {}
      }
    );
    let draws = 0;
    const Counted = () => {
      draws += 1;
      return <svg />;
    };
    let moved = 0;
    mockLayout(() => moved);
    renderRail({ items: items.map((item) => ({ ...item, icon: Counted })) });
    const glow = screen.getByTestId('rail-glow');
    expect(glow).toHaveStyle({ top: '102px' });
    expect(sizeChanged.length).toBeGreaterThan(0);

    const before = draws;
    for (const frame of [3, 6, 9]) {
      moved = frame;
      act(() => {
        for (const callback of sizeChanged) {
          callback();
        }
      });
    }
    // The shape followed, and it is still the same element.
    expect(screen.getByTestId('rail-glow')).toBe(glow);
    expect(glow).toHaveStyle({ top: '111px' });
    // Not one entry was drawn again for it: three frames cost three small updates, no more.
    expect(draws).toBe(before);
    vi.unstubAllGlobals();
  });

  it('draws an entry again only when something it shows has changed', () => {
    let draws = 0;
    const Counted = () => {
      draws += 1;
      return <svg />;
    };
    const counted = () => items.map((item) => ({ ...item, icon: Counted }));
    const { rerender } = renderRail({ items: counted() });
    const first = draws;
    expect(first).toBe(items.length);

    // An app that builds the same list again (new objects, same content) costs nothing.
    rerender({ items: counted() });
    rerender({ items: counted(), labelsNotSaved: true });
    expect(draws).toBe(first);

    // A page change draws the two entries it touches: the old current page and the new one.
    rerender({ items: counted(), pathname: `${base}/suppliers` });
    expect(draws).toBe(first + 2);

    // A new name or a new count draws that entry.
    rerender({
      items: counted().map((item) => (item.key === 'reports' ? { ...item, count: 3 } : item)),
      pathname: `${base}/suppliers`,
    });
    expect(draws).toBe(first + 3);
    expect(screen.getByTestId('nav-reports')).toHaveTextContent('التقارير3');
  });

  it('tells its own styles that the glow shape is there', () => {
    mockLayout();
    const { rerender } = renderRail();
    expect(screen.getByRole('navigation')).toHaveAttribute('data-glow');
    rerender({ pathname: '/account' });
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-glow');
  });

  it('shows a tooltip for the time the motion token gives', () => {
    expect(motionMs('tooltip')).toBe(120);
  });

  it('has no glow shape when no entry is the current page', () => {
    mockLayout();
    renderRail({ pathname: '/account' });
    expect(screen.queryByTestId('rail-glow')).toBeNull();
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-glow');
  });

  it('lists the entries in the order given, with the bottom entries last', () => {
    renderRail();
    const names = within(screen.getByRole('navigation'))
      .getAllByRole('link')
      .map((link) => link.textContent?.trim());
    expect(names).toEqual(['لوحة التحكم', 'الطلبات', 'الموردون', 'التقارير', 'التخصيص']);
    expect(screen.getByTestId('nav-customize')).toHaveAttribute('data-highlight');
    expect(screen.getByTestId('nav-requests')).not.toHaveAttribute('data-highlight');
  });

  it('marks the current page, also on a page under it', () => {
    const { rerender } = renderRail();
    expect(screen.getByRole('link', { name: 'الطلبات' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'لوحة التحكم' })).not.toHaveAttribute('aria-current');

    rerender({ pathname: `${base}/requests/12/edit` });
    expect(screen.getByRole('link', { name: 'الطلبات' })).toHaveAttribute('aria-current', 'page');
    // An `exact` entry is the current page on its own address only.
    expect(screen.getByRole('link', { name: 'لوحة التحكم' })).not.toHaveAttribute('aria-current');
  });

  it('shows a labelled group only when it is given and has entries', () => {
    const { rerender } = renderRail();
    expect(screen.queryByRole('group')).toBeNull();

    rerender({ groups: [platform, { key: 'empty', label: 'فارغ', items: [] }] });
    const group = screen.getByRole('group', { name: 'المنصة' });
    expect(within(group).getAllByRole('link')).toHaveLength(2);
    expect(screen.getAllByRole('group')).toHaveLength(1);
  });

  it('shows a count beside an entry that has one', () => {
    renderRail({ items: [{ ...items[0]!, count: 7 }, ...items.slice(1)] });
    expect(screen.getByTestId('nav-dashboard')).toHaveTextContent('لوحة التحكم7');
    expect(screen.getByTestId('nav-requests')).toHaveTextContent(/^الطلبات$/);
  });

  it('shows who is signed in and their role, when the app says so', () => {
    const { rerender } = renderRail();
    const person = screen.getByTestId('sidebar-user');
    expect(person).toHaveTextContent('Sara Example');
    expect(person).toHaveTextContent('مسؤول الشركة');

    rerender({ user: null });
    expect(screen.queryByTestId('sidebar-user')).toBeNull();
  });

  it('shows the page name in a tooltip on keyboard focus', async () => {
    renderRail();
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'لوحة التحكم' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('لوحة التحكم');
  });

  it('has a "Show labels" toggle, off by default', async () => {
    const onToggleLabels = vi.fn();
    renderRail({ onToggleLabels });
    const toggle = screen.getByRole('button', { name: 'إظهار الأسماء' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'nav');
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-labels');
    await userEvent.click(toggle);
    expect(onToggleLabels).toHaveBeenCalledTimes(1);
  });

  it('opens the labelled panel when "Show labels" is on, without tooltips', async () => {
    renderRail({ showLabels: true });
    expect(screen.getByRole('navigation')).toHaveAttribute('data-labels');
    expect(screen.getByRole('button', { name: 'إظهار الأسماء' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await userEvent.tab();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('says so when the choice could not be saved', () => {
    const { rerender } = renderRail();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    rerender({ labelsNotSaved: true });
    expect(screen.getByRole('status')).toHaveTextContent('تعذر حفظ هذا الاختيار');
  });

  it('speaks English by default, and the words of the app when it gives them', () => {
    const view = render(railWith({ locale: undefined }));
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show labels' })).toBeInTheDocument();

    // Urdu is not built in: the app passes its own words.
    view.rerender(
      railWith({
        locale: 'ur',
        labels: { mainNavigation: 'مرکزی مینو', showLabels: 'نام دکھائیں' },
      })
    );
    expect(screen.getByRole('navigation', { name: 'مرکزی مینو' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'نام دکھائیں' })).toBeInTheDocument();
  });

  it('draws its links with the link component of the app', () => {
    const AppLink = ({ href, ...rest }: ComponentPropsWithoutRef<'a'>) => (
      <a href={`/ar${href}`} data-app-link {...rest} />
    );
    renderRail({ linkComponent: AppLink });
    const link = screen.getByRole('link', { name: 'الموردون' });
    expect(link).toHaveAttribute('href', `/ar${base}/suppliers`);
    expect(link).toHaveAttribute('data-app-link');
  });

  it('shows the logo of the app, or the first letter of its name', () => {
    const { rerender } = renderRail();
    // The name of the app, and the logo tile before it.
    const brand = () => screen.getByText('Hub').parentElement;
    expect(brand()).toHaveTextContent(/^HHub$/);
    rerender({ logo: <svg data-testid="logo" /> });
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(brand()).toHaveTextContent(/^Hub$/);
  });

  it('is a closed drawer out of reach, or an open one, on a narrow window', () => {
    const { rerender } = renderRail({ inert: true, children: <button type="button">x</button> });
    const rail = screen.getByRole('navigation', { hidden: true });
    expect(rail).toHaveAttribute('inert');
    expect(rail).not.toHaveAttribute('data-open');
    rerender({ open: true });
    expect(rail).toHaveAttribute('data-open');
    expect(rail).not.toHaveAttribute('inert');
  });

  it('passes other attributes to the navigation element and gives the app its element', () => {
    const ref = { current: null as HTMLElement | null };
    renderRtl(railWith({ ref, ...{ 'data-tour': 'nav' } }));
    expect(screen.getByRole('navigation')).toHaveAttribute('data-tour', 'nav');
    expect(ref.current).toBe(screen.getByRole('navigation'));
  });
});

describe('isRailItemActive', () => {
  it('is true on the address of the entry and on the pages under it', () => {
    const entry = { href: '/c/acme/forms' };
    expect(isRailItemActive(entry, '/c/acme/forms')).toBe(true);
    expect(isRailItemActive(entry, '/c/acme/forms/7/responses')).toBe(true);
    expect(isRailItemActive(entry, '/c/acme/forms-archive')).toBe(false);
    expect(isRailItemActive(entry, '/c/acme')).toBe(false);
  });

  it('is true only on its own address for an exact entry', () => {
    const home = { href: '/c/acme', exact: true };
    expect(isRailItemActive(home, '/c/acme')).toBe(true);
    expect(isRailItemActive(home, '/c/acme/forms')).toBe(false);
  });
});
