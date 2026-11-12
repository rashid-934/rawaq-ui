'use client';

import { densityKeys, presetKeys, sidebarChoices } from 'rawaq-ui/tokens';
import { NativeSelect } from '@mantine/core';
import {
  GALLERY_BASE,
  GALLERY_LOCALES,
  type GalleryLook,
  LOOK_COOKIE,
  lookValue,
} from './look-shared';
import type { GalleryWords } from './words';

export interface LookBarProps {
  look: GalleryLook;
  words: GalleryWords;
}

/**
 * The switches of the gallery: preset, sidebar colour, density and language. A choice is saved in
 * the cookie and the page loads again, so the server draws it in the new look from the first
 * frame (the way an app reads a company's saved look).
 */
export function LookBar({ look, words }: LookBarProps) {
  const change = (key: keyof GalleryLook, value: string) => {
    const next = { ...look, [key]: value } as GalleryLook;
    document.cookie = `${LOOK_COOKIE}=${lookValue(next)}; path=${GALLERY_BASE}; max-age=31536000; samesite=lax`;
    window.location.reload();
  };
  const lists = [
    {
      key: 'preset',
      label: words.look.preset,
      data: presetKeys.map((value) => ({ value, label: words.presets[value] })),
    },
    {
      key: 'sidebar',
      label: words.look.sidebar,
      data: sidebarChoices.map((value) => ({ value, label: words.sidebars[value] })),
    },
    {
      key: 'density',
      label: words.look.density,
      data: densityKeys.map((value) => ({ value, label: words.densities[value] })),
    },
    {
      key: 'locale',
      label: words.look.language,
      data: GALLERY_LOCALES.map((value) => ({ value, label: words.languages[value] })),
    },
  ] as const;

  return (
    <div className="gallery-look" role="group" aria-label={words.look.title}>
      {lists.map(({ key, label, data }) => (
        <NativeSelect
          key={key}
          size="xs"
          label={label}
          value={look[key]}
          data={[...data]}
          onChange={(event) => change(key, event.currentTarget.value)}
          data-testid={`look-${key}`}
        />
      ))}
    </div>
  );
}
