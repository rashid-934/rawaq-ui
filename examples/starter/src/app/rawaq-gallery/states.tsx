// The Loading, Empty and Error pages of the gallery share one file: each is a small server part.
import { IconPlus } from '@tabler/icons-react';
import { EmptyState, labelsFor, makeReference, PageHeader, PageSkeleton, WorkPage } from 'rawaq-ui';
import { Button } from '@mantine/core';
import { readLook } from './look';
import { galleryWords } from './words';

/** The Work page while it loads: the skeleton, shown after a short wait. */
export async function LoadingState() {
  const { locale } = await readLook();
  return <PageSkeleton shape="table" locale={locale} />;
}

/** A Work page with nothing in it yet. */
export async function EmptyPage() {
  const { locale } = await readLook();
  const { work, empty } = galleryWords[locale];
  return (
    <WorkPage header={<PageHeader title={work.title} count={0} locale={locale} />}>
      <EmptyState
        title={empty.title}
        description={empty.help}
        action={<Button leftSection={<IconPlus size={16} aria-hidden />}>{work.add}</Button>}
        locale={locale}
      />
    </WorkPage>
  );
}

/** A page that broke: the error state with a short reference code, never a message. */
export async function ErrorPage() {
  const { locale } = await readLook();
  return (
    <EmptyState
      variant="error"
      fullPage
      reference={makeReference()}
      action={<Button>{labelsFor(locale).tryAgain}</Button>}
      locale={locale}
    />
  );
}
