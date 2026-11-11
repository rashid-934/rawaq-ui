import { act, fireEvent, render, screen } from '../../test-utils';
import { INTRO_SAFETY_MS, IntroReveal } from './IntroReveal';

const layer = () => screen.queryByTestId('intro-reveal');

describe('IntroReveal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the logo tile and the app name, hidden from screen readers', () => {
    render(<IntroReveal appName="Procurement Hub" />);
    expect(layer()).toHaveAttribute('aria-hidden', 'true');
    expect(layer()).toHaveTextContent('PProcurement Hub');
  });

  it('shows the logo of the app when it has one', () => {
    render(<IntroReveal appName="Hub" logo={<svg data-testid="logo" />} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(layer()).toHaveTextContent(/^Hub$/);
  });

  it('tells the app once that it is on screen, so the app can clear its sign-in marker', () => {
    const onShown = vi.fn();
    const view = render(<IntroReveal appName="Hub" onShown={onShown} />);
    expect(onShown).toHaveBeenCalledTimes(1);
    // A new function from the app (a new render) does not play it again.
    view.rerender(<IntroReveal appName="Hub" onShown={() => onShown()} />);
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it('takes itself out of the page when the sweep ends', () => {
    render(<IntroReveal appName="Hub" />);
    // The logo's own entrance ends first and must not end the opening.
    fireEvent.animationEnd(screen.getByText('Hub'));
    expect(layer()).toBeInTheDocument();
    fireEvent.animationEnd(layer()!);
    expect(layer()).toBeNull();
  });

  it('is removed by the safety timer even if the animation never reports its end', () => {
    vi.useFakeTimers();
    render(<IntroReveal appName="Hub" />);
    act(() => {
      vi.advanceTimersByTime(INTRO_SAFETY_MS - 1);
    });
    expect(layer()).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(layer()).toBeNull();
  });
});
