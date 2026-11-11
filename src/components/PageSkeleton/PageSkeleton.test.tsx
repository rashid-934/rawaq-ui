import { render, renderRtl, screen } from '../../test-utils';
import { PageSkeleton, skeletonShapes } from './PageSkeleton';

describe('PageSkeleton', () => {
  it.each(skeletonShapes)('says "Loading" once for the %s shape', (shape) => {
    render(<PageSkeleton shape={shape} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/^Loading$/);
    expect(status).toHaveAttribute('data-shape', shape);
    // The page fade waits for this marker to leave (Frame.module.css).
    expect(status).toHaveAttribute('data-page-skeleton');
  });

  it.each(skeletonShapes)('hides the %s shapes from screen readers', (shape) => {
    render(<PageSkeleton shape={shape} />);
    const shapes = screen.getByRole('status').querySelector('[aria-hidden="true"]');
    expect(shapes).not.toBeNull();
    expect(shapes!.querySelectorAll('span').length).toBeGreaterThan(2);
  });

  it('says it in Arabic', () => {
    renderRtl(<PageSkeleton shape="table" locale="ar" />);
    expect(screen.getByRole('status')).toHaveTextContent('جارٍ التحميل');
  });

  it('says it in the words of the app', () => {
    render(<PageSkeleton shape="card" locale="ur" labels={{ loading: 'لوڈ ہو رہا ہے' }} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^لوڈ ہو رہا ہے$/);
  });
});
