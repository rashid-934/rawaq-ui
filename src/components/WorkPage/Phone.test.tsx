import { useState } from 'react';
import { render, renderRtl, screen, userEvent, waitFor, within } from '../../test-utils';
import { CardList, WorkList } from './CardList';
import { FilterChips, SearchField } from './Controls';
import { StickyActions } from './StickyActions';
import { TableWrap } from './WorkPage';

const cards = [
  {
    key: '12',
    reference: 'WQ-REQ-2611-0012',
    status: 'New',
    title: 'Office chairs',
    meta: 'IT · 24 Nov',
    quantity: 12,
    href: '/requests/12',
  },
  { key: '11', title: 'Parking barrier repair', quantity: 1 },
];

describe('CardList', () => {
  it('shows reference, status, name, facts and the quantity in words, as a link with a chevron', () => {
    render(<CardList items={cards} />);
    const link = screen.getByRole('link', { name: /Office chairs/ });
    expect(link).toHaveAttribute('href', '/requests/12');
    expect(link).toHaveTextContent('WQ-REQ-2611-0012');
    expect(link).toHaveTextContent('New');
    expect(link).toHaveTextContent('IT · 24 Nov');
    expect(link).toHaveTextContent('12 items');
    expect(link.querySelector('svg.mirror-rtl')).not.toBeNull();
    // Without an address: no link and no chevron, and "1 item" in the singular.
    const plain = screen.getByText('Parking barrier repair').closest('li')!;
    expect(within(plain).queryByRole('link')).toBeNull();
    expect(plain).toHaveTextContent('1 item');
    expect(plain.querySelector('svg')).toBeNull();
  });

  it('counts in Arabic with its plural forms', () => {
    renderRtl(
      <CardList
        locale="ar"
        items={[
          { key: 'a', title: 'كراسي', quantity: 1 },
          { key: 'b', title: 'طابعات', quantity: 2 },
          { key: 'c', title: 'سترات', quantity: 40 },
        ]}
      />
    );
    expect(screen.getByText('عنصر واحد')).toBeInTheDocument();
    expect(screen.getByText('عنصران')).toBeInTheDocument();
    expect(screen.getByText('40 عنصرًا')).toBeInTheDocument();
  });
});

describe('WorkList', () => {
  it('draws both shapes and says which one a phone shows', () => {
    const view = render(<WorkList cards={<p>Cards</p>} table={<p>Table</p>} />);
    expect(screen.getByText('Cards')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(view.container.querySelector('[data-phone-view]')).toHaveAttribute(
      'data-phone-view',
      'cards'
    );
    view.rerender(<WorkList cards={<p>Cards</p>} table={<p>Table</p>} phoneView="table" />);
    expect(view.container.querySelector('[data-phone-view]')).toHaveAttribute(
      'data-phone-view',
      'table'
    );
  });
});

describe('TableWrap on phones', () => {
  it('marks a sticky first column and shows the swipe hint in the page language', () => {
    const view = render(
      <TableWrap stickyFirstColumn>
        <table>
          <tbody>
            <tr>
              <td>A</td>
            </tr>
          </tbody>
        </table>
      </TableWrap>
    );
    expect(view.container.querySelector('.table-wrap')).toHaveAttribute('data-sticky-first');
    expect(screen.getByTestId('swipe-hint')).toHaveTextContent('Swipe sideways for more columns');
    view.rerender(
      <TableWrap stickyFirstColumn locale="ar">
        <table />
      </TableWrap>
    );
    expect(screen.getByTestId('swipe-hint')).toHaveTextContent('اسحب جانبًا');
  });

  it('adds nothing for a plain table but a hidden marker', () => {
    const view = render(
      <TableWrap>
        <table />
      </TableWrap>
    );
    const wrap = view.container.querySelector('.table-wrap')!;
    expect(wrap).not.toHaveAttribute('data-sticky-first');
    expect(screen.queryByTestId('swipe-hint')).toBeNull();
    expect(wrap.querySelector('span[hidden]')).not.toBeNull();
  });

  it('becomes a named, focusable region only while a table, even one that comes late, scrolls', async () => {
    // A box 360 px wide; a table 520 px wide inside it.
    const width = vi
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.querySelector('table') || this.tagName === 'TABLE' ? 520 : 0;
      });
    const box = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ width: 120.4, height: 40 }));
    const table = (
      <table>
        <tbody>
          <tr>
            <td>A</td>
          </tr>
        </tbody>
      </table>
    );
    const view = render(<TableWrap stickyFirstColumn>{null}</TableWrap>);
    const wrap = view.container.querySelector<HTMLElement>('.table-wrap')!;
    wrap.style.overflowX = 'auto';
    expect(wrap).not.toHaveAttribute('tabindex');
    view.rerender(<TableWrap stickyFirstColumn>{table}</TableWrap>);
    await waitFor(() => expect(wrap).toHaveAttribute('tabindex', '0'));
    expect(screen.getByRole('region', { name: 'Table, scrolls sideways' })).toBe(wrap);
    expect(wrap).toHaveAttribute('data-scrolls');
    expect(wrap).not.toHaveAttribute('data-fits');
    // The fixed column's width, so a focused control stops beside it.
    expect(wrap.style.getPropertyValue('--app-sticky-column')).toBe('121px');

    // The same table on a wider phone: it fits, so no region, no stop, and the hint hides.
    box.mockReturnValue(600);
    view.rerender(<TableWrap stickyFirstColumn>{null}</TableWrap>);
    view.rerender(<TableWrap stickyFirstColumn>{table}</TableWrap>);
    await waitFor(() => expect(wrap).toHaveAttribute('data-fits'));
    expect(wrap).not.toHaveAttribute('tabindex');
    expect(wrap).not.toHaveAttribute('role');
    width.mockRestore();
    box.mockRestore();
    rect.mockRestore();
  });
});

describe('FilterChips', () => {
  function Chips() {
    const [value, setValue] = useState('all');
    return (
      <FilterChips
        label="Status"
        value={value}
        onChange={setValue}
        options={[
          { value: 'all', label: 'All' },
          { value: 'new', label: 'New' },
        ]}
      />
    );
  }

  it('is a named group of toggle buttons, one pressed', async () => {
    render(<Chips />);
    const group = screen.getByRole('group', { name: 'Status' });
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await userEvent.click(within(group).getByRole('button', { name: 'New' }));
    expect(within(group).getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});

describe('SearchField and StickyActions', () => {
  it('gives the search field its name and a search icon', () => {
    render(<SearchField label="Search requests" />);
    const field = screen.getByRole('searchbox', { name: 'Search requests' });
    expect(field).toHaveAttribute('placeholder', 'Search requests');
    expect(field.closest('.mantine-InputWrapper-root')?.querySelector('svg')).not.toBeNull();
  });

  it('holds the save buttons', () => {
    render(
      <StickyActions>
        <button type="button">Save</button>
      </StickyActions>
    );
    expect(
      within(screen.getByTestId('sticky-actions')).getByRole('button', { name: 'Save' })
    ).toBeInTheDocument();
  });
});

describe('the keyboard on a touch screen', () => {
  it('marks the page while a text field has the focus, and only on a touch screen', async () => {
    const { BottomBar } = await import('../BottomBar/BottomBar');
    const matchMedia = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          // A touch phone.
          matches: query === '(pointer: coarse)' || query.includes('max-width'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList
    );
    render(
      <>
        <BottomBar items={[]} pathname="/" onMore={() => {}} />
        <input aria-label="Name" />
        <input type="checkbox" aria-label="Tick" />
      </>
    );
    await userEvent.click(screen.getByRole('textbox', { name: 'Name' }));
    expect(document.documentElement).toHaveAttribute('data-keyboard-open');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tick' }));
    expect(document.documentElement).not.toHaveAttribute('data-keyboard-open');
    matchMedia.mockRestore();
  });
});
