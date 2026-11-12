import type { ReactNode } from 'react';
import { readLook } from '../look';
import { GalleryShell } from '../shell';

/**
 * The rail and the frame around the gallery's pages. It sits under the root layout, so a page that
 * is not found is drawn inside the shell by the server, in the chosen look.
 */
export default async function GalleryPagesLayout({ children }: { children: ReactNode }) {
  const look = await readLook();
  return <GalleryShell look={look}>{children}</GalleryShell>;
}
