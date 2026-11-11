import { render, renderRtl, screen, userEvent, within } from '../../test-utils';
import { Frame, type FrameProps } from './Frame';

function frameWith(props: Partial<FrameProps> = {}) {
  return (
    <Frame
      pageKind="work"
      pathname="/c/acme/requests"
      rail={<nav aria-label="Rail" />}
      header={<span>Header things</span>}
      footer={<footer>Footer things</footer>}
      after={<button type="button">Help</button>}
      {...props}
    >
      <p>Page content</p>
    </Frame>
  );
}

describe('Frame', () => {
  it('puts every part in its place', () => {
    render(frameWith());
    const frame = screen.getByTestId('app-frame');
    expect(within(screen.getByTestId('app-header')).getByText('Header things')).toBeVisible();
    expect(within(screen.getByRole('main')).getByText('Page content')).toBeVisible();
    expect(screen.getByTestId('page-content')).toHaveTextContent('Page content');
    // The rail and the floating things are in the frame but outside the sheet of the page.
    const sheet = screen.getByRole('main').parentElement!;
    expect(sheet).toContainElement(screen.getByRole('contentinfo'));
    expect(sheet).not.toContainElement(screen.getByRole('navigation'));
    expect(sheet).not.toContainElement(screen.getByRole('button', { name: 'Help' }));
    expect(frame).toContainElement(screen.getByRole('navigation'));
    expect(frame).toContainElement(screen.getByRole('button', { name: 'Help' }));
  });

  it('draws the edge of the frame for the eye only', () => {
    render(frameWith());
    const edge = screen.getByTestId('frame-edge');
    expect(edge).toHaveAttribute('aria-hidden', 'true');
    expect(edge.querySelectorAll('[data-corner]')).toHaveLength(4);
    expect(edge).toContainElement(screen.getByTestId('frame-ring'));
  });

  it('tells the page and the whole document which kind of page it is', () => {
    const view = render(frameWith({ pageKind: 'overview' }));
    expect(screen.getByTestId('app-frame')).toHaveAttribute('data-page-kind', 'overview');
    // Dialogs and menus render outside the frame: they read the kind from <html>.
    expect(document.documentElement).toHaveAttribute('data-page-kind', 'overview');

    view.rerender(frameWith({ pageKind: 'work' }));
    expect(document.documentElement).toHaveAttribute('data-page-kind', 'work');

    view.unmount();
    expect(document.documentElement).not.toHaveAttribute('data-page-kind');
  });

  it('starts further in when the rail shows its labels', () => {
    const view = render(frameWith());
    expect(screen.getByTestId('app-frame')).not.toHaveAttribute('data-labels');
    view.rerender(frameWith({ showLabels: true }));
    expect(screen.getByTestId('app-frame')).toHaveAttribute('data-labels');
  });

  it('starts with a skip link to the main content, in the language of the page', () => {
    const view = render(frameWith());
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    view.unmount();

    renderRtl(frameWith({ locale: 'ar', mainId: 'content' }));
    expect(screen.getByRole('link', { name: 'تخطَّ إلى المحتوى الرئيسي' })).toHaveAttribute(
      'href',
      '#content'
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
  });

  it('uses the words of the app for another language', () => {
    render(frameWith({ locale: 'ur', labels: { skipToContent: 'مرکزی مواد پر جائیں' } }));
    expect(screen.getByRole('link', { name: 'مرکزی مواد پر جائیں' })).toBeInTheDocument();
  });

  it('mounts the page again for a new address, so the page fade plays once', () => {
    const view = render(frameWith());
    const first = screen.getByTestId('page-content');

    // The same address (a saved message appears, data refreshes): the same element, no fade.
    view.rerender(frameWith({ header: <span>Other header</span> }));
    expect(screen.getByTestId('page-content')).toBe(first);

    view.rerender(frameWith({ pathname: '/c/acme/suppliers' }));
    expect(screen.getByTestId('page-content')).not.toBe(first);
  });

  it('moves a lost focus to the top after a page change, and leaves a kept focus alone', async () => {
    const view = render(frameWith());
    expect(document.body).toHaveFocus();
    view.rerender(frameWith({ pathname: '/c/acme/suppliers' }));
    // The focus waits just before the skip link: the next Tab lands on it.
    expect(document.body).not.toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();

    const help = screen.getByRole('button', { name: 'Help' });
    help.focus();
    view.rerender(frameWith({ pathname: '/c/acme/reports' }));
    expect(help).toHaveFocus();
  });

  it('keeps the page out of reach behind an open drawer, and closes it from the backdrop', async () => {
    const onCloseDrawer = vi.fn();
    const view = render(frameWith({ onCloseDrawer }));
    const sheet = screen.getByRole('main').parentElement!;
    const backdrop = screen.getByTestId('frame-backdrop');
    expect(sheet).not.toHaveAttribute('inert');
    expect(backdrop).not.toHaveAttribute('data-open');

    view.rerender(frameWith({ onCloseDrawer, drawerOpen: true }));
    expect(sheet).toHaveAttribute('inert');
    expect(backdrop).toHaveAttribute('data-open');
    await userEvent.click(backdrop);
    expect(onCloseDrawer).toHaveBeenCalledTimes(1);
  });
});
