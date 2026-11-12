'use client';

import Link from 'next/link';
import { EmptyState } from 'rawaq-ui';
import { GALLERY_BASE } from '../look-shared';
import { useLook } from '../providers';
import { galleryWords } from '../words';

/** The 404 page of the gallery: the not-found state, with a way back. */
export default function GalleryNotFound() {
  const { locale } = useLook();
  return (
    <EmptyState
      variant="not-found"
      fullPage
      action={
        <Link href={GALLERY_BASE} className="starter-hero-action">
          {galleryWords[locale].notFoundBack}
        </Link>
      }
      locale={locale}
    />
  );
}
