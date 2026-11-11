import { render, screen } from '../../test-utils';
import { FormGrid, FormGridItem, TableWrap, WorkCard, WorkPage } from './WorkPage';

describe('WorkPage', () => {
  it('stacks the header, the filters and the content, at the full width by default', () => {
    render(
      <WorkPage header={<h1>Suppliers</h1>} filters={<input aria-label="Search" />}>
        <p>Table</p>
      </WorkPage>
    );
    const page = screen.getByText('Table').parentElement!;
    expect(page).toHaveAttribute('data-width', 'full');
    expect([...page.children].map((child) => child.textContent)).toEqual([
      'Suppliers',
      '',
      'Table',
    ]);
    expect(page.children[1]).toContainElement(screen.getByRole('textbox', { name: 'Search' }));
  });

  it('is one centred column for a page that is read like a document', () => {
    render(
      <WorkPage width="form">
        <p>Form</p>
      </WorkPage>
    );
    const page = screen.getByText('Form').parentElement!;
    expect(page).toHaveAttribute('data-width', 'form');
    expect(page.children).toHaveLength(1);
  });
});

describe('WorkCard', () => {
  it('keeps the class of the caller', () => {
    render(<WorkCard className="mine">Card</WorkCard>);
    expect(screen.getByText('Card')).toHaveClass('card', 'mine');
  });
});

describe('FormGrid', () => {
  it('lays fields out in a grid, with wide items across the whole row', () => {
    render(
      <FormGrid>
        <FormGridItem>Name</FormGridItem>
        <FormGridItem wide>Notes</FormGridItem>
      </FormGrid>
    );
    const grid = screen.getByText('Name').parentElement!;
    expect(grid).not.toHaveAttribute('data-compact');
    expect(screen.getByText('Name')).not.toHaveAttribute('data-wide');
    expect(screen.getByText('Notes')).toHaveAttribute('data-wide');
  });

  it('stays one column in a narrow panel', () => {
    render(
      <FormGrid compact>
        <FormGridItem>Name</FormGridItem>
      </FormGrid>
    );
    expect(screen.getByText('Name').parentElement).toHaveAttribute('data-compact');
  });
});

describe('TableWrap', () => {
  it('gives the table the wrapper the stylesheet scrolls on a narrow window', () => {
    render(
      <TableWrap>
        <table />
      </TableWrap>
    );
    expect(screen.getByRole('table').parentElement).toHaveClass('table-wrap');
  });
});
