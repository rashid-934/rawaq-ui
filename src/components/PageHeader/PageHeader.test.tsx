import { render, renderRtl, screen } from '../../test-utils';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('shows the title as the page heading, alone when nothing else is given', () => {
    render(<PageHeader title="Forms" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Forms' })).toBeInTheDocument();
    expect(screen.queryByTestId('page-count')).toBeNull();
  });

  it('shows the count, the description and the actions on the same header', () => {
    render(
      <PageHeader
        title="Suppliers"
        titleId="suppliers-title"
        count={0}
        description="Everyone you buy from"
        actions={<button type="button">Add supplier</button>}
      />
    );
    const header = screen.getByRole('banner');
    expect(header).toContainElement(screen.getByRole('heading', { level: 1, name: 'Suppliers' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'suppliers-title');
    // Zero is a real count, not "no count". The number alone is for the eye; a screen reader
    // gets it with its unit.
    const count = screen.getByTestId('page-count');
    expect(count.querySelector('[aria-hidden]')).toHaveTextContent(/^0$/);
    expect(count).toHaveTextContent('0 items');
    // The description is shown in full (it wraps), so it needs no tooltip copy of itself.
    expect(screen.getByText('Everyone you buy from')).not.toHaveAttribute('title');
    expect(header).toContainElement(screen.getByRole('button', { name: 'Add supplier' }));
  });

  it('reads the count in Arabic with the right plural form', () => {
    renderRtl(<PageHeader title="الموردون" count={2} locale="ar" />);
    const count = screen.getByTestId('page-count');
    expect(count.querySelector('[aria-hidden]')).toHaveTextContent(/^2$/);
    expect(count).toHaveTextContent('عنصران');
  });

  it('reads the count with the words of the app', () => {
    render(
      <PageHeader title="Orders" count={3} labels={{ itemCount: (count) => `${count} orders` }} />
    );
    expect(screen.getByTestId('page-count')).toHaveTextContent('3 orders');
  });
});
