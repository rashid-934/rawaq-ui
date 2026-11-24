import { render, renderRtl, screen, within } from '../../test-utils';
import { ActivityList } from './ActivityList';
import { NeedsYouList } from './NeedsYouList';
import { currencySign, StatCard, StatGrid } from './Overview';

const needs = [
  { key: 'a', action: 'Approve request', subject: 'Parking barrier repair', href: '/r/11' },
  { key: 'b', action: 'Compare 3 quotes', subject: 'RFQ-0004', href: '/q/4' },
  { key: 'c', action: 'Send PO to supplier', subject: 'PO-0009', href: '/po/9' },
  { key: 'd', action: 'Fourth', href: '/x' },
];

describe('NeedsYouList', () => {
  it('shows three rows at most, each a link, the first marked "Do next"', () => {
    render(<NeedsYouList items={needs} />);
    const list = screen.getByRole('list', { name: 'Needs you' });
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/r/11');
    expect(links[0]).toHaveTextContent('Approve request · Parking barrier repair');
    expect(within(links[0]!).getByText('Do next')).toBeInTheDocument();
    expect(within(links[1]!).queryByText('Do next')).toBeNull();
    expect(screen.queryByText('Fourth')).toBeNull();
  });

  it('speaks Arabic', () => {
    renderRtl(<NeedsYouList items={needs.slice(0, 1)} locale="ar" />);
    expect(screen.getByRole('list', { name: 'بانتظارك' })).toBeInTheDocument();
    expect(screen.getByText('ابدأ هنا')).toBeInTheDocument();
  });
});

describe('ActivityList', () => {
  it('shows the name, the reference under it and the status, as a link when given', () => {
    render(
      <ActivityList
        items={[
          { key: '1', title: 'Office chairs', reference: 'REQ-0012', status: 'New', href: '/1' },
          { key: '2', title: 'Safety vests', reference: 'PO-0009' },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: /Office chairs/ })).toHaveTextContent(
      'Office chairsREQ-0012New'
    );
    expect(screen.getByText('Safety vests').closest('a')).toBeNull();
  });
});

describe('money on a number card', () => {
  it('finds the currency sign and its side for each language', () => {
    expect(currencySign('SAR', 'en')).toEqual({ sign: 'SAR', before: true });
    const arabic = currencySign('SAR', 'ar');
    expect(arabic.sign).toContain('ر.س');
    expect(arabic.before).toBe(false);
  });

  it('never breaks on a locale it cannot read', () => {
    expect(currencySign('SAR', '[locale]').sign).toBeTruthy();
  });

  it('shows the currency beside the number, and nothing more without one', () => {
    const view = render(
      <StatGrid>
        <StatCard label="Saved this month" value={48250} text="48,250" currency="SAR" />
      </StatGrid>
    );
    expect(screen.getByTestId('stat-card')).toHaveTextContent('SAR');
    view.rerender(
      <StatGrid>
        <StatCard label="Saved this month" value={48250} text="48,250" />
      </StatGrid>
    );
    expect(screen.getByTestId('stat-card')).not.toHaveTextContent('SAR');
  });
});
