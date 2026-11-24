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
  currencySign,
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
export { BOTTOM_BAR_MAX_ITEMS, BottomBar, bottomBarProblems } from './BottomBar/BottomBar';
export type { BottomBarProps } from './BottomBar/BottomBar';
export {
  BottomSheet,
  SHEET_CLOSE_DISTANCE,
  SHEET_CLOSE_SPEED,
  SHEET_FLICK_DISTANCE,
  useBottomSheet,
} from './BottomSheet/BottomSheet';
export type { BottomSheetProps } from './BottomSheet/BottomSheet';
export { MoreSheet } from './MoreSheet/MoreSheet';
export type { MoreSheetLanguage, MoreSheetProps } from './MoreSheet/MoreSheet';
export { ActivityList } from './Overview/ActivityList';
export type { ActivityItem, ActivityListProps } from './Overview/ActivityList';
export { NEEDS_YOU_MAX, NeedsYouList } from './Overview/NeedsYouList';
export type { NeedsYouItem, NeedsYouListProps } from './Overview/NeedsYouList';
export { PhoneBar } from './PhoneBar/PhoneBar';
export type { PhoneBarProps } from './PhoneBar/PhoneBar';
export { FormGrid, FormGridItem, TableWrap, WorkCard, WorkPage } from './WorkPage/WorkPage';
export type {
  FormGridItemProps,
  FormGridProps,
  WorkCardProps,
  WorkPageProps,
} from './WorkPage/WorkPage';
