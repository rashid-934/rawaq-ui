// The shell (rail, frame, page layouts) and the motion pieces of Rawaq UI.

export { EmptyState, emptyStateVariants } from './EmptyState/EmptyState';
export type { EmptyStateLabels, EmptyStateProps, EmptyStateVariant } from './EmptyState/EmptyState';
export { isReferenceCode, makeReference } from './EmptyState/reference';
export { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
export type {
  ErrorBoundaryDetails,
  ErrorBoundaryFallbackProps,
  ErrorBoundaryProps,
} from './ErrorBoundary/ErrorBoundary';
export { Frame } from './Frame/Frame';
export type { FrameProps, PageKind } from './Frame/Frame';
export { INTRO_SAFETY_MS, IntroLayer, IntroReveal } from './IntroReveal/IntroReveal';
export type { IntroLayerProps, IntroRevealProps } from './IntroReveal/IntroReveal';
export {
  BentoCard,
  Emphasis,
  HeroBanner,
  OverviewPage,
  StatCard,
  StatGrid,
} from './Overview/Overview';
export type {
  BentoCardProps,
  HeroBannerProps,
  OverviewPageProps,
  StatCardProps,
  StatGridProps,
} from './Overview/Overview';
export { PageHeader } from './PageHeader/PageHeader';
export type { PageHeaderProps } from './PageHeader/PageHeader';
export { PageSkeleton, skeletonShapes } from './PageSkeleton/PageSkeleton';
export type { PageSkeletonProps, SkeletonShape } from './PageSkeleton/PageSkeleton';
export { Rail } from './Rail/Rail';
export type { RailProps } from './Rail/Rail';
export { isRailItemActive } from './Rail/rail-items';
export type { IconComponent, RailGroup, RailIcon, RailItem, RailUser } from './Rail/rail-items';
export { RollingNumber } from './RollingNumber/RollingNumber';
export type { RollingNumberProps } from './RollingNumber/RollingNumber';
export { FormGrid, FormGridItem, TableWrap, WorkCard, WorkPage } from './WorkPage/WorkPage';
export type {
  FormGridItemProps,
  FormGridProps,
  WorkCardProps,
  WorkPageProps,
} from './WorkPage/WorkPage';
