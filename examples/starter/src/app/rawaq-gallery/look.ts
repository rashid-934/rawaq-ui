import { cookies } from 'next/headers';
import { type GalleryLook, LOOK_COOKIE, parseLook } from './look-shared';

/** The look saved in the gallery's cookie, read on the server for every request. */
export async function readLook(): Promise<GalleryLook> {
  return parseLook((await cookies()).get(LOOK_COOKIE)?.value);
}
