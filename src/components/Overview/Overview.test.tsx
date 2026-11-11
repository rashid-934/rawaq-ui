import type { ComponentPropsWithoutRef } from 'react';
import { IconCircle } from '@tabler/icons-react';
import { render, screen, within } from '../../test-utils';
import { BentoCard, Emphasis, HeroBanner, OverviewPage, StatCard, StatGrid } from './Overview';

describe('OverviewPage', () => {
  it('has a main column, and a side column only when there is something for it', () => {
    const view = render(
      <OverviewPage>
        <p>Main things</p>
      </OverviewPage>
    );
    const page = () => screen.getByText('Main things').parentElement!.parentElement!;
    expect(page()).not.toHaveAttribute('data-side');
    expect(page().children).toHaveLength(1);

    view.rerender(
      <OverviewPage side={<p>Side things</p>}>
        <p>Main things</p>
      </OverviewPage>
    );
    expect(page()).toHaveAttribute('data-side');
    expect(page().children).toHaveLength(2);
    expect(page().lastElementChild).toHaveTextContent('Side things');
  });
});

describe('HeroBanner', () => {
  it('is a section named by its headline, the one h1 of the page', () => {
    render(
      <HeroBanner
        title={
          <>
            Good morning. <Emphasis>Three things</Emphasis> need you.
          </>
        }
        action={<button type="button">Start</button>}
      />
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Good morning. Three things need you.');
    expect(screen.getByRole('region', { name: /Good morning/ })).toContainElement(heading);
    expect(screen.getByText('Three things').tagName).toBe('EM');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('keeps the id the app gives its headline', () => {
    render(<HeroBanner title="Hello" titleId="greeting" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'greeting');
    expect(screen.getByRole('region', { name: 'Hello' })).toBeInTheDocument();
  });
});

describe('BentoCard', () => {
  it('takes its share of the 12 columns and is named by its heading', () => {
    render(
      <BentoCard span={8} title="Do next" aside={<span>3</span>}>
        <p>Tasks</p>
      </BentoCard>
    );
    const card = screen.getByRole('region', { name: 'Do next' });
    expect(card.style.getPropertyValue('--span')).toBe('8');
    expect(within(card).getByRole('heading', { level: 2, name: 'Do next' })).toBeInTheDocument();
    expect(card).toHaveTextContent('Do next3Tasks');
  });

  it('is a plain card, the full row wide, without a heading', () => {
    render(
      <BentoCard className="mine">
        <p>Calendar</p>
      </BentoCard>
    );
    const card = screen.getByText('Calendar').parentElement!;
    expect(card.style.getPropertyValue('--span')).toBe('12');
    expect(card).not.toHaveAttribute('aria-labelledby');
    expect(card).toHaveClass('mine');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('rises on entrance only when the app gives it an order', () => {
    const view = render(<BentoCard>One</BentoCard>);
    const card = () => screen.getByText('One');
    expect(card()).not.toHaveClass('rise');
    expect(card().style.getPropertyValue('--stagger')).toBe('');

    view.rerender(<BentoCard order={0}>One</BentoCard>);
    expect(card()).toHaveClass('rise');
    expect(card().style.getPropertyValue('--stagger')).toBe('0');
  });
});

describe('StatGrid and StatCard', () => {
  it('lists the number cards, each with its label, its number and its hint', () => {
    render(
      <StatGrid columns={3}>
        <StatCard label="Open requests" value={12} hint="2 new today" icon={IconCircle} order={1} />
        <StatCard label="Spend" value={12480} text="12,480 SAR" tint="amber" />
      </StatGrid>
    );
    const list = screen.getByRole('list');
    expect(list.style.getPropertyValue('--columns')).toBe('3');
    const [requests, spend] = within(list).getAllByRole('listitem');
    expect(requests).toHaveTextContent('Open requests122 new today');
    expect(requests).toHaveClass('rise');
    expect(spend).toHaveTextContent(/^Spend/);
    // The number as it reads, once, for screen readers; the rolling digits are hidden from them.
    expect(within(spend!).getByText('12,480 SAR')).not.toHaveAttribute('aria-hidden');
    expect(spend).not.toHaveClass('rise');
    expect(within(spend!).getByTestId('stat-card')).toHaveAttribute('data-tint', 'amber');
    // The icon is decoration: hidden from screen readers.
    expect(requests!.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('is a link when it has an address, drawn with the link component of the app', () => {
    const AppLink = ({ href, ...rest }: ComponentPropsWithoutRef<'a'>) => (
      <a href={`/ar${href}`} {...rest} />
    );
    render(
      <StatGrid>
        <StatCard label="Plain" value={1} />
        <StatCard label="Linked" value={2} href="/requests" />
        <StatCard label="App link" value={3} href="/orders" linkComponent={AppLink} />
      </StatGrid>
    );
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/requests', '/ar/orders']);
    expect(screen.getAllByTestId('stat-card')[0]!.tagName).toBe('DIV');
  });
});
