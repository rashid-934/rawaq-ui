import { render, screen } from '../../test-utils';
import { Frame } from '../Frame/Frame';
import { PhoneBar } from './PhoneBar';

describe('PhoneBar', () => {
  it('shows the logo tile, the page title as the heading, and one action', () => {
    render(
      <PhoneBar
        appName="Procure"
        title="Requests"
        titleId="page-title"
        action={<button type="button">New request</button>}
      />
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Requests' })).toHaveAttribute(
      'id',
      'page-title'
    );
    expect(screen.getByRole('button', { name: 'New request' })).toBeInTheDocument();
    // The tile is decoration: the app's name is said elsewhere.
    expect(screen.getByText('P')).toHaveAttribute('aria-hidden', 'true');
  });

  it('takes the app logo and another heading level', () => {
    render(<PhoneBar appName="Procure" logo={<span>LOGO</span>} title="Home" titleOrder={2} />);
    expect(screen.getByText('LOGO')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Home' })).toBeInTheDocument();
  });
});

describe('Frame on phones', () => {
  it('keeps the desktop header and adds the phone bar beside it, only when given', () => {
    const view = render(
      <Frame pageKind="work" pathname="/" header={<span>Search</span>}>
        <p>Page</p>
      </Frame>
    );
    const header = screen.getByTestId('app-header');
    expect(header).not.toHaveAttribute('data-phone-header');
    expect(header.children).toHaveLength(1);
    expect(screen.getByTestId('app-frame')).not.toHaveAttribute('data-phone-nav');

    view.rerender(
      <Frame
        pageKind="work"
        pathname="/"
        header={<span>Search</span>}
        phoneHeader={<PhoneBar appName="Procure" title="Requests" />}
        bottomBar={<nav aria-label="Bottom bar" />}
      >
        <p>Page</p>
      </Frame>
    );
    expect(screen.getByTestId('app-header')).toHaveAttribute('data-phone-header');
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByTestId('phone-bar')).toBeInTheDocument();
    expect(screen.getByTestId('app-frame')).toHaveAttribute('data-phone-nav');
    // The bottom bar floats outside the page's sheet, like the rail.
    const sheet = screen.getByRole('main').parentElement!;
    expect(sheet).not.toContainElement(screen.getByRole('navigation', { name: 'Bottom bar' }));
  });
});
